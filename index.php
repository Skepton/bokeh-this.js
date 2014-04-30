<!DOCTYPE html>
	<head>

		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width">

		<title>Bokeh-this.js</title>

		<link rel="stylesheet" href="css/index.css">
		<script src="js/vendor/jquery.js"></script>
		<script src="js/dropzone.js"></script>

		<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800' rel='stylesheet' type='text/css'>
		
	</head>

	<body>



		<div id="color"><h1>Click to choose image!</h1></div>
		<div id="preview" style="display:none;"></div>
		<script src="js/bokeh-this.js"></script>
		<script>

			$(document).ready(function(){


				$("#color").dropzone({

					url: "/file/", autoProcessQueue:false, createImageThumbnails:false, previewsContainer: '#preview', init: function() {

						this.on("addedfile", function(file) {

							var reader = new FileReader();

							reader.onloadend = function (e) {

								$('#color').append('<img id="image-color" src="'+e.target.result+'">');
								myImage = document.getElementById('image-color');
								var w = myImage.width, h = myImage.height;

								$('#color').append('<canvas id="canvas-color" style="display:none;">');
								var canvas = document.getElementById('canvas-color');

								var ctx = canvas.getContext('2d');
								ctx.drawImage(myImage, 0, 0);

								//Set canvas size
								canvas.width = w;
								canvas.height = h;

								blur_init(canvas,myImage,w,h,20);

								myImage.src = canvas.toDataURL("image/png");

							}

							reader.readAsDataURL(file);

						});

					}
				});

			});

		</script>

	</body>
	
</html>