"use strict";

var shadedCube = function() {

   var canvas;
   var gl;

   var numPositionsShape = 24; //number of vertices of my shape
   var numPositionsCylinder = 0; //number of vertices of cylinder (calculated after)

   var positionsArray = []; //array of vertices passed to vertex shader
   var normalsArray = []; //array of normals for each vertex
   var textureCoordinatesArray = []; //texture coordinate for each vertex
   var trianglesNormal = []; //array of triangle composed by the three vertex index in position array and its normal
   var indexPositionArray = []; //copy of position array with the index of vertex used

   var texSize = 256; //size of texture


   // Bump Data
   var data = new Array()
      for (var i = 0; i<= texSize; i++)  data[i] = new Array();
      for (var i = 0; i<= texSize; i++) 
         for (var j=0; j<=texSize; j++)
            data[i][j] = Math.random();

   // Bump Map Normals
   var normalst = new Array()
    for (var i=0; i<texSize; i++)  normalst[i] = new Array();
    for (var i=0; i<texSize; i++) 
      for ( var j = 0; j < texSize; j++)
         normalst[i][j] = new Array();
    for (var i=0; i<texSize; i++) 
      for ( var j = 0; j < texSize; j++) {
         normalst[i][j][0] = data[i][j]-data[i+1][j];
         normalst[i][j][1] = data[i][j]-data[i][j+1];
         normalst[i][j][2] = 1;
      }

   // Scale to Texture Coordinates
   for (var i=0; i<texSize; i++) for (var j=0; j<texSize; j++) {
      var d = 0;
      for(k=0;k<3;k++) 
         d+=normalst[i][j][k]*normalst[i][j][k];
      d = Math.sqrt(d);
      for(k=0;k<3;k++) 
         normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
   }

   // Normal Texture Array
   var normalsMap = new Uint8Array(3*texSize*texSize);
   for ( var i = 0; i < texSize; i++ )
      for ( var j = 0; j < texSize; j++ )
         for(var k =0; k<3; k++)
               normalsMap[3*texSize*i+3*j+k] = 255*normalst[i][j][k];

   // vertices used
   var vertices = [
         vec4(-0.5, 0.0,  0.3, 1.0),   //A 0
         vec4(-0.3, 0.7,  0.7, 1.0),   //B 1
         vec4(-0.3, 0.0,  0.99, 1.0),   //C 2
         vec4(-0.3, 0.0,  -0.5, 1.0),  //-C 3
         vec4(-0.3, -0.7,  0.2, 1.0),    //D 4
         vec4(0.3, 0.0,  0.7, 1.0),   //E 5
   ];

   var numVerticesShape = 6; //number of vertices used

   var cylinderCenter = vec4(-0.45, -0.4, 1.5, 1.0); //bottom center of cylinder

   //white light of the environment
   var lightPosition = vec4(6.0, 0.0, 3.0, 1.0);
   var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
   var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
   var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

   var lightPositionC1 = vec4(-0.45, -0.3, 1.5, 1.0); //bottom light in the cylinder
   var lightPositionC2 = vec4(-0.45, 0.0, 1.5, 1.0); //center light in the cylinder
   var lightPositionC3 = vec4(-0.45, -0.3, 1.5, 1.0); //top light in the cylinder

   //property of the light in the cylinder
   var lightAmbientC = vec4(0.0, 0.0, 0.0, 1.0);
   var lightDiffuseC = vec4(1.0, 0.0, 0.0, 1.0);
   var lightSpecularC = vec4(1.0, 0.0, 0.0, 1.0);

   //property of the material of the my shape
   var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
   var materialDiffuse = vec4(0.4, 0.5, 0.8, 1.0);
   var materialSpecular = vec4(0.5, 0.6, 0.9, 1.0);
   var materialShininess = 50.0;

   //property of the material of the cylinder
   var materialAmbient2 = vec4(1.0, 1.0, 1.0, 1.0);
   var materialDiffuse2 = vec4(0.8, 0.8, 0.8, 1.0);
   var materialSpecular2 = vec4(0.8, 0.8, 0.8, 1.0);
   var materialShininess2 = 50.0;

   //result of light environment and material for cylinder
   var ambientProduct2;
   var diffuseProduct2;
   var specularProduct2;
   
   //result of light environment and material for my shape
   var ambientProduct;
   var diffuseProduct;
   var specularProduct;
   
   //result of light emitted by the cylinder and material for my shape
   var ambientProductC;
   var diffuseProductC;
   var specularProductC;

   var modelViewMatrix, projectionMatrix;
   var program;

   var xAxis = 0;
   var yAxis = 1;
   var zAxis = 2;
   var axis = 0;
   var theta = vec3(0, 0, 0);
   var rotationDirection = 1.0;
   
   var baricenter = vec4(0.0, 0.0, 0.0, 1.0); //baricenter of my shape inizilized at 0
   
   //slider value for perspective and viewer position control
   var near = 0.3;
   var far = 3.0;
   var radius = 2.5;
   var thetaViewerPos = 0.0;
   var phiViewerPos = 0.0;
   var fovy = 55.0;
   var aspect = 1.0;

   var viewerPos;
   var at;
   const up = vec3(0.0, 1.0, 0.0);

   var flag = false;
   var perVertexFragmentFlag = 1.0; //if 1.0 is computed "per vertex shading", else "per fragment shading"
   var bumpMapOnOff = 1.0; //if 1.0 the bumpmap is actived otherwise not
   var neonOnOff = 0.0; //if 1.0 the neon is on, otherwise is off

   var normalTri = []; //array of normals perpendicular to the triangle. Used in TBN for texture mapping
   var tangent = []; //array of tangent of triangles

   init();

   //configure texture the texture
   function configureTexture( image ) {
      var texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   }
   
   //create triangle follow the right hand rule and for each vertex
   function tri(a, b, c) {
      var t1 = subtract(vertices[b], vertices[a]);
      var t2 = subtract(vertices[c], vertices[b]);
      var normal = cross(t1, t2);
      normal = vec3(normal);

      trianglesNormal.push([[a, b, c], normal])
      positionsArray.push(vertices[a]);
      indexPositionArray.push(a)
      tangent.push(subtract(vertices[b], vertices[a]));
      normalTri.push(normal);  

      positionsArray.push(vertices[b]);
      indexPositionArray.push(b)
      tangent.push(subtract(vertices[c], vertices[b]));
      normalTri.push(normal);  

      positionsArray.push(vertices[c]);
      indexPositionArray.push(c);
      tangent.push(subtract(vertices[a], vertices[c]));
      normalTri.push(normal);  

      textureCoordinate(vertices[a], vertices[b], vertices[c]);
   }

   //map the triangles in texture coordinate
   function textureCoordinate(a, b, c) {
      var a0p = 0.0;
      var a1p = 0.0
      var b0p = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2));
      var b1p = 0.0;
      var c0p = ((b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1]) + (b[2] - a[2]) * (c[2] - a[2])) / b0p;
      var c1p = Math.sqrt(Math.pow(c[0] - a[0], 2) + Math.pow(c[1] - a[1], 2) + Math.pow(c[2] - a[2], 2) - Math.pow(c0p, 2))

      var center = vec2((a0p + b0p + c0p)/3.0, (a1p + b1p + c1p)/3.0);
      
      var distanceCenter_a = Math.sqrt(Math.pow(a0p - center[0], 2) + Math.pow(a1p - center[1], 2));
      var distanceCenter_b = Math.sqrt(Math.pow(b0p - center[0], 2) + Math.pow(b1p - center[1], 2));
      var distanceCenter_c = Math.sqrt(Math.pow(c0p - center[0], 2) + Math.pow(c1p - center[1], 2));
      var maxDist = distanceCenter_a;
      if (distanceCenter_b > maxDist) {
         maxDist = distanceCenter_b;
      }
      if (distanceCenter_c > maxDist) {
         maxDist = distanceCenter_c;
      }
      
      var new_a = vec2((a0p-center[0])/maxDist, (a1p-center[1])/maxDist);
      var new_b = vec2((b0p-center[0])/maxDist, (b1p-center[1])/maxDist);
      var new_c = vec2((c0p-center[0])/maxDist, (c1p-center[1])/maxDist);

      var sxMin = new_a[0];
      if (new_b[0] < sxMin) {
         sxMin = new_b[0];
      }
      if (new_c[0] < sxMin) {
         sxMin = new_c[0];
      }
      new_a = vec2(new_a[0] + Math.abs(sxMin), new_a[1]);
      new_b = vec2(new_b[0] + Math.abs(sxMin), new_b[1]);
      new_c = vec2(new_c[0] + Math.abs(sxMin), new_c[1]);
      var botMin = new_a[1];
      if (new_b[1] < botMin) {
         botMin = new_b[1];
      }
      if (new_c[1] < botMin) {
         botMin = new_c[1];
      }
      new_a = vec2(new_a[0], new_a[1] + Math.abs(botMin));
      new_b = vec2(new_b[0], new_b[1] + Math.abs(botMin));
      new_c = vec2(new_c[0], new_c[1] + Math.abs(botMin));
      
      textureCoordinatesArray.push(vec2(new_a[0], new_a[1]));
      textureCoordinatesArray.push(vec2(new_b[0], new_b[1]));
      textureCoordinatesArray.push(vec2(new_c[0], new_c[1]));      
   }

   //for each vertex calculate the normal as the average of each normal of the triangles to which it belongs
   function calculateNormal() {
      for (var i = 0; i<indexPositionArray.length; i++) {
         var sum = vec3(0.0, 0.0, 0.0);
         var cont = 0.0;
         for (var j = 0; j<trianglesNormal.length; j++) {
            if (trianglesNormal[j][0].includes(indexPositionArray[i])) {
               sum = vec3(sum[0] + trianglesNormal[j][1][0],
                  sum[1] + trianglesNormal[j][1][1],
                  sum[2] + trianglesNormal[j][1][2] );
               cont+=1.0;
            }
         }
         sum = vec3(sum[0]/cont, sum[1]/cont, sum[2]/cont);
         normalsArray.push(sum);
      }
   }

   //this function creat the shape, the cylinder, calculate the normals and the baricenter of the shape
   function createShapes() {
      tri(0, 2, 1);
      tri(0, 1, 3);
      tri(2, 0, 4);
      tri(0, 3, 4);
      tri(2, 5, 1);
      tri(2, 4, 5);
      tri(3, 1, 5);
      tri(3, 5, 4);
      
      cylinder(cylinderCenter, 0.8, 0.07);


      calculateNormal();
      calculateBaricenter();
   }

   //create cylinder with input:
   //center: the coordinate of the center bot of the cylinder
   //height: the height of the cylinder
   //radius: the radius of the cylinder
   function cylinder(center, height, radius) {
      var centerTop = vec4(center[0], center[1] + height, center[2], center[3]);
      var centerBot = center;
      var circleTop = circle(centerTop, false, radius);
      var circleBot = circle(centerBot, true, radius);
      for (var i = 0; i < circleTop.length-1; i++) {
         tri(circleTop[i], 
            circleBot[i+1],
            circleBot[i]);

         tri(circleTop[i], 
            circleTop[i+1],
            circleBot[i+1]);
      }
      tri(circleTop[circleTop.length-1], 
         circleBot[0],
         circleBot[circleBot.length-1]);

      tri(circleTop[circleTop.length-1], 
         circleTop[0],
         circleBot[0]);   
      numPositionsCylinder += circleTop.length*3*2;
   }

   //create a circle
   //center: the coordinate of the center
   //bottom: if true is a bottom circl of cylinder, if false the top
   //radius: the radius of circle
   function circle(center, bottom, radius) {
      var out = [];
      var indexStart = vertices.length;
      var numTriangle = 50;
      vertices.push(center);
      var radius = radius;
      for (var i = 0.0; i<2*Math.PI; i+=(2*Math.PI)/numTriangle) {
         var point = vec4(radius*Math.cos(i) + center[0], center[1], radius*Math.sin(i) + center[2], 1.0);
         vertices.push(point);
         out.push(vertices.length-1);
      }
      if (!bottom) {
         for (var i = indexStart+1; i < vertices.length-1; i ++) {
            tri(indexStart, i+1, i);
         }
         tri(indexStart, vertices.length-1, indexStart+1);
      } else {
         for (var i = indexStart+1; i < vertices.length-1; i ++) {
            tri(indexStart, i, i+1);
         }
         tri(indexStart, indexStart+1, vertices.length-1);
      }
      
      numPositionsCylinder += numTriangle*3;
      return out;
   }

   //calculate the baricenter as the avarage of all points of the shape
   function calculateBaricenter() {
      var sum = vec3(0.0, 0.0, 0.0);
      var cont = 0.0;
      for (var i = 0; i < numVerticesShape; i++) {
         sum = vec3(sum[0] + vertices[i][0], sum[1] + vertices[i][1], sum[2] + vertices[i][2])
         cont++;
      }
      baricenter = vec4(sum[0] / cont, sum[1] / cont, sum[2] / cont, 1.0);
      at = vec3(baricenter[0], baricenter[1], baricenter[2]);
   }
   

   function init() {
      canvas = document.getElementById("gl-canvas");

      gl = canvas.getContext('webgl2');
      if (!gl) alert( "WebGL 2.0 isn't available");


      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.7, 0.7, 0.7, 1.0);

      gl.enable(gl.DEPTH_TEST);

      program = initShaders(gl, "vertex-shader", "fragment-shader");
      gl.useProgram(program);

      createShapes();

      //buffer for normals
      var nBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

      var normalLoc = gl.getAttribLocation(program, "aNormal");
      gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(normalLoc);

      //buffer for positions of vertices
      var vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

      var positionLoc = gl.getAttribLocation(program, "aPosition");
      gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionLoc);

      //buffer for texture coordinates associated at each positionsArray's vertex
      var tBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinatesArray), gl.STATIC_DRAW);

      var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texCoordLoc);

      //buffer for normals perpendicular to triangles
      var trBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, trBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(normalTri), gl.STATIC_DRAW);

      var normalTriLoc = gl.getAttribLocation(program, "aNormalTri");
      gl.vertexAttribPointer(normalTriLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(normalTriLoc);

      //buffer for the tangents of the triangles
      var tanBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tanBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(tangent), gl.STATIC_DRAW);

      var tangentLoc = gl.getAttribLocation(program, "aObjTangent");
      gl.vertexAttribPointer(tangentLoc, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(tangentLoc);

      //all product between materials and lights
      ambientProduct = mult(lightAmbient, materialAmbient);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
      specularProduct = mult(lightSpecular, materialSpecular);

      ambientProductC = mult(lightAmbientC, materialAmbient);
      diffuseProductC = mult(lightDiffuseC, materialDiffuse);
      specularProductC = mult(lightSpecularC, materialSpecular);

      ambientProduct2 = mult(lightAmbient, materialAmbient2);
      diffuseProduct2 = mult(lightDiffuse, materialDiffuse2);
      specularProduct2 = mult(lightSpecular, materialSpecular2);

      //some uniform variable passed
      gl.uniform4fv(gl.getUniformLocation(program, "uLightAmbient"), lightAmbient);
      gl.uniform4fv(gl.getUniformLocation(program, "uLightAmbientC"), lightAmbientC);
      gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductC1"), ambientProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductC1"), diffuseProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductC1"), specularProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductC2"), ambientProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductC2"), diffuseProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductC2"), specularProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductC3"), ambientProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductC3"), diffuseProductC);
      gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductC3"), specularProductC);

      //button to handle the rotations
      document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
      document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
      document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
      document.getElementById("ButtonT").onclick = function(){flag = !flag;};
      document.getElementById("ButtonR").onclick = function(){rotationDirection = rotationDirection*-1.0;};

      //configure texture with the normal map calculated
      configureTexture(normalsMap);
      
      //all slider
      //for double cut set:
         //zNear = 2.91; 
         //zFar = 3; 
         //radius = 6.35; 
         //theta = 0; 
         //phi = 0;
         //fov = 10;
         //aspect = 1;
      document.getElementById("zFarSlider").onchange = function(event) {
         far = event.target.value;
         var elt = document.getElementById("zFar");
         elt.innerHTML = "<div> zFar = " + far + "</div>";
      };
      document.getElementById("zNearSlider").onchange = function(event) {
         near = event.target.value;
         var elt = document.getElementById("zNear");
         elt.innerHTML = "<div> zNear = " + near + "</div>";
      };
      document.getElementById("radiusSlider").onchange = function(event) {
         radius = event.target.value;
         var elt = document.getElementById("radius");
         elt.innerHTML = "<div> radius = " + radius + "</div>";
      };
      document.getElementById("thetaSlider").onchange = function(event) {
         thetaViewerPos = event.target.value* Math.PI/180.0;
         var elt = document.getElementById("theta");
         elt.innerHTML = "<div> theta = " + Math.round((thetaViewerPos * (180/Math.PI))) + "</div>";
      };
      document.getElementById("phiSlider").onchange = function(event) {
         phiViewerPos = event.target.value* Math.PI/180.0;
         var elt = document.getElementById("phi");
         elt.innerHTML = "<div> phi = " + Math.round((phiViewerPos * (180/Math.PI))) + "</div>";
      };
      document.getElementById("aspectSlider").onchange = function(event) {
         aspect = event.target.value;
         var elt = document.getElementById("aspect");
         elt.innerHTML = "<div> aspect = " + aspect + "</div>";
      };
      document.getElementById("fovSlider").onchange = function(event) {
         fovy = event.target.value;
         var elt = document.getElementById("fov");
         elt.innerHTML = "<div> fov = " + fovy + "</div>";
      };

      //button to turn on/off the bumpmap
      document.getElementById("ButtonBumpTexture").onclick = function() {
         var onOff;
         if (bumpMapOnOff == 1.0) {
            onOff = "on";
         } 
         else {
            onOff = "off"
         }
         bumpMapOnOff = (bumpMapOnOff + 1) % 2;
         var elt = document.getElementById("ButtonBumpTexture");
         elt.innerHTML = "Turn " + onOff + " bump texture";
      }

      //button to turn on/off the neon light
      document.getElementById("ButtonNeon").onclick = function() { 
         var onOff;
         if (neonOnOff == 1.0) {
            onOff = "on";
         } 
         else {
            onOff = "off"
         }
         neonOnOff = (neonOnOff + 1) % 2;
         var elt = document.getElementById("ButtonNeon");
         elt.innerHTML = "Turn " + onOff + " light cylindrical neon";
      }

      //button to change into per vertex/per fragment shading
      document.getElementById("ButtonPerVertexFragment").onclick = function() {
         var fraver;
         if (perVertexFragmentFlag == 1.0) {
            fraver = "vertex";
         } 
         else {
            fraver = "fragment"
         }
         perVertexFragmentFlag = (perVertexFragmentFlag + 1) % 2;
         var elt = document.getElementById("ButtonPerVertexFragment");
         elt.innerHTML = "Change into \"per " + fraver + "\" shading";
      };
      render();
   }

   function render(){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //rotation of object
      if(flag) theta[axis] += rotationDirection*0.3;

      modelViewMatrix = mat4();

      //calculate viewer pos based on the theta and phi setted by slider
      viewerPos = vec3(radius*Math.sin(thetaViewerPos)*Math.cos(phiViewerPos),
                     radius*Math.sin(thetaViewerPos)*Math.sin(phiViewerPos),
                     radius*Math.cos(thetaViewerPos));
         
      //look at the baricenter of the shape
      modelViewMatrix = lookAt(viewerPos, at, up);

      projectionMatrix = perspective(fovy, aspect, near, far);

      //fix the light in a point also if the viewer position change
      var lightPositionv2 = mult(modelViewMatrix, lightPosition);
      var lightPositionC1v2 = mult(modelViewMatrix, lightPositionC1);
      var lightPositionC2v2 = mult(modelViewMatrix, lightPositionC2);
      var lightPositionC3v2 = mult(modelViewMatrix, lightPositionC3);
      
      //rotate around the baricenter
      modelViewMatrix = mult(modelViewMatrix, translate(baricenter[0], baricenter[1], baricenter[2]));
      modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
      modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
      modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));
      modelViewMatrix = mult(modelViewMatrix, translate(-baricenter[0], -baricenter[1], -baricenter[2]));

      var nMatrix = normalMatrix(modelViewMatrix, true);

      //all the uniform variable passed that change over time
      gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPositionv2);
      gl.uniform4fv(gl.getUniformLocation(program, "uLightPositionC1"), lightPositionC1v2);
      gl.uniform4fv(gl.getUniformLocation(program, "uLightPositionC2"), lightPositionC2v2);
      gl.uniform4fv(gl.getUniformLocation(program, "uLightPositionC3"), lightPositionC3v2);
      gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));
      gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));         
      gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));            
      gl.uniform1f(gl.getUniformLocation(program, "uPerVertexFragmentFlag"), perVertexFragmentFlag);
      gl.uniform1f(gl.getUniformLocation(program, "uBumpOnOff"), bumpMapOnOff);
      gl.uniform1f(gl.getUniformLocation(program, "uNeonOnOff"), neonOnOff);
      gl.uniform1f(gl.getUniformLocation(program, "uFirstShape"), 1.0);      
      gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct);
      gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);
      gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct);
      gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
      
      //draw first shape
      gl.drawArrays(gl.TRIANGLES, 0, numPositionsShape);

      //second shape different parameters
      modelViewMatrix = lookAt(viewerPos, at, up);
      gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct2);
      gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct2);
      gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct2);
      gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess2);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));
      gl.uniform1f(gl.getUniformLocation(program, "uBumpOnOff"), 0.0); //always off bump texture for cylinder
      gl.uniform1f(gl.getUniformLocation(program, "uFirstShape"), 0.0);
      
      //draw second shape
      gl.drawArrays(gl.TRIANGLES, numPositionsShape, numPositionsCylinder);

      requestAnimationFrame(render);
   }
}

shadedCube();
