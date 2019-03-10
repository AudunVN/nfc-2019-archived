_error_occured = 'Error occured while loading the statistics!';

_data = {
    GetCountryData: {
        title: 'Top countries',
        piename: 'Country share',
        minimum_pct: 4,
        maxItems : 10,
        data : []
    },
    GetAttendingTypeData: {
        title: 'Ticket types',
        piename: 'Ticket share',
        minimum_pct: 0,
        maxItems: 10,
        data: []
    },
    GetRegistrationStatusData: {
        title: 'Booking statuses',
        piename: 'Booking share',
        minimum_pct: 0,
        maxItems: 10,
        data: []
    },
    GetGenderData: {
        title: 'Gender distribution',
        piename: 'Gender',
        minimum_pct: 0,
        maxItems: 10,
        data: []
    },
    GetSpeciesData: {
        title: 'Top species',
        piename: 'Species top',
        minimum_pct: 0,
        maxItems: 7,
        data: []
    },
    GetSpeciesCategoryData: {
        title: 'Top species categories',
        piename: 'Species categories top',
        minimum_pct: 0,
        maxItems: 5,
        data: []
    }
};

$(document).ready(function () {
    if (!_show_statistics) {
        $('#hideStatistics').show();
        $('#displayStatistics').hide();
        return;
    }
    $('#status').show();
    initData();    
});

function initData() {
    $.getJSON(_attendees_statistics_data_url)
    .done(function (data) {
        if (data.Status == 1) {
            $.each(data.Data, function (index, item) {
                if (typeof item !== "object") return;
                if (index == 'GetCountryData') {
                    other = ['Other countries'];
                } else if (index == 'GetSpeciesCategoryData') {
                    other = ['Remaining species categories'];
                } else {
                    other = ['Other'];
                }
                pct_other = 0;
                pct_sum = 0;
                $.each(item, function (subindex, subitem) {
                    if (index == 'GetSpeciesCategoryData' || index == 'GetSpeciesData') {
                        pct = subitem.NumberOfBookings / data.Data.TotalNumberOfBookingsWithSpecies * 100;
                    } else if (index == 'GetGenderData') {
                        pct = subitem.NumberOfBookings / data.Data.TotalNumberOfBookingsWithGenderSpecified * 100;
                    } else if (index == 'GetRegistrationStatusData') {
                        var regData = data.Data.GetRegistrationStatusData;
                        var totalApprovedAndUnapprovedBookings = 0;
                        for (i = 0; i < regData.length; i++) {
                            totalApprovedAndUnapprovedBookings += regData[i].NumberOfBookings;
                        }
                        pct = subitem.NumberOfBookings / totalApprovedAndUnapprovedBookings * 100;
                    } else {
                        pct = subitem.NumberOfBookings / data.Data.TotalNumberOfBookings * 100;
                    }
                    if (pct >= _data[index].minimum_pct) {
                        if (_data[index].data.length < _data[index].maxItems) {
                            _data[index].data.push([subitem.Name, pct]);
                            pct_sum += pct;
                        }
                    }
                    else {
                        pct_other += pct;
                    }                    
                });
                if (pct_other + pct_sum < 98) {
                    pct_other = 100 - pct_sum;
                }
                if (pct_other > 0) {
                    other.push(pct_other);
                    _data[index].data.push(other);
                }

            });
            //countries listing
            totalNumberOfBookings = 0;
            $.each(data.Data.GetCountryData, function (index, item) {
                if (item.CustomData == "YU") {
                    addCountry(index + 1, "RS", "Serbia", item.NumberOfBookings);
                } else {
                    addCountry(index + 1, item.CustomData, item.Name, item.NumberOfBookings);
                }
                totalNumberOfBookings += item.NumberOfBookings;
            });
            
            $.each(data.Data.GetSpeciesData, function (index, item) {
                addSpecies(index + 1, item.Name, item.NumberOfBookings);
            });

            $.each(data.Data.GetSpeciesCategoryData, function (index, item) {
                addSpeciesCategories(index + 1, item.Name, item.NumberOfBookings);
            });

            // adding total
            // $('#totalNumberOfAttendees').text(totalNumberOfAttendees);
            // $('#totalNumberOfBookings').text(totalNumberOfBookings);
            $('#countries-list').show();
            $('#species-list').show();
            $('#species-category-list').show();
            $('#status').hide();
            $('#displayStatisticsPanel').show();
            //has to be here, or the charts will try to init before _data has been filled
            initCharts();
        } else {
            showDialog(_error_occured, '001');
            $('#status').hide();
        }
    })
    .fail(function () {
        showDialog(_error_occured, '002');
            $('#status').hide();
    });
}

