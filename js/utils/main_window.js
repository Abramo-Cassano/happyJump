let app, player, jumpAt, background;
let keys = {};

let gravity = 1, direction = -1;
let power = 20;
let spikeSpeed = 3;
let spikes = [];
var timer = 100, range = 100;
let home_background, game_background, over, poster;
let textureButton, textureButton1, startButton, reTry;
let gameOver = false;
let playerSheet = {};
let startTime;
// Game Text
let text, highScoreText;
// Score
let score = 0, highScore = 0;

// back ground info
let bg01, bg02, bg03, bg04, bg05, bg06;
let bgX = 0;
let bgSpeed = -5;

var scene1 = new PIXI.Container();   // container for start screen
var scene2 = new PIXI.Container();   // container for play screen
var scene3 = new PIXI.Container();   // conatiner for end game
var enemy = new PIXI.Container();    // container for enemy objects


// sound 
const sound = new Howl({
    src: ['./sound/duck.mp3']
});

const jump = new Howl({
    src: ['./sound/jump.wav']
});

const died = new Howl({
    src: ['./sound/died.wav']
});

window.onload = function() {
    app = new PIXI.Application(
        {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x34e5eb,
            resizeTo: window
        }
    );
    document.body.appendChild(app.view);
    // Create sences and add to stage
    initialize_Start_Screen(scene1);
    initialize_Play_Screen(scene2);
    initialize_Over_Screen(scene3);

    app.stage.addChild(scene1);
    scene1.visible = true;

    app.stage.addChild(scene2);
    scene2.visible = false;

    app.stage.addChild(scene3);
    scene3.visible = false;
    app.stage.addChild(enemy);

    // app.loader
    //     .add("01", "/images/1.png")
    //     .add("02", "/images/2.png")
    //     .add("03", "/images/3.png")
    //     .add("04", "/images/4.png")
    //     .add("05", "/images/5.png");

}


function initialize_Start_Screen (parents)
{
    // Declare poster
    poster = new PIXI.Sprite.from("images/poster.png");
    poster.anchor.set(0.5);
    poster.x = app.screen.width / 2;
    poster.y = app.screen.height / 3;

    // Declare a start button
    textureButton = PIXI.Texture.from('./images/button.png');
    startButton = new PIXI.Sprite(textureButton);
    startButton.anchor.set(0.5);
    startButton.scale.set(0.75, 0.5);
    startButton.x = app.screen.width/2;
    startButton.y = app.screen.height/2 + poster.height;

    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on('pointerdown', onButtonDown); // click on button, the game will start

    // Start screen background
    home_background = new PIXI.Graphics();
    home_background.beginFill(0x34e5eb);
    home_background.drawRect(0,0,
                        app.screen.width,
                        app.screen.height);
    home_background.endFill();

    home_background.addChild(startButton);
    home_background.addChild(poster);
    parents.addChild(home_background);
}

function initialize_Play_Screen(parents)
{
    // Declare score
    text = new PIXI.Text('0',{fill: "#fafafa", fontFamily: "Impact", align : 'center', fontSize: 32, strokeThickness: 9});
    text.x = app.screen.width / 15;
    text.y = app.screen.height/ 15;  

    //Highscore Text
    highScoreText = new PIXI.Text('0', {fill: "#fafafa", fontFamily: "Impact", align : 'center', fontSize: 20, strokeThickness: 9});
    highScoreText.x = app.screen.width / 15;
    highScoreText.y = app.screen.height / 8;

    // Game background
    game_background = new PIXI.Graphics();
    game_background.beginFill(0x34e5eb);
    game_background.drawRect(0,0,
                        app.screen.width,
                        app.screen.height);
    game_background.endFill();

    //Platform
    background = new PIXI.Graphics();
    background.beginFill(0xffffff);
    background.lineStyle(3, 0xcccccc, 1);
    background.drawRect(0, app.screen.height / 2,
                        app.screen.width,
                        app.screen.height);
    background.endFill();
    
    parents.addChild(game_background);
    parents.addChild(background);
}

