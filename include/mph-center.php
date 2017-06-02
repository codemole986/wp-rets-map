<?php

/**
 * Markninja Estate plugin Core class file
 * Author: Wilson Breiner
 */

require_once(dirname(__FILE__) . '/mph-helper.php');
require_once(dirname(__FILE__) . '/mph-api.php');

class MPH_Center {

    /**
     * A reference to an instance of this class.
     */
    private static $instance;

    protected $default;

    /**
     * Returns an instance of this class. 
     */
    public static function get_instance() {

        if ( null == self::$instance ) {
            self::$instance = new MPH_Center();
        } 
        return self::$instance;

    } 

    /**
     * Initializes the plugin by setting filters and administration functions.
     */
    private function __construct() {
        $this->init();
        $this->apply_options();
        $this->apply_jss_css();
        $this->apply_admin_post();
        $this->apply_shortcode();
        $this->apply_menu();
        $this->handle_ajax();
        $this->handle_others();
    } 

    public function init() {
        $data = MPH_Helper::make_data_safe($_REQUEST);
        if(isset($data['mph-action'])) {
            if ($data['mph-action'] == 'twitterOathInit') {
                include(dirname(dirname(__FILE__)) . "/vendors/twitter/twitter_conf.php");
                $connection = new TwitterOAuth(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET);
                $request_token = $connection->getRequestToken(get_home_url() . '?mph-action=twitterOath');
                //received token info from twitter

                set_transient( 'mph_center_twitter_oauth_token', $request_token['oauth_token'], 60*60*24);
                set_transient( 'mph_center_twitter_oauth_token_secret', $request_token['oauth_token_secret'], 60*60*24);
                
                // any value other than 200 is failure, so continue only if http code is 200
                if($connection->http_code=='200')
                {
                    //redirect user to twitter
                    $twitter_url = $connection->getAuthorizeURL($request_token['oauth_token']);
                    header("location:" . $twitter_url);
                } else {
                    ?>
                    <script type="text/javascript">
                        window.close();
                    </script>
                    <?php
                }
                exit;
            } else if ($data['mph-action'] == 'twitterOath') {
                
                include(dirname(dirname(__FILE__)) . "/vendors/twitter/twitter_conf.php");

                $connection = new TwitterOAuth(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, get_transient( 'mph_center_twitter_oauth_token' ), get_transient( 'mph_center_twitter_oauth_token_secret' ));
                $access_token = $connection->getAccessToken($data['oauth_verifier']);

                $settings = array(
                    'oauth_access_token' => $access_token["oauth_token"],
                    'oauth_access_token_secret' => $access_token["oauth_token_secret"],
                    'consumer_key' => TWITTER_CONSUMER_KEY,
                    'consumer_secret' => TWITTER_CONSUMER_SECRET
                );

                $url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
                $requestMethod = 'GET';

                $t_c = new TwitterAPIExchange($settings);
                $userInfo = $t_c->buildOauth($url, $requestMethod)->performRequest();
                $userInfo = json_decode($userInfo, true);

                $mph_center_twitts = json_decode(get_option('mph_center_twitts'), true);
                if (!$mph_center_twitts)    $mph_center_twitts = array();

                $mph_center_twitts[] = array(
                    'name' => $userInfo['name'],
                    'token' => $access_token["oauth_token"],
                    'secret' => $access_token["oauth_token_secret"],
                );
                update_option('mph_center_twitts', MPH_Helper::json_encode($mph_center_twitts));
                ?>
                <script type="text/javascript">
                    window.close();
                </script>
                <?php
                exit;
            }    
        }


        add_action('mph_remote_publish_options', array($this, 'render_publish_option_outside'), 1);
        add_action('mph_remote_publish_proceed', array($this, 'render_publish_proceed_outside'), 1, 3);
        
        add_action( 'wp_head', array($this, 'render_head_admin') );
        
    }

    public function render_head_admin() {

        $mph_center_messages = get_transient('mph_center_msg_on_publish');

        if ($mph_center_messages) {
            delete_transient('mph_center_msg_on_publish');
        } else {
            $mph_center_messages = array();
        }

        if (count($mph_center_messages) > 0) { ?>
            <script type="text/javascript">
                var mph_msgs = <?php echo MPH_Helper::json_encode($mph_center_messages); ?>;
                jQuery(document).ready(function(){
                    for (var i=0; i<mph_msgs.length; i++) {
                        if (mph_msgs[i][0] == '1') {
                            notify.success(mph_msgs[i][1]);
                        } else {
                            notify.error(mph_msgs[i][1]);
                        }
                    }
                });
            </script>
        <?php }
    }

