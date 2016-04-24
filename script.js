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

// CREATE THE NETWORK
function networkStructure() {
  var input = $('input[name=input-nodes]').val();

  var hidden = [];
  $('input[name=hidden-nodes]').each(function(el) {
    hidden.push(parseInt($(this).val()));
  });

  var output = $('input[name=output-nodes]').val();

  Perceptron.prototype = new Network();
  Perceptron.prototype.constructor = Perceptron;

  var myPerceptron = new Perceptron(input,hidden,output);
  return myPerceptron;
}

// RETRIEVE AND PREPARE TRAINING DATA
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

// TEST / RUN THE NETWORK
$('button.train-network').click(function() {
  nn = trainNetwork();

  console.log(nn.activate([1,20]));
  console.log(nn.activate([1,15]));
  console.log(nn.activate([1,10]));
  console.log(nn.activate([1,30]));
  console.log(nn.activate([1,35]));
  console.log(nn.activate([1,40]));
});
