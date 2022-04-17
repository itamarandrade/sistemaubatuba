<?php
$id = $this->map['params']['id'];
$viewId = $this->map['params']['view_id'];
?>
<div id="gmpKmlFilterShell_<?php echo $viewId;?>" class="gmpKmlFilterShell" data-map-id="<?php echo $id; ?>" data-map-viewid="<?php echo $viewId; ?>" style="display: none;">
	<div class="gmpKmlFilterTitle"><?php _e('KML Layers Filter', GMP_LANG_CODE)?></div>
	<?php /*<div id="gmpKmlFilterRowExample" class="gmpKmlFilterRow" data-type="" data-id="" style="display: none;">
		<label class="gmpRowLabel">
			<?php echo htmlGmp::checkboxHiddenVal('layer', array(
				'value' => '1',
				'attrs' => ''))?>
			<span class="gmpRowName"></span>
		</label>
	</div>*/ ?>
	<div class="gmpKmlLoading">
		<?php _e('KML data loading'); ?>
		<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
	</div>
	<div class="gmpKmlFilterRowsShell" style="display: none;"></div>
</div>