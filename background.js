import { fetchDefinitions } from "./definitions.js";
import { fetchScanscion } from "./scanscion.js";
import { Response } from "./response.js";
import { Request } from "./request.js";
import { handleSettingsChange } from "./settings.js";
import { addMenuItems } from "./menu.js";

export const modules = {
    definitions: {
        handler: handleDefinitionsQuery,
        menuItemTitle: 'Get definitions',
    },
    scanscion: {
        handler: handleScanscionQuery,
        menuItemTitle: 'Get scanscion',
    }
};

chrome.storage.local.onChanged.addListener(handleSettingsChange);

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (['install', 'update'].includes(reason)) {
        chrome.storage.local.set({
            enabled: true,
            definitionsOnly: false
        });
        addMenuItems();
    }
});

// Send translation/scansion to content script via messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const queryType = message.queryType;
    let queryText = message.queryText;
    if (queryType === 'settings') {
        if (queryText === 'changed') {
            handleSettingsChange()
        }
    } else {
        // Sanitize string, strip out diacritics and non letter characters
        queryText = sanitizeString(queryText.trim());
        const handler = modules[queryType]?.handler;
        if (queryText === '') sendResponse(Response('ignore', 'Nothing selected'));
        if (handler === undefined) sendResponse(Response('error', 'Looks like something went wrong'));
        handler(queryText, sendResponse);
    }
    return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.tabs.sendMessage(tab.id, Request(info.menuItemId));
});

async function handleDefinitionsQuery(query, sendResponse) {
    const response = await fetchDefinitions(query);
    sendResponse(response);
}

async function handleScanscionQuery(query, sendResponse) {
    const response = await fetchScanscion(query);
    sendResponse(response);
}

function sanitizeString(str) {
    return str.replace(/ā/ig, 'a')
        .replace(/[ē\u00EB]/ig, 'e')
        .replace(/ī/ig, 'i')
        .replace(/ō/ig, 'o')
        .replace(/[ū\u01d6]/ig, 'u')
        .replace(/[ÿ\u0233]/ig, 'y')
        .replace(/[\n\t\r]/g, ' ')
        .replace(/[^a-zA-Z  ]/g, '');
}