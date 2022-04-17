<?php
class custom_controlsGmp extends moduleGmp {
	public function init() {
		parent::init();
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherGmp::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		dispatcherGmp::addAction('addMapBottomControls', array($this, 'addMapBottomControls'));
		dispatcherGmp::addAction('addAdminMapBottomControls', array($this, 'addMapBottomControls'));
	}
	public function connectMapAssets($params, $forAdminArea) {
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.custom_controls', $this->getModPath(). 'js/admin.custom_controls.js');
			frameGmp::_()->addScript('core.gmap', GMP_MODULES_PATH. 'gmap/js/core.gmap.js');
			frameGmp::_()->addScript('core.marker', GMP_MODULES_PATH. 'marker/core.marker.js');
			frameGmp::_()->addScript('frontend.gmap', GMP_MODULES_PATH. 'gmap/js/frontend.gmap.js');
		}
		if($forAdminArea || isset($params['enable_custom_map_controls']) && (int)$params['enable_custom_map_controls']){
			frameGmp::_()->getModule('templates')->loadFontAwesome();
			frameGmp::_()->getModule('templates')->loadJqTreeView();
			frameGmp::_()->addScript('core.custom_controls', $this->getModPath(). 'js/core.custom_controls.js');
			frameGmp::_()->addScript('jquery-ui-autocomplete', '', array('jquery'), false, true);
			frameGmp::_()->addStyle('jquery-ui-autocomplete', GMP_CSS_PATH. 'jquery-ui-autocomplete.css');
			frameGmp::_()->addScript('jquery-ui-slider', '', array('jquery'));
			frameGmp::_()->addStyle('jquery-slider', GMP_CSS_PATH. 'jquery-slider.css');
			frameGmp::_()->addStyle('gmap_custom_controls', $this->getModPath(). 'css/gmap_custom_controls.css');
			frameGmp::_()->addScript('jquery-ui-datepicker');
			frameGmp::_()->addStyle('jquery-ui-base-theme-css','http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.0/themes/base/jquery-ui.min.css',false,"1.9.0",false);

			//frameGmp::_()->getModule('templates')->loadJqueryUi();
			frameGmp::_()->addScript('gmap_bootstrap-treeview', frameGmp::_()->getModule('kml')->getModPath(). 'js/bootstrap-treeview.min.js');
			frameGmp::_()->addStyle('gmap_bootstrap-treeview', frameGmp::_()->getModule('kml')->getModPath(). 'css/bootstrap-treeview.min.css');
		}
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array(
			'enable_custom_map_controls', 'custom_controls_type', 'custom_controls_unit', 'custom_filter_show_all', 'custom_controls_bg_color', 'custom_controls_txt_color',
			'custom_controls_position', 'custom_controls_slider_min', 'custom_controls_slider_max', 'custom_controls_slider_step',
			'custom_controls_search_country', 'custom_controls_improve_search', 'button_filter_enable', 'button_search_extend',
		));
		return $keys;
	}
	public function addMapBottomControls($map){
//		if(empty($map)) return;
		if((isset($map['params']['enable_custom_map_controls']) && (int)$map['params']['enable_custom_map_controls'])
			|| (is_admin())
		){
			$this->getView()->showCustomMapControls($map, is_admin());
		}
	}
	// For task #276
	public function isCustSearchAndMarkersPeriodAvailable() {
		return true;
	}
}
