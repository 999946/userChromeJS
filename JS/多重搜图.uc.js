// ==UserScript==
// @name           多重搜图.uc.js
// @description    多重搜图
// @include        main
// @charset        UTF-8
// ==/UserScript==
// 修改成二级菜单形式
location == "chrome://browser/content/browser.xul" && (function () {
	var s = [{
		name:'tineye',
		url:'http://www.tineye.com/search/?pluginver=firefox-1.0&sort=size&order=desc&url='
		},{
		name:'百度识图',
		url:'http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl='
		},{
		name:'谷歌识图',
		url:'http://www.google.com/searchbyimage?image_url='
		},{
		name:'搜狗识图',
		url:'http://pic.sogou.com/ris?query='
	}];
	(function (m) {
		m.id = "CBIR-search";
		m.setAttribute("label", "\u641C\u7D22\u7C7B\u4F3C\u56FE\u7247");
		var menupopup = document.createElement("menupopup")
		
		for(var i in s){
			var menuitem = document.createElement('menuitem');
            menuitem.setAttribute('label',s[i].name);
			menuitem.url = s[i].url;
            menupopup.appendChild(menuitem);
			menuitem.addEventListener('click',function(e){
				var url = encodeURIComponent(gContextMenu.mediaURL || gContextMenu.imageURL || gContextMenu.bgImageURL);
				gBrowser.selectedTab = gBrowser.addTab(e.target.url + url);
			})
		}
		m.appendChild(menupopup)
	})(document.getElementById("contentAreaContextMenu").insertBefore(document.createElement("menu"), document.getElementById("context-viewimage")));
	document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", function () {
		gContextMenu.showItem("CBIR-search", gContextMenu.onImage || (gContextMenu.hasBGImage && !gContextMenu.isTextSelected));
	}, false);
})();

