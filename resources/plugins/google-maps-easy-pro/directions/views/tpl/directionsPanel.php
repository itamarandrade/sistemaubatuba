<?php $viewId = $this->map['params']['view_id']; ?>
<div id="gmpDirectionsPanelShell_<?php echo $viewId;?>" class="gmpDirectionsPanelShell" style="display: none;">
	<div class="directionsPanelHeader">
		<?php _e('List of Direction\'s Steps will be here...', GMP_LANG_CODE)?>
	</div>
	<div id="gmpDirectionsPanel_<?php echo $viewId;?>" class="gmpDirectionsPanel"></div>
</div>