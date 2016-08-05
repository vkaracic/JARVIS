var nn;

/* Create an LSTM network.
 *
 * @param {number} input: Number of input nodes.
 * @param {number} blocks: Number of memory cells.
 * @param {number} output: Number of output nodes.
 */
function LSTM(input, blocks, output) {
    // create the layers
    var inputLayer = new Layer(input),
        inputGate = new Layer(blocks , 'inputGate'),
        outputGate = new Layer(blocks, 'outputGate'),
        forgetGate = new Layer(blocks, 'forgetGate'),
        memoryCell = new Layer(blocks, 'memoryCell'),
        outputLayer = new Layer(output),
        self;

    // input layer connections
    input = inputLayer.project(memoryCell);
    inputLayer.project(inputGate);
    inputLayer.project(outputGate);
    inputLayer.project(forgetGate);
    inputLayer.project(outputLayer);

    // memory cell connections
    output = memoryCell.project(outputLayer);

    // self connection
    self = memoryCell.project(memoryCell);

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

/* Create the network.
 *
 * @returns {Object} LSTM: network object.
 */
function networkStructure() {
  var input = parseInt($('input[name=input-nodes]').val());
  var blocks = parseInt($('input[name=blocks]').val());
  var output = parseInt($('input[name=output-nodes]').val());

  LSTM.prototype = new Network();
  LSTM.prototype.constructor = LSTM;
  return new LSTM(input, blocks, output);
}

/*
 * The format of the train set has to be a list of objects, each with
 * 'input' property that is a list of input values, and 'output' that is
 * also a list of output values.
 *
 * @returns {array} trainSet: The training data set containing the inputs
 *                            and targeted outputs.
 */
function trainingSet() {
  var inputNum = parseInt($('input[name=input-nodes]').val()),
      outputNum = parseInt($('input[name=output-nodes]').val()),
      dataRowLen = inputNum + outputNum,
      trainingData = $("textarea[name=training-data]").val().split('\n'),
      trainSet = [],
      values;

  _.forEach(trainingData, function(train_row) {
    values = train_row.split(',');
    trainSet.push({
      'input': _.first(values, values.length - outputNum),
      'output': _.last(values, outputNum)
    });
  });

  return trainSet;
}

/* Training the network.
 * 
 * @returns {Object} myLSTM: The trained network.
 */
function trainNetwork() {
  var myLSTM = networkStructure();
      myTrainer = new Trainer(myLSTM),
      trainingData = trainingSet(),
      rate = parseFloat($('input[name=learning-rate]').val()),
      iterations = parseInt($('input[name=iterations]').val()),
      error = parseFloat($('input[name=error-rate]').val()),
      shuffle = $('input[name="shuffle"]').is(':checked'),
      cost = $('select[name=cost]').val();

  errorList = [];
  myTrainer.train(trainingData, {
    rate: rate,
    iterations: iterations,
    error: error,
    shuffle: shuffle,
    cost: Trainer.cost[cost],
    schedule: {
      every: 50,
      do: function(data) {
          errorList.push(data.error);
      }
    }
  });
  return myLSTM;
}

/* Calculate the average of an array with values
 * DRY !!!
 * @param {array} data: Array of variance data.
 */
function avgVariance(data) {
  var total = 0;
  _.each(data, function(val) {
    total += val;
  });
  return total / data.length;
}

/* Add test data results to the result table.
 *
 * @param {array} data: Array of test result data.
 */
function addToResultTable(data) {
  var totalVariance = 0;

  _.each(data, function(el) {
    totalVariance += avgVariance(el.variance);
    $('table.test-output tr:last').after(
      '<tr><td>'+
      el.input+
      '</td><td>'+
      el.result+
      '</td><td>'+
      el.expected+
      '</td><td>'+
      el.variance+
      '</td></tr>'
    );
  });

  $('table.test-output tr:last').after(
    '<tr class="active"><td colspan="3">Average variance</td>'+
    '<td>' + (totalVariance / data.length) + '</td></tr>'
  );
}

/* Test the network.
 * Takes the data entered in the input textarea, splits into input and target,
 * activates the network for each row of the test data values and appends the 
 * results to the test result table.
 */
function testNetwork() {
  var testingData = $("textarea[name=test-data]").val().split('\n'),
      outputNum = parseInt($('input[name=output-nodes]').val()),
      trainingResults = [],
      output,
      values,
      variance,
      inputLength;

  _.forEach(testingData, function(row) {
    variance = [];
    values = row.split(',');
    inputLength = values.length - outputNum;

    output = nn.activate(_.first(values, inputLength));
    _.each(output, function(val, i) {
        variance.push(Math.abs(values[inputLength + i] - val));
    });

    trainingResults.push({
      input: _.first(values, inputLength),
      result: output,
      expected: _.last(values, outputNum),
      variance: variance
    });
  });

  addToResultTable(trainingResults);
}

/*******************************************************************************
                            UI ACTION BUTTON EVENTS
*******************************************************************************/

// TEST / RUN THE NETWORK
$('button.train-network').click(function() {
  nn = trainNetwork();
  drawErrorRateGraphCanvas();
});

$('button.test-network').click(function() {
  testNetwork();
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