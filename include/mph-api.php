<?php
//--------------------------------------------------------------
// Class: Markninja API
//--------------------------------------------------------------

class MPH_API {

	public $api_key;
	public $api_secret;
	public $cache_handler = null;
	public $was_cached    = false;
	public $no_ssl_verify = true; // disable ssl verification for curl
	public $timeout       = false;
	public $last_url;
	public $error;
	public $debug = false;

	// --- API Methods

	public function __construct($api_key=null, $api_secret=null, $debug=false) {
		$this->api_key = $api_key;
		$this->api_secret = $api_secret;
		$this->debug = $debug;
	}

	public function loadMeta($website, $id) {
		$homeUrls = parse_url($website);
		$host = $homeUrls['host'];
		$dateV = gmdate('Y-m-d H:i:s');

		$str = $host . "|" . $dateV . "|meta|wilson16|";
		$hash = hash('sha256', $str);

		$url = $website . '/wp-admin/admin-ajax.php?action=mph_meta&i=' . $id . '&h=' . $hash . '&dt=' . urlencode($dateV);

		return json_decode($this->curl($url), true);
	}

	public function sendPost($website, $post=array()) {
		$homeUrls = parse_url($website);
		$host = $homeUrls['host'];
		$dateV = gmdate('Y-m-d H:i:s');

		$str = $host . "|" . $dateV . "|post|wilson16|" . $post['post_title'];
		$hash = hash('sha256', $str);


		$data = array(
			'p' => $post,
			'dt' => $dateV,
			'h' => $hash
		);

		$curlOpt = array(
			CURLOPT_POST => true,
			CURLOPT_POSTFIELDS => http_build_query($data),
		);

		$url = $website . '/wp-admin/admin-ajax.php?action=mph_insert';
		$response = $this->curl($url, $curlOpt);
		
		return json_decode($response, true);
	}

	// curlDownloadFile is the curl equivalent of simpleDownloadFile.
	private function curl($url, $opt = array()) {

		$options = array(
			CURLOPT_URL => $url,
			CURLOPT_FOLLOWLOCATION => true,
		);

		$options = $options + $opt;

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
		// curl_setopt($curl, CURLOPT_HTTPHEADER, $strHeaders);
        // curl_setopt($curl, CURLOPT_HEADER, false);


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
