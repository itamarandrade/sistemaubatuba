<?php
class shapeViewGmp extends viewGmp {
	public function getListOperations($shapeId) {
		$this->assign('shape', array('id' => $shapeId));
		return parent::getContent('shapeListOperations');
	}
}