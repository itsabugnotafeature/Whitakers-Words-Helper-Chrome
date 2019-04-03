// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.storage.local.set({isEnabled: true});

var currentQuery = undefined;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                                     //Filter out special characters
                                     currentQuery = request.query;
                                     var formattedText = request.query.trim();
                                     var originalText = request.query;
                                     
                                     formattedText = formattedText.replace(/ā/ig, 'a')
                                                                    .replace(/ē/ig, 'e')
                                                                    .replace(/ī/ig, 'i')
                                                                    .replace(/ō/ig, 'o')
                                                                    .replace(/[ū\u01d6]/ig, 'u')
                                                                    .replace(/[ÿ\u0233]/ig, 'y')
                                                                    .replace(/ /g, '+');
                                     
                                     //Get around WWW weird thing with only two words
                                     var numWords = formattedText.split("+").length;
                                     if (numWords == 2) {
                                        formattedText += "+et";
                                     }
                                     
                                     var url = "http://archives.nd.edu/cgi-bin/wordz.pl?keyword=" + formattedText;
                                     
                                     var xhttp = new XMLHttpRequest();
                                     
                                     xhttp.open("GET", url, true);
                                     xhttp.responseType = "document";
                                     xhttp.onreadystatechange = function () {
                                         if(xhttp.readyState === 4) {
                                             if (originalText != currentQuery) {
                                             //Don't return old results if there is a new query
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
                                     
                                                sendResponse({responseText: responseText});
                                            } else {
                                                sendResponse({responseText: "Looks like there was a problem"});
                                                console.log("XMLHttpRequest failed with error code: " + xhttp.status);
                                            }
                                         }
                                     };
                                     xhttp.send();
                                     return true;
                                     });
