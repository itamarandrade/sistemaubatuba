<?php
class licenseControllerGmp extends controllerGmp {
	public function activate() {
		$res = new responseGmp();
		if($this->getModel()->activate(reqGmp::get('post'))) {
			$res->addMessage(__('Done', GMP_LANG_CODE));
		} else
			$res->pushError ($this->getModel()->getErrors());
		$res->ajaxExec();
	}
	public function dismissNotice() {
		$res = new responseGmp();
		frameGmp::_()->getModule('options')->getModel()->save('dismiss_pro_opt', 1);
		$res->ajaxExec();
	}
	public function getPermissions() {
		return array(
			GMP_USERLEVELS => array(
				GMP_ADMIN => array('activate', 'dismissNotice')
			),
		);
	}
}

