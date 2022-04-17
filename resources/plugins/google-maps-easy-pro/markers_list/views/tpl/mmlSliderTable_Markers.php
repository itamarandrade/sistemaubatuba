<?php
//$markerListParams = $this->map['params']['marker_list_params']['d'];
//$showDesc = in_array('desc', $markerListParams);
//$showTitle = in_array('title', $markerListParams);
$bg_color = isset($this->map['params']['markers_list_color']) ? $this->map['params']['markers_list_color'] : '#55BA68';
?>
<!--Not good choice place css here, but we have nice translated responsive table-->
<style>
	@media	only screen and (max-width: 760px),	(min-device-width: 768px) and (max-device-width: 1024px)  {
		.gmpMarkerGroupWrapper td:nth-of-type(1):before { content: "<?php _e('Title', GMP_LANG_CODE)?>"; text-align: left;}
		.gmpMarkerGroupWrapper td:nth-of-type(2):before { content: "<?php _e('Address', GMP_LANG_CODE)?>"; text-align: left;}
		.gmpMarkerGroupWrapper td:nth-of-type(3):before { content: "<?php _e('Description', GMP_LANG_CODE)?>"; text-align: left;}
		.gmpMarkerGroupWrapper td:nth-of-type(4):before { content: "<?php _e('Directions', GMP_LANG_CODE)?>"; text-align: left;}
	}
</style>
<table class="gmpMmlSlidesTable"
	   data-map-id="<?php echo $this->map['id']?>"
	   data-map-view-id="<?php echo $this->map['view_id']?>"
	   data-marker-group-id="<?php echo isset($this->group['id']) ? $this->group['id'] : ''?>"
	>
	<tr class="gmpMmlSlideTableHeader">
		<th style="background-color: <?php echo $bg_color?> !important;"><?php _e('Title', GMP_LANG_CODE)?></th>
		<th style="background-color: <?php echo $bg_color?> !important;"><?php _e('Address', GMP_LANG_CODE)?></th>
		<th style="background-color: <?php echo $bg_color?> !important;"><?php _e('Description', GMP_LANG_CODE)?></th>
		<?php if($this->map['params']['enable_directions_btn']){?>
			<th style="background-color: <?php echo $bg_color?> !important;"><?php _e('Directions', GMP_LANG_CODE)?></th>
		<?php }?>
	</tr>
	<?php foreach($this->markers as $marker){?>
		<?php if( in_array($this->group['id'], $marker['marker_group_ids']) ) {?>
		<?php // if($marker['marker_group_id'] == $this->group['id'] ) {?>
			<?php //$showImg = !empty($marker['raw_img']) && in_array('img', $markerListParams);?>
			<tr class="gmpMmlSlideTableRow"
				data-marker-id="<?php echo $marker['id']?>"
				data-map-id="<?php echo $this->map['id']?>"
				data-map-view-id="<?php echo $this->map['view_id']?>"
				>
				<?php //if($showTitle) {?>
					<td class="gmpMmlSlideTitle" style="background-color: <?php echo $bg_color?>;">
						<a class="gmpMmlSlideTitleLink"
						   href="#gmpMapDetailsContainer_<?php echo $this->map['view_id']?>"
						   data-slider-type="table"
						   onclick="gmpMmlGoToSlideSimpleSliderClk(this); return false;"
						>
							<?php echo $marker['title']?>
						</a>
					</td>
				<?php //}?>
				<td class="gmpMmlSlideAddress"><?php echo $marker['address']?></td>
				<td class="gmpMmlSlideDescription">
					<?php /*if($showImg) { ?>
						<div class="gmpMmlSlideImg">
							<?php echo $marker['raw_img']?>
						</div>
					<?php }*/?>
					<?php //if($showDesc) {?>
						<?php echo $marker['description']?>
					<?php //}?>
				</td>
				<?php if($this->map['params']['enable_directions_btn']){?>
					<td class="gmpMmlGetDirections"></td>
				<?php }?>
			</tr>
		<?php }?>
	<?php }?>
</table>
