# Fund Name Shortener
## Instructions

The Fund Name Shortener app can be used to shorten the names of funds according to internal limitations and add share class symbols in a uniform way.

The app uses predefined rules to shorten the name. The rules are processed in **descending** order by priority. If two or more rules have the same priority value, they are processed from **last** occurrence **to first**.

If the app isn't able to sufficiently shorten the name, you can manually edit the output.

* * *

1.  Type the fund name in the input box
2.  Edit rules <small>(optional)</small>

    English language rules are loaded by default. You can add/remove single rules, remove all rules or reset to default rules.

    When you click "Save", the rules will be saved to your **local storage**, which is specific to the browser you are currently using. Your rules will not be saved on a different browser.

3.  Choose options
4.  Add [Regular Expression](http://www.regular-expressions.info/ "Learn more about Regular Expressions.") to remove from name. <small>(optional)</small>
5.  Add share classes - each on new line <small>(optional)</small>
6.  **Click "Shorten"**
7.  Export to csv <small>(optional)</small>

* * *

The objective section of the shortener can help you with removing line breaks and umlauts. The Translate link sends you to the Google Translate website, pastes the input text and detects the language.

* * *

You can submit issues [here](https://gitreports.com/issue/mareksl/nameShortener/ "Submit an issue."). Please use this option sparingly. You can also contact me directly with any issues or suggestions.


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/mareksl/nameShortener/blob/master/LICENSE)
