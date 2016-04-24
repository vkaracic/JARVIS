$('button.add-hidden-layer').click(function() {
  var inputElement = '<input type="number" class="form-control" name="hidden-nodes">';
  $('.append-layer').append(inputElement);
});


// Toggle the save-network field.
$('input[name="save-network"]').change(function() {
    var inputField = $('input[name="save-network-name"]');
    if (inputField.attr('type') == 'hidden') {
        inputField.attr('type', 'text');
    } else {
        inputField.attr('type', 'hidden');
    };
});