function debug(str) {
	if (gEnableConsole) {
		clearTimeout(gDebugTimer);
		var now = $.now()/1000;
		if ($('#debug-console').is(':hidden')) {
			$('#debug-console').show('slow');
		}
		$('#debug-console').html('<span>' + now.toString().substr(7, 5) + ':</span> ' + str + "<br>\n" + $('#debug-console').html());
		gDebugTimer = setTimeout(function() {
			$('#debug-console').hide('slow')}
		, 3000);
	}
}

/* Get Object from local storage */
function loadFromStorage() {
	debug('loadFromStorage()');
	gMediaObj = localStorage.getItem("gMediaObjects");
	gMediaObj = JSON.parse(gMediaObj);
	if (gMediaObj === null) {
		gMediaObj = [];
	}
}	

function loadMediaFile() {
	debug('loadMediaFile()');
	var mSrc = gMediaObj[gSelFileIndex].path;
	gMediaFile = new Media(mSrc, onSuccessMedia, onErrorMedia, onMediaStatus);
}

function updateTopUI() {
	debug('updateTopUI()');
	/* Generate file dropdown content */
	$('.generated-file').remove();
	$.each(gMediaObj, function(i, e) {
		var $optSelected = (i == gSelFileIndex) ? " SELECTED" : "";
		$tmpTitle = (e.title.trim() == "") ? "Untitled" : e.title + " (" + timeDispStr(e.duration) + ")";
		$('#select-file').append('<option class="generated-file" value="' + i + '"' + $optSelected + '>' + $tmpTitle + '</option>');
	});
	$('#select-file').append('<option class="generated-file" value="-1">Add new ...</option>');
	$('#select-file').selectmenu('refresh');
	initializePositionSlider();

}

function updateBodyUI() {
	debug('updateBodyUI()');
	$('.generated').remove();
	$('#div-list').hide();
	$('#div-delay').hide();
	if (gMediaObj.length > 0 && gSelFileIndex != -1) {	
		generateDelayDropdown();
		/* Generate positions list for selected file */
		var $posHtmlPre = '<li class="generated"><a href="" class="btn-play-pos" ';
		var $posHtmlMid = '<span class="ui-li-count">';
		var $posHtmlPost = 'class="btn-pos-popup" href="#popup-pos" data-rel="popup" data-transition="pop" data-position-to="window">Configure</a></li>';
		$.each(gMediaObj[gSelFileIndex].positions, function(i, e) {
			$tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			$position = 'data-pos="' + e.position + '"';
			$posObject = 'data-posobj="' + i + '"';
			$('#list-pos').append($posHtmlPre + $position + ' ' + $posObject + '>' + $posHtmlMid + timeDispStr(e.position) + '</span>' + $tmpName + '</a><a ' + $posObject + ' ' + $posHtmlPost);
		});
		var $posHtmlEnd = '<li class="generated" data-icon="plus"><a href="#popup-pos" class="btn-pos-popup" data-transition="pop" data-posobj="-1" data-rel="popup" data-position-to="window" style="text-align: center">Add new ...	</a></li>'
		$('#list-pos').append($posHtmlEnd);									
		$('#list-pos').listview('refresh');
		$('#div-list').show();
	}

}

function initializePositionSlider() {
	debug('initializePositionSlider()');
	/* Adjust slider max value, usually when another file is selected */
	$('#pos-slider').val(0);
	if (gSelFileIndex != -1) {
		 $('#pos-slider').attr('max', gMediaObj[gSelFileIndex].duration);
	}
	$('#pos-slider').slider("refresh");
}

function generateDelayDropdown() {
	$('#div-delay').show();
	/* Generate delay dropdown content */
	$.each(gDelayObj, function(i, e) {
		var $optSelected = (gDelayObj[i] == gMediaObj[gSelFileIndex].delay) ? " SELECTED" : "";
		$('#select-delay').append('<option class="generated" value="' + e + '"' + $optSelected + '>' + e + ' seconds</option>')
	});
	$('#select-delay').selectmenu('refresh');
}

/* Set Object to local storage */
function saveToStorage() {
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

/* For json data printout in config */

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}