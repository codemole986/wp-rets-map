  
  jQuery.fn.overlay = function(opts, anim) {
    var opacity = 0;
    if (typeof opts == "number") {
      opts = {
        opacity: opts
      };
    } else {
      opts = opts || {};
      opts.opacity = opts.opacity != undefined ? opts.opacity : 0.8;
    }

    
    var overlayClass = "loading-overlay";

    
    var $overlay = jQuery("<div />")
        .addClass(overlayClass);

    var $target = jQuery(this);
    $overlay.prependTo($target);

    if (anim != undefined) {
      if(anim.duration == undefined) anim.duration = 400;
      $overlay.css(opts);
      $overlay.css(anim.from).stop().animate(anim.to);
    } else {
      $overlay.css(opts);
    }

    return this;
  };


  jQuery.fn.completed = function(anim) {
    var $target = jQuery(this).hasClass("modal") ? jQuery(this).find(".modal-dialog") : jQuery(this);

    if ((anim != undefined) && anim) {

      if(anim.duration == undefined) anim.duration = 400;
      $target.children(".loading-overlay").css(anim.from).animate(anim.to, anim.duration, function(){
        jQuery(this).remove();
      });

    } else {
      $target.children(".loading-overlay").remove();
    }
    return this;
  };


  Number.prototype.formatMoney = function(c, d, t){
    var v = this;
    var is_k = false;
    if (v > 100000) {
      v = v / 1000;
      is_k = true;
    }
    var n = v, 
      c = isNaN(c = Math.abs(c)) ? 2 : c, 
      d = d == undefined ? "." : d, 
      t = t == undefined ? "," : t, 
      s = n < 0 ? "-" : "", 
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
      j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + (is_k?'K':'');
  };