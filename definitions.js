import { Response } from "./response.js";

const DEFINITIONS_URL = 'https://latin-words.com/cgi-bin/translate.cgi?query=';

export const fetchDefinitions = async (queryText) => {
    const res = await fetch(DEFINITIONS_URL + encodeURIComponent(queryText));
    if (!res.ok) return Response('error', 'Looks like something went wrong');
    const { status, message } = await res.json();
    if (status !== 'ok') {
        return Response('error', 'Looks like something went wrong');
    } else {
        const { definitionsOnly } = await chrome.storage.local.get('definitionsOnly');
        let processedMessage = message.trim();
        if (definitionsOnly) {
            let regex = /(TACKON.*\n|\[[a-zA-Z]+?\].*\n)(.*)/g;
            let match, output = [];
            while (match = regex.exec(processedMessage)) {
                output.push(match[2]);
            }
            processedMessage = output.join('\n');
        }
        return Response('ok', processedMessage);
    }
};