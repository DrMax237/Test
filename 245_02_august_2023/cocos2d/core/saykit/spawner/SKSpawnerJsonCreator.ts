const { ccclass, property, menu } = cc._decorator;

const EPSILON = 2.2204460492503130808472633361816e-16;

@ccclass("saykit.SpawnerJsonCreator")
@menu("SayKit/Spawner/JsonCreator")
export default class SKSpawnerJsonCreator extends cc.Component {
	@property(cc.Boolean)
	get CREATE_JSON(): boolean {
		return false;
	}
	set CREATE_JSON(value: boolean) {
		this._CREATE_JSON();
	}

	protected onLoad(): void {
		this.destroy();
	}

	private _CREATE_JSON(): void {
		let holder = this.node;

		for (let child of this.node.children) {
			if (child.name === "Holder") {
				holder = child;
				break;
			}
		}

		const children = holder.children;

		let string = "[";

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			let childString = "\n{";
			const nameString = '\n"name": "' + child.name + '",';
			const positionString =
				'\n"position": { "x": ' +
				this._round(child.x) +
				', "y": ' +
				this._round(child.y) +
				', "z": ' +
				this._round(child.z) +
				" },";
			const rotation = child.eulerAngles;
			const rotationString =
				'\n"rotation": { "x": ' +
				this._round(rotation.x) +
				', "y": ' +
				this._round(rotation.y) +
				', "z": ' +
				this._round(rotation.z) +
				" },";
			const scaleString =
				'\n"scale": { "x": ' +
				this._round(child.scaleX) +
				', "y": ' +
				this._round(child.scaleY) +
				', "z": ' +
				this._round(child.scaleZ) +
				" }";
			const childStringEnd = i === children.length - 1 ? "\n}" : "\n},";

			childString += nameString;
			childString += positionString;
			childString += rotationString;
			childString += scaleString;
			childString += childStringEnd;

			string += childString;
			string += "\n";
		}

		string += "]";

		cc.log(string);
	}
	private _round(x: number): number {
		return Math.round((x + EPSILON) * 1000) / 1000;
	}
}

saykit.SpawnerJsonCreator = SKSpawnerJsonCreator;
