var app = {
    initialize: function() {
        this.bindEvents();
    },
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
		
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};


var delayObj = [0, 3, 5, 10, 20];
var selFileIndex = 0;
var mediaObj;
							
$(document).ready(function() { 
	/* Prohibit manually entered number */
	$('input[type=number]').keypress(function() {
		event.preventDefault();
	});
	
	/* File change event for select */	
	$('#select_file').on('change', function() {
		selFileIndex = $('#select_file option:selected').val();
		updateBodyUI();
	});
	
	/* Position conf Delay change event for select */
	$('#select_delay').on('change', function() {
		mediaObj[selFileIndex].delay = $('#select_delay option:selected').val();
	});	

	/* Position slider change event */
	$('#pos-slider').on('change', function() {
		slidePositionSlider();
	});	
	
	/* Position conf Remove click event */
	$('#pos-delete-confirm').on('click', function() {
		removePositionObj();
	});
	
	/* Position conf Save click event */
	$('#pos-save').on('click', function() {
		savePositionObj();
	});
	
	/* Click event to retrieve position data for popup */
	$('#list_pos').on('click', '.btn-pos-popup', function() {
		loadPositionObj($(this));
	});

	/* Click event for get current slider position */
	$('#pos-getcurrent').on('click', function() {
		setTimeAudioPosEntry();
	});

	getObjFromStorage();
	updateTopUI();
	updateBodyUI();
	
});

function updateTopUI() {
	/* Generate file dropdown content */
	$.each(mediaObj, function(i, e) {
		var $optSelected = (i === selFileIndex) ? " SELECTED" : "";
		$tmpTitle = (e.title.trim() == "") ? "Untitled" : e.title + " (" + timeDispStr(e.duration) + ")";
		$('#select_file').append('<option class="" value="' + i + '"' + $optSelected + '>' + $tmpTitle + '</option>');
	});
	$('#select_file').append('<option class="" value="-1">Add new ...</option>');
	$('#select_file').selectmenu('refresh');	
}


function updateBodyUI() {
	/* Clear generated elements */
	$('.generated').remove();
	$('#div_mediacontrol').hide();
	$('#div_list').hide();
	
	if (mediaObj.length > 0 && selFileIndex >= 0) {
		/* Adjust slider max value */
		$('#pos-slider').val(0);
		$('#pos-slider').slider("refresh");
		$('#pos-slider').attr('max', mediaObj[selFileIndex].duration);

		/* Generate delay dropdown content */
		$.each(delayObj, function(i, e) {
			var $optSelected = (delayObj[i] == mediaObj[selFileIndex].delay) ? " SELECTED" : "";
			$('#select_delay').append('<option class="generated" value="' + e + '"' + $optSelected + '>' + e + ' seconds</option>')
		});
		$('#select_delay').selectmenu('refresh');
		
		/* Generate positions list for selected file */
		var $posHtmlPre = '<li class="generated"><a href=""><span class="ui-li-count">';
		var $posHtmlPost = 'class="btn-pos-popup" href="#popup-pos" data-rel="popup" data-transition="pop" data-position-to="window">Configure</a></li>';
		var $posHtmlEnd = '<li class="generated" data-icon="plus"><a href="#popup-pos" class="btn-pos-popup" data-posobj="-1" data-rel="popup" data-transition="pop" data-position-to="window" style="text-align: center">Add new ...	</a></li>'
		$.each(mediaObj[selFileIndex].positions, function(i, e) {
			$tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			$('#list_pos').append($posHtmlPre + timeDispStr(e.position) + '</span>' + $tmpName + '</a><a data-posobj="' + i + '" ' + $posHtmlPost);
		});
		$('#list_pos').append($posHtmlEnd);									
		$('#list_pos').listview('refresh');
		$('#div_mediacontrol').show();
		$('#div_list').show('slow');
	}

}

