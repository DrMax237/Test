const DefaultEditorClipListEnum = cc.Enum({ None: 0 });

const SKEditorClipList =
	CC_EDITOR &&
	cc.Class({
		extends: cc.Component,

		editor: CC_EDITOR && {
			executeInEditMode: true,
		},

		properties: {
			isUseCustomKey: {
				get() {
					return this._isUseCustomKey;
				},
				set(value) {
					this._isUseCustomKey = value;

					if (this._isUseCustomKey) {
						this.customKey = this._key;
					} else {
						const sourceEnum = cc.Enum(this.getObjectSourceEnum());
						this.basicKey = sourceEnum[this._key] || 0;
					}
				},
			},
			key: {
				get() {
					return this._key;
				},
				set(value) {
					this._key = value;

					const animator = this.__animator;
					const clipList = (animator && animator.clipList) || null;

					this.clip = (clipList && clipList[this._key]) || null;
				},
				visible: false,
			},
			basicKey: {
				get() {
					if (this.isUseCustomKey) return 0;
					const sourceEnum = cc.Enum(this.getObjectSourceEnum());
					const sourceIndex = sourceEnum[this._key] || 0;
					!sourceIndex && (this.key = "None");

					return sourceIndex;
				},

				set(value) {
					if (this.isUseCustomKey) return;
					const sourceEnum = cc.Enum(this.getObjectSourceEnum());
					const sourceName = sourceEnum[value];

					this.key = sourceName || "None";
					this._refreshInspector();
				},

				type: DefaultEditorClipListEnum,
				visible() {
					return !this.isUseCustomKey;
				},
			},
			customKey: {
				get() {
					return this.key;
				},
				set(value) {
					this.key = value;
				},
				visible() {
					return this.isUseCustomKey;
				},
			},
			clip: {
				default: null,
				type: cc.Asset,
				visible() {
					return this._key !== "None";
				},
				notify(old) {
					if (!this.clip instanceof cc.AnimationClip)
						this.clip = null;
				},
			},

			ADD: {
				get() {
					return false;
				},
				set() {
					const animator = this.__animator;
					const clipList = (animator && animator.clipList) || null;

					clipList && (clipList[this.key] = this.clip);

					this._refreshInspector();
				},
				visible() {
					return this._key !== "None";
				},
			},
			REMOVE: {
				get() {
					return false;
				},
				set() {
					const animator = this.__animator;
					const clipList = (animator && animator.clipList) || {};
					delete clipList[this.key];

					this.clip = null;
					this._refreshInspector();
				},
				visible() {
					return this._key !== "None";
				},
			},
			CONSOLE_LOG: {
				get() {
					return false;
				},
				set() {
					const animator = this.__animator;
					const clipList = (animator && animator.clipList) || {};

					if (Object.keys(clipList).length === 0) {
						cc.log("No clips added");
						return;
					}

					for (let key in clipList) {
						const clip = clipList[key];

						if (clipList[key]) {
							cc.log(
								key,
								": clip",
								clip.name,
								" duration: ",
								clip.duration,
								" speed: ",
								clip.speed
							);
						} else {
							cc.warn("! No clip found with key: ", key);
						}
					}
				},
			},

			_key: { default: "None" },
			_isUseCustomKey: { default: false },
			__animator: {
				default: null,
				type: saykit.Animator,
				notify() {
					this._refreshInspector();
				},
			},
		},

		__preload() {
			this._refreshInspector();
		},

		_refreshInspector() {
			const sourceEnum = cc.Enum(this.getObjectSourceEnum());

			cc.Class.Attr.setClassAttr(this, "basicKey", "type", "Enum");
			cc.Class.Attr.setClassAttr(
				this,
				"basicKey",
				"enumList",
				cc.Enum.getList(sourceEnum)
			);

			Editor.Utils.refreshSelectedInspector("node", this.node.uuid);
		},
		getObjectSourceEnum() {
			const defaultList = { None: 0 };
			let index = { value: 1 };

			this.convertParentListForSourceEnum(defaultList, index);

			return defaultList;
		},
		convertParentListForSourceEnum(stateList, index) {
			const clipList =
				(this.__animator && this.__animator.clipList) || {};
			for (let key in clipList) {
				stateList[key] === undefined &&
					(stateList[key] = index.value++);
			}
		},
	});

saykit.EditorClipList = module.exports = SKEditorClipList;
