(() => {
    document.addEventListener('DOMContentLoaded', async () => {
        const { enabled } = await chrome.storage.local.get('enabled');
        const enableBlock = document.querySelector("#enable-block");
        const status = document.querySelector("#enable-block #status");

        if (enabled) {
            enable();
        } else {
            disable();
        }

        enableBlock.addEventListener('click', async () => {
            const { enabled } = await chrome.storage.local.get('enabled');
            if (enabled) {
                disable();
            } else {
                enable();
            }
        });

        function enable() {
            chrome.storage.local.set({ enabled: true });
            enableBlock.classList.remove('disable');
            enableBlock.classList.add('enable');
            status.textContent = "Enabled";
            chrome.runtime.sendMessage({ queryType: 'context-menu', queryText: 'add' });
        }

        function disable() {
            chrome.storage.local.set({ enabled: false });
            enableBlock.classList.remove('enable');
            enableBlock.classList.add('disable');
            status.textContent = "Disabled";
            chrome.runtime.sendMessage({ queryType: 'context-menu', queryText: 'remove' });
        }
    });
})();