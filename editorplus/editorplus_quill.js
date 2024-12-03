/** @format */

// +-----------------------------------------------------------------------+
// | EditorPlus : Quill                                                    |
// |                                                                       |
// | To avoid a large number of files, everything concerning quill editor  |
// | is written in this file.                                              |
// | Uppercase constants are defined in editorplus_quill.tpl.              |
// | The file is divided into four parts:                                  |
// |  - Definition of variables                                            |
// |  - Definition of constants                                            |
// |  - Definition of functions                                            |
// |  - Display script                                                     |
// +-----------------------------------------------------------------------+

// +-----------------------------------------------------------------------+
// | Definition of constants                                               |
// +-----------------------------------------------------------------------+
// Timeout for data pre-registration
let ep_timeout;
// +-----------------------------------------------------------------------+
// | Definition of constants                                               |
// +-----------------------------------------------------------------------+
// Toolbar options
const fontSizeArr = [
  false,
  '8px',
  '9px',
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '32px',
  '42px',
  '54px',
  '68px',
  '84px',
  '98px',
];

const toolbarOption = [
  ['bold'],
  ['italic'],
  ['underline'],
  ['strike'],
  ['blockquote'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: fontSizeArr }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }],
  [{ background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['link'],
  ['image'],
  ['video'],
  ['clean'],
];

// Editor container template
const example_quill_container = `
<div id="%CONTAINER_ID%" style="width:100%">
    <iframe name="%QUILL_IFRAME_ID%" id="%QUILL_IFRAME_ID%" style="width:100%;height:%TEXTAREA_HEIGHT%" frameborder="0">
    </iframe>
</div>
`;

// Iframe template
const example_quill_iframe =
  `
<html>
<head>
    <link href="%EP_PATH%node_modules/quill/dist/quill.snow.css" rel="stylesheet">
    <link href="admin/themes/default/fontello/css/fontello.css" rel="stylesheet">
    <link href="%EP_PATH%admin/css/iframe_quill.css" rel="stylesheet">
    <script src="%EP_PATH%node_modules/quill/dist/quill.js"></` +
  `script>
</head>
<body>
    <div class="ep-content" id="%EDITOR_ID%"></div>
</body>
<script>
    window.onload = function() {
        const uniqueMessageType = "iframeLoaded_" + "%EDITOR_ID%"; 
        window.parent.postMessage({ type: uniqueMessageType }, '*');

        window.addEventListener("keyup", (e) => {
            if (e.key === 'Escape') {
                const keyupMessageType = "iframeKeyup_" + "%EDITOR_ID%";
                window.parent.postMessage({ type: keyupMessageType }, '*');
            }
        });
    };
</` +
  `script>
</html>`;

// Toolbar fullscreen button template
const example_fullscreen_button = `
<div class="ep-icon-containter">
    <span id="ql-preview" class="ql-formats icon-code ep-icon" data-preview="inactive"></span>
    <span id="ql-expand" class="ql-formats icon-resize-full ep-icon ep-left-border" data-modal="inactive"></span>
</div>`;

// Textarea preview template
const example_textarea_preview = `
<textarea class="ep-preview" id="ep-preview"></textarea>`;

// +-----------------------------------------------------------------------+
// | Definition of functions                                               |
// +-----------------------------------------------------------------------+

/**
 * `EditorPlus - Quill` : Creates the editor iframe and displays it on the page.
 *
 *  Hides the textarea and displays in its place an iframe that loads the Quill editor.
 * @param textarea the textarea jquery object
 * @returns quill_id, Quill, iframe_dom, quill
 */
function create_iframe_quill(textarea, add_height_textarea) {
  try {
    // Define iframe container constante
    const quill_id = textarea.attr('id')
      ? textarea.attr('id') + '-quill'
      : textarea.attr('name') + '-quill';
    const unique_iframe = new Date().getTime(); // Each time the page is loaded, we assign a new id to the iframe. This trick allows Safari not to cache the iframe (which causes problems).
    const quill_iframe_id = quill_id + '-iframe' + unique_iframe;
    const textarea_height = textarea.innerHeight() + add_height_textarea;
    const quill_iframe = example_quill_container
      .replace(/%CONTAINER_ID%/g, 'container-' + quill_iframe_id)
      .replace(/%QUILL_IFRAME_ID%/g, quill_iframe_id)
      .replace(/%TEXTAREA_HEIGHT%/g, textarea_height + 'px');

    // Hide textarea and display our editor
    textarea.hide();
    textarea.after(quill_iframe);

    // Define iframe content constante
    const iframe = $('#' + quill_iframe_id).get(0);
    const iframe_dom = iframe.contentDocument || iframe.contentWindow.document; // For older browsers because they don't support "iframe.contentDocument".
    const iframe_content = example_quill_iframe
      .replace(/%EDITOR_ID%/g, quill_id)
      .replace(/%EP_PATH%/g, EP_PATH);

    // Fill iframe content
    iframe_dom.open();
    iframe_dom.write(iframe_content);
    iframe_dom.close();

    // Return quill_id and Quill
    return {
      quill_id: quill_id,
      iframe_dom: iframe_dom,
      quill: $(iframe_dom),
      iframe_id: quill_iframe_id,
    };
  } catch (err) {
    console.error('Unable to create iframe', err);
  }
}

/**
 * `EditorPlus - Quill` : Init and load quill editor in iframe
 *
 * Setup quill with some config and add an expand/shrink button in toolbar
 * @param {*} Quill Quill v2
 * @param {*} iframe_dom iframe DOM Content
 * @param {*} quill_id quill_id div
 * @param {*} quill quill div jquery object
 * @returns Quill, expand
 */
function load_quill(Quill, iframe_dom, quill_id, quill) {
  try {
    // We need inline style and not Quill CSS Class
    const alignClass = Quill.import('attributors/style/align');
    const backgroundClass = Quill.import('attributors/style/background');
    const colorClass = Quill.import('attributors/style/color');
    const fontClass = Quill.import('attributors/style/font');
    const SizeClass = Quill.import('attributors/style/size');

    SizeClass.whitelist = fontSizeArr;
    Quill.register(alignClass, true);
    Quill.register(backgroundClass, true);
    Quill.register(colorClass, true);
    Quill.register(fontClass, true);
    Quill.register(SizeClass, true);

    // Quill initialization
    const quill_init = new Quill(iframe_dom.getElementById(quill_id), {
      // we use getElementById because for quill its better
      modules: {
        toolbar: toolbarOption,
      },
      theme: 'snow',
    });

    // Add expand/shrink button and resize toolbar
    const toolbar = quill.find('.ql-toolbar');
    toolbar.append(example_fullscreen_button);
    const iframe_ep_content = quill.find('.ep-content');
    const toolbar_expand_button = toolbar.find('#ql-expand');
    const toolbar_preview_button = toolbar.find('#ql-preview');

    // Minify toolbar
    const minify_toolbar = toolbar.find('.ql-formats:not(.ep-icon)');
    minify_toolbar.hide();
    toggle_toolbar(iframe_dom);
    minify_toolbar.wrapAll('<div class="ep-ql-toolbar"></div>');

    // Resize toolbar
    resize_toolbar(toolbar, iframe_ep_content);
    $(window).on('resize toolbar-resize', function () {
      resize_toolbar(toolbar, iframe_ep_content);
    });

    // Choose clear/dark theme
    if (PWG_THEMECONF == 'dark') {
      $(iframe_dom).find('body').addClass('dark');
    }

    return {
      Quill: quill_init,
      expand: toolbar_expand_button,
      preview: toolbar_preview_button,
    };
  } catch (err) {
    console.error('Unable to load quill', err);
  }
}

/**
 * `EditorPlus - Quill` : Show quill modal
 */
function show_quill_modal(quill_iframe_id, expand_button, iframe_dom) {
  try {
    const i_dom = $(iframe_dom);
    $('#container-' + quill_iframe_id).addClass('quill-modal-content');
    $('#' + quill_iframe_id).addClass('quill-modal-iframe');
    expand_button.removeClass('icon-resize-full');
    expand_button.addClass('icon-resize-small');
    expand_button.data('modal', 'active');

    i_dom.find('.ep-ql-toolbar').css('padding', '8px');
    i_dom
      .find('#ql-expand')
      .css('border-radius', '5px')
      .removeClass('ep-left-border');
    i_dom.find('.ep-icon-containter').css('margin', '8px');
    i_dom.find('.ql-picker-options').css('max-height', 'initial');

    $(window).trigger('toolbar-resize');
  } catch (err) {
    console.error('Unable to show quill modal', err);
  }
}

/**
 * `EditorPlus - Quill` : Close quill modal
 */
function close_quill_modal(quill_iframe_id, expand_button, iframe_dom) {
  try {
    const i_dom = $(iframe_dom);
    $('#container-' + quill_iframe_id).removeClass('quill-modal-content');
    $('#' + quill_iframe_id).removeClass('quill-modal-iframe');
    expand_button.removeClass('icon-resize-small');
    expand_button.addClass('icon-resize-full');
    expand_button.data('modal', 'inactive');

    i_dom.find('.ep-ql-toolbar').css('padding', '');
    i_dom
      .find('#ql-expand')
      .css('border-radius', '')
      .addClass('ep-left-border');
    i_dom.find('.ep-icon-containter').css('margin', '');
    i_dom.find('.ql-picker-options').css('max-height', '160px');

    $(window).trigger('toolbar-resize');
  } catch (err) {
    console.error('Unable to close modal', err);
  }
}

/**
 * `EditorPlus - Quill` : Toggle Toolbar
 */
function toggle_toolbar(iframe_dom) {
  try {
    $(iframe_dom).find('.ql-formats:not(.ep-icon)').hide();
    EP_CONFIG_EDITOR.config_quill
      .slice()
      .reverse()
      .forEach(function (item) {
        const type_item = item.split('/')[0];
        const quill_item = item.split('/')[1];
        let new_toolbar = $(iframe_dom)
          .find(type_item + '.' + quill_item)
          .parent();
        new_toolbar.prependTo(new_toolbar.parent());
        new_toolbar.show();
      });
  } catch (err) {
    console.error('Unable to toggle toolbar', err);
  }
}

/**
 * `EditorPlus - Quill` : Convert quill class to inline style
 * @param {*} text raw quill root content
 * @returns convert quill content
 */
function convert_quill(text) {
  try {
    // Convert class 'ql-indent-*' to inline style
    $(text)
      .find('[class^="ql-indent-"]')
      .each(function () {
        const e = $(this);
        const c = e[0].className;
        const i = c.match(/\d+$/)[0];
        e.removeClass(c);
        // e.removeAttr('class');
        e.css('padding-left', i * 3 + 'em');
      });
    // Convert class 'ql-code-block-container' to inline style
    $(text)
      .find('.ql-code-block-container')
      .each(function () {
        const e = $(this);
        const c = e[0].className;
        e.css({
          'background-color': '#23241f',
          color: '#f8f8f2',
          overflow: 'visible',
          'margin-bottom': '5px',
          'margin-top': '5px',
          padding: '5px 10px',
          'border-radius': '3px',
          'font-family': 'monospace',
          position: 'relative',
        });
        e.removeClass(c);
        e.find('.ql-code-block').removeClass('ql-code-block');
      });
    // Convert class 'ql-ui' to inline style
    $(text)
      .find('.ql-ui')
      .each(function () {
        const e = $(this);
        e.remove();
      });
    // Convert class 'ql-video' to inline style
    $(text)
      .find('.ql-video')
      .each(function () {
        const e = $(this);
        e.removeClass('ql-video');
        e.css({
          display: 'block',
          'max-width': '100%',
        });
      });

    return text;
  } catch (err) {
    console.error('Unable to convert quill css to inline style', err);
  }
}

/**
 * `EditorPlus - Quill` : Toggle Toolbar
 */
function resize_toolbar(toolbar, iframe_ep_content) {
  try {
    const toolbar_height = toolbar.innerHeight() + 2;
    iframe_ep_content.css('height', 'calc(100% - ' + toolbar_height + 'px)');
  } catch (err) {
    console.error('Unable to resize toolbar', err);
  }
}

/**
 * `EditorPlus - Quill` : Show Preview
 */
function show_preview(
  quill_preview,
  quill_expand,
  iframe_dom,
  quill,
  textarea
) {
  try {
    const i_dom = $(iframe_dom);
    const editor = i_dom.find('.ql-editor');
    const textarea_preview = $(example_textarea_preview);
    const preview = i_dom.find('#ep-preview');
    const quill_content = quill.root.cloneNode(true);

    i_dom.find('.ql-formats:not(.ep-icon)').hide();
    quill_preview.css('color', '#ffa646');

    if (preview.length == 0) {
      editor.hide();
      editor.before(textarea_preview);
      const cq = convert_quill(quill_content);
      textarea_preview.val(cq.innerHTML);

      quill.off('text-change');
      textarea_preview.on('input', function () {
        textarea.val(textarea_preview.val());
      });
    }

    $(window).trigger('toolbar-resize');
    quill_preview.data('preview', 'active');
  } catch (err) {
    console.error('Unable to show preview', err);
  }
}

/**
 * `EditorPlus - Quill` : Hide Preview
 */
function hide_preview(
  quill_preview,
  quill_expand,
  iframe_dom,
  quill,
  textarea
) {
  try {
    const i_dom = $(iframe_dom);
    const preview = i_dom.find('#ep-preview');
    const editor = i_dom.find('.ql-editor');

    quill_expand.data('modal') == 'inactive'
      ? toggle_toolbar(iframe_dom)
      : i_dom.find('.ql-formats').show();
    quill_preview.css('color', '');

    if (preview.length > 0) {
      quill.clipboard.dangerouslyPasteHTML(preview.val());
      preview.remove();
      editor.show();

      quill.on('text-change', function () {
        fill_textarea(quill, textarea);
      });
    }

    $(window).trigger('toolbar-resize');
    quill_preview.data('preview', 'inactive');
  } catch (err) {
    console.error('Unable to hide preview', err);
  }
}

/**
 * `EditorPlus - Quill` : Fill textarea for pre-registration
 */
function fill_textarea(quill, textarea) {
  clearTimeout(ep_timeout);

  ep_timeout = setTimeout(function () {
    const quill_content = quill.root.cloneNode(true);
    const cq = convert_quill(quill_content);
    textarea.val(cq.innerHTML);
  }, 500);
}

// +-----------------------------------------------------------------------+
// | Display script                                                        |
// +-----------------------------------------------------------------------+

// We load the editor
// Waiting for DOM before load our script

$(document).ready(function () {
  // For each `EX_TEXTAREA` (textarea ids), we'll check whether we've found a textarea with these ids
  // `EP_TEXTAREA` is define in editorplus_quill.tpl

  $.each(EP_TEXTAREA, function (i, id) {
    // Get textarea
    const textarea = $('#' + id);

    // This is the most important part of our script, we load the editor
    if (textarea.length > 0 && textarea.is('textarea')) {
      // On the album page, we remove the expand button from the description to leave the EditorPlus one
      let add_height_textarea = 150; // + 150 is a good size for editor content
      if (EP_CURRENT_PAGE == 'album') {
        $('#desc-zoom-square').css('display', 'none');
        add_height_textarea = 30; // + 30 is a good size for editor content in album page
      }
      if (EP_CURRENT_PAGE == 'theCategoryPage') {
        add_height_textarea = 50; // + 30 is a good size for editor content in album page
      }

      // create iframe
      const iframe = create_iframe_quill(textarea, add_height_textarea);

      // We use an "addEventListener" which is triggered when the iframe dom is loaded and not "iframe.onload",
      // because Safari handles onload differently.
      // Safari loads the editor only once and on only one page per session.
      window.addEventListener('message', function (e) {
        // For security we check if the iframe have the same origin as piwigo server
        if (e.origin !== window.location.origin) return;

        // Iframe onload
        if (e.data.type === 'iframeLoaded_' + iframe.quill_id) {
          // This is generate in example_quill_iframe
          // Init and load quill
          const loaded_quill = $('#' + iframe.iframe_id).get(0).contentWindow
            .Quill;
          const quill = load_quill(
            loaded_quill,
            iframe.iframe_dom,
            iframe.quill_id,
            iframe.quill
          );

          // Fill quill editor with textarea value
          quill.Quill.clipboard.dangerouslyPasteHTML(textarea.val());

          // addEventListener
          // Show/Hide quill modal
          quill.expand.on('click', function () {
            if (quill.expand.data('modal') == 'inactive') {
              show_quill_modal(
                iframe.iframe_id,
                quill.expand,
                iframe.iframe_dom
              );

              quill.preview.data('preview') == 'inactive'
                ? hide_preview(
                    quill.preview,
                    quill.expand,
                    iframe.iframe_dom,
                    quill.Quill,
                    textarea
                  )
                : show_preview(
                    quill.preview,
                    quill.expand,
                    iframe.iframe_dom,
                    quill.Quill,
                    textarea
                  );
            } else {
              close_quill_modal(
                iframe.iframe_id,
                quill.expand,
                iframe.iframe_dom
              );

              quill.preview.data('preview') == 'inactive'
                ? hide_preview(
                    quill.preview,
                    quill.expand,
                    iframe.iframe_dom,
                    quill.Quill,
                    textarea
                  )
                : show_preview(
                    quill.preview,
                    quill.expand,
                    iframe.iframe_dom,
                    quill.Quill,
                    textarea
                  );
            }
          });
          // On window click hide the modal
          $(window).on('click', function (e) {
            if (e.target == $('#container-' + iframe.iframe_id)[0]) {
              close_quill_modal(
                iframe.iframe_id,
                quill.expand,
                iframe.iframe_dom
              );

              quill.preview.data('preview') == 'inactive'
                ? hide_preview(
                    quill.preview,
                    quill.expand,
                    iframe.iframe_dom,
                    quill.Quill,
                    textarea
                  )
                : show_preview(
                    quill.preview,
                    quill.expand,
                    iframe.iframe_dom,
                    quill.Quill,
                    textarea
                  );
            }
          });

          // On textarea text change we fill the editor with textarea value
          textarea.on('change', function () {
            quill.Quill.clipboard.dangerouslyPasteHTML(textarea.val());
          });
          // Convert Quill Css Class to inline style
          quill.Quill.on('text-change', function () {
            fill_textarea(quill.Quill, textarea);
          });

          // Preview button
          quill.preview.on('click', function () {
            if (quill.preview.data('preview') == 'inactive') {
              show_preview(
                quill.preview,
                quill.expand,
                iframe.iframe_dom,
                quill.Quill,
                textarea
              );
            } else {
              hide_preview(
                quill.preview,
                quill.expand,
                iframe.iframe_dom,
                quill.Quill,
                textarea
              );
            }
          });
        }

        // Hide modal with escape key from iframe
        if (e.data.type === 'iframeKeyup_' + iframe.quill_id) {
          const button = iframe.quill.find('#ql-expand'); // expand button in iframe
          close_quill_modal(iframe.iframe_id, button, iframe.iframe_dom);

          quill.preview.data('preview') == 'inactive'
            ? hide_preview(
                quill.preview,
                quill.expand,
                iframe.iframe_dom,
                quill.Quill,
                textarea
              )
            : show_preview(
                quill.preview,
                quill.expand,
                iframe.iframe_dom,
                quill.Quill,
                textarea
              );
        }
      });
    }
  });
});
