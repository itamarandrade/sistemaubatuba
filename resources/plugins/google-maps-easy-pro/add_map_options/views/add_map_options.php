<?php
class add_map_optionsViewGmp extends viewGmp {
	public function showFullScreenBtn($map) {
		$this->assign('map', $map);
		frameGmp::_()->addStyle('gmap_fullscreen', $this->getModule()->getModPath(). 'css/gmap_fullscreen.css');
		return parent::display('fullScreenBtn');
	}
	public function showPrintBtn($map) {
		$this->assign('map', $map);
		frameGmp::_()->addScript('jquery.print', GMP_JS_PATH. 'jquery.print.js');
		frameGmp::_()->addStyle('gmap_print', $this->getModule()->getModPath(). 'css/gmap_print.css');
		return parent::display('printInfoWndBtn');
	}
	public function showSlideInfoWindow($map) {
		$this->assign('map', $map);
		$this->assign('isMobile', utilsGmp::isMobile());
		frameGmp::_()->addStyle('gmap_infownd_slide', $this->getModule()->getModPath(). 'css/gmap.infownd.slide.css');
		return parent::display('slideInfoWindow');
	}
}