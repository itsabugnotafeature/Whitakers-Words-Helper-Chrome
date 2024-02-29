import { fetchDefinitions } from "./definitions.js";
import { fetchScanscion } from "./scanscion.js";
import { Response } from "./response.js";
import { Request } from "./request.js";

const modules = {
    definitions: {
        handler: handleDefinitionsQuery,
        menuItemTitle: 'Get definitions',
    },
    scanscion: {
        handler: handleScanscionQuery,
        menuItemTitle: 'Get scanscion',
    }
};

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (['install', 'update'].includes(reason)) {
        chrome.storage.local.set({
            enabled: true
        });
        
        for (let moduleName in modules) {
            chrome.contextMenus.create({
                title:  modules[moduleName].menuItemTitle,
                id: moduleName,
                contexts: ['all'] 
            });
        }
    }
});

// Send translation/scansion to content script via messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    const queryType = message.queryType;
    let queryText = message.query.trim();
    // Sanitize string, strip out diacritics and non letter characters
    queryText = sanitizeString(queryText);

    const handler = modules[queryType]?.handler;
    if (handler === undefined) sendResponse(Response('error', 'Looks like something went wrong'));
    handler(queryText, sendResponse);

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
        .replace(/[^a-zA-Z ]/g, '');
}