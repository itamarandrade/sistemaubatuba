<?php
class frontend_actionsViewGmp extends viewGmp {
	public $_addIconsWnd = false;

	public function drawMarkerForm($params) {
		$map = frameGmp::_()->getModule('gmap')->getModel()->getMapById($params['map_id']);

		if(empty($map)) {
			return __('Empty or Invalid Map ID. Please, check your Marker Form Shortcode.', GMP_LANG_CODE);
		}
		if($this->getModule()->_checkSaveMarkerFormForCurMap($map)) {
			if(isset($map['params']['frontend_add_markers_logged_in_only'])
				&& (int)$map['params']['frontend_add_markers_logged_in_only']
				&& !frameGmp::_()->getModule('user')->isUserLoggedIn()
			) {
				$message = __('Quer incluir seu projeto ?', GMP_LANG_CODE);
				$message .= 'Faça o login . <a href="' . get_bloginfo('wpurl') . '/wp-admin/" id="gmpLogInBtn" class="button">' . __('Log In', GMP_LANG_CODE) . '</a> aqui!';
				return $message;
			}
			// Generate Form View Id
			$form_view_id = $map['id']. '_'. mt_rand(1, 99999);
			$form_params = array(
				'form_name' => !empty($params['form_name']) ? $params['form_name'] : __('Inserir Projeto', GMP_LANG_CODE),
				'marker_name' => !empty($params['marker_name']) ? $params['marker_name'] : __('Nome do Projeto', GMP_LANG_CODE),
				'marker_cat' => !empty($params['marker_cat']) ? $params['marker_cat'] : __('Categoria do Projeto', GMP_LANG_CODE),
				'marker_adr' => !empty($params['marker_adr']) ? $params['marker_adr'] : __('Endereço', GMP_LANG_CODE),
				'marker_desc' => !empty($params['marker_desc']) ? $params['marker_desc'] : __('Descrição do Projeto', GMP_LANG_CODE)
			);
			$use_wp_editor = isset($map['params']['frontend_add_markers_disable_wp_editor']) && (int)$map['params']['frontend_add_markers_disable_wp_editor'] ? false : true;
			$user_id = get_current_user_id();
			$user_markers_list = isset($map['params']['frontend_add_markers_delete_markers']) && (int)$map['params']['frontend_add_markers_delete_markers'] && (int) $user_id
				? frameGmp::_()->getModule('marker')->getModel()->getMapMarkers($params['map_id'], false, $user_id)
				: false;
			$markerGroupsForSelect = isset($map['params']['frontend_add_markers_use_markers_categories']) && (int)$map['params']['frontend_add_markers_use_markers_categories']
				? frameGmp::_()->getModule('marker_groups')->getModel()->getMarkerGroupsForSelect(array(0 => __('None', GMP_LANG_CODE)))
				: array();
			frameGmp::_()->getModule('templates')->loadJqueryUi();
			frameGmp::_()->getModule('templates')->loadFontAwesome();
			frameGmp::_()->getModule('templates')->loadChosenSelects();
			frameGmp::_()->addScript('jquery-ui-dialog', '', array('jquery'));
			frameGmp::_()->addScript('jquery-ui-autocomplete', '', array('jquery'), false, true);
			frameGmp::_()->addStyle('jquery-ui-autocomplete', GMP_CSS_PATH. 'jquery-ui-autocomplete.css');
			frameGmp::_()->addScript('core.frontend_actions', $this->getModule()->getModPath(). 'js/core.frontend_actions.js');
			frameGmp::_()->addStyle('gmap_frontend_actions', $this->getModule()->getModPath() . 'css/gmap_frontend_actions.css');

			$this->assign('formViewId', $form_view_id);
			$this->assign('formParams', $form_params);
			$this->assign('mapId', $map['id']);
			$this->assign('useWPEditor', $use_wp_editor);
			$this->assign('userMarkers', $user_markers_list);
			$this->assign('markerIcons', frameGmp::_()->getModule('icons')->getModel()->getIcons(array('fields' => 'id, path, title')));
			$this->assign('markerGroupsForSelect', $markerGroupsForSelect);

			return parent::getContent('frontend_actionsMarkerForm');
		} else {
			return __("Marker's Form is not displayed, because the option &quot;Add markers on frontend&quot; is disabled for the Current Map", GMP_LANG_CODE);
		}
	}
}