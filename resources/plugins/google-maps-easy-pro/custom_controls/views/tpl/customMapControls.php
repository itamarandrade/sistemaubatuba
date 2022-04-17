<?php
$id = !empty($this->map['id']) ? $this->map['id'] : '';
$viewId = !empty($this->map['params']['view_id']) ? $this->map['params']['view_id'] : '';
$controls_type = !empty($this->map['params']['custom_controls_type']) ? $this->map['params']['custom_controls_type'] : 'round';
$controls_bg_color = !empty($this->map['params']['custom_controls_bg_color']) ? $this->map['params']['custom_controls_bg_color'] : '#55BA68';
$controls_txt_color = !empty($this->map['params']['custom_controls_txt_color']) ? $this->map['params']['custom_controls_txt_color'] : '#000000';
$controls_unit = !empty($this->map['params']['custom_controls_unit']) ? $this->map['params']['custom_controls_unit'] : 'meters';
$custom_filter_show_all = !empty($this->map['params']['custom_filter_show_all']) ? $this->map['params']['custom_filter_show_all'] : true;
$slider_min = isset($this->map['params']['custom_controls_slider_min'])
&& is_numeric($this->map['params']['custom_controls_slider_min'])
&& (int)$this->map['params']['custom_controls_slider_min']
	? $this->map['params']['custom_controls_slider_min'] : '100';
$slider_max = isset($this->map['params']['custom_controls_slider_max'])
&& is_numeric($this->map['params']['custom_controls_slider_max'])
&& (int)$this->map['params']['custom_controls_slider_max']
	? $this->map['params']['custom_controls_slider_max'] : '1000';
$slider_step = isset($this->map['params']['custom_controls_slider_step'])
&& is_numeric($this->map['params']['custom_controls_slider_step'])
&& (int)$this->map['params']['custom_controls_slider_step']
	? $this->map['params']['custom_controls_slider_step'] : '10';

$isUsedImproveSearch = (!empty($this->map['params']['custom_controls_improve_search']) && $this->map['params']['custom_controls_improve_search'] == 1);
$isFilterEnable = (!empty($this->map['params']['button_filter_enable']) && $this->map['params']['button_filter_enable'] == 1);
$styleForGis = $isUsedImproveSearch ? '' : 'display: none;';
$styleForGs = $isUsedImproveSearch ? 'display: none;' : '';
$styleForFilterButton = $isUsedImproveSearch || $isFilterEnable ? 'display: none;' : '';
$customFormStyle = 'border: 2px solid ' . $controls_bg_color . '; color: ' . $controls_txt_color . ';';
?>
<div id="gmpCustomControlsShell_<?php echo $viewId?>"
	class="gmpCustomControlsShell <?php echo ($this->isMobile) ? 'gmpMobile' : ''; ?> <?php echo ($this->isExtendSearchBtn) ? 'gmpExtendSearchBtn' : ''; ?>"
	style="display: none;"
