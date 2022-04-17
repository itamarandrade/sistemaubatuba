jQuery(document).ready(function(){
	jQuery('.gmpMmlElement').click(function(){
		var key = jQuery(this).data('key');
		gmpMmlClickListStyle( key );
		return false;
	});
	jQuery('.gmpMmlApplyBtn').click(function(){
		var key = jQuery(this).parents('.gmpMmlElement:first').data('key');
		gmpMmlClickListStyle( key );
		return false;
	});
	var listTypeInput = jQuery('#gmpMapForm input[name="map_opts[markers_list_type]"]').val();
	if(listTypeInput && listTypeInput != '') {
		var selectedCell = jQuery('#gmpMml').find('.gmpMmlElement[data-key="'+ listTypeInput+ '"]');
		selectedCell.addClass('active');
		selectedCell.find('.gmpMmlApplyBtn').html( selectedCell.find('.gmpMmlApplyBtn').data('active-label') ).addClass('active');
		jQuery('#gmpMapMarkersListSettings').show();
		jQuery('#gmpMarkerListDefImgOptions').parents('tr:first').show();
	}
	// Marker options
	jQuery('#gmpMarkerForm input[name="marker_opts[params][marker_list_desc]"]').change(function(){
		jQuery('#gmpMarkerListDesc').css('display', jQuery(this).prop('checked') ? 'table-row' : 'none');
	});
	jQuery('#gmpMarkerForm input[name="marker_opts[params][marker_list_def_img]"]').change(function(){
		gmpAddMarkerListDefImgOptions(jQuery(this).prop('checked'));
	});
	jQuery('#gmpMarkerListDefImgUploadFileBtn').click(function(e){
		var custom_uploader;
		e.preventDefault();
		//If the uploader object has already been created, reopen the dialog
		if (custom_uploader) {
			custom_uploader.open();
			return;
		}
		//Extend the wp.media object
		custom_uploader = wp.media.frames.file_frame = wp.media({
			title: 'Choose Image'
			,	button: {
				text: 'Choose Image'
			}
			,	multiple: false
		});
		//When a file is selected, grab the URL and set it as the text field's value
		var currentForm = jQuery(this).parents('form');
		custom_uploader.on('select', function(){
			var attachment = custom_uploader.state().get('selection').first().toJSON();
			currentForm.find('input[name="marker_opts[params][marker_list_def_img_url]"]').val(attachment.url);
		});
		//Open the uploader dialog
		custom_uploader.open();
	});
});
function gmpMmlClickListStyle(key) {
	var list = jQuery('#gmpMml');
	list.find('.gmpMmlElement').removeClass('active');
	list.find('.gmpMmlApplyBtn').each(function(){
		jQuery(this).html( jQuery(this).data('apply-label') );
	}).removeClass('active');
	jQuery('#gmpMapMarkersListSettings').hide();
	jQuery('#gmpMarkerListDefImgOptions').parents('tr:first').hide();
	var listTypeInput = jQuery('#gmpMapForm input[name="map_opts[markers_list_type]"]')
	,	currentStyle = listTypeInput.val();
	if(currentStyle == key) {
		listTypeInput.val('');
	} else {
		listTypeInput.val( key );
		var selectedCell = list.find('.gmpMmlElement[data-key="'+ key+ '"]');
		selectedCell.addClass('active');
		selectedCell.find('.gmpMmlApplyBtn').html( selectedCell.find('.gmpMmlApplyBtn').data('active-label') ).addClass('active');
		jQuery('#gmpMapMarkersListSettings').show();
		jQuery('#gmpMarkerListDefImgOptions').parents('tr:first').show();
	}
	listTypeInput.change();
	jQuery('#gmpMarkersListWnd').dialog('close');
}
function gmpAddMarkerListDefImgOptions(val) {
	if(val) {
		jQuery('#gmpMarkerListDefImgOptions').css('display', 'inline');
	} else {
		jQuery('#gmpMarkerListDefImgOptions').css('display', 'none');
	}
}
