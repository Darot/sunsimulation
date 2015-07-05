"use strict";

// Globals
var camera, scene, renderer, light, views, view;
// Windows size
var windowWidth, windowHeight;
// Objects
var house, ground, newHouse;
// Mouse positions
var mouseX = 0, mouseY = 0;
// Time and date
var currentTime;
// Text object to show date and time
var textParams, textMaterial, textOfTime, objectOfTime;
// FPS statistics
var stats;
// Keyboard controls
var kcontrols;
// Mouse controls;
var mcontrols;
// boolean to check if we can move the camera
var pressM = false;
// A clock to keep track of the time
var clock, time, delta, tmpDelta = 0.0;
// Global radius and light height
var RADIUS = 400;
var SUN_HEIGHT = 125;

// Define controls for dat.GUI
var Controls = new function() {
    // Environment
    this.shadow = 0.5;
    this.sunGrid = true;
    this.fog = 0.001;
    // Date/Time
    this.day = 1;
    this.month = 1;
    this.year = 2000;
    this.hour = 18;
    this.minute = 27;
    this.delta = 'm';
    // Objects
    this.distanceHouse = 15;
    this.distanceNewHouse = 30;

};

var views = [
    {
        left: 0,
        bottom: 0,
        width: 0.5,
        height: 1.0,
        eye: [ 400, 400, 400 ],
        up: [ 0, 1, 0 ],
        fov: 60,
        updateCamera: function ( camera, scene, mouseX, mouseY ) {
        }
    },
    {
        left: 0.5,
        bottom: 0,
        width: 0.5,
        height: 0.5,
        eye: [ 0, 200, 0 ],
        up: [ 0, 1, 0 ],
        fov: 45,
        updateCamera: function ( camera, scene, mouseX, mouseY ) {
        //  camera.position.x -= mouseX * 0.05;
        //  camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
            camera.lookAt( scene.position );
        }
    },
    {
        left: 0.5,
        bottom: 0.5,
        width: 0.5,
        height: 0.5,
        eye: [ 0, 100, 200 ],
        up: [ 0, 1, 0 ],
        fov: 60,
        updateCamera: function ( camera, scene, mouseX, mouseY ) {
            if(pressM) {
                camera.position.x += mouseX * 0.05;
                camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
            }
            camera.lookAt( scene.position );
        }
    }
];

function init() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xA8A8A8, 0.001 );

    // Camera
    //camera = new THREE.PerspectiveCamera(
    //    35,                                             // Field of view
    //    window.innerWidth / window.innerHeight,         // Aspect ratio
    //    0.1,                                            // Near plane
    //    10000                                           // Far plane
    //);
    //camera.position.set( 400, 400, 400 );
    //camera.lookAt( scene.position );
    for (var ii =  0; ii < views.length; ++ii ) {
        view = views[ii];
        camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.x = view.eye[ 0 ];
        camera.position.y = view.eye[ 1 ];
        camera.position.z = view.eye[ 2 ];
        camera.up.x = view.up[ 0 ];
        camera.up.y = view.up[ 1 ];
        camera.up.z = view.up[ 2 ];
        camera.lookAt( scene.position );
        view.camera = camera;
    }

    // A clock object to access the THREEjs clock
    clock = new THREE.Clock();

    // A currentTime dateobject for the simulated time
    currentTime = moment();

    // Configure keyboard controls 
    kcontrols = new THREE.FlyControls( views[0].camera );
    kcontrols.movementSpeed = 100;
    kcontrols.domElement = document.body;
    kcontrols.rollSpeed = Math.PI / 24;
    kcontrols.autoForward = false;

    // Configure mouse controls
    //mcontrols = new THREE.OrbitControls( camera );
    //mcontrols.damping = 0.2;
    //mcontrols.addEventListener( 'change', render );

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

    // Create text of current simulation time
    textParams = {
        size:           15,    // size of the text
        height:     0.5,   // thickness to extrude text
        curveSegments: 3,       // number of points on the curves
        font:           'helvetiker',       // font name
        weight:         'normal',       // font weight (normal, bold)
        style:      'normal',       // font style  (normal, italics)
    }
    textMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    textOfTime = new THREE.TextGeometry(currentTime.toString(), textParams);
    objectOfTime = new THREE.Mesh(textOfTime, textMaterial); 
    objectOfTime.position.x = RADIUS/4;
    objectOfTime.position.z = 30;
    objectOfTime.rotation.x = (Math.PI / 2) * -1;
    scene.add(objectOfTime);

    // Ambient light to add some indirect lightning to the scene.
    var ambient = new THREE.AmbientLight( 0x404040 );
    scene.add( ambient );

    // Add a light source as 'sun'.
    light = buildLight();
    scene.add(light);

    // Define who is casting and receiving shadows.
    house.castShadow = true;
    house.receiveShadow = true;
    newHouse.castShadow = true;
    newHouse.receiveShadow = true;
    ground.receiveShadow = true;

    // Define renderer settings
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

