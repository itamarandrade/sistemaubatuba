<?php
class add_map_optionsControllerGmp extends controllerGmp {
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array()
			),
		);
	}
}

