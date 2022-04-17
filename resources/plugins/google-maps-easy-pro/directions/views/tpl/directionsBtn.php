<?php $btnName = __('Get Direction', GMP_LANG_CODE)?>
<div
	class="gmpDirectionsBtn gmpNoPrint"
	title="<?php echo $btnName?>"
	data-mapid="<?php echo $this->map['id']?>"
	data-viewid="<?php echo $this->map['params']['view_id']?>"
	data-marker-id=""
	style="display: none;"
	id="gmpDirectionsBtn_<?php echo $this->map['params']['view_id']?>"
	onclick="gmpShowDirectionsForm(this, event)"
>
	<i class="fa fa-map-signs"></i>
	<?php echo $btnName?>
</div>
<div
	class="gmpDirectionsForm"
	style="display: none;"
	id="gmpDirectionsForm_<?php echo $this->map['params']['view_id']?>"
>
	<div style="display: inline; margin: 5px 5px 5px 0px;">
		<?php echo htmlGmp::text('directions[address]', array(
			'value' => '',
			'placeholder' => __('Type the address...', GMP_LANG_CODE),
			'attrs' => ''
		))?>
		<?php echo htmlGmp::hidden('directions[coord_x]', array(
			'value' => '',
		))?>
		<?php echo htmlGmp::hidden('directions[coord_y]', array(
			'value' => '',
		))?>
		<span style="margin: 5px;"><?php _e('or', GMP_LANG_CODE)?></span>
		<button
			id="gmpCurrentPositionBtn_<?php echo $this->map['params']['view_id']?>"
			title="<?php _e('Get current user location', GMP_LANG_CODE)?>"
			data-mapid="<?php echo $this->map['id']?>"
			data-viewid="<?php echo $this->map['params']['view_id']?>"
			onclick="gmpGetCurrentUserPosition(this); return false;"
		>
		<i class="fa fa-arrows"></i>
		</button>
	</div>
	<button
		id="gmpGoBtn_<?php echo $this->map['params']['view_id']?>"
		title="<?php _e('Go', GMP_LANG_CODE)?>"
		data-mapid="<?php echo $this->map['id']?>"
		data-viewid="<?php echo $this->map['params']['view_id']?>"
		onclick="gmpGetDirection(this); return false;"
	>
		<i class="fa fa-binoculars"></i>
	</button>
	<div
		id="gmpExitBtn_<?php echo $this->map['params']['view_id']?>"
		class="gmpExitBtn"
		data-mapid="<?php echo $this->map['id']?>"
		data-viewid="<?php echo $this->map['params']['view_id']?>"
		onclick="gmpHideDirectionsForm(this); return false;"
		>
		<i class="fa fa-times"></i>
	</div>
	<div
		class="gmpDirectionsErrors"
		id="gmpDirectionsErrorGeolocationFailed_<?php echo $this->map['params']['view_id']?>"
	>
		<?php _e('The Geolocation service failed.', GMP_LANG_CODE)?>
	</div>
	<div
		class="gmpDirectionsErrors"
		id="gmpDirectionsErrorGeolocationUnsupported_<?php echo $this->map['params']['view_id']?>"
	>
		<?php _e('Your browser does not support geolocation.', GMP_LANG_CODE)?>
	</div>
	<div
		class="gmpDirectionsErrors"
		id="gmpDirectionsErrorZeroResults_<?php echo $this->map['params']['view_id']?>"
	>
		<?php _e('Route could not be found. Please, try to select another address!', GMP_LANG_CODE)?>
	</div>
	<div
		class="gmpDirectionsErrors"
		id="gmpDirectionsErrorNoAddress_<?php echo $this->map['params']['view_id']?>"
	>
		<?php _e('Please, select address from search list!', GMP_LANG_CODE)?>
	</div>
</div>