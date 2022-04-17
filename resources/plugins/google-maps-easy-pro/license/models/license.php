<?php
class licenseModelGmp extends modelGmp {
	private $_apiUrl = '';
	public function __construct() {
		$this->_initApiUrl();
	}
	public function check() {
		$time = time();
		$lastCheck = (int) get_option('_last_important_check_'. GMP_CODE);
		// $this->_setExpired();
		// return true;
		if(!$lastCheck || ($time - $lastCheck) >= 5 * 24 * 3600 /** 0/*remove last!!!*/) {
			$resData = $this->_req('check', array_merge(array(
				'url' => GMP_SITE_URL,
				'plugin_code' => $this->_getPluginCode(),
			), $this->getCredentials()));
			if($resData) {
				$this->_updateLicenseData( $resData['data']['save_data'] );
			} else {
				$this->_setExpired();
			}
			update_option('_last_important_check_'. GMP_CODE, $time);
		} else {
			$daysLeft = (int) frameGmp::_()->getModule('options')->getModel()->get('license_days_left');
			if($daysLeft) {
				$lastServerCheck = (int) frameGmp::_()->getModule('options')->getModel()->get('license_last_check');
				$day = 24 * 3600;
				$daysPassed = floor(($time - $lastServerCheck) / $day);
				if($daysPassed > 0) {
					$daysLeft -= $daysPassed;
					frameGmp::_()->getModule('options')->getModel()->save('license_days_left', $daysLeft);
					frameGmp::_()->getModule('options')->getModel()->save('license_last_check', time());
					if($daysLeft < 0) {
						$this->_setExpired();
					}
				}
			}
		}
		return true;
	}
	public function activate($d = array()) {
		$d['email'] = isset($d['email']) ? trim($d['email']) : '';
		$d['key'] = isset($d['key']) ? trim($d['key']) : '';
      $d['gateway'] = !empty($d['gateway']) ? true : false;
		if(!empty($d['email'])) {
			if(!empty($d['key'])) {
				$this->setCredentials($d['email'], $d['key']);
				if(($resData = $this->_req('activate', array_merge(array(
					'url' => GMP_SITE_URL,
					'plugin_code' => $this->_getPluginCode(),
				), $this->getCredentials()), $d['gateway'] )) != false) {
					$this->_updateLicenseData( $resData['data']['save_data'] );
					$this->_setActive();
					return true;
				}
			} else
				$this->pushError(__('Please enter your License Key', GMP_LANG_CODE), 'key');
		} else
			$this->pushError(__('Please enter your Email address', GMP_LANG_CODE), 'email');
		$this->_removeActive();
		return false;
	}
	private function _updateLicenseData($saveData) {
		frameGmp::_()->getModule('options')->getModel()->save('license_save_name', $saveData['license_save_name']);
		frameGmp::_()->getModule('options')->getModel()->save('license_save_val', $saveData['license_save_val']);
		frameGmp::_()->getModule('options')->getModel()->save('license_days_left', $saveData['days_left']);
		frameGmp::_()->getModule('options')->getModel()->save('license_last_check', time());
		dbGmp::query('UPDATE @__modules SET active = 1 WHERE ex_plug_dir IS NOT NULL AND ex_plug_dir != "" AND code != "license"');
	}
	private function _setExpired() {
		update_option('_last_expire_'. GMP_CODE, 1);
		$this->_removeActive();
		global $wpdb;
		$wpdb->query("UPDATE {$wpdb->prefix}gmp_modules SET active = 0 WHERE ex_plug_dir IS NOT NULL AND code != 'license'");
		if($this->enbOptimization()) {
			//dbGmp::query('UPDATE @__modules SET active = 0 WHERE ex_plug_dir IS NOT NULL AND ex_plug_dir != "" AND code != "license"');
			frameGmp::_()->getModule('options')->getModel()->save('license_days_left', -1);
		}
	}
	public function isExpired() {
		$expired = (int) get_option('_last_expire_'. GMP_CODE) == 1 ? true : false;
		return $expired;
	}
	public function isActive() {
		$option = get_option(frameGmp::_()->getModule('options')->get('license_save_name').GMP_CODE);
		$res = ($option && $option == frameGmp::_()->getModule('options')->get('license_save_val'));
		if (!$res) {
			$this->_setExpired();
		}
		return $res;
	}
	public function _setActive() {
		update_option('_site_transient_update_plugins', ''); // Trigger plugins updates check
		$optioName = frameGmp::_()->getModule('options')->get('license_save_name').GMP_CODE;
		update_option($optioName, frameGmp::_()->getModule('options')->get('license_save_val'));
		delete_option('_last_expire_'. GMP_CODE);
	}
	public function _removeActive() {
		$name = frameGmp::_()->getModule('options')->get('license_save_name');
		if(!empty($name)) {
			$name = $name.GMP_CODE;
			delete_option($name);
		}
	}
	public function setCredentials($email, $key) {
		$this->setEmail($email);
		$this->setLicenseKey($key);
	}
	public function setEmail($email) {
		frameGmp::_()->getModule('options')->getModel()->save('license_email', base64_encode( $email ));
	}
	public function setLicenseKey($key) {
		frameGmp::_()->getModule('options')->getModel()->save('license_key', base64_encode( $key ));
	}
	public function getEmail() {
		return base64_decode( frameGmp::_()->getModule('options')->get('license_email') );
	}
	public function getLicenseKey() {
		return base64_decode( frameGmp::_()->getModule('options')->get('license_key') );
	}
	public function getCredentials() {
		return array(
			'email' => $this->getEmail(),
			'key' => $this->getLicenseKey(),
		);
	}
   public function useLicenseGatewayServer($data) {
     $response = wp_remote_post('http://vps-a76bb1d6.vps.ovh.net/wp-admin/admin-ajax.php?mod=licensegateway&action=getSupsysticAnswer&pl=lgs', array(
        'body' => $data,
        'redirection' => 5,
     ));
     if (!empty($response) && !empty($response['body'])) {
        $response['body'] = base64_decode($response['body']);
        $response['body'] = unserialize($response['body']);
        return $response;
     }
     return false;
  }

