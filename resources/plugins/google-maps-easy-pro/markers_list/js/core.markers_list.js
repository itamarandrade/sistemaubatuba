var gmpRebuildListHtmlTimeout = null;
jQuery(document).bind('gmapAfterMapInit', function(event, map) {
	var viewId = map.getViewId();
	if(window.gmpGetMembershipGmeViewId) {
		viewId = gmpGetMembershipGmeViewId(map, viewId);
	}
	jQuery('#gmpMmlSimpleSlider_' + viewId).show();
});
jQuery(document).bind('gmapAfterMarkersRefresh', function(event, map){
	gmpBuildListHtml(map);
	var $sliderContent = jQuery('#' + map.getParam('simple_slider_id'))
	,	sliderType = $sliderContent.data('slider-type')
	,	slideClass = ''
	,	markerIdToShow = gmpIsMarkerToShow()
	,	mapMarkers = map.getAllMarkers()
	,	mapMarkersIds = []
	,	removeGroup = false
	,	rebuild = false;

	for(var i = 0; i < mapMarkers.length; i++) {
		mapMarkersIds.push(parseInt(mapMarkers[i].getId()));
	}
	markerIdToShow = markerIdToShow && toeInArray(markerIdToShow, mapMarkersIds) == -1 ? false : markerIdToShow;

	if(markerIdToShow) {
		switch(sliderType) {
			case 'jssor':
				slideClass = '.gmpMnlJssorSlide';
				rebuild = true;
				break;
			case 'table':
				slideClass = '.gmpMmlSlideTableRow';
				removeGroup = true;
				break;
			default:
				break;
		}
		if(rebuild) {
			$sliderContent.html(map.getParam('original_slider_html'));	// Reset current slider to it's original html
		}
		$sliderContent.find(slideClass).each(function () {	// Remove unused in search html slides/rows
			if(jQuery(this).data('marker-id') != markerIdToShow)
				jQuery(this).remove();
		});
		if(removeGroup) {
			$sliderContent.find('.gmpMmlSlidesTableScroll').each(function () {	// Remove unused in search html slides/rows
				if(!jQuery(this).find(slideClass).length) {
					jQuery(this).prev().remove();
				}
			});
		}
		if(rebuild) {
			gmpBuildListHtml(map);	// Build slider one more time with required number of slides
		}
	}
});
jQuery(document).bind('gmapAfterMarkerClick', function(event, marker) {
	gmpMmlScrollTo( marker );
});
jQuery(window).on('resize', function() {
	//we will try not rebilding list on resize. #302
	gmpRebuildListHtml(gmpGetAllMaps());
});
jQuery(window).on('orientationchange', function() {
	gmpRebuildListHtml(gmpGetAllMaps());
});

