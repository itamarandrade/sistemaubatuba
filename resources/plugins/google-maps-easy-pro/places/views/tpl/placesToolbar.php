<?php
$slider_min = isset($this->map['params']['places']['slider_min'])
&& is_numeric($this->map['params']['places']['slider_min'])
&& (int)$this->map['params']['places']['slider_min']
	? $this->map['params']['places']['slider_min'] : '100';
$slider_max = isset($this->map['params']['places']['slider_max'])
&& is_numeric($this->map['params']['places']['slider_max'])
&& (int)$this->map['params']['places']['slider_max']
	? $this->map['params']['places']['slider_max'] : '1000';
$slider_step = isset($this->map['params']['places']['slider_step'])
&& is_numeric($this->map['params']['places']['slider_step'])
&& (int)$this->map['params']['places']['slider_step']
	? $this->map['params']['places']['slider_step'] : '10';
?>
<div class="gmpPlacesToolbar" data-mapid="<?php echo $this->map['id']?>" style="display: none;">
	<div class="gmpRow">
		<div class="gmpsupMd4">
			<?php echo htmlGmp::selectbox('places[type]', array(
				'options' => $this->placesList,
				'size'=> 1,
			)) ?>
		</div>
		<div class="gmpsupMd8">
			<?php echo htmlGmp::text('places[address]', array(
				'value' => '',
				'placeholder' => __('Type address...', GMP_LANG_CODE),
			)) ?>
			<?php echo htmlGmp::hidden('places[coord_x]', array('value' => '',)) ?>
			<?php echo htmlGmp::hidden('places[coord_y]', array('value' => '',)) ?>
		</div>
		<div class="gmpsupMd12" style="padding-bottom: 20px;">
			<div class="gmpPlacesRadiusMin"><?php echo $slider_min?></div>
			<div class="gmpPlacesRadiusMax"><?php echo $slider_max?></div>
			<?php echo htmlGmp::slider('places[radius]', array(
				'value'		=> $slider_min,
				'min' 		=> $slider_min,
				'max' 		=> $slider_max,
				'step' 		=> $slider_step,
				'attrs' 	=> 'id="gmpPlacesRadius_' . $this->map['view_id'] . '"',
			))?>
		</div>
	</div>
	<div class="gmpRow">
		<div class="gmpsupMd4">
			<?php
			echo htmlGmp::button(array(
				'value' => __('Find', GMP_LANG_CODE),
				'attrs' => 'class="gmpPlacesToolbarFindBtn"'
			)) ?>
		</div>
		<div class="gmpsupMd4">
			<?php
			echo htmlGmp::button(array(
				'value' => __('More results', GMP_LANG_CODE),
				'attrs' => 'class="gmpPlacesToolbarMoreBtn" disabled="disabled"'
			)) ?>
		</div>
		<div class="gmpsupMd4">
			<?php
			echo htmlGmp::button(array(
				'value' => __('Reset', GMP_LANG_CODE),
				'attrs' => 'class="gmpPlacesToolbarResetBtn" disabled="disabled"'
			)) ?>
		</div>
		<div class="gmpPlacesToolbarErrors gmpPlacesToolbarEmptyResult" style="display: none;"><?php _e('No Places was found by your request', GMP_LANG_CODE); ?></div>
	</div>
</div>