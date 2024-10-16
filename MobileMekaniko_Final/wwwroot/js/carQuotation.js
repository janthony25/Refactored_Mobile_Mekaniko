$(function () {

    $('#carQuotationModal').on('hidden.bs.modal', function () {
        HideModal();
    });


    // Open Add Quotation Modal
    $(document).on('click', '.btnAddQuotation', function () {
        const carId = $(this).data('car-id');
        console.log('opening add quote modal');
        AddQuotationModal(carId);
    });

    // Add new quotation
    $('#addQuotation').on('click', function () {
        console.log('Adding new quotation');
        AddQuotation();
    });

    // Open Update Quoatation Modal 
    $(document).on('click', '.btnUpdateQuotation', function () {
        const quotationId = $(this).data('quotation-id');
        const action = $(this).data('action');

        console.log(quotationId, action);
        UpdateDeleteQuotationModal(quotationId, action);

    });

    // Update quotation to DB
    $('#updateQuotation').on('click', function () {
        console.log('updating quote..');
        UpdateQuotation();
    });

    // Open Delete Quotation Modal
    $(document).on('click', '.delete-quotation-btn', function () {
        const quotationId = $(this).data('quotation-id');
        const action = $(this).data('action');

        UpdateDeleteQuotationModal(quotationId, action);
    });

    // Delete Quotation from DB
    $('#deleteQuotation').on('click', function () {
        console.log('Trying to delete quotation...');
        DeleteQuotation();
    });

    // View Quotation PDF
    $(document).on('click', '.view-pdf', function () {
        const quotationId = $(this).data('quotation-id');
        ViewPdf(quotationId);
    });

    // Download Quotation PDF
    $(document).on('click', '.download-pdf', function (e) {
        e.preventDefault();

        const quotationId = $(this).data('quotation-id');
        DownloadPdf(quotationId);
    });

    // Send PDF to Email
    $(document).on('click', '.send-quotation-email', function () {
        const quotationId = $(this).data('quotation-id');
        SendQuotationEmail(quotationId);
    });

    $('#addItemButton').on('click', function () {
        var newItem = $(`
        <div class="row quotation-item d-flex justify-content-between align-items-center mb-2">
            <div class="col-4"><input type="text" class="form-control item-name" placeholder="Item Name"></div>
            <div class="col-2"><input type="number" class="form-control item-quantity" placeholder="Quantity"></div>
            <div class="col-3 d-flex">
                <button type="button" class="btn btn-danger remove-item"><i class="bi bi-trash3-fill"></i></button>
            </div>
        </div>
    `);
        $('#quotationItems').append(newItem);
    });

    // Remove Quotation Item functionality
    $(document).on('click', '.remove-item', function () {
        $(this).closest('.quotation-item').remove();
        updateTotals();
    });

  

    // Input event to update totals when labor price, discount, shipping fee, or amount paid changes
    $('#SubTotal, #AmountPaid').on('input', function () {
        updateTotals();
    });


});


// Function to update quotation totals
function updateTotals() {
    // Retrieve manually inputted subtotal
    var subTotal = parseFloat($('#SubTotal').val()) || 0;

    // Calculate 15% GST (TaxAmount) based on the subtotal
    var gst = subTotal * 0.15;

    // Calculate the total amount by adding GST to the subtotal
    var totalAmount = subTotal + gst;

    // Ensure that the total amount is not negative
    if (totalAmount < 0) {
        totalAmount = 0;
    }

    // Update the TaxAmount and TotalAmount fields
    $('#TaxAmount').val(gst.toFixed(2));  // Update the GST field
    $('#TotalAmount').val(totalAmount.toFixed(2));  // Update the total amount field
}



// Add Quotation Modal
function AddQuotationModal(carId) {
    $.ajax({
        url: '/invoice/GetCustomerCarDetails',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        data: {
            id: carId
        },
        success: function (response) {
            $('#carQuotationModal').modal('show');
            $('#carQuotationModalTitle').text('Add Quotation');

            // show add quotation button
            $('#addQuotation').show();

            // show Add item button
            $('#addItemButton').show();

            // Hide update delete button
            $('#updateQuotation').hide();
            $('#deleteQuotation').hide();

            $('#CustomerName').val(response.customerName);
            $('#CarRego').val(response.carRego);
            $('#DateAdded').val('').prop('readonly', false);
            $('#CarId').val(response.carId);


            $('#IssueName').val(response.issueName).prop('readonly', false);
            $('#Notes').val(response.notes).prop('readonly', false);
            $('#ShippingFee').val(response.shippingFee).prop('readonly', false);
            $('#TotalAmount').val(response.totalAmount).prop('readonly', true);
        },
        error: function () {
            alert('An error occurred while fetching customer car details.');
        }
    });
}


