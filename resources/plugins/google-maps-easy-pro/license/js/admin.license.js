jQuery(document).ready(function(){
	jQuery('#gmpLicenseForm').submit(function(){
		jQuery(this).sendFormGmp({
			btn: jQuery(this).find('button.button-primary')
		,	onSuccess: function(res) {
				if(!res.error) {
					toeReload();
				}
			}
		});
		return false;
	});
});
