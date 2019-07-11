(function () {var loaded = [];function normalize(moduleName) {return moduleName.replace(/^\.\//, '').replace(/\.js$/, '');};function loadModule(moduleName) {var mod = normalize(moduleName);if (loaded.indexOf(mod) > -1) return;var module = { exports: {} };var raw = _rawModules[mod];raw(module, module.exports, require);modules[mod] = module;loaded.push(mod);};_rawModules = {'fs': function(module, exports, require) {function FSNode(name, type) {Object.defineProperty(this, '_id', { value: FSNode.nextID++ });this.name = name;this.type = type;};function deserializeDir(dir) {let folder = new FolderNode(dir.name);let children = dir.children.map(child => {if (child.type === 'f') {return deserializeFile(child);} else if (child.type === 'd') {return deserializeDir(child);};});children.forEach(child => folder.add(child));return folder;};function deserializeFile(file) {return new FileNode(file.name, file.content);};FSNode.deserialize = function (serialized) {if (!serialized) return new FolderNode('');return deserializeDir(serialized);};FSNode.prototype.getPath = function () {let out = '';let next = this;while (next) {out = next.name + '/' + out;next = next.parent;};return out;};function FolderNode(name) {FSNode.call(this, name, 'd');this.children = [];};FolderNode.prototype = new FSNode();FolderNode.prototype.get = function (name) {return this.children.find(node => node.name === name);};FolderNode.prototype.exists = function (name) {return !!this.get(name);};FolderNode.prototype.add = function (child) {if (this.exists(child.name)) {return false;};if (child.parent) {return false;};Object.defineProperty(child, 'parent', { value: this });this.children.push(child);return true;};FolderNode.prototype.remove = function (child) {let index = this.children.findIndex(node => node._id = child._id);if (index > -1) this.children.splice(index, 1);};function FileNode(name, content) {FSNode.call(this, name, 'f');this.content = content || '';};FileNode.prototype = new FSNode();FileNode.prototype.erase = function () {this.content = '';};FileNode.prototype.write = function (content) {this.content = content;};FileNode.prototype.append = function (content) {this.write(this.content + content);};const Path = {dirname: file => file.substr(0, file.lastIndexOf('/')) || '/',basename: file => file.substr(file.lastIndexOf('/') + 1),join: (from, to) => from + (from.endsWith('/') ? '' : '/') + to};function FS(root, pwd) {this.root = root || new FolderNode('');this.pwd = pwd || '/';if (!this.exists(this.pwd) || this.get(this.pwd).type !== 'd') {this.pwd = '/';};};FS.deserialize = function (serialized) {if (!serialized) return new FS();return new FS(FSNode.deserialize(serialized.root), serialized.pwd);};FS.prototype._resolve = function (path) {let newPath = path;let pwd = this.pwd;if (newPath === '.') return pwd;if (newPath === '..') return Path.dirname(pwd);if (newPath.startsWith('./')) newPath = newPath.substr(2);while (newPath.startsWith('../')) {newPath = newPath.substr(3);pwd = Path.dirname(pwd);};if (!newPath.startsWith('/')) {newPath = Path.join(pwd, newPath);};return newPath;};FS.prototype.get = function (path) {let realpath = this._resolve(path);let split = realpath.substr(1).split('/');let next = this.root;while (split.length) {let nextName = split.shift();if (!nextName) {continue;};next = next.get(nextName);if (!next) {return;};if (split.length > 0 && next.type !== 'd') {return;};};return next;};FS.prototype.exists = function (path) {return !!this.get(path);};FS.prototype.touch = function (path) {if (this.exists(path)) {return;};let parent = this.get(Path.dirname(this._resolve(path)));if (!parent || !parent.type === 'd') {return;};parent.add(new FileNode(Path.basename(path)))};FS.prototype.mkdir = function (path) {if (this.exists(path)) {return;};let parent = this.get(Path.dirname(this._resolve(path)));if (!parent || !parent.type === 'd') {return;};parent.add(new FolderNode(Path.basename(path)));};FS.prototype.readDir = function (path) {let dir = this.get(path);if (!dir || dir.type !== 'd') {return;};return dir.children;};FS.prototype.readFile = function (path) {let file = this.get(path);if (!file || file.type !== 'f') {return;};return file.content;};FS.prototype.writeFile = function (path, content) {let file = this.get(path);if (!file || file.type !== 'f') {return;};file.write(content);};FS.prototype.appendFile = function (path, content) {let file = this.get(path);if (!file || file.type !== 'f') {return;};file.append(content);};FS.prototype.delete = function (path) {let node = this.get(path);if (!node || !node.parent) {return;};node.parent.remove(node);};module.exports = FS;},'main': function(module, exports, require) {const FS = require('./fs');const output = require('./output');let sys;let commandPreview;let input;let commands = {};window.addEventListener('load', function () {sys = JSON.parse(localStorage.getItem('sys') || '{}');sys.fs = FS.deserialize(sys.fs);commandPreview = document.getElementById('commandPreview');input = document.getElementById('inputText');input.focus();document.addEventListener('keydown', event => {console.log(event.keyCode);if (event.keyCode === 13) {handleCommand(input.value);input.value = '';}})});window.addEventListener('unload', function () {localStorage.setItem('sys', JSON.stringify(sys));});function handleCommand(input) {output.info(`$ ${input}`);let split = input.split(' ');let name = split[0].toLowerCase();let args = split.slice(1);let command = commands[name];let error;if (command) {try {let result = command(args);if (result !== undefined) {output.info(`${result}`);}} catch (err) {error = err;}} else {error = 'Unknown command: ' + name;}if (error) {output.error(error);}}function registerCommand(name, handler) {let names = [].concat(name).map(i => i.toLowerCase());names.forEach(i => commands[i] = handler);}function checkArgs(args, amount, usage) {if (args.length < amount) {throw 'Usage: ' + usage;}}function mapToNumbers(args) {return args.map(i => parseInt(i)).filter(i => !isNaN(i));}registerCommand(['add', '+'], args => mapToNumbers(args).reduce((mem, next) => mem + next, 0));registerCommand(['subtract', '-'], args => {let numbers = mapToNumbers(args);let first = numbers.shift();return numbers.reduce((mem, next) => mem - next, first);});registerCommand(['multiply', '*'], args => mapToNumbers(args).reduce((mem, next) => mem * next, 1));registerCommand('cd', args => {checkArgs(args, 1, 'cd <folder>');let path = sys.fs._resolve(args[0]);let node = sys.fs.get(path);if (node && node.type === 'd') {sys.fs.pwd = path;} else {throw 'The folder "' + path + '" does not exist!';}return path;});registerCommand('pwd', () => sys.fs.pwd || '/');registerCommand('ls', args => sys.fs.readDir(args[0] || '').map(node => node.name + (node.type === 'd' ? '/' : '')).join('\n'));registerCommand('touch', args => checkArgs(args, 1, 'touch <file>') || sys.fs.touch(args[0]));registerCommand('mkdir', args => checkArgs(args, 1, 'mkdir <folder>') || sys.fs.mkdir(args[0]));registerCommand('cat', args => checkArgs(args, 1, 'cat <file>') || sys.fs.readFile(args[0]));registerCommand('write', args => checkArgs(args, 1, 'write <file> [contents]') || sys.fs.writeFile(args[0], args.slice(1).join(' ') + '\n'));registerCommand('append', args => checkArgs(args, 1, 'append <file> [contents]') || sys.fs.appendFile(args[0], args.slice(1).join(' ') + '\n'));registerCommand('rm', args => checkArgs(args, 1, 'rm <path>') || sys.fs.delete(args[0]));registerCommand('help', () => Object.keys(commands).join('\n'))},'output': function(module, exports, require) {const { $ } = require('./utils');const classes = {default: ['output-item'],error: ['output-item', 'output-item-error']};const output = $('#commandOutput');const handler = elementClasses => {return message => {const messageSpan = document.createElement('span');messageSpan.classList.add(...elementClasses);messageSpan.innerText = message + '\n';output.appendChild(messageSpan);output.scrollTop = output.scrollHeight;};};module.exports = {info: handler(classes.default),error: handler(classes.error)};},'utils': function(module, exports, require) {/*** @param {string} query The query to search for.* @return {HTMLElement?} An HTML element that matches your query.*/const $ = query => document.querySelector(query);module.exports = {$};},};modules = {};function require(moduleName) {var mod = normalize(moduleName);if (loaded.indexOf(mod) < 0) {loadModule(mod);}return modules[mod].exports;};require.modules = modules;window.require = window.require || require;})();