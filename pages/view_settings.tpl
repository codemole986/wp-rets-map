
					
				<div class="container-fluid">
					<form method="post">
					  	<input type="hidden" name="action_type" value="update">

						<div class="row row-sm">					    	
					    	<div class="col-sm-12">
								<h4>Markninja Estate Settings</h4>
								<hr>
							</div>
						</div>

						<div class="row row-sm">					    	
					    	<div class="col-sm-12">
					    		<label>Search Input Box Short code</label>
								<pre>[mnj_estate_searchbox]
[mnj_estate_searchbox url="{PAGE URL}"]</pre>
							</div>
						</div>

						<div class="row row-sm">					    	
					    	<div class="col-sm-12">
					    		<label>Search Map Page Short code</label>
								<pre>[mnj_estate_searchpage]</pre>
							</div>
						</div>

					    <?php settings_fields('mnj-estate-group'); ?>
					    <?php do_settings_sections('mnj-estate-group'); ?>
					    
					    <div class="row row-sm">					    	
					    	<div class="col-sm-4">Google API Key</div>
					    	<div class="col-sm-8">
					    		<input type="text" class="form-control" name="mnj_google_api_key" id="mnj_google_api_key" value="<?php echo esc_attr( get_option('mnj_google_api_key') ); ?>">
					    	</div>
					    </div>
					    

					    <div class="row row-sm">					    	
					    	<div class="col-sm-4">API Key</div>
					    	<div class="col-sm-8">
					    		<input type="text" class="form-control" name="mnj_estate_api_key" id="mnj_estate_api_key" value="<?php echo esc_attr( get_option('mnj_estate_api_key') ); ?>">
					    	</div>
					    </div>

					    <div class="row row-sm">					    	
					    	<div class="col-sm-4">API Secret</div>
					    	<div class="col-sm-8">
					    		<input type="text" class="form-control" name="mnj_estate_api_secret" id="mnj_estate_api_secret" value="<?php echo esc_attr( get_option('mnj_estate_api_secret') ); ?>">
					    	</div>
					    </div>

					    <div class="row row-sm">					    	
					    	<div class="col-sm-12">
					    		<input type="submit" value="Submit" class="btn btn-primary"> 
					    	</div>
					    </div>

					</form>
				</div>