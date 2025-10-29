import { PlayerConfig } from "../utils/models.js";
import { Paddle } from "./paddle.js";


export interface PlayerType {
	update(): void;
	config: PlayerConfig;
	opponent: PlayerType | null;
	paddle: Paddle;
    totalInputs: number;
}

export class Player implements PlayerType {
	keys: Record<string, boolean> = {};
	upKey: string;
	downKey: string;
	paddle: Paddle;
	config: PlayerConfig;
	opponent: PlayerType | null = null;
    totalInputs: number = 0;

	constructor(paddle: Paddle, upKey: string, downKey: string, config: PlayerConfig) {
		this.paddle = paddle;
		this.upKey = upKey.toLowerCase();
		this.downKey = downKey.toLowerCase();
		this.keys = { [this.upKey]: false, [this.downKey]: false };
		this.config = config;

		window.addEventListener("keydown", e => {
			const key = e.key.toLowerCase();
			if (key === this.upKey)
            {
                if (this.keys[this.upKey] != true)
                    this.totalInputs++;
                this.keys[this.upKey] = true;
            }
            else if (key === this.downKey)
            {
                if (this.keys[this.downKey] != true)
                    this.totalInputs++;
                this.keys[this.downKey] = true;
            }
            else
                return ;
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