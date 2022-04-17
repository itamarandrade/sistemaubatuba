<?php
class markers_listControllerGmp extends controllerGmp {
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array()
			),
		);
	}
}

