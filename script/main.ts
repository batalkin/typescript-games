/// <reference path="game-common.ts"/>
/// <reference path="snake-game.ts"/>
/// <reference path="refrigerator-game.ts"/>
/// <reference path="refrigerator-3d-game.ts"/>
/// <reference path="minesweeper-game.ts"/>
/// <reference path="sokoban-game.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../typings/threejs/three-orbitcontrols.d.ts"/>

document.addEventListener('DOMContentLoaded', function () {
    var container = <HTMLElement>document.getElementsByClassName("container")[0];
    var games:Game[] = [
        new SokobanGame(container),
        new SnakeGame(container),
        new RefrigeratorGame(container),
        new Refrigerator3dGame(container, {level: 5, rotationSpeed: 0.5}),
        new MinesweeperGame(container)
    ];

    var clearContainer = function() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    };

    var startNextRandomGame = function() {
        var index = Math.round(Math.random()*(games.length-1));
        var game = games[index];

        game.start()
            .then(clearContainer)
            .then(startNextRandomGame)
            .catch(console.log.bind(console));

        /* TODO game clean up. Smth like game.stop in callback
            Or add clean up logic into games

            Score thing:

            game.start()
                .then(addScoresToTotal)
                .then(game.close.bind(game))
                .then(..)
         */
    };

    startNextRandomGame();
});