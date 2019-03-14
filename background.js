// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.storage.local.set({isEnabled: true});

chrome.runtime.onMessage.addListener(
                                     function(request, sender, sendResponse) {
                                     var formattedText = request.query.trim();
                                     formattedText = formattedText.replace(/ā/ig, 'a')
                                                                    .replace(/ē/ig, 'e')
                                                                    .replace(/ī/ig, 'i')
                                                                    .replace(/ō/ig, 'o')
                                                                    .replace(/[ū\u01d6]/ig, 'u')
                                                                    .replace(/ /g, '+');
                                     
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
                                     if(xhttp.readyState === 4) {
                                         if (xhttp.status === 200) {
                                            var responseText = xhttp.responseXML.getElementsByTagName("pre")[0].textContent;
                                     
                                            if (numWords == 2) {
                                                var splitText = responseText.split("\n");
                                                splitText.splice(-6, 4);
                                                responseText = splitText.join("\n");
                                            }
                                     
                                            responseText = "\n" + responseText;
                                     
                                            sendResponse({responseText: responseText});
                                        } else {
                                            sendResponse({responseText: "\nLooks like there was a problem\nError code: " + xhttp.status + "\n\n"});
                                        }
                                     }
                                     };
                                         xhttp.send();
                                         return true;
                                     });
