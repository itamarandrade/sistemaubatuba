<?php
class kmlGmp extends moduleGmp {
	public function init() {
		parent::init();
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherGmp::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		dispatcherGmp::addAction('addMapKmlFilterData', array($this, 'addMapKmlFilterData'));
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array(
			'kml_file_url', 'enable_kml_filter', 'kml_filter', 'kml_import_to_marker', 'enable_google_kml_api'
		));
		return $keys;
	}
	public function connectMapAssets($params, $forAdminArea) {
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.kml', $this->getModPath(). 'js/admin.kml.js');
			frameGmp::_()->addScript('ajaxupload', GMP_JS_PATH. 'ajaxupload.js');
			frameGmp::_()->addScript('core.kml', $this->getModPath(). 'js/core.kml.js');
		} else {
			if(isset($params['kml_file_url']) && !empty($params['kml_file_url'])) {
				$kmlUrlExist = array_filter ($params['kml_file_url'], function ($elem){
					return !empty($elem);
				});
				if($kmlUrlExist){
					frameGmp::_()->addScript('core.kml', $this->getModPath(). 'js/core.kml.js');
					$this->addGeoXMLScripts();
					frameGmp::_()->getModule('templates')->loadFontAwesome();
					if(isset($params['enable_kml_filter']) && !empty($params['enable_kml_filter'])) {
						frameGmp::_()->addStyle('gmap_kml', $this->getModPath(). 'css/gmap_kml.css');
						frameGmp::_()->addScript('gmap_bootstrap-treeview', $this->getModPath(). 'js/bootstrap-treeview.min.js');
						frameGmp::_()->addStyle('gmap_bootstrap-treeview', $this->getModPath(). 'css/bootstrap-treeview.min.css');
					}
				}

			}
		}
	}
	public function addGeoXMLScripts(){
		//frameGmp::_()->addScript('gmap_geoxml', $this->getModPath(). 'js/geoxml3/polys/geoxml3.js');
		//frameGmp::_()->addScript('gmap_geoxml-kmz', $this->getModPath(). 'js/geoxml3/kmz/geoxml3.js');
		frameGmp::_()->addScript('gmap_geoxml-parse-kmz', $this->getModPath(). 'js/geoxml3/kmz/geoxml3_gxParse_kmz.js');
		frameGmp::_()->addScript('gmap_zip-file-complete', $this->getModPath(). 'js/geoxml3/kmz/ZipFile.complete.js');
		frameGmp::_()->addScript('gmap_projected-overlay', $this->getModPath(). 'js/geoxml3/ProjectedOverlay.js');
	}
	public function addMapKmlFilterData($map){
		if(isset($map['params']['enable_kml_filter']) && (int)$map['params']['enable_kml_filter']){
			$this->getView()->drawMapKmlFilter($map);
		}
	}
}