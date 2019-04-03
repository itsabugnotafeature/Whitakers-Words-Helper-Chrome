// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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
    formattedText = formattedText.replace(/ā/ig, 'a');
    formattedText = formattedText.replace(/ē/ig, 'e');
    formattedText = formattedText.replace(/ī/ig, 'i');
    formattedText = formattedText.replace(/ō/ig, 'o');
    formattedText = formattedText.replace(/ū/ig, 'u');
    formattedText = formattedText.replace(/[ÿ\u0233]/ig, 'y')
    formattedText = formattedText.replace(/ /g, '+');
    
    //Deal with WWW wierd thing with only two words
    var numWords = formattedText.split("+").length;
    if (numWords == 2) {
        formattedText += "+et";
    }
    
    var url = "http://archives.nd.edu/cgi-bin/wordz.pl?keyword=" + formattedText;
    
    var xhttp = new XMLHttpRequest();
    
    xhttp.open("GET", url, true);
    xhttp.responseType = "document";
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (originalText != currentQuery) {
                //Don't return results for old queries if there is a new one.
                return
            }
            if (xhttp.status === 200) {
                var responseText = xhttp.responseXML.querySelector("pre").textContent;
                
                //Remove inserted 'et' response
                if (numWords == 2) {
                    var splitText = responseText.split("\n");
                    splitText.splice(-6, 4);
                    responseText = splitText.join("\n");
                }
                
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
    
    var url = "http://alatius.com/macronizer/?scan=hexameter&textcontent=" + formattedText;
    
    var xhttp = new XMLHttpRequest();
    
    xhttp.open("GET", url, true);
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
    xhttp.send();
}

function sendTabResponse(tabId, message) {
    //Sends a general purpose object that the content script then injects into the WWH_pop_up_div and displays
    if (tabId != null && tabId != chrome.tabs.TAB_ID_NONE) {
        chrome.tabs.sendMessage(tabId, {responseText: message});
    } else {
        console.log("Error sending message: " + message + " to tab: " + tabId);
    }
}
