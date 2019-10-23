var serial; //variable to hold an instance of the serial port library
var portName = 'COM4'; //fill in with YOUR port

var inData; //a variable to store incoming data
var sensor1, sensor2; //variables for each of my incoming sensor values - name these whatever you want

function setup() {

  serial = new p5.SerialPort(); //a new instance of serial port library

  //set up events for serial communication
  serial.on('connected', serverConnected);
  serial.on('open', portOpen);
  serial.on('data', serialEvent);
  serial.on('error', serialError);

  //open our serial port
  serial.open(portName);
  
  createCanvas(canvasWidth, canvasHeight);
  noCursor();
}

/////////////////////////////////////////////// Game Part
var canvasWidth = 600;
var canvasHeight = 400;
var score = 0;
//player
var player = {
	color : "#FFF",
	x : 280,
	width : 40,
	y : 355,
	height: 40,
	draw : function(){
		image(img_player, this.x, this.y, this.width, this.height);
    },
}


//bullet
var bullets = [];
function Bullet(I){
	I.active = true;
	I.x = player.x + player.width/2;
	I.y = player.y +  player.height/2;
	I.width = 3;
	I.height = 6;
	I.yVelocity = 5;
	I.inBounds = function(){
		return I.x >= 0 && I.y >= 0 && I.x < canvasWidth - I.width && I.y < canvasHeight - I.height;
	}
	I.update = function(){
		I.active  = I.active && I.inBounds();
		I.y -= I.yVelocity;
	}
	I.draw = function(){
		image(img_bullet, I.x, I.y, I.width, I.height);
	}
	return I;
}


//enemies
var enemies  = [];
function Enemy(I){
	I.active = true;
	I.x = Math.random() * canvasWidth;
	I.y = 0;
	I.width = 30;
	I.height = 30;
	I.yVelocity = 2;
	I.inBounds = function(){
		return I.x >= 0 && I.y >= 0 && I.x < canvasWidth - I.width && I.y < canvasHeight - I.height;
	}
	I.draw = function(){
		image(img_enemy, I.x, I.y, I.width, I.height);
	}
	I.update= function(){
		I.active = I.active && I.inBounds();
		I.y += I.yVelocity;
	}
	return I;
}


//collision function

function collision(enemy, bullet){
	return bullet.x + bullet.width >= enemy.x && bullet.x < enemy.x + enemy.width &&
			bullet.y + bullet.height >= enemy.y && bullet.y < enemy.y + enemy.height;
}
//canvas functions 
var img_enemy, img_player, img_bullet;
var sound_enemy_dead, sound_player_dead, sound_bullet, sound_game_start;

function preload(){
    
    //load images
	img_enemy = loadImage("images/enemy.png");
	img_player = loadImage("images/player.png");
	img_bullet = loadImage("images/bullet.png");
    
    //load sounds
    sound_enemy_dead = loadSound("sounds/enemy_dead.wav"); //Creative Commons 0 License - https://freesound.org/people/qubodup/sounds/332056/
    sound_bullet = loadSound("sounds/bullet.wav"); //Creative Commons 0 License - https://freesound.org/people/cabled_mess/sounds/350924/
    sound_player_dead = loadSound("sounds/player_dead.wav"); //Creative Commons 0 License - https://freesound.org/people/n_audioman/sounds/276362/
    sound_game_start = loadSound("sounds/game_start.wav") //Creative Commons 0 License - https://freesound.org/people/GameAudio/sounds/220209/
    
    //adjust sounds volumes if necessary
    sound_bullet.setVolume(0.2);
    
}   


//Sensor Value Input from Arduino 
var sensor1; // variables for each of my incoming sensor values


function draw(){
	fill(255);
	clear();
	background("#000");
	text("score : " + score, 10, 10);
	fill(player.color);
  
   var newValue = map(sensor1, 0, 1023, 0, 255);
  
  
  //Movement of player ////////////////////////////////////
	if(newValue){
		if(player.x-5 >= 0)
			player.x -= 5;
		else
			player.x = 0;
	}
	if(keyIsDown(RIGHT_ARROW)){
		if(player.x + 5 <= canvasWidth-player.width)
			player.x += 5;
		else
			player.x = canvasWidth - player.width;
	}
	if(keyIsDown(32)){
		bullets.push(Bullet({}));
        sound_bullet.play();
	}
  ////////////////////////////////////////////////

	player.draw();

	bullets = bullets.filter(function(bullet){
		return bullet.active;
	});
	bullets.forEach(function(bullet){
		bullet.update();
		bullet.draw();
	});

	if(Math.random()<0.05){
		enemies.push(Enemy({}));
	}
	enemies = enemies.filter(function(enemy){
		return enemy.active;
	});
	enemies.forEach(function(enemy){
		enemy.update();
		enemy.draw();
	});

	bullets.forEach(function(bullet){
		enemies.forEach(function(enemy){
			if(collision(enemy, bullet)){
				enemy.active = false;
				bullet.active = false;
				score++;
                sound_enemy_dead.play();
			}
		});
	});

	enemies.forEach(function(enemy){
		if(collision(enemy, player)){
			enemy.active = false;
			noLoop();
            sound_player_dead.play();
			textSize(40);
			text("GAME OVER", 180, 200);
		}
	});
}

///////////////////////////////////////////Serial stuff

//all my callback functions here:
//callback functions are useful for giving feedback
function serverConnected(){
	console.log('connected to the server');
}

function portOpen(){
  console.log('the serial port opened!');
}

//THIS IS WHERE WE ACTUALLY RECEIVE DATA!!!!!!
//make sure you're reading data based on how you're sending from arduino
function serialEvent(){
  //THIS READS BINARY - serial.read reads from the serial port, Number() sets the data type to a number
	// inData = Number(serial.read());  //reads data as a number not a string

  //THIS READS ASCII
  inData = serial.readLine(); //read until a carriage return

  //best practice is to make sure you're not reading null data
  if(inData.length > 0){
    //split the values apart at the comma
    //var numbers = split(inData, ',');

    //set variables as numbers
    sensor1 = Number(numbers[0]);
    //sensor2 = Number(numbers[1]);
  }

  console.log(sensor1 );//+ ", " + sensor2);
}

function serialError(err){
  console.log('something went wrong with the port. ' + err);
}


// get the list of ports:
function printList(portList) {
 // portList is an array of serial port names
 for (var i = 0; i < portList.length; i++) {
 // Display the list the console:
 print(i + " " + portList[i]);
 }
}