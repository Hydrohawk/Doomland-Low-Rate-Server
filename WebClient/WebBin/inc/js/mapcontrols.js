var MapControls = function(){
	var mainMap = '';
	var positionText = '';


	function sliderIniti(selector){
		var values = [ 0, 1000 ]
		$( selector ).slider({
			range: true,
			min: values[0],
			max: values[1],
			values: values,
			slide: function( event, ui ) {
				// start range
				mainMap.settings.timeStart = (ui.values[ 0 ] / values[1]) * ECO.MINIMAP.serverTime;
				updateText();

				// end reang
				mainMap.settings.timeEnd = (ui.values[ 1 ] / values[1]) * ECO.MINIMAP.serverTime;
				updateText()
			}
		});
	}

	var secondsToString = function(seconds, br) {
		var date = new Date(null);
		date.setSeconds(seconds);

		try {
			date = date.toISOString().substr(11,5);
		} catch(e){
			date = '';
		}

		if (br == 'br') {
			return "Day " + Math.ceil(seconds / 86400) + "<br>" + date;
		} else {
			return "Day " + Math.ceil(seconds / 86400) + ", " + date;
		}
	}

	var updateText = function() {
		$("#range-controls-time-1").html(secondsToString(mainMap.settings.timeStart, 'br'));
		$("#range-controls-time-2").html(secondsToString(mainMap.settings.timeEnd, 'br'));
		$("#speed-button").html(mainMap.settings.playSpeed + "<br>days/sec");
	}


	this.bindEvents = function(){
		mainMap = document.getElementById("main-map");

		positionText = document.getElementById("map-position-text");
		infoText = document.getElementById("map-info-text");


		$(window).load(function() {
		//	$('.ui-slider-handle:first').css({'margin-left': '0'})
		//	$('.ui-slider-handle:last').css({'margin-left': '-34px'})
		});

		sliderIniti("#slider-range");

		$("#speed-button").click(function() {
			if ($('#button1').css('display') == 'none' && $('#map-play-speed').css('display') == 'block') {
				$("#district-control-draw , #district-control-erase , #map-draw-size").show();
			}else{
				$("#district-control-draw , #district-control-erase , #map-draw-size").hide();
			}
			$('#map-play-speed').fadeToggle();
		});

		$("#map-play-speed").on('input', function () {
			mainMap.settings.playSpeed = (this.value / this.max).toFixed(2);
			updateText();
		});

		$("#button1").click(function() {
			$('#map-play-speed').hide();
			$('#map-draw-size').fadeToggle();
		});

		$("#map-draw-size").on('input', function () {
			ECO.MINIMAP.drawSize = this.value;
			updateText();
		});

		$(".map-layer-select").on('change', function () {
			ECO.MINIMAP.setLayer(this.value, mainMap);
		});

		$("#map-toggle-2d").click(function () {
			if($(this).data('type') == 2){
				$(this).val('3D');
				$(this).data('type',3);
			}else if($(this).data('type') == 3){
				$(this).val('2D');
				$(this).data('type',2);
			}
			mainMap.toggle3D();
		});

		$("#map-toggle-play").click(function () {
			var newState = ! $(this).data('type');
			$(this).data('type', newState);
			$(this).html(newState?'<i class="fa fa-play" aria-hidden="true"></i>':'<i class="fa fa-pause" aria-hidden="true"></i>');
			mainMap.settings.pause = newState;
		});


		mainMap.OnTimeUpdated = function(seconds){
			updateText();
			$("#map-progress-bar").val(seconds/ECO.MINIMAP.serverTime);
			$('.progress-day').html(secondsToString(mainMap.settings.currentTime));
		};
		if(infoText) {
			mainMap.OnInfoUpdated = function(text) {
				infoText.innerText = text;
			}
		}

		mainMap.OnPositionUpdated = function(pos) {
			positionText.innerText = pos.x + ", " + pos.y;
		};

		$(document).on('click', '.fancy-add-map', function(){

			$("#map-control-wrapper").show();
			$("#main-map").show();


			var view = document.getElementById("main-map");

			if(view.settings === undefined) {
				view.mapdata = document.getElementById("map-data");
				ECO.MINIMAP.addView(view);
				ECO.MINIMAP.fillLayerSelects();
			}

			$(this).hide();

			//composer.fadeIn();
			$('.remove-map').css({'display': 'inline-block', 'margin-right': '17px'}).fadeIn();

		})

		$(document).on('click', '.fancy-add-district', function(){

			$("#map-control-wrapper").show();
			$("#main-map").show();
			$("#district-control-draw").show();
			$("#district-control-erase").show();
			$(".map-layer-main").hide();
			$(".progress-day").hide();
			$(".map-tooltip").css('top','10px');
			$("#map-draw-size").css('left','239px');
			$(".progress-day").hide();
			$("#speed-button").hide();
			$(".range-controls-wrapper").hide();
			$(".play-button-wrapper").hide();



			var view = document.getElementById("main-map");

			if(view.settings === undefined) {
				view.mapdata = document.getElementById("map-data");
				ECO.MINIMAP.addView(view);
				ECO.MINIMAP.fillLayerSelects();
			}

			$(this).attr("class", "eco-button fancy-remove-district").attr("value", "Remove Districts");
			$(".district-controls-wrapper").show();
			$(".fancy-add-map").hide();

			//composer.fadeIn();
			$('.remove-map').css({'display': 'inline-block', 'margin-right': '17px'}).fadeIn();


			menuToggle = 'menu2';
			showBtn = 'button2';
			hideBtn = 'button1';
			ECO.MINIMAP.drawZone = true;
			$('.map-tooltip').css('display', 'block');
			$("#district-control-erase").show();
			$("#district-control-draw").hide();
			document.getElementById(hideBtn).style.display = 'none';
  			document.getElementById(showBtn).style.display = '';
			$('#map-play-speed').hide();
			$('#map-draw-size').fadeToggle();

			// DISTRICTS NOTES -- when the server provides existing district info we should do something similar to this
			// for each existing district (also when adding new districts)
			// also run ECO.MINIMAP.SetZone(zoneString);
			var districts = $('.district-item');
			for(var i = 0; i < districts.length; i++) {
				var district = districts[i];
				var id = districts[i].getAttribute("data-id");
				var color = $(district).css("background-color");
				ECO.MINIMAP.setDistrictColor(id, color);
			}

		})

		$(document).on('click', '.fancy-remove-district', function(){
			$(".district-item").remove();
			$(this).attr("class", "eco-button fancy-add-district").attr("value", "Add District");
			$(".district-controls-wrapper").hide();

			$(".map-layer-main").show();
			$(".map-controls-wrapper").show();
			$("#district-control-draw").hide();
			$("#district-control-erase").hide();
			$(".map-layer-main").show();
			$(".progress-day").show();
			$(".map-tooltip").css('top','60px');
			$("#map-draw-size").css('left','-98px');
			$(".progress-day").show();
			$("#speed-button").show();
			$(".range-controls-wrapper").show();
			$(".play-button-wrapper").show();

			menuToggle = 'menu3';
			showBtn = 'button1';
			hideBtn = 'button2';
			ECO.MINIMAP.drawZone = false;
			$('.map-tooltip').css('display', 'none');
			//$("#district-control-erase").hide();
			//$("#district-control-draw").show();
			document.getElementById(hideBtn).style.display = 'none';
			document.getElementById(showBtn).style.display = '';
			$('#map-draw-size').hide();
		})


		/* Removing map */
		$(document).on('click', '.remove-map', function(){

			$(this).hide();

			$('.fancy-add-map').html('Add Map');

			$('.fancy-add-map').attr('data-action', 'add');

			//$('#graph-data').val('');

			$("#map-control-wrapper").hide();
			$("#main-map").hide();

			$('.fancy-add-map').show();

		})

	}
}
$(document).ready(function(){
	var mapcontrol = new MapControls();
	mapcontrol.bindEvents();
})
$(document).ready(function(){
    $("#button1").click(function(){
		$("#district-control-erase").show();
		$("#district-control-draw").hide();
    });

    $("#button2").click(function(){
      $("#map-draw-size").hide();
		$("#district-control-erase").hide();
		$("#district-control-draw").hide();
    });

	$('#district-control-erase').click(function(){
	  $(this).hide();
	  $("#district-control-draw").show();
	  ECO.MINIMAP.eraseMode = true;
	});

	$('#district-control-draw').click(function(){
	  $(this).hide();
	  $('#district-control-erase').show();
	  ECO.MINIMAP.eraseMode = false;
	});
});


