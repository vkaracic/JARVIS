/* Greedy random training for polynomial coefficients */

// Using the MSE error calculation method
calculateError = function(actual, expected) {
    return Math.pow((expected - actual), 2)/2;
}

// Neural network function that does the training.
// Input:
//     data (array): Array of objects where each object
//                   contains two arrays - inputs and outputs.

// ka, kb and kc are the best candidates for a solution. Number of iterations
// is set manually in the for loop. Each iteration iterates through the training
// data elements. In each of those iteration a random number is set for a, b and c.
// Calcualted output is calculated using each of the random numbers in the equation.
// Error rate is then calcualted and if it's lower than the previous one, those random
// numbers are kept. The ones with the lowest error rate are returned.
NN = function(data) {
    var ka = 0, kb = 0, kc = 0;
    var error = 999999, prevErr = 999999;

    for (i=0; i<1000; i++) {
        data.forEach(function(arr) {
            // Floating number up to 15 decimals
            // a = Math.random() * 10;
            // b = Math.random() * 10;
            // c = Math.random() * 10;

            // Integer numbers
            a = Math.floor((Math.random() * 10) + 1);
            b = Math.floor((Math.random() * 10) + 1);
            c = Math.floor((Math.random() * 10) + 1);

            inputData = arr['input_data'][0];
            expectedOutput = arr['output_data'][0];

            calculatedOutput = a*Math.pow(inputData, 2) + b*inputData + c;
            error = calculateError(expectedOutput, expectedOutput);

            if (error < prevErr) {
                ka = a; kb = b; kc = c;
                prevErr = error;
            };
        });
    };

    return [ka, kb, kc];
};