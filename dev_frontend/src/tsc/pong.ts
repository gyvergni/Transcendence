//################ imports ############
import * as BABYLON from "babylonjs";
import * as earcut from "earcut";
(window as any).earcut = earcut;

import uiManager from "./main.js";
import {animateContentBoxIn} from "./animations.js";
import {setContentView} from "./views.js";
import {PlayerConfig, MatchSetup, TournamentManager, AIDifficulty} from "./models.js";
import {setupTournamentEndScreen, setupTournamentWaitingRoom} from "./t-waitingscreen.js";

//################ customization variables ###########
import { getSettings, resetSettings } from "./settings.js"

let paddle_size: number;
let PaddleColor: string;
let PaddleSpeed: number;

let BallSize: number;
let BallColor: string;
let BallSpeed: number;
let BallShape: string;


function setUpSettings() {
	const gameSettings = getSettings(); 
	paddle_size = gameSettings.paddleSize;
	PaddleColor = gameSettings.paddleColor;
	PaddleSpeed = gameSettings.paddleSpeed;

	BallSize = gameSettings.ballSize;
	BallColor = gameSettings.ballColor;
	BallSpeed = gameSettings.ballSpeed;
	BallShape = gameSettings.ballShape;
}


const BallSpeedLimit = 30;
// How much speed increases on each paddle hit (additive)
const BallSpeedIncrement = 0.5;
// Chance (0..1) that the hard AI will NOT aim for the corner (to surprise)
const AICornerSurpriseChance = 0.12;

// ######### utility #########
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

// ################ Interfaces for clarity ############
interface PlayerType {
	update(): void;
	config: PlayerConfig;
	opponent: PlayerType | null;
	paddle: Paddle;
}

// ################ Classes ####################

class Paddle {
	mesh: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene, x: number) {
        this.mesh = BABYLON.MeshBuilder.CreateBox("Paddle", 
            {width: 0.5, height: 0.5, depth: paddle_size}, scene);
        this.mesh.position.set(x, 0.5, 0);
    }

    move(up: boolean, down: boolean) {
        if (up && this.mesh.position.z < 5)
            this.mesh.position.z += 0.1 * (PaddleSpeed/10);
        if (down && this.mesh.position.z > -5)
            this.mesh.position.z -= 0.1 * (PaddleSpeed/10);
    }

	get topZ() {
    return this.mesh.position.z + paddle_size / 2;
	}

	get bottomZ() {
	    return this.mesh.position.z - paddle_size / 2;
	}

	get z() {
	    return this.mesh.position.z;
	}

	set z(val) {
	    this.mesh.position.z = val;
	}

}

class Clock {
	gameTime: number = 0; //total game time in seconds
	gameTimerStart: number = 0; //timestamp when game started or resumed
	
	pointMaxTime: number = 0; //total point time in seconds
	pointCurrentTime: number = 0;
	pointTimerStart: number = 0; //timestamp when point started

	ballDelayStart: number = 0; //timestamp when ball delay started

	start() 
	{
		this.gameTimerStart = new Date().getTime();
		this.pointTimerStart = new Date().getTime();
	}
	updateGameTimer()
	{
		this.gameTime += new Date().getTime() - this.gameTimerStart;
		this.gameTimerStart = new Date().getTime();
	}
	updatePointTimer()
	{
		const newTime = new Date().getTime() - this.pointTimerStart;
		this.pointCurrentTime += newTime;
		if (this.pointCurrentTime > this.pointMaxTime)
			this.pointMaxTime = this.pointCurrentTime;
		this.pointTimerStart = new Date().getTime();
	}

	pauseTimer()
	{
		this.updateGameTimer();
		this.updatePointTimer();
	}

	resumeTimer()
	{
		this.gameTimerStart = new Date().getTime();
		this.pointTimerStart = new Date().getTime();
	}
}

