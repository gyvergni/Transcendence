
//################ imports ############
import * as BABYLON from "babylonjs";
import uiManager from "./main.js";
import {animateContentBoxIn} from "./animations.js";
import {setContentView} from "./views.js";
import {PlayerConfig, MatchSetup, TournamentManager, AIDifficulty} from "./models.js";


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

    constructor(scene: BABYLON.Scene) {
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
        this.startDelay = 0;
		this.pTimer = 0;
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

        // Delay start
        if (this.startDelay < 120) {
			this.startDelay++;
		}
		if (this.startDelay == 30)
			this.particleSystem.stop();
        if (this.startDelay === 120) {
            this.mesh.position.x += this.dirX / 100;
            this.mesh.position.z += this.dirZ / 100;
        }
    }

    checkPaddleCollision(paddle: Paddle, hitX: number, limitX: number) {
        const pz = paddle.mesh.position.z;
        const bz = this.mesh.position.z;
        const bx = this.mesh.position.x;

        const hit = (limitX < hitX) ? (bx <= hitX && bx >= limitX) : (bx >= hitX && bx <= limitX);

        const within = (bz > (pz - paddle_size/2)) && (bz < (pz + paddle_size/2));

        if (hit && within && ((hitX < 0 && this.dirX < 0) || (hitX > 0 && this.dirX > 0))) {
            if (this.speed < BallSpeedLimit)
                this.speed += 0.5;
			console.log(`Ball speed: ${this.speed}`);
            this.dirZ += (bz - pz) * paddle_size;
            const diff = (this.speed * this.speed - this.dirZ * this.dirZ);
            this.dirX = hitX > 0 ? -Math.sqrt(Math.abs(diff)) : Math.sqrt(Math.abs(diff));
			this.pTimer = 1;
        }
    }

    reset() {
        this.mesh.position.set(0, 0.5, 0);
        this.speed = BallSpeed;
        this.resetDirection();
        this.startDelay = 0;
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
		//move to target
		if (this.padTargetZ > this.padRefZ - 0.1)
		{
			this.movement_down = false;
			this.movement_up = true;
			this.padRefZ += 0.1;
		}
		else if (this.padTargetZ < this.padRefZ + 0.1)
		{
			this.movement_up = false;
			this.movement_down = true;
			this.padRefZ -= 0.1;
		}
		this.paddle.move(this.movement_up, this.movement_down);
		this.movement_up = false;
		this.movement_down = false;
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
		if (!this.is_movingToAI()) 
			return;
		this.padTargetZ = this.ball.mesh.position.z;
		this.padRefZ = Math.random() * (paddle_size) + this.paddle.bottomZ;
	}

	behaviour_medium() {
		if (!this.is_movingToAI())
			return ;
		else
			this.padTargetZ = this.predictZ();
		if (this.padTargetZ >= this.paddle.bottomZ && this.padTargetZ <= this.paddle.topZ)
		{
			this.padTargetZ = this.padRefZ;
			return;
		}
		this.padRefZ = Math.random() * (paddle_size) + this.paddle.bottomZ;
	}

	behaviour_hard() {
    if (!this.is_movingToAI()) {
        this.padTargetZ = 0; // return to center if ball not coming
        return;
    }

    // Step 1: predict where ball will hit this paddle
    const interceptZ = this.predictZ();

    // Step 2: decide corner to aim for
    const z_target = this.opponent && this.opponent.paddle.z > 0 ? -5 : 5;
    const x_target = this.side === "left" ? 10 : -10;
    const myX = this.side === "left" ? -10 : 10;

    // Step 3: slope needed to reach the corner
    const dx = x_target - myX;
    const dz = z_target - interceptZ;
    const slope = dz / dx;

    // Step 4: compute desired outgoing direction
    const dirX_out = this.side === "left"
        ? Math.sqrt(this.ball.speed ** 2 / (1 + slope ** 2))
        : -Math.sqrt(this.ball.speed ** 2 / (1 + slope ** 2));
    const dirZ_out = slope * dirX_out;

    // Step 5: figure out impact offset required
    const dirZ_in = this.ballDirZIntercept;
    const requiredImpactOffset = (dirZ_out - dirZ_in) / paddle_size;

    // Step 6: target paddle Z so that ball hits at that offset
    this.padTargetZ = interceptZ - requiredImpactOffset;

    this.padRefZ = this.paddle.z;
}


	predictZ(): number {
	let z = this.ball.mesh.position.z;
	let x = this.ball.mesh.position.x;
	let dirX = this.ball.dirX;
	let dirZ = this.ball.dirZ;
	
	const targetX = this.side === "left" ? -10 : 10;
	
	while ((dirX < 0 && x > targetX) || (dirX > 0 && x < targetX)) {
		// distance until next wall hit
		
    	let distToWall = dirZ > 0 ? (5 - z) : (z + 5);

		let stepsToWall = distToWall / Math.abs(dirZ);

		// distance until reaching paddle’s X
		let distToPaddle = Math.abs(targetX - x);
		let stepsToPaddle = distToPaddle / Math.abs(dirX);

		if (stepsToPaddle < stepsToWall) {
			// Ball reaches paddle before hitting top/bottom
			z += dirZ * stepsToPaddle;
			this.ballDirZIntercept = dirZ;
			this.ballDirXIntercept = dirX;
			return z;
		} else {
			// Ball hits wall first
			z += dirZ * stepsToWall;
			x += dirX * stepsToWall;
			dirZ = -dirZ; // bounce
		}
	}
	this.ballDirZIntercept = dirZ;
	this.ballDirXIntercept = dirX;
	return z;
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

    loadedTexturesL: any[] = [];
    loadedTexturesR: any[] = [];

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

        this.createCameraAndLight();
        this.createGround();
		this.createSkybox();
        this.createObjects();
		this.createParticles();
        this.scene.registerBeforeRender(() => this.update());
    }
	launch()
	{
		this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
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
        this.ball = new Ball(this.scene);

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

    update() {
		if (this.pause == true)
			return;
		this.player1.update();
		this.player2.update();
		this.ball.update(this.p_left, this.p_right);
		this.changeGroundTexture();
		this.updateParticles();
        if (this.gameover == true && this.ball.startDelay == 60)
            this.endGame();
		if (this.ball.score1 == 5 || this.ball.score2 == 5)
			this.gameover = true;

	}

	endGame() {
		uiManager.setCurrentView("home");
			if (this.ball.score1 > this.ball.score2)
				this.match.winner = this.player1.config;
			else
				this.match.winner = this.player2.config;
        animateContentBoxIn();
		setContentView("views/home.html");
        this.engine.stopRenderLoop();
		resetSettings();
	}

}

// ################### Run the Game ###################
export async function startMatch( match_setup: MatchSetup ): Promise<void>
{
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
	setUpSettings();
	console.log("Game settings loaded:", { paddle_size, PaddleColor, BallSize, BallColor });
	const game = new Game(canvas, match_setup);
	match_setup.game = game;
	match_setup.escape();
	await game.launch();
	resetSettings();
}

export async function startTournament(tournament: TournamentManager): Promise<void>
{
	console.log("started tournament with", tournament.firstRound[0].players[0].name);
    await startMatch(tournament.firstRound[0]);
	console.log(tournament.firstRound[0].winner!.name);
	await startMatch(tournament.firstRound[1]);
	console.log(tournament.firstRound[1].winner!.name);
	tournament.currentRound = 1;
    tournament.final = new MatchSetup;
    if (tournament.firstRound[0].winner && tournament.firstRound[1].winner)
    {
    	tournament.final.addPlayer(tournament.firstRound[0].winner);
    	tournament.final.addPlayer(tournament.firstRound[1].winner);
    	tournament.currentRound = 2;
		await startMatch(tournament.final);
    }
}