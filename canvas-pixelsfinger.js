/*
	canvas-pixelsfinger - 1.2
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
			xImgPart,
			yImgPart,
			wImgPart,
			hImgPart
		;

		xImgPart = Math.min(srcX, dstX); xImgPart -= Math.min(radius, xImgPart);
		yImgPart = Math.min(srcY, dstY); yImgPart -= Math.min(radius, yImgPart);
		wImgPart = Math.max(srcX, dstX); wImgPart += Math.min(radius, w - wImgPart);
		hImgPart = Math.max(srcY, dstY); hImgPart += Math.min(radius, h - hImgPart);

		var
			exec = false,
			execImage = 0,
			images = [
				ctx.getImageData(xImgPart, yImgPart, wImgPart, hImgPart),
				ctx.getImageData(xImgPart, yImgPart, wImgPart, hImgPart)
			],
			px = [
				images[0].data,
				images[1].data
			],
			nbPxBytes = px[0].length,
			x = srcX - xImgPart,
			y = srcY - yImgPart,
			xinc,
			yinc,
			xSrcInt = x,
			ySrcInt = y,
			xDstInt = x,
			yDstInt = y,
			squareRadius = radius * radius,
			vx = dstX - srcX,
			vy = dstY - srcY,
			avx = Math.abs(vx),
			avy = Math.abs(vy)
		;

		if (avx > avy) {
			xinc = vx > 0 ? 1 : -1;
			yinc = vx !== 0 ? vy / avx : 0;
		} else {
			xinc = vy !== 0 ? vx / avy : 0;
			yinc = vy > 0 ? 1 : -1;
		}

		function ind(x, y) { return (x + y * wImgPart) * 4; }

		function proc(pxsrc, pxdst, x, y, dx, dy) {
			var ix, iy, dist, si, di;

			for (    iy = -radius; iy < radius; ++iy)
				for (ix = -radius; ix < radius; ++ix)

					if ((dist = ix * ix + iy * iy) < squareRadius &&
					    dx + ix >= 0 && dx + ix < wImgPart &&
					    dy + iy >= 0 && dy + iy < hImgPart)
					{
						di = ind(dx + ix, dy + iy);
						if (x + ix < 0 || x + ix >= wImgPart ||
						    y + iy < 0 || y + iy >= hImgPart) {
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
					px[execImage = 1 * !execImage],
					xSrcInt, ySrcInt,
					xDstInt, yDstInt
				);
			}
		}

		ctx.putImageData(images[execImage], xImgPart, yImgPart);
	};

})();