class Ball {
	mesh: BABYLON.Mesh
	speed: number;
    dirX: number = 0;
    dirZ: number = 0;
    startDelay: number = 0;
	score1: number = 0;
	score2: number = 0;
	pTimer: number = 0;
	particleSystem: any;
	clock: Clock;

	bool_startGameTimer: boolean = true; //to control match game Timer

    constructor(scene: BABYLON.Scene, clock: Clock) {
		if (BallShape === "square")
			this.mesh = BABYLON.MeshBuilder.CreateBox("Ball", {width: BallSize * 0.1, height: BallSize * 0.1, depth: BallSize * 0.1}, scene);
		else
        	this.mesh = BABYLON.MeshBuilder.CreateSphere("Ball", {diameter: BallSize * 0.1}, scene);
        this.mesh.position.set(0, 0.5, 0);
		
		this.score1 = 0;
		this.score2 = 0;
		this.particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);

        this.speed = BallSpeed;
		this.createScoreParticles(scene);
        this.resetDirection();
        //this.startDelay = 0;
		this.pTimer = 0;
		this.clock = clock;
    }

	delayBallStart()
	{
		setTimeout(() => {
		}, 3000);
	}

    resetDirection() {
        let randdir = getRandomInt(7);
        randdir = (randdir <= 3) ? -randdir : randdir - 3;
        this.dirZ = randdir;

        const leftright = getRandomInt(2);
        const dirX = Math.sqrt(this.speed * this.speed - this.dirZ * this.dirZ);
        this.dirX = leftright === 1 ? -dirX : dirX;
    }

    update(p_left : Paddle, p_right : Paddle) {
        
		if (this.bool_startGameTimer)
		{
			this.delayBallStart();
			this.bool_startGameTimer = false;
		}
		// Bounce on walls
        if (this.mesh.position.z >= 5 || this.mesh.position.z <= -5)
            this.dirZ = -this.dirZ;

        // Paddle collision
        this.checkPaddleCollision(p_left, -10, -9.5);
        this.checkPaddleCollision(p_right, 10, 9.5);

        // Score and reset
        if (this.mesh.position.x <= -11) {
			this.score2 += 1;
			this.popScoreParticles(this.mesh.position);
			this.reset();
		}
		else if (this.mesh.position.x >= 11) {
			this.score1 += 1;
			this.popScoreParticles(this.mesh.position);
            this.reset();
		}

		if (new Date().getTime() - this.clock.ballDelayStart == 500) 
			this.particleSystem.stop();

		if (new Date().getTime() - this.clock.ballDelayStart >= 3000)
		{
			this.mesh.position.x += this.dirX / 100;
            this.mesh.position.z += this.dirZ / 100;
		}

        // Delay start version frames
        /* if (this.startDelay < 120) {
			this.startDelay++;
			if (this.startDelay == 120)
				this.clock.
		}
		if (this.startDelay == 30)
			this.particleSystem.stop();
        if (this.startDelay === 120) {
            this.mesh.position.x += this.dirX / 100;
            this.mesh.position.z += this.dirZ / 100;
        } */
    }

    checkPaddleCollision(paddle: Paddle, hitX: number, limitX: number) {
        const pz = paddle.mesh.position.z;
        const bz = this.mesh.position.z;
        const bx = this.mesh.position.x;

        const hit = (limitX < hitX) ? (bx <= hitX && bx >= limitX) : (bx >= hitX && bx <= limitX);
        const within = (bz > (pz - paddle_size/2)) && (bz < (pz + paddle_size/2));

        if (hit && within && ((hitX < 0 && this.dirX < 0) || (hitX > 0 && this.dirX > 0))) {
			// Increment speed on paddle hit (steady growth), up to BallSpeedLimit
			if (this.speed < BallSpeedLimit)
				this.speed = Math.min(this.speed + BallSpeedIncrement, BallSpeedLimit);
            // Calculate impact: -1 (bottom) to 1 (top)
            const impact = (bz - pz) / (paddle_size / 2);
            // Clamp impact to [-1, 1]
            const clampedImpact = Math.max(-1, Math.min(impact, 1));
            // Max angle from X axis (70° from perpendicular = 20° from X axis)
            const maxAngle = Math.PI / 2 - Math.PI / 9; // 70° from perpendicular
            const angle = clampedImpact * maxAngle;
            // Direction: sign of dirX
            const signX = hitX > 0 ? -1 : 1;
            // Calculate new dirZ, clamp to max angle
            let newDirZ = this.speed * Math.sin(angle);
            // Ensure dirZ sign matches impact (top hit = positive, bottom hit = negative)
            if (clampedImpact === 0)
				newDirZ = 0;
            // Calculate dirX to preserve total speed
            let newDirX = signX * Math.sqrt(Math.max(this.speed * this.speed - newDirZ * newDirZ, 0));
            this.dirX = newDirX;
            this.dirZ = newDirZ;
            this.pTimer = 1;
            // Debug
            console.log(`Ball speed: ${this.speed}, dirX: ${this.dirX}, dirZ: ${this.dirZ}, impact: ${impact}`);
        }
    }

    reset() {
		this.clock.updateGameTimer();
		this.clock.updatePointTimer();
		this.clock.pointCurrentTime = 0;
        this.mesh.position.set(0, 0.5, 0);
        this.speed = BallSpeed;
        this.resetDirection();
        this.clock.ballDelayStart = new Date().getTime();
		this.delayBallStart();
    }

	createScoreParticles(scene: BABYLON.Scene) {
		//texture of particles
		this.particleSystem.particleTexture = new BABYLON.Texture("assets/game/textures/flare.png", scene);

		// Size of each particle (random between...
		this.particleSystem.minSize = 0.1;
    	this.particleSystem.maxSize = 0.3;
    	// Life time of each particle (random between...
    	this.particleSystem.minLifeTime = 0.2;
    	this.particleSystem.maxLifeTime = 0.8;

		// Emission rate
    	this.particleSystem.emitRate = 2000;

		// Speed
    	this.particleSystem.minEmitPower = 5;
    	this.particleSystem.maxEmitPower = 6;
    	this.particleSystem.updateSpeed = 0.005;

	}

	popScoreParticles(pos: BABYLON.Vector3) {
	
		//set direction left paddle
		if (pos.x > 0) {
			// color
			this.particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
			this.particleSystem.emitter = new BABYLON.Vector3(-11, 1, 0);
			var BoxEmitterLeft = this.particleSystem.createBoxEmitter(new BABYLON.Vector3(6, 1, -2), new BABYLON.Vector3(6, -1, 2), new BABYLON.Vector3(-5, 0, 12), new BABYLON.Vector3(-5, 6, -12));
		}
		// for right paddle
		else {
			// color
			this.particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
			this.particleSystem.emitter = new BABYLON.Vector3(11, 1, 0);
			var BoxEmitterRight = this.particleSystem.createBoxEmitter(new BABYLON.Vector3(-6, -2, 2), new BABYLON.Vector3(-6, 1, -2), new BABYLON.Vector3(5, 0, 12), new BABYLON.Vector3(5, 6, -12));
		}

		// Start the particle system
    	this.particleSystem.start();
	}

	calculateDistToBorder(): number {
        const bx = this.mesh.position.x;
        return this.dirX < 0 ? 10 + bx : 10 - bx;
    }

    calculateDistToWall(): number {
        const bz = this.mesh.position.z;
        return this.dirZ < 0 ? 5 + bz : 5 - bz;
    }
}

