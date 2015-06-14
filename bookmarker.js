/* global chrome */

//================================================
// Bookamrker
//------------------------------------------------


var Bookmarker = function() {};


//------------------------------------------------
// getDir
//------------------------------------------------
// Gets the node of a directory which is made of the given folder names.
// folderNames - Array of folder names that the directory is made of.
// callback    - Function that looks like this: function(dir).
//               If the directory exists, "dir" will be its node,
//               otherwise, it will be null.
Bookmarker.prototype.getDir = function(folderNames, callback) {
    var _this = this;
    this._getRoot(function(root) {
            _this._getSubdir(root, folderNames, callback);
        });
};


//------------------------------------------------
// mkdirP
//------------------------------------------------
// Creates a directory in the bookmark tree, unless the directory already exists
// (like the "mkdir_p" command in Linux).
// folderNames - Array of folder names that the directory is made of.
// callback    - Function that looks like this: function(dir).
//               "dir" will be the node of the directory.
Bookmarker.prototype.mkdirP = function(folderNames, callback) {
    var _this = this;
    this._getRoot(function(root) {
            _this._mksubdirP(root, folderNames, callback);
        });
};

//------------------------------------------------
// add
//------------------------------------------------
// Adds a url bookmark to a directory in the bookmark tree.
// Will not add the url if it already exists in the directory.
// dir - A node in the bookmark tree.
// url - The url to add.
Bookmarker.prototype.add = function(dir, url) {
    var possibleNodes = [];

    // find nodes with identical title to url
    if (dir.children) {
        possibleNodes = dir.children.filter(function(node) {
                return node.title === url;
            });
    }

    // create a bookmark, unless identical one found
    if (possibleNodes.length === 0) {
        chrome.bookmarks.create({
                parentId: dir.id,
                title:    url,
                url:      url
            }, function() {});
    }
};


//------------------------------------------------
// _getRoot
//------------------------------------------------
// Gets the node of the "Other Bookmarks" folder in the bookmark tree.
// callback - Function that looks like this: function(root).
Bookmarker.prototype._getRoot = function(callback) {
    chrome.bookmarks.getTree(function(tree) {
            callback(tree[0].children[1]);
        });
};


//------------------------------------------------
// _mksubdirP
//------------------------------------------------
// Creates a sub-directory in the bookmark tree, under the a given root node,
//               unless the directory already exists.
// folderNames - Array of folder names that the sub-directory is made of.
// callback    - Function that looks like this: function(dir).
//               "dir" will be the node of the directory.
Bookmarker.prototype._mksubdirP = function(root, folderNames, callback) {
    var _this = this;
    if (folderNames.length > 0) {
        var possibleFolders = [];

        // search for the first folder right under root
        if (root.children) {
            possibleFolders = root.children.filter(function(folder) {
                    return folder.title === folderNames[0];
                });
        }

        // if the first folder exists
        if (possibleFolders.length > 0) {

            // if the first folder is the only folder in the directory, return it
            if (folderNames.length === 1) {
                callback(possibleFolders[0]);
            } else { // more folders in the directory
                // continue with next folders
                this._mksubdirP(possibleFolders[0], folderNames.slice(1), callback);
            }
        } else { // first folder does not exist
            // create the first folder
            chrome.bookmarks.create({
                    title: folderNames[0],
                    parentId: root.id
                }, function(folder) {
                    // if the first folder is the only folder in the directory, return it
                    if (folderNames.length === 1) {
                        callback(folder);
                    } else { // more folders in the directory
                        // continue with next folders
                        _this._mksubdirP(folder, folderNames.slice(1), callback);
                    }
                });
        }
    } else { // no folder name given
        callback(null);
    }
};


//------------------------------------------------
// _getSubdir
//------------------------------------------------
// Gets the node of a sub-directory which is made of the given folder names
//               under the a given root node.
// root        - A node in the tree.
// folderNames - Array of folder names that the sub-directory is made of.
// callback    - Function that looks like this: function(dir).
//               If the sub-directory exists, "dir" will be its node,
//               otherwise, it will be null.
Bookmarker.prototype._getSubdir = function(root, folderNames, callback) {
    if (folderNames.length > 0) {
        var possibleFolders = [];

        // search for the first folder right under root
        if (root.children) {
            possibleFolders = root.children.filter(function(folder) {
                    return folder.title === folderNames[0];
                });
        }

        // if the first folder exists
        if (possibleFolders.length > 0) {
            // if the first folder is the only folder in the directory, return it
            if (folderNames.length === 1) {
                callback(possibleFolders[0]);
            } else { // more folders in the directory
                // continue with next folders
                this._getSubdir(possibleFolders[0], folderNames.slice(1), callback);
            }
        } else { // first folder does not exist, meaning that the directory does not exist.
            callback(null);
        }
    } else { // no folder name given
        callback(null);
    }
};
