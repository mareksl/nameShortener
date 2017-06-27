var nameChecker = (function() {
  'use strict';
  // CHECK LENGTH
  var lengthCheck = function(target) {
    return target.value.length;
  };
  // MAXIMUM lENGTH
  var maxLength = function(target, max) {
    return lengthCheck(target) > max;
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
    removeParens: removeParens,
    maxLength: maxLength
  };
}());
//-----------------------------------------------------------
(function init() {
  'use strict';
  // SELECTOR
  var $ = function(el) {
    return document.querySelector(el);
  };
  var displayLength = function(input, output, max) {
    output.innerHTML = nameChecker.lengthCheck(input);
    if (nameChecker.maxLength(input, max)) {
      if (!output.classList.contains('warning')) {
        output.classList.add('warning');
      }
    } else {
      if (output.classList.contains('warning')) {
        output.classList.remove('warning');
      }
    }
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
    displayLength(inputName, lenName, 50);
  });
  outputName.addEventListener('input', function(e) {
    displayLength(outputName, lenOutputName, 50);
  });
  outputShortName.addEventListener('input', function(e) {
    displayLength(outputShortName, lenOutputShortName, 30);
  });
  outputInHouseName.addEventListener('input', function(e) {
    displayLength(outputInHouseName, lenOutputInHouseName, 40);
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
    displayLength(outputName, lenOutputName, 50);
    displayLength(outputShortName, lenOutputShortName, 30);
    displayLength(outputInHouseName, lenOutputInHouseName, 40);
  });
  inputObj.addEventListener('input', function(e) {
    displayLength(inputObj, lenObj, 2000);
  });
  $('#buttonObjUmlauts').addEventListener('click', function(e) {
    inputObj.value = nameChecker.replaceUmlauts(inputObj.value);
    displayLength(inputObj, lenObj, 2000);
    inputObj.select();
  });
}());