    public function apply_admin_post() {
        add_action( 'add_meta_boxes', array($this, 'render_post_edit_page'));
        add_action( 'save_post', array($this, 'publish_to_others'), 10000);
    }

    public function publish_to_others_proceed($post, $postURL = '', $mph_center_messages = array()) {

        $passed = false;
        $data = MPH_Helper::make_data_safe($_REQUEST);

        $api = new MPH_API();
        $publishedTo = array();

        if (isset($data['publish_web'])) {

            foreach ($data['publish_web'] as $key => $value) {
                $sendPost = array(
                    'post_title' => addslashes($post['post_title']),
                    'post_content' => addslashes($post['post_content']),
                    'post_excerpt' => addslashes($post['post_excerpt']),
                    'post_status' => 'publish', //$post['post_status'],
                );
                if (isset($data['publish_web_cats'][$key])) {
                    $sendPost['post_category'] = $data['publish_web_cats'][$key];
                }
                
                $result = $api->sendPost($value, $sendPost);
                
                if ($result && ($result['error'] == '0')) {
                    $mph_center_messages[] = array(1, 'Successfully pushed to ' . $value);
                    $postURL = $result['url'];

                    $publishedTo[] = array(
                        'type' => 'web',
                        'url' => $value,
                        'cats' => isset($sendPost['post_category'])?$sendPost['post_category']:array(),
                        'on' => gmdate('Y-m-d H:i:s'),
                    );
                } else {
                    $mph_center_messages[] = array(0, 'Failed to push on ' . $value);
                }
            }
        }

        if (($postURL != '') && isset($data['publish_fb'])) {
            
            $fbAppId = get_option('mph_center_fb_app_id');
            $fbAppSecret = get_option('mph_center_fb_app_secret');

            define('FACEBOOK_SDK_V4_SRC_DIR', dirname(dirname(__FILE__)) . '/vendors/facebook-sdk-5.5/');
            require dirname(dirname(__FILE__)) . '/vendors/facebook-sdk-5.5/autoload.php';

            foreach ($data['publish_fb'] as $tokenData) {
                $tokenData = explode('|', $tokenData, 2);
                $name = $tokenData[0];
                $token = $tokenData[1];

                require_once (dirname(dirname(__FILE__)) . '/vendors/facebook-sdk-5.5/Facebook.php');
                $fb = new Facebook\Facebook([
                  'app_id' => $fbAppId,
                  'app_secret' => $fbAppSecret,
                  'default_graph_version' => 'v2.2',
                ]);

                $linkData = array(
                  'link' => $postURL,
                  'message' => $post['post_title'],
                );

                try {

                    // Returns a `Facebook\FacebookResponse` object
                    // $user_profile = $fb->get('/me', $token);
                    // print_r($user_profile);

                    $response = $fb->post('/me/feed', $linkData, $token);
                    $graphNode = $response->getGraphNode();
                    // print_r($graphNode);
                    // echo 'Posted with id: ' . $graphNode['id'];
                    $mph_center_messages[] = array(1, 'Successfully pushed to Facebook : ' . $name);

                } catch(Facebook\Exceptions\FacebookResponseException $e) {
                    $mph_center_messages[] = array(0, 'Failed to push on Facebook : ' . $name);
                } catch(Facebook\Exceptions\FacebookSDKException $e) {
                    $mph_center_messages[] = array(0, 'Failed to push on Facebook : ' . $name);
                }
            }

        }

        if (($postURL != '') && isset($data['publish_twitts'])) {
            
            include(dirname(dirname(__FILE__)) . "/vendors/twitter/twitter_conf.php");

            foreach ($data['publish_twitts'] as $tokenData) {

                $tokenData = explode('|', $tokenData, 3);
                $name = $tokenData[0];
                $token = $tokenData[1];
                $secret = $tokenData[2];

                $settings = array(
                    'oauth_access_token' => $token,
                    'oauth_access_token_secret' => $secret,
                    'consumer_key' => TWITTER_CONSUMER_KEY,
                    'consumer_secret' => TWITTER_CONSUMER_SECRET
                );

                $url = 'https://api.twitter.com/1.1/statuses/update.json';
                $requestMethod = 'POST';

                $postfields = array(
                    'status' => $post['post_title'] . ' ' . $postURL
                );

                $t_c = new TwitterAPIExchange($settings);
                $post_result = $t_c->buildOauth($url, $requestMethod)
                ->setPostfields($postfields)
                ->performRequest();

                if ($post_result) {
                    $mph_center_messages[] = array(1, 'Successfully pushed to Twitter : ' . $name);
                } else {
                    $mph_center_messages[] = array(0, 'Failed to push on Twitter : ' . $name);
                }
            }
        }

        $result = array(
            'msg' => $mph_center_messages,
            'info' => $publishedTo,
        );

        return $result;
    }

