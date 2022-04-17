<?php
class placesGmp extends moduleGmp {
	private $_placesList = array();
	public function __construct($d) {
		parent::__construct($d);
		dispatcherGmp::addFilter('gApiUrlParams', array($this, 'addMapApiUrlParams'));
	}
	public function init() {
		dispatcherGmp::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		add_shortcode(GMP_SHORTCODE . '_places_toolbar', array($this, 'drawPlacesToolbarFromShortcode'));
	}
	public function addMapApiUrlParams($mapParams) {
		if(!isset($mapParams['libraries'])) {
			$mapParams['libraries'] = '';
		}
		if(empty($mapParams['libraries'])) {
			$mapParams['libraries'] = 'places';
		} else {
			$mapParams['libraries'] .= ',places';
		}
		return $mapParams;
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array('places'));
		return $keys;
	}
	public function connectMapAssets($params, $forAdminArea){
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.places', $this->getModPath() . 'js/admin.places.js');
		}
	}
	public function drawPlacesToolbarFromShortcode($params) {
		if(!isset($params['map_id']) || empty($params['map_id'])) {
			return __('Empty or Invalid Map ID', GMP_LANG_CODE) . '. ' . __('Please, check your shortcode.', GMP_LANG_CODE);
		}

		return $this->getView()->drawPlacesToolbar($params);
	}
	public function getPlacesList() {
		if(empty($this->_placesList)) {
			$this->_placesList = require_once($this->getModDir(). 'places_list.php');
		}
		return $this->_placesList;
	}
}