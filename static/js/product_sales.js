function loadSalesContainer() {
    var product_name = "addon";
    var filter_string = "";

    if ($(".purchase-container").data("product")) {
        product_name = $(".purchase-container").data("product");
    }

    if ($(".purchase-container").data("filter")) {
        filter_string = $(".purchase-container").data("filter")
    }
    
    var panel_html = '' +
        '<div class="panel-heading">' +
            '<h3 class="panel-title">Buy ' + product_name + '</h3>' +
        '</div>' +
        '<div class="panel-body">' +
            '<p>Loading available ' + product_name + 's...</p>' + 
        '</div>';

    if (!reg_open) {
        panel_html = '' +
        '<div class="panel-heading">' +
            '<h3 class="panel-title">Buy ' + product_name + '</h3>' +
        '</div>' +
        '<div class="panel-body">' +
            '<p>Registration is closed, you cannot make changes or add anything to your booking right now.</p>' + 
        '</div>';
    }

    if (!is_logged_in) {
        if (!login_and_return_url) {
            /* not very relevant; you usually can't be logged out on the pages where this variable isn't available. */
            login_and_return_url = "https://portal.nordicfuzzcon.org/";
        }

        panel_html = '' +
        '<div class="panel-heading">' +
            '<h3 class="panel-title">Buy ' + product_name + '</h3>' +
        '</div>' +
        '<div class="panel-body">' +
            '<p>Please <a href="' + login_and_return_url + '">log in</a> if you wish to do this.</p>' + 
        '</div>';
    }

    $(".purchase-container").html(panel_html);

    if (!reg_open || !is_logged_in) {
        return;
    }

    $.ajax({
        type: "GET",
        url: "/Account/GetProductsForSale",
        fail: function () { renderSalesContainerContents(false) },
        success: function (data) {
            if (data.Status == "0") {
                $(".purchase-container .panel-body").html(renderSalesContainerContents(false, product_name));
            } else {
                // successfully loaded products!

                var products = data.Data;

                var filterEnabled = false;
                
                if (filter_string != "") {
                    filterEnabled = true;
                    products = products.filter(function (product) {
                        return (product.Name.toLowerCase().indexOf(filter_string.toLowerCase()) != -1);
                    });
                }

                $(".purchase-container .panel-body").html(renderSalesContainerContents(true, product_name, products, filterEnabled));

                // bind event handlers
                $('#product-select').on('change', function () {
                    if (this.value != "-1") {
                        var option = $("option:selected", this);
                        $("#product-description").removeClass("hidden");
                        $("#product-description").html(option.data("details"));
                        $("#purchase-btn").removeAttr("disabled");
                    } else {
                        $("#product-description").addClass("hidden");
                        $("#purchase-btn").attr("disabled", "disabled");
                    }
                });

                $("#purchase-btn").click(function (e) {
                    e.preventDefault();
                    confirmBuyProduct();
                });
            }
        }
    });
}

function confirmBuyProduct() {
    var option = $("option:selected", "#product-select");
    callbackFunctionArguments = { Yes: { confirmed: true }, Cancel: { confirmed: false } };
    showConfirmYesNo('Confirm product purchase', '<p><b>Please read through the product description below.</b></p><p>' + option.data("details") + '</p><p>Are you sure you wish to buy this product?</p>', true, buyProduct, callbackFunctionArguments);
}

