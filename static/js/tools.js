//showing a dialog
function showDialog(title, content, isModal, close) {
    if ($('.modal').is(':visible')) {
        $(".modal").one("hidden.bs.modal", function () {
            doShowDialog(title, content, isModal, close);
        });
        $('.modal').modal('hide');
    } else {
        doShowDialog(title, content, isModal, close);
    }
}

function doShowDialog(title, content, isModal, close) {
    if (title && content) {
        $("#showdialog-modal").remove();
        $('.modal').modal('hide');
        var modal_html = '<div class="modal fade" id="showdialog-modal" tabindex="-1" role="dialog" aria-labelledby="showdialog-modal-label">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="showdialog-modal-label">' + title + '</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            content +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary" id="confirm-btn" data-dismiss="modal">Close</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $("body").append(modal_html);
        $('#showdialog-modal').modal();
    }
}

/**
 *  shows a confirm dialog with yes and cancel buttons, and executes a function with provided params
 *  
 *  @param title - the title of the popup
 *  @param content the content of the popup (typically, the message it wil display)
 *  @param isModal - self explanatory
 *  @param dcallback (optional) - the function we're going to execute after clicking a button
 *  @param dcallback_args - a json object with the keys being the name the button, and as the value, a json object with the argument names as the keys 
 *                               This means the dialog_callback function must expect a json object for use as arguments. This is not mandatory.
 */
function showConfirmYesNo(title, content, isModal, dcallback, dcallback_args) {
    if ($('.modal').is(':visible')) {
        $(".modal").one("hidden.bs.modal", function () {
            doShowConfirmYesNo(title, content, isModal, dcallback, dcallback_args);
        });
        $('.modal').modal('hide');
    } else {
        doShowConfirmYesNo(title, content, isModal, dcallback, dcallback_args);
    }
}

function doShowConfirmYesNo(title, content, isModal, dcallback, dcallback_args) {
    if (title && content) {
        $("#yesno-modal").remove();
        $('.modal').modal('hide');
        var modal_html = '<div class="modal fade" id="yesno-modal" tabindex="-1" role="dialog" aria-labelledby="yesno-modal-label">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="yesno-modal-label">' + title + '</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            content +
            '</div>' +
            '<div class="modal-footer ignoreViewport">' +
            '<button type="button" class="btn btn-primary" id="confirm-btn">Yes</button>' +
            '<button type="button" class="btn btn-warning" id="cancel-btn">Cancel</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $("body").append(modal_html);
        $("#yesno-modal #confirm-btn").click(function () {
            $('#yesno-modal').modal('hide');
            if (typeof dcallback == 'function') {
                if (dcallback_args && dcallback_args.Yes) {
                    dcallback(dcallback_args.Yes);
                } else {
                    dcallback();
                }
            }
        });
        $("#yesno-modal #cancel-btn").click(function () {
            $('#yesno-modal').modal('hide');
            if (typeof dcallback == 'function') {
                if (dcallback_args && dcallback_args.Cancel) {
                    dcallback(dcallback_args.Cancel);
                } else {
                    dcallback();
                }
            }
        });
        $('#yesno-modal').modal();
    }
}

function displayErrorMsg(msg, code) {
    error = 'Error message missing!';
    if(msg){
        error = msg;
        if(code){
            error = msg + ' Error code: ' + code;
        }
        else{
            error = msg + ' - Error code missing';
        }
    }
    if ($('#status').length > 0) {
        $('#status').html(error);
        $('#status').show();
    }
    else {
        console.error(error);
    }
}

/* used in the room share finder pages, determines whether a room can change its type wish */
function roomTypeCanChangeWish(roomShare) {
    if (roomShare.AccommodationTypeId == 46 || (roomShare.AccommodationName == "Standard Twin, 2 people" && roomshare.AccommodationLocation == "Main Hotel")) {
        return true;
    }
    return false;
}

function getUrlParameter(url, parameter) {
    parameter = parameter.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?|&]' + parameter.toLowerCase() + '=([^&#]*)');
    var results = regex.exec('?' + url.toLowerCase().split('?')[1]);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function setUrlParameter(uri, key, value) {
    // remove the hash part before operating on the uri
    var i = uri.indexOf('#');
    var hash = i === -1 ? ''  : uri.substr(i);
    uri = i === -1 ? uri : uri.substr(0, i);
  
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  
    if (!value) {
      // remove key-value pair if value is empty
      uri = uri.replace(new RegExp("([?&]?)" + key + "=[^&]*", "i"), '');
      if (uri.slice(-1) === '?') {
        uri = uri.slice(0, -1);
      }
      // replace first occurrence of & by ? if no ? is present
      if (uri.indexOf('?') === -1) uri = uri.replace(/&/, '?');
    } else if (uri.match(re)) {
      uri = uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
      uri = uri + separator + key + "=" + value;
    }
    return uri + hash;
  }