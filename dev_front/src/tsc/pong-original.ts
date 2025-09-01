
import * as BABYLON from 'babylonjs';

// ################ customization variables ###########
const paddle_size = 5;
let BallSpeed = 10;
const BallSpeedLimit = 10;
let z_reaction = 0.25;

// ######### utility #########
function getRandomInt(max: number): number {
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
            { width: 0.5, height: 0.5, depth: paddle_size }, scene);
        this.mesh.position.set(x, 0.5, 0);
    }

    move(up: boolean, down: boolean) {
        if (up && this.mesh.position.z < 5)
            this.mesh.position.z += 0.1;
        if (down && this.mesh.position.z > -5)
            this.mesh.position.z -= 0.1;
    }

    get topZ(): number {
        return this.mesh.position.z + paddle_size / 2;
    }

    get bottomZ(): number {
        return this.mesh.position.z - paddle_size / 2;
    }

    get z(): number {
        return this.mesh.position.z;
    }

    set z(val: number) {
        this.mesh.position.z = val;
    }
}

class Ball {
    mesh: BABYLON.Mesh;
    speed: number;
    dirX: number = 0;
    dirZ: number = 0;
    startDelay: number = 0;

    constructor(scene: BABYLON.Scene) {
        this.mesh = BABYLON.MeshBuilder.CreateSphere("GameObject", { diameter: 0.5 }, scene);
        this.mesh.position.set(0, 0.5, 0);
        this.speed = BallSpeed;
        this.resetDirection();
    }

    resetDirection() {
        let randdir = getRandomInt(7);
        randdir = (randdir <= 3) ? -randdir : randdir - 3;
        this.dirZ = randdir;

        const leftright = getRandomInt(2);
        const dirX = Math.sqrt(this.speed ** 2 - this.dirZ ** 2);
        this.dirX = leftright === 1 ? -dirX : dirX;
    }

    update(p_left: Paddle, p_right: Paddle) {
        if (this.mesh.position.z >= 5 || this.mesh.position.z <= -5)
            this.dirZ = -this.dirZ;

        this.checkPaddleCollision(p_left, -10, -9.5);
        this.checkPaddleCollision(p_right, 10, 9.5);

        if (this.mesh.position.x <= -11 || this.mesh.position.x >= 11)
            this.reset();

        if (this.startDelay < 120)
            this.startDelay++;
        if (this.startDelay === 120) {
            this.mesh.position.x += this.dirX / 100;
            this.mesh.position.z += this.dirZ / 100;
        }
    }

    checkPaddleCollision(paddle: Paddle, hitX: number, limitX: number) {
        const pz = paddle.z;
        const bz = this.mesh.position.z;
        const bx = this.mesh.position.x;

        const hit = (limitX < hitX) ? (bx <= hitX && bx >= limitX) : (bx >= hitX && bx <= limitX);
        const within = (bz > (pz - paddle_size / 2)) && (bz < (pz + paddle_size / 2));

        if (hit && within && ((hitX < 0 && this.dirX < 0) || (hitX > 0 && this.dirX > 0))) {
            if (this.speed < BallSpeedLimit)
                this.speed += 0.1;
            this.dirZ += bz - pz;
            const diff = (this.speed ** 2 - this.dirZ ** 2);
            this.dirX = hitX > 0 ? -Math.sqrt(Math.abs(diff)) : Math.sqrt(Math.abs(diff));
        }
    }

    reset() {
        this.mesh.position.set(0, 0.5, 0);
        this.speed = BallSpeed;
        this.resetDirection();
        this.startDelay = 0;
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
        this.keys[this.upKey] = false;
        this.keys[this.downKey] = false;

        window.addEventListener("keydown", e => {
            const key = e.key.toLowerCase();
            if (key === this.upKey || key === this.downKey)
                this.keys[key] = true;
        });

        window.addEventListener("keyup", e => {
            const key = e.key.toLowerCase();
            if (key === this.upKey || key === this.downKey)
                this.keys[key] = false;
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

    constructor(
        canvas: HTMLCanvasElement,
        l_player_type: string,
        l_player_name: string,
        r_player_type: string,
        r_player_name: string
    ) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        this.createCameraAndLight();
        this.createGround();
        this.createObjects(l_player_type, l_player_name, r_player_type, r_player_name);

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
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 11 }, this.scene);
        const groundMat = new BABYLON.StandardMaterial("ground", this.scene);
        ground.material = groundMat;
        groundMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    }

    createObjects(l_type: string, l_diff: string, r_type: string, r_diff: string) {
        const material = new BABYLON.StandardMaterial("material", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1);

        this.p_left = new Paddle(this.scene, -10);
        this.p_right = new Paddle(this.scene, 10);
        this.ball = new Ball(this.scene);

        this.player1 = l_type === "human"
            ? new Player(this.p_left, "w", "s")
            : new AIPlayer(this.p_left, this.ball, "left", l_diff);

        this.player2 = r_type === "human"
            ? new Player(this.p_right, "ArrowUp", "ArrowDown")
            : new AIPlayer(this.p_right, this.ball, "right", r_diff);

        this.p_left.mesh.material = material;
        this.p_right.mesh.material = material;
        this.ball.mesh.material = material;

        const glow = new BABYLON.GlowLayer("glow", this.scene);
        glow.intensity = 0.5;
        glow.customEmissiveColorSelector = (mesh, _, __, result) => {
            result.set(
                mesh.name === "GameObject" ? 1 : 0,
                mesh.name === "GameObject" ? 1 : 0,
                mesh.name === "GameObject" ? 1 : 0,
                1
            );
        };
    }

    update() {
        this.player1.update();
        this.player2.update();
        this.ball.update(this.p_left, this.p_right);
    }
}

// ################### Run the Game ###################

export function startQuickMatch( l_player_type: string, l_player_name: string, r_player_type: string, r_player_name: string ): void
{
	
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
	new Game(canvas, l_player_type, l_player_name, r_player_type, r_player_name);
}
