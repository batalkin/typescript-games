interface Game {
    start: () => void
}

class RefrigeratorGame implements Game {

    canvas: HTMLCanvasElement;
    ctx : CanvasRenderingContext2D;
    arr : number[][];
    pad : number = 8;
    cellSize: number;
    level: number = 3;
    size: number = 4;


    constructor(public container: HTMLElement) {
        this.arr = new Array(this.size);
        for (var i = 0; i< this.size; i++) {
            this.arr[i] = new Array<number>(this.size);
            for (var j = 0; j < this.size; j++) {
                this.arr[i][j] = 0;
            }
        }
    }


    start() {
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.container.clientHeight;
        this.canvas.width = this.container.clientWidth;
        this.container.appendChild(this.canvas);
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

document.addEventListener('DOMContentLoaded', function () {
    var game: Game  = new RefrigeratorGame(<HTMLElement>document.getElementsByClassName("container")[0]);
    game.level = 2;
    game.start();
});