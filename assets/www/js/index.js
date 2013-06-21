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


							
$(document).ready(function() { 
	/* Change event for file select */	
	$('#select_file').on('change', function() {
		currentObj = $('#select_file option:selected').val();
		updateUIBody();
	});
	
	/* Change event for delay select */
	$('#select_delay').on('change', function() {
		mediaObj[currentObj].delay = $('#select_delay option:selected').val();
	});	
	
	/* Click event to save position configuration */
	$('#pos-save').on('click', function() {
		
	
	});
	
	/* Click event to retrieve position data for popup */
	$('#list_pos').on('click', '.btn-pos-popup', function(e) {
		var positionobj = $(this).closest('a').data('posobj');
		var seconds = mediaObj[currentObj].positions[positionobj].position;
		var posName = mediaObj[currentObj].positions[positionobj].name;
		$('#pos-minute').val('0');
		$('#pos-second').val('0');
		$('#pos-name').val('');
		$('#pos-minute').val(dNiceTime_x(seconds, "min"));
		$('#pos-second').val(dNiceTime_x(seconds, "sec"));
		$('#pos-name').val(posName);
	});

	/* Click event for get current slider position */
	$('#pos-getcurrent').on('click', function() {
		$('#pos-minute').val(dNiceTime_x($('#pos-slider').val(), "min"));
		$('#pos-second').val(dNiceTime_x($('#pos-slider').val(), "sec"));
	});
	
	updateUITop()
	updateUIBody();
});

function updateUITop() {
	/* Generate file dropdown content */
	$.each(mediaObj, function(i, e) {
		var $optSelected = (i === currentObj) ? " SELECTED" : "";
		$tmpTitle = (e.title.trim() == "") ? "Untitled" : e.title;
		$('#select_file').append('<option class="" value="' + i + '"' + $optSelected + '>' + $tmpTitle + '</option>');
	});
	$('#select_file').selectmenu('refresh');	
}



/* Functions to convert time between functional and visual purposes */
function dNiceTime(nTime) {
	if (isNaN(nTime)) return "error";
	var min = dNiceTime_x(nTime, "min");
	var sec = dNiceTime_x(nTime, "sec");
	return min + ":" + ((sec < 10) ? "0" + sec : sec);
}

/* Helper function for dNiceTime() and where we just want minutes or seconds */
function dNiceTime_x(nTime, scale) {
	if (scale == "min") return Math.floor(nTime / 60);
	else if (scale == "sec") return nTime % 60;
}

function updateUIBody() {
	/* Clear generated elements */
	$('.generated').remove();
	$('#song_details').hide();
	
	if (currentObj >= 0) {
		/* Adjust slider max value */
		$('#pos-slider').val(0);
		$('#pos-slider').slider("refresh");
		$('#pos-slider').attr('max', mediaObj[currentObj].duration);

		/* Generate delay dropdown content */
		$.each(delayObj, function(i, e) {
			var $optSelected = (delayObj[i] == mediaObj[currentObj].delay) ? " SELECTED" : "";
			$('#select_delay').append('<option class="generated" value="' + e + '"' + $optSelected + '>' + e + ' seconds</option>')
		});
		$('#select_delay').selectmenu('refresh');
		
		/* Generate positions list for selected file */
		var $posHtmlPre = '<li class="generated"><a href=""><span class="ui-li-count">';
		var $posHtmlPost = 'class="btn-pos-popup" href="#popup-pos" data-rel="popup" data-transition="pop" data-position-to="window">Configure</a></li>';
		var $posHtmlEnd = '<li class="btn-pos-popup new generated" data-icon="plus"><a href="#popup-pos" data-rel="popup" data-transition="pop" data-position-to="window" style="text-align: center">Add new ...	</a></li>'
		$.each(mediaObj[currentObj].positions, function(i, e) {
			$tmpName = (e.name.trim() == "") ? "Untitled" : e.name;
			$('#list_pos').append($posHtmlPre + dNiceTime(e.position) + '</span>' + $tmpName + '</a><a data-posobj="' + i + '" ' + $posHtmlPost);
		});
		$('#list_pos').append($posHtmlEnd);									
		$('#list_pos').listview('refresh');
		$('#song_details').show('slow');
	}

}

var delayObj = [0, 3, 5, 10, 20];
var currentObj = 0;
var mediaObj = [{
	title: "Macarone",
	path: "/sdcard/music/a.mp3",
	delay: 10,
	duration: 320,
	positions: [{
		position: 0,
		name: "Play from beginning"
	},
	{
		position: 5,
		name: ""
	},
	{
		position: 220,
		name: "second position"
	}]
},
{
	title: "Song two",
	path: "/sdcard/music/a.mp3",
	delay: 2,
	duration: 400,
	positions: [{
		position: 0,
		name: "Play from beginning"
	},
	{
		position: 20,
		name: "whatever here"
	},
	{
		position: 40,
		name: "let it spin"
	}]
},
{
	title: "Song three",
	path: "/sdcard/music/a.mp3",
	delay: 4,
	duration: 160,
	positions: [{
		position: 0,
		name: "Play from beginning"
	},
	{
		position: 10,
		name: "around around"
	},
	{
		position: 70,
		name: "make some more"
	},
	{
		position: 130,
		name: "hit my jelly"
	}]
},
{
	title: "Add file ...",
	path: "",
	delay: 0,
	duration: 0,
	positions: []
}];





