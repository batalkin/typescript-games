/// <reference path="game-common.ts"/>
/// <reference path="snake-game.ts"/>
/// <reference path="refrigerator-game.ts"/>
/// <reference path="refrigerator-3d-game.ts"/>
/// <reference path="minesweeper-game.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../typings/threejs/three-orbitcontrols.d.ts"/>

document.addEventListener('DOMContentLoaded', function () {
    var container = <HTMLElement>document.getElementsByClassName("container")[0];
    var games:Game[] = [
        new SnakeGame(container),
        //new RefrigeratorGame(container),
        new Refrigerator3dGame(container, {level: 5, rotationSpeed: 0.5}),
        new MinesweeperGame(container)
    ];

    var index = Math.round(Math.random()*(games.length-1));
    games[index].start();
});