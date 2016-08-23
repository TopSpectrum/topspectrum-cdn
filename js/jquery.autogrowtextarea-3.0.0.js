/*!
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <jevin9@gmail.com> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return. Jevin O. Sewaruth
 * ----------------------------------------------------------------------------
 *
 * Autogrow Textarea Plugin Version v3.0
 * http://www.technoreply.com/autogrow-textarea-plugin-3-0
 *
 * THIS PLUGIN IS DELIVERD ON A PAY WHAT YOU WHANT BASIS. IF THE PLUGIN WAS USEFUL TO YOU, PLEASE CONSIDER BUYING THE PLUGIN HERE :
 * https://sites.fastspring.com/technoreply/instant/autogrowtextareaplugin
 * https://github.com/jevin/Autogrow-Textarea
 *
 * Date: October 15, 2012
 */
jQuery.fn.autoGrow = function(options) {
    return this.each(function() {
        var settings = jQuery.extend({
            extraLine: true,
        }, options);

        var createMirror = function(textarea) {
            jQuery(textarea).after('<div class="autogrow-textarea-mirror"></div>');
            return jQuery(textarea).next('.autogrow-textarea-mirror')[0];
        }

        var sendContentToMirror = function (textarea, extraLine) {
            var value = textarea.value;

            value = String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/ /g, '&#32;') //&nbsp;
                    .replace(/\n/g, '<br />');

            if (!value) {
                value += (extraLine? '<br/>.' : '&nbsp;');
            } else {
                value += (extraLine? '<br/>.' : '');
            }

            mirror.innerHTML = value;

            if (jQuery(textarea).height() != jQuery(mirror).height())
                jQuery(textarea).height(jQuery(mirror).height());
        }

        var growTextarea = function () {
            sendContentToMirror(this, settings.extraLine);
        };

        var shrinkTextarea = function() {
            sendContentToMirror(this, false);
        };

        // Create a mirror
        var mirror = createMirror(this);

        // Style the mirror
        mirror.style.display = 'none';
        mirror.style.wordWrap = 'break-word';
        mirror.style.whiteSpace = 'pre-wrap';
        mirror.style.padding = jQuery(this).css('paddingTop') + ' ' +
            jQuery(this).css('paddingRight') + ' ' +
            jQuery(this).css('paddingBottom') + ' ' +
            jQuery(this).css('paddingLeft');

        mirror.style.width = jQuery(this).css('width');
        mirror.style.fontFamily = jQuery(this).css('font-family');
        mirror.style.fontSize = jQuery(this).css('font-size');
        mirror.style.lineHeight = jQuery(this).css('line-height');
        mirror.style.letterSpacing = jQuery(this).css('letter-spacing');

        // Style the textarea
        this.style.overflow = "hidden";
        this.style.minHeight = this.rows+"em";

        // Bind the textarea's event
        this.onkeyup = growTextarea;
        this.onfocus = growTextarea;
        this.onblur = shrinkTextarea;

        // Fire the event for text already present
        sendContentToMirror(this, settings.extraLine);

    });
};