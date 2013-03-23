###
liteBox v2.0 by Bruno Bernardino | 2013.03.23 | https://github.com/BrunoBernardino/LiteBox
###

# Helper function to generate a unique id, GUID-style. Idea from http://guid.us/GUID/JavaScript
helpers = generateID: ->
	S4 = ->
		(((1 + window.Math.random()) * 0x10000) | 0).toString(16).substring 1

	(S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase()

globals =
	galleries: [] # This array will hold all galeries as objects
	currentGallery: "" # This will hold the current gallery ID open, if any
	currentGalleryIndex: -1 # This wil hold the current gallery index open, if any
	options: {}

methods =
	init: (options) ->
		defaults =
			liteboxID: "litebox"
			backgroundClass: "litebox-background"
			wrapperClass: "litebox-wrapper"
			contentClass: "litebox-content"
			closeButtonClass: "litebox-close"
			arrowButtonClass: "litebox-arrow"
			leftArrowButtonAddedClass: "left"
			rightArrowButtonAddedClass: "right"
			liteboxMainTemplateID: "templates-litebox"
			liteboxImageTemplateID: "templates-litebox-image"
			liteboxIFrameTemplateID: "templates-litebox-iframe"
			liteboxHTMLTemplateID: "templates-litebox-html"
			htmlClass: "html"
			isModal: false
			escapeCloses: true
			arrowKeysNavigate: true
			animationType: "fade" # supports 'fade', 'slide' and 'zoom'
			animationSpeed: "fast"
			openOnComplete: $.noop
			dataLitebox: "liteboxItemOptions" # data-* property to check for the JSON object with item specific options (gallery, alt, type)

		options = $.extend(defaults, options)
		globals.options = $.extend({}, options)
		
		# Create the lightbox "holder" if it doesn't exist yet
		methods.create.call this, options
		@each ->
			$this = $(this)
			data = $this.data("litebox")
			unless data
				itemDefaults =
					gallery: "" # Gallery identification, so that images with this same value belong to the same gallery
					alt: "" # Alt attribute for the image in the href
					type: "image" # Item type, can be 'image', 'iframe', or 'html'

				itemOptions = $.extend(itemDefaults, $this.data(options.dataLitebox))
				imageGalleryIndex = -1
				
				# We're going to add this item to the galleries variable if we're supposed to
				if itemOptions.gallery.length > 0
					
					# Initialize array if it's not set yet
					globals.galleries[itemOptions.gallery] = [] unless $.isArray(globals.galleries[itemOptions.gallery])
					
					# Create the image object
					imageObject =
						src: $this.attr("href")
						alt: itemOptions.alt
					
					# Add the object to the array and get its index
					imageGalleryIndex = globals.galleries[itemOptions.gallery].push(imageObject) - 1

				$this.data "litebox",
					target: $this
					options: itemOptions
					galleryIndex: imageGalleryIndex
				
				# Bind click to open the lightbox
				$(this).on "click.litebox", (event) ->
					event.preventDefault()
					methods.open.call this, options

	destroy: ->
		$(window).off ".litebox"
		@each ->
			$this = $(this)
			data = $this.data("litebox")
			$this.removeData "litebox"
	
	# Create the lightbox "holder" if it doesn't exist
	create: (options) ->
		if typeof options == "undefined"
			options = globals.options

		# Check if the lightbox "holder" exists, if not, create it
		if $("##{ options.liteboxID }").length > 0
			false
		else
			liteboxHTML = _.template($("##{ options.liteboxMainTemplateID }").html(),
				liteboxID: options.liteboxID
				backgroundClass: options.backgroundClass
				wrapperClass: options.wrapperClass
				closeButtonClass: options.closeButtonClass
				arrowButtonClass: options.arrowButtonClass
				leftArrowButtonAddedClass: options.leftArrowButtonAddedClass
				rightArrowButtonAddedClass: options.rightArrowButtonAddedClass
				contentClass: options.contentClass
			)
			
			# Append the lightbox to the <body> tag.
			$("body").append liteboxHTML

			if options.escapeCloses
				# Bind Escape Key to close the lightbox
				$(document).on "keydown.litebox", (event) ->
					if event.keyCode is 27
						event.preventDefault()
						methods.close.call this, options
			
			# If it's not modal, make sure you can close it clicking outside of it
			unless options.isModal
				$("##{ options.liteboxID }-background").on "click.litebox", (event) ->
					methods.close.call this, options

			if options.arrowKeysNavigate
				
				# Bind Arrow Keys Navigation
				$(document).on "keydown.litebox", (event) ->
					if event.keyCode is 37 # Left
						event.preventDefault()
						methods.navigateLeft.call this, options
					else if event.keyCode is 39 # Right
						event.preventDefault()
						methods.navigateRight.call this, options
			
			# Bind Arrow Buttons Navigation
			$("##{ options.liteboxID } .#{ options.arrowButtonClass }").on "click.litebox", (event) ->
				event.preventDefault()
				if $(this).hasClass(options.leftArrowButtonAddedClass)
					methods.navigateLeft.call this, options
				else methods.navigateRight.call this, options if $(this).hasClass(options.rightArrowButtonAddedClass)
			
			# Bind close button to close the lightbox
			$("##{ options.liteboxID } .#{ options.closeButtonClass }").on "click.litebox", (event) ->
				event.preventDefault()
				methods.close.call this, options
			
			# Bind window resize to position the lightbox on the center of the window
			$(window).on "resize.litebox", (event) ->
				methods.positionOnCenter.call this, options

	# Method to open the lightbox
	open: (options) ->
		$this = $(this)
		data = $this.data("litebox")
		itemOptions = data.options
		itemGalleryIndex = data.galleryIndex

		if typeof options == "undefined"
			options = globals.options
		
		# If our plug-in wasn't initialized yet, do nothing
		return false unless data
		
		# Show the background/overlay
		$("##{ options.liteboxID }-background").fadeIn "fast"
		
		# Function to call after the animation is done
		doAfterAnimationIsDone = ->
			# get itemOptions.type and show image, iframe or HTML
			switch itemOptions.type
				when "iframe"
					methods.showIFrame.call this, options, $this.attr("href")
				when "html"
					methods.showHTML.call this, options, $this.attr("href")
				else # "image"
					methods.showImage.call this, options, itemOptions.gallery, itemGalleryIndex, $this.attr("href"), itemOptions.alt
		
		# Open the lightbox
		switch options.animationType
			when "slide"
				originalMarginTop = $("##{ options.liteboxID }").css("margin-top")
				$("#" + options.liteboxID).css(
					"margin-top": ((($("##{ options.liteboxID }").outerHeight() * 2) + window.parseInt($("##{ options.liteboxID }").css("top"), 10)) * -1) + "px"
					display: "block"
					opacity: 0
				).animate
					"margin-top": originalMarginTop
					opacity: 1
				, options.animationSpeed, doAfterAnimationIsDone
			when "zoom"
				originalZoom = $("##{ options.liteboxID }").css("zoom")
				$("##{ options.liteboxID }").css(
					zoom: (originalZoom / 3)
					display: "block"
					opacity: 0
				).animate
					zoom: originalZoom
					opacity: 1
				, options.animationSpeed, doAfterAnimationIsDone
			else # "fade"
				$("##{ options.liteboxID }").fadeIn options.animationSpeed, doAfterAnimationIsDone
	
	# Method to close the lightbox
	close: (options) ->
		if typeof options == "undefined"
			options = globals.options
		
		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("##{ options.liteboxID }").length
		
		# Close the lightbox
		$("##{ options.liteboxID }").fadeOut "fast", ->
			
			# Remove content inside
			$("##{ options.liteboxID }-content").empty()

		
		# Hide the background/overlay
		$("##{ options.liteboxID }-background").fadeOut "fast"
		
		# Reset the current gallery and current gallery index
		globals.currentGallery = ""
		globals.currentGalleryIndex = -1
		
		# Hide arrows
		$("##{ options.liteboxID } .#{ options.arrowButtonClass }").hide()
	
	# Method to position the lightbox on the center of the screen
	positionOnCenter: (options) ->
		if typeof options == "undefined"
			options = globals.options

		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("##{ options.liteboxID }").length
		if $("##{ options.liteboxID }").length > 0
			liteboxWidth = 0
			liteboxHeight = 0
			previousLiteboxWidth = -5
			previousLiteboxHeight = -5
			
			# Since we can "catch" the lightbox changing dimensions, we need to make sure we keep aligning it until it's "still".
			# We don't care about variations of 1 pixel, though.				
			while window.Math.abs(liteboxWidth - previousLiteboxWidth) > 1 or window.Math.abs(liteboxHeight - previousLiteboxHeight) > 1
				previousLiteboxWidth = liteboxWidth
				previousLiteboxHeight = liteboxHeight
				liteboxWidth = $("##{ options.liteboxID }").outerWidth()
				liteboxHeight = $("##{ options.liteboxID }").outerHeight()
				$("##{ options.liteboxID }").css
					"margin-left": (liteboxWidth / 2 * -1) + "px"
					"margin-top": (liteboxHeight / 2 * -1) + "px"

	# Show arrows if there is navigation
	showOrHideArrows: (options, itemGallery, itemGalleryIndex) ->
		if typeof options == "undefined"
			options = globals.options

		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("##{ options.liteboxID }").length
		if itemGallery.length > 1
			if itemGalleryIndex >= 0
				
				# Show arrows
				$("##{ options.liteboxID } .#{ options.arrowButtonClass }").show()
				
				# Is it the last image?
				
				# Hide right arrow
				$("##{ options.liteboxID } .#{ options.arrowButtonClass }.#{ options.rightArrowButtonAddedClass }").hide() if itemGalleryIndex is (globals.galleries[itemGallery].length - 1)
				
				# Is it the first image?
				
				# Hide left arrow
				$("##{ options.liteboxID } .#{ options.arrowButtonClass }.#{ options.leftArrowButtonAddedClass }").hide() if itemGalleryIndex is 0

	
	# Method to show image
	showImage: (options, itemGallery, itemGalleryIndex, imageSrc, imageAlt) ->
		if typeof options == "undefined"
			options = globals.options

		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("##{ options.liteboxID }").length
		
		# Image preload process
		objImagePreloader = new Image()
		objImagePreloader.onload = ->
			
			# Load the image inside the lightbox
			generatedID = helpers.generateID.call(this)
			imageHTML = _.template($("##{ options.liteboxImageTemplateID }").html(),
				liteboxID: options.liteboxID
				generatedID: generatedID
				imageSrc: imageSrc
				imageAlt: imageAlt
			)
			$("##{ options.liteboxID }-content").html imageHTML
			
			# Position the lightbox
			methods.positionOnCenter.call this, options
			
			# Set the current gallery and current gallery index
			globals.currentGallery = itemGallery
			globals.currentGalleryIndex = itemGalleryIndex
			
			# Show arrows if there is navigation
			methods.showOrHideArrows.call this, options, itemGallery, itemGalleryIndex
			
			# clear onLoad, IE behaves irratically with animated gifs otherwise
			objImagePreloader.onload = ->

			options.openOnComplete.call this, options if $.isFunction(options.openOnComplete)

		objImagePreloader.src = imageSrc

	# Method to navigate to an image
	navigateTo: (options, calledIndex) ->
		if typeof options == "undefined"
			options = globals.options

		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("##{ options.liteboxID }").length
		methods.showImage.call this, options, globals.currentGallery, calledIndex, globals.galleries[globals.currentGallery][calledIndex].src, globals.galleries[globals.currentGallery][calledIndex].alt if globals.galleries[globals.currentGallery][calledIndex]

	# Method to navigate "left"
	navigateLeft: (options) ->
		if typeof options == "undefined"
			options = globals.options

		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("##{ options.liteboxID }").length
		if globals.currentGallery.length > 0
			newIndex = (globals.currentGalleryIndex - 1)

			# If we're already on the first image, do nothing
			return false if newIndex < 0
			methods.navigateTo.call this, options, newIndex

	# Method to navigate "right"
	navigateRight: (options) ->
		if typeof options == "undefined"
			options = globals.options

		# If our plug-in wasn't initialized yet, do nothing
		return false unless $("#" + options.liteboxID).length
		if globals.currentGallery.length > 0
			newIndex = (globals.currentGalleryIndex + 1)
			
			# If we're already on the last image, do nothing
			return false if newIndex > (globals.galleries[globals.currentGallery].length - 1)
			methods.navigateTo.call this, options, newIndex

	# Method to show iframe
	showIFrame: (options, iframeURL) ->
		if typeof options == "undefined"
			options = globals.options

		# Load the iframe inside the lightbox
		generatedID = helpers.generateID.call(this)
		iframeHTML = _.template($("##{ options.liteboxIFrameTemplateID }").html(),
			liteboxID: options.liteboxID
			generatedID: generatedID
			iframeURL: iframeURL
		)
		$("##{ options.liteboxID }-content").html iframeHTML
		
		# Position the lightbox
		methods.positionOnCenter.call this, options
		options.openOnComplete.call this, options if $.isFunction(options.openOnComplete)

	# Method to show HTML
	showHTML: (options, elementSelector) ->
		if typeof options == "undefined"
			options = globals.options

		# Load the div inside the lightbox
		generatedID = helpers.generateID.call(this)
		contentHTML = _.template($("##{ options.liteboxHTMLTemplateID }").html(),
			liteboxID: options.liteboxID
			generatedID: generatedID
			htmlClass: options.htmlClass
			htmlContent: $(elementSelector).html()
		)
		$("##{ options.liteboxID }-content").html contentHTML
		
		# Position the lightbox
		methods.positionOnCenter.call this, options
		options.openOnComplete.call this, options if $.isFunction(options.openOnComplete)

$.fn.litebox = (method) ->
	if methods[method]
		methods[method].apply this, Array::slice.call(arguments, 1)
	else if typeof method is "object" or not method
		methods.init.apply this, arguments
	else
		$.error "Method #{ method } does not exist on jQuery.litebox"