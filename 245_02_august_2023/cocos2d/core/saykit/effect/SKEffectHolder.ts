import SKEffect from "./SKEffect";

const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.EFFECT_HOLDER_ADD = "EFFECT_HOLDER_ADD";
saykit.GameEvent.EFFECT_HOLDER_REMOVE = "EFFECT_HOLDER_REMOVE";

@ccclass("saykit.EffectHolder")
@menu("SayKit/Effect/Holder")
export default class SKEffectHolder extends cc.Component {
	@property(cc.String)
	get key(): string {
		return this._key === "" ? this.node.name : this._key;
	}
	set key(value: string) {
		this._key = value;
	}
	@property(cc.String) private _key: string = "";

	protected onLoad(): void {
		cc.systemEvent.on(saykit.GameEvent.EFFECT_HOLDER_ADD, this.onEffectHolderAdd, this);
	}

	private _add(effect: SKEffect): void {
		effect.node.setParent(this.node);
	}
	private _remove(effect: SKEffect): void {
		if (effect.node.parent === this.node) {
			effect.node.removeFromParent();
		}
	}

	protected onEffectHolderAdd(key: string, effect: SKEffect): void {
		if (this.key !== key || !(effect instanceof SKEffect)) return;

		this._add(effect);
	}
	protected onEffectHolderRemove(key: string, effect: SKEffect): void {
		if (this.key !== key || !(effect instanceof SKEffect)) return;

		this._remove(effect);
	}
}

saykit.EffectHolder = SKEffectHolder;