function initialize_Over_Screen(parents)
{
    // Declare game over notification
    over = new PIXI.Sprite.from("images/gameover.png");
    over.anchor.set(0.5);
    over.x = app.screen.width / 2;
    over.y = app.screen.height / 4;

    
    // Declare a retry button
    textureButton1 = PIXI.Texture.from('./images/replay.png');
    reTry = new PIXI.Sprite(textureButton1);
    reTry.anchor.set(0.5);
    reTry.scale.set(0.5, 0.5);
    reTry.x = app.screen.width/2;
    reTry.y = app.screen.height/3 + over.height;
    
    reTry.interactive = true;
    reTry.buttonMode = true;
    reTry.on('pointerdown', reTryButtonDown); // click on button, the game will start

    parents.addChild(over);
    parents.addChild(reTry);
}


function doneLoading(e) {
    bg01 = createBg(app.loader.resources["01"].texture);
    bg02 = createBg(app.loader.resources["02"].texture);
    bg03 = createBg(app.loader.resources["03"].texture);
    bg05 = createBg(app.loader.resources["05"].texture);

    let tl = new PIXI.TilingSprite(app.loader.resources["03"].texture, app.screen.width, app.screen.height);
    tl.position.set(0, -app.screen.height/30);
    scene2.addChild(tl);
    bg04 = tl;

    createPlayerSheet();
    createPlayer();

    scene2.addChild(text);
    scene2.addChild(highScoreText);

    app.ticker.add(gameLoop);
}

function createBg(texture) {
    let tiling = new PIXI.TilingSprite(texture, app.screen.width, app.screen.height);
    // let tiling = new PIXI.TilingSprite(texture, 1920, 1080);

    tiling.position.set(0, 0);
    
    scene2.addChild(tiling);
    return tiling;
}

function updateBg() {
    bgX = (bgX + bgSpeed);
    bg01.tilePosition.x = bgX/10;
    bg02.tilePosition.x = bgX/8;
    bg03.tilePosition.x = bgX/4;
    bg04.tilePosition.x = bgX/3;
    bg05.tilePosition.x = bgX/3;

}


