import { $ } from './utils';

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

export const info = handler(classes.default);
export const error = handler(classes.error);
