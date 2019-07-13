const { $ } = require('./utils');

const classes = {
    default: ['output-item'],
    error: ['output-item', 'output-item-error']
};

const output = $('.commandOutput');

const handler = elementClasses => {
    return message => {
        const messageSpan = document.createElement('div');
        messageSpan.classList.add(...elementClasses);
        messageSpan.innerText = message + '\n';
        output.appendChild(messageSpan);
        output.scrollTop = output.scrollHeight;
    };
};

module.exports = {
    info: handler(classes.default),
    error: handler(classes.error)
};