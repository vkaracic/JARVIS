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


function drawConnections(list) {
    // Each neuron in the network had an ID which is the same as the ID of the
    // displayed neuron on the SVG. Each of the neuron objects has connections
    // properies, each of which has information from and to which neuron is the
    // connection linked and it's weight (among other things).
    // Here we are using the 'projected' connections and display only connections
    // that the neuron projects.

    // Tooltip element initialization.
    var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    _.each(nn.neurons(), function(n) {
        _.each(n.neuron.connections.projected, function(conn) {
            var fromSvgNeuron = list[conn.from.ID];
            var toSvgNeuron = list[conn.to.ID];
            var strokeWidth = conn.weight;

            svg.append('line')
                .attr('stroke', 'red')
                .attr('stroke-width', strokeWidth)
                .attr('x1', fromSvgNeuron.x)
                .attr('y1', fromSvgNeuron.y)
                .attr('x2', toSvgNeuron.x)
                .attr('y2', toSvgNeuron.y)
                .text('test123')
                .on('mouseover', function() {
                    div.transition()
                        .duration(500)  
                        .style("opacity", 0);
                    div.transition()
                        .duration(200)  
                        .style("opacity", 0.9);  
                    div .html('<p>' + strokeWidth + '</p>')
                        .style("left", (d3.event.pageX) + "px")          
                        .style("top", (d3.event.pageY - 28) + "px");
                });
        });
    });
}

// Remove all the elements from the error rate graph canvas and re-initialize values.
function clearErrorRateGraphCanvas() {
    errorSvg = d3.select('.error-graph svg');
    errorSvg.selectAll('*').remove();
    xAxisTicks = 0;
    currentX = 0;
    previous = 0;
}

// Draws one tick on the error rate graph.
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

// Draw the error rate graph canvas axes and calculate
// the needed values for the graph to display.
function drawErrorRateGraphCanvas() {
    clearErrorRateGraphCanvas();
    errorSvg = d3.select('.error-graph svg');
    errorSvgWidth = parseInt(errorSvg.attr('width'));
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
    console.log('Errors available in `errorList` array.');
}

function initNetworkSvg() {
    svg = d3.select('.network-display svg');
    svg.selectAll('*').remove();  // Clear the SVG for a new one.
    svgWidth = parseInt(svg.attr('width'));
    svgHeight = parseInt(svg.attr('height'));

    var neuron_list = [],
        input_nodes = nn.layers.input.size,
        output_nodes = nn.layers.output.size;

    var hidden_nodes = [];
    _.forEach(nn.layers.hidden, function(layer) {
        hidden_nodes.push(layer.size);
    });

    var layerNum = _.flatten([input_nodes, hidden_nodes, output_nodes]);
    var widthOffset = svgWidth / (layerNum.length * 2);

    for (var i=0; i<layerNum.length; i++) {
        // Draw the neural network with an offset for the edged neurons
        // so that network is always in the center.
        for (var j=0; j<layerNum[i]; j++) {
            // Height offset depends on the number of neurons in each layer
            // so it can't be set outside the loop.
            var heightOffset = svgHeight / (layerNum[i] * 2);

            neuron_list.push({
                x: widthOffset + (svgWidth/layerNum.length) * i,
                y: heightOffset + (svgHeight/layerNum[i]) * j,
                id: neuronId,
                bias: nn.neurons()[neuronId].neuron.bias
            });
            neuronId++;
        }
    }
    drawConnections(neuron_list);
    drawNeurons(neuron_list);
}

function drawNeurons(list) {
    svg = d3.select('.network-display svg');
    _.each(list, function(neuron) {
        svg.append('circle')
            .attr('cx', neuron.x)
            .attr('cy', neuron.y)
            .attr('r', 20)
            .attr('id', neuron.id)
            .style('fill', 'red');
    });
}