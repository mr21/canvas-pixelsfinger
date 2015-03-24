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
			yinc
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
			for (    var iy = -radius; iy < radius; ++iy) {
				for (var ix = -radius; ix < radius; ++ix) {

					var dist = ix * ix + iy * iy;
					if (dist < squareRadius) {

						var
							si = ind(
								x + ix,
								y + iy
							),
							di = ind(
								dx + ix,
								dy + iy
							),
							r = pxsrc[si    ],
							g = pxsrc[si + 1],
							b = pxsrc[si + 2],
							a = pxsrc[si + 3]
						;

						dist = (1 - dist / squareRadius) * intensity;

						pxdst[di    ] += (r - pxdst[di    ]) * dist;
						pxdst[di + 1] += (g - pxdst[di + 1]) * dist;
						pxdst[di + 2] += (b - pxdst[di + 2]) * dist;
						pxdst[di + 3] += (a - pxdst[di + 3]) * dist;

					}
				}
			}
		}

		var
			x = srcX,
			y = srcY,
			xSrcInt = x,
			ySrcInt = y,
			xDstInt = x,
			yDstInt = y,
			exec = false,
			iter = Math.max(avx, avy)
		;

		var
			imageSelect = 0,
			images = [
				ctx.getImageData(0, 0, w, h),
				ctx.getImageData(0, 0, w, h)
			],
			px = [
				images[0].data,
				images[1].data
			]
		;

		for (; iter !== 0; --iter) {

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
					px[imageSelect],
					px[1 * !imageSelect],
					xSrcInt, ySrcInt,
					xDstInt, yDstInt
				);
				imageSelect = 1 * !imageSelect;
			}

		}

		ctx.putImageData(images[imageSelect], 0, 0);

	};

})();
