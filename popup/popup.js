const enable = makeStateChanger(true, 'off', 'on', 'Enabled');
const disable = makeStateChanger(false, 'on', 'off', 'Disabled');

document.addEventListener('DOMContentLoaded', async () => {
    const settings = await chrome.storage.local.get(['enabled', 'definitionsOnly']);

    for (let key in settings) {
        const block = document.querySelector('div#' + key);
        block.addEventListener('click', () => {
            clickHandler(key);
            return true;
        });
        if (settings[key]) {
            enable(key);
        } else {
            disable(key);
        }
    }
});

async function clickHandler(key) {
    const result = await chrome.storage.local.get(key);
    const enabled= result[key];
    if (enabled) {
        disable(key);
    } else {
        enable(key);
    }
}

function makeStateChanger(value, oldClass, newClass, statusText) {
    return (key) => {
        const setting = {};
        const block = document.querySelector('div#' + key);
        const status = document.querySelector('div#' + key + ' .status');
        setting[key] = value;
        chrome.storage.local.set(setting);
        block.classList.remove(oldClass);
        block.classList.add(newClass);
        status.textContent = statusText;
    }
}