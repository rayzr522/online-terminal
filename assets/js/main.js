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
        console.log(event.keyCode);
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

function registerCommand(name, handler) {
    let names = [].concat(name).map(i => i.toLowerCase());
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
registerCommand(['add', '+'], args => mapToNumbers(args).reduce((mem, next) => mem + next, 0));
registerCommand(['subtract', '-'], args => {
    let numbers = mapToNumbers(args);
    let first = numbers.shift();
    return numbers.reduce((mem, next) => mem - next, first);
});
registerCommand(['multiply', '*'], args => mapToNumbers(args).reduce((mem, next) => mem * next, 1));


// Filesystem
registerCommand('cd', args => {
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

registerCommand('pwd', () => sys.fs.pwd || '/');
registerCommand('ls', args => sys.fs.readDir(args[0] || '').map(node => node.name + (node.type === 'd' ? '/' : '')).join('\n'));
registerCommand('touch', args => checkArgs(args, 1, 'touch <file>') || sys.fs.touch(args[0]));
registerCommand('mkdir', args => checkArgs(args, 1, 'mkdir <folder>') || sys.fs.mkdir(args[0]));
registerCommand('cat', args => checkArgs(args, 1, 'cat <file>') || sys.fs.readFile(args[0]));
registerCommand('write', args => checkArgs(args, 1, 'write <file> [contents]') || sys.fs.writeFile(args[0], args.slice(1).join(' ') + '\n'));
registerCommand('append', args => checkArgs(args, 1, 'append <file> [contents]') || sys.fs.appendFile(args[0], args.slice(1).join(' ') + '\n'));
registerCommand('rm', args => checkArgs(args, 1, 'rm <path>') || sys.fs.delete(args[0]));

registerCommand('help', () => Object.keys(commands).join('\n'))