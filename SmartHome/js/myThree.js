import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from './node_modules/three/examples/jsm/controls/TransformControls.js';

// basic
var renderer, scene, camera;

function initBasic() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("canvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(60, document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);

}


// light
var ambientLight, directionalLight;

function initLight() {

    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.618);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

}


// control
var orbit, transform;

function initOrbitControls() {

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);

}

function initTransformControls() {

    transform = new TransformControls(camera, renderer.domElement);
    transform.addEventListener('change', render);
    transform.addEventListener('dragging-changed', function (event) {
        orbit.enabled = !event.value;
    });
    Math.degToRad = function (degrees) {
        return degrees * Math.PI / 180;
    };
    transform.setRotationSnap(Math.degToRad(15));
    scene.add(transform);

}

function initControls() {

    initOrbitControls();
    initTransformControls();

}


// element
var objects = [];
var rollOverMesh;
// var cubeGeo, cubeMaterial;
var plane;
var mouse, raycaster, isDelete = false, isControl = false;

function initElement() {

    var rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    var rollOverMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    var gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var planeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
    planeGeo.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
        color: 0xB0C4DE,
        visible: false,
    }));
    plane.receiveShadow = true;
    scene.add(plane);

    objects.push(plane);

}


// event listener
function initEventListener() {

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentClick, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);

}

function onWindowResize() {

    camera.aspect = document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight);

    render();

}

var INTERSECTED;

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        if (isControl || isDelete) {

            if (INTERSECTED != intersects[0].object) {

                if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex(0xff0000);

            }

        } else {

            rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
            rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;

    }

    render();

}

function onDocumentClick(event) {

    event.preventDefault();

    mouse.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        if (isDelete && !isControl) {

            if (intersect.object != plane) {

                scene.remove(intersect.object);

                objects.splice(objects.indexOf(intersect.object), 1);

            }

        } else if (!isControl) {

            var voxel = new THREE.Mesh(
                new THREE.BoxBufferGeometry(50, 50, 50),
                new THREE.MeshLambertMaterial({
                    color: 0x4682B4,
                }),
            );
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            voxel.castShadow = true;
            scene.add(voxel);

            objects.push(voxel);

        } else if (isControl) {

            if (intersect.object != plane) {

                transform.attach(intersect.object);

            }

        }

        render();

    }

}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 68: // D
            isDelete = true;
            rollOverMesh.material.visible = false;
            break;

        case 67: // C
            isControl = !isControl;
            if (isControl) {
                rollOverMesh.material.visible = false;
            } else {
                rollOverMesh.material.visible = true;
                transform.detach();
            }
            render();
            break;

        case 87: // W
            transform.setMode("translate");
            break;

        case 69: // E
            transform.setMode("rotate");
            break;

        case 82: // R
            transform.setMode("scale");
            break;


    }

}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 68: // D
            isDelete = false;
            rollOverMesh.material.visible = true;
            break;

    }

}


// init all things
function init() {

    initBasic();

    initLight();

    initElement();

    initControls();

    initEventListener();

}


function render() {

    renderer.render(scene, camera);

}


init();

render();