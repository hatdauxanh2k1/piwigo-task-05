<?php
/*
Version: 14.d
Plugin Name: EditorPlus
Plugin URI: http://piwigo.org/ext/extension_view.php?eid=972
Author: Piwigo team
Author URI: https://github.com/Piwigo
Description: WYSIWYG Editor for Piwigo.
Has Settings: true
*/

if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

// check root directory
if (basename(dirname(__FILE__)) != 'editorplus') {
  add_event_handler('init', 'ep_error');
  function ep_error()
  {
    global $page;
    $page['errors'][] = 'EditorPlus folder name is incorrect, uninstall the plugin and rename it to "editorplus"';
  }
  return;
}

// +-----------------------------------------------------------------------+
// | Define plugin constants                                               |
// +-----------------------------------------------------------------------+

define('EP_ID', basename(dirname(__FILE__)));
define('EP_PATH', PHPWG_PLUGINS_PATH . EP_ID . '/');
define('EP_REALPATH', realpath(EP_PATH));
define('EP_ADMIN', get_root_url() . 'admin.php?page=plugin-' . EP_ID);

// +-----------------------------------------------------------------------+
// | Init EditorPlus                                                       |
// +-----------------------------------------------------------------------+

// Include once admin function
include_once(EP_PATH . 'include/admin.inc.php');

// init
add_event_handler('init', 'ep_init');

// add API function
$ws_file = EP_PATH . 'include/ws_functions.inc.php';
add_event_handler('ws_add_methods', 'ep_quill_add_methods', EVENT_HANDLER_PRIORITY_NEUTRAL, $ws_file);

include(EP_PATH . 'editorplus.php');
