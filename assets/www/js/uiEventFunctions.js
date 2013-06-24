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
	console.log(selPositionIndex);
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

function slidePositionSlider() {
	$('#song-position').text(timeDispStr($('#pos-slider').val()));
}