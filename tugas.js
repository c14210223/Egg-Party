
function generateSphere(x, y, z, radius, segments) {
  var vertices = [];
  var colors = [];

  var angleIncrement = (2 * Math.PI) / segments;

  var rainbowColors = [
    [1.0, 1.0, 0.0],
    [1.0, 0.0, 0.0]
  ];

  for (var i = 0; i <= segments; i++) {
    var latAngle = Math.PI * (-0.5 + (i / segments));
    var sinLat = Math.sin(latAngle);
    var cosLat = Math.cos(latAngle);

    for (var j = 0; j <= segments; j++) {
      var lonAngle = 2 * Math.PI * (j / segments);
      var sinLon = Math.sin(lonAngle);
      var cosLon = Math.cos(lonAngle);

      var xCoord = cosLon * cosLat;
      var yCoord = sinLon * cosLat;
      var zCoord = sinLat;

      var vertexX = x + radius * xCoord;
      var vertexY = y + radius * yCoord;
      var vertexZ = z + radius * zCoord;

      vertices.push(vertexX, vertexY, vertexZ);

      var colorIndex = j % rainbowColors.length;
      colors = colors.concat(rainbowColors[colorIndex]);
    }
  }

  var faces = [];
  for (var i = 0; i < segments; i++) {
    for (var j = 0; j < segments; j++) {
      var index = i * (segments + 1) + j;
      var nextIndex = index + segments + 1;

      faces.push(index, nextIndex, index + 1);
      faces.push(nextIndex, nextIndex + 1, index + 1);
    }
  }

  return { vertices: vertices, colors: colors, faces: faces };
}

function generateCylinder(x, y, z, radius, height, segments) {
  var vertices = [];
  var colors = [];

  var angleIncrement = (2 * Math.PI) / segments;

  var rainbowColors = [
      [1.0, 1.0, 0.0],
      [1.0, 0.0, 0.0]
  ];

  for (var i = 0; i <= segments; i++) {
      var theta = angleIncrement * i;

      var xCoord = x + radius * Math.cos(theta);
      var yCoord = y + radius * Math.sin(theta);

      for (var j = 0; j <= segments; j++) {
          var heightFraction = j / segments;
          var vertexX = xCoord;
          var vertexY = yCoord;
          var vertexZ = z + height * heightFraction;

          vertices.push(vertexX, vertexY, vertexZ);

          var colorIndex = j % rainbowColors.length;
          colors = colors.concat(rainbowColors[colorIndex]);
      }
  }

  var faces = [];
  for (var i = 0; i < segments; i++) {
      for (var j = 0; j < segments; j++) {
          var index = i * (segments + 1) + j;
          var nextIndex = index + segments + 1;

          faces.push(index, nextIndex, index + 1);
          faces.push(nextIndex, nextIndex + 1, index + 1);
      }
  }

  return { vertices: vertices, colors: colors, faces: faces };
}




