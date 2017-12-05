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
    
  
  highscore table (offline)
  input name
  hitstreak multiplier
  
*/ 
"use strict";

let stage, queue, preloadText, hero, bullets=[], waveContainer, enemies=[];

let canvasOptions = {
    width: 600,
    height: 400,
    id: "boilerplate"
};
let settings = {
    speed: 4,
    currentDirection: "neutral",
    bulletSpeed: 8,
    fireRate: 0,
    fireRateReset: 10
};
let keys = {
    u: false,
    d: false,
    l: false,
    r: false,
    fire: false
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
            {id: "b1", src:"gfx/bullet0.png"},
            {id: "heroSS", src:"gfx/sprites/player.json", type:"spritesheet"},
            {id: "enemySS", src:"gfx/sprites/enemies.json", type:"spritesheet"}
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
    waveContainer = new createjs.Container();

    stage.addChild(waveContainer, hero);
    addEnemies(10);
    createjs.Ticker.framerate=60;
    createjs.Ticker.addEventListener("tick", tock);
}

function addEnemies(howMany){
    let xPos = 0, yPos=0;
    for(let i=0; i<howMany; i++){
        let temp = new createjs.Sprite(queue.getResult("enemySS"), "B1");
        temp.width=temp.height=55;
        temp.x=xPos;
        temp.y=yPos;
        xPos+=65;
        console.log(xPos, yPos)
        if(xPos > 200){
            xPos=0;
            yPos+=65;
        }
        enemies.push(temp);
        waveContainer.addChild(temp);
    }
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
function createBullet(x,y){
    let temp = new createjs.Bitmap(queue.getResult("b1"));
    stage.addChild(temp);
    temp.width=16;
    temp.height=64;
    temp.x=x-temp.width/2;
    temp.y=y-temp.height/2;
    bullets.push(temp);
}
function handleFire(){
    //if can fire
    settings.fireRate--;
    if(keys.fire && settings.fireRate<1){
        createBullet(hero.x+hero.width/2, hero.y);
        settings.fireRate = settings.fireRateReset;
    }
    
}
function moveBullets(){
    bullets.forEach(function(bullet, i){
        bullet.y-=settings.bulletSpeed;
    });
}
function tock(e){
    moveHero();
    handleFire();
    moveBullets();
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
        case " ":
            keys.fire=false;
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
        case " ":
            keys.fire=true;
            break;
    }
}

window.addEventListener("load", setup);