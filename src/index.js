import Phaser from "phaser";
import assets from "./assets";

const game = new Phaser.Game({
	type: Phaser.AUTO,
	parent: "phaser-example",
	width: 800,
	height: 600,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
			debug: false,
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
});

function preload() {
	this.load.image("sky", assets.sky);
	this.load.image("star", assets.star);
	this.load.image("platform", assets.platform);
	this.load.image("star", assets.star);
	this.load.image("bomb", assets.bomb);
	this.load.spritesheet("patto", assets.patto, {
		frameWidth: 260,
		frameHeight: 280,
	});
}

let platforms;
let player;
let stars;
let cursors;
let score = 0;
let scoreText;
let bombs;
let gameOver = false;

function create() {
	this.add.image(400, 300, "sky");
	// platforms
	platforms = this.physics.add.staticGroup();
	platforms.create(400, 568, "platform").setScale(2).refreshBody(); // refreshBody because scaled by 2 it's size
	platforms.create(600, 400, "platform");
	platforms.create(50, 250, "platform");
	platforms.create(750, 220, "platform");

	// player
	player = this.physics.add
		.sprite(100, 50, "patto")
		.setScale(0.3)
		.setCircle(110, 25, 55);
	player.setBounce(0.1); // when collide, amount of bounce
	player.setCollideWorldBounds(true); // it won't let player go off screen

	// player animations
	this.anims.create({
		key: "left",
		frames: this.anims.generateFrameNumbers("patto", { start: 0, end: 1 }),
		frameRate: 10,
		repeat: -1,
	});

	this.anims.create({
		key: "idleR",
		frames: this.anims.generateFrameNumbers("patto", { start: 2, end: 3 }),
		frameRate: 3,
		repeat: -1,
	});

	this.anims.create({
		key: "idleL",
		frames: this.anims.generateFrameNumbers("patto", { start: 8, end: 9 }),
		frameRate: 3,
		repeat: -1,
	});

	this.anims.create({
		key: "right",
		frames: this.anims.generateFrameNumbers("patto", { start: 4, end: 5 }),
		frameRate: 10,
		repeat: -1,
	});

	this.anims.create({
		key: "jumpR",
		frames: [{ key: "patto", frame: 6 }],
	});
	this.anims.create({
		key: "jumpL",
		frames: [{ key: "patto", frame: 7 }],
	});
	this.physics.add.collider(player, platforms); // adds collision between player and platforms

	// stars
	stars = this.physics.add.group({
		key: "star",
		repeat: 11,
		setXY: { x: 12, y: 0, stepX: 70 },
	});
	stars.children.iterate(function (child) {
		child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4)); // bounce when star collides with platform randomize between 0.2 and 0.4
	});
	this.physics.add.collider(stars, platforms); // add collider between stars and platforms
	this.physics.add.overlap(player, stars, collectStar, null, this); // when player overlap star, call collectStar function

	// keyboard behaviours
	cursors = this.input.keyboard.createCursorKeys();

	// score
	scoreText = this.add.text(16, 16, "Score: 0", {
		fontSize: "32px",
		fill: "#000",
	});

	//bombs
	bombs = this.physics.add.group();
	this.physics.add.collider(bombs, platforms);
	this.physics.add.collider(player, bombs, hitBomb, null, this);
}

let lastKey = "right";
function update() {
	if (cursors.left.isDown) {
		lastKey = "left";
		player.setVelocityX(-160);
		player.anims.play("left", true);
	} else if (cursors.right.isDown) {
		lastKey = "right";
		player.setVelocityX(160);
		player.anims.play("right", true);
	} else {
		player.setVelocityX(0);
		player.anims.play(`idle${getFirstLetterLastKey()}`, true);
	}

	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-330);
	}

	if (!player.body.touching.down) {
		if (lastKey == "left") player.anims.play("jumpL");
		else player.anims.play("jumpR");
	}
}

function collectStar(player, star) {
	star.disableBody(true, true);
	score += 10;
	scoreText.setText("Score: " + score);

	if (stars.countActive(true) === 0) {
		stars.children.iterate(function (child) {
			child.enableBody(true, child.x, 0, true, true);
		});

		for (let qttBombs = 0; qttBombs < Math.round(score / 170); qttBombs++) {
			const x =
				player.x < 400
					? Phaser.Math.Between(400, 800)
					: Phaser.Math.Between(0, 400);
			const bomb = bombs.create(x, 16, "bomb");
			bomb.setBounce(1);
			bomb.setCollideWorldBounds(true);
			bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		}
	}
}

function hitBomb(player, bomb) {
	player.angle = 180;
	this.physics.pause();
	player.setTint(0xff0000);
	player.anims.play(`jump${getFirstLetterLastKey()}`);
	gameOver = true;
}

function getFirstLetterLastKey() {
	const _lastKey = lastKey || "r";
	return _lastKey.substr(0, 1).toUpperCase();
}
