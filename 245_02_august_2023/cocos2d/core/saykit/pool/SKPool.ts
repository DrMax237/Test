export default class SKPool {
	private readonly _autoExtend: boolean = true;
	private readonly _data: cc.Node = null;
	private _stack: saykit.PoolableObject[] = [];

	constructor(data: cc.Prefab | cc.Node) {
		if (data instanceof cc.Prefab) {
			this._data = data.data;
		} else if (data instanceof cc.Node) {
			const clone = cc.instantiate(data);
			clone.parent = null;
			clone.active = false;
			this._data = clone;
		} else {
			cc.error("Can't create Pool for ", data);
			return;
		}

		this._data.attr({ poolName: this._data.name });

		const poolableObject = this._data.getComponent(saykit.PoolableObject) || this._data.addComponent(saykit.PoolableObject);
		const name = poolableObject.key || this._data.poolName;
		let config = saykit.dictionary.getItemValue("pool_config_" + name);
		if (config === null) {
			config = {
				autoExtend: true,
				preInstantiateCount: 0,
			};
		}

		this._autoExtend = config.autoExtend;
		this._preInstantiateObjects(config.preInstantiateCount);
	}

	public get name(): string {
		return this._data ? this._data.poolName || this._data.name : "";
	}

	public push(poolableObject: saykit.PoolableObject): void {
		if (!(poolableObject instanceof saykit.PoolableObject)) {
			cc.error(poolableObject, "Object is not poolable object");
			return;
		}

		if (poolableObject.pool !== this) {
			cc.error(poolableObject, "Object doesn't belong to this pool");
			return;
		}

		poolableObject.deactivate();
		this._stack.push(poolableObject);
	}

	public pop(): cc.Node {
		let poolableObject = this._stack.pop();

		if (!poolableObject && this._autoExtend) {
			//create new
			poolableObject = this._createFromPrefab();
		}

		if (!poolableObject) return null;

		poolableObject.activate();
		return poolableObject.node;
	}

	public removeFromStack(poolableObject: saykit.PoolableObject): void {
		const index = this._stack.indexOf(poolableObject);
		if (index !== -1) {
			this._stack.splice(index, 1);
		}
	}

	public placeToPoolNode(): void {
		for (const poolableObject of this._stack) {
			if (poolableObject) {
				poolableObject.placeToPoolNode();
			}
		}
	}

	private _preInstantiateObjects(preInstantiateCount: number): void {
		if (this._data === null) return;

		for (let i = 0; i < preInstantiateCount; i++) {
			const poolableObject = this._createFromPrefab();
			if (poolableObject) {
				this.push(poolableObject);
			}
		}
	}

	private _createFromPrefab(): saykit.PoolableObject {
		if (!(this._data instanceof cc.Node)) {
			cc.error("Missing data (cc.Node) in pool", this);
			return null;
		}

		const node = cc.instantiate(this._data);
		node.attr({ poolName: this._data.name });
		const poolableObject: saykit.PoolableObject = node.getComponent(saykit.PoolableObject) || node.addComponent(saykit.PoolableObject);
		if (poolableObject) {
			poolableObject.init(this);
		} else {
			node.destroy(true);
		}

		return poolableObject;
	}
}

saykit.Pool = SKPool;
