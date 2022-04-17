// Shapes
function gmpGoogleShape(map, params) {
	this._map = map;
	this._shapeObj = null;
	var defaults = {
		// Empty for now
	};
	if(!params.path && params.coords) {
		params.path = gmpGetShapePath(params.coords);
	}
	if(!params.center && params.coords) {
		params.center = gmpGetShapeCenter(params.coords);
	}
	if(!params.radius) {
		params.radius = gmpGetShapeRadius(params.coords);
	}
	this._shapeParams = jQuery.extend({}, defaults, params);
	this._shapeParams.map = this._map.getRawMapInstance();
	this._infoWindow = null;
	this._infoWndOpened = false;
	this._infoWndWasInited = false;
	this._infoWndPosition = false;
	this._createdFromCenter = false;
	this._mapDragScroll = {
		scrollwheel: null
	};
	this.init();
}
gmpGoogleShape.prototype.init = function() {
	switch(this._shapeParams.type) {
		case 'circle':
			this._shapeObj = new google.maps.Circle( this._shapeParams );
			this._shapeObj.addListener('click', jQuery.proxy(function (e) {
				this._infoWndPosition = e.latLng;
				this.showInfoWnd();
				jQuery(document).trigger('gmapAfterShapeClick', this);
			}, this));
			break;
		case 'polygon':
			this._shapeObj = new google.maps.Polygon( this._shapeParams );
			this._shapeObj.addListener('click', jQuery.proxy(function (e) {
				this._infoWndPosition = e.latLng;
				this.showInfoWnd();
				jQuery(document).trigger('gmapAfterShapeClick', this);
			}, this));
			break;
		case 'polyline': default:
			this._shapeObj = new google.maps.Polyline( this._shapeParams );
			break;
	}
	if(this._shapeParams.created_from_center)
		this._createdFromCenter = true;
};
gmpGoogleShape.prototype.infoWndOpened = function() {
	return this._infoWndOpened;
};
gmpGoogleShape.prototype.showInfoWnd = function() {
	var allMarkers = this._map.getAllMarkers();
	if(allMarkers && allMarkers.length) {
		for(var i = 0; i < allMarkers.length; i++) {
			if(allMarkers[i]._infoWndOpened) allMarkers[i].hideInfoWnd();
		}
	}
	if(!this._infoWndWasInited) {
		this._updateInfoWndContent();
		this._infoWndWasInited = true;
	} else {
		this._updateInfoWndPosition();
		if(this._infoWndOpened)
			this.hideInfoWnd();
	}
	if(this._infoWindow && !this._infoWndOpened) {
		var allMapShapes = this._map.getAllShapes();
		if(allMapShapes && allMapShapes.length > 1) {
			// Google Maps Javascript API v3 allows to open several infowindows on map
			for(var i = 0; i < allMapShapes.length; i++) {
				allMapShapes[i].hideInfoWnd();
			}
		}
		this._infoWindow.open(this._map.getRawMapInstance(), this.getRawShapeInstance());
		this._infoWndOpened = true;
	}
};
gmpGoogleShape.prototype._updateInfoWndPosition = function() {
	this._infoWindow.position = this._infoWndPosition;
};
gmpGoogleShape.prototype.hideInfoWnd = function() {
	if(this._infoWindow && this._infoWndOpened) {
		this._infoWindow.close();
		this._infoWndOpened = false;

		var googleMap = this._map.getRawMapInstance();
		googleMap.setOptions( {scrollwheel: this._mapDragScroll.scrollwheel} );

		jQuery(document).trigger('gmapAfterHideInfoWnd', this);
	}
};
gmpGoogleShape.prototype._setInfoWndClosed = function() {
	this._infoWndOpened = false;
	jQuery(document).trigger('gmapAfterHideInfoWnd', this);
};
gmpGoogleShape.prototype._setInfoWndContent = function(newContentHtmlObj) {
	var self = this
	,	map = this.getMap();

	if (!this._infoWindow) {
		// It is common infowindow option: marker_infownd_width_units, marker_infownd_width, marker_infownd_height
		var mapWidth = GMP_DATA.isAdmin ? jQuery('#gmpMapPreview').width() : jQuery('#' + map.getViewHtmlId()).width()
		,	infoWndWidth = map.getParam('marker_infownd_width_units') == 'px' ? map.getParam('marker_infownd_width') : mapWidth - 10
		,	infoWndHeight = map.getParam('marker_infownd_height_units') == 'px' ? map.getParam('marker_infownd_height')+ 'px' : false
		,	infoWndParams = { maxWidth: infoWndWidth };

		this._infoWndPosition = this._infoWndPosition
			? this._infoWndPosition
			: (typeof this.getRawShapeInstance().getPath == 'function' ? this.getPath().getAt(0) : this.getMap().getCenter());
		infoWndParams.position = this._infoWndPosition;
		this._infoWindow = new google.maps.InfoWindow(infoWndParams);

		google.maps.event.addListener(this._infoWindow, 'domready', function(){
			changeInfoWndType(map);
			changeInfoWndBgColor(map);
		});
		google.maps.event.addListener(this._infoWindow, 'closeclick', function(){
			self._setInfoWndClosed();
		});
	}
	if(infoWndHeight) {
		newContentHtmlObj.css('cssText', 'max-height: '+ infoWndHeight +';');
	}

	// Fix bug in FF - scroll on infowindow content changes map zoom
	var scrollwheel = map.get('scrollwheel')
	,	googleMap = map.getRawMapInstance();

	//Save scrollwheel setting to container before rewrite it.
	this._mapDragScroll.scrollwheel = scrollwheel;

	newContentHtmlObj.hover(
		function() {
			googleMap.setOptions( {scrollwheel: false} );
		},
		function() {
			googleMap.setOptions( {scrollwheel: scrollwheel} );
		}
	);
	this._infoWindow.setContent(newContentHtmlObj[0]);
};
gmpGoogleShape.prototype._updateInfoWndContent = function() {
	var contentStr = jQuery('<div/>', {})
	,	title = this._shapeParams.title ? this._shapeParams.title : false
	,	description = this._shapeParams.description ? this._shapeParams.description.replace(/\n/g, '<br/>') : false;
	if(title) {
		var titleDiv = jQuery('<div/>', {})
			.addClass('gmpInfoWindowtitle')
			.html( title );
		// It is common infowindow option
		var titleColor = this._map.getParam('marker_title_color');
		if(titleColor && titleColor != '') {
			titleDiv.css({
				'color': titleColor
			});
		}
		// It is common infowindow option
		var titleSize = this._map.getParam('marker_title_size')
		,	titleSizeUnits = this._map.getParam('marker_title_size_units');
		if(titleSize && titleSizeUnits && titleSize != '') {
			titleDiv.css({
				'font-size': titleSize + titleSizeUnits
			,	'line-height': titleSize + titleSizeUnits
			});
		}
		contentStr.append( titleDiv );
	}
	if(description) {
		var descDiv = jQuery('<div/>', {})
			.addClass('egm-shape-iw')
			.html( description );
		// It is common infowindow option
		var descSize = this._map.getParam('marker_desc_size')
		,	descSizeUnits = this._map.getParam('marker_desc_size_units');
		if(descSize && descSizeUnits && descSize != '') {
			descDiv.css({
				'font-size': descSize + descSizeUnits
				,	'line-height': parseInt(descSize) + 5 + descSizeUnits
			});
		}
		contentStr.append( descDiv );
		// Check scripts in description, and execute them if they are there
		var $scripts = contentStr.find('script');
		if($scripts && $scripts.length) {
			$scripts.each(function(){
				var scriptSrc = jQuery(this).attr('src');
				if(scriptSrc && scriptSrc != '') {
					jQuery.getScript( scriptSrc );
				}
			});
		}
	}
	this._setInfoWndContent( contentStr );
};
gmpGoogleShape.prototype.setTitle = function(title, noRefresh) {
	this._shapeParams.title = title;
	if(!noRefresh)
		this._updateInfoWndContent();
};
gmpGoogleShape.prototype.setDescription = function (description, noRefresh) {
	this._shapeParams.description = description;
	if(!noRefresh)
		this._updateInfoWndContent();
};
gmpGoogleShape.prototype.getRawShapeInstance = function() {
	return this._shapeObj;
};
gmpGoogleShape.prototype.getRawShapeParams = function() {
	return this._shapeParams;
};
gmpGoogleShape.prototype.setId = function(id) {
	this._shapeParams.id = id;
};
gmpGoogleShape.prototype.getId = function() {
	return this._shapeParams.id;
};
gmpGoogleShape.prototype.removeFromMap = function() {
	this.getRawShapeInstance().setMap( null );
};
gmpGoogleShape.prototype.setShapeParams = function(params) {
	this._shapeParams = params;
	return this;
};
gmpGoogleShape.prototype.setShapeParam = function(key, value) {
	this._shapeParams[ key ] = value;
	return this;
};
gmpGoogleShape.prototype.setMap = function( map ) {
	this.getRawShapeInstance().setMap( map );
};
gmpGoogleShape.prototype.getMap = function() {
	return this._map;
};
gmpGoogleShape.prototype.setVisible = function(state) {
	this.getRawShapeInstance().setVisible(state);
};
gmpGoogleShape.prototype.getVisible = function(state) {
	this.getRawShapeInstance().getVisible(state);
};
gmpGoogleShape.prototype.getShapeParams = function(){
	return this._shapeParams;
};
gmpGoogleShape.prototype.getShapeParam = function(key){
	return this._shapeParams[ key ];
};
gmpGoogleShape.prototype.setShapeParam = function(key, value){
	this._shapeParams[ key ] = value;
	return this;
};
gmpGoogleShape.prototype.getBounds = function() {
	return this.getRawShapeInstance().getBounds();
};
gmpGoogleShape.prototype.setStrokeColor = function(color) {
	this.setShapeParam('strokeColor', color);
	this.getRawShapeInstance().setOptions({ strokeColor: color });
};
gmpGoogleShape.prototype.setStrokeOpacity = function(opacity) {
	this.setShapeParam('strokeOpacity', opacity);
	this.getRawShapeInstance().setOptions({ strokeOpacity: opacity });
};
gmpGoogleShape.prototype.setStrokeWeight = function(weight) {
	this.setShapeParam('strokeWeight', weight);
	this.getRawShapeInstance().setOptions({ strokeWeight: weight });
};
gmpGoogleShape.prototype.setFillColor = function(color) {
	this.setShapeParam('fillColor', color);
	this.getRawShapeInstance().setOptions({ fillColor: color });
};
gmpGoogleShape.prototype.setFillOpacity = function(opacity) {
	this.setShapeParam('fillOpacity', opacity);
	this.getRawShapeInstance().setOptions({ fillOpacity: opacity });
};
gmpGoogleShape.prototype.getPath = function() {
	return this.getRawShapeInstance().getPath();
};
gmpGoogleShape.prototype.setPath = function(path) {
	this.setShapeParam('path', path);
	this.getRawShapeInstance().setPath(path);
};
gmpGoogleShape.prototype.setCenter = function(point) {
	this.setShapeParam('center', point);
	this.getRawShapeInstance().setCenter(point);
};
gmpGoogleShape.prototype.getCenter = function() {
	return this.getRawShapeInstance().getCenter();
};
gmpGoogleShape.prototype.setRadius = function(val) {
	this.setShapeParam('radius', val);
	this.getRawShapeInstance().setRadius(val);
};
gmpGoogleShape.prototype.getRadius = function() {
	return this.getRawShapeInstance().getRadius();
};
gmpGoogleShape.prototype.setType = function(type) {
	this.setShapeParam('type', type);
};
gmpGoogleShape.prototype.getType = function() {
	return this.getShapeParam('type');
};
gmpGoogleShape.prototype.reinit = function() {
	this.removeFromMap();
	this.init();
};
// Common functions
function _gmpPrepareShapesList(shapes, params) {
	params = params || {};
	if(shapes) {
		for(var i = 0; i < shapes.length; i++) {
			if(shapes[i].coords) {
				shapes[i].path = gmpGetShapePath(shapes[i].coords);
				shapes[i].geodesic = true;
				for(var j in shapes[i].params) {
					shapes[i][j] = shapes[i].params[j];
				}
			}
		}
	}
	return shapes;
}
function gmpGetShapePath(coords) {
	var path = [];
	for(var i in coords) {
		var pointPos = new google.maps.LatLng(coords[i].coord_x, coords[i].coord_y);
		path.push(pointPos);
	}
	return path;
}
function gmpGetShapeCenter(coords) {
	var pointPos = {};

	for(var i in coords) {
		pointPos = new google.maps.LatLng(coords[i].coord_x, coords[i].coord_y);
		break;	// We need only first value bun we do not know its index
	}
	return pointPos;
}
function gmpGetShapeRadius(coords) {
	var radius = 0;

	for(var i in coords) {
		radius = coords[i].radius && isNumber(coords[i].radius) ? parseInt(coords[i].radius) : radius;
		break;	// We need only first value bun we do not know its index
	}
	return radius;
}
