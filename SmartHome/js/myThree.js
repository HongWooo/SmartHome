// basic
var scene, camera, renderer;
var width = window.innerWidth, height = window.innerHeight;

function initBasic() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.set(10, 10, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xCCCCCC);
    renderer.shadowMapEnabled = true;
    document.getElementById("canvas").appendChild(renderer.domElement);
}

// light
var ambientLight, spotLight;

function initLight() {
    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.618);
    directionalLight.position.set(5, 5, -5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// elements
var planeGeometry, boxGeometry;
var planeMaterial, boxMaterial;
var plane, box;

function initElements() {
    planeGeometry = new THREE.PlaneGeometry(11, 11);
    planeMaterial = new THREE.MeshLambertMaterial({
        color: 0xB0C4DE,
    });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    boxMaterial = new THREE.MeshLambertMaterial({
        color: 0x4682B4,
    });
    box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.y = 1;
    box.castShadow = true;
    scene.add(box);
}

// controls
var orbit;

function initOrbitControls() {
    orbit = new THREE.OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);
}

var transform;

function initTransformControls() {
    transform = new THREE.TransformControls(camera, renderer.domElement);
    transform.addEventListener('change', render);
    transform.addEventListener('dragging-changed', function (event) {
        orbit.enabled = !event.value;
    });
    transform.attach(box);
    scene.add(transform);
}

// init all
function init() {
    initBasic();
    initLight();
    initElements();
    initOrbitControls();
    initTransformControls();
}

// render
function render() {
    renderer.render(scene, camera);
}

init();
render();

// window EventListener
window.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 81: // Q
            transform.setSpace(transform.space === "local" ? "world" : "local");
            break;

        case 17: // Ctrl
            transform.setTranslationSnap(100);
            transform.setRotationSnap(Math.degToRad(15));
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

        case 187:
        case 107: // +, =, num+
            transform.setSize(transform.size + 0.1);
            break;

        case 189:
        case 109: // -, _, num-
            transform.setSize(Math.max(transform.size - 0.1, 0.1));
            break;

        case 88: // X
            transform.showX = !transform.showX;
            break;

        case 89: // Y
            transform.showY = !transform.showY;
            break;

        case 90: // Z
            transform.showZ = !transform.showZ;
            break;

        case 32: // Spacebar
            transform.enabled = !transform.enabled;
            break;
    }
});

window.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 17: // Ctrl
            transform.setTranslationSnap(null);
            transform.setRotationSnap(null);
            break;
    }
});