function animate() {
    // Request new frame from browser
    requestAnimationFrame( animate );
    // Update statistics of FPV
    stats.update();

    // The time since the last frame
    delta = clock.getDelta();
    // The time sind intantiation the clock
    time = clock.getElapsedTime();

    // If we press M on the keyboard, the position of the camera changes.
    if(pressM) {
        camera.position.x += mouseX * 0.05;
        // Returns a value between -1000 and 1000
        camera.position.x = Math.max( Math.min( camera.position.x, 1000 ), -1000 );
        camera.lookAt( scene.position );
    }

    // Speed of sun movement (time for a full loop in seconds)
    var transformDate = currentTime.toDate();
    light.position.x = SunCalcCartesian.getX(transformDate, 50.111512, 8.680506);
    light.position.y = SunCalcCartesian.getY(transformDate, 50.111512, 8.680506);
    light.position.z = SunCalcCartesian.getZ(transformDate, 50.111512, 8.680506);
    light.shadowDarkness = Controls.shadow;
    light.shadowCameraVisible = Controls.sunGrid;

    // Renew fog
    scene.fog.density = Controls.fog;

    // Update positions of the houses after change in gui
    house.position.x = Controls.distanceHouse * -1;
    newHouse.position.x = Controls.distanceNewHouse;

    // Update the controls position
    kcontrols.update( delta );

    // Update the current time
    updateTime();

    render();
}

function render() {
    updateSize();

    for ( var ii = 0; ii < views.length; ++ii ) {

        view = views[ii];
        camera = view.camera;

        view.updateCamera( camera, scene, mouseX, mouseY );

        var left   = Math.floor( windowWidth  * view.left );
        var bottom = Math.floor( windowHeight * view.bottom );
        var width  = Math.floor( windowWidth  * view.width );
        var height = Math.floor( windowHeight * view.height );
        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );
        renderer.enableScissorTest ( true );
        renderer.setClearColor( view.background );

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.render( scene, camera );
    }

    renderer.render( scene, camera );
}

window.onload = function() {
    var gui = new dat.GUI();

    var f1 = gui.addFolder('Environment');
    f1.add(Controls, 'shadow', { Off : 0.0, Mid : 0.5, Full : 1 });
    f1.add(Controls, 'sunGrid');
    f1.add(Controls, 'fog', 0.001, 0.0025).step(0.0001);
    var f11 = gui.addFolder('Date/Time');
    f11.add(Controls, 'day', 0, 31).step(1);
    f11.add(Controls, 'month', 0, 12).step(1);
    f11.add(Controls, 'year', 1900, 2100).step(1);
    f11.add(Controls, 'hour', 0, 23).step(1);
    f11.add(Controls, 'minute', 0, 59).step(1);
    f11.add(timeButton, 'set');
    f11.add(Controls, 'delta', { '1 min' : 'm', '1 hour' : 'h' });

    var f2 = gui.addFolder('Objects');
    f2.add(Controls, 'distanceHouse', 0, 100);
    f2.add(Controls, 'distanceNewHouse', 0, 100);

    f1.open();

    init();
    animate();
};