    public function render_publish_proceed_outside($tickers, $titles, $tpls) {

        $mph_center_messages = get_transient('mph_center_msg_on_publish');
        if (!$mph_center_messages)  $mph_center_messages = array();

        for ($i=0; $i<count($tickers); $i++) {
            $ticker = $tickers[$i];
            if ($ticker == '') continue;

            $titleInd = rand(0, count($titles) - 1);
            $tplInd = rand(0, count($tpls) - 1);

            $tpl = MPH_Helper::make_string_safe(file_get_contents($tpls[$tplInd][1]));
            $tpl = wpautop(str_replace(["\r\n","\n"], "\r\n\r\n", $tpl));

            $cont = MPH_Helper::replace_ticker($tpl, $ticker);
            $title = MPH_Helper::replace_ticker($titles[$titleInd], $ticker);

            $post = array(
                'post_title' => $title,
                'post_content' => $cont,
                'post_excerpt' => '',
            );

            $mph_result = $this->publish_to_others_proceed($post, '', $mph_center_messages);

            $mph_center_messages = $mph_result['msg'];
        }

        if (count($mph_center_messages) > 0) {
            set_transient( 'mph_center_msg_on_publish', $mph_center_messages, 60*60);
        }
    }

    public function publish_to_others($post_id) {
        
        $post = get_post($post_id);

        if (!$post) return;
        if ($post->post_status != 'publish') return;
        $being_passed = get_post_meta($post->ID, '_mph-center-passed', true);
        if (!$being_passed) {
            update_post_meta($post->ID, '_mph-center-passed', '1');
        } else {
            return;
        }
        $postURL = get_post_permalink($post_id);

        $sendPost = array(
            'post_title' => $post->post_title,
            'post_content' => $post->post_content,
            'post_excerpt' => $post->post_excerpt,
        );

        $mph_center_messages = get_transient('mph_center_msg_on_publish');
        if (!$mph_center_messages)  $mph_center_messages = array();

        $mph_result = $this->publish_to_others_proceed($sendPost, $postURL, $mph_center_messages);

        $mph_center_messages = $mph_result['msg'];
        if (count($mph_center_messages) > 0) {
            set_transient( 'mph_center_msg_on_publish', $mph_center_messages, 60*60);
        }

        
        /*
        $published_info = get_post_meta($post->ID, '_mph-center-published', true);
        $published_info = json_decode($published_info, true);
        if (!$published_info)   $published_info = array();
        $published_info = $published_info + $publishedTo;

        update_post_meta($post->ID, '_mph-center-published', MPH_Helper::json_encode($published_info));
        */
        if (isset($data['publish_web'])) {
            wp_delete_post( $post->ID, true );
        }
    }

    public function render_post_edit_page() {
        add_meta_box(
            'mph_center_publish_option',
            'Publish To',
            array($this, 'render_publish_option'),
            'post',
            'side',
            'high',
            array()
        );    
    }

    public function render_publish_option_outside() {
        include dirname(dirname(__FILE__)) . '/pages/view_post_publish_options.tpl';
    }

    public function render_publish_option() {
        $post = get_post();
        update_post_meta($post->ID, '_mph-center-passed', '');
                
        include dirname(dirname(__FILE__)) . '/pages/view_post_publish_options.tpl';
    }

    public function handle_others() {
        add_action( 'wp_head', array($this, 'render_head_client') );
    }

    public function render_head_client() {}

    public function handle_ajax() {
        $ajaxPrefixs = array("wp_ajax_");
        foreach ($ajaxPrefixs as $ajaxPrefix) {
            add_action( $ajaxPrefix . 'mph_get_meta', array($this, 'ajax_mph_center_get_meta') );
            add_action( $ajaxPrefix . 'mph_save_fb', array($this, 'ajax_mph_center_save_fb') );
        }

        $ajaxPrefixs = array("wp_ajax_nopriv_");
        foreach ($ajaxPrefixs as $ajaxPrefix) {
            add_action( $ajaxPrefix . 'mph_save_fb', array($this, 'ajax_mph_center_save_fb') );
        }
    }

