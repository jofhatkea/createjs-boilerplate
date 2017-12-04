/*jshint esversion: 6, -W097 */
/* globals window, document, createjs */

"use strict";

let stage, queue, preloadText;

let canvasOptions = {
    width: 600,
    height: 400,
    id: "boilerplate"
};

let keys = {
    u: false,
    d: false,
    l: false,
    r: false
};

function setup(){
    let canvas = document.createElement("canvas");
    canvas.setAttribute("width", canvasOptions.width);
    canvas.setAttribute("height", canvasOptions.height);
    canvas.id=canvasOptions.id;
    document.body.insertBefore(canvas, document.body.firstChild);

    stage = new createjs.Stage(canvasOptions.id);

    preloadText = new createjs.Text("Loading", "30px Verdana", "#000");
    preloadText.textBaseline="middle";
    preloadText.textAlign="center";
    preloadText.x=stage.canvas.width/2;
    preloadText.y=stage.canvas.height/2;
    stage.addChild(preloadText);

    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest(
        [
            "someFolder/someFile.jpg",
            "someFolder/someScript.js",
            {id:"coinGFX", src:"gfx/coin.png"},
            {id:"jingleAudio", src:"jingle.mp3"},
            {id: "slimeSS", src:"spritesheets/Animations/slime.json", type:"spritesheet"}
        ]
    );
    queue.addEventListener('progress', progress);
    queue.addEventListener('complete', ressourcesLoaded);
}

function progress(e){
    let percent = Math.round(e.progress*100);
    preloadText.text = "Loading: "+percent+"%";
    stage.update();
}

function ressourcesLoaded(){
    stage.removeChild(preloadText);
    window.addEventListener('keyup', fingerLifted);
    window.addEventListener('keydown', fingerDown);
    createjs.Ticker.framerate=60;
    createjs.Ticker.addEventListener("tick", tock);
}

function tock(e){
    stage.update(e);
}

function fingerLifted(e){
    switch(e.key){
        case "ArrowLeft":
            keys.l=false;
            break;
        case "ArrowRight":
            keys.r=false;
            break;
        case "ArrowUp":
            keys.u=false;
            break;
        case "ArrowDown":
            keys.d=false;
            break;
    }
}
function fingerDown(e){
    switch(e.key){
        case "ArrowLeft":
            keys.l=true;
            break;
        case "ArrowRight":
            keys.r=true;
            break;
        case "ArrowUp":
            keys.u=true;
            break;
        case "ArrowDown":
            keys.d=true;
            break;
    }
}

window.addEventListener("load", setup);