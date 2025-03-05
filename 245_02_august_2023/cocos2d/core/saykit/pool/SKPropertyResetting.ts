export type NodeTransform = {
	position: cc.Vec3;
	scale: cc.Vec3;
	rotation: cc.Vec3;
};

export default class SKPropertyResetting {
	private _componentExeptions: cc.Component[] = [saykit.PoolableObject];
	private _propertyExeptions: string[] = ["_super", "_name", "node", "_objFlags", "__scriptAsset", "_enabled", "_id", "__eventTargets", "__editor", "_EDITING"];

	private _propertyData: Map<cc.Node, Map<cc.Component, any[]>> = new Map<cc.Node, Map<cc.Component, any[]>>();
	private _transformData: Map<cc.Node, NodeTransform> = new Map<cc.Node, NodeTransform>();

	constructor(node: cc.Node) {
		this._fillData([node]);
	}

	private _fillData(nodes: cc.Node[]): void {
		for (const node of nodes) {
			const nodeData: Map<cc.Component, any[]> = new Map<cc.Component, any[]>();
			const components = node._components;
			for (const component of components) {
				if (this._componentExeptions.find(c => component instanceof c)) continue;

				const ownKeys = Object.getOwnPropertyNames(component);
				const propertyData = [];
				for (const key of ownKeys) {
					if (this._propertyExeptions.indexOf(key) !== -1) continue;

					const publicKeyName = key.replace(/^_N\$/g, "").replace(/^_/g, "");
					const publicValue = component[publicKeyName];
					if (publicValue !== undefined) {
						propertyData.push({ key: publicKeyName, value: publicValue });
					} else {
						propertyData.push({key: key, value: component[key]});
					}
				}

				nodeData.set(component, propertyData);
			}

			this._propertyData.set(node, nodeData);
			this._transformData.set(node, {
				position: node.position.clone(),
				scale: new cc.Vec3(node.scaleX, node.scaleY, node.scaleZ),
				rotation: node.eulerAngles.clone(),
			});

			if (node.children && node.children.length > 0) {
				this._fillData(node.children);
			}
		}
	}

	public reset(): void {
		this._propertyData.forEach((componentData, node) => {
			componentData.forEach((props, component) => {
				for (const prop of props) {
					component[prop.key] = prop.value;
				}
			});
		});

		this._transformData.forEach((value, node) => {
			node.setPosition(value.position);
			node.setScale(value.scale);

			if (node.is3DNode) {
				node.eulerAngles = value.rotation;
			} else {
				node.angle = value.rotation.z;
			}
		});
	}
}

saykit.PropertyResetting = SKPropertyResetting;
