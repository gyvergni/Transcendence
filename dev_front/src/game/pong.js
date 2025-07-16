//################ customization variables ###########
const padle_size = 5;
let BallSpeed = 5;
const BallSpeedLimit = 10;
let z_reaction = 0.25;

// ######### utility #########
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// ################ Classes ####################

class Paddle {
    constructor(scene, x) {
        this.mesh = BABYLON.MeshBuilder.CreateBox("GameObject", 
            {width: 0.5, height: 0.5, depth: padle_size}, scene);
        this.mesh.position.set(x, 0.5, 0);
    }

    move(up, down) {
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
    constructor(scene) {
        this.mesh = BABYLON.MeshBuilder.CreateSphere("GameObject", 
            {diameter: 0.5}, scene);
        this.mesh.position.set(0, 0.5, 0);

        this.speed = BallSpeed;
        this.resetDirection();
        this.startDelay = 0;
    }

    resetDirection() {
        let randdir = getRandomInt(7);
        randdir = (randdir <= 3) ? -randdir : randdir - 3;
        this.dirZ = randdir;

        const leftright = getRandomInt(2);
        const dirX = Math.sqrt(this.speed * this.speed - this.dirZ * this.dirZ);
        this.dirX = leftright === 1 ? -dirX : dirX;
    }

    update(p_left, p_right) {
        // Bounce on walls
        if (this.mesh.position.z >= 5 || this.mesh.position.z <= -5)
            this.dirZ = -this.dirZ;

        // Paddle collision
        this.checkPaddleCollision(p_left, -10, -9.5);
        this.checkPaddleCollision(p_right, 10, 9.5);

        // Score and reset
        if (this.mesh.position.x <= -11 || this.mesh.position.x >= 11)
            this.reset();

        // Delay start
        if (this.startDelay < 120)
            this.startDelay++;
        if (this.startDelay === 120) {
            this.mesh.position.x += this.dirX / 100;
            this.mesh.position.z += this.dirZ / 100;
        }
    }

    checkPaddleCollision(paddle, hitX, limitX) {
        const pz = paddle.mesh.position.z;
        const bz = this.mesh.position.z;
        const bx = this.mesh.position.x;

        const hit = (limitX < hitX) ? (bx <= hitX && bx >= limitX) : (bx >= hitX && bx <= limitX);

        const within = (bz > (pz - padle_size/2)) && (bz < (pz + padle_size/2));

        if (hit && within && ((hitX < 0 && this.dirX < 0) || (hitX > 0 && this.dirX > 0))) {
            if (this.speed < BallSpeedLimit)
                this.speed += 0.1;
            this.dirZ += bz - pz;
            const diff = (this.speed * this.speed - this.dirZ * this.dirZ);
            this.dirX = hitX > 0 ? -Math.sqrt(Math.abs(diff)) : Math.sqrt(Math.abs(diff));
        }
    }

    reset() {
        this.mesh.position.set(0, 0.5, 0);
        this.speed = BallSpeed = 5;
        this.resetDirection();
        this.startDelay = 0;
    }

	calculateDistToBorder() {
		const bx = this.mesh.position.x;
		const distToBorder = 0;

		if (dirX < 0)
			distToBorder = 10 + bx;
		else if (dirX > 0)
			distToBorder = 10 - bx;
		return distToBorder;
	}

	calculateDistToWall() {
		const bz = this.mesh.position.z;
		const distToBorder = 0;

		if (dirZ < 0)
			distToBorder = 5 + bz;
		else if (dirZ > 0)
			distToBorder = 5 - bz;
		return distToBorder;
	}
}

class Player {
	constructor(paddle, upKey, downKey) {
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


class AIPlayer {
	constructor(paddle, ball, side, difficulty) {
		this.paddle = paddle;
		this.ball = ball;
		this.side = side;
		this.difficulty = difficulty;
		this.reactionTime = {
			easy: 0.12,
			medium: 0.07,
			hard: 0.03
		}[difficulty] || 0.07;
		this.previous
	}

	is_movingToAI() {
		return (this.side === "left" && this.ball.dirX < 0)
			|| (this.side === "right" && this.ball.dirX > 0);
	}

	update() {
		setTimeout(this.update_behaviour, reactionTime);
	}

	update_behaviour() {
		if (this.difficulty === "easy")
			this.behaviour_easy();
		if (this.difficulty === "medium")
			this.behaviour_medium();
		if (this.difficulty === "hard")
			this.behaviour_hard();
	}

	behaviour_easy() {
		if (!ballMovingToAI) return;
		
		else if (this.ball.mesh.position.z > this.paddle.topZ() - z_reaction)
			this.paddle.move(true, false);
		else if (this.ball.mesh.position.z < this.paddle.bottomZ() + z_reaction)
			this.paddle.move(false, true);
	}

	behaviour_medium() {
		if (!this.is_movingToAI())
			this.goToCenter();
		else if (this.ball.mesh.position.z > this.paddle.z() - z_reaction)
			this.paddle.move(true, false);
		else if (this.ball.mesh.position.z < this.paddle.z()- z_reaction)
			this.paddle.move(false, true);
	}

	behaviour_hard() {
		let z = this.ball.mesh.position.z;
		let x = this.ball.mesh.position.x;
		let dirX = this.ball.dirX;
		let dirZ = this.ball.dirZ;
		
		if (!this.is_movingToAI())
			this.goToCenter();
		else {
			finalZ = predictZ();
			if (finalZ > this.paddle.z())
				this.paddle.move(true, false);
			else if (finalZ < this.paddle.z())
				this.paddle.move(false, true);
		}
	}

	predictZ() {
		let z = this.ball.mesh.position.z;
		let x = this.ball.mesh.position.x;
		let dirX = this.ball.dirX;
		let dirZ = this.ball.dirZ;
		const finalZ = 0;
			while ((x >= -10 && dirX < 0) || (x <= 10 && dirX > 0))
			{
				const distToBorder = this.ball.calculateDistToBorder();
				const distToWall = this.ball.calculateDistToWall();
				const steps = distToWall / Math.abs(dirZ);
				z += dirZ * steps;
				x += dirX * steps;
				if (xWhenWallHit < 10 && xWhenWallHit > -10)
					dirZ = -dirZ;
				else
					finalZ = z += dirZ * (distToBorder / Math.abs(dirX));
			}
	}

	goToCenter() {
		if (this.paddle.z() > 0)
				this.paddle.move(false, true);
		if (this.paddle.z() < 0)
			this.paddle.move(true, false);
	}
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        this.createCameraAndLight();
        this.createGround();
        this.createObjects();
        this.scene.registerBeforeRender(() => this.update());

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }

    createCameraAndLight() {
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 12, -15), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.5;
    }

    createGround() {
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 11}, this.scene);
        const groundMat = new BABYLON.StandardMaterial();
        ground.material = groundMat;
        groundMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    }

    createObjects() {
        const material = new BABYLON.StandardMaterial();
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

    update() {
		this.player1.update();
		this.player2.update();
		this.ball.update(this.p_left, this.p_right);
	}
}

// ################### Run the Game ###################
const canvas = document.getElementById("renderCanvas");
const game = new Game(canvas);
