function pixelsFinger(
	ctx,
	radius,
	srcX, srcY,
	dstX, dstY,
	intensity
) {
	radius = Math.round( radius );
	srcX = Math.round( srcX );
	srcY = Math.round( srcY );
	dstX = Math.round( dstX );
	dstY = Math.round( dstY );

	let xImgPart,
		yImgPart,
		wImgPart,
		hImgPart;

	xImgPart = Math.min( srcX, dstX ), xImgPart -= Math.min( radius, xImgPart );
	yImgPart = Math.min( srcY, dstY ), yImgPart -= Math.min( radius, yImgPart );
	wImgPart = Math.max( srcX, dstX ), wImgPart += Math.min( radius, ctx.canvas.width - wImgPart );
	hImgPart = Math.max( srcY, dstY ), hImgPart += Math.min( radius, ctx.canvas.height - hImgPart );

	if ( wImgPart <= 1 || hImgPart <= 1 ) {
		return;
	}

	let exec = false,
		execImage = 0,
		x = srcX - xImgPart,
		y = srcY - yImgPart,
		xSrcInt = x,
		ySrcInt = y,
		xDstInt = x,
		yDstInt = y,
		xinc,
		yinc;

	const images = [
			ctx.getImageData( xImgPart, yImgPart, wImgPart, hImgPart ),
			ctx.getImageData( xImgPart, yImgPart, wImgPart, hImgPart )
		],
		px = [
			images[ 0 ].data,
			images[ 1 ].data
		],
		squareRadius = radius * radius,
		vx = dstX - srcX,
		vy = dstY - srcY,
		avx = Math.abs( vx ),
		avy = Math.abs( vy );

	if ( avx > avy ) {
		xinc = vx > 0 ? 1 : -1;
		yinc = vx !== 0 ? vy / avx : 0;
	} else {
		xinc = vy !== 0 ? vx / avy : 0;
		yinc = vy > 0 ? 1 : -1;
	}

	for ( let ite = Math.max( avx, avy ); ite >= 0; --ite ) {
		x += xinc;
		y += yinc;
		if ( xSrcInt !== Math.round( x ) ) {
			exec = true;
			xSrcInt = xDstInt;
			xDstInt = Math.round( x );
		}
		if ( ySrcInt !== Math.round( y ) ) {
			exec = true;
			ySrcInt = yDstInt;
			yDstInt = Math.round( y );
		}
		if ( exec ) {
			exec = false;
			proc(
				px[ execImage ],
				px[ execImage = +!execImage ],
				xSrcInt, ySrcInt,
				xDstInt, yDstInt
			);
		}
	}

	ctx.putImageData( images[ execImage ], xImgPart, yImgPart );

	function ind( x, y ) {
		return ( x + y * wImgPart ) * 4;
	}

	function proc( pxsrc, pxdst, x, y, dx, dy ) {
		for ( let iy = -radius; iy < radius; ++iy ) {
			for ( let ix = -radius; ix < radius; ++ix ) {
				const dist = ix * ix + iy * iy;

				if ( dist < squareRadius &&
					dx + ix >= 0 && dx + ix < wImgPart &&
					dy + iy >= 0 && dy + iy < hImgPart
				) {
					const di = ind( dx + ix, dy + iy );

					if (
						x + ix < 0 || x + ix >= wImgPart ||
						y + iy < 0 || y + iy >= hImgPart
					) {
						pxdst[ di     ] =
						pxdst[ di + 1 ] =
						pxdst[ di + 2 ] =
						pxdst[ di + 3 ] = 0;
					} else {
						const si = ind( x + ix, y + iy ),
							dist2 = ( 1 - dist / squareRadius ) * intensity;

						pxdst[ di     ] += ( pxsrc[ si     ] - pxdst[ di     ] ) * dist2;
						pxdst[ di + 1 ] += ( pxsrc[ si + 1 ] - pxdst[ di + 1 ] ) * dist2;
						pxdst[ di + 2 ] += ( pxsrc[ si + 2 ] - pxdst[ di + 2 ] ) * dist2;
						pxdst[ di + 3 ] += ( pxsrc[ si + 3 ] - pxdst[ di + 3 ] ) * dist2;
					}
				}
			}
		}
	}
}
