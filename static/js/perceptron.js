var nn;

function Perceptron(input, hidden, output)
{
    // create the layers
    var inputLayer = new Layer(input);

    // a perceptron can have more hidden layers
    var hiddenLayers = [];
    _.each(hidden, function (neuronNum) {
      var hiddenLayer = new Layer(neuronNum);
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

// CREATE THE NETWORK
function networkStructure() {
  var input = parseInt($('input[name=input-nodes]').val());

  var hidden = [];
  $('input[name=hidden-nodes]').each(function(el) {
    if ($(this).val())
      hidden.push(parseInt($(this).val()));
  });
  var output = parseInt($('input[name=output-nodes]').val());

  Perceptron.prototype = new Network();
  Perceptron.prototype.constructor = Perceptron;
  var myPerceptron = new Perceptron(input, hidden, output);
  return myPerceptron;
}

// RETRIEVE AND PREPARE TRAINING DATA
// The format of the train set has to be a list of objects, each with
// 'input' property that is a list of input values, and 'output' that is
// also a list of output values.
function trainingSet() {
  var inputNum = parseInt($('input[name=input-nodes]').val());
  var outputNum = parseInt($('input[name=output-nodes]').val());
  var dataRowLen = inputNum + outputNum;
  var trainingData = $("textarea[name=training-data]").val().split('\n');
  var trainSet = [];

  _.forEach(trainingData, function(train_row) {
    var values = train_row.split(',');

    // training data items count has to be same
    // as input_nodes+output_nodes count.
    if (values.length > dataRowLen)
      throw 'Inconsistent training data';

    trainSet.push({
      'input': _.first(values, inputNum),
      'output': _.last(values, outputNum)
    })
  });

  return trainSet;
}

function trainNetwork() {
  var myPerceptron = networkStructure();
  var myTrainer = new Trainer(myPerceptron);
  var trainingData = trainingSet();

  var rate = parseFloat($('input[name=learning-rate]').val());
  var iterations = parseInt($('input[name=iterations]').val());
  var error = parseFloat($('input[name=error-rate]').val());
  var shuffle = $('input[name="shuffle"]').is(':checked');
  var log = parseInt($('input[name=log-rate]').val());

  myTrainer.train(trainingData, {
    rate: rate,
    iterations: iterations,
    error: error,
    shuffle: shuffle,
    log: log,
  });
  
  return myPerceptron;
}

function testNetwork(network, input) {
  // Input list should contain as many elements
  // as there are input nodes on the network.
  if (network.layers.input.size != input.length)
    throw new Error('Inconsistent data size!');

  var output = network.activate(input);
  $('span.test-output').text(output);
}

// TEST / RUN THE NETWORK
$('button.train-network').click(function() {
  nn = trainNetwork();
  initNetworkSvg();
});

$('button.test-network').click(function() {
  testNetwork(nn, $('input[name=test-input]').val().split(','));
});

// SAVE THE NETWORK
$('button.save-network').click(function() {
  var data = JSON.stringify(nn.toJSON());
  var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
  window.open(url, '_blank');
  window.focus();
  // console.log(data);
  // var blob = new Blob(data, {type: "application/JSON;charset=utf-8"});
  // saveAs(blob, 'network.json');
});