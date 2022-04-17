<section class="supsystic-bar">
	<h4>
		<?php if($this->isActive) {
			printf('<div class="updated notice supsystic-admin-notice">
			<p>Congratulations! PRO version of "%s" plugin has been activated and is working fine.</p>
			</div>', GMP_WP_PLUGIN_NAME);
		} elseif($this->isExpired) {
			printf('<div class="updated notice supsystic-admin-notice">
			<p>Your license for PRO version of "%s" plugin has (expired/suspended/deactivated/not activated).</p>
			<p>It means that your PRO version and PRO features will not work - according to Supsystic\'s <a href="%s" style="text-decoration:none;">Terms and Conditions</a>.</p>
			<p>Just activate the current license or <a href="%s" style="text-decoration:none;" target="_blank" title="After purchasing the key, enter your email and key in the appropriate fields on this page."><span class="dashicons dashicons-warning"></span> BUY NEW license</a> just for $46/year or <a href="%s" style="text-decoration:none;" target="_blank" title="In this case fields \'email\' and \'license key\' must be allready filled and \'Activated\'"><span class="dashicons dashicons-warning"></span> EXTEND your old license</a> just for $36/year, then click on "Activate".</p>
			</div>', GMP_WP_PLUGIN_NAME, 'https://supsystic.com/terms-and-conditions/', 'https://supsystic.com/plugins/google-maps-plugin/', $this->extendUrl);
		} else {
			printf(__('Congratulations! You have successfully installed PRO version of %s plugin. Final step to finish Your PRO version setup - is to enter your Email and License Key on this page. This will activate Your copy of software on this site.', GMP_LANG_CODE), GMP_WP_PLUGIN_NAME);
		}?>
	</h4>
	<div style="clear: both;"></div>
	<hr />
</section>
<section>
	<form id="gmpLicenseForm" class="">
		<div class="supsystic-item supsystic-panel">
			<table class="form-table" style="">
				<tr>
					<th scope="row" style="">
						<?php _e('Email', GMP_LANG_CODE)?>
					</th>
					<td style="width: 1px;">
						<i class="fa fa-question supsystic-tooltip" data-tooltip-content="#tooltip_01"></i>
						<span class="tooltipContent" id="tooltip_01">
								<?php echo esc_html(sprintf(__("Your email address, used on checkout procedure on <a href='%s' target='_blank'>%s</a>", GMP_LANG_CODE), 'https://supsystic.com/', 'https://supsystic.com/'))?>
						</span>
					</td>
					<td>
						<?php echo htmlGmp::text('email', array('value' => $this->credentials['email'], 'attrs' => 'style="width: 300px;"'))?>
					</td>
				</tr>
				<tr>
					<th scope="row" style="">
						<?php _e('License Key', GMP_LANG_CODE)?>
					</th>
					<td>
						<i class="fa fa-question supsystic-tooltip" data-tooltip-content="#tooltip_02"></i>
						<span class="tooltipContent" id="tooltip_02">
								<?php echo esc_html(sprintf(__("Your License Key from your account on <a href='%s' target='_blank'>%s</a>", GMP_LANG_CODE), 'https://supsystic.com/', 'https://supsystic.com/'))?>
						</span>
					</td>
					<td>
						<?php echo htmlGmp::text('key', array('value' => $this->credentials['key'], 'attrs' => 'style="width: 300px;"'))?>
					</td>
				</tr>
            <tr>
					<th scope="row" style="">
						<?php _e('Use activation gateway', GMP_LANG_CODE)?>
					</th>
					<td>
						<i class="fa fa-question supsystic-tooltip" data-tooltip-content="#tooltip_03"></i>
						<span class="tooltipContent" id="tooltip_03">
								<?php echo esc_html(sprintf(__('If you have problem with standard activation, you can try use gateway', GMP_LANG_CODE), 'https://supsystic.com/', 'https://supsystic.com/'))?>
						</span>
					</td>
					<td>
						<?php echo htmlGmp::checkbox('gateway', array('attrs' => 'style="width: 10px;"'))?>
					</td>
				</tr>
				<tr>
					<th scope="row" colspan="3" style="">
						<?php echo htmlGmp::hidden('mod', array('value' => 'license'))?>
						<?php echo htmlGmp::hidden('action', array('value' => 'activate'))?>
						<button class="button button-primary">
							<i class="fa fa-fw fa-save"></i>
							<?php if($this->isExpired) {
								_e('Activate', GMP_LANG_CODE);
							} else {
								_e('Activate', GMP_LANG_CODE);
							}?>
						</button>
					</th>
				</tr>
			</table>
			<div style="clear: both;"></div>

		</div>
	</form>
</section>
