import * as BABYLON from "babylonjs";
import {PaddleSpeed, paddle_size, BallSize} from "./pong.js";
import { Clock } from "./clock.js";

export class Paddle {
    mesh: BABYLON.Mesh;
    clock: Clock;
    //stat track
    pSpeed: number = PaddleSpeed;
    pSize: number = paddle_size;

    constructor(scene: BABYLON.Scene, x: number, clock: Clock) {
        this.mesh = BABYLON.MeshBuilder.CreateBox("Paddle", 
            {width: 0.5, height: 0.5, depth: paddle_size}, scene);
        this.mesh.position.set(x, BallSize * 0.1, 0);
        this.clock = clock;
    }

    move(up: boolean, down: boolean) {
        if (new Date().getTime() - this.clock.ballDelayStart >= 2666)
            this.clock.paddle_pause = false;
        if (new Date().getTime() - this.clock.ballDelayStart <= 2666 && this.clock.paddle_pause == true)
            return ;
        if (up && this.mesh.position.z < 5 - paddle_size/4)
            this.mesh.position.z += 0.1 * (PaddleSpeed/10);
        if (down && this.mesh.position.z > -5 + paddle_size/4)
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