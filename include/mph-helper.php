<?php


if ( !class_exists( 'MPH_Helper' ) ) {
    class MPH_Helper {

        public static function find_valid_filename($dir, $fname)
        {
            $parts = explode(".", $fname);
            if ($parts) {
                $ext = end($parts);
            } else {
                // error_log(__METHOD__."(): Invalid extension from filename " . $fname);
                return false;
            }

            $pre_name = str_replace(".".$ext, "", $fname);

            // replace all special characters as "_" to avoid any exception that might occur
            // $pre_name = preg_replace("/[`!#$%^&'()+,;=@\[\]{}~ .]/", '_', $pre_name);
            $pre_name = trim(preg_replace("/[^a-zA-Z0-9_\-]/", '_', $pre_name));
            if (strlen($pre_name) >= 50) {
                $pre_name = str_split($pre_name, 50)[0];
            }

            $check_name = trim(str_replace("_", "", $pre_name));
            if ($check_name == '') $pre_name = 'unnamed';
            /////////////////////////////////////////////////////

            // $pre_name = $pre_name . time();
            $img_ext = ['png', 'jpg', 'gif'];
            $is_image = in_array($ext, $img_ext);

            $ind = "";
            $is_exist = true;
            do {
                
                $fname = $pre_name.$ind.".".$ext;
                if ( !file_exists($dir."/".$fname) ) {
                    $is_exist = false;
                }

                if ($ind === "") {
                    $ind = 0;
                } else {
                    $ind++;
                }

            } while ($is_exist);

            return $fname;
        }

        public static function json_encode($data_array) {
            $json = json_encode($data_array);
            if ( !$json && is_array($data_array)) {
                array_walk_recursive($data_array, function(&$val) {
                    $temp = json_encode($val);
                    if (!$temp) {
                        $val = self::make_string_safe($val); // need to take out bad utf-8 char existing in non-utf8 format string
                    }

                    $temp = json_encode($val);
                    if (!$temp) {
                        $val = utf8_encode($val);
                    }
                });
                $json = json_encode($data_array);
            }

            return $json;
        }

        public static function make_string_safe($str) {
            if (function_exists('mb_convert_encoding')) {
                return mb_convert_encoding($str, 'utf-8', 'utf-8');
            } else {
                return $str;
            }
        }

        public static function insert_attachment($post_id, $filename) {

            $wp_upload_dir = wp_upload_dir();
            $filetype = wp_check_filetype( basename( $filename ), null );

            // Get the path to the upload directory.
            $new_name = self::find_valid_filename($wp_upload_dir['path'], $post_id . '-' . basename($filename));
            copy($filename, $wp_upload_dir['path'] . '/' . $new_name);

            $filename = $wp_upload_dir['path'] . '/' . $new_name;

            // Prepare an array of post data for the attachment.
            $attachment = array(
                'guid'           => $wp_upload_dir['url'] . '/' . basename( $filename ), 
                'post_mime_type' => $filetype['type'],
                'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $filename ) ),
                'post_content'   => '',
                'post_status'    => 'inherit'
            );

            // Insert the attachment.
            $attach_id =  wp_insert_attachment( $attachment, $filename, $post_id );

            // Make sure that this file is included, as wp_generate_attachment_metadata() depends on it.
            require_once( ABSPATH . 'wp-admin/includes/image.php' );

            // Generate the metadata for the attachment, and update the database record.
            $attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
            wp_update_attachment_metadata( $attach_id, $attach_data );

            return $attach_id;      
        }

        public static function get_my_protocol() {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            return $protocol;
        }

        public static function replace_comma_tag($str) {
            return str_replace([', ', '&#44; ', ',', '&#44;'], ' ', $str);
        }

        public static function make_data_safe($data = array()) {
            if (is_array($data)) {
                foreach ($data as $key => $val) {
                    $data[$key] = self::make_data_safe($val);
                }
            } else {
                if (get_magic_quotes_gpc() || true) { // seems WP attaches slash no matter what...
                    $data = stripcslashes($data);
                    // $data = strip_special_chars($data);
                }
            }

            return $data;
        }
    }
}