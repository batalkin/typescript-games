interface Game {
    start: () => void
}

class CanvasGame implements Game {
    canvas:HTMLCanvasElement;

    constructor(public container:HTMLElement) {
    }

    start() {
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.container.clientHeight;
        this.canvas.width = this.container.clientWidth;
        this.container.appendChild(this.canvas);
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
