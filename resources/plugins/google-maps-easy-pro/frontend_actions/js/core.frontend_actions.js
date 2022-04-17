var g_gmpMarkerFormMarker = false;
jQuery(document).ready(function() {

	var frontendMarkerAddForms = jQuery('.gmpFrontendMarkerAddForm')
	,	frontendMarkerDeleteForms = jQuery('.gmpFrontendMarkerDeleteForm');

	frontendMarkerDeleteForms.each(function() {
		var self = jQuery(this)
		,	formViewId = self.data('form_view_id');

		if(typeof(jQuery.fn.mapSearchAutocompleateGmp) != 'function') {
			// We do not need a message because this is subform at te moment
			return;
		}
		self.submit(function(){
			if(!jQuery('select[name="marker_id"]').val()) {
				jQuery('#gmpFrontendNoMarkerMsg_' + formViewId).show();
				return false;
			}
			self.sendFormGmp({
				msgElID: 'gmpFrontendMarkerDeleteFormMsg_' + formViewId
			,	btn: self.find('button[type="submit"]')
			,	onSuccess: function(res) {
					if(!res.error) {
						if(gmpIsMapOnPage(res.data.map)) {
							location.reload();
						}
					}
				}
			});
			return false;
		});
		self.show();
	});
	frontendMarkerAddForms.each(function() {
		var self = jQuery(this)
		,	formViewId = self.data('form_view_id')
		,	mapId = self.find('input[name="marker_opts[map_id]"]').val()
		,	isMapOnPage = gmpIsMapOnPage(mapId);

		if(isMapOnPage) {
			gmpAddMapListeners(mapId, self);
		} else {
			self.find('#gmpAddNewMarkerBtn').hide();
		}
		if(typeof(jQuery.fn.mapSearchAutocompleateGmp) != 'function') {
			jQuery('#gmpFrontendNoMapMsg_' + formViewId).show();
			return;
		}
		self.find('input[name="marker_opts[address]"]').mapSearchAutocompleateGmp({
			msgEl: ''
		,	onSelect: function(item, event, ui) {
				if(item) {
					self.find('input[name="marker_opts[coord_x]"]').val(item.lat);
					self.find('input[name="marker_opts[coord_y]"]').val(item.lng);
				}
			}
		});
		self.submit(function(){
			var markerFormTxtEditorId = self.find('[name="markerDescripton"]').attr('id');

			jQuery('#gmpFrontendNoMapMsg_' + formViewId).hide();
			self.find('input[name="marker_opts[description]"]').val( gmpGetTxtEditorVal(markerFormTxtEditorId) );
			self.sendFormGmp({
				msgElID: 'gmpFrontendMarkerAddFormMsg_' + formViewId
			,	btn: self.find('button[type="submit"]')
			,	onSuccess: function(res) {
					if(!res.error) {
						if(gmpIsMapOnPage(res.data.marker.map_id)) {
							if(g_gmpMarkerFormMarker) {
								g_gmpMarkerFormMarker.setMap(null);
								g_gmpMarkerFormMarker = false;
							}
							location.reload();
						}
					}
				}
			});
			return false;
		});

		self.show();

		frontendMarkerAddForms.find('select[name="marker_opts[marker_group_id][]"]').chosen();
	});
	gmpInitFrontendMarkerFormIconsWnd();
});
function gmpInitFrontendMarkerFormIconsWnd() {
	var frontendMarkerAddForms = jQuery('.gmpFrontendMarkerForm')
	,	$container = gmpInitFrontendDialogWnd();

	frontendMarkerAddForms.each(function() {
		var self = jQuery(this);

		self.find('.gmpFrontendMarkerIconBtn').click(function(e){
			$container.data('form_view_id', self.data('form_view_id'));
			$container.dialog('open');
			return false;
		});
		jQuery('.gmpFrontendMarkerPreviewIcon').click(function(e){
			var that = jQuery(this)
			,	markerFormViewId = that.parents('#gmpFrontendMarkerIconsWnd').data('form_view_id')
			,	markerForm = jQuery('#gmpFrontendMarkerAddForm_' + markerFormViewId)
			,	newId = that.data('id');

			markerForm.find('input[name="marker_opts[icon]"]').val( newId );
			gmpSetFrontendMarkerIconImg( markerForm );
			$container.dialog('close');
			return false;
		});
	});
}
function gmpInitFrontendDialogWnd(markerForm) {
	var markerIconsWnd = jQuery('#gmpFrontendMarkerIconsWnd');

	if(markerIconsWnd.hasClass('ui-dialog-content')) {
		return markerIconsWnd;
	}
	return markerIconsWnd.dialog({
		modal: true
	,	autoOpen: false
	,	width: 550
	,	height: 500
	});
}
function gmpSetFrontendMarkerIconImg(markerForm) {
	var id = parseInt( markerForm.find('input[name="marker_opts[icon]"]').val() )
	,	src = jQuery('.gmpFrontendMarkerPreviewIcon[data-id="'+ id+ '"] img').attr('src');

	markerForm.find('.gmpFrontendMarkerIconImg').attr('src', src);
	if(g_gmpMarkerFormMarker) {
		g_gmpMarkerFormMarker.setIcon(src);
	}
}
function gmpIsMapOnPage(id) {
	if(typeof(gmpGetMapInfoById) == 'function') {
		// check map info because map can not be init on page yet
		return gmpGetMapInfoById(id);
	}
	return false;
}
function gmpAddMapListeners(mapId, form) {
	var map = gmpGetMapById(mapId);

	if(map) {
		form.find('#gmpAddNewMarkerBtn').on('click', function(e) {
			e.preventDefault();
			var that = jQuery(this);

			that.toggleClass('gmpActive');

			if(that.hasClass('gmpActive')) {
				var eventHandle = google.maps.event.addListener(map.getRawMapInstance(), 'click', jQuery.proxy(function(e){
					var lat = e.latLng.lat()
					,	lng = e.latLng.lng();

					if(!g_gmpMarkerFormMarker) {
						var params = {
							coord_x: lat,
							coord_y: lng,
							icon: form.find('.gmpFrontendMarkerIconImg').attr('src')
						};
						g_gmpMarkerFormMarker = new gmpGoogleMarker(map, params);
					} else {
						g_gmpMarkerFormMarker.setPosition(lat, lng);
					}
					form.find('input[name="marker_opts[coord_x]"]').val(lat);
					form.find('input[name="marker_opts[coord_y]"]').val(lng);
				}, map));
				map._addEventListenerHandle('click', 'markerFormAddMarkerByClick', eventHandle);
			} else {
				if(g_gmpMarkerFormMarker) {
					g_gmpMarkerFormMarker.setMap(null);
					g_gmpMarkerFormMarker = false;
				}
				google.maps.event.removeListener(map._getEventListenerHandle('click', 'markerFormAddMarkerByClick'));
			}
			return false;
		});
	} else {
		setTimeout(function() {
			gmpAddMapListeners(mapId, form)
		}, 50)
	}
}