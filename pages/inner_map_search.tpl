			
			<style>
			  #mnj_google_map {
			    height: 400px;
			    width: 100%;
			  }
			</style>

			<div class="row search-row">
				<div class="col-sm-12" style="position: relative; height: 50px;">
					<div style="position: relative; z-index: 10;">

						<form action="post" id="mng_map_search">
						<div class="panel panel-default mnj-search-panel"> 
							<div class="panel-heading clearfix">
								<a class="btn btn-success btn-sm pull-left btn-modify-criteria"  data-toggle="collapse" data-target="#mnj_search_panel_body" aria-expanded="false"><span class="glyphicon glyphicon-plus"></span>  Modify Search Criteria</a>
								<h3 class="panel-title">No search criteria given...</h3>
								<button type="submit" class="btn btn-warning btn-sm pull-right"><span class="glyphicon glyphicon-zoom-in"></span>  Search</button>
							</div> 
							<div class="collapse" id="mnj_search_panel_body">
								<div class="panel-body">
									<div class="row">
										<div class="col-sm-4">
											<ul id="mnj_search_rule_set" class="mnj_search_rule_list"></ul>
										</div>
										<div class="col-sm-8">
											<ul id="mnj_search_rules" class="mnj_search_rule_list"></ul>
										</div>
									</div>
									<div class="modal-footer" style="padding-bottom: 0;">
										<button type="button" class="btn btn-default" data-dismiss="modal" data-toggle="collapse" data-target="#mnj_search_panel_body">Close</button> <button type="submit" class="btn btn-warning hidden"><span class="glyphicon glyphicon-zoom-in"></span>  Search</button>
									</div>
								</div> 
							</div>
						</div>
						</form>

					</div>
				</div>
			</div>

			<div class="row map-row">
				<div class="col-md-12">
					<div class="mnj_map_wrapper">
						<div id="mnj_google_map" class="mnj_map_inner"></div>
					</div>
				</div>
				<div class="col-md-12">
					<div id="neibour_estates" class="neibour_estates">
						<h4>Real Estate <span class="lbl-cnt"></span></h4>
						<input type="hidden" id="mnj_next_page" value="-1">

						<div class="searchbar">
							<div class="input-group input-group-sm">
								<label class="input-group-addon">Order By</label>
								<select class="sort-type form-control" id="panel_sort_type">
									<option value="0">Newst</option>
									<option value="2">Price (High -> Low)</option>
									<option value="1">Price (Low -> High)</option>
									<option value="3">Bedrooms</option>
									<option value="4">Bathrooms</option>
									<option value="5">Square Feet</option>
									<option value="6">Built On</option>
								</select>
							</div>
						</div>
						<div id="neibour_estates_nav" class="hidden"></div>
						<div id="neibour_estates_wrapper"></div>
						<div id="neibour_estates_loadmore_state" class="neibour_estates_loadmore_state"></div>
					</div>
				</div>
			</div>




			<div id="mnj_templates" style="display: none;">
				<div id="map_info">
					<div class="property_map_info">
						<div class="pull-left photo"></div>
						<div class="info">
							<p class="hidden">Parcel: <span class="parcel"></span></p>
							<p class="address"></p>
							<p>
								<span class="tag">Bed room: <span class="bedroom"></span></span>
								<span class="tag">Pools: <span class="pool"></span></span>
							</p>
						</div>
					</div>
				</div>

				<div id="grabed_block">
					<div class="property_block">
						<div class="inner">
							<div class="button_set">
								<a href="#" class="btn btn-default btn-see-details"><span class="glyphicon glyphicon-info-sign"></span></a>
								<a href="#" class="btn btn-default btn-goto"><span class="glyphicon glyphicon-screenshot"></span></a>
								<a href="#" class="btn btn-favorite"><i class="fa fa-heart-o" aria-hidden="true"></i><i class="fa fa-heart" aria-hidden="true"></i></a>
							</div>
							<div class="photo"></div>
							<div class="infoback"></div>
							<div class="info">
								<p style="display: none">Parcel: <span class="parcel"></span></p>
								<p><span class="photo_count"></span> Photo(s)</p>
								<p class="address" style="display: none"></p>

								<div class="more-details">
									<p>
										<span class="price-details"></span>
										<span class="short-details"></span>
									</p>
									<p>
										<span class="time-details"></span>
										<span class="middle-dot">&nbsp;</span>
										<span class="addr-details"></span>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>

			<div id="mnj_detail_view_backdrop" class="mnj_detail_view_backdrop" style="display: none;"></div>
			<div class="mnj_detail_header" id="mnj_detail_header" style="display: none;">
				<div class="header-wrapper clearfix">
					<a class="btn btn-warning btn-xs pull-right" onclick="mnj_map.close_detail_view();"><span class="glyphicon glyphicon-remove-circle"></span></a>
				</div>
			</div>
			<div id="mnj_detail_view" class="mnj_detail_view" style="display: none;">
				<div class="mnj_detail_content">
					<div class="photos-wrapper">
						<h4>Photo Gallery <label><span class="photo-count">12</span> photo(s)</label></h4>
						<div class="photos clearfix"></div>
					</div>
					<div class="main-infos">
						<div class="row">
							<div class="col-sm-6">
								<h5 class="full-addr"></h5>
								<h6 class="bedroom-details"></h6>
								<p class="remarks"></p>
							</div>
							<div class="col-sm-3">
								<span class="prp-sale-state"></span>
								<h5 class="prp-price-wrapper">
									<span class="currency-sign">$</span>
									<span class="prp-price"></span>
									<span class="prp-price-per"></span>
								</h5>
							</div>
							<div class="col-sm-3"></div>
						</div>
					</div>
					<div class="more-infos">
						<h6>Facts and Features</h6>
						<div class="row summary">
							<?php
							$types = ['type', 'laundry', 'heating', 'cooling', 'pets', 'parking'];
							foreach ($types as $type) {
								?>
							<div class="col-sm-4">
								<div class="features prp-<?php echo $type; ?>">
									<label><?php echo ucfirst($type); ?></label>
									<p class="feature-<?php echo $type; ?>-details"></p>
								</div>
							</div>
								<?php
							}
							?>
						</div>
						
						<div class="row detail">
							<div class="col-sm-12"><h7>INTERIOR FEATURES</h7></div>
							<div class="col-sm-6">
								<label>Bedrooms</label>
								<p>
									<label>Beds:</label>
									<span class="info-beds"></span>
								</p>
							</div>

							<div class="col-sm-6">
								<label>Flooring</label>
								<p>
									<label>Floor size:</label>
									<span class="info-sqft"></span>
								</p>
							</div>

							<div class="col-sm-6">
								<label>Heating and Cooling</label>
								<p>
									<label>Heating:</label>
									<span class="info-heating"></span>
								</p>
								<p>
									<label>Cooling:</label>
									<span class="info-cooling"></span>
								</p>
							</div>

							<div class="col-sm-6">
								<label>Other Interior Features</label>
								<p class="info-other-interior"></p>
							</div>

							<div class="col-sm-6">
								<label>Appliances</label>
								<p>
									<label>Appliances included:</label>
									<span class="info-appliances"></span>
								</p>
							</div>

						</div>

						<div class="row detail">
							<div class="col-sm-12"><h7>CONSTRUCTION</h7></div>
							<div class="col-sm-6">
								<label>Type and Style</label>
								<p>
									<span class="info-prp-rentaltype"></span>
									<br>
									<span class="info-prp-type"></span>
								</p>
							</div>

							<div class="col-sm-6">
								<label>Materials</label>
								<p>
									<label>Roof type:</label>
									<span class="info-prp-roof"></span>
								</p>
							</div>

							<div class="col-sm-6">
								<label>Dates</label>
								<p>
									<label>Built in:</label>
									<span class="info-prp-builtin"></span>
								</p>
							</div>


						</div>

						<div class="row detail">
							<div class="col-sm-12"><h7>Sources</h7></div>
							<div class="col-sm-6">
								<p>
									<label>Parcel #:</label>
									<span class="info-parcel"></span>
								</p>
							</div>

							<div class="col-sm-6">
								<p>
									<label>MLS #:</label>
									<span class="info-mls"></span>
								</p>
							</div>

						</div>

					</div>
				</div>
			</div>

			<?php $listValues = array(); ?>
			<div id="mnj_custom_fields_model" style="display: none;">
				<div class="col col-xs-6">
					<div class="input-group input-group-sm">
						<span class="input-group-addon">Custom</span>
						<select class="form-control mnj-search-custom-field">
							<option value="">Please Select a Field</option>
							<?php foreach (MarkninjaEstate::$searchFields as $key => $list) { ?>
								<optgroup label="<?php echo $key; ?>">
								<?php foreach ($list AS $k => $v) { ?>
									<option value="<?php echo $key . '.' . $k; ?>"><?php echo $k; ?></option>
									<?php if (count($v) > 0)	$listValues[$key . '.' . $k] = $v; ?>
								<?php } ?>
								</optgroup>
							<?php } ?>
						</select>
					</div>
				</div>
				<div class="col col-xs-2">
					<select class="form-control mnj-search-custom-op">
						<option value="=">Equal</option>
						<option value="<>">NOT Equal</option>
						<option value="null">NULL</option>
						<option value="not-null">NOT NULL</option>
						<option value="between">BETWEEN</option>
						<option value="<"><</option>
						<option value=">">></option>
					</select>
				</div>
				<div class="col col-xs-4">
					<input type="text" class="form-control mnj-search-custom-value1" />
					<input type="text" class="form-control mnj-search-custom-value2" style="display: none;" />
					<select class="form-control mnj-search-custom-value1-list" style="display: none;"></select>
				</div>
			</div>

			<script>
			  var mnjListValues = <?php echo json_encode($listValues); ?>;
			  var home_url = "<?php echo home_url(); ?>";
			  var mnj_search_rules = <?php echo Markninja_Helper::json_encode(MarkninjaEstate::$searchTypes); ?>;
			  <?php
			  	$search_params = $_REQUEST;
			  	$search_params = Markninja_Helper::make_data_safe($search_params);

			  	// $search_params = [];
			  	// foreach (MarkninjaEstate::$searchKeys as $key) {
			  	// 	if(isset($_REQUEST[$key]) && $_REQUEST[$key]) {
			  	// 		$search_params[$key] = $_REQUEST[$key];
			  	// 	}
			  	// }
			  	// foreach (MarkninjaEstate::$otherKeys as $key) {
			  	// 	if(isset($_REQUEST[$key]) && $_REQUEST[$key]) {
			  	// 		$search_params[$key] = $_REQUEST[$key];
			  	// 	}
			  	// }
			  ?>
			  var mnj_search_params = <?php echo Markninja_Helper::json_encode($search_params); ?>;

			  var init_interval = null;
			  function initMap() {
			    console.log('google is loaded');
			    init_interval = setInterval(function(){
			    	if (mnj_map) {
			    		console.log('Now init...');
			    		jQuery('body').completed();
			    		clearInterval(init_interval);
			    		mnj_map.init();
			    		init_interval = null;
			    	}
			    }, 500);
			  }

			  jQuery(document).ready(function(){
			  	console.log('document loaded');
			  	jQuery('body').overlay();
			  });

			</script>

			<script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js"></script>
			<script async defer src="https://maps.googleapis.com/maps/api/js?key=<?php echo get_option('mnj_google_api_key');?>&libraries=places,drawing&callback=initMap"></script>