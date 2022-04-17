jQuery(document).ready(function(){
	jQuery(document).on('click', '.supsystic-pro-notice.gmp-notification .notice-dismiss', function(){
		jQuery.sendFormGmp({
			msgElID: 'noMessages'
		,	data: {mod: 'license', action: 'dismissNotice'}
		});
	});
});