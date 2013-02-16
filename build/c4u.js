window.C4U = {};

C4U.init = function ( selector ) {
  var _this = this;
  this.$canvas = $( selector );
  this.ctx = this.$canvas[ 0 ].getContext( '2d' );
  this.$distCanvas = $( '<canvas/>' );
  this.distCtx = this.$distCanvas[ 0 ].getContext( '2d' );
  // $( document.body ).append( this.$distCanvas );
  this.WIDTH = this.$canvas.attr( 'width' );
  this.HEIGHT = this.$canvas.attr( 'height' );
  this.items = [];
  this.pointerPosition = { x: 0, y: 0 };

  var updatePointerPosition = function ( e ) {
    var offset = C4U.$canvas.offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;
    C4U.pointerPosition = { x: x, y: y };
  }

  $( window ).on( 'mousemove', updatePointerPosition );

  this.$canvas.on( 'click', function ( e ) {
    updatePointerPosition( e );
    var x =  _this.pointerPosition.x;
    var y =  _this.pointerPosition.y;
    result = _this.hitTest( x, y );

    if( !!result ){
      result.trigger( 'click' );
    }
  } );
}

C4U.Item = function ( params ) {}

C4U.Item.prototype.initialize = function ( params ) {
  this.color = '#000';
  this.visible = true;
  this.opacity = 1.0;
  this.blendMode = 'normal';
  this.width  = params.width;
  this.height = params.height;
  this.position = {
    x: params.width  / 2,
    y: params.height / 2
  };
  this.rotation = 0;
  C4U.items.push( this );
}

C4U.Item.prototype.getBounds = function () {

//--------------------//
// TODO               //
//--------------------//

  var bounds = {
    top : -10,
    right : 5,
    bottom : 5,
    left : -5
  }
  console.log( bounds )
  return bounds;
}

C4U.Item.prototype.draw = function () {
  if( !this.visible ) {
    return;
  }
  C4U.ctx.save();
  C4U.ctx.beginPath();
  C4U.ctx.globalAlpha = this.opacity || 1.0;
  var left = this.width  / -2;
  var top = this.height / -2;
  var x = this.position.x;
  var y = this.position.y;
  var rad = this.rotation * Math.PI / 180;
  if ( this.blendMode !== 'normal' ) {
    var imageData = C4U.blend( this, C4U.ctx.getImageData( left + x, top + y, this.width, this.height ) );
    C4U.ctx.drawImage( C4U.$distCanvas[ 0 ], left + x, top + y );
  } else {
    C4U.ctx.setTransform( Math.cos( rad ), Math.sin( rad ), -Math.sin( rad ), Math.cos( rad ), x, y );
    if ( this instanceof C4U.Raster ) {
      C4U.ctx.drawImage( this.img, left, top );
    } else {
      C4U.ctx.fillStyle = this.color;
      C4U.ctx.fillRect(
        left,
        top,
        this.width,
        this.height
      );
    }
  }
  C4U.ctx.restore();
}

C4U.Item.prototype.select = function () {
  C4U.ctx.save();
  var x = this.position.x;
  var y = this.position.y;
  var rad = this.rotation * Math.PI / 180;
  C4U.ctx.setTransform( Math.cos( rad ), Math.sin( rad ), -Math.sin( rad ), Math.cos( rad ), x, y );

  var left = this.position.x - this.width  / 2;
  var top  = this.position.y - this.height / 2;
  C4U.ctx.beginPath();
  C4U.ctx.rect(
    this.width  / -2,
    this.height / -2,
    this.width,
    this.height
  );
  C4U.ctx.restore();
}

C4U.Item.prototype.on = function ( evName, callback ) {
  var _this = this;
  if ( !this._observer ) {
    this._observer = $( {} );
  }
  this._observer.on( evName, function () {
    var args = arguments;
    callback.apply( _this, args );
  } );
  return this;
};