function createPlayerSheet() {
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["DinoSpritesdoux"].url);
    let w = 24;
    let h = 24;
    
    playerSheet["standing"] = [
    new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, 0, w, h))
    ];
    playerSheet["dead"] = [
    new PIXI.Texture(ssheet, new PIXI.Rectangle(16 * w, 0, w, h))
    ];
    playerSheet["running"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(6 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(7 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(8 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(9 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(10 * w, 0, w, h))
    ];
    playerSheet["jumping"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(17 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(18 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(19 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(20 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(21 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(22 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(23 * w, 0, w, h))
    ];
}

function createPlayer() {
    player = new PIXI.AnimatedSprite(playerSheet.standing);
    //player.anchor.set(0.5);
    player.animationSpeed = .5;
    player.loop = false;
    player.x = app.view.width / 2;
    player.y = app.view.height / 2;
    player.scale.set(2, 2);
    scene2.addChild(player);
    player.play();
}

//function jump
let jumping = false;

function playerJump() {  
    if (jumping) return;
    jumping = true;
    jump.play();
    let time = 0;
  
    const tick = deltaMs => {
      const jumpHeight = (-gravity / 2) * Math.pow(time, 2) + power * time;
    //   console.log(jumpHeight)
  
      if (jumpHeight < 0) {
        jumping = false;
        PIXI.Ticker.shared.remove(tick);
        player.y = jumpAt;
        return;
      }
      if (!player.playing) {
        player.textures = playerSheet.jumping;
        player.play();
      }
      
      player.y = jumpAt + (jumpHeight * direction);
      time += deltaMs;
    }
  
    PIXI.Ticker.shared.add(tick);
}

//Game Loop
function gameLoop() {
    updateBg();
    if (!player.playing) {
        player.textures = playerSheet.running;
        player.play();
    }
    if (keys[32] == true) {
        playerJump();
    }
    timer--;
    if (timer <= 0) {
        timer = Math.floor(Math.random() * 51) + range;
        let spike = createSpikes();
        spikes.push(spike);

        // console.log(rectIntersects(player, spike));

        if (spikeSpeed <= 10) {
            spikeSpeed += 0.1;
            spikeSpeed.toFixed(2);
        }
        if (range >= 20)
            range -= 1;
    }
    let milliSeconds = new Date() - startTime;

    //console.log(Math.round(milliSeconds/1000) + " seconds");
    score = Math.round(milliSeconds/1000 * spikeSpeed/4);
    text.text = 'Score: ' + (score).toString();

    if (score > highScore) {
        highScore = score;
    }

    highScoreText.text = 'HighScore: ' + highScore.toString();
    moveSpike();

    if (gameOver) {

        sound.stop();
        died.play();
        score = 0;
        gameOver = false;
        app.ticker.stop();
        scene3.visible = true;
        console.log("in gameloop");
        
        gravity = 1, direction = -1;
        power = 20;
        spikeSpeed = 3;
        spikes = [];
        timer = 100, range = 100;

        jumpAt = app.view.height / 2;
        //Mouse click interactions
        app.view.addEventListener('click', playerJump);
        window.addEventListener("keydown", function(e) {
            keys[e.keyCode] = true;
        });
        window.addEventListener("keyup", function(e) {
            keys[e.keyCode] = false;
        });

    }
}

//Spawner
function createSpikes() {
    var val = Math.floor(Math.random() * 3) + 1;
    let spike;
    //Random sprites
    switch(val) {
        case 1:
            spike = new PIXI.Sprite.from("images/cactus1.png");
            break;
        case 2:
            spike = new PIXI.Sprite.from("images/cactus2.png");
            break;
        case 3:
            spike = new PIXI.Sprite.from("images/cactus3.png");
            break;
    }
    //spike.anchor.set(0.5);
    spike.scale.set(0.2, 0.2);
    spike.x = app.screen.width;
    spike.y = app.screen.height / 2;
    spike.speed = spikeSpeed;

    // scene2.addChild(spike);
    enemy.addChild(spike);
    
    return spike;
}

//Move spikes
function moveSpike() {
    for (let i = 0; i < spikes.length; i++) {
        spikes[i].position.x -= spikes[i].speed * app.ticker.deltaTime;

        if (rectIntersects(player, spikes[i])) {
            player.textures = playerSheet.dead;
            player.play();
            gameOver = true;
        }

        if (spikes[i].position.x < 0) {
            spikes[i].dead = true;
            enemy.removeChildAt(i);
            spikes.splice(i, 1);
        }
    }
}

function rectIntersects(a, b) {
    let aBox = a.getBounds();
    let bBox = b.getBounds();
    aBox.width -= 10;
    aBox.height -= 20;
    bBox.height -= 10;
    bBox.width -= 10;
    return (aBox.x + aBox.width > bBox.x && 
            aBox.x < bBox.x + bBox.width &&
            aBox.y + aBox.height > bBox.y &&
            aBox.y < bBox.y + bBox.height);
}

window.onresize = function(){
    const parent = app.view.parentNode;
   
	// Resize the renderer
	app.renderer.resize(parent.clientWidth, parent.clientHeight);
};

// Calling needed functions
function onButtonDown() {
    app.start();
    this.interactive = false;
    scene1.visible = false;  // hide scene 1 
    scene2.visible = true;   // turn on scene 2

    startTime = new Date();  // using this variable for caculating score
    app.loader
        .add("01", "/images/1.png")
        .add("02", "/images/2.png")
        .add("03", "/images/3.png")
        .add("04", "/images/4.png")
        .add("05", "/images/5.png")
        .add("DinoSpritesdoux", "images/dinoCharactersVersion1.1/sheets/DinoSprites - doux.png");

    app.loader.load(doneLoading); // Load assets

    
    jumpAt = app.view.height / 2;
    //Mouse click interactions
    app.view.addEventListener('click', playerJump);
    window.addEventListener("keydown", function(e) {
        keys[e.keyCode] = true;
    });
    window.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });
    sound.play();
}

// Replay-button's function
function reTryButtonDown(){
    sound.play();
    startTime = new Date();
    app.ticker.start();
    scene3.visible = false;
    enemy.removeChildren();
}