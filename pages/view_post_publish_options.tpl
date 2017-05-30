			<?php 

				$mph_center = array();
				$mph_center['websites'] = json_decode(get_option('mph_center_websites'), true);
				$mph_center['fbs'] = json_decode(get_option('mph_center_fbs'), true);
				$mph_center['twitts'] = json_decode(get_option('mph_center_twitts'), true);
				if (!$mph_center['websites'])	$mph_center['websites'] = array();
				if (!$mph_center['fbs'])	$mph_center['fbs'] = array();
				if (!$mph_center['twitts'])	$mph_center['twitts'] = array();

			?>

			<div class="row row-publish-option">
				<div class="col-sm-12 websites">
					<h5>Websites</h5>
					<?php for ($i=0; $i<count($mph_center['websites']); $i++) { 
						$idv = 'web_' . $i; 
						$web = $mph_center['websites'][$i];
					?>
						<div>
							<label class="with-checkbox" id="publish_web_<?php echo $idv; ?>">
								<input type="checkbox" name="publish_web[<?php echo $idv; ?>]" data-id="<?php echo $idv; ?>" value="<?php echo $web['url']; ?>" class="pull-left publish-to-web">
								<p class="main-text"><?php echo $web['name']; ?></p>
								<p class="sub-text"><?php echo $web['url']; ?></p>
								<ul class="in-cats"></ul>
							</label>
						</div>
					<?php } ?>
				</div>
				<div class="col-sm-12">
					<h5>Facebook</h5>
					<?php foreach ($mph_center['fbs'] as $web) { ?>
						<div>
							<label class="with-checkbox">
								<input type="checkbox" name="publish_fb[]" value="<?php echo $web['name'] . '|' . $web['token']; ?>" class="pull-left">
								<p class="main-text"><?php echo $web['name']; ?></p>
							</label>
						</div>
					<?php } ?>
				</div>
				<div class="col-sm-12">
					<h5>Twitter</h5>
					<?php foreach ($mph_center['twitts'] as $web) { ?>
						<div>
							<label class="with-checkbox">
								<input type="checkbox" name="publish_twitts[]" value="<?php echo $web['name'] . '|' . $web['token'] . '|' . $web['secret']; ?>" class="pull-left">
								<p class="main-text"><?php echo $web['name']; ?></p>
							</label>
						</div>
					<?php } ?>
				</div>
			</div>