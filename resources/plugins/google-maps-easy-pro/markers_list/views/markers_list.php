<?php
class markers_listViewGmp extends viewGmp {
	public function getSliderSimpleList($map) {
		if(isset($map['markers']) && !empty($map['markers'])) {
			$map['markers'] = $this->extractContentImg( $map['markers'] );
			$map['markers'] = $this->filterMarkers( $map['markers'], $map );
			$isMobile = utilsGmp::isMobile();
			$needCollapse = !empty($map['params']['markers_list_collapse']['mobile']) && (int)$map['params']['markers_list_collapse']['mobile'];
			$this->assign('map', $map);
			$this->assign('isMobile', $isMobile);
			$this->assign('needCollapse', $needCollapse);
			return parent::getContent('mmlSliderSimple');
		}
		return '';
	}
	public function getSliderCheckboxTree($map) {
		if(isset($map['markers']) && !empty($map['markers'])) {
			$groupsList = frameGmp::_()->getModule('marker_groups')->getModel()->getCurrentMapMarkersGroupsTree($map, false);
			$properties = array(
				'id' => 'all',
				'title' => isset($map['params']['marker_filter_button_title']) ? $map['params']['marker_filter_button_title'] : 'Select all',
				'params' => array(
					'bg_color' => '#e4e4e4'
				)
			);
			$groupsList[] = $properties;
			frameGmp::_()->addJSVar('markers_list.filter', 'gmp_group_list', $groupsList);
			$this->assign('map', $map);
		}
	}
	public function getSliderTableList($map) {
		$content = '';

		if(isset($map['markers']) && !empty($map['markers'])) {
			//$map['markers'] = $this->extractContentImg( $map['markers'] );
			$map['markers'] = $this->filterMarkers( $map['markers'], $map );
			$markerGroupsTree = frameGmp::_()->getModule('marker_groups')->getModel()->getCurrentMapMarkersGroupsTree($map, true);
			$this->assign('map', $map);
			$content .= '<div class="gmpMml gmpMmlSliderTableShell gmpListType_' . $map['params']['markers_list_type'] . '" ' .
	 			'id="gmpMmlSimpleSlider_' . $map['view_id'] . '" ' . 'data-slider-type="table" style="display: none;">';
			$content = $this->getMarkerGroupsHtml($markerGroupsTree, $content);
			$content .= '</div>';
		}
		echo $content;
	}
	public function getMarkerGroupsHtml($groups, $content) {
		foreach($groups as $g) {
			$groupMarkers = array();
			foreach($this->map['markers'] as $marker) {
				if (!empty($marker['marker_group_ids'])) {
					if(in_array($g['id'], $marker['marker_group_ids'])) {
						array_push($groupMarkers, $marker);
					}
				}
			}
			if(!empty($groupMarkers) || !empty($g['children'])) {
				$this->assign('group', $g);
				$content .= parent::getContent('mmlSliderTable_Group');
				$content .= '<div class="gmpMarkerGroupWrapper" style="display:none;">';
				if(!empty($g['children'])) {
					$content = $this->getMarkerGroupsHtml($g['children'], $content);
				}
				$this->assign('group', $g);	// reassign group to current after recursion
				if(!empty($groupMarkers)) {
					$this->assign('markers', $groupMarkers);
					$content .= parent::getContent('mmlSliderTable_Markers');
				}
				$content .= '</div>';
			}
		}
		return $content;
	}
	public function extractContentImg($markers) {
		foreach($markers as $i => $m) {
			$description = !empty($m['params']['marker_list_desc']) && !empty($m['params']['marker_list_desc_text']) ? $m['params']['marker_list_desc_text'] : $m['description'];
			$imgTags = utilsGmp::gmpExtractImgTags($description);

			if(!empty($imgTags) && !empty($imgTags[0])) {
				$markers[$i]['raw_content'] = $this->prepareMarkerContent(str_replace($imgTags[0], '', $description));
				$markers[$i]['raw_img'] = $imgTags[0];
			} else {
				$markers[$i]['raw_content'] = $this->prepareMarkerContent($description);
				$markers[$i]['raw_img'] = '';
			}
			if(isset($m['params']['marker_list_def_img'])
				&& isset($m['params']['marker_list_def_img_url'])
				&& $m['params']['marker_list_def_img_url']
			)
				$markers[$i]['raw_img'] = '<img src="'. $m['params']['marker_list_def_img_url'] .'" />';
			}
		return $markers;
	}
	public function prepareMarkerContent($content) {
		return preg_replace("/([^>])\n/", '$1<br/>', $content);
	}
	public function filterMarkers($markers, $map) {
		$deps = $map['params']['marker_list_params']['d'];

		if(!empty($map['params']['markers_list_hide_empty_block']) && (int)$map['params']['markers_list_hide_empty_block']) {
			foreach($markers as $i => $m) {
				$image = isset($markers[$i]['raw_img']) ? $markers[$i]['raw_img'] : '';
				$content = isset($markers[$i]['raw_content']) ? $markers[$i]['raw_content'] : $markers[$i]['description'];

				if(in_array('img', $deps) && !in_array('desc', $deps) && empty($image)) {
					unset($markers[$i]);
				} else if(!in_array('img', $deps) && in_array('desc', $deps) && empty($content)) {
					unset($markers[$i]);
				} else if(in_array('img', $deps) && in_array('desc', $deps) && empty($content) && empty($image)) {
					unset($markers[$i]);
				}
			}
			$markers = array_values($markers);
		}
		return $markers;
	}
	public function addEditMapPart($part) {
		return parent::display($part.'Pro');
	}
}
