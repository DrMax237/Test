const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.SpawnerCollection")
@menu("SayKit/Spawner/Collection")
export default class SKSpawnerCollection extends cc.Component {
	@property(cc.Boolean) HIDE_PREFABS: boolean = false;
	@property(cc.Boolean)
	get REFRESH_LIST(): boolean {
		return false;
	}
	set REFRESH_LIST(value: boolean) {
		this._REFRESH_PREFABS_LIST();
	}
	@property({
		type: [cc.Prefab],
		visible() {
			return !this.HIDE_PREFABS;
		},
	})
	prefabs: any[] = [];

	constructor() {
		super();

		if (!CC_EDITOR) {
			if (saykit.spawnerCollection instanceof SKSpawnerCollection) {
				if (saykit.spawnerCollection !== this) {
					cc.error("Multiple instance of SpawnerCollection");
				}
			} else {
				saykit.spawnerCollection = this;
			}
		}
	}

	protected onLoad(): void {
		this._createPools();
	}

	public getItem(name: string): any {
		const prefab = this.getPrefab(name);

		if (!prefab) {
			cc.warn("SpawnerCollection:>> No prefab with name ", name);

			return null;
		}

		if (!saykit.poolManager) {
			cc.warn("SpawnerCollection:>> No Pools connected to project");

			return null;
		}

		let pool = saykit.poolManager.getPool(prefab);
		const node = pool.pop();

		return node;
	}
	public getPrefab(name: string): any {
		let prefab = null;

		for (let p of this.prefabs) {
			if (p && p.name === name) {
				prefab = p;
				break;
			}
		}

		return prefab;
	}
	public addPrefab(prefab: any): void {
		this._addPrefab(prefab);
	}

	private _REFRESH_PREFABS_LIST(): void {
		this.prefabs = this.prefabs.filter((prefab) => prefab instanceof cc.Prefab);
	}
	private _createPools(): void {
		if (!saykit.poolManager) {
			cc.warn("SpawnerCollection:>> No Pools connected to project");
			return;
		}

		for (let prefab of this.prefabs) {
			if (!prefab) continue;

			saykit.poolManager.getPool(prefab);
		}
	}
	private _addPrefab(prefab: any): void {
		if (!prefab) return;

		const isAlreadyAdded = this.prefabs.indexOf(prefab) !== -1;

		if (isAlreadyAdded) return;

		this.prefabs.push(prefab);

		if (!saykit.poolManager) {
			cc.warn("SpawnerCollection:>> No Pools connected to project");
		}

		saykit.poolManager.getPool(prefab);
	}
}

saykit.SpawnerCollection = SKSpawnerCollection;
