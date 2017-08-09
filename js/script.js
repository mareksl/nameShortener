/*jshint esversion: 6 */
var animation = (function() {
  var fadeOut = function(el) {
    el.classList.remove('notification--visible');
    var prevNotes = document.querySelectorAll('.notification');
    var arr = [];
    for (var i = prevNotes.length; i--; arr.unshift(prevNotes[i]));
    arr.reverse();
    for (let i = arr.indexOf(el) + 1; i < arr.length; i++) {
      let topValue = isNaN(parseInt(arr[i].style.top)) ? 0 : parseInt(arr[i].style.top);
      topValue -= el.computedHeight;
      arr[i].style.top = topValue + 'px';
    }
    el.addEventListener("transitionend", function(event) {
      el.remove();
    });
  };
  var notify = function(string, type, callback) {
    var timeout = 2500;
    var notification = document.createElement('div');
    var text = document.createTextNode(string);
    var span = document.createElement('span');
    span.classList.add('notification__message');
    span.appendChild(text);
    notification.appendChild(span);
    notification.classList.add('notification');
    switch (type) {
      case 'success':
        notification.classList.add('notification--success');
        setTimeout(function() {
          fadeOut(notification);
        }, timeout);
        break;
      case 'warning':
        notification.classList.add('notification--warning');
        setTimeout(function() {
          fadeOut(notification);
        }, timeout);
        break;
      case 'error':
        notification.classList.add('notification--error');
        var close = document.createElement('button');
        close.classList.add('notification__close');
        close.tabIndex = 1;
        close.addEventListener('click', function() {
          fadeOut(notification);
        });
        span.appendChild(close);
        break;
      case 'confirm':
        notification.classList.add('notification--confirm');
        var buttons = document.createElement('div');
        buttons.classList.add('notification__buttons');
        var buttonOK = document.createElement('button');
        var buttonCancel = document.createElement('button');
        buttonOK.classList.add('button', 'button--narrow');
        buttonOK.innerHTML = 'OK';
        buttonOK.addEventListener('click', function() {
          callback();
          fadeOut(notification);
        });
        buttonCancel.classList.add('button', 'button--narrow');
        buttonCancel.innerHTML = 'Cancel';
        buttonCancel.addEventListener('click', function() {
          fadeOut(notification);
        });
        buttons.appendChild(buttonOK);
        buttons.appendChild(buttonCancel);
        notification.appendChild(buttons);
        break;
      default:
        setTimeout(function() {
          fadeOut(notification);
        }, timeout);
    }
    document.body.appendChild(notification);
    notification.computedHeight = notification.offsetHeight + parseFloat(window.getComputedStyle(notification, null).getPropertyValue('margin-top')) / 2;
    var prevNotes = document.querySelectorAll('.notification');
    for (let i = 0; i < prevNotes.length - 1; ++i) {
      let topValue = isNaN(parseInt(prevNotes[i].style.top)) ? 0 : parseInt(prevNotes[i].style.top);
      topValue += notification.computedHeight;
      prevNotes[i].style.top = topValue + 'px';
    }
    setTimeout(function() {
      notification.classList.add('notification--visible');
    }, 0);
  };
  return {
    notify: notify
  };
}());
//-----------------------------------------------------------
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
  //REMOVE DASHES
  var removeDashes = function(string) {
    return replaceLetter(string, {
      '-': ' ',
      '\\s\\s\+': ' '
    });
  };
  //REMOVE WHITESPACE
  var removeWhitespace = function(string) {
    return replaceLetter(string, {
      '\\s': ''
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
  var shortenName = function(name, shareClasses, rules, lengths) {
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
    // shortening algorithm
    var shorten = function(value, options, maxlen) {
      var len = value.length;
      if (len <= maxlen) {
        return value;
      } else {
        var searches = [];
        for (var prop in options) {
          if (options.hasOwnProperty(prop) && prop.length > options[prop].replacements[0].length) {
            var regex = new RegExp(prop, 'gi');
            var match;
            while ((match = regex.exec(value)) != null) {
              var result = [];
              result.push(match);
              result.push(options[prop]);
              result.push(match.index);
              searches.push(result);
            }
          }
        }
        if (searches.length < 1) {
          return value;
        } else {
          var newvalue = value;
          searches.sort(function(a, b) {
            var aPriority = a[1].priority,
              bPriority = b[1].priority,
              aIndex = a[2],
              bIndex = b[2];
            if (aPriority == bPriority) {
              return bIndex - aIndex;
            } else {
              return bPriority - aPriority;
            }
          });
          var pos = searches[0][2];
          var oldstring = newvalue.substring(0, pos);
          var newstring = newvalue.substring(pos);
          newstring = newstring.replace(searches[0][0], searches[0][1].replacements[0]);
          newvalue = oldstring + newstring;
					console.log(1);
          newvalue = shorten(newvalue, options, maxlen);
          return newvalue;
        }
      }
    };
    // shortening algorithm END
    // output
    for (let i = 0; i < shortenToLen.length; i++) {
      var short = shorten(name, rules, shortenToLen[i]);
      shortenedNames.push(short);
    }
    return shortenedNames;
  };
  var shortenProcess = function(name, options, rules, shareClasses, lengths) {
    var shortenedName = name;
    // remove parentheses
    shortenedName = options.removeParens ? removeParens(shortenedName) : shortenedName;
    // remove dashes
    shortenedName = options.removeDashes ? removeDashes(shortenedName) : shortenedName;
    // remove whitespace
    shortenedName = options.removeWhitespace ? removeWhitespace(shortenedName) : shortenedName;
    // replace umlauts
    shortenedName = options.replaceUmlauts ? replaceUmlauts(shortenedName) : shortenedName;
    // shorten name
    shortenedName = options.shortenName ? shortenName(shortenedName, shareClasses, rules, lengths) : [shortenedName, shortenedName, shortenedName];
    for (var i = 0; i < shortenedName.length; i++) {
      var type = i === 2 ? 'In-House' : i === 1 ? 'Short' : '';
      if (shareClasses.length > 0) {
        var nameWithShareclasses = addShareClasses(shortenedName[i], shareClasses).reduce(function(a, b) {
          return a.length > b.length ? a : b;
        });
      } else {
        var nameWithShareclasses = shortenedName[i];
      }
      if (nameWithShareclasses.length > lengths[i]) {
        animation.notify('Couldn\'t fully shorten ' + type + ' Name.', 'warning');
      }
    }
    return {
      shortenedName: shortenedName[0],
      shortenedNameShort: shortenedName[1],
      shortenedNameInHouse: shortenedName[2],
    };
  };
  Object.prototype.hasOwnPropertyCI = function(prop) {
    return Object.keys(this).filter(function(v) {
      return v.toLowerCase() === prop.toLowerCase();
    }).length > 0;
  };
  //RETURN OBJECT
  return {
    lengthCheck: lengthCheck,
    replaceUmlauts: replaceUmlauts,
    maxLength: maxLength,
    removeBreaks: removeBreaks,
    translateLink: translateLink,
    addShareClasses: addShareClasses,
    shortenProcess: shortenProcess
  };
}());
//-----------------------------------------------------------
var loadRules = (function() {
  var load = function(createRules) {
    localStorage.localRulesSaved = true;
    if (typeof localStorage.localRules !== 'undefined') {
      createRules(localStorage.localRules);
      animation.notify('Local rules loaded!', 'success');
    } else {
      animation.notify('No local rules found!', 'warning');
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', 'js/rules.json', true); // Replace 'my_data' with the path to your file
      xobj.onreadystatechange = function() {
        if (xobj.readyState == 4) {
          if (xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            createRules(xobj.responseText);
            animation.notify('Default rules loaded!', 'success');
          } else {
            createRules("{}");
            animation.notify('No default rules found! Please add own rules.', 'error');
          }
        }
      };
      xobj.send(null);
    }
  };
  var modify = function(rules, status, callback) {
    if (status === 'saved') {
      localStorage.localRules = JSON.stringify(rules);
      localStorage.localRulesSaved = true;
    } else if (status === 'changed') {
      localStorage.localRulesSaved = false;
    }
    callback();
  };
  return {
    load: load,
    modify: modify
  };
}());
//-----------------------------------------------------------
var elements = (function() {
  'use strict';
  // SELECTOR
  var $ = function(el, context) {
    context = context || document;
    return context.querySelector(el);
  };
  return {
    inputName: $('#inputName'), // INITIAL NAME INPUT
    outputName: $('#outputName'), // PROCESSED NAME OUTPUT
    outputShortName: $('#outputShortName'), // PROCESSED SHORT NAME OUTPUT
    outputInHouseName: $('#outputInHouseName'), // PROCESSED IN HOUSE NAME OUTPUT
    lenOutputName: $('#lenOutputName'), // PROCESSED NAME OUTPUT
    lenOutputShortName: $('#lenOutputShortName'), // PROCESSED SHORT NAME OUTPUT
    lenOutputInHouseName: $('#lenOutputInHouseName'),
    lenName: $('#lenName'), // NAME LENGTH
    inputObj: $('#inputObj'), // OBJECTIVE INPUT
    lenObj: $('#lenObj'), // OBJECTIVE LENGTH
    showRules: $('#showRules'), // RULES BUTTON
    divRules: $('#sectionRules'), // RULES LIST
    shareClassesOutput: $('#shareClassesOutput'), // NAME WITH SC OUTPUT
    shareClassesShortOutput: $('#shareClassesShortOutput'), // SHORT NAME WITH SC OUTPUT
    shareClassesInHouseOutput: $('#shareClassesInHouseOutput'), // IN HOUSE NAME WITH SC OUTPUT
    shareClassesInput: $('#shareClasses'), // SHARE CLASSES INPUT
    btnSaveRules: $('#btnSaveRules'),
    btnResetRules: $('#btnResetRules'),
    btnCloseRules: $('#btnCloseRules'),
    btnRemoveRules: $('#btnRemoveRules'),
    btnDownloadRules: $('#btnDownloadRules'),
    rulesSaved: $('#rulesSaved'),
    tableRules: $('#tableRules'),
    tableBody: $('tbody', tableRules),
    btnAddRule: $('#btnAddRule'),
    buttonShorten: $('#buttonShorten'),
    addRuleKey: $('#addRuleKey'),
    addRuleValue: $('#addRuleValue'),
    addRulePriority: $('#addRulePriority'),
    btnObjUmlauts: $('#buttonObjUmlauts'),
    btnObjBreaks: $('#buttonObjBreaks'),
    linkTranslate: $('#linkTranslate'),
    btnExportNames: $('#btnExportNames'),
    removeSpecial: $('#removeSpecial'),
    removeParens: $('#removeParens'),
    shortenNames: $('#shortenNames'),
    removeDashes: $('#removeDashes'),
    removeWhitespace: $('#removeWhitespace')
    // sectionReplace : $('#sectionReplace'),
    // replaceChars : $('#replaceChars');
  };
}());
//-----------------------------------------------------------
var init = (function(lengths) {
  'use strict';
  var rules;
  var displayLength = function(input, output, max) {
    output.innerHTML = nameChecker.lengthCheck(input);
    if (nameChecker.maxLength(input, max)) {
      if (!output.classList.contains('length--warning')) {
        output.classList.add('length--warning');
      }
    } else {
      if (output.classList.contains('length--warning')) {
        output.classList.remove('length--warning');
      }
    }
  };
  var selectElementContents = function(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  var addShareClasses = function(name, sClassesIn, output, max) {
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
      newShareClass.classList += "shareclass-list__item";
      let newShareClassText = document.createTextNode(classesOutput[i]);
      newShareClass.appendChild(newShareClassText);
      let newShareClassLen = document.createElement('span');
      newShareClassLen.setAttribute('id', lenId);
      newShareClassLen.setAttribute('data-tooltip', "Copy");
      newShareClassLen.classList += "shareclass-list__length";
      displayLength(newShareClassText, newShareClassLen, max);
      output.appendChild(newShareClass);
      output.appendChild(newShareClassLen);
      newShareClassLen.addEventListener('click', function() {
        selectElementContents(newShareClass);
        try {
          let success = document.execCommand('copy');
          let msg = success ? 'successful' : 'unsuccessful';
          let status = success ? 'success' : 'error';
          animation.notify('Copying text was ' + msg + '!', status);
        } catch (e) {
          animation.notify('Unable to copy!', 'error');
        }
      });
    }
  };
  var modifyRules = function(status) {
    loadRules.modify(rules, status, function() {
      if (status === 'saved') {
        animation.notify('Local rules saved!', 'success');
        elements.rulesSaved.innerHTML = '';
      } else if (status === 'changed') {
        elements.rulesSaved.innerHTML = '*';
      }
    });
  };
  var addTableRow = function(tableBody, key, value, priority) {
    let tableRow = document.createElement('tr');
    let tableCellKey = document.createElement('td');
    let tableCellValue = document.createElement('td');
    let tableCellPriority = document.createElement('td');
    let tableCellRemove = document.createElement('td');
    let tableButtonRemove = document.createElement('button');
    tableRow.classList += 'table-rules__row';
    tableCellKey.classList += 'table-rules__item';
    tableCellValue.classList += 'table-rules__item';
    tableCellPriority.classList += 'table-rules__item table-rules__item--narrower';
    tableCellRemove.classList += 'table-rules__item table-rules__item--narrow';
    tableButtonRemove.innerHTML = 'Remove';
    tableButtonRemove.classList += 'button button--intable';
    tableCellKey.innerHTML = key;
    tableCellValue.innerHTML = value;
    tableCellPriority.innerHTML = priority;
    tableCellRemove.appendChild(tableButtonRemove);
    tableRow.appendChild(tableCellKey);
    tableRow.appendChild(tableCellValue);
    tableRow.appendChild(tableCellPriority);
    tableRow.appendChild(tableCellRemove);
    tableBody.appendChild(tableRow);
    tableButtonRemove.addEventListener('click', function(e) {
      delete rules[key];
      modifyRules('changed');
      tableBody.removeChild(tableRow);
    });
  };
  var tableFromJSON = function(data, tableBody) {
    tableBody.innerHTML = '';
    for (let prop in data) {
      if (data.hasOwnProperty(prop)) {
        addTableRow(tableBody, prop, data[prop].replacements[0], data[prop].priority);
      }
    }
  };
  var load = function() {
    loadRules.load(function(response) {
      rules = JSON.parse(response);
      tableFromJSON(rules, elements.tableBody);
    });
  };
  load();
  elements.btnAddRule.addEventListener('click', function(e) {
    var key = elements.addRuleKey.value,
      value = elements.addRuleValue.value,
      priority = elements.addRulePriority.value <= 99 ? elements.addRulePriority.value : 99;
    if (key !== '' && value !== '') {
      if (rules.hasOwnPropertyCI(key)) {
        alert('Rule already exists!');
      } else {
        rules[key] = {
          "priority": priority,
          "replacements": [value]
        };
        modifyRules('changed');
        addTableRow(elements.tableBody, key, value, priority);
        elements.addRuleKey.value = '';
        elements.addRuleValue.value = '';
        elements.addRulePriority.value = '0';
      }
    } else {
      alert('Please check rule input!');
    }
  });
  elements.addRulePriority.addEventListener('input', function(e) {
    elements.addRulePriority.value = elements.addRulePriority.value.replace(/\D+/g, '');
  });
  elements.btnRemoveRules.addEventListener('click', function(e) {
    animation.notify('Do you want to remove all rules?', 'confirm', function() {
      rules = {};
      while (elements.tableBody.firstChild) {
        elements.tableBody.removeChild(elements.tableBody.firstChild);
      }
      modifyRules('changed');
    });
  });
  elements.btnSaveRules.addEventListener('click', function(e) {
    modifyRules('saved');
  });
  elements.btnResetRules.addEventListener('click', function(e) {
    animation.notify('Do you want to reset to default rules?', 'confirm', function() {
      animation.notify('Rules reset to default!');
      localStorage.removeItem('localRules');
      localStorage.removeItem('localRulesSaved');
      load();
    });
  });
  window.addEventListener('beforeunload', function(e) {
    if (localStorage.localRulesSaved === 'false') {
      var dialogText = 'You have unsaved rules!';
      e.returnValue = dialogText;
      return dialogText;
    }
  });
  var displayAndAdd = function(output, lenout, lennum, shareClassesOutput) {
    var value = output.value;
    var length = lengths[lennum];
    displayLength(value, lenout, length);
    addShareClasses(value, elements.shareClassesInput, shareClassesOutput, length);
  };
  elements.inputName.addEventListener('input', function(e) {
    displayLength(elements.inputName.value, elements.lenName, lengths[0]);
  });
  elements.inputName.addEventListener('keydown', function(e) {
    if (e.which === 13) {
      elements.buttonShorten.click();
    }
  });
  elements.outputName.addEventListener('input', function(e) {
    displayAndAdd(elements.outputName, elements.lenOutputName, 0, elements.shareClassesOutput);
  });
  elements.outputShortName.addEventListener('input', function(e) {
    displayAndAdd(elements.outputShortName, elements.lenOutputShortName, 1, elements.shareClassesShortOutput);
  });
  elements.outputInHouseName.addEventListener('input', function(e) {
    displayAndAdd(elements.outputInHouseName, elements.lenOutputInHouseName, 2, elements.shareClassesInHouseOutput);
  });
  elements.buttonShorten.addEventListener('click', function(e) {
    var value = elements.inputName.value;
    var options = {};
    options.replaceUmlauts = elements.removeSpecial.checked;
    options.removeParens = elements.removeParens.checked;
    options.shortenName = elements.shortenNames.checked;
    options.removeDashes = elements.removeDashes.checked;
    options.removeWhitespace = elements.removeWhitespace.checked;
    var sClasses = elements.shareClassesInput.value.length > 0 ? elements.shareClassesInput.value.split('\n') : [];
    var shortened = nameChecker.shortenProcess(value, options, rules, sClasses, lengths);
    elements.outputName.value = shortened.shortenedName;
    elements.outputShortName.value = shortened.shortenedNameShort;
    elements.outputInHouseName.value = shortened.shortenedNameInHouse;
    displayAndAdd(elements.outputName, elements.lenOutputName, 0, elements.shareClassesOutput);
    displayAndAdd(elements.outputShortName, elements.lenOutputShortName, 1, elements.shareClassesShortOutput);
    displayAndAdd(elements.outputInHouseName, elements.lenOutputInHouseName, 2, elements.shareClassesInHouseOutput);
  });
  //OBJECTIVE
  elements.inputObj.addEventListener('input', function(e) {
    displayLength(elements.inputObj.value, elements.lenObj, 2000);
    elements.linkTranslate.href = nameChecker.translateLink(elements.inputObj.value);
  });
  elements.btnObjUmlauts.addEventListener('click', function(e) {
    elements.inputObj.value = nameChecker.replaceUmlauts(elements.inputObj.value);
    displayLength(elements.inputObj.value, elements.lenObj, 2000);
    elements.inputObj.select();
  });
  elements.btnObjBreaks.addEventListener('click', function(e) {
    elements.inputObj.value = nameChecker.removeBreaks(elements.inputObj.value);
    displayLength(elements.inputObj.value, elements.lenObj, 2000);
    elements.inputObj.select();
  });
  elements.showRules.addEventListener('click', function(e) {
    if (!elements.divRules.classList.contains('section__rules--show')) {
      elements.divRules.classList.add('section__rules--show');
    } else {
      elements.divRules.classList.remove('section__rules--show');
    }
  });
  // elements.replaceChars.addEventListener('click', function(e) {
  // 	if (!elements.sectionReplace.classList.contains('section__rules--show')) {
  // 		elements.sectionReplace.classList.add('section__rules--show');
  // 	} else {
  // 		elements.sectionReplace.classList.remove('section__rules--show');
  // 	}
  // });
  elements.btnCloseRules.addEventListener('click', function(e) {
    elements.divRules.classList.remove('section__rules--show');
  });
  elements.btnDownloadRules.addEventListener('click', function(e) {
    var exportRules = "data:text/json;charset=utf-8," + JSON.stringify(rules);
    var encodedUri = encodeURI(exportRules);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rules.json");
    animation.notify('Exporting to JSON!');
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  });
  var comfyText = (function() {
    elements.shareClassesInput.addEventListener('input', autoExpand);

    function autoExpand(e) {
      var el = e.target;
      el.style.height = 'inherit';
      el.style.height = (el.scrollHeight + 4) + 'px';
    }
  })();
  var createCsvArray = function() {
    var nameFields = elements.shareClassesOutput.getElementsByTagName('li');
    var nameFieldsShort = elements.shareClassesShortOutput.getElementsByTagName('li');
    var nameFieldsInHouse = elements.shareClassesInHouseOutput.getElementsByTagName('li');
    if (nameFields.length === 0 && nameFieldsShort.length === 0 && nameFieldsInHouse.length === 0) {
      animation.notify('Nothing to export!', 'error');
    } else {
      var array = [
        ['Name', 'Short Name', 'In-House Name']
      ];
      for (var i = 0; i < nameFields.length; i++) {
        let names = [];
        names[0] = (nameFields[i].innerHTML);
        names[1] = (nameFieldsShort[i].innerHTML);
        names[2] = (nameFieldsInHouse[i].innerHTML);
        array.push(names);
      }
      var lineArray = [];
      array.forEach(function(infoArray, index) {
        var line = infoArray.join(",");
        lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      });
      var csvContent = lineArray.join("\n");
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "names.csv");
      animation.notify('Exporting to CSV!');
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);
    }
  };
  elements.btnExportNames.addEventListener('click', function() {
    createCsvArray();
  });
}([50, 30, 40]));
