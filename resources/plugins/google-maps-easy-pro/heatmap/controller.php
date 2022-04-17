<?php
class heatmapControllerGmp extends controllerGmp {
	public function save() {
		$res = new responseGmp();
		$heatmapData = reqGmp::getVar('heatmap_opts');
		$heatmapData['coords'] = reqGmp::getVar('heatmap_coords');
		$update = false;
		if($id = $this->getModel()->save($heatmapData, $update)){
			$res->addMessage(__('Done', GMP_LANG_CODE));
			$res->addData('heatmap', $this->getModel()->getById($id));
			$res->addData('update', $update);
		} else {
			$res->pushError($this->getModel()->getErrors());
		}
		//frameGmp::_()->getModule('supsystic_promo')->getModel()->saveUsageStat('heatmap.save');
		return $res->ajaxExec();
	}
	public function getHeatmap() {
		$res = new responseGmp();
		$map_id = (int) reqGmp::getVar('map_id');
		if($map_id) {
			$heatmap = $this->getModel()->getByMapId($map_id);
			if(!empty($heatmap)) {
				$res->addData('heatmap', $heatmap);
			} else
				$res->pushError ($this->getModel()->getErrors());
		} else
			$res->pushError (__('Empty or invalid Heatmap ID', GMP_LANG_CODE));
		return $res->ajaxExec();
	}
	public function removeHeatmap(){
		$params = reqGmp::get('post');
		$res = new responseGmp();
		if(!isset($params['id'])){
			$res->pushError(__('Heatmap Not Found', GMP_LANG_CODE));
			return $res->ajaxExec();
		}
		if($this->getModel()->removeHeatmap($params["id"])){
			$res->addMessage(__("Done", GMP_LANG_CODE));
		}else{
			$res->pushError(__("Cannot remove Heatmap", GMP_LANG_CODE));
		}
		//frameGmp::_()->getModule("supsystic_promo")->getModel()->saveUsageStat('heatmap.delete');
		return $res->ajaxExec();
	}
	/**
	 * @see controller::getPermissions();
	 */
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array('save', 'getHeatmap', 'removeHeatmap')
			),
		);
	}
}