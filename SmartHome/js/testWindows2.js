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
var renderer, scene2, camera2;

function initBasic2() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("canvas").appendChild(renderer.domElement);

    scene2 = new THREE.Scene();
    scene2.background = new THREE.Color(0xf0f0f0);

    camera2 = new THREE.PerspectiveCamera(60, document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight, 1, 10000);
    camera2.position.set(0, 800, 0);
    camera2.lookAt(0, 0, 0);

}


// light
var ambientLight2;

function initLight2() {

    ambientLight2 = new THREE.AmbientLight(0xffffff);
    scene2.add(ambientLight2);

}


// control
var orbit2;

function initOrbitControls2() {

    orbit2 = new OrbitControls(camera2, renderer.domElement);
    orbit2.enableRotate = false;
    orbit2.update();
    orbit2.addEventListener('change', render2);

}

function initControls2() {

    initOrbitControls2();

}


// element
var objects2 = [];
var rollOverMesh2;
var plane2;
var mouse2, raycaster2;

function initElement2() {

    var gridHelper = new THREE.GridHelper(1000, 20);
    scene2.add(gridHelper);

    var planeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
    planeGeo.rotateX(- Math.PI / 2);
    plane2 = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({
        color: 0xB0C4DE,
        visible: false,
    }));
    objects2.push(plane2);
    scene2.add(plane2);

    var rollOverGeo = new THREE.PlaneBufferGeometry(50, 50, 50);
    rollOverGeo.rotateX(-Math.PI / 2);
    var rollOverMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    });
    rollOverMesh2 = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene2.add(rollOverMesh2);

    raycaster2 = new THREE.Raycaster();
    mouse2 = new THREE.Vector2();

}

// event listener
function initEventListener2() {

    window.addEventListener('resize', onWindowResize2, false);
    document.addEventListener('mousemove', onDocumentMouseMove2, false);
    document.addEventListener('click', onDocumentClick2, false);

}

function onWindowResize2() {

    camera2.aspect = document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight;
    camera2.updateProjectionMatrix();

    renderer.setSize(document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight);

    render2();

}


var cnt2 = 0;//记录鼠标点击次数
var point12 = new THREE.Vector3();
var point22 = new THREE.Vector3();
var tempLine2 = null;//线

function onDocumentMouseMove2(event) {

    event.preventDefault();

    mouse2.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster2.setFromCamera(mouse2, camera2);

    var intersects = raycaster2.intersectObjects(objects2);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        //选择红色方块
        rollOverMesh2.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh2.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        rollOverMesh2.position.y = 0;

        //画线
        if (cnt2 === 1) {

            if (tempLine2)
                scene2.remove(tempLine2);


            //画窗户
            if(mode === 1){
                point22.copy(intersect.point).add(intersect.face.normal);
                point22.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                point22.y = 0;

                var geometry = new THREE.Geometry();
                geometry.vertices.push(point1);
                geometry.vertices.push(point2);
                tempLine2 = new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0x000000,dashSize:10,gapSize:1,scale:0.5}));
                tempLine2.computeLineDistances();
            }
            else if (mode === 0){//画墙壁
                    point22.copy(intersect.point).add(intersect.face.normal);
                    point22.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point22.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point12);
                    geometry.vertices.push(point22);
                    tempLine2 = new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0x70dbdb,scale:0.1}));
                    tempLine2.computeLineDistances();
                }
                else{//画门板
                    point22.copy(intersect.point).add(intersect.face.normal);
                    point22.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point22.y = 0;

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point12);
                    geometry.vertices.push(point22);
                    tempLine2 = new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0xff0000,dashSize:10,gapSize:1,scale:0.5}));
                    tempLine2.computeLineDistances();
                }
            scene2.add(tempLine2);
            renderer.render(scene2, camera2);
        }

    }

    render2();

}

function onDocumentClick2(event) {

    event.preventDefault();

    mouse2.set((event.offsetX / document.getElementById("canvas").offsetWidth) * 2 - 1, - (event.offsetY / document.getElementById("canvas").offsetHeight) * 2 + 1);

    raycaster2.setFromCamera(mouse2, camera2);

    var intersects = raycaster2.intersectObjects(objects2);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        //画墙壁
        if (mode === 0) {
            switch (cnt2) {
                case 0:
                    point12.copy(intersect.point).add(intersect.face.normal);
                    point12.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point12.y = 0;
                    break;

                case 1:
                    point22.copy(intersect.point).add(intersect.face.normal);
                    point22.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point22.y = 0;
                    // var material = new THREE.LineBasicMaterial({ color: 0x855e42 });
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point12);
                    geometry.vertices.push(point22);
                    var line = new THREE.Line(geometry, new THREE.LineDashedMaterial({color: 0x70dbdb, scale: 0.1}));
                    line.computeLineDistances();
                    // var line = new THREE.Line(geometry, material);
                    scene2.add(line);
                    renderer.render(scene2, camera2);

                    var a = new figure();
                    a.point_1 = point12;
                    a.point_2 = point22;
                    a.sorts = 0;
                    feature.push(a);

                    break;
            }
        } else if (mode === 1) {//画窗户
            switch (cnt2) {
                case 0:
                    point12.copy(intersect.point).add(intersect.face.normal);
                    point12.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point12.y = 0;
                    break;

                case 1:
                    point22.copy(intersect.point).add(intersect.face.normal);
                    point22.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point22.y = 0;

                    var material = new THREE.LineBasicMaterial({color: 0x000000,});
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point12);
                    geometry.vertices.push(point22);
                    var line = new THREE.Line(geometry, material);
                    scene2.add(line);
                    renderer2.render(scene2, camera2);

                    var a = new figure();
                    a.point_1 = point12;
                    a.point_2 = point22;
                    a.sorts = 1;
                    feature.push(a);

                    //console.log(feature);

                    break;
            }
        } else {//画门板
            switch (cnt2) {
                case 0:
                    point12.copy(intersect.point).add(intersect.face.normal);
                    point12.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point12.y = 0;
                    break;

                case 1:
                    point22.copy(intersect.point).add(intersect.face.normal);
                    point22.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    point22.y = 0;

                    var material = new THREE.LineBasicMaterial({color: 0xff0000,});
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(point12);
                    geometry.vertices.push(point22);
                    var line = new THREE.Line(geometry, material);
                    scene2.add(line);
                    renderer.render(scene2, camera2);

                    var a = new figure();
                    a.point_1 = point12;
                    a.point_2 = point22;
                    a.sorts = 2;
                    feature.push(a);

                    //console.log(feature);

                    break;
            }
        }


        cnt2 = (cnt2 + 1) % 2;

        render2();

    }
}
// init all things
    function init2() {

        initBasic2();

        initLight2();

        initElement2();

        initControls2();

        initEventListener2();

    }


    function render2() {

        renderer.render(scene2, camera2);


    }



$("#view-2d").click(function () {
    //切换到2D
    $(this).addClass("active");

    $("#view-3d").removeClass("active");
    //do something
    init2();
    render2();
});


$("#view-3d").click(function () {
    //切换到3D
    $(this).addClass("active");
    $("#view-2d").removeClass("active");
    //do something
    init();
    render();
});