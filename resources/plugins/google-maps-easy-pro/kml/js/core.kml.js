g_gmpKmlLayers = [];
jQuery(document).bind('gmapAfterMapInit', function(event, map){
	if(!map.getAllMarkers().length) {
		// Fix for KML filter's rebuild, because gmapAfterMarkersRefresh event triggers only if map has markers
		gmpRebuildKmlFilter(map);
	}
});
jQuery(document).bind('gmapAfterMarkersRefresh', function(event, map){
	// We need to rebuild KML filter here, because Markers' list rebuilds on this event
	gmpRebuildKmlFilter(map);
});
jQuery(window).on('resize', function() {
	gmpRebuildKmlFilterForAllMaps();
});
jQuery(window).on('orientationchange', function() {
	gmpRebuildKmlFilterForAllMaps();
});
jQuery(document).bind('gmapAfterMapInit', function(event, map){
	var filterShell = jQuery('#gmpKmlFilterShell_' + map.getViewId())
		,	kmlLayersList = gmapCleanKmlLayersList(map.getParam('kml_file_url'));

	if(kmlLayersList && kmlLayersList.length) {
		if(GMP_DATA.isAdmin || parseInt(map.getParam('enable_google_kml_api'))) {
			for(var i = 0; i < kmlLayersList.length; i++) {
				if(kmlLayersList[i]){
					gmapAddKMLLayer(kmlLayersList[i], map);
				}
			}
		} else {
			gmpSwitchKMLMapPreloader('on', map);
			gmapAddKMLLayer(kmlLayersList, map);
			if(parseInt(map.getParam('enable_kml_filter'))) {
				filterShell.show();
				gmapShowKmlFilterData(map);
			} else {
				gmpSwitchKMLMapPreloader('off', map);
			}
		}
	}
});
function gmapCleanKmlLayersList(list) {
	if(list && list.length) {
		list = list.filter(function(entry) {
			return entry.trim() != '';
		});
	}
	return list;
}
function gmapAddKMLLayer(url, map) {   
	if(GMP_DATA.isAdmin || parseInt(map.getParam('enable_google_kml_api')) ) {
		var length = g_gmpKmlLayers.length;
		// Does not work for local KML files on local server (KML needs to be loaded from remote server)
		// So for local test use FTP KML links, for remote servers all works fine
		g_gmpKmlLayers[length] = new google.maps.KmlLayer({ url: url, map: map.getRawMapInstance() });
	} else {
		if(!g_gmpKmlLayers.length) {
			g_gmpKmlLayers = new geoXML3.parser({map: map.getRawMapInstance()});
		}
		g_gmpKmlLayers.parse(url);
	}
}
function gmpSwitchKMLMapPreloader(val, map) {
	var mapContainer = jQuery('#gmpMapDetailsContainer_' + map.getViewId());

	switch(val) {
		case 'on':
			mapContainer.find('.gmpKMLLayersPreloader').show();
			break;
		case 'off':
			if(!GMP_DATA.isAdmin && g_gmpKmlLayers && g_gmpKmlLayers.docs.length == map.getParam('kml_file_url').length) {
				mapContainer.find('.gmpKMLLayersPreloader').hide();
			} else {
				setTimeout(function() {
					gmpSwitchKMLMapPreloader(val, map);
				}, 500);
			}
			break;
		default:
			break;
	}
}
function gmapRemoveKMLLayer(url) {
	if(GMP_DATA.isAdmin) {
		if(g_gmpKmlLayers && g_gmpKmlLayers.length) {
			for(var i in g_gmpKmlLayers) {
				if(g_gmpKmlLayers[i].url == url) {
					g_gmpKmlLayers[i].setMap(null);
					var index = g_gmpKmlLayers.indexOf(g_gmpKmlLayers[i]);
					if (parseInt(index) > -1) {
						g_gmpKmlLayers.splice(parseInt(index), 1);
					}
				}
			}
		}
	} /*else {
		if(g_gmpKmlLayers && g_gmpKmlLayers.docs.length) {
			for(var i in g_gmpKmlLayers.docs) {
				if(g_gmpKmlLayers.docs[i].url == url) {
					g_gmpKmlLayers.hideDocument(g_gmpKmlLayers.docs[i]);
				}
			}
		}
	}*/
}
function gmapShowKmlFilterData(map) {
	if(!GMP_DATA.isAdmin && g_gmpKmlLayers && g_gmpKmlLayers.docs.length == map.getParam('kml_file_url').length) {
		var filterShell = jQuery('#gmpKmlFilterShell_' + map.getViewId())
		,	rowsShell = filterShell.find('.gmpKmlFilterRowsShell')
		,	layersList = map.getParam('kml_file_url')
		,	sortedDocs = [];

		// Resort layers by list of KML layers at admin area
		for(var i = 0; i < layersList.length; i++) {
			sortedDocs[i] = g_gmpKmlLayers.docsByUrl[layersList[i]]
		}
		g_gmpKmlLayers.docs = sortedDocs;

		rowsShell.treeview({
			data: gmpGerFilterTree(map),
			showCheckbox: true,
			checkedIcon: 'fa fa-check-square-o',
			uncheckedIcon: 'fa fa-square-o',
			expandIcon: 'fa fa-chevron-right',
			collapseIcon: 'fa fa-chevron-down',
			onhoverColor: 'transparent',
			onNodeChecked: function(event, data) {
				gmpToggleElem(data, true);
				if(data.gmap.type == 'layer') {
					if(data.nodes && data.nodes.length) {
						for(var i = 0; i < data.nodes.length; i++) {
							if(!data.nodes[i].state.checked) {
								jQuery(this).treeview('checkNode', [ data.nodes[i].nodeId, { silent: true } ]);
							}
						}
					}
				} else {
					var siblings = jQuery(this).treeview('getSiblings', [ data.nodeId ])
					,	parent = jQuery(this).treeview('getParent', [ data.nodeId ])
					,	needCheck = true;

					for(var j = 0; j < siblings.length; j++) {
						if(!siblings[j].state.checked) {
							needCheck = false;
						}
					}
					if(needCheck) {
						jQuery(this).treeview('checkNode', [ parent.nodeId ])
					}
				}
			},
			onNodeUnchecked: function(event, data) {
				gmpToggleElem(data, false);
				if(data.gmap.type == 'layer') {
					if(data.nodes && data.nodes.length) {
						for(var i = 0; i < data.nodes.length; i++) {
							if(data.nodes[i].state.checked) {
								jQuery(this).treeview('uncheckNode',[data.nodes[i].nodeId,{silent: true}]);
							}
						}
					}
				} else {
					var parent = jQuery(this).treeview('getParent', [ data.nodeId ]);

					jQuery(this).treeview('uncheckNode', [ parent.nodeId, { silent: true } ]);
				}
			}
		});
		rowsShell.treeview('checkAll', { silent: true });
		rowsShell.treeview('collapseAll', { silent: true });
		filterShell.find('.gmpKmlLoading').hide();
		gmpSwitchKMLMapPreloader('off', map);
		filterShell.find('.gmpKmlFilterRowsShell').fadeIn(1500);
	} else {
		setTimeout(function() {
			gmapShowKmlFilterData(map);
		}, 500);
	}
}
function gmpGerFilterTree(map) {
	var tree = []
	,	docs = g_gmpKmlLayers.docs
	,	showSublayers = map.getParam('kml_filter')
	,	viewId = map.getViewId()
	,	data, i, j;

	for(i = 0; i < docs.length; i++) {
		var fileName = docs[i].url.toString().match(/.*\/(.+?)\./);

		data = {
			text: fileName && fileName.length > 1 ? fileName[1] : 'Main Layer ' + i
		,	gmap: { type: 'layer', doc: i, id: '', viewId: viewId }
		,	selectable: false
		};
		tree.push(data);

		if(showSublayers && showSublayers['show_sublayers'] && !parseInt(showSublayers['show_sublayers'][i])) {
			if (!!docs[i].markers) {
				for (j = 0; j < docs[i].markers.length; j++) {
					data = {
						text: docs[i].markers[j].title ? docs[i].markers[j].title : 'Marker ' + j
					,	gmap: { type: 'markers', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
			if (!!docs[i].ggroundoverlays) {
				for (j = 0; j < docs[i].ggroundoverlays.length; j++) {
					data = {
						text: docs[i].ggroundoverlays[j].title ? docs[i].ggroundoverlays[j].title : 'Overlay ' + j
					,	gmap: { type: 'ggroundoverlays', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
			if(!!docs[i].gpolylines) {
				for (j = 0; j < docs[i].gpolylines.length; j++) {
					data = {
						text: docs[i].gpolylines[j].title ? docs[i].gpolylines[j].title : 'Polyline ' + j
					,	gmap: { type: 'gpolylines', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
			if (!!docs[i].gpolygons) {
				for (j = 0; j < docs[i].gpolygons.length; j++) {
					data = {
						text: docs[i].gpolygons[j].title ? docs[i].gpolygons[j].title : 'Polygon ' + j
					,	gmap: { type: 'gpolygons', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
		}
	}
	return tree;
}
function gmpToggleElem(elem, check) {
	if(check) {
		if(elem.gmap.type == 'layer') {
			g_gmpKmlLayers.showDocument(g_gmpKmlLayers.docs[elem.gmap.doc]);
		} else {
			gmpShowDocumentPart(elem.gmap);
		}
	} else{
		if(elem.gmap.type == 'layer') {
			g_gmpKmlLayers.hideDocument(g_gmpKmlLayers.docs[elem.gmap.doc]);
		} else {
			gmpHideDocumentPart(elem.gmap);
		}
	}
	return false;
}
function gmpHideDocumentPart(params) {
	if (g_gmpKmlLayers && g_gmpKmlLayers.docs.length) {
		switch(params.type) {
			case 'markers':
				var marker = g_gmpKmlLayers.docs[params.doc][params.type][params.id];

				if(!!marker.infoWindow) marker.infoWindow.close();
				marker.setVisible(false);
				break;
			case 'ggroundoverlays':
				var overlay = g_gmpKmlLayers.docs[params.doc][params.type][params.id];

				overlay.setOpacity(0);
				break;
			case 'gpolylines':case 'gpolygons':
			var shape = g_gmpKmlLayers.docs[params.doc][params.type][params.id];

			if(!!shape.infoWindow) shape.infoWindow.close();
			shape.setMap(null);
			break;
			default:
				break;
		}
	}
}
function gmpShowDocumentPart(params) {
	if (g_gmpKmlLayers && g_gmpKmlLayers.docs.length) {
		switch(params.type) {
			case 'markers':
				var marker = g_gmpKmlLayers.docs[params.doc][params.type][params.id];

				if(!!marker.infoWindow) marker.infoWindow.close();
				marker.setVisible(true);
				break;
			case 'ggroundoverlays':
				var overlay = g_gmpKmlLayers.docs[params.doc][params.type][params.id];

				overlay.setOpacity(overlay.percentOpacity);
				break;
			case 'gpolylines':case 'gpolygons':
			var shape = g_gmpKmlLayers.docs[params.doc][params.type][params.id]
			,	map = gmpGetMapByViewId(params.viewId);

			if(map) {
				if(!!shape.infoWindow) shape.infoWindow.close();
				shape.setMap(map.getRawMapInstance());
			}
			break;
			default:
				break;
		}
	}
}
function gmpRebuildKmlFilter(map) {
	var kmlLayersList = gmapCleanKmlLayersList(map.getParam('kml_file_url'));

	if(parseInt(map.getParam('enable_kml_filter')) && kmlLayersList && kmlLayersList.length) {
		var markerListParams = map.getParam('marker_list_params')
		,	orientation = markerListParams ? markerListParams.or : false
		,	mapShell = jQuery('#'+ map.getViewHtmlId()).parents('.gmpMapDetailsContainer:first')
		,	filterShell = jQuery('#gmpMapProKmlFilterCon_' + map.getViewId())
		,	sliderShell = jQuery('#gmpMapProControlsCon_' + map.getViewId())
		,	filterWidth = '300'
		,	filterHeight = mapShell.height();

		if((orientation == 'h' || !orientation) && jQuery(window).width() > 992) {
			// Vertical Kml Filter
			filterShell.insertBefore(sliderShell);
			filterShell.css({
				'float': 'right'
			,	'width': filterWidth
			,   'height':  filterHeight
			,	'max-height': filterHeight
			,   'margin-top': '0'
			,   'margin-bottom': '5px'
			});
			mapShell.css({
				'float': 'left'
			,	'width': mapShell.parents('.gmp_map_opts:first').width() - filterWidth - 5
			});
			sliderShell.css({
				'clear': 'both'
			});
		} else {
			// Horisontal Kml Filter
			filterShell.insertAfter(sliderShell);
			filterShell.css({
				'float': 'right'
			,	'width': '100%'
			,   'height':  'auto'
			,	'max-height': '400px'
			,   'margin-top': '5px'
			,   'margin-bottom': '0'
			});
			if(orientation != 'v') {
				mapShell.css({
					'float': 'none'
				,	'width': '100%'
				});
				sliderShell.css({
					'clear': 'none'
				});
			}
			if(parseInt(map.getParam('directions_steps_show'))) {
				filterShell.css({
					'margin-bottom': '5px'
				});
			}
		}
	}
}
function gmpRebuildKmlFilterForAllMaps() {
	if(typeof(gmpGetAllMaps) == 'function') {
		var maps = gmpGetAllMaps();

		for(var i = 0; i < maps.length; i++) {
			gmpRebuildKmlFilter(maps[i]);
		}
	}
}
