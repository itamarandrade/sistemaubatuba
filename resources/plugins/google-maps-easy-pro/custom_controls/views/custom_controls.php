<?php
class custom_controlsViewGmp extends viewGmp {
	public function showCustomMapControls($map, $isAdmin = false) {
		$groupsList = frameGmp::_()->getModule('marker_groups')->getModel()->getCurrentMapMarkersGroupsTree($map);
		$groupsOptions = frameGmp::_()->getModule('marker_groups')->getModel()->getMarkerGroupsOptions();
		$isExtendSearchBtn = !empty($map['params']['custom_controls_improve_search'])
			&& (bool) $map['params']['custom_controls_improve_search']
			&& !empty($map['params']['button_search_extend'])
			&& (bool) $map['params']['button_search_extend'];
		if(!empty($map['view_id'])) {
			frameGmp::_()->addJSVar('core.custom_controls', 'g_gmpGroupsList_'.$map['view_id'], $groupsList);
		}
		frameGmp::_()->addJSVar('core.custom_controls', 'g_gmpGroupsOptions', $groupsOptions);
		$this->assign('map', $map);
		$this->assign('groupsList', $groupsList);
		$this->assign('isAdmin', $isAdmin);
		$this->assign('isMobile', utilsGmp::isMobile());
		$this->assign('isExtendSearchBtn', $isExtendSearchBtn);
		return parent::display('customMapControls');
	}
}
