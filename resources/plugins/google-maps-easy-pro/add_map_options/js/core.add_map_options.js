jQuery(document).bind('gmapBeforeMapInit', function(event, map){
	var controlToPosition =  {
		type_control_position: 'mapTypeControlOptions', zoom_control_position: 'zoomControlOptions', street_view_control_position: 'streetViewControlOptions',
		pan_control_position: 'panControlOptions'
	};
	for(var dbKey in controlToPosition) {
		var controlPosition = map.getParam( dbKey ) ? map.getParam( dbKey ) : jQuery('[name="map_opts['+dbKey+']"]').val();
		if(controlPosition && google.maps.ControlPosition[ controlPosition ]) {
			var mapControlOptions = map.getParam( controlToPosition[dbKey] ) || {};
			mapControlOptions.position = google.maps.ControlPosition[ controlPosition ];
			map.setParam(controlToPosition[dbKey], mapControlOptions);
		}
	}
	if(parseInt(map.getParam('center_on_cur_user_pos'))) {
		gmpMapCenteredOnCurUserPos(map);
	}
	if(parseInt(map.getParam('enable_full_screen_btn'))) {
		map.setParam('fullscreenControl', false);
	}
});
jQuery(document).bind('gmapAfterMapInit', function(event, map){
	if(parseInt(map.getParam('enable_trafic_layer'))) {
		if(!map.getLayer('trafic')) {
			map.createTraficLayer();
		}
		map.enbLayer('trafic');
	}
	if(parseInt(map.getParam('enable_transit_layer'))) {
		if(!map.getLayer('transit')) {
			map.createTransitLayer();
		}
		map.enbLayer('transit');
	}
	if(parseInt(map.getParam('enable_bicycling_layer'))) {
		if(!map.getLayer('bicycling')) {
			map.createBicyclingLayer();
		}
		map.enbLayer('bicycling');
	}
	if(parseInt(map.getParam('enable_full_screen_btn'))) {
		google.maps.event.addListenerOnce(map.getRawMapInstance(), 'tilesloaded', function(){
			var fullScreenControlDiv = document.getElementById('gmpFullScreenBtn_' + map.getParam('view_id'));
			map.getRawMapInstance().controls[google.maps.ControlPosition[map.getParam('type_control_position')]].push( fullScreenControlDiv );
			jQuery(fullScreenControlDiv).show();
		});
	}
	gmpStylesToggle(map, 'hide_poi');
	gmpStylesToggle(map, 'hide_countries');

	map.initSlideInfoWindow();
});
jQuery(document).bind('gmapAfterMarkersRefresh', function(event, map){
	if(parseInt(map.getParam('enable_infownd_print_btn'))) {
		var viewId = map.getParam('view_id')
		,	mapMarkers = map.getAllMarkers()
		,	printBtnDiv = jQuery('#gmpPrintInfoWndBtn_' + viewId);

		for(var i = 0; i < mapMarkers.length; i++){
			var markerId = map._markers[i]._markerParams.id
			,	curPrintBtnDiv = jQuery(printBtnDiv).clone(true);

			curPrintBtnDiv.attr('id', 'gmpPrintInfoWndBtn_' + viewId + '_' + markerId);
			curPrintBtnDiv.attr('data-marker-id', markerId);
			curPrintBtnDiv.css('display', 'inline-block');
			if(!map._markers[i]._infoWindow)
				map._markers[i]._infoWndPrintBtn = curPrintBtnDiv;
		}
	}
});

