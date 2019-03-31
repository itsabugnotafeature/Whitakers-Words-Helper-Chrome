'use strict';

var WWHHost = document.createElement("DIV");
WWHHost.id = "WWH_host";
WWHHost.style.textAlign = "left";
var shadowRoot = WWHHost.attachShadow({mode: 'closed'});
shadowRoot.innerHTML = "<style>#WWH_pop_up_div {box-shadow: 1px 2px 4px rgba(0, 0, 0, .5); background-color: rgb(110, 110, 110);padding: 2px !important;border-radius: 10px !important;position: absolute !important;visibility: hidden;min-width: 450px;z-index: 100000;opacity: 1 !important;font-family: Consolas, monospace !important;}#WWH_internal_div {background-color: rgb(255, 255, 255);border-radius: 15px !important;padding-left: 5px !important;padding-right: 5px !important;}#WWH_pop_up_div pre {font-family: Consolas, monospace !important;font-size: 14px !important;padding: 0 !important;margin: 0 !important;background-color: rgb(255, 255, 255, 0) !important;color: rgb(0, 0, 0) !important;box-shadow: none !important;line-height: 100% !important;}.WWH_triangle {position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 7px solid rgb(110, 110, 110); border-left-color: transparent; border-right-color: transparent; border-bottom-color: transparent; width: 0; height: 0; margin: 0 auto;} </style>"
var pop_up_div = document.createElement("DIV");
pop_up_div.id = "WWH_pop_up_div";
var internal_div = document.createElement("DIV");
internal_div.id = "WWH_internal_div";
var internal_pre = document.createElement("PRE");
internal_div.appendChild(internal_pre);
pop_up_div.appendChild(internal_div);
                          
shadowRoot.append(pop_up_div);

document.body.after(WWHHost);

var eventLocation = { x: undefined, y: undefined };

document.addEventListener("click", function(event) {
                          pop_up_div.style.visibility = 'hidden';
                          setEventLocation(event);
});

chrome.storage.local.get("isEnabled", function(result) {
	if (result.isEnabled) {
		document.addEventListener("dblclick", handleDoubleClick);
	}
});

document.addEventListener("contextmenu", function(event) {
                          pop_up_div.style.visibility = 'hidden';
                          setEventLocation(event);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                                     pop_up_div.style.visibility = 'visible';
                                     internal_pre.textContent = request.responseText;
                                     positionPopUp();
});

function handleDoubleClick(event) {
    setEventLocation(event);
    if (window.getSelection() && document.activeElement.tagName.toLowerCase() != "input" && document.activeElement.tagName.toLowerCase() != "textarea") {
        var text = window.getSelection().toString();
        if (text != "") {
            pop_up_div.style.visibility = 'visible';
            internal_pre.textContent = "\nLoading Definition\n\n";
            positionPopUp();
            chrome.runtime.sendMessage({query: text}, function(response) {
                                       internal_pre.textContent = response.responseText;
                                       positionPopUp();
                                       });
        }
    }
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
                                         for (var key in changes) {
                                             var storageChange = changes[key];
                                             if (key == "isEnabled" && storageChange.newValue) {
                                                document.addEventListener("dblclick", handleDoubleClick);
                                             } else {
                                                document.removeEventListener("dblclick", handleDoubleClick);
                                             }
                                         }
                                     });

function setEventLocation(event) {
    eventLocation.x = event.pageX;
    eventLocation.y = event.pageY;
}

function positionPopUp() {
    var div_rect = pop_up_div.getBoundingClientRect();
    pop_up_div.style.left = (eventLocation.x - div_rect.width / 2).toString() + "px";
    pop_up_div.style.top = (eventLocation.y - div_rect.height - 15).toString() + "px";
    div_rect = pop_up_div.getBoundingClientRect();
    if (div_rect.right >= document.documentElement.clientWidth) {
        pop_up_div.style.left = (document.documentElement.clientWidth - div_rect.width - 10).toString() + "px";
    }
    if (div_rect.left <= 0) {
        pop_up_div.style.left = (10).toString() + "px";
    }
    if (div_rect.top < div_rect.height) {
        pop_up_div.style.top = (eventLocation.y + 15).toString() + "px";
    }
}
