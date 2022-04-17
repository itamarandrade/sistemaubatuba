jQuery(document).bind('gmapAfterMapInit', function(event, map) {
	if( map._mapParams.markers_list_type === 'slider_checkbox_table'){
		var viewId = map.getViewId();
		if(window.gmpGetMembershipGmeViewId) {
			viewId = gmpGetMembershipGmeViewId(map, viewId);
		}
		gmpShowCustomControlsMarkerGroupsTreeF(viewId, map);
		jQuery('#gmpMapMarkerFilters_' + viewId).show();
		jQuery('#gmpMapMarkerFilters_' + viewId).treeview('checkAll', { silent: true });
		var mapsHeight = jQuery('.gmpLeft').height();
		jQuery('.filterRight').css({'max-height':mapsHeight + 'px'});
	}
});

function gmpShowCustomControlsMarkerGroupsTreeF(viewId, map) {
	if(gmp_group_list && gmp_group_list.length) {
		var bgColor = map.getParam('marker_filter_color') + '!important';
		gmpFilterWrapper = jQuery('#gmpMapMarkerFilters_' + viewId);
		gmpFilterWrapper.treeview({
			data: gmpGetFiltersMarkerGroupsTree(gmp_group_list, viewId),
			showCheckbox: true,
			selectable: false,
			checkedIcon: 'fa fa-check-square-o',
			uncheckedIcon: 'fa fa-square-o',
			expandIcon: 'fa fa-chevron-right',
			collapseIcon: 'fa fa-chevron-down',
			emptyIcon: 'fa',
			backColor: bgColor,
			onhoverColor: 'transparent',
			onNodeChecked: function(event, data) {
				var $this = jQuery(this);
				var action = '';
				if(data.id === 'all'){
					action = 'showall';
					jQuery('#gmpMapMarkerFilters_' + data.map_view_id).treeview('checkAll', { silent: true });
				}
				if(data.nodes && data.nodes.length) {
					gmpUpdateChildrenNodesF(data.nodes, $this, 'checkNode');
				}
				gmpMarkersFilterF(data.map_view_id, action);
			},
			onNodeUnchecked: function(event, data) {
				var $this = jQuery(this);
				var action = '';
				if(data.id === 'all'){
					jQuery('#gmpMapMarkerFilters_' + data.map_view_id).treeview('uncheckAll', { silent: true });
					action = 'hideall';
				}else{
					if(gmp_group_list[gmp_group_list.length - 1].id === 'all'){
						var nodeAll = jQuery('#gmpMapMarkerFilters_' + viewId).find('.list-group li').last().attr('data-nodeid');
						jQuery('#gmpMapMarkerFilters_' + data.map_view_id).treeview('uncheckNode', [ Number(nodeAll) , { silent: true } ]);
					}
				}
				if(data.nodes && data.nodes.length) {
					gmpUpdateChildrenNodesF(data.nodes, $this, 'uncheckNode');
				}
				gmpMarkersFilterF(data.map_view_id, action);
			}
		});
		gmpFilterWrapper.treeview('collapseAll', { silent: true });
	}
}

function gmpMarkersFilterF(viewId, action) {
	var checked = gmpFilterWrapper.treeview('getChecked')
	,	map = gmpGetCurMapByViewIdF(viewId)
	,	mapMarkers = map.getAllMarkers()
	,	groupsList = []
	,	markersIdList = []
	,	markersIdListFull = [];

	for(var j = 0; j < checked.length; j++) {
		groupsList.push(checked[j].id);
	}
	for(var i = 0; i < mapMarkers.length; i++) {
		markersIdListFull[i] = mapMarkers[i].getMarkerParam('id');
	}
	if(groupsList.length) {
		for(var i = 0; i < mapMarkers.length; i++) {
			if(!twoArraysContainSameValue(groupsList, mapMarkers[i].getMarkerParam('marker_group_ids'))){
				markersIdList[markersIdList.length] = mapMarkers[i].getMarkerParam('id');
			}
		}
	}
	if(! checked.length > 0){
		action = 'hideall';
	}
	if(action === 'hideall'){
		return gmpHideMarkersF(markersIdListFull, map);
	}else if(action === 'showall'){
		return gmpHideMarkersF([], map);
	}else{
		return gmpHideMarkersF(markersIdList, map);
	}
}

