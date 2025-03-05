import SKEffect from "./SKEffect";
import { SKEffectEmitConfig } from "./SKEffectEmitConfig";
import SKEffectEmitter from "./SKEffectEmitter";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

let DefaultEmittersList = cc.Enum({ None: 0 });

@ccclass("saykit.EffectTuner")
@executeInEditMode
@menu("SayKit/Effect/Tuner")
export default class SKEffectTuner extends cc.Component {
	@property(cc.Boolean)
	get INIT(): boolean {
		return false;
	}
	set INIT(value: boolean) {
		if (!CC_EDITOR) return;

		if (!this._effect) this._effect = this.node.getComponent(SKEffect);
		this._effect && this._effect.init();
		this._REFRESH_INSPECTOR();
	}

	@property(cc.Boolean)
	get PLAY(): boolean {
		return false;
	}
	set PLAY(value: boolean) {
		if (!CC_EDITOR) return;

		this._effect && this._effect.play();
	}

	@property(cc.Boolean)
	get STOP(): boolean {
		return false;
	}
	set STOP(value: boolean) {
		if (!CC_EDITOR) return;

		this._effect && this._effect.stop();
	}

	@property(cc.Boolean)
	get CLEAR(): boolean {
		return false;
	}
	set CLEAR(value: boolean) {
		if (!CC_EDITOR) return;

		this._effect && this._effect.clear();
		this._REFRESH_INSPECTOR();

		this.EDIT_EMITTER = 0;
	}

	@property(cc.Boolean) EDIT_SPAWN: boolean = false;

	@property({ type: DefaultEmittersList })
	get EDIT_EMITTER(): number {
		const emitterEnum = this._GET_EMITTER_ENUM();

		if (emitterEnum) {
			const emitterIndex = emitterEnum[this._EDIT_EMITTER];

			if (emitterIndex !== undefined) {
				return emitterIndex;
			}
		}

		return 0;
	}
	set EDIT_EMITTER(value: number) {
		const emitterEnum = this._GET_EMITTER_ENUM();
		const emitterName = emitterEnum[value];

		if (emitterEnum !== undefined) {
			this._EDIT_EMITTER = emitterName;

			if (CC_EDITOR) {
				this._REFRESH_INSPECTOR();
			}
		} else {
			this._EDIT_EMITTER = "None";
		}

		this._REFRESH_CURRENT_EMITTER();
	}

	@property({
		type: SKEffectEmitter,
		visible() {
			return this.CURRENT_EMITTER !== null;
		},
	})
	get CURRENT_EMITTER(): SKEffectEmitter | null {
		return this._CURRENT_EMITTER;
	}
	@property({
		type: [SKEffectEmitConfig],
		visible() {
			return this.EDIT_SPAWN;
		},
	})
	get SPAWN_CONFIGS(): SKEffectEmitConfig[] {
		return this._effect ? this._effect.spawnConfigs : [];
	}

	@property(SKEffect) _effect: SKEffect | null = null;
	@property(cc.String) private _EDIT_EMITTER: string = "None";
	@property(SKEffectEmitter) private _CURRENT_EMITTER: SKEffectEmitter | null = null;

	__preload() {
		if (CC_EDITOR) {
			this._REFRESH_INSPECTOR();
			this._REFRESH_CURRENT_EMITTER();
		}
	}

	protected onLoad(): void {
		if (!this._effect) this._effect = this.node.getComponent(SKEffect);

		if (!CC_EDITOR) this.destroy();
	}

	private _REFRESH_INSPECTOR(): void {
		const emittersEnum = this._GET_EMITTER_ENUM();

		(cc.Class as any).Attr.setClassAttr(this, "EDIT_EMITTER", "type", "Enum");
		(cc.Class as any).Attr.setClassAttr(this, "EDIT_EMITTER", "enumList", (cc.Enum as any).getList(emittersEnum));

		Editor.Utils.refreshSelectedInspector("node", this.node.uuid);
	}
	private _GET_EMITTER_ENUM(): any {
		let index = 0;
		const sourceObject = { None: 0 };

		if (this._effect) {
			for (let emitter of this._effect.emitters) {
				if (!emitter || !emitter.name) continue;

				index += 1;
				sourceObject[emitter.name] = index;
			}
		}

		return cc.Enum(sourceObject);
	}
	private _REFRESH_CURRENT_EMITTER(): void {
		let emitter = null;

		if (this._effect) {
			for (let e of this._effect.emitters) {
				if (e.name === this._EDIT_EMITTER) {
					emitter = e;
					break;
				}
			}
		}

		this._CURRENT_EMITTER = emitter;
	}
}

saykit.EffectTuner = SKEffectTuner;
