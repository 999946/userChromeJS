// ==UserScript==
// @name           BaiduMusicPlayBar.uc
// @namespace      http://tieba.baidu.com/f?kw=firefox
// @description	   百度随心听播放工具条
// @include        main
// @author         林小鹿吧
// @charset        UTF-8
// @compatibility  Firefox 29+
// @version        2014/06/14
// ==/UserScript==
/***  升级日志  *** 
 *	2013/09/09
 *	2014/04/15
 *	2014/05/16
 *  2014/05/27(可定制添加移除判断,添加各设置,修复导致浏览器崩溃的问题)
 *  2014/06/14(解决按钮重启消失,窗口弹出位置偏移问题,去边框)
 **/
function $(id) { 
	return document.getElementById(id) || gNavToolbox.palette.querySelector("#" + id);
}
function debug(obj) {
	if(PlaySoundBar.setting.debug){
		if(obj && typeof obj == 'Object')obj = JSON.stringify(obj);
		console.log("BaiduMusicPlayBar.uc >>>  " + obj);
	}
}
var PlaySoundBar = {
	setting : {
		/* 设置  参数可修改  不要删减 */
		url : "http://fm.baidu.com/", 		// 当变为其他网站时，请把 logo 外其它设置项设置为false
		showLyric : true, 					//是否显示歌词
		showPause : true,					//是否"暂停/播放"按钮
		showNext : true, 					//是否"下一首"按钮
		showLove : true, 					//是否"喜欢"按钮
		showHate : true, 					//是否"讨厌"按钮
		showTitle : true, 					//是否歌名
		lyricDirection : false, 			//歌词在按钮左边 true 右边 false
		iframe:{ 							//弹出 iframe 的宽 高
			width:'960px',
			height:'600px'
		},
		debug : false						//调试
	},
	ico : {
		main:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADMklEQVR42o2TXWgUVxiGTya7MWliojUKgtp4Y1HQcyH9UYS2FGLRO8WLQhBJtEnU6LrJGr1QUBCtkJtArVZa2kRs/UP8AyVBxBjjT+KucYPuxk3SZjfJJt2d/ZnM7OzOnLffzCq0dz3wMN95z/e+32HgMPZubXmpLqkJ6LwmAF47Al4fBncTZ6N52ok22p8a0fnJ11oV+/fa/DTb9M2QMVMdFGJDUGDDsMAXowJfhQVqogKHpgRaIgKuvwQOjAvRPGbKnqGsxzav7VKXfdxrxCqfm6j0mZjnNyG9MsGGiTETBaMmVv9pYmNIYFPIRHXAxJfUs6k/F1t7U13GFl3T+fwuQ1Q+NlD5zMACrwmnzwB7/S4kSCFUr/QbqH5DZgpf/8IEf2gIy8vYzzqXLuso69LxYU8ORT1ZzH+cxTYyn5wRhImtw4atrejLYh0N4Q9z+Oh2FqzTCjhLAb9mIP2uoeyGjlX3dTya1nD4nhefX/Fh3VWfXT+YUu2zpXd0LL+lYzENtYYz1q7zwh9VLP5Fw2oK6Ymo+KzDj4Krs/AEc2D3MmBUf0ra/XEV5R0aFnVqWPAb6TSclbYpfEm7io0XVHSN5HCxP4qy8ym6kYJBmf7FFQ2MgqVzaXQOTOP62xzWUEDFGdLbrBucUvjC7xU8GdNhrWPdCo4/ysA3Og01k8UZvw5+aRbeqIFD3Sm7p38iC+fpWVhexo4oXDqaRH8oZh+67qjoHdWw8EgQ3kgGPwxo+OSnNLwTBjx3FbsnGElAOpYCO24FtMpcapWx/sQQegbDqOmYwfZzb/BieAqDoSi+PT+OgcAk/uibwo4LUfT6I/j6tB/S4QSs4Yy5ZV7oklHqjmHu3hCKm8JgjROQ6gIo3hmEc3cUBXVBsF1vUbg7DGcDfff/DalZhuW1A8qak6K8KQ6LuYSjPgbnzjiKLHblkQhHQ5wCiEbSXEmRD2iYrCpxJ+WKfTLK98RRSg0FdTMorI2hqDZu46iL5TUKdH5HWqMM54GkzFyT+UflcKcOfuBJJyoOKmKOK2Wl2xS70igh3u+L6KykmXpa0glHS6L1Py+SueQqZ6vC/w9sb2L5e9s/JjWFToK22Y4AAAAASUVORK5CYII=",
		playing:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAXklEQVR42mNgGAU4QWhoKDM2NlEgKikpOjYx9SyMH5eYeiYGKEa0ATGJqYXxSWm/YHwQOy4htWgkGRCdkJoFDLifSIH4MzY+JZtoAzw9PdljY2PFYHwQGyQ2mrixAwA9hzHuswF7YwAAAABJRU5ErkJggg==",
		hate:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABXklEQVR42u1SPUjDQBSO4iLFReyuSHEQZ3F2cHVxERxEdNPBxTGbIJHY5C6p1dxPk7vLUtxdhIKIgg6OBd0FQQdxUKj6LmmxkUaKswcfPN7P99777hlG17NtexgFYhlTsfUTiIhN+4hPG789dBxOeEy8+LX4swc+XBr5kDaQS+BW+SRm8k0XeExdeFw12njQPsQkg7TBTNGuS4vOIS05VJacQMxjrhICTMPZxAfweHySTMFVveyTKe07qLBx0zSHDJeKS+jQyhk7FzDNc5mGCwaiovEXAszEo57YsKywgLhcS5xc3rmUFvMAXbcTfbi6sYNgFFZI9YDAUiqcbFqWVYCEWw29K4ha0TYi0arH4vW0u7rKfl8XwR4hI997ihkgONW2G0Q7/wR9EMClvcIlnncIQP1rr6ae2rF7sJu9CYJoETq9w/23+gGi8ixDsF9VY3BZK4jIjX6AiZzr1H4BpDgIiNjk92MAAAAASUVORK5CYII=",
		loved:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABCklEQVR42mNgGGYgdBWz2sxHAapzntWozXwYL959kZuh/j+TysyHfqqzntSozniUKFp/hQerXpBitdmPD6nPff4fhtXmPL2rOgtd7MkD5b4rKhgGqMx40IasEB8GunIPUAsjsn4moJMvEW3AnGd/RUPrUbzCojrj/jliDVCf8+wXg3USL4oLFLvP1RJrgMrkG5tAlqIGgoKBgOrkW4eJ8P8TkehmdWwRwchpGSqtPOn6blyaVaffvy0S02UEVMuMKyUwMvDzCyp2nZ4ECihkzcoTr+7gt4tVxKcZGXBJl62NVZv95D0wwH7LNx9pAorxo0cdIcAqnjHbSbZudyaQzUlu4gY5l5Wm2QcAU177z23sRrgAAAAASUVORK5CYII=",
		love:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABV0lEQVR42mNgGFaAMTQ0lO3t27ch379/r//06VPS/PnzBTw9PdnfvHkTBBVLWb9+vQBILYbmvr4+oR8/fhz9jwR+/fp1/+vXr8eQxX7//v3wyJEj2kA9TMgGsL18+bLvP5Hgy5cvB4B6uOC2A7EAUPAasQb8+/fvr7W1tRzMFSBC4v3791eJNeDv37+/lZSU1ID6WGAukNi/f/8UYg24c+fOQaAeBZgBIMDPy8trff/+/UuENH/8+PG1i4tLEFCPGHJAsgKxLBD43bhx4xwuzcDofOrj45MCVAtyPgdKNAIxJxArMTMze+7YsWMj0J//kDVfuXLljJqaWgRQjRYQ82JNC1BTQaFr39TU1Pnt27cvQIP+rFq1ailQzAOIVYGYBz0NoBvCBsTiQGyWlpZWMHPmzF4g2xbkRagrGYlJ1qDQFYTaqAHEotBwYiQlb4CcyQ71FjMuRQCIg3X/rGbFNAAAAABJRU5ErkJggg==",
		next:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAqElEQVR42mNgGH5AdcbDDJXpj7IY6lexkWWAytQ7repzn/9Xm/3snur0RwkMoauYSTNgyu02kAEwrDb7yXWV6Q/DGBj+M5JlAMKgp+dVpz/0IdsAOJ7z9JjSxDuqZBmgOvX2BZmyddFAZewkGQAM2EuypWsTgNKCQMxCtBdUp929IlO2PhkoLERQI7IBQI3XZSo3p5KkEQZE02cAA4hXmGSNSIBxaOUdAMfJhemFChu4AAAAAElFTkSuQmCC",
		pause:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAATElEQVR42mP4TyFgGDUAuwHh8fHRMQnJZ2H8mISUM1FAMaINiIpPLoxLTP0F44PYMXFJRSPJgMi4pKzYhJSfMD6IHR2blD2aEmlkAAC8psfh5vFoigAAAABJRU5ErkJggg=="
	},
	ui : {
		logo:null,
		pause:null,
		next:null,
		love:null,
		hate:null,
		title:null,
		lyric:null,
		hbox:null
	},
	style : '',
	MusicBrowser : null,
	getBaiduFMBrowser : function () {
		var pane_iframe = $("MusicBar-iframe");
		if (pane_iframe)
			return pane_iframe;
		return null;
	},
	addBtn : function(palette,attributes){
		var btn = document.createElement("toolbarbutton");
		for(var i in attributes){
			btn.setAttribute(i,attributes[i]);
		}
		btn.setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional");
		btn.addEventListener('click', function(e){
			debug(">>>>>>>>>"+e.target.id);
			switch(e.target.id){
				case 'MusicBar-logo':{debug('MusicBar-logo');PlaySoundBar.onClick();break;}
				case 'MusicBar-pause':{debug('MusicBar-pause');PlaySoundBar.pause();break;}
				case 'MusicBar-next':{debug('MusicBar-next');PlaySoundBar.next();break;}
				case 'MusicBar-love':{debug('MusicBar-love');PlaySoundBar.clickLoveBtn();break;}
				case 'MusicBar-hate':{debug('MusicBar-hate');PlaySoundBar.hateSong();break;}
			}
		}, false);
		palette.appendChild(btn);
		return btn;
	},
	addHbox : function(palette){
		var hbox = document.createElement("hbox");
			hbox.setAttribute('id','MusicBar-hbox');
		PlaySoundBar.ui.hbox = hbox;
			hbox.setAttribute('hidden','true');
		var title = document.createElement("box");
			title.setAttribute('id','MusicBar-title');
		PlaySoundBar.ui.title = title;
		var lyric = document.createElement("box");
			lyric.setAttribute('id','MusicBar-lyric');
		PlaySoundBar.ui.lyric = lyric;
			hbox.appendChild(title);
			hbox.appendChild(lyric);
		palette.appendChild(hbox);
	},
	initUI : function(){
		var item = document.createElement("toolbaritem");
			item.id = "musicbar-container";
			item.setAttribute("persist", "width");
			item.setAttribute("title", "百度随心听");
			item.setAttribute("class", "chromeclass-toolbar-additional panel-wide-item");
			item.setAttribute("cui-areatype", "toolbar");
			item.setAttribute("overflows", "false");
			item.setAttribute("removable", "true");
		if(PlaySoundBar.setting.lyricDirection)PlaySoundBar.addHbox(item);
		var btnAttributes = [{
				id:"MusicBar-logo",
				tooltiptext:"百度随心听"
			},{
				id:"MusicBar-pause",
				hidden:"true",
				tooltiptext:"暂停/播放"
			},
			{
				id:"MusicBar-next",
				hidden:"true",
				tooltiptext:"播放下一首"
			},
			{
				id:"MusicBar-love",
				hidden:"true",
				love:"false",
				tooltiptext:"喜欢这首歌"
			},
			{
				id:"MusicBar-hate",
				hidden:"true",
				tooltiptext:"不喜欢这首歌"
			}];
		PlaySoundBar.ui.logo = PlaySoundBar.addBtn(item,btnAttributes[0]);
		PlaySoundBar.ui.pause = PlaySoundBar.addBtn(item,btnAttributes[1]);
		PlaySoundBar.ui.next = PlaySoundBar.addBtn(item,btnAttributes[2]);
		PlaySoundBar.ui.love = PlaySoundBar.addBtn(item,btnAttributes[3]);
		PlaySoundBar.ui.hate = PlaySoundBar.addBtn(item,btnAttributes[4]);
		if(!PlaySoundBar.setting.lyricDirection)PlaySoundBar.addHbox(item);
		
		gNavToolbox.palette.appendChild(item);
		PlaySoundBar.customizable();	
	},
	addBar : function () {
		PlaySoundBar.initUI();
		var css = '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
					@-moz-document url("chrome://browser/content/browser.xul") {\
					#musicbar-container{\
						-moz-appearance: none;\
						padding:0px 3px;\
						background-clip: padding-box;\
						color: #333333;\
						margin: 0 2px;\
						padding: 0;\
						min-width:20px;\
					}\
					#musicbar-container toolbarbutton{\
						left:0px;\
						width:18px;\
						line-height: 16px;\
					}\
					#MusicBar-pause{\
						list-style-image:url(' + PlaySoundBar.ico.pause + ');\
					}\
					#MusicBar-next { \
						list-style-image:url(' + PlaySoundBar.ico.next + ');\
					}\
					#MusicBar-love[love="false"]{\
						list-style-image:url(' + PlaySoundBar.ico.love + ');\
					}\
					#MusicBar-love[love="true"]{\
						list-style-image:url(' + PlaySoundBar.ico.loved + ');\
					}\
					#MusicBar-hate{\
						list-style-image:url(' + PlaySoundBar.ico.hate + ');\
					}\
					#MusicBar-title{\
						margin:0px 2px;\
						color: #000000;\
					}\
					#MusicBar-hbox{\
						line-height:16px;\
						height:16px;\
						-moz-box-align: center;\
						-moz-box-pack: center;\
						-moz-appearance: none;\
					}\
					#MusicBar-title,#MusicBar-lyric{\
						font-size: 80%;\
						cursor:pointer;\
					}\
					#MusicBar-lyric{\
						color: rgba(237,87,116,1);\
					}\
					#MusicBar-logo{\
						list-style-image:url(' + PlaySoundBar.ico.main + ');\
					}\
					#MusicBar-panel .panel-arrowcontent{\
						padding: 0px !important;\
					}\
					}'.replace(/[\r\n\t]/g, '');
		//歌词设置判断
		if (PlaySoundBar.setting.showLyric) {
			css += '#MusicBar-lyric{min-width:160px;}';
		}
		function addStyle(css) {
			var pi = document.createProcessingInstruction(
					'xml-stylesheet',
					'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
			return document.insertBefore(pi, document.documentElement);
		}
		PlaySoundBar.style = addStyle(css);
	},
	onClick : function (e) {
		try {
			if (PlaySoundBar.MusicBrowser) {
				var panel = $("MusicBar-panel");
				panel.openPopup(PlaySoundBar.ui.logo, panel.position, 0, 0, false, null, null);
			} else {
				if (!PlaySoundBar.getBaiduFMBrowser()) {
					var panel = $("MusicBar-panel");
					if (!panel) {
						var mainPopupSet = $("mainPopupSet");
						if (mainPopupSet && !panel) {
							panel = PlaySoundBar.addPanel(mainPopupSet);
							panel.openPopup(PlaySoundBar.ui.logo, panel.position , 0, 0, false, null, null);//"after_end"
							document.addEventListener('DOMContentLoaded', function () {
								document.removeEventListener('DOMContentLoaded', arguments.callee, false);
								if (document.readyState == "complete") {
									setTimeout(PlaySoundBar.BarInnt, 1000);
								} else {
									setTimeout(arguments.callee, 100);
								}
							}, false);
						}
					} else {
						panel.openPopup(PlaySoundBar.ui.logo, panel.position, 0, 0, false, null, null);
					}
				}
			}
		} catch (e) {
			debug('error' + e)
		}
	},
	addPanel : function (mainPopupSet) {
		var panel = document.createElement("panel");
			panel.id = "MusicBar-panel";
			panel.setAttribute("type", "arrow");
			panel.setAttribute("flip", "both");
			panel.setAttribute("side", "top");
			panel.setAttribute("consumeoutsideclicks", "false");
			panel.setAttribute("noautofocus", "false");
			panel.setAttribute("panelopen", "true");
			mainPopupSet.appendChild(panel);
			var iframe = panel.appendChild(document.createElement("iframe"));
			iframe.id = "MusicBar-iframe";
			iframe.setAttribute("type", "content");
			iframe.setAttribute("flex", "1");
			iframe.setAttribute("transparent", "transparent");
			iframe.setAttribute("showcaret", "true");
			iframe.setAttribute("autocompleteenabled", "true");
			iframe.setAttribute("style", "width: "+PlaySoundBar.setting.iframe.width+"; height: "+PlaySoundBar.setting.iframe.height+";");
			iframe.setAttribute('src', PlaySoundBar.setting.url);
		return panel;
	},
	changeStateStyle : function (state, time) {
		setTimeout(function () {
			PlaySoundBar.ui.logo.setAttribute('state', state);
		}, time ? time : 200);
	},
	changeLoveStyle : function (state, time) {
		setTimeout(function () {
			PlaySoundBar.ui.love.setAttribute('love', state);
		}, time ? time : 200);
	},
	play : function () {
		this.MusicBrowser.player.play();
	},
	pause : function () {
		if (!PlaySoundBar.MusicBrowser)
			return;
		(PlaySoundBar.MusicBrowser.$("#playerpanel-btnplay")).click();
	},
	reset : function () {
		this.MusicBrowser.player.reset();
	},
	getState : function () {
		return this.MusicBrowser.player.getState();
	},
	getTitle : function () {
		var title = this.MusicBrowser.$("#playerpanel-songname").text();
		return title;
	},
	setTitle : function (title) {
		PlaySoundBar.ui.title.textContent = title;
	},
	getArtist : function () {
		var artist = PlaySoundBar.MusicBrowser.$(".playerpanel-artistname").text();
		return artist;
	},
	next : function () {
		// if (PlaySoundBar.MusicBrowser)
			// PlaySoundBar.changeStateStyle('playing');
		PlaySoundBar.MusicBrowser.playlist.next();
	},
	checkLoved : function () {
		return (PlaySoundBar.MusicBrowser.$(".playerpanel-btnlove")).hasClass("loved");
	},
	loveSong : function (loveBtn) {
		loveBtn.click();
		PlaySoundBar.changeLoveStyle('true');
	},
	deLoveSong : function (loveBtn) {
		loveBtn.click();
		PlaySoundBar.changeLoveStyle('false');
	},
	hateSong : function () {
		if (!PlaySoundBar.MusicBrowser)
			return;
		(PlaySoundBar.MusicBrowser.$(".playerpanel-btnhate")).click();
	},
	clickLoveBtn : function (e) {
		if (PlaySoundBar.MusicBrowser){
			var loveBtn = (PlaySoundBar.MusicBrowser.$(".playerpanel-btnlove"));
			if (loveBtn.hasClass("loved")) {
				PlaySoundBar.deLoveSong(loveBtn);
			} else {
				PlaySoundBar.loveSong(loveBtn);
			}
		}
	},
	addTitleChangeEvent : function (e) {
		/*添加标题改变监听器*/
		var self = this;
		self.intervalCount = 0;
		function sub(){
			try {
				self.intervalCount++;
				if(self.intervalCount > 15){
					console.error('网络太差或者脚本出问题了!');
					clearInterval(self.interval);
				}
				var title = PlaySoundBar.Browser.querySelector("#playerpanel-songname");
				if (title) {
					clearInterval(self.interval)
					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

					var observer = new MutationObserver(function (mutations) {
							mutations.forEach(function (record) {
								if (record.attributeName == "title" || record.attributeName == "href") {
									//debug(record.target.title)
									//alert(record.target.title)
									PlaySoundBar.setTitle(record.target.title + "-" + PlaySoundBar.getArtist());
									if (PlaySoundBar.checkLoved()) {
										PlaySoundBar.changeLoveStyle('true');
									} else {
										PlaySoundBar.changeLoveStyle('false');
									}
									//debug(record.oldValue)
								}
							});
						});
					observer.observe(title, {
						attributes : true,
						childList : false,
						characterData : false,
						attributeOldValue : true,
						attributeFilter : ['href']//"title",
					});
					PlaySoundBar.setTitle(PlaySoundBar.getTitle() + "-" + PlaySoundBar.getArtist());
				}
				// var panel = $("MusicBar-panel");
				// panel.hidePopup();
			} catch (e) {
				debug('error' + e);
				if(self.intervalCount > 5){
					console.error('网络太差或者脚本出问题了!');
					clearInterval(self.interval);
				}
			}
		}
		self.interval = setInterval(sub,1500);
	},
	addLyricsChangeEvent : function (e) {
		var self = this;
		self.intervalCount1 = 0;
		debug("addLyricsChangeEvent :" + new Date())
		function sub(){
			try {
				self.intervalCount1++;
				if(self.intervalCount > 15){
					console.error('网络太差或者脚本出问题了!');
					clearInterval(self.interval);
				}
				var ul = PlaySoundBar.Browser.querySelector('#playerpanel-lyrics');
				if (ul) {
					clearInterval(self.interval)
					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

					var observer = new MutationObserver(function (mutations) {
							mutations.forEach(function (record) {
								if (record.attributeName == "class") {
									if (record.target.className == "current") {
										if (record.target.textContent != "")
											PlaySoundBar.ui.lyric.textContent = record.target.textContent;
									}
								}
							});
						});
					observer.observe(ul, {
						childList : true,
						attributes : true,
						characterData : false,
						subtree : true,
						attributeOldValue : false,
						characterDataOldValue : false,
						attributeFilter : ['class']
					});
				}
			} catch (e) {
				debug('error' + e)
				if(self.intervalCount1 > 5){
					console.error('网络太差或者脚本出问题了!');
					clearInterval(self.interval1);
				}
			}
		}
		self.interval1 = setInterval(sub,1500);
	},
	BarInnt : function () {
		/*查找是否有音乐界面并初始化*/
		var Browser = PlaySoundBar.getBaiduFMBrowser();
		if (Browser) {
			debug('bar init');
			PlaySoundBar.MusicBrowser = Browser.contentWindow.wrappedJSObject;
			PlaySoundBar.Browser = Browser.contentDocument;
			try {
				PlaySoundBar.setting.showTitle ? PlaySoundBar.addTitleChangeEvent() : null;
				PlaySoundBar.setting.showLyric ? PlaySoundBar.addLyricsChangeEvent() : null;
				PlaySoundBar.toggleUI(false);
			} catch (e) {
				debug(e)
			}
			PlaySoundBar.inited = true;
			return true;
		}
		return false;
	},
	toggleUI : function(hidden){
		PlaySoundBar.setting.showTitle || PlaySoundBar.setting.showLyric ? PlaySoundBar.ui.hbox.hidden = hidden : null;
		PlaySoundBar.setting.showTitle ? PlaySoundBar.ui.title.hidden = hidden : null;
		PlaySoundBar.setting.showLyric ? PlaySoundBar.ui.lyric.hidden = hidden : null;
		PlaySoundBar.setting.showPause ? PlaySoundBar.ui.pause.hidden = hidden : null;
		PlaySoundBar.setting.showNext ? PlaySoundBar.ui.next.hidden = hidden : null;
		PlaySoundBar.setting.showLove ? PlaySoundBar.ui.love.hidden = hidden : null;
		PlaySoundBar.setting.showHate ? PlaySoundBar.ui.hate.hidden = hidden : null;
	},
	customizable : function(){
		var listenerObject  = {
			 onWidgetRemoved: function(aWidgetId, aArea) {
				if(aWidgetId == 'musicbar-container'){
					PlaySoundBar.removed = true;
					if(PlaySoundBar.inited)PlaySoundBar.toggleUI(true);
				}
			},
			onWidgetAdded: function(aWidgetId, aArea) {
				if(aWidgetId == 'musicbar-container' && PlaySoundBar.inited){
					PlaySoundBar.toggleUI(false);
				}
			},
			onCustomizeStart : function(aWindow){
				PlaySoundBar.removed = false;
			},
			onCustomizeEnd : function(aWindow){
				if(PlaySoundBar.removed == true){
					if(PlaySoundBar.inited)PlaySoundBar.pause();
				}
			}
		};
		CustomizableUI.addListener(listenerObject);
		window.addEventListener("DOMContentLoaded", function(){
			window.removeEventListener("DOMContentLoaded", arguments.callee, false);
			let areas = CustomizableUI.areas;
			for(var i in areas){
				try {
					let customizableNode = CustomizableUI.getWidgetIdsInArea(areas[i]);
					customizableNode.forEach(function (node) {
						let placement = CustomizableUI.getPlacementOfWidget(node);
						let doc = $(node);
						if (doc && placement && placement.area && node == 'musicbar-container') {
							CustomizableUI.addWidgetToArea(node, placement.area);
						}
					});
				} catch (e) {
					debug(e);
				}
			}
		});
	}
}
PlaySoundBar.addBar();
/* 添加播放工具条 */
(function(){
	 var overlay = '\
		<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
	   xmlns:html="http://www.w3.org/1999/xhtml"> \
		 <vbox id="navigator-toolbox">\
			<toolbar id="baidu-music-bar" \
			 class="toolbar-primary chromeclass-toolbar" aria-label="百度随心听"\
		   toolbarname="百度随心听" \
		   fullscreentoolbar="true"\
		   collapsed="false" \
		   hidden="false" \
			 context="" \
			 mode="icons" \
			 accesskey="T" \
			 iconsize="small" \
			 lockiconsize="true" \
			 key="baidu-music-bar-toggle-key" \
			 customizable="true" \
			 persist="collapsed">\
		  </toolbar>\
		 </vbox>\
		</overlay>';
	overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
	window.userChrome_js.loadOverlay(overlay, {});
	Components.utils.import("resource:///modules/CustomizableUI.jsm");
	CustomizableUI.registerArea("baidu-music-bar", {
      		legacy: false,
      		type: CustomizableUI.TYPE_TOOLBAR
    }, true);
})();