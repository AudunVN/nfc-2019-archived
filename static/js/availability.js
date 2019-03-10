$(document).ready(function () {
    fillAccomodations();
});

function fillAccomodations() {

    $('#availabilityStatus').show();
    $.getJSON(_availability_url)
    .done(function (data) {        
        if (data.Status == 1) {
            
            var output = '<h2>Accommodation</h2>';
            output += '<h3>Main Convention Days</h3>';
            output += '<table class="table"><thead><tr>';
            output += '<th>Room Type</th>';
            output += '<th>Slots Available</th>';
            output += '</tr></thead><tbody class="standard">';

            $.each(data.Data.Rooms, function (key, item) {
                output += addAccomodation(item.Name, item.SlotsLeft);
            });

            output += '</tbody></table>';


            output += '<h3>Early Arrival</h3>';
            output += '<table class="table"><thead><tr>';
            output += '<th>Room Type</th>';
            output += '<th>Slots Available</th>';
            output += '</tr></thead><tbody class="standard">';

            $.each(data.Data.RoomsEarly, function (key, item) {
                output += addExtraRoom(item.Name, item.SlotsLeft);
            });

            output += '</tbody></table>';


            output += '<h3>Late Departure</h3>';
            output += '<table class="table"><thead><tr>';
            output += '<th>Room Type</th>';
            output += '<th>Slots Available</th>';
            output += '</tr></thead><tbody class="standard">';

            $.each(data.Data.RoomsLate, function (key, item) {
                output += addExtraRoom(item.Name, item.SlotsLeft);
            });

            output += '</tbody></table>';

            $('#availabilityData').append(output);


            output = '<h2 style="margin-top: 25px;">Fuzz Bus</h2>';
            output += '<table class="table"><thead><tr>';
            output += '<th>Bus</th>';
            output += '<th>Slots Available</th>';
            output += '</tr></thead><tbody class="standard">';

            $.each(data.Data.Buses, function (key, item) {
                output += addBus(item.Name, item.SlotsLeft);
            });

            output += '</tbody></table>';

            $('#availabilityData').append(output);


            output = '<h2 style="margin-top: 25px;">Add Ons</h2>';
            output += '<table class="table"><thead><tr>';
            output += '<th>Ticket</th>';
            output += '<th>Slots available</th>';
            output += '</tr></thead><tbody class="standard">';

            $.each(data.Data.AddOns, function (key, item) {
                output += addAddOnItem(item.Name, item.SlotsLeft);
            });

            output += '</tbody></table>';

            $('#availabilityData').append(output);
        }
        else {
            $('#accomodationSlots').html('');
        }
        $('#availabilityStatus').hide();
    })
    .fail(function () { $('#accomodationSlots').html(''); $('#availabilityStatus').hide(); });
}

function addAccomodation(accomodationLabel, amount) {
    var output = '<tr>';

    output += '<th>' + accomodationLabel + '</th>';
    if (amount <= 0) {
        output += '<td><span class="label label-danger">Sold out (waiting list)</span></td>';
    } else if (amount < 10) {
        output += '<td><span class="label label-warning">' + amount + '</span></td>';
    } else {
        output += '<td>' + amount + '</td>';
    }    
    output += '</tr>';

    return output;
}

function addExtraRoom(roomName, amount) {
    var output = '<tr>';
    output += '<th>' + roomName + '</th>';
    if (amount <= 0) {
        output += '<td><span class="label label-danger">Sold out</span></td>';
    } else if (amount < 10) {
        output += '<td><span class="label label-warning">' + amount + '</span></td>';
    } else {
        output += '<td>' + amount + '</td>';
    }
    output += '</tr>';

    return output;
}

function addBus(bus, amount) {
    var output = '<tr>';
    output += '<th>' + bus + '</th>';
    if (amount <= 0) {
        output += '<td><span class="label label-danger">Sold out</span></td>';
    } else if (amount < 10) {
        output += '<td><span class="label label-warning">' + amount + '</span></td>';
    } else {
        output += '<td>' + amount + '</td>';
    }
    output += '</tr>';

    return output;
}

function addAddOnItem(name, amount) {
    var output = '<tr>';
    output += '<th>' + name + '</th>';
    if (amount <= 0) {
        output += '<td><span class="label label-danger">Sold out</span></td>';
    } else if (amount < 10) {
        output += '<td><span class="label label-warning">' + amount + '</span></td>';
    } else {
        output += '<td>' + amount + '</td>';
    }
    output += '</tr>';

    return output;
}