class Player implements PlayerType {
	keys: Record<string, boolean> = {};
	upKey: string;
	downKey: string;
	paddle: Paddle;
	config: PlayerConfig;
	opponent: PlayerType | null = null;

	constructor(paddle: Paddle, upKey: string, downKey: string, config: PlayerConfig) {
		this.paddle = paddle;
		this.upKey = upKey.toLowerCase();
		this.downKey = downKey.toLowerCase();
		this.keys = { [this.upKey]: false, [this.downKey]: false };
		this.config = config;

		window.addEventListener("keydown", e => {
			const key = e.key.toLowerCase();
			if (key === this.upKey) this.keys[this.upKey] = true;
			if (key === this.downKey) this.keys[this.downKey] = true;
		});
		window.addEventListener("keyup", e => {
			const key = e.key.toLowerCase();
			if (key === this.upKey) this.keys[this.upKey] = false;
			if (key === this.downKey) this.keys[this.downKey] = false;
		});
	}

	update() {
		this.paddle.move(this.keys[this.upKey], this.keys[this.downKey]);
	}
}


class AIPlayer implements PlayerType {
	paddle: Paddle;
	ball: Ball;
	side: "left" | "right";
	difficulty: AIDifficulty;
	reactionTime: number;
	padTargetZ: number;
	padRefZ: number = 0;
	movement_up: boolean = false;
	movement_down: boolean = false;
	config: PlayerConfig;
	opponent: PlayerType | null = null;
	ballDirZIntercept: number = 0;
	ballDirXIntercept: number = 0;

