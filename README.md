# TokenWise

![Screenshot](http://i.imgur.com/T3tYkKU.png)

**TokenWise** is a Chrome application for analyizing spending on MyFreeCams.com.

## Installation

* `git clone https://github.com/strabbit/TokenWise`
* Follow the instructions [for loading an unpacked extension](https://developer.chrome.com/extensions/getstarted#unpacked) from Google. (They also apply to unpacked applications).

## WHY ARE YOU ASKING FOR MY MFC PASSWORD??!@3!?

Your password is never stored. I am actually loading MFC's login page, directly from MFC inside of a WebView. This is required because we scrape the information about the tokens you spent from a page in the my account section of MFC. Not only is your password never stored, but the application never touches it. All login is handled by the WebView and the WebView alone. Don't believe me? Look at the code for yourself!

## Why don't you just publish this to the Chrome Store so that I don't have to install this as a developer?

You're free to submit your fork of this project to the Chrome store (a link back to this repo would be appreciated), but I figured that 1) Google probably wouldn't approve this, 2) MFC might not appreciate this living on the store, and 3) ordinary users might be scared off by the login dialog and that developers would be more properly able to discern that there's no funny business going on.


## Why is the code so bad?

I wrote this application in under a day, and it's also my first Chrome application, so it's full of spaghetti code. Some libraries were added mid-development and I didn't go back and update exisiting code to match the style of new code. No apologies for that. Please fork this and submit pull requests if you'd like to help clean this up. Issues are welcome, pull requests are better :)


## 3rd Party Resources

* [Bootstrap 3.3.2](http://getbootstrap.com)
* [jQuery 2.1.3](http://jquery.com/)
* [Datepicker for Bootstrap v1.4.0](https://github.com/eternicode/bootstrap-datepicker)
* [Dexie.js](http://www.dexie.org/)
* [Stupid jQuery Table Sort](http://joequery.github.io/Stupid-Table-Plugin/)
* [Application Icon](https://www.iconfinder.com/icons/17018/cash_lock_money_safe_vault_yuan_icon#size=128)

## License
3rd party resources utilizied by this application each maintain their own respective licenses. Everything else is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

![Attribution-NonCommercial-ShareAlike 4.0 International
](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)