function gmpHideMarkersF(markers, map){
	var mapMarkers = map.getAllMarkers()
		,	needClastererEnabled = false;
	for(var i = 0; i < mapMarkers.length; i++){
		mapMarkers[i].getRawMarkerInstance().setVisible(true);
	}
	if(map._clastererEnabled) {
		map.disableClasterization();
		needClastererEnabled = true;
	}
	for(var j = 0; j < mapMarkers.length; j++){
		for(var z = 0; z < markers.length; z++) {
			if(mapMarkers[j]._markerParams.id === markers[z]){
				mapMarkers[j].getRawMarkerInstance().setVisible(false);
			}
		}
	}
	if(needClastererEnabled) {
		map.enableClasterization(map._mapParams.marker_clasterer, true);
	}
	gmpSliderMarkersHideF(markers, map);
}
function gmpSliderMarkersHideF(markers, map){
	if(map.getParam('marker_list_params')){
		var $sliderContent = jQuery('#' + map.getParam('simple_slider_id'))
			,	sliderType = $sliderContent.data('slider-type');

		switch(sliderType) {
			default:
				$sliderContent.html(map.getParam('original_slider_html'));	// Reset current slider to it's original html
				$sliderContent.find('.gmpMnlJssorSlide').each(function () {	// Remove unused in search html slides
					for(var i = 0; i < markers.length; i++) {
						if(jQuery(this).data('marker-id') == markers[i]) {
							jQuery(this).remove();

							// find marker by id
							var mmInd = 0
								,	mmFound = -1
							;
							while(mmInd < map._markers.length && mmFound === -1) {
								if(markers[i] == map._markers[mmInd].getId()) {
									mmFound = mmInd;
								}
								mmInd++;
							}
							// close all open infoWindow
							if(mmFound != -1 && map._markers && map._markers[mmFound] && map._markers[mmFound].hideInfoWnd) {
								map._markers[mmFound].hideInfoWnd();
							}
							return; // stop current .each() iteration
						}
					}
				});
				gmpBuildListHtml(map);	// Build slider one more time with required number of slides
				break;
		}
	}
}
function gmpGetCurMapByViewIdF(viewId) {
	if(typeof(g_gmpMap) !== 'undefined') {
		return g_gmpMap;
	} else {
		return gmpGetMapByViewId(viewId);
	}
}
function gmpUpdateChildrenNodesF(nodes, treeObj, action) {
	var groupsList = [];
	for(var i = 0; i < nodes.length; i++) {
		treeObj.treeview(action, [ nodes[i].nodeId, { silent: true } ]);
		groupsList.push(nodes[i].id);
		if(nodes[i].nodes) {
			groupsList.concat(gmpUpdateChildrenNodesF(nodes[i].nodes, treeObj, action));
		}
	}
	return groupsList;
}

function gmpGetFiltersMarkerGroupsTree(groups, viewId) {
	for(var i in groups) {
		if(typeof groups[i] == 'object') {
			groups[i].text = groups[i].title;
			groups[i].color = '#000000';
			groups[i].backColor = groups[i].params.bg_color;
			groups[i].nodes = groups[i].children && groups[i].children.length ? groups[i].children : null;
			groups[i].selectable = false;
			groups[i].map_view_id = viewId;
			delete groups[i].children;
			if(groups[i].nodes) {
				groups[i].nodes = gmpGetFiltersMarkerGroupsTree(groups[i].nodes, viewId);
			}
		}
	}
	return groups;
}