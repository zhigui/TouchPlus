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
		that._bind("touchend", that.targetObj);

	}
	plus.prototype={
		fingers:1,
		touchStart:{},
		touchMove:{},
		lastTouch:{},
		touchLast:{x:0, y:0},
		scale: 1,
		handleEvent: function (e) {
			var that = this;
			switch(e.type) {
				case 'touchstart': that._start(e); break;
				case 'touchmove': that._move(e); break;
				case 'touchMove':that._end(e); break;
				case 'touchcancel': that._end(e); break;
				case 'onorientationchange': that._resize(); break;
				case "webkitTransitionEnd": that._transitionEnd(e); break;
			}
		},
		_start: function (e) {

				var that=this;
				that.zoomed = false;
				that.fingers=e.touches.length;
				that.touchStart.x1=e.touches[0].pageX;
				that.touchStart.y1=e.touches[0].pageY;
				that.touchStart.posX=that.targetObj.style.left ? parseInt(that.targetObj.style.left) : 0 ;
				that.touchStart.posY=that.targetObj.style.top ? parseInt(that.targetObj.style.top) : 0 ;
				if(e.touches.length>1){
					that.touchStart.x2=e.touches[1].pageX;
					that.touchStart.y2=e.touches[1].pageY;
					var deltaX=that.touchStart.x2-that.touchStart.x1;
					var deltaY=that.touchStart.y2-that.touchStart.y1;
					that.touchStart.delta=Math.sqrt( Math.pow(deltaX,2), Math.pow(deltaY,2) );
				}

				 
				if(that.options.zoom && e.touches.length > 1){
					c1=Math.abs(e.touches[0].pageX-e.touches[1].pageX);
					c2 =Math.abs(e.touches[0].pageY-e.touches[1].pageY);
					that.touchesDistStart = Math.sqrt(c1 * c1 + c2 * c2);
				}
			 
			

			//console.log(that.touchStart);
		},
		_move: function (e) {
			var that=this;
			e.preventDefault();
			if(e.touches.length<2){
				that.touchMove.x=e.touches[0].pageX;
				that.touchMove.y=e.touches[0].pageY;
			}else{
				that.touchMove.x=(e.touches[0].pageX+e.touches[1].pageX)/2;
				that.touchMove.y=(e.touches[0].pageY+e.touches[1].pageY)/2;
			}

			//移动
			if(that.options.move && e.touches.length ==1 ){
				var targetObjWidth=that.targetObj.clientWidth;
				var targetObjHeight=that.targetObj.clientHeight;

				// console.log(that._offset(that.wrapperObj));
				if(that.options.limitPos){
					console.log(that.touchMove.x)
				}

				var oX=that.touchMove.x-that.touchStart.x1+that.touchStart.posX;
					 
					//console.log(that.touchMove.x+"-"+that.touchStart.x1+"+"+that.touchStart.posX+"="+that.targetObj.style.left);
					//console.log(that.touchMove.x +" - "+that.touchStart.x1+" + "+offsetX+" = "+that.targetObj.style.left);
				var oY=that.touchMove.y-that.touchStart.y1+that.touchStart.posY;

				var newMove =this.repair(oX, oY);
				oX = newMove.X;
				oY= newMove.Y;

				//x、y方向
				if(that.options.moveDirection===0){

					//素的新位置= 元素旧位置+ 鼠标新位置– 鼠标旧位置
					 
					that.targetObj.style.left=oX+"px";
					that.targetObj.style.top=oY+"px";
					//console.log(that.touchMove.x+"-"+that.touchStart.x1+"+"+that.touchStart.posX+"="+that.targetObj.style.left);
					//console.log(that.touchMove.x +" - "+that.touchStart.x1+" + "+offsetX+" = "+that.targetObj.style.left);
					//that.targetObj.style.top=that.touchMove.y-that.touchStart.y1+that.touchStart.posY+"px";
				}else{
					//x轴方向
					if(that.options.moveDirection===1){
						that.targetObj.style.left=that.touchMove.x-that.touchStart.x1+that.touchStart.posX+"px";
					}
					//y轴方向
					if(that.options.moveDirection===2){
						that.targetObj.style.top=that.touchMove.y-that.touchStart.y1+that.touchStart.posY+"px";
					}	  
				}
				
			}



			//双手指放大
			if(that.options.zoom && e.touches.length > 1){
				c1=Math.abs(e.touches[0].pageX-e.touches[1].pageX);
				c2 =Math.abs(e.touches[0].pageY-e.touches[1].pageY);
				that.touchesDist = Math.sqrt(c1 * c1 + c2 * c2);
				// 移动后的距离/移动前的距离 =》比例  1 / that.touchesDistStart * that.touchesDist
				scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;
				that.lastScale = scale;
				//document.getElementById("debug").innerHTML=that.touchesDistStart;
				//this.targetObj.style["-webkit-transform"] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;
				
				that.touchMove.x=that.touchStart.x2 * scale;
				that.touchMove.y=that.touchStart.y2 * scale;
				that.touchMove.x=that.touchMove.x+this.touchLast.x;
				that.touchMove.y=that.touchMove.y+this.touchLast.y;
				this.targetObj.style["-webkit-transform"] = 'scale(' + scale + ')';
				that.zoomed = true;
			}			

			console.log( parseInt(that.targetObj.style.left) * that.lastScale);

		},
		_end: function (e) {
			var that=this;
			if(this.zoomed){
				this.scale=this.lastScale;
				this.touchLast.x=that.touchMove.x;
				this.touchLast.y=that.touchMove.y;
			}
			
			//this.scale=this.lastScale;
		},
		_resize: function (e){

		},
		_transitionEnd: function (e){

		},


		/**
		* Util
		*/
		repair: function (moveX, moveY) {

			var targetObj = that.targetObj.clientWidth;
			var wrapper=that.options.wrapper;
			var imageWidth = targetObj.clientWidth;
			var imageHeight = targetObj.clientHeight;
			var parent_width = Math.ceil(wrapper.clientWidth);
			var parent_height = Math.ceil(wrapper.clientHeight);

			//由于本来的li有一个固定不变的宽度和高度，所以，要把 窗口宽度-里面的li宽度 然后除以2，就是乐翻天值了
			var delateX = (parent_width - liObj.width()) / 2;
			var delateY = (parent_height - liObj.height()) / 2;


			//(图宽×放大倍数 - 窗宽)/2  算出来的都是正数,一般，具体情况还要观察
			//如果小的话要居中，明天再具体分析
			//var limitX=( imageWidth*VMH.transform.scaleFactor - parent_width )/2;
			//var limitY=( imageHeight*VMH.transform.scaleFactor - parent_height)/2;
			//发现倍数已经被x上去了
			var limitX = (imageWidth*this.lastScale - parent_width) / 2;
			var limitY = (imageHeight*this.lastScale - parent_height) / 2;


			if(moveX > limitX + delateX) {
				moveX = limitX + delateX;
			}
			//console.log(moveX+" < "+);
			if(moveX < (-limitX + delateX)) {
				moveX = (-limitX + delateX);
			}

			if(moveY > limitY + delateY) {
				moveY = limitY + delateY;
			}
			if(moveY < (-limitY + delateY)) {
				moveY = (-limitY + delateY);
			}

			 
			var curWidth = targetObj.clientWidth*this.lastScale;
			var curHeight = targetObj.clientHeight*this.lastScale;
			var windowWidth =wrapper.clientWidth;
			var windowHeight =wrapper.clientHeight;

			if(limitX < 0) {

				moveX = (((divWidth - curWidth) / 2) + ((divWidth - curWidth) / 2 - (divWidth - windowWidth))) / 2;


			}
			if(limitY < 0) {
				moveY = (((divHeight - curHeight) / 2) + ((divHeight - curHeight) / 2 - (divHeight - windowHeight))) / 2;
			}


			return {
				X: moveX,
				Y: moveY
			};
		},
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