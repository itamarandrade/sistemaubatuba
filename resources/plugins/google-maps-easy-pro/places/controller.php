<?php
class placesControllerGmp extends controllerGmp {
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array()
			),
		);
	}
}
