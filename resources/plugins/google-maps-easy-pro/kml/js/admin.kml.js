jQuery(document).ready(function(){
	gmpKmlupdateFileListForMap();
	jQuery('#gmpKmlAddFileRowBtn').click(function(){
		gmpKmlDrawFileRow();
		return false;
	});
});
var gmpKmlMarkerImportIter = 0;
function gmpKmlDrawFileRow(params) {
	params = params || {};
	if(!params.filesShell) {
		params.filesShell = jQuery('#gmpKmlFileRowsShell');
	}
	var newCell = jQuery('#gmpKmlFileRowExample').clone().removeAttr('id')
	,	urlTxt = newCell.find('input[name="map_opts[kml_file_url][]"]')
	,	showSublayersTxt = newCell.find('input[name="map_opts[kml_filter][show_sublayers][]"]')
	,	showSublayersLabel = newCell.find('.gmpShowSublayersLabel')
	,	showSublayersChecked = params.showSublayers ? 'checked="checked"' : ''
	,	$kmlImportMarkerLbl = newCell.find('.gmpKmlImportToMarkerLbl .gmpKitmLblText')
	,	$kmlImportMarkerHid = jQuery('.gmpKmlImportToMarkerHid[data-order="' + gmpKmlMarkerImportIter + '"]')
	,	$kmlImportMarker = jQuery('<input type="checkbox" name="map_opts[kml_import_to_marker][' + gmpKmlMarkerImportIter + ']" class="gmpKmlImportToMarker"/>')
	,	showSublayersCheckbox = jQuery('<input type="checkbox" name="map_opts[kml_filter_checkboxes][]" ' + showSublayersChecked + ' class="gmpProOpt" style="margin-left: 5px;" />')
	,	uploadBtn = newCell.find('.gmpKmlUploadFileBtn');

	if($kmlImportMarkerHid.val() == 1) {
		$kmlImportMarker.prop('checked', true);
	}
	urlTxt.removeAttr('disabled');
	showSublayersTxt.removeAttr('disabled');
	showSublayersTxt.val(parseInt(params.showSublayers));
	showSublayersLabel.append(showSublayersCheckbox);
	$kmlImportMarkerLbl.before($kmlImportMarker);

	showSublayersCheckbox.on('change', function() {
		var input = jQuery(this).parents('.gmpShowSublayersLabel:first').find('.gmpShowSublayersInput');

		if(jQuery(this).is(':checked')) {
			input.val('1');
		} else {
			input.val('0');
		}
	});

	if(params.fileUrl && params.fileUrl != '') {
		urlTxt.val( params.fileUrl );
	}
   if (typeof AjaxUpload === 'function') {
	var currAjax = new AjaxUpload(uploadBtn, {
		action: uploadBtn.data('url')
	,	name: 'kml_file'
	,	responseType: 'json'
	,	onSubmit: function() {
			if($kmlImportMarker.is(':checked')) {
				currAjax._settings.data['useMarkerImport'] = 1;
			}
			newCell.find('.gmpKmlUploadMsg').showLoaderGmp();
		}
	,	onComplete: function(file, res) {
			toeProcessAjaxResponseGmp(res, newCell.find('.gmpKmlUploadMsg'));
			if(!res.error) {
				newCell.find('input[name="map_opts[kml_file_url][]"]').val(res.data.file_url);
				gmapAddKMLLayer(res.data.file_url, g_gmpMap);

				if($kmlImportMarker.is(':checked')) {
					var resConfirm = confirm('To see the result, you need to save and reload the map. Do you want to do this?');
					if(resConfirm) {
						var $currMap = jQuery('#gmpMapForm');
						$currMap.off('gmpSaved').on('gmpSaved', function() {
							// reload this page
							window.location.href = window.location.pathname + window.location.search + window.location.hash;
						});
						jQuery('#gmpMapForm').submit();
					}
				}
			}
		}
	,	data: {
			_nonce: jQuery(uploadBtn).data('nonce')
		,	'mapId': jQuery('input[name="map_opts[id]"]').val()
		,	'useMarkerImport': 0
		}
	});
   }
	params.filesShell.append(newCell.show());
	gmpKmlMarkerImportIter++;
}
function gmpKmlRemoveFileRowBtnClick(btn) {
	var row = jQuery(btn).parents('.gmpKmlFileRow:first')
	,	url = row.find('input[name="map_opts[kml_file_url][]"]').val();

	gmapRemoveKMLLayer(url);
	row.animateRemoveGmp(300);
}
function gmpKmlupdateFileListForMap() {
	var fileUrls = []
	,	filesShell = jQuery('#gmpKmlFileRowsShell')
	,	kmlFileUrl = g_gmpMap.getParam('kml_file_url')
	,	kmlFilterShowSulayers = g_gmpMap.getParam('kml_filter');

	filesShell.html('');
	if(kmlFileUrl) {
		fileUrls = kmlFileUrl;
	} else {
		fileUrls.push('');
	}
	for(var i = 0; i < fileUrls.length; i++) {
		gmpKmlDrawFileRow({
			fileUrl: fileUrls[i]
		,	filesShell: filesShell
		,	showSublayers: kmlFilterShowSulayers && kmlFilterShowSulayers['show_sublayers'] ? parseInt(kmlFilterShowSulayers['show_sublayers'][i]) : ''
		});
	}
}
