const POOL_POSITION = cc.v3(-20000, -20000, 0);

export default class SKPoolManager {
	private static _instance: SKPoolManager = null;
	private _pools: saykit.Pool[] = [];
	private _poolNode: cc.Node = null;

	constructor() {
		const instance = SKPoolManager._instance;
		if (instance) {
			return instance;
		}

		SKPoolManager._instance = this;

		cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this._onSceneLaunch, this);
	}

	public get poolNode(): cc.Node | cc.Scene {
		return this._poolNode || cc.director.getScene();
	}

	public findPool(data: cc.Prefab | cc.Node | string): saykit.Pool {
		if (!this._checkPoolData(data)) return null;

		const name = this._getPoolDataName(data);
		for (const pool of this._pools) {
			if (pool.name === name) {
				return pool;
			}
		}

		return null;
	}

	public getPool(data: cc.Prefab | cc.Node | string): saykit.Pool {
		if (!this._checkPoolData(data)) return null;

		const pool = this.findPool(data);

		if (!pool && typeof data !== "string") {
			return this._createPool(data);
		}

		return pool;
	}

	public fromPool(data: cc.Prefab | cc.Node | string): cc.Node {
		const pool = this.getPool(data);
		if (!pool) {
			cc.warn("Pool can not be found", data);
			return null;
		}

		return pool.pop();
	}

	public toPool(node: cc.Node): void {
		const poolableObject: saykit.PoolableObject = node.getComponent(saykit.PoolableObject) || node.addComponent(saykit.PoolableObject);
		if (poolableObject) {
			poolableObject.returnToPool();
		}
	}

	private _createPool(data: cc.Prefab | cc.Node): saykit.Pool {
		const pool = new saykit.Pool(data);
		this._pools.push(pool);

		return pool;
	}

	private _checkPoolData(data: cc.Prefab | cc.Node | string): boolean {
		if (data instanceof cc.Prefab || data instanceof cc.Node || typeof data === "string") return true;

		cc.warn("Pool can not be found by this type", typeof data);
		return false;
	}

	private _getPoolDataName(data: cc.Prefab | cc.Node | string): string {
		if (data instanceof cc.Prefab) {
			return data.name;
		} else if (data instanceof cc.Node) {
			return data.poolName || data.name;
		} else if (typeof data === "string") {
			return data;
		}

		cc.warn("Pool name is not exist by this type", typeof data);
		return null;
	}

	private _createPoolNode(): void {
		this._poolNode = new cc.Node("PoolNode");
		this._poolNode.is3DNode = true;
		this._poolNode.setParent(cc.director.getScene());
		this._poolNode.setPosition(POOL_POSITION);
		this._poolNode.opacity = 0;
	}

	private _onSceneLaunch(): void {
		if (CC_EDITOR || this._poolNode) return;

		this._createPoolNode();

		for (const pool of this._pools) {
			if (pool) {
				pool.placeToPoolNode();
			}
		}
	}
}

saykit.PoolManager = SKPoolManager;
saykit.poolManager = new SKPoolManager();