>
	<style>
		.gmpDpHighLight > a.ui-state-default {
			background-color: <?php echo $controls_bg_color; ?>;
			border: 1px solid <?php echo $controls_bg_color; ?>;
			color: <?php echo $controls_txt_color; ?>;
		}
		.gmpImproveSearchFormWr.gmpMobile .gmpIsfTabLink {
			border: 1px solid <?php echo $controls_bg_color; ?>;
			background-color: #ffffff;
			color: <?php echo $controls_bg_color; ?>;
		}
		.gmpImproveSearchFormWr.gmpMobile .gmpIsfTabLink.gmpActive {
			background-color: <?php echo $controls_bg_color; ?>;
			color: <?php echo $controls_txt_color; ?>;
		}
	</style>
	<div id="gmpZoomShell_<?php echo $viewId?>" class="gmpZoomShellWr">
		<div
			 class="gmpCustomControlButton <?php echo $controls_type?>"
			 data-mapid="<?php echo $id?>"
			 data-viewid="<?php echo $viewId?>"
			 style="
				 background-color: <?php echo $controls_bg_color?>;
				 color: <?php echo $controls_txt_color?>;"
			 id="gmpCustomZoomInBtn_<?php echo $viewId?>"
			 onclick="gmpZoomInBtn(this); return false;"
		>
			<i class="fa fa-plus"></i>
		</div>
		<div
			 class="gmpCustomControlButton <?php echo $controls_type?>"
			 data-mapid="<?php echo $id?>"
			 data-viewid="<?php echo $viewId?>"
			 style="
				 background-color: <?php echo $controls_bg_color?>;
				 color: <?php echo $controls_txt_color?>;"
			 id="gmpCustomZoomOutBtn_<?php echo $viewId?>"
			 onclick="gmpZoomOutBtn(this); return false;"
		>
			<i class="fa fa-minus"></i>
		</div>
	</div>

	<div id="gmpImproveSearch_<?php echo $viewId?>"
		class="gmpImproveSearchContainer <?php echo ($this->isMobile) ? 'gmpMobile' : ''; ?> <?php echo ($this->isExtendSearchBtn) ? 'gmpExtendSearchBtn' : ''; ?>"
		style="<?php echo $styleForGis; ?>"
	>
		<div
			class="gmpCustomControlButton <?php echo $controls_type?>"
			data-mapid="<?php echo $id?>"
			data-viewid="<?php echo $viewId?>"
			style="background-color: <?php echo $controls_bg_color?>; color: <?php echo $controls_txt_color?>;"
			id="gmpCustomImproveSearchBtn_<?php echo $viewId;?>"
		>
			<?php if($this->isMobile || $this->isExtendSearchBtn):?>
				<span><?php echo __('Search', GMP_LANG_CODE); ?></span>
			<?php else: ?>
				<i class="fa fa-search"></i>
			<?php endif; ?>
		</div>
		<div class="gmpImproveSearchFormWr <?php echo ($this->isMobile) ? 'gmpMobile' : ''; ?>" data-is-mobile="<?php echo $this->isMobile?>" style="display: none;<?php echo $customFormStyle; ?>">
			<div class="gmpImproveSearchBlock">
				<?php if($this->isMobile) {?>
					<div class="gmpIsfTabRoller">
						<div class="gmpIsfTabLink" data-tab-link="category"><?php echo __('Category', GMP_LANG_CODE); ?></div>
						<div class="gmpIsfTabLink" data-tab-link="calendar"><?php echo __('Calendar', GMP_LANG_CODE); ?></div>
					</div>
				<?php }?>
				<div class="gmpImproveSearchCategoryListWr gmpIsfTabItem" data-tab-item="category">
					<div class="gmpImproveSearchCategoryList" data-viewid="<?php echo $viewId; ?>"></div>
				</div>
				<div class="gmpImproveSearchCalendarWr gmpIsfTabItem" data-tab-item="calendar">
					<div class="gmpImproveSearchCalendar" data-viewid="<?php echo $viewId; ?>" data-today="<?php echo date('d-m-Y', time()); ?>"></div>
					<label class="gmpDateAllLabel"><?php echo htmlGmp::checkbox('gmp', array('attrs' => ' class="gmpDateAllFlag" ', 'value' => 1,));?>
						<span class="gmpDateAllFlagLabel"><?php echo __('All Time', GMP_LANG_CODE); ?></span>
					</label>

                    <?php if(!$this->isMobile) {?>
                        <div class="gmpImproveSearchForm">
                            <div class="gmpIsfRowWrapper">
                                <?php echo htmlGmp::input('gmpImproveSearchText_'. $viewId, array(
                                    'value' => '',
                                    'placeholder' => __('Search...', GMP_LANG_CODE),
                                    'attrs' => 'class="gmpImproveSearchText"',
                                    'type' => 'search',
                                )); ?>
                            </div>
                            <div class="gmpIsfRowWrapper">
                                <?php echo htmlGmp::button(array(
                                    'value' => '',
                                    'attrs' => '
							class="gmpImproveSearchFindBtn"
							id="gmpImproveSearchFindBtn_'. $viewId .'"
							data-mapid="'. $id .'"
							data-viewid="'. $viewId .'"
							style="background: #000000;color: #ffffff;"
						',
                                )); ?>
                                <?php echo htmlGmp::button(array(
                                    'value' => '',
                                    'attrs' => '
							class="gmpImproveSearchResetBtn flip-horizontal"
							id="gmpImproveSearchResetBtn_'. $viewId .'"
							data-mapid="'. $id .'"
							data-viewid="'. $viewId .'"
							style="background: transparent;color: #000000;"
						',
                                )); ?>
                            </div>
                        </div>
                    <?php }?>
				</div>
			</div>
            <?php if($this->isMobile) {?>
			<div class="gmpImproveSearchBlock">
				<div class="gmpImproveSearchForm">
					<div class="gmpIsfRowWrapper">
						<?php echo htmlGmp::input('gmpImproveSearchText_'. $viewId, array(
							'value' => '',
							'placeholder' => __('Search...', GMP_LANG_CODE),
							'attrs' => 'class="gmpImproveSearchText"',
                            'type' => 'search',
						)); ?>
					</div>
					<div class="gmpIsfRowWrapper">
						<?php echo htmlGmp::button(array(
							'value' => '',
							'attrs' => '
							class="gmpImproveSearchFindBtn"
							id="gmpImproveSearchFindBtn_'. $viewId .'"
							data-mapid="'. $id .'"
							data-viewid="'. $viewId .'"
							style="background: #000000;color: #ffffff;"
						',
						)); ?>
						<?php echo htmlGmp::button(array(
							'value' => '',
							'attrs' => '
							class="gmpImproveSearchResetBtn flip-horizontal"
							id="gmpImproveSearchResetBtn_'. $viewId .'"
							data-mapid="'. $id .'"
							data-viewid="'. $viewId .'"
							style="background: transparent;color: #000000;"
						',
						)); ?>

                        <div class="gmpIsfCloseBtn">
                            <i class="fa fa-times" aria-hidden="true"></i>
                        </div>
					</div>
				</div>
			</div>
            <?php }?>
		</div>
	</div>
