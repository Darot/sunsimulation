"use strict";

// Globals
var camera, scene, renderer, light;
// Objects
var house, ground, newHouse;
// Mouse positions
var mouseX = 0, mouseY = 0;
// FPS statistics
var stats;
// Keyboard controls
var kcontrols;
// boolean to check if we can move the camera
var spacePressed = false;
// A clock to keep track of time
var clock = new THREE.Clock();
// Global radius and light height
var RADIUS = 250;
var SUN_HEIGHT = 125;

// Define controls for dat.GUI
var Controls = new function() {
    this.shadow = 0.5;
    this.distanceHouse = 15;
    this.distanceNewHouse = 30;
    this.sunGrid = true;
};

function init() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        35,                                             // Field of view
        window.innerWidth / window.innerHeight,         // Aspect ratio
        0.1,                                            // Near plane
        10000                                           // Far plane
    );
    camera.position.set( 75, 75, 75 );
    camera.lookAt( scene.position );

    // Configure keyboard controls 
    kcontrols = new THREE.FlyControls( camera );
    kcontrols.movementSpeed = 1000;
    kcontrols.domElement = document.body;
    kcontrols.rollSpeed = Math.PI / 24;
    kcontrols.autoForward = false;

    // Axes
    var axes = buildAxes( 1000 );
    scene.add(axes);

    // Insert custom stuff
    house = buildHouse(10, 10, 10, 15);                 // A house
    scene.add( house );
    newHouse = buildNewHouse(20, 20, 100, 30);          // The house which should be built
    scene.add( newHouse );
    ground = buildGround( RADIUS );                         // The ground
    scene.add( ground );

    //var ambient = new THREE.AmbientLight( 0x444444 );
    //scene.add( ambient );

    light = buildLight();
    scene.add(light);

    house.castShadow = true;
    house.receiveShadow = true;
    newHouse.castShadow = true;
    newHouse.receiveShadow = true;
    ground.receiveShadow = true;

    renderer.setClearColor( 0xdddddd, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    renderer.render( scene, camera );

    // Add stats view
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );

    // Add event listener for mouse movement
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // Add event listener for key pressing
    document.addEventListener( 'keydown', onKeyDown, false );
}

function render() {
    var delta = clock.getDelta();

    if(spacePressed) {
        camera.position.x += mouseX * 0.05;
        camera.position.x = Math.max( Math.min( camera.position.x, 1000 ), -1000 );
        camera.lookAt( scene.position );
        camera.updateProjectionMatrix();
    }
    // Speed of sun movement (time for a full loop in seconds)
    var speed = 6;
    var speedScale = (0.001*2*Math.PI)/speed;
    var angle = Date.now()*speedScale;
    light.position.x = Math.sin(angle)*RADIUS;
    light.position.z = Math.cos(angle)*RADIUS;
    light.shadowDarkness = Controls.shadow;
    light.shadowCameraVisible = Controls.sunGrid;

    house.position.x = Controls.distanceHouse * -1;
    newHouse.position.x = Controls.distanceNewHouse;

    kcontrols.movementSpeed = 50;
    kcontrols.update( delta );

    renderer.render( scene, camera );
}

function animate() {
    // Update view related information
    render();
    // Update statistics of FPV
    stats.update();

    requestAnimationFrame( animate );
}

function buildLight() {
    // Lights
    var light = new THREE.SpotLight(0xffffff);
    light.position.set(RADIUS, SUN_HEIGHT, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadowDarkness = Controls.shadow;
    light.shadowCameraVisible = true; // only for debugging

    // these six values define the boundaries of the yellow box seen above
    light.shadowCameraNear = 4;
    light.shadowCameraFar = RADIUS*2;
    light.shadowCameraLeft = -15;
    light.shadowCameraRight = 15;
    light.shadowCameraTop = 15;
    light.shadowCameraBottom = -15;

    return light
}

function buildHouse( x, y, z, distanceFromCenter ) {
    var geometry = new THREE.BoxGeometry( x, y, z );
    var material = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = distanceFromCenter * -1;
    mesh.position.y = y/2;
    mesh.position.z = 0;
    return mesh;
}

function buildNewHouse( x, y, z, distanceFromCenter ) {
    var geometry = new THREE.BoxGeometry( x, y, z );
    var material = new THREE.MeshLambertMaterial( { color: 0xFFFFA0 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = distanceFromCenter;
    mesh.position.y = y/2;
    mesh.position.z = 0;
    return mesh;
}

function buildGround( radius ) {
    var segments = 128;
    var geometry = new THREE.CircleGeometry( radius, segments );
    var material = new THREE.MeshLambertMaterial( { color: 0x008000 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    mesh.rotation.x = (Math.PI / 2) * -1;
    return mesh;
}

function buildAxes( length ) {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

    return axes;
}

function buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
        mat; 

    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 0.5, gapSize: 0.5 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line( geom, mat, THREE.LinePieces );

    return axis;
}

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - window.innerWidth / 2 );
    mouseY = ( event.clientY - window.innerHeight / 2 );
}

function onKeyDown( event ) {
      var keyCode = event.keyCode;
      if(keyCode==77) {
          if(spacePressed) {
              spacePressed = false;
          } else {
              spacePressed = true;
          }
      }
}

window.onload = function() {
    var gui = new dat.GUI();
    gui.add(Controls, 'shadow', 0, 1);
    gui.add(Controls, 'distanceHouse', 0, 100);
    gui.add(Controls, 'distanceNewHouse', 0, 100);
    gui.add(Controls, 'sunGrid');

    init();
    animate();
};
