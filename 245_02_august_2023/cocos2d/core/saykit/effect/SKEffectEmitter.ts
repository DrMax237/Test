const { ccclass, property } = cc._decorator;

@ccclass("saykit.EffectEmitter")
export default class SKEffectEmitter {
	@property get systemName(): string | null {
		return this.name;
	}

	@property get lifeTimeVisible(): number {
		return this.lifeTime;
	}

	@property({ visible: false }) system: any = null;
	@property({ type: cc.Float, visible: false }) lifeTime: number = -1;
	@property({ visible: false }) active: boolean = false;
	@property({ visible: false }) isPlaying: boolean = false;

	@property() protected _effect: any = null;

	get name(): string | null {
		return this.system ? this.system.name : null;
	}

	public init(system: any, effect: any): void {
		this.system = system;
		this._effect = effect;

		this._init();
	}
	public onLoad(): void {
		this._onLoad();
	}
	public update(dt: number): void {
		this._update(dt);
	}
	public play(): void {
		this._play();
	}
	public stop(): void {
		this._stop();
	}
	public clear(): void {
		this._clear();
	}
	public reset(): void {
		this._reset();
	}

	protected _init(): void {}
	protected _onLoad(): void {}
	protected _update(dt: number): void {}
	protected _play(): void {}
	protected _stop(): void {}
	protected _clear(): void {}
	protected _reset(): void {}
	protected _calculateLifeTime(): void {}
}

saykit.EffectEmitter = SKEffectEmitter;
