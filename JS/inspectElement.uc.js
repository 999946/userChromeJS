// ==UserScript==
// @name            Element Inspector
// @namespace       inspectElement@zbinlin
// @description     shift + 右键 在 DOM Inspector 中查找并定位到相应的元素节点
// @include         *
// @author          zbinlin
// @homepage        http://mozcp.com
// @version         0.0.5
// ==/UserScript==

/*
 * ================================ Changelog ================================
 *
 * version: 0.0.5
 *   * 可以使用 Firebug 或 Firefox Inspector (Firefox 17+) 来定位元素
 *
 * version: 0.0.2
 *   * 将 click 事件由冒泡型改为捕获型
 *
 * version: 0.0.1
 *   * 初始化
 *
 * ===========================================================================
 */

"use strict";

let {AddonManager} = Components.utils.import("resource://gre/modules/AddonManager.jsm", {});

let inspectElement = {
    disabled: true,
    handleEvent: function (e) {
        if (!e.shiftKey || e.button != 2) return;
        e.stopPropagation();
        e.stopImmediatePropagation && e.stopImmediatePropagation();
        e.preventDefault();
        if ("click" !== e.type.toLowerCase()) return;
        var elem = e.originalTarget;
        if (this.disabled) {
            try {
                if (window.Firebug) {
                    let Firebug = window.Firebug;
                    (function (elem, Firebug) {
                        Firebug.browserOverlay.startFirebug(function (Firebug) {
                            Firebug.Inspector.inspectFromContextMenu(elem);
                        });
                    })(e.target, Firebug);
                } else {
                    (function (elem) {
                        /*
                         * 有这么变的吗，四个版本，变了三次地址！！！
                         */
                        let devtools = {};
                        let version = Services.appinfo.version.split(".")[0];
                        let DEVTOOLS_URI;
                        if (version >= 24) {
                            DEVTOOLS_URI = "resource://gre/modules/devtools/Loader.jsm";
                            ({devtools} = Components.utils.import(DEVTOOLS_URI, {}));
                        } else if (version < 24 && version >= 23) {
                            DEVTOOLS_URI = "resource:///modules/devtools/gDevTools.jsm";
                            ({devtools} = Components.utils.import(DEVTOOLS_URI, {}));
                        } else if (version < 23 && version >= 20) {
                            DEVTOOLS_URI = "resource:///modules/devtools/Target.jsm";
                            devtools = Components.utils.import(DEVTOOLS_URI, {});
                        } else {
                            return (function (elem, InspectorUI) {
                                if (InspectorUI.isTreePanelOpen) {
                                    InspectorUI.inspectNode(elem);
                                    InspectorUI.stopInspecting();
                                } else {
                                    InspectorUI.openInspectorUI(elem);
                                }
                            })(e.target, window.InspectorUI);
                        }
                        let gBrowser = window.gBrowser, gDevTools = window.gDevTools;
                        let tt = devtools.TargetFactory.forTab(gBrowser.selectedTab);
                        return gDevTools.showToolbox(tt, "inspector").then((function (elem) {
                            return function(toolbox) {
                                let inspector = toolbox.getCurrentPanel();
                                inspector.selection.setNode(elem, "UserChromeScript-Element-Inspector");
                            }
                        })(e.target));
                    })(elem);
                }
            } catch (ex) {
                alert("\u8BF7\u68C0\u67E5 DOM Inspector \u662F\u5426\u5B89\u88C5\u6216\u7981\u7528\u4E86\uFF01");
            }
        } else {
            window.openDialog("chrome://inspector/content/", "_blank",
                              "chrome, all, dialog=no", elem);
        }
        this.closePopup(elem);
    },
    closePopup: function (elem) {
        var parent = elem.parentNode;
        var list = [];
        while (parent != window && parent != null) {
            if (parent.localName == "menupopup") {
                list.push(parent);
            }
            parent = parent.parentNode;
        }
        var len = list.length;
        if (!len) return;
        list[len - 1].hidePopup();
    }
};

AddonManager.getAllAddons(function (addons) {
    for (let i in addons) {
        if (addons[i].id == "inspector@mozilla.org" && addons[i].isActive) {
            inspectElement.disabled = false;
            break;
        }
    }
});

window.addEventListener("click", inspectElement, true);
window.addEventListener("contextmenu", inspectElement, true);
window.addEventListener("unload", function _(e) {
    window.removeEventListener("unload", _, false);
    window.removeEventListener("click", inspectElement, true);
    window.removeEventListener("contextmenu", inspectElement, true);
}, false);
