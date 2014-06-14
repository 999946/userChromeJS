// ==UserScript==
// @name TabPlus.uc.js
// @description 自用整合版标签增强
// @namespace TabPlus@gmail.com
// @include chrome://browser/content/browser.xul
// @include chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include chrome://browser/content/history/history-panel.xul
// @include chrome://browser/content/places/places.xul
// @Note 2014.03.21 最后一次修正整合 by defpt
// ==/UserScript==
(function () {
	// 新标签打开:书签、历史、搜索栏
	try {
		eval('openLinkIn=' + openLinkIn.toString().
			replace('w.gBrowser.selectedTab.pinned', '(!w.isTabEmpty(w.gBrowser.selectedTab) || $&)').
			replace(/&&\s+w\.gBrowser\.currentURI\.host != uriObj\.host/, ''));
	} catch (e) {}



	//右键关闭标签页，ctrl+右键打开菜单
	gBrowser.mTabContainer.addEventListener("click",
		function (e) {
		if (e.target.localName == "tab" && e.button == 2 && !e.ctrlKey) {
			e.preventDefault();
			gBrowser.removeTab(e.target);
			e.stopPropagation();
		}
	},
		false);



	//自动关闭下载产生的空白标签
	eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
			if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
			&& aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank") {\
			aWebProgress.DOMWindow.setTimeout(function() {\
			!aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
			}, 100);\
			}\
			'));

})();
