import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';


var feature = [];

function figure() {
    this.point_1 = null;
    this.point_2 = null;
    this.sorts = 0;//0为墙壁，1为窗户,2为门板
}

var mode = null;//0为绘制墙面，1为绘制窗户，2为绘制门板

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

// //添加gui控件
//     var controls =new function(){
//         this.模式 = '绘制墙面';
//         this.切换模式 = function () {
//             if (this.模式 === '绘制墙面'){//画墙，将线的颜色转换为暗木色
//                 this.模式 = '绘制窗户';
//             }
//             else if (this.模式 === '绘制窗户'){//画窗，将线的颜色转换为黑色
//                     this.模式 = '绘制门板'
//                 }
//                 else {
//                     this.模式 = '绘制墙面';
//                 }
//             };
//     };
//     var gui = new dat.GUI();
//     gui.add(controls,'切换模式');
//     gui.add(controls,'模式').listen();

// basic
var renderer, scene, camera;

function initBasic() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(document.getElementById("2D_canvas").offsetWidth, document.getElementById("2D_canvas").offsetHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("2D_canvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(60, document.getElementById("2D_canvas").offsetWidth, document.getElementById("2D_canvas").offsetHeight, 1, 10000);
    camera.position.set(0, 800, 0);
    camera.lookAt(0, 0, 0);

}


// light
var ambientLight;

function initLight() {

    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

}


// control
var orbit;

function initOrbitControls() {

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableRotate = false;
    orbit.update();
    orbit.addEventListener('change', render);

}

function initControls() {

    initOrbitControls();

}


// element
var objects = [];
var rollOverMesh;
var plane;
var mouse, raycaster;

function initElement() {

    var gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    var planeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
    planeGeo.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
        color: 0xB0C4DE,
        visible: false,
    }));
    objects.push(plane);
    scene.add(plane);

    var rollOverGeo = new THREE.PlaneBufferGeometry(50, 50, 50);
    rollOverGeo.rotateX(-Math.PI / 2);
    var rollOverMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

}

// event listener
function initEventListener() {

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentClick, false);

}

function onWindowResize() {

    camera.aspect = document.getElementById("2D_canvas").offsetWidth / document.getElementById("2D_canvas").offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(document.getElementById("2D_canvas").offsetWidth, document.getElementById("2D_canvas").offsetHeight);

    render();

}


var cnt = 0;//记录鼠标点击次数
var point1 = new THREE.Vector3();
var point2 = new THREE.Vector3();
var tempLine = null;//线

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.set((event.clientX / document.getElementById(("2D_canvas").offsetWidth)) * 2 - 1, - (event.clientY / document.getElementById("2D_canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        //选择红色方块
        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        rollOverMesh.position.y = 0;

        //画线
        if (cnt === 1) {

            if (tempLine)
                scene.remove(tempLine);


            //画窗户
            if(mode === 1){
                point2.copy(intersect.point).add(intersect.face.normal);
                point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                point2.y = 0;

                var geometry = new THREE.Geometry();
                geometry.vertices.push(point1);
                geometry.vertices.push(point2);
                tempLine = new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0x000000,dashSize:10,gapSize:1,scale:0.5}));
                tempLine.computeLineDistances();
            }
            else if (mode === 0){//画墙壁
                    point2.copy(intersect.point).add(intersect.face.normal);
                    point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point2.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    tempLine = new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0x70dbdb,scale:0.1}));
                    tempLine.computeLineDistances();
                }
                else{//画门板
                    point2.copy(intersect.point).add(intersect.face.normal);
                    point2.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point2.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    tempLine = new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0xff0000,dashSize:10,gapSize:1,scale:0.5}));
                    tempLine.computeLineDistances();
                }
            scene.add(tempLine);
                render();
        }

    }

    render();

}

function onDocumentClick(event) {

    event.preventDefault();

    mouse.set((event.clientX / document.getElementById("2D_canvas").offsetWidth) * 2 - 1, -(event.clientY / document.getElementById("2D_canvas").offsetHeight) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(objects);

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
                    // var material = new THREE.LineBasicMaterial({ color: 0x855e42 });
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    var line = new THREE.Line(geometry, new THREE.LineDashedMaterial({color: 0x70dbdb, scale: 0.1}));
                    line.computeLineDistances();
                    // var line = new THREE.Line(geometry, material);
                    scene.add(line);
                    renderer.render(scene, camera);

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

                    var material = new THREE.LineBasicMaterial({color: 0x000000,});
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    var line = new THREE.Line(geometry, material);
                    scene.add(line);
                    renderer.render(scene, camera);

                    var a = new figure();
                    a.point_1 = point1;
                    a.point_2 = point2;
                    a.sorts = 1;
                    feature.push(a);

                    //console.log(feature);

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

                    var material = new THREE.LineBasicMaterial({color: 0xff0000,});
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point1);
                    geometry.vertices.push(point2);
                    var line = new THREE.Line(geometry, material);
                    scene.add(line);
                    renderer.render(scene, camera);

                    var a = new figure();
                    a.point_1 = point1;
                    a.point_2 = point2;
                    a.sorts = 2;
                    feature.push(a);

                    //console.log(feature);

                    break;
            }
        }


        cnt = (cnt + 1) % 2;

        render();

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

        console.log("slkdfjsldfjlsdfjlsjdflksjdfljsdlfkjsldfjlsdjflsjdflkjsdlkfjlsdfjlsdfjlk");
        renderer.render(scene, camera);

    }


    init();

    render();

