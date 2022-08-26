"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

/* ##################################################
   All Id and properties of the object elements start
   ################################################## */

// sheep
var torsoId = 0; 
var torsoId2 = 11; // used only for rotation wrt y-axis
var headId  = 1;
var tailId = 2;

    // frontward leg
var leftFrontwardUpperLegId = 3;
var rightFrontwardUpperLegId = 4;
var leftBackwardUpperLegId = 5;
var rightBackwardUpperLegId = 6;

    // backward leg
var leftFrontwardLowerLegId = 7;
var rightFrontwardLowerLegId = 8;
var leftBackwardLowerLegId = 9;
var rightBackwardLowerLegId = 10;

// field
var fieldId = 11;

// fence
var fenceTopId = 12;
var fenceLeftId = 13;
var fenceRightId = 14;

// properties

// fence
var verticalFenceX = 0.7;
var verticalFenceY = 4.5;
var verticalFenceZ = 1.3;

var horizontalFenceX = 1.3;
var horizontalFenceY = 0.7;
var horizontalFenceZ = 6;

// field
var fieldX = 100;
var fieldY = 0.01;
var fieldZ = 100;

// sheep
var torsoX = 5.0;
var torsoY = 3.0;
var torsoZ = 3.0;

var upperLegX  = 0.9;
var upperLegY = 2.1;
var upperLegZ = 0.9;

var lowerLegX  = 0.5;
var lowerLegY  = 1.0;
var lowerLegZ = 0.5;

var headX = 1.5;
var headY = 1.7;
var headZ = 1.7;

var tailX = 1.5;
var tailY = 0.8;
var tailZ = 0.8;

// number of nodes
var numNodes = 15;
var angle = 0;

var theta = [0, 0, 70, 0, 0, 0, 0, 0, 0, 0, 0, 270];
/* ################################################
   All Id and properties of the object elements end
   ################################################ */

var numVertices = 24;

// stack used for the hierarchical structure of shapes to store the model view matrix
var stack = [];

// array of shapes
var figure = [];

// Initialise all shapes in null nodes of the tree and populate the figure array
for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

// perspective parameters
var near = 0.3;
var far = 200.0;
var radius = 50.0;
var thetaViewerPos = 0.0;
var phiViewerPos = 0.0;
var fovy = 45.0;
var aspect = 1.0;
var viewerPos;
var at = vec3(0,0,0);
const up = vec3(0.0, 1.0, 0.0);


var vBuffer;
var modelViewLoc;

var pointsArray = [];

// normals and tangents used for bumpmapping
var normals = [];
var tangents = [];

/* ####################################
   light and materials properties start
   #################################### */
//sun properties
var sunT = 90; // sun theta initial angle
var sunR = 220; // sun circle radius
var sunSpeed = 0.035; // speed of the sun
// initial light properties
var lightPositionWithMV; // used not to move the light together with the viewer
var lightPosition = vec4(
                        sunR*Math.cos(sunT*Math.PI/180.0), 
                        sunR*Math.sin(sunT*Math.PI/180.0), 0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// properties of the day and night cycle
// all colors
var nightColor = [0.066, 0.101, 0.294]; // night clear color
var dtColor = [0.4, 0.8, 0.9];          // daytime clear color
var ssrColor = [0.9, 0.6, 0.3];         // sunrise or sunset clear color
var nightAmbient = [0.1, 0.1, 0.1];     // night ambient light color
var dayAmbient = [0.2, 0.2, 0.2];       // daytime ambient light color
var lightDS = [1.0, 1.0, 1.0];          // daytime diffuse and specular light color
var ssrDS = [0.9, 0.6, 0.3];            // sunrise and sunset diffuse and specular color

var nightStep = 20/sunSpeed; // night color steps
var ssrStep = 30/sunSpeed; // sunset or sunrise color steps

// RGB night color change step
var redNightStep = (ssrColor[0] - nightColor[0]) / nightStep;
var greenNightStep = (ssrColor[1] - nightColor[1]) / nightStep;
var blueNightStep = (ssrColor[2] - nightColor[2]) / nightStep;

// RGB sunrise or sunset color change step
var redSsrStep = (dtColor[0] - ssrColor[0]) / ssrStep;
var greenSsrStep = (dtColor[1] - ssrColor[1]) / ssrStep;
var blueSsrStep = (dtColor[2] - ssrColor[2]) / ssrStep;

// RGB night ambient color change step
var rnaStep = (nightAmbient[0] - dayAmbient[0]) / nightStep;
var gnaStep = (nightAmbient[1] - dayAmbient[1]) / nightStep;
var bnaStep = (nightAmbient[2] - dayAmbient[2]) / nightStep;

// RGB daytime diffuse and specular change step
var rdsStep = (lightDS[0] - ssrDS[0]) / ssrStep;
var gdsStep = (lightDS[1] - ssrDS[1]) / ssrStep;
var bdsStep = (lightDS[2] - ssrDS[2]) / ssrStep;

// flag for day and night
var night = false;

// sheep's wool material properties
var woolAmbientMaterial = vec4(3.0, 3.0, 3.0, 1.0);
var woolDiffuseMaterial = vec4(0.3, 0.3, 0.3, 1.0);
var woolSpecularMaterial = vec4(0.1, 0.1, 0.1, 1.0);
var woolShininess = 100;

// sheep's feet material properties
var feetAmbientMaterial = vec4(0.749, 0.690, 0.631, 1.0);
var feetDiffuseMaterial = vec4(0.749, 0.690, 0.631, 1.0);
var feetSpecularMaterial = vec4(0.243, 0.168, 0.137, 1.0);
var feetShininess = 100;

// fence material properties
var fenceAmbientMaterial = vec4(0.619, 0.505, 0.439, 1.0);
var fenceDiffuseMaterial = vec4(0.619, 0.505, 0.439, 1.0);
var fenceSpecularMaterial = vec4(0.1, 0.1, 0.1, 1.0);
var fenceShininess = 100;

// field material properties
var fieldAmbientMaterial = vec4(0, 3, 0, 1.0);
var fieldDiffuseMaterial = vec4(0.0, 0.15, 0.0, 1.0);
var fieldSpecularMaterial = vec4(0.0, 0.01, 0.0, 1.0);
var fieldShininess = 100;
/* ##################################
   light and materials properties end
   ################################## */

// nxn dimensions of different textures
var texSizeField = 512;
var texSizeWool = 64;
var texSizeFeet = 32;
var texSizeFace = 8;
var texSizeFence = 32;

// normals maps of different textures
var normalsMapField = normalMap("field", texSizeField);
var normalsMapWool = normalMap("wool", texSizeWool);
var normalsMapFeet = normalMap("feet", texSizeFeet);
var normalsMapFence = normalMap("fence", texSizeFence);
// texture for the face
var imageFace = createTextureFace(texSizeFace);

// different textures to pass
var textureWool;
var textureFeet;
var textureField;
var textureFace;
var textureFence;

// texture coordinate
var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 1),
    vec2(0, 1)
];

