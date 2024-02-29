import { Response } from "./response.js";

const SCANSCION_URL = 'https://alatius.com/macronizer/';
const BODY_URL = 'scan=1&textcontent=';

export const fetchScanscion = async (queryText) => {
    const res = await fetch(SCANSCION_URL, {
        method: 'POST',
        body: BODY_URL + encodeURIComponent(queryText),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    if (!res.ok) return Response('error', 'Looks like something went wrong');
    const text = await res.text();
    // V3 extensions don't support the DOM API in service workers, so we work around it with a regex
    // This is very fragile
    const result = text.match(/<div class="feet">(.*?)<\/div>/)[1];
    if (result === undefined) return Response('error', 'Looks like something went wrong');
    return Response('ok', `Dactylic hexameter: ${result}\nOther meters not supported at this time`);
};