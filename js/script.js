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
  var shortenName = function(name, shareClasses, rulesUns, lengths) {
    var rulesTemp = Object.keys(rulesUns).sort(function(a, b) {
      return name.lastIndexOf(a) - name.lastIndexOf(b);
    });
    var rules = {};
    for (var i = 0; i < rulesTemp.length; i++) {
      rules[rulesTemp[i]] = rulesUns[rulesTemp[i]]
    }
    var shortenedNames = [];
    // add share classes for length calculation
    var nameWithShareclasses = addShareClasses(name, shareClasses);
    // find out longest possible name (with sc if any)
    var longest = name;
    if (nameWithShareclasses.length > 0) {
      longest = nameWithShareclasses.reduce(function(a, b) {
        return a.length > b.length ? a : b;
      });
    }
    // max length of share class to add
    var maxShareClassLen = longest.length - name.length;
    // lengths to shorten name to
    var shortenToLen = lengths.map(function(e) {
      return e - maxShareClassLen;
    });
    var x = 0;
    // shortening algorithm
    var algorithm = function(value, options, maxlen) {
      var len = value.length;
      if (len <= maxlen) {
        return value;
      } else {
        var newvalue = value;
        for (var prop in options) {
          if (options.hasOwnProperty(prop) && prop.length > options[prop].length) {
						var regex = new Regex(prop, 'gi')
            var pos = value.lastIndexOf(prop);
            if (pos > -1) {
              var oldstring = newvalue.substring(0, pos);
              var newstring = newvalue.substring(pos);
              newstring = newstring.replace(prop, options[prop]);
              newvalue = oldstring + newstring;
              newvalue = algorithm(newvalue, options, maxlen);
            };
          }
        }
        return newvalue;
      }
    };
    // shortening algorithm END
    // output
    for (var i = 0; i < shortenToLen.length; i++) {
      var short = algorithm(name, rules, shortenToLen[i]);
      shortenedNames.push(short);
    }
    return shortenedNames;
  };
  var shortenProcess = function(name, options, rules, shareClasses, lengths) {
    var shortenedName = name;
    // remove parentheses
    shortenedName = options.removeParens ? removeParens(shortenedName) : shortenedName;
    // replace umlauts
    shortenedName = options.replaceUmlauts ? replaceUmlauts(shortenedName) : shortenedName;
    // shorten name
    shortenedName = options.shortenName ? shortenName(shortenedName, shareClasses, rules, lengths) : [shortenedName, shortenedName, shortenedName];
    return {
      shortenedName: shortenedName[0],
      shortenedNameShort: shortenedName[1],
      shortenedNameInHouse: shortenedName[2],
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
(function init(lengths) {
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

  function selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function addShareClasses(name, sClassesIn, output, max) {
    var sClasses = sClassesIn.value.length > 0 ? sClassesIn.value.split('\n') : [];
    while (output.firstChild) {
      output.removeChild(output.firstChild);
    }
    let classesOutput = nameChecker.addShareClasses(name, sClasses);
    for (let i = 0; i < classesOutput.length; i++) {
      let lenId = output.id + '_' + i;
      let newShareClass = document.createElement('li');
      newShareClass.setAttribute('tabIndex', '0');
      newShareClass.setAttribute('contentEditable', 'true');
      let newShareClassText = document.createTextNode(classesOutput[i]);
      newShareClass.appendChild(newShareClassText);
      let newShareClassLen = document.createElement('span');
      newShareClassLen.setAttribute('id', lenId);
      newShareClassLen.setAttribute('data-tooltip', "Copy");
      displayLength(newShareClassText, newShareClassLen, max);
      output.appendChild(newShareClass);
      output.appendChild(newShareClassLen);
      newShareClassLen.addEventListener('click', function() {
        selectElementContents(newShareClass);
        try {
          let success = document.execCommand('copy');
          let msg = success ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
        } catch (e) {
          console.log('Unable to copy!');
        }
      })
    }
  }
  // EVENT LISTENERS
  var inputName = $('#inputName'), // INITIAL NAME INPUT
    outputName = $('#outputName'), // PROCESSED NAME OUTPUT
    outputShortName = $('#outputShortName'), // PROCESSED SHORT NAME OUTPUT
    outputInHouseName = $('#outputInHouseName'), // PROCESSED IN HOUSE NAME OUTPUT
    lenName = $('#lenName'), // NAME LENGTH
    inputObj = $('#inputObj'), // OBJECTIVE INPUT
    lenObj = $('#lenObj'), // OBJECTIVE LENGTH
    showRules = $('#showRules'), // RULES BUTTON
    divRules = $('.rules'), // RULES LIST
    shareClassesOutput = $('#shareClassesOutput'), // NAME WITH SC OUTPUT
    shareClassesShortOutput = $('#shareClassesShortOutput'), // SHORT NAME WITH SC OUTPUT
    shareClassesInHouseOutput = $('#shareClassesInHouseOutput'), // IN HOUSE NAME WITH SC OUTPUT
    shareClassesInput = $('#shareClasses'); // SHARE CLASSES INPUT
  function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'js/rules.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
  };
  var rules;
  loadJSON(function(response) {
    // Parse JSON string into object
    rules = JSON.parse(response);
  });
  // var rules = {
  //   'Pioneer': 'Pio',
  //   'Eastern': 'Ea',
  //   'Funds': 'Fd',
  //   'Stock': 'Stk',
  //   'long': 'ln',
  //   'bong': 'bn',
  //   'brain': 'brainananakjshfdkjdszh;',
  //   'Europe': 'Eur',
  //   'Austria': 'Aut',
  //   'a1': 'b',
  //   'a2': 'b',
  //   'a3': 'b',
  //   'a4': 'b',
  //   'a5': 'b',
  //   'a6': 'b',
  //   'a7': 'b',
  //   'a8': 'b',
  // };
  var displayAndAdd = function(output, lenout, lennum, shareClassesOutput) {
    var value = output.value;
    var length = lengths[lennum];
    displayLength(value, lenout, length);
    addShareClasses(value, shareClassesInput, shareClassesOutput, length);
  }
  inputName.addEventListener('input', function(e) {
    displayLength(inputName.value, lenName, lengths[0]);
  });
  outputName.addEventListener('input', function(e) {
    displayAndAdd(outputName, lenOutputName, 0, shareClassesOutput);
  });
  outputShortName.addEventListener('input', function(e) {
    displayAndAdd(outputShortName, lenOutputShortName, 1, shareClassesOutputShort);
  });
  outputInHouseName.addEventListener('input', function(e) {
    displayAndAdd(outputInHouseName, lenOutputInHouseName, 2, shareClassesOutputInHouse);
  });
  $('#buttonShorten').addEventListener('click', function(e) {
    var value = inputName.value;
    var options = {};
    options.replaceUmlauts = $('input[name="removeSpecial"]').checked;
    options.removeParens = $('input[name="removeParens"]').checked;
    options.shortenName = $('input[name="shortenNames"]').checked;
    var sClasses = shareClassesInput.value.length > 0 ? shareClassesInput.value.split('\n') : [];
    var shortened = nameChecker.shortenProcess(value, options, rules, sClasses, lengths);
    outputName.value = shortened.shortenedName;
    outputShortName.value = shortened.shortenedNameShort;
    outputInHouseName.value = shortened.shortenedNameInHouse;
    displayAndAdd(outputName, lenOutputName, 0, shareClassesOutput);
    displayAndAdd(outputShortName, lenOutputShortName, 1, shareClassesOutputShort);
    displayAndAdd(outputInHouseName, lenOutputInHouseName, 2, shareClassesOutputInHouse);
  });
  //OBJECTIVE
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
    shareClassesInput.addEventListener('input', autoExpand);

    function autoExpand(e, el) {
      var el = el || e.target;
      el.style.height = 'inherit';
      el.style.height = (el.scrollHeight + 4) + 'px';
    }
  })();
}([50, 30, 40]));
