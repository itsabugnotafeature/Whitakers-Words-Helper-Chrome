'use strict';

var contextMenuItem = {
    "id" : "getDefs",
    "title" : "Get Latin Definitions",
    "contexts" : ["selection"]
}

var scanscionMenuItem = {
    "id" : "getScans",
    "title" : "Get Scansion",
    "contexts" : ["selection"]
}

chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.create(scanscionMenuItem);

chrome.contextMenus.onClicked.addListener(function(clickData, tab) {
    if (clickData.menuItemId == "getDefs" && clickData.selectionText) {
        getDefs(clickData.selectionText, tab.id);
    } else if (clickData.menuItemId == "getScans" && clickData.selectionText) {
        getScans(clickData.selectionText, tab.id);
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];
        if (key == "isEnabled" && storageChange.newValue) {
            chrome.contextMenus.create(contextMenuItem);
            chrome.contextMenus.create(scanscionMenuItem);
        } else {
            chrome.contextMenus.remove(contextMenuItem.id);
            chrome.contextMenus.remove(scanscionMenuItem.id);
        }
    }
});

function getDefs(formattedText, tabId) {

    currentQuery = formattedText;
    var originalText = formattedText;

    sendTabResponse(tabId, "\nLoading defintion...\n\n");

    formattedText.trim();
    
    //Remove special characters
    formattedText = formattedText.replace(/ā/ig, 'a')
                                .replace(/ē/ig, 'e')
                                .replace(/ī/ig, 'i')
                                .replace(/ō/ig, 'o')
                                .replace(/ū/ig, 'u')
                                .replace(/[ÿ\u0233]/ig, 'y')
                                .replace(/[\n\t\r]/g, ' ')
                                .replace(/ /g, '+');

    var url = "https://latin-words.com/cgi-bin/translate.cgi?query=" + formattedText;

    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (originalText != currentQuery) {
                //Don't return results for old queries if there is a new one.
                return
            }
            if (xhttp.status === 200) {
                var responseText = JSON.parse(xhttp.response).message;

                responseText = "\n" + responseText;

                sendTabResponse(tabId, responseText)
            } else {
                sendTabResponse(tabId, "\nLooks like there was a problem\n\n");
                console.log("XMLHttpRequest failed with error code: " + xhttp.status);
            }
        }
    };
    xhttp.send();
}

function getScans(formattedText, tabId) {

    currentQuery = formattedText;
    var originalText = formattedText;

    sendTabResponse(tabId, "\nLoading scansion (this may take a while)\n\n");

    formattedText.trim();

    //Could URLEncode but if it ain't broke don't fix it
    formattedText = formattedText.replace(/ /g, '%20');
    //Remove special characters
    formattedText = formattedText.replace(/ā/ig, 'a')
                                .replace(/ē/ig, 'e')
                                .replace(/ī/ig, 'i')
                                .replace(/ō/ig, 'o')
                                .replace(/ū/ig, 'u')
                                .replace(/[ÿ\u0233]/ig, 'y')
                                .replace(/[\n\t\r]/g, ' ')
                                .replace(/ /g, '+');

    var url = "https://alatius.com/macronizer/";

    var postData = "scan=1&textcontent=" + formattedText;

    var xhttp = new XMLHttpRequest();

    xhttp.open("POST", url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = "document";
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (originalText != currentQuery) {
                //Don't return results for old queries if there is a new one.
                return
            }
            if (xhttp.status === 200) {
                var responseText = xhttp.responseXML.querySelector("div.feet").textContent;

                responseText = responseText;

                sendTabResponse(tabId, "\nDactylic hexameter: " + responseText + "\n(other meters not currently supported)\n\n");
            } else {
                sendTabResponse(tabId, "\nLooks like there was a problem\n\n");
                console.log("XMLHttpRequest failed with error code: " + xhttp.status);
            }
        }
    };
    xhttp.send(postData);
}

function sendTabResponse(tabId, message) {
    //Sends a general purpose object that the content script then injects into the WWH_pop_up_div and displays
    if (tabId != null && tabId != chrome.tabs.TAB_ID_NONE) {
        chrome.tabs.sendMessage(tabId, {responseText: message});
    } else {
        console.log("Error sending message: " + message + " to tab: " + tabId);
    }
}
