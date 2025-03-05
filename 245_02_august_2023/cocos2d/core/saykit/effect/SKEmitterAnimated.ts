import SKEffectEmitter from "./SKEffectEmitter";

const { ccclass, property } = cc._decorator;

@ccclass("saykit.EmitterAnimated")
export default class SKEmitterAnimated extends SKEffectEmitter {
	@property({ type: cc.Animation, visible: false, override: true }) system: any = null;
	@property(cc.Float)
	get delay(): number {
		return this._delay;
	}
	set delay(value: number) {
		this._delay = value < 0 ? 0 : value;

		this._calculateLifeTime();
	}
	@property(cc.Float) _delay: number = 0;

	@property(cc.AnimationClip) private _clip: any = null;

	private _timer: number = 0;

	protected _init(): void {
		this._getClip();
		this._calculateLifeTime();
	}
	protected _onLoad(): void {
		this._getClip();
		this._calculateLifeTime();
	}
	protected _update(dt: number): void {
		if (!this.active) return;

		const prevTime = this._timer;
		const nextTime = this._timer + dt;

		if (prevTime <= this.delay && nextTime >= this.delay && !this.isPlaying) {
			this.isPlaying = true;
			this.system.play();
		}

		if (prevTime <= this.lifeTime && nextTime >= this.lifeTime && this.isPlaying) {
			this._stop();
		}

		this._timer = nextTime;
	}
	protected _play(): void {
		if (!this.system) return;

		this._timer = 0;
		this._timer = 0;

		if (this.delay <= 0) {
			this.isPlaying = true;
			this.system.play();
		}
	}
	protected _stop(): void {
		if (!this.system) return;
		this.system.stop();
	}
	protected _clear(): void {
		this._stop();
		this.system = null;
		this._clip = null;
	}
	protected _calculateLifeTime(): void {
		let lifeTime = 0;

		if (this._clip) {
			lifeTime = this._clip.duration / this._clip.speed;

			if (this._clip.wrapMode === cc.WrapMode.PingPong || this._clip.wrapMode === cc.WrapMode.PingPongReverse) lifeTime *= 2;
		}

		this.lifeTime = lifeTime;
	}

	private _getClip(): void {
		if (!this.system) return;

		this._clip = this.system.defaultClip || this.system.getClips()[0];
	}
}

saykit.EmitterAnimated = SKEmitterAnimated;
