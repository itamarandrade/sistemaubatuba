<?php
class add_map_optionsGmp extends moduleGmp {
	public function init() {
		parent::init();
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherGmp::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		dispatcherGmp::addFilter('stylizationsList', array($this, 'addMapStylizations'));
		dispatcherGmp::addFilter('addInfoWindowStyles', array($this, 'addInfoWindowStyles'));
		dispatcherGmp::addAction('addMapBottomControls', array($this, 'addMapBottomControls'));
		dispatcherGmp::addAction('addMapCustomInfoWindow', array($this, 'addMapCustomInfoWindow'));
	}
	public function connectMapAssets($params, $forAdminArea) {
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.add_map_options', $this->getModPath(). 'js/admin.add_map_options.js');
		}
		
		$allStylizationsList = frameGmp::_()->getModule('gmap')->getStylizationsList();
		frameGmp::_()->addScript('core.add_map_options', $this->getModPath(). 'js/core.add_map_options.js', array('core.gmap'));
		frameGmp::_()->addJSVar('core.add_map_options', 'gmpAllStylizationsList', $allStylizationsList);
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array(
			'type_control_position', 'zoom_control_position', 'street_view_control_position', 'pan_control_position',
			'enable_trafic_layer', 'enable_transit_layer', 'enable_bicycling_layer', 'enable_full_screen_btn', 'hide_poi', 'hide_countries',
			'center_on_cur_user_pos', 'center_on_cur_user_pos_icon', 'enable_infownd_print_btn',
		));
		return $keys;
	}
	public function addMapStylizations($stylizations) {
		$stylizations = require_once($this->getModDir(). 'stylezations.php');
		return $stylizations;
	}
	public function addInfoWindowStyles($types) {
		$types['slide'] = __('Slide Window', GMP_LANG_CODE);
		return $types;
	}
	public function addMapBottomControls($map){
		if(isset($map['params']['enable_full_screen_btn'])
			&& (int)$map['params']['enable_full_screen_btn']
		){
			$this->getView()->showFullScreenBtn($map);
		}
		if(isset($map['params']['enable_infownd_print_btn'])
			&& (int)$map['params']['enable_infownd_print_btn']
		){
			$this->getView()->showPrintBtn($map);
		}
	}
	public function addMapCustomInfoWindow($map){
		if(isset($map['params']['marker_infownd_type']) && $map['params']['marker_infownd_type'] == 'slide') {
			$this->getView()->showSlideInfoWindow($map);
		}
	}
	// Don't need this method for now - just because we want to jenerate it on JS - in this case we will have exactly required image size.
	// But leave it here for now - maybe in future it will be helpfull.
	public function generateStaticImgUrl($map) {
		/*var imgSize = map.mapParams.params.img_width ? map.mapParams.params.img_width : 175;
		imgSize += 'x';
		imgSize += map.mapParams.params.img_height ? map.mapParams.params.img_height : 175;

		var reqParams = {
			center: map.mapParams.params.map_center.coord_y+ ','+ map.mapParams.params.map_center.coord_x
		,	zoom: map.mapParams.params.zoom
		,	size: imgSize
		,	maptype: map.mapParams.params.type
		,	sensor: 'false'
		,	language: map.mapParams.params.language
		};
		var reqStr = (GMP_DATA.isHttps ? 'https' : 'http')+ '://maps.google.com/maps/api/staticmap?'+ jQuery.param(reqParams);

		if(map.mapParams.markers && map.mapParams.markers.length) {
			for(var i in map.mapParams.markers) {
				reqStr += '&markers=color:red|label:none|'+ map.mapParams.markers[i].coord_y+ ','+ map.mapParams.markers[i].coord_x;
			}
		}
		return reqStr;*/
		$gmapView = frameGmp::_()->getModule('gmap')->getView();
		$reqParams = array(
			'center' => $map['params']['map_center']['coord_y']. ','. $map['params']['map_center']['coord_x'],
			'zoom' => $map['params']['zoom'],
			'size' => '175x175',
			'maptype' => $map['params']['type'],
			'language' =>$map['params']['language'],
			'key' => $gmapView->getApiKey(),
		);
		
		$reqStr = $gmapView->getApiDomain(). 'maps/api/staticmap?'. http_build_query($reqParams);
		return $reqStr;
	}
	public function connectStaticMapCore() {
		$gmapView = frameGmp::_()->getModule('gmap')->getView();
		frameGmp::_()->addScript('core.staticmap', $this->getModPath(). 'js/core.staticmap.js');
		frameGmp::_()->addJSVar('core.staticmap', 'gmpStaticMapData', array(
			'domain' => $gmapView->getApiDomain(),
			'key' => $gmapView->getApiKey(),
			'language' => utilsGmp::getLangCode2Letter(),
		));
	}
}