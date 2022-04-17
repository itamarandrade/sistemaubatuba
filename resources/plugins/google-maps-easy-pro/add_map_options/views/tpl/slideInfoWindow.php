<?php
$id = !empty($this->map['id']) ? $this->map['id'] : '';
$viewId = !empty($this->map['params']['view_id']) ? $this->map['params']['view_id'] : '';
//$controls_bg_color = !empty($this->map['params']['custom_controls_bg_color']) ? $this->map['params']['custom_controls_bg_color'] : '#55BA68';
$controlsTxtColor = !empty($this->map['params']['custom_controls_txt_color']) ? $this->map['params']['custom_controls_txt_color'] : '#000000';
$infoWindowStyle = 'color: ' . $controlsTxtColor . ';';
$titleColor = !empty($this->map['params']['marker_title_color']) ? $this->map['params']['marker_title_color'] : '#000000';
$bgColor = !empty($this->map['params']['marker_infownd_bg_color']) ? $this->map['params']['marker_infownd_bg_color'] : '#FFFFFF';
$titleFont = !empty($this->map['params']['marker_title_size']) ? $this->map['params']['marker_title_size'] : 19;
$descFont = !empty($this->map['params']['marker_desc_size']) ? $this->map['params']['marker_desc_size'] : 13;
$lineHeight = ($titleFont + 5);
$titleStyle = 'background-color: '.$bgColor.'; color: '.$titleColor.'; font-size: '.$titleFont.'px; line-height: '.$lineHeight.'px; padding-left: '.($lineHeight + 20).'px;';
$descStyle = 'font-size: '.$descFont.'px; line-height: '.($descFont + 2).'px;';
$closeImgStyle = 'width: '.$lineHeight.'px; height: '.$lineHeight.'px;';
?>
<div id="gmpSlideInfoWindow_<?php echo $viewId?>" class="gmpSlideInfoWindowContainer" style="width:0px;" data-is-mobile="<?php echo $this->isMobile?>">
	<div class="gmpSlideInfoWindow" style="display: none;<?php echo $infoWindowStyle; ?>">
		<div class="gmpSlideInfoWindowBlock">
			<button draggable="false" title="Close" aria-label="Close" type="button" class="gmpSlideInfoWindowClose">
				<img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224px%22%20height%3D%2224px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23000000%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%0A%3C%2Fsvg%3E%0A" style="pointer-events: none; display: block; margin: 10px;<?php echo $closeImgStyle; ?>">
			</button>
			<div class="gmpSlideInfoWindowTitle" style="<?php echo $titleStyle;?>"></div>
			<div class="gmpSlideInfoWindowDesc" style="<?php echo $descStyle?>"></div>
		</div>
	</div>
</div>