/// <reference path="game-common.ts"/>

interface Cell {
    draw(context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number);
}

class NumberCell implements Cell {
    constructor(public value:number) {
    }

    draw = function(context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
        if (this.value == 0) {
            return;
        }
        context.beginPath();
        context.fillStyle = "black";
        context.fillText(this.value.toString(), x + width / 2, y + height / 2, height);
        context.stroke();
        context.closePath();
    }
}

var WALL:Cell = {
    draw:function(context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
        fillWithColor(context, "#06009e", x, y, width, height);
    }
}

var UNCLICKED:Cell = {
    draw:function(context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
        fillWithColor(context, "grey", x, y, width, height);
    }
}

var FLAG:Cell = {
    draw:function(context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
        fillWithColor(context, "yellow", x, y, width, height);
    }
}

var EXPLODED:Cell = {
    draw:function(context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
        fillWithColor(context, "red", x, y, width, height);
    }
}

var fillWithColor = function(context:CanvasRenderingContext2D, fillStyle:String, x:number, y:number, width:number, height:number) {
    context.beginPath();
    context.fillStyle = fillStyle;
    context.fillRect(x, y, width, height);
    context.stroke();
    context.closePath();
}


class MinesweeperGame extends Game {

    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    field:Cell[][];
    bombs:Point[];
    pad:number = 3;
    cellSize:number;
    level:number = 40;
    bombsNumber:number;
    size:number = 18;
    logoPadding:number = 2;
    logoLineWidth:number = 3;
    gameIsOver:boolean;

    constructor(public container:HTMLElement) {
        super();
    }


    start() {
        this.gameIsOver = false;
        this.bombsNumber = this.level;
        this.field = new Array(this.size);

        for (var i = 0; i < this.size; i++) {
            this.field[i] = new Array<Cell>(this.size);
            for (var j = 0; j < this.size; j++) {
                this.field[i][j] = UNCLICKED;
            }
        }
        var logoLineHeight = this.size - 2 * this.logoPadding;
        for (var y = this.logoPadding; y < this.size - this.logoPadding; y++) {
            var startX = Math.round(this.logoPadding + ((logoLineHeight - this.logoLineWidth + 1) * (y - this.logoPadding) / logoLineHeight));
            for (var x = startX; x < startX + this.logoLineWidth; x++) {

                this.field[this.size - 1 - y][x] = WALL;
            }
        }
        this.bombs = new Array<Point>(this.bombsNumber);
        for (var i = 0; i < this.bombsNumber; i++) {
            var x = Math.round(Math.random() * (this.size - 1));
            var y = Math.round(Math.random() * (this.size - 1));
            if (this.field[x][y] == UNCLICKED) {
                var bomb = new Point();
                bomb.x = x;
                bomb.y = y;
                this.bombs[i] = bomb;
            } else {
                i--;
                this.bombsNumber--;
            }
        }

        this.canvas = document.createElement("canvas");
        this.canvas.height = this.container.clientHeight;
        this.canvas.width = this.container.clientWidth;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        this.cellSize = Math.floor((this.canvas.width - this.pad) / this.size);

        this.renderLevel();

        this.canvas.addEventListener("click", this.onLeftButtonClick.bind(this));
        this.canvas.addEventListener("contextmenu", this.onRightButtonClick.bind(this));
    }

    stop() {
        this.canvas.removeEventListener("click", this.onLeftButtonClick.bind(this));
        this.canvas.addEventListener("contextmenu", this.onRightButtonClick.bind(this));
        this.container.removeChild(this.canvas);
    }

    gameOver() {
        this.gameIsOver = true;
        for (var i = 0; i < this.bombsNumber; i++) {
            var bomb:Point = this.bombs[i];
            this.field[bomb.x][bomb.y] = EXPLODED;
        }
        this.renderLevel();
        alert("Game over, looser")
    }

    isBomb(x,y) {
        for (var i = 0; i < this.bombsNumber; i++) {
            var bomb = this.bombs[i];
            if (bomb.x == x && bomb.y == y) {
                return true;
            }
        }
        return false;
    }

    countBombsAround(i, j) {
        var count = 0;
        if (this.isBomb(i - 1, j - 1)) {
            count++;
        }
        if (this.isBomb(i - 1, j)) {
            count++;
        }
        if (this.isBomb(i, j - 1)) {
            count++;
        }
        if (this.isBomb(i - 1, j + 1)) {
            count++;
        }
        if (this.isBomb(i + 1, j + 1)) {
            count++;
        }
        if (this.isBomb(i, j + 1)) {
            count++;
        }
        if (this.isBomb(i + 1, j)) {
            count++;
        }
        if (this.isBomb(i + 1, j - 1)) {
            count++;
        }
        return count;
    }

    openCell(i, j) {
        if (i < 0 || j < 0 || i >= this.size || j >= this.size || this.field[i][j] != UNCLICKED) {
            return;
        }
        if (this.isBomb(i, j)) {
            this.gameOver();
        } else {
            var bombsAround = this.countBombsAround(i, j);
            this.field[i][j] = new NumberCell(bombsAround);
            if (bombsAround == 0) {
                this.openCell(i - 1, j - 1);
                this.openCell(i - 1, j);
                this.openCell(i - 1, j + 1);
                this.openCell(i, j - 1);
                this.openCell(i, j + 1);
                this.openCell(i + 1, j - 1);
                this.openCell(i + 1, j);
                this.openCell(i + 1, j + 1);
            }
        }
    }

    putFlag(i, j) {
        if (i < 0 || j < 0 || i >= this.size || j >= this.size) {
            return;
        }
        if (this.field[i][j] == UNCLICKED) {
            this.field[i][j] = FLAG;
        } else if (this.field[i][j] == FLAG) {
            this.field[i][j] = UNCLICKED;
        }
    }

    onLeftButtonClick(e:MouseEvent) {
        this.onClick(e, true);
    }
    onRightButtonClick(e:MouseEvent) {
        this.onClick(e, false);
    }

    onClick(e:MouseEvent, isLeft:boolean) {
        if (this.gameIsOver) {
            this.stop();
            this.start();
            return;
        }
        e.preventDefault();
        var x = e.x - this.canvas.getBoundingClientRect().left - this.pad;
        var y = e.y - this.canvas.getBoundingClientRect().top - this.pad;

        var j = Math.floor(x / this.cellSize);
        var i = Math.floor(y / this.cellSize);

        i = Math.min(i, this.size - 1);
        j = Math.min(j, this.size - 1);

        if (isLeft) {
            this.openCell(i, j);
        } else {
            this.putFlag(i, j);
        }

        this.renderLevel();
    }

    private renderLevel() {
        var ctx:CanvasRenderingContext2D = this.ctx,
            field:Cell[][] = this.field;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var k = 0; k < field.length; k++) {
            var line = field[k];
            for (var j = 0; j < line.length; j++) {
                var pad_bottom = this.cellSize - this.pad;

                var x = j * this.cellSize + this.pad;
                var y = k * this.cellSize + this.pad;
                line[j].draw(ctx, x, y, pad_bottom, pad_bottom);

            }
        }
    }
}
