<?php

/**
 * Plugin Name: Markninja Estate
 * Plugin URI: 
 * Description: This plugin supports Estate search on map using Markninja API.
 * Version: 1.1
 * Author: Wilson Breiner
 * Author URI: 
 * License: GPL2
 */

require_once(dirname(__FILE__) . '/include/markninja-estate.php');

add_action( 'plugins_loaded', array( 'MarkninjaEstate', 'get_instance' ) );

