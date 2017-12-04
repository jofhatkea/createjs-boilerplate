/*jshint esversion: 6, -W097 */
/* globals window, document, createjs */
/*
more explosions

shooter
  more enemies
  more explosions
  enemies fire
  powerups
    faster firing
    faster movement
    new weapon
    
  "space-down-firing"tm
  highscore table (offline)
  input name
  hitstreak multiplier
  
*/ 
"use strict";

let stage, queue, preloadText, hero;

let canvasOptions = {
    width: 600,
    height: 400,
    id: "boilerplate"
};
let settings = {
    speed: 4,
    currentDirection: "neutral"
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
            
            {id: "heroSS", src:"gfx/sprites/player.json", type:"spritesheet"}
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
    hero = new createjs.Sprite(queue.getResult("heroSS"), settings.currentDirection);
    hero.width=hero.height=44;
    hero.x=stage.canvas.width/2-hero.width/2;
    hero.y = stage.canvas.height-hero.height;
    stage.addChild(hero);
    createjs.Ticker.framerate=60;
    createjs.Ticker.addEventListener("tick", tock);
}

function moveHero(){
    if(keys.l){
        hero.x-=settings.speed;
        if(settings.currentDirection != "fLeft"){
            hero.gotoAndPlay("fLeft");
            settings.currentDirection = "fLeft";
        }
    }
    if(keys.r){
        hero.x+=settings.speed;
        if(settings.currentDirection != "fRight"){
            hero.gotoAndPlay("fRight");
            settings.currentDirection = "fRight";
        }
    }
    if(keys.u){
        hero.y-=settings.speed;
        if(settings.currentDirection != "forward"){
            hero.gotoAndPlay("forward");
            settings.currentDirection = "forward";
        }
    }
    if(keys.d){
        hero.y+=settings.speed;
        if(settings.currentDirection != "forward"){
            hero.gotoAndPlay("forward");
            settings.currentDirection = "forward";
        }
    }
    if(!keys.u && !keys.d && !keys.l && ! keys.r){
        hero.gotoAndPlay("neutral");
        settings.currentDirection = "neutral";
    }
}
function tock(e){
    moveHero();
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