    public function ajax_mph_center_save_fb() {
        $data = MPH_Helper::make_data_safe($_REQUEST);
        if ($data['t'] == '') return;

        $mph_center_fbs = json_decode(get_option('mph_center_fbs'), true);
        if (!$mph_center_fbs)    $mph_center_fbs = array();

        $mph_center_fbs[] = array(
            'name' => $data['n'],
            'token' => $data['t'],
        );
        update_option('mph_center_fbs', MPH_Helper::json_encode($mph_center_fbs));
    }

    public function ajax_mph_center_get_meta() {
        $url = $_REQUEST['q'];
        $api = new MPH_API();
        $result = $api->loadMeta($url, $_REQUEST['i']);

        header('Content-Type: application/json');
        echo MPH_Helper::json_encode($result);
        exit;
    }

    public function apply_options() {
        $this->default = array (
            'mph_center_websites'        => '',
            'mph_center_fbs'        => '',
            'mph_center_fb_app_id' => '',
            'mph_center_fb_app_secret' => '',
            'mph_center_twitts'        => '',
            'mph_center_twitter_consumer_key' => '',
            'mph_center_twitter_consumer_secret' => '',
            'mph_center_twitter_app_access_token' => '',
            'mph_center_twitter_app_access_token_secret' => '',
        );

        foreach ($this->default as $key => $value) {
            register_setting( 'mph-center-group', $key );

            $opt = get_option($key);
            if (!$opt) {
                update_option( $key, $value );
            }
        }
    }

    public function apply_menu() {
        add_action( 'admin_menu', array($this, 'add_admin_menu') );
    }

    public function add_admin_menu() {
        add_menu_page('MPH Center Settings', 'MPH Center Settings', 'administrator', 'mph-center-settings', array($this, 'admin_settings'), 'dashicons-admin-generic');
    }
    
    public function admin_settings() {
        // Update options
        if (isset($_REQUEST['action_type']) && ($_REQUEST['action_type'] == 'update')) {
            $data = MPH_Helper::make_data_safe($_REQUEST);

            $websites = array();
            for ($i=0; $i<count($data['web_name']); $i++) {
                $web = array();
                $web['name'] = trim($data['web_name'][$i]);
                $web['url'] = trim($data['web_url'][$i]);

                if ($web['url'] == '')  continue;
                $websites[] = $web;
            }
            update_option('mph_center_websites', MPH_Helper::json_encode($websites));

            $fbs = array();
            for ($i=0; $i<count($data['fb_name']); $i++) {
                $web = array();
                $web['name'] = trim($data['fb_name'][$i]);
                $web['token'] = trim($data['fb_token'][$i]);

                if ($web['token'] == '')  continue;
                $fbs[] = $web;
            }
            update_option('mph_center_fbs', MPH_Helper::json_encode($fbs));

            $twitts = array();
            for ($i=0; $i<count($data['twitt_name']); $i++) {
                $web = array();
                $web['name'] = trim($data['twitt_name'][$i]);
                $web['token'] = trim($data['twitt_token'][$i]);
                $web['secret'] = trim($data['twitt_secret'][$i]);

                if ($web['token'] == '')  continue;
                $twitts[] = $web;
            }
            update_option('mph_center_twitts', MPH_Helper::json_encode($twitts));

            $updateArray = array(
                'mph_center_fb_app_id',
                'mph_center_fb_app_secret',
                'mph_center_twitter_consumer_key',
                'mph_center_twitter_consumer_secret',
                'mph_center_twitter_app_access_token',
                'mph_center_twitter_app_access_token_secret',
            );
            foreach ($updateArray as $key) {
                update_option($key, $data[$key]);
            }
        }

        include (dirname(dirname(__FILE__)) . '/pages/view_settings.tpl');
    }