gmpGoogleMap.prototype.initSlideInfoWindow = function(){
	var map = this;
	if(map.getParam('marker_infownd_type') != 'slide') return;

	var viewId = map.getParam('view_id'),
		container = jQuery('#gmpSlideInfoWindow_'+viewId);
	if(container.length == 0) return;
	var mapContainer = jQuery('#gmpMapDetailsContainer_'+viewId+' .gmp_MapPreview'),
		searchContainer = jQuery('#gmpImproveSearch_'+viewId+' .gmpImproveSearchFormWr gmpSearchWithSlideIW'),
		isMobile = container.attr('data-is-mobile'),
		h = mapContainer.height(),
		w = mapContainer.width(),
		widthInfo = 200,
		infoWindow = container.find('.gmpSlideInfoWindow');

	if(map.getParam('marker_infownd_width_units') == 'px') {
		widthInfo = parseInt(map.getParam('marker_infownd_width'));
	}
	if(widthInfo > w || isMobile) widthInfo = w;
	if(widthInfo < 100) widthInfo = 100;
	map.slideInfoWindowWidth = widthInfo;
	map.slideInfoWindowFrom = isMobile ? 'left' : 'right';
	container.css({'height': h+'px'});
	container.css('float', map.slideInfoWindowFrom);

	var hideObj = {'right': '-'+map.slideInfoWindowWidth+'px'};
	if(map.slideInfoWindowFrom == 'left') {
		hideObj = {'left': '-'+map.slideInfoWindowWidth+'px'};
	}
	infoWindow.css(hideObj);

	infoWindow.find('.gmpSlideInfoWindowClose').off('click').on('click', function() {
		var marker = map.getMarkerById(infoWindow.attr('marker-id'));
		infoWindow.animate(hideObj, 500, 'swing', function(){
			infoWindow.css('display', 'none');
			container.css('width', '0');
			if(window.history.replaceState) {
				window.history.replaceState(null, null, ' ');
			} else {
				window.location.hash = '_';
			}
			if(marker) marker.hideInfoWnd();
		});
	});
};
gmpGoogleMarker.prototype.showInfoWndSlide = function() {
	var viewId = this._map.getParam('view_id'),
		container = jQuery('#gmpSlideInfoWindow_'+viewId);
	if(container.length == 0) return;

	var infoWindow = container.find('.gmpSlideInfoWindow'),
		searchBtn = jQuery('#gmpImproveSearch_'+viewId+' .gmpCustomControlButton'),
		markerId = this._markerParams.id;

	infoWindow.find('.gmpSlideInfoWindowTitle').html(this._markerParams.title);
	infoWindow.find('.gmpSlideInfoWindowDesc').html(this._markerParams.description);
	infoWindow.attr('marker-id', markerId);
	container.css('width', this._map.slideInfoWindowWidth+'px');
	infoWindow.css('display', 'flex');
	infoWindow.animate(this._map.slideInfoWindowFrom == 'left' ? {'left':'0'} : {'right':'0'}, 500);
	window.location.hash = 'gmpInfoWnd='+markerId;
	if(searchBtn.hasClass('gmpActiveButton')) {
		searchBtn.trigger('click');
	}
	if(container.attr('data-is-mobile') && this._withMarkerListOpen) {
		document.getElementById(this._map._mapObj.view_html_id).scrollIntoView(true, {behavior: "smooth"});
	}
	this._withMarkerListOpen = false;
};

