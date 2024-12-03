{combine_css path="{$EP_PATH}admin/css/editorplus_{$EP_EDITOR}.css" order=0}
{combine_script id='editorplus_{$EP_EDITOR}' load='footer' path="{$EP_PATH}admin/js/editorplus_{$EP_EDITOR}.js"}
<script>
const EP_PATH = '{$EP_PATH|escape:javascript}';
const EP_CURRENT_PAGE = '{$EP_PAGE|escape:javascript}';
const EP_TEXTAREA = {$EP_TEXTAREA_ID|json_encode};
const EP_CONFIG_EDITOR = {$EP_CONFIG_EDITOR|json_encode};
const PWG_THEMECONF = {$themeconf['colorscheme']|json_encode};
</script>