// array of textur coordinate for each point
var texCoordsArray = [];

/* ##########################
   animation parameters start
   ########################## */
var fpsSlider = 90;             // number of fps and therfore the speed
var torsoPosX = 10;             // x-position of sheep's torso
var torsoPosY = 0;              // y-position of sheep's torso
var torsoPosZ = 0;              // z-position of sheep's torso
var torsoPosxStart = 10;        // initial x-position of sheep's torso
var walkDirection = 1;

var walkingSpeed = 0.1;         // walking speed
var soaringSpeed = 2.0;         // soaring speed
var legSpeed = 2;               // leg speed

var legDirection = 1;           // direction of leg movement

var jumpPosition = 6;           // x-position where the sheep will jump
var jumpRotation = 0;           // degree of jump rotation
var jumpPhase = 1;              // if 1 is in the ascending part, if -1 in the descending part

// when animation button is clicked
var walk = false;               // walk state
var soaring = false;            // soaring state
var jump = false;               // jump state
var comeBack1 = false;          // come back walk first part
var comeBack2 = false;          // come back walk second part
var comeBack3 = false;          // come back walk third part

// when animation button is not clicked
var notAnimationWalk1 = true;   // walk state in z direction
var notAnimationWalk2 = false;  // walk state in -z direction
var startAnimation1 = false;    // clicked button, the sheep rotate towards the starting point
var startAnimation2 = false;    // walk towars the starting point then rotate towards the fence
var oneTime = true;             // variable used to disable the animation button 
                                // in order not to create bugs while the animation is running
/* ########################
   animation parameters end
   ######################## */

