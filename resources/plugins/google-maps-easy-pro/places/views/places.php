<?php
class placesViewGmp extends viewGmp {
	public function drawPlacesToolbar($params) {
		$map = frameGmp::_()->getModule('gmap')->getModel()->getMapById($params['map_id']);

		if(empty($map)){
			return isset($params['map_id'])
				? sprintf(__('Map with ID %d not found', GMP_LANG_CODE), $params['map_id'])
				: __('Map not found', GMP_LANG_CODE);
		}
		if(!isset($map['params']['places']['en_toolbar']) || !(int)$map['params']['places']['en_toolbar']){
			return __('You must activate using of Places Toolbar in map admin area', GMP_LANG_CODE);
		}
		frameGmp::_()->getModule('templates')->loadFontAwesome();
		frameGmp::_()->addScript('jquery-ui-autocomplete', '', array('jquery'), false, true);
		frameGmp::_()->addStyle('jquery-ui-autocomplete', GMP_CSS_PATH. 'jquery-ui-autocomplete.css');
		frameGmp::_()->addScript('jquery-ui-slider', '', array('jquery'));
		frameGmp::_()->addStyle('jquery-slider', GMP_CSS_PATH. 'jquery-slider.css');
		frameGmp::_()->addStyle('gmap_places', $this->getModule()->getModPath(). 'css/gmap_places.css');
		frameGmp::_()->addScript('core.places', $this->getModule()->getModPath(). 'js/core.places.js');
		frameGmp::_()->addJSVar('core.places', 'g_gmpToolbarMapId', $params['map_id']);

		$this->assign('map', $map);
		$this->assign('placesList', $this->getModule()->getPlacesList());
		return parent::getInlineContent('placesToolbar');
	}
}