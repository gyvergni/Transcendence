
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
			this.padTargetZ = 0;
			return;
		}
		// simple follow with some noise
		this.padTargetZ = this.ball.mesh.position.z + (Math.random() - 0.5) * (paddle_size);
	}

	behaviour_medium() {
		if (!this.is_movingToAI()) {
			this.padTargetZ = 0;
			return;
		}
		// Predict where ball will intercept this paddle, with some randomness
		this.padTargetZ = this.predictZ() + (Math.random() - 0.5) * (paddle_size * 0.3);
	}

	behaviour_hard() {
    if (!this.is_movingToAI()) {
        this.padTargetZ = 0;
        return;
    }
    let offset: number;
    let rand = Math.random();
    if (rand < 0.2)
        offset = 0;
    else
        offset = (Math.random() - 0.5) * (paddle_size * 0.9);
    this.padTargetZ = this.predictZ() + offset;
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