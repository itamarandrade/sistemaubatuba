<?php
class markers_listGmp extends moduleGmp {
	public function init() {
		parent::init();
		dispatcherGmp::addAction('addEditMapPart', array($this, 'addEditMapPart'), 10, 2);
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherGmp::addAction('addMapBottomControls', array($this, 'showBottomSliderHtml'));
		dispatcherGmp::addFilter('mapDataRender', array($this, 'beforeMapDataRender'));
		dispatcherGmp::addAction('addMapFilters', array($this, 'addMapFiltersHtml'));
	}
	public function beforeMapDataRender($mapObj) {
		if(isset($mapObj['params']['markers_list_type']) && !empty($mapObj['params']['markers_list_type'])) {
			$mapObj['params']['marker_list_params'] = frameGmp::_()->getModule('gmap')->getMarkerListByKey( $mapObj['params']['markers_list_type'] );
		}
		return $mapObj;
	}
	public function addEditMapPart($part) {
		$this->getView()->addEditMapPart($part);
	}
	public function connectMapAssets($params, $forAdminArea = false) {
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.markers_list', $this->getModPath(). 'js/admin.markers_list.js');
			frameGmp::_()->addScript('jquery-ui-datepicker');
			frameGmp::_()->addScript('admin.markers.pro.js', $this->getModPath() . 'js/admin.markers.pro.js', array('jquery-ui-datepicker'));

			frameGmp::_()->addStyle('jui-base-theme-css','http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.0/themes/base/jquery-ui.min.css',false,"1.9.0",false);
			frameGmp::_()->addStyle('', $this->getModPath() . 'css/markers.pro.css');
		} else {
			
			if(isset($params['markers_list_type']) && !empty($params['markers_list_type'])) {
				$listParams = frameGmp::_()->getModule('gmap')->getMarkerListByKey( $params['markers_list_type'] );
				if($listParams['eng'] == 'jssor') {
					$this->connectJssor();
					frameGmp::_()->addScript('jquery-ui-accordion', '', array('jquery'));
				}
				if($listParams['eng'] == 'table') {
					frameGmp::_()->addStyle('slider.table', $this->getModPath(). 'css/slider.table.css');
				}
				frameGmp::_()->addScript('core.markers_list', $this->getModPath(). 'js/core.markers_list.js', array('core.gmap'));
			}
		}
	}
	public function connectJssor() {
		frameGmp::_()->addScript('jssor.slider', $this->getModPath(). 'js/jssor.slider.mini.js');
		frameGmp::_()->addStyle('jssor.slider', $this->getModPath(). 'css/jssor.slider.css');
	}
	public function showBottomSliderHtml($map) {
		if(isset($map['params']['markers_list_type']) && !empty($map['params']['markers_list_type'])) {
			$listParams = frameGmp::_()->getModule('gmap')->getMarkerListByKey( $map['params']['markers_list_type'] );
			if($listParams['eng'] == 'jssor') {
				echo $this->getView()->getSliderSimpleList( $map );
			}
			if($listParams['eng'] == 'table') {
				echo $this->getView()->getSliderTableList( $map );
			}
		}
	}
	public function addMapFiltersHtml($map) {
		if(isset($map['params']['markers_list_type']) && !empty($map['params']['markers_list_type'])
			&& $map['params']['markers_list_type'] === 'slider_checkbox_table')
		{
			frameGmp::_()->getModule('templates')->loadFontAwesome();
			frameGmp::_()->addScript('markers_list.filter', $this->getModPath(). 'js/core.markers_list.filter.js');
			frameGmp::_()->addScript('gmap_bootstrap-treeview', frameGmp::_()->getModule('kml')->getModPath(). 'js/bootstrap-treeview.min.js');
			frameGmp::_()->addStyle('gmap_bootstrap-treeview', frameGmp::_()->getModule('kml')->getModPath(). 'css/bootstrap-treeview.min.css');
			echo $this->getView()->getSliderCheckboxTree( $map );
		}
	}
}
