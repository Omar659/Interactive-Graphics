import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';

var renderer; // WebGl renderer.

/*** Perspective camera value ***/
const fov = 45;
const near = 0.01;
const far = 1000;
const aspect = 2;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const scene = new THREE.Scene(); // Scene of the game.

/*** HUD elements ***/
var position = 1;         // Actual position of our raccoon.
var timePassed = "00:00"; // Time passed since the start of the race.
var balloonPopped = 0;    // Number of balloon popped.
var barSpeed = 0;         // Speed of the raccoon.
var maxSpeed = 1.75;      // Maximum speed of the raccon (is a multiplier added to the other speed boosts).
var barSpeedReset = true; // Boolean used to reset bar speed to 0 at start of race.
var a = false;            // Boolean that tells us whether A was clicked on.
var d = false;            // Boolean that tells us whether D was clicked on.

/*** Sounds elements ***/ 
var sounds = [];                                    // Array that will contain all sound objects.
var footStep = [false, false, false, false, false]; // This array tell us if i-th raccoon have to play the footstep sound.
var endRace = true;                                 // Variable used to tell us if the game, including the camera animation, is finished.
var inGame = true;                                  // Variable used to play one time the in game song.
var endGame = true;                                 // Variable used to play one time the end game song.
var countdownSound = true;                          // Variable used to play one time the coundown sound.
var endCountdown = true;                            // Variable used to delete the text "go" of the countdown.

/*** FPS setting ***/
/* These settings are used to fix the speed of the animation slowed down by a low-performance computer and simulate, 
   with some frame lag (sometimes imperceptible), the result obtained on a computer with a 144Hz screen and therefore 144 FPS. */
var boostfps = 144;   // Target FPS to achieve.
var fps = 0;          // FPS counter
var timeFps;          // Starting time for FPS calculation
var setFps = true;    // Variable used to calculate FPS one time
var startFps = true;  // Variable used to set one time the starting time

/*** Raccoon's variables ***/
var myRacconCursorMesh;  // Cursor on our raccoon.
var raccoons = [];       // Array of models of raccoon and their bones.
var raccoonLoaded = 0;   // Counter of the raccoon loaded.

/*** Balloon's variables ***/
var boostBalloon = 0;                                     // This variable contains the boost speed given by popping the balloons.
const balloons = new THREE.Group();                       // Group containing all the balloons shown during the game.
var balloonToSpawn = [];                                  // Array of all balloons created.
var spawnBalloonBoolean = [true, true, true, true, true]; // Array that tells us if the i-th balloon has already been generated.

/* ################################
   # ANIMATION'S ATTRIBUTES START #
   ################################ */  
var animations = [];  // Array that contains all tween.js animations created.

/*** Raccoon's variables ***/
/*** Shoulder's variables ***/
var changeShoulderL = [];         // Array containing the left shoulder animation range of all raccoons.
var startRotationShoulderL = [];  // Array containing the left shoulder starting rotation value of all raccoons.
var changeShoulderR = [];         // Array containing the right shoulder animation range of all raccoons.
var startRotationShoulderR = [];  // Array containing the right shoulder starting rotation value of all raccoons.

/*** Thigh's variables ***/
var changeThighBackL = [];        // Array containing the left thigh animation range of all raccoons.
var startRotationThighBackL = []; // Array containing the left thigh starting rotation value of all raccoons.
var changeThighBackR = [];        // Array containing the right thigh animation range of all raccoons.
var startRotationThighBackR = []; // Array containing the right thigh starting rotation value of all raccoons.

/*** Shin's variables ***/
// Front-right shin.
var changeShinFrontR = [];        // Array containing the front-right shin animation range of all raccoons.
var startRotationShinFrontR = []; // Array containing the front-right shin starting rotation value of all raccoons. 
var shinFrontR1 = [];             /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 1 of the front-right shin animation is to be executed.*/
var shinFrontR2 = [];             /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 2 of the front-right shin animation is to be executed.*/
var shinFrontR3 = [];             /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 3 of the front-right shin animation is to be executed.*/

// Front-left shin.
var changeShinFrontL = [];        // Array containing the front-left shin animation range of all raccoons.
var startRotationShinFrontL = []; // Array containing the front-left shin starting rotation value of all raccoons. 
var shinFrontL1 = [];             /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 1 of the front-left shin animation is to be executed.*/
var shinFrontL2 = [];             /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 2 of the front-left shin animation is to be executed.*/
var shinFrontL3 = [];             /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 3 of the front-left shin animation is to be executed.*/

// Back shins.
var changeBackShin = [];          // Array containing the back shin animation range of all raccoons.
var startRotationBackShin = [];   // Array containing the back shin starting rotation value of all raccoons. 
var backShin1 = [];               /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 1 of the back shin animation is to be executed.*/
var backShin2 = [];               /* Array which contains a boolean for each raccoon. 
                                     This boolean indicates whether step 2 of the back shin animation is to be executed.*/
/*** Feet's variables ***/
// Front-left foot.
var frontFootL1 = []; // Array containing the range of step 1 of the front-left foot animation for each raccoon.
var footFrontL1 = []; /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 1 of the front-left animation is to be executed.*/
var frontFootL2 = []; // Array containing the range of step 2 of the front-left foot animation for each raccoon.
var footFrontL2 = []; /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 2 of the front-left animation is to be executed.*/
var frontFootL3 = []; // Array containing the range of step 3 of the front-left foot animation for each raccoon.
var footFrontL3 = []; /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 3 of the front-left animation is to be executed.*/

// Front-right foot.
var frontFootR1 = []; // Array containing the range of step 1 of the front-right foot animation for each raccoon.
var footFrontR1 = []; /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 1 of the front-right animation is to be executed.*/
var frontFootR2 = []; // Array containing the range of step 2 of the front-right foot animation for each raccoon.
var footFrontR2 = []; /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 2 of the front-right animation is to be executed.*/
var frontFootR3 = []; // Array containing the range of step 3 of the front-right foot animation for each raccoon.
var footFrontR3 = []; /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 3 of the front-right animation is to be executed.*/

// Back feet.
var backFootR = []; // Array containing the back foots animation range of all raccoons.
var backFootL = []; // Array containing the back foots animation range of all raccoons.

/*** Neek's variables ***/
var changeNeck = [];  // Array containing the neck animation range of all raccoons.

/*** Tail's variables ***/
var tailValues = [];  /* Array which contains a tail structure for each Raccoon. 
                         The structure is organised into t1, t2, t3, t4 and t5 to represent the various pieces of the tail. 
                         Each t_i has as attributes:
                            - start that indicates the position that the tail piece must have in the extended position;
                            - end that indicates the position of the tail in the crunched position;
                            - step that indicates the variation it must make to reach start or end for each frame depending on the speed you have.*/
var tail1 = [];       /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 1 of the tail animations is to be executed.*/
var tail2 = [];       /* Array which contains a boolean for each raccoon. 
                         This boolean indicates whether step 2 of the tail animations is to be executed.*/

/*** Speed and leg direction ***/
var frontLegsDirection = [];  // For each raccoon, 1 or -1 to indicate the direction.
var legStepsAnimation = [];   // speed in terms of how many frames are needed to achieve a complete animation.

/*** Camera's variable ***/
// Start game.
var start1Camera = -4.5;  // Initial camera z-position for step 1 of the start animation.
var start2CameraZ = 4.5;  // Initial camera z-position for step 2 of the start animation.
var start2CameraX = -60;  // Initial camera x-position for step 2 of the start animation.

// End game.
var cameraFinishMovement;             // Position of the camera during the animation.
var cameraLookAtFinishMovement;       // Position of the camera's lookAt during the animation.
var startCameraFinishPosition;        // Initial camera position of the end animation.
var startCameraLookAtFinishPosition;  // Initial camera lookAt position of the end animation.
var cameraFinishStepsAnimation = 200; // Number of animation frame.
/* ##############################
   # ANIMATION'S ATTRIBUTES end #
   ############################## */  


/*** Utility ***/
var startingTime;       // Variable containing the seconds at the start of the race.
var one = true;         // Boolean used to execute one time the starting time instruction.
var allReady = false;   // Boolean that tell us if all is loaded.
var loadV = true;       // Boolean which allows us to execute the instructions in the onLoad only once.
var enableShadow = "";  // String that tells us if the shadow should be cast or not

const loadingManager = new THREE.LoadingManager();

// Loading started
loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
};

// Loading completed
loadingManager.onLoad = function ( ) {
  if(loadV){
    loadV = false;
    var button = document.createElement("button");
    button.setAttribute("id", "button1");
    button.innerHTML = "Play!";
    document.getElementById("clickText").innerHTML="";
    document.getElementById("clickText").appendChild(button);
    button.addEventListener("click", function() {
      var orbitDiv = document.getElementById("orbitDiv");
      var div = document.createElement('div');
      div.setAttribute("style", "position: relative;");
      div.setAttribute("id", "divCanvas");
      var div2 = document.createElement('div');

      // create HUD
      var html =  '<table class = "unselectable" width= 100%>' +
                    '<colgroup>' +
                      '<col span="1" style="width: 25%;">' +
                      '<col span="1" style="width: 50%;">' +
                      '<col span="1" style="width: 25%;">' +
                    '</colgroup>' +
                    '<tbody>' +
                      '<tr>' +
                        '<td id = "td2">'  +
                          'Position: ' + position + '°' +
                        '</td>' +
                        '<td id = "td1">' +
                          '<div class="meter">' +
                            '<span id = "speedBar" align = "center" style="width: 0%; font-family: Copperplate, Papyrus, fantasy; font-size: 30px">' +
                              "<b>" + 0 + "%</b>" + 
                            '</span>' +
                          '</div>' +
                        '</td>' +
                        '<td id = "td3">' +
                          'Time: ' + timePassed +
                        '</td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>' +
                  '<div id = "countdown" class= "unselectable" style ="font-size: 140px;"></div>' + 
                  '<div class= "unselectable" id = "A" class="ng-binding">' +
                    '<b>A</b>' +
                  '</div>' +
                  '<div class= "unselectable" id = "D" class="ng-binding">' +
                    '<b>D</b>' +
                  '</div>';
        createCanvas(orbitDiv, div, div2, html);

        // inGame, endGame and countdown audio
        play("./../resources/audios/soundtracks/inGame.mp3", 0.05, true, false, "inGame", 0);
        play("./../resources/audios/soundtracks/endGame.mp3", 0.05, true, false, "endGame", 0);
        play("./../resources/audios/soundtracks/countdown.mp3", 0.05, false, false, "countdown", 0);

        // animals audio
        play("./../resources/audios/chicken/chicken1.mp3", 0.004, true, true, "", 200);
        play("./../resources/audios/elephant/elephant.mp3", 0.01, true, true, "", 450);
        play("./../resources/audios/giraffe/giraffe.mp3", 0.03, true, true, "", 550);
        play("./../resources/audios/pigeon/pigeon.mp3", 0.03, true, true, "", 710);
        play("./../resources/audios/seal/seal.mp3", 0.01, true, true, "", 375);
        play("./../resources/audios/dinosaur/dinosaur.mp3", 0.01, true, true, "", 225);

        // two footsteps, one with delay, for each raccoon
        // raccoon 1
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "firstSteps0", 0);
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "secondSteps0", 230);
        // raccoon 2
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "firstSteps1", 0);
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "secondSteps1", 230);
        // raccoon 3
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "firstSteps2", 0);
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "secondSteps2", 230);
        // raccoon 4
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "firstSteps3", 0);
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "secondSteps3", 230);
        // raccoon 5
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "firstSteps4", 0);
        play("./../resources/audios/raccoonFootsteps/raccoonFootsteps.mp3", 0.015, false, false, "secondSteps4", 230);

        allReady = true;
    }, false); 
  }
};