<div id="gmpSearchShell_<?php echo $viewId?>" class="gmpSearchShell" style="<?php echo $styleForGs; ?>">
	<div
		class="gmpCustomControlButton <?php echo $controls_type?>"
		data-mapid="<?php echo $id?>"
		data-viewid="<?php echo $viewId?>"
		style="
			background-color: <?php echo $controls_bg_color?>;
			color: <?php echo $controls_txt_color?>;"
		id="gmpCustomSearchBtn_<?php echo $viewId?>"
		onclick="gmpShowSearchForm(this); return false;"
		>
		<i class="fa fa-search"></i>
	</div>
	<div class="gmpSearchForm" id="gmpCustomSearchFormShell_<?php echo $viewId?>" style="border: 2px solid <?php echo $controls_bg_color?>;">
		<div class="gmpSearchFormRow">
			<?php echo htmlGmp::text('custom_search[address_'. $viewId .']', array(
				'value' => '',
				'placeholder' => __('Search address...', GMP_LANG_CODE),
			))?>
			<?php echo htmlGmp::hidden('custom_search[coord_x_'. $viewId .']', array('value' => ''))?>
			<?php echo htmlGmp::hidden('custom_search[coord_y_'. $viewId .']', array('value' => ''))?>
			<?php echo htmlGmp::hidden('custom_search[marker_id_'. $viewId .']', array('value' => ''))?>
			<?php echo htmlGmp::hidden('custom_search[marker_group_id_'. $viewId .']', array('value' => ''))?>
		</div>
		<div class="gmpSearchFormRow">
			<div class="gmpSearchFormSlider gmpSliderMin" <?php /*style="background-color: <?php echo $controls_bg_color?>;color: <?php echo $controls_txt_color?>"*/?>>
				<?php echo $slider_min?>
			</div>
			<div class="gmpSearchFormSlider gmpSliderMax" <?php /*style="background-color: <?php echo $controls_bg_color?>;color: <?php echo $controls_txt_color?>"*/?>>
				<?php echo $slider_max?>
			</div>
			<?php echo htmlGmp::slider('custom_search[area_'. $viewId .']', array(
				'value'		=> $slider_min,
				'min' 		=> $slider_min,
				'max' 		=> $slider_max,
				'step' 		=> $slider_step,

			))?>
		</div>
		<div class="gmpSearchFormRow">
			<?php echo htmlGmp::button(array(
				'value' => __('Reset', GMP_LANG_CODE),
				'attrs' => '
					class="gmpSearchFormButton"
					id="gmpResetBtn_'. $viewId .'"
					data-mapid="'. $id .'"
			 		data-viewid="'. $viewId .'"
					style="
						display: none;
						background: '. $controls_bg_color .';
						color: '. $controls_txt_color .';"
					onclick="gmpSearchReset(this)"',
			))?>
			<?php echo htmlGmp::button(array(
				'value' => __('Find', GMP_LANG_CODE),
				'attrs' => '
					id="gmpFindBtn_'. $viewId .'"
					data-mapid="'. $id .'"
			 		data-viewid="'. $viewId .'"
					style="
						background: '. $controls_bg_color .';
						color: '. $controls_txt_color .';"
					onclick="gmpMarkersSearch(this)"',
			))?>
		</div>
		<div class="gmpSearchFormErrors" id="gmpSearchFormNoMarkers_<?php echo $viewId?>">
			<?php _e('Search area have no markers, please try to modify search criteria.', GMP_LANG_CODE)?>
		</div>
	</div>