  private function _req($action, $data = array(), $gateway = false) {
		$data = array_merge($data, array(
			'mod' => 'manager',
			'pl' => 'lms',
			'action' => $action,
		));
      if ($gateway) {
        $response = $this->useLicenseGatewayServer($data);
     } else {
        $response = wp_remote_post($this->_apiUrl, array(
           'body' => $data
        ));
     }
		if(is_wp_error($response)) {
			// Try it with native CURL - maybe this will work
			$curlNativeTry = $this->_reqWithCurl($data);
			if($curlNativeTry) {
				$response = array('body' => $curlNativeTry);
			}
		}
		if (!is_wp_error($response)) {
			if(isset($response['body']) && !empty($response['body']) && ($resArr = utilsGmp::jsonDecode($response['body']))) {
				if(!$resArr['error']) {
					return $resArr;
				} else
					$this->pushError($resArr['errors']);
			} else
				$this->pushError(__('There was a problem with sending request to your authentication server. Please try later.', GMP_LANG_CODE));
		} else
			$this->pushError( $response->get_error_message() );
		return false;
	}
	private function _reqWithCurl($data) {
		if(!function_exists('curl_init')) return false;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->_apiUrl);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_CAINFO, dirname(__FILE__). DS. 'cacert.pem');

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 30);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		$result = curl_exec($ch);

		curl_close($ch);
		return $result ? $result : false;
	}
	private function _initApiUrl() {
		if(empty($this->_apiUrl)) {
			$this->_apiUrl = 'https://supsystic.com/';
		}
	}
	public function enbOptimization() {
		return false;
	}
	public function checkPreDeactivateNotify() {
		$daysLeft = (int) frameGmp::_()->getModule('options')->getModel()->get('license_days_left');
		if($daysLeft > 0 && $daysLeft <= 15) {	// Notify before 3 days
			add_action('admin_notices', array($this, 'showPreDeactivationNotify'));
		}
	}
	public function showPreDeactivationNotify() {
		$daysLeft = (int) frameGmp::_()->getModule('options')->getModel()->get('license_days_left');
		$msg = '';
		if($daysLeft == 0) {
			$msg = sprintf(
             '<span class="dashicons dashicons-warning" style="color:red"></span> <b>%s</b>. License for plugin <b>will expire today</b>. It means that your <b>PRO version will not work</b>. To continue use PRO functionality - with all features, options, updates and premium support, just <b>extend PRO version license - follow <a href="%s" target="_blank">this link</a></b>',
             GMP_WP_PLUGIN_NAME, $this->getExtendUrl()
			);
		} elseif($daysLeft == 1) {
			$msg = sprintf(
             '<span class="dashicons dashicons-warning" style="color:red"></span> <b>%s</b>. License for plugin <b>will expire tomorrow</b>. It means that your <b>PRO version will not work</b>. To continue use PRO functionality - with all features, options, updates and premium support, just <b>extend PRO version license - follow <a href="%s" target="_blank">this link</a></b>',
             GMP_WP_PLUGIN_NAME, $this->getExtendUrl()
			);
		} else {
			$msg = sprintf(
             '<span class="dashicons dashicons-warning" style="color:red"></span> <b>%s</b>. License for plugin <b>will expire in %s days</b>. It means that your <b>PRO version will not work</b>. To continue use PRO functionality - with all features, options, updates and premium support, just <b>extend PRO version license - follow <a href="%s" target="_blank">this link</a></b>',
             GMP_WP_PLUGIN_NAME, $daysLeft, $this->getExtendUrl()
			);
		}
		echo '<div class="error">'. $msg. '</div>';
	}
	public function updateDb() {
		if(!$this->enbOptimization())
			return;
		$time = time();
		$lastCheck = (int) get_option('_last_wp_check_imp_'. GMP_CODE);
		if(!$lastCheck || ($time - $lastCheck) >= 5 * 24 * 3600 /** 0/*remove last!!!*/) {
			if($this->isActive()) {
				dbGmp::query('UPDATE @__modules SET active = 1 WHERE ex_plug_dir IS NOT NULL AND ex_plug_dir != "" AND code != "license"');
			} else {
				dbGmp::query('UPDATE @__modules SET active = 0 WHERE ex_plug_dir IS NOT NULL AND ex_plug_dir != "" AND code != "license"');
			}
			update_option('_last_wp_check_imp_'. GMP_CODE, $time);
		}
	}
	private function _getPluginCode() {
		return 'google_maps_easy_pro';
	}
	public function getExtendUrl() {
		$license = $this->getCredentials();
		$license['key'] = md5($license['key']);
		$license = urlencode(base64_encode(implode('|', $license)));
		return $this->_apiUrl. '?mod=manager&pl=lms&action=extend&plugin_code='. $this->_getPluginCode(). '&lic='. $license;
	}
}
