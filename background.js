
const modules = {
    definition: {
        handler: handleDefinitionsQuery
    },
    scanscion: {
        
    }
}

import { fetchDefinitions } from "./definitions.js";
import { Response } from "./response.js";

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (['install', 'update'].includes(reason)) {
        chrome.storage.local.set({
            enabled: true
        });
    }
});

// Send translation/scansion to content script via messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    const queryType = message.queryType;
    let queryText = message.query.trim();
    // Sanitize string, strip out diacritics and non letter characters
    queryText = queryText.replace(/ā/ig, 'a')
        .replace(/[ē\u00EB]/ig, 'e')
        .replace(/ī/ig, 'i')
        .replace(/ō/ig, 'o')
        .replace(/[ū\u01d6]/ig, 'u')
        .replace(/[ÿ\u0233]/ig, 'y')
        .replace(/[\n\t\r]/g, ' ')
        .replace(/[^a-zA-Z]/, '');

    const handler = modules[queryType]?.handler;
    if (handler === undefined) sendResponse(Response('error', 'Looks like something went wrong...try again in a few minutes'));
    handler(queryText, sendResponse);

    return true;
});

async function handleDefinitionsQuery(query, sendResponse) {
    const response = await fetchDefinitions(query);
    sendResponse(response);
}