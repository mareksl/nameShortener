var nameChecker = (function() {
  'use strict';
  // CHECK LENGTH
  var lengthCheck = function(target) {
    return target.length;
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
  var shortenName = function(name, rules) {
    return replaceLetter(name, rules);
  };
  var shortenProcess = function(name, options, rules, shareClasses) {
    // remove parentheses, replace umlauts
    name = options.removeParens ? removeParens(name) : name;
    name = options.replaceUmlauts ? replaceUmlauts(name) : name;
    // add the share classes
    var nameWithShareclasses = addShareClasses(name, shareClasses);
    // shorten name
    name = options.shortenName ? shortenName(name, rules) : name;
    var shortenedName = name;
    return {
      shortenedName: shortenedName,
      // shortenedNameShort: shortenedNameShort,
      // shortenedNameInHouse: shortenedNameInHouse,
      // shortenedNameWithShareClasses: shortenedNameWithShareClasses,
      // shortenedNameShortWithShareClasses: shortenedNameShortWithShareClasses,
      // shortenedNameInHouseWithShareClasses: shortenedNameInHouseWithShareClasses
    };
  };
  //RETURN OBJECT
  return {
    lengthCheck: lengthCheck,
    replaceUmlauts: replaceUmlauts,
    removeParens: removeParens,
    maxLength: maxLength,
    removeBreaks: removeBreaks,
    translateLink: translateLink,
    addShareClasses: addShareClasses,
    shortenProcess: shortenProcess
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

  function addShareClasses(name, sClassesIn, output, max) {
    var sClasses = sClassesIn.value.split('\n');
    while (output.firstChild) {
      output.removeChild(output.firstChild);
    }
    var classesOutput = nameChecker.addShareClasses(name, sClasses);
    for (var i = 0; i < classesOutput.length; i++) {
      var lenId = output.id + '_' + i;
      var newShareClass = document.createElement('li');
      newShareClass.setAttribute('tabIndex', '0');
      newShareClass.setAttribute('contentEditable', 'true');
      var newShareClassText = document.createTextNode(classesOutput[i]);
      newShareClass.appendChild(newShareClassText);
      var newShareClassLen = document.createElement('span');
      newShareClassLen.setAttribute('id', lenId);
      displayLength(newShareClassText, newShareClassLen, max);
      output.appendChild(newShareClass);
      output.appendChild(newShareClassLen);
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
    displayLength(inputName.value, lenName, 50);
  });
  outputName.addEventListener('input', function(e) {
    displayLength(outputName.value, lenOutputName, 50);
    addShareClasses(outputName.value, $('#shareClasses'), shareClassesOutput, 50);
  });
  outputShortName.addEventListener('input', function(e) {
    displayLength(outputShortName.value, lenOutputShortName, 30);
    addShareClasses(outputShortName.value, $('#shareClasses'), shareClassesOutputShort, 30);
  });
  outputInHouseName.addEventListener('input', function(e) {
    displayLength(outputInHouseName.value, lenOutputInHouseName, 40);
    addShareClasses(outputInHouseName.value, $('#shareClasses'), shareClassesOutputInHouse, 40);
  });
  $('#buttonShorten').addEventListener('click', function(e) {
    var value = inputName.value;
    var options = {};
    options.replaceUmlauts = $('input[name="removeSpecial"]').checked;
    options.removeParens = $('input[name="removeParens"]').checked;
    value = nameChecker.shortenProcess(value, options, undefined, $('#shareClasses')).shortenedName;
    outputName.value = value;
    outputShortName.value = value;
    outputInHouseName.value = value;
    displayLength(outputName.value, lenOutputName, 50);
    displayLength(outputShortName.value, lenOutputShortName, 30);
    displayLength(outputInHouseName.value, lenOutputInHouseName, 40);
    addShareClasses(outputName.value, $('#shareClasses'), shareClassesOutput, 50);
    addShareClasses(outputShortName.value, $('#shareClasses'), shareClassesOutputShort, 30);
    addShareClasses(outputInHouseName.value, $('#shareClasses'), shareClassesOutputInHouse, 40);
  });
  inputObj.addEventListener('input', function(e) {
    displayLength(inputObj.value, lenObj, 2000);
    $('#linkTranslate').href = nameChecker.translateLink(inputObj.value);
  });
  $('#buttonObjUmlauts').addEventListener('click', function(e) {
    inputObj.value = nameChecker.replaceUmlauts(inputObj.value);
    displayLength(inputObj.value, lenObj, 2000);
    inputObj.select();
  });
  $('#buttonObjBreaks').addEventListener('click', function(e) {
    inputObj.value = nameChecker.removeBreaks(inputObj.value);
    displayLength(inputObj.value, lenObj, 2000);
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
