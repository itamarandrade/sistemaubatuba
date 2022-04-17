<?php
class directionsGmp extends moduleGmp {
	public function init() {
		parent::init();
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherGmp::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		dispatcherGmp::addAction('addMapBottomControls', array($this, 'addDirectionsBtn'));
		dispatcherGmp::addAction('addMapDirectionsData', array($this, 'addDirectionsPanel'));
	}
	public function connectMapAssets($params, $forAdminArea) {
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.directions', $this->getModPath(). 'js/admin.directions.js');
		}
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array(
			'enable_directions_btn', 'directions_alternate_routes', 'directions_data_show', 'directions_steps_show', 'directions_miles'
		));
		return $keys;
	}
	public function addDirectionsBtn($map){
		if(isset($map['params']['enable_directions_btn']) && (int)$map['params']['enable_directions_btn']){
			$this->getView()->showDirectionsBtn($map);
			frameGmp::_()->addScript('core.directions', $this->getModPath(). 'js/core.directions.js');
			frameGmp::_()->addScript('jquery-ui-autocomplete', '', array('jquery'), false, true);
			frameGmp::_()->addStyle('jquery-ui-autocomplete', GMP_CSS_PATH. 'jquery-ui-autocomplete.css');
			frameGmp::_()->getModule('templates')->loadFontAwesome();
		}
	}
	public function addDirectionsPanel($map){
		if(isset($map['params']['enable_directions_btn']) && (int)$map['params']['enable_directions_btn']
			&& isset($map['params']['directions_steps_show']) && (int)$map['params']['directions_steps_show']
		){
			$this->getView()->showDirectionsPanel($map);
		}
	}
}