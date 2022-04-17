<?php
/**
 * Plugin Name: Easy Google Maps PRO
 * Description: Easy Google Maps PRO version.
 * Plugin URI: https://supsystic.com/plugins/google-maps-plugin/
 * Author: supsystic.com
 * Author URI: https://supsystic.com/
 * Version: 1.5.3
 **/
	require_once(dirname(__FILE__). DIRECTORY_SEPARATOR. 'wpUpdater.php');

	register_activation_hook(__FILE__, 'googleMapsEasyProActivateCallback');
    register_deactivation_hook(__FILE__, array('modInstallerGmp', 'deactivate'));
    register_uninstall_hook(__FILE__, array('modInstallerGmp', 'uninstall'));

	add_filter('pre_set_site_transient_update_plugins', 'checkForPluginUpdategoogleMapsEasyPro');
    add_filter('plugins_api', 'myPluginApiCallgoogleMapsEasyPro', 10, 3);

	if(!function_exists('getProPlugCodeGmp')) {
		function getProPlugCodeGmp() {
			return 'google_maps_easy_pro';
		}
	}
	if(!function_exists('getProPlugDirGmp')) {
		function getProPlugDirGmp() {
			return basename(dirname(__FILE__));
		}
	}
	if(!function_exists('getProPlugFileGmp')) {
		function getProPlugFileGmp() {
			return basename(__FILE__);
		}
	}
	if(!defined('S_YOUR_SECRET_HASH_'. getProPlugCodeGmp()))
		define('S_YOUR_SECRET_HASH_'. getProPlugCodeGmp(), 'sdfewf333933489%#%$jkdsfF@E@EJR3r93');

    if(!function_exists('checkForPluginUpdategoogleMapsEasyPro')) {
        function checkForPluginUpdategoogleMapsEasyPro($checkedData) {
            if(class_exists('wpUpdaterGmp')) {
                return wpUpdaterGmp::getInstance( getProPlugDirGmp(), getProPlugFileGmp(), getProPlugCodeGmp() )->checkForPluginUpdate($checkedData);
            }
			return $checkedData;
        }
    }
    if(!function_exists('myPluginApiCallgoogleMapsEasyPro')) {
        function myPluginApiCallgoogleMapsEasyPro($def, $action, $args) {
            if(class_exists('wpUpdaterGmp')) {
                return wpUpdaterGmp::getInstance( getProPlugDirGmp(), getProPlugFileGmp(), getProPlugCodeGmp() )->myPluginApiCall($def, $action, $args);
            }
			return $def;
        }
    }
	/**
	 * Check if there are base (free) version installed
	 */
	if(!function_exists('googleMapsEasyProActivateCallback')) {
		function googleMapsEasyProActivateCallback() {
			if(class_exists('frameGmp')) {
				$arguments = func_get_args();
				call_user_func_array(array('modInstallerGmp', 'check'), $arguments);
			}
		}
	}
	add_action('admin_notices', 'googleMapsEasyProInstallBaseMsg');
	if(!function_exists('googleMapsEasyProInstallBaseMsg')) {
		function googleMapsEasyProInstallBaseMsg() {
			if(!get_option('gmp_full_installed') || !class_exists('frameGmp')) {
				$plugName = 'Easy Google Maps';
				$plugWpUrl = 'https://wordpress.org/plugins/google-maps-easy/';
				$html = '<div class="error"><p><strong style="font-size: 15px;">
					Please install Free (Base) version of '. $plugName. ' plugin, you can get it <a target="_blank" href="'. $plugWpUrl. '">here</a> or use Wordpress plugins search functionality,
					activate it, then deactivate and activate again PRO version of '. $plugName. '.
					In this way you will have full and upgraded PRO version of '. $plugName. '.</strong></p></div>';
				echo $html;
			}
		}
	}
