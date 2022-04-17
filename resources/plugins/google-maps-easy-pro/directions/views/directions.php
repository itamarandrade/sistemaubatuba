<?php
class directionsViewGmp extends viewGmp {
	public function showDirectionsBtn($map) {
		$this->assign('map', $map);
		$this->assign('promoModPath', frameGmp::_()->getModule('supsystic_promo')->getModPath());
		frameGmp::_()->addStyle('gmap_directions', $this->getModule()->getModPath(). 'css/gmap_directions.css');
		return parent::display('directionsBtn');
	}
	public function showDirectionsPanel($map) {
		$this->assign('map', $map);
		return parent::display('directionsPanel');
	}
}