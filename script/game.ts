/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../typings/threejs/three-orbitcontrols.d.ts"/>

interface Game {
    start: () => void
}

class CanvasGame implements Game {
    canvas: HTMLCanvasElement;

    constructor(public container: HTMLElement) {}

    start() {
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.container.clientHeight;
        this.canvas.width = this.container.clientWidth;
        this.container.appendChild(this.canvas);
    }

}

class RefrigeratorGame extends CanvasGame {

    ctx : CanvasRenderingContext2D;
    arr : number[][];
    pad : number = 8;
    cellSize: number;
    level: number = 3;
    size: number = 4;


    constructor(public container: HTMLElement) {
        super(container);
        this.arr = new Array(this.size);
        for (var i = 0; i< this.size; i++) {
            this.arr[i] = new Array<number>(this.size);
            for (var j = 0; j < this.size; j++) {
                this.arr[i][j] = 0;
            }
        }
    }

   start() {
       super.start();
        this.ctx = this.canvas.getContext("2d");
        this.cellSize = Math.floor(this.canvas.width / this.size);
        this.pad = Math.round(this.cellSize*0.15);

        for (var i = 0; i < this.level; i++) {
            var x = Math.round(Math.random()*(this.size-1));
            var y = Math.round(Math.random()*(this.size-1));
            this.arr[x][y] = 1;
        }

        this.renderLevel();

       this.canvas.addEventListener("click", this.onclick.bind(this));
    }

    stop() {
        this.canvas.removeEventListener("click", this.onclick.bind(this));
    }

     onclick(e: MouseEvent) {
        var x = e.x  - this.canvas.getBoundingClientRect().left - this.pad;
        var y = e.y  - this.canvas.getBoundingClientRect().top -this.pad;

        var j  = Math.floor(x / this.cellSize);
        var i = Math.floor(y / this.cellSize);

        i = Math.min(i, this.size-1);
        j = Math.min(j, this.size-1);


        for (var k = 0; k < this.size; k++) {
            var line = this.arr[k];
            for (var t = 0; t<line.length; t++) {
                if (k === i || t === j) {
                    this.arr[k][t] = (this.arr[k][t] +1)%2
                }
            }
        }

        this.renderLevel();
    }

    private renderLevel() {
        var ctx: CanvasRenderingContext2D = this.ctx,
            arr: number[][]= this.arr;

        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        for (var k = 0; k < arr.length; k++) {
            var line = arr[k];
            for (var j = 0; j < line.length; j++) {
                if (k + j === line.length - 1) {
                    ctx.strokeStyle = "#06009e";
                } else {
                    ctx.strokeStyle = "grey";
                }
                ctx.beginPath();

                var pad_bottom=this.cellSize-2*this.pad;

                var x = j * this.cellSize + this.pad;
                var y = k * this.cellSize + this.pad;

                if (line[j]) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + pad_bottom, y + pad_bottom);
                } else {
                    ctx.moveTo(x + pad_bottom, y);
                    ctx.lineTo(x, y + pad_bottom);
                }
                ctx.stroke();
                ctx.closePath();
            }
        }
    }


}

class Point {
    x:number = 0;
    y:number = 0;

    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    public equals(p:Point) {
        return this.x == p.x && this.y == p.y;
    }

    public move(dx:number, dy:number):Point {
        return new Point(this.x + dx, this.y + dy);
    }

    static randomPoint(maxX:number, maxY:number):Point {
        var x = Math.round(Math.random() * (maxX - 1));
        var y = Math.round(Math.random() * (maxY - 1));
        return new Point(x, y);
    }
}


class SnakeGame extends CanvasGame {

    ctx:CanvasRenderingContext2D;
    stone:Point[];
    body:Point[];
    size:number = 20;
    initialBodyLength = 4;
    timerToken:number;
    dx:number;
    dy:number;
    target:Point = undefined;

