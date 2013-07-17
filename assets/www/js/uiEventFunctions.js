function onPause() {
	gIsAppPaused = true;
	clearTimeout(gDelayTimer);
	clearTimeout(gPlaybackTimer);
	if (gMediaFile != undefined && gMediaStatus == Media.MEDIA_RUNNING) {
		volumeFade(1, 0, 100);
		setTimeout(function() { 
			gMediaFile.pause();	
		}, 100);
	}
}


function savePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	var tmpPosB = (timeGetSeconds('b') != 0 && timeGetSeconds('b') > timeGetSeconds('a')) ? timeGetSeconds('b') : '';
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
						'name': $('#pos-name').val(),
						'position': timeGetSeconds('a'), 
						'position_b': tmpPosB
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
		var tmpPosIdx = gMediaObj[gSelFileIndex].positions[selPositionIndex];
		tmpPosIdx.name = $('#pos-name').val();
		tmpPosIdx.position = timeGetSeconds('a');
		tmpPosIdx.position_b = tmpPosB;
		saveToStorage();
		updateBodyUI();
		handleOrientationChange();
	}
}

// Button to get current audio position, with 10th of seconds
function setTimeAudioPosEntry(index) {
	if (gMediaFile == undefined) return;
	gMediaFile.getCurrentPosition(function(position) {
		position = (position < 0) ? 0 : position;
		if (position < 0) position = 0;
		else position = Math.round(position * 10)/10;
		if (index == 'a') {
			$('#pos-minute').val(timeDispStr_x(position, "min"));
			$('#pos-second').val(timeDispStr_x(position, "sec"));
		}
		else if (index == 'b') {
			$('#pos-minute-b').val(timeDispStr_x(position, "min"));
			$('#pos-second-b').val(timeDispStr_x(position, "sec"));
		}
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
		//getFileSystem();
		cordova.exec(successMQListArtists, errorMQ, 'MediaQuery', 'listArtists', []);
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
	$('#pos-name').val('');		// reset
	$('#pos-minute').val('');	// reset
	$('#pos-second').val('');	// reset
	$('#pos-minute-b').val('');	// reset
	$('#pos-second-b').val('');	// reset
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
		var seconds_b = gMediaObj[gSelFileIndex].positions[selPositionIndex].position_b;
		var posName = gMediaObj[gSelFileIndex].positions[selPositionIndex].name;
		$('#pos-minute').val(timeDispStr_x(seconds, "min"));
		$('#pos-second').val(timeDispStr_x(seconds, "sec"));
		$('#pos-minute-b').val(timeDispStr_x(seconds_b, "min"));
		$('#pos-second-b').val(timeDispStr_x(seconds_b, "sec"));
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
function mediaControl(action, index) {
	gPositionIndex = index;
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
			if (gMediaFile == undefined) {
				gPlayTo = null;
				loadMediaFile();
			}
			else if (gMediaStatus == Media.MEDIA_RUNNING) {
				if (gInitSeekTo == 0) {
					gPlayTo = null;
					gMediaFile.stop();
					updateUISlider(0);
				}
			}
			else if (gMediaStatus == Media.MEDIA_PAUSED && gPositionIndex == undefined) {
				gPlayTo = null;
			}
			if (gPositionIndex == undefined) {
				$('#list-pos li, #pause').removeClass('pos-btn-active');
				$('#play').addClass('pos-btn-active');
			}
			gMediaFile.play();
			gPlaybackTimer = setInterval(function() {
				gMediaFile.getCurrentPosition(function(position) {					
					updateUISlider(Math.round(position));

					/* Repeat feature */
					if (gPlayTo != undefined && position >= gPlayTo) {
						if (gRepeatOn) {
							mediaControl('delayed', gPositionIndex); //Repeat
						}
						else {
							mediaControl('stop',  null);	//Stop playback
						}
					}
					else if (gPlayTo == undefined && position + 1 >= gMediaObj[gSelFileIndex].duration) {
						if (gRepeatOn) {
							mediaControl('delayed', null); //Repeat
						}
					}
					
				});
			}, 1000);
			break;
		case 'pause': 
			if (gMediaStatus == Media.MEDIA_PAUSED) {
				$('#pause').removeClass('pos-btn-active');
				mediaControl('play', gPositionIndex);
			}
			else if (gMediaStatus == Media.MEDIA_RUNNING) {
				$('#play').removeClass('pos-btn-active');
				$('#pause').addClass('pos-btn-active');
				volumeFade(1, 0, 100);
				setTimeout(function() { 
					gMediaFile.pause();	
				}, 100);
			}
			break;
		case 'stop':
			gPlayTo = null;
			if (gMediaFile != undefined && gMediaStatus != undefined && gMediaStatus != Media.MEDIA_STOPPED) {
				volumeFade(1, 0, 100);
				setTimeout(function() { 
					if (gMediaFile != undefined) gMediaFile.stop();	
				}, 100);
				updateUISlider(0);
			}
			break;
		case 'delayed':
			if (gMediaFile == undefined) loadMediaFile();
			else if (gMediaStatus != undefined && gMediaStatus != Media.MEDIA_STOPPED) {
				gMediaFile.stop();
				//gMediaFile.setVolume(0);	Not safe, at times volume will not be risen again....
			}
			gPlayTo = null;
			var pos = 0;
			var tmpPosB = 0;

			/* check if gPositionIndex is nothing, if so then positions should be at 0 */
			if (gPositionIndex != undefined) {
				pos = gMediaObj[gSelFileIndex].positions[gPositionIndex].position;
				tmpPosB = gMediaObj[gSelFileIndex].positions[gPositionIndex].position_b;
				$('#list-pos li').eq(gPositionIndex).addClass('pos-btn-active');
			}
			
			var delay = gMediaObj[gSelFileIndex].delay;
			if (tmpPosB > 0) gPlayTo = tmpPosB;
			updateUISlider(pos);
			gInitSeekTo = (pos * 1000 == 0) ? 1 : pos * 1000;	// Keep gInitSeekTo > 0 for Repeat feature to be enabled
			if (delay > 0) {
				/* Delay before playback */
				var seconds = delay;
				$('#song-position').text(timeDispStr(seconds)).prepend("-");
				$('#song-position').addClass("delaying");
				gDelayTimer = setInterval(function() {
					if (seconds > 1) $('#song-position').text(timeDispStr(--seconds)).prepend("-");
					else {
						clearTimeout(gDelayTimer);
						$('#song-position').removeClass('delaying');
						updateUISlider(pos);						
						mediaControl('play', gPositionIndex);
					}
				}, 1000);
			} 
			else {
				mediaControl('play', gPositionIndex);
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
	debug('Media onError: ' + error.code);
	debug('Error message: ' + error.message);
}

/* Media status callback */
function onMediaStatus(status) {
	gMediaStatus = status
	$("#pos-slider").slider('enable');
	if (status == Media.MEDIA_STARTING) {
		gMediaFile.setVolume(0);
	}
	if (status == Media.MEDIA_STOPPED) {
		debug('Media status: Stopped');		
		if (gInitSeekTo == 0) {
			$('#list-pos li, #play, #pause').removeClass('pos-btn-active');
			$("#pos-slider").slider('disable'); 
			clearTimeout(gPlaybackTimer);
			if(!gRepeatOn) updateUISlider(0);
		}
	}
	else if (status == Media.MEDIA_RUNNING && gInitSeekTo > 0) {
		debug('Media status: InitSeekTo');
		volumeFade(0, 1, 500);	
		gMediaFile.seekTo(gInitSeekTo);
		gInitSeekTo = 0;
	}
	else if (status == Media.MEDIA_RUNNING) {
		debug('Media status: Running');
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
					'name': 'Play from beginning',
					'position': 0,
					'position_b': ''
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

function onSuccessMQFile(path, title, duration) {
			gMediaObj.push({
				'title': title,
				'path': path,
				'delay': 0,
				'duration': duration,
				'positions': [{
					'name': 'Play from beginning',
					'position': 0,
					'position_b': ''
				}]
			});
			saveToStorage();	
			mediaFileChanged(gMediaObj.length - 1);
			history.back();
			updateBodyUI();
			return false;
}

function onErrorBrowseFile(msg) {
	updateMediaFileText();
}

/* Event handler for orientation change */
function preHandleOrientationChange() {
	prefetchBodyHeight();
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

/* Media Query */
function successMQListArtists(result) {
	listMediaQuery(result, 'folders');
}

function successMQListSongsFromArtists(result) {
	listMediaQuery(result, 'files');
}

function errorMQ(msg) {
	debug('MediaQuery error: ' + msg);
}