// Loading in progress
loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
};

// Loading error
loadingManager.onError = function ( url ) {
};

/*** Loaders ***/
var loader = new THREE.TextureLoader(loadingManager); // Loader used for textures
var gltfLoader = new GLTFLoader(loadingManager);      // Loader used for gltf models

// Function that create the whole environment.
function environment(){
  myTerrain();
  myTribune();
  trees();
  finishLine();
  myEmisphereLight();
  torches();
  fog();
  for (var i = 0; i < spawnBalloonBoolean.length; i++) myBallon();
  spawnRaccoon();
}

// Function that spawn all raccoon and the cursor on the our raccoon
function spawnRaccoon() {
  myRacconCursor();
  myRaccoon(4.5, 0);
  myRaccoon(2.25, 1);
  myRaccoon(0, 2);
  myRaccoon(-2.25, 3);
  myRaccoon(-4.5, 4);
}

// Function that create the general plane with track field.
function myTerrain() {
  var width = 140;
  var height = 2;
  var lineHeigth = height/8;
  var repeat = width/height;
  var repeatEndLines = (5*height + 6*lineHeigth)/height;
  var trackTexture = './../resources/textures/runningTrackField.png';
  var grassTexture = './../resources/textures/grass.png';

  // Grass terrain.
  myPlane(600, 600, grassTexture, 0, -0.1, 0, 1, 120, false, true);
  // Start white line
  myPlane((5*height + 6*lineHeigth), lineHeigth, trackTexture, (-1/2)*(width + lineHeigth), 0, 0, (height / lineHeigth), repeatEndLines, true);
  // First lane
  myPlane(width, height, trackTexture, 0, 0, -2*(height + lineHeigth), 1, repeat);
  myPlane(width, lineHeigth, trackTexture, 0, 0, (-5/2)*(height + lineHeigth), (height / lineHeigth), repeat);
  // Second lane
  myPlane(width, height, trackTexture, 0, 0, -(height + lineHeigth), 1, repeat);
  myPlane(width, lineHeigth, trackTexture, 0, 0, (-3/2)*(height + lineHeigth), (height / lineHeigth), repeat);
  // Third lane
  myPlane(width, height, trackTexture, 0, 0, 0, 1, repeat);
  myPlane(width, lineHeigth, trackTexture, 0, 0, (height/2 + lineHeigth/2), (height / lineHeigth), repeat);
  myPlane(width, lineHeigth, trackTexture, 0, 0, -(height/2 + lineHeigth/2), (height / lineHeigth), repeat);
  // Fourth lane
  myPlane(width, height, trackTexture, 0, 0, (height + lineHeigth), 1, repeat);
  myPlane(width, lineHeigth, trackTexture, 0, 0, (3/2)*(height + lineHeigth), (height / lineHeigth), repeat);
  // Fifth lane
  myPlane(width, height, trackTexture, 0, 0, 2*(height + lineHeigth), 1, repeat);
  myPlane(width, lineHeigth, trackTexture, 0, 0, (5/2)*(height + lineHeigth), (height / lineHeigth), repeat);
  // End white line
  myPlane((5*height + 6*lineHeigth), lineHeigth, trackTexture, (1/2)*(width + lineHeigth), 0, 0, (height / lineHeigth), repeatEndLines, true);
}

/*  Function that create a plane.
    Parameters:
    - SizeX: x-size of the plane;
    - SizeY: y-size of the plane;
    - Texture: texture to attach at the plane;
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - line: if line ratio between line and lane, 1 otherwise. Used to wrap the texture;
    - repeat: number of texture ripetition;
    - endLine: default is false. If true we are creating a end/start white line;
    - grass: default is false. If true we are creating a grass terrain.
 */
function myPlane(sizeX, sizeY, texture, x, y, z, line, repeat, endLine = false, grass = false){
  const textureField = loader.load(texture);

  if(grass){
    textureField.wrapS = THREE.RepeatWrapping;
    textureField.wrapT = THREE.RepeatWrapping;
    textureField.repeat.set(repeat, repeat);
  } else {
    textureField.wrapS = THREE.MirroredRepeatWrapping;
    textureField.wrapT = THREE.ClampToEdgeWrapping;
    textureField.repeat.x = repeat;
    textureField.repeat.y = 1/line;
  }
  textureField.magFilter = THREE.NearestFilter;

  const planeGeo = new THREE.PlaneGeometry(sizeX, sizeY);
  var planeMat;
  if (!enableShadow) {
    planeMat = new THREE.MeshBasicMaterial({
      map: textureField,
      side: THREE.DoubleSide,
    });
  } else {
    planeMat = new THREE.MeshPhongMaterial({
      map: textureField,
      side: THREE.DoubleSide,
    });
  }
  planeMat.shininess = 0;
  planeMat.color.setRGB(0.25, 0.25, 0.25);
  if(line != 1) planeMat.color.setRGB(2, 2, 2); // white texture

  const mesh = new THREE.Mesh(planeGeo,planeMat);

  mesh.rotation.x = Math.PI * -.5;
  if(endLine) mesh.rotation.z = Math.PI * -.5;

  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = z;

  mesh.frustumCulled = true;
  if (enableShadow) mesh.receiveShadow = true;
  scene.add(mesh);
}

// Function that load the finish line structure and set its scale and position.
function finishLine(){
  gltfLoader.load('./../resources/models/finishLine/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(220);
    root.scale.y -= 40;
    root.position.y -= 0.55;
    root.position.x += 70;
    root.rotation.y = Math.PI * 0.5;
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;
        object.material.depthWrite = true;
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      } 
    });
    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

// Function that load all trees
function trees(){
  // Tree model 1
  tree(1, -90, 0, -70, 0.01);
  tree(1, -140, 0, -50, 0.007);
  tree(1, -120, 0, -30, 0.012);

  // Tree model 2
  tree(2, -80, 0, -40, 1);
  tree(2, -20, 0, -150, 3);
  tree(2, -130, 0, 20, 1);
  
  // Tree model 3
  tree(3, -90, -1, -170, 0.05);
  tree(3, -90, -1, 20, 0.02);
  tree(3, -300, -1, 20, 0.06);
  
  // Tree model 4
  tree(4, -50, -1, -170, 0.1);
  tree(4, -150, -1, -150, 0.05);
  tree(4, -120, -1, -5, 0.02);
  
  // Tree model 5
  tree(5, 150, 0, -200, 0.2);
  tree(5, 300, 0, -140, 0.2);
  tree(5, -280, 0, -190, 0.18);
}

/*  Function that load a tree and set its scale and position.
    Parameters:
    - i: number that identify the model to load;
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - scale: scaling factor.
 */
function tree(i, x, y, z, scale) {
  gltfLoader.load('./../resources/models/trees/tree' + i + '/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(scale); 
    root.position.x = x;
    root.position.y = y;
    root.position.z = z;  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;  
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      } 
    });
    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

// Function that load the tribune and set its scale, rotation and position.
function myTribune(){
  tribunePopulation();
  gltfLoader.load('./../resources/models/tribune/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(0.005);
    root.scale.x *= 2;
    root.scale.z *= 3;
    root.position.z = -30;
    root.rotation.y = Math.PI * .5;
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }
      } 
    });
    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

// Function that load all animals on the tribune
function tribunePopulation(){
  chicken1(15, 2 + 4.7, -35 , 400);
  chicken2(20/2 -5, 4.1/2, -50/2 + 5.25, 250);
  chicken3(30/2 + 5, 7/2, -53/2 + 5.25, 250);
  chicken4(40/2, 16.1/2, -83.5/2 +5.25, 264);
  chicken5(-38.5/2 - 10, 4.1/2 + 4.7, -50/2 - 8, 298);
  pigeon(-20, 4.1/2, -50.2/2 + 5.25, 378);
  trex(0, 4/2 + 3, -50/2 - 5.25, 900);
  seal(-50/2, 16.1/2, -90/2 + 5.25, 486);
  giraffe(48/2 + 5, 3.85/2, -46.5/2 + 5.25, 691);
  elephant(-30/2, 7.1/2, -69.5/2, 727);
}

