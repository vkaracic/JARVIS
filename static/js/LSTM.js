function LSTM(input, blocks, output)
{
    // create the layers
    var inputLayer = new Layer(input),
        inputGate = new Layer(blocks),
        outputGate = new Layer(blocks),
        forgetGate = new Layer(blocks),
        memoryCell = new Layer(blocks),
        outputLayer = new Layer(output);

    // input layer connections
    var input = inputLayer.project(memoryCell);
    inputLayer.project(inputGate);
    inputLayer.project(outputGate);
    inputLayer.project(forgetGate);
    inputLayer.project(outputLayer);

    // memory cell connections
    var output = memoryCell.project(outputLayer);

    // self connection
    var self = memoryCell.project(memoryCell);

    memoryCell.project(inputGate);
    memoryCell.project(outputGate);
    memoryCell.project(forgetGate);

    // gates
    inputGate.gate(input, Layer.gateType.INPUT);
    forgetGate.gate(self, Layer.gateType.ONE_TO_ONE);
    outputGate.gate(output, Layer.gateType.OUTPUT);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [inputGate, outputGate, forgetGate, memoryCell, outputGate],
        output: outputLayer
    });
}

// CREATE THE NETWORK
function networkStructure() {
  var input = parseInt($('input[name=input-nodes]').val());
  var blocks = parseInt($('input[name=blocks]').val());
  var output = parseInt($('input[name=output-nodes]').val());

  LSTM.prototype = new Network();
  LSTM.prototype.constructor = LSTM;
  return new LSTM(input, blocks, output);
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

    trainSet.push({
      'input': _.first(values, values.length - outputNum),
      'output': _.last(values, outputNum)
    })
  });

  return trainSet;
}

function trainNetwork() {
  var myLSTM = networkStructure();
  var myTrainer = new Trainer(myLSTM);
  var trainingData = trainingSet();

  var rate = parseFloat($('input[name=learning-rate]').val()),
      iterations = parseInt($('input[name=iterations]').val()),
      error = parseFloat($('input[name=error-rate]').val()),
      shuffle = $('input[name="shuffle"]').is(':checked'),
      log = parseInt($('input[name=log-rate]').val()),
      cost = $('select[name=cost]').val();

  myTrainer.train(trainingData, {
    rate: rate,
    iterations: iterations,
    error: error,
    shuffle: shuffle,
    log: log,
    cost: Trainer.cost[cost],
    schedule: {
      every: 50,
      do: function(data) {
          errorList.push(data.error);
      }
    }
  });
  drawErrorRateGraphCanvas();
  return myLSTM;
}

function testNetwork(network, input) {
  var output = network.activate(input);
  $('span.test-output').text(output);
}

var nn;
// TEST / RUN THE NETWORK
$('button.train-network').click(function() {
  nn = trainNetwork();
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
});

// LOAD THE NETWORK
$('button.load-network').click(function() {
  var network = $('textarea[name=load-network-content]').val();
  nn = Network.fromJSON(JSON.parse(network));
});