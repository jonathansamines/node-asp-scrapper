var Scrapper = require('./lib/scrapper');
var Promise  = require('promise');

var url = 'http://www.visualwebgui.com/Developers/Forums/tabid/364/forumid/68/threadid/66275/scope/posts/Default.aspx';
var scrapper = new Scrapper({
	url: url,
	options: {}
});

var document = scrapper.getDocument();

var form = document.then(scrapper.getFormData)
.then(function(formData) {
	console.log(formData);
});

var data = document.then(scrapper.selectDocumentData.bind(null, {
	elements: {
		'post-title': {
			selector: '#spSubject',
			property: 'text'
		}
	}
}))
.then(function(values) {
	console.log(values);
});

Promise.all([form, data]).catch(function(error) {
	console.log('Sorry, an error ocurred when scrapping web page. ', error);
});