/*  Function that load the chicken 1 and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function chicken1(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/chickens/chicken1/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(2);
    root.position.x = 0 + x;
    root.position.y = 0.808 + y;
    root.position.z = 0 + z;
    root.rotation.y = Math.PI * -.5;
    root.scale.y = 1.5;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;    
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }    
      }
    });
    var chicken1Animation1 = new TWEEN.Tween(root.scale).to({x:root.scale.x, y:2, z:root.scale.z}, t);
    chicken1Animation1.repeat(Infinity);
    chicken1Animation1.yoyo(true);
    chicken1Animation1.start();

    var chicken1Animation2 = new TWEEN.Tween(root.position).to({x:root.position.x, y: y + 2.058, z:root.position.z}, t);
    chicken1Animation2.repeat(Infinity);
    chicken1Animation2.yoyo(true);
    chicken1Animation2.start();

    animations.push(chicken1Animation1);
    animations.push(chicken1Animation2);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the chicken 2 and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function chicken2(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/chickens/chicken2/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(2);
    root.position.x = 0 + x;
    root.position.y = -0.04 + y;
    root.position.z = 0 + z;
    root.rotation.y = Math.PI * .5;
    root.scale.y = 1.5;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;     
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }   
      }
    });
    
    var chicken2Animation1 = new TWEEN.Tween(root.scale).to({x:root.scale.x, y:2, z:root.scale.z}, t);
    chicken2Animation1.repeat(Infinity);
    chicken2Animation1.yoyo(true);
    chicken2Animation1.start();

    animations.push(chicken2Animation1);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the chicken 3 and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function chicken3(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/chickens/chicken3/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 5;
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x;
    root.position.y = 0 + y;
    root.position.z = 0 + z;
    root.rotation.y = Math.PI * -.5;
    root.scale.z = scaling*2;
    root.scale.y = scaling/2;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;  
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      }
    });
    
    var chicken3Animation1 = new TWEEN.Tween(root.scale).to({x:root.scale.x, y:scaling, z:scaling}, t);
    chicken3Animation1.repeat(Infinity);
    chicken3Animation1.yoyo(true);
    chicken3Animation1.start();

    animations.push(chicken3Animation1);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the chicken 4 and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function chicken4(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/chickens/chicken4/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 7;
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x;
    root.position.y = 0 + y;
    root.position.z = 0 + z;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;  
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      }
    });

    var leftWing = root.getObjectByName("ArmatureNatureChicken_WingUL_ArmatureNatureChicken");
    var rightWing = root.getObjectByName("ArmatureNatureChickenWingUR_ArmatureNatureChicken");
    var head = root.getObjectByName("ArmatureNatureChickenHead_ArmatureNatureChicken");

    leftWing.rotation.z-=1*Math.PI;
    leftWing.rotation.y+=0.2*Math.PI;

    rightWing.rotation.z-=1*Math.PI;
    rightWing.rotation.y+=0.2*Math.PI;
    
    var chicken4Animation1 = new TWEEN.Tween(leftWing.rotation).to({x:leftWing.rotation.x,
                                                            y:leftWing.rotation.y,
                                                            z:leftWing.rotation.z-0.4*Math.PI}, t);
    chicken4Animation1.repeat(Infinity);
    chicken4Animation1.yoyo(true);
    chicken4Animation1.start();

    var chicken4Animation2 = new TWEEN.Tween(rightWing.rotation).to({x:rightWing.rotation.x,
                                                             y:rightWing.rotation.y,
                                                             z:rightWing.rotation.z-0.4*Math.PI}, t);
    chicken4Animation2.repeat(Infinity);
    chicken4Animation2.yoyo(true);
    chicken4Animation2.start();

    
    var chicken4Animation3 = new TWEEN.Tween(head.position).to({x:head.position.x, y:head.position.y, z:0.05}, t);
    chicken4Animation3.repeat(Infinity);
    chicken4Animation3.yoyo(true);
    chicken4Animation3.start();

    animations.push(chicken4Animation1);
    animations.push(chicken4Animation2);
    animations.push(chicken4Animation3);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the chicken 5 and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function chicken5(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/chickens/chicken5/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 0.5
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x;
    root.position.y = 1 + y;
    root.position.z = 0 + z;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;   
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }    
      }
    });
    
    var chicken5Animation1 = new TWEEN.Tween(root.scale).to({x:scaling*2, y:scaling*1.1, z:root.scale.z}, t);
    chicken5Animation1.repeat(Infinity);
    chicken5Animation1.yoyo(true);
    chicken5Animation1.start();

    var chicken5Animation2 = new TWEEN.Tween(root.rotation).to({x:-0.25*Math.PI, y:root.rotation.y, z:root.rotation.z}, t);
    chicken5Animation2.repeat(Infinity);
    chicken5Animation2.yoyo(true);
    chicken5Animation2.start();

    animations.push(chicken5Animation1);
    animations.push(chicken5Animation2);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the pigeon and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function pigeon(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/pigeon/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 0.1;
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x;
    root.position.y = 0 + y;
    root.position.z = 0 + z;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true; 
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      }
    });

    var pigeonAnimation1 = new TWEEN.Tween(root.scale).to({x:root.scale.x, y:scaling, z:root.scale.z}, t);
    pigeonAnimation1.repeat(Infinity);
    pigeonAnimation1.yoyo(true);
    pigeonAnimation1.start();

    var pigeonAnimation2 = new TWEEN.Tween(root.position).to({x:root.position.x, y: y + scaling*10, z:root.position.z}, t);
    pigeonAnimation2.repeat(Infinity);
    pigeonAnimation2.yoyo(true);
    pigeonAnimation2.start();

    var pigeonAnimation3 = new TWEEN.Tween(root.rotation).to({x:root.rotation.x, y: Math.PI*2, z:root.rotation.z}, t);
    pigeonAnimation3.repeat(Infinity);
    pigeonAnimation3.repeatDelay(t);
    pigeonAnimation3.yoyo(true);
    pigeonAnimation3.start();

    animations.push(pigeonAnimation1);
    animations.push(pigeonAnimation2);
    animations.push(pigeonAnimation3);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the trex and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function trex(x, y, z , t){
  gltfLoader.load('./../resources/models/animals/trex/scene.gltf', function (gltf){
    const root = gltf.scene;

    var scaling = 3;
    root.scale.multiplyScalar(scaling);

    root.position.x = 0 + x;
    root.position.y = 0 + y;
    root.position.z = 0 + z;
  
    // To set left leg and right leg in the same position.
    var leftLeg = []; // Array of all joint of the left leg.
    var i = 0;
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }
      }
      // Some selection based on the name of the object in order to find only those related to the legs.
      if (object.name.substring(0, 6) == "Bip001") {
        var v = parseInt(object.name.substring(object.name.length-2, object.name.length));
        // Left leg
        if (v <= 68 && v >= 54){
          leftLeg.push(object);
        }
        // Right leg. Setting all the value of position and rotation equal to the left leg (Except for the 'right' leg position)
        if (v <= 83 && v >= 69){
          // Rotation assignment
          leftLeg[i].rotation.x = -object.rotation.x;
          leftLeg[i].rotation.y = -object.rotation.y;
          leftLeg[i].rotation.z = object.rotation.z;
          // Position assignment
          leftLeg[i].position.x = object.position.x;
          leftLeg[i].position.y = object.position.y;
          leftLeg[i].position.z = -object.position.z;
          i++;
        }
      }
    });
    
    // Head animation
    var head = root.getObjectByName("Bip001_Head_7");
    head.rotation.y = -Math.PI*0.1;
    head.rotation.x = -Math.PI*0.1;
    var headDinoAnimation = new TWEEN.Tween(head.rotation).to({x:Math.PI*0.1, y:Math.PI*0.1, z:Math.PI*0.1}, t/1.5);
    headDinoAnimation.repeat(Infinity);
    headDinoAnimation.yoyo(true);
    headDinoAnimation.start();
    animations.push(headDinoAnimation);

    // Tail joints animations
    var tail1 = root.getObjectByName("Bip001_Tail_95");
    var tail2 = root.getObjectByName("Bip001_Tail1_92");
    var tail3 = root.getObjectByName("Bip001_Tail2_91");
    var tail4 = root.getObjectByName("Bip001_Tail3_90");
    var tail5 = root.getObjectByName("Bip001_Tail4_89");
    var tail6 = root.getObjectByName("Bip001_Tail5_88");
    var tail7 = root.getObjectByName("Bip001_Tail6_87");
    var tail8 = root.getObjectByName("Bip001_Tail7_86");
    var tail9 = root.getObjectByName("Bip001_Tail8_85");
    var tail10 = root.getObjectByName("Bip001_TailNub_84");

    var tailrot = 0.05;
    tail1.rotation.y = Math.PI*2*tailrot;
    tail2.rotation.y = Math.PI*tailrot;
    tail3.rotation.y = Math.PI*tailrot;
    tail4.rotation.y = Math.PI*tailrot;
    tail5.rotation.y = Math.PI*tailrot;
    tail6.rotation.y = Math.PI*tailrot;
    tail7.rotation.y = Math.PI*tailrot;
    tail8.rotation.y = Math.PI*tailrot;
    tail9.rotation.y = Math.PI*tailrot;
    tail10.rotation.y = Math.PI*tailrot;
    dinoTailAnimation(tail1, tailrot, t);
    dinoTailAnimation(tail2, 1.8*tailrot, t);
    dinoTailAnimation(tail3, 1.6*tailrot, t);
    dinoTailAnimation(tail4, 1.4*tailrot, t);
    dinoTailAnimation(tail5, 1.2*tailrot, t);
    dinoTailAnimation(tail6, tailrot, t);
    dinoTailAnimation(tail7, 1.2*tailrot, t);
    dinoTailAnimation(tail8, 2.4*tailrot, t);
    dinoTailAnimation(tail9, 2.6*tailrot, t);
    dinoTailAnimation(tail10, 2.8*tailrot, t);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that create the tail animation of the trex.
    Parameters:
    - tail: tail's joint to move;
    - tailrot: rotation step;
    - t: speed of the animations in terms of time to finish.
 */
function dinoTailAnimation(tail, tailrot, t) {
  var animation = new TWEEN.Tween(tail.rotation).to({x:tail.rotation.x, y:-tailrot, z:tail.rotation.z + tailrot}, t/2);
  animation.repeat(Infinity);
  animation.yoyo(true);
  animation.start();
  animations.push(animation);
}

/*  Function that load the seal and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function seal(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/seal/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 0.015;
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x;
    root.position.y = 0 + y;
    root.position.z = 0 + z;
    root.rotation.y = Math.PI*0.19;
    
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;   
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }     
      }
    });
    var a= "Bone003_04"
    root.getObjectByName(a).rotation.y = Math.PI*0.2;
    root.getObjectByName(a).rotation.x = -Math.PI*0.2;
    
    var neck =root.getObjectByName("Bone003_04")
    var sealAnimation1 = new TWEEN.Tween(neck.rotation).to({x:Math.PI*0.2, y:-Math.PI*0.2, z:neck.rotation.z}, t);
    sealAnimation1.repeat(Infinity);
    sealAnimation1.yoyo(true);
    sealAnimation1.start();

    animations.push(sealAnimation1);

    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the giraffe and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function giraffe(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/giraffe/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 1.8;
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x
    root.position.y = 0 + y;
    root.position.z = 0 + z;
    
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;  
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }    
      }
    });

    var neck1 = root.getObjectByName("Bone003_Armature");
    var neck2 = root.getObjectByName("Bone004_Armature");
    var neck3 = root.getObjectByName("Bone005_Armature");
    var neck4 = root.getObjectByName("Bone006_Armature");
    neck1.rotation.z = Math.PI*0.05;
    neck2.rotation.z = Math.PI*0.07;
    neck3.rotation.z = Math.PI*0.1;
    neck4.rotation.y = Math.PI*0.05;

    var giraffeAnimation1 = new TWEEN.Tween(neck1.rotation).to({x:neck1.rotation.x, y:neck1.rotation.y, z:-Math.PI*0.05}, t);
    giraffeAnimation1.repeat(Infinity);
    giraffeAnimation1.yoyo(true);
    giraffeAnimation1.start();

    var giraffeAnimation2 = new TWEEN.Tween(neck2.rotation).to({x:neck2.rotation.x, y:neck2.rotation.y, z:-Math.PI*0.07}, t);
    giraffeAnimation2.repeat(Infinity);
    giraffeAnimation2.yoyo(true);
    giraffeAnimation2.start();

    var giraffeAnimation3 = new TWEEN.Tween(neck3.rotation).to({x:neck3.rotation.x, y:neck3.rotation.y, z:-Math.PI*0.1}, t);
    giraffeAnimation3.repeat(Infinity);
    giraffeAnimation3.yoyo(true);
    giraffeAnimation3.start();

    var giraffeAnimation4 = new TWEEN.Tween(neck4.rotation).to({x:neck4.rotation.x, y:-Math.PI*0.05, z:neck4.rotation.z}, t);
    giraffeAnimation4.repeat(Infinity);
    giraffeAnimation4.yoyo(true);
    giraffeAnimation4.start();

    animations.push(giraffeAnimation1);
    animations.push(giraffeAnimation2);
    animations.push(giraffeAnimation3);
    animations.push(giraffeAnimation4);
    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the elephant and set its animations and starting position.
    Parameters:
    - x: x-position;
    - y: y-position;
    - z: z-position;
    - t: speed of the animations in terms of time to finish.
 */
