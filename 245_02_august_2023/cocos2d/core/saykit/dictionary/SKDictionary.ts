const { ccclass, property, executeInEditMode, menu } = cc._decorator;

@ccclass("saykit.DictionaryItem")
export class SKDictionaryItem {
	@property() event: string = "NONE";
	@property()
	get value(): any {
		return this._value;
	}
	set value(value: any) {
		if (CC_EDITOR) return;
		const old = this._value;

		this._value = value;
		const event = this.event || "None";
		if (event !== "NONE" && event !== undefined) {
			cc.systemEvent.emit(event, this.value, old);
		}
	}

	private _value: any = 0;
}

export class SKDictionary {
	items: Record<string, SKDictionaryItem>;

	static instance: SKDictionary | null = null;

	constructor() {
		if (SKDictionary.instance) {
			return SKDictionary.instance;
		}

		SKDictionary.instance = this;

		this.items = {};
		cc.systemEvent.on(saykit.GameEvent.ADD_ITEM, this.onAddItem, this);
		cc.systemEvent.on(saykit.GameEvent.GET_ITEM_VALUE, this.onGetItemValue, this);
		cc.systemEvent.on(saykit.GameEvent.GET_ITEM, this.onGetItem, this);
		cc.systemEvent.on(saykit.GameEvent.CHANGE_ITEM_VALUE, this.onChangeItemValue, this);
	}

	public getItem(key: string): SKDictionaryItem | null {
		const item = this.items[key];
		if (item instanceof SKDictionaryItem) return item;
		else return null;
	}
	public getItemValue(key: string): any | null {
		const item = this.items[key];
		if (item instanceof SKDictionaryItem) return item.value;
		else return null;
	}
	public get(key: string): any | null {
		return this.getItemValue(key);
	}
	public set(key: string, data: any): any | null {
		const item = this.items[key];
		if (item instanceof SKDictionaryItem) {
			switch (true) {
				case typeof item.value === "number" && data instanceof Object:
					if (typeof data.add === "number") {
						item.value += data.add;
					}

					if (typeof data.sub === "number") {
						item.value -= data.sub;
					}

					if (typeof data.mul === "number") {
						item.value *= data.mul;
					}
					break;
				default:
					item.value = data;
					break;
			}

			return item.value;
		} else {
			return null;
		}
	}
	public add(key: string, valueOrDictionaryItem: any = 0, event: string = "NONE"): void {
		if (typeof key !== "string") return;
		if (key === "") return;
		if (valueOrDictionaryItem instanceof SKDictionaryItem) {
			this.items[key] = valueOrDictionaryItem;
		} else {
			if (this.items[key] instanceof SKDictionaryItem) {
				const item = this.items[key];
				event !== "NONE" && (item.event = event);
				item.value = valueOrDictionaryItem;

				return;
			}

			const item = new SKDictionaryItem();
			item.event = event;
			item.value = valueOrDictionaryItem;

			this.items[key] = item;
		}
	}
	public changeItemValue(key: string, value: any): void {
		const item = this.items[key];
		if (item instanceof SKDictionaryItem) {
			item.value = value;
		}
	}

	protected onAddItem(key: string, valueOrDictionaryItem: any, event: string): void {
		this.add(key, valueOrDictionaryItem, event);
	}
	protected onGetItemValue(key: string, callback: { (value: any): void }): void {
		callback instanceof Function && callback(this.getItemValue(key));
	}
	protected onGetItem(key: string, callback: { (value: any): void }): void {
		callback instanceof Function && callback(this.getItem(key));
	}
	protected onChangeItemValue(key: string, value: any): void {
		this.changeItemValue(key, value);
	}
}

saykit.Dictionary = SKDictionary;
saykit.DictionaryItem = SKDictionaryItem;
saykit.dictionary = new SKDictionary();
