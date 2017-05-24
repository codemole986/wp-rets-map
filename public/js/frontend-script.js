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
            if (this.me.is(":focus") || true) {
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
  drawingManager: null,
  drawingShapes: ['circle', 'polygon', 'rectangle'],
  currentRect: null,
  polygons: {},
  polygonInd: 0,

  loadedMoreCount: 0,

  markers: [],
  zoomInStep: 4,
  detailGroupZoom: 12,
  detailZoom: 16,
  satelliteZoom: 18,

  viewModeLimit: 500,

  mapChangedUnderWatch: false,
  mapChangedCount: 0,
  mapChangedChecked: 0,
  mapChangedChecker: null,

  history: {
    search: '',
    bound: null,
    mode: 1
  },

  init_map: function() {

    if (!google.maps.Polygon.prototype.getBounds) {
 
      google.maps.Polygon.prototype.getBounds=function(){
          var bounds = new google.maps.LatLngBounds()
          this.getPath().forEach(function(element,index){bounds.extend(element)})
          return bounds
      }
     
    }

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
      zoom: 8,
      center: lasvegas,
      // disableDefaultUI: true
      mapTypeId: 'hybrid',
      tilt: 45
    });
    google.maps.event.addListener(mnj_map.map, 'dblclick', function (event) {
      return;
    });

    mnj_map.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        // drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
        drawingModes: mnj_map.drawingShapes
      },
      circleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 3,
        clickable: true,
        editable: true,
        zIndex: 10
      },
      polygonOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 3,
        clickable: true,
        editable: true,
        zIndex: 10
      },
      rectangleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 3,
        clickable: true,
        editable: true,
        zIndex: 10
      }

    });

    mnj_map.drawingManager.setDrawingMode(null);
    google.maps.event.addListener(mnj_map.drawingManager, 'overlaycomplete', function(event) {
      // console.log(event.type);
      if (mnj_map.drawingShapes.indexOf(event.type) < 0) {
        event.overlay.setMap(null);
        return;
      }

      mnj_map.addPolygon (event.overlay, event.type);
      mnj_map.drawingManager.setDrawingMode(null);

    });

    mnj_map.drawingManager.setMap(mnj_map.map);

    mnj_map.map.addListener('center_changed', mnj_map.map_pos_changed);
    mnj_map.map.addListener('zoom_changed', mnj_map.map_pos_changed);
  },

  addPolygon: function(polygon, pType) {
    var idv = 'poly_' + mnj_map.polygonInd;
    polygon.idv = idv;
    polygon.type = pType;
    polygon.setOptions({draggable: true});

    mnj_map.polygons[idv] = polygon;
    google.maps.event.addListener(polygon, 'dblclick', function (event) {
      event.stop();
      this.setMap(null);
      delete mnj_map.polygons[this.idv];
      return false;
    });

    /*
    if (pType == 'circle') {
      google.maps.event.addListener(polygon, 'center_changed', function (event) {});
      google.maps.event.addListener(polygon, 'radius_changed', function (event) {});
    } else if (pType == 'rectangle') {
      google.maps.event.addListener(polygon, 'bounds_changed', function (event) {});
    } else if (pType == 'polygon') {
      polygon.getPaths().forEach(function(path, index){
        google.maps.event.addListener(path, 'insert_at', function(){
          // New point
        });
        google.maps.event.addListener(path, 'remove_at', function(){
          // Point was removed
        });
        google.maps.event.addListener(path, 'set_at', function(){
          // Point was moved
        });

      });

      google.maps.event.addListener(polygon, 'dragend', function(){
        // Polygon was dragged
      });
    }
    */

    mnj_map.polygonInd ++;
  },

  backupPolygons: function() {
    var polygons = [];
    for (var key in mnj_map.polygons) {
      var polygon = mnj_map.polygons[key];
      var poly = {
        'type': mnj_map.polygons[key].type
      };
      if (polygon.type == 'circle') {
        poly.center = polygon.getCenter();
        poly.radius = polygon.getRadius();
      } else if (polygon.type == 'rectangle') {
        poly.bound = polygon.getBounds();
      } else if (polygon.type == 'polygon') {
        var paths = [];
        polygon.getPath().forEach(function(path, index){
          paths.push({lat: path.lat(), lng: path.lng()});
        });
        poly.path = paths;
      }
      polygons.push(poly);
    }
    return polygons;
  },

  drawPolygons: function(polygons) {

    for (var i=0; i<polygons.length; i++) {
      if (polygons[i].type == 'circle') {
        var polygon = new google.maps.Circle({
          map: mnj_map.map,
          center: polygons[i].center,
          radius: polygons[i].radius,
          editable: true,
          fillColor: '#ffff00',
          fillOpacity: 0.2,
          strokeWeight: 3,
          zIndex: 10
        });
        mnj_map.addPolygon(polygon, 'circle');
      } else if (polygons[i].type == 'rectangle') {
        var polygon = new google.maps.Rectangle({
          map: mnj_map.map,
          bounds: polygons[i].bound,
          editable: true,
          fillColor: '#ffff00',
          fillOpacity: 0.2,
          strokeWeight: 3,
          zIndex: 10
        });
        polygon.setMap(mnj_map.map);
        mnj_map.addPolygon(polygon, 'rectangle');
      } else if (polygons[i].type == 'polygon') {
        var polygon = new google.maps.Polygon({
          map: mnj_map.map,
          paths: polygons[i].path,
          editable: true,
          fillColor: '#ffff00',
          fillOpacity: 0.2,
          strokeWeight: 3,
          zIndex: 10
        });
        mnj_map.addPolygon(polygon, 'polygon');
      }
    }

  },

  getPolygonsBound: function() {
    var bound = new google.maps.LatLngBounds();

    for (var key in mnj_map.polygons) {
      var moreBound = mnj_map.polygons[key].getBounds();
      bound.extend(moreBound.getNorthEast());
      bound.extend(moreBound.getSouthWest());
    }

    return bound;
  },

  hasPolygons: function() {
    return (Object.keys(mnj_map.polygons).length > 0);
  },

  isInPolygon: function(latlng) {
    var isInPolygon = false;
    for (var key in mnj_map.polygons) {
      if (mnj_map.polygons[key].type == 'polygon') {
        if (google.maps.geometry.poly.containsLocation(latlng, mnj_map.polygons[key])) {
          isInPolygon = true;
          break;
        }  
      } else if (mnj_map.polygons[key].type == 'rectangle') { 
        if (mnj_map.polygons[key].getBounds().contains(latlng)) {
          isInPolygon = true;
          break;
        }
      } else if (mnj_map.polygons[key].type == 'circle') { 
        if (google.maps.geometry.spherical.computeDistanceBetween( 
            latlng,
            mnj_map.polygons[key].getCenter()
        ) <= mnj_map.polygons[key].getRadius()) {
          isInPolygon = true;
          break;
        }
      }
    }
    return isInPolygon;
  },


  map_pos_changed: function() {
    if (!mnj_map.mapChangedUnderWatch) return;
    mnj_map.mapChangedCount ++;
    if (!mnj_map.mapChangedChecker) mnj_map.mapChangedChecker = setInterval(mnj_map.checkMapChange, 500);
  },

  checkMapChange: function() {
    if (!mnj_map.mapChangedUnderWatch) return;

    if ((mnj_map.mapChangedCount > 0) && (mnj_map.mapChangedCount == mnj_map.mapChangedChecked)) {
      mnj_map.initCheckMapState();
      mnj_map.service_search();
    } else {
      mnj_map.mapChangedChecked = mnj_map.mapChangedCount;
    }
  },

  initCheckMapState: function() {
    mnj_map.mapChangedCount = 0;
    mnj_map.mapChangedChecked = 0;
    clearInterval(mnj_map.mapChangedChecker);
    mnj_map.mapChangedChecker = null;
  },

  composeSearchQuery: function() {
    var searchByForm = jQuery('#mng_map_search').serialize();
    var customObjs = jQuery('#mnj_search_rules li[type=custom]');
    var customRules = [];
    for (var i=0; i<customObjs.length; i++) {
      var key = jQuery('.mnj-search-custom-field', customObjs[i]).val();
      if (key == '') continue;

      var obj = [];
      obj.push(key);
      if (mnjListValues[key] && mnjListValues[key].length > 0) {
        obj.push('=');
        obj.push(jQuery('.mnj-search-custom-value1-list', customObjs[i]).val());
        obj.push('');
      } else {
        obj.push(jQuery('.mnj-search-custom-op', customObjs[i]).val());
        obj.push(jQuery('.mnj-search-custom-value1', customObjs[i]).val());
        obj.push(jQuery('.mnj-search-custom-value2', customObjs[i]).val());
      }
      customRules.push(obj);
    }

    if (customRules.length > 0) {
      searchByForm += ((searchByForm=="")?"":"&") + "custom=" + encodeURIComponent(JSON.stringify(customRules));  
    }

    if (mnj_map.hasPolygons() || mnj_map.map.getZoom() > 16) {
      searchByForm += ((searchByForm=="")?"":"&") + "mode=0";  
    }

    var polys = mnj_map.backupPolygons();
    searchByForm += ((searchByForm=="")?"":"&") + "polygons=" + JSON.stringify(polys);
    
    return searchByForm;
  },

  drawBounds: function(bound) {

    var NE = bound.getNorthEast();
    var SW = bound.getSouthWest();
    var NW = new google.maps.LatLng(NE.lat(),SW.lng());
    var SE = new google.maps.LatLng(SW.lat(),NE.lng());
    var lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeColor: '#FFFF00',
      strokeOpacity: 1,
      scale: 4
    };

    mnj_map.currentRect = new google.maps.Polyline({
        path: [NE, SE, SW, NW, NE],
        strokeOpacity: 0,
        icons: [{
          icon: lineSymbol,
          offset: '0',
          repeat: '20px'
        }],
        map: mnj_map.map
      });
    // mnj_map.currentRect = new google.maps.Rectangle({
    //   strokeColor: '#FF0000',
    //   strokeOpacity: 0.1,
    //   strokeWeight: 1,
    //   fillColor: '#FF0000',
    //   fillOpacity: 0.1,
    //   map: mnj_map.map,
    //   bounds: bound
    // });
  },

  service_search: function(isForced) {

    mnj_map.mapChangedUnderWatch = false;

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
    if (mnj_map.hasPolygons()) {
      bound = mnj_map.getPolygonsBound();
    }

    var rect = [
      {lat: bound.getSouthWest().lat(), lng: bound.getSouthWest().lng()},
      {lat: bound.getNorthEast().lat(), lng: bound.getNorthEast().lng()}
    ];
    
    var searchByForm = mnj_map.composeSearchQuery();

    if (!isForced) {
      ////////////////////////////////////////////////////
      // check if really need to reload ...
      //

      // mnj_map.map.getProjection().fromLatLngToPoint(
      //     mnj_map.map.getCenter()
      // );

      if (mnj_map.history.search == searchByForm) {
        if (mnj_map.history.bound) {

          // If same bounds, then no need to fetch again
          if (mnj_map.history.bound.equals(bound)) {
            mnj_map.mapChangedUnderWatch = true;
            return;
          }

          // If moved JUST A LITTLE, then no need to fetch again
          if (mnj_map.history.zoom == mnj_map.map.getZoom()) {
            var scale = Math.pow(2, mnj_map.history.zoom);
            var lastCenter = mnj_map.map.getProjection().fromLatLngToPoint(mnj_map.history.center);
            var nowCenter = mnj_map.map.getProjection().fromLatLngToPoint(mnj_map.map.getCenter());
            var roughDist = scale * (Math.abs(lastCenter.x-nowCenter.x) + Math.abs(lastCenter.y-nowCenter.y));
            // console.log(lastCenter);
            // console.log(nowCenter);
            // console.log(roughDist);
            if (roughDist < 50) {
              mnj_map.mapChangedUnderWatch = true;
              return;
            }
          }

          
          // let 's check if bound is containig...
          var isContained = true;
          if ( !mnj_map.history.bound.contains(bound.getSouthWest()) )  isContained = false;
          if ( !mnj_map.history.bound.contains(bound.getNorthEast()) )  isContained = false;
          
          if (isContained) {
            // only refresh the list
            if (mnj_map.history.mode == '0') {
              mnj_map.mapChangedUnderWatch = true;
              mnj_map.service_list(1);
              return;
            } else if (mnj_map.history.mode == '1') {
              if (mnj_map.map.getZoom() < 12) {

                // let's check if contained zipcode properties are more than the limit to switche the view mode
                var totalCnt = 0;
                for (var i = 0; i < mnj_map.markers.length; i++ ) {
                  if ((mnj_map.markers[i].mode == '1') && mnj_map.history.bound.contains(mnj_map.markers[i].getPosition())) {
                    totalCnt += parseInt(mnj_map.markers[i].cnt);
                  }
                }
                if (totalCnt > mnj_map.viewModeLimit) {
                  mnj_map.mapChangedUnderWatch = true;
                  mnj_map.service_list(1);
                  return;
                }

              }
            }
          }
        }
      }
      //
    }

    jQuery('body').overlay();

    if (mnj_map.currentRect)  mnj_map.currentRect.setMap(null);
    if (mnj_map.hasPolygons()) {
      bound = mnj_map.getPolygonsBound();
      mnj_map.map.fitBounds(bound);
      // mnj_map.drawBounds(bound);
    }

    mnj_map.history.zoom = mnj_map.map.getZoom();
    mnj_map.history.search = searchByForm;
    mnj_map.history.bound = bound;
    mnj_map.history.center = mnj_map.map.getCenter();

    var finalParams = searchByForm + "&" + jQuery.param({'rect': rect}) + "&order_type=" + jQuery('#neibour_estates #panel_sort_type').val();
    var nowUrl = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
    history.pushState({}, jQuery(document).find("title").text(), nowUrl + '?' + finalParams);

    // Submit the form via ajax
    jQuery.ajax({
        url: ajaxurl + "?action=mnj_estate_retrieve",
        method:'POST',
        data: finalParams,
    }).done(function(data) {
        // alert(data.message);
        jQuery('body').completed();
        mnj_map.mapChangedUnderWatch = true;

        if (!data || data.error != '0') {
          notify.error('Oops. Something went wrong. Please try again later.' + ((data&&data.msg)?('<br>' + data.msg):'') );
          return;
        }

        mnj_map.history.mode = data.mode;
        mnj_map.handle_result(data);
        mnj_map.render_list(data, true);

        // let 's check if parcel is mentioned as search key
        var search_parcel = jQuery('#mng_map_search').find('[name=parcel]').val();
        if (search_parcel)  mnj_map.load_detail(search_parcel);
        

    }).fail(function() {
        // alert('There was a problem calling you - please try again later.');
        jQuery('body').completed();
        mnj_map.mapChangedUnderWatch = true;

        notify.error('Oops. Something went wrong. Please try again later.');
        mnj_map.mapChangedUnderWatch = true;
    }).always(function() {
        
    });
  },

  service_list: function(page, limit) {

    if (jQuery('#neibour_estates_loadmore_state').hasClass('loading'))  return;

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
    if (mnj_map.hasPolygons()) {
      bound = mnj_map.getPolygonsBound();
    }

    var rect = [
    {lat: bound.getSouthWest().lat(), lng: bound.getSouthWest().lng()},
      {lat: bound.getNorthEast().lat(), lng: bound.getNorthEast().lng()}
    ];

    // jQuery('#neibour_estates').overlay({'position': 'absolute'});
    jQuery('#neibour_estates_loadmore_state').addClass('loading');
    
    var searchByForm = mnj_map.composeSearchQuery();

    /*
    // on hold now...
    if (mnj_map.history.search == searchByForm) {

    } else {
      mnj_map.history.search = searchByForm;
    }
    */

    // Submit the form via ajax
    jQuery.ajax({
        url: ajaxurl + "?action=mnj_estate_list",
        method:'GET',
        data: searchByForm + "&" + jQuery.param({'rect': rect}) + "&page=" + page + "&order_type=" + jQuery('#neibour_estates #panel_sort_type').val(),
    }).done(function(data) {
        // alert(data.message);
        // jQuery('#neibour_estates').completed();
        jQuery('#neibour_estates_loadmore_state').removeClass('loading');
        if (!data || data.error != '0') {
          notify.error('Oops. Something went wrong. Please try again later.' + ((data&&data.msg)?('<br>' + data.msg):'') );
          return;
        }

        mnj_map.render_list(data);

    }).fail(function() {
        // alert('There was a problem calling you - please try again later.');
        jQuery('#neibour_estates').completed();
        notify.error('Oops. Something went wrong. Please try again later.');
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

      if (['custom'].indexOf(typev) > -1) {
        // should be able to type several conditions
      } else {
        // should NOT be able to type several conditions
        if (typev == '') return;

        if (jQuery('#mnj_search_rules li[type=' + typev + ']').length > 0) {
          jQuery('#mnj_search_rules li[type=' + typev + ']')/*.addClass('active')*/.find('input').eq(0).focus();
          return;
        }
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
    var customs = false;
    try {
      customs = JSON.parse(params['custom']);
    } catch(e){}

    delete params['custom'];

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

    if (customs) {
      for (var i=0; i<customs.length; i++) {
        mnj_map.render_rule('custom', customs[i]);

      }
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
      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">' + label + '</span><input type="text" class="form-control not-empty" name="parcel" placeholder="' + label + '" value="' + value[0] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon"><input type="checkbox" name="by_radius" ' + (value[1]?"checked":'') + '>By Neibour or Radius of </span><input type="text" class="form-control"  name="rad" placeholder="Radius" value="' + value[2] + '"><span class="input-group-addon">mile</span></div>';
    } else if (type == 'address') {
      var label = 'Address';
      value[4] = '1';
      if(values && values['addr']) value[0] = values['addr'];
      if(values && values['lat']) value[1] = values['lat'];
      if(values && values['lng']) value[2] = values['lng'];
      if(values && values['by_radius_addr']) value[3] = values['by_radius_addr'];
      if(values && values['rad_addr']) value[4] = values['rad_addr'];

      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">' + label + '</span><input type="text" class="form-control not-empty"  name="addr" placeholder="' + label + '" value="' + value[0] + '"></div>';
      inner += '<div class="">';
      inner += '<div class="input-group input-group-sm" style="display: none;"><span class="input-group-addon">Lat</span><input type="text" class="form-control not-empty"  name="lat" placeholder="Latitude" value="' + value[1] + '"></div>';
      inner += '<div class="input-group input-group-sm" style="display: none;"><span class="input-group-addon">Lng</span><input type="text" class="form-control not-empty"  name="lng" placeholder="Longitude" value="' + value[2] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon"><input type="checkbox" name="by_radius_addr" ' + (value[3]?"checked":'') + '>By Radius of </span><input type="text" class="form-control"  name="rad_addr" placeholder="Radius" value="' + value[4] + '"><span class="input-group-addon">mile</span></div>';
      inner += '</div>';
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

      inner = '<div class="input-group input-group-sm"><span class="input-group-addon">Lat</span><input type="text" class="form-control not-empty"  name="lat" placeholder="Latitude" value="' + value[0] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon">Lng</span><input type="text" class="form-control not-empty"  name="lng" placeholder="Longitude" value="' + value[1] + '"></div>';
      inner += '<div class="input-group input-group-sm"><span class="input-group-addon">Radius</span><input type="text" class="form-control not-empty"  name="radius" placeholder="Radius" value="' + value[2] + '"><span class="input-group-addon">mile</span></div>';
    } else if (type == 'custom') {
      inner = jQuery('#mnj_custom_fields_model').html();
    }

    $li.find('.title').html(inner);
    $li.appendTo(jQuery('#mnj_search_rules'));

    if (type == 'address') {
      var elemObj = $li.find('.title input[name=addr]').get(0);
      var searchBox = new google.maps.places.SearchBox(elemObj);
      searchBox.obj = elemObj;

      google.maps.event.addListener(searchBox, 'places_changed', mnj_map.searchByAddr);
    } else if (type == 'custom') {
      if (values && values.length > 0) {
        $li.find('.mnj-search-custom-field').val(values[0]).change();
        $li.find('.mnj-search-custom-op').val(values[1]);
        $li.find('.mnj-search-custom-value1').val(values[2]);
        $li.find('.mnj-search-custom-value1-list').val(values[2]);
        $li.find('.mnj-search-custom-value2').val(values[3]);
      }
    }

    mnj_map.after_rull_changed();
  },

  after_rull_changed: function() {
    var msg = 'No search criteria given...';
    if (jQuery('#mnj_search_rules li').length > 0) {
      msg = jQuery('#mnj_search_rules li').length + " search criteria defined.";
    }

    jQuery('.mnj-search-panel .panel-heading h3').html(msg);
  },
  
  searchByAddr: function() {
    
    var parentObj = jQuery(this.obj).closest('.title');
    parentObj.find('input[name=lat]').val('');
    parentObj.find('input[name=lng]').val('');

    var places = this.getPlaces(), place;


    if (!places || !places.length) {
      // google.maps.event.trigger(fn.map.$addr, 'focus');
      // google.maps.event.trigger(fn.map.$addr, 'keydown', {keyCode: 13});
      return;
    }

    place = places[0];
    if (place.formatted_address) {
      parentObj.find('input[name=lat]').val(place.geometry.location.lat());
      parentObj.find('input[name=lng]').val(place.geometry.location.lng());
    }

  },

  search_valid: function() {
    return true;

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
      e.preventDefault();
      mnj_map.service_search(true);
    });

    jQuery('#mng_map_search').on('keyup keypress', function(e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13) { 
        e.preventDefault();
        return false;
      }
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

        if (mnj_map_markers[parcel]) {
          mnj_map_markers[parcel].setAnimation(google.maps.Animation.BOUNCE);
        }
      }
    });

    jQuery('body').on('click', '#neibour_estates_nav .nav-item a', function(e) {
      if (jQuery(this).hasClass('disabled')) return;
      mnj_map.service_list(jQuery(this).attr('data-page'));
    });

    jQuery('#panel_sort_type').on('change', function(){
      mnj_map.service_list(jQuery('#neibour_estates_nav .nav-item.active a').attr('data-page'));
    });

    jQuery('body').on('change', '.mnj-search-custom-op', function(e){
      var opt = jQuery(this).val();
      if (opt == 'between') {
        jQuery(this).closest('.title').find('.mnj-search-custom-value1').css('width', '50%').show();
        jQuery(this).closest('.title').find('.mnj-search-custom-value2').css('width', '50%').show();
      } else if ((opt == 'null') || (opt == 'not-null')) {
        jQuery(this).closest('.title').find('.mnj-search-custom-value1').hide();
        jQuery(this).closest('.title').find('.mnj-search-custom-value2').hide();
      } else {
        jQuery(this).closest('.title').find('.mnj-search-custom-value1').css('width', '100%').show();
        jQuery(this).closest('.title').find('.mnj-search-custom-value2').hide();
      }
    });

    jQuery('body').on('change', '.mnj-search-custom-field', function(e){
      var key = jQuery(this).val();
      if (key == '') {
        jQuery(this).closest('.title').find('.mnj-search-custom-op').val('=').change();
        return;
      }

      if (mnjListValues[key] && mnjListValues[key].length > 0) {
        var op = '<option value="=">Equal</option>';
        jQuery(this).closest('.title').find('.mnj-search-custom-op').html(op);

        jQuery(this).closest('.title').find('.mnj-search-custom-value1').hide();
        jQuery(this).closest('.title').find('.mnj-search-custom-value2').hide();

        jQuery(this).closest('.title').find('.mnj-search-custom-value1-list').html('').show();
        for(var i=0; i<mnjListValues[key].length; i++) {
          var $opt = jQuery('<option></option>');
          $opt.attr('value', mnjListValues[key][i]);
          $opt.text(mnjListValues[key][i]);
          $opt.appendTo(jQuery(this).closest('.title').find('.mnj-search-custom-value1-list'));
        }
      } else {
        var op = '<option value="=">Equal</option>' + 
            '<option value="<>">NOT Equal</option>' + 
            '<option value="null">NULL</option>' + 
            '<option value="not-null">NOT NULL</option>' + 
            '<option value="between">BETWEEN</option>' + 
            '<option value="<"><</option>' + 
            '<option value=">">></option>';
        jQuery(this).closest('.title').find('.mnj-search-custom-op').html(op).val('=').change();
        jQuery(this).closest('.title').find('.mnj-search-custom-value1-list').html('').hide();
      }
    });

    jQuery('#neibour_estates_wrapper').scroll(function(){
      var currentPos = jQuery(this).scrollTop() + jQuery(this).height();
      var totalHeight = jQuery(this).get(0).scrollHeight;

      if (currentPos > totalHeight - 100) {
        mnj_map.load_more();
      }
    });

  },

  load_more: function() {
    var nextPage = jQuery('#mnj_next_page').val();
    if (nextPage != '-1') mnj_map.service_list(nextPage);
  },

  handle_result: function(data) {
    
    // if(data.map.length > 0) {
    //   // mnj_map.map.checkResize();
    //   // mnj_map.map.panTo(new GLatLng(parseFloat(data['data'][0]['lat']),parseFloat(data['data'][0]['lng'])));
    //   mnj_map.map.setCenter({lat:parseFloat(data['map'][0]['lat']), lng:parseFloat(data['map'][0]['lng'])});
    //   // if (mnj_map.map.getZoom() < mnj_map.detailGroupZoom) mnj_map.map.setZoom(mnj_map.detailGroupZoom);
    // }

    for (var i = 0; i < mnj_map.markers.length; i++ ) {
      mnj_map.markers[i].setMap(null);
    }
    mnj_map.markers = [];
    mnj_map_markers = {}

    for (var i=0; i<data.map.length; i++) {
      mnj_map.render_property(data.map[i], data.mode);
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

  isPropertyInMap: function(key) {
    var keys = Object.keys(mnj_map_markers);
    return (keys.indexOf(key) > -1);
  },

  render_property: function(data, mode) {

    var marker = null;

    if (mode == 0) {
      var parcel = data['parcel'];

      var images = [
        pluginurl + 'public/imgs/map/h-grey.png',
        pluginurl + 'public/imgs/map/h-blue.png',
        pluginurl + 'public/imgs/map/h-green.png',
        pluginurl + 'public/imgs/map/h-orange.png',
        pluginurl + 'public/imgs/map/h-pink.png'
      ];

      var img_ind = 3;
      if (data['sc'] == 1) {
        img_ind = 2;
      } else if (data['sc'] == 2) {
        img_ind = 1;
      } else if (data['sc'] == 0) {
        img_ind = 0;
      }

      /////////////////////////////////////////////////////////////////////
      // Check if polygon contains the pos
      //
      var latlng = new google.maps.LatLng({lat: parseFloat(data['lat']), lng: parseFloat(data['lng'])});
      if (mnj_map.hasPolygons() && !mnj_map.isInPolygon(latlng)) return;
      //

      // add marker
      marker = new google.maps.Marker({
        position: {lat: parseFloat(data['lat']), lng: parseFloat(data['lng'])},
        map: mnj_map.map,
        icon: images[img_ind]
      });
      mnj_map_markers[parcel] = marker;

      marker.mode = mode;
      marker.parcel = parcel;
      

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
        content: $info.html(),
        disableAutoPan: true   
      });
      marker.infowindow = infowindow;

      marker.addListener('mouseover', function() {
        this.setAnimation(null);
        this.infowindow.open(mnj_map.map, this);
      });
      marker.addListener('mouseout', function() {
        this.infowindow.close();
      });
      marker.addListener('click', function() {
        // Load estate content
        // mnj_map.map.panTo(marker.position);
        // marker.setAnimation(google.maps.Animation.BOUNCE);
        this.setAnimation(null);
        mnj_map.load_detail(this.parcel);
      });

    } else if (mode == 1) {
      var parcel = data['parcel'];

      // add marker
      var images = [
        pluginurl + 'public/imgs/map/m1.png',
        pluginurl + 'public/imgs/map/m2.png',
        // pluginurl + 'public/imgs/map/m3.png', // because of red, it looks like Danger Zone
        pluginurl + 'public/imgs/map/m4.png',
        pluginurl + 'public/imgs/map/m5.png'
      ];

      var img_ind = 0;
      if (data['cnt'] > 100000) {
        img_ind = 3;
      } else if (data['cnt'] > 10000) {
        img_ind = 3;
      } else if (data['cnt'] > 1000) {
        img_ind = 2;
      } else if (data['cnt'] > 100) {
        img_ind = 1;
      }

      marker = new google.maps.Marker({
        position: {lat: parseFloat(data['lat']), lng: parseFloat(data['lng'])},
        map: mnj_map.map,
        label: data['cnt'],
        icon: images[img_ind]
      });

      marker.mode = mode;
      marker.cnt = data['cnt'];

      var $info = jQuery('<div>' + (data['zip']?('Zip: ' + data['zip'] + '<br>Parcels: ' + data['cnt']):'Unknown Zipcode') + '</div>');
      var infowindow = new google.maps.InfoWindow({
        maxWidth: 100,
        content: $info.html(),
        disableAutoPan: true   
      });
      marker.infowindow = infowindow;
      
      marker.addListener('mouseover', function() {
        this.infowindow.open(mnj_map.map, this);
      });
      marker.addListener('mouseout', function() {
        this.infowindow.close();
      });
      marker.addListener('click', function() {
        var center = new google.maps.LatLng(this.position.lat(), this.position.lng());
        // using global variable:
        mnj_map.map.panTo(center);
        // if (mnj_map.map.getZoom() < mnj_map.detailGroupZoom) mnj_map.map.setZoom(mnj_map.detailGroupZoom);
        mnj_map.map.setZoom(mnj_map.map.getZoom() + mnj_map.zoomInStep);
      });

    }

    if (marker) mnj_map.markers.push(marker);
    
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

        if (!data) {
          mnj_map.close_detail_view();
          notify.error('Oops. Something went wrong. Please try again later.');
          return;
        }

        if (data['error'] != 0) {
          mnj_map.close_detail_view();
          if (data['msg']) notify.error(data['msg']);
        } else {
          mnj_map.handle_detail_result(data);
        }

    }).fail(function() {
        // alert('There was a problem calling you - please try again later.');
        jQuery('body').completed();
        notify.error('Oops. Something went wrong. Please try again later.');
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

  render_list: function(data, shouldRefresh) {
    if (!jQuery('#neibour_estates').is(':visible')) return;

    var totalCount = data.count;
    if(mnj_map.hasPolygons()) totalCount = mnj_map.markers.length;
    jQuery('#neibour_estates .lbl-cnt').html(totalCount.formatMoney(0) + ' property(s)');

    if (shouldRefresh) {
      jQuery('#neibour_estates_wrapper').html('');
      mnj_parcels = {};
    }

    var renderedCount = 0;
    for (var i=0; i<data.list.length; i++) {
      var parcel = data.list[i]['parcel'];
      if(mnj_map.hasPolygons() && !mnj_map.isPropertyInMap(parcel)) continue;
      mnj_parcels[parcel] = data.list[i];

      mnj_map.render_list_item(data.list[i]);
      renderedCount ++;
    }

    // var navLen = 5;
    // mnj_map.render_nav_bar(5, data.count, data.page, data.limit);
    mnj_map.render_load_more(data.count, data.page, data.limit);
    mnj_map.loadedMoreCount += renderedCount;
    if ((jQuery('#mnj_next_page').val() != '-1') && (mnj_map.loadedMoreCount < 20)) {
      mnj_map.load_more();
    } else {
      mnj_map.loadedMoreCount = 0;
      jQuery('#neibour_estates_wrapper').scroll();
    }

  },

  render_load_more: function(total, current, limit) {
    var isReachedEnd = false;
    if (mnj_map.hasPolygons()) {
      var mapTotal = mnj_map.markers.length;
      if (mapTotal == jQuery('#neibour_estates_wrapper .property_block').length) isReachedEnd = true;
    }
    var lastPage = Math.ceil(total/limit);
    if (isReachedEnd || (parseInt(current) >= lastPage)) {
      jQuery('#mnj_next_page').val('-1');
    } else {
      jQuery('#mnj_next_page').val(parseInt(current) + 1);
    }
  },

  render_nav_bar: function(navLen, total, current, limit) {
    var lastPage = Math.ceil(total/limit);
    var $wrapper = jQuery('#neibour_estates #neibour_estates_nav');
    $wrapper.html('<ul></ul>');
    $wrapper = $wrapper.find('ul');
    jQuery('<li class="nav-item nav-item-first"><a title="1" href="#" data-page="1" class="' + (current==1?'disabled':'') + '"><<</a></li>').appendTo($wrapper);
    jQuery('<li class="nav-item nav-item-prev"><a title="' + Math.max(1, (current-1)) + '" href="#" data-page="' + Math.max(1, (current-1)) + '" class="' + (current==1?'disabled':'') + '"><</a></li>').appendTo($wrapper);

    var halfv = Math.floor(navLen / 2);
    for (var page = Math.min(Math.max(1, lastPage-navLen+1), Math.max(1, current-halfv)); page<=Math.min(lastPage, Math.max(1, current-halfv) + navLen); page++) {
      jQuery('<li class="nav-item ' + (current==page?'active':'') + '"><a title="' + page + '" href="#" data-page="' + page + '"  class="' + (current==page?'disabled':'') + '">' + page + '</a></li>').appendTo($wrapper);
    }

    jQuery('<li class="nav-item nav-item-next"><a title="' + Math.min(lastPage, (current+1)) + '" href="#" data-page="' + Math.min(lastPage, (current+1)) + '"  class="' + (current==lastPage?'disabled':'') + '">></a></li>').appendTo($wrapper);
    jQuery('<li class="nav-item nav-item-last"><a title="' + lastPage + '" ' + (current==lastPage?'disabled':'') + '" href="#" data-page="' + lastPage + '"  class="' + (current==lastPage?'disabled':'') + '">>></a></li>').appendTo($wrapper);
    

  },

  render_list_item: function(data) {

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
  },

  init: function() {
    mnj_map.init_map();
    mnj_map.bind_events();
    mnj_map.init_rule_set();

    setTimeout(function(){
      if (Object.keys(mnj_search_params).length > 0) {

        mnj_map.mapChangedUnderWatch = false;

        mnj_map.render_rule_set(mnj_search_params);

        if (mnj_search_params['polygons']) {
          try {
            var polygonObj = JSON.parse(mnj_search_params['polygons']);  
            if (polygonObj) {
              mnj_map.drawPolygons(polygonObj);
            }
          } catch(e) {console.log(e);}
        }

        if (mnj_search_params['order_type']) {
          jQuery('#neibour_estates #panel_sort_type').val(mnj_search_params['order_type']);
        }

        if (mnj_search_params['rect']) {
          try {
            var rect = mnj_search_params['rect'];
            var bounds = new google.maps.LatLngBounds({lat: parseFloat(rect[0]['lat']), lng: parseFloat(rect[0]['lng'])}, {lat: parseFloat(rect[1]['lat']), lng: parseFloat(rect[1]['lng'])});
            mnj_map.map.fitBounds(bounds);
          } catch(e) {console.log(e);}
        }

        // let 's search instantly
        jQuery('#mng_map_search').submit();
      }
    }, 1000);
    

  }
};

(function(){


	jQuery(document).ready(function(){
		jQuery(".fancybox").fancybox();
    mnj_pack.init();
	});


  

})();