    public function apply_jss_css() {
        add_action( 'wp_enqueue_scripts', array($this, 'apply_jss_css_client' ) );
        add_action( 'admin_enqueue_scripts', array($this, 'apply_jss_css_admin' ) );
    }
    public function apply_jss_css_admin() {
        if ( is_admin() ) { 
            wp_enqueue_style( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',false,'3.3.7','all');
            wp_enqueue_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js', array ( 'jquery' ), '3.3.7', true);

            wp_enqueue_script( 'mph_center_admin', plugin_dir_url(dirname(__FILE__)) . '/public/js/admin-script.js', array ( 'jquery' ), '1.1.7', true);

            wp_enqueue_style( 'mph_center_admin', plugin_dir_url(dirname(__FILE__)) . '/public/css/admin.css?' . uniqid(),false,'1.1.6','all');

            wp_enqueue_script( 'bootstrap-notify', plugin_dir_url(dirname(__FILE__)) . '/public/js/bootstrap-notify/bootstrap-notify.min.js', array ( 'bootstrap' ), '1.0.0', true);

            wp_enqueue_script( 'mph_plugins', plugin_dir_url(dirname(__FILE__)) . '/public/js/plugins.js', array ( 'jquery' ), '1.0.2', true);

            wp_enqueue_script( 'mph_notify', plugin_dir_url(dirname(__FILE__)) . '/public/js/notify.js', array ( 'bootstrap-notify' ), '1.0.2', true);
        }
    }

    public function apply_jss_css_client() {

        if ( !is_admin() ) {
            
            wp_enqueue_style( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',false,'3.3.7','all');
            wp_enqueue_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js', array ( 'jquery' ), '3.3.7', true);

            wp_enqueue_style( 'fontawesome', plugin_dir_url(dirname(__FILE__)) . '/public/css/font-awesome/css/font-awesome.min.css', false, '4.6.1' );

            wp_enqueue_script( 'mph_center_frontend', plugin_dir_url(dirname(__FILE__)) . '/public/js/frontend-script.js', array ( 'jquery' ), '1.0.6', true);
            
            wp_enqueue_script( 'bootstrap-notify', plugin_dir_url(dirname(__FILE__)) . '/public/js/bootstrap-notify/bootstrap-notify.min.js', array ( 'bootstrap' ), '1.0.0', true);

            wp_enqueue_script( 'moment', plugin_dir_url(dirname(__FILE__)) . '/public/js/moment/moment.js', false, '1.0.0', true);

            wp_enqueue_script( 'mph_plugins', plugin_dir_url(dirname(__FILE__)) . '/public/js/plugins.js', array ( 'jquery' ), '1.0.1', true);

            wp_enqueue_script( 'mph_notify', plugin_dir_url(dirname(__FILE__)) . '/public/js/notify.js', array ( 'bootstrap-notify' ), '1.0.0', true);

            wp_enqueue_style( 'mph_center_frontend', plugin_dir_url(dirname(__FILE__)) . '/public/css/frontend.css',false,'1.0.6','all');

        }
    }

    public function apply_shortcode() {
        add_shortcode("mph-center-facebook", array($this, 'mph_facebook_shortcode') );
        add_shortcode("mph-center-twitter", array($this, 'mph_twitter_shortcode') );
    }

    public function mph_twitter_shortcode() {
        ob_start();
        ?>
        <script>
        var mph_center_twitter_login_window = null; 
        function mph_center_twitter_login(url) {
            if (mph_center_twitter_login_window)    mph_center_twitter_login_window.close();
            mph_center_twitter_login_window =  window.open(url, '_blank', 'width=720,height=650');
        }
        </script>

        <a href="javascript:void(0)" onclick="mph_center_twitter_login('<?php echo get_home_url(); ?>?mph-action=twitterOathInit')"><img src="<?php echo plugins_url('market-post-helper-center'); ?>/public/imgs/TwitterSignUp.png"></a>

        <?php
        $content = ob_get_clean();
        return $content;
    }

    public function mph_facebook_shortcode() {
        ob_start();
        ?>

        <script>
            var currentFBToken = '';
            function mph_center_fb_login(){
                FB.login(function(response) {

                    if (response.authResponse) {
                        currentFBToken = response.authResponse.accessToken; //get access token
                        mph_center_grabUserInfo();
                    }
                }/*, {
                    scope: 'publish_stream,email'
                }*/);
            }

            window.fbAsyncInit = function() {
                FB.init({
                    appId      : '<?php echo get_option('mph_center_fb_app_id'); ?>',
                    cookie     : true,  // enable cookies to allow the server to access 
                                        // the session
                    xfbml      : true,  // parse social plugins on this page
                    version    : 'v2.8' // use graph api version 2.8
                });
            };

            // Load the SDK asynchronously
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            // Here we run a very simple test of the Graph API after login is
            // successful.  See statusChangeCallback() for when this call is made.
            function mph_center_grabUserInfo() {
                FB.api('/me', function(response) {
                    var userName = response.name;
                    currentFBToken

                    jQuery.ajax({
                        url: ajaxurl + "?action=mph_save_fb",
                        method:'POST',
                        data: {'n': userName, 't': currentFBToken},
                    }).done(function(data) {

                    }).fail(function() {
                        
                    }).always(function() {
                        
                    });
                });
            }
        </script>

        <a href="javascript:void(0)" onclick="mph_center_fb_login()"><img src="<?php echo plugins_url('market-post-helper-center'); ?>/public/imgs/facebook-login.png"></a>

        <?php
        // <fb:login-button scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button>
        $content = ob_get_clean();

        return $content;
    }

}