<?php
class heatmapModelGmp extends modelGmp {
	public static $tableObj;
	function __construct() {
		$this->_setTbl('heatmap');
		if(empty(self::$tableObj)){
			self::$tableObj = frameGmp::_()->getTable('heatmap');
		}
	}
	public function save($heatmap = array(), &$update = false) {
		$id = isset($heatmap['id']) ? (int) $heatmap['id'] : 0;
		$update = (bool) $id;
		$heatmap['map_id'] = isset($heatmap['map_id']) ? (int) $heatmap['map_id'] : 0;
		$heatmap['coords'] = isset($heatmap['coords']) ? base64_encode(utilsGmp::serialize($heatmap['coords'])) : '';

		//it's important to set default params if user not chose color
		if($heatmap['params']['gradient'][0] === ''){
			$heatmap['params']['gradient'][0] = 'rgba(94, 216, 54, 0)';
			$heatmap['params']['gradient'][1] = '#00f71c';
		}

		$heatmap['params'] = isset($heatmap['params']) ? utilsGmp::serialize($heatmap['params']) : '';
		global $wpdb;
		if($update) {
			$tableName = $wpdb->prefix . "gmp_heatmaps";
			$dbRes = $wpdb->update($tableName, $heatmap, array('id' => $id));
			//dispatcherGmp::doAction('beforeHeatmapUpdate', $id, $heatmap);
			//$dbRes = frameGmp::_()->getTable('heatmap')->update($heatmap);
			//dispatcherGmp::doAction('afterHeatmapUpdate', $id, $heatmap);
		} else {
			$tableName = $wpdb->prefix . "gmp_heatmaps";
			$dbRes = $wpdb->insert($tableName, $heatmap);
			//$dbRes = frameGmp::_()->getTable('heatmap')->insert($heatmap);
			//dispatcherGmp::doAction('beforeHeatmapInsert', $heatmap);
			//dispatcherGmp::doAction('afterHeatmapInsert', $dbRes, $heatmap);
		}
		if($dbRes) {
			if(!$update)
				$id = $dbRes;
			return $id;
		} else {
			$this->pushError(frameGmp::_()->getTable('heatmap')->getErrors());
		}
		return false;
	}
	public function getAllHeatmap($d = array(), $widthMapData = false) {
		// if(isset($d['limitFrom']) && isset($d['limitTo']))
		// 	frameGmp::_()->getTable('heatmap')->limitFrom($d['limitFrom'])->limitTo($d['limitTo']);
		// if(isset($d['orderBy']) && !empty($d['orderBy'])) {
		// 	frameGmp::_()->getTable('heatmap')->orderBy( $d['orderBy'] );
		// }
		// $heatmapList = frameGmp::_()->getTable('heatmap')->get('*', $d);
		global $wpdb;
		$heatmapList = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}gmp_heatmaps", ARRAY_A);
		foreach($heatmapList as $i => &$m) {
			$heatmapList[$i] = $this->_afterGet($heatmapList[$i], $widthMapData);
		}
		return $heatmapList;
	}
	public function getById($id) {
		global $wpdb;
		$res = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}gmp_heatmaps WHERE ".$wpdb->prepare("id = %s", array($id)), ARRAY_A);
		return $res = $this->_afterGet($res);
		//return $this->_afterGet(frameGmp::_()->getTable('heatmap')->get('*', array('id' => $id), '', 'row'));
	}
	public function getByMapId($map_id) {
		global $wpdb;
		$res = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}gmp_heatmaps WHERE ".$wpdb->prepare("map_id = %s", array($map_id)), ARRAY_A);
		return $res = $this->_afterGet($res);
		//return $this->_afterGet(frameGmp::_()->getTable('heatmap')->get('*', array('map_id' => $map_id), '', 'row'));
	}
	public function _afterGet($heatmap, $widthMapData = false) {
		if(!empty($heatmap)) {
			$heatmap['coords'] = utilsGmp::unserialize(base64_decode($heatmap['coords']));
			$heatmap['params'] = utilsGmp::unserialize($heatmap['params']);
			if($widthMapData && !empty($heatmap['map_id']))
				$heatmap['map'] = frameGmp::_()->getModule('gmap')->getModel()->getMapById($heatmap['map_id'], false);
		}
		return $heatmap;
	}
	public function removeHeatmap($heatmapId){
		//dispatcherGmp::doAction('beforeHeatmapRemove', $heatmapId);
		global $wpdb;
		$tableName = $wpdb->prefix . "gmp_heatmaps";
		$data_where = array(
			 'id' => $heatmapId
		);
		return $wpdb->delete($tableName, $data_where);
		//return frameGmp::_()->getTable('heatmap')->delete(array('id' => $heatmapId));
	}
	public function existsId($id){
		if($id){
			global $wpdb;
			$heatmap = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}gmp_heatmaps WHERE ".$wpdb->prepare("id = %s", array($id)));
			if(!empty($heatmap)){
				return true;
			}
		}
		return false;
	}
}
