<?php
/*
Plugin Name: RVADV Template Buttons for Blog Posts
Description: Adds custom template buttons to the post editor to insert predefined HTML snippets.
Version: 1.0.1
Author: Rafael Q
Author URI: http://rvadv.com
*/

defined('ABSPATH') || die();

function tbf_add_buttons($plugin_array) {
    $screen = get_current_screen();
    if ($screen->base == 'post' && $screen->post_type == 'post') {
        $plugin_array['tbf_templates'] = plugin_dir_url(__FILE__) . 'js/tbf_templates.js';
    }
    return $plugin_array;
}
add_filter('mce_external_plugins', 'tbf_add_buttons');

function tbf_register_buttons($buttons) {
    $screen = get_current_screen();
    if ($screen->base == 'post' && $screen->post_type == 'post') {
        array_push($buttons, 'tbf_button_one', 'tbf_button_two', 'tbf_button_three');
    }
    return $buttons;
}
add_filter('mce_buttons', 'tbf_register_buttons');

function tbf_add_editor_styles() {
    add_editor_style(plugin_dir_url(__FILE__) . 'css/editor-styles.css');
}
add_action('admin_init', 'tbf_add_editor_styles');

function tbf_enqueue_editor_assets() {
    wp_enqueue_style('tbf-editor-icons', plugin_dir_url(__FILE__) . 'assets/editor-icons.css');
}
add_action('admin_enqueue_scripts', 'tbf_enqueue_editor_assets');

function tbf_enqueue_frontend_styles() {
    wp_enqueue_style('tbf-frontend-styles', plugin_dir_url(__FILE__) . 'css/frontend-styles.css');
}
add_action('wp_enqueue_scripts', 'tbf_enqueue_frontend_styles');

register_activation_hook(__FILE__, 'tbf_activate_plugin');
register_deactivation_hook(__FILE__, 'tbf_deactivate_plugin');

function tbf_activate_plugin() {
    // Code to run on activation
}

function tbf_deactivate_plugin() {
    // Code to run on deactivation
}

// ------------------------------------------
// Plugin update checker to the update server
$update_url = 'https://rvadv-plugin-update-server.netlify.app/rvadv_post-templates/update-server.json';

add_filter('pre_set_site_transient_update_plugins', 'check_for_plugin_update');
function check_for_plugin_update($transient) {
    if (empty($transient->checked)) {
        return $transient;
    }

    $plugin_slug = 'rvadv_post-templates';
    $current_version = $transient->checked["$plugin_slug/$plugin_slug.php"];


    $response = wp_remote_get($update_url);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) != 200) {
        return $transient;
    }

    $update_data = json_decode(wp_remote_retrieve_body($response));
    if (version_compare($current_version, $update_data->new_version, '<')) {
        $transient->response["$plugin_slug/$plugin_slug.php"] = (object) [
            'slug' => $plugin_slug,
            'new_version' => $update_data->new_version,
            'package' => $update_data->package,
            'url' => $update_data->url,
        ];
    }

    return $transient;
}

add_filter('plugins_api', 'plugin_update_info', 20, 3);

function plugin_update_info($res, $action, $args) {
    $plugin_slug = 'rvadv_post-templates';

    if ($action !== 'plugin_information' || $args->slug !== $plugin_slug) {
        return $res;
    }

    $response = wp_remote_get($update_url);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) != 200) {
        return $res;
    }

    $update_data = json_decode(wp_remote_retrieve_body($response));
    $res = (object) [
        'name' => 'RVADV Template Buttons for Blog Posts',
        'slug' => $plugin_slug,
        'version' => $update_data->new_version,
        'author' => 'Rafael Q',
        'homepage' => 'http://rvadv.com',
        'download_link' => $update_data->package,
        'requires' => '5.0',
        'tested' => '6.5.3',
        'sections' => [
            'description' => 'Adds custom template buttons to the post editor to insert predefined HTML snippets.',
            'changelog' => 'Changelog here...',
        ],
    ];

    return $res;
}
// ------------------------------------------
// ------------------------------------------