if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
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
    light.shadowCameraNear = 20;
    light.shadowCameraFar = RADIUS*2;
    light.shadowCameraLeft = -RADIUS;
    light.shadowCameraRight = RADIUS;
    light.shadowCameraTop = RADIUS;
    light.shadowCameraBottom = -RADIUS;

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
    // Load texture
    var textureUrl = 'images/grasslight-small.jpg'
    var texture = THREE.ImageUtils.loadTexture(textureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x= 10
    texture.repeat.y= 10
    texture.anisotropy = renderer.getMaxAnisotropy()

    var segments = 128;
    var geometry = new THREE.CircleGeometry( radius, segments );
    var material = new THREE.MeshLambertMaterial( { map : texture, emissive: 'green' } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    mesh.rotation.x = (Math.PI / 2) * -1;
    return mesh;
}

// Get random positions in a radius. Either uniformly distributed or centered ...
// http://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly/5838991#5838991
function randomCoordinates( r, uniform ) {
    r = r || 1000;

    var a = Math.random(),
    b = Math.random();

    if (uniform) {
        if (b < a) {
            c = b;
            b = a;
            a = c;
        }
    }

    return [b * r * Math.cos( 2 * Math.PI * a / b ), b * r * Math.sin( 2 * Math.PI * a / b )];
}

function buildAxes( length ) {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0.2, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0.2, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0.2, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0.2, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0.2, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0.2, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

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
    // M is pressed
    if(keyCode==77) {
        if(pressM) {
            pressM = false;
        } else {
            pressM = true;
        }
    }
    // C is pressed.
    if(keyCode==67) {
        camera.position.set( 400, 400, 400 );
    }
}

function updateTime() {
    currentTime.add(delta, Controls.delta);
    tmpDelta += delta;
    if( tmpDelta >= 1 ) {
        // Here we add the delta time from the gui to the current time
        var timeString = currentTime.format('YYYY-MM-DDTHH:mm:ss ZZ');

        // Update the visible time by exchanging the objects
        scene.remove(objectOfTime);
        delete(textOfTime);
        delete(objectOfTime);
        textOfTime = new THREE.TextGeometry(timeString, textParams);
        objectOfTime = new THREE.Mesh(textOfTime, textMaterial);
        objectOfTime.position.x = RADIUS/4;
        objectOfTime.position.z = 30;
        objectOfTime.rotation.x = (Math.PI / 2) * -1;
        objectOfTime.castShadow = true;
        scene.add(objectOfTime);
        tmpDelta = 0;
    }
}

// Update viewport size on window size changes
function updateSize() {
    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
        windowWidth  = window.innerWidth;
        windowHeight = window.innerHeight;
        renderer.setSize ( windowWidth, windowHeight );
    }
}

// This is a custom function for a simulated button in dat GUI
// http://stackoverflow.com/questions/18366229/is-it-possible-to-create-a-button-using-dat-gui/18380889#18380889
var timeButton = { set:function(){
    var timeString = String.format("{0}-{1}-{2} {3}:{4}", Controls.year, Controls.month, Controls.day, Controls.hour, Controls.minute);
    var timestamp = moment(timeString, "YYYY-M-D HH:mm");
    if( !timestamp.isValid() ) {
        alert("This does not look like a valid date.");
        return
    }
    currentTime = timestamp;
}};