    isEmpty(p:Point):Boolean {
        if (p.x < 0 || p.y < 0 || p.x >= this.size || p.y >= this.size) {
            return false;
        }
        for (var x in this.body) {
            if (p.equals(this.body[x]))
                return false;
        }
        for (var x in this.stone) {
            if (p.equals(this.stone[x]))
                return false;
        }
        if (this.target && this.target.equals(p)) {
            return false;
        }

        return true;
    }

    start() {
       super.start()
        this.ctx = this.canvas.getContext("2d");

        this.body = new Array(0);
        for (var i = 0; i < this.initialBodyLength; i++) {
            this.body.push(new Point(this.size / 2, this.size - i - 1));
        }


        this.stone = new Array(0);
        for (var i = 0; i < 10; i++) {
            this.stone.push(this.findFreeRandomCell());
        }

        this.target = this.findFreeRandomCell();

        this.renderLevel();
        this.dx = -10;
        this.dy = -10;
        this.timerToken = setInterval(this.doStep.bind(this), 100);

        document.body.addEventListener("keydown", this.onkeypress.bind(this));
    }

    stop() {
        document.body.removeEventListener("keydown", this.onkeypress.bind(this));
        clearInterval(this.timerToken);
        this.container.removeChild(this.canvas);
    }

    doStep() {
        if (this.dx == -10 && this.dy == -10) {
            return;
        }
        var head:Point = this.body[this.body.length - 1];

        var newHead:Point = head.move(this.dx, this.dy);
        if (!this.isEmpty(newHead)) {
            if (this.target && this.target.equals(newHead)) {
                this.target = this.findFreeRandomCell();
                console.log("Target hit");
            } else {
                this.stop();
                alert("Gave over");
                this.start();
                return;
            }
        } else {
            this.body.shift();
        }
        this.body.push(newHead);
        this.renderLevel();
    }

    findFreeRandomCell():Point {
        var newPoint:Point = Point.randomPoint(this.size, this.size);
        while (!this.isEmpty(newPoint)) {
            newPoint = Point.randomPoint(this.size, this.size);
        }
        return newPoint;
    }
    onkeypress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 37:
                this.checkAndSetDirection(-1, 0);
                break;// LEFT
            case 38:
                this.checkAndSetDirection(0, -1);
                break;// UP
            case 39:
                this.checkAndSetDirection(1, 0);
                break;// RIGHT
            case 40:
                this.checkAndSetDirection(0, 1);
                break;// DOWN
        }
    }

    checkAndSetDirection(dx:number, dy:number) {
        if (this.dx == 0 && dx == 0 || this.dy == 0 && dy == 0) {
            return; // Cant change direction to reverse
        }
        this.dx = dx;
        this.dy = dy;

    }

    private renderLevel() {
        var ctx:CanvasRenderingContext2D = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "green";
        for (var k = 0; k < this.stone.length; k++) {
            this.fillPixel(this.stone[k], ctx);
        }

        ctx.fillStyle = "red";
        for (var k = 0; k < this.body.length; k++) {
            this.fillPixel(this.body[k], ctx);
        }
        ctx.fillStyle = "gray";
        this.fillPixel(this.body[this.body.length - 1], ctx);

        if (this.target) {
            ctx.fillStyle = "yellow";
            this.fillPixel(this.target, ctx);
        }

    }

    fillPixel(point:Point, ctx:CanvasRenderingContext2D) {
        var d:number = this.canvas.width / this.size;
        ctx.fillRect(point.x * this.canvas.width / this.size, point.y * this.canvas.height / this.size, this.canvas.width / this.size, this.canvas.height / this.size);
    }

}

class ThreeDimGame implements Game{

    meshes: THREE.Mesh[][];
    scene: THREE.Scene;
    renderer : THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    rotationSide:number = 1;
    size: number = 4;
    pad : number = 8;
    cellSize: number = 40;
    rotation: boolean = false;
    i:number = 0;
    j:number = 0;
    p:number = 0;