function elephant(x, y, z, t){
  gltfLoader.load('./../resources/models/animals/elephant/scene.gltf', function (gltf){
    const root = gltf.scene;
    var scaling = 4;
    root.scale.multiplyScalar(scaling);
    root.position.x = 0 + x;
    root.position.y = 0 + y;
    root.position.z = -3 + z;
    root.rotation.y = -Math.PI*0.5;
    
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;  
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      }
    });

    var rightEar = root.getObjectByName("Elephant_BabyMeshbone_R_ear_00_15");
    var elephantAnimation1 = new TWEEN.Tween(rightEar.rotation).to({x:rightEar.rotation.x, y:rightEar.rotation.y, z:-Math.PI*0.4}, t);
    elephantAnimation1.repeat(Infinity);
    elephantAnimation1.yoyo(true);
    elephantAnimation1.start();
    
    var leftEar = root.getObjectByName("Elephant_BabyMeshbone_L_ear_00_21");
    var elephantAnimation2 = new TWEEN.Tween(leftEar.rotation).to({x:leftEar.rotation.x, y:leftEar.rotation.y, z:-Math.PI*0.4}, t);
    elephantAnimation2.repeat(Infinity);
    elephantAnimation2.yoyo(true);
    elephantAnimation2.start();

    animations.push(elephantAnimation1);
    animations.push(elephantAnimation2);
    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that load the raccoon and set its starting position.
    Parameters:
    - z: z-position;
    - i: raccoon's lane.
 */
function myRaccoon(z, i){
  gltfLoader.load('./../resources/models/animals/raccoon/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(2);
    root.position.x = -140/2 + 0.7;
    root.position.y = 0.1;
    root.position.z = z;
    root.rotation.y = Math.PI * .5;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true; 
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      } 
    });

    var speed = 73;
    if (i == 0) speed = 140; // Is grather then other raccons because our raccon have barspeed multiplier and baloon boost
    raccoonStartPosition(root, speed, i)
    scene.add(root);
    raccoonLoaded += 1;
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that set the starting position of the i-th raccoon.
    Parameters:
    - root: root of the object;
    - speed: raccoon's speed;
    - i: reptresent i-th raccoon.
 */
function raccoonStartPosition(root, speed, i) {
  raccoons[i] = [root, raccoonBones(root)];
  legStepsAnimation[i] = speed;
  frontLegsDirection[i] = 1;

  /*** Shoulder ***/ 
  // Left shoulder starting rotation.
  startRotationShoulderL[i] = {x: raccoons[i][1].shoulder_L_014.rotation.x, 
                               z: raccoons[i][1].shoulder_L_014.rotation.z};
  changeShoulderL[i] = {x: Math.abs(startRotationShoulderL[i].x - 0.65*Math.PI), 
                        z: Math.abs(startRotationShoulderL[i].z - -0.1*Math.PI)};
  raccoons[i][1].shoulder_L_014.rotation.x= 0.5*Math.PI;
  raccoons[i][1].shoulder_L_014.rotation.z= -0.1*Math.PI;

  // right shoulder starting rotation.
  startRotationShoulderR[i] = {x: raccoons[i][1].shoulder_R_026.rotation.x, 
                               z: raccoons[i][1].shoulder_R_026.rotation.z}
  changeShoulderR[i] = {x: Math.abs(startRotationShoulderR[i].x - 0.65*Math.PI), 
                        z: Math.abs(startRotationShoulderR[i].z - 0.1*Math.PI)};
  raccoons[i][1].shoulder_R_026.rotation.x= 0.5*Math.PI;
  raccoons[i][1].shoulder_R_026.rotation.z= 0.1*Math.PI;

  /*** Feet ***/
  // Front-left foot setting and starting rotation.
  frontFootL1[i] = {x: Math.abs(0.25*Math.PI - 0)};
  frontFootL2[i] = {x: Math.abs(-0.25*Math.PI - 0.25*Math.PI)};
  frontFootL3[i] = {x: Math.abs(-0.25*Math.PI - 0)};
  footFrontL1[i] = false;
  footFrontL2[i] = true;
  footFrontL3[i] = false;
  raccoons[i][1].front_foot_L_017.rotation.x = -0.25*Math.PI;

  // Front-right foot setting and starting rotation.
  frontFootR1[i] = {x: Math.abs(0.25*Math.PI - 0)};
  frontFootR2[i] = {x: Math.abs(-0.25*Math.PI - 0.25*Math.PI)};
  frontFootR3[i] = {x: Math.abs(-0.25*Math.PI - 0)};
  footFrontR1[i] = false;
  footFrontR2[i] = true;
  footFrontR3[i] = false;
  raccoons[i][1].front_foot_R_029.rotation.x = -0.25*Math.PI;

  // Back-left foot setting and starting rotation.
  backFootL[i] = {x: Math.abs(0.6*Math.PI - 1.1*Math.PI)};
  raccoons[i][1].foot_01_L_042.rotation.x = 0.6*Math.PI;

  // Back-right foot setting and starting rotation.
  backFootR[i] = {x: Math.abs(0.6*Math.PI - 1.1*Math.PI)};
  raccoons[i][1].foot_01_R_054.rotation.x = 0.6*Math.PI;

  /*** Thigh ***/
  // Back-left thigh setting and starting rotation.
  startRotationThighBackL[i] = {x: raccoons[i][1].thigh_L_039.rotation.x, 
                                z: raccoons[i][1].thigh_L_039.rotation.z};
  changeThighBackL[i] = {x: Math.abs(startRotationThighBackL[i].x - 0.2*Math.PI), 
                         z: Math.abs(startRotationThighBackL[i].z - -0.12*Math.PI)};
  raccoons[i][1].thigh_L_039.rotation.x = 0.3*Math.PI;

  // Back-right thigh setting and starting rotation.
  startRotationThighBackR[i] = {x: raccoons[i][1].thigh_R_051.rotation.x, 
                                z: raccoons[i][1].thigh_R_051.rotation.z};
  changeThighBackR[i] = {x: Math.abs(startRotationThighBackR[i].x - 0.2*Math.PI), 
                         z: Math.abs(startRotationThighBackR[i].z - 0.12*Math.PI)};
  raccoons[i][1].thigh_R_051.rotation.x = 0.3*Math.PI;

  /*** Neck starting rotation. ***/
  changeNeck[i] = {x: 0.3*Math.PI};

  /*** Tail setting and starting rotation. ***/
  var tailRad = 0.1*Math.PI;
  tailValues[i] = {
    t1:{
      start: raccoons[i][1].tail_00_03.rotation.x-2*tailRad, 
      end: raccoons[i][1].tail_00_03.rotation.x+0.1*tailRad, 
      step: (2.1*tailRad)/(legStepsAnimation[i]*0.7)},
    t2:{
      start: raccoons[i][1].tail_01_04.rotation.x-0.3*tailRad, 
      end: raccoons[i][1].tail_01_04.rotation.x+0.3*tailRad, 
      step: (0.6*tailRad)/(legStepsAnimation[i]*0.7)},
    t3:{
      start: raccoons[i][1].tail_02_05.rotation.x-0.5*tailRad, 
      end: raccoons[i][1].tail_02_05.rotation.x+0.5*tailRad, 
      step: (1*tailRad)/(legStepsAnimation[i]*0.7)},
    t4:{
      start: raccoons[i][1].tail_03_06.rotation.x-0.7*tailRad, 
      end: raccoons[i][1].tail_03_06.rotation.x+0.7*tailRad, 
      step: (1.4*tailRad)/(legStepsAnimation[i]*0.7)},
    t5:{
      start: raccoons[i][1].tail_04_07.rotation.x-tailRad, 
      end: raccoons[i][1].tail_04_07.rotation.x+tailRad, 
      step: (2*tailRad)/(legStepsAnimation[i]*0.7)}
  };  
  raccoons[i][1].tail_00_03.rotation.x += +0.1*tailRad - (tailValues[i].t1.step*(legStepsAnimation[i]*0.7))*0.68;
  raccoons[i][1].tail_01_04.rotation.x += +0.3*tailRad - (tailValues[i].t2.step*(legStepsAnimation[i]*0.7))*0.68;
  raccoons[i][1].tail_02_05.rotation.x += +0.5*tailRad - (tailValues[i].t3.step*(legStepsAnimation[i]*0.7))*0.68;
  raccoons[i][1].tail_03_06.rotation.x += +0.7*tailRad - (tailValues[i].t4.step*(legStepsAnimation[i]*0.7))*0.68;
  raccoons[i][1].tail_04_07.rotation.x += +tailRad - (tailValues[i].t5.step*(legStepsAnimation[i]*0.7))*0.68;
  tail1[i] = true;
  tail2[i] = false;

  /*** Shin ***/
  // Front-right shin.
  startRotationShinFrontR[i] = raccoons[i][1].front_shin_R_028.rotation.x;
  changeShinFrontR[i] = Math.abs(startRotationShinFrontR[i] - -0.5*Math.PI);
  shinFrontR1[i] = true;
  shinFrontR2[i] = false;
  shinFrontR3[i] = false;

  // Front-left shin setting.
  startRotationShinFrontL[i] = raccoons[i][1].front_shin_L_016.rotation.x;
  changeShinFrontL[i] = Math.abs(startRotationShinFrontL[i] - -0.5*Math.PI);
  shinFrontL1[i] = true;
  shinFrontL2[i] = false;
  shinFrontL3[i] = false;

  // Back shins setting.
  startRotationBackShin[i] = {r: raccoons[i][1].shin_R_052.rotation.x, l: raccoons[i][1].shin_L_040.rotation.x};
  changeBackShin[i] = Math.abs(startRotationBackShin[i].r - 0.5*Math.PI);
  backShin1[i] = false;
  backShin2[i] = false;
}

/*  Function that return an object with attribute the bones of the raccoon.
    Parameters:
    - root: root of the object.
 */
