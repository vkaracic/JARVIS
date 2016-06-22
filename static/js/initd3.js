var svg,
    svgWidth,
    svgHeight,
    // Since the neurons created are not deleted, their ID's are continually
    // incrementing meaning that the ID's of the circles has to continually
    // increment as well.
    neuronId = 0;

var errorSvg,
    errorList = [],
    normFactor,
    errorSvgWidth,
    errorSvgHeight,
    tickFrequency = 0,
    tickWidth,
    currentX = 0,
    yNorm = 0,
    previous = 0;


function drawConnections(loaded) {
    // Each neuron in the network had an ID which is the same as the ID of the
    // displayed neuron on the SVG. Each of the neuron objects has connections
    // properies, each of which has information from and to which neuron is the
    // connection linked and it's weight (among other things).
    // Here we are using the 'projected' connections and display only connections
    // that the neuron projects instead of 'inputs'.
    _.each(nn.neurons(), function(n) {
        _.each(n.neuron.connections.projected, function(conn) {
            var fromSvgNeuron = $('.network-display svg circle[id=' + conn.from.ID + ']');
            var toSvgNeuron = $('.network-display svg circle[id=' + conn.to.ID + ']');
            multiplier = 100;
            if (loaded)
                multiplier = 1;
            var strokeWidth = conn.weight * multiplier;

            svg.append('line')
                // The connetions are the same color as the neurons since they
                // are painted over the neurons (d3 assigns higher z-index).
                .attr('stroke', 'red')
                .attr('stroke-width', strokeWidth)
                .attr('x1', fromSvgNeuron.attr('cx'))
                .attr('y1', fromSvgNeuron.attr('cy'))
                .attr('x2', toSvgNeuron.attr('cx'))
                .attr('y2', toSvgNeuron.attr('cy'));
        });
    });
}

// Remove all the elements from the error rate graph canvas and re-initialize values.
function clearErrorRateGraphCanvas() {
    errorSvg = d3.select('.error-graph svg');
    errorSvg.selectAll('*').remove();
    xAxisTicks = 0;
    currentX = 0;
    yNorm = 0;
    previous = 0;
}

function appendToErrorList(error) {
    errorList.push(error);
}

// Draws one tick on the error rate graph. This function needs to be called
// in this block: https://github.com/cazala/synaptic/blob/master/src/trainer.js#L111
function drawErrorRateTick(error) {
    // Normalize Y axis and invert.
    var tick = errorSvgHeight - error * normFactor;

    if (previous === 0) {
        previous = {
            x: 0,
            y: 0,
        };
    } else {
        errorSvg.append('line')
            .attr('x1', previous.x)
            .attr('y1', previous.y)
            .attr('x2', currentX)
            .attr('y2', tick)
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('error', error);
        previous.x = currentX;
        previous.y = tick;
    }
    currentX = currentX + tickWidth;
}

// Draw the error rate graph canvas axes and calculate
// the need values for the graph to display.
function drawErrorRateGraphCanvas() {
    clearErrorRateGraphCanvas();
    errorSvg = d3.select('.error-graph svg');
    errorSvgWidth = parseInt(errorSvg.attr('width')),
    errorSvgHeight = parseInt(errorSvg.attr('height'));
    var logRate = parseInt($('input[name=log-rate]').val());
    var iterations = parseInt($('input[name=iterations]').val());
    if (errorList.length < errorSvgWidth) {
        tickFrequency = 1;
        tickWidth = Math.floor(errorSvgWidth / errorList.length);
    } else {
        tickFrequency = Math.floor(errorList.length / errorSvgWidth); // Needs to be an integer.
        tickWidth = 1;
    }
    normFactor = errorSvgHeight / _.max(errorList);
    // Y axis
    errorSvg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', errorSvgHeight)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2);
    // X axis
    errorSvg.append('line')
        .attr('x1', 0)
        .attr('y1', errorSvgHeight)
        .attr('x2', errorSvgWidth)
        .attr('y2', errorSvgHeight)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2);

    _.each(errorList, function(val, i) {
        if ((i % tickFrequency) === 0) {
            drawErrorRateTick(val);
        }
    });
    console.log('Errors available in `errorList` array.');
}

function initNetworkSvg(loaded) {
    svg = d3.select('.network-display svg');
    svg.selectAll('*').remove();  // Clear the SVG for a new one.
    svgWidth = parseInt(svg.attr('width'));
    svgHeight = parseInt(svg.attr('height'));

    var input_nodes = nn.layers.input.size;
    var output_nodes = nn.layers.output.size;

    var hidden_nodes = [];
    _.forEach(nn.layers.hidden, function(layer) {
        hidden_nodes.push(layer.size);
    });

    var layerNum = _.flatten([input_nodes, hidden_nodes, output_nodes]);
    var widthOffset = svgWidth / (layerNum.length * 2);

    for (var i=0; i<layerNum.length; i++) {
        var layer;
        // Input layer neurons have their layer attribute set to 'input',
        // output layer neurons to 'output' and hidden ones are enumerated.
        if (i==0) {
            layer = 'input';
        } else if (i==layerNum.length-1) {
            layer = 'output';
        } else {
            layer = i-1;
        }

        // Draw the neural network with an offset for the edged neurons
        // so that network is always in the center.
        for (var j=0; j<layerNum[i]; j++) {
            // Height offset depends on the number of neurons in each layer
            // so it can't be set outside the loop.
            var heightOffset = svgHeight / (layerNum[i] * 2);
            svg.append('circle')
                .attr('cx', widthOffset + (svgWidth/layerNum.length) * i)
                .attr('cy', heightOffset + (svgHeight/layerNum[i]) * j)
                .attr('r', 20)
                .attr('id', neuronId)
                .attr('layer', layer)
                .style('fill', 'red');
            neuronId++;
        }
    }

    drawConnections(loaded);
}