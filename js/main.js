var vm = new Vue({
	el: '#app',
	data: {
		title: '',
		subTitle: '',
		currentSrc: '',
		bannerWidth: 500,
		bannerHeight: 166,
		backgroundColor: '#ffffff',
		textColor: '#000000',
		cropper: null,
	},
	ready: function() {
		var img = document.getElementById('image');
		var that = this;
		img.addEventListener('load', function() {
			that.initVibrant();
		});
		that.cropper = new Cropper(image, {
			viewMode: 0,
			dragMode: 'move',
			aspectRatio: 17 / 14,
			cropBoxMovable: false,
			cropBoxResizable: false,
			autoCropArea: 1,
			crop: function(e) {
				/*console.log(e.detail.x);
				console.log(e.detail.y);
				console.log(e.detail.width);
				console.log(e.detail.height);
				console.log(e.detail.rotate);
				console.log(e.detail.scaleX);
				console.log(e.detail.scaleY);*/
			}
		});

		var box = document.getElementById('drop_area'); //拖拽区域
		box.addEventListener('dragover', function(e) {
			e.preventDefault();
		}, false);
		box.addEventListener("drop", function(e) {
			e.preventDefault(); //取消默认浏览器拖拽效果
			var fileList = e.dataTransfer.files;
			if(fileList.length == 0) {
				return false;
			}
			//检测文件是不是图片
			if(fileList[0].type.indexOf('image') === -1) {
				alert("您拖的不是图片！");
				return false;
			}
			//拖拉图片到浏览器，可以实现预览功能
			var img = window.URL.createObjectURL(fileList[0]);
			var image = document.getElementById('image');
			image.src = img;
		}, false);

		// 点击上传
		var inputElement = document.getElementsByClassName("upload")[0];
		inputElement.addEventListener("change", handleFiles, false);
		function handleFiles() {
			var fileList = this.files;
			var img = window.URL.createObjectURL(fileList[0]);
			var image = document.getElementById('image');
			image.src = img;
		}

		/*
		 * Results into:
		 * Vibrant #7a4426
		 * Muted #7b9eae
		 * DarkVibrant #348945
		 * DarkMuted #141414
		 * LightVibrant #f3ccb4
		 */
	},
	methods: {
		download: function() {
			var canvas = document.getElementById("mycanvas");
			var dataURL = canvas.toDataURL("image/png");
			var downloadButton = document.getElementById('download_button');
			dataURL = dataURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
			/* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
			dataURL = dataURL.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
			downloadButton.href = dataURL;

		},
		initVibrant: function() {
			var img = document.getElementById('image');
			var vibrant = new Vibrant(img);
			var swatches = vibrant.swatches();
			this.backgroundColor = swatches['LightVibrant'].getHex();
			this.textColor = swatches['DarkVibrant'].getHex();
			var colorBoard = document.getElementsByClassName('color-board')[0];
			colorBoard.innerHTML = '';
			for(var swatch in swatches) {
				if(swatches.hasOwnProperty(swatch) && swatches[swatch]) {
					console.log(swatch, swatches[swatch].getHex())
					var colorBlock = document.createElement('div');
					colorBlock.className = 'color-block';
					colorBlock.style.backgroundColor = swatches[swatch].getHex();
					colorBoard.appendChild(colorBlock);
				}
			}
			if(this.currentSrc === img.src) {
				return;
			}
			this.currentSrc = img.src;
			this.cropper.replace(img.src);
		},
		draw: function() {
			var img = document.getElementById('image');
			var offset = 0;
			var canvas = document.getElementById('mycanvas');
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			var baseLine = 0;

			/** draw a banner image */
			// background
			var bannerWidth = this.bannerWidth;
			var bannerHeight = this.bannerHeight;

			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(0, baseLine, bannerWidth, bannerHeight);

			// image
			var imageWidth = bannerHeight * 17 / 14;
			ctx.drawImage(this.cropper.getCroppedCanvas(), 0, baseLine, imageWidth, bannerHeight);

			// text
			ctx.fillStyle = this.textColor;
			var title = this.title;
			var subTitle = this.subTitle;

			var textWidth = bannerWidth * 0.52;
			var subSize = this.fitTextOnCanvas(ctx, subTitle, "黑体", textWidth);
			var size = this.fitTextOnCanvas(ctx, title, "黑体", textWidth);

			var gap = 5; // gap of title and subtitle
			var y1 = (bannerHeight - (subSize + size)) / 2 - gap;
			var textX = imageWidth + (bannerWidth-imageWidth-textWidth)/2;
			ctx.fillText(title, textX, baseLine + y1 + size);
			this.fitTextOnCanvas(ctx, subTitle, "黑体", textWidth);
			ctx.fillText(subTitle, textX, baseLine + y1 + size + subSize);
		},
		fitTextOnCanvas: function(context, text, fontface, distWith) {
			// start with a large font size
			var fontsize = 300;
			// lower the font size until the text fits the canvas
			do {
				fontsize--;
				context.font = fontsize + "px " + fontface;
			} while (context.measureText(text).width > distWith)
			return fontsize;
		}
	}
});