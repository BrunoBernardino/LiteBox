/***
LiteBox by Bruno Bernardino - www.brunobernardino.com
v1.0 - 2012/04/25
***/
jQuery.fn.liteBox = function(options) {
	var $ = jQuery;
	var opts = $.extend({}, $.fn.liteBox.defaults, options);

	var liteBoxWrapperHTML = '' +
	'<div id="liteBox-overlay">' +
	'	<div class="liteBox' + (opts.theClass ? (' ' + opts.theClass) : '') + '">' +
	'		<span class="close">x</span>' +
	'		<div class="liteBox-container">' +
	'		</div>' +
	'	</div>' +
	'</div>';

	this.each(function() {
		var sourceElement = this;

		//-- Preload target images
		if ($(sourceElement).data('type') == 'image') {
			var temporaryImage = new Image();
			temporaryImage.src = $(sourceElement).prop('href');
		}

		$(sourceElement).live('click', function(e) {
			e.preventDefault();

			switch ($(this).data('type')) {
				case 'image':
					var liteBoxType = 'image';
					var liteBoxHTML = '<img src="' + $(this).prop('href') + '" alt="' + $(this).prop('title') + '" />';
				break;
				case 'html':
					var liteBoxType = 'html';
					var liteBoxHTML = $($(this).attr('href')).html();
				break;
				case 'iframe':
				default:
					var liteBoxType = 'iframe';
					var liteBoxHTML = '<iframe src="' + $(this).prop('href') + '"></iframe>';
				break;
			}

			if ($('#liteBox-overlay').length > 0) {
				$('#liteBox-overlay').fadeIn(opts.speedIn);
			} else {
				$('body').append(liteBoxWrapperHTML);
				$('#liteBox-overlay').hide().fadeIn(opts.speedIn);
			}

			//-- Auto-size, only available for images
			if (opts.autoSize && liteBoxType == 'image') {
				var temporaryImage = new Image();
				temporaryImage.src = $(this).prop('href');
				if (temporaryImage.width) {
					$('#liteBox-overlay .liteBox-container').width(temporaryImage.width);
					$('#liteBox-overlay .liteBox-container').height(temporaryImage.height);
				}
			}

			if (!opts.autoSize || liteBoxType != 'image') {
				if (opts.theWidth > 0) {
					$('#liteBox-overlay .liteBox-container').width(opts.theWidth);
				} else {
					$('#liteBox-overlay .liteBox-container').width($(window).width());
					$(window).resize(function() {
						$('#liteBox-overlay .liteBox-container').width($(window).width());
					});
				}
				if (opts.theHeight > 0) {
					$('#liteBox-overlay .liteBox-container').height(opts.theHeight);
				} else {
					$('#liteBox-overlay .liteBox-container').height($(window).height() - 200);
					$(window).resize(function() {
						$('#liteBox-overlay .liteBox-container').height($(window).height() - 200);
					});
				}
			}
			
			//-- Auto window positioning
			$('#liteBox-overlay .liteBox').css('margin-top', ($('#liteBox-overlay .liteBox').height() / 2) * -1 );
			$('#liteBox-overlay .liteBox').css('margin-left', ($('#liteBox-overlay .liteBox').width() / 2) * -1 );

			if (opts.outsideClick) {
				$(document).click(function(e) {
					if ($(e.target).prop('id') == 'liteBox-overlay') {
						$('#liteBox-overlay .close').click();
					}
				});
			}

			$('#liteBox-overlay').css({'height': $(document).height()});
			$(window).resize(function() {
				$('#liteBox-overlay').css({'height': $(document).height()});
			});

			$('#liteBox-overlay .liteBox-container').html(liteBoxHTML);

			$('#liteBox-overlay .close').die();
			$('#liteBox-overlay .close').live('click',function() {
				if ($.isFunction(opts.callbackOnClose)) {
					opts.callbackOnClose();
				}
				$('#liteBox-overlay').fadeOut(200, function() {
					$('#liteBox-overlay').detach();
				});
			});

			if ($.isFunction(opts.callbackOnLoad)) {
				opts.callbackOnLoad();
			}
		});
	});
}

//-- Default liteBox options
jQuery.fn.liteBox.defaults = {
	speedIn: 200,
	theClass: '',
	autoSize: true,
	theWidth: 0,
	theHeight: 0,
	outsideClick: true,
	callbackOnLoad: null,
	callbackOnClose: null
};