// function that creates a node in a hierarchical tree
function createNode(transform, render, sibling, child){
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

// function that create the hierarchical tree wiht all the model view matrix
function initNodes(Id) {
    var m = mat4(); // starting model view matrix

    switch(Id) {
        case torsoId:
            // double rotation:
                // 1. wrt y-axis of the barycenter of the sheep's torso
                // 2. wrt z-axis of leg joint, back or front depending 
                //    on the value of jumpPhase
            m = mult(m, translate(
                torsoPosX+ (jumpPhase)*(torsoX*0.25), 
                torsoPosY + 0.5*torsoY + upperLegY + 
                    lowerLegY - upperLegX*0.5 - lowerLegX*0.5 -
                    torsoY*0.5 + upperLegX*0.5, 
                torsoPosZ));

            m = mult(m, rotate(theta[torsoId], vec3(0, 0, 1)));
            m = mult(m, rotate(theta[torsoId2], vec3(0, 1, 0)));

            m = mult(m, translate(
                -torsoPosX + (jumpPhase)*(-torsoX*0.25), 
                -(torsoPosY +0.5*torsoY + upperLegY + 
                    lowerLegY - upperLegX*0.5 - lowerLegX*0.5) + 
                    torsoY*0.5 - upperLegX*0.5,
                -torsoPosZ));

            // translate in a initial position
            m = mult(m, translate(
                torsoPosX,
                torsoPosY + 0.5*torsoY + upperLegY + lowerLegY - 
                    upperLegX*0.5 - lowerLegX*0.5, 
                torsoPosZ));

            figure[torsoId] = createNode( m, torso, null, headId );
            break;

        case headId:
            // rotate wrt z-axis of the barycenter of the sheep's head
            m = mult(m, translate(-torsoX*0.5 - headX*0.5, torsoY*0.5, 0));
            m = mult(m, rotate(theta[headId], vec3(0, 0, 1)));
            m = mult(m, translate(torsoX*0.5 + headX*0.5, -torsoY*0.5, 0));
            figure[headId] = createNode( m, head, tailId, null);
            break;

        case tailId:
            // rotate wrt z-axis of the sheep's tail joint
            m = mult(m, translate(0.5*torsoX - 0.5*tailY, torsoY*0.5 - tailY*0.7, 0.0));
            m = mult(m, rotate(theta[tailId], vec3(0, 0, 1)));
            m = mult(m, translate(-0.5*torsoX+ 0.5*tailY, -torsoY*0.5 + tailY*0.7, 0.0));
            figure[tailId] = createNode( m, tail, leftFrontwardUpperLegId, null );
            break;

        case leftFrontwardUpperLegId:        
            // rotate wrt z-axis of the sheep's left frontward upper leg joint    
            m = mult(m, translate(-torsoX*0.25, -torsoY*0.5 + upperLegX*0.5, torsoZ*0.25));
            m = mult(m, rotate(theta[leftFrontwardUpperLegId], vec3(0, 0, 1)));
            m = mult(m, translate(+torsoX*0.25, + torsoY*0.5 - upperLegX*0.5, -torsoZ*0.25));
            
            // translate at the front left position
            m = mult(m, translate(-torsoX*0.25, -torsoY*0.5 - upperLegY*0.5 + upperLegX*0.5, torsoZ*0.25));
            figure[leftFrontwardUpperLegId] = createNode( m, leftFrontwardUpperLeg, rightFrontwardUpperLegId, leftFrontwardLowerLegId );
            break;

        case rightFrontwardUpperLegId:
            // rotate wrt z-axis of the sheep's right frontward upper leg joint  
            m = mult(m, translate(-torsoX*0.25, -torsoY*0.5 + upperLegX*0.5, -torsoZ*0.25));
            m = mult(m, rotate(theta[rightFrontwardUpperLegId], vec3(0, 0, 1)));
            m = mult(m, translate(+torsoX*0.25, + torsoY*0.5 - upperLegX*0.5, +torsoZ*0.25));
            
            // translate at the front right position
            m = mult(m, translate(-torsoX*0.25, -torsoY*0.5 - upperLegY*0.5 + upperLegX*0.5, -torsoZ*0.25));
            figure[rightFrontwardUpperLegId] = createNode( m, rightFrontwardUpperLeg, leftBackwardUpperLegId, rightFrontwardLowerLegId );
            break;

        case leftBackwardUpperLegId:
            // rotate wrt z-axis of the sheep's left backward upper leg joint  
            m = mult(m, translate(+torsoX*0.25, -torsoY*0.5 + upperLegX*0.5, +torsoZ*0.25));
            m = mult(m, rotate(theta[leftBackwardUpperLegId], vec3(0, 0, 1)));
            m = mult(m, translate(-torsoX*0.25, + torsoY*0.5 - upperLegX*0.5, -torsoZ*0.25));
            
            // translate at the back left position
            m = mult(m, translate(+torsoX*0.25, -torsoY*0.5 - upperLegY*0.5 + upperLegX*0.5, +torsoZ*0.25));
            figure[leftBackwardUpperLegId] = createNode( m, leftBackwardUpperLeg, rightBackwardUpperLegId, leftBackwardLowerLegId );
            break;

        case rightBackwardUpperLegId:
            // rotate wrt z-axis of the sheep's right backward upper leg joint  
            m = mult(m, translate(+torsoX*0.25, -torsoY*0.5 + upperLegX*0.5, -torsoZ*0.25));
            m = mult(m, rotate(theta[rightBackwardUpperLegId], vec3(0, 0, 1)));
            m = mult(m, translate(-torsoX*0.25, + torsoY*0.5 - upperLegX*0.5, +torsoZ*0.25));
            
            // translate at the back right position
            m = mult(m, translate(+torsoX*0.25, -torsoY*0.5 - upperLegY*0.5 + upperLegX*0.5, -torsoZ*0.25));
            figure[rightBackwardUpperLegId] = createNode( m, rightBackwardUpperLeg, null, rightBackwardLowerLegId );
            break;

        case leftFrontwardLowerLegId:
            // rotate wrt z-axis of the sheep's left frontward lower leg joint  
            m = mult(m, translate(0.0, -0.5*upperLegY + lowerLegX*0.5, 0.0));
            m = mult(m, rotate(theta[leftFrontwardLowerLegId], vec3(0, 0, 1)));
            m = mult(m, translate(0.0, +0.5*upperLegY - lowerLegX*0.5, 0.0));
            figure[leftFrontwardLowerLegId] = createNode( m, leftFrontwardLowerLeg, null, null );
            break;

        case rightFrontwardLowerLegId:
            // rotate wrt z-axis of the sheep's right frontward lower leg joint  
            m = mult(m, translate(0.0, -0.5*upperLegY + lowerLegX*0.5, 0.0));
            m = mult(m, rotate(theta[rightFrontwardLowerLegId], vec3(0, 0, 1)));
            m = mult(m, translate(0.0, +0.5*upperLegY - lowerLegX*0.5, 0.0));
            figure[rightFrontwardLowerLegId] = createNode( m, rightFrontwardLowerLeg, null, null );
            break;

        case leftBackwardLowerLegId:
            // rotate wrt z-axis of the sheep's left backward lower leg joint  
            m = mult(m, translate(0.0, -0.5*upperLegY + lowerLegX*0.5, 0.0));
            m = mult(m, rotate(theta[leftBackwardLowerLegId], vec3(0, 0, 1)));
            m = mult(m, translate(0.0, +0.5*upperLegY - lowerLegX*0.5, 0.0));
            figure[leftBackwardLowerLegId] = createNode( m, leftBackwardLowerLeg, null, null );
            break;

        case rightBackwardLowerLegId:
            // rotate wrt z-axis of the sheep's right backward lower leg joint  
            m = mult(m, translate(0.0, -0.5*upperLegY + lowerLegX*0.5, 0.0));
            m = mult(m, rotate(theta[rightBackwardLowerLegId], vec3(0, 0, 1)));
            m = mult(m, translate(0.0, +0.5*upperLegY - lowerLegX*0.5, 0.0));
            figure[rightBackwardLowerLegId] = createNode( m, rightBackwardLowerLeg, null, null );
            break;
        
        case fieldId:
            figure[fieldId] = createNode(m, field, torsoId, null );
            break;
        
        case fenceTopId:
            // translate above the field
            m = mult(m, translate(0, verticalFenceY*0.65, 0));
            figure[fenceTopId] = createNode(m, fenceTop, fieldId, fenceLeftId );
            break;
    
        case fenceLeftId:
            figure[fenceLeftId] = createNode(m, fenceLeft, fenceRightId, null );
            break;

        case fenceRightId:
            figure[fenceRightId] = createNode(m, fenceRight, null, null );
            break;
    }
}

// function that draw all the object wrt hierarchical tree
function traverse(Id) {
    // Basic step: I reached the leaf
    if(Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);

    // this parameter is passed hear to avoid the light rotating with the viewer
    var nMatrix = normalMatrix(modelViewMatrix, true);
    gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPositionWithMV);
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );

    figure[Id].render();

    // For the child, I want to influence the father's model view matrix
    if(figure[Id].child != null) 
        traverse(figure[Id].child);
    modelViewMatrix = stack.pop();

    // I give my brother the MV matrix of "our father".
    if(figure[Id].sibling != null) 
        traverse(figure[Id].sibling);
}