function raccoonBones(root) {
  return {
  spine_00_02 : root.getObjectByName("spine_00_02"),
  tail_00_03 : root.getObjectByName("tail_00_03"),
  tail_01_04 : root.getObjectByName("tail_01_04"),
  tail_02_05 : root.getObjectByName("tail_02_05"),
  tail_03_06 : root.getObjectByName("tail_03_06"),
  tail_04_07 : root.getObjectByName("tail_04_07"),
  spine_01_08 : root.getObjectByName("spine_01_08"),
  spine_02_09 : root.getObjectByName("spine_02_09"),
  spine_03_010 : root.getObjectByName("spine_03_010"),
  neck_011 : root.getObjectByName("neck_011"),
  head_012 : root.getObjectByName("head_012"),
  jaw_lower_013 : root.getObjectByName("jaw_lower_013"),
  shoulder_L_014 : root.getObjectByName("shoulder_L_014"),
  front_thigh_L_015 : root.getObjectByName("front_thigh_L_015"),
  front_shin_L_016 : root.getObjectByName("front_shin_L_016"),
  front_foot_L_017 : root.getObjectByName("front_foot_L_017"),
  f_pinky_00_L_018 : root.getObjectByName("f_pinky_00_L_018"),
  f_pinky_01_L_019 : root.getObjectByName("f_pinky_01_L_019"),
  f_ring_00_L_020 : root.getObjectByName("f_ring_00_L_020"),
  f_ring_01_L_021 : root.getObjectByName("f_ring_01_L_021"),
  f_middle_00_L_022 : root.getObjectByName("f_middle_00_L_022"),
  f_middle_01_L_023 : root.getObjectByName("f_middle_01_L_023"),
  f_index_00_L_024 : root.getObjectByName("f_index_00_L_024"),
  f_index_01_L_025 : root.getObjectByName("f_index_01_L_025"),
  shoulder_R_026 : root.getObjectByName("shoulder_R_026"),
  front_thigh_R_027 : root.getObjectByName("front_thigh_R_027"),
  front_shin_R_028 : root.getObjectByName("front_shin_R_028"),
  front_foot_R_029 : root.getObjectByName("front_foot_R_029"),
  f_pinky_00_R_030 : root.getObjectByName("f_pinky_00_R_030"),
  f_pinky_01_R_031 : root.getObjectByName("f_pinky_01_R_031"),
  f_ring_00_R_032 : root.getObjectByName("f_ring_00_R_032"),
  f_ring_01_R_033 : root.getObjectByName("f_ring_01_R_033"),
  f_middle_00_R_034 : root.getObjectByName("f_middle_00_R_034"),
  f_middle_01_R_035 : root.getObjectByName("f_middle_01_R_035"),
  f_index_00_R_036 : root.getObjectByName("f_index_00_R_036"),
  f_index_01_R_037 : root.getObjectByName("f_index_01_R_037"),
  ribcage_038 : root.getObjectByName("ribcage_038"),
  thigh_L_039 : root.getObjectByName("thigh_L_039"),
  shin_L_040 : root.getObjectByName("shin_L_040"),
  foot_00_L_041 : root.getObjectByName("foot_00_L_041"),
  foot_01_L_042 : root.getObjectByName("foot_01_L_042"),
  r_pinky_00_L_043 : root.getObjectByName("r_pinky_00_L_043"),
  r_pinky_01_L_044 : root.getObjectByName("r_pinky_01_L_044"),
  r_ring_00_L_045 : root.getObjectByName("r_ring_00_L_045"),
  r_ring_01_L_046 : root.getObjectByName("r_ring_01_L_046"),
  r_middle_00_L_047 : root.getObjectByName("r_middle_00_L_047"),
  r_middle_01_L_048 : root.getObjectByName("r_middle_01_L_048"),
  r_index_00_L_049 : root.getObjectByName("r_index_00_L_049"),
  r_index_01_L_050 : root.getObjectByName("r_index_01_L_050"),
  thigh_R_051 : root.getObjectByName("thigh_R_051"),
  shin_R_052 : root.getObjectByName("shin_R_052"),
  foot_00_R_053 : root.getObjectByName("foot_00_R_053"),
  foot_01_R_054 : root.getObjectByName("foot_01_R_054"),
  r_pinky_00_R_055 : root.getObjectByName("r_pinky_00_R_055"),
  r_pinky_01_R_056 : root.getObjectByName("r_pinky_01_R_056"),
  r_ring_00_R_057 : root.getObjectByName("r_ring_00_R_057"),
  r_ring_01_R_058 : root.getObjectByName("r_ring_01_R_058"),
  r_middle_00_R_059 : root.getObjectByName("r_middle_00_R_059"),
  r_middle_01_R_060 : root.getObjectByName("r_middle_01_R_060"),
  r_index_00_R_061 : root.getObjectByName("r_index_00_R_061"),
  r_index_01_R_00 : root.getObjectByName("r_index_01_R_00")};
}

/* Function that creates a cone with three sides to simulate a pyramid.
   This pyramid rotated backwards indicates which is our raccoon. Also sets the animation of the cursor */
function myRacconCursor() {
  const myRacconCursor = new THREE.ConeGeometry(0.3, 1, 4);
  const myRacconCursorMat = new THREE.MeshPhongMaterial({
    color: 0xFF0000,
  });
  myRacconCursorMesh = new THREE.Mesh(myRacconCursor,myRacconCursorMat);
  myRacconCursorMesh.rotation.z += Math.PI;
  myRacconCursorMesh.position.x = -140/2 + 0.7;
  myRacconCursorMesh.position.y = 3.5;
  myRacconCursorMesh.position.z = 4.5;
  var cursorAnimation1 = new TWEEN.Tween(myRacconCursorMesh.position).to({x: myRacconCursorMesh.position.x, y:3, z: myRacconCursorMesh.position.z}, 1300);
  cursorAnimation1.repeat(Infinity);
  cursorAnimation1.yoyo(true);
  cursorAnimation1.start();

  var cursorAnimation2 = new TWEEN.Tween(myRacconCursorMesh.rotation).to({x: myRacconCursorMesh.rotation.x, y:-Math.PI, z: myRacconCursorMesh.rotation.z}, 2000);
  cursorAnimation2.repeat(Infinity);
  cursorAnimation2.yoyo(true);
  cursorAnimation2.start();

  animations.push(cursorAnimation1);
  animations.push(cursorAnimation2);

  scene.add(myRacconCursorMesh);
}

// Function that add at the scene the emisphere light.
function myEmisphereLight(){
  const skyColor = 0xB1E1FF;
  const groundColor = 0xB97A20;
  const intensity = 0.2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}

// Function that create the torches
function torches() {
  myTorch(-62, 0, 7, 0.15);
  myTorch(-34, 0, 7, 0.15);
  myTorch(-6, 0, 7, 0.15);
  myTorch(22, 0, 7, 0.15);
  myTorch(50, 0, 6, 0.15);
  myTorch(71, 3.2, 7.6, 0.1, 0.5);
  myTorch(71, 3.2, -7.6, 0.1, 0.5);
}

// Function that load the torch model and set its animations and starting position.
function myTorch(x, y, z, scale, rotation = 1) {
  gltfLoader.load('./../resources/models/torch/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(scale);
    root.position.x = x;
    root.position.y = y;
    root.position.z = z;
    root.rotation.y = Math.PI*rotation;
  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true; 
        object.material.depthWrite = true;
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }      
      } 
    });

    var fire = root.getObjectByName("mesh_2");
    var animation1 = new TWEEN.Tween(fire.scale).to({x:fire.scale.x * 1.3, y:fire.scale.y * 1.3, z:fire.scale.z * 0.7},1000);
    animation1.repeat(Infinity);
    animation1.yoyo(true);
    animation1.start();
    var animation2 = new TWEEN.Tween(fire.position).to({x:fire.position.x-0.6, y:fire.position.y-0.6, z:4},1000);
    animation2.repeat(Infinity);
    animation2.yoyo(true);
    animation2.start();

    animations.push(animation1)
    animations.push(animation2)
    
    torchLight(x-(1*scale),y+(16*scale),z+(1*scale))
    scene.add(root);
  }, undefined, function (error) {
    console.error(error);
  });
}

/* Function that add at the scene the point light positioned on the top of a torch. 
   If the "enable shadow" checkbox in the menu has been selected, then the light will cast shadows. */
function torchLight(x, y, z){
  const color = "#ff5500";
  const intensity = 1;
  const light = new THREE.PointLight(color, intensity);
  light.distance = 40;
  light.position.set(x, y, z);
  if (enableShadow) {
    light.castShadow = true;
    light.shadow.bias = -0.001;
  }
  scene.add(light);
}

// Function that adds light blue fog to the scene, simulating an unfinished plane with a sky.
function fog() {
  const near = 1;
  const far = 500;
  const color = '#020c1c';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);
}

/* Function that load the balloon and set its starting position not visible in camera.
   In addition, the material is modified to make it transparent and with a random colour.*/
function myBallon() {
  gltfLoader.load('./../resources/models/balloon/scene.gltf', function (gltf){
    const root = gltf.scene;
    root.scale.multiplyScalar(0.02); 
    root.position.x = 500;  
    root.traverse((object) => {
      if (object.isMesh){
        object.frustumCulled = true;   
        if (enableShadow) {
          object.receiveShadow = true;
          object.castShadow = true;
        }     
      } 
    });
  
    var balloon = root.getObjectByName("Balloon_ballon_0");
    balloon.material.color.r = Math.random();
    balloon.material.color.g = Math.random();
    balloon.material.color.b = Math.random();
    balloon.material.opacity = 0.8;
    balloon.material.transparent = true;

    balloons.add(root);
    balloonToSpawn.push(root)
  }, undefined, function (error) {
    console.error(error);
  });
}

/*  Function that fake spawn a ballon aimply move it to the position where it should be and start the animations.
    Parameters:
    - i: i represent the i-th balloon that spawn only if raccoon passed (-70 + (i+1)*20) units.
 */
function spawnBalloon(i) {
  if (raccoons[0][0].position.x > (-70 + (i+1)*20) && spawnBalloonBoolean[i]) {
    spawnBalloonBoolean[i] = false
    balloonToSpawn[i].position.x = raccoons[0][0].position.x + 3 +(Math.random() - 0.5)*5;
    balloonToSpawn[i].position.y = 0;
    balloonToSpawn[i].position.z = -10 - (Math.random() - 0.5)*8;
    var balloon = balloonToSpawn[i].getObjectByName("Balloon_ballon_0");
    var animation1 = new TWEEN.Tween(balloon.scale).to({x:balloon.scale.x, y:0.5, z:balloon.scale.z}, 1000);
    animation1.repeat(Infinity);
    animation1.yoyo(true);
    animation1.start();
    var animation2 = new TWEEN.Tween(balloon.position).to({x:balloon.position.x, y:balloon.position.y + 50, z:balloon.position.z}, 1000);
    animation2.repeat(Infinity);
    animation2.yoyo(true);
    animation2.start();
    var animation3 = new TWEEN.Tween(balloonToSpawn[i].position).to({x:raccoons[0][0].position.x, y:50, z:balloonToSpawn[i].position.z}, 10000);
    animation3.onUpdate(function() {
      if (balloonToSpawn[i].position.y > 45){
        animation3.stop();
        balloons.remove(balloonToSpawn[i]);
      }
    });
    animation3.start();

    animations.push(animation1);
    animations.push(animation2);
    animations.push(animation3);
  } 
}

// Function triggered by mouse click to pop the balloon if clicked on.
function onClickBalloon(event) {
  var selectedObject;
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(balloons.children, true);
  if (intersects.length > 0) {
    selectedObject = intersects[0].object;
    while (selectedObject.name != "OSG_Scene") selectedObject = selectedObject.parent;
    var randBalloonExplosionAudio = Math.floor(Math.random() * 3) + 1
    play("./../resources/audios/balloon/balloonExplosion" + randBalloonExplosionAudio + ".wav", 0.05, false, true, "", 0);
    boostBalloon += 0.17;
    balloonPopped += 1;
    balloons.remove(selectedObject);
  }
}

/*  Function that loads the audio and starts it up if possible.
    Parameters:
    - audio: the path of the audio file;
    - volume: volume of playback;
    - loop: if true the audio is in loop;
    - preload: if true the audio starts immediately;
    - idValue: string that identify the audio in audios array;
    - delay: time before the audio starts.
 */
function play(audio, volume, loop, preload, idValue, delay) { 
  const listener = new THREE.AudioListener();
  camera.add( listener );
  var sound = new THREE.Audio( listener );
  sounds.push([sound, idValue]);
  const audioLoader = new THREE.AudioLoader();
  setTimeout(() => {
    audioLoader.load(audio, function( buffer ) {
      sound.setBuffer( buffer );
      sound.setLoop(loop);
      sound.setVolume(volume);
      if(preload) sound.play();
    });
  }, delay);
}