	constructor(paddle: Paddle, ball: Ball, side: "left" | "right", config: PlayerConfig) {
		this.paddle = paddle;
		this.ball = ball;
		this.side = side;
		this.difficulty = config.difficulty;
		this.reactionTime = 1;
		this.padTargetZ = 0;
		this.config = config;
	}

	is_movingToAI(): boolean {
		return (this.side === "left" && this.ball.dirX < 0) || (this.side === "right" && this.ball.dirX > 0);
	}
	private frameCounter = 0;
	update() {
		this.frameCounter++;
		if (this.frameCounter >= this.reactionTime * 60) {
			this.update_target();
			this.frameCounter = 0;
		}
		// Smooth movement: compare target to actual paddle z and move accordingly
		const currentZ = this.paddle.z;
		const diff = this.padTargetZ - currentZ;
		const eps = 0.15; // deadzone to avoid flicker
		if (diff > eps) {
			this.movement_up = true;
			this.movement_down = false;
			this.paddle.move(true, false);
		} else if (diff < -eps) {
			this.movement_up = false;
			this.movement_down = true;
			this.paddle.move(false, true);
		} else {
			// close enough
			this.movement_up = false;
			this.movement_down = false;
		}
	}

	update_target() {
		if (this.difficulty === "easy")
			this.behaviour_easy();
		else if (this.difficulty === "medium")
			this.behaviour_medium();
		else
			this.behaviour_hard();
	}

	behaviour_easy() {
		if (!this.is_movingToAI()) {
			this.padTargetZ = 0;
			return;
		}
		// simple follow with some noise
		this.padTargetZ = this.ball.mesh.position.z + (Math.random() - 0.5) * (paddle_size * 0.3);
	}

	behaviour_medium() {
		if (!this.is_movingToAI()) {
			this.padTargetZ = 0;
			return;
		}
		// Predict where ball will intercept this paddle, with some randomness
		this.padTargetZ = this.predictZ() + (Math.random() - 0.5) * 1.0;
	}

