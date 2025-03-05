import { Vec3 } from "../../value-types";
import SKSpawnerCollection from "./SKSpawnerCollection";
import { SKSpawnerConfig, SKSpawnerConfigType } from "./SKSpawnerConfig";

const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.SPAWNER_SPAWN_OBJECTS = "SPAWNER_SPAWN_OBJECTS";
saykit.GameEvent.SPAWNER_DELETE_OBJECTS = "SPAWNER_DELETE_OBJECTS";

export interface ISpawnProperties {
	name: string;
	position: string;
	scale: string;
	rotation: string;
}

@ccclass("saykit.Spawner")
@menu("SayKit/Spawner/Spawner")
export class SKSpawner extends cc.Component {
	@property(cc.String)
	get key(): string {
		return this._key === "" ? this.node.name : this._key;
	}
	set key(value: string) {
		this._key = value;
	}

	@property(cc.Node) holder: any = null;
	@property(cc.String) dictionaryKey: string = "";
	@property(cc.String) defaultValue: string = "Default";
	@property(cc.Boolean) spawnOnLoad: boolean = true;

	@property(cc.Boolean)
	get SPAWN(): boolean {
		return false;
	}
	set SPAWN(value: boolean) {
		this._spawnInEditor();
	}

	@property(cc.Boolean)
	get DELETE(): boolean {
		return false;
	}
	set DELETE(value: boolean) {
		CC_EDITOR && this._deleteObjects();
	}

	@property([SKSpawnerConfig]) configs: SKSpawnerConfig[] = [];

	@property(cc.String) private _key: string = "";
	@property([cc.Node]) private _spawnedObjects: any[] = [];

	static readonly ConfigType = SKSpawnerConfigType;

	protected onLoad(): void {
		this._subscribeToEvents();

		this.spawnOnLoad && this._spawnInGame();
	}

	private _subscribeToEvents(): void {
		this.node.on(saykit.GameEvent.SPAWNER_SPAWN_OBJECTS, this.onSpawnObjects, this);
		this.node.on(saykit.GameEvent.SPAWNER_DELETE_OBJECTS, this.onDeleteObjects, this);

		cc.systemEvent.on(saykit.GameEvent.SPAWNER_SPAWN_OBJECTS, this.onSpawnObjectsByKey, this);
		cc.systemEvent.on(saykit.GameEvent.SPAWNER_DELETE_OBJECTS, this.onDeleteObjectsByKey, this);
	}
	private _spawnInEditor(): void {
		if (!CC_EDITOR) return;

		const collection = this._getSpawnerCollection();

		this._spawnFromCollection(collection);
	}
	private _spawnInGame(): void {
		this._spawnFromCollection((saykit as any).spawnerCollection);
	}
	private _spawnFromCollection(collection: SKSpawnerCollection): void {
		const config = this._getConfiguration();

		if (!config || !collection) return;

		switch (config.type) {
			case SKSpawnerConfigType.JsonAsset:
				{
					if (!config.jsonConfig) return;

					const list = config.jsonConfig.json;

					this._spawnFromList(collection, list);
				}
				break;

			case SKSpawnerConfigType.PrefabKeys:
				{
					if (!config.prefabKeys) return;

					for (let key of config.prefabKeys) {
						const node = collection.getItem(key);

						if (!node) continue;

						node.setParent(this.holder || this.node);
						this._spawnedObjects.push(node);
					}
				}
				break;

			case SKSpawnerConfigType.Dictionary:
				{
					const item = saykit.dictionary.getItem(config.key);

					if (!item || !item.value) return;

					const v = item.value;
					let list = null;

					if (typeof v === "string") list = JSON.parse(v);
					else if (Array.isArray(v)) list = v;
					else if (typeof v === "object") list = v[config.configKey];

					if (!Array.isArray(list)) return;

					this._spawnFromList(collection, list);
				}
				break;
			case SKSpawnerConfigType.spVars:
				{
					if (!spVars || !spVars[config.key] || !spVars[config.key].value) return;

					const v = spVars[config.key].value;
					let list = null;

					if (typeof v === "string") list = JSON.parse(v);
					else if (Array.isArray(v)) list = v;
					else if (typeof v === "object") list = v[config.configKey];

					if (!Array.isArray(list)) return;

					this._spawnFromList(collection, list);
				}
				break;
		}
	}
	private _spawnFromList(collection: SKSpawnerCollection, list: ISpawnProperties[]): void {
		for (let properties of list) {
			const node = collection.getItem(properties.name);

			if (!node) continue;

			this._placeObject(node, properties);
		}
	}
	private _getSpawnerCollection(): SKSpawnerCollection | null {
		let collection = null;
		const scene = cc.director.getScene();

		scene.walk((target) => {
			!collection && (collection = target.getComponent(SKSpawnerCollection));
		}, null);

		return collection;
	}
	private _getConfiguration(): SKSpawnerConfig | null {
		if (this.configs.length === 0) return null;

		const dictionaryItem = saykit.dictionary.getItem(this.dictionaryKey);

		if (dictionaryItem) {
			for (let c of this.configs) {
				if (c.configKey === dictionaryItem.value) {
					return c;
				}
			}
		} else if (this.defaultValue !== "") {
			for (let c of this.configs) {
				if (c.configKey === this.defaultValue) {
					return c;
				}
			}
		} else if (this.configs[0] instanceof SKSpawnerConfig) {
			return this.configs[0];
		}

		return null;
	}
	private _placeObject(node, properties): void {
		node.active = false;

		node.setParent(this.holder || this.node);
		properties.position && node.setPosition(this._getVec3(properties.position));
		properties.scale && node.setScale(this._getVec3(properties.scale));
		properties.rotation && node.setRotation(cc.quat().fromEuler(this._getVec3(properties.rotation)));

		node.active = true;

		this._spawnedObjects.push(node);
	}
	private _deleteObjects(): void {
		for (let i = 0; i < this._spawnedObjects.length; i++) {
			const node = this._spawnedObjects[i];
			node && node.destroy && node.destroy();
			this._spawnedObjects[i] = null;
		}

		this._spawnedObjects.length = 0;
	}
	private _getVec3(property): Vec3 {
		const vec3 = cc.v3();

		vec3.x = +property.x;
		vec3.y = +property.y;
		vec3.z = +property.z;

		return vec3;
	}

	protected onSpawnObjects(): void {
		this._deleteObjects();
		this._spawnInGame();
	}
	protected onDeleteObjects(): void {
		this._deleteObjects();
	}
	protected onSpawnObjectsByKey(key: string): void {
		if (this.key === key) this.onSpawnObjects();
	}
	protected onDeleteObjectsByKey(key: string): void {
		if (this.key !== key) this.onDeleteObjects();
	}
}

saykit.Spawner = SKSpawner;