function SwitchButtons(buttonId) {
  var hideBtn, showBtn, menuToggle;
  if (buttonId == 'button1') {
    menuToggle = 'menu2';
    showBtn = 'button2';
    hideBtn = 'button1';
	ECO.MINIMAP.drawZone = true;
	$('.map-tooltip').css('display', 'block');
	$('.fancy-add-district').attr("class", "eco-button fancy-remove-district").attr("value", "Remove Districts");
	$(".district-controls-wrapper").show();
  } else {
    menuToggle = 'menu3';
    showBtn = 'button1';
    hideBtn = 'button2';
	ECO.MINIMAP.drawZone = false;
	$('.map-tooltip').css('display', 'none');
	$(".fancy-remove-district").attr("class", "eco-button fancy-add-district").attr("value", "Add District");
	$(".district-controls-wrapper").hide();
  }
  //I don't have your menus, so this is commented out.  just uncomment for your usage
  // document.getElementById(menuToggle).toggle(); //step 1: toggle menu
  document.getElementById(hideBtn).style.display = 'none'; //step 2 :additional feature hide button
  document.getElementById(showBtn).style.display = ''; //step 3:additional feature show button


}

$(document).ready(function(){
	if( currentPage == "addlaw") {
		var cp = ColorPicker(document.getElementById('flexi-color-slide'),document.getElementById('flexi-color-picker'),
			function(hex, hsv, rgb, mousePicker, mouseSlide) {
				// ColorPicker.positionIndicators(
				// 	document.getElementById('flexi-slide-indicator'),
				// 	document.getElementById('flexi-picker-indicator'),
				// 	mouseSlide, mousePicker
				// );
				$(".district-item.active").css({"background-color": hex});
				// $("#flexi-color-slide #flexi-slide-indicator").css({"top": hsv.h*100/356 + "%"});
				// $("#flexi-color-picker #flexi-picker-indicator").css({"top": hsv.s*100 + "%","left": hsv.v*100 + "%","border-color": hex});

				// DISTRICTS NOTES -- try to make sure to keep district colors in sync
				// setDistrictColor can accept hex format or rgb(r, g, b)
				var districtId = $(".district-item.active")[0].getAttribute("data-id");
				ECO.MINIMAP.setDistrictColor(districtId, hex);
				// might as well make this one the active painting district
				ECO.MINIMAP.paintDistrict(districtId);
		});
		window.mapColorPicker = cp;
	}
	$(document).on("click",".district-item", function(event){

		if( currentPage == "addlaw") {
			event.stopPropagation();
			if( $(this).hasClass("active") ) {
				$(this).removeClass("active");
				$(".flexi-color-picker-wrapper").hide();
			} else {
				$(".district-item.active").removeClass("active");
				$(this).addClass("active");
				$(".flexi-color-picker-wrapper").css({"top":$(this).position().top + 10}).show();
				var color = $(this).css("background-color").split(")")[0].split("(")[1].split(", ");
				var rgb = {
					r: color[0],
					g: color[1],
					b: color[2]
				}
				window.mapColorPicker.setRgb(rgb);
			}
			//$('.district-item').css("border-color", "black");
			// $(".district-item[data-id=2]").position()
		}
	})
	$(document).on("click",".remove_district_item", function(){
		var id = $(this).parent().attr("data-id");

		var lookup = [];
		var revLookup = [];
		var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

		var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		for (var i = 0, len = code.length; i < len; ++i) {
		  lookup[i] = code[i];
		  revLookup[code.charCodeAt(i)] = i;
		}

		revLookup['-'.charCodeAt(0)] = 62;
		revLookup['_'.charCodeAt(0)] = 63;

		function placeHoldersCount (b64) {
		  var len = b64.length;
		  if (len % 4 > 0) {
		    throw new Error('Invalid string. Length must be a multiple of 4')
		  }

		  // the number of equal signs (place holders)
		  // if there are two placeholders, than the two characters before it
		  // represent one byte
		  // if there is only one, then the three characters before it represent 2 bytes
		  // this is just a cheap hack to not do indexOf twice
		  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
		}

		function toByteArray (b64) {
		  var i, j, l, tmp, placeHolders, arr;
		  var len = b64.length;
		  placeHolders = placeHoldersCount(b64);

		  arr = new Arr(len * 3 / 4 - placeHolders);

		  // if there are placeholders, only get up to the last complete 4 chars
		  l = placeHolders > 0 ? len - 4 : len;

		  var L = 0;

		  for (i = 0, j = 0; i < l; i += 4, j += 3) {
		    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
		    arr[L++] = (tmp >> 16) & 0xFF;
		    arr[L++] = (tmp >> 8) & 0xFF;
		    arr[L++] = tmp & 0xFF;
		  }

		  if (placeHolders === 2) {
		    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
		    arr[L++] = tmp & 0xFF;
		  } else if (placeHolders === 1) {
		    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
		    arr[L++] = (tmp >> 8) & 0xFF;
		    arr[L++] = tmp & 0xFF;
		  }

		  return arr
		}

		function tripletToBase64 (num) {
		  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
		}

		function encodeChunk (uint8, start, end) {
		  var tmp;
		  var output = [];
		  for (var i = start; i < end; i += 3) {
		    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
		    output.push(tripletToBase64(tmp));
		  }
		  return output.join('')
		}

		function fromByteArray (uint8) {
		  var tmp;
		  var len = uint8.length;
		  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
		  var output = '';
		  var parts = [];
		  var maxChunkLength = 16383; // must be multiple of 3

		  // go through the array every three bytes, we'll deal with trailing stuff later
		  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
		    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
		  }

		  // pad the end with zeros, but make sure to not forget the extra bytes
		  if (extraBytes === 1) {
		    tmp = uint8[len - 1];
		    output += lookup[tmp >> 2];
		    output += lookup[(tmp << 4) & 0x3F];
		    output += '==';
		  } else if (extraBytes === 2) {
		    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
		    output += lookup[tmp >> 10];
		    output += lookup[(tmp >> 4) & 0x3F];
		    output += lookup[(tmp << 2) & 0x3F];
		    output += '=';
		  }

		  parts.push(output);

		  return parts.join('')
		}

		var arr = toByteArray(ECO.MINIMAP.GetZone());
		for(var i = 0; i < arr.length; i++) {
			if( arr[i] == id ) {
				arr[i] = 0;
			}
		}
		var newZone = fromByteArray(arr);
		ECO.MINIMAP.SetZone(newZone);

		var districts = $('.district-item');
		for(var i = 0; i < districts.length; i++) {
			var district = districts[i];
			var id = districts[i].getAttribute("data-id");
			var color = $(district).css("background-color");
			ECO.MINIMAP.setDistrictColor(id, color);
		}

		$(this).parent().remove();
		ECO.MINIMAP.paintDistrict(0);
		if( $(".district-item").length == 1 )
			$(".remove_district_item").remove();
	})
	$(document).on("click",".add-new-district-button", function(){
		var id = 1;
		var districts = $(".district-item");
		for(var i = 0; i < districts.length; i++) id = (id<=parseInt($(districts[i]).attr("data-id"))) ? parseInt($(districts[i]).attr("data-id"))+1 : id;
		// var hex = "#"+parseInt(Math.random()*16581375).toString(16);
		var colors = ["rgb(33, 149, 172)", "rgb(191, 68, 119)", "rgb(153, 164, 255)", "rgb(69, 193, 37)", "rgb(232, 156, 55)", "rgb(188, 9, 47)", "rgb(179, 158, 245)", "rgb(126, 71, 193)", "rgb(161, 54, 4)", "rgb(134, 76, 163)", "rgb(231, 69, 61)", "rgb(229, 169, 117)", "rgb(49, 148, 178)", "rgb(65, 53, 228)", "rgb(126, 189, 136)", "rgb(255, 221, 119)", "rgb(77, 106, 175)", "rgb(99, 178, 184)", "rgb(187, 0, 17)", "rgb(128, 175, 118)", "rgb(211, 106, 211)", "rgb(93, 190, 63)", "rgb(49, 23, 156)", "rgb(40, 139, 221)", "rgb(170, 85, 238)", "rgb(154, 131, 190)", "rgb(238, 17, 68)", "rgb(33, 104, 147)", "rgb(226, 223, 95)", "rgb(54, 175, 187)", "rgb(108, 169, 253)", "rgb(186, 174, 86)", "rgb(221, 170, 68)", "rgb(101, 46, 60)", "rgb(137, 191, 62)", "rgb(131, 31, 61)", "rgb(239, 145, 233)", "rgb(222, 80, 62)", "rgb(221, 97, 206)", "rgb(188, 87, 215)"];
		var hex = colors[parseInt(Math.random()*40)];
		$(".district-item.active").removeClass("active");
		$(this).before('<div class="district-item active" data-id="'+id+'" style="background:'+hex+';"><i class="remove_district_item fa fa-times" aria-hidden="true"></i><input type="text" placeholder="Title" class="district-name-input"><input type="button" class="eco-button district-button" value="Color"></div>');
		window.mapColorPicker.setHex(hex);
		$('.district-item[data-id='+id+']').removeClass("active");
		if( $(".district-item").length == 1 ){
			$(".remove_district_item").remove();
		} else if( $(".district-item").length == 2 ) {
			$($(".district-item")[0]).prepend('<i class="remove_district_item fa fa-times" aria-hidden="true"></i>');
		}
	})
	$(document).on("click",".district-item .district-name-input, .district-item .district-button, .district-item .remove_district_item", function(e){e.stopPropagation()});
	$(document).on("click",".flexi-color-picker-wrapper",function(e){e.stopPropagation()});
	$(document).on("click",".district-item .district-name-input, .district-item .district-button", function(event){
		event.stopPropagation();
		var districtId = this.parentNode.getAttribute("data-id");
		ECO.MINIMAP.paintDistrict(districtId);
	})
	$(document).on("click", ".district-button", function(){
		$(this).parent().trigger("click");
	})
	$(window).click(function(){$(".district-item.active").removeClass("active");$(".flexi-color-picker-wrapper").hide();});
})