// Update/Delete Quotation Modal
function UpdateDeleteQuotationModal(quotationId, action) {
    $.ajax({
        url: '/quotation/GetQuotationDetails',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        data: {
            id: quotationId
        },  
        success: function (response) {
            if (action === 'UpdateQuotation') {
                $('#carQuotationModal').modal('show');
                $('#carQuotationModalTitle').text('Update Quotation');

                $('#CustomerName').val(response.customerName).prop('disabled', true);
                $('#CarRego').val(response.carRego).prop('disabled', true);

                $('#QuotationId').val(response.quotationId).prop('readonly', true);
                $('#IssueName').val(response.issueName).prop('readonly', false);
                $('#Notes').val(response.notes).prop('readonly', false);
                $('#SubTotal').val(response.subTotal).prop('readonly', false);
                $('#TaxAmount').val(response.taxAmount).prop('readonly', true);
                $('#TotalAmount').val(response.totalAmount).prop('readonly', true);

                let dateAdded = response.dateAdded ? response.dateAdded.split('T')[0] : '';
                $('#DateAdded').val(dateAdded).prop('readonly', true);

                // HIde Add item button
                $('#addItemButton').hide();

                // Hide Add and Delete button
                $('#addQuotation').hide();
                $('#deleteQuotation').hide();

                // Shoiw update button 
                $('#updateQuotation').show();


                // clear the existing items
                $('#quotationItems').empty();

                // Populate item list from response
                if (response.quotationItemDto && response.quotationItemDto.length > 0) {
                    // Add headers dynamically before adding items
                    let headers = `
                        <div class="row invoice-item-header d-flex justify-content-between align-items-center mb-2">
                            <div class="col-4"><strong>Item Name</strong></div>
                            <div class="col-2"><strong>Quantity</strong></div>
                        </div>
                    `;
                    $('#quotationItems').append(headers);

                    // Append each item
                    $.each(response.quotationItemDto, function (index, item) {
                        let newItem = $(`
                        <div class="row invoice-item d-flex justify-content-between align-items-center mb-2">
                            <div class="col-4">
                                <input type="text" class="form-control item-name" placeholder="Item Name" value="${item.itemName}" readonly>
                            </div>
                            <div class="col-2">
                                <input type="number" class="form-control item-quantity" placeholder="Quantity" value="${item.quantity}" readonly>
                            </div>
                        </div>
                        `);
                        $('#quotationItems').append(newItem);
                    });
                }
                updateTotals();

            }

            if (action === 'DeleteQuotation') {
                $('#carQuotationModal').modal('show');
                $('#carQuotationModalTitle').text('Delete Quotation');

                $('#CustomerName').val(response.customerName).prop('disabled', true);
                $('#CarRego').val(response.carRego).prop('disabled', true);

                $('#QuotationId').val(response.quotationId).prop('readonly', true);
                $('#IssueName').val(response.issueName).prop('readonly', true);
                $('#Notes').val(response.notes).prop('readonly', true);
                $('#SubTotal').val(response.subTotal).prop('readonly', true);
                $('#TaxAmount').val(response.taxAmount).prop('readonly', true);
                $('#TotalAmount').val(response.totalAmount).prop('readonly', true);

                let dateAdded = response.dateAdded ? response.dateAdded.split('T')[0] : '';
                $('#DateAdded').val(dateAdded).prop('readonly', true);

                // HIde Add item button
                $('#addItemButton').hide();

                // Hide Add and Update button
                $('#addQuotation').hide();
                $('#updateQuotation').hide();

                // Show Delete button 
                $('#deleteQuotation').show();


                // clear the existing items
                $('#quotationItems').empty();

                // Populate item list from response
                if (response.quotationItemDto && response.quotationItemDto.length > 0) {
                    // Add headers dynamically before adding items
                    let headers = `
                        <div class="row invoice-item-header d-flex justify-content-between align-items-center mb-2">
                            <div class="col-4"><strong>Item Name</strong></div>
                            <div class="col-2"><strong>Quantity</strong></div>
                        </div>
                    `;
                    $('#quotationItems').append(headers);

                    // Append each item
                    $.each(response.quotationItemDto, function (index, item) {
                        let newItem = $(`
                        <div class="row invoice-item d-flex justify-content-between align-items-center mb-2">
                            <div class="col-4">
                                <input type="text" class="form-control item-name" placeholder="Item Name" value="${item.itemName}" readonly>
                            </div>
                            <div class="col-2">
                                <input type="number" class="form-control item-quantity" placeholder="Quantity" value="${item.quantity}" readonly>
                            </div>
                        </div>
                        `);
                        $('#quotationItems').append(newItem);
                    });
                }
                updateTotals();
            }
        },
        error: function () {
            alert('An error occurred while fetching quotation details.');
        }
    });
}

// Add Quotation to database
function AddQuotation() {

    let result = Validate();

    if (result == false) {
        return false;
    }

    const token = $('input[name="__RequestVerificationToken"]').val();

    let formData = {
        IssueName: $('#IssueName').val(),
        Notes: $('#Notes').val(),
        subTotal: parseFloat($('#SubTotal').val()) || 0,
        taxAmount: parseFloat($('#TaxAmount').val()) || 0,
        totalAmount: parseFloat($('#TotalAmount').val()) || 0,
        quotationItems: [],
        CarId: $('#CarId').val()
    };

    $('.quotation-item').each(function () {
        let item = {
            ItemName: $(this).find('.item-name').val() || "",
            Quantity: parseFloat($(this).find('.item-quantity').val()) || 0
        };
        formData.quotationItems.push(item);
    });

    console.log(formData);

    $.ajax({
        url: '/quotation/AddQuotation',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        headers: {
            'RequestVerificationToken': token
        },
        data: JSON.stringify(formData),
        success: function (response) {
            if (response.success) {
                alert(response.message);
                HideModal();
                location.reload();
            }
        },
        error: function () {
            alert('An error occured while adding new quotation');
        }
    });
}


