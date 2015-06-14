/* global chrome, Bookmarker */

var MIN_WIDTH   = 150;          // min width of an image
var MIN_HEIGHT  = MIN_WIDTH;    // min height of an image
var LIMIT       = 50;           // max images per page
var FOLDER_NAME = 'Great Pics'; // top folder in the bookmark tree

chrome.browserAction.onClicked.addListener(function(tab) {
        var bookmarker  = new Bookmarker();
        var folderNames = [FOLDER_NAME, tab.url];
        // check if a directory for the current url already exists
        bookmarker.getDir(folderNames, function(dir) {
                if (!dir) { // url not bookmarked yet.
                    // create a directory for the current url
                    bookmarker.mkdirP(folderNames, function(dir) {
                            var msg = {
                                text:      'report_images',
                                minWidth:  MIN_WIDTH,
                                minHeight: MIN_HEIGHT,
                                limit:     LIMIT
                            };
                            // get the list of image urls from the content script
                            chrome.tabs.sendMessage(tab.id, msg, function(response) {
                                    if (response) {
                                        // create a bookmark for every url
                                        response.imageUrls.forEach(function(url) {
                                                bookmarker.add(dir, url);
                                            });
                                    }
                                });
                        });
                }
            });
    });