function main(){
  var CANVAS = document.getElementById("myCanvas");

  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  var GL;
  try {
      GL = CANVAS.getContext("webgl", {antialias: true});
      var EXT = GL.getExtension("OES_element_index_uint");
  } catch (e) {
      alert("WebGL context cannot be initialized");
      return false;
  }

  // shaders
  var shader_vertex_source = `
      attribute vec3 position;
      attribute vec3 color;

      uniform mat4 PMatrix;
      uniform mat4 VMatrix;
      uniform mat4 MMatrix;

      varying vec3 vColor;
      void main(void) {
          gl_Position = PMatrix * VMatrix * MMatrix * vec4(position, 1.0);
          vColor = color;
      }
  `;
  var shader_fragment_source = `
      precision mediump float;
      varying vec3 vColor;
      void main(void) {
          gl_FragColor = vec4(vColor, 1.0);
      }
  `;

  var compile_shader = function(source, type, typeString) {
      var shader = GL.createShader(type);
      GL.shaderSource(shader, source);
      GL.compileShader(shader);
      if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
          alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
          return false;
      }
      return shader;
  };

  var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

  lingkaran = "resource/roblox.jpg"
  var SHADER_PROGRAM = GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);

  GL.linkProgram(SHADER_PROGRAM);

  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

  var _PMatrix = GL.getUniformLocation(SHADER_PROGRAM, "PMatrix"); // projection
  var _VMatrix = GL.getUniformLocation(SHADER_PROGRAM, "VMatrix"); // view
  var _MMatrix = GL.getUniformLocation(SHADER_PROGRAM, "MMatrix"); // model

  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_position);
  GL.useProgram(SHADER_PROGRAM);

  var tubeData = generateSphere(0, 0, 0, 0.5, 50); // Example sphere: x=0, y=0, z=0.5, radius=0.5, segments=50
    var cylinderData = generateCylinder(0, 0, 0, 0.1, 0.9, 50); // Example cylinder: x=1, y=1, z=1, radius=0.5, height=0.75, segments=50
    var cylinderData2 = generateCylinder(0, 0, 0, 0.1, -0.9, 50); // x=1.5, y=0, z=0, radius=0.2, height=1.2, segments=50
  
  // Create buffers for sphere
  var SPHERE_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tubeData.vertices), GL.STATIC_DRAW);

  var SPHERE_COLORS = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_COLORS);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tubeData.colors), GL.STATIC_DRAW);

  var SPHERE_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPHERE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tubeData.faces), GL.STATIC_DRAW);

  // Create buffers for cylinder
  var CYLINDER_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cylinderData.vertices), GL.STATIC_DRAW);

  var CYLINDER_COLORS = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_COLORS);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cylinderData.colors), GL.STATIC_DRAW);

  var CYLINDER_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CYLINDER_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderData.faces), GL.STATIC_DRAW);

  // Create buffers for cylinder 2
  var CYLINDER_VERTEX2 = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_VERTEX2);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cylinderData2.vertices), GL.STATIC_DRAW);

  var CYLINDER_COLORS2 = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_COLORS2);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cylinderData2.colors), GL.STATIC_DRAW);

  var CYLINDER_FACES2 = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CYLINDER_FACES2);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderData2.faces), GL.STATIC_DRAW);

  // matrix
  var PROJECTION_MATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
  var VIEW_MATRIX = LIBS.get_I4();
  var MODEL_MATRIX = LIBS.get_I4();
  var MODEL_MATRIX2 = LIBS.get_I4();

  LIBS.translateZ(VIEW_MATRIX, -5);

  /*========================= DRAWING ========================= */
  GL.clearColor(0.0, 0.0, 0.0, 0.0);

  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);

  var time_prev = 0;
  var animate = function(time) {
      GL.viewport(0, 0, CANVAS.width, CANVAS.height);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      var dt = time - time_prev;
      time_prev = time;

      LIBS.rotateZ(MODEL_MATRIX, dt * LIBS.degToRad(0.0));
      LIBS.rotateY(MODEL_MATRIX2, dt * LIBS.degToRad(0.1));
      
      // Draw sphere
      GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 0, 0);

      GL.bindBuffer(GL.ARRAY_BUFFER, SPHERE_COLORS);
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 0, 0);

      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SPHERE_FACES);

      GL.uniformMatrix4fv(_PMatrix, false, PROJECTION_MATRIX);
      GL.uniformMatrix4fv(_VMatrix, false, VIEW_MATRIX);
      GL.uniformMatrix4fv(_MMatrix, false, MODEL_MATRIX);

      GL.drawElements(GL.TRIANGLES, tubeData.faces.length, GL.UNSIGNED_SHORT, 0);
      // Draw cylinder 2
      GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_VERTEX2);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 0, 0);

      GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_COLORS2);
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 0, 0);

      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CYLINDER_FACES2);

      GL.uniformMatrix4fv(_PMatrix, false, PROJECTION_MATRIX);
      GL.uniformMatrix4fv(_VMatrix, false, VIEW_MATRIX);
      GL.uniformMatrix4fv(_MMatrix, false, MODEL_MATRIX2);

      GL.drawElements(GL.TRIANGLES, cylinderData2.faces.length, GL.UNSIGNED_SHORT, 0);

      // Draw cylinder
      GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 0, 0);

      GL.bindBuffer(GL.ARRAY_BUFFER, CYLINDER_COLORS);
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 0, 0);

      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CYLINDER_FACES);

      GL.uniformMatrix4fv(_PMatrix, false, PROJECTION_MATRIX);
      GL.uniformMatrix4fv(_VMatrix, false, VIEW_MATRIX);
      GL.uniformMatrix4fv(_MMatrix, false, MODEL_MATRIX2);

      GL.drawElements(GL.TRIANGLES, cylinderData.faces.length, GL.UNSIGNED_SHORT, 0);

      GL.flush();

      window.requestAnimationFrame(animate);
  };

  animate(0);
}

window.addEventListener('load', main);
