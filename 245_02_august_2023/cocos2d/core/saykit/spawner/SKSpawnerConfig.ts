const { ccclass, property, menu } = cc._decorator;

export enum SKSpawnerConfigType {
	JsonAsset = 0,
	PrefabKeys = 1,
	Dictionary = 2,
	spVars = 3,
}
cc.Enum(SKSpawnerConfigType);

@ccclass("saykit.SpawnerConfig")
export class SKSpawnerConfig {
	@property({ type: SKSpawnerConfigType }) type: SKSpawnerConfigType = SKSpawnerConfigType.JsonAsset;
	@property({
		type: cc.JsonAsset,
		visible() {
			return this.type === SKSpawnerConfigType.JsonAsset;
		},
	})
	jsonConfig: any = null;

	@property({
		type: [cc.String],
		visible() {
			return this.type === SKSpawnerConfigType.PrefabKeys;
		},
	})
	prefabKeys: string[] = [];

	@property({
		visible() {
			return this.type === SKSpawnerConfigType.Dictionary || this.type === SKSpawnerConfigType.spVars;
		},
	})
	key: string = "";

	@property(cc.String) configKey: string = "Default";
}

saykit.SpawnerConfig = SKSpawnerConfig;
