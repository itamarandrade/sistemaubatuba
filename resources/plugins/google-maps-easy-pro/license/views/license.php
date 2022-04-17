<?php
class licenseViewGmp extends viewGmp {
	public function getTabContent() {
		frameGmp::_()->addScript('admin.license', $this->getModule()->getModPath(). 'js/admin.license.js');
		frameGmp::_()->getModule('templates')->loadJqueryUi();
		$this->assign('credentials', $this->getModel()->getCredentials());
		$this->assign('isActive', $this->getModel()->isActive());
		$this->assign('isExpired', $this->getModel()->isExpired());
		$this->assign('extendUrl', $this->getModel()->getExtendUrl());
		return parent::getContent('licenseAdmin');
	}
}
