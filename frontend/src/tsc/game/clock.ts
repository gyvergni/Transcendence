

export class Clock {
	gameTime: number = 0;
	gameTimerStart: number = 0; 
	
	pointMaxTime: number = 0; 
	pointCurrentTime: number = 0;
	pointTimerStart: number = 0;

	ballDelayStart: number = 0;
    paddle_pause: boolean = false;

	start() 
	{
		this.gameTimerStart = new Date().getTime();
		this.pointTimerStart = new Date().getTime();
	}
	updateGameTimer()
	{
		this.gameTime += new Date().getTime() - this.gameTimerStart;
		this.gameTimerStart = new Date().getTime();
	}
	updatePointTimer()
	{
		const newTime = new Date().getTime() - this.pointTimerStart;
		this.pointCurrentTime += newTime;
		if (this.pointCurrentTime > this.pointMaxTime)
			this.pointMaxTime = this.pointCurrentTime;
		this.pointTimerStart = new Date().getTime();
	}

	pauseTimer()
	{
		this.updateGameTimer();
		this.updatePointTimer();
	}

	resumeTimer()
	{
		this.gameTimerStart = new Date().getTime();
		this.pointTimerStart = new Date().getTime();
		this.ballDelayStart = new Date().getTime();
	}
}