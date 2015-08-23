/**
 * Global main namespace for the application
 *
 * Entry point of the application
 * @namespace APP
 */

var APP = APP || function () {};

/**
 * Main application class
 *
 * @namespace APP
 * @name APP.Main
 */
APP.Main = (/** @lends APP.Main */function () {

    var instance;
    
    console.log('Ponty!');
    
    /**
     * Initialize application and needed subclasses
     * @public
     */
    function init() {
        APP.HandleImage.init();
        APP.CoverLayer.init();
    }

    return {

        /**
         * Get singleton APP.Main instance
         *
         * @public
         * @memberof APP.Main
         * @returns {APP.Main}
         */
        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }

    };

}());

/**
 * Responsible for uploading the image
 *
 * @namespace APP
 * @name APP.HandleImage
 */
APP.HandleImage = (/** @lends APP.HandleImage */function () {
    var $container = $('[data-container]'),
        $uploadDiv = $container.find('[data-upload]'),
        $cropDiv = $container.find('[data-crop]'),
        $canvasDiv = $container.find('[data-canvas]'),
        $downloadBtn = $container.find('[data-image-link]'),
        $reloadBtn = $container.find('[data-reload]'),
        container = $('[data-container]')[0],
        acceptedTypes = {
          'image/png': true,
          'image/jpeg': true
        },
        files,
        jcropApi,
        cropSize = 320,
        offsetX,
        $image,
        $fileUpload = $('#upload'),
        canvas = document.getElementById('resize-canvas'),
        coords = {},
        jcropApi,
        $cropButton = $('[data-crop-btn]'),
	$body = $('body');
    
    function init() {
        container.ondragover = function () {
            if($container.hasClass('image-not-uploaded')) {
                $container.addClass('in');
                return false;    
            }
        };
        container.ondragend = function () {
            if($container.hasClass('image-not-uploaded')) {
                $container.removeClass('in');
                return false;    
            }
        };
        container.ondrop = function (event) {
            if($container.hasClass('image-not-uploaded')) {
                event.preventDefault && event.preventDefault();
                $container.removeClass('in');

                // now do something with:
                files = event.dataTransfer.files;    
                handleFileUpload(files);
                return false;    
            }
        };
        
        $fileUpload.on({
            'change': function(e) {
                var files = e.target.files;
                handleFileUpload(files);
            }
        });
        
        $cropButton.on({
            'click': showCanvas
        });
        
        $reloadBtn.on({
            'click': function() {
                location.reload();
            }
        });
	
	$body.on({
	    'keyup': function(e) {
		if (parseInt(e.which, 10) === 13 && !$cropButton.hasClass('button--hidden')) {
		    $cropButton.trigger('click');    
		}
	    }
	});
               
    }
    
    function handleFileUpload(files) {
        if(files[0] !== undefined && acceptedTypes[files[0].type] === true) {
          var reader = new FileReader();
          reader.onload = function (event) {
            var image = new Image();
            image.id = 'selected-image';
            image.src = event.target.result;
            $cropDiv.append(image);
            $uploadDiv.addClass('hidden');
            $cropDiv.removeClass('hidden');
            $container.removeClass('image-not-uploaded');
            $image = $('#selected-image');
            offsetX = Math.floor(($image.width() - cropSize) / 2);
            offsetY = 0;
	    
	    $image.on('load', function() {
		if(cropSize > $image.height()) {
		    cropSize = $image.height() - 10;
		    canvas.width = cropSize;
		    canvas.height = cropSize;		    
		}		
		
		$image.Jcrop({
		    bgFade: true,
		    bgOpacity: .2,
		    minSize: [cropSize, cropSize],
		    setSelect: [
			offsetX,
			offsetY,
			cropSize,
			cropSize
		    ],
		    aspectRatio: 1,
		    onSelect: setCoords
		}, function() {
		    jcropApi = this;
		});
		showCropButton();
	    });
          };

          reader.readAsDataURL(files[0]);
        }
    }
    
    /***
    * Set all coords (onSelect callback for the image cropper), stores the coords in global vars
    *
    * @param c
    */
    function setCoords(c) {
	coords.x = c.x;
	coords.y = c.y;
	coords.x2 = c.x2;
	coords.y2 = c.y2;
	coords.w = c.w;
	coords.h = c.h;
    }
    
    /***
    * Draw the currently selected image part to the canvas, proportionately resized
    *
    * @private
    * @returns {void}
    */
   function drawImageToCanvas() {
	var context = canvas.getContext('2d'),
	    $img = $image,
	    img = $img[0],
	    imagePos = canvas.width - 173;

	    imgW = (img.width === 0 ? $img.attr('width') : img.width),
	    imgH = (img.height === 0 ? $img.attr('height') : img.height),

	    ratioY = imgH / $img.height(),
	    ratioX = imgW / $img.width(),	    
	    
	    getX = Math.floor(coords.x * ratioX),
	    getY = Math.floor(coords.y * ratioY),

	    getWidth = Math.floor(coords.w * ratioX),
	    getHeight = Math.floor(coords.h * ratioY);	
	    
	context.drawImage(img, getX, getY, getWidth, getHeight, 0, 0, Math.floor(cropSize), Math.floor(cropSize));
	loadAndDrawImage('img/matra-kempo-se-watermark.png', context, imagePos, imagePos);
   }
    
    function setDownloadUrl(canvas) {
        $downloadBtn.attr('href', canvas.toDataURL());    
    }
    
    function addPreviewImage() {
	$canvasDiv.prepend('<img src="' + canvas.toDataURL() + '" class="canvas-preview blk" width="' + canvas.width +'" height="' + canvas.height + '">');
    }
    
    function showCanvas() {
        drawImageToCanvas();
        $cropDiv.addClass('hidden');
        $canvasDiv.removeClass('hidden');
	$cropButton.addClass('button--hidden');
    }
    
    function showCropButton() {
        $cropButton.removeClass('button--hidden');    
    }
    
    function loadAndDrawImage(url, context, x, y) {
      // Create an image object. This is not attached to the DOM and is not part of the page.
      var image = new Image();

      // When the image has loaded, draw it to the canvas
      image.onload = function() {
        context.drawImage(image, x, y);
	addPreviewImage();
        setDownloadUrl(canvas);
      }

      // Now set the source of the image that we want to load
      image.src = url;
    }
    
    return {
        init: init
    };

}());

/**
 * Remove the loading layer
 *
 * @namespace APP
 * @name APP.CoverLayer
 */
APP.CoverLayer = (/** @lends APP.CoverLayer */function () {

    var $coverLayer = $('[data-loading-layer]'),
        $window = $(window);
    
    function init() {
        $window.on({
            'load.removeLoading': function() {
                $coverLayer.fadeOut(250);
            }
        });              
    }
    
    return {
        init: init
    };

}());
