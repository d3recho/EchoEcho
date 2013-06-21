

							
							$(document).ready(function() { 
								/* Generate file dropdown content */
								$.each(mediaObj, function(i, e) {
									var $optSelected = (i === currentObj) ? " SELECTED" : "";
									$('#select_file').append('<option value="' + e.id + '"' + $optSelected + '>' + e.title + '</option>');
								});
								
								/* Generate delay dropdown content */
								$.each(delayObj, function(i, e) {
									var $optSelected = (i === mediaObj[currentObj].delay) ? " SELECTED" : "";
									$('#select_delay').append('<option value="' + e + '"' + $optSelected + '>' + e + ' seconds</option>')
								});
								
								/* Generate positions list for selected file */								
								$.each(mediaObj[currentObj].positions, function(i, e) {
									//$('#list_pos li').first().clone().appendTo('#list_pos');
								});
								
								/* refresh menus*/
								$('#select_file').selectmenu('refresh');
								$('#select_delay').selectmenu('refresh');
								
							});






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
var currentObj = 1;
var mediaObj = [{
	title: "Song one",
	path: "/sdcard/music/a.mp3",
	delay: 1,
	duration: 320,
	positions: [{
		position: 5,
		name: "position one"
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