/*  Function that return audio by id.
    Parameters:
    - idValue: string that identify the audio in audios array.
 */
function findSound(idValue){
  for(var i = 0; i < sounds.length; i++){
    if(sounds[i][1] == idValue){
      return sounds[i][0];
    }
  }
}

// Function that stop all animals audio.
function stopSoundAnimals(){
  for(var i = 0; i < sounds.length; i++){
    if(sounds[i][1] == ""){
      sounds[i][0].stop();
    }
  }
}

/* Function triggere when some when any key on the keyboard is pressed. In particular,
   when A or D is pressed, the amount of addition or removal from the bar speed is calculated.*/
function onKeyDown(event) {
  var base = (maxSpeed*7) /100;
  var error = (maxSpeed*20) /100;
  var percentage = (100*barSpeed)/maxSpeed;
  var decrease = (maxSpeed*6) /100;
  switch(event.keyCode){
    case 65:
      if (!a) {
        a = true;
        d = false;
        barSpeed += base - ((decrease*percentage)/100);
        if(barSpeed>maxSpeed) barSpeed = maxSpeed;
      } else barSpeed -= error;
      break;
    case 68:
      if (!d) {
        d = true;
        a = false;
        barSpeed += base - ((decrease*percentage)/100);
        if(barSpeed>maxSpeed) barSpeed = maxSpeed;
      } else barSpeed -= error;
      break;
  }
}

// Main function.
function init(){
  /*** Renderer ***/
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  enableShadow = localStorage.getItem("shadow");
  if (enableShadow == "true") renderer.shadowMap.enabled = true;
  
  /*** Camera ***/
  camera.position.set(-60, 3, -4.5);
  camera.lookAt(-69.3, 0.1, -4.5);

  /*** Scene ***/
  scene.background = new THREE.Color("lightblue");
  scene.add(balloons)
  
  /*** Event Listener ***/  
  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener("mousedown", onClickBalloon, true);

  /*** Set environment ***/
  environment();

  /*** Start frame rendering ***/
  requestAnimationFrame(render);
}

// Resizes the renderer if the window changes its height or width.
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Function that creates a canvas containing the HUD and the game.
function createCanvas(orbitDiv, div, div2, html){
  orbitDiv.innerHTML= "";
  div2.setAttribute("id","hud");
  div2.setAttribute("ng-class","{visible: style.visible");
  div2.setAttribute("class","visible");
  div2.setAttribute("draggable", "false");
  div2.setAttribute("ondragstart", "drag(event)");
  div2.innerHTML= html;
  renderer.domElement.setAttribute("class","canvasColor");
  div.setAttribute("class", "unselectable");
  div.appendChild(renderer.domElement);
  div.appendChild(div2);
  orbitDiv.appendChild(div);
}

// Function that speeds up all raccoon animations to simulate the speed obtained with 144 FPS.
function setSpeedFps() {
  var weight = fps/boostfps;
  for (var i = 0; i<5; i++) legStepsAnimation[i]*=weight;
}

// Function that stop all animations.
function stopAnimations(){
  for(var i = 0; i < animations.length ; i++){
    animations[i].stop();
  }
}

/*  Function that animates all things in the game (camera, raccoons, internal html and so on).
    Parameters:
    - time: time passed by the reneder function. This is the time elapsed since the first frame.
 */
function startGame(time) {
  /*** Start game, camer and lookAt animations ***/
  var weight = fps/boostfps;        // Weight that speeds up this camera and lookAt animation to simulate a result obtained with 144 FPS.
  if (start1Camera < 4.5) {         // First animation of the camera and lookAt. From the farthest raccoon to the nearest raccoon.
    var step1Camera = 9/(400*weight); 
    start1Camera += step1Camera;
    camera.position.set(-60, 3, start1Camera);
    camera.lookAt(-69.3, 0.1, start1Camera);
  } else if (start2CameraZ < 25) {  // Second animation of the camera and lookAt. From the nearest raccoon to start game point.
    var step2CameraZ = 20.5/(400*weight);
    var step2CameraX = -23.16/(400*weight);
    start2CameraZ += step2CameraZ;
    start2CameraX += step2CameraX;
    camera.position.set(start2CameraX, 3, start2CameraZ);
    camera.lookAt(-69.3, 0.1, 4.5);
  } else 
  if (one) {
    startingTime = time; // Use this time as a starting point for the next calculations.
    one = false;
  }

  /*** Countdown ***/
  if ((time - startingTime) >= 0 && (time - startingTime) <= 1){  // First second.
    if(countdownSound){
      countdownSound = false;
      findSound("countdown").play();
    }
    var countdown = document.getElementById("countdown")
    countdown.innerHTML = 3;
    var size = 140 + 220*(time-startingTime);
    countdown.setAttribute("style","font-size: " + size + "px;");
  }
  if ((time - startingTime) >= 1 && (time - startingTime) <= 2){  // Second second.
    var countdown = document.getElementById("countdown")
    countdown.innerHTML = 2;
    var size = 140 + 220*(time-startingTime - 1);
    countdown.setAttribute("style","font-size: " + size + "px;");
  }
  if ((time - startingTime) >= 2 && (time - startingTime) <= 3){  // Third second.
    var countdown = document.getElementById("countdown")
    countdown.innerHTML = 1;
    var size = 140 + 220*(time-startingTime - 2);
    countdown.setAttribute("style","font-size: " + size + "px;");
  }
  if ((time - startingTime) >= 3 && (time - startingTime) <= 4){  // Fourth second and "GO!" text.
    var countdown = document.getElementById("countdown")
    countdown.innerHTML = "GO!";
    var opacity = 1 - (time - startingTime - 3);
    if(inGame){
      inGame = false;
      findSound("inGame").play();
    }
    countdown.setAttribute("style","font-size: 220px; opacity: " + opacity + ";");
  } 
  if ((time - startingTime) >= 4 && endCountdown){                // Fifth second and eliminate the text.
    endCountdown = false;
    var countdown = document.getElementById("countdown");
    countdown.innerHTML = "";
  }

  /*** Game started ***/
  if(raccoonLoaded == 5 && (time - startingTime) >= 3){
    var finish = false;
    // Search if some raccoon win the game.
    for(var i = 0; i < raccoons.length; i++){
      if(raccoons[i][0].position.x > 69.3){
        finish = true;
      }
    }
    if (!finish){ // If the game is not finished.
      // Move the camera with our raccoon
      camera.position.set(raccoons[0][0].position.x*1.2, 3, 25);
      camera.lookAt(raccoons[0][0].position.x, raccoons[0][0].position.y, raccoons[0][0].position.z);

      // Set some value for the end game animation.
      startCameraFinishPosition = {x: raccoons[0][0].position.x*1.2, y: 3, z: 25};
      startCameraLookAtFinishPosition = {x: raccoons[0][0].position.x, y: raccoons[0][0].position.y, z: raccoons[0][0].position.z};
      cameraFinishMovement = startCameraFinishPosition;
      cameraLookAtFinishMovement = startCameraLookAtFinishPosition;

      // At the start of the game the bar speed must be 0
      if(barSpeedReset){
        barSpeedReset = false;
        barSpeed = 0;
      }

      // Update HUD in real time.
      hudUpdate(time, startingTime);

      // Spawn balloon.
      for (var i = 0; i < spawnBalloonBoolean.length; i ++) spawnBalloon(i); 

      // Move cursor with our raccoon
      myRacconCursorMesh.position.x = raccoons[0][0].position.x;

      /*** Walk racccoon animation ***/
      for (var i = 0; i < raccoons.length; i++) {
        // Move the whole model.
        var step = 3/ legStepsAnimation[i];
        raccoons[i][0].position.x += step*barSpeedF(i);

        // Rotate shoulders.
        walkFrontShoulderLeft(i);
        walkFrontShoulderRight(i);

        // Rotate shins
        walkFrontShinRight(i);
        walkFrontShinLeft(i);
        walkBackShin(i);
        
        // Rotate feet.
        walkFrontFootLeft(i);
        walkFrontFootRight(i);
        walkBackFootLeft(i);
        walkBackFootRight(i); 
    
        // Rotate thigs.
        walkBackThighLeft(i);
        walkBackThighRight(i);
        
        // Move and rotate torso, spine and neck.
        walkSpine(i);    
        walkRibCage(i);    
        walkNeck(i);
    
        // Rotate tails joint.
        tail(i);
    
        // Repeat all animation back and forth
        yoyo(i);
      }
    } else{  // If the game is finished.
      // Stop all animation for the photo finish.
      stopAnimations();

      // Change the music and stop all sound with idValue = "".
      if(endGame){
        endGame = false;
        stopSoundAnimals();
        findSound("inGame").stop();
        findSound("endGame").play();
      }

      // End game camera and lookAt animation. From its position to photo finish position.
      if (cameraFinishMovement.y >= 1) {
        cameraFinishStepsAnimation = 200 * weight;
        myRacconCursorMesh.position.x = raccoons[0][0].position.x;
        var cameraFinishDistance = {x:Math.abs(startCameraFinishPosition.x - 80),
                                    y:Math.abs(startCameraFinishPosition.y - 1),  
                                    z:Math.abs(startCameraFinishPosition.z - 8)}
        var cameraFinishLookAtDistance = {x:Math.abs(startCameraLookAtFinishPosition.x - 70),
                                          y:Math.abs(startCameraLookAtFinishPosition.y - 3),  
                                          z:Math.abs(startCameraLookAtFinishPosition.z - 0)}
  
        var stepsCameraFinish = {x:cameraFinishDistance.x/cameraFinishStepsAnimation,
                                 y:cameraFinishDistance.y/cameraFinishStepsAnimation,  
                                 z:cameraFinishDistance.z/cameraFinishStepsAnimation};
        var stepsCameraLookAtFinish = {x:cameraFinishLookAtDistance.x/cameraFinishStepsAnimation,
                                       y:cameraFinishLookAtDistance.y/cameraFinishStepsAnimation,  
                                       z:cameraFinishLookAtDistance.z/cameraFinishStepsAnimation};
  
        cameraFinishMovement = {x:cameraFinishMovement.x - ((startCameraFinishPosition.x-80)/Math.abs(startCameraFinishPosition.x-80))* stepsCameraFinish.x,
                                y:cameraFinishMovement.y - stepsCameraFinish.y,
                                z:cameraFinishMovement.z - stepsCameraFinish.z};
        cameraLookAtFinishMovement = {x:cameraLookAtFinishMovement.x + stepsCameraLookAtFinish.x,
                                      y:cameraLookAtFinishMovement.y + stepsCameraLookAtFinish.y,  
                                      z:cameraLookAtFinishMovement.z - stepsCameraLookAtFinish.z};
        camera.position.set(cameraFinishMovement.x, cameraFinishMovement.y, cameraFinishMovement.z);
        camera.lookAt(cameraLookAtFinishMovement.x, cameraLookAtFinishMovement.y, cameraLookAtFinishMovement.z);
      } else if(endRace){ // If end game camera and lookAt animation is finished, set the end game HUD
        endRace = false;
        if(position != 1) timePassed = "Time: N / D";
        document.getElementById("hud").innerHTML =  '<div align="center" class="overlay endScoreFont">' +
                                                      '<div style="font-size: 130px">'+ "Your Score<br>" + '</div>' +
                                                      '<div>'+ "Position: " + position + "°<br>" + '</div>' +
                                                      '<div>'+ timePassed + '</div>' +
                                                      '<div>'+ "Balloons Popped: " + balloonPopped + "/5<br>" + '</div>' +
                                                      '<div style="padding: 50px;">' +
                                                        '<button id = "button2" onclick="location.href=\'./../menu.html\'">Main Menu</button>' +
                                                      '</div>' +
                                                    '</div>';

      }
    }
  }
}

