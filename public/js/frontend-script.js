// var $ = jQuery;
var mnj_parcels = {};
var mnj_map_markers = {};
var mnj_details = {};

var mnj_pack = {
  init_searchbox: function() {
    var $mnj_finders = jQuery('.mjn_finder_address');
    for (var i=0; i<$mnj_finders.length; i++) {

      jQuery($mnj_finders[i]).autoComplete({
          me: jQuery($mnj_finders[i]),
          minChars: 2,
          source: function(term, response){
              jQuery.getJSON(ajaxurl + "?action=mnj_estate_search", { q: term }, function(data){ response(data); });
          },
          renderItem: function (item, search){
            if (this.me.is(":focus")) {
              search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
              var lbl_cnt = '';
              if (parseInt(item[2]) > 1) lbl_cnt = ' (' + item[2] + ')';
              return '<div class="autocomplete-suggestion" data-val="'+search+'" data-value="'+item[1]+'">'+item[0].replace(re, "<b>$1</b>") + lbl_cnt + '</div>';
            } else {
              return '';
            }
          },
          onSelect: function(e, term, item){
            this.me.val(item.text());
            this.me.attr('parcel', item.data('value'));
            this.me.parent().find('.mjn_finder_parcel').val(item.data('value'));
            this.me.attr('data-old', this.me.val());
          }
      }).on('keydown keyup', function(){
        var oldValue = jQuery(this).attr('data-old');
        if (oldValue != jQuery(this).val()) {
          jQuery(this).attr('parcel', '');
          jQuery(this).parent().find('.mjn_finder_parcel').val('');
        }
      });   
    }
  },

  init: function() {
    mnj_pack.init_searchbox();
  }
};

