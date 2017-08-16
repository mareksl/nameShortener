/*jshint esversion:6 */
/*jshint browser:true */
/*jshint strict:global */
'use strict';
const animation = (function() {
  function fadeOut(el) {
    el.classList.remove('notification--visible');
    const prevNotes = document.querySelectorAll('.notification');
    const arr = [];
    for (let i = prevNotes.length; i--; arr.unshift(prevNotes[i]));
    arr.reverse();
    for (let i = arr.indexOf(el) + 1; i < arr.length; i++) {
      let topValue = isNaN(parseInt(arr[i].style.top)) ? 0 : parseInt(arr[i].style.top);
      topValue -= el.computedHeight;
      arr[i].style.top = topValue + 'px';
    }
    el.addEventListener("transitionend", function(event) {
      el.remove();
    });
  }

  function notify(message, options) {
    options = options || {};
    const timeout = options.time || 2500;
    const notification = document.createElement('div');
    const text = document.createTextNode(message);
    const span = document.createElement('span');
    span.classList.add('notification__message');
    span.appendChild(text);
    notification.appendChild(span);
    notification.classList.add('notification');
    if (options.type !== undefined) {
      notification.classList.add('notification--' + options.type);
    }
    if (options.type !== 'error' && options.type !== 'confirm') {
      setTimeout(function() {
        fadeOut(notification);
      }, timeout);
    }
    if (options.type === 'error') {
      const close = document.createElement('button');
      close.classList.add('notification__close');
      close.innerHTML = '&#10060;';
      close.setAttribute('aria-label', 'Close Notification');
      close.tabIndex = 1;
      close.addEventListener('click', function() {
        fadeOut(notification);
      });
      notification.appendChild(close);
    }
    if (options.type === 'confirm') {
      const buttons = document.createElement('div');
      buttons.classList.add('notification__buttons');
      const buttonOK = document.createElement('button');
      const buttonCancel = document.createElement('button');
      buttonOK.classList.add('button', 'button--narrow');
      buttonOK.innerHTML = 'OK';
      buttonOK.addEventListener('click', function() {
        options.callback();
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
    }
    document.body.appendChild(notification);
    notification.computedHeight = notification.offsetHeight + parseFloat(window.getComputedStyle(notification, null).getPropertyValue('margin-top')) / 2;
    const prevNotes = document.querySelectorAll('.notification');
    for (let i = 0; i < prevNotes.length - 1; ++i) {
      let topValue = isNaN(parseInt(prevNotes[i].style.top)) ? 0 : parseInt(prevNotes[i].style.top);
      topValue += notification.computedHeight;
      prevNotes[i].style.top = topValue + 'px';
    }
    setTimeout(function() {
      notification.classList.add('notification--visible');
    }, 0);
  }
  return {
    notify: notify
  };
}());
const nameChecker = (function() {
  function maxLength(target, max) {
    return target.length > max;
  }

  function replaceLetter(string, options) {
    var value = string;
    for (let letter in options) {
      if (options.hasOwnProperty(letter)) {
        const regex = new RegExp(letter, 'g');
        value = value.replace(regex, options[letter]);
      }
    }
    return value;
  }

  function replaceUmlauts(string) {
    return replaceLetter(string, {
      '\u00c4': 'Ae',
      '\u00d6': 'Oe',
      '\u00dc': 'ue',
      '\u00e4': 'ae',
      '\u00f6': 'oe',
      '\u00fc': 'ue',
      '\u00df': 'ss',
    });
  }

  function replaceSlashes(string) {
    return replaceLetter(string, {
      '/': '%2F'
    });
  }

  function translateLink(string) {
    return 'https://translate.google.com/#auto/en/' + replaceSlashes(encodeURI(removeBreaks(string)));
  }

  function removeParens(string) {
    return replaceLetter(string, {
      '[()]': ''
    });
  }

  function removeBreaks(string) {
    return replaceLetter(string, {
      '\n': ' '
    });
  }

  function removeDashes(string) {
    return replaceLetter(string, {
      '-': ' '
    });
  }

  function removeWhitespace(string) {
    return replaceLetter(string, {
      '\\s': ''
    });
  }

  function removeMultipleWhitespace(string) {
    return replaceLetter(string, {
      '\\s\\s\+': ' '
    });
  }

  function removeRegex(string, regex) {
    const options = {};
    options[regex] = '';
    return replaceLetter(string, options);
  }

  function addShareClasses(name, sClasses) {
    const output = [];
    for (let i = 0; i < sClasses.length; i++) {
      if (sClasses[i] !== '') {
        output.push(name + ' ' + sClasses[i]);
      }
    }
    return output;
  }

  function shortenName(name, shareClasses, rules, lengths) {
    const shortenedNames = [];
    const nameWithShareclasses = addShareClasses(name, shareClasses);
    var longest = name;
    if (nameWithShareclasses.length > 0) {
      longest = nameWithShareclasses.reduce(function(a, b) {
        return a.length > b.length ? a : b;
      });
    }
    const maxShareClassLen = longest.length - name.length;
    const shortenToLen = lengths.map(function(e) {
      return e - maxShareClassLen;
    });

    function shorten(value, options, maxlen) {
      const len = value.length;
      if (len <= maxlen) {
        return value;
      } else {
        const searches = [];
        for (let prop in options) {
          if (options.hasOwnProperty(prop) && prop.length > options[prop].replacements[0].length) {
            const regex = new RegExp(prop, 'gi');
            var match;
            while ((match = regex.exec(value)) != null) {
              const result = [];
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
            const aPriority = a[1].priority;
            const bPriority = b[1].priority;
            const aIndex = a[2];
            const bIndex = b[2];
            if (aPriority == bPriority) {
              return bIndex - aIndex;
            } else {
              return bPriority - aPriority;
            }
          });
          const pos = searches[0][2];
          const oldString = newvalue.substring(0, pos);
          const newString = newvalue.substring(pos);
          const replacedString = newString.replace(searches[0][0], searches[0][1].replacements[0]);
          newvalue = oldString + replacedString;
          newvalue = shorten(newvalue, options, maxlen);
          return newvalue;
        }
      }
    }
    for (let i = 0; i < shortenToLen.length; i++) {
      const short = shorten(name, rules, shortenToLen[i]);
      shortenedNames.push(short);
    }
    return shortenedNames;
  }

  function shortenProcess(name, options, rules, shareClasses, lengths, regex) {
    var shortenedName = name;
		shortenedName = options.removeRegex ? removeRegex(shortenedName, regex) : shortenedName;
    shortenedName = options.removeParens ? removeParens(shortenedName) : shortenedName;
    shortenedName = options.removeDashes ? removeDashes(shortenedName) : shortenedName;
    shortenedName = options.removeWhitespace ? removeWhitespace(shortenedName) : shortenedName;
    shortenedName = options.replaceUmlauts ? replaceUmlauts(shortenedName) : shortenedName;
		shortenedName = removeMultipleWhitespace(shortenedName);
    shortenedName = options.shortenName ? shortenName(shortenedName, shareClasses, rules, lengths) : [shortenedName, shortenedName, shortenedName];
    for (let i = 0; i < shortenedName.length; i++) {
      const nameType = i === 2 ? 'In-House' : i === 1 ? 'Short' : '';
      var nameWithShareclasses;
      if (shareClasses.length > 0) {
        nameWithShareclasses = addShareClasses(shortenedName[i], shareClasses).reduce(function(a, b) {
          return a.length > b.length ? a : b;
        });
      } else {
        nameWithShareclasses = shortenedName[i];
      }
      if (nameWithShareclasses.length > lengths[i]) {
        animation.notify('Couldn\'t fully shorten ' + nameType + ' Name.', {
          type: 'warning'
        });
      }
    }
    return {
      shortenedName: shortenedName[0],
      shortenedNameShort: shortenedName[1],
      shortenedNameInHouse: shortenedName[2],
    };
  }
  Object.prototype.hasOwnPropertyCI = function(prop) {
    return Object.keys(this).filter(function(v) {
      return v.toLowerCase() === prop.toLowerCase();
    }).length > 0;
  };
  return {
    replaceUmlauts: replaceUmlauts,
    maxLength: maxLength,
    removeBreaks: removeBreaks,
    translateLink: translateLink,
    addShareClasses: addShareClasses,
    shortenProcess: shortenProcess
  };
}());
const loadRules = (function() {
  function load(createRules) {
    localStorage.localRulesSaved = true;
    if (typeof localStorage.localRules !== 'undefined') {
      createRules(localStorage.localRules);
      animation.notify('Local rules loaded!', {
        type: 'success'
      });
    } else {
      animation.notify('No local rules found!', {
        type: 'warning'
      });
      const xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', 'js/rules.json', true);
      xobj.onreadystatechange = function() {
        if (xobj.readyState == 4) {
          if (xobj.status == "200") {
            createRules(xobj.responseText);
            animation.notify('Default rules loaded!', {
              type: 'success'
            });
          } else {
            createRules("{}");
            animation.notify('No default rules found! Please add own rules.', {
              type: 'error'
            });
          }
        }
      };
      xobj.send(null);
    }
  }

  function modify(rules, status, callback) {
    if (status === 'saved') {
      localStorage.localRules = JSON.stringify(rules);
      localStorage.localRulesSaved = true;
    } else if (status === 'changed') {
      localStorage.localRulesSaved = false;
    }
    callback();
  }

  function uploadRules(e, createRules) {
    const fileTypes = ['json', 'txt'];
    const maxSize = 1000000;
    const input = e.target;
    if (input.files && input.files[0]) {
      const extension = input.files[0].name.split('.').pop().toLowerCase();
      if (fileTypes.indexOf(extension) < 0) {
        animation.notify('Only .json and .txt files allowed!', {
          type: 'error'
        });
      } else if (input.files[0].size > maxSize) {
        animation.notify('Max. ' + Math.floor(maxSize / 1000000) + 'MB allowed', {
          type: 'error'
        });
      } else {
        const reader = new FileReader();
        reader.onloadstart = function(e) {
          animation.notify('Uploading rules.');
        };
        reader.onerror = function(e) {
          animation.notify('Upload not successful.', {
            type: 'error'
          });
        };
        reader.onload = function() {
          createRules(reader.result);
          animation.notify('Rules uploaded successfully.', {
            type: 'success'
          });
        };
        reader.readAsText(input.files[0]);
      }
    }
  }
  return {
    load: load,
    modify: modify,
    uploadRules: uploadRules
  };
}());
const elements = (function() {
  return {
    inputName: document.querySelector('#inputName'),
    outputName: document.querySelector('#outputName'),
    outputShortName: document.querySelector('#outputShortName'),
    outputInHouseName: document.querySelector('#outputInHouseName'),
    lenOutputName: document.querySelector('#lenOutputName'),
    lenOutputShortName: document.querySelector('#lenOutputShortName'),
    lenOutputInHouseName: document.querySelector('#lenOutputInHouseName'),
    lenName: document.querySelector('#lenName'),
    inputObj: document.querySelector('#inputObj'),
    lenObj: document.querySelector('#lenObj'),
    showRules: document.querySelector('#showRules'),
    divRules: document.querySelector('#sectionRules'),
    shareClassesOutput: document.querySelector('#shareClassesOutput'),
    shareClassesShortOutput: document.querySelector('#shareClassesShortOutput'),
    shareClassesInHouseOutput: document.querySelector('#shareClassesInHouseOutput'),
    shareClassesInput: document.querySelector('#shareClasses'),
    btnsRules: document.querySelector('#btnsRules'),
    btnSaveRules: document.querySelector('#btnSaveRules'),
    btnResetRules: document.querySelector('#btnResetRules'),
    btnCloseRules: document.querySelector('#btnCloseRules'),
    btnRemoveRules: document.querySelector('#btnRemoveRules'),
    btnDownloadRules: document.querySelector('#btnDownloadRules'),
    btnUploadRules: document.querySelector('#btnUploadRules'),
    rulesSaved: document.querySelector('#rulesSaved'),
    tableRules: document.querySelector('#tableRules'),
    tableBody: document.querySelector('#tableRules tbody'),
    btnAddRule: document.querySelector('#btnAddRule'),
    buttonShorten: document.querySelector('#buttonShorten'),
    addRuleKey: document.querySelector('#addRuleKey'),
    addRuleValue: document.querySelector('#addRuleValue'),
    addRulePriority: document.querySelector('#addRulePriority'),
    btnObjUmlauts: document.querySelector('#buttonObjUmlauts'),
    btnObjBreaks: document.querySelector('#buttonObjBreaks'),
    linkTranslate: document.querySelector('#linkTranslate'),
    btnExportNames: document.querySelector('#btnExportNames'),
    removeSpecial: document.querySelector('#removeSpecial'),
    removeParens: document.querySelector('#removeParens'),
    shortenNames: document.querySelector('#shortenNames'),
    removeDashes: document.querySelector('#removeDashes'),
    removeWhitespace: document.querySelector('#removeWhitespace'),
    manualWrapper: document.querySelector('#manualWrapper'),
    manualClose: document.querySelector('#manualClose'),
    manualOpen: document.querySelector('#manualOpen'),
    removeRegex: document.querySelector('#removeRegex')
  };
}());
(function(lengths) {
  var rules;

  function displayLength(input, output, max) {
    output.innerHTML = input.length;
    if (nameChecker.maxLength(input, max)) {
      if (!output.classList.contains('length--warning')) {
        output.classList.add('length--warning');
      }
    } else {
      if (output.classList.contains('length--warning')) {
        output.classList.remove('length--warning');
      }
    }
  }

  function selectElementContents(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function copyText(el) {
    selectElementContents(el);
    try {
      let success = document.execCommand('copy');
      let msg = success ? 'successful' : 'unsuccessful';
      let status = success ? 'success' : 'error';
      animation.notify('Copying text was ' + msg + '!', {
        type: status
      });
    } catch (e) {
      animation.notify('Unable to copy!', {
        type: 'error'
      });
    }
  }

  function addShareClasses(name, sClassesIn, output, max) {
    const sClasses = sClassesIn.value.length > 0 ? sClassesIn.value.split('\n') : [];
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
        copyText(newShareClass);
      });
    }
  }

  function modifyRules(status) {
    loadRules.modify(rules, status, function() {
      if (status === 'saved') {
        animation.notify('Local rules saved!', {
          type: 'success'
        });
        elements.rulesSaved.innerHTML = '';
        elements.btnSaveRules.classList.remove('button--unsaved');
      } else if (status === 'changed') {
        elements.rulesSaved.innerHTML = '*';
        elements.btnSaveRules.classList.add('button--unsaved');
      }
    });
  }

  function addTableRow(tableBody, key, value, priority) {
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
  }

  function tableFromJSON(data, tableBody) {
    tableBody.innerHTML = '';
    try {
      for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
          addTableRow(tableBody, prop, data[prop].replacements[0], data[prop].priority);
        }
      }
    } catch (e) {
      animation.notify('There was a problem loading local rules. Please reset to default or remove all rules.', {
        type: 'error'
      });
    }
  }

  function load() {
    loadRules.load(function(response) {
      rules = JSON.parse(response);
      tableFromJSON(rules, elements.tableBody);
    });
  }
  load();
  elements.btnAddRule.addEventListener('click', function(e) {
    const key = elements.addRuleKey.value;
    const value = elements.addRuleValue.value;
    const priority = elements.addRulePriority.value <= 99 ? elements.addRulePriority.value : 99;
    if (key !== '' && value !== '') {
      if (rules.hasOwnPropertyCI(key)) {
        animation.notify('Rule already exists!', {
          type: 'warning'
        });
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
      animation.notify('Please check rule input!', {
        type: 'warning'
      });
    }
  });
  elements.addRulePriority.addEventListener('input', function(e) {
    elements.addRulePriority.value = elements.addRulePriority.value.replace(/\D+/g, '');
  });
  (function listenRules() {
    elements.btnsRules.addEventListener('click', function(e) {
      switch (e.target) {
        case elements.btnSaveRules:
          modifyRules('saved');
          break;
        case elements.btnResetRules:
          animation.notify('Do you want to reset to default rules?', {
            type: 'confirm',
            callback: function() {
              animation.notify('Rules reset to default!');
              localStorage.removeItem('localRules');
              localStorage.removeItem('localRulesSaved');
              load();
            }
          });
          break;
        case elements.btnRemoveRules:
          animation.notify('Do you want to remove all rules?', {
            type: 'confirm',
            callback: function() {
              rules = {};
              while (elements.tableBody.firstChild) {
                elements.tableBody.removeChild(elements.tableBody.firstChild);
              }
              modifyRules('changed');
            }
          });
          break;
        case elements.btnDownloadRules:
          const exportRules = "data:text/json;charset=utf-8," + JSON.stringify(rules);
          const encodedUri = encodeURI(exportRules);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "rules.json");
          animation.notify('Exporting to JSON!');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        case elements.btnUploadRules:
          e.target.value = null;
          break;
        case elements.btnCloseRules:
          elements.divRules.classList.remove('section__rules--show');
          break;
      }
    });
    elements.btnUploadRules.addEventListener('change', function(e) {
      loadRules.uploadRules(e, function(response) {
        rules = JSON.parse(response);
        tableFromJSON(rules, elements.tableBody);
        modifyRules('changed');
      });
    });
    window.addEventListener('beforeunload', function(e) {
      if (localStorage.localRulesSaved === 'false') {
        const dialogText = 'You have unsaved rules!';
        e.returnValue = dialogText;
        return dialogText;
      }
    });
  }());

  function displayAndAdd(output, lenout, lennum, shareClassesOutput) {
    const value = output.value;
    const length = lengths[lennum];
    displayLength(value, lenout, length);
    addShareClasses(value, elements.shareClassesInput, shareClassesOutput, length);
  }
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
    const value = elements.inputName.value;
    const options = {};
    options.replaceUmlauts = elements.removeSpecial.checked;
    options.removeParens = elements.removeParens.checked;
    options.shortenName = elements.shortenNames.checked;
    options.removeDashes = elements.removeDashes.checked;
    options.removeWhitespace = elements.removeWhitespace.checked;
    options.removeRegex = elements.removeRegex.value !== '' ? true : false;
    const regex = elements.removeRegex.value;
    const sClasses = elements.shareClassesInput.value.length > 0 ? elements.shareClassesInput.value.split('\n') : [];
    const shortened = nameChecker.shortenProcess(value, options, rules, sClasses, lengths, regex);
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

  function autoExpand(e) {
    const el = e.target;
    el.style.height = 'inherit';
    el.style.height = (el.scrollHeight + 4) + 'px';
  }
  elements.shareClassesInput.addEventListener('input', autoExpand);
  const createCsvArray = function() {
    const nameFields = elements.shareClassesOutput.getElementsByTagName('li');
    const nameFieldsShort = elements.shareClassesShortOutput.getElementsByTagName('li');
    const nameFieldsInHouse = elements.shareClassesInHouseOutput.getElementsByTagName('li');
    if (nameFields.length === 0 && nameFieldsShort.length === 0 && nameFieldsInHouse.length === 0) {
      animation.notify('Nothing to export!', {
        type: 'error'
      });
    } else {
      const array = [
        ['Name', 'Short Name', 'In-House Name']
      ];
      for (let i = 0; i < nameFields.length; i++) {
        let names = [];
        names[0] = (nameFields[i].innerHTML);
        names[1] = (nameFieldsShort[i].innerHTML);
        names[2] = (nameFieldsInHouse[i].innerHTML);
        array.push(names);
      }
      const lineArray = [];
      array.forEach(function(infoArray, index) {
        const line = infoArray.join(",");
        lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      });
      const csvContent = lineArray.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "names.csv");
      animation.notify('Exporting to CSV!');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  elements.btnExportNames.addEventListener('click', function() {
    createCsvArray();
  });
  elements.manualOpen.addEventListener('click', function(e) {
    elements.manualWrapper.style.display = 'flex';
    elements.manualWrapper.classList.add('manual--visible');
  });
  elements.manualClose.addEventListener('click', function(e) {
    elements.manualWrapper.classList.remove('manual--visible');
    elements.manualWrapper.addEventListener("transitionend", function(event) {});
  });
  elements.manualWrapper.addEventListener('click', function(e) {
    if (e.target == elements.manualWrapper) {
      elements.manualWrapper.classList.remove('manual--visible');
      elements.manualWrapper.addEventListener("transitionend", function(event) {});
    }
  });
}([50, 30, 40]));
