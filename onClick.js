"use-strict";

function onClick(event) {
	var enabled = document.querySelector(".switch input").checked;
    var text = document.querySelector("h2#status");
    
	if (enabled) {
        chrome.storage.local.set({'isEnabled': true});
		text.textContent = "Enabled";
        text.style.color = "#27ae60";
	} else {
        chrome.storage.local.set({'isEnabled': false});
		text.textContent = "Disabled";
        text.style.color = "#e74c3c";
    }
    console.log("Extesnion " + text.textContent);
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".switch").style.display = "none";
    document.querySelector("#status").style.display = "none";
    chrome.storage.local.get('isEnabled', function(data) {
        var checkbox = document.querySelector(".switch input");
        var status = document.querySelector("h2#status");
        if (data.isEnabled == true) {
            status.textContent = "Enabled";
            status.style.color = "#27ae60";
            checkbox.checked = true;
        } else {
            status.textContent = "Disabled";
            status.style.color = "#e74c3c";
            checkbox.checked = false;
        }
        document.querySelector(".switch").style.display = "inline-block";
        document.querySelector("#status").style.display = "inline-block";
    });
    document.querySelector('.switch input').addEventListener('click', onClick);
});
