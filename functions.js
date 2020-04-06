define([], function () {

    'use strict';

    function RGBtoHSV(r, g, b) {
        if (arguments.length === 1) {
            g = r.g, b = r.b, r = r.r;
        }
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
        case min:
            h = 0;
            break;
        case r:
            h = (g - b) + d * (g < b ? 6 : 0);
            h /= 6 * d;
            break;
        case g:
            h = (b - r) + d * 2;
            h /= 6 * d;
            break;
        case b:
            h = (r - g) + d * 4;
            h /= 6 * d;
            break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }


    function rgbToHsl(r, g, b) {

        // got from https://gist.github.com/mjackson/5311256

        r /= 255, g /= 255, b /= 255;

        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            }

            h /= 6;
        }

        return {
            h: h,
            s: s,
            l: l
        };
    }

    //takes a url of a png img and a callback and calls the callback with the data base64 of the image
    function getDataUri(url, callback) {
        var image = new Image();

        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

            canvas.getContext('2d').drawImage(this, 0, 0);
            // ... or get as Data URI
            callback(canvas.toDataURL('image/png'));
        };

        image.src = url;
    }


    const degreesToRads = deg => (deg * Math.PI) / 180.0;

    const radsToDegrees = rads => rads * (180.0 / Math.PI);


    function downloadCanasAsPNG(canvas, filename) {
        /// create an "off-screen" anchor tag
        var lnk = document.createElement('a'),
            e;

        /// the key here is to set the download attribute of the a tag
        lnk.download = filename;

        /// convert canvas content to data-uri for link. When download
        /// attribute is set the content pointed to by link will be
        /// pushed as "download" in HTML5 capable browsers
        lnk.href = canvas.toDataURL("image/png;base64");

        /// create a "fake" click-event to trigger the download
        if (document.createEvent) {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window,
                0, 0, 0, 0, 0, false, false, false,
                false, 0, null);

            lnk.dispatchEvent(e);
        } else if (lnk.fireEvent) {
            lnk.fireEvent("onclick");
        }
    }


    function limitFPSofRendering(video, canvas) {

        // this is a showcase function and might have, do not copy paste as is but study it first to get the point

        var fps = 30;
        var now;
        var then = Date.now();
        var interval = 1000 / fps;
        var delta;

        var context = canvas.getContext('2d');
        var startTimeRender = Date.now();
        var startTimePainting = Date.now();
        var paintTimes = 0;
        var renderTimes = 0;
        var timeLimit = 1000;

        function draw() {

            requestAnimationFrame(draw);

            now = Date.now();
            delta = now - then;

            renderTimes++;

            // here we just count how many times/secthe the draw function is called by the browser
            if (Date.now() - startTimeRender > timeLimit) {

                console.log("%cThe render() run " + renderTimes + " times the last " + (timeLimit / 1000) + " seconds.", "background: black; color: white; font-size: large");
                startTimeRender = Date.now();
                renderTimes = 0;

            }

            // here we enter to if the right amount of times has passed, to actually execute meaningful paint stuff
            if (delta > interval) {

                paintTimes++;

                if (Date.now() - startTimePainting > timeLimit) {

                    // here we count how many times/sec we actually painted sth meaningful
                    console.log("%cThe canvases were rendered " + paintTimes + " times the last " + (timeLimit / 1000) + " seconds.", "background: black; color: white; ");

                    startTimePainting = Date.now();
                    paintTimes = 0;
                }

                // Just `then = now` is not enough.
                // Lets say we set fps at 10 which means
                // each frame must take 100ms
                // Now frame executes in 16ms (60fps) so
                // the loop iterates 7 times (16*7 = 112ms) until
                // delta > interval === true
                // Eventually this lowers down the FPS as
                // 112*10 = 1120ms (NOT 1000ms).
                // So we have to get rid of that extra 12ms
                // by subtracting delta (112) % interval (100).
                // Hope that makes sense.

                then = now - (delta % interval);

                // ... Code for Drawing the Frame or anything meaningful ...
                context.drawImage(video, 0, 0, 854, 480);

            }
        }


    }


    function forceDrawImageToCanvas(image, canvas) {

        // consider this function as a showcase and not as sth you can copy paste it and let it work asap. Study it first because it will need a few modifications


        // this function will get an image or video and draw it on a canvas
        // it will also handle the different aspect ratios respecting the canvas ratio
        // that means that we will crop and scale linearly the image/video in order to
        // fit nicely in the canvas. We will not change the canvas because we consider it
        // client target so we should not modify it


        // <canvas id="c" width="320" height="180"></canvas>

        var ctx = canvas.getContext('2d');

        var handCanvDrawParams = calcDrawImageParams({
            sourceWidth: 210,
            sourceHeight: 90,
            displayWidth: 320,
            displayHeight: 180
        });

        ctx.drawImage(
            image,
            handCanvDrawParams.sourceX,
            handCanvDrawParams.sourceY,
            handCanvDrawParams.sourceWidth,
            handCanvDrawParams.sourceHeight,
            handCanvDrawParams.destX,
            handCanvDrawParams.destY,
            handCanvDrawParams.destWidth,
            handCanvDrawParams.destHeight
        );

        function calcDrawImageParams(params) {

            var displayAspect = params.displayWidth / params.displayHeight;
            var sourceAspect = params.sourceWidth / params.sourceHeight;

            var heightRatio = params.displayHeight / params.sourceHeight;
            var widthRatio = params.displayWidth / params.sourceWidth;

            var sx = 0;
            var sy = 0;
            var swidth = 0;
            var sheight = 0;
            var x = 0;
            var y = 0;

            var widthDiff = 0;
            var heightDiff = 0;

            var clientAspectRatio = params.displayWidth / params.displayHeight;

            if (sourceAspect > displayAspect) {
                var correctWidth = clientAspectRatio * params.sourceHeight;
                widthDiff = params.sourceWidth - correctWidth;
            } else if (sourceAspect < displayAspect) {

                var correctHeight = params.sourceWidth / clientAspectRatio;
                heightDiff = params.sourceHeight - correctHeight;
            }
            
            return {
                sourceX: widthDiff / 2,
                sourceY: heightDiff / 2,
                sourceWidth: params.sourceWidth - widthDiff,
                sourceHeight: params.sourceHeight - heightDiff,
                destX: 0,
                destY: 0,
                destWidth: params.displayWidth,
                destHeight: params.displayHeight
            }
        }

    }

    return {
        RGBtoHSV: RGBtoHSV,
        getDataUri: getDataUri,
        degreesToRads: degreesToRads,
        radsToDegrees: radsToDegrees,
        limitFPSofRendering: limitFPSofRendering
    };
});
