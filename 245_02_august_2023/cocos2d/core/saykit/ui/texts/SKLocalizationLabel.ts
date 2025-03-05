const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.LocalizationLabel")
@menu("Ui/LocalizationLabel")
export class SKLocalizationLabel extends cc.Component {
	//#region Editor PRoperties
	@property(cc.String)
	get localizationKey(): string {
		return this._localizationKey;
	}
	set localizationKey(value: string) {
		this._localizationKey = value;

		!CC_EDITOR && this.setText(this.localizationKey);
	}
	@property(cc.Boolean) disableItalicForGlyphs: boolean = false;
	@property(cc.Boolean) disableFontForNonEnglish: boolean = true;
	@property(cc.Boolean) disableBoldForEnglish: boolean = false;
	//#endregion Editor Properties

	//#region Private Properties
	@property(cc.String) _localizationKey: string = "";
	@property(cc.Label) _label: any = null;
	//#endregion Private Properties

	onLoad() {
		this._label = this.node.getComponent(cc.Label);

		this.setText(this.localizationKey);
	}

	public setText(localizationKey: string): void {
		const errorText = CC_EDITOR ? "String '${this.localizationKey}' not found" : "";
		const value = saykit.localization.get(localizationKey) || errorText;

		if (saykit.localization.language !== "en" && this._label && this.disableFontForNonEnglish) {
			this._label.font = null;
		}

		if (saykit.localization.language === "en" && this._label && this.disableBoldForEnglish) {
			this._label.enableBold = false;
		}

		if (this._label) this._label.string = value;

		const isGlyphLanguage =
			saykit.localization.language === "zh" || saykit.localization.language === "ja" || saykit.localization.language === "ko";

		if (this._label) this._label.enableItalic = this._label.enableItalic && (!this.disableItalicForGlyphes || !isGlyphLanguage);
	}
}

saykit.LocalizationLabel = SKLocalizationLabel;
