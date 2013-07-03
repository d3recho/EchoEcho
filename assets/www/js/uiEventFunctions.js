function savePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	if (selPositionIndex == -1) {
	/* Create new */
		gMediaObj[gSelFileIndex].positions.push({
			'position': timeGetSeconds(), 
			'name': $('#pos-name').val()
		});
	}
	/* Update current */
	else {
		gMediaObj[gSelFileIndex].positions[selPositionIndex].position = timeGetSeconds();
		gMediaObj[gSelFileIndex].positions[selPositionIndex].name = $('#pos-name').val();
	}
	saveToStorage();
	updateBodyUI();
}

function mediaEntryChanged(that) {
	if ($('#select-file option:selected').val() != -1) {
		// Changed to another audio file
		gSelFileIndex = $('#select-file option:selected').val();
		mediaControl('stop', null);
		if (gMediaFile) {
			gMediaFile.release();
			gMediaFile = null;
		}
		initializePositionSlider();
		updateBodyUI();
	} 
	else {
		// New file selection 
		navigator.camera.getPicture(onSuccessBrowseFile, onErrorBrowseFile, { 
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType: Camera.DestinationType.FILE_URI,
			mediaType: Camera.MediaType.ALLMEDIA
		});
	}
}

function removePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	gMediaObj[gSelFileIndex].positions.splice(selPositionIndex, 1);
	saveToStorage();
	updateBodyUI();
}

function loadPositionObj(that) {
	/* set values to fields in popup */
	$('#pos-minute').val('0');	// reset
	$('#pos-second').val('0');	// reset
	$('#pos-name').val('');		// reset
	/* Gets id for current position entry */
	var selPositionIndex = that.data('posobj');
	$('#popup-pos').data('posobj', selPositionIndex);
	/* Hides or shows delete button */
	if (selPositionIndex == -1) $('#pos-delete').hide();
	else {
		$('#pos-delete').show();
		var seconds = gMediaObj[gSelFileIndex].positions[selPositionIndex].position;
		var posName = gMediaObj[gSelFileIndex].positions[selPositionIndex].name;
		$('#pos-minute').val(timeDispStr_x(seconds, "min"));
		$('#pos-second').val(timeDispStr_x(seconds, "sec"));
		$('#pos-name').val(posName);			
	}
}

function userSeekAtPosition() {
	if (gSliderPos != $('#pos-slider').val()) {
		gSliderPos = $('#pos-slider').val();
		$('#song-position').text(timeDispStr(gSliderPos));
		gMediaFile.seekTo(gSliderPos * 1000);
	}
}

/* Media control logic, don't mess with this */
function mediaControl(action, pos) {
	debug('action:' + action);
	if ($('#song-position').hasClass('delaying')) {
		$('#song-position').removeClass('delaying');
		clearTimeout(gDelayTimer);
		updateUISlider(0);
		if (action != 'delayed') return;
	}
	clearTimeout(gPlaybackTimer);
	switch(action) {
		case 'play': 
			if (gMediaFile == undefined) loadMediaFile();
			else if (gMediaStatus == Media.MEDIA_RUNNING) {
				gMediaFile.stop();
				updateUISlider(0);
			}	
			gMediaFile.play();
			gPlaybackTimer = setInterval(function() {
				gMediaFile.getCurrentPosition(function(position) {
					updateUISlider(Math.round(position));
				});
			}, 1000);
			break;
		case 'pause': 
			if (gMediaStatus == Media.MEDIA_PAUSED) mediaControl('play', null);
			else if (gMediaStatus == Media.MEDIA_RUNNING) gMediaFile.pause();
			break;
		case 'stop':
			if (gMediaFile != undefined && gMediaStatus != undefined && gMediaStatus != Media.MEDIA_STOPPED) {
				gMediaFile.stop();
				updateUISlider(0);
			}
			break;
		case 'delayed':
			if (gMediaFile == undefined) loadMediaFile();
			else if (gMediaStatus != Media.MEDIA_STOPPED) {
				gMediaFile.stop();
			}
			updateUISlider(pos);
			var delay = gMediaObj[gSelFileIndex].delay;
			gInitSeekTo = pos * 1000;
			if (delay > 0) {
				/* Delay before playback */
				$('#song-position').text(timeDispStr(delay)).prepend("-");
				$('#song-position').addClass("delaying");
				gDelayTimer = setInterval(function() {
					var tmpStr = $('#song-position').text();
					var seconds = Number(tmpStr.substr(tmpStr.indexOf(":") + 1));
					if (seconds > 1) $('#song-position').text(timeDispStr(seconds - 1)).prepend("-");
					else {
						clearTimeout(gDelayTimer);
						$('#song-position').removeClass('delaying');
						updateUISlider(pos);						
						mediaControl('play', null);
					}
				}, 1000);
			} 
			else {
				mediaControl('play', null);
			}
		break;
	}
}

function changeDelayValue() {
	gMediaObj[gSelFileIndex].delay = $('#select-delay option:selected').val();
	saveToStorage();
}

/*  Media onSuccess Callback callback */
function onSuccessMedia() {
}

/* Media onError Callback callback  */
function onErrorMedia(error) {
	alert('error code: '    + error.code    + '\n' + 
		  'error message: ' + error.message + '\n');
}

/* Media status callback */
function onMediaStatus(status) {
	gMediaStatus = status
	$("#pos-slider").slider('enable');
	if (status == Media.MEDIA_STOPPED) {
		$("#pos-slider").slider('disable'); 
		updateUISlider(0);
	}
	else if (status == Media.MEDIA_RUNNING && gInitSeekTo > 0) {
		gMediaFile.seekTo(gInitSeekTo);
		gInitSeekTo = 0;
	}
}

function onSuccessBrowseFile(src) {
	src = src.substring(src.lastIndexOf("/sdcard/"));		
	mMedia = new Media(src, onSuccessMedia, 
		function() {
			alert('Could not read file info: ' + src + '\nPerhaps returned path is not correct or file is not compatible.');
		}
	);
	mMedia.play();
	var counter = 0;
	var timerDur = setInterval(function() {
		if (counter++ > 20) {
			clearInterval(timerDur);
		}
		var dur = mMedia.getDuration();
		// Assumes all good if duration is received
		if (dur > 0) {
			mMedia.pause();
			clearInterval(timerDur);		
			var tmpTitle = src.substring(src.lastIndexOf("/") + 1, src.lastIndexOf("."));
			gMediaObj.push({
				'title': tmpTitle,
				'path': src,
				'delay': 0,
				'duration': Math.ceil(dur),
				'positions': [{
					'position': 0,
					'name': 'Play from beginning'
				}]
			});
			gSelFileIndex = gMediaObj.length - 1;
			saveToStorage();
			mMedia.release();
			mMedia = null;
			if (gMediaFile) {
				gMediaFile.release();
				gMediaFile = null;
			}
			loadMediaFile();
			updateTopUI();
			updateBodyUI();			
		}
	}, 10);
}

function onErrorBrowseFile(msg) {
	updateTopUI();
}
