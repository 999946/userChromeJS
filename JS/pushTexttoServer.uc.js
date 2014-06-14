// ==UserScript==
// @name            pushTexttoServer.uc.js
// @namespace       pushTexttoServer.uc
// @description     pushTexttoServer.uc.js
// @include         chrome://browser/content/browser.xul
// @version         0.0.2.2
// @compatibility   firefox 4.0+
// ==/UserScript==

var TextPush = {
    init: function () {
        var cacm = document.getElementById("contentAreaContextMenu");
        if (!cacm) return;
        var sendimage = document.getElementById("#context-cut");
        var imagesearch = document.createElement("menuitem");
        imagesearch.setAttribute("id", "context-pushtoserver");
        imagesearch.setAttribute("label", "Push");
        imagesearch.setAttribute("accesskey", "A");
        imagesearch.setAttribute("onclick", "TextPush.onSearch(event);");
        cacm.insertBefore(imagesearch, sendimage);
    },
    onSearch: function (e) {
		//alert(content.window.getSelection());
		//alert(content.window.location);
		var range=content.window.getSelection().getRangeAt(0);
        var container = document.createElement('div');
        container.appendChild(range.cloneContents());
        //alert(container.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"',"gm"),''));
		
		var detial = encodeURIComponent(container.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"',"gm"),'').replace(new RegExp('<br/>',"gm"),'\n'));
		if(detial==undefined||detial==null||detial=="")return;
		var url = "http://8image.duapp.com/add.php?title=xiaohua&detial="+encodeURIComponent(content.window.getSelection())+"&url="+encodeURIComponent(content.window.location);
		gBrowser.selectedTab = gBrowser.addTab(url);
        closeMenus(e.target);
    }
}

if (window.location == "chrome://browser/content/browser.xul") {
    TextPush.init();
}