/*  Function that animates the front-left shoulder.
    Parameters:
    - i: the i-th raccoon.
 */
function walkFrontShoulderLeft(i) {
  var shoulderLStep = {x: changeShoulderL[i].x/legStepsAnimation[i], z: changeShoulderL[i].z/legStepsAnimation[i]};
  raccoons[i][1].shoulder_L_014.rotation.x += shoulderLStep.x * frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].shoulder_L_014.rotation.z += shoulderLStep.z * frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates the front-right shoulder.
    Parameters:
    - i: the i-th raccoon.
 */
function walkFrontShoulderRight(i) {
  var shoulderRStep = {x: changeShoulderR[i].x/legStepsAnimation[i], z: changeShoulderR[i].z/legStepsAnimation[i]};
  raccoons[i][1].shoulder_R_026.rotation.x += shoulderRStep.x * frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].shoulder_R_026.rotation.z -= shoulderRStep.z * frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates the front-right shin.
    Parameters:
    - i: the i-th raccoon.
 */
function walkFrontShinRight(i) {
  var step1 = {x: changeShinFrontR[i]/(legStepsAnimation[i]*0.32)}
  var step2 = {x: changeShinFrontR[i]/(legStepsAnimation[i]*0.68)}
  if (shinFrontR1[i]) {
    if (frontLegsDirection[i] == -1) {
      shinFrontR1[i] = false;
      shinFrontR2[i] = true;
    }
  } 
  if (shinFrontR2[i]) {
    raccoons[i][1].front_shin_R_028.rotation.x += step1.x * frontLegsDirection[i]*barSpeedF(i);
    if (raccoons[i][1].shoulder_L_014.rotation.x <= 0.5*Math.PI) {
      shinFrontR2[i] = false;
      shinFrontR3[i] = true;
    }
  }
  if (shinFrontR3[i]) {
    raccoons[i][1].front_shin_R_028.rotation.x -= step2.x * frontLegsDirection[i]*barSpeedF(i);
    if ( frontLegsDirection[i] == 1) {
      raccoons[i][1].front_shin_R_028.rotation.x = startRotationShinFrontR[i];
      shinFrontR3[i] = false;
      shinFrontR1[i] = true;
    }
  }
}

/*  Function that animates the front-Left shin.
    Parameters:
    - i: the i-th raccoon.
 */
function walkFrontShinLeft(i) {
  var step1 = {x: changeShinFrontL[i]/(legStepsAnimation[i]*0.32)}
  var step2 = {x: changeShinFrontL[i]/(legStepsAnimation[i]*0.68)}
  if (shinFrontL1[i]) {
    if (frontLegsDirection[i] == -1) {
      shinFrontL1[i] = false;
      shinFrontL2[i] = true;
    }
  } 
  if (shinFrontL2[i]) {
    raccoons[i][1].front_shin_L_016.rotation.x += step1.x * frontLegsDirection[i]*barSpeedF(i);
    if (raccoons[i][1].shoulder_L_014.rotation.x <= 0.5*Math.PI) {
      shinFrontL2[i] = false;
      shinFrontL3[i] = true;
    }
  }
  if (shinFrontL3[i]) {
    raccoons[i][1].front_shin_L_016.rotation.x -= step2.x * frontLegsDirection[i]*barSpeedF(i);
    if ( frontLegsDirection[i] == 1) {
      raccoons[i][1].front_shin_L_016.rotation.x = startRotationShinFrontL[i];
      shinFrontL3[i] = false;
      shinFrontL1[i] = true;
    }
  }
}

/*  Function that animates the back shin.
    Parameters:
    - i: the i-th raccoon.
 */
function walkBackShin(i) {
  var step1 = {x: changeBackShin[i]/(legStepsAnimation[i]*0.32)}
  var step2 = {x: changeBackShin[i]/(legStepsAnimation[i]*0.68)}
  if (frontLegsDirection[i] == 1) {
    if (backShin1[i]) {
      raccoons[i][1].shin_R_052.rotation.x += step2.x * frontLegsDirection[i]*barSpeedF(i);
      raccoons[i][1].shin_L_040.rotation.x += step2.x * frontLegsDirection[i]*barSpeedF(i);
      if (raccoons[i][1].shoulder_L_014.rotation.x >= 0.5*Math.PI) {
        backShin1[i] = false;
        backShin2[i] = true;
      }
    }
    if (backShin2[i]) {
      raccoons[i][1].shin_R_052.rotation.x -= step1.x * frontLegsDirection[i]*barSpeedF(i);
      raccoons[i][1].shin_L_040.rotation.x -= step1.x * frontLegsDirection[i]*barSpeedF(i);
    }
  } else {
    raccoons[i][1].shin_R_052.rotation.x = startRotationBackShin[i].r;
    raccoons[i][1].shin_L_040.rotation.x = startRotationBackShin[i].l;
    backShin1[i] = true;
    backShin2[i] = false;
  }
}

/*  Function that animates the front-left foot.
    Parameters:
    - i: the i-th raccoon.
 */
function walkFrontFootLeft(i) {
  var footL1Step = {x: frontFootL1[i].x/(legStepsAnimation[i])};
  var footL2Step = {x: frontFootL2[i].x/(legStepsAnimation[i]*0.32)};
  var footL3Step = {x: frontFootL3[i].x/(legStepsAnimation[i]*0.68)};

  if (footFrontL1[i]) {
    raccoons[i][1].front_foot_L_017.rotation.x += frontLegsDirection[i]*footL1Step.x*barSpeedF(i);
    if (frontLegsDirection[i] == 1) {
      raccoons[i][1].front_foot_L_017.rotation.x = 0;
      footFrontL1[i] = false;
      footFrontL2[i] = false;
      footFrontL3[i] = true;
    }
  }

  if (footFrontL2[i]) {
    raccoons[i][1].front_foot_L_017.rotation.x += frontLegsDirection[i]*footL2Step.x*barSpeedF(i);
    if (frontLegsDirection[i] == -1) {
      raccoons[i][1].front_foot_L_017.rotation.x = 0.25*Math.PI;
      footFrontL2[i] = false;
      footFrontL3[i] = false;
      footFrontL1[i] = true;
    }
  }

  if (footFrontL3[i]) {
    raccoons[i][1].front_foot_L_017.rotation.x += -frontLegsDirection[i]*footL3Step.x*barSpeedF(i);
    if (raccoons[i][1].front_foot_L_017.rotation.x <= -0.25*Math.PI) {
      raccoons[i][1].front_foot_L_017.rotation.x = -0.25*Math.PI;
      footFrontL3[i] = false;
      footFrontL1[i] = false;
      footFrontL2[i] = true;
    }
  }
}

/*  Function that animates the front-right foot.
    Parameters:
    - i: the i-th raccoon.
 */
function walkFrontFootRight(i) {
  var footR1Step = {x: frontFootR1[i].x/(legStepsAnimation[i])}
  var footR2Step = {x: frontFootR2[i].x/(legStepsAnimation[i]*0.32)}
  var footR3Step = {x: frontFootR3[i].x/(legStepsAnimation[i]*0.68)}

  if (footFrontR1[i]) {
    raccoons[i][1].front_foot_R_029.rotation.x += frontLegsDirection[i]*footR1Step.x*barSpeedF(i);
    if (frontLegsDirection[i] == 1) {
      raccoons[i][1].front_foot_R_029.rotation.x = 0;
      footFrontR1[i] = false;
      footFrontR2[i] = false;
      footFrontR3[i] = true;
    }
  }

  if (footFrontR2[i]) {
    raccoons[i][1].front_foot_R_029.rotation.x += frontLegsDirection[i]*footR2Step.x*barSpeedF(i);
    if (frontLegsDirection[i] == -1) {
      raccoons[i][1].front_foot_R_029.rotation.x = 0.25*Math.PI;
      footFrontR2[i] = false;
      footFrontR3[i] = false;
      footFrontR1[i] = true;
    }
  }

  if (footFrontR3[i]) {
    raccoons[i][1].front_foot_R_029.rotation.x += -frontLegsDirection[i]*footR3Step.x*barSpeedF(i);
    if (raccoons[i][1].front_foot_R_029.rotation.x <= -0.25*Math.PI) {
      raccoons[i][1].front_foot_R_029.rotation.x = -0.25*Math.PI;
      footFrontR3[i] = false;
      footFrontR1[i] = false;
      footFrontR2[i] = true;
    }
  }
}

/*  Function that animates the back-left foot.
    Parameters:
    - i: the i-th raccoon.
 */
function walkBackFootLeft(i) {
  var footLStep = {x: backFootL[i].x/(legStepsAnimation[i]*0.85)}
  if (raccoons[i][1].thigh_R_051.rotation.x >= 0.3*Math.PI) {
    raccoons[i][1].foot_01_L_042.rotation.x -= footLStep.x * frontLegsDirection[i]*barSpeedF(i);
  } else {
    raccoons[i][1].foot_01_L_042.rotation.x = 0.6*Math.PI;
  }
}

/*  Function that animates the back-right foot.
    Parameters:
    - i: the i-th raccoon.
 */
function walkBackFootRight(i) {
  var footRStep = {x: backFootR[i].x/(legStepsAnimation[i]*0.85)}
  if (raccoons[i][1].thigh_R_051.rotation.x >= 0.3*Math.PI) {
    raccoons[i][1].foot_01_R_054.rotation.x -= footRStep.x * frontLegsDirection[i]*barSpeedF(i);
  } else {
    raccoons[i][1].foot_01_R_054.rotation.x = 0.6*Math.PI;
  }
}  

/*  Function that animates the back-left thigh.
    Parameters:
    - i: the i-th raccoon.
 */
function walkBackThighLeft(i) {
  var thighLStep = {x: changeThighBackL[i].x/legStepsAnimation[i], z: changeThighBackL[i].z/legStepsAnimation[i]}
  raccoons[i][1].thigh_L_039.rotation.x -= thighLStep.x * frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].thigh_L_039.rotation.z -= thighLStep.z * frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates the back-right thigh.
    Parameters:
    - i: the i-th raccoon.
 */
function walkBackThighRight(i) {
  var thighRStep = {x: changeThighBackR[i].x/legStepsAnimation[i], z: changeThighBackR[i].z/legStepsAnimation[i]}
  raccoons[i][1].thigh_R_051.rotation.x -= thighRStep.x * frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].thigh_R_051.rotation.z += thighRStep.z * frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates the spine.
    Parameters:
    - i: the i-th raccoon.
 */
