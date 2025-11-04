
import * as BABYLON from "babylonjs";
import * as earcut from "earcut";
(window as any).earcut = earcut;

import { PlayerConfig, MatchSetup } from "../utils/models.js";
import { translateName } from "../utils/translation.js";

import { Paddle } from "./paddle.js";
import { Clock } from "./clock.js";
import { Ball } from "./ball.js";
import { PlayerType, Player } from "./player.js";
import { AIPlayer } from "./AI.js";

import { BallColor, PaddleColor, getMatchStats } from "./pong.js";

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

	name1: any;
	name2: any;

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

		this.name1 = null;
		this.name2 = null;

        this.groundLeft = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.groundRight = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.clock = new Clock();
		this.createText();
        this.createCameraAndLight();
        this.createGround();
		this.createSkybox();
        this.createObjects();
		this.createParticles();
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

	async createText() {
        try
		{
            var fontData = await (await fetch("./fonts/MaximumImpact_Regular.json")).json();
        }
        catch (e)
        {
            console.error("failed fetching fontData");
            return ;
        }
		if (this.match.players[0].name)
        {
            const player1name = translateName(this.match.players[0].name);
			this.name1 = BABYLON.MeshBuilder.CreateText("myText", player1name, fontData, { size: 1, resolution: 64, depth: 0.1 }, this.scene, (window as any).earcut.default);
        }
        if (this.match.players[1].name)
        {
            const player2name = translateName(this.match.players[1].name);
			this.name2 = BABYLON.MeshBuilder.CreateText("myText", player2name, fontData, { size: 1, resolution: 64, depth: 0.1 }, this.scene, (window as any).earcut.default);
        }
        if (this.name1) {
			this.name1.position.y = 5;
			this.name1.position.x = -5;
		}
		if (this.name2) {
			this.name2.position.y = 5;
			this.name2.position.x = 5;
		}
	}


	dispose() {
		this.engine.stopRenderLoop();
		this.scene = new BABYLON.Scene(this.engine);
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
        
        // Paddles
        this.p_left = new Paddle(this.scene, -10, this.clock);
        this.p_right = new Paddle(this.scene, 10, this.clock);
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
  			} else if (mesh.name === "myText") {
    			result.set(1, 1, 1, 1);
  			} else {
    			result.set(0, 0, 0, 1);
			}
        };
    }

	createParticles() {
		this.particleSystem.particleTexture = new BABYLON.Texture("assets/game/textures/flare.png", this.scene);
    	this.particleSystem.emitter = BABYLON.Vector3.Zero();

		// Size of each particle
		this.particleSystem.minSize = 0.1;
    	this.particleSystem.maxSize = 0.3;
    	// Life time of each particle
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
        {
            this.clock.paddle_pause = true;
            return;
        }
		this.clock.updateGameTimer();

		this.player1.update();
		this.player2.update();
		this.ball.update(this.p_left, this.p_right);
		this.changeGroundTexture();
		this.updateParticles();
        if (this.gameover == true)
			this.endGame();
		if (this.ball.score1 == 5 || this.ball.score2 == 5)
			this.gameover = true;
	}

	whenEnded(): Promise<MatchSetup> {
		return this.promiseEnd;
	}

	dropMesh()
	{
		this.groundLeft.dispose();
		this.groundRight.dispose();
		this.name1.dispose();
		this.name2.dispose();
		this.p_left.mesh.dispose();
		this.p_right.mesh.dispose();
		this.ball.mesh.dispose();
		this.ball.countDown3.dispose();
		this.ball.countDown2.dispose();
		this.ball.countDown1.dispose();
	}

	endGame()
	{
		if (this.ball.score1 == 5)
			this.match.winner = this.player1.config;
		else if (this.ball.score2 == 5)
			this.match.winner = this.player2.config;
		this.match.rm = true;
        this.engine.stopRenderLoop();
		this.match.players[0].score = this.ball.score1;
		this.match.players[1].score = this.ball.score2;

        this.ball.timeOrder.slice(0, -1);
		if (this.pause === false)
			getMatchStats(this.match);
        this.resolveEnd(this.match);

		this.dropMesh();
	}
}