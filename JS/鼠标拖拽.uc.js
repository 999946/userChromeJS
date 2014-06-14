// ==UserScript==
// @name           鼠标拖拽
// @namespace      http://www.cnblogs.com/ziyunfei/archive/2011/12/20/2293928.html
// @description    对链接做上右拖拽新标签打开连接
// @version        1.0
// ==/UserScript==
// 收藏图片到百度相册
function saveImage(imgUrl){
//var imgUrl = event.dataTransfer.getData("application/x-moz-file-promise-url")
(function(window, document, ic){
	if(!window.bdxcTransfer){
		bdxcTransfer = {
			icon : ic,
			userid : 0,
			exec : function(){
				// var imgUrl;
				// imgUrl = this.getImgUrl();

				if(imgUrl == null){
					this.showHint('错误信息', '目标不是图片');
					return;
				}
				
				this.getUserId(this.transfer, imgUrl);
			},
			showHint : function(title, text){
				var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
				try {
					return alertsService.showAlertNotification(this.icon, title, text,false, "", null, "");
				} catch (e) {
					return alert(title+":"+text);
				}
			},
			transfer : function(imgUrl, userid){
				var srcUrl, descript, tags, reqUrl;

				srcUrl = window.location.href;
				descript = window.document.title;
				tags = '未分类';
				
				reqUrl = 'http://up.xiangce.baidu.com/';
				reqUrl += "opencom/picture/fav/upload?app_id=314406&descript=" + encodeURIComponent(descript) + "&uid=" + userid + "&source_url=" + srcUrl + "&tags=" + encodeURIComponent(tags) + "&url=" + encodeURIComponent(imgUrl) + "&callback=_" + "&_=" + new Date().getTime();
				
				bdxcTransfer.ajax({
					method : 'GET',
					url : reqUrl,
					onload : function(res){
						res = res.target;
						if(res.responseText.indexOf('"errno":0') > 0){
							bdxcTransfer.showHint('保存至百度相册', '成功');
						} else {
							bdxcTransfer.showHint('错误信息', '保存失败');
						}
					}
				});
			},
			getImgUrl : function(){
				var node = FireGestures.sourceNode;
				
				if(!(node instanceof HTMLImageElement)){
					return;
				}
				
				return FireGestures.getImageURL(node);
			},
			getUserId : function(callback, imgUrl){
				if(bdxcTransfer.userid !== 0){
					callback(imgUrl, userid);
					return;
				}
				
				this.ajax({
					method : 'GET',
					url : 'http://xiangce.baidu.com/bookmark',
					onload : function(res){
						var resText;
						res = res.target;
						resText = res.responseText;
						
						if(resText.indexOf('"is_login":1') < 0){
							bdxcTransfer.showHint('错误信息', '请先登录百度账号');
							return;
						}
						
						if(resText.indexOf('"user_id":') < 0){
							bdxcTransfer.showHint('错误信息', '网络傲娇了\("▔□▔)/');
							return;
						}
						
						userid = resText.substring(resText.indexOf('"user_id":') + 10, resText.indexOf(',"is_login":'));
						bdxcTransfer.userid = userid;
						callback(imgUrl, userid);
					}
				});
			},
			ajax : function(obj){
				var req;
				
				req = new XMLHttpRequest();
				console.log('>>>>'+obj.url);
				req.open(obj.method, obj.url, true);
				req.setRequestHeader('Referer', 'http://tieba.baidu.com/photo/p');
				if(obj.method === 'POST'){
					req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				}
				req.send(obj.data);
				req.onload = obj.onload;
				return req;
			}
		};
	}
	bdxcTransfer.exec();
})(content.window, content.window.document, 'data:image/jpg;base64,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');

}
location == "chrome://browser/content/browser.xul" && (function(event) {
	var self = arguments.callee;
	if (!event) {
		["dragstart", "dragover", "drop"].forEach(function(type) {
			gBrowser.mPanelContainer.addEventListener(type, self, false);
		});
		window.addEventListener("unload", function() {
			["dragstart", "dragover", "drop"].forEach(function(type) {
				gBrowser.mPanelContainer.removeEventListener(type, self, false);
			});
		}, false);
		return;
	}
	switch (event.type) {
	case "dragstart":
		{
			self.startPoint = [event.screenX, event.screenY];
			self.sourceNode = event.target;
			event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
			break;
		}
	case "dragover":
		{
			self.startPoint && (Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true);
			break;
		}
	case "drop":
		{
			if (self.startPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
				event.preventDefault();
				event.stopPropagation();
				var [subX, subY] = [event.screenX - self.startPoint[0], event.screenY - self.startPoint[1]];
				var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
				var direction;
				if (distX > distY) direction = subX < 0 ? "L" : "R";
				else direction = subY < 0 ? "U" : "D";
				if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) {
					saveImage(event.dataTransfer.getData("application/x-moz-file-promise-url"));
				} else if (event.dataTransfer.types.contains("text/x-moz-url")) {
					//新标签打开链接(前台)
					gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
				} else {}
				self.startPoint = 0;
			}
		}
	}
})()