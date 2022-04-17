<?php
$wp_editor_name = 'markerDescripton';
$wp_editor_id = $wp_editor_name . '_' . $this->formViewId;
$wp_editor_content = '';
$wp_editor_settings = array(
	'wpautop' => true,
	'media_buttons' => true,
	'textarea_name' => $wp_editor_name,
	'textarea_rows' => 7,
	'tabindex' => '',
	'editor_css' => '',
	'editor_class' => '',
	'teeny' => false,
	'dfw' => false,
	'tinymce' => true,
	'quicktags' => true
);
$user_id = get_current_user_id();
?>
<div id="gmpFrontendNoMapMsg_<?php echo $this->formViewId; ?>" class="gmpFrontendMarkerFormMsg" style="display: none;"><?php _e('You need to use marker form on page with map', GMP_LANG_CODE); ?></div>
<form id="gmpFrontendMarkerAddForm_<?php echo $this->formViewId; ?>" class="gmpFrontendMarkerAddForm gmpFrontendMarkerForm supMd12 supXs12" data-form_view_id="<?php echo $this->formViewId; ?>" style="display: none;">
	<div class="gmpFrontendMarkerFormRow gmpFrontendMarkerFormTitle supMd12 supXs12">
		<h3><?php echo $this->formParams['form_name']?></h3>
		<p><?php _e('Use this form to add markers to your map', GMP_LANG_CODE)?></p>
	</div>
	<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
		<h3><?php echo $this->formParams['marker_name']?></h3>
		<input type="text" name="marker_opts[title]"  value=""/>
	</div>
	<?php if($this->markerGroupsForSelect) {?>
		<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
			<h3><?php echo $this->formParams['marker_cat']?></h3>
			<?php echo htmlGmp::selectlist('marker_opts[marker_group_id]', array(
				'options' => $this->markerGroupsForSelect,
				'value' => '',
				'attrs' => 'style="width: 100%;"'))?>
		</div>
	<?php }?>
	<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
		<h3><?php echo $this->formParams['marker_adr']?></h3>
		<input type="text" id="gmpMarkerAddress_<?php echo $this->formViewId; ?>" name="marker_opts[address]" placeholder="603 Park Avenue, Brooklyn, NY 11206, USA" value="" />
		<input type="hidden" name="marker_opts[coord_x]" value="40.69827799999999"/>
		<input type="hidden" name="marker_opts[coord_y]" value="-73.95141139999998"/>
	</div>
	<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
		<a href="#" id="gmpAddNewMarkerBtn" class="button"><?php _e('Add by Click', GMP_LANG_CODE)?></a>
	</div>
	<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
		<h3><?php echo $this->formParams['marker_desc']?></h3>
		<?php if($this->useWPEditor) {
			wp_editor($wp_editor_content, $wp_editor_id, $wp_editor_settings);
		} else {?>
			<textarea id="<?php echo $wp_editor_id; ?>" name="<?php echo $wp_editor_name; ?>"></textarea>
		<?php }?>
		<input type="hidden" name="marker_opts[description]" value="">
	</div>
	<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
		<a class="gmpFrontendMarkerIconBtn button" href="#"><?php _e('Choose Icon', GMP_LANG_CODE)?></a>
		<img class="gmpFrontendMarkerIconImg" src="<?php echo $this->markerIcons[1]['path']; ?>" alt="Icon Image" />
		<input type="hidden" name="marker_opts[icon]" value="<?php echo $this->markerIcons[1]['id']; ?>" />
	</div>
	<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
		<button type="submit" class="button">
			<i class="fa fa-save" aria-hidden="true"></i>
			<?php _e('Salvar Projeto', GMP_LANG_CODE)?></button>
		<div id="gmpFrontendMarkerAddFormMsg_<?php echo $this->formViewId; ?>" class="gmpFrontendMarkerFormMsg"></div>
		<div style="clear: both;"></div>
	</div>
	<input type="hidden" name="marker_opts[map_id]" value="<?php echo $this->mapId; ?>">
	<input type="hidden" name="marker_opts[user_id]" value="<?php echo $user_id; ?>">
	<input type="hidden" name="mod" value="frontend_actions">
	<input type="hidden" name="action" value="saveMarkerForm">
</form>
<?php if(!$this->_addIconsWnd) {?>
	<div id="gmpFrontendMarkerIconsWnd" style="display: none;">
		<ul class="gmpFrontendMarkerIconsList">
			<?php foreach($this->markerIcons as $icon) { ?>
				<li class="gmpFrontendMarkerPreviewIcon" data-id="<?php echo $icon['id']?>" title="<?php echo $icon['title']?>">
					<img src="<?php echo $icon['path']?>" alt="Preview Icon" />
				</li>
			<?php }?>
		</ul>
	</div>
	<?php $this->_addIconsWnd = true; ?>
<?php }?>
<?php if($this->userMarkers) {?>
	<form id="gmpFrontendMarkerDeleteForm_<?php echo $this->formViewId; ?>" class="gmpFrontendMarkerDeleteForm gmpFrontendMarkerForm supMd12 supXs12" data-form_view_id="<?php echo $this->formViewId; ?>" style="display: none;">
		<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
			<select name="marker_id">
				<option value=""><?php _e('Escolha o Projeto', GMP_LANG_CODE); ?></option>
				<?php for($i = 0; $i < count($this->userMarkers); $i++) {?>
					<option value="<?php echo $this->userMarkers[$i]['id']; ?>"><?php echo $this->userMarkers[$i]['title']; ?></option>
				<?php }?>
			</select>
		</div>
		<div class="gmpFrontendMarkerFormRow supMd12 supXs12">
			<button type="submit" class="button">
				<i class="fa fa-trash" aria-hidden="true"></i>
				<?php _e('Excluir Projeto', GMP_LANG_CODE)?></button>
			<div id="gmpFrontendMarkerDeleteFormMsg_<?php echo $this->formViewId; ?>" class="gmpFrontendMarkerFormMsg"></div>
			<div id="gmpFrontendNoMarkerMsg_<?php echo $this->formViewId; ?>" class="gmpFrontendMarkerFormMsg" style="display: none;"><?php _e('You need to choose the marker', GMP_LANG_CODE); ?></div>
			<div style="clear: both;"></div>
		</div>
		<input type="hidden" name="map_id" value="<?php echo $this->mapId; ?>">
		<input type="hidden" name="user_id" value="<?php echo $user_id; ?>">
		<input type="hidden" name="mod" value="frontend_actions">
		<input type="hidden" name="action" value="deleteMarkerOnFrontend">
	</form>
<?php }?>
