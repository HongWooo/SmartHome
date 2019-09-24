import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from './node_modules/three/examples/jsm/controls/TransformControls.js';
import { OBJLoader } from './node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './node_modules/three/examples/jsm/loaders/MTLLoader.js';


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
var objects = [], tempElement, plane, boxHelper;
var mouse, raycaster, isDelete = false, isControl = false;

function initElement() {

    tempElement = new THREE.Mesh(
        new THREE.BoxBufferGeometry(50, 50, 50),
        new THREE.MeshLambertMaterial({
            color: 0xff0000,
            opacity: 0.5,
            transparent: true,
        })
    );
    scene.add(tempElement);

    var gridHelper = new THREE.GridHelper(2000, 40);
    scene.add(gridHelper);

    boxHelper = new THREE.BoxHelper(camera, 0xff0000);
    boxHelper.visible = false;
    scene.add(boxHelper);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var planeGeo = new THREE.PlaneBufferGeometry(2000, 2000);
    planeGeo.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
        color: 0xB0C4DE,
        visible: false,
    }));
    plane.receiveShadow = true;
    scene.add(plane);
    objects.push(plane);

}

var elementMap = {
    'chair': ['AM199_Set_01.obj', 'AM199_Set_01.mtl']
};

var elementName;

function setElementName(name) {

    elementName = name;

    var loader = new OBJLoader();

    // load a resource
    loader.load(
        // resource URL
        'modules/obj/' + elementMap[name][0],
        // called when resource is loaded
        function (object) {

            scene.remove(tempElement);
            tempElement = object;
            scene.add(tempElement);

        },
        // called when loading is in progresses
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );

}

function buildElement(name, intersect) {

    var loader = new OBJLoader();

    // load a resource
    loader.load(
        // resource URL
        'modules/obj/' + elementMap[name][0],
        // called when resource is loaded
        function (object) {

            object.position.copy(intersect.point).add(intersect.face.normal);
            object.castShadow = true;
            scene.add(object);
            for (var i = 0; i < object.children.length; i++) {
                objects.push(object.children[i]);
            }

        },
        // called when loading is in progresses
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );

}

// event listener
function initEventListener() {

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentClick, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);

}

function onWindowResize() {

    camera.aspect = document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight);

    render();

}

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        if ((isDelete || isControl) && intersect.object != plane) {

            boxHelper.setFromObject(intersect.object.parent);
            boxHelper.update();
            boxHelper.visible = true;

        } else if (intersect.object == plane) {

            tempElement.position.copy(intersect.point).add(intersect.face.normal);
            boxHelper.visible = false;

        }

    } else {

        boxHelper.visible = false;

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

                var temp = intersect.object.parent;

                for (var i = 0; i < objects.length;) {
                    if (temp == objects[i].parent)
                        objects.splice(i, 1);
                    else
                        i++;
                }

                scene.remove(intersect.object.parent);

            }

        } else if (!isControl) {

            if (intersect.object == plane) {

                buildElement(elementName, intersect);

            }

        } else if (isControl) {

            if (intersect.object != plane) {

                transform.attach(intersect.object.parent);

            }

        }

        render();

    }

}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 68: // D
            isDelete = !isDelete;
            if (isDelete) {
                scene.remove(tempElement);
            } else {
                boxHelper.visible = false;
                scene.add(tempElement);
                transform.detach();
            }
            render();
            break;

        case 67: // C
            isControl = !isControl;
            if (isControl) {
                scene.remove(tempElement);
            } else {
                boxHelper.visible = false;
                scene.add(tempElement);
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
            // transform.setMode("scale");
            setElementName('chair');
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
//点击左侧图片
$(".list-item").click(function () {
    console.log($(this).children('p').text());

    setElementName('chair');
})

init();

render();