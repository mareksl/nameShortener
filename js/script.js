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
  //REPLACE SLASHES
  var replaceSlashes = function(string) {
    return replaceLetter(string, {
      '/': '%2F'
    });
  };
  //GENERATE TRANSLATE LINK
  var translateLink = function(string) {
    return 'https://translate.google.com/#auto/en/' + replaceSlashes(encodeURI(removeBreaks(string)));
  };
  //REMOVE PARENS
  var removeParens = function(string) {
    return replaceLetter(string, {
      '[()]': ''
    });
  };
  //REMOVE LINE BREAKS
  var removeBreaks = function(string) {
    return replaceLetter(string, {
      '\n': ' '
    });
  };
  // ADD CLASSES
  var addShareClasses = function(name, sClasses) {
    var output = [];
    for (var i = 0; i < sClasses.length; i++) {
			if (sClasses[i] !== '') {
      output.push(name + ' ' + sClasses[i]);
		}
    }
    return output;
  };
  //RETURN OBJECT
  return {
    lengthCheck: lengthCheck,
    replaceUmlauts: replaceUmlauts,
    removeParens: removeParens,
    maxLength: maxLength,
    removeBreaks: removeBreaks,
    translateLink: translateLink,
    addShareClasses: addShareClasses
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

  function addShareClasses(name, sClassesIn, output) {
    var sClasses = sClassesIn.value.split('\n');
    output.innerHTML = '';
    var classesOutput = nameChecker.addShareClasses(name, sClasses);
    for (var i = 0; i < classesOutput.length; i++) {
      output.innerHTML += '<li tabindex="0" contenteditable="true">' + classesOutput[i] + '</li>';
    }
  }
  // EVENT LISTENERS
  var inputName = $('#inputName'),
    outputName = $('#outputName'),
    outputShortName = $('#outputShortName'),
    outputInHouseName = $('#outputInHouseName'),
    lenName = $('#lenName'),
    inputObj = $('#inputObj'),
    lenObj = $('#lenObj'),
    showRules = $('#showRules'),
    divRules = $('.rules'),
    shareClassesOutput = $('#shareClassesOutput'),
    shareClassesShortOutput = $('#shareClassesShortOutput'),
    shareClassesInHouseOutput = $('#shareClassesInHouseOutput');
  inputName.addEventListener('input', function(e) {
    displayLength(inputName, lenName, 50);
  });
  outputName.addEventListener('input', function(e) {
    displayLength(outputName, lenOutputName, 50);
    addShareClasses(outputName.value, $('#shareClasses'), shareClassesOutput);
  });
  outputShortName.addEventListener('input', function(e) {
    displayLength(outputShortName, lenOutputShortName, 30);
    addShareClasses(outputShortName.value, $('#shareClasses'), shareClassesOutputShort);
  });
  outputInHouseName.addEventListener('input', function(e) {
    displayLength(outputInHouseName, lenOutputInHouseName, 40);
    addShareClasses(outputInHouseName.value, $('#shareClasses'), shareClassesOutputInHouse);
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
    addShareClasses(outputName.value, $('#shareClasses'), shareClassesOutput);
    addShareClasses(outputShortName.value, $('#shareClasses'), shareClassesOutputShort);
    addShareClasses(outputInHouseName.value, $('#shareClasses'), shareClassesOutputInHouse);
  });
  inputObj.addEventListener('input', function(e) {
    displayLength(inputObj, lenObj, 2000);
    $('#linkTranslate').href = nameChecker.translateLink(inputObj.value);
  });
  $('#buttonObjUmlauts').addEventListener('click', function(e) {
    inputObj.value = nameChecker.replaceUmlauts(inputObj.value);
    displayLength(inputObj, lenObj, 2000);
    inputObj.select();
  });
  $('#buttonObjBreaks').addEventListener('click', function(e) {
    inputObj.value = nameChecker.removeBreaks(inputObj.value);
    displayLength(inputObj, lenObj, 2000);
    inputObj.select();
  });
  showRules.addEventListener('click', function(e) {
    if (!divRules.classList.contains('show')) {
      divRules.classList.add('show');
    } else {
      divRules.classList.remove('show');
    }
  });
  var comfyText = (function() {
      $('#shareClasses').addEventListener('input', autoExpand);

    function autoExpand(e, el) {
      var el = el || e.target;
      el.style.height = 'inherit';
      el.style.height = (el.scrollHeight + 4) + 'px';
    }
  })();
}());
