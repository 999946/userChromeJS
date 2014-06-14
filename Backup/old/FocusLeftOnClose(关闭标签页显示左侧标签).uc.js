(function() {
    try {
        if(!gBrowser) return;
    }catch(e) {
        return;
    }
    
    gBrowser.tabContainer.addEventListener("TabClose", tabCloseHandler, false);

    function tabCloseHandler(event) {
        var tab = event.target;
        var focusLeftOnClose = true;
        if (focusLeftOnClose && gBrowser.mCurrentTab == tab    && tab._tPos > 0) {
        gBrowser.selectTabAtIndex(tab._tPos - 1);
        }
    }

})();