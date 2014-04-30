function BlurStack()
{
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 255;
	this.next = null;
}

function make_gaussian(radius){

	var cicle_array = [];
	var size = (radius*2)+3;

	var mid = Math.floor( size / 2 );

	for (var y = 0; y < size; y++) {

		cicle_array[y] = [];

		for (var x = 0; x < size; x++) {

			var circle_eq = Math.sqrt(Math.pow(x-mid,2) + Math.pow(y-mid,2));

			if( circle_eq <= mid-1){

				cicle_array[y][x] = 1;

			}else{

				cicle_array[y][x] = 0;

			}

		}
	}

	var sum = cicle_array.reduce(function(a,b) { return a.concat(b) }).reduce(function(a,b) { return a + b });

	for (var y = 0; y < size; y++) {

		for (var x = 0; x < size; x++) {

			cicle_array[y][x] = cicle_array[y][x] / sum;

		}
	}

	return cicle_array;

}

function create_multi(gauss,highlight){

	var power = Math.pow(10, highlight);

	var wt = Math.max(gauss[Math.floor(gauss.length/2)][Math.floor(gauss.length/2)]);

	var multi = [];

	for (var i = 0; i < 256; i++) {

		if(i>240){

			multi[i] = wt*i+Math.pow(i-240, power)/240*power;

		}else{

			multi[i] = wt*i;

		}
		
	}

	return multi;
}

function get_perimiter(kernel){
	
	var side = kernel.length;
	var halfSide = Math.floor(side/2);
	var perimiter = new Array();

	var x = 0;

	for (var i = 0; i < kernel.length; i++) {

		for (var j = 0; j < kernel.length; j++) {

			if(j >= halfSide && kernel[i][j] > 0 && kernel[i][j+1] == 0){

				var temp = new Array(i,j,1);

				perimiter[x] = temp;

				x++;

			}else if(j < halfSide && kernel[i][j] == 0 && kernel[i][j+1] > 0){

				var temp = new Array(i,j,-1);

				perimiter[x] = temp;

				x++;

			}
		
		}
		
	}

	return perimiter;
}

function doConvolution(input, width, height, multi, gauss, perimiter) {

	var side = gauss.length;
	var halfSide = Math.floor(side/2);
	var src = input.data;
	var output = input;
	var dst = output.data;
	var sw = input.width;
	var sh = input.height;
	var w = sw;
	var h = sh;
	var float_dst = [];

	console.time("test");

	for (var y=0; y<h; y++) {

		var dstOff = (y*w)*4;

		for (var x=0; x<w; x++) {

			var r=0, g=0, b=0, a=0;

			var sy = y;
			var sx = x;

			var wt = gauss[halfSide][halfSide];

			if(x == 0){

				for (var cy=0; cy<side; cy++) {

					for (var cx=0; cx<side; cx++) {

						if(gauss[cy][cx] > 0){

							var scy = sy + cy - halfSide;
							var scx = sx + cx - halfSide;

							if(scy < 0){

								scy = -scy;

							}else if(scy >= sh){

								scy = sy-(scy-sy);
							}

							if(scx < 0){

								scx = -scx;

							}else if(scx >= sw){

								scx = sx-(scx-sx);
							}

							var srcOff = (scy*sw+scx)*4;

							r += multi[src[srcOff]];
							g += multi[src[srcOff+1]];
							b += multi[src[srcOff+2]];

						}

					}

				}

				float_dst[dstOff] = r;
				float_dst[dstOff+1] = g;
				float_dst[dstOff+2] = b;


			}else{

				var add_stack = new BlurStack();
				var sub_stack = new BlurStack();
				var dstOff_prev = dstOff-4;

				for (var p = 0; p < perimiter.length; p++) {

					var action = perimiter[p][2];

					var py = perimiter[p][0];
					var px = perimiter[p][1];

					var scy = sy + py - halfSide;
					var scx = sx + px - halfSide;

					if(scy < 0){

						scy = -scy;

					}else if(scy >= sh){

						scy = sy-(scy-sy);
					}

					if(scx < 0){

						scx = -scx;

					}else if(scx >= sw){

						scx = sx-(scx-sx);
					}

					var srcOff = (scy*sw+scx)*4;


					if(action == 1){

						add_stack.r += multi[src[srcOff]];
						add_stack.g += multi[src[srcOff+1]];
						add_stack.b += multi[src[srcOff+2]];

					}else if(action == -1){


						sub_stack.r += multi[src[srcOff]];
						sub_stack.g += multi[src[srcOff+1]];
						sub_stack.b += multi[src[srcOff+2]];

					}

				}

				float_dst[dstOff] = (float_dst[dstOff_prev]+add_stack.r-sub_stack.r);
				float_dst[dstOff+1] = (float_dst[dstOff_prev+1]+add_stack.g-sub_stack.g);
				float_dst[dstOff+2] = (float_dst[dstOff_prev+2]+add_stack.b-sub_stack.b);

			}

			dstOff+=4;
		}

	}

	for (var y=0; y<h; y++) {
	
		var dstOff = (y*w)*4;

		for (var x=0; x<w; x++) {

			src[dstOff] = float_dst[dstOff];
			src[dstOff+1] = float_dst[dstOff+1];
			src[dstOff+2] = float_dst[dstOff+2];
			src[dstOff+3] = 255;
			dstOff+=4;
		}

		
	}

	console.timeEnd("test");

	return input;

}

function blur_init(canvas, image, width, height, radius){

	var ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0);
	var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);

	var gauss = make_gaussian(radius);
	var multi_table = create_multi(gauss,0.01);
	var perimiter = get_perimiter(gauss);

	d = doConvolution(imgData, width, height, multi_table, gauss, perimiter);

	ctx.putImageData(imgData,0,0);

}