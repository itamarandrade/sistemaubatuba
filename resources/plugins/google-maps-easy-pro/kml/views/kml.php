<?php
class kmlViewGmp extends viewGmp {
	public function drawMapKmlFilter($map) {
		$this->assign('map', $map);
		return parent::display('mapKmlFilter');
	}
}
