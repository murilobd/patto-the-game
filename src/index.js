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
	// this.load.image("star", "assets/star.png");
	// this.load.image("bomb", "assets/bomb.png");
	this.load.spritesheet("patto", assets.patto, {
		frameWidth: 260,
		frameHeight: 280,
	});
}

let platforms;
let player;
let cursors;

function create() {
	this.add.image(400, 300, "sky");
	// platforms
	platforms = this.physics.add.staticGroup();
	platforms.create(400, 568, "platform").setScale(2).refreshBody(); // refreshBody because scaled by 2 it's size
	platforms.create(600, 400, "platform");
	platforms.create(50, 250, "platform");
	platforms.create(750, 220, "platform");

	player = this.physics.add.sprite(100, 50, "patto").setScale(0.3);
	player.setBounce(0.1); // when collide, amount of bounce
	player.setCollideWorldBounds(true); // it won't let player go off screen
	this.anims.create({
		key: "left",
		frames: this.anims.generateFrameNumbers("patto", { start: 0, end: 1 }),
		frameRate: 10,
		repeat: -1,
	});

	this.anims.create({
		key: "idle",
		frames: this.anims.generateFrameNumbers("patto", { start: 2, end: 3 }),
		frameRate: 10,
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
		frameRate: 20,
	});
	this.anims.create({
		key: "jumpL",
		frames: [{ key: "patto", frame: 7 }],
		frameRate: 20,
	});

	this.physics.add.collider(player, platforms); // adds collision between player and platforms

	cursors = this.input.keyboard.createCursorKeys();
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
		player.anims.play("idle");
	}

	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-330);
	}

	if (!player.body.touching.down) {
		if (lastKey == "left") player.anims.play("jumpL");
		else player.anims.play("jumpR");
	}
}
