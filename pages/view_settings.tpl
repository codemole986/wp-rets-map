
				<?php settings_fields('mph-center-group'); ?>
				<?php do_settings_sections('mph-center-group'); ?>

				<div class="container-fluid mph-center-settings">
					<form method="post">
					  	<input type="hidden" name="action_type" value="update">

						<div class="row row-sm">					    	
					    	<div class="col-sm-12">
								<h2>
									<span>Market Post Helper Center Settings</span>
									<input type="submit" class="btn btn-success" value="Save Settings">
								</h2>
								<hr>
							</div>
						</div>

						<?php 
							$websites = json_decode(get_option('mph_center_websites'), true);
							$fbs = json_decode(get_option('mph_center_fbs'), true);
							$twitts = json_decode(get_option('mph_center_twitts'), true);
							if (!$websites)	$websites = array();
							if (!$fbs)	$fbs = array();
							if (!$twitts)	$twitts = array();
						?>

						<ul class="nav nav-tabs">
							<li class="active"><a href="#div_publish" data-toggle="tab">Remote Publish Options</a></li>
							<li><a  href="#div_social" data-toggle="tab">Social Config</a></li>
						</ul>

						<div class="tab-content ">
			  				<div class="tab-pane" id="div_social">

			  					<div class="row row-sm">
									<div class="col-sm-12">
							    		<h3><span>Facebook App Info</span></h3>
							    	</div>

							    	<div class="col-sm-5">
							    		<label>Facebook APP ID</label>
							    		<input type="text" class="form-control" name="mph_center_fb_app_id" id="mph_center_fb_app_id" value="<?php echo esc_attr( get_option('mph_center_fb_app_id') ); ?>">
							    	</div>
							    	<div class="col-sm-5">
							    		<label>Facebook APP Secret</label>
							    		<input type="text" class="form-control" name="mph_center_fb_app_secret" id="mph_center_fb_app_secret" value="<?php echo esc_attr( get_option('mph_center_fb_app_secret') ); ?>">
							    	</div>
							    </div>
							    <div class="row row-sm">
							    	<div class="col-sm-10">
							    		<label>To make a Facebook login button to grab access token, plase use following short code:</label>
							    		<input type="text" class="form-control" readonly="" value="[mph-center-facebook]">
							    	</div>
							    </div>


							    <div class="row row-sm">
					              	<div class="col-sm-12">
					                  <h3><span>Twitter App Info</span></h3>
					                </div>

					                <div class="col-sm-5">
					                  <label>Consumer Key</label>
					                  <input type="text" class="form-control" name="mph_center_twitter_consumer_key" id="mph_center_twitter_consumer_key" value="<?php echo esc_attr( get_option('mph_center_twitter_consumer_key') ); ?>">
					                </div>
					                <div class="col-sm-5">
					                  <label>Consumer Secret</label>
					                  <input type="text" class="form-control" name="mph_center_twitter_consumer_secret" id="mph_center_twitter_consumer_secret" value="<?php echo esc_attr( get_option('mph_center_twitter_consumer_secret') ); ?>">
					                </div>
					                <div class="col-sm-5">
					                  <label>Access Token</label>
					                  <input type="text" class="form-control" name="mph_center_twitter_app_access_token" id="mph_center_twitter_app_access_token" value="<?php echo esc_attr( get_option('mph_center_twitter_app_access_token') ); ?>">
					                </div>
					                <div class="col-sm-5">
					                  <label>Access Token Secret</label>
					                  <input type="text" class="form-control" name="mph_center_twitter_app_access_token_secret" id="mph_center_twitter_app_access_token_secret" value="<?php echo esc_attr( get_option('mph_center_twitter_app_access_token_secret') ); ?>">
					                </div>
					              </div>
					              <div class="row row-sm">
					                <div class="col-sm-10">
					                  <label>To make a Twitter Connect button to get granted access, plase use following short code:</label>
					                  <input type="text" class="form-control" readonly="" value="[mph-center-twitter]">
					                </div>
					              </div>

			  				</div>
			  				<div class="tab-pane active" id="div_publish">
			  					<div class="row row-sm div-websites">					    	
							    	<div class="col-sm-12">
							    		<h3>
							    			<button class="btn-add-website btn btn-info btn-sm"><i class="glyphicon glyphicon-plus"></i> Add</button>
							    			<span>Websites</span>
							    		</h3>
							    	</div>
							    	<div class="col-sm-12 list">
							    	<?php foreach ($websites as $web) { ?>
							    		<div class="row row-sm">
							    			<div class="col col-sm-4">
							    				<input type="text" class="form-control" name="web_name[]" value="<?php echo $web['name']; ?>" placeholder="Website Title">
							    			</div>
							    			<div class="col col-sm-6">
							    				<input type="text" class="form-control" name="web_url[]" value="<?php echo $web['url']; ?>" placeholder="http://www.example.com">
							    			</div>
							    			<div class="col col-sm-2">
							    				<button class="btn btn-danger btn-del"><i class="glyphicon glyphicon-trash"></i></button>
							    			</div>
							    		</div>
							    	<?php } ?>
							    	</div>
								</div>

								

								<div class="row row-sm div-fbs">					    	
							    	<div class="col-sm-12">
							    		<h3>
							    			<button class="btn-add-fb btn btn-info btn-sm"><i class="glyphicon glyphicon-plus"></i> Add</button>
							    			<span>Facebook Tokens</span>
							    		</h3>
							    	</div>
							    	<div class="col-sm-12 list">
							    	<?php foreach ($fbs as $fb) { ?>
							    		<div class="row row-sm">
							    			<div class="col col-sm-4">
							    				<input type="text" class="form-control" name="fb_name[]" value="<?php echo $fb['name']; ?>" placeholder="Facebook User">
							    			</div>
							    			<div class="col col-sm-6">
							    				<input type="text" class="form-control" name="fb_token[]" value="<?php echo $fb['token']; ?>" placeholder="Facebook Access Token">
							    			</div>
							    			<div class="col col-sm-2">
							    				<button class="btn btn-danger btn-del"><i class="glyphicon glyphicon-trash"></i></button>
							    			</div>
							    		</div>
							    	<?php } ?>
							    	</div>
								</div>

					            <div class="row row-sm div-twitts">                
					                <div class="col-sm-12">
					                  <h3>
					                    <button class="btn-add-twitt btn btn-info btn-sm"><i class="glyphicon glyphicon-plus"></i> Add</button>
					                    <span>Twitter Tokens</span>
					                  </h3>
					                </div>
					                <div class="col-sm-12 list">
					                <?php foreach ($twitts as $twitt) { ?>
					                  <div class="row row-sm">
					                    <div class="col col-sm-3">
					                      <input type="text" class="form-control" name="twitt_name[]" value="<?php echo $twitt['name']; ?>" placeholder="Twitter User">
					                    </div>
					                    <div class="col col-sm-3">
					                      <input type="text" class="form-control" name="twitt_token[]" value="<?php echo $twitt['token']; ?>" placeholder="Twitter Access Token">
					                    </div>
					                    <div class="col col-sm-3">
					                      <input type="text" class="form-control" name="twitt_secret[]" value="<?php echo $twitt['secret']; ?>" placeholder="Twitter Access Token Secret">
					                    </div>
					                    <div class="col col-sm-2">
					                      <button class="btn btn-danger btn-del"><i class="glyphicon glyphicon-trash"></i></button>
					                    </div>
					                  </div>
					                <?php } ?>
					                </div>
					            </div>
			  				</div>
			  			</div>

					</form>
				</div>