<?php
class heatmapGmp extends moduleGmp {
	public function __construct($d) {
		parent::__construct($d);
		dispatcherGmp::addFilter('gApiUrlParams', array($this, 'addMapApiUrlParams'));
	}
	public function init() {
		dispatcherGmp::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
	}
	public function addMapApiUrlParams($mapParams) {
		if(!isset($mapParams['libraries'])) {
			$mapParams['libraries'] = '';
		}
		if(empty($mapParams['libraries'])) {
			$mapParams['libraries'] = 'visualization';
		} else {
			$mapParams['libraries'] .= ',visualization';
		}
		return $mapParams;
	}
	public function connectMapAssets($params, $forAdminArea = false) {
		if($forAdminArea) {
			frameGmp::_()->addScript('admin.heatmap.edit', $this->getModPath(). 'js/admin.heatmap.edit.js');
			frameGmp::_()->addStyle('admin.heatmap', $this->getModPath(). 'css/admin.heatmap.css');
		}
		frameGmp::_()->addScript('core.heatmap', $this->getModPath(). 'js/core.heatmap.js');
	}
	public function activate() {
		$this->install(); // Just try to do same things for now
	}
	public function install() {
		global $wpdb;
		$wpPrefix = $wpdb->prefix; /* add to 0.0.3 Versiom */
		if(!dbGmp::exist("gmp_heatmaps")) {
			require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
			dbDelta("CREATE TABLE IF NOT EXISTS `".$wpPrefix."gmp_heatmaps` (
			 	`id` int(11) NOT NULL AUTO_INCREMENT,
				`map_id` int(11),
				`coords` text  CHARACTER SET utf8 NOT NULL,
				`params` text  CHARACTER SET utf8 NOT NULL,
				`create_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (`id`)
		   	) DEFAULT CHARSET=utf8;");
		}
	}
}
