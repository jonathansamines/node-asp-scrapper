var cheerio = require('cheerio');
var request = require('request');
var merge 	= require('merge');
var Promise = require('promise');

var get = Promise.denodeify(request.get);
var post = Promise.denodeify(request.post);

/**
 * Scrapper utility for analysis of web forms applications
 * @param {String} url     base url for web form application
 * @param {Object} headers application required headers ( included cookies )
 */
function Scrapper(url, options) {
	this.url = url;
	this.options = options;
}

Scrapper.prototype.getDocument = function getDocument() {
	return get(this.url, this.options)

	// load document with cheerio
	.then(function loadDocument(page) {
		return cheerio.load(page.body);
	});
};

Scrapper.prototype.getFormData = function getFormData($) {
	// get document inputs ( viewstate )
	var formData = {};

	$('form input').each(function() {
		var $input = $(this);
		var inputName = $input.attr('name');
		var inputValue = $input.attr('value');

		formData[inputName] = inputValue;
	});

	return formData;
};

Scrapper.prototype.sendFormData = function sendFormData(formData) {
	var options = merge(this.options, { url: this.url, form: formData });
	return post(options);
};

Scrapper.prototype.selectDocumentData = function selectDocumentData(query, $) {
	var data = {};

	for (var element in query.elements) {
		var elementOptions = query.elements[element];
		var $element = $(elementOptions.selector);

		if (elementOptions.property === 'attr') {
			data[element] = $element.map(function() {
				return $(this).attr(elementOptions.propertyValue);
			});
		}else if(elementOptions.property === 'text' || elementOptions.property === 'html') {
			data[element] = $element.map(function() {
				return $(this)[elementOptions.property]();
			});
		}else {
			throw new Error('No property supported.');
		}

		data[element] = Array.prototype.slice.call(data[element]);
	}

	return data;
};

module.exports = Scrapper;