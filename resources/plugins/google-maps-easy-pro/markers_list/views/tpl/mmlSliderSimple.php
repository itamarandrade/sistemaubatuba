<?php if(isset($this->map['markers']) && !empty($this->map['markers'])) { ?>
	<?php
		$countMarkers = count($this->map['markers']);
		$showDesc = in_array('desc', $this->map['params']['marker_list_params']['d']);
		$showTitle = in_array('title', $this->map['params']['marker_list_params']['d']);
		$twoCols = isset($this->map['params']['marker_list_params']['two_cols']) && $this->map['params']['marker_list_params']['two_cols'];
		$addShellClasses = 'gmpListType_'. $this->map['params']['markers_list_type'];
		if($twoCols) {
			$addShellClasses .= ' gmpSlidesListTwoCols';
		}
		$sliderHeight =
			$this->map['params']['marker_list_params']['or'] == 'h'
			&& !in_array('desc', $this->map['params']['marker_list_params']['d'])
			&& !in_array('two_cols', $this->map['params']['marker_list_params']['d'])
		? 'height: 100%;' : '';
		$contentHeight =
			$this->map['params']['marker_list_params']['or'] == 'h'
			&& !in_array('desc', $this->map['params']['marker_list_params']['d'])
			&& !in_array('two_cols', $this->map['params']['marker_list_params']['d'])
		? 'height: inherit;' : '';
	?>
	<?php if($this->isMobile && $this->needCollapse) {?>
		<style>
			.gmpMarkersListCollapseShell.ui-accordion .gmpMarkersListCollapseTitle.ui-state-active {
				border: 1px solid <?php echo $this->map['params']['markers_list_color']?>;
				background: <?php echo $this->map['params']['markers_list_color']?>;
				color: initial;
			}
			.gmpMarkersListCollapseShell.ui-accordion .gmpMarkersListCollapseTitle.ui-state-default {
				border: 1px solid <?php echo $this->map['params']['markers_list_color']?>;
				background: <?php echo $this->map['params']['markers_list_color']?>;
				color: initial;
			}
			.gmpMarkersListCollapseShell.ui-accordion .gmpMarkersListCollapseArea {
				border: 2px solid <?php echo $this->map['params']['markers_list_color']?>;
			}
		</style>
		<div class="gmpMarkersListCollapseShell">
		<div class="gmpMarkersListCollapseTitle"><?php echo sprintf(__('View %s results'), '<span class="gmpMarkersListMarkersCount">'. $countMarkers. '</span>')?></div>
		<div class="gmpMarkersListCollapseArea" style="position: relative;">
	<?php }?>
	<div
		class="gmpMml gmpMnlJssorSlider <?php echo $addShellClasses?>"
		id="gmpMmlSimpleSlider_<?php echo $this->map['view_id']?>"
		data-slider-type="jssor"
		style="display: none;"
	>
		<div class="gmpMnlJssorSlides" data-u="slides">
		<?php foreach($this->map['markers'] as $i => $marker) { ?>
			<?php
				$showImg = !empty($marker['raw_img']) && in_array('img', $this->map['params']['marker_list_params']['d']);
				$slideId = $i;
				$startSlide = true;
				$endSlide = true;
				$addSlideClasses = '';
				if($twoCols) {
					$startSlide = !$i || $i % 2 == 0 || $i == $countMarkers - 1;
					$endSlide = $i % 2 == 1 || $i == $countMarkers - 1;
					if($startSlide) {
						$addSlideClasses .= ' gmpStartRowSlide';
					}
					if($endSlide) {
						$addSlideClasses .= ' gmpEndRowSlide';
					}
					$slideId = floor($slideId / 2);
				}
				$slideContentWidth = $showImg && $showDesc ? 60 : 100;
			?>
			<?php if($twoCols && $startSlide) {?>
				<div>
			<?php }?>
				<div class="gmpMnlJssorSlide <?php echo $addSlideClasses?>"
				data-marker-id="<?php echo $marker['id']?>"
				data-map-id="<?php echo $this->map['id'];?>"
				data-map-view-id="<?php echo $this->map['view_id']?>"
				data-slide-id="<?php echo $slideId;?>"
			>
				<?php if($showImg && $showDesc) {
				    $m_link = !empty($marker['params']['marker_link']) && !empty($marker['params']['marker_link_src']) ? $marker['params']['marker_link_src'] : '';
				    ?>
					<div class="gmpMmlSlideImg" style="width: 40%;">
                        <?php if ($m_link) {
                            $_blank = isset($marker['params']['marker_link_new_wnd']) && $marker['params']['marker_link_new_wnd'] ? ' onclick="window.open(this.href,\'_blank\'); return false;"' : '';
                            ?>
                            <a href="<?php echo $m_link?>" class="gmpMmlSlideImgLink"<?php echo $_blank?>><?php echo $marker['raw_img']?></a>
                        <?php } else { ?>
                            <?php echo $marker['raw_img']?>
                        <?php } ?>
                    </div>
				<?php } ?>
				<div class="gmpMmlSlideContent" style="width: <?php echo $slideContentWidth?>%; <?php echo $contentHeight?>">
					<?php if($showTitle) {?>
						<div class="gmpMmlSlideTitle" style="background-color: <?php echo isset($this->map['params']['markers_list_color']) ? $this->map['params']['markers_list_color'] : '#55BA68'?>;">
							<div class="gmpMmlTitleContainer" style="width: <?php echo $style = $this->map['params']['enable_directions_btn'] ? 'calc(100% - 30px)' : '100%'?>;">
								<a href="#" data-slider-type="jssor" title="<?php echo strip_tags($marker['title'])?>" onclick="gmpMmlGoToSlideSimpleSliderClk(this); return false;">
									<?php echo $marker['title']?>
								</a>
							</div>
						</div>
					<?php }?>
					<?php if($showDesc) {?>
						<div class="gmpMmlSlideDescription"><?php echo $marker['raw_content']?></div>
					<?php } elseif($showImg) { ?>
						<div class="gmpMmlSlideImg" style="<?php echo $sliderHeight?>">
							<a href="#" data-slider-type="jssor" onclick="gmpMmlGoToSlideSimpleSliderClk(this); return false;">
								<?php echo $marker['raw_img']?>
							</a>
						</div>
					<?php }?>
				</div>
				<?php if(0 && !$twoCols) {?>
				<div style="clear: both;"></div>
				<?php }?>
			</div>
			<?php if($twoCols && $endSlide) {?>
				</div>
			<?php }?>
		<?php } //exit(); ?>
		</div>
		<?php if($this->map['params']['marker_list_params']['or'] == 'v') {
			$btnClassLeft = 'jssora03u';
			$btnClassRight = 'jssora03d';
			$navClass = 'jssorb03v';
		} else {
			$btnClassLeft = 'jssora03l';
			$btnClassRight = 'jssora03r';
			$navClass = 'jssorb03';
		}?>
		 <!-- Arrow Left -->
		<span data-u="arrowleft" class="<?php echo $btnClassLeft?>" data-type="arrow" data-dir="l"></span>
		 <!-- Arrow Right -->
        <span data-u="arrowright" class="<?php echo $btnClassRight?>" data-type="arrow" data-dir="r"></span>
		<!-- bullet navigator container -->
        <div data-u="navigator" class="<?php echo $navClass?>" data-type="navigator">
            <!-- bullet navigator item prototype -->
            <div data-u="prototype"><div data-u="numbertemplate"></div></div>
        </div>
	</div>
	<div style="clear: both;"></div>
	<?php if($this->isMobile && $this->needCollapse) {?>
		</div>
		</div>
	<?php }?>
<?php }?>
