jQuery(document).ready(function() {
	var mapForm = jQuery('#gmpMapForm');

	mapForm.find('input[name="map_opts[frontend_add_markers]"]').change(function(){
		gmpAddMarkerFormOptions(jQuery(this).val());
	});
	mapForm.find('input[name="map_opts[frontend_add_markers_use_limits]"]').change(function(){
		gmpAddMarkerFormLimitsOptions(jQuery(this).val());
	});
	gmpAddMarkerFormOptions(g_gmpMap.getParam('frontend_add_markers'));
	gmpAddMarkerFormLimitsOptions(g_gmpMap.getParam('frontend_add_markers_use_limits'));
});
function gmpAddMarkerFormOptions(val) {
	val = parseInt(val);

	var	markerFormCodeShell = jQuery('#shortcodeCode .gmpMapMarkerFormCodeShell')
	,	markerOnFrontendOptions = jQuery('#gmpMapForm #gmpAddMarkersOnFrontendOptions');

	if(val) {
		markerFormCodeShell.parents('span:first').show(300);
		markerOnFrontendOptions.show(300);
	} else {
		markerFormCodeShell.parents('span:first').hide(300);
		markerOnFrontendOptions.hide(300);
	}
}
function gmpAddMarkerFormLimitsOptions(val) {
	val = parseInt(val);

	var limitsShell = jQuery('#gmpMapForm #gmpUseLimitsForMarkerAddingOptions');

	if(parseInt(val)) {
		limitsShell.show(300);
	} else {
		limitsShell.hide(300);
	}
}