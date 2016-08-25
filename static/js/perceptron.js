/* Global variable for storing the neural network to make it accessable if any
 * additional information that is not displayed on the UI is needed.
 */ 
var nn;

/* Creates the perceptron network.
 * 
 * @param {number} input: Number of input nodes.
 * @param {array} hidden: Array containing the number of neurons for each hidden layer.
 * @param {number} output: Number of output nodes.
 */
function Perceptron(input, hidden, output) {
    var inputLayer = new Layer(input),
        hiddenLayers = [],
        hiddenLayer,
        outputLayer;

    // a perceptron can have more hidden layers
    _.each(hidden, function (neuronNum) {
      hiddenLayer = new Layer(neuronNum);
      hiddenLayers.push(hiddenLayer);
    });
    outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayers[0]);
    for (i = 1; i < hiddenLayers.length; i++) {
      hiddenLayers[i-1].project(hiddenLayers[i]);
    }
    hiddenLayers[hiddenLayers.length - 1].project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: hiddenLayers,
        output: outputLayer
    });
}

/* Create the network.
 *
 * @returns {Object} myPerceptron: network object.
 */
function networkStructure() {
  var input = parseInt($('input[name=input-nodes]').val()),
      output = parseInt($('input[name=output-nodes]').val()),
      hidden = [],
      myPerceptron;

  $('input[name=hidden-nodes]').each(function(el) {
    if ($(this).val())
      hidden.push(parseInt($(this).val()));
  });

  Perceptron.prototype = new Network();
  Perceptron.prototype.constructor = Perceptron;
  myPerceptron = new Perceptron(input, hidden, output);
  return myPerceptron;
}

/* Retrieve and prepare training data.
 * The format of the train set has to be a list of objects, each with
 * 'input' property that is a list of input values, and 'output' that is
 * also a list of output values.
 *
 * @returns {array} trainSet: The training data set containing the inputs
 *                            and targeted outputs.
 * 
 * @raises 'Inconsistent training data': The training data rows need to consist
 *                            of the exact amount of input values as there are input
 *                            nodes and an output value.
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

    // training data items count has to be same
    // as input_nodes + output_nodes count.
    if (values.length > dataRowLen)
      throw 'Inconsistent training data';

    trainSet.push({
      'input': _.first(values, inputNum),
      'output': _.last(values, outputNum)
    });
  });

  return trainSet;
}

/* Training the network.
 * 
 * @returns {Object} myPerceptron: The trained network.
 */
function trainNetwork() {
  var myPerceptron = networkStructure(),
      myTrainer = new Trainer(myPerceptron),
      trainingData = trainingSet(),
      rate = parseFloat($('input[name=learning-rate]').val()),
      iterations = parseInt($('input[name=iterations]').val()),
      error = parseFloat($('input[name=error-rate]').val()),
      shuffle = $('input[name="shuffle"]').is(':checked'),
      cost = $('select[name=cost]').val(),
      results;

  myPerceptron.setOptimize(false);
  errorList = [];

  results = myTrainer.train(trainingData, {
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

  console.log('Finished training in [' + results.time + 'ms]');
  console.log('Iterations: [' + results.iterations + ']');
  console.log('Final error: [' + results.error + ']');
  return myPerceptron;
}

/* Calculate the average of an array with values
 *
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

/*******************************************************************************
                            UI ACTION BUTTON EVENTS
*******************************************************************************/

// TEST / RUN THE NETWORK
$('button.train-network').click(function() {
  nn = trainNetwork();
  initNetworkSvg();
});

$('button.test-network').click(function() {
  var testingData = $("textarea[name=test-data]").val().split('\n'),
      inputNum = parseInt($('input[name=input-nodes]').val()),
      outputNum = parseInt($('input[name=output-nodes]').val()),
      dataRowLen = inputNum + outputNum,
      trainingResults = [],
      output,
      values,
      variance;

  _.forEach(testingData, function(row) {
    variance = [];
    values = row.split(',');
    if (values.length > dataRowLen + 1)
      throw 'Inconsistent testing data!';

    output = nn.activate(_.first(values, inputNum));
    _.each(output, function(val, i) {
        variance.push(Math.abs(values[inputNum + i] - val));
    });

    trainingResults.push({
      input: _.first(values, inputNum),
      result: output,
      expected: _.last(values, outputNum),
      variance: variance
    });
  });

  addToResultTable(trainingResults);
});

// SAVE THE NETWORK
$('button.save-network').click(function() {
  var data = JSON.stringify(nn.toJSON()),
      url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
  window.open(url, '_blank');
  window.focus();
});

// LOAD THE NETWORK
$('button.load-network').click(function() {
  var network = $('textarea[name=load-network-content]').val(),
      inputField = $('input[name=input-nodes]'),
      outputField = $('input[name=output-nodes]'),
      loadedNetwork = JSON.parse(network);
  nn = Network.fromJSON(loadedNetwork);
  inputField.val(nn.layers.input.size);
  outputField.val(nn.layers.output.size);
  initNetworkSvg(loadedNetwork.connections);
});
