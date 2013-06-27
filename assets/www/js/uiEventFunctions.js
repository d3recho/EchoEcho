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
	setObjToStorage();
	updateBodyUI();
}

function gMediaFileChanged() {
	playbackControl('stop');
	gSelFileIndex = $('#select-file option:selected').val();
	adjustPositionSlider();
	updateBodyUI();
}

function removePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	gMediaObj[gSelFileIndex].positions.splice(selPositionIndex, 1);
	setObjToStorage();
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
		mediaControl('seek', gSliderPos);
	}
}

/* Media control logic, don't mess with this */
function mediaControl(action, pos) {
	if ($('#song-position').hasClass('delaying')) {
		$('#song-position').removeClass('delaying');
		clearTimeout(gDelayTimer);
		updateUISlider(0);
		debug('cleared delaying');
		if (action != 'delayed') return;
	}
	if (action != 'seek') clearTimeout(gPlaybackTimer);
	debug(action + " " + pos);
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
			if (gMediaFile != undefined && gMediaStatus != Media.MEDIA_STOPPED) {
				gMediaFile.stop();
				updateUISlider(0);
			}
			break;
		case 'seek':
				gMediaFile.seekTo(pos * 1000);
			break;
		case 'delayed':
			if (gMediaFile == undefined) loadMediaFile();
			else if (gMediaStatus != Media.MEDIA_STOPPED) gMediaFile.stop();
			gMediaFile.seekTo(pos * 1000);
			updateUISlider(pos);
			var delay = gMediaObj[gSelFileIndex].delay;
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
						gMediaFile.seekTo(pos * 1000);
					}
				}, 1000);
			} 
			else mediaControl('play', null);
		break;
	}
}

