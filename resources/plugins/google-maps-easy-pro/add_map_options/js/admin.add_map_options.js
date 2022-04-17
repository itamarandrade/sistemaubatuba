jQuery(document).ready(function(){
	// Map element position
	jQuery('#gmpMapForm .gmpMapPosChangeSelect').change(function(){
		var newPosition = jQuery(this).val();
		if(newPosition && google.maps.ControlPosition[ newPosition ]) {
			var optionDataKey = jQuery(this).data('for')
			,	optionData = g_gmpMap.get( optionDataKey ) || {};
			optionData.position = google.maps.ControlPosition[ newPosition ];
			g_gmpMap.set(optionDataKey, optionData);
		}
	});
	jQuery('#gmpMapForm input[name="map_opts[enable_trafic_layer]"]').change(function(){
		// Remember - that this is not actually checkbox, we detect hidden field value here, @see htmlGmp::checkboxHiddenVal()
		if(parseInt(jQuery(this).val())) {
			if(!g_gmpMap.getLayer('trafic')) {
				g_gmpMap.createTraficLayer();
			}
			g_gmpMap.enbLayer('trafic');
		} else {
			g_gmpMap.dsblLayer('trafic');
		}
	});
	jQuery('#gmpMapForm input[name="map_opts[enable_transit_layer]"]').change(function(){
		// Remember - that this is not actually checkbox, we detect hidden field value here, @see htmlGmp::checkboxHiddenVal()
		if(parseInt(jQuery(this).val())) {
			if(!g_gmpMap.getLayer('transit')) {
				g_gmpMap.createTransitLayer();
			}
			g_gmpMap.enbLayer('transit');
		} else {
			g_gmpMap.dsblLayer('transit');
		}
	});
	jQuery('#gmpMapForm input[name="map_opts[enable_bicycling_layer]"]').change(function(){
		// Remember - that this is not actually checkbox, we detect hidden field value here, @see htmlGmp::checkboxHiddenVal()
		if(parseInt(jQuery(this).val())) {
			if(!g_gmpMap.getLayer('bicycling')) {
				g_gmpMap.createBicyclingLayer();
			}
			g_gmpMap.enbLayer('bicycling');
		} else {
			g_gmpMap.dsblLayer('bicycling');
		}
	});
	jQuery('#gmpMapForm input[name="map_opts[hide_poi]"]').change(function(){
		g_gmpMap.setParam('hide_poi', parseInt(jQuery(this).val()));
		gmpStylesToggle(g_gmpMap, 'hide_poi');
	});
	jQuery('#gmpMapForm input[name="map_opts[hide_countries]"]').change(function(){
		g_gmpMap.setParam('hide_countries', parseInt(jQuery(this).val()));
		gmpStylesToggle(g_gmpMap, 'hide_countries');
	});
	jQuery('#gmpMapForm input[name="map_opts[center_on_cur_user_pos]"]').change(function(){
		gmpCurUserPosOptionsToggle(jQuery(this).val());
	});
	gmpCurUserPosOptionsToggle(g_gmpMap.getParam('center_on_cur_user_pos'));
	// Init window to choose marker for Center On Current User Position option
	gmpInitCurUserPosIconsWnd();
	gmpSetCurUserPosIconImg();
});
function gmpInitCurUserPosIconsWnd() {
	var $container = gmpInitMarkerIconsDialogWnd()
	,	dialodClasses =  gmpGetDialogClasses();

	jQuery('#gmpCurUserPosIconBtn').click(function(){
		$container.addClass(dialodClasses.curUserPosIcon);
		$container.dialog('open');
		return false;
	});
	jQuery('.previewIcon').click(function(){
		if($container.hasClass(dialodClasses.curUserPosIcon)) {
			var newId = jQuery(this).data('id');
			jQuery('#gmpMapForm input[name="map_opts[center_on_cur_user_pos_icon]"]').val( newId );
			gmpSetCurUserPosIconImg();
			$container.dialog('close');
			return false;
		}
	});
	/*
	 * wp media upload
	 *
	 */
	jQuery('#gmpUploadCurUserPosIconBtn').click(function(e){
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
			var attachment = custom_uploader.state().get('selection').first().toJSON()
			,	respElem = jQuery('.gmpCurUserPosUplRes')
			,	sendData = {
					page: 'icons'
				,	action: 'saveNewIcon'
				,	reqType: 'ajax'
				,	icon: {
						url: attachment.url
					}
				};
			if(attachment.title != undefined){
				sendData.icon.title = attachment.title;
			}
			if(attachment.description != undefined){
				sendData.icon.description = attachment.description;
			}
			jQuery.sendFormGmp({
				msgElID: respElem
			,	data: sendData
			,	onSuccess: function(res){
					if(!res.error) {
						drawNewCurUserPosIcon(res.data);
					} else {
						respElem.html(data.error.join(','));
					}
				}
			});
		});
		//Open the uploader dialog
		custom_uploader.open();
	});
}
function gmpSetCurUserPosIconImg() {
	var id = parseInt( jQuery('#gmpMapForm input[name="map_opts[center_on_cur_user_pos_icon]"]').val() );
	jQuery('#gmpCurUserPosIconPrevImg').attr('src', jQuery('.previewIcon[data-id="'+ id+ '"] img').attr('src'));
}
function drawNewCurUserPosIcon(icon){
	if(typeof(icon.data) == undefined){
		return;
	}
	jQuery('#gmpMapForm input[name="map_opts[center_on_cur_user_pos_icon]"]').val(icon.id);
	var newIcon = '<li class="previewIcon" data-id="'+ icon.id+ '" title="'+ icon.title+ '"><img src="'+ icon.url+ '"><i class="fa fa-times" aria-hidden="true"></i></li>';
	jQuery('ul.iconsList').append(newIcon);
	gmpSetCurUserPosIconImg();
}
function gmpCurUserPosOptionsToggle(val) {
	if(parseInt(val))
		jQuery('#gmpCurUserPosOptions').show();
	else
		jQuery('#gmpCurUserPosOptions').hide();
}