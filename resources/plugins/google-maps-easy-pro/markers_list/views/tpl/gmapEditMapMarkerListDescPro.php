								<tr>
									<th scope="row">
										<label for="marker_opts_marker_list_desc">
											<?php _e('Marker List Description', GMP_LANG_CODE)?>:
										</label>
										<i style="float: right;" class="fa fa-question supsystic-tooltip" title="<?php _e('Description for Marker List. If not set, marker description will be used.', GMP_LANG_CODE)?>"></i>
									</th>
									<td>
										<?php echo htmlGmp::checkbox('marker_opts[params][marker_list_desc]', array(
											'checked' => ''))?>
									</td>
								</tr>
								<tr style="display: none;" id="gmpMarkerListDesc">
									<th colspan="2">
										<?php wp_editor('', 'markerDescriptionList', array(
											'textarea_rows' => 10,
											'media_buttons' => 0
										));?>
										<?php echo htmlGmp::hidden('marker_opts[params][marker_list_desc_text]', array('value' => ''))?>
									</th>
								</tr>