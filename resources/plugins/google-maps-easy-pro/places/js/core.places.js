jQuery(document).bind('gmapAfterMapInit', function(event, map){
	var mapId = typeof g_gmpToolbarMapId != 'undefined' ? g_gmpToolbarMapId : 0;

	if(map.getId() == mapId) {
		var toolbar = jQuery('.gmpPlacesToolbar[data-mapid="' + map.getId() + '"]');

		if(toolbar.length) {
			toolbar.find('[name="places[address]"]').mapSearchAutocompleateGmp({
				msgEl: ''
			,	onSelect: function(item, event, ui) {
					if(item) {
						toolbar.find('[name="places[coord_x]"]').val(item.lat);
						toolbar.find('[name="places[coord_y]"]').val(item.lng);
					}
				}
			});
			toolbar.find('.gmpPlacesToolbarFindBtn').on('click', function() {
				gmpPlacesToolbarSearch(this);
			});
			toolbar.find('.gmpPlacesToolbarResetBtn').on('click', function() {
				gmpPlacesToolbarReset(this);
			});
		}
	}
});
jQuery(document).ready(function() {
	jQuery('.gmpPlacesToolbar').show();
});
function gmpPlacesToolbarReset(btn, toolbar, map){
	toolbar = toolbar ? toolbar : jQuery(btn).parents('.gmpPlacesToolbar:first');

	if(!map && typeof gmpGetMapById == 'function') {
		map = gmpGetMapById(toolbar.data('mapid'));
	}
	if(map) {
		map.clearMarkersByParam('_placesToolbarResult');
	}
	gmpGetPlacesBounds(true);
	toolbar.find('.gmpPlacesToolbarResetBtn').attr('disabled', true);
	toolbar.find('.gmpPlacesToolbarMoreBtn').attr('disabled', true);
	toolbar.find('.gmpPlacesToolbarErrors').hide();
}
function gmpPlacesToolbarSearch(btn){
	var toolbar = jQuery(btn).parents('.gmpPlacesToolbar:first')
	,	mapId = toolbar.data('mapid')
	,	map = typeof gmpGetMapById == 'function' ? gmpGetMapById(mapId) : false
	,	lat = toolbar.find('[name="places[coord_x]"]').val()
	,	lng = toolbar.find('[name="places[coord_y]"]').val()
	,	type = toolbar.find('[name="places[type]"]').val()
	,	radius = parseInt(toolbar.find('[name="places[radius]"]').val())
	,	moreBtn = toolbar.find('.gmpPlacesToolbarMoreBtn');

	gmpPlacesToolbarReset(btn, toolbar, map);

	if(map && lat && lng){
		var service = new google.maps.places.PlacesService(map.getRawMapInstance());

		service.nearbySearch(
			{
				location: new google.maps.LatLng(lat, lng)
			,	radius: radius
			,	type: [ type ]
			}
		,	function(results, status, pagination) {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					var bounds = gmpGetPlacesBounds();

					toolbar.find('.gmpPlacesToolbarResetBtn').attr('disabled', false);

					for (var i = 0; i < results.length; i++) {
						var description = toeLangGmp('Address') + ': ' + (results[i].formatted_address ? results[i].formatted_address : results[i].vicinity);

						if(results[i].international_phone_number) {
							description += '<br />' + toeLangGmp('Phone') + ': ' + results[i].international_phone_number;
						}
						if(results[i].opening_hours) {
							if(results[i].opening_hours.open_now) {
								description += '<br />' + toeLangGmp('Open Now') + ': ' + (results[i].opening_hours.open_now
									? toeLangGmp('Yes')
									: toeLangGmp('No'));
							}
							if(results[i].weekday_text) {
								description += '<br />' + toeLangGmp('Open Hours') + ': ' + results[i].weekday_text;
							}
						}
						if(results[i].rating) {
							description += '<br />' + toeLangGmp('Rating') + ': ' + results[i].rating;
						}
						if(results[i].website) {
							description += '<br />' + toeLangGmp('Website') + ': ' + results[i].website;
						}
						if(results[i].reviews) {
							description += '<br />' + toeLangGmp('Reviews:');
							for(var u = 0; u < results[i].reviews[u].length; u++) {
								if(results[i].reviews[u].author_name) {
									description += '<br />' + toeLangGmp('Author') + ': ' + results[i].reviews[u].author_name;
								}
								if(results[i].reviews[u].rating) {
									description += '<br />' + toeLangGmp('Total rating') + ': ' + results[i].reviews[u].rating;
								}
								if(results[i].reviews[u].aspects) {
									for(var z = 0; z < results[i].reviews[u].aspects.length; z++) {
										description += '<br />' + results[i].reviews[u].aspects.type + ': ' + results[i].reviews[u].aspects.rating;
									}
								}
								if(results[i].reviews[u].text) {
									description += '<br />' + results[i].reviews[u].text;
								}
							}
						}
						var marker = map.addMarker( {
							position: results[i].geometry.location
						,	title: results[i].name
						,	description: description
						,	_placesToolbarResult: true
						} );
						bounds.extend(marker.getPosition());
					}
					if(pagination.hasNextPage) {
						moreBtn.attr('disabled', false);
						moreBtn.off('click.gmp').on('click.gmp', function() {
							moreBtn.attr('disabled', true);
							pagination.nextPage();
						});
					}
					map.fitBounds(bounds);
				} else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
					toolbar.find('.gmpPlacesToolbarEmptyResult').show();
				}
			}
		);
	} else {
		toolbar.find('.gmpPlacesToolbarEmptyResult').show();
		return;
	}
}
function gmpGetPlacesBounds(reset){
	g_gmpPlacesBounds = reset ? new google.maps.LatLngBounds() : g_gmpPlacesBounds;
	return g_gmpPlacesBounds;
}
