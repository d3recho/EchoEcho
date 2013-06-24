function getObjFromStorage() {
	/* Get Object from local storage */
	mediaObj = localStorage.getItem("mediaObjects");
	mediaObj = JSON.parse(mediaObj);
	if (mediaObj === null) {
		mediaObj = [];
	}
}	

function setObjToStorage() {
	/* Set Object to local storage */
	localStorage.setItem("mediaObjects", JSON.stringify(mediaObj));
}	

function setTimeAudioPosEntry() {
	$('#pos-minute').val(timeDispStr_x($('#pos-slider').val(), "min"));
	$('#pos-second').val(timeDispStr_x($('#pos-slider').val(), "sec"));
}


function setTimeAudioPosEntry() {
	$('#pos-minute').val(timeDispStr_x($('#pos-slider').val(), "min"));
	$('#pos-second').val(timeDispStr_x($('#pos-slider').val(), "sec"));
}

/* Returns a string of time from time stored in obj */
function timeDispStr(nTime) {
	if (isNaN(nTime)) return "error";
	var min = timeDispStr_x(nTime, "min");
	var sec = timeDispStr_x(nTime, "sec");
	return min + ":" + ((sec < 10) ? "0" + sec : sec);
}

/* Helper for timeDispStr() and where we just want minutes or seconds */
function timeDispStr_x(nTime, scale) {
	if (scale == "min") return Math.floor(nTime / 60);
	else if (scale == "sec") return nTime % 60;
}

/* Returns seconds to store in obj */ 
function timeGetSeconds() {
	var min = Number($('#pos-minute').val());
	var sec = Number($('#pos-second').val());
	return min * 60 + sec;
}

