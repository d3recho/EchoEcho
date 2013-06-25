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
var dev_json_data = '[{"title":"Macarone","path":"/sdcard/music/a.mp3","delay":10,"duration":320,"positions":[{"position":0,"name":"Play from beginning"},{"position":5,"name":""},{"position":220,"name":"second position"}]},{"title":"Song two","path":"/sdcard/music/a.mp3","delay":2,"duration":400,"positions":[{"position":0,"name":"Play from beginning"},{"position":20,"name":"whatever here"},{"position":40,"name":"let it spin"}]},{"title":"Song three","path":"/sdcard/music/a.mp3","delay":3,"duration":160,"positions":[{"position":0,"name":"Play from beginning"},{"position":10,"name":"around around"},{"position":70,"name":"make some more"},{"position":130,"name":"hit my jelly"}]}]';							

$(document).ready(function() { 
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
	$('#pos-delete-confirm').on('tap', function() {
		removePositionObj();
	});
	
	/* Position conf Save click event */
	$('#pos-save').on('tap', function() {
		savePositionObj();
	});
	
	/* Click event to retrieve position data for popup */
	$('#list_pos')
		.on('tap', '.btn-pos-popup', function() {	
			loadPositionObj($(this));
		})
		.on('tap', '.btn-play-pos', function() {
			playFromPosition($(this));
		});

	/* Click event for get current slider position */
	$('#pos-getcurrent').on('click', function() {
		setTimeAudioPosEntry();
	});

	/* Play button click event */
	$('#play').on('tap', function() {
		playbackControl('play');
	});

	/* Pause button click event */
	$('#pause').on('tap', function() {
		playbackControl('pause');
	});

	/* Stop button click event */
	$('#stop').on('tap', function() {
		playbackControl('stop');
	});
	
	/* Load development default json data */
	$('#load-dev-json-data').on('tap', function() {
		localStorage.setItem("mediaObjects", dev_json_data);
		getObjFromStorage();
		updateTopUI();
		updateBodyUI();
		alert('Set.');
	});			

$.event.special.tap = {
  // Abort tap if touch lasts longer than half a second
  timeThreshold: 500,
  setup: function() {
    var self = this,
      $self = $(self);

    // Bind touch start
    $self.on('touchstart', function(startEvent) {
      // Save the target element of the start event
      var target = startEvent.target,
        timeout;

      function removeTapHandler() {
        clearTimeout(timeout);
        $self.off('touchend', tapHandler);
      };

      function tapHandler(endEvent) {
        removeTapHandler();

        // When the touch end event fires, check if the target of the
        // touch end is the same as the target of the start, and if
        // so, fire a click.
        if (target == endEvent.target) {
          $.event.simulate('tap', self, endEvent);
        }
      };

      // Remove the tap handler if the timeout expires
      timeout = setTimeout(removeTapHandler, $.event.special.tap.timeThreshold);

      // When a touch starts, bind a touch end handler
      $self.on('touchend', tapHandler);
    });
  }
};
	
	
	
	getObjFromStorage();
	updateTopUI();
	updateBodyUI();
	
});

