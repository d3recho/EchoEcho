var gDelayObj = [0, 2, 3, 5, 10, 20];
var gSelFileIndex = -1;
var gMediaObj;
var gPlaybackTimer;
var gDelayTimer;
var gDebugTimer;
var gSliderPos = 0;
var gMediaStatus;
var gMediaFile = null;
var mMedia; 
var gInitSeekTo = 0;	// when audio positioned start is used before file is loaded, triggered by callback
var isUserTouchingSlider = false;
var root = null; 		// File System root variable
var currentDir = null; // Current DirectoryEntry listed

var gEnableConsole = false;	// my debugging console window
var dev_json_data = '[{"title":"Macarone","path":"/sdcard/Music/Radiohead - In Rainbows/09 - Radiohead - Jigsaw Falling Into Place.MP3","delay":3,"duration":18,"positions":[{"position":0,"name":"Play from beginning"},{"position":5,"name":""},{"position":220,"name":"second position"},{"position":0,"name":"Play from beginning"},{"position":5,"name":""},{"position":220,"name":"second position"}]},{"title":"Song two","path":"/sdcard/music/a.mp3","delay":2,"duration":400,"positions":[{"position":0,"name":"Play from beginning"},{"position":20,"name":"whatever here"},{"position":40,"name":"let it spin"}]},{"title":"Song three","path":"/sdcard/music/a.mp3","delay":3,"duration":160,"positions":[{"position":0,"name":"Play from beginning"},{"position":10,"name":"around around"},{"position":70,"name":"make some more"},{"position":130,"name":"hit my jelly"}]}]';

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
		document.addEventListener("pause", onPause, false);
    },
    receivedEvent: function(id) {
        //console.log('Received Event: ' + id);
    }
};

$(document).ready(function() { 
	
	/* About popup*/
	$('#ui-icon-about').on('tap', function() {
		$('#about').popup("open", {
				overlayTheme: 'a',
				transition: 'fade'
		});
		return false;
	});

	/* Change media file button tap */	
	$('#select-file').on('tap', function() {
		popupMediaFileChange();
	});
	
	/* Media file changed event  */	
	$('#popup-mediaselect')
		.on('tap', '.mediafile', function() {
			mediaFileChanged($(this).data('index'));
			return false;
		})
		.on('tap', '.file-delete', function() {
			if (confirm("Are you sure you wish to delete this entry?")) {
				removeMediaEntry($(this).data('index'));
			}
		});
	
	/* Position config Delay change event for select */
	$('#select-delay-a, #select-delay-b').on('change', function() {
		changeDelayValue($(this).val());
	});	
	
	/* Slider Position change event */
	$('#pos-slider')
		.on('slidestart', function() {
			console.log('WHAAT');
			isUserTouchingSlider = true;
			userSeekAtPosition();
			$('#pos-slider').on('change', function() {
				userSeekAtPosition();
			});
		})
		.on('slidestop', function() {
			console.log('WHOOOT');
			isUserTouchingSlider = false;
			$('#pos-slider').off('change');
		});

	/* Remove position tap event */
	$('#pos-delete').on('tap', function() {
		if (confirm("Are you sure you wish to delete this entry?")) {
			$('#popup-pos').popup('close');
			removePosition($('#popup-pos').data('posobj'));
		}
	});
	
	/* Save Position config tap event */
	$('#pos-save').on('tap', function() {
		savePositionObj();
	});
	
	/* tap event to retrieve position data for popup */
	$('#list-pos')
		.on('tap', '.btn-pos-popup', function() {	
			$('#popup-pos').popup("open", {
				overlayTheme: 'a',
				transition: 'flow'
			});
			loadPositionObj($(this));
			return false;
		})
		.on('tap', '.btn-play-pos', function() {
			mediaControl('delayed', $(this).data('pos'));
		});

	/* tap event for get current slider position */
	$('#pos-getcurrent').on('tap', function() {
		setTimeAudioPosEntry();
	});

	/* Play button tap event */
	$('#play').on('tap', function() {
		mediaControl('play', null);
	});

	/* Pause button tap event */
	$('#pause').on('tap', function() {
		mediaControl('pause', null);
	});
	
	/* Stop button tap event */
	$('#stop').on('tap', function() {
		mediaControl('stop', null);
	});
	
	/* Load development default json data */
	$('#load-dev-json-data').on('tap', function() {
		localStorage.setItem("ee_mediaobjects", dev_json_data);
		gSelFileIndex = -1;
		localStorage.removeItem("ee_prefs_lastfile");
//		localStorage.removeItem("ee_mediaobjects");
		loadFromStorage();
		updateMediaFileText();
		updateBodyUI();
	});			

	/* Show current json data */
	$('#load-data').on('tap', function() {
		
		$('#data').hide('fast').html("<pre>" + syntaxHighlight(JSON.parse(localStorage.getItem("ee_mediaobjects"))) + "</pre>").show('fast');
	});
	
	/* Debug related */
	$('#debug-console').on('tap', function() {
		clearTimeout(gDebugTimer);
	});

	
	/* tap on a Folder */
	$('#fs').on('tap', '.folders', function() {
		if ($(this).text() == '-1') {
			currentDir.getParent(function(dir) {
				listDirectory(dir);
			}, function() {
				alert('Already in root folder');
			});		
		}
		else {
			currentDir.getDirectory($(this).text(), {create: false}, function(dir) {
				listDirectory(dir);
			});
		}
		return false;
	});

	/* tap on a File */
	$('#fs').on('tap', '.files', function() {
		onSuccessBrowseFile(currentDir.fullPath + "/" + $(this).text());
		$('#filesystem').dialog('close');
		return false;
	});
	
	setTimeout(function() {
		loadFromStorage();
		updateBodyUI();
		$('body').show();
		//updateOverthrow();		
		window.matchMedia("(orientation: portrait)").addListener(preHandleOrientationChange);
		handleOrientationChange();
	}, 50);
		
});

