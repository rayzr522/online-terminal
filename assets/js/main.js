const FS = require('./fs');
const output = require('./output');

let sys;
let commandPreview;
let input;
let commands = {};

window.addEventListener('load', function () {
    sys = JSON.parse(localStorage.getItem('sys') || '{}');
    sys.fs = FS.deserialize(sys.fs);

    commandPreview = document.getElementById('commandPreview');
    input = document.getElementById('inputText');
    input.focus();

    document.addEventListener('keydown', event => {
        if (event.keyCode === 13) {
            handleCommand(input.value);
            input.value = '';
        }
    })
});

window.addEventListener('unload', function () {
    localStorage.setItem('sys', JSON.stringify(sys));
});


function handleCommand(input) {
    output.info(`$ ${input}`);

    let split = input.split(' ');
    let name = split[0].toLowerCase();
    let args = split.slice(1);

    let command = commands[name];
    let error;

    if (command) {
        try {
            let result = command(args);
            if (result !== undefined) {
                output.info(`${result}`);
            }
        } catch (err) {
            error = err;
        }
    } else {
        error = 'Unknown command: ' + name;
    }

    if (error) {
        output.error(error);
    }
}

function registerCommand(name, description, handler) {
    let names = [].concat(name).map(i => i.toLowerCase());
    handler.description = description;
    names.forEach(i => commands[i] = handler);
}

function checkArgs(args, amount, usage) {
    if (args.length < amount) {
        throw 'Usage: ' + usage;
    }
}

function mapToNumbers(args) {
    return args.map(i => parseInt(i)).filter(i => !isNaN(i));
}

// Math
registerCommand(['add', '+'], 'adds two or more numbers', args => mapToNumbers(args).reduce((mem, next) => mem + next, 0));
registerCommand(['subtract', '-'], 'subtracts two or more numbers', args => {
    let numbers = mapToNumbers(args);
    let first = numbers.shift();
    return numbers.reduce((mem, next) => mem - next, first);
});
registerCommand(['multiply', '*'], 'multiplies two or more numbers', args => mapToNumbers(args).reduce((mem, next) => mem * next, 1));


// Filesystem
registerCommand('cd', 'changes the current working directory to a different folder', args => {
    checkArgs(args, 1, 'cd <folder>');

    let path = sys.fs._resolve(args[0]);
    let node = sys.fs.get(path);

    if (node && node.type === 'd') {
        sys.fs.pwd = path;
    } else {
        throw 'The folder "' + path + '" does not exist!';
    }

    return path;
});

registerCommand('pwd', 'shows the current working directory', () => sys.fs.pwd || '/');
registerCommand('ls', 'lists all files in the current directory', args => sys.fs.readDir(args[0] || '').map(node => node.name + (node.type === 'd' ? '/' : '')).join('\n'));
registerCommand('touch', 'creates or updates the timestamp for the given file', args => checkArgs(args, 1, 'touch <file>') || sys.fs.touch(args[0]));
registerCommand('mkdir', 'makes a new directory', args => checkArgs(args, 1, 'mkdir <folder>') || sys.fs.mkdir(args[0]));
registerCommand('cat', 'outputs the contents of a file', args => checkArgs(args, 1, 'cat <file>') || sys.fs.readFile(args[0]));
registerCommand('write', 'writes the given contents to a file', args => checkArgs(args, 1, 'write <file> [contents]') || sys.fs.writeFile(args[0], args.slice(1).join(' ') + '\n'));
registerCommand('append', 'appends the given contents to a file', args => checkArgs(args, 1, 'append <file> [contents]') || sys.fs.appendFile(args[0], args.slice(1).join(' ') + '\n'));
registerCommand('rm', 'removes a file', args => checkArgs(args, 1, 'rm <path>') || sys.fs.delete(args[0]));

registerCommand('help', 'shows a list of all commands', () => {
    let keys = Object.keys(commands).sort();
    let longest = keys.reduce((mem, next) => Math.max(mem, next.length), 0);
    return keys.map(name => `${name}${' '.repeat(longest - name.length)} : ${commands[name].description}`).join('\n')
});