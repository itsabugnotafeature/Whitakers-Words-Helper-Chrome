'use strict';

chrome.storage.local.set({isEnabled: true});

var currentQuery = undefined;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //Filter out special characters
    currentQuery = request.query;
    var formattedText = request.query.trim();
    var originalText = request.query;

    formattedText = formattedText.replace(/ā/ig, 'a')
                                    .replace(/[ē\u00EB]/ig, 'e')
                                    .replace(/ī/ig, 'i')
                                    .replace(/ō/ig, 'o')
                                    .replace(/[ū\u01d6]/ig, 'u')
                                    .replace(/[ÿ\u0233]/ig, 'y')
                                    .replace(/[\n\t\r]/g, ' ')
                                    .replace(/ /g, '+');

    var url = "https://latin-words.com/cgi-bin/translate.cgi?query=" + formattedText;

    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function () {
        if(xhttp.readyState === 4) {
            if (originalText != currentQuery) {
                //Don't return old results if there is a new query
                return
            }
            if (xhttp.status === 200) {
                var responseText = JSON.parse(xhttp.response).message;

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
