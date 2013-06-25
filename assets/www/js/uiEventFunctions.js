function savePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	if (selPositionIndex == -1) {
	/* Create new */
		mediaObj[selFileIndex].positions.push({
			'position': timeGetSeconds(), 
			'name': $('#pos-name').val()
		});
	}
	/* Update current */
	else {
		mediaObj[selFileIndex].positions[selPositionIndex].position = timeGetSeconds();
		mediaObj[selFileIndex].positions[selPositionIndex].name = $('#pos-name').val();
	}
	setObjToStorage();
	updateBodyUI();
}

function mediaFileChanged() {
	playbackControl('stop');
	selFileIndex = $('#select_file option:selected').val();
	adjustPositionSlider();
	updateBodyUI();
}

function removePositionObj() {
	var selPositionIndex = $('#popup-pos').data('posobj');
	mediaObj[selFileIndex].positions.splice(selPositionIndex, 1);
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
		var seconds = mediaObj[selFileIndex].positions[selPositionIndex].position;
		var posName = mediaObj[selFileIndex].positions[selPositionIndex].name;
		$('#pos-minute').val(timeDispStr_x(seconds, "min"));
		$('#pos-second').val(timeDispStr_x(seconds, "sec"));
		$('#pos-name').val(posName);			
	}
}

function playFromPosition(that) {
	playbackControl('stop');
	updateSlider(that.data('pos'));
	delayBeforePlayback();	
}

function delayBeforePlayback() {
	// check if delay is more than 0
	var delay = mediaObj[selFileIndex].delay;
	if (delay > 0) {
		$('#song-position').text(timeDispStr(delay)).prepend("-");
		$('#song-position').addClass("delaying");
		delayTimer = setInterval(function() {
			delayCountdown();
		}, 1000);
	}
}

function slidePositionChanged() {
	sliderPos = $('#pos-slider').val();
	$('#song-position').text(timeDispStr(sliderPos));
}
/* Media control logic, don't mess with this */
function playbackControl(action) {
	clearTimeout(playbackTimer);
	if ($('#song-position').hasClass('delaying')) {
		$('#song-position').removeClass('delaying');
		clearTimeout(delayTimer);
		action = 'stop';
	}
	switch(action) {
		case 'play': 
			if (!isPaused && isPlayingBack) {
				updateSlider(0);
			}
			isPaused = false;
			isPlayingBack = true;
			playbackTimer = setInterval(function() {
				updateSlider();
			}, 1000);
			break;
		case 'pause': 
			if (isPaused) {
				playbackControl('play');
			} 
			else if (isPlayingBack) {
				isPaused = true;
				isPlayingBack = false;
			}
			break;
		case 'stop':
			isPaused = false;
			isPlayingBack = false;
			updateSlider(0);
			break;
	}
}