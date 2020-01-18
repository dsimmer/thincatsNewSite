var ameuri_modal = {
    message: null,
    divheight: 'auto',
    divwidth: 450,
    containerHeight: 450,
    //containerHeight: 'auto',
    reload: 0,
    init: function (url, callback) {
        //jQuery('#modal-form a.modal').click(function (e) {
        //e.preventDefault();

        // load the modal form using ajax
        jQuery.ajax({
            url: url, success: function (data) {
                // create a modal dialog with the data
                jQuery(data).modal({
                    closeHTML: "<a href='#' title='Close' class='modal-close'>x</a>",
                    position: ["15%",],
                    overlayId: 'modal-overlay',
                    containerId: 'modal-container',
                    onOpen: ameuri_modal.open,
                    onClose: ameuri_modal.close,
                    minWidth: ameuri_modal.divwidth,
                    minHeight: ameuri_modal.containerHeight,
                    escClose: true
                });
                if (typeof callback == 'function') {
                    callback();
                }

            }, global: false
        });
        //});
    },
    open: function (dialog) {
        // add padding to the buttons in firefox/mozilla
        if (jQuery.browser.mozilla) {
            jQuery('#modal-container .modal-button').css({
                'padding-bottom': '2px'
            });
        }
        // input field font size
        if (jQuery.browser.safari) {
            jQuery('#modal-container .modal-input').css({
                'font-size': '.9em'
            });
        }

        // dynamically determine height
        //var h = ameuri_modal.divheight;
        var h = 'auto';

        var title = jQuery('#modal-container .modal-title').html();
        jQuery('#modal-container .modal-title').html('Loading...');
        dialog.overlay.show();
        dialog.container.show();
        dialog.data.show();
        jQuery("#simplemodal-data").show();
        jQuery('#modal-container .modal-content').animate({
            height: h
        }, function () {
            jQuery('#modal-container .modal-title').html(title);
            jQuery('#modal-container form').fadeIn(200, function () {
                jQuery('#modal-container #id_amount').focus();

                jQuery('#modal-container .modal-cc').click(function () {
                    var cc = jQuery('#modal-container #modal-cc');
                    cc.is(':checked') ? cc.attr('checked', '') : cc.attr('checked', 'checked');
                });

                // fix png's for IE 6
                if (jQuery.browser.msie && jQuery.browser.version < 7) {
                    jQuery('#modal-container .modal-button').each(function () {
                        if (jQuery(this).css('backgroundImage').match(/^url[("']+(.*\.png)[)"']+$/i)) {
                            var src = RegExp.$1;
                            jQuery(this).css({
                                backgroundImage: 'none',
                                filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + src + '", sizingMethod="crop")'
                            });
                        }
                    });
                }
            });
        });


    },
    close: function (dialog) {
        jQuery('#modal-container .modal-message').fadeOut();
        jQuery('#modal-container .modal-title').html('Closing...');
        jQuery('#modal-container form').fadeOut(200);
        jQuery('#modal-container .modal-content').animate({
            height: 40
        }, function () {
            dialog.data.fadeOut(200, function () {
                dialog.container.fadeOut(200, function () {
                    dialog.overlay.fadeOut(200, function () {
                        jQuery.modal.close();
                    });
                });
            });
        });
        if (ameuri_modal.reload == 1) {
            jQuery('.loading_overlay').css('display', 'block');
            location.reload();
        }
    },
    error: function (xhr) {
        alert(xhr.statusText);
    },
    validate: function (path) {
        ameuri_modal.message = '';
        if (!jQuery('#modal-container #id_amount').val()) {
            ameuri_modal.message += 'Amount is required!';
        } /*else if (jQuery('#modal-container #id_amount').val() < 5 && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
         ameuri_modal.message += 'Minimum amount is &pound;5!';
         }*/ else if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Please enter a valid number!';
        }

        jQuery('#modal-main-btn').html('<img src="/wp-content/plugins/Ameuri/img/loading.png" height=20>');

        jQuery.ajax({
            type: 'GET',
            url: path + "/Ameuri/check_max_amt.php",
            data: "amount=" + jQuery('#modal-container #id_amount').val(),
            success: function (data) {
                ameuri_modal.message += data.trim();

                if (ameuri_modal.message.length > 0) {
                    if (jQuery('#modal-container .modal-message:visible').length > 0) {
                        var msg = jQuery('#modal-container .modal-message div');
                        msg.fadeOut(200, function () {
                            msg.empty();
                            ameuri_modal.showError();
                            msg.fadeIn(200);
                        });
                    }
                    else {
                        jQuery('#modal-container .modal-message').animate({}, ameuri_modal.showError);
                    }
                    jQuery('#modal-main-btn').html('ADD FUNDS');
                    return false;
                }
                else {
                    //funds
                    jQuery.ajax({
                        type: 'POST',
                        url: path + "/Ameuri/processfunds.php",
                        data: "amount=" + jQuery('#id_amount').val() + "&currency_symbol=" + jQuery('#_currency_symbol').val() + '&_wpnonce=' + jQuery('#_wpnonce').val(),
                        success: function (data) {
                            if (data == -1) {
                                jAlert('Incorrect parameters. Please try again.', 'Information!');
                            } else {
                                jAlert('Thank you, we will look out for your transfer & confirm receipt.', 'Information!', function () {
                                    jQuery.modal.close();
                                });
                            }
                        }
                    });
                    //funds
                }

            }

        });


    },
    validate_address: function (path) {
        ameuri_modal.message = '';
        if (ameuri_modal.message.length > 0) {
            if (jQuery('#modal-container .modal-message:visible').length > 0) {
                var msg = jQuery('#modal-container .modal-message div');
                msg.fadeOut(200, function () {
                    msg.empty();
                    ameuri_modal.showError();
                    msg.fadeIn(200);
                });
            }
            else {
                jQuery('#modal-container .modal-message').animate({
                    height: '20px'
                }, ameuri_modal.showError);
            }

            return false;
        }
        else {
            //address
            jQuery.ajax({
                type: 'POST',
                url: path + "/Ameuri/saveaddress.php",
                data: jQuery('#addressBox input, #addressBox select').serialize(),
                success: function (data) {
                    jAlert('Thank you!', 'Information!', function () {
                        jQuery.modal.close();
                    });
                }
            });
            //address
        }
    },
    validate_withdraw: function (path, amount) {
        ameuri_modal.message = '';

        let frm_amount = parseFloat( jQuery('#id_withdraw_amount').val() ),
            minimum_withdrawal = parseFloat(rbs_options.minimum_withdrawal_amount);

        if (!frm_amount) {
            ameuri_modal.message += 'An amount is required!';
        } else if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(frm_amount)) {
            ameuri_modal.message += 'Please enter a valid number!';
        } else if (frm_amount > amount) {
            ameuri_modal.message += 'You do not have enough funds!';
        } else if( frm_amount < minimum_withdrawal ){
            ameuri_modal.message += 'The minimum withdrawal amount is ' + rbs_options.minimum_withdrawal_amount + '.';
        }

        if (ameuri_modal.message.length > 0) {

            if (jQuery('#modal-container .modal-message:visible').length > 0) {
                var msg = jQuery('#modal-container .modal-message div');
                msg.fadeOut(200, function () {
                    msg.empty();
                    ameuri_modal.showError();
                    msg.fadeIn(200);
                });
            } else {
                jQuery('#modal-container .modal-message').animate({
                    height: '20px'
                }, ameuri_modal.showError);
            }

            return false;

        } else {
            //withdraw
            var bankDetails = '';
            //if(jQuery('#id_sort_code').val() && jQuery('#id_account_number').val()) {
            //	bankDetails = "&sort_code="+jQuery('#id_sort_code').val()+"&account_number="+jQuery('#id_account_number').val();
            //}

            jQuery('button#saveBTN').html('<img src="/wp-content/plugins/Ameuri/img/loading.png" height=20>');

            jQuery.ajax({
                type: 'POST',
                url: path + "/Ameuri/processwithdraw.php",
                // NOTE: This was taken from the live rebuldingsociety.com site
                // data: "amount="+jQuery('#id_amount').val()+bankDetails+"&question1="+jQuery('#_question1').val()+"&question2="+jQuery('#_question2').val()+"&answer1="+jQuery('#_answer1').val()+"&answer2="+jQuery('#_answer2').val()+'&_wpnonce='+jQuery('#_wpnonce').val()+'&ongoing_type='+jQuery('input[name=ongoing_type]:checked').val(),
                data: "amount=" + jQuery('#id_withdraw_amount').val() + "&currency=" + jQuery('#_currency').val() + "&withdraw_option=" + jQuery('[name=withdraw_option]:checked').val(),
                success: function (data) {
                    jQuery('button#saveBTN').html('Withdraw');
                    var message = 'Thank you, we will process your transfer within 2 days.';
                    //Custom message for marketlend
                    var isMarketlend = (path.indexOf("ml.rebsoc.com/wp-content/plugins") > 0 || path.indexOf("marketlend.com.au") > 0 );
                    if (isMarketlend) {
                        message = 'Antimoney laundering polices requires us to ask a few questions (it won\'t take long.) \n Your money should be with you within 24 hours subject to banking processes \n  \n';
                    }
                    
                    jAlert(message, 'Information', function () {
                        jQuery.modal.close();
                        //Custom redirection for marketlend
                        if (isMarketlend) {
                            window.location.replace("https://fs21.formsite.com/Marketlend/withdrawal/index.html");
                        }
                    });

                    //Custom button for marketlend
                    jQuery(function() {
                        if (isMarketlend) {
                            jQuery("#popup_message").css({'font-family': 'Roboto', 'font-size' : '12px'});
                        }
                    });


                    /* if(data == -1) {
                     //jAlert('Incorrect parameters! Please try again.', 'Warning!', function() {
                     //});
                     } else if(data == 0) {
                     jAlert('Incorrectly answered one or more of the security questions!', 'Warning!', function() {
                     });
                     } else if(data == 1) {
                     jAlert('Thank you, we\'ll process your transfer within 2 days.', 'Information!', function() {
                     jQuery.modal.close();
                     });
                     } else if(data == 2) {
                     jAlert('Your account has been locked for security reasons. Please contact us.', 'Warning!', function() {
                     jQuery.ajax({
                     type: 'GET',
                     url: path + "/Ameuri/logout.php",
                     success: function(data) {
                     location.reload();
                     }
                     })
                     jQuery.modal.close();
                     });
                     } */
                }
            });

            return true
        }
    },
    validate_segments: function (path) {
        ameuri_modal.message = '';
        var oldpercent = 0;
        var percentchange = jQuery('#_discount_premium').val();
        var newpercent = oldpercent + percentchange;
        var current_val;
        var current_rate;
        var buyer_rate_error=0;
        var dta = '';
        var a_segments = [];
        var i = 0;

        jQuery('._segments').each(function () {
            if (jQuery(this).is(':checked')) {
                current_val=jQuery(this).val();
                current_rate=parseFloat(jQuery('#modal-container #row-'+current_val+' td.segment-buyers-rate-column').text());
                if(current_rate<5){
                    buyer_rate_error=1;
                }
                a_segments[i++] = current_val;
            }
        });

        if (a_segments.length == 0) {
            ameuri_modal.message += 'Please select loan segment!';
        }
        if(buyer_rate_error==1){
            ameuri_modal.message += 'Microloans with a Buyer Rate of < 5% will not be listed for sale on the secondary marketplace. Please note that, when a loan is in its final 12 months, the premium / discount can have a significant affect on the Buyers Rate of return.  Try using a lower premium (or higher discount) to ensure these microloans can be listed with a Buyer Rate above 5%. Thank you.'
        }
        if (ameuri_modal.message.length > 0) {
            if (jQuery('#modal-container .modal-message:visible').length > 0) {
                var msg = jQuery('#modal-container .modal-message div');
                msg.fadeOut(200, function () {
                    msg.empty();
                    ameuri_modal.showError();
                    msg.fadeIn(200);
                });
            }
            else {
                jQuery('#modal-container .modal-message').animate({
                    height: 'auto'
                }, ameuri_modal.showError);
            }

            return false;
        }
        else {

            var dta = {
                discount_premium: jQuery('#_discount_premium').val(),
                _wpnonce: jQuery('#_wpnonce').val(),
                segments: a_segments.join()
            };
            //console.log(dta);

            var as_user_id = getUrlParameter('as-userID');

            var s_as_user_id = '';
            if (as_user_id) {
                s_as_user_id = '?as-userID='+as_user_id;
            }

            //loan segments
            jQuery.ajax({
                type: 'POST',
                url: path + "/sellloansegment.php"+s_as_user_id,
                data: dta,
                success: function (data) {
                    if (data == -1) {
                        jAlert('Incorrect parameters! Please try again.', 'Warning!', function () {
                        });
                    } else {
                        jAlert('Your loan part has been listed for sale.', 'Information!', function () {
                            jQuery.modal.close();
                        });
                    }
                }
            });
            //loan segments
        }
    },
    validate_kitty: function () {
        ameuri_modal.message = '';
        if (!jQuery('#modal-container #id_amount').val()) {
            ameuri_modal.message += 'Amount is required!';
        } else if (jQuery('#modal-container #id_amount').val() < 2 && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Minimum amount is &pound;2!';
        } else if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Please enter a valid number!';
        }

        if (ameuri_modal.message.length > 0) {
            if (jQuery('#modal-container .modal-message:visible').length > 0) {
                var msg = jQuery('#modal-container .modal-message div');
                msg.fadeOut(200, function () {
                    msg.empty();
                    ameuri_modal.showError();
                    msg.fadeIn(200);
                });
            }
            else {
                jQuery('#modal-container .modal-message').animate({
                    height: '20px'
                }, ameuri_modal.showError);
            }

            return false;
        }
        else {
            var msg = jQuery('#modal-container .modal-message');
            msg.fadeOut(function () {
                msg.removeClass('modal-error').empty();
            });
            return true;
        }
    },
    validate_withdraw_: function (path) {
        ameuri_modal.message = '';

        if (!jQuery('#modal-container #id_amount').val()) {
            ameuri_modal.message += 'Amount is required!<br />';
        } else if (jQuery('#modal-container #id_amount').val() <= 0 && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Please enter amount bigger than zero!<br />';
        } else if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Please enter a valid number!<br />';
        }

        if (ameuri_modal.message.length > 0) {
            if (jQuery('#modal-container .modal-message:visible').length > 0) {
                var msg = jQuery('#modal-container .modal-message div');
                msg.fadeOut(200, function () {
                    msg.empty();
                    ameuri_modal.showError();
                    msg.fadeIn(200);
                });
            }
            else {
                jQuery('#modal-container .modal-message').animate({
                    height: '20px'
                }, ameuri_modal.showError);
            }

            return false;
        }
        else {
            var msg = jQuery('#modal-container .modal-message');
            msg.fadeOut(function () {
                msg.removeClass('modal-error').empty();
            });

            //made automated payment
            jQuery.ajax({
                type: 'POST',
                url: path + "/processwithdraw.php",
                data: "email=" + jQuery('#email').val() + "&password=" + jQuery('#password').val() + "&amount=" + jQuery('#id_amount').val() + "&currency=" + jQuery('#currency').val() + "&bnf_email=" + jQuery('#bnf_email').val() + "&subject=" + jQuery('#subject').val() + "&note=" + jQuery('#note').val(),
                success: function (data) {
                    jQuery('#saveBTN').css('display', 'none');
                    jQuery('#innerContent').html(data);
                }
            });
            //made automated payment

            return true;
        }
    },
    validate_questions: function (path) {
        ameuri_modal.message = '';

        if (!jQuery('#modal-container #id_amount').val()) {
            ameuri_modal.message += 'Amount is required!<br />';
        } else if (jQuery('#modal-container #id_amount').val() <= 0 && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Please enter amount bigger than zero!<br />';
        } else if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(jQuery('#modal-container #id_amount').val())) {
            ameuri_modal.message += 'Please enter a valid number!<br />';
        }

        if (ameuri_modal.message.length > 0) {
            if (jQuery('#modal-container .modal-message:visible').length > 0) {
                var msg = jQuery('#modal-container .modal-message div');
                msg.fadeOut(200, function () {
                    msg.empty();
                    ameuri_modal.showError();
                    msg.fadeIn(200);
                });
            }
            else {
                jQuery('#modal-container .modal-message').animate({
                    height: '20px'
                }, ameuri_modal.showError);
            }

            return false;
        }
        else {
            var msg = jQuery('#modal-container .modal-message');
            msg.fadeOut(function () {
                msg.removeClass('modal-error').empty();
            });

            //made automated payment
            jQuery.ajax({
                type: 'POST',
                url: path + "/processwithdraw.php",
                data: "email=" + jQuery('#email').val() + "&password=" + jQuery('#password').val() + "&amount=" + jQuery('#id_amount').val() + "&currency=" + jQuery('#currency').val() + "&bnf_email=" + jQuery('#bnf_email').val() + "&subject=" + jQuery('#subject').val() + "&note=" + jQuery('#note').val(),
                success: function (data) {
                    jQuery('#saveBTN').css('display', 'none');
                    jQuery('#innerContent').html(data);
                }
            });
            //made automated payment

            return true;
        }
    },
    showError: function () {
        jQuery('#modal-container .modal-message')
            .html(jQuery('<div class="modal-error"></div>').append(ameuri_modal.message))
            .fadeIn(200);
    }
};


function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