    constructor(public container: HTMLElement) {}

    public start() {

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(50, this.container.clientWidth / this.container.clientHeight, 1, 100);
        this.camera.position.z =40;
        this.camera.position.x = 0;
        this.camera.position.y = 0;

        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.scene.add(this.camera);

        var loader = new THREE.JSONLoader();


        this.renderer = new THREE.WebGLRenderer({
            clearAlpha: 1,
            clearColor: 0xdddddd,
            antialias: true
        });
        this.renderer.shadowMapEnabled = true;
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        loader.load('model/hold.json', this.addGeometry.bind(this));

        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement );
        controls.addEventListener( 'change', this.render.bind(this));


    }

    addGeometry(geometry, materials) {
        this.meshes = [];


        for (var i =0; i < this.size; i++) {
            this.meshes.push([]);
            for (var j =0; j < this.size; j++) {
                var color = (i +j === this.size - 1 ? 0x06009e : 0xdfdfdf);
                var material = new THREE.MeshPhongMaterial( { color: color});
                var mesh = new THREE.Mesh(geometry, material);
                mesh.receiveShadow = true;

                mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.85;
                mesh.position.x = i*7.5-11;
                mesh.position.y = -j*7.5 +11;
                mesh.rotateX(Math.PI/2);
                mesh.rotateY(Math.PI/4);

                this.meshes[i].push(mesh);
                this.scene.add(mesh);
            }
        }

        var plane = new THREE.Mesh(new THREE.CubeGeometry(100,100,1), new THREE.MeshPhongMaterial({color: 0x00ff00}));
        plane.receiveShadow = true;
        plane.position.z = -2;
        this.scene.add(plane);

        //var spot = new THREE.SpotLight(0xffffff,1);
        //spot.position.set(0,0,15);
        //spot.shadowCameraNear = 1; // keep near and far planes as tight as possible
        //spot.shadowCameraFar = 10; // shadows not cast past the far plane
        //spot.castShadow = true;
        //
        //this.scene.add(spot);

        var light = new THREE.SpotLight();
        light.position.set(20,-10,40);
        light.target.position.set(0,0,1);
        light.castShadow = true;

        light.shadowCameraNear = 1; // keep near and far planes as tight as possible
        light.shadowCameraFar = 10; // shadows not cast past the far plane

        this.scene.add(light);

        this.render();
        this.container.appendChild(this.renderer.domElement);

        this.renderer.domElement.addEventListener("click", this.onclick.bind(this));


    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        this.renderer.domElement.removeEventListener("click", this.onclick.bind(this));
    }

    onclick(e: MouseEvent) {


        if (!this.rotation) {
            this.rotation = true;

            var x = e.x - this.renderer.domElement.getBoundingClientRect().left - this.pad;
            var y = e.y - this.renderer.domElement.getBoundingClientRect().top - this.pad;

            var j = Math.floor(x / this.cellSize);
            var i = Math.floor(y / this.cellSize);

            this.i = Math.min(i, this.size - 1);
            this.j = Math.min(j, this.size - 1);
            this.p = 1;

            requestAnimationFrame(this.rotate.bind(this));
        }
    }

    rotate() {


        for (var k = 0; k < this.size; k++) {
            var line = this.meshes[k];
            for (var t = 0; t<line.length; t++) {
                if (k === this.i || t === this.j) {
                    this.meshes[t][k].rotateY((1-this.p)*Math.PI/4);
                }
            }
        }

        this.render();
        this.p = this.p-0.02;

        if (this.p >= 0) {
            requestAnimationFrame(this.rotate.bind(this));
        } else {
            this.rotation = false;
        }
    }
}


document.addEventListener('DOMContentLoaded', function () {
    var game: Game  = new ThreeDimGame(<HTMLElement>document.getElementsByClassName("container")[0]);
    game.start();
});