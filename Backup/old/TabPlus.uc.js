// ==UserScript==
// @name TabPlus.uc.js
// @description �������ϰ��ǩ��ǿ
// @namespace TabPlus@gmail.com
// @include chrome://browser/content/browser.xul
// @include chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include chrome://browser/content/history/history-panel.xul
// @include chrome://browser/content/places/places.xul
// @Note 2014.03.21 ���һ���������� by defpt
// ==/UserScript==
(function () {
	// �±�ǩ��:��ǩ����ʷ��������
	try {
		eval('openLinkIn=' + openLinkIn.toString().
			replace('w.gBrowser.selectedTab.pinned', '(!w.isTabEmpty(w.gBrowser.selectedTab) || $&)').
			replace(/&&\s+w\.gBrowser\.currentURI\.host != uriObj\.host/, ''));
	} catch (e) {}



	//�Ҽ��رձ�ǩҳ��ctrl+�Ҽ��򿪲˵�
	gBrowser.mTabContainer.addEventListener("click",
		function (e) {
		if (e.target.localName == "tab" && e.button == 2 && !e.ctrlKey) {
			e.preventDefault();
			gBrowser.removeTab(e.target);
			e.stopPropagation();
		}
	},
		false);



	//�Զ��ر����ز����Ŀհױ�ǩ
	eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
			if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
			&& aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank") {\
			aWebProgress.DOMWindow.setTimeout(function() {\
			!aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
			}, 100);\
			}\
			'));

})();