C4U.Item.prototype.one = function ( evName, callback ) {
  var _this = this;
  if ( !this._observer ) {
    this._observer = $( {} );
  }
  this._observer.one( evName, function () {
    var args = arguments;
    callback.apply( _this, args );
  } );
  return this;
};
 
C4U.Item.prototype.off = function () {
  if ( !!this._observer ) {
    return this;
  }
  this._observer.off.apply( this, arguments );
  return this;
};
 
C4U.Item.prototype.trigger = function () {
  if ( !this._observer ) {
    return this;
  }
  this._observer.trigger.apply( this._observer, arguments );
  return this;
};


C4U.Rect = function ( width, height ) {
  var params = {
    width: width,
    height: height
  };
  this.initialize( params );
}
C4U.Rect.prototype = new C4U.Item();


C4U.Raster = function ( img ) {
  this.img = img;
  var params = {
    width: img.width,
    height: img.height
  };
  this.initialize( params );
}
C4U.Raster.prototype = new C4U.Item();

C4U.render = function () {
  C4U.ctx.clearRect( 0, 0, C4U.WIDTH, C4U.HEIGHT )
  $.each( C4U.items, function ( i ) {
    this.draw();
  } );
}

C4U.hitTest = function ( x, y ) {
  var l = C4U.items.length - 1;
  var item;
  var result;
  $.each( C4U.items, function ( i ) {C4U.ctx.restore();
    item = C4U.items[ l - i ];
    item.select();
    if( C4U.ctx.isPointInPath( x, y ) ) {
      result = item;
      return false;
    }
  } );
  return result;
}

