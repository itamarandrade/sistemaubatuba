<?php
class custom_controlsControllerGmp extends controllerGmp {
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array()
			),
		);
	}
}

