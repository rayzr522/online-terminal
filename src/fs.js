function deserializeDir(dir) {
  let folder = new FolderNode(dir.name)

  let children = dir.children.map((child) => {
    if (child.type === 'f') {
      return deserializeFile(child)
    } else if (child.type === 'd') {
      return deserializeDir(child)
    }
  })

  children.forEach((child) => folder.add(child))

  return folder
}

function deserializeFile(file) {
  return new FileNode(file.name, file.content)
}

class FSNode {
  static nextID = 0

  constructor(name, type) {
    this._id = FSNode.nextID++
    this.name = name
    this.type = type
  }

  static deserialize(serialized) {
    if (!serialized) return new FolderNode('')

    return deserializeDir(serialized)
  }

  getPath() {
    let out = ''
    let next = this

    while (next) {
      out = next.name + '/' + out
      next = next.parent
    }

    return out
  }
}

class FolderNode extends FSNode {
  constructor(name) {
    super(name, 'd')
    this.children = []
  }

  get(name) {
    return this.children.find((node) => node.name === name)
  }

  exists(name) {
    return !!this.get(name)
  }

  add(child) {
    if (this.exists(child.name)) {
      return false
    }

    if (child.parent) {
      return false
    }

    Object.defineProperty(child, 'parent', { value: this })

    this.children.push(child)
    return true
  }

  remove(child) {
    let index = this.children.findIndex((node) => node._id === child._id)
    if (index > -1) this.children.splice(index, 1)
  }
}

class FileNode extends FSNode {
  constructor(name, content) {
    super(name, 'f')
    this.content = content || ''
  }

  erase() {
    this.content = ''
  }

  write(content) {
    this.content = content
  }

  append(content) {
    this.write(this.content + content)
  }
}

const Path = {
  dirname: (file) => file.substr(0, file.lastIndexOf('/')) || '/',
  basename: (file) => file.substr(file.lastIndexOf('/') + 1),
  join: (from, to) => from + (from.endsWith('/') ? '' : '/') + to,
}

export class FS {
  constructor(root = new FolderNode(''), pwd = '/') {
    this.root = root
    this.pwd = pwd

    if (!this.exists(this.pwd) || this.get(this.pwd).type !== 'd') {
      this.pwd = '/'
    }
  }

  static deserialize(serialized) {
    if (!serialized) return new FS()

    return new FS(FSNode.deserialize(serialized.root), serialized.pwd)
  }

  _resolve(path) {
    let newPath = path
    let pwd = this.pwd

    if (newPath === '.') return pwd
    if (newPath === '..') return Path.dirname(pwd)

    if (newPath.startsWith('./')) newPath = newPath.substr(2)

    while (newPath.startsWith('../')) {
      newPath = newPath.substr(3)
      pwd = Path.dirname(pwd)
    }

    if (!newPath.startsWith('/')) {
      newPath = Path.join(pwd, newPath)
    }

    return newPath
  }

  get(path) {
    let realpath = this._resolve(path)

    let split = realpath.substr(1).split('/')
    let next = this.root

    while (split.length) {
      let nextName = split.shift()
      if (!nextName) {
        continue
      }

      next = next.get(nextName)
      if (!next) {
        return
      }

      if (split.length > 0 && next.type !== 'd') {
        return
      }
    }

    return next
  }

  exists(path) {
    return !!this.get(path)
  }

  touch(path) {
    if (this.exists(path)) {
      return
    }

    let parent = this.get(Path.dirname(this._resolve(path)))

    if (!parent || !parent.type === 'd') {
      return
    }

    parent.add(new FileNode(Path.basename(path)))
  }

  mkdir(path) {
    if (this.exists(path)) {
      return
    }

    let parent = this.get(Path.dirname(this._resolve(path)))

    if (!parent || !parent.type === 'd') {
      return
    }

    parent.add(new FolderNode(Path.basename(path)))
  }

  readDir(path) {
    let dir = this.get(path)

    if (!dir || dir.type !== 'd') {
      return
    }

    return dir.children
  }

  readFile(path) {
    let file = this.get(path)

    if (!file || file.type !== 'f') {
      return
    }

    return file.content
  }

  writeFile(path, content) {
    let file = this.get(path)

    if (!file || file.type !== 'f') {
      return
    }

    file.write(content)
  }

  appendFile(path, content) {
    let file = this.get(path)

    if (!file || file.type !== 'f') {
      return
    }

    file.append(content)
  }

  delete(path) {
    let node = this.get(path)

    if (!node || !node.parent) {
      return
    }

    node.parent.remove(node)
  }
}
