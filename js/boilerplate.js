/*jshint esversion: 6, -W097 */
/* globals window, document, createjs */
/*
more explosions

shooter
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

let stage, queue, preloadText, hero, bullets=[], waveContainer, enemies=[], hearts=[];

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
    fireRateReset: 10,
    enemyHP: 2,
    bulletDamage: 1,
    gameRunning:false,
    level:1,
    lives: 3,
    vulnerable: true
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

    preloadText = new createjs.Text("Loading", "30px Verdana", "#FFF");
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
            {id: "heart", src:"gfx/heart.png"},
            {id: "heroSS", src:"gfx/sprites/player.json", type:"spritesheet"},
            {id: "enemySS", src:"gfx/sprites/enemies.json", type:"spritesheet"},
            {id: "explosionSS", src:"gfx/sprites/explosion.json", type:"spritesheet"},
            {id: "boomSound", src:"audio/boom.mp3"},
            {id: "fireSound", src:"audio/splat.mp3"},
            {id: "bgSound", src:"audio/danger.mp3"}
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
function createButton(text){
    let cont = new createjs.Container();

    let button = new createjs.Shape();
    button.graphics.beginFill("purple").drawRect(0,0, 200, 100);
    
    let textO = new createjs.Text(text, "16px Courier", "#FFF");
    textO.textAlign="center";
    textO.textBaseline="middle";
    textO.x=100;
    textO.y=50;
    cont.regX=100;
    cont.regY=50;
    cont.addChild(button, textO);
    cont.addEventListener('click', function(e){
        stage.removeChild(e.currentTarget);
        startGame();
    });
    return cont;
}
function ressourcesLoaded(){
    stage.removeChild(preloadText);
    
    let b = createButton("Press To Play");
    b.x=stage.canvas.width/2;
    b.y=stage.canvas.height/2;
    stage.addChild(b);
    createjs.Ticker.framerate=60;
    createjs.Ticker.addEventListener("tick", tock);
}
function startGame(){
    settings.gameRunning=true;
    createjs.Sound.play("bgSound");
    window.addEventListener('keyup', fingerLifted);
    window.addEventListener('keydown', fingerDown);
    for(let i=0; i<settings.lives; i++){
        let h = new createjs.Bitmap(queue.getResult("heart"));
        h.x=i*30;
        h.scale=0.5;
        stage.addChild(h);
        hearts.push(h);
    }
    hero = new createjs.Sprite(queue.getResult("heroSS"), settings.currentDirection);
    hero.width=hero.height=44;
    hero.x=stage.canvas.width/2-hero.width/2;
    hero.y = stage.canvas.height-hero.height;
    waveContainer = new createjs.Container();
    waveContainer.x=-300;
    moveWave();
    stage.addChild(waveContainer, hero);
    addEnemies(8);
}
function moveWave(){
    createjs.Tween.get(waveContainer, {override:true})
    .to({
        x: 300
    }, 4000).call(function(){
        createjs.Tween.get(waveContainer, {loop:-1}).to({
            y: 100
        }, 1500)
        .to({x:0}, 3000)
        .to({y:0}, 1500)
        .to({x:300}, 3000);

    });
}
function addEnemies(howMany){
    let xPos = 0, yPos=0;
    for(let i=0; i<howMany; i++){
        let temp = new createjs.Sprite(queue.getResult("enemySS"), "B1");
        temp.width=temp.height=55;
        temp.hp = settings.enemyHP;
        temp.x=xPos;
        temp.y=yPos;
        temp.origX=xPos;
        temp.origY=yPos;
        temp.crazy=false;
        temp.crazyFactor = settings.level;
        xPos+=65;
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
function createExplosion(xCo, yCo){
    let temp = new createjs.Sprite(queue.getResult("explosionSS"), "explode");
    temp.x = xCo;
    temp.y=yCo;
    stage.addChild(temp);
    createjs.Sound.play("boomSound");
    temp.addEventListener("animationend", function(e){
        stage.removeChild(e.target);
    });
}
function createBullet(x,y){
    let temp = new createjs.Bitmap(queue.getResult("b1"));
    stage.addChild(temp);
    temp.width=16;
    temp.height=64;
    temp.damage=settings.bulletDamage;
    temp.x=x-temp.width/2;
    temp.y=y-temp.height/2;
    bullets.push(temp);
}
function handleFire(){
    //if can fire
    settings.fireRate--;
    if(keys.fire && settings.fireRate<1){
        createBullet(hero.x+hero.width/2, hero.y);
        createjs.Sound.play("fireSound");
        settings.fireRate = settings.fireRateReset;
    }
    
}
function moveBullets(){
    bullets.forEach(function(bullet, i){
        bullet.y-=settings.bulletSpeed;
        if(bullet.y < -64){
            stage.removeChild(bullet);
            bullets.splice(i, 1);
        }
    });
}
function resetWave(){
    waveContainer.x=-300;
    waveContainer.y=0;
    settings.enemyHP++;
    addEnemies(8);
    moveWave();
}
function bulletsHitEnemies(){
    for(let b = bullets.length-1; b>=0; b--){
        for(let e = enemies.length-1; e>=0; e--){
            if(hitTestInContainer(enemies[e], bullets[b])){
                enemies[e].hp-=bullets[b].damage;
                stage.removeChild(bullets[b]);
                createExplosion(bullets[b].x, bullets[b].y);
                bullets.splice(b, 1);
                enemies[e].gotoAndStop("A1");
                
                if(enemies[e].hp <= 0){
                    waveContainer.removeChild(enemies[e]);
                    enemies.splice(e,1);
                    if(enemies.length===0){
                        resetWave();
                    }
                }
                break;
            }
        }
    }
}
function enemiesHitPlayer(){
    enemies.forEach(function(enemy, i){
        if(hitTestInContainer(enemy, hero)){
            playerHit();
        }
    });
}
function playerHit(){
    settings.lives--;
    let h =hearts.pop();
    stage.removeChild(h);
    hero.x=stage.canvas.width/2-hero.width/2;
    hero.y=stage.canvas.height-hero.height;
    if(settings.lives<1){
        settings.gameRunning=false;
        stage.removeAllChildren();
        let b = createButton("Game Over");
        stage.addChild(b);
        b.x=stage.canvas.width/2;
        b.y=stage.canvas.height/2;
    }
}
function handleCollisions(){
    bulletsHitEnemies();
    enemiesHitPlayer();
}
function goCrazy(){
    enemies.forEach(function(enemy, i){
        if(!enemy.crazy){
            let chance = Math.floor(Math.random()*1000);
            if(chance <= enemy.crazyFactor){
                enemy.crazy=true;
                createjs.Tween.get(enemy).to(
                    {
                        x:Math.floor(Math.random()*stage.canvas.width-waveContainer.x), 
                        y:Math.floor(Math.random()*stage.canvas.height-waveContainer.y)
                    },1000).to({x:enemy.origX, y:enemy.origY},1000).call(function(){
                    enemy.crazy=false;
                });
            }
        }
    });
}
function tock(e){
    if(settings.gameRunning){
        handleCollisions();
        moveHero();
        handleFire();
        moveBullets();
        goCrazy();
    }
    
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
//stolen from the lectures
function hitTest(rect1,rect2) {
    if ( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y )
    {
        return false;
    }
    return true;
}
function hitTestInContainer(rect1,rect2) {
    if ( rect1.x+rect1.parent.x >= rect2.x + rect2.width
        || rect1.x+rect1.parent.x + rect1.width <= rect2.x
        || rect1.y+rect1.parent.y >= rect2.y + rect2.height
        || rect1.y+rect1.parent.y + rect1.height <= rect2.y )
    {
        return false;
    }
    return true;
}
window.addEventListener("load", setup);