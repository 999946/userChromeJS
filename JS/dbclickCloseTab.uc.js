// ==UserScript==
// @name           dbclickCloseTab.uc.js
// @namespace      dbclickCloseTab@fooxx.cn
// @description    双击关闭标签
// @include        chrome://browser/content/browser.xul
// @version        1.0
// ==/UserScript==
gBrowser.mTabContainer.addEventListener('dblclick', function (event) {
	if (event.target.localName == 'tab' && event.button == 0) {
		document.getElementById('cmd_close').doCommand();
	}
}, false);
