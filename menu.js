import { modules } from "./background.js";

export function addMenuItems() {
    for (let moduleName in modules) {
        chrome.contextMenus.create({
            title:  modules[moduleName].menuItemTitle,
            id: moduleName,
            contexts: ['all'] 
        });
    }
}

export function removeMenuItems() {
    chrome.contextMenus.removeAll();
}