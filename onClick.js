function onClick() {
	var enabled = document.querySelector(".switch input").checked;
	console.log(enabled);
	if (enabled) {
		document.querySelector("#status").textContent = ": Enabled";
	} else {
		document.querySelector("#status").textContent = ": Disabled";
    	}
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.switch input').addEventListener('click', onClick);
});