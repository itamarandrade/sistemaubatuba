jQuery(document).ready(function() {
	jQuery('#gmpMapForm input[name="map_opts[enable_directions_btn]"]').change(function(){
		gmpDirectionsOptionsToggle(jQuery(this).val());
	});
	gmpDirectionsOptionsToggle(g_gmpMap.getParam('enable_directions_btn'));
});
function gmpDirectionsOptionsToggle(val) {
	if(parseInt(val))
		jQuery('#gmpDirectionsOptions').show();
	else
		jQuery('#gmpDirectionsOptions').hide();
}
