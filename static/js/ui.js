// Append new hidden-layer input fields.
$('button.add-hidden-layer').click(function() {
  var inputElement = '<input type="number" class="form-control" name="hidden-nodes" min="1">';
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


// Show or hide a section.
$('.glyphicon.show-hide').click(function() {
    var parent = $(this).parent();
    var content = parent.next('div');
    parent.find('span').toggleClass('hidden');
    if (parent.find('.glyphicon-minus').hasClass('hidden')) {
        content.hide(200);
    } else {
        content.show(200);
    }
});