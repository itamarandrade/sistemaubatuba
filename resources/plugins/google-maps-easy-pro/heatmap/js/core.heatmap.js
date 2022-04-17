// Heatmaps
function gmpGoogleHeatmap(map, params) {
	this._map = map;
	this._heatmapObj = null;
	var defaults = {
		// Empty for now
	};
	if(!params.data && params.coords) {
		params.data = this.getCoordsFromDataPoints(params.coords);
	}
	this._heatmapParams = jQuery.extend({}, defaults, params);
	this._heatmapParams.map = this._map.getRawMapInstance();
	this.init();
}
gmpGoogleHeatmap.prototype.init = function() {
	this._heatmapObj = new google.maps.visualization.HeatmapLayer( this._heatmapParams );
};
gmpGoogleHeatmap.prototype.getRawHeatmapInstance = function() {
	return this._heatmapObj;
};
gmpGoogleHeatmap.prototype.getRawHeatmapParams = function() {
	return this._heatmapParams;
};
gmpGoogleHeatmap.prototype.getHeatmapParams = function(){
	return this._heatmapParams;
};
gmpGoogleHeatmap.prototype.setHeatmapParams = function(params) {
	this._heatmapParams = params;
	return this;
};
gmpGoogleHeatmap.prototype.getHeatmapParam = function(key){
	return this._heatmapParams[ key ];
};
gmpGoogleHeatmap.prototype.setHeatmapParam = function(key, value) {
	this._heatmapParams[ key ] = value;
	return this;
};
gmpGoogleHeatmap.prototype.setGradient = function(gradient) {
	this.setHeatmapParam('gradient', gradient);
	this._heatmapObj.setOptions({ gradient: gradient });
};
gmpGoogleHeatmap.prototype.setOpacity = function(opacity) {
	this.setHeatmapParam('opacity', opacity);
	this._heatmapObj.setOptions({ opacity: opacity });
};
gmpGoogleHeatmap.prototype.setRadius = function(radius) {
	this.setHeatmapParam('radius', radius);
	this._heatmapObj.setOptions({ radius: radius });
};
gmpGoogleHeatmap.prototype.getData = function() {
	return this._heatmapObj.getData();
};
gmpGoogleHeatmap.prototype.setData = function(data) {
	if(data.coord_x && data.coord_y) {
		var points = this.getDataPointsFromCoords(data);
		this._heatmapObj.setData( points );
	} else {
		this.getCoordsFromDataPoints(data);
		this._heatmapObj.setData(data);
	}
};
gmpGoogleHeatmap.prototype.getCoordsFromDataPoints = function(dataPoints) {
	var newDataPoints = [];

	for(var i in dataPoints) {
		newDataPoints.push([dataPoints[i].lat(), dataPoints[i].lng()]);
	}
	this.setHeatmapParam('coords', newDataPoints);
};
gmpGoogleHeatmap.prototype.getDataPointsFromCoords = function(coords) {
	var heatmapDataPoints = this.getData() || []
		,	heatmapCoords = this.getHeatmapParam('coords') || []
		,	point = new google.maps.LatLng(coords.coord_x, coords.coord_y);

	heatmapDataPoints.push(point);
	heatmapCoords.push([coords.coord_x, coords.coord_y]);
	this.setHeatmapParam('coords', heatmapCoords);
	return heatmapDataPoints;
};
gmpGoogleHeatmap.prototype.setId = function(id) {
	this._heatmapParams.id = id;
};
gmpGoogleHeatmap.prototype.getId = function() {
	return this._heatmapParams.id;
};
gmpGoogleHeatmap.prototype.setMap = function( map ) {
	this.getRawHeatmapInstance().setMap( map );
};
gmpGoogleHeatmap.prototype.getMap = function() {
	return this._map;
};
gmpGoogleHeatmap.prototype.removeFromMap = function() {
	this.getRawHeatmapInstance().setMap( null );
};
// Common functions
function _gmpPrepareHeatmapList(heatmap, params) {
	params = params || {};
	if(heatmap) {
		if(heatmap.coords) {
			heatmap.data = gmpGetHeatmapData(heatmap.coords);
			heatmap.coords = gmpGetHeatmapCoords(heatmap.coords);
			for(var i in heatmap.params) {
				heatmap[i] = heatmap.params[i];
			}
		}
	}
	return heatmap;
}
function gmpGetHeatmapData(coords) {
	if(coords) {
		var data = [];
		for(var i = 0; i < coords.length; i++) {
			var point = coords[i].split(',')
			,	pointPos = new google.maps.LatLng(point[0], point[1]);
			data.push(pointPos);
		}
		return data;
	}
}
function gmpGetHeatmapCoords(coords) {
	if(coords) {
		var coordsArr = [];
		for(var i = 0; i < coords.length; i++) {
			var point = coords[i].split(',');
			coordsArr.push([point[0], point[1]]);
		}
		return coordsArr;
	}
}