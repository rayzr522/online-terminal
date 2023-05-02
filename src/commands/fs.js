import { checkArgs, registerCommand } from '../command-handler'
import { sys } from '../system'

// Filesystem
registerCommand(
  'cd',
  'changes the current working directory to a different folder',
  (args) => {
    checkArgs(args, 1, 'cd <folder>')

    let path = sys.fs._resolve(args[0])
    let node = sys.fs.get(path)

    if (node && node.type === 'd') {
      sys.fs.pwd = path
    } else {
      throw 'The folder "' + path + '" does not exist!'
    }

    return path
  }
)
registerCommand(
  'pwd',
  'shows the current working directory',
  () => sys.fs.pwd || '/'
)
registerCommand('ls', 'lists all files in the current directory', (args) =>
  sys.fs
    .readDir(args[0] || '')
    .map((node) => node.name + (node.type === 'd' ? '/' : ''))
    .join('\n')
)
registerCommand(
  'touch',
  'creates or updates the timestamp for the given file',
  (args) => checkArgs(args, 1, 'touch <file>') || sys.fs.touch(args[0])
)
registerCommand(
  'mkdir',
  'makes a new directory',
  (args) => checkArgs(args, 1, 'mkdir <folder>') || sys.fs.mkdir(args[0])
)
registerCommand(
  'cat',
  'outputs the contents of a file',
  (args) => checkArgs(args, 1, 'cat <file>') || sys.fs.readFile(args[0])
)
registerCommand(
  'write',
  'writes the given contents to a file',
  (args) =>
    checkArgs(args, 1, 'write <file> [contents]') ||
    sys.fs.writeFile(args[0], args.slice(1).join(' ') + '\n')
)
registerCommand(
  'append',
  'appends the given contents to a file',
  (args) =>
    checkArgs(args, 1, 'append <file> [contents]') ||
    sys.fs.appendFile(args[0], args.slice(1).join(' ') + '\n')
)
registerCommand(
  'rm',
  'removes a file',
  (args) => checkArgs(args, 1, 'rm <path>') || sys.fs.delete(args[0])
)
