//* TODO: instead of credits-, hearts- and score-overlay. Unify to a single HUD-overlay

//* Canvas setup
var canvasGfx = document.getElementById("canvasGfx");
var ctx = canvasGfx.getContext("2d");

canvW = 500;
canvH = 300;
canvasGfx.width = canvW;
canvasGfx.height = canvH;

//* Globals
var restart = document.getElementById("btnRestart");
var bodyEl = document.querySelector("body");
var boxEl = document.getElementById("box");

var asteroidSize = 40;
var asteroidDim = Math.floor((413 / 318) * 100) / 100;

var astronautSize = 40;
var astronautDim = Math.floor((140 / 180) * 100) / 100; //| width/height

var scaleMax = 4;
var starfieldSpeed = 2;
var gameOverScreenAnimationCounter = 0;
var shopScreen = false;
var gameScore = 0;
var oldGameScore = 0;
var newScore = 0;
var gameCredits = 0;
var speed = 1;
var gameOver = false;
var restartBtnActive = false;
var pSpeed = 1;

var hearts = 3;
var heartString = "";
var heartSymbol = "♥";

var gameOverScreen;
var asteroid;
var starfield;
var astronaut;
var scale;
var spawnHeight;

var imageAstro = new Image();
var imageAsteroid = new Image();
var imageSatellite = new Image();
var imageStarfield = new Image();
imageAstro.src = "./media/astro.png";
imageAsteroid.src = "./media/asteroid2.png";
imageSatellite.src = "./media/Satellite.png"; //stor .PNG?
imageStarfield.src = "./media/starfield.jpg";

function rand(x){
    return Math.floor((Math.random() * x)+1);
}

function Asteroid(x, y){
    this.x = x,
    this.y = y,
    this.speed = speed + 1/2 * rand(4), //| 4 forskjellige hastigheter
    this.w = asteroidSize * asteroidDim,
    this.h = asteroidSize,

    this.scale = function(){
        this.w *= scale;
        this.h *= scale;
    };
    this.update = function(){
        if(this.x < 0 - this.w){
            //this.x = canvW;
            scale = rand(scaleMax);                         //| change scale global
            spawnHeight = rand(canvH-asteroidSize*scale);   //| compute spawnH   
            asteroid = new Asteroid(canvW, spawnHeight); //| generate new asteroid
            asteroid.scale();                               //| change size to w*scale (with scale func)
        }else if(this.x >= 0 - this.w){
            this.x -= 1 + 2*this.speed;
            //console.log(1+this.speed);
        }
        
        this.draw();
    };
    this.draw = function(){
        ctx.drawImage(imageAsteroid, this.x, this.y, this.w, this.h);
    };
}

function drawGameCredits(){
    ctx.fillStyle = "#fff";
    ctx.font = "20px Georgia";
    ctx.textAlign = "start";
    ctx.fillText("Credits: " + gameCredits, 1/32 * canvW, 1/8 * canvH);
}

function drawHearts(){
    heartString = "";
    for (var i = 0; i < hearts; i++) {
        heartString = heartString + " " + heartSymbol;
    }
    ctx.fillStyle = "#F00";
    ctx.font = "40px georgia";
    ctx.textAlign = "start";
    ctx.fillText(heartString, 1/4 * canvW, 1/8 * canvH + 10);
}

function shopScreenDraw(credits){
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvW, canvH);
    ctx.font = "20px Georgia";
    ctx.textAlign = "start";
    ctx.fillStyle = "#ddd";
    if(credits >= 50){
        ctx.fillText("( 1 ) - Refill Hearts", 1/8 * canvW, 3/8 * canvH);
    }
    if(credits >= 100){
        ctx.fillText("( 2 ) - Faster movement, Speed: " + pSpeed, 1/8 * canvW, 4/8 * canvH); //| add current speed
    }
    if(credits >= 150){
        ctx.fillText("( 3 ) - Slower asteroides / ugrade max hearts", 1/8 * canvW, 5/8 * canvH);
    }    
}

function buyOpt1(){
    //| refill hearts
    if(gameCredits >= 50){
        shopScreen = false;
    }
}
function buyOpt2(){
    //| up movement
    if(gameCredits >= 100){
        gameCredits -= 50;
        pSpeed++;
        shopScreen = false;
    }
}
function buyOpt3(){
    //| Upgrade max hearts
    if(gameCredits >= 150){
        shopScreen = false;
    }
}

