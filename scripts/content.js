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

    addEventListener('dblclick', async (event) => {
        const { enabled } = await chrome.storage.local.get('enabled');
        const x = event.clientX, y = event.clientY;
        if (!enabled) return; 
        displayMessage('Loading definitions...', x, y);
        const { status, message } = await chrome.runtime.sendMessage({ queryType: 'definitions', query: window.getSelection().toString() });
        displayMessage(message, x, y);
    });

    addEventListener('click', (event) => {
        if (wwhRoot.contains(event.target)) return;
        hide();
    });

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

    function setPosition(x, y) {
        applyTopLeft(wwhContainer, x, y);
    }

    function displayAt(x, y) {
        const width = wwhContainer.scrollWidth;
        const height = wwhContainer.scrollHeight;
        const screenHeight = document.documentElement.clientHeight;

        x = Math.max(WIDGET_PADDING, x - (width / 2));
        if (y + height >= screenHeight - 15) {
            // Not enough room below, try to display on top
            y = Math.max(WIDGET_PADDING, y - CURSOR_PADDING - height);
        } else {
            // Fallback to displaying beneath the cursor
            y = Math.min(screenHeight - WIDGET_PADDING - height, y + CURSOR_PADDING);
        }
        setPosition(x, y);
    }

    function displayMessage(message, x, y) {
        setResponse(message);
        displayAt(x, y);
        show();
    }
})();