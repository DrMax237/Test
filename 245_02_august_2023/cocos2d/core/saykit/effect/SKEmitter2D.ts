import SKEffectEmitter from "./SKEffectEmitter";

const { ccclass, property } = cc._decorator;

@ccclass("saykit.Emitter2D")
export default class SKEmitter2D extends SKEffectEmitter {
	@property({ type: cc.ParticleSystem, visible: false, override: true }) system: any = null;
	@property(cc.Float)
	get delay(): number {
		return this._delay;
	}
	set delay(value: number) {
		this._delay = value < 0 ? 0 : value;

		this._calculateLifeTime();
	}
	@property(cc.Float) _delay: number = 0;
	@property([cc.SpriteFrame])
	textures: any[] = [];

	private _timer: number = 0;

	protected _init(): void {
		this._calculateLifeTime();
	}
	protected _onLoad(): void {
		this._calculateLifeTime();
	}
	protected _update(dt: number): void {
		if (!this.active) return;

		const prevTime = this._timer;
		const nextTime = this._timer + dt;

		if (prevTime <= this.delay && nextTime >= this.delay && !this.isPlaying) {
			this.isPlaying = true;
			this.system.resetSystem();
		}

		if (prevTime <= this.lifeTime && nextTime >= this.lifeTime && this.isPlaying) {
			this._stop();
		}

		this._timer = nextTime;
	}
	protected _play(): void {
		if (!this.system) return;

		this.active = true;
		this._timer = 0;
		this._applyRandomTexture();

		if (this.delay <= 0) {
			this.isPlaying = true;
			this.system.resetSystem();
		}
	}
	protected _stop(): void {
		if (!this.system) return;

		this.active = false;
		this.isPlaying = false;
		this.system.resetSystem();
		this.system.stopSystem();
	}
	protected _clear(): void {
		this._stop();
		this.system = null;
	}
	protected _calculateLifeTime(): void {
		this.lifeTime = this.delay + this.system.duration + this.system.life + this.system.lifeVar;
	}

	private _applyRandomTexture(): void {
		const l = this.textures.length;

		if (l < 1) return;

		let randomIndex = Math.round(Math.random() * l);
		let randomTexture = this.textures[randomIndex];

		if (!(randomTexture instanceof cc.SpriteFrame)) return;

		this.system.spriteFrame = randomTexture;
	}
}

saykit.Emitter2D = SKEmitter2D;
