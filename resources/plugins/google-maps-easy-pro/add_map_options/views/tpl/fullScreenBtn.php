<div
	class="gmpFullScreenBtn"
	data-disabletxt="<?php _e('Exit Full Screen', GMP_LANG_CODE)?>"
	data-enabletxt="<?php _e('Open Full Screen', GMP_LANG_CODE)?>"
	data-mapid="<?php echo $this->map['id']?>"
	data-viewid="<?php echo $this->map['params']['view_id']?>"
	style="display: none;"
	id="gmpFullScreenBtn_<?php echo $this->map['params']['view_id']?>"
	onclick="gmpSwitchFullscreenBtn(this); return false;"
>
	<?php _e('Open Full Screen', GMP_LANG_CODE)?>
</div>