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
	var _lastMedia = localStorage.getItem("LastMedia");
	gMediaObj = localStorage.getItem("gMediaObjects");
	gMediaObj = JSON.parse(gMediaObj);
	if (gMediaObj == undefined) {
		gMediaObj = [];
	}
	else if (_lastMedia != undefined) {
		gSelFileIndex = _lastMedia;
		updateMediaFileText();		
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
	$('#popup-mediaselect ul li').remove();
	$.each(gMediaObj, function(i, e) {
		var $selectionStyle = (i == gSelFileIndex) ? ' class="ui-focus ui-btn-down-a"' : '';
		var $tmpTitle = (e.title.trim() == "") ? "Untitled" : e.title;
		var $tmpPath = e.path.substr(0, e.path.lastIndexOf('/') + 1);
		$('#popup-mediaselect ul').append('<li' + $selectionStyle + ' data-icon="false"><a class="mediafile" href="" data-index="' + i + '">' 
			+ $tmpTitle + '<span style="font-size: 0.6em;"><br>' + $tmpPath	+ '</span></a>' 
			+ '<span class="ui-li-count">' + timeDispStr(e.duration) + '</span>' 
			+ '<a href="#" class="file-delete" data-index="' + i + '" >Delete</a></li>');
	});
	$('#popup-mediaselect ul').append('<li data-icon="false"><a class="mediafile" href="" data-index="-1">Add new media file ...</a></li>');
	$('#popup-mediaselect').parent().css('width', '90%');
	$('#popup-mediaselect ul').listview('refresh');
}

function updateMediaFileText() {
	if (gSelFileIndex != -1) {
		$('#select-file .ui-btn-text').text(gMediaObj[gSelFileIndex].title);
	} else {
		$('#select-file .ui-btn-text').text('Select a file...');
	}
	initializePositionSlider();
}

function updateBodyUI() {
	debug('updateBodyUI()');
	$('.generated').remove();
	$('.delay').hide();
	$('#div-list').hide();
	if (gMediaObj.length > 0 && gSelFileIndex != -1) {	
		$('.delay').show();
		generateDelayDropdown();
		/* Generate positions list for selected file */
		$.each(gMediaObj[gSelFileIndex].positions, function(i, e) {
			var $tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			$('#list-pos').append('<li class="generated"><a href="" class="btn-play-pos" data-pos="' + e.position + '" data-posobj="' + i + '">' 
				+ $tmpName + '<span class="ui-li-count">' + timeDispStr(e.position) + '</span>'
				+ '</a><a href="#" data-posobj="' + i + '" class="btn-pos-popup" data-rel="popup">Configure</a></li>');
		});
		var $posHtmlEnd = '<li id="pos-add-new" class="generated" data-icon="plus">' 
			+ '<a href="#popup-pos" class="btn-pos-popup" data-posobj="-1" ' 
			+ 'data-rel="popup" data-position-to="window" style="text-align: center">Add new ...</a></li>';
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
	/* Generate delay dropdown content */
	$('.generated-delay').remove();
	$.each(gDelayObj, function(i, e) {
		var $optSelected = (gDelayObj[i] == gMediaObj[gSelFileIndex].delay) ? " SELECTED" : "";
		$('#select-delay-a').append('<option class="generated-delay" value="' + e + '"' + $optSelected + '>Delay: ' + e + ' seconds</option>')
		$('#select-delay-b').append('<option class="generated-delay" value="' + e + '"' + $optSelected + '>Delay: ' + e + ' seconds</option>')
	});
	$('#select-delay-a').selectmenu('refresh');
	$('#select-delay-b').selectmenu('refresh');
}

/* Set Object to local storage */
function saveToStorage() {
	localStorage.setItem("gMediaObjects", JSON.stringify(gMediaObj));
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
	else if (scale == "sec") {
		return ((nTime * 10) % 600) / 10; // Got floating num errors otherwise
	}
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

function volumeFade(from, to, duration) {
	var _from = {property: from};
	var _to = {property: to};
	$(_from).animate(_to, {
		duration: duration,
		step: function() {
			if (gMediaFile == undefined) return;
			gMediaFile.setVolume(this.property);
		},
		easing: "swing"
	});
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

/* File system */
function getFileSystem() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {	// on success
		root = fs.root;
		listDirectory(root);
	}, function() {});
}

/* List files in a directory*/
function listDirectory(dir) {
	if (!dir.isDirectory) alert("Not a directory, error");
	var dirReader = dir.createReader();
	currentDir = dir;
	var dirs = [];
	var files = [];
	// show loading animation
	dirReader.readEntries(function(entries) {
		for (var i = 0; i < entries.length; i++) {
			if (entries[i].isDirectory && entries[i].name[0] != ".") dirs.push(entries[i].name);
			else if (entries[i].isFile && entries[i].name[0] != ".") files.push(entries[i].name);
		}
		dirs.sort();
		files.sort();
		var dirsHtml = "";
		var filesHtml = "";
		for (var i = 0; i < dirs.length; i++) {
			dirsHtml += '<div class="filesystem folders">' + dirs[i] + '</div>\n';
		}
		for (var i = 0; i < files.length; i++) {
			filesHtml += '<div class="filesystem files">' + files[i] + '</div>\n';
		}
		var parentHtml = (root.fullPath != currentDir.fullPath) ? '<div class="filesystem folders parent">-1</div>\n' : '';
		$('#filesystem #fs').html(parentHtml + dirsHtml + filesHtml);
	});
	
}