import { Response } from "./response.js";

const DEFINITIONS_URL = 'https://latin-words.com/cgi-bin/translate.cgi?query=';
const DEFINITIONS_ONLY_REGEX = /^.*[,;].*$/gm;

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
            // This matches the first line of definitions only
            // It may be necessary to revisit this  parsing
            let match, output = [];
            const regex = new RegExp(DEFINITIONS_ONLY_REGEX);
            while (match = regex.exec(processedMessage)) {
                output.push(match[0]);
            }
            processedMessage = output.join('\n');
        }
        return Response('ok', processedMessage);
    }
};