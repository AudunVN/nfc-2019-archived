// Ignore show avatars for attendees
_ignore_avatars_attending_type_id = 1;

//filters variables
var _filter_country_id = '0';
var _filter_attending_type_id = '0';
var _filter_only_fursuiters = false;

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
            value: '1',
            icon: '<i class="icon-up-open-big"></i>'
        },
    },
    by: {
        nickname:       '0',
        country:        '1',
        attending_type: '2',
        default:        '2'
    }
};

_orderby = _order.by.default;
_orderby_direction = _order.direction.default.value;

//totals var
_attending_type_count = {};

_badge_types = [];

$(document).ready(function () {

    if (!_show_statistics) {
        $('#hideStatistics').show();
        $('#displayStatistics').hide();
        return;
    }

    $('#status').show();
    $.ajax({
        dataType: "json",
        url: _attendees_base_data_url,        
        success: function(data) {
            if (data.Status == 1) {
                var options = $("#AttendingTypes");
                options.append($("<option />").val(0).text('Everyone'));
                $.each(data.Data.BadgeList, function () {
                    options.append($("<option />").val(this.Id).text(this.Name));
                    var badge = {
                        Id: this.Id,
                        Name: this.Name,
                        SortOrder: this.SortOrder
                    };
                    _badge_types[this.Id] = badge;
                });

                // Init
                fillAttendeeData();
            }
        }
    });

    $('#CountryId').change(function () {
        _filter_country_id = $('#CountryId').val();
        fillAttendeeData();
    });

    $('#AttendingTypes').change(function () {        
        _filter_attending_type_id = $('#AttendingTypes').val();
        fillAttendeeData();
    });
});

function sortData(a, b) {
    if (a.SortOrder < b.SortOrder)
        return 1;
    if (a.SortOrder > b.SortOrder)
        return -1;
    return 0;
}

function hideCountriesWithoutAttendees(data) {
    $.each(data.Data.GetAttendees, function () {
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

function fillAttendeeData() {
    
    $('#status').show();

    var queryObject = {
        'CountryId': _filter_country_id,
        'AttendingTypeId': _filter_attending_type_id,
        'IsFursuiter': _filter_only_fursuiters,
        'OrderBy': _orderby,
        'OrderByDirection': _orderby_direction
    };

    $.ajax({
        dataType: "json",
        url: _attendees_data_url,
        data: queryObject,
        success: function (data) {
            if (data.Status == 1) {
                hideCountriesWithoutAttendees(data);
                var badgeCount = [];

                //for (key in _badge_types) {
                for (key in _badge_types) {
                    var total = 0;
                    $.each(data.Data.GetAttendees, function () {
                        if (this.BadgeTypeId == key)
                            total++;                        
                    });

                    var badge = {
                        Id: _badge_types[key].Id,
                        Count: total,
                        SortOrder: _badge_types[key].SortOrder
                    };
                    badgeCount.push(badge);
                }                

                sortAndDisplayAttendees(badgeCount, data.Data);                
            }            
        }
    });
}

function sortAndDisplayAttendees(badgeData, data) {
    $('#attendeeDataList').html('');
    badgeData.sort(sortData);
    $.each(badgeData, function () {
        if (this.Count > 0) {
            if (_ignore_avatars_attending_type_id == _badge_types[this.Id].Id) {
                createTable(_badge_types[this.Id], data);
            } else {
                createPanels(_badge_types[this.Id], data);
            }
        }
    });
    $('#listCount').text(data.GetAttendees.length);
    $('#status').hide();
}

function createTable(badge, data) {
    var country_flag_url;
    var newHeadline = document.createElement('h3');
    $(newHeadline).text(badge.Name).addClass('attendeeList__heading');

    var outputData = '<table class="table table-striped"><tbody>';

    $.each(data.GetAttendees, function () {
        if (this.BadgeTypeId == badge.Id) {
            country_flag_url = _flags_dir + this.CountryCode.toLowerCase() + '.svg';
            var isFursuiter = '';
            if (this.IsFursuiter) {
                isFursuiter = 'Fursuiter';
            }
            outputData += '<tr><td class="flag-cell"><img class="attendee-flag flag" title="' + this.CountryName + '" src="' + country_flag_url + '"></td><td class="nickname-cell">' + this.NickName + '</td><td class="fursuiter-cell">' + isFursuiter + '</td></tr>';
        }
    });

    outputData += '</tbody></table>';

    $('#attendeeDataList').append(newHeadline);
    $('#attendeeDataList').append(outputData);
}

function createPanels(badge, data) {
    var country_flag_url;

    var newHeadline = document.createElement('h3');
    $(newHeadline).text(badge.Name).addClass('attendeeList__heading');

    var outputData = '';

    $.each(data.GetAttendees, function () {
        if (this.BadgeTypeId == badge.Id) {
            country_flag_url = _flags_dir + this.CountryCode.toLowerCase() + '.svg';

            outputData += '<div class="attendee-container well"><div class="row">';

            if (this.ImagePath != null) {
                outputData += '<div class="attendee-img col-sm-4"><img src="' + this.ImagePath + '"></div>';
            } else {
                outputData += '<div class="attendee-img col-sm-4"><img src="/static/images/default-av.png"></div>';
            }

            var isFursuiter = '';
            if (this.IsFursuiter) {
                isFursuiter = 'Fursuiter';
            }
            outputData += '<div class="attendee-details col-sm-8"><span class="attendee-name">' + this.NickName + '</span><br><span class="attendee-is-fursuiter">' + isFursuiter + '</span><br>';
            outputData += '<img  class="attendee-flag flag" title="' + this.CountryName + '" src="' + country_flag_url + '"></div>';

            outputData += '</div></div>';
        }
    });

    outputData += '';

    $('#attendeeDataList').append(newHeadline);
    $('#attendeeDataList').append(outputData);
}
