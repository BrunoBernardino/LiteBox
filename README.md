# liteBox - A Lightweight & Simple jQuery Lightbox-like Plugin

liteBox is a lightweight & simple jQuery lightbox-like plugin. Currently at version 2.0, it's now built in CoffeeScript, compiled to unminified and minified JavaScript.

It's built off of Chapter 4 of Pro jQuery Plugins ( http://projqueryplugins.com ).

## Usage

Get https://raw.github.com/BrunoBernardino/LiteBox/master/jquery.litebox.min.js and https://raw.github.com/BrunoBernardino/LiteBox/master/jquery.litebox.css, include them in your site and call the following (supposing you'd want input validation on all links in a .thumbnails .thumbnail anchor element):

```javascript
$('.thumbnails .thumbnail a').litebox();
```

You can open/call a lightbox directly with 'open', for example:

```javascript
$('.thumbnails .thumbnail a:eq(0)').litebox('open');
```

You can also close it with:

```javascript
$('.thumbnails .thumbnail a:eq(0)').litebox('close');
```

## Features

* 3 default lightbox types (image, html, iframe)
* Gallery support
* Auto lightbox centering
* Callback support for when the "open" animation finishes
* Arrow keys navigation on gallery
* Modal support

## Dev features

* Namespaced events
* jQuery 1.9.1 tested
* Callable plugin methods
* CoffeeScript & SCSS

## Available Options & Default Values

* liteboxID: "litebox"
* backgroundClass: "litebox-background"
* wrapperClass: "litebox-wrapper"
* contentClass: "litebox-content"
* closeButtonClass: "litebox-close"
* arrowButtonClass: "litebox-arrow"
* leftArrowButtonAddedClass: "left"
* rightArrowButtonAddedClass: "right"
* liteboxMainTemplateID: "templates-litebox"
* liteboxImageTemplateID: "templates-litebox-image"
* liteboxIFrameTemplateID: "templates-litebox-iframe"
* liteboxHTMLTemplateID: "templates-litebox-html"
* htmlClass: "html"
* isModal: false
* escapeCloses: true
* arrowKeysNavigate: true
* animationType: "fade" # supports 'fade', 'slide' and 'zoom'
* animationSpeed: "fast"
* openOnComplete: $.noop
* dataLitebox: "liteboxItemOptions" # data-* property to check for the JSON object with item specific options (gallery, alt, type)