var g_gmpCustomControlsBgColorLast = ''
,	g_gmpCustomControlsTxtColorLast = '';
jQuery(document).ready(function(){
	var controlsTypeClasses = ['gmpSquareControls', 'gmpRoundedEdgesControls', 'gmpRoundControls'];

	jQuery('#gmpMapForm [name="map_opts[enable_custom_map_controls]"]').change(function(){
		var mapCustomControlsDiv = jQuery('.gmpCustomControlsShell');

		if(parseInt(jQuery(this).val())) {
			var customCtrlParamKeys = [
					'custom_controls_type',
					'custom_controls_unit',
					'custom_filter_show_all',
					'custom_controls_bg_color',
					'custom_controls_txt_color',
					'custom_controls_position',
					'custom_controls_slider_min',
					'custom_controls_slider_max']
			,	viewId = g_gmpMap.getViewId();

			for(var i = 0; i < customCtrlParamKeys.length; i++) {
				g_gmpMap.setParam(customCtrlParamKeys[ i ], jQuery('#gmpMapForm [name="map_opts['+ customCtrlParamKeys[ i ]+ ']"]').val());
			}
			gmpWpColorpickerUpdateBgColor();
			gmpWpColorpickerUpdateTxtColor();
			// Hide default zoom control
			var zoomControlOptions = g_gmpMap.get('zoomControlOptions') || {};
			zoomControlOptions.style = google.maps.ZoomControlStyle['none'];
			g_gmpMap.set('zoomControlOptions', zoomControlOptions).set('zoomControl', false);
			g_gmpCustomMapControls.initControls( g_gmpMap );
			mapCustomControlsDiv.show();
			gmpCustomFormsPosition(jQuery('#gmpMapForm [name="map_opts[custom_controls_position]"]').val(), viewId);
		} else {
			// Trigger refresh default zoom control
			jQuery('#gmpMapForm select[name="map_opts[zoom_control]"]').trigger('change');
			mapCustomControlsDiv.hide();
		}
	});

	jQuery('#gmpMapForm [name="map_opts[custom_controls_improve_search]"]').on('change', function() {
		var isChecked = jQuery(this).is(':checked')
		,	$improveSearchWr = jQuery('.gmpImproveSearchContainer')
		,	$gmpSearchShell = jQuery('.gmpSearchShell')
		,	$gmpFilterShell = jQuery('.gmpFilterShell')
		;
		if(isChecked) {
			$improveSearchWr.show();
			$gmpSearchShell.hide();
			$gmpFilterShell.hide();
		} else {
			$improveSearchWr.hide();
			$gmpSearchShell.show();
			//check if filter disabled not display here
			if(!jQuery('#gmpMapForm [name="map_opts[button_filter_enable]"]').is(':checked')){
				$gmpFilterShell.show();
			}
		}
	});

	jQuery('#gmpMapForm [name="map_opts[button_filter_enable]"]').on('change', function() {
		var isChecked = jQuery(this).is(':checked')
		,	$gmpFilterShell = jQuery('.gmpFilterShell');

		if(isChecked) {
			$gmpFilterShell.hide();
		} else {
			$gmpFilterShell.show();
		}
	});

	jQuery('#gmpMapForm [name="map_opts[custom_controls_type]"]').change(function(){
		var addClass = jQuery(this).val();
		jQuery('.gmpCustomControlsShell').find('.gmpCustomControlButton').each(function(){
			for(var i in controlsTypeClasses){
				if(jQuery(this).hasClass(controlsTypeClasses[i])){
					jQuery(this).removeClass(controlsTypeClasses[i]);
				}
			}
			jQuery(this).addClass(addClass);
		});
	});
	jQuery('#gmpMapForm [name="map_opts[custom_controls_position]"]').change(function(){
		var newControlsPosition = jQuery(this).val()
		,	mapControlOptions = g_gmpMap.get('mapCustomControlsPosition') || {}
		,	viewId = g_gmpMap.getViewId()
		,	mapCustomControlsDiv = document.getElementById('gmpCustomControlsShell_' + viewId)
		,	controls = g_gmpMap.getRawMapInstance().controls;

		// not saved map here
		if(!mapCustomControlsDiv) {
            mapCustomControlsDiv = document.getElementById('gmpCustomControlsShell_');
        }

		for(var i in controls) {
			for (var j in controls[i].j) {
				if (mapControlOptions && controls[i].j[j] == mapCustomControlsDiv) {
					controls[i].removeAt(j);
				}
			}
		}
		mapControlOptions.position = google.maps.ControlPosition[newControlsPosition];
		g_gmpMap.set('mapCustomControlsPosition', mapControlOptions);
		// clear controls
        var controlsLength = g_gmpMap.getRawMapInstance().controls.length;
        for(var i = 1;i< controlsLength;i++){
			try {
				if(g_gmpMap.getRawMapInstance().controls[i].length && g_gmpMap.getRawMapInstance().controls[i].b[0]) {
					g_gmpMap.getRawMapInstance().controls[i].clear();
				}
			} catch (err) {
				//console.log(err);
			}
        }
		g_gmpMap.getRawMapInstance().controls[google.maps.ControlPosition[newControlsPosition]].push(mapCustomControlsDiv);
		g_gmpMap.refresh();
		gmpCustomFormsPosition(newControlsPosition, viewId);
	});
	jQuery('#gmpMapForm input[name="map_opts[custom_controls_slider_min]"]').change(function(){
		var sliderMinValue = jQuery(this).val();
		jQuery('.gmpCustomControlsShell').find('.gmpSliderMin').each(function(){
			jQuery(this).text(sliderMinValue);
		});
	});
	jQuery('#gmpMapForm input[name="map_opts[custom_controls_slider_max]"]').change(function(){
		var sliderMaxValue = jQuery(this).val();
		jQuery('.gmpCustomControlsShell').find('.gmpSliderMax').each(function(){
			jQuery(this).text(sliderMaxValue);
		});
	});
});
function wpColorPicker_map_optscustom_controls_bg_color_change(event, ui) {
	g_gmpCustomControlsBgColorLast = ui.color.toString();
	setTimeout(function(){
		gmpWpColorpickerUpdateBgColor();
	}, 500);
}
function wpColorPicker_map_optscustom_controls_txt_color_change(event, ui) {
	g_gmpCustomControlsTxtColorLast = ui.color.toString();
	setTimeout(function(){
		gmpWpColorpickerUpdateTxtColor();
	}, 500);
}
function gmpWpColorpickerUpdateBgColor() {
	var currentBgColor = jQuery('#gmpMapForm input[name="map_opts[custom_controls_bg_color]"]').val()
	,	customControlsShell = jQuery('.gmpCustomControlsShell');

	customControlsShell.find('.gmpCustomControlButton').each(function(){
		jQuery(this).css('background-color', currentBgColor);
	});
	customControlsShell.find('.gmpSearchForm').each(function(){
		jQuery(this).css('border', '2px solid ' + currentBgColor);
	});
	customControlsShell.find('button').each(function(){
		jQuery(this).css('background-color', currentBgColor);
	});
	customControlsShell.find('.gmpFilterFormMarkerGroup').each(function(){
		jQuery(this).css('background-color', currentBgColor);
	});
}
function gmpWpColorpickerUpdateTxtColor() {
	var currentTxtColor = jQuery('#gmpMapForm input[name="map_opts[custom_controls_txt_color]"]').val()
	,	customControlsShell = jQuery('.gmpCustomControlsShell');

	customControlsShell.find('.gmpCustomControlButton').each(function(){
		jQuery(this).css('color', currentTxtColor);
	});
	customControlsShell.find('button').each(function(){
		jQuery(this).css('color', currentTxtColor);
	});
	customControlsShell.find('.gmpFilterFormMarkerGroup').each(function(){
		jQuery(this).css('color', currentTxtColor);
	});
}
function gmpCustomFormsPosition(newControlsPosition, viewId) {
	jQuery('#gmpCustomSearchFormShell_'+ viewId).css({'top': 'auto', 'left': 'auto', 'right': 'auto', 'bottom': 'auto'});
	jQuery('#gmpCustomFilterFormShell_'+ viewId).css({'top': 'auto', 'left': 'auto', 'right': 'auto', 'bottom': 'auto'});
	g_gmpCustomMapControls.controlsFormsPosition(newControlsPosition, viewId);
}
