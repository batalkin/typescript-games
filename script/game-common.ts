///<reference path="../typings/es6-promise/es6-promise.d.ts"/>
interface Game{
    start():Promise<GameResult>;
}

enum GameResult {
    WIN,
    LOOSE
}

class PromiseProvider<T> {
    resolveCallback:(T) => void;

    promise():Promise<T> {
        return new Promise(function(resolve) {
            this.resolveCallback = resolve;
        }.bind(this))
    }

    resolveWith(value:T) {
        this.resolveCallback(value);
    }
}

class CanvasGame extends PromiseProvider<GameResult> implements Game{
    canvas:HTMLCanvasElement;

    constructor(public container:HTMLElement) {
        super();
    }

    start() {
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.container.clientHeight;
        this.canvas.width = this.container.clientWidth;
        this.container.appendChild(this.canvas);

        return this.promise();
    }

}

class GameUtils {
    static roundUp(num:number, div:number):number {
        var sum = 0;

        while (sum + div / 2 < num) {
            sum += div;
        }

        return sum;
    }
}

class Point {
    x:number = 0;
    y:number = 0;

    constructor(x?:number, y?:number) {
        this.x = x || this.x;
        this.y = y || this.y;
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
