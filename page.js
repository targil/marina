/* global chrome */


//================================================
// ImageFinder
//------------------------------------------------


var ImageFinder = function() {};


//------------------------------------------------
// find
//------------------------------------------------
// Finds images in the curren page.
// options - Object with the optional attributes:
//    minWidth:  Minimal width of the images to find.
//    minHeight: Minimal height of the images to find.
//    limit:     Limit the number of images to this integer.
// Returns the urls of the images found.
ImageFinder.prototype.find = function(options) {
    if (!options) {
        options = {};
    }

    var result    = [];
    var minWidth  = options.minWidth  || 0;
    var minHeight = options.minHeight || 0;
    var limit     = options.limit;

    // find images with the requested size
    var filteredImages = $('img').filter(function() {
            return this.naturalWidth >= minWidth && this.naturalHeight >= minHeight;
        });

    // limit the number of images
    if (limit) {
        filteredImages = filteredImages.slice(0, limit);
    }

    // build an array of the image urls
    result = filteredImages.map(function() {
            return this.src;
        }).get();

    return result;
};

//
//
//================================================



chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.text && (msg.text === "report_images")) {
            var finder    = new ImageFinder();
            var imageUrls = finder.find({
                    minWidth:  msg.minWidth,
                    minHeight: msg.minHeight,
                    limit:     msg.limit
                });

            sendResponse({pageUrl: window.location, imageUrls: imageUrls});
        }
    });

