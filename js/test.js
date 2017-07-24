var init = (function() {
  'use strict';
  var $ = function(el) {
    return document.querySelector(el);
  };
  // var replaceLetter = function(value, options, maxlen) {
  //   var len = value.length;
  //
  //   if (len <= maxlen) {
  //     return value
  //   } else {
  //
  //     for (var letter in options) {
  //       if (options.hasOwnProperty(letter)) {
  //         var pos = value.lastIndexOf(letter);
  //         if (pos > -1) {
  //           var value = value.substring(0, pos) + options[letter] + value.substring(pos + letter.length);
  //         }
  //       }
  //     }
  //     len = value.length;
  //   }
  //   return value;
  // };
	// var algorithm = function(string, options, maxlen) {
	// 	var value = string;
	// 	var len = value.length;
	// 	while (len > maxlen) {
	// 		loop: for (var letter in options) {
	// 			if (options.hasOwnProperty(letter)) {
	// 				var pos = value.lastIndexOf(letter);
	// 				if (pos > -1) {
	// 					var value = value.substring(0, pos) + options[letter] + value.substring(pos + letter.length);
	// 				} else {
	// 					continue loop;
	// 				};
	// 			}
	// 		}
	// 		len = value.length;
	// 	}
	// 	return value;
	// };
  var replaceLetter = function(value, options, maxlen) {
		var len = value.length;
    if (len <= maxlen) {
      return value;
    } else {
      for (var prop in options) {
        if (options.hasOwnProperty(prop)) {
          var regex = new RegExp(prop, 'g');
          var pos = value.lastIndexOf(prop);
          if (pos > -1) {
            var oldstring = value.substring(0, pos);
            var newstring = value.substring(pos);
            newstring = newstring.replace(regex, options[prop]);
            value = replaceLetter(oldstring + newstring, options, maxlen);
          }
        }
      }
      return value;
    }
  };
  var button = $('#button');
  var replaceProcess = function() {
    var input = $('#input').value;
    var len = input.length;
    var targetLen = 10;
    var rules = $('#rules').value;
    rules = JSON.parse(rules);
    var output = $('#output').value;
    output = replaceLetter(input, rules, targetLen);
    $('#output').value = output;
  }
  button.addEventListener('click', function() {
    replaceProcess()
  });
})();
// {'long': 'ln'} 14-10
