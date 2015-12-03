/// <reference path="game-common.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../typings/threejs/three-orbitcontrols.d.ts"/>

class HoldMesh extends THREE.Mesh {

    constructor(public i:number, public j:number, geometry:THREE.Geometry, material:THREE.Material) {
        super(geometry, material);
    }
}

interface Refrigerator3dGameParameters {
    level?:number;
    rotationSpeed?:number;
}


class Refrigerator3dGame implements Game {

    renderer:THREE.WebGLRenderer;
    scene:THREE.Scene;
    camera:THREE.Camera;
    cubes:HoldMesh[];
    size:number = 4;
    rotationAngle:number = 0;
    rotationSpeed:number = 0.05;
    level:number = 3;

    constructor(public container:HTMLElement, parameters?:Refrigerator3dGameParameters) {
        if (parameters) {
            this.level = parameters.level || this.level;
            this.rotationSpeed = parameters.rotationSpeed || this.rotationSpeed;
        }
    }

    public start() {
        new THREE.JSONLoader().load('model/hold.json', this.addGeometry.bind(this));
    }

    addGeometry(geometry) {

        this.cubes = [];

        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0x212223));

        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                var cubeGeometry = geometry;
                var color = (i + j === this.size - 1 ? 0x06009e : 0xdfdfdf);
                var cubeMaterial = new THREE.MeshLambertMaterial({color: color});
                var cube = new HoldMesh(i, j, cubeGeometry, cubeMaterial);
                cube.position.set((this.size - i) * 10 - 25, j * 10 - 15, 0);
                cube.castShadow = true;
                cube.rotation.x = Math.PI / 2;
                cube.rotation.y = Math.PI / 4;
                this.scene.add(cube);
                this.cubes.push(cube);
            }
        }

        for (var l = 0; l < this.level; l++) {
            this.cubes[Math.round(Math.random() * (this.size - 1))].rotation.y = (3 * Math.PI / 4);
        }

        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 1, 10000);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 60;

        var terrainGeo = new THREE.PlaneGeometry(50, 50);
        var terrainMaterial = new THREE.MeshLambertMaterial({color: 0xdfdfdf});
        var terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
        terrain.position.z = 0;
        terrain.receiveShadow = true;
        this.scene.add(terrain);

        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.castShadow = true;
        light.shadowCameraNear = 100;
        light.shadowCameraFar = 200;
        light.shadowCameraLeft = -20;
        light.shadowCameraRight = 20;
        light.shadowCameraTop = 20;
        light.shadowCameraBottom = -20;

        light.position.set(-60, 20, 100);
        this.scene.add(light);
        //this.scene.add(new THREE.DirectionalLightHelper(light, 0.2));

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMapEnabled = true;
        this.container.appendChild(this.renderer.domElement);

        //var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        //controls.addEventListener('change', this.render.bind(this));
        this.renderer.domElement.addEventListener("click", this.onclick.bind(this));

        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onclick(e:MouseEvent) {

        if (this.rotationAngle <=0) {
            this.rotationAngle = Math.PI / 2;

            var x = e.x - this.renderer.domElement.getBoundingClientRect().left;
            var y = e.y - this.renderer.domElement.getBoundingClientRect().top;

            var mouseVector = new THREE.Vector2(
                (x / this.renderer.domElement.width) * 2 - 1,
                -(y / this.renderer.domElement.height) * 2 + 1
            );
            var raycaster = new THREE.Raycaster(this.camera.getWorldDirection());

            raycaster.setFromCamera(mouseVector, this.camera);

            var intersects = raycaster.intersectObjects(this.cubes);

            if (intersects.length > 0) {
                var hold = <HoldMesh>intersects[0].object;
                this.rotate(hold.i, hold.j);
            } else {
                this.rotationAngle = 0;
            }
        }


    }

    rotate(i:number, j:number) {

        this.rotationAngle -= this.rotationSpeed;

        for (var k = 0; k < this.cubes.length; k++) {
            var cube = this.cubes[k];

            if (cube.i === i || cube.j === j) {
                cube.rotation.y += this.rotationSpeed;
                if (this.rotationAngle <= 0) {
                    cube.rotation.y = Math.tan(cube.rotation.y) >0 ? Math.PI/4 : -Math.PI/4;
                }
            }
        }

        this.render();

        if (this.rotationAngle > 0) {
            setTimeout(function () {
                requestAnimationFrame(function () {
                    this.rotate(i, j);
                }.bind(this));
            }.bind(this), 1000 / 60);
        } else {
            if (this.isWin()) {
                this.win();
            }
        }
    }

    isWin() {
        return !this.cubes.some(function(cube) {
            return Math.round(Math.tan(cube.rotation.y)) != 1
        });
    }

    win() {
        alert("You have done it!!!")
    }

    stop() {
        this.renderer.domElement.removeEventListener("click", this.onclick.bind(this));
    }
}