var mnj_map = {
  map: null,
  detailGroupZoom: 12,
  detailZoom: 20,
  satelliteZoom: 18,

  init_map: function() {

    if(jQuery('#mnj-map-static-page').length > 0) {
      jQuery('#mnj_google_map').height(jQuery('#mnj-map-static-page .mnj_map_wrapper').height());
    }

    jQuery(window).resize(function() {
      if(jQuery('#mnj-map-static-page').length > 0) {
        jQuery('#mnj_google_map').height(jQuery('#mnj-map-static-page .mnj_map_wrapper').height());
      }      
    });

    var lasvegas = {lat: 36.1699, lng: -115.1398};
    mnj_map.map = new google.maps.Map(document.getElementById('mnj_google_map'), {
      zoom: 4,
      center: lasvegas,
      // disableDefaultUI: true
      // mapTypeId: 'satellite'
    });

    mnj_map.map.addListener('center_changed', mnj_map.map_pos_changed);
    mnj_map.map.addListener('zoom_changed', mnj_map.map_pos_changed);
  },

  map_pos_changed: function() {
    /*
    if (mnj_map.map.getZoom() < mnj_map.satelliteZoom) {
      mnj_map.map.setMapTypeId('roadmap');
    } else {
      mnj_map.map.setMapTypeId('satellite'); // terrain
    }
    */
    setTimeout(mnj_map.grab_ranged, 100);
  },

  service_search: function() {
    if (!mnj_map.search_valid()) {
      if (jQuery('#mnj_search_panel_body').attr('aria-expanded') == "false") {
        jQuery('#mng_map_search .btn-modify-criteria').trigger('click');
      }
      return false;
    }

    if (jQuery('#mnj_search_panel_body').attr('aria-expanded') == "true") {
      jQuery('#mng_map_search .btn-modify-criteria').trigger('click');
    }

    var bound = mnj_map.map.getBounds();
    var rect = [
      {lat: bound.getNorthEast().lat(), lng: .getNorthEast().lng()},
      {lat: bound.getSouthWest().lat(), lng: .getSouthWest().lng()}
    ];

    e.preventDefault();
    jQuery('body').overlay();

    // Submit the form via ajax
    jQuery.ajax({
        url: ajaxurl + "?action=mnj_estate_retrieve",
        method:'GET',
        data: jQuery(this).serialize() + "&" + jQuery.param({'rect': rect}),
    }).done(function(data) {
        // alert(data.message);
        jQuery('body').completed();
        mnj_map.handle_result(data);
        mnj_map.grab_ranged();

        // let 's check if parcel is mentioned as search key
        var search_parcel = jQuery('#mng_map_search').find('[name=parcel]').val();
        if (mnj_parcels[search_parcel]) {
          mnj_map.load_detail(search_parcel);
        }

    }).fail(function() {
        // alert('There was a problem calling you - please try again later.');
        jQuery('body').completed();
        notify.error('There was a problem calling you - please try again later.');
    }).always(function() {
        
    });
  },

  init_rule_set: function() {

    for (var i=0; i<mnj_search_rules.length; i++) {
      var $li = jQuery('<li class="clearfix"><span class="title"></span><a class="btn btn-default btn-xs btn-add pull-right"><span class="glyphicon glyphicon-plus"></span></a></li>');
      $li.attr('type', mnj_search_rules[i][0]);
      $li.find('.title').html(mnj_search_rules[i][1]);
      $li.appendTo(jQuery('#mnj_search_rule_set'));
    } 

    jQuery('.mnj_search_rule_list').on('click', '.btn-add', function() {
      var typev = jQuery(this).closest('li').attr('type');
      if (typev == '') return;

      if (jQuery('#mnj_search_rules li[type=' + typev + ']').length > 0) {
        jQuery('#mnj_search_rules li[type=' + typev + ']')/*.addClass('active')*/.find('input').eq(0).focus();
        return;
      }

      mnj_map.render_rule(typev);
    });

    jQuery('.mnj_search_rule_list').on('click', '.btn-delete', function() {
      jQuery(this).closest('li').remove();
      mnj_map.after_rull_changed();
    });

    jQuery('.mnj_search_rule_list').on('keypress', '.not-empty', function() {
      jQuery(this).parent().find('.msg').remove();
    });

  },

  render_rule_set: function (params) {
    var search_typs = [];
    for (var key in params) {
      for(var i=0; i<mnj_search_rules.length; i++) {
        if((mnj_search_rules[i][2].indexOf(key) != -1) && (search_typs.indexOf(key)==-1)) {
          search_typs.push(mnj_search_rules[i][0]);
          break;
        }
      }
    }

    for (var i=0; i<search_typs.length; i++) {
      var key = search_typs[i];
      mnj_map.render_rule(key, params);      
    }
  },

  render_rule: function(type, values) {
    var $li = jQuery('<li class="clearfix"><span class="title"></span><a class="btn btn-default btn-xs btn-delete pull-right"><span class="glyphicon glyphicon-minus"></span></a></li>');
    $li.attr('type', type);

    var inner = '';
    var value = ['','','','','','','','',''];
    if (type == 'parcel') {
      var label = 'Parcel';
      value[2] = '1';
      if(values && values['parcel']) value[0] = values['parcel'];
      if(values && values['by_radius']) value[1] = values['by_radius'];
      if(values && values['rad']) value[2] = values['rad'];
      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">' + label + '</span><input class="form-control not-empty" name="parcel" placeholder="' + label + '" value="' + value[0] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon"><input type="checkbox" name="by_radius" ' + (value[1]?"checked":'') + '>By Neibour or Radius of </span><input class="form-control"  name="rad" placeholder="Radius" value="' + value[2] + '"><span class="input-group-addon">mile</span></div>';
    } else if (type == 'address') {
      var label = 'Address';
      if(values && values['addr']) value[0] = values['addr'];
      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">' + label + '</span><input class="form-control not-empty"  name="addr" placeholder="' + label + '" value="' + value[0] + '"></div>';
    } else if (type == 'status') {
      var label = 'Status';
      if(values && values['status']) value[0] = values['status'];
      var statusList = [
        'Active',
        'Contingent Offer',
        'Expired',
        'History',
        'Leased',
        'Pending',
        'Sold'
      ];
      var optList = '';
      for (var i=0; i<statusList.length; i++) {
        var v = statusList[i];
        optList += '<option value="' + v + '" ' + (v==value[0]?'selected':'') + ' >' + (v==''?'Please select':v) + '</option>';
      }
      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">' + label + '</span><select class="form-control"  name="status">' + optList + '</select></div>';
    } else if (type == 'radius') {
      value[2] = '1';
      if(values && values['lat']) value[0] = values['lat'];
      if(values && values['lng']) value[1] = values['lng'];
      if(values && values['radius']) value[2] = values['radius'];

      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">Lat</span><input class="form-control not-empty"  name="lat" placeholder="Latitude" value="' + value[0] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon">Lng</span><input class="form-control not-empty"  name="lng" placeholder="Longitude" value="' + value[1] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon">Radius</span><input class="form-control not-empty"  name="radius" placeholder="Radius" value="' + value[2] + '"><span class="input-group-addon">mile</span></div>';
    }

    $li.find('.title').html(inner);
    $li.appendTo(jQuery('#mnj_search_rules'));

    mnj_map.after_rull_changed();
  },

  after_rull_changed: function() {
    var msg = 'No search criteria given...';
    if (jQuery('#mnj_search_rules li').length > 0) {
      msg = jQuery('#mnj_search_rules li').length + " search criteria defined.";
    }

    jQuery('.mnj-search-panel .panel-heading h3').html(msg);
  },
  
  search_valid: function() {
    var is_valid = true;
    var search_rules = [];
    jQuery('#mnj_search_rules li').each(function(i, o){
      var type = jQuery(o).attr('type');
      search_rules.push(type);
    });

    jQuery('#mnj_search_rules .not-empty').each(function(i, o){
      jQuery(o).parent().find('.msg').remove();
      if(jQuery(o).val() == '') {
        is_valid = false;
        jQuery(o).parent().append('<div class="msg error right">The field is required</div>');
      }
    });

    var should_be_there = ['parcel', 'address', 'zip', 'radius'];
    var has_should_be_there = false;
    for (var i=0; i<should_be_there.length; i++) {
      if (search_rules.indexOf(should_be_there[i]) > -1) {
        has_should_be_there = true;
        break;
      }
    }

    if (!has_should_be_there) notify.error('Please add one or more search conditions.');

    return is_valid && has_should_be_there;
  },

  bind_events: function() {
    jQuery('#mng_map_search').submit(function(e){
      mnj_map.service_search();
    });

    jQuery('body').on('click', '.property_block .btn-see-details', function(e) {
      e.preventDefault();
      var parcel = jQuery(this).closest('.property_block').attr('parcel');
      if (parcel != undefined) {
        mnj_map.load_detail(parcel);
      }
    });

    jQuery('body').on('click', '.property_block .btn-goto', function(e) {
      e.preventDefault();
      var parcel = jQuery(this).closest('.property_block').attr('parcel');
      if (parcel != undefined) {
        var center = new google.maps.LatLng(mnj_parcels[parcel]['lat'], mnj_parcels[parcel]['lng']);
        // using global variable:
        mnj_map.map.panTo(center);
        if (mnj_map.map.getZoom() < mnj_map.detailZoom) mnj_map.map.setZoom(mnj_map.detailZoom);
      }
    });

    jQuery('#panel_sort_type').on('change', function(){
      mnj_map.refresh_grabed();
    });

  },

  handle_result: function(data) {
    if(data.count > 0) {
      // mnj_map.map.checkResize();
      // mnj_map.map.panTo(new GLatLng(parseFloat(data['data'][0]['lat']),parseFloat(data['data'][0]['lng'])));
      mnj_map.map.setCenter({lat:parseFloat(data['data'][0]['lat']), lng:parseFloat(data['data'][0]['lng'])});
      if (mnj_map.map.getZoom() < mnj_map.detailGroupZoom) mnj_map.map.setZoom(mnj_map.detailGroupZoom);
    }

    for (var i=0; i<data.count; i++) {
      mnj_map.render_property(data['data'][i]);
    }

    /*
    var markerClusterOpt = {
      gridSize: 50, 
      maxZoom: 15,
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    };
    var markerCluster = new MarkerClusterer(mnj_map.map, Object.values(mnj_map_markers), markerClusterOpt);
    */

  },

  render_property: function(data) {
    var parcel = data['parcel'];
    if(mnj_parcels[parcel]) return;

    mnj_parcels[parcel] = jQuery.extend(true, {}, data);
    // add marker
    mnj_map_markers[parcel] = new google.maps.Marker({
      position: {lat: parseFloat(mnj_parcels[parcel]['lat']), lng: parseFloat(mnj_parcels[parcel]['lng'])},
      map: mnj_map.map
    });

    mnj_map_markers[parcel].parcel = parcel;

    var $info = jQuery('<div>' + jQuery('#mnj_templates #map_info').html() + '</div>');
    $info.find('.parcel').html(parcel);
    $info.find('.address').html(data['addr']);
    $info.find('.bedroom').html(data['bedrooms']);
    if (data['pools'] && (data['pools'][0] > 0)) {
      $info.find('.pool').html(data['pools'][0] + " " + data['pools'][1]);
    } else {
      $info.find('.pool').html("N/A");
    }
    
    if (data['photo'][0] > 0) {
      $info.find('.photo').html('<img src="' + data['photo'][1] + '">');
    } else {
      $info.find('.property_map_info').addClass('no-photo');
    }
    $info.find('.property_map_info').attr('parcel', parcel);
    var infowindow = new google.maps.InfoWindow({
      maxWidth: 200,
      content: $info.html()
    });
    mnj_map_markers[parcel].infowindow = infowindow;

    mnj_map_markers[parcel].addListener('mouseover', function() {
      this.infowindow.open(mnj_map.map, this);
    });
    mnj_map_markers[parcel].addListener('mouseout', function() {
      this.infowindow.close();
    });
    mnj_map_markers[parcel].addListener('click', function() {
      // Load estate content
      // mnj_map.map.panTo(marker.position);
      // marker.setAnimation(google.maps.Animation.BOUNCE);
      mnj_map.load_detail(this.parcel);
    });
  },

  open_detail_view: function() {
    jQuery('#mnj_detail_view_backdrop').show();
    jQuery('#mnj_detail_header').show();
    jQuery('#mnj_detail_view').show();
    jQuery('#mnj_detail_view .mnj_detail_content .photos').html('');
  },

  close_detail_view: function() {
    jQuery('#mnj_detail_view_backdrop').hide();
    jQuery('#mnj_detail_header').hide();
    jQuery('#mnj_detail_view').hide();
  },

  load_detail: function(parcel) {

    if(mnj_details[parcel]) {
      mnj_map.handle_detail_result(mnj_details[parcel]);
      return;
    }

    jQuery('body').overlay();

    jQuery.ajax({
        url: ajaxurl + "?action=mnj_estate_load&parcel=" + parcel,
        method:'GET'
    }).done(function(data) {
        // alert(data.message);
        jQuery('body').completed();

        if (data['error'] != 0) {
          mnj_map.close_detail_view();
          if (data['msg']) notify.error(data['msg']);
        } else {
          mnj_map.handle_detail_result(data);
        }

    }).fail(function() {
        // alert('There was a problem calling you - please try again later.');
        jQuery('body').completed();
        notify.error('There was a problem calling you - please try again later.');
        mnj_map.close_detail_view();
    }).always(function() {
        
    });
  },

  handle_detail_result: function(data) {

    mnj_map.open_detail_view();

    var p = data['data'][0];
    var parcel = p['parcel'];

    mnj_details[parcel] = data;

    // var wdtv = Math.ceil((p['photo'][0] -1 ) / 2) * 206 + 416;
    // jQuery('#mnj_detail_view .mnj_detail_content .photos').width(wdtv);
    jQuery('#mnj_detail_view .mnj_detail_content .photos').html('<div></div>');

    if (p['photo'][0] > 0) {
      jQuery('#mnj_detail_view .mnj_detail_content .photos-wrapper').show();
      jQuery('#mnj_detail_view .mnj_detail_content .photos-wrapper .photo-count').html(p['photo'][0]);

      var $div = null;
      var should_be_new = false;
      for ( var i=0; i<p['photo'][0]; i++) {
        if ((i==0) || ((i % 2) == 1)) should_be_new = true;
        if (should_be_new) {
          $div = jQuery('<div class="item"><div>');
          if (i==0) $div.addClass("is_main");
          $div.appendTo(jQuery('#mnj_detail_view .mnj_detail_content .photos > div'));
          should_be_new = false;
        }
        
        var imgName = (((i+1)<10)?'0':'') + (i+1);
        var imgUrl = p['photo'][1].replace("{NO}", imgName);
        $div.append('<a rel="' + parcel + '" href="' + imgUrl + '"><img src="' + imgUrl + '"></a>');
      }
      jQuery('#mnj_detail_view .mnj_detail_content .photos a').fancybox();
      jQuery('#mnj_detail_view .mnj_detail_content .photos > div').slick({
        "slidesToShow": 2,
        "slidesToScroll": 2, 
        "infinite": false,
        "variableWidth": true,
        "adaptiveHeight": true
      });

    } else {
      jQuery('#mnj_detail_view .mnj_detail_content .photos-wrapper').hide();
    }

    ///////////////////////////////////////////////////////////////
    var p_state = '';
    var p_state_class = '';

    if (p['type'] == 'Residential Rental') {
      jQuery('#mnj_detail_view .mnj_detail_content .prp-price-per').html('/mo');
    } else {
      jQuery('#mnj_detail_view .mnj_detail_content .prp-price-per').html('');
    }

    if (p['status'] == 'Active') {
      if (p['type'] == 'Residential Rental') {
        p_state = 'For Rent';
        p_state_class = 'rent';
      } else {
        p_state = 'For Sale';
        p_state_class = 'sale';
      }
    } else {
      p_state = p['status'];
      p_state_class = p['status'].toLowerCase();
    }
    jQuery('#mnj_detail_view .mnj_detail_content .prp-sale-state').removeClass().addClass('prp-sale-state ' + p_state_class).html(p_state);


    var info_mapping = {
      '.prp-price': 'price',
      '.full-addr': 'full_addr',
      '.bedroom-details': 'short_details',
      '.remarks': 'remarks',
      '.info-beds': 'bedrooms',
      '.info-sqft': 'sqft',
      '.info-heating': 'heating',
      '.info-cooling': 'cooling',
      '.info-appliances': 'appliances',
      '.info-other-interior': 'interior',
      '.info-parcel': 'parcel',
      '.info-mls': 'mls',
      '.info-prp-rentaltype': 'land_type',
      '.info-prp-type': 'prp_type',
      '.info-prp-roof': 'roof',
      '.info-prp-builtin': 'builtin',
    };
    for (key in info_mapping) {
      jQuery('#mnj_detail_view .mnj_detail_content ' + key).html(p[info_mapping[key]]);
    }
    

  },

  grab_ranged: function() {
    if (!jQuery('#neibour_estates').is(':visible')) return;

    var bounds = mnj_map.map.getBounds();
    mnj_map.filterd = [];    
    for (var parcel in mnj_map_markers) {
      var marker = mnj_map_markers[parcel];
      if (bounds.contains(marker.position)) {
        var data = mnj_parcels[parcel];
        if (!data) continue;
        mnj_map.filterd.push(data);  
      }
    }

    mnj_map.refresh_grabed();
  },

  refresh_grabed: function() {

    // do sort
    jQuery('#neibour_estates .lbl-cnt').html(mnj_map.filterd.length + " result" + (mnj_map.filterd.length>1?'s':'') + "." );

    var sort_type = jQuery('#panel_sort_type').val();
    mnj_map.filterd.sort(function(a, b) {
      if (sort_type == '0') {
        return (a['udt'] > b['udt'])?1:-1;
      } else if (sort_type == '1') {
        return (parseFloat(a['price']) < parseFloat(b['price']))?-1:1;
      } else if (sort_type == '2') {
        return (parseFloat(a['price']) > parseFloat(b['price']))?-1:1;
      } else if (sort_type == '3') {
        return (parseInt(a['bedrooms']) > parseInt(b['bedrooms']))?-1:1;
      } else if (sort_type == '4') {
        return (parseInt(a['bath']) > parseInt(b['bath']))?-1:1;
      } else if (sort_type == '5') {
        return (parseFloat(a['sqft']) > parseFloat(b['sqft']))?-1:1;
      } else if (sort_type == '6') {
        return (parseInt(a['builtin']) > parseInt(b['builtin']))?-1:1;
      }
    });

    jQuery('#neibour_estates_wrapper').html('');
    // after sort
    for (var i=0; i<mnj_map.filterd.length; i++) {
      
      var data = mnj_map.filterd[i];
      var parcel = data['parcel'];

      var $info = jQuery(jQuery('#mnj_templates #grabed_block').html());

      $info.find('.price-details').html('$' + data['price'].formatMoney(0) + ((data['type'] == 'Residential Rental')?'/mo':''));
      $info.find('.short-details').html(data['short_details']);
      $info.find('.addr-details').html(data['full_addr']);

      var diff = moment().diff(moment(data['udt']));
      $info.find('.time-details').html(humanizeDuration(diff, { largest: 1 }) + ' ago');
      
      if (data['photo'][0] > 0) {
        $info.find('.photo_count').html(data['photo'][0]);
        $info.find('.photo').html('<img src="' + data['photo'][1] + '">');
      } else {
        $info.addClass('no-photo');
        $info.find('.photo_count').html('No Photo');
        $info.find('.photo').html('<img src="' + home_url + '/wp-content/plugins/markninja-estate/public/imgs/no-image.png">');
      }
      $info.attr('parcel', parcel);
      
      jQuery('#neibour_estates_wrapper').append($info);

    }
  },

  init: function() {
    mnj_map.bind_events();
    mnj_map.init_rule_set();
    mnj_map.init_map();

    if (Object.keys(mnj_search_params).length > 0) {
      mnj_map.render_rule_set(mnj_search_params);
      // let 's search instantly
      jQuery('#mng_map_search').submit();
    }

  }
};

(function(){


	jQuery(document).ready(function(){
		jQuery(".fancybox").fancybox();
    mnj_pack.init();
	});


  

})();