</div>

<?php if(!empty($this->groupsList)) {?>
	<div id="gmpFilterShell_<?php echo $viewId?>" class="gmpFilterShell" style="<?php echo $styleForFilterButton; ?>">
		<div
			class="gmpCustomControlButton <?php echo $controls_type?>"
			data-mapid="<?php echo $id?>"
			data-viewid="<?php echo $viewId?>"
			style="
				background-color: <?php echo $controls_bg_color?>;
				color: <?php echo $controls_txt_color?>;"
			id="gmpCustomFilterBtn_<?php echo $viewId?>"
			onclick="gmpShowFilterForm(this); return false;"
			>
			<i class="fa fa-filter"></i>
		</div>
		<div id="gmpCustomFilterFormShell_<?php echo $viewId?>"
			 class="gmpFilterForm"
			 style="
				 border: 2px solid <?php echo $controls_bg_color?>;
				 color: <?php echo $controls_txt_color?>;"
			>
			<?php /*foreach($this->groupsList as $k => $v) {?>
					<?php $v['title'] = trim($v['title']);?>
					<div class="gmpFilterFormMarkerGroup" style="
						background-color: <?php echo $v['params']['bg_color'] ? $v['params']['bg_color'] : $controls_bg_color?>;
						color: <?php echo $controls_txt_color?>;
						">
						<label>
							<?php echo htmlGmp::checkbox('custom_search[groupid_'. $k .']', array(
								'value' => '',
								'attrs' => '
									data-viewid="'. $viewId .'"
									data-groupid="'. $k .'"
									data-parentid="'. $v['parent'] .'"
									data-grouptitle="'. htmlspecialchars(strip_tags($v['title'])) .'"
									id="gmpMarkerGroupId_'. $k .'_'. $viewId .'"
									onchange="gmpMarkersFilter(this)"',
							))?>
							<span style="vertical-align: middle; color: inherit;"><?php echo $v['title']; ?></span>
						</label>
					</div>
				<?php }*/?>
		</div>
	</div>
<?php }?>
</div>
