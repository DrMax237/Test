import SKEffectEmitter from "./SKEffectEmitter";

const { ccclass, property } = cc._decorator;

@ccclass("saykit.Emitter3D")
export default class SKEmitter3D extends SKEffectEmitter {
	@property({ type: cc.ParticleSystem3D, visible: false, override: true }) system: any = null;

	protected _init(): void {
		this._calculateLifeTime();
	}
	protected _onLoad(): void {
		this._calculateLifeTime();
	}
	protected _update(dt: number): void {}
	protected _play(): void {
		if (!this.system) return;

		this.active = true;
		this.isPlaying = true;
		this.system.play();
	}
	protected _stop(): void {
		if (!this.system) return;

		this.active = false;
		this.isPlaying = false;
		this.system.stop();
	}
	protected _clear(): void {
		this._stop();
		this.system = null;
	}
	protected _calculateLifeTime(): void {
		let lifeTime = 0;

		switch (this.system.startLifetime.mode) {
			case cc.CurveRange.Mode.Constant:
				lifeTime = this.system.duration + this.system.startLifetime.constant;
				break;
			case cc.CurveRange.Mode.TwoConstants:
				lifeTime = this.system.duration + Math.max(this.system.startLifetime.constantMin, this.system.startLifetime.constantMax);
				break;
		}

		this.lifeTime = lifeTime;
	}
}

saykit.Emitter3D = SKEmitter3D;
