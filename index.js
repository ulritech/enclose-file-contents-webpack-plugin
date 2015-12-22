'use strict';

var ConcatSource = require('webpack/lib/ConcatSource');

/**
 * @constructor
 * @param {String} fileName The output file whose contents should be wrapped with
 *   optTextBefore and optTextAfter
 * @param {String?} optTextBefore The text to prepend to the file contents
 * @param {String?} optTextAfter The text to append to the file contents
 */
function EncloseFileContentsPlugin(fileName, optTextBefore, optTextAfter) {
	if (!fileName || typeof fileName !== 'string')
		throw new Error('Invalid argument: fileName');
	if (optTextBefore && typeof optTextBefore !== 'string')
		throw new Error('Invalid optTextBefore argument: expected string or undefined');
	if (optTextAfter && typeof optTextAfter !== 'string')
		throw new Error('Invalid optTextAfter argument: expected string or undefined');

	this.fileName_ = fileName;
	this.textBefore_ = optTextBefore ? optTextBefore : '';
	this.textAfter_ = optTextAfter ? optTextAfter : '';
};

EncloseFileContentsPlugin.prototype.apply = function(compiler) {
	// Short-cut optimization
	if (!this.textBefore_ && !this.textAfter_)
		return;

	var targetFile = this.fileName_,
		textBefore = this.textBefore_,
		textAfter = this.textAfter_;

	compiler.plugin('compilation', function(compilation) {
		compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
			chunks.forEach(function(chunk) {
				chunk.files.forEach(function(file) {
					if (file === targetFile)  {
						compilation.assets[file] = new ConcatSource(textBefore, compilation.assets[file], textAfter);
					}
				});
			});

			callback();
		});
	});
};

module.exports = EncloseFileContentsPlugin;
