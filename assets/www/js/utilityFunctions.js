/* Get Object from local storage */
function getObjFromStorage() {
	mediaObj = localStorage.getItem("mediaObjects");
	mediaObj = JSON.parse(mediaObj);
	if (mediaObj === null) {
		mediaObj = [];
	}
}	

function updateTopUI() {
	/* Generate file dropdown content */
	$('.generated-file').remove();
	$.each(mediaObj, function(i, e) {
		var $optSelected = (i === selFileIndex) ? " SELECTED" : "";
		$tmpTitle = (e.title.trim() == "") ? "Untitled" : e.title + " (" + timeDispStr(e.duration) + ")";
		$('#select_file').append('<option class="generated-file" value="' + i + '"' + $optSelected + '>' + $tmpTitle + '</option>');
	});
	$('#select_file').append('<option class="" value="-1">Add new ...</option>');
	$('#select_file').selectmenu('refresh');	
	adjustPositionSlider();
}

function updateBodyUI() {
	/* Clear generated elements */
	$('.generated').remove();
	$('#div_list').hide();
	
	if (mediaObj.length > 0 && selFileIndex >= 0) {	
		generateDelayDropdown();
		/* Generate positions list for selected file */
		var $posHtmlPre = '<li class="generated"><a href="" class="btn-play-pos" ';
		var $posHtmlMid = '<span class="ui-li-count">';
		var $posHtmlPost = 'class="btn-pos-popup" href="#popup-pos" data-rel="popup" data-transition="pop" data-position-to="window">Configure</a></li>';
		var $posHtmlEnd = '<li class="generated" data-icon="plus"><a href="#popup-pos" class="btn-pos-popup" data-transition="fade" data-posobj="-1" data-rel="popup" data-position-to="window" style="text-align: center">Add new ...	</a></li>'
		$.each(mediaObj[selFileIndex].positions, function(i, e) {
			$tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			$position = 'data-pos="' + e.position + '"';
			$posObject = 'data-posobj="' + i + '"';
			$('#list_pos').append($posHtmlPre + $position + ' ' + $posObject + '>' + $posHtmlMid + timeDispStr(e.position) + '</span>' + $tmpName + '</a><a ' + $posObject + ' ' + $posHtmlPost);
		});
		$('#list_pos').append($posHtmlEnd);									
		$('#list_pos').listview('refresh');
		$('#div_list').show();
	}

}

function adjustPositionSlider() {
	/* Adjust slider max value, usually when another file is selected */
	$('#pos-slider').val(0);
	$('#pos-slider').slider("refresh");
	$('#pos-slider').attr('max', mediaObj[selFileIndex].duration);
}

function generateDelayDropdown() {
	/* Generate delay dropdown content */
	$.each(delayObj, function(i, e) {
		var $optSelected = (delayObj[i] == mediaObj[selFileIndex].delay) ? " SELECTED" : "";
		$('#select_delay').append('<option class="generated" value="' + e + '"' + $optSelected + '>' + e + ' seconds</option>')
	});
	$('#select_delay').selectmenu('refresh');
}

/* Set Object to local storage */
function setObjToStorage() {
	localStorage.setItem("mediaObjects", JSON.stringify(mediaObj));
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

/* Update position slider position */
function updateSlider(position) {
	if (position == undefined) {
		timeDispStr($('#pos-slider').val(++sliderPos));
		if (sliderPos >= mediaObj[selFileIndex].duration) {
			clearTimeout(playbackTimer);
			playbackControl('stop');
		}
	} 
	else {
		sliderPos = position;
		timeDispStr($('#pos-slider').val(position));
	}
	$('#pos-slider').slider("refresh");
}

/* Delay before playback output */
function delayCountdown() {
	var tmpStr = $('#song-position').text();
	var secPos = tmpStr.indexOf(":");
	var sec = Number(tmpStr.substr(secPos + 1));
	if (sec > 0) {
		$('#song-position').text(timeDispStr(sec - 1)).prepend("-");		
	} 
	else {
		clearTimeout(delayTimer);
		$('#song-position').removeClass('delaying');
		slidePositionChanged();
		isPaused = true;
		playbackControl('play');
	}
}