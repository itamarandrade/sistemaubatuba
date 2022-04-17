var g_gmpAllCircles = {};
var g_gmpCustomControlsFilterShell = {};
var markersGroups = [];
var g_gmpGroupsList = [];
var g_gmpCustomMapControls = {
	_wasInit: {}
,	beforeMapInit: function(map){
		if(parseInt(map.getParam('enable_custom_map_controls'))) {
			var controlToPosition = {
				custom_controls_position: 'mapCustomControlsPosition',
			};
			for (var dbKey in controlToPosition) {
				var controlPosition = map.getParam(dbKey)
				,	viewId = map.getViewId();
				if(controlPosition && google.maps.ControlPosition[controlPosition]) {
					var mapControlOptions = map.getParam(controlToPosition[dbKey]) || {};
					mapControlOptions.position = google.maps.ControlPosition[controlPosition];
					map.setParam(controlToPosition[dbKey], mapControlOptions);
					map.setParam('zoomControl', false);
					this.controlsFormsPosition(controlPosition, viewId);
				}
			}
		}
	}
,	afterMapInit: function(map){
		if(parseInt(map.getParam('enable_custom_map_controls'))) {
			var self = this;
			google.maps.event.addListenerOnce(map.getRawMapInstance(), 'tilesloaded', function(){
				self.initControls( map );
			});
			var unit = map.getParam('custom_controls_unit');
			jQuery('.customControlsUnit').html(unit);
			jQuery('[data-unit]').attr('data-unit', unit);
		}
	}
,	initControls: function(map) {
		var viewId = map.getViewId();
        g_gmpGroupsList = window.hasOwnProperty('g_gmpGroupsList_'+viewId) ? window['g_gmpGroupsList_'+viewId] : [];

		if(!this._wasInit[ viewId ]) {
			var mapCustomControlsDiv = document.getElementById('gmpCustomControlsShell_'+ viewId)
			,	$mapCustomControlsDiv = jQuery(mapCustomControlsDiv)
			,	markers = map.getAllMarkers()
			,	markersContent = []
			,	autocompleateData = {
					msgEl: ''
				,	geocoderParams: {}
				,	onSelect: function(item, event, ui) {
						if(item) {
							if(item.lat && item.lng) {
								$mapCustomControlsDiv.find('[name="custom_search[coord_x_'+ viewId+ ']"]').val(item.lat);
								$mapCustomControlsDiv.find('[name="custom_search[coord_y_'+ viewId+ ']"]').val(item.lng);
								$mapCustomControlsDiv.find('[name="custom_search[marker_id_'+ viewId+ ']"]').val('');
								$mapCustomControlsDiv.find('[name="custom_search[marker_group_id_'+ viewId+ ']"]').val('');
							}
							if(item.marker_id) {
								$mapCustomControlsDiv.find('[name="custom_search[coord_x_'+ viewId+ ']"]').val('');
								$mapCustomControlsDiv.find('[name="custom_search[coord_y_'+ viewId+ ']"]').val('');
								$mapCustomControlsDiv.find('[name="custom_search[marker_id_'+ viewId+ ']"]').val(item.marker_id);
								$mapCustomControlsDiv.find('[name="custom_search[marker_group_id_'+ viewId+ ']"]').val('');
							}
							if(item.marker_group_id) {
								$mapCustomControlsDiv.find('[name="custom_search[coord_x_'+ viewId+ ']"]').val('');
								$mapCustomControlsDiv.find('[name="custom_search[coord_y_'+ viewId+ ']"]').val('');
								$mapCustomControlsDiv.find('[name="custom_search[marker_id_'+ viewId+ ']"]').val('');
								$mapCustomControlsDiv.find('[name="custom_search[marker_group_id_'+ viewId+ ']"]').val(item.marker_group_id);
							}
						}
					}
				}
			,	i;

			if(map.getParam('custom_controls_search_country')) {
				autocompleateData.geocoderParams.componentRestrictions = {
					country: map.getParam('custom_controls_search_country')
				}
			}
			for(i = 0; i < markers.length; i++) {
				markersContent.push({
					label: markers[i].getTitle()
				,	marker_desc: markers[i].getDescription()
				,	marker_id: markers[i].getId()
				});
			}

			gmpShowCustomControlsMarkerGroupsTree(viewId);
			if (map.getParam('custom_filter_show_all') == 1) {
				jQuery('#gmpCustomFilterFormShell_' + viewId).treeview('checkAll', { silent: true });
				gmpMarkersFilter(viewId);
			} else {
				jQuery('#gmpCustomFilterFormShell_' + viewId).treeview('uncheckAll', { silent: true });
				gmpMarkersFilter(viewId);
			}
			gmpAddMarkerGroupsDataToAutocomplete(g_gmpGroupsList);
			autocompleateData.additionalData = [ markersContent, markersGroups ];

			map.getRawMapInstance()
				.controls[ google.maps.ControlPosition[ map.getParam( 'custom_controls_position' ) ] ]
				.push( mapCustomControlsDiv );

			$mapCustomControlsDiv.find('[name="custom_search[address_'+ viewId+ ']"]').mapSearchAutocompleateGmp(autocompleateData);
			$mapCustomControlsDiv.show();
			this._wasInit[ viewId ] = true;
		}
	}
,	controlsFormsPosition: function(controlPosition, viewId){
		switch (controlPosition) {
			case 'TOP_CENTER':
			case 'TOP_LEFT':
			case 'LEFT_TOP':
				jQuery('#gmpCustomSearchFormShell_'+ viewId).css({'top': '0px', 'left': '40px'});
				jQuery('#gmpCustomFilterFormShell_'+ viewId).css({'top': '0px', 'left': '40px'});
				break;
			case 'TOP_RIGHT':
			case 'RIGHT_TOP':
				jQuery('#gmpCustomSearchFormShell_'+ viewId).css({'top': '0px', 'right': '40px'});
				jQuery('#gmpCustomFilterFormShell_'+ viewId).css({'top': '0px', 'right': '40px'});
				break;
			case 'LEFT_BOTTOM':
			case 'BOTTOM_LEFT':
			case 'LEFT_CENTER':
			case 'BOTTOM_CENTER':
				jQuery('#gmpCustomSearchFormShell_'+ viewId).css({'left': '40px', 'bottom': '0px'});
				jQuery('#gmpCustomFilterFormShell_'+ viewId).css({'left': '40px', 'bottom': '0px'});
				break;
			case 'RIGHT_BOTTOM':
			case 'BOTTOM_RIGHT':
			case 'RIGHT_CENTER':
				jQuery('#gmpCustomSearchFormShell_'+ viewId).css({'right': '40px', 'bottom': '0px'});
				jQuery('#gmpCustomFilterFormShell_'+ viewId).css({'right': '40px', 'bottom': '0px'});
				break;
		}
	}
};
jQuery(document).bind('gmapBeforeMapInit', function(event, map){
	g_gmpCustomMapControls.beforeMapInit(map);
});
jQuery(document).bind('gmapAfterMapInit', function(event, map){
	g_gmpCustomMapControls.afterMapInit(map);
});
function gmpGetCurMapByViewId(viewId) {
	if(typeof(g_gmpMap) !== 'undefined') {
		return g_gmpMap;
	} else {
		return gmpGetMapByViewId(viewId);
	}
}
function gmpZoomInBtn(btn){
	var viewId = jQuery(btn).data('viewid')
	,	map = gmpGetCurMapByViewId(viewId);
	map.setZoom(map.getZoom() + 1);
}
function gmpZoomOutBtn(btn){
	var viewId = jQuery(btn).data('viewid')
	,	map = gmpGetCurMapByViewId(viewId);
	map.setZoom(map.getZoom() - 1);
}
function gmpShowSearchForm(btn){
	var viewId = jQuery(btn).data('viewid')
	, 	customSearchForm = jQuery('#gmpCustomSearchFormShell_' + viewId).is(':visible')
	, 	customFilterForm = jQuery('#gmpCustomFilterFormShell_' + viewId).is(':visible');
	if(customSearchForm == false){
		if(customFilterForm == true) {
			jQuery('#gmpCustomFilterFormShell_' + viewId).hide();
			jQuery('#gmpCustomFilterBtn_' + viewId).removeClass('gmpActiveButton');
		}
		jQuery('#gmpCustomSearchFormShell_' + viewId).show();
		jQuery('#gmpCustomSearchBtn_' + viewId).addClass('gmpActiveButton');
	} else {
		jQuery('#gmpCustomSearchFormShell_' + viewId).hide();
		jQuery('#gmpCustomSearchBtn_' + viewId).removeClass('gmpActiveButton');
	}
}
function gmpShowFilterForm(btn){
	var viewId = jQuery(btn).data('viewid')
	, 	customFilterForm = jQuery('#gmpCustomFilterFormShell_' + viewId).is(':visible')
	, 	customSearchForm = jQuery('#gmpCustomSearchFormShell_' + viewId).is(':visible');
	if(customFilterForm == false){
		if(customSearchForm == true){
			jQuery('#gmpCustomSearchFormShell_' + viewId).hide();
			jQuery('#gmpCustomSearchBtn_' + viewId).removeClass('gmpActiveButton');
		}
		jQuery('#gmpCustomFilterFormShell_' + viewId).show();
		jQuery('#gmpCustomFilterBtn_' + viewId).addClass('gmpActiveButton');
	}else{
		jQuery('#gmpCustomFilterFormShell_' + viewId).hide();
		jQuery('#gmpCustomFilterBtn_' + viewId).removeClass('gmpActiveButton');
	}
}
function gmpMarkersSearch(btn){
	var viewId = jQuery(btn).data('viewid')
	,	mapCustomControlsDiv = jQuery('#gmpCustomControlsShell_' + viewId);
	mapCustomControlsDiv.find('.gmpSearchFormErrors').hide();

	var map = gmpGetCurMapByViewId(viewId)
	,	mapMarkers = map.getAllMarkers()
	,	lat = mapCustomControlsDiv.find('[name="custom_search[coord_x_' + viewId + ']"]').val()
	,	lng = mapCustomControlsDiv.find('[name="custom_search[coord_y_' + viewId + ']"]').val()
	,   search = mapCustomControlsDiv.find('[name="custom_search[address_' + viewId + ']"]').val()
	,	markerId = jQuery(mapCustomControlsDiv).find('[name="custom_search[marker_id_'+ viewId+ ']"]').val()
	,	markerGroupId = jQuery(mapCustomControlsDiv).find('[name="custom_search[marker_group_id_'+ viewId+ ']"]').val()
	,	allMarkersIdList = []
	,	markersIdList = []
	,	curMarkerId = ''
	,	curMarkerGroupId = '';

	if (!lat && !lng) {
        var mapCenter = map.getCenter();
        lat = mapCenter.lat();
        lng = mapCenter.lng();
    }
	if (search == '') {
		markerId = '';
		markerGroupId = '';
	}

	if (markerId) {
		for(var j = 0; j < mapMarkers.length; j++){
			curMarkerId = mapMarkers[j].getId();

			if(curMarkerId != markerId) {
				markersIdList[markersIdList.length] = curMarkerId;
			} else {
				map.setCenter(mapMarkers[j].lat(), mapMarkers[j].lng());
			}
		}
	} else if (markerGroupId) {
		for(var z = 0; z < mapMarkers.length; z++){
			curMarkerGroupId = mapMarkers[z].getMarkerParam('marker_group_id');
			curMarkerId = mapMarkers[z].getId();

			if(curMarkerGroupId != markerGroupId) {
				markersIdList[markersIdList.length] = curMarkerId;
			}
		}
	} else if (lat && lng) {
		var center = new google.maps.LatLng(lat, lng);

		if (map.getParam( 'custom_controls_unit' ) === "mile") {
			var	radius = parseInt(mapCustomControlsDiv.find('[name="custom_search[area_' + viewId + ']"]').val(), 10);
			radius = radius * 1609.34;
		} else {
			var	radius = parseInt(mapCustomControlsDiv.find('[name="custom_search[area_' + viewId + ']"]').val(), 10);
		}

		if(g_gmpAllCircles[map.getViewId()]) {
			g_gmpAllCircles[map.getViewId()].setMap(null);
			g_gmpAllCircles[map.getViewId()] = null;
		}
		g_gmpAllCircles[map.getViewId()] = new google.maps.Circle({
			strokeColor: '#6699ff'
		,	strokeOpacity: 0.8
		,	strokeWeight: 2
		,	fillColor: '#6699ff'
		,	fillOpacity: 0.35
		,	map: map.getRawMapInstance()
		,	center: center
		,	radius: radius
		});

		var circleBounds = g_gmpAllCircles[map.getViewId()].getBounds();
		for(var i = 0; i < mapMarkers.length; i++){
			curMarkerId = mapMarkers[i].getId();

			allMarkersIdList[allMarkersIdList.length] = curMarkerId;

			var markerLatLng = new google.maps.LatLng(mapMarkers[i].lat(), mapMarkers[i].lng())
			,	isInCircle = circleBounds.contains(markerLatLng);

			if(!isInCircle) {
				markersIdList[markersIdList.length] = curMarkerId;
			}
		}
		map.setCenter(lat, lng);
	}  else {
		mapCustomControlsDiv.find('#gmpSearchFormNoMarkers_' + viewId).show();
		return;
	}

	if(markersIdList.length == allMarkersIdList.length){
		if(g_gmpAllCircles[map.getViewId()])
			g_gmpAllCircles[map.getViewId()].setMap(null);
		jQuery('#gmpResetBtn_' + viewId).css('display', 'inline');
		mapCustomControlsDiv.find('#gmpSearchFormNoMarkers_' + viewId).show();
	} else {
		jQuery('#gmpResetBtn_' + viewId).css('display', 'inline');
	}
	return gmpHideMarkers(markersIdList, map);
}
function gmpSearchReset(btn){
	var viewId = jQuery(btn).data('viewid')
	,	map = gmpGetCurMapByViewId(viewId)
	,	mapMarkers = map.getAllMarkers();
	for(var i = 0; i < mapMarkers.length; i++){
		mapMarkers[i].getRawMarkerInstance().setVisible(true);
	}
	if(map._clastererEnabled) {
		map.disableClasterization();
		map.enableClasterization(map._mapParams.marker_clasterer, true);
	}
	var mapCustomControlsDiv = jQuery('#gmpCustomControlsShell_' + viewId);
	if(g_gmpAllCircles[map.getViewId()]) {
		g_gmpAllCircles[map.getViewId()].setMap(null);
		g_gmpAllCircles[map.getViewId()] = null;
	}
	if(map.getParam('marker_list_params')){
		var $sliderContent = jQuery('#' + map.getParam('simple_slider_id'));

		$sliderContent.html(map.getParam('original_slider_html'));	// Reset current slider to it's original html

		gmpBuildListHtml(map);	// Build slider one more time with required number of slides
	}
	mapCustomControlsDiv.find('[name="custom_search[address_' + viewId + ']"]').val('');
	mapCustomControlsDiv.find('[name="custom_search[coord_x_' + viewId + ']"]').val('');
	mapCustomControlsDiv.find('[name="custom_search[coord_y_' + viewId + ']"]').val('');
	mapCustomControlsDiv.find('.gmpSearchFormErrors').hide();
	jQuery('#gmpResetBtn_' + viewId).hide();
}
/*function gmpMarkersFilter(btn){
	var viewId = jQuery(btn).data('viewid')
	,	customFilterFormShell = jQuery('#gmpCustomFilterFormShell_'+ viewId)
	,	map = gmpGetCurMapByViewId(viewId)
	,	mapMarkers = map.getAllMarkers()
	,	groupsList = []
	,	markersIdList = [];
	customFilterFormShell.find('input[type=checkbox]:checked').each(function(){
		groupsList.push(jQuery(this).data('groupid'));
	});
	customFilterFormShell.find('input[type=checkbox]').each(function(){
		for(var j = 0; j < groupsList.length; j++) {
			if(groupsList[j] == jQuery(this).data('parentid')) {
				groupsList.push(jQuery(this).data('groupid'));
			}
		}
	});
	for(var i = 0; i < mapMarkers.length; i++){
		if(toeInArray(mapMarkers[i]._markerParams.marker_group_id, groupsList) == -1 && groupsList.length != 0){
			markersIdList[markersIdList.length] = mapMarkers[i]._markerParams.id;
		}
	}
	return gmpHideMarkers(markersIdList, map);
}*/
function gmpHideMarkers(markers, map){
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
	gmpSliderMarkersHide(markers, map);
}
function gmpSliderMarkersHide(markers, map){
	if(map.getParam('marker_list_params')){
		var $sliderContent = jQuery('#' + map.getParam('simple_slider_id'))
		,	sliderType = $sliderContent.data('slider-type');

		switch(sliderType) {
			case 'table':
				$sliderContent.find('.gmpMmlSlideTableRow').each(function () {	// Hide unused rows
					jQuery(this).show();
					if(toeInArray(jQuery(this).data('marker-id'), markers) >= 0) {
					 	jQuery(this).hide();
					 }
				});
				$sliderContent.find('.gmpMmlSlidesTableScroll').each(function () {	// Remove / show marker groups
					var show = false;

					jQuery(this).find('.gmpMmlSlideTableRow').each(function () {
						if(jQuery(this).css('display') != 'none') {
							show = true;
						}
					});
					if(show) {
						jQuery(this).prev().show();
					} else {
						if(jQuery(this).hasClass('active')) {
							jQuery(this).removeClass('active').hide();
						}
						jQuery(this).prev().hide();
					}
				});
				break;
			case 'jssor':
			default:
				$sliderContent.html(map.getParam('original_slider_html'));	// Reset current slider to it's original html
				$sliderContent.find('.gmpMnlJssorSlide').each(function () {	// Remove unused in search html slides
					for(var i = 0; i < markers.length; i++) {
						if(jQuery(this).data('marker-id') == markers[i]) {
							jQuery(this).remove();

							// find marker by id
							var mmInd = 0
							,	mmFound = -1;
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
				map._visibleMarkersCount = map.getAllMarkers().length - markers.length;
				gmpBuildListHtml(map);	// Build slider one more time with required number of slides
				break;
		}
	}
}
function gmpShowCustomControlsMarkerGroupsTree(viewId) {
	g_gmpGroupsList = window.hasOwnProperty('g_gmpGroupsList_'+viewId) ? window['g_gmpGroupsList_'+viewId] : [];
	if(g_gmpGroupsList && g_gmpGroupsList.length) {
		g_gmpCustomControlsFilterShell = jQuery('#gmpCustomFilterFormShell_' + viewId);
		g_gmpCustomControlsFilterShell.treeview({
			data: gmpGetCustomControlsMarkerGroupsTree(g_gmpGroupsList, viewId),
			showCheckbox: true,
			selectable: false,
			checkedIcon: 'fa fa-check-square-o',
			uncheckedIcon: 'fa fa-square-o',
			expandIcon: 'fa fa-chevron-right',
			collapseIcon: 'fa fa-chevron-down',
			emptyIcon: 'fa',
			onhoverColor: 'transparent',
			onNodeChecked: function(event, data) {
				var $this = jQuery(this);
				//	,	siblings = $this.treeview('getSiblings', [ data.nodeId ])
				//	,	parent = $this.treeview('getParent', [ data.nodeId ])
				//	,	needCheck = true;

				if(data.nodes && data.nodes.length) {
					gmpUpdateChildrenNodes(data.nodes, $this, 'checkNode');
				}
				/*for(var j = 0; j < siblings.length; j++) {
					if(!siblings[j].state.checked) {
						needCheck = false;
					}
				}
				if(needCheck) {
					$this.treeview('checkNode', [ parent.nodeId ])
				}*/
				gmpMarkersFilter(data.map_view_id);
			},
			onNodeUnchecked: function(event, data) {
				var $this = jQuery(this);
				//,	parent = $this.treeview('getParent', [ data.nodeId ]);

				if(data.nodes && data.nodes.length) {
					gmpUpdateChildrenNodes(data.nodes, $this, 'uncheckNode');
				}
				//if(typeof parent.nodeId != 'undefined') {
				//	$this.treeview('uncheckNode', [ parent.nodeId, { silent: true } ]);
				//}
				gmpMarkersFilter(data.map_view_id);
			}
		});
		g_gmpCustomControlsFilterShell.treeview('collapseAll', { silent: true });
	}
}
function gmpGetCustomControlsMarkerGroupsTree(groups, viewId) {
	for(var i in groups) {
		if(typeof groups[i] == 'object') {
			groups[i].text = groups[i].title;
			groups[i].backColor = groups[i].params.bg_color;
			groups[i].nodes = groups[i].children && groups[i].children.length ? groups[i].children : null;
			groups[i].selectable = false;
			groups[i].map_view_id = viewId;
			delete groups[i].children;
			if(groups[i].nodes) {
				groups[i].nodes = gmpGetCustomControlsMarkerGroupsTree(groups[i].nodes, viewId);
			}
		}
	}
	return groups;
}
function gmpUpdateChildrenNodes(nodes, treeObj, action) {
	var groupsList = [];
	for(var i = 0; i < nodes.length; i++) {
		treeObj.treeview(action, [ nodes[i].nodeId, { silent: true } ]);
		groupsList.push(nodes[i].id);
		if(nodes[i].nodes) {
			groupsList.concat(gmpUpdateChildrenNodes(nodes[i].nodes, treeObj, action));
		}
	}
	return groupsList;
}
function gmpMarkersFilter(viewId, action) {
	var checked = g_gmpCustomControlsFilterShell.treeview('getChecked')
	,	map = gmpGetCurMapByViewId(viewId)
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
		return gmpHideMarkers(markersIdListFull, map);
	}
	return gmpHideMarkers(markersIdList, map);
}
function gmpAddMarkerGroupsDataToAutocomplete(list) {
	if(list && list.length > 0) {
		for(var n = 0; n < list.length; n++) {
			markersGroups.push({
				label: list[n].text
			,	marker_group_id: list[n].id
			});
			if(list[n].nodes) {
				markersGroups = gmpAddMarkerGroupsDataToAutocomplete(list[n].nodes);
			}
		}
	}
	return markersGroups;
}

(function($) {
	function gmpCustomControlsPro() {
		this.isSearched = false;
		// if button is visible, than - use Improve Search
		this.isUseImproveSearch = jQuery('.gmpImproveSearchContainer').css('display') != 'none';

		if(this.isUseImproveSearch) {
			var gccpSelf = this;
			jQuery(document).bind('gmapAfterMapInit', function(event, map) {
				var viewId = map.getViewId();
				gccpSelf.improveSearchTreeViewInit(viewId);
			});
			this.selectedDates = {};
		}
	}

	gmpCustomControlsPro.prototype.init = (function() {
		if(this.isUseImproveSearch) {
			this.improveSearchDatepickerInit();
			this.improveSearchInit();
			this.initForMobile();
		}
	});

	gmpCustomControlsPro.prototype.initForMobile = (function() {
		// check if mobile?
		jQuery('.gmpImproveSearchFormWr.gmpMobile').each(function(ind1, item1) {
			// get tab link wrapper
			var $currWindow = jQuery(this)
			,	$tabLinks = $currWindow.find('.gmpIsfTabRoller .gmpIsfTabLink')
			,	$tabItems = $currWindow.find('.gmpIsfTabRoller .gmpIsfTabLink')
			;
			if($tabItems.length && $tabLinks.length) {
				$tabLinks.on('click', function(event) {
					var $currLink = jQuery(this)
					,	tabDataType = $currLink.attr('data-tab-link')
					;
					$tabLinks.removeClass('gmpActive');
					$currLink.addClass('gmpActive');
					if(tabDataType) {
						$currWindow.find('.gmpIsfTabItem')
							.hide();
						$currWindow.find('.gmpIsfTabItem[data-tab-item="' + tabDataType + '"]')
							.show();
					}
				});
				$tabLinks.eq(0).trigger('click');
			}
		});
	});

	gmpCustomControlsPro.prototype.improveSearchTreeViewInit = (function(viewId) {
		var self = this;
        g_gmpGroupsList = window.hasOwnProperty('g_gmpGroupsList_'+viewId) ? window['g_gmpGroupsList_'+viewId] : [];

		this.$improveSearchTreeView = jQuery('.gmpImproveSearchCategoryList[data-viewid="' + viewId + '"]');
		this.$improveSearchTreeView.treeview({
			'data': gmpGetCustomControlsMarkerGroupsTree(g_gmpGroupsList, viewId),
			'showCheckbox': true,
			'selectable': false,
			'checkedIcon': 'fa fa-check-square-o',
			'uncheckedIcon': 'fa fa-square-o',
			'expandIcon': 'fa fa-chevron-right',
			'collapseIcon': 'fa fa-chevron-down',
			'emptyIcon': 'fa',
			'onhoverColor': 'transparent',
			onNodeChecked: function(event, data) {
				var $this = jQuery(this);
				if(data.nodes && data.nodes.length) {
					gmpUpdateChildrenNodes(data.nodes, $this, 'checkNode');
				}
			},
			onNodeUnchecked: function(event, data) {
				var $this = jQuery(this);

				if(data.nodes && data.nodes.length) {
					gmpUpdateChildrenNodes(data.nodes, $this, 'uncheckNode');
				}
			}
		});
		this.$improveSearchTreeView.treeview('collapseAll', { silent: true });
		jQuery(document).on('click', '.list-group-item', function(e) {
			self._setNodesStyle();
		});
		self._setNodesStyle();
	});

	gmpCustomControlsPro.prototype._setNodesStyle = (function() {
		if(g_gmpGroupsOptions) {
			if(g_gmpGroupsOptions.lvl_font_size && g_gmpGroupsOptions.lvl_font_size.length) {
				var items = this.$improveSearchTreeView.find('.list-group-item');
				for(var i = 0; i < items.length; i++) {
					var $item = jQuery(items[i])
					,	$indents = $item.find('.indent')
					,	fontSize = '';
					if($indents.length) {
						if(g_gmpGroupsOptions.lvl_font_size[$indents.length]) {
							fontSize = g_gmpGroupsOptions.lvl_font_size[$indents.length];
						} else {
							fontSize = g_gmpGroupsOptions.lvl_font_size[g_gmpGroupsOptions.lvl_font_size.length - 1];
						}
					} else {
						fontSize = g_gmpGroupsOptions.lvl_font_size[0];
					}
					$item.css({
						'font-size': fontSize+ 'px',
						'line-height': (+fontSize + 8)+ 'px'
					});
				}
			}
		}
	});

	gmpCustomControlsPro.prototype.applyMarkerVisibility = (function(viewId, mapId, searchText, dateFrom, dateTo, datesIgnore) {
		var $checkedCb = this.$improveSearchTreeView.treeview('getChecked')
		,	map = gmpGetCurMapByViewId(viewId)
		,	mapMarkers = map.getAllMarkers()
		,	groupsList = []
		,	markersIdList = []
		,	isHide = false
		;
		searchText = searchText.toLowerCase();
		for(var j = 0; j < $checkedCb.length; j++) {
			groupsList.push($checkedCb[j].id);
		}
		if(!datesIgnore) {
			datesIgnore = 0;
		}

		for(var i = 0; i < mapMarkers.length; i++) {
			isHide = false;
			var mTitle = mapMarkers[i].getMarkerParam('title')
			,	mDescr = mapMarkers[i].getMarkerParam('description')
			,	mPeriodFrom = null
			,	mPeriodTo = null
			,	mPfTime = null
			,	mPtTime = null
			,	dfTime
			,	dtTime
			,	tmpTime = null;
			;
			if(mapMarkers[i].getMarkerParam('period_from')) {
				mPeriodFrom = new Date(mapMarkers[i].getMarkerParam('period_from'))
				// reset Hours, minutes and seconds for Marker Values
				mPeriodFrom.setHours(0);
				mPeriodFrom.setMinutes(0);
				mPeriodFrom.setSeconds(0);
				mPfTime = mPeriodFrom.getTime();
			}
			if(mapMarkers[i].getMarkerParam('period_to')) {
				mPeriodTo = new Date(mapMarkers[i].getMarkerParam('period_to'))
				mPeriodTo.setHours(0);
				mPeriodTo.setMinutes(0);
				mPeriodTo.setSeconds(0);
				mPtTime = mPeriodTo.getTime();
			}

			if(!datesIgnore) {
				// if data is null then marker exists outside of time and space
				if(!mapMarkers[i].getMarkerParam('period_from') && !mapMarkers[i].getMarkerParam('period_to')) {
				} else if(mPfTime && mPtTime) {
					// required: two marker dates are setted
					// if date set incorrect (change place)
					if(mPfTime > mPtTime) {
						tmpTime = mPfTime;
						mPfTime = mPtTime;
						mPtTime = tmpTime;
					}
					if(dateFrom) {
						dfTime = dateFrom.getTime();
					}
					if(dateTo) {
						dtTime = dateTo.getTime();
					}
					if(dfTime) {
						// if second date not setted - than use first date
						if(!dtTime) {
							dtTime = dfTime;
						}
						// if date set incorrect (change place)
						if(dfTime > dtTime) {
							tmpTime = dfTime;
							dfTime = dtTime;
							dtTime = tmpTime;
						}

						if(
							// when marker dates in user period
							((dfTime <= mPfTime && mPfTime < dtTime) || (dfTime <= mPtTime && mPtTime < dtTime))
							// when user period inside Marker dates
							|| (mPfTime <= dfTime  && dfTime <= mPtTime) || (mPfTime <= dtTime && dtTime <= mPtTime)
						) {
						} else {
							isHide = true;
						}
					}
				}
			}

			// check is marker has Checked group
			if(groupsList.length) {
				if(toeInArray(mapMarkers[i].getMarkerParam('marker_group_id'), groupsList) == -1) {
					isHide = true;
				}
			}

			if(searchText && searchText.length) {
				if(mTitle.toLowerCase().indexOf(searchText) == -1 && mDescr.toLowerCase().indexOf(searchText) == -1) {
					isHide = true;
				}
			}
			if(isHide) {
				markersIdList[markersIdList.length] = mapMarkers[i].getMarkerParam('id');
			}
		}
		return gmpHideMarkers(markersIdList, map);
	});

	// run after map showed and GMP inited
	gmpCustomControlsPro.prototype.afterAllMapsInfoInitedHandler = (function() {
		if(this.$improveSearchTreeView) {
			for(var i = 0; i < gmpAllMapsInfo.length; i++) {
				if(jQuery('#'+ gmpAllMapsInfo[i].view_html_id).length) {
					var viewId = gmpAllMapsInfo[i].view_id
					,	$datePickerList = jQuery('.gmpImproveSearchCalendar[data-viewid="' + viewId + '"]');
					if($datePickerList.length) {
						todayDate = $.datepicker.parseDate('dd-mm-yy', $datePickerList.eq(0).attr('data-today'));
						this.applyMarkerVisibility(viewId, gmpAllMapsInfo[i].id, '', todayDate, todayDate);
					}
				}
			}
		}
	});

	gmpCustomControlsPro.prototype.improveSearchDatepickerInit = (function() {
		this.dates = {};
		this.calendarDateFormat = 'dd-mm-yy';
		var selfGccp = this
		,	datePickerConfiguration = {
				'showAnim': 'fadeIn',
				'changeMonth': true,
				'changeYear': true,
				'dateFormat': this.calendarDateFormat,
				'showWeek': false,
				'firstDay': 1,
		};

		jQuery('.gmpImproveSearchCalendar').each(function(dpInd, dpItem) {
			var $currDp = jQuery(dpItem)
			,	viewId = $currDp.attr('data-viewid')
			,	todayData = $currDp.attr('data-today')
			,	todayDate = $.datepicker.parseDate(selfGccp.calendarDateFormat, todayData)
			;
			// init
			selfGccp.selectedDates[viewId] = {};
			selfGccp.selectedDates[viewId][0] = todayDate;
			selfGccp.selectedDates[viewId][1] = todayDate;

			datePickerConfiguration['beforeShowDay'] = function(date) {
				var date1 = selfGccp.selectedDates[viewId][0]
				,	date2 = selfGccp.selectedDates[viewId][1]
				,	tmpDate
				,	hightLightClass = ''
				;
				if(date1) {
					date1 = date1.getTime();
					if(date2) {
						date2 = date2.getTime();
						// if user select backward date order
						if(date2 < date1) {
							tmpDate = date1;
							date1 = date2;
							date2 = tmpDate;
						}
					}
					date = date.getTime();

					if(date1 && ((date == date1) || (date2 && date >= date1 && date <= date2))) {
						hightLightClass = 'gmpDpHighLight';
					}
				}

				return [true, hightLightClass];
			};

			datePickerConfiguration['onSelect'] = function(dateText, inst) {
				var date1 = selfGccp.selectedDates[viewId][0]
				,	date2 = selfGccp.selectedDates[viewId][1]
				,	selectedDate = $.datepicker.parseDate(selfGccp.calendarDateFormat, dateText)
				;
				if(date1 && !date2) {
					// is first date setted
					selfGccp.selectedDates[viewId][1] = selectedDate;
				} else {
					// is two dates already setted
					// not dates setted
					// is only second date setted
					selfGccp.selectedDates[viewId][0] = selectedDate;
					selfGccp.selectedDates[viewId][1] = null;
				}
			};

			$currDp.datepicker(datePickerConfiguration);
		});
	});

	gmpCustomControlsPro.prototype._searchFieldClb = (function(el, action) {
		el = el instanceof jQuery ? el : jQuery(el);
		var $map = el.parents('.gmp_map_opts:first')
		,	collapseShell = $map.find('.gmpMarkersListCollapseShell');
		if(collapseShell.length) {
			if(action == 'focus') {
				collapseShell.accordion('disable');
				collapseShell.hide();
			} else {
				collapseShell.accordion('enable');
				collapseShell.show();
			}
			var mapViewId = $map.data('view-id')
			,	mapObj = gmpGetCurMapByViewId(mapViewId)
			,	selectors = mapObj.getParam('selectors');

			if(selectors && selectors.content_after) {
				var contentAfter = jQuery(selectors.content_after);
				if(contentAfter.length) {
					if(action == 'focus') {
						contentAfter.hide();
						$map.attr('data-rmh-additional-elem', '');
						$map.data('rmh-additional-elem', '');
						$map.attr('data-rmh-without-after', true);
						$map.data('rmh-without-after', true);
					} else {
						contentAfter.show();
						$map.attr('data-rmh-additional-elem', 'mapConElem_'+ mapViewId+ ' .gmpMarkersListCollapseTitle');
						$map.data('rmh-additional-elem', 'mapConElem_'+ mapViewId+ ' .gmpMarkersListCollapseTitle');
						$map.attr('data-rmh-without-after', false);
						$map.data('rmh-without-after', false);
					}
					mapObj.resizeMapByHeight();
				}
			}
		}
	});

	gmpCustomControlsPro.prototype.improveSearchInit = (function() {
		var $improveSearchContainer = jQuery('.gmpImproveSearchContainer')
		,	gccpSelf = this
		;
		$improveSearchContainer.each(function(cntInd, cntItem) {
			var $currContainer = jQuery(cntItem)
			,	$improveSearchBtn = $currContainer.find('.gmpCustomControlButton')
			,	$imprSearchFormWrapper = $currContainer.find('.gmpImproveSearchFormWr')
			,	$findBtn = $currContainer.find('.gmpImproveSearchFindBtn')
			,	$resetBtn = $currContainer.find('.gmpImproveSearchResetBtn')
			,	$searchField = $currContainer.find('.gmpImproveSearchText')
			,	$searchForAllDatesFlag = $currContainer.find('.gmpDateAllLabel .gmpDateAllFlag')
			,	viewId = $currContainer.parents('.gmp_map_opts:first').data('view-id')
			,	$map = $currContainer.parents('.gmp_map_opts:first').find('.gmpMapDetailsContainer')
			,	map = gmpGetMapByViewId(viewId)
			,	controlPosition = map ? map.getParam('custom_controls_position') : false
			,	focusTimeout = null
			,	keyPressTimeOut = null
			,	focusoutEvent = ((typeof(jQuery.browser) != 'undefined' && jQuery.browser.msie) || !!navigator.userAgent.match(/Trident\/7\./))
				? 'focusout'
				: 'blur';

			$searchField.on('focus', function(event) {
				clearTimeout(focusTimeout);
				gccpSelf._searchFieldClb(this, 'focus');
			});
			$searchField.on(focusoutEvent, function(event) {
				var self = this;
				focusTimeout = setTimeout(function() {
					gccpSelf._searchFieldClb(self, 'focusout');
				}, 200);
			});
			$searchField.on('keypress', function(event) {
				clearTimeout(keyPressTimeOut);
				if(event.which == 13) {
					var self = this;
					keyPressTimeOut = setTimeout(function() {
						gccpSelf._searchFieldClb(self, 'focusout');
						$findBtn.trigger('click');
					}, 1000);
				}
			});
			if(controlPosition && google.maps.ControlPosition[controlPosition]) {
				$imprSearchFormWrapper.css({
					'width': parseInt($map.width() * 0.8)
				});
				if($currContainer.hasClass('gmpExtendSearchBtn')) {
					$imprSearchFormWrapper.css({
						'top': $improveSearchBtn.outerHeight(true),
						'left': '-' + (($imprSearchFormWrapper.outerWidth() / 2) - ($improveSearchBtn.outerWidth() / 2))+ 'px'
					});
					map.getRawMapInstance().controls[google.maps.ControlPosition['TOP_CENTER']].push($currContainer.get(0));
				} else {
					switch (controlPosition) {
						case 'TOP_CENTER':
						case 'TOP_LEFT':
						case 'LEFT_TOP':
							$imprSearchFormWrapper.css({
								'top': '0',
								'left': $improveSearchBtn.outerWidth(true)
							});
							break;
						case 'TOP_RIGHT':
						case 'RIGHT_TOP':
							$imprSearchFormWrapper.css({
								'top': '0',
								'right': $improveSearchBtn.outerWidth(true)
							});
							break;
						case 'LEFT_BOTTOM':
						case 'BOTTOM_LEFT':
						case 'LEFT_CENTER':
						case 'BOTTOM_CENTER':
							$imprSearchFormWrapper.css({
								'left': $improveSearchBtn.outerWidth(true),
								'bottom': '0'
							});
							break;
						case 'RIGHT_BOTTOM':
						case 'BOTTOM_RIGHT':
						case 'RIGHT_CENTER':
							$imprSearchFormWrapper.css({
								'right': $improveSearchBtn.outerWidth(true),
								'bottom': '0'
							});
							break;
					}
				}
			}
			$improveSearchBtn.on('click', function(event) {
				var $map = jQuery(this).parents('.gmp_map_opts').find('.gmpMapDetailsContainer');
				if($improveSearchBtn.hasClass('gmpActiveButton')) {
					$improveSearchBtn.removeClass('gmpActiveButton');
					$imprSearchFormWrapper.hide();
					$currContainer.removeClass('gmpBiggerZIndex');
				} else {
					$improveSearchBtn.addClass('gmpActiveButton');
					$imprSearchFormWrapper.show();
					$imprSearchFormWrapper.removeClass('gmpMobile');
					if(($imprSearchFormWrapper.width() >= ($map.width() - Math.ceil($imprSearchFormWrapper.offset().left) - 10)) || $imprSearchFormWrapper.data('is-mobile')) {
						$imprSearchFormWrapper.addClass('gmpMobile')
					}
					$currContainer.addClass('gmpBiggerZIndex');
				}
				$imprSearchFormWrapper.css({
					'max-height': $map.height() - $improveSearchBtn.outerHeight(true)
				});
				if(!$imprSearchFormWrapper.data('is-mobile')) {
                    resizeDataPicker(12);
                } else {
					var lastSearchBlock = $imprSearchFormWrapper.find('.gmpImproveSearchBlock:last');
					if (lastSearchBlock) {
						var hTab = $map.height() - $improveSearchBtn.outerHeight(true) - lastSearchBlock.height() - 50;
						if (jQuery(window).height() <= 500) {
                            hTab += 40;
						}
                        $imprSearchFormWrapper.find('.gmpIsfTabItem').css({
                            'max-height': hTab
                        });
                    }
				}
			});

			function resizeDataPicker(fontSize) {
				$imprSearchFormWrapper.find('.ui-datepicker').css('font-size', fontSize+ 'px!important');
				if(($imprSearchFormWrapper.find('.gmpImproveSearchCalendarWr').width() - 40) > $imprSearchFormWrapper.find('.ui-datepicker').width()) {
					setTimeout(function() {
						fontSize++;
						resizeDataPicker(fontSize);
					}, 10);
				}
			}

			$imprSearchFormWrapper.find('.gmpIsfCloseBtn').on('click', function(event) {
				if($improveSearchBtn.hasClass('gmpActiveButton')) {
					$improveSearchBtn.removeClass('gmpActiveButton');
					$imprSearchFormWrapper.hide();
					$currContainer.removeClass('gmpBiggerZIndex');
				}
			});

			$findBtn.on('click', function(event) {
				gccpSelf.isSearched = true;
				var $currBtn = jQuery(this)
				,	$searchForm = $currBtn.closest('.gmpImproveSearchForm')
				,	$findInput = $searchForm.find('.gmpImproveSearchText')
				,	mapId = $currBtn.attr('data-mapid')
				,	viewId = $currBtn.attr('data-viewid')
				;

				gccpSelf.applyMarkerVisibility(viewId, mapId, $findInput.val(), gccpSelf.selectedDates[viewId][0], gccpSelf.selectedDates[viewId][1], $searchForAllDatesFlag.is(':checked'));
			});

			$resetBtn.on('click', function(event) {
				var $currBtn = jQuery(this)
				,	viewId = $currBtn.attr('data-viewid')
				,	mapId = $currBtn.attr('data-mapid')
				,	$searchForm = $currBtn.closest('.gmpImproveSearchForm')
				,	$findInput = $searchForm.find('.gmpImproveSearchText')
				,	todayDate
				,	$datePickerList = jQuery('.gmpImproveSearchCalendar[data-viewid="' + viewId + '"]')
				;
				// reset the search text
				$findInput.val('');
				// reset dates
				gccpSelf.selectedDates[viewId][0] = null;
				gccpSelf.selectedDates[viewId][1] = null;
				if($datePickerList.length) {
					todayDate = $.datepicker.parseDate(gccpSelf.calendarDateFormat, $datePickerList.eq(0).attr('data-today'));
					gccpSelf.selectedDates[viewId][0] = todayDate;
					gccpSelf.selectedDates[viewId][1] = todayDate;
					$datePickerList.datepicker('setDate', todayDate);
				}
				// reset checkboxes in treeview
				gccpSelf.$improveSearchTreeView.treeview('uncheckAll', { silent: true });
				// reset markers on Google Map
				gccpSelf.applyMarkerVisibility(viewId, mapId, '', gccpSelf.selectedDates[viewId][0], gccpSelf.selectedDates[viewId][1]);
				gccpSelf.isSearched = false;
			});
		});
	});

	var customControls = new gmpCustomControlsPro();
	window.gmpCustomControlsPro = customControls;
	jQuery(document).on('gmpAmiVarInited', function() {
		customControls.afterAllMapsInfoInitedHandler.call(customControls);
	});
	jQuery(document).bind('gmapAfterMapInit', function(event, map){
		google.maps.event.addListenerOnce(map.getRawMapInstance(), 'tilesloaded', function(){
			customControls.init();
		});
	});
}) (jQuery);
