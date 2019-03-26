'use strict';

var WWHHost = document.createElement("DIV");
WWHHost.id = "WWH_host";
WWHHost.style.position = "static";
var shadowRoot = WWHHost.attachShadow({mode: 'closed'});
shadowRoot.innerHTML = "<style>#WWH_pop_up_div {box-shadow: 1px 2px 4px rgba(0, 0, 0, .5); background-color: rgb(110, 110, 110);padding: 2px !important;border-radius: 10px !important;position: absolute !important;visibility: hidden;min-width: 450px;z-index: 100000;opacity: 1 !important;font-family: Consolas, monospace !important;}#WWH_internal_div {background-color: rgb(255, 255, 255);border-radius: 15px !important;padding-left: 5px !important;padding-right: 5px !important;}#WWH_pop_up_div pre {font-family: Consolas, monospace !important;font-size: 14px !important;padding: 0 !important;margin: 0 !important;background-color: rgb(255, 255, 255, 0) !important;color: rgb(0, 0, 0) !important;box-shadow: none !important;line-height: 100% !important;}</style>"
var pop_up_div = document.createElement("DIV");
pop_up_div.id = "WWH_pop_up_div";
var internal_div = document.createElement("DIV");
internal_div.id = "WWH_internal_div"
var internal_pre = document.createElement("PRE");
internal_div.appendChild(internal_pre);
pop_up_div.appendChild(internal_div);
                          
shadowRoot.append(pop_up_div);

document.body.after(WWHHost);



document.addEventListener("click", function(event) {
                          pop_up_div.style.visibility = 'hidden';
});

document.addEventListener("dblclick", handleDoubleClick);

document.addEventListener("contextmenu", function(event) {
    pop_up_div.style.visibility = 'hidden';
    pop_up_div.style.left = event.pageX.toString() + "px";
    pop_up_div.style.top = event.pageY.toString() + "px";
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    pop_up_div.style.visibility = 'visible';
    internal_pre.textContent = request.responseText;
    var div_rect = pop_up_div.getBoundingClientRect();
    pop_up_div.style.left = (parseInt(pop_up_div.style.left) - div_rect.width / 2).toString() + "px";
    pop_up_div.style.top = (parseInt(pop_up_div.style.top) - div_rect.height - 10).toString() + "px";
	div_rect = pop_up_div.getBoundingClientRect();
    	if (div_rect.x + div_rect.width > document.documentElement.clientWidth) {
       		pop_up_div.style.left = (document.documentElement.clientWidth - div_rect.width).toString() + "px";
    	}
	if (div_rect.x < 0) {
        	pop_up_div.style.left = (10).toString() + "px";
        }
        if (div_rect.y + div_rect.height > document.documentElement.clientHeight) {
                pop_up_div.style.top = (document.documentElement.clientHeight - div_rect.height + window.scrollY - 10).toString() + "px";
        }
        if (div_rect.y < 0) {
                pop_up_div.style.top = (10 + window.scrollY).toString() + "px";
        }
});

function handleDoubleClick(event) {
    if (window.getSelection() && document.activeElement.tagName.toLowerCase() != "input" && document.activeElement.tagName.toLowerCase() != "textarea") {
        var text = window.getSelection().toString();
        if (text != "") {
            pop_up_div.style.visibility = 'visible';
            pop_up_div.style.left = event.pageX.toString() + "px";
            pop_up_div.style.top = event.pageY.toString() + "px";
            internal_pre.textContent = "\nLoading Definition\n\n";
	    var div_rect = pop_up_div.getBoundingClientRect();
	    pop_up_div.style.left = (parseInt(pop_up_div.style.left) - div_rect.width / 2).toString() + "px";
    	    pop_up_div.style.top = (parseInt(pop_up_div.style.top) - div_rect.height - 10).toString() + "px";
            chrome.runtime.sendMessage({query: text}, function(response) {
                                       internal_pre.textContent = response.responseText;
                                       var div_rect = pop_up_div.getBoundingClientRect();
					pop_up_div.style.left = (event.pageX - div_rect.width / 2).toString() + "px";
    	    				pop_up_div.style.top = (event.pageY - div_rect.height - 10).toString() + "px";
					div_rect = pop_up_div.getBoundingClientRect();
                                       if (div_rect.x + div_rect.width > document.documentElement.clientWidth) {
                                            pop_up_div.style.left = (document.documentElement.clientWidth - div_rect.width).toString() + "px";
                                       }
				       if (div_rect.x < 0) {
                                            pop_up_div.style.left = (10).toString() + "px";
                                       }
                                       if (div_rect.y + div_rect.height > document.documentElement.clientHeight) {
                                            pop_up_div.style.top = (document.documentElement.clientHeight - div_rect.height + window.scrollY - 10).toString() + "px";
                                       }
                                       if (div_rect.y < 0) {
                                            pop_up_div.style.top = (10 + window.scrollY).toString() + "px";
                                       }
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
