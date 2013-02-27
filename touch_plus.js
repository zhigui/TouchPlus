/*
 * touch_plus.js
 * version 0.0.1
 * author: ZhiguiChan
 * https://github.com/zhigui/TouchPlus/touch_plus.js
 * Licensed under the MIT license.
 */
(function(window, doc) {

	//获取浏览器的前缀
	var dummyStyle=doc.createElement('div').style,
		prefix=(function(){
			//这里用t，前缀为空的情况 t,webKitT
			var prefixs = 't,webkitT,MozT,msT,OT'.split(','),
				t,
				i=0,
				l=prefixs.length;
			for(; i<l; i++){
				t = prefixs[i] + 'ransform';
				if ( t in dummyStyle ) {
					return prefixs[i].substr(0, prefixs[i].length - 1);
				}
			}
			return false;
	})(),
	//css 前缀
	cssVendor = prefix ? '-' + prefix.toLowerCase() + '-' : '';


	function plus (element, options) {
		var that = this;
		that.targetObj=doc.getElementById(element);

		//默认选项
		that.options = {
			move:false,
			moveDirection:0,//0任意，1x轴方向，2y轴方向
			wrapper:null,
			limitPos:false,
			zoom:false

		}

		for (i in options) that.options[i] = options[i];

		if(that.options.wrapper){
			that.wrapperObj=doc.getElementById(that.options.wrapper);
			//console.log(that.wrapperObj);
		}

		that._bind("touchstart", that.targetObj);
		that._bind("touchmove", that.targetObj);

	}
	plus.prototype={
		fingers:1,
		touchStart:{},
		touchEnd:{},
		lastTouch:{},
		scale: 1,
		handleEvent: function (e) {
			var that = this;
			switch(e.type) {
				case 'touchstart': that._start(e); break;
				case 'touchmove': that._move(e); break;
				case 'touchend':that._end(e); break;
				case 'touchcancel': that._end(e); break;
				case 'onorientationchange': that._resize(); break;
				case "webkitTransitionEnd": that._transitionEnd(e); break;
			}
		},
		_start: function (e) {
			var that=this;
			that.fingers=e.touches.length;
			that.touchStart.x1=e.touches[0].pageX;
			that.touchStart.y1=e.touches[0].pageY;
			if(that.fingers>1){
				that.touchStart.x2=e.touches[1].pageX;
				that.touchStart.y2=e.touches[1].pageY;
				var deltaX=touchStart.x2-touchStart.x1;
				var deltaY=touchStart.y2-touchStart.y1;
				that.touchStart.delta=Math.sqrt( Math.pow(deltaX,2), Math.pow(deltaY,2) );
			}

			if(that.options.zoom && e.touches.length > 1 ){
				c1=Math.abs(e.touches[0].pageX-e.touches[1].pageX);
				c2 =Math.abs(e.touches[0].pageY-e.touches[1].pageY);
				that.touchesDistStart = Math.sqrt(c1 * c1 + c2 * c2);
			}

			//console.log(that.touchStart);
		},
		_move: function (e) {
			var that=this;
			e.preventDefault();

			if(that.fingers<2){
				that.touchEnd.x=e.touches[0].pageX;
				that.touchEnd.y=e.touches[0].pageY;
			}else{
				that.touchEnd.x=(e.touches[0].pageX+e.touches[1].pageX)/2;
				that.touchEnd.y=(e.touches[0].pageY+e.touches[1].pageY)/2;
			}

			//移动
			if(that.options.move){
				var targetObjWidth=that.targetObj.clientWidth;
				var targetObjHeight=that.targetObj.clientHeight;

				 console.log(that._offset(that.targetObj));
				if(that.options.limitPos){
					console.log(that.touchEnd.x)
				}
				//x、y方向
				if(that.options.moveDirection===0){
					that.targetObj.style.left=that.touchEnd.x-(targetObjWidth/2)+"px";
					that.targetObj.style.top=that.touchEnd.y-(targetObjHeight/2)+"px";
				}else{
					//x轴方向
					if(that.options.moveDirection===1){
						that.targetObj.style.left=that.touchEnd.x-(targetObjWidth/2)+"px";
					}
					//y轴方向
					if(that.options.moveDirection===2){
						that.targetObj.style.top=that.touchEnd.y-(targetObjHeight/2)+"px";
					}	  
				}
				
			}



			if(that.options.zoom && e.touches.length > 1){
				c1=Math.abs(e.touches[0].pageX-e.touches[1].pageX);
				c2 =Math.abs(e.touches[0].pageY-e.touches[1].pageY);
				that.touchesDist = Math.sqrt(c1 * c1 + c2 * c2);
				scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;
				that.lastScale = scale / this.scale;
				//this.targetObj.style["-webkit-transform"] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;
				this.targetObj.style["-webkit-transform"] = 'scale(' + scale + ')';
			}

			


		},
		_end: function (e) {

		},
		_resize: function (e){

		},
		_transitionEnd: function (e){

		},


		/**
		* Util
		*/
		_bind: function (type, el, bubble) {
			(el || this.smoothies).addEventListener(type, this, !!bubble);
		},

		_unbind: function (type, el, bubble) {
			(el || this.smoothies).removeEventListener(type, this, !!bubble);
		},
		_offset: function (el) {
			var left = -el.offsetLeft,
				top = -el.offsetTop;
				
			while (el = el.offsetParent) {
				left -= el.offsetLeft;
				top -= el.offsetTop;
			}
			
			if (el != this.wrapper) {
				left *= this.scale;
				top *= this.scale;
			}

			return { left: left, top: top };
		}
		
	}
	
	window.plus = plus;
})(window, document)