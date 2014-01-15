﻿(function () {

    'use strict';
    /*global $:false, window:false, document:false */
    /*jslint white: true */

    var BASE_URL, BOOTSTRAP_COLLAPSE_HIDE_DURATION;

    BASE_URL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
    BOOTSTRAP_COLLAPSE_HIDE_DURATION = 195; // approx

    function setupTheAnchorElementNonLinkBehavior() {

        // sometimes we want links that do not behave like links
        $("a.non-link").click(function (e) {
            // prevent default and bubbling
            // within a jQuery event handler
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

    }

    function refreshScrollSpy() {

        $('[data-spy="scroll"]').each(function () {

            $(this).scrollspy('refresh');

        });

    }

    function expandTheCollapsingContactFormBySectionHash(hash) {

        $('section' + hash + ' ' + '.collapse').collapse('show');

    }

    function setupTheCollapsingContactForm() {

        var div, button, strong, span, forms, form, isValid, scrollTopBefore, offsetTopBefore, scrollTopAfter, offsetTopAfter, id, target, targetTop, windowHeight, scrollTop;

        function centerTheCollapsingContactForm(form) {

            id = form.attr('id');
            target = $('[href*=' + id + ']');
            targetTop = target.offset().top;
            windowHeight = $(window).height();
            scrollTop = targetTop - windowHeight / 2;
            $('html,body').scrollTop(scrollTop);

        }

        // get all the contact forms
        forms = $('form.contact-form');

        // When using scrollspy in conjunction with adding or removing of elements from the DOM, 
        // call the refresh method
        forms.children('.collapse').bind('shown hidden', function () {

            // use a timeout, because the hidden event is early
            window.setTimeout(refreshScrollSpy, BOOTSTRAP_COLLAPSE_HIDE_DURATION);

        });

        // on show of any collapsible within any form
        forms.children('.collapse').bind('show', function () {

            // capture the current window position
            scrollTopBefore = $('html,body').scrollTop();
            offsetTopBefore = $(this).offset().top;

            // Wrap all alerts with close functionality.
            // This is defensive coding, because it might be unnecessary.
            $(".alert").alert();

            // Close all the alerts within all contact forms.
            forms.find('.alert').alert('close');

            // Close collapsables that are currently open
            // do it manually, sans animation
            $('.collapse.in').height(0).removeClass('in');

            // adjust the window position so it appears that nothing happened
            offsetTopAfter = $(this).offset().top;
            scrollTopAfter = scrollTopBefore - (offsetTopBefore - offsetTopAfter);

        });

        // on shown of any collapsible
        forms.children('.collapse').bind('shown', function () {


            $('html,body').scrollTop(scrollTopAfter);

            // set the focus
            $(this).find('[name=fromEmail]').focus();

        });

        // on hidden of any collapsible within any form
        forms.children('.collapse').bind('hidden', function () {

            // get the specific form
            form = $(this).parents('form');
            form.validate().resetForm();
            form[0].reset();

        });

        // now, for each form
        $.each(forms, function (i) {

            form = $(forms[i]);

            // setup validation
            form.validate({
                rules: {
                    fromEmail: {
                        required: true,
                        email: true
                    },
                    fromName: "required",
                    subject: "required",
                    body: "required"
                },
                messages: {
                    fromEmail: {
                        required: 'Please provide your email.',
                        email: 'Please provide a valid email.'
                    },
                    fromName: "Please provide your name.",
                    subject: "Please provide a subject.",
                    body: "Please type a message."
                },
                invalidHandler: function (form, validator) {

                    $(validator.errorList[0].element).focus();

                }
            });

        });

        // on form reset button click
        forms.find('button[type=reset]').click(function () {

            form = $(this).parents('form');
            centerTheCollapsingContactForm(form);

        });

        // on form submit button click
        forms.find('button[type=submit]').click(function () {

            // get the specific form
            form = $(this).parents('form');

            // prevent default behavior if the form is not valid
            isValid = form.valid();

            if (isValid) {

                // create the success alert box
                div = $('<div/>', { 'class': 'alert alert-success' });
                button = $('<button/>', { type: 'button', 'class': 'close', 'data-dismiss': 'alert', html: 'x' });
                strong = $('<strong/>', { html: 'Thank you.&nbsp' });
                span = $('<span/>', { html: 'We will reply shortly.' });
                div.append(button);
                div.append(strong);
                div.append(span);

                // show the success alert box
                form.append(div);
                centerTheCollapsingContactForm(form);

            }

            // prevent default behavior if the form is not valid
            // otherwise the form will collapse via the bootstrap collapse javascript                 
            return isValid;

        });

        // if the useragent has javascript
        // then submit with ajax and prevent page redirect
        forms.submit(function () {

            // retrieive the form
            form = $(this);

            // POST to wcf in a way that mimics an html form POST
            $.ajax({
                type: form.attr('method'),
                url: BASE_URL + form.attr('action'),
                data: form.serialize(),
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'text'
            });

            return false;

        });

    }

    function getParameterByName(name) {

        var regexS, regex, results, parameterValue;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        regexS = "[\\?&]" + name + "=([^&#]*)";
        regex = new RegExp(regexS);
        results = regex.exec(window.location.search);
        if (results === null) {
            parameterValue = "";
        }
        else {
            parameterValue = decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        return parameterValue;

    }

    function respondToQueryStringActionParameter() {

        var action, hash;
        action = getParameterByName('action');
        if (action === 'email') {

            hash = window.location.hash;
            expandTheCollapsingContactFormBySectionHash(hash);

        }
    }

    function setupNavigationClickHandler() {

        var collapsible, href, doDefault;
        $('nav#subnav a').click(function (e) {

            // if there is a collapsible on the page
            collapsible = $('.in.collapse');
            if (collapsible.length > 0) {

                // ... determine where to navigate...
                href = $(this).attr('href');

                // ... hide the collapsible
                collapsible.collapse('hide');

                // use a timeout, double the duraction to be safe, because the hidden event is early
                window.setTimeout(function () { window.location.hash = href; }, (BOOTSTRAP_COLLAPSE_HIDE_DURATION * 2));

                // ... finally, prevent the default behavior
                e.preventDefault();
                doDefault = false;
            }

        });

        return doDefault;

    }

    function initializeTooltips() {
        $("[data-toggle='tooltip']").tooltip();
    }

    function setupDesktopAccordionClientListEvents() {

        var hash, portfolio;
        $('#accordionClientList a.accordion-toggle').click(function () {
            // on click of the link, instantiate the src of the iframe
            hash = $(this).attr('href');
            portfolio = $('#accordionClientList ' + hash + ' .portfolio');
            portfolio.attr('src', portfolio.data('src'));
        });
    }

    function setupMobileAccordionClientListEvents() {
        var toggle, portfolio;
        $('#accordionClientList .panel.panel-default').each(function () {
            // on click of the link, navigate directly to the website
            portfolio = $(this).find('.portfolio');
            toggle = $(this).find('.accordion-toggle');
            toggle
                .attr('href', portfolio.data('src'))
                .removeAttr('data-toggle');
            portfolio.hide();
        });
    }

    function performResponsiveJavascript() {

        var width;
        width = $(window).width();

        if (width > 1024) {
            // larger than tablets
            setupDesktopAccordionClientListEvents();
        }
        else if (width <= 1024) {
            // tablet landscape and below
            setupMobileAccordionClientListEvents();
        }
    }

    function setupTheiFrameLoadingEvent() {
        $('#accordionClientList').on('show', function () {

            $('iframe').load(function () {

                $(this).siblings('.portfolio-loading').first().hide();
                $(this).show();

            });
        });

    }

    function setPowerPointiframeDimensions() {

        // aspect ratio width="402" height="327" comes from the original PowerPoint embed code
        $('.power-point-modal').on('show', function () {

            var iframe, width, height, aspect;

            aspect = 327 / 402;

            width = $(this).width() * 0.90;
            height = width * aspect;

            iframe = $(this).find('iframe');
            iframe.width(width);
            iframe.height(height);

        });

    }

    function killEntrustMarkettingLink() {
        var bigFontCertificateLink = $('aside#entrust-seal > div > div:nth-child(1) > a');
        var entrustMarketingLink = $('aside#entrust-seal > div > div:nth-child(2) > a');
        entrustMarketingLink.prop('href', bigFontCertificateLink.prop('href'));
    }

    function switchWebsiteTitleVersion() {
        var cookieName, cookie, websiteTitle;
        // get the cookie
        cookieName = 'bigfont_ab';
        cookie = $.cookie(cookieName);
        // get the website title div
        websiteTitle = $('div.website-title');
        // switch on the current cookie value       
        if (cookie === null || cookie === 'a') {
            // the current page has (or will have) the default website version
            websiteTitle.removeClass('b');
            // so set a cookie to indicate that next time we want version 'b'
            $.cookie(cookieName, 'b');
        }
        else if (cookie === 'b') {
            // the current page has (or will have) the 'b' website version
            websiteTitle.addClass('b');
            // so set a cookie to indicate that next time we want version 'a'                        
            $.cookie(cookieName, 'a');

        }
    }

    function yourBrowserSucks() {
        var mq, upgrade, message, alert;

        mq = window.Modernizr.mq('only all'); // true if media queries are supported, false if not

        if (mq === false) {
            
            message = 
                "Yikes, your web browser is not supported. Why not upgrade?<br/>" +
                "1. Visit <a href='http://www.browsehappy.com'>BrowseHappy.com</a>.<br/>" +
                "2. Then return to bigfont.ca after you upgrade.<br/>" +
                "Need help? Contact us at 250-538-2337 for more assitance." + 
                "<a href='#' class='close' data-dismiss='alert'>&times;</a>";

            alert = $("<div class='container'><div class='row'><div class='span12 alert'>" + message + "</div></div></div>");

            $(".website-title").before(alert);

        }
    }

    $(document).ready(function () {

        yourBrowserSucks();

        setupTheAnchorElementNonLinkBehavior();

        setupTheCollapsingContactForm();

        respondToQueryStringActionParameter();

        setupNavigationClickHandler();

        initializeTooltips();

        performResponsiveJavascript();

        setupTheiFrameLoadingEvent();

        setPowerPointiframeDimensions();

        killEntrustMarkettingLink();

        switchWebsiteTitleVersion();

    });

}());