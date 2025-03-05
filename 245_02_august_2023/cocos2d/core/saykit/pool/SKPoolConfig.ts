const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.SKPoolConfig")
@menu("SayKit/Pool/PoolConfig")
export default class SKPoolConfig extends cc.Component {
	@property(cc.String) configKey: string = "Default";
	@property(cc.Boolean) autoExtend: boolean = true;
	@property(cc.Integer) preInstantiateCount: number = 0;

	protected __preload(): void {
		cc.systemEvent.emit(saykit.GameEvent.ADD_ITEM, "pool_config_" + this.configKey, this);
	}
}

saykit.PoolConfig = SKPoolConfig;
