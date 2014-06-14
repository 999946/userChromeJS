// ==UserScript==
// @name           鼠标移动到地址栏，自动全选里面的文字.uc.js
// @namespace      http://board.mozest.com/
// @description    鼠标移动到地址栏，自动全选里面的文字
// @include        main
// @author         golf-at
// ==UserScript==
/*这个不好用,先注视掉
document.getElementById("urlbar").addEventListener("mouseover",
    function(e) { e.target.select(); }, false);
*/

gURLBar.addEventListener("mouseover", function(e){
        if(e.target.compareDocumentPosition(document.activeElement)!= 20)
                e.target.select();
}, false);
gURLBar.addEventListener("mouseout", function(e){
        var k = e.target.compareDocumentPosition(e.relatedTarget);
        if(k!=0 && k!=20){
                e.target.blur();
                gBrowser.selectedBrowser.focus();
        }
}, false);

/*加了延迟但丢失焦点
gURLBar.addEventListener("mouseover", function (e) {
        var self = arguments.callee;
        if (!self.timeout) {
                gURLBar.addEventListener("mouseout", function () {
                        clearTimeout(self.timeout);
                }, false)
        }
        self.timeout = setTimeout(function () {
                e.target.select() & Components.classes['@mozilla.org/widget/clipboardhelper;1'].createInstance(Components.interfaces.nsIClipboardHelper).copyString(gURLBar.value);
        }, 500)
}, false);
*/
gURLBar.addEventListener("mouseover", function (e) {
        var self = arguments.callee;
        if (!self.timeout) {
                gURLBar.addEventListener("mouseout", function () {
                        clearTimeout(self.timeout);
                }, false)
        }
        self.timeout = setTimeout(function () {
                e.target.select();
        }, 500)
}, false);
gURLBar.addEventListener("mouseout", function(e){
        var k = e.target.compareDocumentPosition(e.relatedTarget);
        if(k!=0 && k!=20){
                e.target.blur();
                gBrowser.selectedBrowser.focus();
        }
}, false);

/* 鼠标移动到搜索栏，自动全选里面的文字 */
document.getAnonymousElementByAttribute(document.getElementById(
    "searchbar"),"class","searchbar-textbox").addEventListener(
    "mouseover", function(e) { if (e.target.localName.toLowerCase()
    =='textbox') e.target.select(); }, false);