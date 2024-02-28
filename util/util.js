export const makeElement = (element, attributes={}, children=[]) => {
    const node = document.createElement(element);
    for (let attr in attributes) {
        node.setAttribute(attr, attributes[attr]);
    }
    return children.reduce((acc, node) => {
        acc.appendChild(node);
        return acc;
    }, node);
};

export const text = text => {
    return document.createTextNode(text);
};

export const div = (attributes, children) => {
    return makeElement("div", attributes, children);
};

export const button = (attributes, children) => {
    return makeElement("button", attributes, children);
};

export const span = (attributes, children) => {
    return makeElement('span', attributes, children);
};

export const applyStyles = (node, styles) => {
    for (let attr in styles) {
        node.style[attr] = styles[attr];
    }
};

export const applyTopLeft = (node, x, y) => {
    applyStyles(node, { top: y + 'px', left: x + 'px' });
};