gmpGoogleMap.prototype.enbLayer = function(layer) {
	if(this._layers[ layer ]) {
		this._layers[ layer ].setMap( this.getRawMapInstance() );
	}
};
gmpGoogleMap.prototype.dsblLayer = function(layer) {
	if(this._layers[ layer ]) {
		this._layers[ layer ].setMap( null );
	}
};
gmpGoogleMap.prototype.getLayer = function(layer) {
	return this._layers[ layer ];
};
gmpGoogleMap.prototype.createLayer = function(layer, object) {
	this._layers[ layer ] = object;
	return this;
};
gmpGoogleMap.prototype.createTraficLayer = function() {
	this.createLayer('trafic', new google.maps.TrafficLayer());
	return this;
};
gmpGoogleMap.prototype.createTransitLayer = function() {
	this.createLayer('transit', new google.maps.TransitLayer());
	return this;
};
gmpGoogleMap.prototype.createBicyclingLayer = function() {
	this.createLayer('bicycling', new google.maps.BicyclingLayer());
	return this;
};
// Pro version of method
// see free version here - google-maps-easy/modules/gmap/js/core.gmap.js
gmpGoogleMap.prototype._getBoundsHandler = function(){
	var bounds = new google.maps.LatLngBounds();

	bounds = this._getMapMarkersBounds(bounds);
	bounds = this._getMapShapesBounds(bounds);
	this._setMapBounds(bounds);
};
gmpGoogleMap.prototype._getMapShapesBounds = function(bounds){
	var shapes = this.getAllShapes();

	for(var i = 0; i < shapes.length; i++) {
		switch(shapes[i].getType()) {
			case 'circle':
				bounds.union(shapes[i].getBounds());
				break;
			case 'polygon': case 'polyline':
			shapes[i].getPath().forEach(function(element, index) {
				bounds.extend(element);
			});
			break;
			default:
				break;
		}
	}
	return bounds;
};
var gmpFullScreenMaps = {
	_maps: {}
	,	enableFullScreen: function(viewId, btn) {
			var mapCon = jQuery('#mapConElem_'+ viewId)
	,			detailsCon = jQuery('#gmpMapDetailsContainer_'+ viewId)
	,			mapPrevCon = jQuery('#google_map_easy_'+ viewId);

		for (var i = 0; i < gmpAllMapsInfo.length; i++) {
			if (gmpAllMapsInfo[i].view_html_id === 'google_map_easy_'+ viewId) {
				var map = gmpAllMapsInfo[i];
				if( map.params.markers_list_type === 'slider_checkbox_table'){
						mapPrevCon.closest('.gmp_map_opts').find('.gmpLeft').css('height','100%')
				}
			}
		}

			this._maps[ viewId ] = {
				mapConSize: {
					width: mapCon.width()
	,				height: mapCon.height()
				}
	,			mapConZindex: mapCon.css('z-index')
	,			detailsConSize: {
					width: detailsCon.width()
	,				height: detailsCon.height()
				}
	,			mapPrevConSize: {
					width: mapPrevCon.width()
	,				height: mapPrevCon.height()
				}
			};
			mapCon.css({
				'position': 'fixed'
	,			'left': '0'
	,			'top': '0'
	,			'width': '100%'
	,			'height': '100%'
	,			'z-index': '9999999'
			});
			detailsCon.css({
				'width': '100%'
	,			'height': '100%'
			});
			mapPrevCon.css({
				'width': '100%'
	,			'height': '100%'
			});
			jQuery(btn).addClass('gmpActive').html( jQuery(btn).data('disabletxt') );
			this._refreshMap(viewId);
		}
	,	disableFullScreen: function(viewId, btn) {
			var mapCon = jQuery('#mapConElem_'+ viewId)
	,			detailsCon = jQuery('#gmpMapDetailsContainer_'+ viewId)
	,			mapPrevCon = jQuery('#google_map_easy_'+ viewId);

			mapCon.css({
				'position': 'relative'
	,			'width': this._maps[ viewId ].mapConSize.width
	,			'height': this._maps[ viewId ].mapConSize.height
	,			'z-index': this._maps[ viewId ].mapConZindex
			});
			detailsCon.css({
				'width': this._maps[ viewId ].detailsConSize.width
	,			'height': this._maps[ viewId ].detailsConSize.height
			});
			mapPrevCon.css({
				'width': this._maps[ viewId ].mapPrevConSize.width
	,			'height': this._maps[ viewId ].mapPrevConSize.height
			});
			jQuery(btn).removeClass('gmpActive').html( jQuery(btn).data('enabletxt') );
			this._refreshMap(viewId);
		}
	,	_refreshMap: function(viewId) {
			var map = gmpGetMapByViewId(viewId)
	,			x = map.getZoom()
	,			c = map.getCenter();
			google.maps.event.trigger(map.getRawMapInstance(), 'resize');
			map.setZoom(x);
			map.setCenter(c);

	}
};
function gmpSwitchFullscreenBtn(btn){
	var viewId = jQuery(btn).data('viewid');
	if(jQuery(btn).hasClass('gmpActive')) {
		jQuery(btn).closest('');
		gmpFullScreenMaps.disableFullScreen(viewId, btn);
	} else {
		gmpFullScreenMaps.enableFullScreen(viewId, btn);
	}
}
function gmpStylesToggle(map, param) {
	var val = parseInt(map.getParam(param));

	if(val) {
		gmpSetMapStyle(map, param, 'off');
	} else {
		gmpSetMapStyle(map, param, 'on');
	}
}
function gmpSetMapStyle(map, param, action) {
	var currentMapStyle = map.get('styles')
	,	newMapStyle = {}
	,	enabledStyle = {};

	switch(param) {
		case 'hide_poi':
			enabledStyle = {
				gmpHidePoiOption: true
			,	featureType: 'poi'
			,	elementType: 'labels'
			,	stylers: [{
					visibility: action
				}]
			};
			break;
		case 'hide_countries':
			enabledStyle = {
				gmpHideCountriesOption: true
			,	featureType: 'administrative'
			,	stylers: [{
					visibility: action
				}]
			};
			break;
		default:
			break;
	}
	if(currentMapStyle) {
		newMapStyle = currentMapStyle;
		newMapStyle[newMapStyle.length] = enabledStyle;
	} else {
		newMapStyle = [ enabledStyle ];
	}
	map.getRawMapInstance().setOptions({styles: newMapStyle});
}
function gmpMapCenteredOnCurUserPos(map) {
	if(!GMP_DATA.isAdmin) {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function (position) {
					var curUserPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
					,	params = {
						id: '-1'
					,	position: curUserPos
					,	icon: map.getParam('center_on_cur_user_pos_icon_path')
					,	title: 'You are here!'
					}
					,	marker = new gmpGoogleMarker(map, params);

					if(parseInt(map.getParam('enable_directions_btn'))) {
						marker._infoWndDirectionsBtn = gmpGetDirectionsBtn('-1', map);
					}
					map._markers[map._markers.length] = marker;
					map.setCenter(curUserPos);
				}
			,	function (failure) {
					console.log('Geolocation service error: ' + failure.message);
					return;
			});
		}
	}
}
function gmpPrintInfoWndContent(btn) {
	jQuery(btn).parents('div:first').print({
		globalStyles: true,
		mediaPrint: false,
		iframe: false,
		timeout: 250,
		title: null,
		noPrintSelector : '.gmpNoPrint',
		doctype: '<!doctype html>'
	});
}
