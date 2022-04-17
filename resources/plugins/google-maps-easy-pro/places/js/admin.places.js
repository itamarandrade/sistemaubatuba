jQuery(document).ready(function(){
	jQuery('#gmpMapForm [name="map_opts[places][en_toolbar]"]').change(function(){
		gmpSwitchPlacesToolbarOptions(jQuery(this).val())
	}).trigger('change');
});
function gmpSwitchPlacesToolbarOptions(val) {
	val = parseInt(val);

	var placesToolbarDiv = jQuery('#gmpPlacesToolbarOptions');

	if(parseInt(val)) {
		placesToolbarDiv.show(300);
	} else {
		placesToolbarDiv.hide(300);
	}
}