import * as BABYLON from "babylonjs";
import { BallSpeed, BallShape, BallSize, paddle_size } from "./pong.js";
import { Clock } from "./clock.js";
import { Paddle } from "./paddle.js";


const BallSpeedLimit = 30;
const BallSpeedIncrement = 0.5;


function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export class Ball {
    mesh: BABYLON.Mesh
    speed: number;
    dirX: number = 0;
    dirZ: number = 0;
    startDelay: number = 0;
    score1: number = 0;
    score2: number = 0;
    wallBounce1: number = 0;
    wallBounce2: number = 0;
    pTimer: number = 0;
    particleSystem: any;
    clock: Clock;
    bounced: boolean;

    countDown3: any;
    countDown2: any;
    countDown1: any;

    //stat track
    rebound: number = 0;
    initialSpeed: number = BallSpeed;
    pointOrder:string = "";
    timeOrder:string = "";
    rallyBounce: number = 0;
    maxRallyBounce: number = 0;

    constructor(scene: BABYLON.Scene, clock: Clock) {
        if (BallShape === "square")
            this.mesh = BABYLON.MeshBuilder.CreateBox("Ball", {width: BallSize * 0.1, height: BallSize * 0.1, depth: BallSize * 0.1}, scene);
        else
            this.mesh = BABYLON.MeshBuilder.CreateSphere("Ball", {diameter: BallSize * 0.1}, scene);
        this.mesh.position.set(0, BallSize * 0.1, 0);
        
        this.score1 = 0;
        this.score2 = 0;
        this.particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);

        this.speed = BallSpeed;
        this.createScoreParticles(scene);
        this.resetDirection();
        this.pTimer = 0;
        this.clock = clock;
        this.clock.ballDelayStart = new Date().getTime();
        this.bounced = false;

        this.setupCountDown(scene);
    }

    async setupCountDown(scene: BABYLON.Scene) {
        var fontData = await (await fetch("./fonts/MaximumImpact_Regular.json")).json()

        this.countDown3 = BABYLON.MeshBuilder.CreateText("myText", "3", fontData, { size: 1, resolution: 64, depth: 0.1 }, scene, (window as any).earcut.default);
        this.countDown2 = BABYLON.MeshBuilder.CreateText("myText", "2", fontData, { size: 1, resolution: 64, depth: 0.1 }, scene, (window as any).earcut.default);
        this.countDown1 = BABYLON.MeshBuilder.CreateText("myText", "1", fontData, { size: 1, resolution: 64, depth: 0.1 }, scene, (window as any).earcut.default);

        this.countDown1.position.y = -2;
        this.countDown2.position.y = -2;
        this.countDown3.position.y = 5;
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
        if ((this.mesh.position.z >= 5 && this.dirZ > 0 ) || (this.mesh.position.z <= -5 && this.dirZ < 0 ))
        {
            if (this.dirX > 0)
                this.wallBounce1++;
            else
                this.wallBounce2++;
            this.dirZ = -this.dirZ;
            this.bounced = true;
        }
        // Paddle collision
        this.checkPaddleCollision(p_left, -10, -9.5 + BallSize * 0.05);
        this.checkPaddleCollision(p_right, 10, 9.5 - BallSize * 0.05);

        // Score and reset
        if (this.mesh.position.x <= -11) {
            if (this.rallyBounce > this.maxRallyBounce)
                this.maxRallyBounce = this.rallyBounce;
            this.rallyBounce = 0;

            this.pointOrder += "2";
            this.score2 += 1;
            this.popScoreParticles(this.mesh.position);
            this.reset();
        }
        else if (this.mesh.position.x >= 11) {
            if (this.rallyBounce > this.maxRallyBounce)
                this.maxRallyBounce = this.rallyBounce;
            this.rallyBounce = 0;

            this.pointOrder += "1";
            this.score1 += 1;
            this.popScoreParticles(this.mesh.position);
            this.reset();
        }

        if (new Date().getTime() - this.clock.ballDelayStart >= 500) 
            this.particleSystem.stop();

        if (new Date().getTime() - this.clock.ballDelayStart > 2666)
        {
            if(this.countDown1)
                this.countDown1.position.y = -2;
            this.mesh.position.x += this.dirX / 100;
            this.mesh.position.z += this.dirZ / 100;
        }
        else {
            if (new Date().getTime() - this.clock.ballDelayStart < 666)
            {
                if (this.countDown3)
                    this.countDown3.position.y = -2;
                if (this.countDown2)
                    this.countDown2.position.y = -2;
                if (this.countDown1)
                    this.countDown1.position.y = -2;
            }
            if (new Date().getTime() - this.clock.ballDelayStart >= 666 && new Date().getTime() - this.clock.ballDelayStart < 1332) {
                if (this.countDown3)
                    this.countDown3.position.y = 5;
            }
            else if (new Date().getTime() - this.clock.ballDelayStart >= 1332 && new Date().getTime() - this.clock.ballDelayStart < 2000) {
                if(this.countDown3)
                    this.countDown3.position.y = -2;
                if(this.countDown2)
                    this.countDown2.position.y = 5;
            }
            else if (new Date().getTime() - this.clock.ballDelayStart >= 2000) {
                if(this.countDown2)
                    this.countDown2.position.y = -2;
                if(this.countDown1)
                    this.countDown1.position.y = 5;
            }
        }
    }

    checkPaddleCollision(paddle: Paddle, hitX: number, limitX: number) {
        const pz = paddle.mesh.position.z;
        const bz = this.mesh.position.z;
        const bx = this.mesh.position.x;

        const hit = (limitX < hitX) ? (bx <= hitX && bx >= limitX) : (bx >= hitX && bx <= limitX);
        const within = (bz + BallSize * 0.05 > (pz - paddle_size/2)) && (bz - BallSize * 0.05 < (pz + paddle_size/2));

        if (hit && within && ((hitX < 0 && this.dirX < 0) || (hitX > 0 && this.dirX > 0))) {
            if (this.speed < BallSpeedLimit)
                this.speed = Math.min(this.speed + BallSpeedIncrement, BallSpeedLimit);
            const impact = (bz - pz) / (paddle_size / 2);
            // Clamp impact to [-1, 1]
            const clampedImpact = Math.max(-1, Math.min(impact, 1));
            const maxAngle = Math.PI / 2 - Math.PI / 9; // MAX ANGLE 70° from perpendicular
            const angle = clampedImpact * maxAngle;
            const signX = hitX > 0 ? -1 : 1;
            let newDirZ = this.speed * Math.sin(angle);
            if (clampedImpact === 0)
                newDirZ = 0;
            // Calculate dirX to preserve total speed
            let newDirX = signX * Math.sqrt(Math.max(this.speed * this.speed - newDirZ * newDirZ, 0));
            this.dirX = newDirX;
            this.dirZ = newDirZ;
            this.pTimer = 1;
            this.rebound++;
            this.rallyBounce++;
        }
    }

    reset() {
        this.timeOrder += (new Date().getTime() - this.clock.pointTimerStart + this.clock.pointCurrentTime) + ",";
        this.clock.updateGameTimer();
        this.clock.updatePointTimer();
        this.clock.pointCurrentTime = 0;
        this.mesh.position.set(0, BallSize * 0.1, 0);
        this.speed = BallSpeed;
        this.resetDirection();
        this.clock.ballDelayStart = new Date().getTime();
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
}