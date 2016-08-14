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
    previous = 0;


/* Each neuron in the network had an ID which is the same as the ID of the
 * displayed neuron on the SVG. Each of the neuron objects has connections
 * properies, each of which has information from and to which neuron is the
 * connection linked and it's weight (among other things).
 * Here we are using the 'projected' connections and display only connections
 * that the neuron projects.
 *
 * @param {array} list of neurons with particular parameters.
 */
function drawConnections(list) {
    var fromSvgNeuron, toSvgNeuron, strokeWidth, strokeColor;
    _.each(nn.neurons(), function(n) {
        _.each(n.neuron.connections.projected, function(conn) {
            fromSvgNeuron = list[conn.from.ID - (neuronId - list.length)];
            toSvgNeuron = list[conn.to.ID - (neuronId - list.length)];
            strokeWidth = conn.weight;
            strokeColor = 'red';

            // Draw the input weights with green color.
            if (toSvgNeuron === list[list.length - 1])
                strokeColor = 'green';

            svg.append('line')
                .attr('stroke', strokeColor)
                .attr('stroke-width', strokeWidth)
                .attr('x1', fromSvgNeuron.x)
                .attr('y1', fromSvgNeuron.y)
                .attr('x2', toSvgNeuron.x)
                .attr('y2', toSvgNeuron.y);
        });
    });
}

/* Remove all the elements from the error rate graph canvas and re-initialize values. */
function clearErrorRateGraphCanvas() {
    errorSvg = d3.select('.error-graph svg');
    errorSvg.selectAll('*').remove();
    xAxisTicks = 0;
    currentX = 0;
    previous = 0;
}

/* Draws one tick on the error rate graph.
 * 
 * @param {number} error: The value for the error to be displayed on the error graph.
 */
function drawErrorRateTick(error) {
    // Normalize Y axis and invert so that the graph starts from top left.
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

/* Draw the error rate graph canvas axes and calculate
 * the needed values for the graph to display.
 */
function drawErrorRateGraphCanvas() {
    var logRate, iterations;

    clearErrorRateGraphCanvas();
    errorSvg = d3.select('.error-graph svg');
    errorSvgWidth = parseInt(errorSvg.attr('width'));
    errorSvgHeight = parseInt(errorSvg.attr('height'));
    logRate = parseInt($('input[name=log-rate]').val());
    iterations = parseInt($('input[name=iterations]').val());

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
    errorSvg.append('text')
        .attr('class', 'rotate')
        .attr('x', 120)
        .attr('y', -5)
        .style('font-size', '16px')
        .style('fill', '#B6B6B6')
        .text('Error rate');

    // X axis
    errorSvg.append('line')
        .attr('x1', 0)
        .attr('y1', errorSvgHeight)
        .attr('x2', errorSvgWidth)
        .attr('y2', errorSvgHeight)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2);
    errorSvg.append('text')
        .attr('x', 180)
        .attr('y', 290)
        .style('font-size', '16px')
        .style('fill', '#B6B6B6')
        .text('Epochs');

    _.each(errorList, function(val, i) {
        if ((i % tickFrequency) === 0) {
            drawErrorRateTick(val);
        }
    });
}

/* Initialize the network svg canvas. Draws the network structure, error rate graph
 * and the weights table.
 *
 * @param {array} conns: Array for connections that are sent when a network is loaded.
 */
