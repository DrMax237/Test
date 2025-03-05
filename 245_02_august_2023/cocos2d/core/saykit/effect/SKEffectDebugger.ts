import SKEffect from "./SKEffect";
import SKEffectHolder from "./SKEffectHolder";
import { SKEffectManager, IEffectSpawnParams } from "./SKEffectManager";

const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.EffectDebugger")
@menu("SayKit/Effect/Debugger")
export default class SKEffectDebugger extends cc.Component {
	@property(cc.Boolean) SPAWN_LOG: boolean = false;
	@property(cc.Vec3) debugHolderPosition: any = cc.v3();

	private _effectManager: SKEffectManager | null = null;

	protected onLoad(): void {
		this._effectManager = this.node.getComponent(SKEffectManager);
		this._createDebugHolder();
	}
	protected onEnable(): void {
		this._subscribeToEvents(true);
	}
	protected onDisable(): void {
		this._subscribeToEvents(false);
	}

	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		cc.systemEvent[func](cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
	}
	private _createDebugHolder(): void {
		const node = new cc.Node("EFFECT_DEBUG_HOLDER");
		node.setParent(cc.director.getScene());
		node.addComponent(SKEffectHolder);
		node.setPosition(this.debugHolderPosition);

		node.is3DNode = true;
	}
	private _spawnWithDebugCode(keyCode: number): void {
		if (!this._effectManager) return;

		let effect: SKEffect | null = null;

		for (let prefab of this._effectManager.prefabs) {
			if (!prefab || !prefab.data) continue;

			effect = prefab.data.getComponent(SKEffect);

			if (effect && effect.DEBUG_CODE === keyCode) break;

			effect = null;
		}

		if (!effect) return;

		const spawnParams: IEffectSpawnParams = {
			key: effect.key,
			holder: "EFFECT_DEBUG_HOLDER",
		};

		if (this.SPAWN_LOG) {
			spawnParams.onSpawnAll = () => {
				cc.log("spawn complete", effect.key);
			};
			spawnParams.onSpawn = (e: SKEffect) => {
				cc.log("spawn", e.key);
			};
			spawnParams.onStart = (e: SKEffect) => {
				cc.log("start", e.key);
			};
			spawnParams.onComplete = (e: SKEffect) => {
				cc.log("complete", e.key);
			};
		}

		cc.systemEvent.emit(saykit.GameEvent.EFFECT_SPAWN, spawnParams);
	}

	protected onKeyDown(event: { keyCode: number }): void {
		this._spawnWithDebugCode(event.keyCode);
	}
}

saykit.EffectDebugger = SKEffectDebugger;
