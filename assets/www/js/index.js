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


var delayObj = [0, 2, 3, 5, 10, 20];
var selFileIndex = 0;
var mediaObj;
var playbackTimer;
var delayTimer;
var sliderPos = 0;
var isPlayingBack = false;
var isPaused = false;
var dev_json_data = '[{"title":"Macarone","path":"/sdcard/music/a.mp3","delay":10,"duration":320,"positions":[{"position":0,"name":"Play from beginning"},{"position":5,"name":""},{"position":220,"name":"second position"}]},{"title":"Song two","path":"/sdcard/music/a.mp3","delay":2,"duration":400,"positions":[{"position":0,"name":"Play from beginning"},{"position":20,"name":"whatever here"},{"position":40,"name":"let it spin"}]},{"title":"Song three","path":"/sdcard/music/a.mp3","delay":4,"duration":160,"positions":[{"position":0,"name":"Play from beginning"},{"position":10,"name":"around around"},{"position":70,"name":"make some more"},{"position":130,"name":"hit my jelly"}]}]';							

$(document).ready(function() { 
	/* Prohibit manually entered number */
	$('input[type=number]').keypress(function() {
		event.preventDefault();
	});
	
	/* File change event for select */	
	$('#select_file').on('change', function() {
		mediaFileChanged();
	});
	
	/* Position conf Delay change event for select */
	$('#select_delay').on('change', function() {
		mediaObj[selFileIndex].delay = $('#select_delay option:selected').val();
	});	

	/* Position slider change event */
	$('#pos-slider').on('change', function() {
		slidePositionChanged();
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
	$('#list_pos')
		.on('click', '.btn-pos-popup', function() {	
			loadPositionObj($(this));
		})
		.on('click', '.btn-play-pos', function() {
			playFromPosition($(this));
		});

	/* Click event for get current slider position */
	$('#pos-getcurrent').on('click', function() {
		setTimeAudioPosEntry();
	});

	/* Play button click event */
	$('#play').on('click', function() {
		playbackControl('play');
	});

	/* Pause button click event */
	$('#pause').on('click', function() {
		playbackControl('pause');
	});

	/* Stop button click event */
	$('#stop').on('click', function() {
		playbackControl('stop');
	});
	
	/* Load development default json data */
	$('#load-dev-json-data').on('click', function() {
		localStorage.setItem("mediaObjects", dev_json_data);
		getObjFromStorage();
		updateTopUI();
		updateBodyUI();
		alert('Set.');
	});			

	getObjFromStorage();
	updateTopUI();
	updateBodyUI();
	
});