	behaviour_hard() {
		if (!this.is_movingToAI()) {
			this.padTargetZ = 0;
			return;
		}

		const maxBounces = 3;
		// pick the corner opposite to where the opponent currently is (if available)
		const otherCorner = 4.9;
		const invertedCorner = -4.9;
		let preferredCorner = 4.9;
		try {
			const oppZ = this.opponent?.paddle?.z ?? 0;
			preferredCorner = oppZ >= 0 ? invertedCorner : otherCorner;
		} catch (e) {
			preferredCorner = 4.9;
		}
		// Order corners so preferredCorner is tried first
		const corners = [preferredCorner, preferredCorner === otherCorner ? invertedCorner : otherCorner];

		// Surprise chance: occasionally don't attempt a corner shot so AI is less predictable
		if (Math.random() < AICornerSurpriseChance) {
			// fall back to interception behavior sometimes
			this.padTargetZ = this.predictZ();
			return;
		}
		const myX = this.side === 'left' ? -10 : 10;
		const x_target = this.side === 'left' ? 10 : -10;
		const speed = this.ball.speed;
		const signOut = this.side === 'left' ? 1 : -1; // outgoing dirX sign after hitting this paddle

		// time until ball reaches our paddle
		const tToMy = (myX - this.ball.mesh.position.x) / this.ball.dirX;
		if (tToMy <= 0) {
			this.padTargetZ = this.predictZ();
			return;
		}
		// ball z at collision time (including wall reflections)
		const bz = this.computeZAfterTime(this.ball.mesh.position.z, this.ball.dirZ, tToMy).pos;

		let found = false;
		let bestPaddleZ = this.predictZ();
		// search for desired outgoing dirZ that lands in corner with <= maxBounces
		for (let corner of corners) {
			for (let allowedBounces = 0; allowedBounces <= maxBounces; allowedBounces++) {
				// sample candidate dirZ values
				const maxDz = speed * 0.95;
				const samples = 61;
				for (let i = 0; i < samples; i++) {
					const dz = -maxDz + (2 * maxDz) * (i / (samples - 1));
					// ensure dirX will be valid
					const abs = Math.abs(dz);
					if (abs >= speed) continue;
					const outDirX = signOut * Math.sqrt(Math.max(speed * speed - dz * dz, 0));
					// simulate from our paddle (myX, bz) with outgoing (outDirX, dz)
					const sim = this.simulateFrom(myX, bz, outDirX, dz, x_target);
					if (!sim) continue;
					if (sim.bounces === allowedBounces && Math.abs(sim.finalZ - corner) < 0.8) {
						// compute required paddle center so that impact creates the desired dz
						const maxAngle = Math.PI / 2 - Math.PI / 9;
						let impact = Math.asin(Math.max(-1, Math.min(1, dz / speed))) / maxAngle;
						impact = Math.max(-1, Math.min(1, impact));
						const requiredPaddleCenter = bz - impact * (paddle_size / 2);
						bestPaddleZ = requiredPaddleCenter;
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (found) break;
		}

		if (found) this.padTargetZ = bestPaddleZ;
		else this.padTargetZ = this.predictZ();
	}

	// Simulate from (sx, sz) with direction (dirX, dirZ) until reaching x_target. Returns finalZ and number of wall bounces.
	simulateFrom(sx: number, sz: number, dirX: number, dirZ: number, x_target: number): { finalZ: number; bounces: number } | null {
		if (dirX === 0) return null;
		const dirXSign = dirX > 0 ? 1 : -1;
		const t = (x_target - sx) / dirX;
		if (t <= 0) return null;
		const totalDz = dirZ * t;
		const res = this.computeZAfterTime(sz, dirZ, t);
		return { finalZ: res.pos, bounces: res.bounces };
	}

	// Compute final z after time t, accounting for reflections between -5 and 5. Returns pos and number of bounces.
	computeZAfterTime(z0: number, dirZ: number, t: number): { pos: number; bounces: number } {
		const min = -5, max = 5;
		let pos = z0 + dirZ * t;
		let bounces = 0;
		// fold into [min,max]
		while (pos > max || pos < min) {
			if (pos > max) {
				pos = max - (pos - max);
				bounces++;
			} else if (pos < min) {
				pos = min + (min - pos);
				bounces++;
			}
		}
		return { pos, bounces };
	}

    predictZ(): number {
		// Predict where the ball will intersect this paddle's X coordinate
		const targetX = this.side === 'left' ? -10 : 10;
		const sx = this.ball.mesh.position.x;
		const sz = this.ball.mesh.position.z;
		const dirX = this.ball.dirX;
		const dirZ = this.ball.dirZ;
		const t = (targetX - sx) / dirX;
		if (t <= 0) return 0;
		const res = this.computeZAfterTime(sz, dirZ, t);
		this.ballDirZIntercept = dirZ;
		this.ballDirXIntercept = dirX;
		return res.pos;
    }
}

export class Game {
	engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    canvas: HTMLCanvasElement;
    ball!: Ball;
    p_left!: Paddle;
    p_right!: Paddle;
    player1!: PlayerType;
	player1Config!: PlayerConfig;
    player2!: PlayerType;
	player2Config!: PlayerConfig;
	gameover: boolean;
	pause: boolean;
	particleSystem: any;
    groundLeft: BABYLON.Mesh;
	groundRight: BABYLON.Mesh;
	match: MatchSetup;

	clock: Clock;

    loadedTexturesL: any[] = [];
    loadedTexturesR: any[] = [];

	private resolveEnd!: (match: MatchSetup) => void;
	private promiseEnd: Promise<MatchSetup>;

    constructor(canvas: HTMLCanvasElement, match_setup: MatchSetup)
	{
		this.gameover = false;
		this.pause = false;
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
		this.particleSystem = new BABYLON.ParticleSystem("particles", 20, this.scene);

		this.match = match_setup;
		this.player1Config = match_setup.players[0];
        this.player2Config = match_setup.players[1];

        this.groundLeft = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.groundRight = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.clock = new Clock();
        this.createCameraAndLight();
        this.createGround();
		this.createSkybox();
        this.createObjects();
		this.createParticles();

		//GUI Test
		this.createNames();

		this.clock.start();

        this.scene.registerBeforeRender(() => this.update());

		this.promiseEnd = new Promise<MatchSetup>(resolve => {
			this.resolveEnd = resolve;
		});
    }

	launch()
	{
		this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }

	async createNames() {
		var fontData = await (await fetch("../../public/fonts/MaximumImpact_Regular.json")).json();

		var name1 = BABYLON.MeshBuilder.CreateText("myText", "in", fontData, { size: 1, resolution: 64, depth: 0.1 }, this.scene, (window as any).earcut.default);
		var name2 = BABYLON.MeshBuilder.CreateText("myText", "nn", fontData, { size: 1, resolution: 64, depth: 0.1 }, this.scene, (window as any).earcut.default);

		name1!.position.y = 5;
		name1!.position.x = -5;
		name2!.position.y = 5;
		name2!.position.x = 5;
	}


	dispose() {
		this.engine.stopRenderLoop();
		this.scene = new BABYLON.Scene(this.engine);
        // this.scene.dispose();
		// this.engine.dispose();
		// this.scene.dispose();
    	// this.ball.mesh.dispose();
    	// this.p_left.mesh.dispose();
    	// this.p_right.mesh.dispose();
		// this.particleSystem.dispose();
    	// this.groundLeft.dispose();
		// this.groundRight.dispose();

		// for (let i = 0; i++; i <= 5) {
    	// 	this.loadedTexturesL[i].dispose();
    	// 	this.loadedTexturesR[i].dispose();
		// }
	}

    createCameraAndLight() {
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 12, -15), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.8;
    }

    createGround() {
        // place ground mesh
		this.groundLeft.position.set(-5, 0, 0);
		this.groundRight.position.set(5, 0, 0);


        // load all score/ground textures
        for (let i = 0; i <= 5; i++)
        {
            const groundLeftMat = new BABYLON.StandardMaterial("ScoreTexture", this.scene);
            const groundRightMat = new BABYLON.StandardMaterial("ScoreTexture", this.scene);

            groundLeftMat.diffuseTexture = new BABYLON.Texture("assets/game/textures/ground/Score" + i + "L.png", this.scene);
		    groundRightMat.diffuseTexture = new BABYLON.Texture("assets/game/textures/ground/Score" + i + "R.png", this.scene);

            this.loadedTexturesL.push(groundLeftMat);
            this.loadedTexturesR.push(groundRightMat);
        }

        this.groundLeft.material = this.loadedTexturesL[0];
		this.groundRight.material = this.loadedTexturesR[0];
    }

	changeGroundTexture() {
		this.groundLeft.material = this.loadedTexturesL[this.ball.score1];
		this.groundRight.material = this.loadedTexturesR[this.ball.score2];
	}

	createSkybox() {
        const skyboxMaterial = new BABYLON.StandardMaterial("assets/game/textures/skybox/skybox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
          
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/game/textures/skybox/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
          
        const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 29.0 }, this.scene);
        skybox.material = skyboxMaterial;
          
        // error skybox does not display because script is running on local browser, need to be running on a webserver
	}

    createObjects() {

        // setup color from custom variable
        const Bcolor_r = parseInt(BallColor.slice(1, 3), 16);
        const Bcolor_g = parseInt(BallColor.slice(3, 5), 16);
        const Bcolor_b = parseInt(BallColor.slice(5, 7), 16);

        const Pcolor_r = parseInt(PaddleColor.slice(1, 3), 16);
        const Pcolor_g = parseInt(PaddleColor.slice(3, 5), 16);
        const Pcolor_b = parseInt(PaddleColor.slice(5, 7), 16);

        // Paddle Material
        const pmaterial = new BABYLON.StandardMaterial("material", this.scene);
        pmaterial.diffuseColor = new BABYLON.Color3(Pcolor_r/255, Pcolor_g/255, Pcolor_b/255);

        // Ball Material
        const bmaterial = new BABYLON.StandardMaterial("material", this.scene);
        bmaterial.diffuseColor = new BABYLON.Color3(Bcolor_r/255, Bcolor_g/255, Bcolor_b/255);

        // Color3(r, g, b);
        this.p_left = new Paddle(this.scene, -10);
        this.p_right = new Paddle(this.scene, 10);
        this.ball = new Ball(this.scene, this.clock);

		// new player creation
		if (this.player1Config.type == "human")
            this.player1 = new Player(this.p_left, "w", "s", this.player1Config);
        else
            this.player1 = new AIPlayer(this.p_left, this.ball, "left", this.player1Config)
		if (this.player2Config.type == "human")
            this.player2 = new Player(this.p_right, "ArrowUp", "ArrowDown", this.player2Config);
        else
            this.player2 = new AIPlayer(this.p_right, this.ball, "right", this.player2Config)
		this.player1.opponent = this.player2;
        this.player2.opponent = this.player1;

	
        this.p_left.mesh.material = pmaterial;
        this.p_right.mesh.material = pmaterial;
        this.ball.mesh.material = bmaterial;

        const glow = new BABYLON.GlowLayer("glow", this.scene);
        glow.intensity = 0.5;
        glow.customEmissiveColorSelector = (mesh, _, __, result) => {
            if (mesh.name === "Paddle") {
    			result.set(Pcolor_r/255, Pcolor_g/255, Pcolor_b/255, 1);
  			} else if (mesh.name === "Ball") {
    			result.set(Bcolor_r/255, Bcolor_g/255, Bcolor_b/255, 1);
  			} else {
    			result.set(0, 0, 0, 1);
			}
        };
    }

	createParticles() {
		//texture of Particles
		this.particleSystem.particleTexture = new BABYLON.Texture("assets/game/textures/flare.png", this.scene);
		// Where the particles come from
    	this.particleSystem.emitter = BABYLON.Vector3.Zero(); // the starting location

		// Size of each particle (random between...
		this.particleSystem.minSize = 0.1;
    	this.particleSystem.maxSize = 0.3;
    	// Life time of each particle (random between...
    	this.particleSystem.minLifeTime = 0.3;
    	this.particleSystem.maxLifeTime = 1.5;

		// Emission rate
    	this.particleSystem.emitRate = 100;

		// Speed
    	this.particleSystem.minEmitPower = 1;
    	this.particleSystem.maxEmitPower = 3;
    	this.particleSystem.updateSpeed = 0.005;

		// color
		this.particleSystem.color1 = new BABYLON.Color4(0, 0, 0, 1.0);
	}

	popParticles(pos: BABYLON.Vector3) {
	
		//set direction left paddle
		if (pos.x < 0) {
			this.particleSystem.emitter = new BABYLON.Vector3(this.ball.mesh.position.x, this.ball.mesh.position.y, this.ball.mesh.position.z);
			var pointEmitterLeft = this.particleSystem.createPointEmitter(new BABYLON.Vector3(3, 0.5, -1), new BABYLON.Vector3(3, -0.5, 1));
		}
		// for right paddle
		else {
			this.particleSystem.emitter = new BABYLON.Vector3(this.ball.mesh.position.x, this.ball.mesh.position.y, this.ball.mesh.position.z);
			var pointEmitterRight = this.particleSystem.createPointEmitter(new BABYLON.Vector3(-3, -0.5, 1), new BABYLON.Vector3(-3, 0.5, -1));
		}

		// Start the particle system
    	this.particleSystem.start();
		
	}

	updateParticles() {
		if (this.ball.pTimer == 0)
			this.particleSystem.stop();
		if (this.ball.pTimer == 1) {
			this.popParticles(this.ball.mesh.position);
		}
		if (this.ball.pTimer > 0)
			this.ball.pTimer++;
		if (this.ball.pTimer == 30)
			this.ball.pTimer = 0;
	}

    update()
	{
		if (this.pause == true)
			return;

		this.clock.updateGameTimer();
		//console.log("Actual: ", this.clock.gameTime);

		this.player1.update();
		this.player2.update();
		this.ball.update(this.p_left, this.p_right);
		this.changeGroundTexture();
		this.updateParticles();
        if (this.gameover == true)
			this.endGame();
		if (this.ball.score1 == 2 || this.ball.score2 == 2)
			this.gameover = true;
	}

	whenEnded(): Promise<MatchSetup> {
		return this.promiseEnd;
	}

	endGame()
	{
		if (this.ball.score1 > this.ball.score2)
			this.match.winner = this.player1.config;
		else
			this.match.winner = this.player2.config;
		this.match.rm = true;
        this.engine.stopRenderLoop();
		resetSettings();
		console.log("max time: ", this.clock.pointMaxTime/1000);
		console.log("Total game time: ", this.clock.gameTime/1000);
		this.resolveEnd(this.match);
	}
}

// ################### Run the Game ###################
export function startMatch(match_setup: MatchSetup): Promise<MatchSetup> {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    setUpSettings();
    console.log("Game settings loaded:", { paddle_size, PaddleColor, BallSize, BallColor });
    const game = new Game(canvas, match_setup);
    match_setup.game = game;
    match_setup.escape();
    game.launch();
    //resetSettings();
	return game.whenEnded();
}


export async function startTournament(tournament: TournamentManager): Promise<void>
{
	console.log("started tournament with", tournament.firstRound[0].players[0].name);
    await startMatch(tournament.firstRound[0]);
	console.log(tournament.firstRound[0].winner!.name);
	await setupTournamentWaitingRoom(tournament);
	await startMatch(tournament.firstRound[1]);
	console.log(tournament.firstRound[1].winner!.name);
	tournament.currentRound = 1;
    tournament.final = new MatchSetup;
    if (tournament.firstRound[0].winner && tournament.firstRound[1].winner)
    {
    	tournament.final.addPlayer(tournament.firstRound[0].winner);
    	tournament.final.addPlayer(tournament.firstRound[1].winner);
		await setupTournamentWaitingRoom(tournament);
    	tournament.currentRound = 2;
		await startMatch(tournament.final);
		console.log("Tournament winner:", tournament.final.winner!.name);
		await setupTournamentEndScreen(tournament);
    }
}
