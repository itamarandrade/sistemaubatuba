var	g_gmpCurrentEditShape = null
,	g_gmpShapeFormChanged = false
,	g_gmpClearPointRows = false
,	g_gmpTinyMceShapeEditorUpdateBinded = false
,	g_gmpShapeStrokeColorLast = ''
,	g_gmpShapeStrokeColorTimeoutSet = false
,	g_gmpShapeFillColorLast = ''
,	g_gmpShapeFillColorTimeoutSet = false;
jQuery(document).ready(function() {
	var shapeForm = jQuery('#gmpShapeForm');

	// Build initial shapes list
	jQuery('#gmpShapesListGrid').jqGrid({
		url: gmpShapesTblDataUrl
	,	mtype: 'GET'
	,	datatype: 'json'
	,	colNames:[toeLangGmp('ID'), toeLangGmp('Title'), toeLangGmp('Type'), toeLangGmp('Actions')]
	,	colModel: [
			{ name: 'id', index: 'id', key: true, sortable: true, width: '90', align: 'center' }
		,	{ name: 'title', index: 'title', sortable: true, width: '250', align: 'center' }
		,	{ name: 'type', index: 'type', sortable: false, width: '80', align: 'center' }
		,	{ name: 'actions', index: 'actions', sortable: false, width: '100', align: 'center' }
		]
	,	width: jQuery('#gmpMapRightStickyBar').width()
	,	height: 200
	//,	autowidth: true
	,	shrinkToFit: false
	,	sortname: 'sort_order'
	,	rowNum: 1000000000000
	,	viewrecords: true
	,	emptyrecords: toeLangGmp('You have no figures for now.')
	,	loadComplete: function(res) {
			gmpRefreshMapShapesList(res.rows);
			if(res.rows.length) {
				g_gmpMap.applyZoomTypeAdmin();	// Apply zoom type fit_bounds after all shapes load in admin area
			}
			_gmpResizeRightSidebar(jQuery('#gmpShapesListGrid'));
		}
	}).jqGrid('sortableRows', {
		update: function (e, ui) {
			var shapesList = jQuery('#gmpShapesListGrid').jqGrid('getDataIDs');
			jQuery.sendFormGmp({
				data: { mod: 'gmap', action: 'resortShapes', shapes_list: shapesList }
			,	onSuccess: function(res) {
					if(!res.error) {
						jQuery('#gmpShapesListGrid').trigger('reloadGrid');
					}
				}
			});
		}
	});
	// Reset Shape form
	gmpResetShapeForm();
	// Shapes form functionality
	jQuery('#gmpAddNewShapeBtn').click(function(){
		var currentEditId = parseInt( shapeForm.find('input[name="shape_opts[id]"]').val() );
		if(!currentEditId) {	// This was new shape
			var title = jQuery.trim( shapeForm.find('input[name="shape_opts[title]"]').val() );
			if(title && title != '') {	// Save it if there was some required changes
				shapeForm.data('only-save', 1).submit();
			} else {
				var shape = gmpGetCurrentShape();

				if(shape) {
					shape.removeFromMap();
				}
			}
		}
		gmpOpenShapeForm();
		// Add new shape - right after click on "Add new"
		_gmpCreateNewMapShape();
		return false;
	});
	jQuery('#gmpShapeAddPointByClickBtn').click(function() {
		jQuery(this).toggleClass('gmpAddByClickActivated');

		if(jQuery(this).hasClass('gmpAddByClickActivated')) {
			gmpUnshiftButtons({
				gmpHeatmapAddPointBtn: 'gmpAddActivated'
			,	gmpHeatmapRemovePointBtn: 'gmpRemoveActivated'
			});
			if(!g_gmpClearPointRows) {
				gmpShapeClearRows();
				g_gmpClearPointRows = true;
			}
			var eventHandle = google.maps.event.addListener(g_gmpMap.getRawMapInstance(), 'click', jQuery.proxy(function(e){

				var point = { address: '', coord_x: e.latLng.lat(),	coord_y: e.latLng.lng(), radius: 100000 };

				if(shapeForm.find('select[name="shape_opts[type]"]').val() != 'circle' || !shapeForm.find('.gmpShapePointRow').length) {
					gmpShapeDrawPointRow(point);
				} else {
					gmpShapeUpdatePointRow(point);
				}
				shapeForm.find('.gmpShapePointRow:first .gmpShapeCoordX').trigger('change');
				shapeForm.find('.gmpShapePointRow:first .gmpShapeRadius').trigger('change');
			}, this));
			g_gmpMap._addEventListenerHandle('click', 'getLatLng', eventHandle);
		} else {
			google.maps.event.removeListener(g_gmpMap._getEventListenerHandle('click', 'getLatLng'));
		}
		return false;
	});
	jQuery('#gmpSaveShapeBtn').click(function(){
		jQuery('#gmpShapeForm').submit();
		return false;
	});
	jQuery('#gmpShapeDeleteBtn').click(function(){
		var shapeTitle = shapeForm.find('input[name="shape_opts[title]"]').val();
		if(shapeTitle && shapeTitle != '') {
			shapeTitle = '"'+ shapeTitle+ '"';
		} else {
			shapeTitle = 'current';
		}
		if(confirm('Remove '+ shapeTitle+ ' shape?')) {
			var currentShapeIdInForm = g_gmpCurrentEditShape ? g_gmpCurrentEditShape.getId() : 0;
			/*var removeFinalClb = function() {
				if(currentShapeIdInForm) {
					g_gmpMap.removeShape( currentShapeIdInForm );
					jQuery('#gmpShapesListGrid').trigger('reloadGrid');
				}
				if(g_gmpCurrentEditShape) {
					g_gmpCurrentEditShape.removeFromMap();
				}
				gmpResetShapeForm();
			};*/
			if(currentShapeIdInForm) {
				jQuery.sendFormGmp({
					btn: this
					,	data: {action: 'removeShape', mod: 'shape', id: currentShapeIdInForm}
					,	onSuccess: function(res) {
						if(!res.error) {
							jQuery('#gmpShapesListGrid').trigger('reloadGrid');
							gmpResetShapeForm();
							//removeFinalClb();
						}
					}
				});
			} else {
				//removeFinalClb();
			}
		}
		return false;
	});
	// Shape saving
	shapeForm.submit(function(){
		var currentMapId = gmpGetCurrentId()
		,	currentShapeMapId = parseInt( shapeForm.find('input[name="shape_opts[map_id]"]').val() )
		,	onlySave = parseInt(jQuery(this).data('only-save'));

		if(currentMapId && !currentShapeMapId) {
			shapeForm.find('input[name="shape_opts[map_id]"]').val( currentMapId );
		}
		shapeForm.find('input[name="shape_opts[description]"]').val( gmpGetTxtEditorVal('shapeDescription') );
		if(onlySave) {
			jQuery(this).data('only-save', 0);
		}
		jQuery(this).sendFormGmp({
			btn: jQuery('#gmpSaveShapeBtn')
		,	onSuccess: function(res) {
				if(!res.error) {
					if(!onlySave) {
						if(!res.data.update) {
							shapeForm.find('input[name="shape_opts[id]"]').val( res.data.shape.id );
							var shape = gmpGetCurrentShape();
							if(shape)
								shape.setId(res.data.shape.id);
						}
					}
					if(!currentShapeMapId) {
						g_gmpMapShapesIdsAdded.push( res.data.shape.id );
					}
					if(!onlySave) {
						jQuery('#gmpShapesListGrid').trigger('reloadGrid');
					}
					_gmpUnchangeShapeForm();
				}
			}
		});
		return false;
	});
	shapeForm.find('select[name="shape_opts[type]"]').change(function() {
		var type = jQuery(this).val()
		,	shape = gmpGetCurrentShape();

		switch(type) {
			case 'polyline': case 'polygon':
				shapeForm.find('.gmpPolygonShapeParam').each(function() {
					if(type == 'polyline') {
						jQuery(this).hide();
					} else {
						jQuery(this).show();
					}

				});
				shapeForm.find('#gmpShapeAddPointRowBtn').show();
				shapeForm.find('.gmpShapePointRow').each(function(index) {
					if(!index) {
						gmpHideRadiusField(jQuery(this));
					} else {
						jQuery(this).show(300);
					}
				});
				break;
			case 'circle':
				shapeForm.find('.gmpPolygonShapeParam').each(function() {
					jQuery(this).show();
				});
				shapeForm.find('#gmpShapeAddPointRowBtn').hide();
				shapeForm.find('.gmpShapePointRow').each(function(index) {
					if(!index) {
						gmpShowRadiusField(jQuery(this));
					} else {
						jQuery(this).hide(300);
					}
				});
				break;
			default:
				break;
		}
		if(shape) {
			shape.setType(type);
			shape.reinit();
			shapeForm.find('.gmpShapePointRow:first .gmpShapeCoordX').trigger('change');
			shapeForm.find('.gmpShapePointRow:first .gmpShapeRadius').trigger('change');
		}
	});
	shapeForm.find('select[name="shape_opts[type]"]').trigger('change');
	shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').change(function() {
		var shape = gmpGetCurrentShape();

		if(shape)
			shape.setStrokeOpacity(jQuery(this).val());
	});
	shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').change(function() {
		var shape = gmpGetCurrentShape();

		if(shape)
			shape.setStrokeWeight(jQuery(this).val());
	});
	shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').change(function() {
		var shape = gmpGetCurrentShape();

		if(shape) {
			shape.setFillOpacity(jQuery(this).val());
		}
	});
	jQuery('#gmpShapeAddPointRowBtn').click(function() {
		gmpShapeDrawPointRow();
		return false;
	});
	shapeForm.find('input,textarea,select').change(function(){
		_gmpChangeShapeForm();
	});
	shapeForm.find('input[name="shape_opts[title]"]').change(function() {
		var shape = gmpGetCurrentShape();
		if(!shape) {
			_gmpCreateNewMapShape();
			shape = gmpGetCurrentShape();
		}
		shape.setTitle( jQuery(this).val() );
		if(shape.getShapeParam('type') != 'polyline')
			shape.showInfoWnd();
	});
	// Bind change shape description - with it's description in map preview
	setTimeout(function(){
		gmpBindShapeTinyMceUpdate();
		if(!g_gmpTinyMceShapeEditorUpdateBinded) {
			jQuery('#shapeDescription-tmce.wp-switch-editor.switch-tmce').click(function(){
				setTimeout(gmpBindShapeTinyMceUpdate, 500);
			});
		}
	}, 500);
	jQuery('#shapeDescription').keyup(function(){
		var shape = gmpGetCurrentShape();
		if(!shape) {
			_gmpCreateNewMapShape();
			shape = gmpGetCurrentShape();
		}
		if(shape) {
			shape.setDescription( gmpGetTxtEditorVal('shapeDescription') );
			shape.showInfoWnd();
		}
	});
});
// Functions for manipulate the shapes's rows
function gmpShapeClearRows() {
	jQuery('#gmpShapePointRowsShell').html('');
	g_gmpClearPointRows = false;
}
function gmpShapeRemovePointRow(btn) {
	var row = jQuery(btn).parents('.gmpShapePointRow:first')
	,	shapeForm = jQuery('#gmpShapeForm');

	row.animateRemoveGmp(300, function() {
		shapeForm.find('.gmpShapePointRow:first .gmpShapeCoordX').trigger('change');
		shapeForm.find('.gmpShapePointRow:first .gmpShapeRadius').trigger('change');
	});
}
function gmpShapeUpdatePointRow(point) {
	var shell = jQuery('#gmpShapePointRowsShell')
	,	row = shell.find('.gmpShapePointRow:first');

	row.find('input').each(function(){
		jQuery(this).val(point[jQuery(this).data('type')]);
	});
}
function gmpShapeDrawPointRow(point) {
	point = point ? point : { address: '', coord_x: '',	coord_y: '', radius: 100000 };
	var shapeForm = jQuery('#gmpShapeForm')
	,	shell = jQuery('#gmpShapePointRowsShell')
	,	newRow = shell
			.parents('td:first')
			.find('.gmpShapePointRowExample')
			.clone()
			.removeClass('gmpShapePointRowExample')
			.addClass('gmpShapePointRow')
	,	prewPointId = parseInt(shell.find('.gmpShapePointRow:last-child').data('point-pos'))
	,	nextPointId = !isNaN(prewPointId) ? prewPointId + 1 : 1;

	newRow.data('point-pos', nextPointId);
	newRow.find('input').each(function(){
		jQuery(this).removeAttr('disabled');
		jQuery(this).attr('name', jQuery(this).attr('name').replace('[0]', '['+ nextPointId+ ']'));
		jQuery(this).val(point[jQuery(this).data('type')]);
	});
	if(shapeForm.find('select[name="shape_opts[type]"]').val() == 'circle') {
		gmpShowRadiusField(newRow);
	}
	shell.append(newRow.show());
	newRow.find('.gmpShapeCoordX, .gmpShapeCoordY').each(function() {
		jQuery(this).change(function() {
			var type = jQuery('#gmpShapeForm select[name="shape_opts[type]"]').val()
			,	shape = gmpGetCurrentShape()
			,	newShapeCoords = jQuery('.gmpShapePointRow')
			,	path = [];

			if(!shape) {
				_gmpCreateNewMapShape();
				shape = gmpGetCurrentShape();
			}
			newShapeCoords.each(function() {
				var lat = jQuery(this).find('.gmpShapeCoordX').val()
				,	lng = jQuery(this).find('.gmpShapeCoordY').val();

				if(lat && lng) {
					path.push({ address: '', coord_x: lat, coord_y: lng });
				}
			});
			if(shape && path && path.length) {
				if(type == 'circle') {
					shape.setCenter(gmpGetShapeCenter(path));
				} else {
					shape.setPath(gmpGetShapePath(path));
				}
				if(shape._createdFromCenter) {
					if(type == 'circle') {
						shape._infoWndPosition = shape.getCenter();
					} else {
						shape._infoWndPosition = shape.getPath().getAt(0);
					}
					shape._createdFromCenter = false;
				}
			}
		});
	});
	newRow.find('.gmpShapeAddress').mapSearchAutocompleateGmp({
		msgEl: ''
	,	onSelect: function(item, event, ui) {
			if(item) {
				newRow.find('.gmpShapeCoordX').val(item.lat);
				newRow.find('.gmpShapeCoordY').val(item.lng).trigger('change');
			}
		}
	});
	newRow.find('#gmpShapeRemovePointRowBtn').click(function() {
		gmpShapeRemovePointRow(jQuery(this));
		return false;
	});
}
// Functions for manipulate the shapes's form
function gmpShowShapeForm() {
	var shapeFormIsVisible = jQuery('#gmpShapeForm').is(':visible');
	if(!shapeFormIsVisible) {
		jQuery('#gmpMapPropertiesTabs').wpTabs('activate', '#gmpShapeTab');
	}
}
function gmpOpenShapeEdit(id) {
	gmpOpenShapeForm();
	var shapeForm = jQuery('#gmpShapeForm')
	,	shape = g_gmpMap.getShapeById( id );	// We need to get shape belonged to map otherwise the options' changes will not apply to shape

	if(shape) {
		var shapeParams = shape.getRawShapeParams();
		shapeForm.find('input[name="shape_opts[id]"]').val( shapeParams.id );
		shapeForm.find('input[name="shape_opts[title]"]').val( shapeParams.title );
		gmpSetTxtEditorVal('shapeDescription', shapeParams.description);

		shapeForm.find('select[name="shape_opts[type]"]').val( shapeParams.type );
		shapeForm.find('select[name="shape_opts[type]"]').trigger('change');

		shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val( shapeParams.strokeColor ).trigger('change');
		shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val( parseFloat(shapeParams.strokeOpacity) );
		shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val( shapeParams.strokeWeight == '' ? 0 : parseFloat(shapeParams.strokeWeight) );
		shapeForm.find('input[name="shape_opts[params][fillColor]"]').val( shapeParams.fillColor ).trigger('change');
		shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val( parseFloat(shapeParams.fillOpacity) );

		gmpShapeClearRows();
		for(var i in shapeParams.coords) {
			gmpShapeDrawPointRow(shapeParams.coords[i]);
		}
		gmpSetCurrentShape( shape );
	}
}
function gmpResetShapeForm() {
	var shapeForm = jQuery('#gmpShapeForm');

	gmpSetCurrentShape( null );
	shapeForm[0].reset();
	shapeForm.find('input[name="shape_opts[id]"]').val('');
	shapeForm.find('input[name="shape_opts[title]"]').val('');
	shapeForm.find('select[name="shape_opts[type]"]').val('polyline');
	shapeForm.find('select[name="shape_opts[type]"]').trigger('change');

	if(shapeForm.find('#gmpShapeAddPointByClickBtn').hasClass('gmpAddByClickActivated')) {
		shapeForm.find('#gmpShapeAddPointByClickBtn').removeClass('gmpAddByClickActivated');
		google.maps.event.removeListener(g_gmpMap._getEventListenerHandle('click', 'getLatLng'));
	}
	shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val('#dd3333').trigger('change');
	shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val(1);
	shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val(2);
	shapeForm.find('input[name="shape_opts[params][fillColor]"]').val('#dd3333').trigger('change');
	shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val(1);

	gmpShapeClearRows();
	// Add two new point rows
	gmpShapeDrawPointRow();
	gmpShapeDrawPointRow();
}
// Show / hide circle's radius field
function gmpShowRadiusField(row) {
	row.find('.gmpShapeAddress').parents('div:first').css({ width: '40%' });
	row.find('.gmpShapeRadius').parents('div:first').css({ display: 'inline-block' });
	row.find('.gmpShapeRadius').on('change', function() {
		var shape = gmpGetCurrentShape();

		if(shape && shape.getType() == 'circle')
			shape.setRadius(parseInt(jQuery(this).val()));
	});
}
function gmpHideRadiusField(row) {
	row.find('.gmpShapeAddress').parents('div:first').css({ width: '50%' });
	row.find('.gmpShapeRadius').parents('div:first').css({ display: 'none' });
}
// Shape's description callback
function gmpBindShapeTinyMceUpdate() {
	if(!g_gmpTinyMceShapeEditorUpdateBinded && typeof(tinyMCE) !== 'undefined' && tinyMCE.editors) {
		if(tinyMCE.editors.shapeDescription) {
			tinyMCE.editors.shapeDescription.onKeyUp.add(function(){
				var shape = gmpGetCurrentShape();

				if(!shape) {
					_gmpCreateNewMapShape();
					shape = gmpGetCurrentShape();
				}
				if(shape) {
					shape.setDescription( gmpGetTxtEditorVal('shapeDescription') );
					shape.showInfoWnd();
				}
			});
			g_gmpTinyMceShapeEditorUpdateBinded = true;
		}
	}
}
// Functions for manipulations with g_gmpCurrentEditShape variable
function gmpSetCurrentShape(shape) {
	g_gmpCurrentEditShape = shape;
}
function gmpGetCurrentShape() {
	// We need to create shape only in several cases, so this function shows us was shape already created or not
	return g_gmpCurrentEditShape;
}
function _gmpCreateNewMapShape(params) {
	var shapeForm = jQuery('#gmpShapeForm')
	,	newShapeData = params ? params : {
			type: shapeForm.find('select[name="shape_opts[type]"]').val()
		,	path: [ g_gmpMap.getCenter() ]
		,	center: g_gmpMap.getCenter()
		,	radius: 0
		,	strokeColor: shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val()
		,	strokeOpacity: shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val()
		,	strokeWeight: shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val()
		,	fillColor: shapeForm.find('input[name="shape_opts[params][fillColor]"]').val()
		,	fillOpacity: shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val()
		,	created_from_center: true
		};
	gmpSetCurrentShape(g_gmpMap.addShape(newShapeData));
}
// Shapes' list buttons callbacks
function gmpShapeEditBtnClick(btn){
	var shapeId = jQuery(btn).data('shape_id');
	gmpOpenShapeEdit( shapeId );
}
function gmpShapeDelBtnClick(btn){
	var shapeId = jQuery(btn).data('shape_id')
	,	shapeRow = jQuery(btn).parents('tr:first');
	gmpRemoveShapeFromMapTblClick(shapeId, {row: shapeRow});
}
function gmpRemoveShapeFromMapTblClick(shapeId, params) {
	params = params || {};
	var shapeTitle = params.row ? params.row.find('td[aria-describedby="gmpShapesListGrid_title"]').text() : ''
	,	btn = params.row ? params.row : params.btn;
	if(!confirm('Remove "'+ shapeTitle+ '" shape?')) {
		return false;
	}
	if(shapeId == ''){
		return false;
	}
	jQuery.sendFormGmp({
		btn: btn
	,	data: {action: 'removeShape', mod: 'shape', id: shapeId}
	,	onSuccess: function(res) {
			if(!res.error){
				//g_gmpMap.removeShape( shapeId );
				jQuery('#gmpShapesListGrid').trigger('reloadGrid');
				var currentEditShapeId = parseInt( jQuery('#gmpShapeForm input[name="shape_opts[id]"]').val() );
				if(currentEditShapeId && currentEditShapeId == shapeId) {
					gmpResetShapeForm();
				}
			}
		}
	});
}
function gmpRefreshMapShapesList(shapesList) {
	gmpRefreshMapShapes(g_gmpMap, shapesList);
	var currentFormShape = parseInt( jQuery('#gmpShapeForm input[name="shape_opts[id]"]').val() );
	if(currentFormShape) {
		var editMapShape = g_gmpMap.getShapeById(currentFormShape);
		if(editMapShape) {
			gmpSetCurrentShape( editMapShape );
		}
	}
}
function gmpRefreshMapShapes(map, shapes) {
	map.clearShapes();
	shapes = _gmpPrepareShapesListAdmin( shapes );
	for(var i in shapes) {
		var newShape = map.addShape( shapes[i] );
	}
}
function _gmpPrepareShapesListAdmin(shapes) {
	return _gmpPrepareShapesList(shapes);
}
// Colorpickers callbacks
function wpColorPicker_shape_optsparamsstrokeColor_change(event, ui) {
	g_gmpShapeStrokeColorLast = ui.color.toString();
	if(!g_gmpShapeStrokeColorTimeoutSet) {
		setTimeout(function(){
			gmpWpColorpickerUpdateStrokeColor();
		}, 500);
		g_gmpShapeStrokeColorTimeoutSet = true;
	}
}
function gmpWpColorpickerUpdateStrokeColor(color) {
	var shape = gmpGetCurrentShape();

	if(shape)
		shape.setStrokeColor(g_gmpShapeStrokeColorLast);
	g_gmpShapeStrokeColorTimeoutSet = false;
}
function wpColorPicker_shape_optsparamsfillColor_change(event, ui) {
	g_gmpShapeFillColorLast = ui.color.toString();
	if(!g_gmpShapeFillColorTimeoutSet) {
		setTimeout(function(){
			gmpWpColorpickerUpdateFillColor();
		}, 500);
		g_gmpShapeFillColorTimeoutSet = true;
	}
}
function gmpWpColorpickerUpdateFillColor(color) {
	var shape = gmpGetCurrentShape();

	if(shape)
		shape.setFillColor(g_gmpShapeFillColorLast);
	g_gmpShapeFillColorTimeoutSet = false;
}
// Shapes form check change actions
function _gmpIsShapeFormChanged() {
	return g_gmpShapeFormChanged;
}
function _gmpChangeShapeForm() {
	g_gmpShapeFormChanged = true;
}
function _gmpUnchangeShapeForm() {
	g_gmpShapeFormChanged = false;
}
function gmpOpenShapeForm() {
	gmpShowShapeForm();
	gmpResetShapeForm();
}
