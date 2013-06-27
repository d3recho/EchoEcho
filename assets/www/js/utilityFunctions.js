function debug(str) {
	if (gEnableConsole) {
		var now = $.now()/1000;
		if ($('#debug-console').is(':hidden')) {
			$('#debug-console').show('slow');
		}
		$('#debug-console').html('<span>' + now.toString().substr(7, 5) + ':</span> ' + str + "<br>\n" + $('#debug-console').html());
	}
}

/* Get Object from local storage */
function getObjFromStorage() {
	gMediaObj = localStorage.getItem("gMediaObjects");
	gMediaObj = JSON.parse(gMediaObj);
	if (gMediaObj === null) {
		gMediaObj = [];
	}
}	

function loadMediaFile() {
	var src = gMediaObj[gSelFileIndex].path;
	gMediaFile = new Media(src, onSuccessMedia, onErrorMedia, onMediaStatus);
	debug('Loaded mediafile');
}



function updateTopUI() {
	/* Generate file dropdown content */
	$('.generated-file').remove();
	$.each(gMediaObj, function(i, e) {
		var $optSelected = (i === gSelFileIndex) ? " SELECTED" : "";
		$tmpTitle = (e.title.trim() == "") ? "Untitled" : e.title + " (" + timeDispStr(e.duration) + ")";
		$('#select-file').append('<option class="generated-file" value="' + i + '"' + $optSelected + '>' + $tmpTitle + '</option>');
	});
	$('#select-file').append('<option class="" value="-1">Add new ...</option>');
	$('#select-file').selectmenu('refresh');
	adjustPositionSlider();

}

function updateBodyUI() {
	/* Clear generated elements */
	$('.generated').remove();
	$('#div-list').hide();
	
	if (gMediaObj.length > 0 && gSelFileIndex >= 0) {	
		generateDelayDropdown();
		/* Generate positions list for selected file */
		var $posHtmlPre = '<li class="generated"><a href="" class="btn-play-pos" ';
		var $posHtmlMid = '<span class="ui-li-count">';
		var $posHtmlPost = 'class="btn-pos-popup" href="#popup-pos" data-rel="popup" data-transition="pop" data-position-to="window">Configure</a></li>';
		var $posHtmlEnd = '<li class="generated" data-icon="plus"><a href="#popup-pos" class="btn-pos-popup" data-transition="pop" data-posobj="-1" data-rel="popup" data-position-to="window" style="text-align: center">Add new ...	</a></li>'
		$.each(gMediaObj[gSelFileIndex].positions, function(i, e) {
			$tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			$position = 'data-pos="' + e.position + '"';
			$posObject = 'data-posobj="' + i + '"';
			$('#list-pos').append($posHtmlPre + $position + ' ' + $posObject + '>' + $posHtmlMid + timeDispStr(e.position) + '</span>' + $tmpName + '</a><a ' + $posObject + ' ' + $posHtmlPost);
		});
		$('#list-pos').append($posHtmlEnd);									
		$('#list-pos').listview('refresh');
		$('#div-list').show();
	}

}

function adjustPositionSlider() {
	/* Adjust slider max value, usually when another file is selected */
	$('#pos-slider').val(0);
	$('#pos-slider').attr('max', gMediaObj[gSelFileIndex].duration);
	$('#pos-slider').slider("refresh");
}

function generateDelayDropdown() {
	/* Generate delay dropdown content */
	$.each(gDelayObj, function(i, e) {
		var $optSelected = (gDelayObj[i] == gMediaObj[gSelFileIndex].delay) ? " SELECTED" : "";
		$('#select-delay').append('<option class="generated" value="' + e + '"' + $optSelected + '>' + e + ' seconds</option>')
	});
	$('#select-delay').selectmenu('refresh');
}

/* Set Object to local storage */
function setObjToStorage() {
	localStorage.setItem("gMediaObjects", JSON.stringify(gMediaObj));
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
function updateUISlider(pos) {
	$('#song-position').text(timeDispStr(pos));
	if (!isUserTouchingSlider) {
		gSliderPos = pos;
		$('#pos-slider').val(gSliderPos);
		$('#pos-slider').slider("refresh");
	}
}


/*  Media onSuccess Callback callback */
function onSuccessMedia() {
	debug('media load success');
}

/* Media onError Callback callback  */
function onErrorMedia(error) {
	alert('error code: '    + error.code    + '\n' + 
		  'error message: ' + error.message + '\n');
}

/* Media status callback */
function onMediaStatus(status) {
	gMediaStatus = status
	if (gMediaStatus == Media.MEDIA_STOPPED) $("#pos-slider").slider('disable'); 
	else $("#pos-slider").slider('enable');
	debug(status);
}

