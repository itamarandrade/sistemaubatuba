<?php
class frontend_actionsControllerGmp extends controllerGmp {
	// This methods is for frontend use
	public function deleteMarkerOnFrontend() {
		$res = new responseGmp();
		$map_model = frameGmp::_()->getModule('gmap')->getModel();
		$map_id = reqGmp::getVar('map_id');
		$marker_id = reqGmp::getVar('marker_id');
		$map = $map_model->getMapById($map_id);

		if(empty($map)) {
			$res->pushError($map_model->getErrors());
		}
		frameGmp::_()->getModule('marker')->getModel()->removeMarker($marker_id);
		$res->addMessage(__('Done', GMP_LANG_CODE));
		$res->addData('map', $map_id);
		$res->addData('marker', $marker_id);$res->addData('delete', true);

		return $res->ajaxExec();
	}
	public function saveMarkerForm() {
		$res = new responseGmp();
		$map_model = frameGmp::_()->getModule('gmap')->getModel();
		$marker_model = frameGmp::_()->getModule('marker')->getModel();
		$markerData = reqGmp::getVar('marker_opts');
		$update = false;
		$map = $map_model->getMapById($markerData['map_id']);

		if(empty($map)) {
			$res->pushError($map_model->getErrors());
		}
		if($this->getModule()->_checkSaveMarkerFormForCurMap($map)) {
			if($limits = $this->_checkMarkerFormSavingLimits($map)) {
				if($id = $marker_model->save($markerData, $update)){
					if(!empty($limits)) {
						$this->_updateMarkerFormSavingLimits($limits);
					}
					$res->addMessage(__('Done', GMP_LANG_CODE));
					$res->addData('marker', $marker_model->getById($id));
					$res->addData('update', $update);
				} else {
					$res->pushError($marker_model->getErrors());
				}
				//frameGmp::_()->getModule('supsystic_promo')->getModel()->saveUsageStat('marker.save');
			} else {
				$res->pushError($this->getModel()->getErrors());
			}
		} else {
			$res->pushError(__('Adding markers from the frontend is disabled for the Current Map', GMP_LANG_CODE));
		}
		return $res->ajaxExec();
	}
	public function _checkMarkerFormSavingLimits($map) {
		return $this->getModel()->checkMarkerFormSavingLimits($map);
	}
	public function _updateMarkerFormSavingLimits($limits) {
		$this->getModel()->updateMarkerFormSavingLimits($limits);
	}
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array()
			),
		);
	}
}