function walkSpine(i) {
  var step = 0.1*Math.PI/legStepsAnimation[i];
  raccoons[i][1].spine_00_02.rotation.x -= step*frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].spine_01_08.rotation.x += step*frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].spine_02_09.rotation.x += step*frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].spine_03_010.rotation.x += step*frontLegsDirection[i]*barSpeedF(i);
  step = 0.049/legStepsAnimation[i];
  raccoons[i][1].spine_01_08.position.y -= step*frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].spine_02_09.position.y -= step*frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].spine_03_010.position.y -= step*frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates the rib cage.
    Parameters:
    - i: the i-th raccoon.
 */
function walkRibCage(i) {
  var step1 = 0.21/legStepsAnimation[i];
  var step2 = 0.07/legStepsAnimation[i];
  raccoons[i][1].ribcage_038.position.z -= step1*frontLegsDirection[i]*barSpeedF(i);
  raccoons[i][1].ribcage_038.position.y += step2*frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates the neck.
    Parameters:
    - i: the i-th raccoon.
 */
function walkNeck(i) {
  var neckStep = {x: changeNeck[i].x/legStepsAnimation[i]}
  raccoons[i][1].neck_011.rotation.x -= neckStep.x * frontLegsDirection[i]*barSpeedF(i);
}

/*  Function that animates all joins of the tail.
    Parameters:
    - i: the i-th raccoon.
 */
function tail(i) {
  if(tail1[i]) {
    raccoons[i][1].tail_00_03.rotation.x -= tailValues[i].t1.step*frontLegsDirection[i]*barSpeedF(i);
    raccoons[i][1].tail_01_04.rotation.x -= tailValues[i].t2.step*frontLegsDirection[i]*barSpeedF(i);
    raccoons[i][1].tail_02_05.rotation.x -= tailValues[i].t3.step*frontLegsDirection[i]*barSpeedF(i);
    raccoons[i][1].tail_03_06.rotation.x -= tailValues[i].t4.step*frontLegsDirection[i]*barSpeedF(i);
    raccoons[i][1].tail_04_07.rotation.x -= tailValues[i].t5.step*frontLegsDirection[i]*barSpeedF(i);
    if (raccoons[i][1].tail_00_03.rotation.x <= tailValues[i].t1.start &&
        raccoons[i][1].tail_01_04.rotation.x <= tailValues[i].t2.start &&
        raccoons[i][1].tail_02_05.rotation.x <= tailValues[i].t3.start &&
        raccoons[i][1].tail_03_06.rotation.x <= tailValues[i].t4.start &&
        raccoons[i][1].tail_04_07.rotation.x <= tailValues[i].t5.start) {
      raccoons[i][1].tail_00_03.rotation.x = tailValues[i].t1.start
      raccoons[i][1].tail_01_04.rotation.x = tailValues[i].t2.start
      raccoons[i][1].tail_02_05.rotation.x = tailValues[i].t3.start
      raccoons[i][1].tail_03_06.rotation.x = tailValues[i].t4.start
      raccoons[i][1].tail_04_07.rotation.x = tailValues[i].t5.start
      tail1[i] = false;
      tail2[i] = true;
    }
    if (raccoons[i][1].tail_00_03.rotation.x >= tailValues[i].t1.end && 
          raccoons[i][1].tail_01_04.rotation.x >= tailValues[i].t2.end && 
          raccoons[i][1].tail_02_05.rotation.x >= tailValues[i].t3.end && 
          raccoons[i][1].tail_03_06.rotation.x >= tailValues[i].t4.end && 
          raccoons[i][1].tail_04_07.rotation.x >= tailValues[i].t5.end){
      raccoons[i][1].tail_00_03.rotation.x = tailValues[i].t1.end
      raccoons[i][1].tail_01_04.rotation.x = tailValues[i].t2.end
      raccoons[i][1].tail_02_05.rotation.x = tailValues[i].t3.end
      raccoons[i][1].tail_03_06.rotation.x = tailValues[i].t4.end
      raccoons[i][1].tail_04_07.rotation.x = tailValues[i].t5.end
      tail1[i] = false;
      tail2[i] = true;
    }
  }
  if (tail2[i]) {
    if (((raccoons[i][1].tail_00_03.rotation.x == tailValues[i].t1.end && frontLegsDirection[i] == 1) ||
        (raccoons[i][1].tail_00_03.rotation.x == tailValues[i].t1.start && frontLegsDirection[i] == -1)) &&
        ((raccoons[i][1].tail_01_04.rotation.x == tailValues[i].t2.end && frontLegsDirection[i] == 1) ||
        (raccoons[i][1].tail_01_04.rotation.x == tailValues[i].t2.start && frontLegsDirection[i] == -1)) &&
        ((raccoons[i][1].tail_02_05.rotation.x == tailValues[i].t3.end && frontLegsDirection[i] == 1) ||
        (raccoons[i][1].tail_02_05.rotation.x == tailValues[i].t3.start && frontLegsDirection[i] == -1)) &&
        ((raccoons[i][1].tail_03_06.rotation.x == tailValues[i].t4.end && frontLegsDirection[i] == 1) ||
        (raccoons[i][1].tail_03_06.rotation.x == tailValues[i].t4.start && frontLegsDirection[i] == -1)) &&
        ((raccoons[i][1].tail_04_07.rotation.x == tailValues[i].t5.end && frontLegsDirection[i] == 1) ||
        (raccoons[i][1].tail_04_07.rotation.x == tailValues[i].t5.start && frontLegsDirection[i] == -1))) {
      tail2[i] = false;
      tail1[i] = true;
    }
  }
}

/*  Function that repeat all animation back and forth.
    Parameters:
    - i: the i-th raccoon.
 */
function yoyo(i) {
  // Plays footsteps audio if the leg movement is 1 and touches the track field.
  if (frontLegsDirection[i] == 1 && raccoons[i][1].shoulder_L_014.rotation.x > 0.5*Math.PI && footStep[i]) {
    footStep[i] = false;
    findSound("firstSteps" + i).play()
    findSound("secondSteps" + i).play()
  }
  
  // Used to avoid the sound loop.
  if (frontLegsDirection[i] == -1) footStep[i] = true;

  // Changes the direction of animation.
  if (raccoons[i][1].shoulder_L_014.rotation.x >= 0.65*Math.PI || 
    raccoons[i][1].shoulder_L_014.rotation.x <= startRotationShoulderL[i].x) {
      if(frontLegsDirection == 1) raccoons[i][1].shoulder_L_014.rotation.x = 0.65*Math.PI;
      if(frontLegsDirection == -1) raccoons[i][1].shoulder_L_014.rotation.x = startRotationShoulderL[i].x;
      frontLegsDirection[i] *= -1; 
      /* For other raccoons if the animation is over,
         the next animation starts with a random increase or decrease in speed. 
         This value has probability 0 to be an increase if it has reached the maximum speed 
         while it has high probability if it is far from the maximum speed. */
      if (i != 0 && frontLegsDirection[i] == 1) {
        var weight = fps/boostfps;
        var difference = (70*weight - legStepsAnimation[i]);
        var percentage = (100*difference)/10;
        legStepsAnimation[i] += (Math.random() - 0.5) + (percentage/100)/2;
      } 
  }
}

/*  Function that return the multiplier of the speed.
    Parameters:
    - i: the i-th raccoon. If 0 return barspeed + basevalue + boost given by balloons, 1 otherwise.
 */
function barSpeedF(i) {
  if (i == 0) return  barSpeed + 0.25 + boostBalloon; 
  else return 1
}

/*  Function that update the HUD.
    Parameters:
    - time: time passed since first frame;
    - startingTime: time passed since first frame of the race start.
 */
function hudUpdate(time, startingTime) {
  timeUpdate(time, startingTime)
  positionUpdate();
  AandDUpdate();
  speedBarUpdate();
}

/*  Function that updates the time in the HUD in the format s:c 
    where s are seconds and c are hundredths of a second, both expressed as two digits.
    Parameters:
    - time: time passed since first frame;
    - startingTime: time passed since first frame of the race start.
 */
function timeUpdate(time, startingTime){
  var timeInSeconds = (time - startingTime - 3);
  var seconds = timeInSeconds - (timeInSeconds % 1);
  var hundredths = ((timeInSeconds - seconds) - ((timeInSeconds - seconds) % 0.01)) * 100;
  hundredths -= hundredths % 1;
  var secondString = seconds;
  var hundredthsString = hundredths;
  if (seconds < 10) secondString = "0" + secondString;
  if (hundredths < 10) hundredthsString = "0" + hundredthsString;
  
  timePassed = "Time: " + secondString + ":" + hundredthsString;
  document.getElementById("td3").innerHTML = timePassed;
}

// Function that updates the position in the HUD counting the raccoons in front of our.
function positionUpdate(){
  position = 1;
  for(var i = 1; i < raccoons.length; i++){
    if(raccoons[0][0].position.x < raccoons[i][0].position.x) position++;
  }
  document.getElementById("td2").innerHTML = "Position: " + position + "°";
}

// Function that updates the A and D key in the HUD changing its opacity.
function AandDUpdate(){
  var aBoxHtml = document.getElementById("A");
  var dBoxHtml = document.getElementById("D");
  if (!a) {
    aBoxHtml.setAttribute("style", "background: #AA3333");
  } else{
    aBoxHtml.setAttribute("style", "background: rgba(120, 20, 20, 0.5)");
  }
  if (!d) {
    dBoxHtml.setAttribute("style", "background: #3333AA");
  } else{
    dBoxHtml.setAttribute("style", "background: rgba(20, 20, 120, 0.5)");
  }
}

// Function that updates the bar speed in the HUD.
function speedBarUpdate(){
  var percentageBarSpeed = Math.round((barSpeed/maxSpeed)*100) + "%";
  var speedBar = document.getElementById("speedBar");
  var styleAttribute = "width: " + percentageBarSpeed + "; font-family: Copperplate, Papyrus, fantasy; font-size: 30px"
  speedBar.setAttribute("style", styleAttribute);
  speedBar.innerHTML = "<b>"+ percentageBarSpeed + "</b>";
}

// Utility function used to print the things on console.
function print(elem) {
  console.log(elem);
}

/*  Render function for each frame:
    - time: time passed since first frame;
 */
function render(time) {
  time *= 0.001;

  // If all models are loaded.
  if (allReady){
    /*** FPS fix ***/
    // Starting time to check.
    if (startFps) {
      startFps = false;
      timeFps = time;
    } 
    if (time <= timeFps + 1) fps++; // Count number of frame per 1 second.
    else {
      // Fix speed based on fps registred.
      if (setFps) {        
        setFps = false;
        setSpeedFps()
      }

      // Weight to speeds up the decrese of speed to simulate the decrese obtained with 144 FPS.
      var weight = fps/boostfps;

      // Decrease bar speed over time.
      barSpeed -= 0.00115/weight;
      if(barSpeed < 0) barSpeed = 0;

      // Decrease balloons boost speed over time.
      boostBalloon -= 0.0003/weight;
      if(boostBalloon < 0) boostBalloon = 0;

      // All things about the game
      startGame(time);  
    }
  }

  // Render and Tween (animation) update for each frame
  renderer.render(scene, camera);
  TWEEN.update();
  requestAnimationFrame(render);
}

init();