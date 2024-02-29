(async () => {
    const { text, div, applyStyles, makeElement, applyTopLeft } = await importModule('util/util.js');
    const WIDGET_PADDING = 15;
    const CURSOR_PADDING = 30;

    const wwhRoot = div({ id: 'wwh-root' });
    document.body.appendChild(wwhRoot);
    const widgetShadow = wwhRoot.attachShadow({ mode: 'closed' });
    const wwhContent = makeElement('pre', { id: 'wwh-content' });
    const wwhContainer = div({ id: 'wwh-container', style: 'visibility: hidden; position: fixed;' }, [wwhContent]);
    const cssURL = await chrome.runtime.getURL('css/content.css');
    widgetShadow.appendChild(makeElement('link', { href: cssURL, rel: 'stylesheet' }));
    widgetShadow.appendChild(wwhContainer);

    addEventListener('dblclick', async (event) => handleUserEvent(event, 'definitions'));
    addEventListener('click', (event) => {
        if (wwhRoot.contains(event.target)) return;
        hide();
    });
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => handleUserEvent(null, message.type));

    async function importModule(url) {
        return import(chrome.runtime.getURL(url));
    }

    function hide() {
        applyStyles(wwhContainer, { visibility: 'hidden' });
    }

    function show() {
        applyStyles(wwhContainer, { visibility: 'visible' });
    }
    
    function setResponse(message) {
        wwhContent.replaceChildren(text(message));
    }

    function setPosition(event) {
        if (event !== null) {
            displayAtMouse(event);
        } else {
            displayAtCenter();
        }
    }

    function displayAtMouse(event) {
        const width = wwhContainer.scrollWidth;
        const height = wwhContainer.scrollHeight;
        const screenHeight = document.documentElement.clientHeight;
        let x = event.clientX, y = event.clientY;
        x = Math.max(WIDGET_PADDING, x - (width / 2));
        if (y + height >= screenHeight - 15) {
            // Not enough room below, try to display on top
            y = Math.max(WIDGET_PADDING, y - CURSOR_PADDING - height);
        } else {
            // Fallback to displaying beneath the cursor
            y = Math.min(screenHeight - WIDGET_PADDING - height, y + CURSOR_PADDING);
        }
        applyTopLeft(wwhContainer, x, y);
    }

    function displayAtCenter() {
        const width = wwhContainer.scrollWidth;
        const height = wwhContainer.scrollHeight;
        const screenHeight = document.documentElement.clientHeight;
        const screenWidth = document.documentElement.clientWidth;
        let x = Math.max(WIDGET_PADDING, (screenWidth / 2) - (width / 2));
        let y = Math.max(WIDGET_PADDING, (screenHeight / 2) - (height / 2));
        applyTopLeft(wwhContainer, x, y);
    }

    function displayMessage(message, event) {
        setResponse(message);
        setPosition(event);
        show();
    }

    async function handleUserEvent(event, requestType) {
        const { enabled } = await chrome.storage.local.get('enabled');
        const queryText = window.getSelection().toString().trim();
        if (!enabled || queryText === '') return;
        switch (requestType) {
            case 'definitions':
                displayMessage('Loading definitions...', event);
                break;
            case 'scansion':
                displayMessage('Loading scanscion, this may take a few minutes...', event);
                break;
        }
        const { status, message } = await chrome.runtime.sendMessage({ queryType: requestType, queryText: window.getSelection().toString() });
        if (status === 'ignore') {
            hide();
        } else {
            displayMessage(message, event);
        }
    }
})();