function init(){
    astronaut = {
        w:astronautSize*astronautDim,
        h:astronautSize,
        x:2,
        y:(canvH/2 - 44/2), //|imageAstro.height
        update:function(dir){
            if(dir == "up" && this.y > 0 && !(gameOver)){
                //console.log(dir);
                this.y = this.y - 2;
            }else if(dir == "down" && this.y < canvH-this.h && !(gameOver)){
                //console.log(dir);
                this.y = this.y + 2;
            }
        },
        draw:function(){
            ctx.drawImage(imageAstro, astronaut.x, astronaut.y, astronaut.w, astronaut.h);
        }
    }
    starfield = {
        w:canvW,
        h:canvH,
        x:0,
        y:0,
        update:function(){
            this.x -= starfieldSpeed;
            if(this.x <= -canvW){
                this.x = 0;
                //console.log(this.x);
            }
            this.draw();
        },
        draw:function(){
            ctx.drawImage(imageStarfield, this.x, this.y, this.w, this.h);
            ctx.drawImage(imageStarfield, this.x + canvW, this.y, this.w, this.h);
            
        }
    }
    gameOverScreen = {
        w:canvW,
        h:canvH,
        x:0,
        y:0,
        fontSize:40,
        draw:function(){
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.font = this.fontSize + "px Georgia";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FF000020";
            ctx.fillText("GAME OVER", canvW/2, canvH/2 + 15); //| offset h bco. font
            ctx.font = this.fontSize/2 + "px Georgia";
            ctx.fillText("Score: " + String(gameScore), canvW/2, canvH/2 + 65)
            
        }
    }

    //asteroid = new Asteroid(canvW, rand(canvH), 1);
    scale = 1; //rand(scaleMax);                    //| scale at 1 with first ateroide
    spawnHeight = rand(canvH-asteroidSize*scale);   //| compute spawnH   
    asteroid = new Asteroid(canvW, spawnHeight);    //| generate new asteroid
    //asteroid.scale();                             //| change size to w*scale (with scale func) // will always be scale 1 with first asteroide
    
    restart.onclick = function (){
        shopScreen = false;
        gameOver = false; 
        gameOverScreenAnimationCounter = 0; 
        speed = 1;
        gameScore = 0;
        newScore = 0;
        gameCredits = 0;
        asteroid.x = -1000;
        asteroid.update();
        animate();
        //console.log("clicked");
        restartBtnActive = false;
        btnRestart.style.visibility = "hidden";
    }

}

function animate(){
    
    //console.log("tick");
    //| check hitbox betwen ateroid and asteronaut
    if(gameOverScreenAnimationCounter > 50){
        restartBtnActive = true;
        btnRestart.style.visibility = "visible";
        return;
    }
    if(
        asteroid.x <= astronaut.x + astronaut.w &&
        asteroid.y + asteroid.h >= astronaut.y &&
        asteroid.y <= astronaut.y + astronaut.h 
        ){ //| if astroide is past astronaut
        //*print game over
        //console.log("game over");
        gameOver = true;
        gameOverScreen.draw();
        gameOverScreenAnimationCounter++;
        //console.log(gameOverScreenAnimationCounter);
    }else if(shopScreen){
        shopScreenDraw(gameCredits);
        drawGameCredits();
        //console.log(gameCredits + ", " + shopScreen);
    }else if(!gameOver){
        //| Clear b4 painting a new frame
        ctx.clearRect(0, 0, canvW, canvH);
        
        //| draw objects
        starfield.update();
        asteroid.update();
        astronaut.draw();
        drawGameCredits();
        drawHearts();
    
        if(gameScore-newScore >= 10){
            newScore = gameScore;
            gameCredits++;
        }
        gameScore++;

        if(gameScore > oldGameScore + 250){
            //console.log(gameScore + ", " + oldGameScore + ", " + speed);
            oldGameScore = gameScore;
            speed += 0.5;
        }
        //ctx.fillRect(0, canvH/2, 1000, 1); //| test line, find center
    }

    //| Gameloop func
    requestAnimationFrame(animate);
    
}

//  ?                        keylistener   
var onoffUP = true;
var onoffDOWN = true;
document.addEventListener("keydown", keyEventDownHandler);
document.addEventListener("keyup", keyEventReleaseHandler);

function intervalUp(){
    //console.log("intervalUp");
    astronaut.update("up");
}
function intervalDown(){
    //console.log("intervalDown");
    astronaut.update("down");
}

function keyEventDownHandler(event){
    //console.log(event.keyCode);
    
    if (event.keyCode == 38 && onoffUP) {    //| Event for KeyUp
        keyIntervalUP = setInterval(intervalUp, 16 - 2 * pSpeed);
        onoffUP = !(onoffUP);
        //console.log(event.keyCode + " up" + ", onoffUP: " + onoffUP);
        
    } else if (event.keyCode == 40 && onoffDOWN) {  //| Event for KeyDown
        keyIntervalDOWN = setInterval(intervalDown, 16 - 2 * pSpeed);
        onoffDOWN = !(onoffDOWN);
        //console.log(event.keyCode + " down" + ", onoffDOWN: " + onoffDOWN); 
    }
    if(!(gameOver)){
        //| open shop
        if(event.keyCode == 32){
            shopScreen = !(shopScreen);
        }
        //| Buy 1, 2 or 3
        if(event.keyCode == 49){
            buyOpt1();
        }else if(event.keyCode == 50){
            buyOpt2();
        }else if(event.keyCode == 51){
            buyOpt3();
        }
    }

    if(event.keyCode == 13 && restartBtnActive){
        //console.log("space");
        restart.onclick();
    }
}

function keyEventReleaseHandler(event){

    if (event.keyCode == 38 && !(onoffUP)){
        clearInterval(keyIntervalUP);
        onoffUP = !(onoffUP);
        //console.log("release up" + ", onoffUP: " + onoffUP);
    } else if(event.keyCode == 40 && !(onoffDOWN)){
        clearInterval(keyIntervalDOWN);
        onoffDOWN = !(onoffDOWN);
        //console.log("release down" + ", onoffDOWN: " + onoffDOWN);
    }
}
/*
//| mouseEvents
window.addEventListener("mousemove", moveBoxEl);

function moveBoxEl(e){
    //console.log(e.clientX + " - " + e.clientY);
    var x = e.clientX - 50 + "px"; // 50px bs. wanted to center div under cursor
    var y = e.clientY + 50 + "px"; // 50px bc. otherwise user cannot click restart button, div was in the way
    boxEl.style.top = y;
    boxEl.style.left = x;
    boxEl.innerHTML = y + " - " + x;
}
*/
window.onload = function(){
    init();
    animate();
}