function initNetworkSvg(conns) {
    var neuronList = [],
        hiddenNodes = [],
        inputNodes = nn.layers.input.size,
        outputNodes = nn.layers.output.size,
        layerNum,
        widthOffset,
        heightOffset;

    svg = d3.select('.network-display svg');
    svg.selectAll('*').remove();  // Clear the SVG for a new one.
    svgWidth = parseInt(svg.attr('width'));
    svgHeight = parseInt(svg.attr('height'));

    _.forEach(nn.layers.hidden, function(layer) {
        hiddenNodes.push(layer.size);
    });

    layerNum = _.flatten([inputNodes, hiddenNodes, outputNodes]);
    widthOffset = svgWidth / (layerNum.length * 2);

    for (var i=0; i<layerNum.length; i++) {
        // Draw the neural network with an offset for the edged neurons
        // so that network is always in the center.
        for (var j=0; j<layerNum[i]; j++) {
            // Height offset depends on the number of neurons in each layer
            // so it can't be set outside the loop.
            heightOffset = svgHeight / (layerNum[i] * 2);

            neuronList.push({
                x: widthOffset + (svgWidth/layerNum.length) * i,
                y: heightOffset + (svgHeight/layerNum[i]) * j,
                id: neuronId
            });
            neuronId++;
        }
    }
    drawErrorRateGraphCanvas();
    drawConnections(neuronList);
    drawNeurons(neuronList);
    drawWeightTable(conns);
    drawBiasTable();
}

/* Draws the neurons on the network structure svg. Each neuron is a red circle
 * with radius of 20 pixels.
 *
 * @param {array} list: List of neurons with particular parameters.
 */
function drawNeurons(list) {
    var textX, textY,
        div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg = d3.select('.network-display svg');
    _.each(list, function(neuron) {
        svg.append('circle')
            .attr('cx', neuron.x)
            .attr('cy', neuron.y)
            .attr('r', 20)
            .attr('id', neuron.id)
            .style('fill', 'red');

        // Draw the ID of the neuron in the neuron circle.
        if (neuron.id < 10) {
            textX = neuron.x - 5;
        } else {
            textX = neuron.x - 10;
        }
        textY = neuron.y + 5;
        svg.append('text')
            .attr('x', textX)
            .attr('y', textY)
            .style('font-size', '16px')
            .style('font-weight', '700')
            .style('fill', '#FFFFFF')
            .text(neuron.id);
    });
}

/* Add rows with connections to the weights table.
 * Rows with white background, without a class are connections from input to
 * first hidden layer, gray rows, with 'active' class, are connections between
 * hidden layers, green rows, with 'success' class, are connections from the last
 * hidden layer to output.
 * If the network is loaded instead of trained, the JSON with which it is loaded
 * does not contains `connectedTo` properties so a list of connections is passed
 * in, and in that case all rows are in white.
 *
 * @param {array} conns: Array of connections between neurons.
 */
function drawWeightTable(conns) {
    var hiddenTrClass = 'active';

    if (conns) {
        _.each(conns, function(conn) {
            $('.weights-table > table tr:last').after(
                '<tr><td>' +
                    conn.from +
                '</td><td>' +
                    conn.to +
                '</td><td>' +
                    conn.weight +
                '</td></tr>'
            );
        });
    } else {
        _.each(nn.layers.input.connectedTo[0].connections, function(conn) {
            $('.weights-table > table tr:last').after(
                '<tr><td>' +
                    conn.from.ID +
                '</td><td>' +
                    conn.to.ID +
                '</td><td>' +
                    conn.weight +
                '</td></tr>'
            );
        });

        _.each(nn.layers.hidden, function(hidden, i) {
            if (i + 1 === nn.layers.hidden.length)
                hiddenTrClass = 'success';  // Change the row class for output connections

            _.each(hidden.connectedTo[0].connections, function(conn) {
                $('.weights-table > table tr:last').after(
                    '<tr class="' + hiddenTrClass + '"><td>' +
                        conn.from.ID +
                    '</td><td>' +
                        conn.to.ID +
                    '</td><td>' +
                        conn.weight +
                    '</td></tr>'
                );
            });
        });
    }
}

/* Fills in the bias table with neuron biases. */
function drawBiasTable() {
    var nonInputNeurons = [];
    _.each(nn.neurons(), function(neuron) {
        if (neuron.layer !== 'input') {
            nonInputNeurons.push({
                id: neuron.neuron.ID,
                bias: neuron.neuron.bias
            });
        }
    });

    _.each(nonInputNeurons, function(neuron) {
        $('.bias-table > table tr:last').after(
            '<tr><td>' +
            neuron.id +
            '</td><td>' +
            neuron.bias +
            '</td></tr>'
        );
    });
}