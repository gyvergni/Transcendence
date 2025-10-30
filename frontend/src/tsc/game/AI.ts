
import { paddle_size } from "./pong.js";
import { Paddle } from "./paddle.js";
import { Ball } from "./ball.js";
import { PlayerType } from "./player.js";
import { PlayerConfig, AIDifficulty } from "../utils/models.js";


export class AIPlayer implements PlayerType {
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
    totalInputs: number = 0;

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
            if (this.movement_up != true)
                this.totalInputs++;
			this.movement_up = true;
			this.movement_down = false;
			this.paddle.move(true, false);
		}
        else if (diff < -eps) {
            if (this.movement_down != true)
                this.totalInputs++;
			this.movement_up = false;
			this.movement_down = true;
			this.paddle.move(false, true);
		}
        else {
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
			return;
		}
		// simple follow with some noise
		this.padTargetZ = this.ball.mesh.position.z + (Math.random() - 0.5) * (paddle_size * 1.5);
	}

	behaviour_medium() {
		if (!this.is_movingToAI()) {
			return;
		}
		// Predict where ball will intercept this paddle, with some randomness
		this.padTargetZ = this.predictZ(1) + (Math.random() - 0.5) * (paddle_size * 1.2);
	}

	behaviour_hard() {
    if (!this.is_movingToAI()) {
        this.padTargetZ = 0;
        return;
    }
    let offset: number;
    if (Math.random() < 0.2)
        offset = (Math.random() - 0.5) * (paddle_size * 1.2);
    else
        offset = (Math.random() - 0.5) * (paddle_size * 0.6);
    this.padTargetZ = this.predictZ(10) + offset;
    }

    predictZ(maxWallBounce: number): number
    {
		// Predict where the ball will intersect this paddle's X coordinate
        let z = this.ball.mesh.position.z;
        let x = this.ball.mesh.position.x;
        let dirX = this.ball.dirX;
        let dirZ = this.ball.dirZ;
        let distToWall;
        let targetX: number;
        let wallBounces: number = 0;
        if (this.side == "left")
            targetX = -10
        else
            targetX = 10;
        while (((dirX < 0 && x > targetX) || (dirX > 0 && x < targetX)) && wallBounces++ <= maxWallBounce) {
            // distance until next wall hit
            if (dirZ > 0)
                distToWall = 5 - z
            else if (dirZ < 0)
                distToWall = z + 5;
            else
                distToWall = 1000;

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
