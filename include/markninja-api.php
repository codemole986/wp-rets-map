<?php
//--------------------------------------------------------------
// Class: Markninja API
//--------------------------------------------------------------

class MarkninjaAPI {

	public $api_key;
	public $api_secret;
	public $cache_handler = null;
	public $was_cached    = false;
	public $no_ssl_verify = ture; // disable ssl verification for curl
	public $timeout       = false;
	public $last_url;
	public $error;
	public $debug = false;

	private static $url_templates = [
		"lookup"  => 'http://www.markninja.com/las/markninja-api/public/api/estate/lookup',
		"search"  => 'http://www.markninja.com/las/markninja-api/public/api/estate/search',
		"list"  => 'http://www.markninja.com/las/markninja-api/public/api/estate/list',
		"load"  => 'http://www.markninja.com/las/markninja-api/public/api/estate/load',
		"meta"  => 'http://www.markninja.com/las/markninja-api/public/api/estate/meta',
	];

	// --- API Methods

	public function __construct($api_key=null, $api_secret=null, $debug=false) {
		$this->api_key = $api_key;
		$this->api_secret = $api_secret;
		$this->debug = $debug;
	}

	private function loadAPI($key, $params=array()) {
		$url = $this->getUrl($key, $params);
		return json_decode($this->curl($url), true);
	}

	public function meta($params=array()) {
		return $this->loadAPI('meta');
	}

	// get provides access to any Quandl API endpoint. There is no need
	// to include the format.
	public function search($params=array()) {
		return $this->loadAPI('search', $params);
	}

	public function getList($params=array()) {
		return $this->loadAPI('list', $params);
	}

	public function lookup($params=array()) {
		return $this->loadAPI('lookup', $params);
	}

	public function load($params=array()) {
		return $this->loadAPI('load', $params);
	}

	// getUrl receives a kind that points to a URL template and 
	// a variable number of parameters, which will be replaced
	// in the template.
	private function getUrl($key, $params=array()) {

		if ($this->debug)	print_r($params);

		$template = self::$url_templates[$key];
		$params_url = http_build_query($params);
		
		$this->last_url = $template . "?" .  $params_url;
		
		if ($this->debug) {
			echo $this->last_url;
			exit;
		}

		return $this->last_url;
	}

	// curlDownloadFile is the curl equivalent of simpleDownloadFile.
	private function curl($url) {

		$options = [
			CURLOPT_URL => $url,
			CURLOPT_FOLLOWLOCATION => true,

		];

		$response = $this->curlExecute($options);
		return $response;
	}

	// curlExecute handles generic curl execution, for DRYing the two other
	// functions that rely on curl.
	private function curlExecute($options) {

		$strHeaders = array(
	        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	        'Content-Type: text/html; charset=UTF-8',
	        'User-Agent: Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1',
	    );

		$curl = curl_init();

		curl_setopt_array($curl, $options);

		curl_setopt ($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $strHeaders);
        curl_setopt($curl, CURLOPT_HEADER, false);


		$this->timeout       and curl_setopt($curl, CURLOPT_TIMEOUT, $this->timeout);
		$this->no_ssl_verify and curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);

		$response = curl_exec($curl);
		$error = curl_error($curl);
		$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		
		curl_close($curl);

		if ($http_code == "404") {
			$response = false;
			$this->error = "Invalid URL";
		}
		else if ($error) {
			$response = false;
			$this->error = $error;
		}

		return $response;
	}
}
