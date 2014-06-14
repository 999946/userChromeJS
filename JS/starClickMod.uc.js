// ==UserScript==
// @name           	star Click Mod
// @description    	多功能收藏按钮
// @homepage       	https://github.com/feiruo/userchromejs/
// @author         	feiruo
// @include        	chrome://browser/content/browser.xul
// @charset      	utf-8
// @version      	1.7
// @note       	 	参考star Click（http://g.mozest.com/viewthread.php?tid=41377）
// @note        	为编辑面板增加更多功能
// @note        	右键删除当前书签
// @note        	1.7 修复右键报错，Australis重整UI后失效问题,增加 中键 打开/隐藏 书签侧栏。
// @note        	1.6 Australis 添加书签按钮移动至地址栏。
// @note        	1.5 支持 Nightly Holly.
// @note        	1.4 支持 firefox 24 以下版本.
// @note        	1.3 修复了可能出现的文件夹列表不能自动展开和获取上次文件夹的问题.
// @note        	1.2 修正因 firefox 26 添加了 bookmarks-menu-button 导致的判断出错.
// @note        	1.1 修正因 Nightly Australis 没有删除 star-button 导致的判断出错.
// @note        	1.0 
// ==/UserScript== 
//修改了图标以及撑大地址栏的问题
(function() {
	if (location == "chrome://browser/content/browser.xul") {
		//是否移动添加书签五角星到地址栏
		var olduimod = true;

		//是否隐藏dropmarker，配合bookmarkBtn.uc.js效果更佳
		var hidedropmarker = true;

		var version = Services.appinfo.version.split(".")[0];
		window.starClick = {
			init: function() {
				this.bookmarkPageU();
				this.lastfolder();
				this.clickStar();
				this.resizeUI();
				window.addEventListener("resize", starClick.clickStar, true);
				window.addEventListener("aftercustomization", starClick.clickStar, false);
				window.addEventListener("customizationchange", starClick.clickStar, false);
			},

			bookmarkPageU: function() {
				var bookmarkPage = PlacesCommandHook.bookmarkPage.toString().replace(/^function.*{|}$/g, "").replace("PlacesUtils.unfiledBookmarksFolderId", "_getLastFolderId()");
				eval("PlacesCommandHook.bookmarkPage=function PCH_bookmarkPage(aBrowser, aParent, aShowEditUI) {" + bookmarkPage + "}");
				eval("StarUI._doShowEditBookmarkPanel=" + StarUI._doShowEditBookmarkPanel.toString().replace(/hiddenRows: \[[^]*\]/, "hiddenRows: []").replace(/}$/, "setTimeout(function(){ gEditItemOverlay.toggleFolderTreeVisibility();document.getAnonymousNodes(document.getElementById('editBMPanel_tagsSelector'))[1].lastChild.style.display = 'inline-block';  document.getElementById('editBMPanel_tagsSelector').style.cssText = 'max-height:50px !important; width:300px !important'; document.getElementById('editBMPanel_folderTree').style.cssText = 'min-height:200px !important; max-width:300px !important';document.getElementById('editBookmarkPanel').style.maxHeight='800px'}, 0); $&"));
				eval("StarUI.handleEvent=" + StarUI.handleEvent.toString().replace('aEvent.target.className == "expander-up" ||', '$& aEvent.target.id == "editBMPanel_descriptionField" ||'));

			},

			lastfolder: function() {
				window._getLastFolderId = function() {
					var LAST_USED_ANNO = "bookmarkPropertiesDialog/folderLastUsed";
					var annos = PlacesUtils.annotations;
					var folderIds = annos.getItemsWithAnnotation(LAST_USED_ANNO);
					var _recentFolders = [];
					for (var i = 0; i < folderIds.length; i++) {
						var lastUsed = annos.getItemAnnotation(folderIds[i], LAST_USED_ANNO);
						_recentFolders.push({
							folderId: folderIds[i],
							lastUsed: lastUsed
						});
					}
					_recentFolders.sort(function(a, b) {
						if (b.lastUsed < a.lastUsed) return -1;
						if (b.lastUsed >
							a.lastUsed) return 1;
						return 0;
					});
					return _recentFolders.length > 0 ? _recentFolders[0].folderId : PlacesUtils.unfiledBookmarksFolderId;
				};
			},

			clickStar: function() {
				if (version < 28) {
					var onClick = function(e) {
						if (e.button == 0 && !this._pendingStmt) {
							PlacesCommandHook.bookmarkCurrentPage(true);
							e.preventDefault();
							e.stopPropagation()
						}
					}.toString().replace(/^function.*{|}$/g, "");
					if (version < 23) {
						eval("PlacesStarButton.onClick=function PSB_onClick(e) {" + onClick + "}");
					} else {
						eval("BookmarkingUI.onCommand=function PSB_onClick(e) {" + onClick + "}");
					}(function(doc) {
						var starbuttonrc = doc.getElementById('star-button');
						if (!starbuttonrc) return;
						starbuttonrc.addEventListener("click", function(e) {
							if (e.button == 1) {
								toggleSidebar('viewBookmarksSidebar');
							}
							if (e.button == 2) {
								var uri = gBrowser.selectedBrowser.currentURI;
								var itemId = PlacesUtils.getMostRecentBookmarkForURI(uri);
								var navBookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
								try {
									navBookmarksService.removeItem(itemId);
								} catch (e) {}
							}
							e.preventDefault();
							e.stopPropagation();
						}, false);
					})(document);
				} else {
					var holly = false;
					try {
						var holly = document.getElementById('appmenu_about').label;
					} catch (e) {}
					if (holly)
						var starbutton = document.getElementById('star-button');
					else {
						var bookmarksMenuBtn = document.getElementById('bookmarks-menu-button');
						var starbutton = document.getAnonymousNodes(bookmarksMenuBtn)[1];
					}
					starbutton.addEventListener("click", function(e) {
						if (e.button == 0) {
							PlacesCommandHook.bookmarkCurrentPage(true);
						}
						if (e.button == 1) {
							toggleSidebar('viewBookmarksSidebar');
						}
						if (e.button == 2) {
							var uri = gBrowser.selectedBrowser.currentURI;
							var itemId = PlacesUtils.getMostRecentBookmarkForURI(uri);
							var navBookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
							try {
								navBookmarksService.removeItem(itemId);
							} catch (e) {}
						}
						e.preventDefault();
						e.stopPropagation()
					}, false);
				}
			},

			resizeUI: function() {
				if (version > 28) {
					//隐藏dropmarker配合bookmarkBtn.uc.js效果更佳
					if (hidedropmarker) {
						var cssStr = ('#bookmarks-menu-button > dropmarker {display: none !important;}\
					');
					var style = document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(cssStr) + '"');
					document.insertBefore(style, document.documentElement);
					}

					//Australis移动添加书签五角星到地址栏
					if (olduimod) {
						var urlIcon = document.getElementById('urlbar-icons');
						var starbutton = document.getElementById('bookmarks-menu-button');
						urlIcon.appendChild(starbutton);
						var menupopup = starbutton.firstChild;
						var cssStr = ('\
									#bookmarks-menu-button {\
									list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAASCAMAAAAnpt3PAAAAvVBMVEUAAACATQOWlpbx8fHKysrfmjH025OIWjN9PgZ7SQLwzH2urq7qvmJ/UQPlqULtwmp/TAPhnzbwxmN9RwKASwPZvnKkgjPbyHzJycnqu2LQ0NCVlZWjo6PCwsL+/v65hzqVXxjBwcHOzs67u7vbjSHlq0PuyHvqumTTrl6AVwOPj4+Pj4/257jy8fH756L/9Kr90m329vX28uH5+fnr6+ve3t747sz/1n3379T/3nX/6Hv39evj4+O6urr/3YXlFQQFAAAALHRSTlMApzAQ+zL8BA0n+b3dc6zvimH+Tp3etNvjt2Oq34c11cSsXOEh4NKS32JpYyZORIwAAAG0SURBVHhepZLXrqMwFEVNMKbXQICbemuZcaGT/v+fNSfXkBF5nNkvlpa0dOx9jP4zy+Uj8bxH8v39SGaXy2xKtCjSpsRcLMwHzW5be0pyQqbjdDdNXX06DDOGJ+M0i1JLmw4TYjJOn9nnuj7bM/1OtJzu9zTX/hLTTYVIXXMgv5arC25ZXbMWX1bL3wiFnmMRuq+qPSWW44UIzd1AWaTieBTpQgncOWgrfG5YWUNK1pzxCqH3goN0YuwEIi/eEYoTIoQ4QuAgSQDaC27qe5rsBTr0eQdWWYLXcR/6NOOEH4fwJDZBU58wGy2Gn1R082h1KiGnivq35xmmkvDDT3iimAaSXimtEqyhxk5qnSxTB48cCsiVgCVbUZ+HazbPKpL5pFKjnwhJz/26/mhfLlgy9qjdN57DLSEVzcf+A6e/ab0TjBZ6ZXUJqdnrSBzYWtfB5pxRU6z+6lvX3or1EeGStVnWMoYHZESck48Pwnk0kl3vb+N46/eKcf9ZbbbebNZZO35nLSoc2HLoFNGbJOZuG88NY65sd+ao2esNdKFu1vZQyZsXyiZCzxi0ACRdBzEA8q/5A9DzP422fbINAAAAAElFTkSuQmCC") !important;\
									-moz-image-region: rect(0, 18px, 18px, 0) !important;  margin-bottom: 1px !important;\
									}\
									#bookmarks-menu-button:not([starred]):hover {-moz-image-region: rect(0, 36px 18px 18px) !important;}\
									#bookmarks-menu-button[starred] {-moz-image-region: rect(0px 54px 18px 36px) !important;}\
									#bookmarks-menu-button >toolbarbutton,\
									#bookmarks-menu-button >toolbarbutton .toolbarbutton-icon{\
									-moz-appearance:none!important;\
									border:none!important;\
									box-shadow:none!important;\
									background:none!important;\
									margin: -8px 0px !important;\
									}\
									');
					var style = document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(cssStr) + '"');
					document.insertBefore(style, document.documentElement);
					}
				}
			},
		};
		window.starClick.init();
	}
})();