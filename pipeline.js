var fs = require("fs");
var path = require("path")
var md5 = require('MD5');
var sizeOf = require('image-size');

var recurseDir = function(fullPath, files) {
  if (!files) {
    files = [];
  }

  if (fs.statSync(fullPath).isFile()) {
    files.push(fullPath);
    return files;
  }

  fs.readdirSync(fullPath).forEach(function(file) {
    var childPath = path.join(fullPath, file)
    recurseDir(childPath, files);
  });

  return files;
};

var getHashCode = function(fullPath) {
  return md5(fs.readFileSync(fullPath));
};

var getHashedFileName = function(fullPath, targetDir) {
  var ext = path.extname(fullPath);
  var basename = path.basename(fullPath, ext);
  var hashCode = getHashCode(fullPath);
  return path.join(targetDir, basename + "-hc" + hashCode + ext);
};

var _imageTypes = {
  ".jpg": true,
  ".png": true,
  ".gif": true,
  ".bmp": true,
  ".tiff": true,
  ".webp": true
};

var getRootRelativePath = function(basePath, fullPath) {
  return path.sep + path.relative(basePath, fullPath);
};

var processFile = function(fullPath, basePath, targetBasePath) {

  var relativePath = path.relative(basePath, fullPath);
  var targetPath = path.resolve(targetBasePath, relativePath);
  var targetDir = path.dirname(targetPath);
  var hashedPathPhysical = getHashedFileName(fullPath, targetDir);
  var hashedPath = path.relative(targetBasePath, hashedPathPhysical);

  var manifestEntry = {
    path: path.sep + relativePath,
    pathPhysical: fullPath,
    hashedPath: path.sep + hashedPath,
    hashedPathPhysical: hashedPathPhysical
  };

  // Get size info for images
  var ext = path.extname(fullPath).toLowerCase();
  if (_imageTypes[ext]) {
    var dimensions = sizeOf(fullPath);
    manifestEntry.width = dimensions.width;
    manifestEntry.height = dimensions.height;
  }

  return manifestEntry;
};

var processDirectory = function(sourceDir, targetDir) {
  return recurseDir(sourceDir).map(function(fullPath) { 
    return processFile(fullPath, sourceDir, targetDir);
  });
};

// console.log(getHashCode("/Library/WebServer/Documents/pipeline/assets/replace.css"));

// console.log(recurseDir("/Library/WebServer/Documents/pipeline/assets").map(function(fullPath) { 
//   return fullPath + ": " + getHashCode(fullPath);
// }));

console.log(processDirectory("/Library/WebServer/Documents/pipeline/assets/", "/Library/WebServer/Documents/pipeline/temp/"));
