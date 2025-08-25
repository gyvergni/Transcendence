import * as BABYLON from 'babylonjs'
//################ customization variables ###########
const padle_size = 5;
let BallSpeed = 5;
const BallSpeedLimit = 30;
let z_reaction = 0.25;

// ######### utility #########
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

// ################ Interfaces for clarity ############
interface PlayerType {
    update(): void;
}

// ################ Classes ####################

class Paddle {
	mesh: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene, x: number) {
        this.mesh = BABYLON.MeshBuilder.CreateBox("GameObject", 
            {width: 0.5, height: 0.5, depth: padle_size}, scene);
        this.mesh.position.set(x, 0.5, 0);
    }

    move(up: boolean, down: boolean) {
        if (up && this.mesh.position.z < 5)
            this.mesh.position.z += 0.1;
        if (down && this.mesh.position.z > -5)
            this.mesh.position.z -= 0.1;
    }

	get topZ() {
    return this.mesh.position.z + padle_size / 2;
	}

	get bottomZ() {
	    return this.mesh.position.z - padle_size / 2;
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
	bounceParticles: number = 0;
	particleSystem: any;

    constructor(scene: BABYLON.Scene) {
        this.mesh = BABYLON.MeshBuilder.CreateSphere("GameObject", {diameter: 0.5}, scene);
        this.mesh.position.set(0, 0.5, 0);
		
		this.score1 = 0;
		this.score2 = 0;
		this.particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);

        this.speed = BallSpeed;
		this.createScoreParticles(scene);
        this.resetDirection();
        this.startDelay = 0;
		this.bounceParticles = 0;
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

        const within = (bz > (pz - padle_size/2)) && (bz < (pz + padle_size/2));

        if (hit && within && ((hitX < 0 && this.dirX < 0) || (hitX > 0 && this.dirX > 0))) {
            if (this.speed < BallSpeedLimit)
                this.speed += 0.5;
			console.log(`Ball speed: ${this.speed}`);
            this.dirZ += bz - pz;
            const diff = (this.speed * this.speed - this.dirZ * this.dirZ);
            this.dirX = hitX > 0 ? -Math.sqrt(Math.abs(diff)) : Math.sqrt(Math.abs(diff));
			this.bounceParticles = 1;
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
		this.particleSystem.particleTexture = new BABYLON.Texture("game/textures/flare.png", scene);

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
	
		//set direction left padle
		if (pos.x > 0) {
			// color
			this.particleSystem.color1 = new BABYLON.Color4(1.0, 0, 0, 1.0);
			this.particleSystem.emitter = new BABYLON.Vector3(-11, 1, 0);
			var BoxEmitterLeft = this.particleSystem.createBoxEmitter(new BABYLON.Vector3(6, 1, -2), new BABYLON.Vector3(6, -1, 2), new BABYLON.Vector3(-5, 0, 12), new BABYLON.Vector3(-5, 6, -12));
		}
		// for right padle
		else {
			// color
			this.particleSystem.color1 = new BABYLON.Color4(0, 0, 1.0, 1.0);
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

	constructor(paddle: Paddle, upKey: string, downKey: string) {
		this.paddle = paddle;
		this.upKey = upKey.toLowerCase();
		this.downKey = downKey.toLowerCase();
		this.keys = { [this.upKey]: false, [this.downKey]: false };

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
    difficulty: "easy" | "medium" | "hard";
    reactionTime: number;

    constructor(paddle: Paddle, ball: Ball, side: "left" | "right", difficulty: string) {
        this.paddle = paddle;
        this.ball = ball;
        this.side = side;
        this.difficulty = difficulty as "easy" | "medium" | "hard";
        this.reactionTime = {
            easy: 0.12,
            medium: 0.07,
            hard: 0.03
        }[this.difficulty] || 0.07;
    }

    is_movingToAI(): boolean {
        return (this.side === "left" && this.ball.dirX < 0) || (this.side === "right" && this.ball.dirX > 0);
    }

    private frameCounter = 0;
	update() {
		this.frameCounter++;
		if (this.frameCounter >= this.reactionTime * 60) {
			this.update_behaviour();
			this.frameCounter = 0;
		}
	}


    update_behaviour() {
        if (this.difficulty === "easy")
            this.behaviour_easy();
        else if (this.difficulty === "medium")
            this.behaviour_medium();
        else
            this.behaviour_hard();
    }

    behaviour_easy() {
        if (!this.is_movingToAI()) return;

        if (this.ball.mesh.position.z > this.paddle.topZ - z_reaction)
            this.paddle.move(true, false);
        else if (this.ball.mesh.position.z < this.paddle.bottomZ + z_reaction)
            this.paddle.move(false, true);
    }

    behaviour_medium() {
        if (!this.is_movingToAI()) return this.goToCenter();

        if (this.ball.mesh.position.z > this.paddle.z - z_reaction)
            this.paddle.move(true, false);
        else if (this.ball.mesh.position.z < this.paddle.z + z_reaction)
            this.paddle.move(false, true);
    }

    behaviour_hard() {
        if (!this.is_movingToAI()) return this.goToCenter();

        const finalZ = this.predictZ();
        if (finalZ > this.paddle.z)
            this.paddle.move(true, false);
        else if (finalZ < this.paddle.z)
            this.paddle.move(false, true);
    }

    predictZ(): number {
        let z = this.ball.mesh.position.z;
        let x = this.ball.mesh.position.x;
        let dirX = this.ball.dirX;
        let dirZ = this.ball.dirZ;

        while ((x >= -10 && dirX < 0) || (x <= 10 && dirX > 0)) {
            const distToWall = this.ball.calculateDistToWall();
            const steps = distToWall / Math.abs(dirZ);
            z += dirZ * steps;
            x += dirX * steps;

            if (Math.abs(x) < 10) dirZ = -dirZ;
            else return z + dirZ * (this.ball.calculateDistToBorder() / Math.abs(dirX));
        }

        return z;
    }

    goToCenter() {
        if (this.paddle.z > 0)
            this.paddle.move(false, true);
        else if (this.paddle.z < 0)
            this.paddle.move(true, false);
    }
}

class Game {
	engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    canvas: HTMLCanvasElement;
    ball!: Ball;
    p_left!: Paddle;
    p_right!: Paddle;
    player1!: PlayerType;
    player2!: PlayerType;
	gameover: boolean;
	particleSystem: any;
    groundLeft: BABYLON.Mesh;
	groundRight: BABYLON.Mesh;

    constructor(canvas: HTMLCanvasElement) // might need to add  player name and type 1 and 2 for createObjects
	{
		this.gameover = false;
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
		this.particleSystem = new BABYLON.ParticleSystem("particles", 20, this.scene);

        this.groundLeft = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.groundRight = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);

        this.createCameraAndLight();
        this.createGround();
		this.createSkybox();
        this.createObjects();
		this.createParticles();
        this.scene.registerBeforeRender(() => this.update());

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }

    createCameraAndLight() {
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 12, -15), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.8;
    }

    createGround() {
        //this.groundLeft = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.groundLeft.position.set(-5, 0, 0);
		//this.groundRight = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 11}, this.scene);
		this.groundRight.position.set(5, 0, 0);

        const groundLeftMat = new BABYLON.StandardMaterial("ScoreTexture", this.scene);
		groundLeftMat.diffuseTexture = new BABYLON.Texture("game/textures/ground/Score0L.png", this.scene);
		const groundRightMat = new BABYLON.StandardMaterial("ScoreTexture", this.scene);
		groundRightMat.diffuseTexture = new BABYLON.Texture("game/textures/ground/Score0R.png", this.scene);

        this.groundLeft.material = groundLeftMat;
		this.groundRight.material = groundRightMat;
    }

	changeGroundTexture() {
		const groundLeftMat = new BABYLON.StandardMaterial("ScoreTexture", this.scene);
		groundLeftMat.diffuseTexture = new BABYLON.Texture("game/textures/ground/Score" + this.ball.score1 + "L.png", this.scene);
		const groundRightMat = new BABYLON.StandardMaterial("ScoreTexture", this.scene);
		groundRightMat.diffuseTexture = new BABYLON.Texture("game/textures/ground/Score" + this.ball.score2 + "R.png", this.scene);
		
		this.groundLeft.material = groundLeftMat;
		this.groundRight.material = groundRightMat;
	}

	createSkybox() {
        const skyboxMaterial = new BABYLON.StandardMaterial("game/textures/skybox/skybox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
          
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("game/textures/skybox/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
          
        const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 29.0 }, this.scene);
        skybox.material = skyboxMaterial;
          
        // error skybox does not display because script is running on local browser, need to be running on a webserver
	}

    createObjects() {
		// compared to branch "front dev" it's missing AI attribution 
        const material = new BABYLON.StandardMaterial("material", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1);

        this.p_left = new Paddle(this.scene, -10);
        this.p_right = new Paddle(this.scene, 10);
        this.ball = new Ball(this.scene);
		//au lieu de p_left et p_right, on precise selon la box de sélection dans le front
		this.player1 = new Player(this.p_left, "w", "s");
		this.player2 = new Player(this.p_right, "ArrowUp", "ArrowDown");

		//si AI ajoutée, on crée l'IA en précisant son niveau de difficulté
        this.p_left.mesh.material = material;
        this.p_right.mesh.material = material;
        this.ball.mesh.material = material;

        const glow = new BABYLON.GlowLayer("glow", this.scene);
        glow.intensity = 0.5;
        glow.customEmissiveColorSelector = (mesh, _, __, result) => {
            result.set(mesh.name === "GameObject" ? 1 : 0, mesh.name === "GameObject" ? 1 : 0, mesh.name === "GameObject" ? 1 : 0, 1);
        };
    }

	createParticles() {
		//texture of Particles
		this.particleSystem.particleTexture = new BABYLON.Texture("game/textures/flare.png", this.scene);
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
	
		//set direction left padle
		if (pos.x < 0) {
			this.particleSystem.emitter = new BABYLON.Vector3(this.ball.mesh.position.x, this.ball.mesh.position.y, this.ball.mesh.position.z);
			var pointEmitterLeft = this.particleSystem.createPointEmitter(new BABYLON.Vector3(3, 0.5, -1), new BABYLON.Vector3(3, -0.5, 1));
		}
		// for right padle
		else {
			this.particleSystem.emitter = new BABYLON.Vector3(this.ball.mesh.position.x, this.ball.mesh.position.y, this.ball.mesh.position.z);
			var pointEmitterRight = this.particleSystem.createPointEmitter(new BABYLON.Vector3(-3, -0.5, 1), new BABYLON.Vector3(-3, 0.5, -1));
		}

		// Start the particle system
    	this.particleSystem.start();
		
	}

	updateParticles() {
		if (this.ball.bounceParticles == 0)
			this.particleSystem.stop();
		if (this.ball.bounceParticles == 1) {
			this.popParticles(this.ball.mesh.position);
		}
		if (this.ball.bounceParticles > 0)
			this.ball.bounceParticles++;
		if (this.ball.bounceParticles == 30)
			this.ball.bounceParticles = 0;
	}

    update() {
		if (this.gameover == true) {
			//this.engine.stopRenderLoop();
			//return; // #################### TROUVER UN MOYEN DE SORTIR DU JEU ######################
		}
		this.player1.update();
		this.player2.update();
		this.ball.update(this.p_left, this.p_right);
		this.changeGroundTexture();
		this.updateParticles();
		if (this.ball.score1 == 5 || this.ball.score2 == 5)
			this.gameover = true;
	}
}

// ################### Run the Game ###################
export function startQuickMatch( l_player_type: string, l_player_name: string, r_player_type: string, r_player_name: string ): void
{
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const game = new Game(canvas);
}