function gmpBuildListHtml(map) {
	var markers = map.getAllMarkers();

	if(markers && markers.length) {
		var markerListParams = map.getParam('marker_list_params');

		if(!markerListParams) return;

		var viewHtmlMbsId = map.getParam('view_html_mbs_id')
		,	membershipIntegration = viewHtmlMbsId && window.gmpGetMembershipGmeViewId	// check for membership integration
		,	viewId = membershipIntegration ? gmpGetMembershipGmeViewId(map, viewId) : map.getViewId()
		,	viewHtmlId = membershipIntegration ? viewHtmlMbsId : map.getViewHtmlId()
		,	listShellId = 'gmpMmlSimpleSlider_'+ viewId
		,	sliderInitialize = map.getParam('original_slider_html')
		,	sliderContainer = jQuery('#'+ listShellId);

		switch(markerListParams.eng) {
			case 'jssor':
				var collapseShellCon = jQuery('.gmpMarkersListCollapseShell')
				,	parentShell = membershipIntegration ? jQuery(viewHtmlId) : jQuery('#'+ viewHtmlId)	// membership integration
				,	collapseOpt = map.getParam('markers_list_collapse')
				,	needCollapse = collapseOpt && parseInt(collapseOpt.mobile) && collapseShellCon.length
				,	collapseTitle = sliderContainer.parents('.gmpMarkersListCollapseShell:first').find('.gmpMarkersListCollapseTitle')
				,	viewportData = map.getViewportData(collapseTitle.outerHeight())
				,	rebuildOrParams = {
						collapseHeight: viewportData.height
					,	slideWidth: markerListParams.slide_width
					,	slideHeight: markerListParams.slide_height
					,	listShellId: listShellId
					,	viewId: viewId
					,	parentWidth: parentShell.width()
					,	parentHeight: parentShell.height()
					,	slideSpacing: 10
					,	position: markerListParams.or
					}
				,	orientation = markerListParams.or
				,	listSteps = 1
				,	sliderOpts;

				if(needCollapse) {
					orientation = 'v';
					rebuildOrParams.position = 'h';
					rebuildOrParams.slideWidth = rebuildOrParams.parentWidth;
					if(typeof map._visibleMarkersCount != 'undefined') {
						jQuery('#mapConElem_'+ map.getViewId()+ ' .gmpMarkersListMarkersCount').html(map._visibleMarkersCount);
					}
				} else if(!markerListParams.two_cols
					&& (jQuery(window).width() < 992
					|| ((jQuery('#mapConElem_'+ viewId).width() - rebuildOrParams.slideWidth) < rebuildOrParams.slideWidth))
				) {
					orientation = 'h';
				}
				if(!sliderInitialize) {
					map.setParam('original_slider_html', sliderContainer.html());
					map.setParam('simple_slider_id', listShellId);
				}
				if(needCollapse && !collapseShellCon.data('accordion-init') && typeof jQuery.fn.accordion == 'function') {
					collapseShellCon.accordion({
						collapsible: true,
						active: false,
						heightStyle: 'content',
						activate: function(event, ui) {
							var container = jQuery('#mapConElem_'+ viewId)
							,	scrollTo = container.find('.gmpMarkersListCollapseTitle');
							container.animate({
								scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
							});
						}
					});
					collapseShellCon.data('accordion-init', 1);
				}
				if(orientation == 'v') {
					_gmpRebuildVerticalOrientation(map, rebuildOrParams);
					if(needCollapse) {
						listSteps = (rebuildOrParams.slideHeight * 3) > rebuildOrParams.collapseHeight ? 2 : 3;
					} else {
						listSteps = rebuildOrParams.parentHeight / rebuildOrParams.slideHeight;
						listSteps = listSteps%2 >= 0.5 ? Math.ceil(listSteps) : Math.floor(listSteps);
					}
					rebuildOrParams.slideHeight = needCollapse
						? ((rebuildOrParams.collapseHeight / listSteps) - rebuildOrParams.slideSpacing)
						: ((rebuildOrParams.parentHeight / listSteps) - 8);	// 8 - experimental constant
				} else {
					_gmpRebuildHorizontalOrientation(map, rebuildOrParams);
					if(sliderContainer.width()) {
						var item = toeInArray('desc', markerListParams.d) != -1 ? 400 : rebuildOrParams.slideWidth,	// 400 - width where 3 text slides will be look bad
						sliderContainerWidth = sliderContainer.width();
						listSteps = Math.ceil(sliderContainerWidth / item);
						listSteps = listSteps == 1 ? 2 : listSteps;
						rebuildOrParams.slideWidth = sliderContainerWidth / listSteps - (rebuildOrParams.slideSpacing * (listSteps - 1) / listSteps) - 0.5; // -0.5 for shadow space
					} else {
						listSteps = Math.floor( rebuildOrParams.parentWidth / rebuildOrParams.slideWidth );
					}
				}
				markerListParams.autoplay = map.getParam('markers_list_autoplay') || {
					enable: 0,
					steps: 1,
					idle: 3000,
					duration: 160
				};
				markerListParams.autoplay.enable = parseInt(markerListParams.autoplay.enable);
				markerListParams.loop = map.getParam('markers_list_loop') ? parseInt(map.getParam('markers_list_loop')) : 0;
				// Collect slider options
				sliderOpts = {
						$AutoPlay: markerListParams.autoplay.enable,						//[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
						$AutoPlaySteps:	markerListParams.autoplay.steps,					//[Optional] Steps to go for each auto play request. Possible value can be 1, 2, -1, -2 ...
						$Idle: markerListParams.autoplay.idle,								//[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing
						$SlideDuration: markerListParams.autoplay.duration,                 //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500

						$Loop: markerListParams.loop,										//[Optional] Enable loop(circular) of carousel or not 0: stop, 1: loop, 2: rewind
						$ArrowKeyNavigation: true,   			          					//[Optional] Allows keyboard (arrow key) navigation or not, default value is false
						$MinDragOffsetToSlide: 20,                        					//[Optional] Minimum drag offset to trigger slide , default value is 20
						$SlideWidth: rebuildOrParams.slideWidth,                          	//[Optional] Width of every slide in pixels, default value is width of 'slides' container
						$SlideHeight: rebuildOrParams.slideHeight,                        	//[Optional] Height of every slide in pixels, default value is height of 'slides' container
						$SlideSpacing: rebuildOrParams.slideSpacing, 					  	//[Optional] Space between each slide in pixels, default value is 0
						$DisplayPieces: listSteps,                        	//[Optional] Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
						$ParkingPosition: 0,                             	//[Optional] The offset position to park slide (this options applys only when slideshow disabled), default value is 0.
						$UISearchMode: 1,                                   //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
						$PlayOrientation: orientation == 'v' ? 2 : 1, 		//[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, 5 horizental reverse, 6 vertical reverse, default value is 1
						$DragOrientation: orientation == 'v' ? 2 : 1, 		//[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
						$HWA: false, 										//[Optional] Hardware Acceleration - adds transform styles for slider elements. Set to false, because affects the quality of pictures in the slide.

						$BulletNavigatorOptions: {                          //[Optional] Options to specify and enable navigator or not
							$Class: $JssorBulletNavigator$,                 //[Required] Class to create navigator instance
							$ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
							$AutoCenter: 0,                                 //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
							$Steps: listSteps,                              //[Optional] Steps to go for each navigation request, default value is 1
							$Lanes: 1,                                      //[Optional] Specify lanes to arrange items, default value is 1
							$SpacingX: 0,                                   //[Optional] Horizontal space between each item in pixel, default value is 0
							$SpacingY: 0,                                   //[Optional] Vertical space between each item in pixel, default value is 0
							$Orientation: orientation == 'v' ? 2 : 1        //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
						},

						$ArrowNavigatorOptions: {
							$Class: $JssorArrowNavigator$,              	//[Requried] Class to create arrow navigator instance
							$ChanceToShow: 1,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
							$AutoCenter: orientation == 'v' ? 1 : 2,        //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
							$Steps: listSteps                               //[Optional] Steps to go for each navigation request, default value is 1
						}
					};

				if(sliderContainer.find('.gmpMnlJssorSlide').length) {
					sliderContainer.show();
					map.setParam('simple_slider', new $JssorSlider$(listShellId, sliderOpts));
				} else {
					sliderContainer.hide();
				}
				// Additional width improvements - maybe this was wrong...
				/*if(orientation == 'v') {
					sliderContainer.width( rebuildOrParams.slideWidth ).children('div:first').width( rebuildOrParams.slideWidth );
				} else {
					sliderContainer.width( rebuildOrParams.parentWidth ).children('div:first').width( rebuildOrParams.parentWidth );
				}
				if(markerListParams.two_cols) {
					sliderContainer.find('.gmpMnlJssorSlides .gmpStartRowSlide.gmpEndRowSlide').css({ width: 'calc(100% - 12px)', 'padding-left': 0 });
				}*/
				break;
			case 'table':
				if(!sliderInitialize) {
					map.setParam('original_slider_html', sliderContainer.html());
					map.setParam('simple_slider_id', listShellId);
				}
				map.setParam('simple_slider', 'simple_slider_table');
				break;
			default:
				break;
		}
		if(needCollapse) {
			map.resizeMapByHeight(null, jQuery('#mapConElem_'+ viewId+ ' .gmpMapProControlsCon'));
		} else if(orientation == 'h') {
			map.resizeMapByHeight(null, sliderContainer);
		}
		map.initSlideInfoWindow();
	}
}
function gmpRebuildListHtml(maps) {
	if(gmpRebuildListHtmlTimeout) {
		clearTimeout(gmpRebuildListHtmlTimeout);
	}
	gmpRebuildListHtmlTimeout = setTimeout(function() {
		for(var i = 0; i < maps.length; i++) {
			if(maps[i].getParam('markers_list_type').length) {
				var $sliderContent = jQuery('#' + maps[i].getParam('simple_slider_id'))
				,	$findBtn = $sliderContent.closest('.gmp_map_opts').find('.gmpImproveSearchFindBtn');

				$sliderContent.html(maps[i].getParam('original_slider_html'));

				if($findBtn.length && window.gmpCustomControlsPro && window.gmpCustomControlsPro.isSearched == true) {
					$findBtn.trigger('click');
				} else {
					gmpBuildListHtml(maps[i]);
				}
				if(parseInt(maps[i].getParam('enable_directions_btn'))) {
					gmpAddDirectionsBtnToMarkersList(maps[i]);
				}
			}
		}
		gmpRebuildListHtmlTimeout = null;
	}, 200);
}
function gmpMmlGoToSlideSimpleSliderClk(clkBtn) {
	var btn = jQuery(clkBtn)
	,	mapViewId = btn.closest('.gmp_map_opts').data('view-id')
	,	map = gmpGetMapByViewId(mapViewId)
	,	slide;

	if(map) {
		switch(btn.data('slider-type')) {
			case 'jssor':
				slide = jQuery(btn.parents('.gmpMnlJssorSlide:first'));
				break;
			case 'table':
				slide = jQuery(btn.parents('.gmpMmlSlideTableRow:first'));
				break;
			default:
				break;
		}
		var markerId = map.getParam('membershipEnable') == 1 ? slide.data('marker-id') : parseInt(slide.data('marker-id'))
		,	marker = map.getMarkerById( markerId)
		,	elemToScroll = jQuery(btn.attr('href'));

		if(marker) {
			marker._infoWndOpened = false;
			marker._withMarkerListOpen = true;
			marker.showInfoWnd();
		}
		if (elemToScroll.length) {
			jQuery('html, body').animate({scrollTop: elemToScroll.offset().top - 40}, 500);
		}
		return false;
	}
}
function gmpMmlOpenMarkerGroupContainer(elem) {
	var tableElem = jQuery(elem)
	,	viewId = tableElem.data('map-view-id')
	,	sliderShell = jQuery('#gmpMmlSimpleSlider_' + viewId)
	,	tableDiv = tableElem.next('.gmpMarkerGroupWrapper');

	if(tableDiv.hasClass('active')) {
		tableDiv.removeClass('active').slideUp();
	} else {
		tableDiv.find('.gmpMarkerGroupWrapper').removeClass('active').slideUp();
		tableDiv.addClass('active').slideDown();
	}
}
function gmpMmlScrollTo(marker) {
	var map = marker.getMap();
	if(map) {
		var simpleSlider = map.getParam('simple_slider')
		,	simpleSliderId = map.getParam('simple_slider_id')
		,	markerId = marker.getId();
		if(simpleSlider && simpleSliderId) {
			var slideIndex = jQuery('#'+ simpleSliderId).find('.gmpMnlJssorSlide[data-marker-id="'+ markerId+ '"]').index() - 1;
			if(!isNaN(slideIndex)) {
				simpleSlider.$PlayTo( slideIndex );
			}
		}
	}
}
function _gmpRebuildVerticalOrientation(map, params) {
	var viewHtmlMbsId = map.getParam('view_html_mbs_id')
	,	mapShellSelector = viewHtmlMbsId ? viewHtmlMbsId : '#'+ map.getViewHtmlId()	//membership integration
	,	mapShell = jQuery(mapShellSelector).parents('.gmpMapDetailsContainer:first')
	,	sliderShell = jQuery('#'+ params.listShellId)
	,	proControlsShell = sliderShell.parents('.gmpMapProControlsCon:first')
	,	arrows = sliderShell.find('[data-type="arrow"]')
	,	navigator = sliderShell.find('[data-type="navigator"]')
	,	mapHtmlOpts = map.getParam('html_options');

	if(params.position == 'h') {
		mapShell.css({
			'float': 'none'
		,	'width': mapHtmlOpts['width_full']
		});
		proControlsShell.css({
			'float': 'none'
		,	'width': mapHtmlOpts['width_full']
		}).data('position', params.position);
		sliderShell.css({
			'height': params.collapseHeight - 3
		,	'margin-top': '0'
		,	'margin-bottom': '0'
		}).find('.gmpMnlJssorSlides').css({
			'height': params.collapseHeight
		,	'max-height': params.collapseHeight
		});
		// Let it be here to get new mapShell width in px!
		sliderShell.css({
			'width': mapShell.width()
		});
		sliderShell.find('.gmpMnlJssorSlides').css({
			'width': mapShell.width() + 2
		});
	} else {
		mapShell.css({
			'float': 'left'
		,	'width': mapHtmlOpts['width_full']
		});
		mapShell.css({
			'width': mapShell.width() - params.slideWidth - 5
		});
		proControlsShell.css({
			'float': 'right'
		,	'width': params.slideWidth + 3
		}).data('position', params.position);
		sliderShell.css({
			'width': params.slideWidth + 3
		,	'height': params.parentHeight
		,	'margin-top': '0'
		,	'margin-bottom': '0'
		}).find('.gmpMnlJssorSlides').css({
			'width': params.slideWidth + 3
		,	'height': params.parentHeight
		,	'max-height': params.parentHeight
		}).find('.gmpMnlJssorSlide').css({
			'margin-left': '1px'
		});
	}
	if(arrows.length) {
		arrows.filter('[data-u="arrowleft"]').removeClass('jssora03l').addClass('jssora03u');
		arrows.filter('[data-u="arrowright"]').removeClass('jssora03r').addClass('jssora03d');
	}
	if(navigator.length) {
		navigator.removeClass('jssorb03').addClass('jssorb03v');
	}
}
function _gmpRebuildHorizontalOrientation(map, params) {
	var viewHtmlMbsId = map.getParam('view_html_mbs_id')
	,	mapShellSelector = viewHtmlMbsId ? viewHtmlMbsId : '#'+ map.getViewHtmlId()	//membership integration
	,	mapShell = jQuery(mapShellSelector).parents('.gmpMapDetailsContainer:first')
	,	sliderShell = jQuery('#'+ params.listShellId)
	,	proControlsShell = sliderShell.parents('.gmpMapProControlsCon:first')
	,	arrows = sliderShell.find('[data-type="arrow"]')
	,	navigator = sliderShell.find('[data-type="navigator"]')
	,	mapHtmlOpts = map.getParam('html_options');

	mapShell.css({
		'float': 'none'
	,	'width': mapHtmlOpts['width_full']
	});
	proControlsShell.css({
		'float': 'none'
	,	'width': mapHtmlOpts['width_full']
	}).data('position', params.position);
	sliderShell.css({
		'height': params.slideHeight + 5,
		'margin-top': '5px',
		'margin-bottom': '35px'	// For navigation buttons with absolute position
	}).find('.gmpMnlJssorSlides').css({
		'height': params.slideHeight + 1,
		'max-height': params.slideHeight + 1
	}).find('.gmpMnlJssorSlide').css({
		'margin-left': '1px'
	});
	// Let it be here to get new mapShell width in px!
	sliderShell.css({
		'width': mapShell.width()
	});
	sliderShell.find('.gmpMnlJssorSlides').css({
		'width': mapShell.width() + 2
	});
	if(arrows.length) {
		arrows.filter('[data-u="arrowleft"]').removeClass('jssora03u').addClass('jssora03l');
		arrows.filter('[data-u="arrowright"]').removeClass('jssora03d').addClass('jssora03r');
	}
	if(navigator.length) {
		navigator.removeClass('jssorb03v').addClass('jssorb03');
	}
}
