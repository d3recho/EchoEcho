function onPause() {
	clearTimeout(gDelayTimer);
	clearTimeout(gPlaybackTimer);
	if (gMediaFile != undefined && gMediaStatus == Media.MEDIA_RUNNING) {
		volumeFade(1, 0, 100);
		setTimeout(function() { 	gMediaFile.pause();	}, 100);
	}
}


function savePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	if (selPositionIndex == -1) {
	/* Create new */
		// Do some animations
		var $height = $('#pos-add-new').height();
		$('#pos-add-new').animate({paddingTop: 30}, 
			{
				duration: 'fast',
				complete: function() {
					// Take care of business
					gMediaObj[gSelFileIndex].positions.push({
						'position': timeGetSeconds(), 
						'name': $('#pos-name').val()
					});
					saveToStorage();
					updateBodyUI();
					handleOrientationChange();
				}
			}
		);
	}
	/* Update current */
	else {
		gMediaObj[gSelFileIndex].positions[selPositionIndex].position = timeGetSeconds();
		gMediaObj[gSelFileIndex].positions[selPositionIndex].name = $('#pos-name').val();
		saveToStorage();
		updateBodyUI();
	}
}

// Button to get current audio position, with 10th of seconds
function setTimeAudioPosEntry() {
	gMediaFile.getCurrentPosition(function(position) {
		position = (position < 0) ? 0 : position;
		if (position < 0) position = 0;
		else position = Math.round(position * 10)/10;
		$('#pos-minute').val(timeDispStr_x(position, "min"));
		$('#pos-second').val(timeDispStr_x(position, "sec"));
	}, function() {});
}

function popupMediaFileChange() {
	updateTopUI();
}

function mediaFileChanged(index) {
	if (index != -1) {
		// Changed to another audio file
		$('#popup-mediaselect').popup('close');
		gSelFileIndex = (gMediaObj.length > 0) ? index : -1;
		// Show helping page for first file added
		if (localStorage.getItem("ee_prefs_lastfile") == undefined) {
			setTimeout(function() {
				$('#assist-1').popup("open", { history: false, transition: 'fade' });
			}, 1000);
		}
		localStorage.setItem("ee_prefs_lastfile", gSelFileIndex);
		mediaControl('stop', null);
		if (gMediaFile) {
			gMediaFile.release();
			gMediaFile = null;
		}
		initializePositionSlider();
		updateMediaFileText();
		updateBodyUI();
		handleOrientationChange();
	} 
	else {
		// New file selection 
		getFileSystem();
		$.mobile.changePage('#filesystem', {transition: "flip"});
		
/*	Old stuff
		navigator.camera.getPicture(onSuccessBrowseFile, onErrorBrowseFile, { 
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType: Camera.DestinationType.FILE_URI,
			mediaType: Camera.MediaType.ALLMEDIA
		});
*/
	}
}

function removePosition(index) {
	// Do some animations
	var $element = $('.btn-pos-popup').eq(index).parent();
	$element.animate({height: 0}, 
		{
			duration: 'fast', 
			complete: function() {
				// Take care of business
				$element.hide();
				gMediaObj[gSelFileIndex].positions.splice(index, 1);
				saveToStorage();
				updateBodyUI();				
				handleOrientationChange();
			}
		}
	);
}

function removeMediaEntry(index) {
	// Do some animations
	var $element = $('.file-delete').eq(index).parent();	
	var $animHeight = '+=' + $element.height() / 2;
	$element.animate({height: '0px'}, { duration: 'fast'});
	$('#popup-mediaselect-popup').animate({ top: $animHeight }, 
		{ 
			duration: 'fast', 
			queue: false, 
			complete: function() {
				// Take care of business
				$element.hide();
				gMediaObj.splice(index, 1);
				saveToStorage();
				if (gSelFileIndex == index) {
					gSelFileIndex = 0;
					mediaFileChanged(gSelFileIndex);
				} 
				// Maintaining right reference to current open media file
				else if (gSelFileIndex >= index) {
					gSelFileIndex--;
					localStorage.setItem("ee_prefs_lastfile", gSelFileIndex);
				}
			}
		}
	);
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
	if (selPositionIndex == -1) {
		$('#pos-delete').hide();
		$('#pos-cancel').addClass('ui-last-child');
	}
	else {
		$('#pos-delete').show();
		$('#pos-cancel').removeClass('ui-last-child');
		var seconds = gMediaObj[gSelFileIndex].positions[selPositionIndex].position;
		var posName = gMediaObj[gSelFileIndex].positions[selPositionIndex].name;
		$('#pos-minute').val(timeDispStr_x(seconds, "min"));
		$('#pos-second').val(timeDispStr_x(seconds, "sec"));
		$('#pos-name').val(posName);			
	}
}

function userSeekAtPosition() {
	console.log(gSliderPos + " " + $('#pos-slider').val());
	if (gSliderPos != $('#pos-slider').val()) {
		gSliderPos = $('#pos-slider').val();
		$('#song-position').text(timeDispStr(gSliderPos));
		gMediaFile.seekTo(gSliderPos * 1000);
	}
}

/* Media control logic, don't mess with this */
function mediaControl(action, pos) {
	if (gSelFileIndex == -1) return;
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
			else if (gMediaStatus == Media.MEDIA_RUNNING) {
				volumeFade(1, 0, 100);
				setTimeout(function() { 	gMediaFile.pause();	}, 100);
			}
			break;
		case 'stop':
			if (gMediaFile != undefined && gMediaStatus != undefined && gMediaStatus != Media.MEDIA_STOPPED) {
				volumeFade(1, 0, 100);
				setTimeout(function() { 	if (gMediaFile != undefined) gMediaFile.stop();	}, 100);
				updateUISlider(0);
			}
			break;
		case 'delayed':
			if (gMediaFile == undefined) loadMediaFile();
			else if (gMediaStatus != undefined && gMediaStatus != Media.MEDIA_STOPPED) {
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

function changeDelayValue(value) {
	gMediaObj[gSelFileIndex].delay = value;
	saveToStorage();
	generateDelayDropdown();
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
		volumeFade(0, 1, 500);	
		gMediaFile.seekTo(gInitSeekTo);
		gInitSeekTo = 0;
	}
	else if (status == Media.MEDIA_RUNNING) {
		volumeFade(0, 1, 500);	
	}
}

function onSuccessBrowseFile(src) {
	src = src.substring(src.lastIndexOf("/sdcard/"));		
	mMedia = new Media(src, onSuccessMedia, 
		function() {
			alert('Could not read file info: ' + src + '\nPerhaps returned path is not correct or file is not compatible.');
			updateMediaFileText();
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
			saveToStorage();
			mMedia.release();
			mMedia = null;
			mediaFileChanged(gMediaObj.length - 1);
			history.back();
			return false;
		}
	}, 10);
}

function onErrorBrowseFile(msg) {
	updateMediaFileText();
}

/* Event handler for orientation change */
function preHandleOrientationChange() {
	updateBodyUI();
	handleOrientationChange()
}

/* Orientation handling restructuring */
function handleOrientationChange() {
	if (window.matchMedia('(orientation: portrait)').matches) {
		updateOverthrow('portrait');
	}
	else {
		updateOverthrow('landscape');
	}
}

