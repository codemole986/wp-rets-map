<?php

//CMS twitter application information

if (!defined('TWITTER_CONSUMER_KEY'))   define('TWITTER_CONSUMER_KEY', get_option('mph_center_twitter_consumer_key'));
if (!defined('TWITTER_CONSUMER_SECRET'))   define('TWITTER_CONSUMER_SECRET', get_option('mph_center_twitter_consumer_secret'));
if (!defined('TWITTER_APP_ACCESS_TOKEN'))   define('TWITTER_APP_ACCESS_TOKEN', get_option('mph_center_twitter_app_access_token'));
if (!defined('TWITTER_APP_ACCESS_TOKEN_SECRET'))   define('TWITTER_APP_ACCESS_TOKEN_SECRET', get_option('mph_center_twitter_app_access_token_secret'));

include_once(dirname(__FILE__) . "/TwitterAPIExchange.php");
include_once(dirname(__FILE__) . "/twitteroauth.php");