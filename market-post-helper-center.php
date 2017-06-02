<?php

/**
 * Plugin Name: Market Post Helper Center
 * Plugin URI: 
 * Description: This plugin helps to publish post to multiple site & social medias. The target website should have Market Post Helper plugin already installed.
 * Version: 1.1.4
 * Author: Wilson Breiner
 * Author URI: 
 * License: GPL2
 */

require_once(dirname(__FILE__) . '/include/mph-center.php');

add_action( 'plugins_loaded', array( 'MPH_Center', 'get_instance' ) );

