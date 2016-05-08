// Append new hidden-layer input fields.
$('button.add-hidden-layer').click(function() {
  var inputElement = '<input type="number" class="form-control" name="hidden-nodes" min="1">';
  $('.append-layer').append(inputElement);
});


// Show or hide a section.
// A section with plus and minus glyphicons needs to be above
// the content section for this to work.
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
