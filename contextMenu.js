// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var contextMenuItem = {
    "id" : "getDefs",
    "title" : "Get Latin Definitions",
    "contexts" : ["selection"]
}

chrome.contextMenus.create(contextMenuItem);

chrome.contextMenus.onClicked.addListener(function(clickData) {
                                              if (clickData.menuItemId == "getDefs" && clickData.selectionText) {
                                                  var formattedText = clickData.selectionText;
                                                  formattedText = formattedText.replace(/ā/ig, 'a');
                                                  formattedText = formattedText.replace(/ē/ig, 'e');
                                                  formattedText = formattedText.replace(/ī/ig, 'i');
                                                  formattedText = formattedText.replace(/ō/ig, 'o');
                                                  formattedText = formattedText.replace(/ū/ig, 'u');
                                                  formattedText = formattedText.replace(/ /g, '+');
                                          
                                                  var numWords = formattedText.split("+").length;
                                                  if (numWords == 2) {
                                                    formattedText += "+et";
                                                  }
                                          
                                                  console.log("[" + formattedText + "]");
                                          
                                                  var url = "http://archives.nd.edu/cgi-bin/wordz.pl?keyword=" + formattedText;
                                          
                                                  var xhttp = new XMLHttpRequest();
                                          
                                                  xhttp.open("GET", url, true);
                                                  xhttp.responseType = "document";
                                                  xhttp.onreadystatechange = function () {
                                                  if (xhttp.readyState === 4) {
                                                    if (xhttp.status === 200) {
                                                          var responseText = xhttp.responseXML.getElementsByTagName("pre")[0].textContent;
                                          
                                                          if (numWords == 2) {
                                                              var splitText = responseText.split("\n");
                                                              splitText.splice(-6, 4);
                                                              responseText = splitText.join("\n");
                                                          }
                                          
                                                          responseText = "\n" + responseText;
                                          
                                                          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                                                            chrome.tabs.sendMessage(tabs[0].id, {responseText: responseText});
                                                                            });
                                                      }
                                                    } else {
                                                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                                                          chrome.tabs.sendMessage(tabs[0].id, {responseText: "Looks like there was a problem\nError code: " + xhttp.status});
                                                                          });
                                                    }
                                                  };
                                                  xhttp.send();
                                              }
                                          })
