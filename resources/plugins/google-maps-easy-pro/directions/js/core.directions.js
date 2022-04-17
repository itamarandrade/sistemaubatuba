var g_gmpAllDirections = {};
var g_gmpAllDirectionsPolylines = {};
var g_gmpAllDirectionsInfoWindows = {};
jQuery(document).bind('gmapAfterMapInit', function(event, map){
	var viewId = map.getViewId()
	,	eventHandle = google.maps.event.addListener(map.getRawMapInstance(), 'bounds_changed', function(){
			var viewId = this.view_id
			,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId)
			,	appendTo = gmpIsMapInDefaultFullscreen(viewId) ? '#google_map_easy_'+viewId+'>div' : '#mapConElem_'+viewId;
			directionsFormDiv.appendTo(appendTo);
		});
	map._addEventListenerHandle('bounds_changed', 'directionsFormPositionChange', eventHandle);
	jQuery('#gmpDirectionsPanelShell_' + viewId).show();
});
jQuery(document).bind('gmapAfterMarkersRefresh', function(event, map){
	gmpAddDirectionsBtnToInfoWindow(map);
	gmpAddDirectionsBtnToMarkersList(map);
	gmpGetDirectionsForm(map);
	gmpRebuildDirectionPanel(map);
});
jQuery(window).on('resize', function() {
	gmpRebuildDirectionPanelForAllMaps();
});
jQuery(window).on('orientationchange', function() {
	gmpRebuildDirectionPanelForAllMaps();
});
jQuery(document).bind('gmapAfterHideInfoWnd', function(event, map){
	var viewId = map._map._mapParams.view_id
	,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId);

	directionsFormDiv.hide();
	gmpClearDirectionsForm(viewId);
});
function gmpAddDirectionsBtnToInfoWindow(map) {
	if(parseInt(map.getParam('enable_directions_btn'))) {
		for(var i = 0; i < map._markers.length; i++) {
			var markerId = map._markers[i].getId();
			map._markers[i]._infoWndDirectionsBtn = gmpGetDirectionsBtn(markerId, map);
		}
	}
}
function gmpIsMapInDefaultFullscreen(viewId) {
	var mapGmStyleDiv = jQuery('#google_map_easy_' + viewId + ' .gm-style');
	return gmpGetMapByViewId(viewId).getParam('enable_full_screen_btn') != 1
		&& mapGmStyleDiv.height() == window.innerHeight
		&& mapGmStyleDiv.width()  == window.innerWidth;
}
function gmpAddDirectionsBtnToMarkersList(map) {
	if(parseInt(map.getParam('enable_directions_btn'))) {
		var isMarkersListEnable = map.getParam('marker_list_params')
		,	sliderContent = isMarkersListEnable ? jQuery('#' + map.getParam('simple_slider_id')) : false;

		if(sliderContent) {
			for(var i = 0; i < map._markers.length; i++) {
				var markerId = map._markers[i].getId()
				,	curDirectionsBtnDiv = gmpGetDirectionsBtn(markerId, map)
				,	sliderDirectionsBtnDiv = jQuery(curDirectionsBtnDiv).clone(true);

				switch(isMarkersListEnable.eng){
					case 'table':
						sliderDirectionsBtnDiv.css({margin: '0 auto'});
						break;
					case 'jssor': default:
					sliderDirectionsBtnDiv.css({
						float: 'right'
					,	margin: '0 auto'
					,	padding: '0'
					});
					sliderDirectionsBtnDiv.html( sliderDirectionsBtnDiv.find('i.fa').clone() );
					break;
				}
				var sliderDirectionsBtnHtml = jQuery(sliderDirectionsBtnDiv).get(0).outerHTML
				,	markerSlide = jQuery(sliderContent).find('[data-marker-id="' + markerId +  '"]');

				switch(markerSlide.find('.gmpMmlSlideTitle a').data('slider-type')){
					case 'table':
						markerSlide.find('.gmpMmlGetDirections').append(sliderDirectionsBtnHtml);
						break;
					case 'jssor': default:
					markerSlide.find('.gmpMmlSlideTitle').append(sliderDirectionsBtnHtml);
					break;
				}
			}
		}
	}
}
function gmpGetDirectionsBtn(markerId, map) {
	var viewId = map.getParam('view_id')
	,	directionsBtnDiv = jQuery('#gmpDirectionsBtn_' + viewId)
	,	curDirectionsBtnDiv = jQuery(directionsBtnDiv).clone(true);
	
	curDirectionsBtnDiv.attr('id', 'gmpDirectionsBtn_' + viewId + '_' + markerId);
	curDirectionsBtnDiv.attr('data-marker-id', markerId);
	curDirectionsBtnDiv.css('display', 'inline-block');

	return curDirectionsBtnDiv;
}
function gmpGetDirectionsForm(map) {
	if(parseInt(map.getParam('enable_directions_btn'))) {
		var viewId = map.getParam('view_id')
		,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId);

		directionsFormDiv.find('[name="directions[address]"]').mapSearchAutocompleateGmp({
			msgEl: ''
		,	autocompleteParams: {
				appendTo: ".gmpDirectionsForm"
			}
		,	onSelect: function(item, event, ui) {
				if(item) {
					directionsFormDiv.find('[name="directions[coord_x]"]').val(item.lat);
					directionsFormDiv.find('[name="directions[coord_y]"]').val(item.lng);
				}
			}
		});
	}
}
function gmpShowDirectionsForm(btn, event){
    jQuery('.gmp_map_opts').css({position:'relative'});
	var btn = jQuery(btn),
        btnPos = btn.offset()
	,   mapPos = btn.closest('.gmp_map_opts').offset()
	,	viewId = btn.data('viewid')
	,	markerId = btn.data('marker-id')
	,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId)
	//,	isFullscreen = gmpIsMapInDefaultFullscreen(viewId)
	//,	top = isFullscreen ? event.screenY + 10 : event.pageY + 10
	//,	left = isFullscreen ? event.screenX + 10 : event.screenX - event.offsetX
	,	windowWidth = window.innerWidth;

    var top = btnPos.top - mapPos.top + btn.height(),
    	left = btnPos.left - mapPos.left;

	if(windowWidth - left < 300) {
		left = windowWidth - 300;
	}

	gmpClearDirectionsForm(viewId);
	directionsFormDiv.data('marker-id', markerId);
	directionsFormDiv.css({position: 'absolute', top: top, left: left});
	directionsFormDiv.show();
}
function gmpHideDirectionsForm(btn){
	var viewId = jQuery(btn).data('viewid')
	,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId);

	gmpClearDirectionsForm(viewId);
	directionsFormDiv.hide();
}
function gmpClearDirectionsForm(viewId){
	jQuery('#gmpDirectionsForm_' + viewId).find('[name="directions[address]"]').val('');
	jQuery('#gmpDirectionsForm_' + viewId).find('[name="directions[coord_x]"]').val('');
	jQuery('#gmpDirectionsForm_' + viewId).find('[name="directions[coord_y]"]').val('');
	jQuery('#gmpDirectionsForm_' + viewId).find('#gmpDirectionsErrorGeolocationFailed_' + viewId).hide();
	jQuery('#gmpDirectionsForm_' + viewId).find('#gmpDirectionsErrorGeolocationUnsupported_' + viewId).hide();
	jQuery('#gmpDirectionsForm_' + viewId).find('#gmpDirectionsErrorNoAddress_' + viewId).hide();
	jQuery('#gmpDirectionsForm_' + viewId).find('#gmpDirectionsErrorZeroResults_' + viewId).hide();
}
function gmpGetCurrentUserPosition(btn){
	var viewId = jQuery(btn).data('viewid')
	,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId);
	gmpClearDirectionsForm(viewId);

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = { lat: position.coords.latitude, lng: position.coords.longitude };
			if(pos){
				var latlng = new google.maps.LatLng(pos.lat, pos.lng);
			} else{
				directionsFormDiv.find('#gmpDirectionsErrorNoAddress_' + viewId).show();
				return
			}
			var geocoder = gmpGetGeocoder();
			geocoder.geocode({'latLng': latlng}, function(results, status) {
				if(status == google.maps.GeocoderStatus.OK) {
					directionsFormDiv.find('[name="directions[address]"]').val(results[0]['formatted_address']);
					directionsFormDiv.find('[name="directions[coord_x]"]').val(pos.lat);
					directionsFormDiv.find('[name="directions[coord_y]"]').val(pos.lng);
				};
			});
		}, function() {
			directionsFormDiv.find('#gmpDirectionsErrorGeolocationFailed_' + viewId).show();
			return
		});
	} else {
		directionsFormDiv.find('#gmpDirectionsErrorGeolocationUnsupported_' + viewId).show();
		return
	}
}
function gmpGetDirection(btn){
	var viewId = jQuery(btn).data('viewid')
	,	directionsFormDiv = jQuery('#gmpDirectionsForm_' + viewId)
	,	markerId = directionsFormDiv.data('marker-id')
	,	map = gmpGetMapByViewId(viewId)
	,	googleMap = map.getRawMapInstance()
	,	marker = map.getMarkerById(markerId)
	,	lat = directionsFormDiv.find('[name="directions[coord_x]"]').val()
	,	lng = directionsFormDiv.find('[name="directions[coord_y]"]').val()
	,	startPoint = ''
	,	endPoint = '';

	directionsFormDiv.find('#gmpDirectionsErrorNoAddress_' + viewId).hide();
	directionsFormDiv.find('#gmpDirectionsErrorZeroResults_' + viewId).hide();

	if(lat && lng){
		startPoint = new google.maps.LatLng(lat, lng);
		endPoint = marker.getPosition();
	} else{
		directionsFormDiv.find('#gmpDirectionsErrorNoAddress_' + viewId).show();
		return
	}

	var directionsService = new google.maps.DirectionsService;

	if(g_gmpAllDirections[viewId]) {
		for(var i = 0; i < g_gmpAllDirections[viewId].length; i++) {
			g_gmpAllDirections[viewId][i].setMap(null);
		}
		g_gmpAllDirections[viewId] = null;
	}
	if(g_gmpAllDirectionsPolylines[viewId]) {
		for(var i = 0; i < g_gmpAllDirectionsPolylines[viewId].length; i++) {
			g_gmpAllDirectionsPolylines[viewId][i].setMap(null);
		}
		g_gmpAllDirectionsPolylines[viewId] = null;
	}
	if(g_gmpAllDirectionsInfoWindows[viewId]) {
		for(var i = 0; i < g_gmpAllDirectionsInfoWindows[viewId].length; i++) {
			g_gmpAllDirectionsInfoWindows[viewId][i].setMap(null);
		}
		g_gmpAllDirectionsInfoWindows[viewId] = null;
	}

	var request = {
		origin: startPoint
	,	destination: endPoint
	,	travelMode: google.maps.TravelMode.DRIVING
	,	unitSystem: parseInt(map.getParam('directions_miles')) === 1 ? google.maps.UnitSystem.IMPERIAL : google.maps.UnitSystem.METRIC
	,	provideRouteAlternatives: parseInt(map.getParam('directions_alternate_routes')) ? true : false
	,	avoidFerries: false
	,	avoidHighways: false
	,	avoidTolls: false
	};

	directionsService.route(request, function(response, status) {
		if(status == google.maps.DirectionsStatus.OK) {
			g_gmpAllDirections[viewId] = [];
			g_gmpAllDirectionsPolylines[viewId] = [];
			g_gmpAllDirectionsInfoWindows[viewId] = [];

			for(var i = 0; i < response.routes.length; i++) {
				g_gmpAllDirections[viewId][i] = new google.maps.DirectionsRenderer({
					map: googleMap
					,	directions: response
					,	routeIndex: i
					,	polylineOptions: {
							strokeColor: i ? '#AFAFAF' : '#00B3FD'
						,	strokeCOpacity: '0.8'
						,   zIndex: i ? 998 : 999
						,	strokeWeight: 5
					}
				});

				if(parseInt(map.getParam('directions_data_show'))) {
					var eventHandle = google.maps.event.addListener(g_gmpAllDirections[viewId][i], 'directions_changed' , jQuery.proxy(function(){
						var routeData = response.routes[i]
						,	routeSteps = routeData.legs[0].steps
						,	middleStep = parseInt(routeSteps.length / 2);

						g_gmpAllDirectionsInfoWindows[viewId][i] = new google.maps.InfoWindow();
						g_gmpAllDirectionsPolylines[viewId][i] = new google.maps.Polyline({
							path: routeData.overview_path
						,	visible: true
						,	strokeColor: '#FF0000'
						,	strokeOpacity: 0
						,	strokeWeight: 10
						,	zIndex: i ? 1000 : 1001
						});
						g_gmpAllDirectionsPolylines[viewId][i].position = i;

						g_gmpAllDirectionsInfoWindows[viewId][i].setContent(''
							+ '<div class="gmpDirectionsMode"></div><div class="gmpDirectionsData"><span style="font-weight: bold;">'
							+ routeData.legs[0].duration.text
							+ '</span></span></br><span>'
							+ routeData.legs[0].distance.text
							+ '</span></div>');

						g_gmpAllDirectionsPolylines[viewId][i].setMap(map.getRawMapInstance());

						google.maps.event.addListener(g_gmpAllDirectionsPolylines[viewId][i], 'click', function(e) {
							g_gmpAllDirectionsInfoWindows[viewId][this.position].close();
							g_gmpAllDirectionsInfoWindows[viewId][this.position].setPosition(e.latLng);
							g_gmpAllDirectionsInfoWindows[viewId][this.position].open(map.getRawMapInstance());
						});
					}, i, viewId));

					map._addEventListenerHandle('directions_changed', 'directionsChanged_' + i, eventHandle);
					google.maps.event.trigger(g_gmpAllDirections[viewId][i], 'directions_changed');
				}
			}
			if(parseInt(map.getParam('directions_steps_show'))) {
				var directionsPanel = jQuery('#gmpDirectionsPanelShell_' + viewId);
				directionsPanel.find('.directionsPanelHeader').hide();
				g_gmpAllDirections[viewId][0].setPanel(document.getElementById('gmpDirectionsPanel_' + viewId));
			}
			marker.hideInfoWnd();
			directionsFormDiv.hide();
		} else {
			console.log('Directions not found: ' + status);
			directionsFormDiv.find('#gmpDirectionsErrorZeroResults_' + viewId).show();
			return
		}
	});
}
function gmpRebuildDirectionPanel(map) {
	if( parseInt(map.getParam('directions_steps_show'))
		&& !parseInt(map.getParam('enable_kml_filter'))
		&& map.getParam('markers_list_type') !== 'slider_checkbox_table'
	) {
		var markerListParams = map.getParam('marker_list_params')
			,	orientation = markerListParams ? markerListParams.or : false
			,	mapShell = jQuery('#'+ map.getViewHtmlId()).parents('.gmpMapDetailsContainer:first')
			,	panelShell = jQuery('#gmpMapProDirectionsCon_' + map.getViewId())
			,	sliderShell = jQuery('#gmpMapProControlsCon_' + map.getViewId())
			,	panelWidth = '300'
			,	panelHeight = mapShell.height();

		if((orientation == 'h' || !orientation) && jQuery(window).width() > 992) {
			// Vertical Directions panel
			panelShell.insertBefore(sliderShell);
			panelShell.css({
				'float': 'right'
			,	'width': panelWidth
			,   'height':  panelHeight
			,	'max-height': panelHeight
			,   'margin-top': '0'
			,   'margin-bottom': '5px'
			});
			mapShell.css({
				'float': 'left'
			,	'width': mapShell.parents('.gmp_map_opts:first').width() - panelWidth - 5
			});
			sliderShell.css({
				'clear': 'both'
			});
		} else {
			// Horisontal Directions panel
			panelShell.insertAfter(sliderShell);
			panelShell.css({
				'float': 'right'
			,	'width': '100%'
			,   'height':  'auto'
			,	'max-height': '400px'
			,   'margin-top': '5px'
			,   'margin-bottom': '0'
			});
			if(orientation != 'v') {
				mapShell.css({
					'float': 'none'
				,	'width': '100%'
				});
				sliderShell.css({
					'clear': 'none'
				});
			}
		}
	}
}
function gmpRebuildDirectionPanelForAllMaps() {
	if(typeof(gmpGetAllMaps) == 'function') {
		var maps = gmpGetAllMaps();

		for(var i = 0; i < maps.length; i++) {
			gmpRebuildDirectionPanel(maps[i]);
		}
	}
}