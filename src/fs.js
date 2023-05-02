function FSNode(name, type) {
  Object.defineProperty(this, '_id', { value: FSNode.nextID++ })
  this.name = name
  this.type = type
}

FSNode.nextID = 0

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

FSNode.deserialize = function (serialized) {
  if (!serialized) return new FolderNode('')

  return deserializeDir(serialized)
}

FSNode.prototype.getPath = function () {
  let out = ''
  let next = this

  while (next) {
    out = next.name + '/' + out
    next = next.parent
  }

  return out
}

function FolderNode(name) {
  // super()
  FSNode.call(this, name, 'd')

  this.children = []
}

FolderNode.prototype = new FSNode()

FolderNode.prototype.get = function (name) {
  return this.children.find((node) => node.name === name)
}

FolderNode.prototype.exists = function (name) {
  return !!this.get(name)
}

FolderNode.prototype.add = function (child) {
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

FolderNode.prototype.remove = function (child) {
  let index = this.children.findIndex((node) => node._id === child._id)
  if (index > -1) this.children.splice(index, 1)
}

function FileNode(name, content) {
  // super()
  FSNode.call(this, name, 'f')

  this.content = content || ''
}

FileNode.prototype = new FSNode()

FileNode.prototype.erase = function () {
  this.content = ''
}

FileNode.prototype.write = function (content) {
  this.content = content
}

FileNode.prototype.append = function (content) {
  this.write(this.content + content)
}

const Path = {
  dirname: (file) => file.substr(0, file.lastIndexOf('/')) || '/',
  basename: (file) => file.substr(file.lastIndexOf('/') + 1),
  join: (from, to) => from + (from.endsWith('/') ? '' : '/') + to,
}

function FS(root, pwd) {
  this.root = root || new FolderNode('')
  this.pwd = pwd || '/'

  if (!this.exists(this.pwd) || this.get(this.pwd).type !== 'd') {
    this.pwd = '/'
  }
}

FS.deserialize = function (serialized) {
  if (!serialized) return new FS()

  return new FS(FSNode.deserialize(serialized.root), serialized.pwd)
}

FS.prototype._resolve = function (path) {
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

FS.prototype.get = function (path) {
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

FS.prototype.exists = function (path) {
  return !!this.get(path)
}

FS.prototype.touch = function (path) {
  if (this.exists(path)) {
    return
  }

  let parent = this.get(Path.dirname(this._resolve(path)))

  if (!parent || !parent.type === 'd') {
    return
  }

  parent.add(new FileNode(Path.basename(path)))
}

FS.prototype.mkdir = function (path) {
  if (this.exists(path)) {
    return
  }

  let parent = this.get(Path.dirname(this._resolve(path)))

  if (!parent || !parent.type === 'd') {
    return
  }

  parent.add(new FolderNode(Path.basename(path)))
}

FS.prototype.readDir = function (path) {
  let dir = this.get(path)

  if (!dir || dir.type !== 'd') {
    return
  }

  return dir.children
}

FS.prototype.readFile = function (path) {
  let file = this.get(path)

  if (!file || file.type !== 'f') {
    return
  }

  return file.content
}

FS.prototype.writeFile = function (path, content) {
  let file = this.get(path)

  if (!file || file.type !== 'f') {
    return
  }

  file.write(content)
}

FS.prototype.appendFile = function (path, content) {
  let file = this.get(path)

  if (!file || file.type !== 'f') {
    return
  }

  file.append(content)
}

FS.prototype.delete = function (path) {
  let node = this.get(path)

  if (!node || !node.parent) {
    return
  }

  node.parent.remove(node)
}

export { FS }
