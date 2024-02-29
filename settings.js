import { addMenuItems, removeMenuItems } from "./menu.js"

export async function handleSettingsChange(changes) {
    for (let key in changes) {
        if (key === 'enabled') {
            if (changes[key].newValue === true) {
                addMenuItems();
            } else {
                removeMenuItems();
            }
        }
    }
}