function initCharts() {
    var showLegend = false;
    var type = "outlabeledPie";
    var padding = 20;
    var plugins = {
        legend: false,
        outlabels: {
            text: '%l %v%',
            color: '#333',
            backgroundColor: '#FEFEFE',
            borderWidth: 2,
            lineWidth: 2,
            stretch: 45,
            borderRadius: 5,
            font: {
                resizable: true,
                minSize: 12,
                maxSize: 18
            }
        }
    };
    if ($(window).width() < 600) {
        showLegend = true;
        type = "pie";
        plugins = {
            outlabels: {
                display: false,
            }
        };
        padding = 0;
    }
    $.each(_data, function (index, item) {
        $('#' + index).append("<canvas></canvas>");
        $('#' + index).before("<h4 class='canvas-title text-center'>" + item.title + "</h4>");
        $('#' + index).css("min-height", "30em");
        var context = $('#' + index + ' canvas');
        var datasets = [];
        var labels = [];
        var options = {
            maintainAspectRatio: false,
            responsive: true,
            animationEnabled: true,
            legend: {
                display: showLegend,
                position: 'bottom',
                labels: {
                    fontColor: '#333',
                    boxWidth: 12
                }
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';

                        if (label) {
                            label += ': ';
                        }
                        label += Math.round(data.datasets[0].data[tooltipItem.index] * 100) / 100;
                        return label+"%";
                    }
                }
            },
            title: {
                display: false
            },
            layout: {
                padding: {
                    top: padding,
                    bottom: padding
                }
            },
            plugins: plugins
        };
        item.data.forEach(function(e) {
            labels.push(e[0]);
            datasets.push(e[1]);
        });
        var data = {
            datasets: [{
                data: datasets,
                borderWidth: 4,
                hoverBorderWidth: 1,
                backgroundColor: [
                    "#064650",
                    "#006CDB",
                    "#910000",
                    "#B6DBFF",
                    "#924900",
                    "#6DB6FE",
                    "#FFB5DA",
                    "#009191",
                    "#DB6D00",
                    "#24E623"
                ]
            }],
            labels: labels
        };
        var chart = new Chart(context, {
            type: type,
            data: data,
            options: options
        });
    });
}

function addCountry(number, CountryCode, CountryName, pct) {
    row = $('#row-tpl > section').clone();
    row.find('.line-number').html(number);
    
    row.find('.country').html(country_image);
    row.find('.nickname').html(CountryName);

    var outputData = '<tr>';
    outputData += '<td>#' + number + '</td>';
    var country_flag_url = _flags_dir + CountryCode.toLowerCase() + '.svg';
    var country_image = '<img title="' + CountryName + '" class="attendee-flag flag" src=' + country_flag_url + '>';
    outputData += '<td class="flag-cell">' + country_image + '</td>';
    outputData += '<td>' + CountryName + '</td>';
    var attendeeCount = '';
    if (pct > 1)
        attendeeCount = pct + ' attendees';
    else
        attendeeCount = '1 attendee';
    outputData += '<td>'+attendeeCount+'</td>';
    outputData += '</tr>';

    $('#countries-list').append(outputData);
}

function addSpecies(number, name, pct) {    
    var outputData = '<tr>';
    outputData += '<td style="width: 40px;">' + pct + '</td>';
    outputData += '<td>' + name + '</td>';
    outputData += '</tr>';

    $('#species-list').append(outputData);
}

function addSpeciesCategories(number, name, pct) {
    var outputData = '<tr>';
    outputData += '<td style="width: 40px;">' + pct + '</td>';
    outputData += '<td>' + name + '</td>';
    outputData += '</tr>';

    $('#species-category-list').append(outputData);
}