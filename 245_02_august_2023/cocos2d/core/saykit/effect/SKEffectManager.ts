import SKEffect from "./SKEffect";
import SKEffectDebugger from "./SKEffectDebugger";
import { SKEffectEmitConfig } from "./SKEffectEmitConfig";

const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.EFFECT_SPAWN = "EFFECT_SPAWN";

export interface IEffectSpawnParams {
	key: string;

	holder?: any; //string | cc.Node
	duration?: number;
	endless?: boolean;
	out?: SKEffect[];
	config?: string | SKEffectEmitConfig;

	delay?: number;
	rotation?: any; //cc.Quat | cc.Vec3 | number
	scale?: any; //cc.Vec3 | cc.Vec2 | number
	position?: any; //cc.Vec3 | cc.Vec2
	worldScale?: any; //cc.Vec3 | cc.Vec2 | number
	worldRotation?: any; //cc.Quat | cc.Vec3 | number
	worldPosition?: any; //cc.Vec3 | cc.Vec2

	onSpawnAll?: { (effects: SKEffect[]): void };
	onSpawn?: { (effects: SKEffect): void };
	onStart?: { (effect: SKEffect): void };
	onUpdate?: { (effect: SKEffect): void };
	onComplete?: { (effect: SKEffect): void };
}

@ccclass("saykit.EffectManager")
@menu("SayKit/Effect/Manager")
export class SKEffectManager extends cc.Component {
	@property(cc.Boolean)
	get DEBUG(): boolean {
		return this._DEBUG;
	}
	set DEBUG(value: boolean) {
		this._DEBUG = value;

		if (this._DEBUG) {
			this.node.getComponent(SKEffectDebugger) || this.node.addComponent(SKEffectDebugger);
		} else {
			this.node.removeComponent(SKEffectDebugger);
		}
	}
	@property(cc.Boolean) _DEBUG: boolean = false;

	@property(cc.Boolean)
	get REFRESH_LIST(): boolean {
		return false;
	}
	set REFRESH_LIST(value: boolean) {
		this._REFRESH_PREFABS_LIST();
	}
	@property({ type: [cc.Prefab] }) prefabs: any[] = [];
	@property() keyAdditiviListPrefabs: string = "None";

	public prefabsList: Record<string, any> = {};
	public configsList: Record<string, SKEffectEmitConfig[]> = {};

	protected onLoad(): void {
		this._init();
	}
	protected onEnable(): void {
		this._subscribeToEvents(true);
	}
	protected onDisable(): void {
		this._subscribeToEvents(false);
	}

	public spawnEffect(params: IEffectSpawnParams): SKEffect[] | null {
		return this._spawnEffect(params);
	}

	private _REFRESH_PREFABS_LIST(): void {
		this.prefabs = this.prefabs.filter((prefab) => prefab instanceof cc.Prefab);
	}
	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		cc.systemEvent[func](saykit.GameEvent.EFFECT_SPAWN, this.onSpawnEffect, this);
	}
	private _init(): void {
		this._createLists();
		this._createPools();
	}
	private _createLists(): void {
		for (let prefab of this.prefabs) {
			this._addPrefabToPrefabList(prefab);
		}

		const dictionaryList = saykit.dictionary.get(this.keyAdditiviListPrefabs);
		const list = dictionaryList instanceof Object ? (dictionaryList.list instanceof Object ? dictionaryList.list : dictionaryList) : {};
		for (let key in list) {
			this._addPrefabToPrefabList(list[key], key);
		}
	}

	private _addPrefabToPrefabList(prefab: cc.Prefab, key: string = null): void {
		if (!prefab || !prefab.data) return;
		const effect = prefab.data.getComponent(SKEffect);
		if (!effect) return;

		this.prefabsList[key || effect.key] = prefab;

		if (effect.spawnConfigs instanceof Array && effect.spawnConfigs.length > 0) {
			this.configsList[key || effect.key] = effect.spawnConfigs;
		}

		delete effect.spawnConfigs;
	}

	private _getSpawnConfig(key: string, configKey: string = "default"): SKEffectEmitConfig | null {
		const configs = this.configsList[key];

		if (!configs) return null;

		for (let config of configs) {
			if (config && config.key === configKey) return config;
		}

		return null;
	}
	private _createPools(): void {
		if (!saykit.poolManager) {
			cc.warn("EffectManager:>> No Pools connected to project");
			return;
		}

		for (let prefab of this.prefabs) {
			if (!prefab) continue;

			saykit.poolManager.getPool(prefab);
		}
	}
	private _spawnEffect(params: IEffectSpawnParams): SKEffect[] | null {
		const config = params.config instanceof SKEffectEmitConfig ? params.config : this._getSpawnConfig(params.key, params.config);

		if (config) {
			return this._spawnWithConfig(params, config);
		} else {
			return this._spawnDefault(params);
		}
	}
	private _spawnEffectByKey(key: string): SKEffect | null {
		const prefab = this.prefabsList[key];

		if (!prefab) {
			cc.warn(`EffectManager:>> No Prefab with key: "${key}"`);
			return null;
		}
		if (!saykit.poolManager) {
			cc.warn("EffectManager:>> No Pools connected to project");
			return null;
		}

		const pool = saykit.poolManager.getPool(prefab);
		const node = pool ? pool.pop() : null;
		const effect = node ? node.getComponent(SKEffect) : null;

		if (!effect) {
			cc.warn("EffectManager:>> No SKEffect component on prefab", key);
			node.destroy();
			return;
		}

		return effect;
	}
	private _spawnDefault(params: IEffectSpawnParams): SKEffect[] {
		const out: SKEffect[] = [];
		const effect = this._spawnEffectByKey(params.key);

		if (effect) {
			effect && effect.spawn(params);
			out.push(effect);
		}

		params.out = out;
		params.onSpawnAll && params.onSpawnAll(out);

		return out;
	}
	private _spawnWithConfig(params: IEffectSpawnParams, config: SKEffectEmitConfig): SKEffect[] {
		const out: SKEffect[] = [];
		const sequence = config.generateEmitSequence();

		for (let item of sequence) {
			if (!item) continue;

			const effect = this._spawnEffectByKey(params.key);

			if (effect) {
				effect && effect.spawn({ ...params }, item);
				out.push(effect);
			}
		}

		params.out = out;
		params.onSpawnAll && params.onSpawnAll(out);

		return out;
	}

	protected onSpawnEffect(params: IEffectSpawnParams): void {
		if (!params) return;

		this._spawnEffect(params);
	}
}

saykit.EffectManager = SKEffectManager;
saykit.effectManager = new SKEffectManager();
