/**
 * Created by kirill on 02/12/15.
 */


document.addEventListener('DOMContentLoaded', function () {
    var scene, camera, renderer, cube, cubeM, terrain, spot;

    new THREE.JSONLoader().load('model/hold.json', function(geometry) {

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(50, 400 / 300, 0.01, 100);
        camera.position.set(0.4, 10, 0);
        camera.rotateX(-Math.PI/2);
        scene.add(camera);

        renderer = new THREE.WebGLRenderer({
            clearAlpha: 1,
            clearColor: 0xdddddd,
            antialias: true
        });
        renderer.setSize(400, 300);
        renderer.shadowMapEnabled = true;

        container = document.getElementsByClassName('container')[0];
        container.appendChild(renderer.domElement);

        cubeM = new THREE.MeshPhongMaterial({
            color: 0xff0000
        });

        cube = new THREE.Mesh(
            geometry, cubeM);
        cube.position.set(0, 0, 0);
        cube.rotation.set(0, 0, 0);
        scene.add(cube);
//cube.receiveShadow = true;
        cube.castShadow = true;

        cube.scale.x= cube.scale.y=cube.scale.z=0.2;

        terrain = new THREE.Mesh(
            new THREE.CubeGeometry(10, 1, 10), new THREE.MeshPhongMaterial({
                color: 0x00ff00
            }));
//terrain.castShadow = true;
        terrain.receiveShadow = true;
        terrain.position.set(0, 0, 0);
        terrain.rotation.set(0, 0, 0);

        scene.add(terrain);

        spot = new THREE.SpotLight();
        spot.shadowCameraNear = 1; // keep near and far planes as tight as possible
        spot.shadowCameraFar = 10; // shadows not cast past the far plane

//Un-Comment this

        spot.castShadow = true;

        spot.position.set(-1, 2, 1.5);
        scene.add(spot);


        renderer.render(scene, camera);
        //
        //(function animate() {
        //
        //    requestAnimationFrame(animate);
        //
        //    cube.rotation.x += 0.01;
        //    cube.rotation.y += 0.01;
        //
        //
        //
        //})();

    });

});