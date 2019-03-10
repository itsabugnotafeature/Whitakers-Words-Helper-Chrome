'use strict';

var pop_up_div = document.createElement("DIV");
pop_up_div.id = "WWH_pop_up_div";
var internal_div = document.createElement("DIV");
internal_div.id = "WWH_internal_div"
var pre_text = document.createElement("PRE");
internal_div.appendChild(pre_text);
pop_up_div.appendChild(internal_div);
                          
document.body.append(pop_up_div);

document.addEventListener("click", function(event) {
                          document.getElementById("WWH_pop_up_div").style.visibility = 'hidden';
});

document.addEventListener("dblclick", function(event) {
    if (window.getSelection() && document.activeElement.tagName.toLowerCase() != "input" && document.activeElement.tagName.toLowerCase() != "textarea") {
        var text = window.getSelection().toString();
        if (text != "") {
            $( "#WWH_pop_up_div" ).css({'visibility' : 'visible'});
            $( "#WWH_pop_up_div" ).offset({left:event.pageX,top:event.pageY});
            $( "#WWH_pop_up_div #WWH_internal_div pre" ).text("");
                          chrome.runtime.sendMessage({query: text}, function(response) {
                                                     $( "#WWH_pop_up_div #WWH_internal_div pre" ).text(response.responseText);
                                                     var pop_up_div = document.getElementById("WWH_pop_up_div");
                                                     var div_rect = pop_up_div.getBoundingClientRect();
                                                     if (div_rect.x + div_rect.width > document.documentElement.clientWidth) {
                                                     pop_up_div.style.left = (document.documentElement.clientWidth - div_rect.width - 5).toString() + "px";
                                                     }
                                                     if (div_rect.y + div_rect.height > document.documentElement.clientHeight) {
                                                     pop_up_div.style.top = (document.documentElement.clientHeight - div_rect.height + window.scrollY - 5).toString() + "px";
                                                     }
                                                     });
        }
    }
});

document.addEventListener("contextmenu", function(event) {
                            $( "#WWH_pop_up_div" ).offset({left:event.pageX,top:event.pageY});
                            $( "#WWH_pop_up_div" ).css({'visibility' : 'hidden'});
                          })

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                                         $( "#WWH_pop_up_div" ).css({'visibility' : 'visible'});
                                         $( "#WWH_pop_up_div #WWH_internal_div pre" ).text(request.responseText);
                                         var pop_up_div = document.getElementById("WWH_pop_up_div");
                                         var div_rect = pop_up_div.getBoundingClientRect();
                                         if (div_rect.x + div_rect.width > document.documentElement.clientWidth) {
                                            pop_up_div.style.left = (document.documentElement.clientWidth - div_rect.width - 5).toString() + "px";
                                         }
                                         if (div_rect.y + div_rect.height > document.documentElement.clientHeight) {
                                            pop_up_div.style.top = (document.documentElement.clientHeight - div_rect.height + window.scrollY - 5).toString() + "px";
                                         }
                                     });

