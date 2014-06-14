// ==UserScript==
// @name           rightAndleftCloseTab.uc.js
// @namespace      rightAndleftCloseTab@fooxx.cn
// @description    关闭左侧标签/关闭右侧标签
// @include        chrome://browser/content/browser.xul
// @version        1.0
// ==/UserScript==

//标签页右键添加关闭左侧标签/关闭右侧标签

// left
(function(){
var item = document.createElement('menuitem');
item.setAttribute('label', '\uFEFF\u5173\u95ED\u5DE6\u4FA7\u7684\u6807\u7B7E');
item.setAttribute('accesskey', '1');
item.addEventListener('command', function(){
var tabs = gBrowser.mTabContainer.childNodes;
var pos;
for(var i = 0; i < tabs.length; i++){
if(tabs[i] == document.popupNode){
pos = i;
break;
}
}
for(var i = pos - 1; 0 <= i; i--){
gBrowser.removeTab(tabs[i]);
}
}, false);
setTimeout(function(){
gBrowser.mStrip.childNodes[1].appendChild(item);
}, 0);
})();

// right
(function(){
var item = document.createElement('menuitem');
item.setAttribute('label', '\u5173\u95ED\u53F3\u4FA7\u7684\u6807\u7B7E');
item.setAttribute('accesskey', '2');
item.addEventListener('command', function(){
var tabs = gBrowser.mTabContainer.childNodes;
for(var i = tabs.length - 1; tabs[i] != document.popupNode; i--){
gBrowser.removeTab(tabs[i]);
}
}, false);
setTimeout(function(){
gBrowser.mStrip.childNodes[1].appendChild(item);
}, 0);
})();