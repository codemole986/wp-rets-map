  var notify = {
    timeInterval: 3000
  };

  /**
   * Add inline message.
   * @param  object jObj       The jquery object contains message.
   * @param  string pos        The position class.
   * @param  string msg        The message.
   * @return void
   */
  notify.inlineMsg = function (jObj, msg, pos, type) {
    pos = pos || 'right';
    type = type || 'error';
    jObj.find('.msg').remove();
    jObj.prepend('<div class="msg ' + type + ' ' + pos + '">' + msg + '</div>');
    window.setTimeout(function () {
      jObj.find('.msg').fadeOut();
    }, notify.timeInterval);
  };

  /**
   * Add inline message.
   * @param  object jObj       The jquery object contains message.
   * @param  string pos        The position class.
   * @param  string msg        The message.
   * @return void
   */
  notify.inlineUpdateMsg = function (jObj, msg, pos, type) {
    if (!jObj) {
      return false;
    }
    
    var jParent = jObj.parent();

    pos = pos || 'right';
    type = type || 'error';
    jParent.find('.msg').remove();
    jParent.prepend('<div class="msg ' + type + ' ' + pos + '">' + msg + '</div>');
    jObj.removeClass('error info success');
    jObj.addClass(type);
    jObj.focus();
    window.setTimeout(function () {
      jParent.find('.msg').fadeOut();
      jObj.removeClass(type);
    }, notify.timeInterval);
  };

  notify.errorPlacement = function($ele, msg, type) {
    if (!$ele || $ele.length == 0) {
      return false;
    }

    type = type || 'error';

    var eleId = $ele.attr("id") || 'unknown';
    var $error = jQuery('<label id="' + eleId + '-error" class="' + type + '" for="' + eleId + '">' + msg + '</label>');
    
    $ele.removeClass("error info success").addClass(type);

    if ($ele.parent().is(".expanding-wrapper")) {
      $ele.parent().next("label").filter(".error, .info, .success").remove();
      $error.insertAfter($ele.parent());
    } else {
      $ele.parent().children("label").filter(".error, .info, .success").remove();     
      if (!$ele.parent().hasClass("validate-wrp")) {
        $ele.wrap('<div class="validate-wrp"></div>');
        $ele.parent().append($ele.parent().next(".select2-container"));
      }

      $ele.parent().append($error);
    }

    $ele.focus();
    setTimeout(function() {
      $error.fadeOut();
      $ele.removeClass(type);
    }, notify.timeInterval);
  };
    
   
  notify.errorPlacementCC = function($ele, msg, type) {
    if (!$ele || $ele.length == 0) {
        return false;
    }

    type = type || 'error';

    var eleId = $ele.attr("id") || 'unknown';
    var $error = jQuery('<label id="' + eleId + '-error" class="' + type + '" for="' + eleId + '">' + msg + '</label>');
  
    $ele.removeClass("error info success").addClass(type);

    if ($ele.parent().is(".expanding-wrapper")) {
        $ele.parent().next("label").filter(".error, .info, .success").remove();
      $error.insertAfter($ele.parent());
    } else {
        $ele.parent().children("label").filter(".error, .info, .success").remove();        
        if (!$ele.parent().hasClass("validate-wrp")) {
            $ele.wrap('<div class="validate-wrp"></div>');
            $ele.parent().append($ele.parent().next(".select2-container"));
        }

      $ele.parent().append($error);
    }

  };

  notify.alert = function(text, type, align, delay, width) {
    if (typeof text == "undefined" || text == "") {
      // biz.error("[notify.alert] Message is empty.");
      return false;
    }

    align = align || 'right';
    type = type || 'success';

    if (type == "error") {
      type = "danger";
    }

    if (text == null || typeof text == "undefined" || text == "") {
      type = "danger";
      text = "[2001] Empty message! Please contact the administrator.";
    }

    if (text == 'nullsubscription_error') {
      text = "There was an issue creating your subscription. Please contact our support team for assistance.";
    }

    // if this is not wrapped in HTML tags, wrap this in <p> tag
    // if (text.substr(0, 1) != "<") {
    //   text = '<p>' + text + '</p>';
    // }

    if (delay == undefined || delay == 0) {
      var delays = {
        success: 5000,
        info: 10000,
        warning: 10000,
        danger: 10000
      };

      if (delays[type] != undefined) {
        delay = delays[type];
      } else {
        delay = 20000;
      }
    }

    var defaultWidth = 600;
    width = width || defaultWidth;

    if (window.innerWidth < width) {
      width = window.innerWidth * 0.8;
    }

    jQuery.notify({
      icon: 'glyphicon glyphicon-info-sign',
      title: '',
      message: text}, {
      position: 'fixed',
      align: align,
      type: type,
      top: 36,
      delay: delay,
      width: width,
      z_index: 100000
    });
  };

  notify.clear = function() {
    jQuery.notify.clear();
  };

  notify.error = function(text, align, delay, width) {
    notify.alert(text, "danger", align, delay, width);
  };

  notify.warning = function(text, align, delay, width) {
    notify.alert(text, "warning", align, delay, width);
  };

  notify.success = function(text, align, delay, width) {
    notify.alert(text, "success", align, delay, width);
  };

  notify.info = function(text, align, delay, width) {
    notify.alert(text, "info", align, delay, width);
  };

  notify.close = function() {
    jQuery('.bootstrap-growl').alert('close');
  };

  window.notify = notify;