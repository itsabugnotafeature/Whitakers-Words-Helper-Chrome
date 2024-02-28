import { Response } from "./response.js";

const SCANSCION_URL = 'https://alatius.com/macronizer/';
const BODY_URL = 'scan=1&textcontent=';

export const fetchScanscion = async (queryText) => {
    const res = await fetch(SCANSCION_URL, {
        method: 'POST',
        body: BODY_URL + encodeURIComponent(queryText)
    });
    if (res.ok) return Response('error', 'Looks like something went wrong');
    const text = await res.text();
    const responseDocument = await new window.DOMParser().parseFromString(text, "text/xml")
    const result = responseDocument.querySelector('div.feet')?.textContent;
    if (result === undefined) return Response('error', 'Looks like something went wrong');
    return Response('ok', `Dactylic hexameter: ${result}\nOther meters not supported at this time`);
};