function buyProduct(args) {
    if (args && args.confirmed) {
        $("#purchase-btn").attr("disabled", "disabled");
        var productId = parseInt($("#product-select option:selected").val());
        $.ajax({
            type: "POST",
            data: {
                productId: productId
            },
            url: "/Account/BuyProduct",
            success: function (response) {
                if (response.Status == 1) {
                    var dialogBody = '<p><strong>Product added!</strong> You can head to your <a id="booking-details-link" href="/Account/MyBooking#attending">booking details</a> page to see it, if you wish.</p>' +
                        '<p><a id="pay-purchase-now-btn" class="btn btn-info" href="/Account/MyBooking#payments"><i class="fa fa-credit-card" aria-hidden="true"></i> Pay Now</a></p>';

                    showDialog("Product purchased", dialogBody);

                    $("#pay-purchase-now-btn").click(function () {
                        var payment_base_url = document.querySelector("#pay-purchase-now-btn").href.split("#")[0];
                        if (window.location.href.indexOf(payment_base_url) != -1) {
                            $("#showdialog-modal").modal("hide");
                        }
                    });
                    $("#booking-details-link").click(function () {
                        var booking_base_url = document.querySelector("#booking-details-link").href.split("#")[0];
                        if (window.location.href.indexOf(booking_base_url) != -1) {
                            $("#showdialog-modal").modal("hide");
                        }
                    });

                    $("#showdialog-modal").on("hidden.bs.modal", function () { location.reload(); });
                } else {
                    var dialogBody = "<strong>Couldn\'t add product!</strong> <span id='no-add-reason'>An unknown error occurred while adding your product, please contact registration@nordicfuzzcon.org.</span>";
                    if (response.ErrorMessage && response.ErrorMessage.length != 0) {
                        dialogBody = "<p><strong>Couldn\'t add product!</strong> <span id='no-add-reason'>An error occurred while adding your product: " + response.ErrorMessage + "</span>";
                    }
                    showDialog("Could not add product", dialogBody);
                }
                $("#purchase-btn").removeAttr("disabled");
            },
            error: function (response) {
                var dialogBody = "<strong>Couldn\'t add product!</strong> <span id='no-add-reason'>An unknown error occurred while adding your product, please contact registration@nordicfuzzcon.org.</span>";
                if (response.ErrorMessage && response.ErrorMessage.length != 0) {
                    dialogBody = "<p><strong>Couldn\'t add product!</strong> <span id='no-add-reason'>An error occurred while adding your product: " + response.ErrorMessage + "</span>";
                }
                showDialog("Could not add product", dialogBody);
                $("#purchase-btn").removeAttr("disabled");
            }
        });
    }
}

function renderSalesContainerContents(ableToLoadProducts, productName, products, showNameInList) {
    var options_string = '<option selected value="-1" data-price="0">Please choose ' + productName + '...</option>';

    if (products.length < 1) {
        options_string = '<option selected value="-1" data-price="0">There are no ' + productName + 's for sale right now.</option>';
    }

    for (var i = 0; i < products.length; i++) {
        var is_disabled_string = "";
        if (products[i].ItemsLeftInStock < 1) {
            is_disabled_string = "disabled";
        }
        var productCountString = "";
        if (showNameInList) {
            productCountString = productName + '(s) ';
        }
        options_string += '<option ' + is_disabled_string + ' value="' + products[i].ProductId + '" data-details="' + products[i].Details + '" data-stock="' + products[i].ItemsLeftInStock + '" data-price="' + products[i].Price + '">' + products[i].Name + ' - ' + products[i].Price + ' SEK, ' + products[i].ItemsLeftInStock + ' ' + productCountString + 'left</option>';
    }

    var sales_content = '' +
            '<form class="purchase-form">' +
                '<div class="row">' +
                    '<div class="col-md-8">' +
                        '<div class="form-group">' +
                            '<label for="product-select" class="control-label">Product</label>' +
                            '<select id="product-select" class="form-control">' +
                                options_string +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-4">' +
                        '<div class="form-group">' +
                            '<label aria-hidden="true" class="control-label">&nbsp;</label>' +
                            '<button class="btn btn-success btn-block" id="purchase-btn" disabled="disabled">Buy now</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</form>' +
            '<div class="well hidden" id="product-description">' +
                'Product description unavailable' +
			'</div>';
    return sales_content;
}

$(document).ready(function () {
    if (document.querySelector(".purchase-container")) {
        loadSalesContainer();
    }
});