C4U.blend = function ( src, dstD ) {
  bounds = src.getBounds();
  var w = src.width;
  var h = src.height;
  var blendMode = src.blendMode;
  C4U.$distCanvas.attr( { 'width': w, 'height': h } );
  C4U.distCtx.clearRect( 0, 0, w, h );

  var x = src.position.x;
  var y = src.position.y;
  var rad = src.rotation * Math.PI / 180;
  C4U.distCtx.setTransform( Math.cos( rad ), Math.sin( rad ), -Math.sin( rad ), Math.cos( rad ), x, y );
/*
  C4U.distCtx.rotate(-30* Math.PI / 180)
  // var x = -src.position.x;
  // var y = -src.position.y;
  // var rad = src.rotation * Math.PI / -180;
  // C4U.distCtx.setTransform( Math.cos( rad ), Math.sin( rad ), -Math.sin( rad ), Math.cos( rad ), x, y );

  console.log(src.rotation)
  console.log(src.position)

  C4U.distCtx.putImageData( dstD, 0, 0 );

  return
  */
  C4U.distCtx.drawImage( src.img, -x, -y );
  C4U.ctx.restore();

  // via. https://github.com/Phrogz/context-blender
  var srcD = C4U.distCtx.getImageData( 0, 0, w, h );
  var src  = srcD.data;
  var dst  = dstD.data;
  var sA, dA, len=dst.length;
  var sRA, sGA, sBA, dRA, dGA, dBA, dA2;
  var demultiply;

  for (var px=0;px<len;px+=4){
    sA  = src[px+3]/255;
    dA  = dst[px+3]/255;
    dA2 = (sA + dA - sA*dA);
    dst[px+3] = dA2*255;

    sRA = src[px  ]/255*sA;
    dRA = dst[px  ]/255*dA;
    sGA = src[px+1]/255*sA;
    dGA = dst[px+1]/255*dA;
    sBA = src[px+2]/255*sA;
    dBA = dst[px+2]/255*dA;

    demultiply = 255 / dA2;

    switch(blendMode){
      // ******* Very close match to Photoshop
      case 'normal':
      case 'src-over':
        dst[px  ] = (sRA + dRA - dRA*sA) * demultiply;
        dst[px+1] = (sGA + dGA - dGA*sA) * demultiply;
        dst[px+2] = (sBA + dBA - dBA*sA) * demultiply;
      break;

      case 'screen':
        dst[px  ] = (sRA + dRA - sRA*dRA) * demultiply;
        dst[px+1] = (sGA + dGA - sGA*dGA) * demultiply;
        dst[px+2] = (sBA + dBA - sBA*dBA) * demultiply;
      break;

      case 'multiply':
        dst[px  ] = (sRA*dRA + sRA*(1-dA) + dRA*(1-sA)) * demultiply;
        dst[px+1] = (sGA*dGA + sGA*(1-dA) + dGA*(1-sA)) * demultiply;
        dst[px+2] = (sBA*dBA + sBA*(1-dA) + dBA*(1-sA)) * demultiply;
      break;

      case 'difference':
        dst[px  ] = (sRA + dRA - 2 * Math.min( sRA*dA, dRA*sA )) * demultiply;
        dst[px+1] = (sGA + dGA - 2 * Math.min( sGA*dA, dGA*sA )) * demultiply;
        dst[px+2] = (sBA + dBA - 2 * Math.min( sBA*dA, dBA*sA )) * demultiply;
      break;

      // ******* Slightly different from Photoshop, where alpha is concerned
      case 'src-in':
        // Only differs from Photoshop in low-opacity areas
        dA2 = sA*dA;
        demultiply = 255 / dA2;
        dst[px+3] = dA2*255;
        dst[px  ] = sRA*dA * demultiply;
        dst[px+1] = sGA*dA * demultiply;
        dst[px+2] = sBA*dA * demultiply;
      break;

      case 'plus':
      case 'add':
        // Photoshop doesn't simply add the alpha channels; this might be correct wrt SVG 1.2
        dA2 = Math.min(1,sA+dA);
        dst[px+3] = dA2*255;
        demultiply = 255 / dA2;
        dst[px  ] = Math.min(sRA + dRA,1) * demultiply;
        dst[px+1] = Math.min(sGA + dGA,1) * demultiply;
        dst[px+2] = Math.min(sBA + dBA,1) * demultiply;
      break;

      case 'overlay':
        // Correct for 100% opacity case; colors get clipped as opacity falls
        dst[px  ] = (dRA<=0.5) ? (2*src[px  ]*dRA/dA) : 255 - (2 - 2*dRA/dA) * (255-src[px  ]);
        dst[px+1] = (dGA<=0.5) ? (2*src[px+1]*dGA/dA) : 255 - (2 - 2*dGA/dA) * (255-src[px+1]);
        dst[px+2] = (dBA<=0.5) ? (2*src[px+2]*dBA/dA) : 255 - (2 - 2*dBA/dA) * (255-src[px+2]);

        // http://dunnbypaul.net/blends/
        // dst[px  ] = ( (dRA<=0.5) ? (2*sRA*dRA) : 1 - (1 - 2*(dRA-0.5)) * (1-sRA) ) * demultiply;
        // dst[px+1] = ( (dGA<=0.5) ? (2*sGA*dGA) : 1 - (1 - 2*(dGA-0.5)) * (1-sGA) ) * demultiply;
        // dst[px+2] = ( (dBA<=0.5) ? (2*sBA*dBA) : 1 - (1 - 2*(dBA-0.5)) * (1-sBA) ) * demultiply;

        // http://www.barbato.us/2010/12/01/blimageblending-emulating-photoshops-blending-modes-opencv/#toc-blendoverlay
        // dst[px  ] = ( (sRA<=0.5) ? (sRA*dRA + sRA*(1-dA) + dRA*(1-sA)) : (sRA + dRA - sRA*dRA) ) * demultiply;
        // dst[px+1] = ( (sGA<=0.5) ? (sGA*dGA + sGA*(1-dA) + dGA*(1-sA)) : (sGA + dGA - sGA*dGA) ) * demultiply;
        // dst[px+2] = ( (sBA<=0.5) ? (sBA*dBA + sBA*(1-dA) + dBA*(1-sA)) : (sBA + dBA - sBA*dBA) ) * demultiply;

        // http://www.nathanm.com/photoshop-blending-math/
        // dst[px  ] = ( (sRA < 0.5) ? (2 * dRA * sRA) : (1 - 2 * (1 - sRA) * (1 - dRA)) ) * demultiply;
        // dst[px+1] = ( (sGA < 0.5) ? (2 * dGA * sGA) : (1 - 2 * (1 - sGA) * (1 - dGA)) ) * demultiply;
        // dst[px+2] = ( (sBA < 0.5) ? (2 * dBA * sBA) : (1 - 2 * (1 - sBA) * (1 - dBA)) ) * demultiply;
      break;

      case 'hardlight':
        dst[px  ] = (sRA<=0.5) ? (2*dst[px  ]*sRA/dA) : 255 - (2 - 2*sRA/sA) * (255-dst[px  ]);
        dst[px+1] = (sGA<=0.5) ? (2*dst[px+1]*sGA/dA) : 255 - (2 - 2*sGA/sA) * (255-dst[px+1]);
        dst[px+2] = (sBA<=0.5) ? (2*dst[px+2]*sBA/dA) : 255 - (2 - 2*sBA/sA) * (255-dst[px+2]);
      break;

      case 'colordodge':
      case 'dodge':
        if ( src[px  ] == 255 && dRA==0) dst[px  ] = 255;
        else dst[px  ] = Math.min(255, dst[px  ]/(255 - src[px  ])) * demultiply;

        if ( src[px+1] == 255 && dGA==0) dst[px+1] = 255;
        else dst[px+1] = Math.min(255, dst[px+1]/(255 - src[px+1])) * demultiply;

        if ( src[px+2] == 255 && dBA==0) dst[px+2] = 255;
        else dst[px+2] = Math.min(255, dst[px+2]/(255 - src[px+2])) * demultiply;
      break;

      case 'colorburn':
      case 'burn':
        if ( src[px  ] == 0 && dRA==0) dst[px  ] = 0;
        else dst[px  ] = (1 - Math.min(1, (1 - dRA)/sRA)) * demultiply;

        if ( src[px+1] == 0 && dGA==0) dst[px+1] = 0;
        else dst[px+1] = (1 - Math.min(1, (1 - dGA)/sGA)) * demultiply;

        if ( src[px+2] == 0 && dBA==0) dst[px+2] = 0;
        else dst[px+2] = (1 - Math.min(1, (1 - dBA)/sBA)) * demultiply;
      break;

      case 'darken':
      case 'darker':
        dst[px  ] = (sRA>dRA ? dRA : sRA) * demultiply;
        dst[px+1] = (sGA>dGA ? dGA : sGA) * demultiply;
        dst[px+2] = (sBA>dBA ? dBA : sBA) * demultiply;
      break;

      case 'lighten':
      case 'lighter':
        dst[px  ] = (sRA<dRA ? dRA : sRA) * demultiply;
        dst[px+1] = (sGA<dGA ? dGA : sGA) * demultiply;
        dst[px+2] = (sBA<dBA ? dBA : sBA) * demultiply;
      break;

      case 'exclusion':
        dst[px  ] = (dRA+sRA - 2*dRA*sRA) * demultiply;
        dst[px+1] = (dGA+sGA - 2*dGA*sGA) * demultiply;
        dst[px+2] = (dBA+sBA - 2*dBA*sBA) * demultiply;
      break;

      // ******* UNSUPPORTED
      default:
        dst[px] = dst[px+3] = 255;
        dst[px+1] = px%8==0 ? 255 : 0;
        dst[px+2] = px%8==0 ? 0 : 255;
    }
  }
  C4U.distCtx.putImageData( dstD, 0, 0 );
}

C4U.update = function ( fn ) {
  var RAF = ( function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
                window.setTimeout( callback, 1000.0 / 60.0 );
            };
  } )();
  RAF( fn );
}