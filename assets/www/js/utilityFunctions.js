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
	var _lastMedia = localStorage.getItem("ee_prefs_lastfile");
	gMediaObj = localStorage.getItem("ee_mediaobjects");
	gMediaObj = JSON.parse(gMediaObj);
	if (gMediaObj == undefined) {
		gMediaObj = [];
		setTimeout(function() {
			$('#about').popup("open", { history: false, transition: 'fade' });		// Show about page
		}, 1000);
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
	$('.delay-repeat').hide();
	$('#div-list').hide();
	$('#div-list').css('padding-top', '');
	$('#div-list').height('');
	$('#div-list').css('background-color', '');
	if (gMediaObj.length > 0 && gSelFileIndex != -1) {	
		$('.delay-repeat').show();
		generateDelayDropdown();
		/* Generate positions list for selected file */
		$.each(gMediaObj[gSelFileIndex].positions, function(i, e) {
			var $tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			var $tmpEndTime = (e.position_b > 0) ? '<br><span class="pos-stop-time">' + timeDispStr(e.position_b) + '</span>': '';
			$('#list-pos').append('<li class="generated"><a href="" class="btn-play-pos" data-pos="' + e.position + '" data-posobj="' + i + '">' 
				+ $tmpName + '<span class="ui-li-count"><span class="pos-start-time">' + timeDispStr(e.position) + '</span>' + $tmpEndTime + '</span>'
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
	localStorage.setItem("ee_mediaobjects", JSON.stringify(gMediaObj));
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
function timeGetSeconds(index) {
	var min = 0;
	var sec = 0;
	if (index == 'a') {
		min = Number($('#pos-minute').val());
		sec = Number($('#pos-second').val());
	}
	else if (index == 'b') {
		min = Number($('#pos-minute-b').val());
		sec = Number($('#pos-second-b').val());
	}
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
			dirsHtml += '<div class="filesystem folders" data-source="fs">' + dirs[i] + '</div>\n';
		}
		for (var i = 0; i < files.length; i++) {
			filesHtml += '<div class="filesystem files" data-source="fs">' + files[i] + '</div>\n';
		}
		var parentHtml = (root.fullPath != currentDir.fullPath) ? '<div class="filesystem folders parent" data-source="fs">-1</div>\n' : '';
		$('#filesystem #fs').html(parentHtml + dirsHtml + filesHtml);
	});
	
}

/* List files using Media Query */
function listMediaQuery(json, type) {
	var items = [];
	var html = '';
	for (var i = 0; i < json.length; i++) {
		if (type == 'folders') {
			var name = (json[i].name != "") ? json[i].name : '(Unknown)';
			html += '<div class="filesystem folders" data-source="mq" data-index="' + json[i].id + '">' + name + '</div>\n';
		}
		else if (type == 'files') {
			var title = (json[i].title != "") ? json[i].title : '(Unknown)';
			var duration = Math.ceil(json[i].duration / 1000);
			html += '<div class="filesystem files" data-source="mq" data-path="' + json[i].path + '" data-title="' + title + '" data-duration="' + duration + '">' + title + ' [' + timeDispStr(duration) + ']</div>\n';		
		}
	}
	var parentHtml = (type == 'files') ? '<div class="filesystem folders parent" data-source="mq" data-index="-1"></div>\n' : '';
	$('#filesystem #fs').html(parentHtml + html);
}

function updateOverthrow(orientation) {
	if (orientation == 'portrait') {
		$('#div-delay-repeat-a').hide();
		$('#div-delay-repeat-b').show();
		var heightHeader = $('#ui-header').height();
		var heightLBlock = $('#ui-block-left').height();
		var heightDelay = $('#div-delay-repeat-b').height();
		var heightList = $('#div-list').height();
		var num = gHeightMain - heightLBlock - heightHeader - heightDelay - 55;
		if (heightList < num) {		
		}
		else {
			$('.overthrow-enabled #div-list').css('margin-bottom', 5 + 'px');
			$('.overthrow-enabled #div-list').css('padding-top', 5 + 'px');
			$('.overthrow-enabled #div-list').css('height', num - 20 + 'px');
			$('.overthrow-enabled #div-list').css('background', '#222');
			$('.overthrow-enabled #div-list').css('border-radius', '2px');
		}	
	} 
	else if (orientation == 'landscape') {
		$('#div-delay-repeat-b').hide();
		$('#div-delay-repeat-a').show();
		var heightHeader = $('#ui-header').height();
		var heightList = $('#div-list').height();
		var num = gHeightMain - heightHeader - 5;
		if (heightList < num) {		
		}
		else {
			$('.overthrow-enabled #div-list').css('padding-top', 5 + 'px');
			$('.overthrow-enabled #div-list').css('height', num - 20 + 'px');
			$('.overthrow-enabled #div-list').css('background', '#222');
			$('.overthrow-enabled #div-list').css('border-radius', '2px');
		}			
	}
}

function prefetchBodyHeight() {
	gHeightMain = $('body').height() - 2;
}