function torso() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "wool");

    instanceMatrix = mult(modelViewMatrix, scale(torsoX, torsoY, torsoZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "head");

    instanceMatrix = mult(modelViewMatrix, translate(-torsoX*0.5 -headX*0.5, torsoY*0.5, 0));
	instanceMatrix = mult(instanceMatrix, scale(headX, headY, headZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    for(var i =0; i<6; i++)
    {
        if (i == 0) {  // for side of head one texture
            gl.bindTexture(gl.TEXTURE_2D, textureWool);
            gl.uniform1f(gl.getUniformLocation(program, "uFace"), 0.0); // Im not the face
            gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
        } else if (i == 5){ // for face another texture
            gl.uniform1f(gl.getUniformLocation(program, "uFace"), 1.0); // Im the face
            gl.bindTexture(gl.TEXTURE_2D, textureFace);
            gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
        }
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    }
}

function tail() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "wool");

    instanceMatrix = mult(modelViewMatrix, translate(0.5*torsoX + 0.5*tailX - 0.5*tailY, torsoY*0.5 - tailY*0.7, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(tailX, tailY, tailZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftFrontwardUpperLeg() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "wool");

	instanceMatrix = mult(modelViewMatrix, scale(upperLegX, upperLegY, upperLegZ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontwardUpperLeg() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "wool");

	instanceMatrix = mult(modelViewMatrix, scale(upperLegX, upperLegY, upperLegZ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftBackwardUpperLeg() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "wool");

	instanceMatrix = mult(modelViewMatrix, scale(upperLegX, upperLegY, upperLegZ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackwardUpperLeg() {
    passMaterial(woolAmbientMaterial,
                woolDiffuseMaterial,
                woolSpecularMaterial,
                woolShininess, "wool");

	instanceMatrix = mult(modelViewMatrix, scale(upperLegX, upperLegY, upperLegZ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftFrontwardLowerLeg() {
    passMaterial(feetAmbientMaterial,
                feetDiffuseMaterial,
                feetSpecularMaterial,
                feetShininess, "feet");

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5*upperLegY - 0.5*lowerLegY + lowerLegX*0.5, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegX, lowerLegY, lowerLegZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontwardLowerLeg() {
    passMaterial(feetAmbientMaterial,
                feetDiffuseMaterial,
                feetSpecularMaterial,
                feetShininess, "feet");

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5*upperLegY - 0.5*lowerLegY + lowerLegX*0.5, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegX, lowerLegY, lowerLegZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftBackwardLowerLeg() {
    passMaterial(feetAmbientMaterial,
                feetDiffuseMaterial,
                feetSpecularMaterial,
                feetShininess, "feet");

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5*upperLegY - 0.5*lowerLegY + lowerLegX*0.5, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegX, lowerLegY, lowerLegZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackwardLowerLeg() {
    passMaterial(feetAmbientMaterial,
                feetDiffuseMaterial,
                feetSpecularMaterial,
                feetShininess, "feet");

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5*upperLegY - 0.5*lowerLegY + lowerLegX*0.5, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(lowerLegX, lowerLegY, lowerLegZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function field() {
    passMaterial(fieldAmbientMaterial,
                fieldDiffuseMaterial,
                fieldSpecularMaterial, 
                fieldShininess, "field");

	instanceMatrix = mult(modelViewMatrix, scale(fieldX, fieldY, fieldZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function fenceTop() {
    passMaterial(fenceAmbientMaterial,
                fenceDiffuseMaterial,
                fenceSpecularMaterial, 
                fenceShininess, "fence");

	instanceMatrix = mult(modelViewMatrix, scale(horizontalFenceX, horizontalFenceY, horizontalFenceZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function fenceLeft() {
    passMaterial(fenceAmbientMaterial,
                fenceDiffuseMaterial,
                fenceSpecularMaterial, 
                fenceShininess, "fence");

	instanceMatrix = mult(modelViewMatrix, translate(0, -verticalFenceY*0.15, horizontalFenceZ*0.2));
	instanceMatrix = mult(instanceMatrix, scale(verticalFenceX, verticalFenceY, verticalFenceZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function fenceRight() {
    passMaterial(fenceAmbientMaterial,
                fenceDiffuseMaterial,
                fenceSpecularMaterial, 
                fenceShininess, "fence");

	instanceMatrix = mult(modelViewMatrix, translate(0, -verticalFenceY*0.15, -horizontalFenceZ*0.2));
	instanceMatrix = mult(instanceMatrix, scale(verticalFenceX, verticalFenceY, verticalFenceZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// function that passes the material properties of the shape it calls to the shader
// and bind a correct texture wrt obj parameter: "field"; "wool"; "feet"; "fence";
function passMaterial(materialAmbient, materialDiffuse, materialSpecular, materialShininess, obj) {
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);

    // if Im here Im not the face
    gl.uniform1f(gl.getUniformLocation(program, "uFace"), 0.0);

    if (obj == "field") gl.bindTexture(gl.TEXTURE_2D, textureField);
    else if (obj == "wool") gl.bindTexture(gl.TEXTURE_2D, textureWool);
    else if (obj == "feet") gl.bindTexture(gl.TEXTURE_2D, textureFeet);
    else if (obj == "fence") gl.bindTexture(gl.TEXTURE_2D, textureFence);
}

// function that creates a square, its normals and its tangents
// for each point of which it is composed
function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[d], vertices[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);

    tangents.push(subtract(vertices[b], vertices[a]));
    tangents.push(subtract(vertices[c], vertices[b]));
    tangents.push(subtract(vertices[d], vertices[c]));
    tangents.push(subtract(vertices[a], vertices[d]));

    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}

// create a cube with six square
function cube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// function that configure the textures for the different class:
//     field;
//     wool;
//     feet;
//     face;
//     fence;
function configureTexture(image, texSize, obj) {
    if (obj == "field") {
        textureField = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureField);
    }
    else if (obj == "wool") {
        textureWool = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureWool);
    }
    else if (obj == "feet") {
        textureFeet = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureFeet);
    }
    else if (obj == "face") {
        textureFace = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureFace);
    }
    else if (obj == "fence") {
        textureFence = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureFence);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
}

// function that create a normals map. This function create a normal map considering 
// the value of obj and thus generating a different starting texture. All starting textures 
// are generated by combined mathematical functions 
function normalMap(obj, texSize) {
    // Bump Data
    var data = new Array()
    for (var i = 0; i<= texSize; i++)  data[i] = new Array();
    for (var i = 0; i<= texSize; i++) 
        for (var j=0; j<=texSize; j++) {
            if (obj == "field") data[i][j] =  1/Math.random()*Math.sin(i+j)*Math.cos(i+j);
            else if (obj == "wool") data[i][j] = Math.random()*Math.cos(j);
            else if (obj == "feet") {
                if (i % 3 == 0) data[i][j] = 0.3;
                else  data[i][j] = 0;
            } else if (obj == "fence") data[i][j] = Math.cos(i+j);
        }

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

    return normalsMap;
}

// The face of the sheep from the game "Minecraft" was generated by hand
// knowing it to be 8x8 in size.
function createTextureFace(texSize) {
    var out = new Uint8Array(3*texSize*texSize);
    for (var i = 0; i < texSize; i ++) {
        for (var j = 0; j < texSize; j ++) {
            if (j == 0 || j == 1 || j == 7) {
                out[3*texSize*i+3*j+0] = 230
                out[3*texSize*i+3*j+1] = 230;
                out[3*texSize*i+3*j+2] = 230;
            } else if (j == 2 || j == 4) {
                if (i == 0 || i == texSize-1) {
                    out[3*texSize*i+3*j+0] = 230
                    out[3*texSize*i+3*j+1] = 230;
                    out[3*texSize*i+3*j+2] = 230;
                } else {
                    out[3*texSize*i+3*j+0] = 223; 
                    out[3*texSize*i+3*j+1] = 166;
                    out[3*texSize*i+3*j+2] = 137;
                }
            } else if (j == 3) {
                if (i == 0 || i == texSize-1) {
                    out[3*texSize*i+3*j+0] = 230
                    out[3*texSize*i+3*j+1] = 230;
                    out[3*texSize*i+3*j+2] = 230;
                } else if (i == 1 || i == texSize-2) {
                    out[3*texSize*i+3*j+0] = 0
                    out[3*texSize*i+3*j+1] = 0;
                    out[3*texSize*i+3*j+2] = 0;
                } else if (i == 2 || i == texSize-3) {
                    out[3*texSize*i+3*j+0] = 255
                    out[3*texSize*i+3*j+1] = 255;
                    out[3*texSize*i+3*j+2] = 255;
                } else {
                    out[3*texSize*i+3*j+0] = 223; 
                    out[3*texSize*i+3*j+1] = 166;
                    out[3*texSize*i+3*j+2] = 137;
                }
            } else if (j == 5) {
                if (i == 0 || i == 1 || i == 7 || i == 6) {
                    out[3*texSize*i+3*j+0] = 230
                    out[3*texSize*i+3*j+1] = 230;
                    out[3*texSize*i+3*j+2] = 230;
                } else if (i == 2 || i == 5) {
                    out[3*texSize*i+3*j+0] = 223; 
                    out[3*texSize*i+3*j+1] = 166;
                    out[3*texSize*i+3*j+2] = 137;
                } else {
                    out[3*texSize*i+3*j+0] = 251; 
                    out[3*texSize*i+3*j+1] = 153;
                    out[3*texSize*i+3*j+2] = 192;
                }
            } else if (j == 6) {
                if (i == 0 || i == 1 || i == 7 || i == 6) {
                    out[3*texSize*i+3*j+0] = 230
                    out[3*texSize*i+3*j+1] = 230;
                    out[3*texSize*i+3*j+2] = 230;
                } else if (i == 2 || i == 5) {
                    out[3*texSize*i+3*j+0] = 223; 
                    out[3*texSize*i+3*j+1] = 166;
                    out[3*texSize*i+3*j+2] = 137;
                } else {
                    out[3*texSize*i+3*j+0] = 253; 
                    out[3*texSize*i+3*j+1] = 206;
                    out[3*texSize*i+3*j+2] = 222;
                }
            }
        }   
    }
    return out;
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    // configure all textures
    configureTexture(normalsMapField, texSizeField, "field");
    configureTexture(normalsMapWool, texSizeWool, "wool");
    configureTexture(normalsMapFeet, texSizeFeet, "feet");
    configureTexture(normalsMapFence, texSizeFence, "fence");
    configureTexture(imageFace, texSizeFace, "face");
    // at the start we consider everything as not "face"
    gl.uniform1f(gl.getUniformLocation(program, "uFace"), 0.0);

    // create cube
    cube();

    // vertices buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    // normals buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);
    
    // tangents buffer
    var tanBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tanBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tangents), gl.STATIC_DRAW);
    var tangentLoc = gl.getAttribLocation(program, "aObjTangent");
    gl.vertexAttribPointer(tangentLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentLoc);

    // texture coordinates buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    // slider and HTML component
    // slider that change the theta value of perspective view
    document.getElementById("thetaSlider").onchange = function(event) {
        thetaViewerPos = event.target.value* Math.PI/180.0;
        var elt = document.getElementById("theta");
        elt.innerHTML = "<div> theta = " + Math.round((thetaViewerPos * (180/Math.PI))) + "</div>";
    };

    // slider that change the phi value of perspective view
    document.getElementById("phiSlider").onchange = function(event) {
        phiViewerPos = event.target.value* Math.PI/180.0;
        var elt = document.getElementById("phi");
        elt.innerHTML = "<div> phi = " + Math.round((phiViewerPos * (180/Math.PI))) + "</div>";
    };

    // slider that change the fovy value of perspective view
    document.getElementById("fovSlider").onchange = function(event) {
        fovy = event.target.value;
        var elt = document.getElementById("fov");
        elt.innerHTML = "<div> fov = " + fovy + "</div>";
    };

    // slider that change the fps value of rendering
    document.getElementById("fpsSlider").onchange = function(event) {
        fpsSlider = event.target.value;
        var elt = document.getElementById("fps");
        elt.innerHTML = "<div> Speed - FPS = " + fpsSlider + " N.B. If you are using firefox, the frame rate is lower and therefore also the speed </div>";
    };

    // button that start the animation
    document.getElementById("animationButton").onclick = function(){
        // if clicked do nothing until oneTime is true again
        if (oneTime) {
            notAnimationWalk1 = false;
            notAnimationWalk2 = false;
            startAnimation1 = true;
            oneTime = false;
            var elt = document.getElementById("animation");
            elt.innerHTML = "<div> Animation started </div>";
        }
    };

    // initial nodes draw
    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}

// function that resets some animation values to the initial animation value
// this simplified some calculations and avoided some bugs due to the accumulation of errors
function resetAnimationParameters() {
    torsoPosX = 10;
    torsoPosY = 0;
    torsoPosZ = 0;
    legDirection = 1;
    jumpRotation = 0;
    jumpPhase = 1;
    // different from initial value because is the animation parameters
    theta = [0, 0, 70, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

// functin that move the leg alternatively back and forth
function walkLegFunction() {
    theta[leftFrontwardUpperLegId] += legDirection*legSpeed;
    theta[rightBackwardUpperLegId] += legDirection*legSpeed;
    theta[rightFrontwardUpperLegId] += -legDirection*legSpeed;
    theta[leftBackwardUpperLegId] += -legDirection*legSpeed;

    theta[leftFrontwardLowerLegId] += legDirection*legSpeed;
    theta[rightBackwardLowerLegId] += legDirection*legSpeed;
    theta[rightFrontwardLowerLegId] += -legDirection*legSpeed;
    theta[leftBackwardLowerLegId] += -legDirection*legSpeed;

    theta[headId] += legDirection*legSpeed*0.4;
    theta[tailId] += -legDirection*legSpeed*0.3;

    if (Math.abs(theta[leftFrontwardUpperLegId]) > 15 ) {
        legDirection = legDirection*(-1)
    }
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // viewer position
    viewerPos = vec3(radius*Math.sin(thetaViewerPos)*Math.cos(phiViewerPos),
                    (0.5*torsoY + upperLegY + lowerLegY - upperLegX*0.5 - lowerLegX*0.5) 
                        + radius*Math.sin(thetaViewerPos)*Math.sin(phiViewerPos),
                    radius*Math.cos(thetaViewerPos));
    
    // starting model view matrix
    modelViewMatrix = lookAt(viewerPos, at, up);

    // projection matrix with perspective
    projectionMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    // light position that not move with the viewer
    lightPositionWithMV = mult(modelViewMatrix, lightPosition);

    // if the angle of the sun is less than 0 then it changes from day to night or vice versa
    if (sunT < 0) {
        sunT = 180; 
        night = !night;
    }

    if (night) { // if is night
        // reset some colors value
        dtColor = [0.4, 0.8, 0.9];
        ssrColor = [0.9, 0.6, 0.3];
        nightAmbient = [0.1, 0.1, 0.1];
        dayAmbient = [0.2, 0.2, 0.2]
        lightDS = [1.0, 1.0, 1.0];
        ssrDS = [0.9, 0.6, 0.3];
        nightColor = [0.066, 0.101, 0.294];

        // night light
        lightDiffuse = vec4(nightColor[0], nightColor[1], nightColor[2], 1.0);
        lightDiffuse = vec4(nightColor[0], nightColor[1], nightColor[2], 1.0);
        lightAmbient = vec4(nightAmbient[0], nightAmbient[1], nightAmbient[2], 1.0);

        // night sky
        gl.clearColor(nightColor[0], nightColor[1], nightColor[2], 1.0);
    } else {
        if (sunT > 160) { // night shade to sunrise
            // reset some colors value
            dtColor = [0.4, 0.8, 0.9];
            ssrColor = [0.9, 0.6, 0.3];
            dayAmbient = [0.2, 0.2, 0.2]
            lightDS = [1.0, 1.0, 1.0];
            ssrDS = [0.9, 0.6, 0.3];

            // shade of the ambient light RGB
            nightAmbient[0] -= rnaStep;
            nightAmbient[1] -= gnaStep;
            nightAmbient[2] -= bnaStep;
            
            // shade of the sky color RGB
            nightColor[0] += redNightStep;
            nightColor[1] += greenNightStep;
            nightColor[2] += blueNightStep;

            // night light to sunrise
            lightDiffuse = vec4(nightColor[0], nightColor[1], nightColor[2], 1.0);
            lightSpecular = vec4(nightColor[0], nightColor[1], nightColor[2], 1.0);
            lightAmbient = vec4(nightAmbient[0], nightAmbient[1], nightAmbient[2], 1.0);

            // night shade to sunrise sky
            gl.clearColor(nightColor[0], nightColor[1], nightColor[2], 1.0);

        } 

        if (sunT <= 20) { // night shade sunset
            // reset some colors value
            nightColor = [0.066, 0.101, 0.294];
            ssrColor = [0.9, 0.6, 0.3];
            nightAmbient = [0.1, 0.1, 0.1];
            lightDS = [1.0, 1.0, 1.0];
            ssrDS = [0.9, 0.6, 0.3];

            // shade of the ambient light RGB
            dayAmbient[0] += rnaStep;
            dayAmbient[1] += gnaStep;
            dayAmbient[2] += bnaStep;
            
            // shade of the sky color RGB
            dtColor[0] -= redNightStep;
            dtColor[1] -= greenNightStep;
            dtColor[2] -= blueNightStep;

            // sunset light to night
            lightDiffuse = vec4(dtColor[0], dtColor[1], dtColor[2], 1.0);
            lightSpecular = vec4(dtColor[0], dtColor[1], dtColor[2], 1.0);
            lightAmbient = vec4(dayAmbient[0], dayAmbient[1], dayAmbient[2], 1.0);

            // sunset shade to sunset sky
            gl.clearColor(dtColor[0], dtColor[1], dtColor[2], 1.0);
        }

        if (sunT > 130 && sunT <= 160) { // sunrise
            // reset some colors value
            nightColor = [0.066, 0.101, 0.294];
            dtColor = [0.4, 0.8, 0.9];
            nightAmbient = [0.1, 0.1, 0.1];
            dayAmbient = [0.2, 0.2, 0.2];
            lightDS = [1.0, 1.0, 1.0];

            // shade of the ambient light RGB
            ssrDS[0] += rdsStep;
            ssrDS[1] += gdsStep;
            ssrDS[2] += bdsStep;

            // shade of the sky color RGB
            ssrColor[0] += redSsrStep;
            ssrColor[1] += greenSsrStep;
            ssrColor[2] += blueSsrStep;

            // sunrise light to daytime
            lightDiffuse = vec4(ssrDS[0], ssrDS[1], ssrDS[2], 1.0);
            lightSpecular = vec4(ssrDS[0], ssrDS[1], ssrDS[2], 1.0);
            lightAmbient = vec4(dayAmbient[0], dayAmbient[1], dayAmbient[2], 1.0);
            
            // sunrise shade to daytime sky
            gl.clearColor(ssrColor[0], ssrColor[1], ssrColor[2], 1.0);

        }

        if (sunT > 20 && sunT <= 50) { // sunset
            // reset some colors value
            nightColor = [0.066, 0.101, 0.294];
            ssrColor = [0.9, 0.6, 0.3, 1.0];
            nightAmbient = [0.1, 0.1, 0.1];
            dayAmbient = [0.2, 0.2, 0.2]
            ssrDS = [0.9, 0.6, 0.3];

            // shade of the ambient light RGB
            lightDS[0] -= rdsStep;
            lightDS[1] -= gdsStep;
            lightDS[2] -= bdsStep;

            // shade of the sky color RGB
            dtColor[0] -= redSsrStep;
            dtColor[1] -= greenSsrStep;
            dtColor[2] -= blueSsrStep;

            // daytime light to sunset
            lightDiffuse = vec4(lightDS[0], lightDS[1], lightDS[2], 1.0);
            lightSpecular = vec4(lightDS[0], lightDS[1], lightDS[2], 1.0);
            lightAmbient = vec4(dayAmbient[0], dayAmbient[1], dayAmbient[2], 1.0);

            // daytime shade to sunset sky
            gl.clearColor(dtColor[0], dtColor[1], dtColor[2], 1.0);
        }

        if (sunT<=130 && sunT>50) {
            // reset some colors value
            nightColor = [0.066, 0.101, 0.294];
            dtColor = [0.4, 0.8, 0.9];
            ssrColor = [0.9, 0.6, 0.3];
            nightAmbient = [0.1, 0.1, 0.1];
            dayAmbient = [0.2, 0.2, 0.2];
            lightDS = [1.0, 1.0, 1.0];
            ssrDS = [0.9, 0.6, 0.3];

            // daytime light
            lightDiffuse = vec4(lightDS[0], lightDS[1], lightDS[2], 1.0);
            lightDiffuse = vec4(lightDS[0], lightDS[1], lightDS[2], 1.0);
            lightAmbient = vec4(dayAmbient[0], dayAmbient[1], dayAmbient[2], 1.0);

            // daytime sky
            gl.clearColor(dtColor[0], dtColor[1], dtColor[2], 1.0);
        }
    }

    // update the light (sun) position with the new degree
    lightPosition = vec4(sunR*Math.cos(sunT*Math.PI/180.0), sunR*Math.sin(sunT*Math.PI/180.0), lightPosition[3], 1);
    
    if (night) sunT -= sunSpeed*10; // small changes in the night so speed up
    else sunT -= sunSpeed;          // decreese sun theta angle

    /* ###########################################
       Animation as a finite state automaton start
       ########################################### */
    // if the animation has not yet started, walk in direction z
    if (notAnimationWalk1) {
        walkLegFunction();

        if (torsoPosZ <= torsoPosxStart) {            
            torsoPosZ += walkingSpeed;
        } else {
            theta[torsoId2] += 2;
            theta[torsoId2] = theta[torsoId2] % 360;
            if (theta[torsoId2] == 90 ) { // turn back and walk in direciton -z
                notAnimationWalk1 = false;
                notAnimationWalk2 = true;
            }
        }
    }

    // if the animation has not yet started, walk in direction -z
    if (notAnimationWalk2) {
        walkLegFunction();

        if (torsoPosZ >= -torsoPosxStart) {            
            torsoPosZ -= walkingSpeed;
        } else {
            theta[torsoId2] += 2;
            theta[torsoId2] = theta[torsoId2] % 360;
            if (theta[torsoId2] == 270 ) { // turn back and walk in direciton z
                notAnimationWalk2 = false;
                notAnimationWalk1 = true;
            }
        }
    }

    // if the animation has started, rotate towards the starting point z
    if (startAnimation1) {
        walkLegFunction();
        // find best roation then rotate (90 degree)
        if (torsoPosZ < 0) { 
            if (theta[torsoId2] == 270 ) {      
                startAnimation1 = false;
                startAnimation2 = true;
            } else {
                theta[torsoId2] += 2;
                theta[torsoId2] = theta[torsoId2] % 360;
            }
        } else {
            if (theta[torsoId2] == 90 ) {      
                startAnimation1 = false;
                startAnimation2 = true;
            } else {
                theta[torsoId2] += 2;
                theta[torsoId2] = theta[torsoId2] % 360;
            }
        }
    }

    // if the animation has started walk toward the starting point z then turn towards the fence
    if (startAnimation2) {
        walkLegFunction();
        var direction;
        if (torsoPosZ <= 0) {
            direction = +1;
        } else {
            direction = -1;
        }
        if (Math.abs(torsoPosZ) <= 0.1) { // rotate towards fence
            if (360 - theta[torsoId2] <=90) {
                theta[torsoId2] += 2;
            } else {
                theta[torsoId2] -= 2;
                if (theta[torsoId2] <= 0) theta[torsoId2] = 360
            }
            theta[torsoId2] = theta[torsoId2] % 360;
            if (theta[torsoId2] == 0) {
                if (Math.abs(theta[leftFrontwardUpperLegId]) < 0.1 ) {
                    resetAnimationParameters();
                    startAnimation2 = false;
                    walk = true;
                    var elt = document.getElementById("animation");
                    elt.innerHTML = "<div> Approach the fence </div>";
                }
            }
        } else { // walk towards starting point z
            torsoPosZ += direction*walkingSpeed;
        }
    }

    // animation.1: walk towards the fence and stop just before it
    if (walk) {
        torsoPosX += -walkingSpeed;
        walkLegFunction();
        
        // arrived at jump position
        if (torsoPosX < jumpPosition && theta[leftBackwardLowerLegId] == 0) {
            walk = false;
            soaring = true;
            var elt = document.getElementById("animation");
            elt.innerHTML = "<div> Jump! </div>";
        }
    }

    // animation.2: soaring in jump position
    if (soaring) {
        theta[torsoId] += soaringSpeed;
        theta[leftBackwardUpperLegId] -= soaringSpeed;
        theta[rightBackwardUpperLegId] -= soaringSpeed;
        theta[leftFrontwardUpperLegId] -= soaringSpeed/2;
        theta[rightFrontwardUpperLegId] -= soaringSpeed/2;
        theta[leftFrontwardLowerLegId] -= soaringSpeed/2;
        theta[rightFrontwardLowerLegId] -= soaringSpeed/2;
        if (theta[torsoId] > 45) { // ready to jump
            soaring = false;
            jump = true;
        }
    }

    // animation.3: jump!
    if (jump) {
        var jumpRadius = Math.sqrt(Math.pow(torsoPosX, 2) + Math.pow(torsoPosY, 2))
        var rad = jumpRotation*(Math.PI/180.0);
        // first fase: 90 degree of jump rotation and tightening of legs and torso
        if (jumpRotation <= 90) { 
            jumpRotation += soaringSpeed*2;
            jumpRotation = jumpRotation%360;
            torsoPosX =  Math.cos(rad)*jumpRadius;
            torsoPosY =  Math.sin(rad)*jumpRadius;
            theta[torsoId] -= soaringSpeed;
            theta[leftBackwardUpperLegId] += soaringSpeed;
            theta[rightBackwardUpperLegId] += soaringSpeed;
            theta[leftFrontwardUpperLegId] += soaringSpeed/2;
            theta[rightFrontwardUpperLegId] += soaringSpeed/2;
            theta[leftFrontwardLowerLegId] += soaringSpeed/2;
            theta[rightFrontwardLowerLegId] += soaringSpeed/2;
        } 
        // second fase: 90 to 180 degree of jump rotation and soaring on the front legs
        else if (jumpRotation <= 180) {
            jumpPhase = -1
            jumpRotation += soaringSpeed*2;
            jumpRotation = jumpRotation%360;
            torsoPosX =  Math.cos(rad)*jumpRadius;
            torsoPosY =  Math.sin(rad)*jumpRadius;
            theta[torsoId] -= soaringSpeed;
            theta[leftBackwardUpperLegId] += soaringSpeed;
            theta[rightBackwardUpperLegId] += soaringSpeed;
            theta[leftFrontwardUpperLegId] += soaringSpeed/2;
            theta[rightFrontwardUpperLegId] += soaringSpeed/2;
            theta[leftFrontwardLowerLegId] += soaringSpeed/2;
            theta[rightFrontwardLowerLegId] += soaringSpeed/2;
        } 
        // third fase: tightening of legs and torso standing over the fence
        else if (theta[torsoId] < 0) {
            theta[torsoId] += soaringSpeed;
            theta[leftBackwardUpperLegId] -= soaringSpeed;
            theta[rightBackwardUpperLegId] -= soaringSpeed;
            theta[leftFrontwardUpperLegId] -= soaringSpeed/2;
            theta[rightFrontwardUpperLegId] -= soaringSpeed/2;
            theta[leftFrontwardLowerLegId] -= soaringSpeed/2;
            theta[rightFrontwardLowerLegId] -= soaringSpeed/2;
        } 
        // Im ready to come back at the starting point
        else {
            jump = false;
            comeBack1 = true;
            theta = [0, 0, 70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            torsoPosY = 0;
            var elt = document.getElementById("animation");
            elt.innerHTML = "<div> Come back </div>";
        }
    }
    
    // walk until x-position is about -10
    if (comeBack1) {
        walkLegFunction();

        if (torsoPosX >= -torsoPosxStart) {            
            torsoPosX += -walkingSpeed;
        } else {
            if (theta[torsoId2] < 90 )
                theta[torsoId2] += 2;
            else {
                comeBack1 = false;
                comeBack2 = true;
            }
        }
    }

    // walk until z-position is about -10 when x-position is -10
    if (comeBack2) {
        walkLegFunction();

        if (torsoPosZ >= -torsoPosxStart) {            
            torsoPosZ += -walkingSpeed;
        } else {
            if (theta[torsoId2] < 180 )
                theta[torsoId2] += 2;
            else {
                comeBack2 = false;
                comeBack3 = true;
            }
        }
    }

    // walk until x-position is about 10 when z-position is -10 (the notAnimationWalk1 starting point)
    if (comeBack3) {
        walkLegFunction();

        if (torsoPosX <= torsoPosxStart) {            
            torsoPosX += walkingSpeed;
        } else {
            if (theta[torsoId2] < 270 )
                theta[torsoId2] += 2;
            else {
                comeBack3 = false;
                notAnimationWalk1 = true;
                oneTime = true;
                var elt = document.getElementById("animation");
                elt.innerHTML = "<div> Waiting </div>";
            }
        }
    }
    /* #########################################
       Animation as a finite state automaton end
       ######################################### */

    // update the shapes
    for(i=0; i<numNodes; i++) initNodes(i);
    traverse(fenceTopId);

    // set fps redering time
    setTimeout(
        function () {requestAnimationFrame(render);},
        1000/fpsSlider
    );
}
