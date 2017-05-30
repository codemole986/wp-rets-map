var mph_center_settings = {
  init: function() {
    this.bind_events();
  },

  bind_events: function() {
    jQuery('.div-websites').on('click', '.btn-add-website', function(e){
      e.preventDefault();
      mph_center_settings.add_website_row();
    });

    jQuery('.div-fbs').on('click', '.btn-add-fb', function(e){
      e.preventDefault();
      mph_center_settings.add_fb_row();
    });
    jQuery('.div-twitts').on('click', '.btn-add-twitt', function(e){
      e.preventDefault();
      mph_center_settings.add_twitt_row();
    });

    jQuery('.mph-center-settings').on('click', '.btn-del', function(e){
      e.preventDefault();
      var $row = jQuery(this).closest('.row').remove();
    });

    if (jQuery('.div-websites .list .row').length < 1) {
      mph_center_settings.add_website_row();
    }

    if (jQuery('.div-fbs .list .row').length < 1) {
      mph_center_settings.add_fb_row();
    }

    if (jQuery('.div-twitts .list .row').length < 1) {
      mph_center_settings.add_twitt_row();
    }

  },

  add_website_row: function() {
    var $list = jQuery('.div-websites .list');
    var inHtml = '<div class="row row-sm">' + 
              '<div class="col col-sm-4">' + 
                '<input type="text" class="form-control" name="web_name[]" value="" placeholder="Website Title">' + 
              '</div>' + 
              '<div class="col col-sm-6">' + 
                '<input type="text" class="form-control" name="web_url[]" value="" placeholder="http://www.example.com">' + 
              '</div>' + 
              '<div class="col col-sm-2">' + 
                '<button class="btn btn-danger btn-del btn-sm"><i class="glyphicon glyphicon-trash"></i></button>' + 
              '</div>' + 
            '</div>';
    $list.append(inHtml);
  },

  add_fb_row: function() {
    var $list = jQuery('.div-fbs .list');
    var inHtml = '<div class="row row-sm">' + 
                    '<div class="col col-sm-4">' + 
                      '<input type="text" class="form-control" name="fb_name[]" value="" placeholder="Facebook User">' + 
                    '</div>' + 
                    '<div class="col col-sm-6">' + 
                      '<input type="text" class="form-control" name="fb_token[]" value="" placeholder="Facebook Access Token">' + 
                    '</div>' + 
                    '<div class="col col-sm-2">' + 
                      '<button class="btn btn-danger btn-del btn-sm"><i class="glyphicon glyphicon-trash"></i></button>' + 
                    '</div>' + 
                  '</div>';
    $list.append(inHtml);
  },

  add_twitt_row: function() {
    var $list = jQuery('.div-twitts .list');
    var inHtml = '<div class="row row-sm">' + 
                    '<div class="col col-sm-3">' + 
                      '<input type="text" class="form-control" name="twitt_name[]" value="" placeholder="Twitter User">' + 
                    '</div>' + 
                    '<div class="col col-sm-3">' + 
                      '<input type="text" class="form-control" name="twitt_token[]" value="" placeholder="Twitter Access Token">' + 
                    '</div>' + 
                    '<div class="col col-sm-3">' + 
                      '<input type="text" class="form-control" name="twitt_secret[]" value="" placeholder="Twitter Access Token Secret">' + 
                    '</div>' + 
                    '<div class="col col-sm-2">' + 
                      '<button class="btn btn-danger btn-del btn-sm"><i class="glyphicon glyphicon-trash"></i></button>' + 
                    '</div>' + 
                  '</div>';
    $list.append(inHtml);
  }

};

var mph_center_post = {
  init: function() {
    mph_center_post.bind_events();
    mph_center_post.load_data();
  },

  bind_events: function() {
    jQuery('.row-publish-option').on('change', '.in-cats input[type=checkbox]', function(){
      if (jQuery(this).prop('checked')) {
        jQuery(this).closest('.with-checkbox').find('.publish-to-web').prop('checked', true);
      }
    });
      
  },

  load_data: function() {
    jQuery('.row-publish-option .websites .publish-to-web').each(function(i, o){
      var key = jQuery(o).attr('data-id');
      var url = jQuery(o).attr('value');
      mph_center_post.load_meta(url, key);
    });
  },

  load_meta: function(website, key) {
    jQuery.ajax({
        url: ajaxurl + "?action=mph_get_meta",
        method:'POST',
        data: {'q': website, 'i': key},
    }).done(function(data) {

        if (data['error'] == '0') {
          var $wrap = jQuery('#publish_web_' + data['i'] + ' .in-cats');
          $wrap.append(data['catsList']);
          return;

          for (var slug in data['cats']) {
            if (slug == 'uncategorized') continue;
            $wrap.append('<label><input class="publish_web_cats" type="checkbox" value="' + slug + '" name="publish_web_cats[' + key + '][]"> ' + data['cats'][slug] + '</label>');
          }
        }

    }).fail(function() {
        
    }).always(function() {
        
    });
  }
}

jQuery(document).ready(function(){
  mph_center_settings.init();
  mph_center_post.init();
});