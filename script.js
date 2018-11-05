
window.onload = function () {
    var indices = [
        3, 2, 1,
        3, 1, 0
    ]

    var positionAttributeLocation = null,
        colorAttributeLocation = null;


    var canvas = document.getElementById("render-canvas"),
        gl = canvas.getContext('webgl');

    var vertexShader = compileShader(gl.VERTEX_SHADER, "vertex-shader"),
        fragmentShader = compileShader(gl.FRAGMENT_SHADER, "fragment-shader");

    var program = createProgram(vertexShader, fragmentShader);
    gl.useProgram(program);
    positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    colorAttributeLocation = gl.getAttribLocation(program, "a_color");

    // createMultipleBuffersForPositionsAndColors();
    createSingleBufferPositionsAndColors();

    createIndexBuffer();

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);


    gl.clearColor(1, 1, 1, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();

    function createProgram(gvertexShader, fragmentShader) {
        var program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Unable to link program: " + gl.getProgramInfoLog(program));
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteProgram(program);
        }

        return program;
    }

    function compileShader(shaderType, id) {
        var shader = gl.createShader(shaderType),
            shaderSource = document.getElementById(id).innerText;

        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("Unable to comple shader: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }

        return shader;
    }

    function createMultipleBuffersForPositionsAndColors() {

        // Data for quad positions, positions array.
        var positions = [
            // X, Y
            -0.5, 0.5,   // first vertex
            -0.5, -0.5,  // second vertex
            0.5, -0.5,   // third vertex
            0.5, 0.5,    // fourth vertex
        ];
        var positionVertexSize = 2;

        // Data for quad colors, colors array.
        var colors = [
            // R, G, B, A
            1, 0, 0, 1,  // first vertex
            0, 1, 0, 1,  // second vertex
            0, 0, 1, 1,  // third vertex
            1, 1, 0, 1   // fourth vertex
        ];
        var colorVertexSize = 4;

        // Create and bind first buffer for position vertex data.
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Add data to first buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Describe positions data for first buffer.
        gl.vertexAttribPointer(positionAttributeLocation, positionVertexSize, gl.FLOAT, false, 0, 0);

        // Create second buffer of colors vertex data.
        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

        // Add data to second buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

        // Describe colors data for second buffer.
        gl.vertexAttribPointer(colorAttributeLocation, colorVertexSize, gl.UNSIGNED_BYTE, false, 0, 0);
    }

    function createSingleBufferPositionsAndColors() {
        var positionsAndColors = [
            // X, Y,    R, G, B, A
            -0.5, 0.5, 1, 0, 0, 1,      // first vertex
            -0.5, -0.5, 0, 1, 0, 1,     // second vertex
            0.5, -0.5, 0, 0, 1, 1,      // third vertex
            0.5, 0.5, 1, 1, 0, 1        // fourth vertex
        ];

        // Sizes are important to know.
        var positionVertexSize = 2;
        var colorVertexSize = 4;
        var numberOfTotalVertexesForQuad = 4;

        // Need to know final size in floats and bytes, in order to fill arrays.
        var vertexSizeInBytes = positionVertexSize * Float32Array.BYTES_PER_ELEMENT + colorVertexSize * Uint8Array.BYTES_PER_ELEMENT;
        var vertexSizeInFloats = vertexSizeInBytes / Float32Array.BYTES_PER_ELEMENT;

        // total array
        var arrayBuffer = new ArrayBuffer(numberOfTotalVertexesForQuad * vertexSizeInBytes);
        // View for positions.
        var positionView = new Float32Array(arrayBuffer);
        // View for colors.
        var colorView = new Uint8Array(arrayBuffer);

        var positionOffsetInFloats = 0;
        // offset to skip x and y positions of first vertex.
        var colorOffsetInBytes = positionVertexSize * Float32Array.BYTES_PER_ELEMENT;

        // positionsAndColors index
        var k = 0;
        for (var i = 0; i < numberOfTotalVertexesForQuad; i++) {
            positionView[positionOffsetInFloats] = positionsAndColors[k];
            positionView[positionOffsetInFloats + 1] = positionsAndColors[k + 1];
            colorView[colorOffsetInBytes] = positionsAndColors[k + 2];
            colorView[colorOffsetInBytes + 1] = positionsAndColors[k + 3];
            colorView[colorOffsetInBytes + 2] = positionsAndColors[k + 4];
            colorView[colorOffsetInBytes + 3] = positionsAndColors[k + 5];

            positionOffsetInFloats += vertexSizeInFloats;
            colorOffsetInBytes += vertexSizeInBytes;
            k += 6;
        }

        // Create and bind single buffer.
        var posAndColbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posAndColbuffer);

        // Add data to single buffer.
        gl.bufferData(gl.ARRAY_BUFFER, arrayBuffer, gl.STATIC_DRAW);

        // Describe positions data for buffer. Notice 2 last parameters, first one is stride.
        // Stride is total size of single vertex ( position and color).
        // Second one is offset. Positions start at 0, so don't skip anything.
        gl.vertexAttribPointer(positionAttributeLocation, positionVertexSize, gl.FLOAT, false, vertexSizeInBytes, 0);

        // Describe color data for buffer. Stride need to be defined just like with previous call.
        // Offset is last argument and it it set to size of positions in Bytes, so that it skips positions and 
        // starts lookg at colors.
        gl.vertexAttribPointer(colorAttributeLocation, colorVertexSize, gl.UNSIGNED_BYTE, false, vertexSizeInBytes, positionVertexSize * Float32Array.BYTES_PER_ELEMENT);
    }

    function createIndexBuffer() {
        var indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    }

    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

        requestAnimationFrame(draw);

    }

}