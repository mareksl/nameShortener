var nameChecker = (function() {
  'use strict';
  //CHECK LENGTH
  var lengthCheck = function(target) {
    return target.value.length;
  };
  // REPLACE LETTER
  var replaceLetter = function(string, options) {
    var value = string;
    var regex;
    for (var letter in options) {
      if (options.hasOwnProperty(letter)) {
        regex = new RegExp(letter, 'g');
        value = value.replace(regex, options[letter]);
      }
    }
    return value;
  };
  //REPLACE UMLAUTS
  var replaceUmlauts = function(string) {
    return replaceLetter(string, {
      '\u00c4': 'Ae',
      '\u00d6': 'Oe',
      '\u00dc': 'ue',
      '\u00e4': 'ae',
      '\u00f6': 'oe',
      '\u00fc': 'ue',
      '\u00df': 'ss',
    });
  };
  //REMOVE PARENS
  var removeParens = function(string) {
    return replaceLetter(string, {
      '[()]': ''
    });
  };
  //RETURN OBJECT
  return {
    lengthCheck: lengthCheck,
    replaceUmlauts: replaceUmlauts,
    removeParens: removeParens
  };
}());
//-----------------------------------------------------------
(function init() {
  'use strict';
  // SELECTOR
  var $ = function(el) {
    return document.querySelector(el);
  };
  var displayLength = function(input, output) {
    output.innerHTML = nameChecker.lengthCheck(input);
  };
  // EVENT LISTENERS
  var inputName = $('#inputName'),
    outputName = $('#outputName'),
    outputShortName = $('#outputShortName'),
    outputInHouseName = $('#outputInHouseName'),
    lenName = $('#lenName'),
		inputObj = $('#inputObj'),
		lenObj = $('#lenObj');
  inputName.addEventListener('input', function(e) {
    displayLength(inputName, lenName);
  });
  outputName.addEventListener('input', function(e) {
    displayLength(outputName, lenOutputName);
  });
  outputShortName.addEventListener('input', function(e) {
    displayLength(outputShortName, lenOutputShortName);
  });
  outputInHouseName.addEventListener('input', function(e) {
    displayLength(outputInHouseName, lenOutputInHouseName);
  });
  $('#buttonShorten').addEventListener('click', function(e) {
    var value = inputName.value;
    var removeSpecial = $('input[name="removeSpecial"]').checked;
    var removeParens = $('input[name="removeParens"]').checked;
    if (removeSpecial) {
      value = nameChecker.replaceUmlauts(value);
    }
    if (removeParens) {
      value = nameChecker.removeParens(value);
    }
    outputName.value = value;
    outputShortName.value = value;
    outputInHouseName.value = value;
    displayLength(outputName, lenOutputName);
    displayLength(outputShortName, lenOutputShortName);
    displayLength(outputInHouseName, lenOutputInHouseName);
  });
	inputObj.addEventListener('input', function(e) {
		displayLength(inputObj, lenObj);
	});
	$('#buttonObjUmlauts').addEventListener('click', function(e){
		inputObj.value = nameChecker.replaceUmlauts(inputObj.value);
		displayLength(inputObj, lenObj);
		inputObj.select();
	});
}());
