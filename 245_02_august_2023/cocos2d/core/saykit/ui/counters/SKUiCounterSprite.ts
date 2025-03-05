const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.SpriteFrameDigitsList")
class SpriteFrameDigitsList {
	@property(cc.SpriteFrame) d0: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d1: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d2: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d3: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d4: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d5: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d6: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d7: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d8: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) d9: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) dot: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) minus: any = new cc.SpriteFrame();
	@property(cc.SpriteFrame) plus: any = new cc.SpriteFrame();

	getFrame(char: string): any {
		switch (char) {
			case "0":
				return this.d0;
			case "1":
				return this.d1;
			case "2":
				return this.d2;
			case "3":
				return this.d3;
			case "4":
				return this.d4;
			case "5":
				return this.d5;
			case "6":
				return this.d6;
			case "7":
				return this.d7;
			case "8":
				return this.d8;
			case "9":
				return this.d9;
			case ".":
				return this.dot;
			case "-":
				return this.minus;
			case "+":
				return this.plus;
			default:
				return null;
		}
	}
}

@ccclass("saykit.UiCounterSprite")
@menu("Ui/Counters/CounterSprite")
export class SKUiCounterSprite extends saykit.UiCounter {
	@property(cc.Node) holder: any = null;
	@property(cc.Float)
	get anchor(): number {
		return this._anchor;
	}
	set anchor(value: number) {
		this._anchor = value;

		this._refreshDigitsPlacement();
	}
	@property(cc.Float)
	get interval(): number {
		return this._interval;
	}
	set interval(value: number) {
		this._interval = value;

		this._refreshDigitsPlacement();
	}

	@property(SpriteFrameDigitsList) digits: SpriteFrameDigitsList = new SpriteFrameDigitsList();

	@property([cc.Sprite]) _sprites: any[] = [];
	@property(cc.Float) _anchor: number = 0.5;
	@property(cc.Float) _interval: number = 10;

	onLoad() {
		super.onLoad();
	}

	//#region Protected
	protected _refreshCounter(): void {
		const displayText = this._getDisplayedCount();

		this._refreshDigitsLength(displayText);
		this._refreshDigitsFrames(displayText);
		this._refreshDigitsPlacement();
	}
	//#endregion Protected

	//#region Private
	private _addSpriteNode(): void {
		const node = new cc.Node("Digit");
		node.setParent(this.holder || this.node);

		const sprite = node.addComponent(cc.Sprite);

		this._sprites.push(sprite);
	}
	private _removeSpriteNode(): void {
		const sprite = this._sprites.pop();
		sprite && sprite.node && sprite.node.destroy();
	}
	private _refreshDigitsParent(): void {
		for (let sprite of this._sprites) {
			if (!sprite || !sprite.node) continue;

			sprite.node.setParent(this.holder || this.node);
		}
	}
	private _refreshDigitsLength(displayText: string): void {
		const length = displayText.length;
		const spritesCount = this._sprites.length;
		const max = Math.max(length, spritesCount);

		for (let i = 0; i < max; i++) {
			if (i >= spritesCount) {
				//add
				this._addSpriteNode();
			} else if (i >= length) {
				//remove
				this._removeSpriteNode();
			}
		}
	}
	private _refreshDigitsFrames(displayText: string): void {
		const length = displayText.length;

		for (let i = 0; i < length; i++) {
			const char = displayText[i];
			const frame = this.digits.getFrame(char);

			if (!frame) continue;

			const sprite = this._sprites[i];

			if (!sprite) continue;

			sprite.spriteFrame = frame;
		}
	}
	private _refreshDigitsPlacement(): void {
		const length = this._sprites.length;

		for (let i = 0; i < length; i++) {
			const sprite = this._sprites[i];

			if (!sprite || !sprite.node) continue;

			const x = i * this.interval - this.interval * (length - 1) * this.anchor;
			sprite.node.x = x;
		}
	}
	//#endregion Private
}

saykit.SpriteFrameDigitsList = SpriteFrameDigitsList;
saykit.UiCounterSprite = SKUiCounterSprite;
