// ==UserScript==
// @name           open_in_new_tab
// @description    让书签、历史、url、搜索在新的标签页打开
// @compatibility  Firefox 3.0+
// @author         GOLF-AT
// @version        1.6.201200204

(function() {
    /*open bookmark/history in new tab */
    try {
        eval("whereToOpenLink = " + whereToOpenLink.toString().replace(
            /var shift/,"var Class=e.target.getAttribute('class'); try "
            +"{ if (Class=='') Class=e.target.parentNode.getAttribute('"
            +"class');} catch(e) {} Browser=getTopWin().document.getEle"
            +"mentById('content'); if ((!IsBlankPage(Browser.currentURI"
            +".spec)|| Browser.webProgress.isLoadingDocument) && Class "
            +"&& (Class=='sidebar-placesTreechildren'||Class=='placesTr"
            +"ee'||Class.indexOf('bookmark-item')>=0)) return 'tab'; $&"
            ));
    }catch(e){}

    /*open url in new tab */
    try {
        try { // firefox 3.0.*
            eval("BrowserLoadURL = "+ BrowserLoadURL.toString().replace(
                /if \(aTriggeringEvent instanceof MouseEvent\) {/,
                "_LoadURL(aTriggeringEvent, aPostData); return; $&"));
        }
        catch(e) { // firefox 3.1+
            var urlbar = document.getElementById("urlbar");
            eval("urlbar.handleCommand="+ urlbar.handleCommand.toString(
                ).replace("aTriggeringEvent.altKey && ", "").replace(
                "altEnter && !isTabEmpty","!isMouseEvent && !isTabEmpty"
                ));
        }
    }catch(e){}

    /*open home in new tab */
    try {
        eval("BrowserGoHome = " + BrowserGoHome.toString().replace(
            /switch \(where\) {/, "where = (gBrowser.currentURI.spec!="
            +"'about:blank' || gBrowser.webProgress.isLoadingDocument"+
            ") ? 'tab' : 'current'; $&")); 
    }catch(e){}

    /*open search in new tab */
    try {
        var searchbar = document.getElementById("searchbar");
        eval("searchbar.handleSearchCommand="+searchbar.handleSearchCommand.
            toString().replace(/this.doSearch\(textValue, where\);/,
            "if (!gBrowser.webProgress.isLoadingDocument && gBrowser.curren"
            +"tURI.spec=='about:blank') where='current'; else where='tab'; "
            +"$&"));
    }catch(e){}

})();

function _LoadURL(aTriggeringEvent, aPostData)
{
    var where = (gBrowser.currentURI.spec!='about:blank' ||
        gBrowser.webProgress.isLoadingDocument) ? 'tab' :
        'current';
    if (gURLBar.value!='') openUILinkIn(gURLBar.value, where);
    return true;
}

function IsBlankPage(url)
{
    return url=="" || url=="about:blank" || url=="about:home"
        || url=="about:newtab";
}
