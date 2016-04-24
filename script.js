function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);

    // a perceptron can have more hidden layers
    var hiddenLayers = [];
    _.each(hidden, function (hiddenLayer) {
      var hiddenLayer = new Layer(hidden);
      hiddenLayers.push(hiddenLayer);
    });
    var outputLayer = new Layer(output);

    // connect the layers
    _.each(hiddenLayers, function (hiddenLayer) {
      inputLayer.project(hiddenLayer);
      hiddenLayer.project(outputLayer);
    });

    // set the layers
    this.set({
        input: inputLayer,
        hidden: hiddenLayers,
        output: outputLayer
    });
}

// Retrieve the values in the input fields and upon those
// create a new Perceptron network.
function networkStructure() {
  var input = $('.input-nodes').val();

  var hidden = [];
  $('.hidden-nodes').each(function(el) {
    hidden.push(parseInt($(this).val()));
  });

  var output = $('.output-nodes').val();

  Perceptron.prototype = new Network();
  Perceptron.prototype.constructor = Perceptron;

  var myPerceptron = new Perceptron(input,hidden,output);
  return myPerceptron;
}

// RETRIEVE AND PREPARE TRAINING DATA


// TRAIN


// TEST / RUN THE NETWORK
$('button.create-network').click(function() {
  var myPerceptron = networkStructure();
  var myTrainer = new Trainer(myPerceptron);
  myTrainer.XOR();

  console.log(myPerceptron.activate([0,0]));
  console.log(myPerceptron.activate([1,0]));
  console.log(myPerceptron.activate([0,1]));
  console.log(myPerceptron.activate([1,1]));
});
