//filters variables
var _filter_country_id = '0';

var attending_country_ids = [0];

//sorting
_order = {
    direction: {
        asc:     {
            value: '0',
            icon: '<i class="icon-down-open-big"></i>'
        },
        desc: {
            value: '1',
            icon: '<i class="icon-up-open-big"></i>'
        },
        default: {
            value: '0',
            icon: '<i class="icon-down-open-big"></i>'
        },
    },
    by: {
        fursuitname:    '0',
        country:        '1',
        default:        '0'
    }
};

_orderby = _order.by.default;
_orderby_direction = _order.direction.default.value;

//totals var
_attending_type_count = {};

$(document).ready(function () {

    if (!_show_statistics) {
        $('#hideStatistics').show();
        $('#displayStatistics').hide();
        return;
    }

    $('#status').show();
    
    $('#CountryId').change(function () {
        _filter_country_id = $('#CountryId').val();
        fillFursuitData();
    });

    fillFursuitData();
});

//function sortData(a, b) {
//    if (a.SortOrder < b.SortOrder)
//        return 1;
//    if (a.SortOrder > b.SortOrder)
//        return -1;
//    return 0;
//}

function hideCountriesWithoutAttendees(data) {
    $.each(data.Data.GetFursuits, function () {
        if (attending_country_ids.indexOf(this.CountryId) == -1) {
            attending_country_ids.push(this.CountryId);
        }
    });
    $("select#CountryId option").each(function () {
        var option = $(this);
        if (attending_country_ids.indexOf(parseInt(option.val())) == -1) {
            option.hide();
        }
    });
}

function fillFursuitData() {
    
    $('#status').show();

    var queryObject = {
        'CountryId': _filter_country_id,        
        'OrderBy': _orderby,
        'OrderByDirection': _orderby_direction
    };

    $.ajax({
        dataType: "json",
        url: _fursuit_data_url,
        data: queryObject,
        success: function (data) {
            if (data.Status == 1) {          
                hideCountriesWithoutAttendees(data);
                $('#fursuitDataList').html('');
                //data.Data.sort(sortData);
                var lastHeadline = '';
                var dataToPrint = [];
                var i = -1;

                $.each(data.Data.GetFursuits, function (index, e) {
                    var headline = getHeadline(e);
                    if (lastHeadline == headline) {
                        // Push to existing data
                        dataToPrint[i].Data.push(e);
                    } else {
                        i++;
                        // Push to new data
                        dataToPrint[i] = { Headline: headline, Data: [] };
                        dataToPrint[i].Data.push(e);
                        lastHeadline = headline;                        
                    }
                });

                for (i = 0; i < dataToPrint.length; i++) {
                    var o = dataToPrint[i];
                    createTable(o.Headline, o.Data);
                }

                $('[data-toggle="lightbox"]').click(function (event) {
                    event.preventDefault();
                    $(this).ekkoLightbox({
                        alwaysShowClose: true,
                        loadingMessage: '',
                        onContentLoaded: function () {
                            $(".modal-loader").remove();
                        },
                        onShow: function () {
                            $(this.modal()).append('<div class="enclosed-loader modal-loader"></div>');
                        }
                    });
                });

                $('#listCount').text(data.Data.GetFursuits.length);
                $('#status').hide();
            }            
        }
    });
}
function getHeadline(data) {
    if (_filter_country_id == '0') {
        return data.FursuitNickName.charAt(0);
    } else {
        return data.CountryName;
    }
}

function createTable(headline, data) {
    var country_flag_url;
    var newHeadline = document.createElement('h3');
    $(newHeadline).text(headline).addClass('fursuitList__heading');

    var outputData = '';

    $.each(data, function () {
        var imageNameRegex = /\/(t(?:[^\.]{6,10})\.(?:\w){2,5}\b)/g;
        country_flag_url = _flags_dir + this.CountryCode.toLowerCase() + '.svg';
        var imagePath = "/static/images/default-av.png";
        var bigImagePath = imagePath;

        if (this.ImagePath != null) {
            imagePath = this.ImagePath;
            if (imageNameRegex.test(imagePath)) {
                var imageName = imagePath.match(imageNameRegex)[0];

                bigImagePath = imagePath.slice(0, -imageName.length) + "/" + imageName.substring(2);
            }
        }

        var wearer = '';
        if (this.FursuitWearer != null) {
            wearer = '<br />Wearer: ' + this.FursuitWearer;
        }

        var titleString = "<h4>" + this.FursuitNickName + " <img class='fursuit-flag flag' title='" + this.CountryName + "' src='" + country_flag_url + "'></h4>";

        var footerString = "Species: " + this.FursuitSpecies + wearer;

        outputData += '<a href="' + bigImagePath + '" data-max-width="600" data-max-height="600" data-gallery="fursuit-gallery" data-footer="' + titleString + '<br>' + footerString + '" data-title="Fursuit Details" data-toggle="lightbox" class="fursuit-container well"><div class="row">';

        outputData += '<div class="fursuit-img col-sm-4"><img src="' + imagePath + '"></div>';

        outputData += '<div class="fursuit-details col-sm-8"><span class="fursuit-name">' + this.FursuitNickName + '</span><br><span class="fursuit-species"><span class="species-label">Species: </span>' + this.FursuitSpecies + '</span><br><span class="fursuit-wearer hidden"><span class="wearer-label">Wearer: </span>' + this.FursuitWearer + '</span>';
        outputData += '<img  class="fursuit-flag flag" title="' + this.CountryName + '" src="' + country_flag_url + '"></div>';

        outputData += '</div><i class="fa fa-expand" aria-hidden="true"></i></a>';
    });

    outputData += '';

    $('#fursuitDataList').append(newHeadline);
    $('#fursuitDataList').append(outputData);
}