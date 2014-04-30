bokeh-this.js
=============

##Fast Bokeh-blur in javascript

This is based on the 'StackBlur' image filtering concept but 2-dimensional.

1. Much faster than normal convolve filter with identical results. This method scales linear with filter size instead of quadratic.

2. Uses html5 canvas element to get image array information.

3. Bokeh.php demo page uses [dropzone.js](http://www.dropzonejs.com/) for image reading.

![bokeh](http://pixelkultur.se/wp-content/uploads/2014/04/bokeh_test.jpg)
Calculation time (My method: 600ms, Normal Convolve: 9800ms)

##How-to

Call blur_init(canvas,image,width,height,radius):

canvas - canvas element.
image - image element.
width - width of canvas.
height - height of canvas.
radius - blur radius.

When calculation is done, use toDataURL('image/png') on canvas to get src of calculated image.
