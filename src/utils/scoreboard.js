'use strict';

var Hogan = require('hogan.js');

var _utils = {
    renderHtml : function(htmlTemplate, data){
        var template = Hogan.compile(htmlTemplate);
        var result = template.render(data);
        return result;
    }
}

module.exports = _utils;