// Update Quotation from database
function UpdateQuotation() {
    let result = Validate();

    if (result === false) {
        return false;
    }

    const token = $('input[name="__RequestVerificationToken"]').val();

    let formData = {
        issueName: $('#IssueName').val(),
        notes: $('#Notes').val(),
        subTotal: parseFloat($('#SubTotal').val()) || 0,
        taxAmount: parseFloat($('#TaxAmount').val()) || 0,
        totalAmount: parseFloat($('#TotalAmount').val()) || 0,
        quotationId: $('#QuotationId').val()
    };

    console.log('formdata = ', formData);

    $.ajax({
        url: '/quotation/UpdateQuotation',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        headers: {
            'RequestVerificationToken': token
        },
        data: JSON.stringify(formData),
        success: function (response) {
            if (response.success) {
                alert(response.message);
                HideModal();
                location.reload();
            }
            else {
                alert(response.message);
            }
        },
        error: function () {
            alert('An error occurred while updating quotation.')
        }
    });
}

function DeleteQuotation() {
    const token = $('input[name="__RequestVerificationToken"]').val();
    const quotationId = $('#QuotationId').val();

    console.log(quotationId);

    $.ajax({
        url: '/quotation/DeleteQuotation',
        type: 'POST',
        dataType: 'json',
        headers: {
            'RequestVerificationToken': token
        },
        data: {
            id: quotationId
        },
        success: function (response) {
            alert(response.message);
            HideModal();
            location.reload();
        }, 
        error: function () {
            alert('An error occurred while trying to delete quotation.');
        }
    });

}

function HideModal() {
    $('#DateAdded').val('');
    $('#IssueName').val('');
    $('#Notes').val('');
    $('#SubTotal').val('');
    $('#TotalAmount').val('');

    $('#IssueNameError').text('');
    $('#IssueName').css('border-color', 'Lightgrey');

    $('#quotationItems').empty();
}

function Validate() {
    let isValid = true;

    if ($('#IssueName').val().trim() === "") {
        $('#IssueName').css('border-color', 'Red');
        $('#IssueNameError').text('Issue name is required.');
        isValid = false;
    } else {
        $('#IssueName').css('border-color', 'Lightgrey');
        $('#IssueNameError').text('');
    }

    if ($('.item-name').length > 0) {
        $('.item-name').each(function () {
            let itemNameInput = $(this);
            let itemNameError = $(this).find('.item-name-error');

            // Check if item name is empty
            if (itemNameInput.val().trim() === "") {
                itemNameInput.css('border-color', 'Red');

                isValid = false;
            } else {
                itemNameInput.css('border-color', 'Lightgrey');
                itemNameError.remove();  // Remove the error message if the field is valid
            }
        });
    }

    return isValid;
}

// View Quotation PDF
function ViewPdf(quotationId) {
    // Create a modal to display the PDF
    const modal = $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">')
        .append($('<div class="modal-dialog modal-xl" style="max-width: 90%; width: 90%; height: 90vh;">')
            .append($('<div class="modal-content h-100">')
                .append($('<div class="modal-header">')
                    .append($('<h5 class="modal-title">').text('View Quotation PDF'))
                    .append($('<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">')))
                .append($('<div class="modal-body p-0" style="height: calc(100% - 56px);">')
                    .append($('<iframe>')
                        .attr('src', `/Quotation/ViewPdf/${quotationId}`)
                        .attr('width', '100%')
                        .attr('height', '100%')
                        .attr('frameborder', '0')
                        .attr('style', 'overflow: hidden;')))));

    // Add the modal to the body and show it
    $('body').append(modal);
    modal.modal('show');
}

// Download Quotation PDF
function DownloadPdf(quotationId) {
    console.log('Downloading PDF for quotation:', quotationId);

    // Create a temporary anchor element
    var link = $('<a>', {
        href: `/Quotation/DownloadPdf/${quotationId}`,
        download: ''
    });

    // Append to body, click programmatically, and remove
    $('body').append(link);
    link[0].click();  // jQuery object needs to be accessed as a DOM element
    link.remove();
}

// Send Quotation PDF to Email
function SendQuotationEmail(quotationId) {
    const token = $('input[name="__RequestVerificationToken"]').val();

    console.log('sending quotation to email...', quotationId);

    $.ajax({
        url: '/quotation/SendQuotationEmail',
        type: 'POST',
        dataType: 'json',
        headers: {
            'RequestVerificationToken': token
        },
        data: {
            quotationId: quotationId
        },
        success: function (response) {
            if (response.success) {
                alert(response.message);
                location.reload();
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function () {
            alert('An error occurred while sending the quotation email.');
        }
    });
}
