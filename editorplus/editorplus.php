<?php
if (!defined('PHPWG_ROOT_PATH')) die('Hacking attempt!');

// load EditorPlus

if (defined('IN_ADMIN')) {

  add_event_handler('loc_begin_admin_page', 'ep_load_editor');
} else {
  add_event_handler('loc_end_page_tail', 'jquery_script');
  add_event_handler('loc_end_page_tail', 'ep_load_editor');
  function jquery_script()
  {
    echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>';
  }
}
