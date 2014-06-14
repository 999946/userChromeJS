// ==UserScript==
// @name           onclickshowBookmark.uc.js
// @namespace      firefox
// @description    单击当前标签显示书签、导航栏（定制里要把它们勾选上）
// @include        chrome://browser/content/browser.xul
// @version        1.0
// ==/UserScript==
(function (){
	var navbar = document.getElementById("nav-bar");
	var PersonalToolbar = document.getElementById('PersonalToolbar');
	var toolbox = document.getElementById('navigator-toolbox');
	navbar.style.display = 'none';
	PersonalToolbar.style.display = 'none';
	
	var showing = false;
	var out = true;
	function setCurrentTab(){
		gBrowser.currentTab = gBrowser.selectedTab;
	}
	gBrowser.addEventListener("load", setCurrentTab, true);
	window.addEventListener("TabMove", setCurrentTab, false);
	window.addEventListener("TabClose", setCurrentTab, false);
	
	gBrowser.mTabContainer.addEventListener('click', function (event){
		//alert(event.target._tPos)
		//alert(gBrowser.selectedTab._tPos)
		if (event.target == gBrowser.currentTab && event.button == 0){
			show();
			
		}else{
			gBrowser.currentTab = gBrowser.selectedTab;
		}
	}, false);
	toolbox.addEventListener('mouseout', function () {
		out = true;
	}, false);
	toolbox.addEventListener('mouseover', function () {
		out = false;
	}, false);
	window.addEventListener('click', function () {
		hide();
	}, false);
	function show(){
		if(showing == false){
			showing = true;
			navbar.style.display = '-moz-box';
			PersonalToolbar.style.display = '-moz-box';
		}
	}
	function hide(){
		if(out == true){
			showing = false;
			navbar.style.display = 'none';
			PersonalToolbar.style.display = 'none';
		}
	}
})();



