var	g_gmpMapHeatmap = null
,	g_gmpHeatmapFormChanged = false
,	g_gmpHeatmapGradient = null
,	g_gmpHeatmapGradientColorLast = ''
,	g_gmpHeatmapGradientColorTimeoutSet = '';
jQuery(document).ready(function() {
	jQuery.sendFormGmp({
		data: { mod: 'heatmap', action: 'getHeatmap', map_id: g_gmpMap.getId() }
	,	onSuccess: function(res) {
			if(!res.error) {
				if(res.data && res.data.heatmap) {
					if(!res.data.update) {
						jQuery('#gmpHeatmapForm input[name="heatmap_opts[id]"]').val( res.data.heatmap.id );
						var heatmap = gmpGetHeatmap();
						if(heatmap)
							heatmap.setId(res.data.heatmap.id);
					}
					gmpRefreshMapHeatmapLayer(res.data.heatmap);
				} else {
					_gmpCreateNewMapHeatmap();
				}
				gmpSetHeatmapForm();
			}
		}
	});
	gmpResetHeatmapForm();
	// Heatmaps form functionality
	jQuery('#gmpHeatmapForm').find('input,textarea,select').change(function(){
		_gmpChangeHeatmapForm();
	});
	jQuery('#gmpHeatmapAddPointBtn').click(function() {
		jQuery(this).toggleClass('gmpAddActivated');

		if(jQuery(this).hasClass('gmpAddActivated')) {
			gmpUnshiftButtons({
				gmpHeatmapRemovePointBtn: 'gmpRemoveActivated'
			,	gmpShapeAddPointByClickBtn: 'gmpAddByClickActivated'
			});
			console.log(123);
			var eventHandle = google.maps.event.addListener(g_gmpMap.getRawMapInstance(), 'click', jQuery.proxy(function(e){
				var point = { coord_x: e.latLng.lat(),	coord_y: e.latLng.lng() }
				,	heatmap = gmpGetHeatmap();

				if(!heatmap) {
					_gmpCreateNewMapHeatmap();
					heatmap = gmpGetHeatmap();
				}

				heatmap.setData(point);
				jQuery('#gmpHeatmapForm #gmpHeatmapPointsNumber').html( heatmap.getHeatmapParam('coords').length );
			}, this));

			g_gmpMap._addEventListenerHandle('click', 'heatmapAddPoint', eventHandle);
		} else {
			google.maps.event.removeListener(g_gmpMap._getEventListenerHandle('click', 'heatmapAddPoint'));
		}
		return false;
	});
	jQuery('#gmpHeatmapRemovePointBtn').click(function() {
		jQuery(this).toggleClass('gmpRemoveActivated');

		if(jQuery(this).hasClass('gmpRemoveActivated')) {
			gmpUnshiftButtons({
				gmpHeatmapAddPointBtn: 'gmpAddActivated'
			,	gmpShapeAddPointByClickBtn: 'gmpAddByClickActivated'
			});

			var eventHandle = google.maps.event.addListener(g_gmpMap.getRawMapInstance(), 'click', jQuery.proxy(function(e){
				var heatmap = gmpGetHeatmap();
				if(!heatmap) {
					_gmpCreateNewMapHeatmap();
					heatmap = gmpGetHeatmap();
				}
				var curHeatmapData = heatmap.getData().g
				,	newHeatmapData = []
				,	circle = new google.maps.Circle({
						strokeColor: '#6699ff'
					,	strokeOpacity: 0	//0.8
					,	strokeWeight: 2
					,	fillColor: '#6699ff'
					,	fillOpacity:  0		//0.35
					,	map: g_gmpMap.getRawMapInstance()
					,	center: new google.maps.LatLng(e.latLng.lat(), e.latLng.lng())
					,	radius: 300
				})
				,	bounds = circle.getBounds();

				for(var i in curHeatmapData) {
					if(!bounds.contains(curHeatmapData[i])) {
						newHeatmapData.push(curHeatmapData[i]);
					}
				}

				circle.setMap(null);

				heatmap.setData(newHeatmapData);
				jQuery('#gmpHeatmapForm #gmpHeatmapPointsNumber').html( g_gmpMap.getHeatmap().getHeatmapParam('coords').length );
			}, this));

			g_gmpMap._addEventListenerHandle('click', 'heatmapRemovePoint', eventHandle);
		} else {
			google.maps.event.removeListener(g_gmpMap._getEventListenerHandle('click', 'heatmapRemovePoint'));
		}
		return false;
	});
	jQuery('#gmpHeatmapAddColorBtn').click(function() {
		gmpHeatmapDrawColorRow();
		gmpUpdateHeatmapGradient();
		return false;
	});
	jQuery('#gmpHeatmapClearColorsBtn').click(function() {
		gmpHeatmapClearColorRows();
		return false;
	});
	jQuery('#gmpHeatmapForm select[name="heatmap_opts[params][opacity]"]').change(function() {
		var heatmap = gmpGetHeatmap();
		if(!heatmap) {
			_gmpCreateNewMapHeatmap();
			heatmap = gmpGetHeatmap();
		}
		heatmap.setOpacity(jQuery(this).val());
	});
	jQuery('#gmpHeatmapForm input[name="heatmap_opts[params][radius]"]').change(function() {
		var heatmap = gmpGetHeatmap();
		if(!heatmap) {
			_gmpCreateNewMapHeatmap();
			heatmap = gmpGetHeatmap();
		}
		heatmap.setRadius(jQuery(this).val());
	});
	// Heatmap deleting
	jQuery('#gmpHeatmapDeleteBtn').click(function(){
		if(confirm('Remove all Heatmap Layer points?')) {
			jQuery.sendFormGmp({
				btn: this
			,	data: {action: 'removeHeatmap', mod: 'heatmap', id: g_gmpMap.getHeatmap().getHeatmapParam('id')}
			,	onSuccess: function(res) {
					if(!res.error) {
						gmpResetHeatmapForm();
						_gmpCreateNewMapHeatmap();
						g_gmpMap.getHeatmap().removeFromMap();
					}
				}
			});
		}
		return false;
	});
	// Heatmap saving
	jQuery('#gmpSaveHeatmapBtn').click(function(){
		jQuery('#gmpHeatmapForm').submit();
		return false;
	});
	jQuery('#gmpHeatmapForm').submit(function(){
		var currentMapId = gmpGetCurrentId()
		,	currentHeatmapMapId = parseInt(jQuery('#gmpHeatmapForm input[name="heatmap_opts[map_id]"]').val() )
		,	onlySave = parseInt(jQuery(this).data('only-save'));

		if(currentMapId && !currentHeatmapMapId) {
			jQuery('#gmpHeatmapForm input[name="heatmap_opts[map_id]"]').val( currentMapId );
		}
		if(onlySave) {
			jQuery(this).data('only-save', 0);
		}
		jQuery(this).sendFormGmp({
			btn: jQuery('#gmpSaveHeatmapBtn')
		,	appendData: { heatmap_coords: g_gmpMap.getHeatmap().getHeatmapParam('coords') }
		,	onSuccess: function(res) {
				if(!res.error) {
					if(!onlySave) {
						if(!res.data.update) {
							jQuery('#gmpHeatmapForm input[name="heatmap_opts[id]"]').val( res.data.heatmap.id );
							var heatmap = gmpGetHeatmap();
							if(heatmap)
								heatmap.setId(res.data.heatmap.id);
						}
					}
					_gmpUnchangeHeatmapForm();
				}
			}
		});
		return false;
	});
});
function _gmpCreateNewMapHeatmap(params) {
	var newHeatmapData = params ? params : { data: [] };
	gmpSetHeatmap(g_gmpMap.addHeatmap( newHeatmapData ));
}
function gmpSetHeatmap(heatmap) {
	g_gmpMapHeatmap = heatmap;
}
function gmpGetHeatmap() {
	return g_gmpMapHeatmap;
}
function gmpRefreshMapHeatmapLayer(heatmap) {
	gmpRefreshMapHeatmap(g_gmpMap, heatmap);
	var currentFormHeatmap = parseInt( jQuery('#gmpHeatmapForm input[name="heatmap_opts[id]"]').val() );
	if(currentFormHeatmap) {
		var editMapHeatmap = g_gmpMap.getHeatmap();
		if(editMapHeatmap) {
			gmpSetHeatmap( editMapHeatmap );
		}
	}
}
function gmpRefreshMapHeatmap(map, heatmap) {
	heatmap = _gmpPrepareHeatmapListAdmin( heatmap );
	map.addHeatmap( heatmap );
}
function _gmpPrepareHeatmapListAdmin(heatmap) {
	return _gmpPrepareHeatmapList(heatmap);
}
// Heatmaps form check change actions
function _gmpIsHeatmapFormChanged() {
	return g_gmpHeatmapFormChanged;
}
function _gmpChangeHeatmapForm() {
	g_gmpHeatmapFormChanged = true;
}
function _gmpUnchangeHeatmapForm() {
	g_gmpHeatmapFormChanged = false;
}
function gmpSetHeatmapForm() {
	var heatmap = g_gmpMap.getHeatmap();

	if(heatmap) {
		var heatmapParams = heatmap.getRawHeatmapParams();
		jQuery('#gmpHeatmapForm #gmpHeatmapPointsNumber').html( heatmapParams.coords ? heatmapParams.coords.length : '0' );
		jQuery('#gmpHeatmapForm input[name="heatmap_opts[id]"]').val( heatmapParams.id );
		jQuery('#gmpHeatmapForm select[name="heatmap_opts[params][opacity]"]').val( heatmapParams.opacity ? heatmapParams.opacity : '0.6' );
		jQuery('#gmpHeatmapForm input[name="heatmap_opts[params][radius]"]').val( heatmapParams.radius ? heatmapParams.radius : '10' );
		if(heatmapParams.gradient) {
			var firstColor = heatmapParams.gradient.slice(0,1);

			jQuery('.firstHeatmapColor').val(firstColor);
			for(var i = 1; i < heatmapParams.gradient.length; i++) {
				gmpHeatmapDrawColorRow({ color: heatmapParams.gradient[i] });
			}
		}
	}
}
function gmpResetHeatmapForm() {
	gmpSetHeatmap( null );
	jQuery('#gmpHeatmapForm')[0].reset();
	jQuery('#gmpHeatmapForm #gmpHeatmapPointsNumber').html('0');
	jQuery('#gmpHeatmapForm select[name="heatmap_opts[params][opacity]"]').val('0.6');
	jQuery('#gmpHeatmapForm input[name="heatmap_opts[params][radius]"]').val('10');
}
function gmpHeatmapClearColorRows() {
	var heatmap = gmpGetHeatmap();

	if(!heatmap) {
		_gmpCreateNewMapHeatmap();
		heatmap = gmpGetHeatmap();
	}
	jQuery('#gmpHeatmapGradientContainer .gmpHeatmapGradient').each(function() {
		jQuery(this).animateRemoveGmp(300);
	});
	g_gmpHeatmapGradient = null;
	heatmap.setGradient(g_gmpHeatmapGradient);
}
function gmpHeatmapDrawColorRow(params) {
	params = params || {};
	if(!params.colorsShell) {
		params.colorsShell = jQuery('#gmpHeatmapGradientContainer');
	}
	var colorbox = jQuery('.gmpHeatmapGradientExample').clone()
	,	input = colorbox.find('input[type="text"]');

	colorbox.removeClass('gmpHeatmapGradientExample');
	input.removeAttr('disabled');
	if(params.color) {
		input.val(params.color);
	}
	input.wpColorPicker({
		change: function(event, ui) {
			// Find change functiona for this element, if such exist - triger it
			if(window['wpColorPicker_gmpHeatmapGradient_change']) {
				window['wpColorPicker_gmpHeatmapGradient_change'](event, ui);
			}
		}
	});
	params.colorsShell.append(colorbox.show());
}
function wpColorPicker_gmpHeatmapGradient_change(event, ui) {
	g_gmpHeatmapGradientColorLast = ui.color.toString();
	if(!g_gmpHeatmapGradientColorTimeoutSet) {
		setTimeout(function(){
			gmpUpdateHeatmapGradient();
			g_gmpHeatmapGradientColorTimeoutSet = false;
		}, 500);
		g_gmpHeatmapGradientColorTimeoutSet = true;
	}
}
function gmpUpdateHeatmapGradient() {
	var heatmap = gmpGetHeatmap();

	if(!heatmap) {
		_gmpCreateNewMapHeatmap();
		heatmap = gmpGetHeatmap();
	}
	jQuery('#gmpHeatmapGradientContainer [name="heatmap_opts[params][gradient][]"]').each(function(index, value) {
		var color = jQuery.trim(jQuery(this).val());
		if(!index) {
			var rgb = gmpHexToRGB(color)
			,	rgbaColor = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)';
			// first color must be set twice - first time with opacity 0 for heatmap point blur
			g_gmpHeatmapGradient = [rgbaColor];
			jQuery('.firstHeatmapColor').val(rgbaColor)
		}
		g_gmpHeatmapGradient.push(color);
	});
	heatmap.setGradient(g_gmpHeatmapGradient);
}
function gmpHexToRGB(hex) {
	hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
	return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
}
function gmpHeatmapRemoveColorBtnClick(btn) {
	jQuery(btn).parents('.gmpHeatmapGradient:first').animateRemoveGmp(300, function() {
		gmpUpdateHeatmapGradient();
	});
}
