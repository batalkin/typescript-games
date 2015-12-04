/// <reference path="game-common.ts"/>
class Man extends Point {}

class SokobanGame extends CanvasGame {
// 1 wall, 2 box, 3 correct box, 4 place for box, 9 man
    initialMap:number[][] = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,2,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,4,3,3,3,4,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,9,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];
    map:number[][];
    man:Man;

    ctx:CanvasRenderingContext2D;
    size:number = 20;

    start() {

        super.start();
        this.map = new Array(this.size);
        for (var x = 0; x < this.size; x++) {
            this.map[x] = new Array<number>(this.size);
            for (var y = 0; y < this.size; y++) {
                if (this.initialMap[x][y] == 9) {
                    this.man = new Man(x, y);
                    this.map[x][y] = 0;
                } else {
                    this.map[x][y] = this.initialMap[x][y];
                }
            }
        }
        this.ctx = this.canvas.getContext("2d");

        this.renderLevel();

        document.body.addEventListener("keydown", this.onkeypress.bind(this));

        return this.promise();
    }

    stop() {
        document.body.removeEventListener("keydown", this.onkeypress.bind(this));
        this.container.removeChild(this.canvas);
    }

    onkeypress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 37:
                this.moveMan(-1, 0);
                break;// LEFT
            case 38:
                this.moveMan(0, -1);
                break;// UP
            case 39:
                this.moveMan(1, 0);
                break;// RIGHT
            case 40:
                this.moveMan(0, 1);
                break;// DOWN
        }
    }

    moveMan(dx:number, dy:number) {
        var oldX:number = this.man.x;
        var oldY:number = this.man.y;
        var nextCell = this.map[oldX + dx][oldY + dy];
        if (nextCell == 0 || nextCell == 4) {
            this.man.x += dx;
            this.man.y += dy;
        }
        if (nextCell == 1) {
            return;
        }
        var nextNextCell = this.map[oldX + dx * 2][oldY + dy * 2];
        if (nextNextCell == 0) {
            if (nextCell == 2) {
                this.man.x += dx;
                this.man.y += dy;
                this.map[oldX + dx][oldY + dy] = 0;
                this.map[oldX + 2 * dx][oldY + 2 * dy] = 2;
            } else if (nextCell == 3) {
                this.man.x += dx;
                this.man.y += dy;
                this.map[oldX + dx][oldY + dy] = 4;
                this.map[oldX + 2 * dx][oldY + 2 * dy] = 2;
            }
        } else if (nextNextCell == 4) {
            if (nextCell == 2) {
                this.man.x += dx;
                this.man.y += dy;
                this.map[oldX + dx][oldY + dy] = 0;
                this.map[oldX + 2 * dx][oldY + 2 * dy] = 3;
            } else if (nextCell == 3) {
                this.man.x += dx;
                this.man.y += dy;
                this.map[oldX + dx][oldY + dy] = 4;
                this.map[oldX + 2 * dx][oldY + 2 * dy] = 3;
            }
        }
        this.renderLevel();
    }

    private renderLevel() {
        var ctx:CanvasRenderingContext2D = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var x:number = 0; x < this.size; x++) {
            for (var y:number = 0; y < this.size; y++) {
                if (this.map[x][y] == 1) {
                    ctx.fillStyle = "black";
                } else if (this.map[x][y] == 2) {
                    ctx.fillStyle = "blue";
                } else if (this.map[x][y] == 3) {
                    ctx.fillStyle = "green";
                } else if (this.map[x][y] == 4) {
                    ctx.fillStyle = "red";
                } else {
                    continue;
                }
                var point:Point = new Point(x, y);
                this.fillPixel(point, ctx);
            }
        }
        // drawing man:
        ctx.fillStyle = "pink";
        this.fillPixel(this.man, ctx);

    }

    fillPixel(point:Point, ctx:CanvasRenderingContext2D) {
        var d:number = this.canvas.width / this.size;
        ctx.fillRect(point.x * this.canvas.width / this.size, point.y * this.canvas.height / this.size, this.canvas.width / this.size, this.canvas.height / this.size);
    }

}