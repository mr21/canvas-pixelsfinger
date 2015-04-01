/*
	canvas-pixelsfinger - 1.1
	https://github.com/Mr21/canvas-pixelsfinger
*/

(function() {

	window.pixelsFinger = function
	(
		ctx,
		radius,
		srcX, srcY,
		dstX, dstY,
		intensity
	) {

		radius = Math.round(radius);
		srcX = Math.round(srcX);
		srcY = Math.round(srcY);
		dstX = Math.round(dstX);
		dstY = Math.round(dstY);

		if (srcX === dstX && srcY === dstY)
			return;

		var
			w = ctx.canvas.width,
			h = ctx.canvas.height,
			squareRadius = radius * radius,
			vx = dstX - srcX,
			vy = dstY - srcY,
			avx = Math.abs(vx),
			avy = Math.abs(vy),
			xinc,
			yinc,
			x = srcX,
			y = srcY,
			xSrcInt = x,
			ySrcInt = y,
			xDstInt = x,
			yDstInt = y,
			exec = false,
			execImage = 0,
			images = [
				ctx.getImageData(0, 0, w, h),
				ctx.getImageData(0, 0, w, h)
			],
			px = [
				images[0].data,
				images[1].data
			],
			nbPxBytes = px[0].length
		;

		if (avx > avy) {
			xinc = vx > 0 ? 1 : -1;
			yinc = vx !== 0 ? vy / avx : 0;
		} else {
			xinc = vy !== 0 ? vx / avy : 0;
			yinc = vy > 0 ? 1 : -1;
		}

		function ind(x, y) { return (x + y * w) * 4; }

		function proc(pxsrc, pxdst, x, y, dx, dy) {
			var ix, iy, dist, si, di;

			for (    iy = -radius; iy < radius; ++iy)
				for (ix = -radius; ix < radius; ++ix)

					if ((dist = ix * ix + iy * iy) < squareRadius &&
						dx + ix >= 0 && dx + ix < w &&
						dy + iy >= 0 && dy + iy < h)
					{
						di = ind(dx + ix, dy + iy);
						if (x + ix < 0 || x + ix >= w ||
							y + iy < 0 || y + iy >= h) {
							pxdst[di    ] =
							pxdst[di + 1] =
							pxdst[di + 2] =
							pxdst[di + 3] = 0;
						} else {
							si = ind(x + ix, y + iy);
							dist = (1 - dist / squareRadius) * intensity;
							pxdst[di    ] += (pxsrc[si    ] - pxdst[di    ]) * dist;
							pxdst[di + 1] += (pxsrc[si + 1] - pxdst[di + 1]) * dist;
							pxdst[di + 2] += (pxsrc[si + 2] - pxdst[di + 2]) * dist;
							pxdst[di + 3] += (pxsrc[si + 3] - pxdst[di + 3]) * dist;
						}
					}
		}

		for (var iter = Math.max(avx, avy); iter > 0; --iter) {

			x += xinc;
			y += yinc;

			if (xSrcInt !== Math.round(x)) {
				exec = true;
				xSrcInt = xDstInt;
				xDstInt = Math.round(x);
			}
			if (ySrcInt !== Math.round(y)) {
				exec = true;
				ySrcInt = yDstInt;
				yDstInt = Math.round(y);
			}
			if (exec) {
				exec = false;
				proc(
					px[execImage],
					px[1 * !execImage],
					xSrcInt, ySrcInt,
					xDstInt, yDstInt
				);
				execImage = 1 * !execImage;
			}

		}

		ctx.putImageData(images[execImage], 0, 0);

	};

})();
