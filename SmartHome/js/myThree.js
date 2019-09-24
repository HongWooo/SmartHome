import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from './node_modules/three/examples/jsm/controls/TransformControls.js';
import { OBJLoader } from './node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './node_modules/three/examples/jsm/loaders/MTLLoader.js';


// basic
var feature = [];

function figure() {
    this.point_1 = null;
    this.point_2 = null;
    this.sorts = 0;//0为墙壁，1为窗户,2为门板
}

var mode = 0;//0为绘制墙面，1为绘制窗户，2为绘制门板

//切换至绘制墙壁模式
function switchwalls() {
    mode = 0;
}

//切换至绘制窗户模式
function switchwindows() {
    mode = 1;
}

//切换至绘制门板模式
function switchdoors() {
    mode = 2;
}


var renderer, scene, camera, type = 2;

function initBasic() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("canvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(60, document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight, 1, 10000);
    camera.position.set(0, 1600, 0);
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
    orbit.enableRotate = false;
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
var objects = [], objects2 = [], tempElement, plane, boxHelper;
var mouse, raycaster, isDelete = false, isControl = false;

function initElement() {

    var tempElementGeo = new THREE.PlaneBufferGeometry(50, 50);
    tempElementGeo.rotateX(-Math.PI / 2);
    var tempElementMTL = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    tempElement = new THREE.Mesh(tempElementGeo, tempElementMTL);
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
    objects2.push(plane);

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

var cnt = 0;//记录鼠标点击次数
var point1 = new THREE.Vector3();
var point2 = new THREE.Vector3();
var tempLine = null;//线

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    if (type == 3) {
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

    } else if (type == 2) {

        var intersects = raycaster.intersectObjects(objects2);

        if (intersects.length > 0) {

            var intersect = intersects[0];

            //选择红色方块
            tempElement.position.copy(intersect.point).add(intersect.face.normal);
            tempElement.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            tempElement.position.y = 0;

            //画线
            if (cnt == 1) {

                if (tempLine) {

                    scene.remove(tempLine);

                }

                //画窗户
                if (mode == 1) {

                    point2.copy(intersect.point).add(intersect.face.normal);
                    point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point2.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    tempLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0x000000, dashSize: 10, gapSize: 1, scale: 0.5 }));
                    tempLine.computeLineDistances();

                } else if (mode === 0) {//画墙壁

                    point2.copy(intersect.point).add(intersect.face.normal);
                    point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point2.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    tempLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0x70dbdb, scale: 0.1 }));
                    tempLine.computeLineDistances();

                } else {//画门板

                    point2.copy(intersect.point).add(intersect.face.normal);
                    point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point2.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    tempLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 10, gapSize: 1, scale: 0.5 }));
                    tempLine2.computeLineDistances();

                }

                scene.add(tempLine);

            }

        }

    }

    render();

}

function onDocumentClick(event) {

    event.preventDefault();

    mouse.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    if (type == 3) {

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

        }

    } else if (type == 2) {

        var intersects = raycaster.intersectObjects(objects2);

        if (intersects.length > 0) {

            var intersect = intersects[0];

            //画墙壁
            if (mode === 0) {

                switch (cnt) {

                    case 0:
                        point1.copy(intersect.point).add(intersect.face.normal);
                        point1.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        point1.y = 0;
                        break;

                    case 1:
                        point2.copy(intersect.point).add(intersect.face.normal);
                        point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        point2.y = 0;

                        var geometry = new THREE.Geometry();
                        geometry.vertices.push(point1);
                        geometry.vertices.push(point2);
                        var line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0x70dbdb, scale: 0.1 }));
                        line.computeLineDistances();
                        scene.add(line);
                        objects2.push(line);

                        var a = new figure();
                        a.point_1 = point1;
                        a.point_2 = point2;
                        a.sorts = 0;
                        feature.push(a);

                        break;

                }

            } else if (mode === 1) {//画窗户

                switch (cnt) {

                    case 0:
                        point1.copy(intersect.point).add(intersect.face.normal);
                        point1.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        point1.y = 0;
                        break;

                    case 1:
                        point2.copy(intersect.point).add(intersect.face.normal);
                        point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        point2.y = 0;

                        var material = new THREE.LineBasicMaterial({ color: 0x000000, });
                        var geometry = new THREE.Geometry();
                        geometry.vertices.push(point1);
                        geometry.vertices.push(point2);
                        var line = new THREE.Line(geometry, material);
                        scene.add(line);
                        objects2.push(line);

                        var a = new figure();
                        a.point_1 = point1;
                        a.point_2 = point2;
                        a.sorts = 1;
                        feature.push(a);

                        break;

                }

            } else {//画门板

                switch (cnt) {

                    case 0:
                        point1.copy(intersect.point).add(intersect.face.normal);
                        point1.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        point1.y = 0;
                        break;

                    case 1:
                        point2.copy(intersect.point).add(intersect.face.normal);
                        point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                        point2.y = 0;

                        var material = new THREE.LineBasicMaterial({ color: 0xff0000, });
                        var geometry = new THREE.Geometry();
                        geometry.vertices.push(point1);
                        geometry.vertices.push(point2);
                        var line = new THREE.Line(geometry, material);
                        scene.add(line);
                        objects2.push(line);

                        var a = new figure();
                        a.point_1 = point1;
                        a.point_2 = point2;
                        a.sorts = 2;
                        feature.push(a);

                        break;

                }

            }

            cnt = (cnt + 1) % 2;

        }

    }

    render();

}

function onDocumentKeyDown(event) {

    if (type == 3) {

        switch (event.keyCode) {

            case 68: // D
                isDelete = !isDelete;
                if (isDelete) {
                    tempElement.visible = false;
                } else {
                    boxHelper.visible = false;
                    tempElement.visible = true;
                    transform.detach();
                }
                render();
                break;

            case 67: // C
                isControl = !isControl;
                if (isControl) {
                    tempElement.visible = false;
                } else {
                    boxHelper.visible = false;
                    tempElement.visible = true;
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

    } else if (type == 2) {



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
});

init();

render();

$("#view-2d").click(function () {
    //切换到2D
    $(this).addClass("active");
    $("#view-3d").removeClass("active");
    //do something
    camera.position.set(0, 1600, 0);
    camera.lookAt(0, 0, 0);

    orbit.enableRotate = false;
    scene.remove(tempElement);

    var tempElementGeo = new THREE.PlaneBufferGeometry(50, 50);
    tempElementGeo.rotateX(-Math.PI / 2);
    var tempElementMTL = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    tempElement = new THREE.Mesh(tempElementGeo, tempElementMTL);
    scene.add(tempElement);

    scene.children.forEach(child => {

        if (child.type == "Line"){

            child.visible = true;

        }

    });

    type = 2;

    render();

});


$("#view-3d").click(function () {
    //切换到3D
    $(this).addClass("active");
    $("#view-2d").removeClass("active");
    //do something
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);

    orbit.enableRotate = true;
    scene.remove(tempElement);

    tempElement = new THREE.Mesh(
        new THREE.BoxBufferGeometry(50, 50, 50),
        new THREE.MeshLambertMaterial({
            color: 0xff0000,
            opacity: 0.5,
            transparent: true,
        })
    );
    scene.add(tempElement);

    scene.children.forEach(child => {

        if (child.type == "Line"){

            child.visible = false;

        }

    });

    type = 3;

    render();

});
