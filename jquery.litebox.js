// Generated by CoffeeScript 1.6.1

/*
liteBox v2.0.1 by Bruno Bernardino | 2013.06.21 | https://github.com/BrunoBernardino/LiteBox
*/


(function($, _, window) {
  var globals, helpers, methods;
  helpers = {
    generateID: function() {
      var S4;
      S4 = function() {
        return (((1 + window.Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }
  };
  globals = {
    galleries: [],
    currentGallery: "",
    currentGalleryIndex: -1,
    options: {}
  };
  methods = {
    init: function(options) {
      var defaults;
      defaults = {
        liteboxID: "litebox",
        backgroundClass: "litebox-background",
        wrapperClass: "litebox-wrapper",
        contentClass: "litebox-content",
        closeButtonClass: "litebox-close",
        arrowButtonClass: "litebox-arrow",
        leftArrowButtonAddedClass: "left",
        rightArrowButtonAddedClass: "right",
        liteboxMainTemplateID: "templates-litebox",
        liteboxImageTemplateID: "templates-litebox-image",
        liteboxIFrameTemplateID: "templates-litebox-iframe",
        liteboxHTMLTemplateID: "templates-litebox-html",
        htmlClass: "html",
        isModal: false,
        escapeCloses: true,
        arrowKeysNavigate: true,
        animationType: "fade",
        animationSpeed: "fast",
        openOnComplete: $.noop,
        dataLitebox: "liteboxItemOptions"
      };
      options = $.extend(defaults, options);
      globals.options = $.extend({}, options);
      methods.create.call(this, options);
      this.each(function() {
        var $this, data, imageGalleryIndex, imageObject, itemDefaults, itemOptions;
        $this = $(this);
        data = $this.data("litebox");
        if (!data) {
          itemDefaults = {
            gallery: "",
            alt: "",
            type: "image"
          };
          itemOptions = $.extend(itemDefaults, $this.data(options.dataLitebox));
          imageGalleryIndex = -1;
          if (itemOptions.gallery.length > 0) {
            if (!$.isArray(globals.galleries[itemOptions.gallery])) {
              globals.galleries[itemOptions.gallery] = [];
            }
            imageObject = {
              src: $this.attr("href"),
              alt: itemOptions.alt
            };
            imageGalleryIndex = globals.galleries[itemOptions.gallery].push(imageObject) - 1;
          }
          $this.data("litebox", {
            target: $this,
            options: itemOptions,
            galleryIndex: imageGalleryIndex
          });
          return $(this).on("click.litebox", function(event) {
            event.preventDefault();
            return methods.open.call(this, options);
          });
        }
      });
      return true;
    },
    destroy: function() {
      $(window).off(".litebox");
      this.each(function() {
        var $this, data;
        $this = $(this);
        data = $this.data("litebox");
        return $this.removeData("litebox");
      });
      return true;
    },
    create: function(options) {
      var liteboxHTML;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if ($("#" + options.liteboxID).length > 0) {
        return false;
      } else {
        liteboxHTML = _.template($("#" + options.liteboxMainTemplateID).html(), {
          liteboxID: options.liteboxID,
          backgroundClass: options.backgroundClass,
          wrapperClass: options.wrapperClass,
          closeButtonClass: options.closeButtonClass,
          arrowButtonClass: options.arrowButtonClass,
          leftArrowButtonAddedClass: options.leftArrowButtonAddedClass,
          rightArrowButtonAddedClass: options.rightArrowButtonAddedClass,
          contentClass: options.contentClass
        });
        $("body").append(liteboxHTML);
        if (options.escapeCloses) {
          $(document).on("keydown.litebox", function(event) {
            if ($("#" + options.liteboxID).is(':visible')) {
              if (event.keyCode === 27) {
                event.preventDefault();
                return methods.close.call(this, options);
              }
            }
          });
        }
        if (!options.isModal) {
          $("#" + options.liteboxID + "-background").on("click.litebox", function(event) {
            event.preventDefault();
            return methods.close.call(this, options);
          });
        }
        if (options.arrowKeysNavigate) {
          $(document).on("keydown.litebox", function(event) {
            if ($("#" + options.liteboxID).is(':visible')) {
              if (event.keyCode === 37) {
                event.preventDefault();
                return methods.navigateLeft.call(this, options);
              } else if (event.keyCode === 39) {
                event.preventDefault();
                return methods.navigateRight.call(this, options);
              }
            }
          });
        }
        $("#" + options.liteboxID + " ." + options.arrowButtonClass).on("click.litebox", function(event) {
          event.preventDefault();
          if ($(this).hasClass(options.leftArrowButtonAddedClass)) {
            return methods.navigateLeft.call(this, options);
          } else {
            if ($(this).hasClass(options.rightArrowButtonAddedClass)) {
              return methods.navigateRight.call(this, options);
            }
          }
        });
        $("#" + options.liteboxID + " ." + options.closeButtonClass).on("click.litebox", function(event) {
          event.preventDefault();
          return methods.close.call(this, options);
        });
        $(window).on("resize.litebox", function() {
          return methods.positionOnCenter.call(this, options);
        });
      }
      return true;
    },
    open: function(options) {
      var $this, data, doAfterAnimationIsDone, itemGalleryIndex, itemOptions, originalMarginTop, originalZoom;
      $this = $(this);
      data = $this.data("litebox");
      itemOptions = data.options;
      itemGalleryIndex = data.galleryIndex;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!data) {
        return false;
      }
      $("#" + options.liteboxID + "-background").fadeIn("fast");
      doAfterAnimationIsDone = function() {
        switch (itemOptions.type) {
          case "iframe":
            return methods.showIFrame.call(this, options, $this.attr("href"));
          case "html":
            return methods.showHTML.call(this, options, $this.attr("href"));
          default:
            return methods.showImage.call(this, options, itemOptions.gallery, itemGalleryIndex, $this.attr("href"), itemOptions.alt);
        }
      };
      switch (options.animationType) {
        case "slide":
          originalMarginTop = $("#" + options.liteboxID).css("margin-top");
          $("#" + options.liteboxID).css({
            "margin-top": ((($("#" + options.liteboxID).outerHeight() * 2) + window.parseInt($("#" + options.liteboxID).css("top"), 10)) * -1) + "px",
            display: "block",
            opacity: 0
          }).animate({
            "margin-top": originalMarginTop,
            opacity: 1
          }, options.animationSpeed, doAfterAnimationIsDone);
          break;
        case "zoom":
          originalZoom = $("#" + options.liteboxID).css("zoom");
          $("#" + options.liteboxID).css({
            zoom: originalZoom / 3,
            display: "block",
            opacity: 0
          }).animate({
            zoom: originalZoom,
            opacity: 1
          }, options.animationSpeed, doAfterAnimationIsDone);
          break;
        default:
          $("#" + options.liteboxID).fadeIn(options.animationSpeed, doAfterAnimationIsDone);
      }
      return true;
    },
    close: function(options) {
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      $("#" + options.liteboxID).fadeOut("fast", function() {
        return $("#" + options.liteboxID + "-content").empty();
      });
      $("#" + options.liteboxID + "-background").fadeOut("fast");
      globals.currentGallery = "";
      globals.currentGalleryIndex = -1;
      $("#" + options.liteboxID + " ." + options.arrowButtonClass).hide();
      return true;
    },
    positionOnCenter: function(options) {
      var liteboxHeight, liteboxWidth, previousLiteboxHeight, previousLiteboxWidth;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      if ($("#" + options.liteboxID).length > 0) {
        liteboxWidth = 0;
        liteboxHeight = 0;
        previousLiteboxWidth = -5;
        previousLiteboxHeight = -5;
        while (window.Math.abs(liteboxWidth - previousLiteboxWidth) > 1 || window.Math.abs(liteboxHeight - previousLiteboxHeight) > 1) {
          previousLiteboxWidth = liteboxWidth;
          previousLiteboxHeight = liteboxHeight;
          liteboxWidth = $("#" + options.liteboxID).outerWidth();
          liteboxHeight = $("#" + options.liteboxID).outerHeight();
          $("#" + options.liteboxID).css({
            "margin-left": (liteboxWidth / 2 * -1) + "px",
            "margin-top": (liteboxHeight / 2 * -1) + "px"
          });
        }
      }
      return true;
    },
    showOrHideArrows: function(options, itemGallery, itemGalleryIndex) {
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      if (itemGallery.length > 1) {
        if (itemGalleryIndex >= 0) {
          $("#" + options.liteboxID + " ." + options.arrowButtonClass).show();
          if (itemGalleryIndex === (globals.galleries[itemGallery].length - 1)) {
            $("#" + options.liteboxID + " ." + options.arrowButtonClass + "." + options.rightArrowButtonAddedClass).hide();
          }
          if (itemGalleryIndex === 0) {
            $("#" + options.liteboxID + " ." + options.arrowButtonClass + "." + options.leftArrowButtonAddedClass).hide();
          }
        }
      }
      return true;
    },
    showImage: function(options, itemGallery, itemGalleryIndex, imageSrc, imageAlt) {
      var objImagePreloader;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      objImagePreloader = new Image();
      objImagePreloader.onload = function() {
        var generatedID, imageHTML;
        generatedID = helpers.generateID.call(this);
        imageHTML = _.template($("#" + options.liteboxImageTemplateID).html(), {
          liteboxID: options.liteboxID,
          generatedID: generatedID,
          imageSrc: imageSrc,
          imageAlt: imageAlt
        });
        $("#" + options.liteboxID + "-content").html(imageHTML);
        methods.positionOnCenter.call(this, options);
        globals.currentGallery = itemGallery;
        globals.currentGalleryIndex = itemGalleryIndex;
        methods.showOrHideArrows.call(this, options, itemGallery, itemGalleryIndex);
        objImagePreloader.onload = function() {};
        if ($.isFunction(options.openOnComplete)) {
          return options.openOnComplete.call(this, options);
        }
      };
      objImagePreloader.src = imageSrc;
      return true;
    },
    navigateTo: function(options, calledIndex) {
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      if (globals.galleries[globals.currentGallery][calledIndex]) {
        methods.showImage.call(this, options, globals.currentGallery, calledIndex, globals.galleries[globals.currentGallery][calledIndex].src, globals.galleries[globals.currentGallery][calledIndex].alt);
      }
      return true;
    },
    navigateLeft: function(options) {
      var newIndex;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      if (globals.currentGallery.length > 0) {
        newIndex = globals.currentGalleryIndex - 1;
        if (newIndex < 0) {
          return false;
        }
        methods.navigateTo.call(this, options, newIndex);
      }
      return true;
    },
    navigateRight: function(options) {
      var newIndex;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      if (!$("#" + options.liteboxID).length) {
        return false;
      }
      if (globals.currentGallery.length > 0) {
        newIndex = globals.currentGalleryIndex + 1;
        if (newIndex > (globals.galleries[globals.currentGallery].length - 1)) {
          return false;
        }
        methods.navigateTo.call(this, options, newIndex);
      }
      return true;
    },
    showIFrame: function(options, iframeURL) {
      var generatedID, iframeHTML;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      generatedID = helpers.generateID.call(this);
      iframeHTML = _.template($("#" + options.liteboxIFrameTemplateID).html(), {
        liteboxID: options.liteboxID,
        generatedID: generatedID,
        iframeURL: iframeURL
      });
      $("#" + options.liteboxID + "-content").html(iframeHTML);
      methods.positionOnCenter.call(this, options);
      if ($.isFunction(options.openOnComplete)) {
        options.openOnComplete.call(this, options);
      }
      return true;
    },
    showHTML: function(options, elementSelector) {
      var contentHTML, generatedID;
      if (typeof options === "undefined") {
        options = globals.options;
      }
      generatedID = helpers.generateID.call(this);
      contentHTML = _.template($("#" + options.liteboxHTMLTemplateID).html(), {
        liteboxID: options.liteboxID,
        generatedID: generatedID,
        htmlClass: options.htmlClass,
        htmlContent: $(elementSelector).html()
      });
      $("#" + options.liteboxID + "-content").html(contentHTML);
      methods.positionOnCenter.call(this, options);
      if ($.isFunction(options.openOnComplete)) {
        options.openOnComplete.call(this, options);
      }
      return true;
    }
  };
  $.fn.litebox = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery.litebox");
    }
    return true;
  };
  return true;
})(jQuery, _, window);
