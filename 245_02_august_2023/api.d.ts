declare let CC_JSB: boolean;
declare let CC_NATIVERENDERER: boolean;
declare let CC_EDITOR: boolean;
declare let CC_PREVIEW: boolean;
declare let CC_TEST: boolean;
declare let CC_DEBUG: boolean;

declare let cc: {
	// polyfills: {
	//     destroyObject? (object: any): void;
	// };
	[x: string]: any;
};

declare let Editor: any;

// https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type KeyPartial<T, K extends keyof T> = { [P in K]?: T[P] };
type OmitType<Base, Type> = KeyPartial<Base, AllowedNames<Base, Type>>;
type ConstructorType<T> = OmitType<T, Function>;

declare interface IWritableArrayLike<T> {
	readonly length: number;
	[index: number]: T;
}

declare let module: {
	exports: object;
};

declare const spVars: Record<
	string,
	{
		value: number | string | boolean | object | null;
		desc?: string | null;
		type: "bool" | "string" | "int" | "float" | "color" | "enum";
	}
> & {
	stage_redirect: { value: string; type: "string" };
	settings_redirector: { value: string | object; type: "string" };
	stage_queue: {
		value: {
			screens?: string[];
			elements?: string[];

			callbacks?: {
				timeout: number;
				target: string;

				type: "property" | "function" | "event";
				key: string;

				value?: any;
				args: any[];
			}[];
			subscriptions?: {
				event?: string;

				arguments: string;
				function: string;
			}[];
		}[];
		type: "string";
	};
};

declare function spClick(type: string): void;

declare namespace saykit {
	export let GameEvent: {
		[key: string]: string;

		UI_SCREEN_TOGGLE: string;
		UI_ELEMENT_TOGGLE: string;

		VIRTUAL_JOYSTICK_PLACE: string;
		VIRTUAL_JOYSTICK_MOVE: string;
		VIRTUAL_JOYSTICK_RETURN: string;
		VIRTUAL_JOYSTICK_LOCK: string;

		UI_BAR_PROGRESS_ADD: string;
		UI_BAR_PROGRESS_CHANGE: string;
		UI_BAR_PROGRESS_SET: string;

		UI_COUNTER_ADD: string;
		UI_COUNTER_SET: string;
		UI_COUNTER_CHANGE: string;

		UI_FLASH_SHOW: string;

		EFFECT_SPAWN: string;
		EFFECT_HOLDER_ADD: string;
		EFFECT_HOLDER_REMOVE: string;

		SPAWNER_SPAWN_OBJECTS: string;
		SPAWNER_DELETE_OBJECTS: string;

		SHAKER_PLAY: string;
		SHAKER_STOP: string;

		STAGE_ADD_SCREENS: string;
		STAGE_ADD_ELEMENTS: string;
		SWITCH_STAGE: string;
		START_NEXT_STAGE: string;
		RESTART_STAGE: string;
		START_STAGE: string;

		SOUND_PLAY: string;
	};

	export let Event: {
		[key: string]: string;

		SIZE_CHANGE: string;
	};

	//#region localization
	export class Localization {
		constructor();

		language: any;

		public get(key: string): string;
	}

	export let localization: Localization;
	//#endregion

	//#region Shaker
	enum PropertyType {
		EulerAngleX = 0,
		EulerAngleY = 1,
		EulerAngleZ = 2,
		LightIntensity = 3,
		LightRange = 4,
	}
	export interface IShakerParams {
		key?: string;
		node?: any;
		power?: number;

		onStart?: { (shaker: Shaker): void } | null;
		onUpdate?: { (shaker: Shaker): void } | null;
		onComplete?: { (shaker: Shaker): void } | null;

		out?: Shaker;
	}
	class Oscillator {
		velocity: number;
		damping: number;
		mass: number;
		stiffness: number;
		startOffset: number;
		offset: number;
	}
	class OscillatorMinMax {
		velocityMinMax: any;
		dampingMinMax: any;
		massMinMax: any;
		stiffnessMinMax: any;
		startOffsetMinMax: any;
		offsetMinMax: any;

		velocity: number;
		damping: number;
		mass: number;
		stiffness: number;
		startOffset: number;
		offset: number;
	}
	class ShakerConfig {
		isCustomProperty: boolean;
		nodeProperty: string;
		basicProperty: PropertyType;
		isOnlyPositiveValues: boolean;
		isMinMax: boolean;
		oscillators: Oscillator[];
		oscillatorsMinMax: OscillatorMinMax[];
		startValue: number | null;
	}
	export class Shaker {
		get key(): string;
		set key(value: string);

		DEBUG_KEY: string;
		get DEBUG_CODE(): number;

		duration: number;
		isSensitiveToTimeScale: boolean;

		shakerConfigs: ShakerConfig[];

		public play(params?: IShakerParams): void;
		public stop(): void;
	}
	export class PhysicsManager {
		public physicsManager: any;
		public colliderManager: any;
		public physicsManager3D: any;

		public initCannon3D(): void;
		public initColliderBox2D(): void;
		public initBox2D(): void;
	}
	//#endregion

	//#region Sound
	export enum SoundActions {
		Play = 0,
		Loop = 1,
		Pause = 2,
		Stop = 3,
	}
	export class SoundConfig {
		key: string;
		action: SoundActions;
		isTheOnlySound: boolean;
		isVolumeChange: boolean;
		isVolumeRandom: boolean;
		volume: number;
		volumeMinMax: any; // cc.Vec2
	}
	class SoundDebugConfig {
		DEBUG_KEY: string;
		keyClip: string;
		keyConfig: string;

		get DEBUG_CODE(): number;
	}
	export class SoundDebug {
		configs: SoundDebugConfig[];
	}
	class SKClip {
		key: string;
		audioClip: any; //cc.AudioClip
	}
	export class SoundDictionary {
		clips: SKClip[];
	}
	class ClipID {}
	export class SoundManager {}

	export let soundManager: SoundManager;
	//#endregion

	//#region Spawner
	enum SpawnerConfigType {
		JsonAsset = 0,
		PrefabKeys = 1,
		Dictionary = 2,
		spVars = 3,
	}
	export class SpawnerConfig {
		type: SpawnerConfigType;
		jsonConfig: any;
		prefabKeys: string[];
		key: string;
		configKey: string;
	}
	export class Spawner extends cc.Component {
		static readonly ConfigType: any;

		get key(): string;
		set key(value: string);

		holder: any;
		dictionaryKey: string;
		defaultValue: string;
		spawnOnLoad: boolean;

		configs: SpawnerConfig[];
	}
	export class SpawnerJsonCreator {}
	export class SpawnerCollection {
		prefabs: any[];

		getItem(name: string): any;
		getPrefab(name: string): any;
		addPrefab(prefab: any): void;
	}
	export let spawnerCollection: SpawnerCollection;
	//#endregion

	//#region Effect
	class EffectEmitter {
		lifeTime: number;
		active: boolean;
		isPlaying: boolean;

		get name(): string | null;

		public init(system: any, effect: any): void;
		public onLoad(): void;
		public update(dt: number): void;
		public play(): void;
		public stop(): void;
		public clear(): void;
		public reset(): void;
	}
	class Emitter2D extends EffectEmitter {
		textures: any[];

		get delay(): number;
		set delay(value: number);
	}
	class Emitter3D extends EffectEmitter {}
	class EmitterAnimated extends EffectEmitter {
		get delay(): number;
		set delay(value: number);
	}
	export class Effect extends cc.Component {
		/**
		!#en If true effect will be destroyed after *destroyTime*,
		else effect will last for it's duration
		*/
		isForceDestroy: boolean;
		/**
		!#en The time after which the effect will be destroyed
		*/
		destroyTime: number;
		/**
		!#en Debug keyboard key
		*/
		DEBUG_KEY: string;
		spawnConfigs: EffectEmitConfig[];
		emitters: EffectEmitter[];

		/**
		!#en Effect key to spawn. Default is node.name
		*/
		get key(): string;
		/**
		!#en Effect key to spawn. Default is node.name
		*/
		set key(value: string);

		/**
		!#en Debug keyboard code
		*/
		get DEBUG_CODE(): number;

		/**
		!#en Init effect.
		*/
		public init(): void;
		/**
		!#en Play effect.
		*/
		public play(): void;
		/**
		!#en Stop effect.
		*/
		public stop(): void;
		/**
		!#en Clear all effect emitters data
		*/
		public clear(): void;
		/**
		!#en Reset effect.
		*/
		public reset(): void;
		/**
		!#en Remove effect and send to pool.
		*/
		public remove(): void;
		/**
		!#en Is called automaticaly by EffectManager
		@param params - Spawn params *IEffectSpawnParams*
		@param emitParams - Emit params *IEmitSequenceItem*
		*/
		public spawn(params: IEffectSpawnParams, emitParams?: IEmitSequenceItem): void;
		/**
		!#en Set effect parent
		@param holder - If string then EFFECT_HOLDER_ADD will be sent with holder as key
		*/
		public setParent(holder: any): void;
		/**
		!#en Set effect local rotation
		@param position
		*/
		public setPosition(position: any): void;
		/**
		!#en Set effect world position
		@param worldPosition
		*/
		public setWorldPosition(worldPosition: any): void;
		/**
		!#en Set effect local rotation
		@param rotation
		*/
		public setRotation(rotation: any): void;
		/**
		!#en Set effect world rotation
		@param worldRotation
		*/
		public setWorldRotation(worldRotation: any): void;
		/**
		!#en Set effect local scale
		@param scale
		*/
		public setScale(scale: any): void;
		/**
		!#en Set effect world scale
		@param worldScale
		*/
		public setWorldScale(worldScale: any): void;
	}
	export class EffectHolder extends cc.Component {
		get key(): string;
		set key(value: string);
	}
	export class EffectDebugger extends cc.Component {
		SPAWN_LOG: boolean;
		debugHolderPosition: any;
	}
	export interface IEmitSequenceItem {
		delay: number;

		rotation?: any; //number | cc.Vec3
		scale?: any; //cc.Vec3 | number
		position?: any; //cc.Vec3

		worldRotation?: any; //number | cc.Vec3
		worldScale?: any; //cc.Vec3 | number
		worldPosition?: any; //cc.Vec3
	}
	export interface IEffectSpawnParams {
		key: string;

		holder?: any; //string | cc.Node
		duration?: number;
		endless?: boolean;
		out?: Effect[];
		config?: string | EffectEmitConfig;

		delay?: number;
		rotation?: any; //cc.Quat | cc.Vec3 | number
		scale?: any; //cc.Vec3 | cc.Vec2 | number
		position?: any; //cc.Vec3 | cc.Vec2
		worldScale?: any; //cc.Vec3 | cc.Vec2 | number
		worldRotation?: any; //cc.Quat | cc.Vec3 | number
		worldPosition?: any; //cc.Vec3 | cc.Vec2

		onSpawnAll?: { (effects: Effect[]): void };
		onSpawn?: { (effects: Effect): void };
		onStart?: { (effect: Effect): void };
		onUpdate?: { (effect: Effect): void };
		onComplete?: { (effect: Effect): void };
	}

	enum NumberMode {
		Constant = 0,
		MinMax = 1,
	}
	enum EmitMode {
		Default = 0,
		Interval = 1,
		Duration = 2,
		Bursts = 3,
	}
	enum AreaMode {
		Point = 0,
		Box = 1,
		Sphere = 2,
	}
	enum RotationMode {
		Angle = 0,
		Vec3 = 1,
	}
	enum ScaleMode {
		Number = 0,
		Vec3 = 1,
	}
	enum SpaceMode {
		Local = 0,
		World = 1,
	}

	class Box {
		size: any;
		center: any;

		public getRandomPoint(): any;
	}
	class Sphere {
		radius: number;
		center: any;

		public getRandomPoint(): any;
	}
	class ExtendedNumber {
		mode: NumberMode;
		value: number;
		minValue: number;
		maxValue: number;

		ctor(value: number): void;

		static create(value: number): ExtendedNumber;

		public getValue(): number;
	}
	class ExtendedVector {
		mode: NumberMode;
		value: any;
		minValue: any;
		maxValue: any;

		ctor(value: any): void;

		static create(value: any): ExtendedVector;

		public getValue(): any;
	}
	class Burst {
		time: number;
		count: ExtendedNumber;
	}

	export class EffectEmitConfig {
		key: string;
		delay: ExtendedNumber;
		emitMode: EmitMode;
		interval: number;
		duration: number;
		count: ExtendedNumber;
		bursts: Burst[];
		areaMode: AreaMode;
		spaceMode: SpaceMode;
		box: Box;
		sphere: Sphere;
		rotationMode: RotationMode;
		angle: ExtendedNumber;
		rotation: ExtendedVector;
		scaleMode: ScaleMode;
		scaleNum: ExtendedNumber;
		scaleVec: ExtendedVector;

		public generateEmitSequence(): IEmitSequenceItem[];
	}
	export class EffectManager extends cc.Component {
		get DEBUG(): boolean;
		set DEBUG(value: boolean);

		prefabsList: Record<string, any>;
		configsList: Record<string, EffectEmitConfig[]>;

		public spawnEffect(params: IEffectSpawnParams): Effect[] | null;
	}
	export class EffectTuner extends cc.Component {
		get INIT(): boolean;
		set INIT(value: boolean);

		get PLAY(): boolean;
		set PLAY(value: boolean);

		get STOP(): boolean;
		set STOP(value: boolean);

		get CLEAR(): boolean;
		set CLEAR(value: boolean);

		EDIT_SPAWN: boolean;

		get EDIT_EMITTER(): number;
		set EDIT_EMITTER(value: number);

		get CURRENT_EMITTER(): EffectEmitter | null;
		get SPAWN_CONFIGS(): EffectEmitConfig[];
	}
	export let effectManager: EffectManager;
	//#endregion

	//#region Dictionary
	export class Dictionary {
		items: Record<string, DictionaryItem>;

		static instance: Dictionary | null;

		/**
		!#en Returns the element assigned to the given key
		@param {String} key - Key
		@returns {DictionaryItem} Out value
		*/
		getItem(key: string): DictionaryItem;

		/**
		!#en Returns the value of the element assigned to the given key
		@param {String} key - Key
		@returns {Any} Out value
		*/
		getItemValue(key: string): any;

		/**
		!#en Returns the value of the element assigned to the given key
		@param {String} key - Key
		@returns {Any} Out value
		*/
		get(key: string): any;

		/**
		!#en Change the element assigned to the given key
		@param {String} key - Key
		@param {Any} value - Assigned value
		@returns {Any} Out resulting value
		*/
		set(key: string, value: any): any;

		/**
		!#en Adds a new value to the list
		@param {String} key - Key
		@param {Any} value - Value, default = 0
		@param {String} event - Value change event, default = "NONE"
		*/
		add(key: string, value?: any, event?: string): void;

		/**
		!#en Change the value of the element assigned to the given key
		@param {String} key - Key
		@param {Any} value - Assigned value
		*/
		changeItemValue(key: string, value: any): void;

		/**
		!#en Change the element assigned to the given data
		@param {String} key - Key
		@param { { add?: number; sub?: number; mul?: number; }} value - Change data(add, sub, mul)
		@returns {Any} Out resulting value
		*/
		set(key: string, value: { add?: number; sub?: number; mul?: number }): any;
	}
	export class DictionaryItem {
		/**
		!#en Event dispatched when value changes
		*/
		event: string;

		/**
		!#en Value
		*/
		get value(): any;
		set value(value: any);
	}
	export let dictionary: Dictionary;
	//#endregion

	//#region Redirector
	export class Redirector {
		/**
		!#en If redirects can be only after untap event for unity
		*/
		isCheckUnityCondition: boolean;
		/**
		!#en Redirect
		@param {String} type - Analytics type
		*/
		public redirect(type: string): void;
	}
	export let redirector: Redirector;
	//#endregion

	//#region StageManager
	export class StageManager {
		screens: string[];
		elements: string[];

		/**
		!#en Start Previous Stage
		*/
		public startPrevStage(): void;

		/**
		!#en Start Next Stage
		*/
		public startNextStage(): void;

		/**
		!#en Restart Stage
		*/
		public restartStage(): void;

		/**
		!#en Add screens
		@param keyScreens - String Key Screens, you can send String[] or use many paramentrs
		*/
		public addScreens(keyScreens: string | string[], ...otherKeyScreens: string[]): void;

		/**
		!#en Add Elements
		@param keyElements - String Key Elements, you can send String[] or use many paramentrs
		*/
		public addElements(keyElements: string | string[], ...otherKeyElements: string[]): void;
	}
	export let stageManager: StageManager;
	//#endregion StageManager

	//#region Pool

	export class PropertyResetting {
		constructor(node: any);
		public reset(): void;
	}

	export class PoolConfig extends cc.Component {
		public configKey: string;
		public autoExtend: boolean;
		public preInstantiateCount: number;
	}

	export class PoolableObject extends cc.Component {
		public activateCallback: () => void;
		public deactivateCallback: () => void;
		public get pool(): Pool;
		public init(pool: Pool): void;
		public activate(): void;
		public deactivate(): void;
		public placeToPoolNode(): void;
		public returnToPool(): void;
	}

	export class Pool {
		constructor(data: any);
		public get name(): string;
		public push(poolableObject: PoolableObject): void;
		public pop(): any;
		public placeToPoolNode(): void;
		public removeFromStack(poolableObject: PoolableObject): void;
	}

	export class PoolManager {
		get poolNode(): any;

		/**
			!#en Searches pool among the existing ones
			@param {cc.Prefab} prefab - prefab
			@returns {Pool} Pool
			*/
		public findPool(prefab: any): Pool;

		/**
			!#en Searches pool or created
			@param {cc.Prefab} prefab - prefab
			@returns {Pool} Pool
			*/
		public getPool(prefab: any): Pool;

		/**
			!#en Return node to pool
			@param {cc.Node} node - node
		 */
		public toPool(node: any): void;

		/**
			!#en Get node from pool
			@param {cc.Prefab | cc.Node | string} data - prefab, node or string
			@returns {cc.Node} Node
		 */
		public fromPool(data: any): any;
	}

	export const poolManager: PoolManager;
	//#endregion

	//#region Ui Base
	enum UiScreenType {
		None = 0,
		Start = 1,
		Ingame = 2,
		Result = 3,
		Tutorial = 4,
		AlwaysOn = 5,
		Redirect = 6,
	}
	export class UiScreen extends cc.Component {
		static readonly UiScreenType: any;

		get isCustomType(): boolean;
		set isCustomType(value: boolean);

		get customType(): string;
		set customType(value: string);

		get basicType(): UiScreenType;
		set basicType(value: UiScreenType);

		get type(): UiScreenType;

		get isInput(): boolean;
		set isInput(value: boolean);

		get active(): boolean;
		set active(value: boolean);

		get REFRESH_LIST(): boolean;
		set REFRESH_LIST(value: boolean);

		uiElements: any[];

		public toggleInput(isOn: boolean): void;
		public toggleUiElements(isOn: boolean, isInstant: boolean, callback: (isOn: boolean, screen: UiScreen) => void): void;
		public getUiElements(): saykit.UiElement[];
	}
	export class UiScreenCommand {
		public onScreenEnable(screen: saykit.UiScreen, isInstant: boolean, callback: () => void): void;
		public onScreenDisable(screen: saykit.UiScreen, isInstant: boolean, callback: () => void): void;
		public onAllElementsToggled(isOn, screen): void;
	}
	export class UiElement extends cc.Component {
		toggleWithScreen: boolean;
		activeOnStart: boolean;
		skipShow: boolean;
		skipHide: boolean;
		stopIdleOnHide: boolean;

		active: boolean;

		get key(): string;

		public toggle(isOn: boolean, isInstant: boolean, callback: () => void): void;
	}
	export class AnimatedUiElement extends UiElement {
		set showClip(value: any);
		get showClip(): any;

		set idleClip(value: any);
		get idleClip(): any;

		set hideClip(value: any);
		get hideClip(): any;

		protected _showEnd(): void;
		protected _onIdleEnd(): void;
		protected _onHideEnd(): void;
		protected _setupAnimation(): void;

		protected _animation: any | null;
		protected _showClip: any | null;
		protected _idleClip: any | null;
		protected _hideClip: any | null;
	}
	export class TweenedUiElement extends UiElement {
		showTween: saykit.Tween;
		idleTween: saykit.Tween;
		hideTween: saykit.Tween;
	}
	export let UiScreenCommands: {
		[key: string]: UiScreenCommand;
	};
	//#endregion Ui Base

	//#region Virtual Joystick
	export class VirtualJoystick extends AnimatedUiElement {
		resetOnLock: boolean;
		returnOnLock: boolean;
		dispatchedEvent: string;
		rangeValue: number;
		stick: any;

		get pad(): any;
		set pad(node: any);

		get value(): any;
		set value(value: any);

		get isLocked(): boolean;
		set isLocked(isLock: boolean);
	}
	//#endregion Virtual Joystick

	//#region UiBar
	export class UiBar extends AnimatedUiElement {
		progress: number;
		fillSpeed: number;

		public addProgress(value: number): void;
		public changeProgress(value: number): void;
		public setProgress(value: number): void;
	}
	export class UiBarSized extends UiBar {
		get barFill(): any;
		set barFill(node: any);

		fullSize: number;
	}
	export class UiBarFilled extends UiBar {
		get barFill(): any;
		set barFill(sprite: any);

		fillMin: number;
		fillMax: number;
	}
	//#endregion UiBar

	//#region Flash
	export class UiFlash extends AnimatedUiElement {}
	//#endregion Flash

	//#region UiCounter
	enum CountMode {
		Update = 0,
		Tween = 1,
	}
	enum DisplayMode {
		Round = 0,
		Floor = 1,
		Ceil = 2,
		Float = 3,
	}
	export class UiCounter extends AnimatedUiElement {
		countSpeed: number;
		countMode: CountMode;
		displayMode: DisplayMode;
		fractionalLength: number;
		easing: string;

		get count();
		set count(value: number);

		static readonly CountMode: CountMode;
		static readonly DisplayMode: DisplayMode;

		public addValue(value: number): void;
		public changeValue(value: number): void;
		public setValue(value: number): void;
	}
	export class UiCounterLabel extends UiCounter {
		get findLabels(): boolean;
		set findLabels(value: boolean);

		labels: any[];
	}
	export class UiCounterSprite extends UiCounter {
		holder: any;

		get anchor(): number;
		set anchor(value: number);

		get interval(): number;
		set interval(value: number);

		digits: SpriteFrameDigitsList;
	}
	export class SpriteFrameDigitsList {
		d0: any;
		d1: any;
		d2: any;
		d3: any;
		d4: any;
		d5: any;
		d6: any;
		d7: any;
		d8: any;
		d9: any;
		dot: any;
		minus: any;
		plus: any;

		public getFrame(char: string): any;
	}
	//#endregion UiCounter

	//#region Tutorial
	export class Tutorial extends AnimatedUiElement {}
	//#endregion Tutorial

	//#region Texts
	export class LocalizationLabel extends cc.Component {
		get localizationKey(): string;
		set localizationKey(value: string);

		disableItalicForGlyphs: boolean;
		disableFontForNonEnglish: boolean;

		// public createLabel(): void;
		public setText(localizationKey: string): void;
	}
	export class WrappedLocalizationLabel {
		get key(): string;
		set key(value: string);

		public create(parent: any, name: string): void;
	}

	export class LocalizationText extends cc.Component {}
	//#endregion Texts

	//#region Input
	export class SKInputManager {
		constructor();

		public add(key, protoOrCommand): void;
	}
	export class IInputCommand {
		constructor(manager: SKInputManager);

		public onDown(touch, place, target): void;
		public onMove(touch, place, target): void;
		public onUp(touch, place, target): void;
		public onCancel(touch, place, target): void;
	}
	export class InputTouchInfo {
		constructor(event);

		time: number;
		location: any;
		worldPositions: object;
		worldPosition: any;
	}
	export class InputTouch {
		constructor(id, event);

		get id(): number;

		down: InputTouchInfo;
		last: InputTouchInfo;
		current: InputTouchInfo;

		public static create(event): InputTouch;
		public static refresh(event): InputTouch;
		public static destroy(event): void;
		public static get touches(): InputTouch[];
	}
	export class InputCatcher extends cc.Component {
		public toggle(isOn: boolean): void;
	}
	export class InputSource {
		add(key: string, id: number): number;
		get(target, name): InputSource;
	}
	export let inputManager: SKInputManager;
	export let InputType: {
		None: 0;

		Down: 1;
		Move: 2;
		Up: 3;
		Canсel: 4;
	};
	//#endregion Input

	//#region Resize
	class SKBaseValue {}
	class SKUniversalValue extends SKBaseValue {
		public set(value: SKUniversalValue);
		public lerp(from: SKUniversalValue, to: SKUniversalValue, ratio: number);
		public inverse(isX: boolean, isY: boolean, isZ: boolean);
	}
	class SKSeparateValue extends SKBaseValue {
		public set(value: SKSeparateValue);
		public lerp(from: SKSeparateValue, to: SKSeparateValue, ratio: number);
		public inverse(isX: boolean, isY: boolean, isZ: boolean);
	}
	class SKSizeUniversalValue extends SKUniversalValue {
		portrait: any;
		landscape: any;
	}
	class SKSizeSeparateValue extends SKSeparateValue {
		portraitTablet: any;
		landscapeTablet: any;
		portraitPhone: any;
		landscapePhone: any;
	}
	class SKVec3UniversalValue extends SKUniversalValue {
		portrait: any;
		landscape: any;
	}
	class SKVec3SeparateValue extends SKSeparateValue {
		portraitTablet: any;
		landscapeTablet: any;
		portraitPhone: any;
		landscapePhone: any;
	}
	class SKVec2UniversalValue extends SKUniversalValue {
		portrait: any;
		landscape: any;
	}
	class SKVec2SeparateValue extends SKSeparateValue {
		portraitTablet: any;
		landscapeTablet: any;
		portraitPhone: any;
		landscapePhone: any;
	}
	class SKNumberUniversalValue extends SKUniversalValue {
		portrait: number;
		landscape: number;
	}
	class SKNumberSeparateValue extends SKSeparateValue {
		portraitTablet: number;
		landscapeTablet: number;
		portraitPhone: number;
		landscapePhone: number;
	}
	class SKResizeValue {
		zValueType: any;
		zValueLerpRatio: number;

		isSeparate: boolean;
		is3D: boolean;

		public getInitialValue(): number;
		public getInitialValue(): any;
		public getInitialValue(): any;
		public getInitialValue(): any;
	}
	class SKResizeScale extends SKResizeValue {
		valueType: number;
		value: SKBaseValue;

		public getValue(selfSize: any, spaceSize: any, angle: number): any;
		public getValue(selfSize: any, spaceSize: any, angle: number): any;
	}
	class SKResizeSize extends SKResizeValue {
		valueType: number;
		value: SKBaseValue;

		public getValue(selfSize: any, spaceSize: any): any;
		public getOriginalSize(): any;
	}
	class SKResizePosition extends SKResizeValue {
		valueType: number;
		value: SKBaseValue;

		public getValue(spaceSize: any): any;
		public getValue(spaceSize: any): any;
	}
	class SKResizeAnchor extends SKResizeValue {
		valueType: number;
		value: SKBaseValue;

		public getValue(): any;
		public getValue(): any;
	}
	class SKResizeRotation extends SKResizeValue {
		valueType: number;
		value: SKBaseValue;

		public getValue(): number;
		public getValue(): any;
	}
	export class Resize extends cc.Component {
		isRelativeToParent: boolean;
		is3D: boolean;
		isSeparate: boolean;

		sizeReference: any;

		isChangingPosition: boolean;
		isChangingScale: boolean;
		isChangingSize: boolean;
		isChangingRotation: boolean;
		isChangingAnchor: boolean;

		position: SKResizePosition;
		scale: SKResizeScale;
		size: SKResizeSize;
		rotation: SKResizeRotation;
		anchor: SKResizeAnchor;

		public resize(): void;
	}

	export let ResizeValues: {
		Position: SKResizePosition;
		Scale: SKResizeScale;
		Size: SKResizeSize;
		Anchor: SKResizeAnchor;
		Rotation: SKResizeRotation;
		// ScaleType,
		// SizeType,
		// PositionType,
	};
	export let ResizeValueTypes: {
		SizeUniversalValue: SKSizeUniversalValue;
		SizeSeparateValue: SKSizeSeparateValue;
		Vec3UniversalValue: SKVec3UniversalValue;
		Vec3SeparateValue: SKVec3SeparateValue;
		Vec2UniversalValue: SKVec2UniversalValue;
		Vec2SeparateValue: SKVec2SeparateValue;
		NumberUniversalValue: SKNumberUniversalValue;
		NumberSeparateValue: SKNumberSeparateValue;
	};
	export let ScaleType: any;
	export let ZValueType: any;
	export let SizeType: any;
	export let PositionType: any;

	//#endregion

	//#region Tweens

	//#region Tweens enums
	enum TweenType {
		Tweener = 0,
		Sequence = 1,
		Callback = 2,
	}
	enum AutoPlay {
		None = 0,
		AutoPlaySequences = 1,
		AutoPlayTweeners = 2,
		All = 3,
	}
	enum AxisConstraint {
		None = 0,
		X = 2,
		Y = 4,
		Z = 8,
		W = 16,
	}
	enum CapacityIncreaseMode {
		TweenersAndSequences = 0,
		TweenersOnly = 1,
		SequencesOnly = 2,
	}
	enum FilterType {
		All = 0,
		Id = 1,
		AllExceptIds = 2,
	}
	enum LoopType {
		Restart = 0,
		Yoyo = 1,
		Incremental = 2,
	}
	enum OperationType {
		Complete = 0,
		Despawn = 1,
		Flip = 2,
		Goto = 3,
		Pause = 4,
		Play = 5,
		PlayForward = 6,
		PlayBackwards = 7,
		Rewind = 8,
		SmoothRewind = 9,
		Restart = 10,
		TogglePause = 11,
		IsTweening = 12,
	}
	enum RewindCallbackMode {
		FireIfPositionChanged = 0,
		FireAlwaysWithRewind = 1,
		FireAlways = 2,
	}
	enum UpdateMode {
		Update = 0,
		Goto = 1,
		IgnoreOnUpdate = 2,
		IgnoreOnComplete = 3,
	}
	enum UpdateType {
		Normal = 0,
		Late = 1,
		Manual = 2,
	}
	//#endregion Tweens enums

	export class IPlugOptions {
		public reset(): void;
	}
	export class FloatOptions extends saykit.IPlugOptions {
		snapping: boolean;

		public reset(): void;
	}
	export class VectorOptions extends saykit.IPlugOptions {
		axisConstraint: saykit.AxisConstraint;
		snapping: boolean;

		public reset(): void;
	}

	export class PluginsManager {
		public static setDefaultPlugin<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			endValue: T2
		): void;
		public static purgeAll(): void;
	}
	export abstract class ABSTweenPlugin<T1, T2, TPlugOptions extends saykit.IPlugOptions> {
		public abstract reset(t: saykit.TweenerCore<T1, T2, TPlugOptions>): void;
		public abstract setFrom(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			isRelative: boolean,
			fromValue?: T2,
			setImmediately?: boolean
		): void;
		public abstract convertToStartValue(t: saykit.TweenerCore<T1, T2, TPlugOptions>, value: T1): T2;
		public abstract setRelativeEndValue(t: saykit.TweenerCore<T1, T2, TPlugOptions>): void;
		public abstract setChangeValue(t: saykit.TweenerCore<T1, T2, TPlugOptions>): void;
		public abstract getSpeedBasedDuration(options: TPlugOptions, unitsXSecond: number, changeValue: T2): number;
		public abstract evaluateAndApply(
			options: TPlugOptions,
			t: saykit.Tween,
			isRelative: boolean,
			getter: () => T1,
			setter: (value: T1) => void,
			elapsed: number,
			startValue: T2,
			changeValue: T2,
			duration: number
		): void;
	}
	export class FloatPlugin extends saykit.ABSTweenPlugin<number, number, saykit.FloatOptions> {
		public setFrom(
			t: saykit.TweenerCore<number, number, saykit.FloatOptions>,
			isRelative: boolean,
			fromValue?: number,
			setImmediately?: boolean
		): void;
		public convertToStartValue(t: saykit.TweenerCore<number, number, saykit.FloatOptions>, value: number): number;
		public setRelativeEndValue(t: saykit.TweenerCore<number, number, saykit.FloatOptions>): void;
		public setChangeValue(t: saykit.TweenerCore<number, number, saykit.FloatOptions>): void;
		public getSpeedBasedDuration(options: saykit.FloatOptions, unitsXSecond: number, changeValue: number): number;
		public evaluateAndApply(
			options: saykit.FloatOptions,
			t: saykit.Tween,
			isRelative: boolean,
			getter: () => number,
			setter: (value: number) => void,
			elapsed: number,
			startValue: number,
			changeValue: number,
			duration: number
		): void;
		public reset(t: saykit.TweenerCore<number, number, saykit.FloatOptions>): void;
	}
	export class Vector3Plugin extends saykit.ABSTweenPlugin<any, any, saykit.VectorOptions> {
		public setFrom(
			t: saykit.TweenerCore<any, any, saykit.VectorOptions>,
			isRelative: boolean,
			fromValue?: any,
			setImmediately?: boolean
		): void;
		public convertToStartValue(t: saykit.TweenerCore<any, any, saykit.VectorOptions>, value: any): any;
		public setRelativeEndValue(t: saykit.TweenerCore<any, any, saykit.VectorOptions>): void;
		public setChangeValue(t: saykit.TweenerCore<any, any, saykit.VectorOptions>): void;
		public getSpeedBasedDuration(options: saykit.VectorOptions, unitsXSecond: number, changeValue: any): number;
		public evaluateAndApply(
			options: saykit.VectorOptions,
			t: saykit.Tween,
			isRelative: boolean,
			getter: () => any,
			setter: (value: any) => void,
			elapsed: number,
			startValue: any,
			changeValue: any,
			duration: number
		): void;
		public reset(t: saykit.TweenerCore<any, any, saykit.VectorOptions>): void;
	}
	export class ArrayPlugin extends saykit.ABSTweenPlugin<any, any, saykit.FloatOptions> {
		public setFrom(
			t: saykit.TweenerCore<any, any, saykit.FloatOptions>,
			isRelative: boolean,
			fromValue?: number,
			setImmediately?: boolean
		): void;
		public convertToStartValue(t: saykit.TweenerCore<any, any, saykit.FloatOptions>, value: any): number;
		public setRelativeEndValue(t: saykit.TweenerCore<any, any, saykit.FloatOptions>): void;
		public setChangeValue(t: saykit.TweenerCore<any, any, saykit.FloatOptions>): void;
		public getSpeedBasedDuration(options: saykit.FloatOptions, unitsXSecond: number, changeValue: number): number;
		public evaluateAndApply(
			options: saykit.FloatOptions,
			t: saykit.TweenerCore<any, any, saykit.FloatOptions>,
			isRelative: boolean,
			getter,
			setter,
			elapsed: number,
			startValue: any,
			changeValue: any,
			duration: number
		): void;
		public reset(t: saykit.TweenerCore<any, any, saykit.FloatOptions>): void;
	}

	export class DOTween {
		static timeScale: number;
		static useSmoothDeltaTime: boolean;
		static maxSmoothUnscaledTime: number;
		static rewindCallbackMode: saykit.RewindCallbackMode;

		static defaultUpdateType: saykit.UpdateType;
		static defaultTimeScaleIndependent: boolean;
		static defaultAutoPlay: saykit.AutoPlay;
		static defaultAutoKill: boolean;
		static defaultLoopType: saykit.LoopType;
		static defaultRecyclable: boolean;
		static defaultEaseType: Function;
		static initialized: boolean;

		static get totalActiveTweens(): number;
		static get totalPlayingTweens(): number;
		static get playingTweens(): Array<saykit.Tween>;
		static get pausedTweens(): Array<saykit.Tween>;

		static autoInit(): void;
		public static init(recycleAllByDefault: boolean): void;
		public static setTweensCapacity(tweenersCapacity: number, sequencesCapacity: number): void;
		public static clear(destroy: boolean, isApplicationQuitting: boolean): void;
		public static clearCachedTweens(): void;
		public static validate(): number;
		public static manualUpdate(deltaTime: number, unscaledDeltaTime: number): void;

		public static add<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			getter: () => T1,
			setter: (value: T1) => void,
			endValue: T2,
			duration: number,
			params?: saykit.TweenParams | any
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addWithProps<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			props: Object,
			duration: number,
			easing?: Function,
			autoStart?: boolean,
			delay?: number,
			snapping?: boolean,
			startCallback?: Function,
			completeCallback?: Function,
			updateCallback?: Function
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addSequence(): saykit.Sequence;

		public static completeAll(withCallbacks?: boolean): number;
		public static complete(id: any, withCallbacks?: boolean): number;
		public static flipAll(): number;
		public static flip(id: any): number;
		public static gotoAll(to: number, andPlay?: boolean): number;
		public static goto(id: any, to: number, andPlay?: boolean): number;
		public static killAll(complete?: boolean, idsToExclude?: Array<Object>): number;
		public static kill(complete: boolean, id: any): number;
		public static pauseAll(): number;
		public static pause(id: any): number;
		public static playAll(): number;
		public static play(id: any): number;
		public static playBackwardsAll(): number;
		public static playBackwards(id: any): number;
		public static playForwardAll(): number;
		public static playForward(id: any): number;
		public static restartAll(includeDelay?: boolean): number;
		public static restart(id: any, includeDelay?: boolean, changeDelayTo?: number): number;
		public static rewindAll(includeDelay?: boolean): number;
		public static rewind(id: any, includeDelay?: boolean): number;
		public static smoothRewindAll(): number;
		public static smoothRewind(id: any): number;
		public static togglePauseAll(): number;
		public static togglePause(id: any): number;

		public static isTweening(id: any, alsoCheckIfIsPlaying?: boolean): boolean;
		public static tweensById(id: any, playingOnly: boolean, fillableList: Array<saykit.Tween>): Array<saykit.Tween>;

		public static applyTo<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			getter: () => T1,
			setter: (value: T1) => void,
			endValue: T2,
			duration: number,
			plugin?: any
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	export class DOShortcuts extends saykit.DOTween {
		public static addMove<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: any,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addMoveX<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: number,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addMoveY<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: number,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addMoveZ<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: number,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addRotate<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: any,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addJump(
			target: any,
			endValue: any,
			jumpPower: number,
			numJumps: number,
			duration: number,
			snapping?: boolean
		): saykit.Sequence;
		public static addScale<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: any,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addSize<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: any,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addOpacity<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: any,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static addColor<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			target: any,
			endValue: any,
			duration: number,
			snapping?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	export class ABSSequentiable {
		tweenType: saykit.TweenType;
		sequencedPosition: number;
		sequencedEndPosition: number;
		onStartCallback: Function;

		constructor(sequencedPosition?: number, callback?: Function);
	}
	export abstract class Tween extends saykit.ABSSequentiable {
		timeScale: number;
		isBackwards: boolean;
		isInverted: boolean;
		id: any;
		updateType: saykit.UpdateType;
		isIndependentUpdate: boolean;

		onPlayCallback: Function;
		onPauseCallback: Function;
		onRewindCallback: Function;
		onUpdateCallback: Function;
		onStepCompleteCallback: Function;
		onCompleteCallback: Function;
		onKillCallback: Function;

		isFrom: boolean;
		isBlendable: boolean;
		isRecyclable: boolean;
		isSpeedBased: boolean;
		autoKill: boolean;
		duration: number;
		loops: number;
		loopType: saykit.LoopType;
		delay: number;
		isRelative: boolean;
		easeType: Function;
		active: boolean;
		isSequenced: boolean;
		sequenceParent: saykit.Sequence;
		activeId: number;

		get fullPosition(): number;
		set fullPosition(value: number);
		get hasLoops(): boolean;

		creationLocked: boolean;
		startupDone: boolean;
		playedOnce: boolean;
		position: number;
		fullDuration: number;
		completedLoops: number;
		isPlaying: boolean;
		isComplete: boolean;
		elapsedDelay: number;
		delayComplete: boolean;

		public reset(): void;
		public abstract validate(): boolean;
		public abstract updateDelay(elapsed: number): number;
		public abstract startup(): boolean;
		public abstract applyTween(
			prevPosition: number,
			prevCompletedLoops: number,
			newCompletedSteps: number,
			useInversePosition: boolean,
			updateMode: saykit.UpdateMode
		): boolean;
		public static doGoto(t: saykit.Tween, toPosition: number, toCompletedLoops: number, updateMode: saykit.UpdateMode): boolean;
		public static onTweenCallback(callback: Function, t: saykit.Tween, param?: any): boolean;

		public setAutoKill(eautoKillOnCompletion: boolean): saykit.Tween;
		public setId(id: any): saykit.Tween;
		public setLoops(loops: number, loopType?: saykit.LoopType): saykit.Tween;
		public setEase(easeFunc: Function): saykit.Tween;
		public setRecyclable(recyclable: boolean): saykit.Tween;
		public setUpdate(updateType: saykit.UpdateType, isIndependentUpdate: boolean): saykit.Tween;
		public setInverted(inverted: boolean): saykit.Tween;

		public onStart(action: Function): saykit.Tween;
		public onPlay(action: Function): saykit.Tween;
		public onPause(action: Function): saykit.Tween;
		public onRewind(action: Function): saykit.Tween;
		public onUpdate(action: Function): saykit.Tween;
		public onStepComplete(action: Function): saykit.Tween;
		public onComplete(action: Function): saykit.Tween;
		public onKill(action: Function): saykit.Tween;

		public setAs(tweenParams: saykit.TweenParams | saykit.Tween): saykit.Tween;
		public setDelay(delay: number, asPrependedIntervalIfSequence?: boolean): saykit.Tween;
		public setRelative(isRelative?: boolean): saykit.Tween;
		public append(...tweens: Array<saykit.Tween>): saykit.Tween;
		public prepend(t: saykit.Tween): saykit.Tween;
		public join(...tweens: Array<saykit.Tween>): saykit.Tween;
		public insert(atPosition: number, ...tweens: Array<saykit.Tween>): saykit.Tween;
		public appendInterval(interval: number): saykit.Tween;
		public prependInterval(interval: number): saykit.Tween;
		public appendCallback(callback: Function): saykit.Tween;
		public prependCallback(callback: Function): saykit.Tween;
		public insertCallback(atPosition: number, callback: Function): saykit.Tween;
		public from(isRelative: boolean, fromValue?: any, setImmediately?: boolean): saykit.Tween;
		public setSpeedBased(isSpeedBased: boolean): saykit.Tween;
		public setOptions(snapping: boolean): saykit.Tween;
		public setOptionsVec3(axisConstraint: saykit.AxisConstraint, snapping: boolean): saykit.Tween;
		public complete(withCallbacks?: boolean): void;
		public flip(): void;
		public forceInit(): void;
		public goto(to: number, andPlay?: boolean): void;
		public gotoWithCallbacks(to: number, andPlay: boolean): void;
		public kill(complete?: boolean): void;
		public manualUpdate(deltaTime: number, unscaledDeltaTime: number): void;
		public pause(): saykit.Tween;
		public play(): saykit.Tween;
		public playBackwards(): void;
		public playForward(): void;
		public restart(includeDelay?: boolean): void;
		public rewind(includeDelay?: boolean): void;
		public smoothRewind(): void;
		public togglePause(): void;

		public getDelay(): number;
		public getElapsedDelay(): number;
		public getDuration(includeLoops: boolean): number;
		public getElapsed(includeLoops: boolean): number;
		public getElapsedPercentage(includeLoops?: boolean): number;
		public getElapsedDirectionalPercentage(): number;
		public getIsInitialized(): boolean;
		public getIsActive(): boolean;
		public getIsBackwards(): boolean;
		public getIsComplete(): boolean;
		public getIsPlaying(): boolean;
		public getLoops(): number;
		public getCompletedLoops(): number;
	}
	export abstract class Tweener extends saykit.Tween {
		isFromAllowed: boolean;
		hasManuallySetStartValue: boolean;
		customCallbacks: Array<saykit.ABSSequentiable>;

		public abstract setFrom(relative: boolean, fromValue?: any, setImmediately?: boolean): saykit.Tweener;
		public static setup<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			getter: () => T1,
			setter: (value: T1) => void,
			endValue: T2,
			duration: number,
			plugin: saykit.ABSTweenPlugin<T1, T2, TPlugOptions>
		): boolean;
		public static doUpdateDelay<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			elapsed: number
		): number;
		public static doStartup<T1, T2, TPlugOptions extends saykit.IPlugOptions>(t: saykit.TweenerCore<T1, T2, TPlugOptions>): boolean;
		public static doChangeStartValue<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			newStartValue: any,
			newDuration: number
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static doChangeEndValue<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			newEndValue: any,
			newDuration: number,
			snapStartValue: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static doChangeValues<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			t: saykit.TweenerCore<T1, T2, TPlugOptions>,
			newStartValue: any,
			newEndValue: any,
			newDuration: number
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static doInsertCallback<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
			inTweener: saykit.TweenerCore<T1, T2, TPlugOptions>,
			callback: Function,
			atPosition: number
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	export class TweenerCore<T1, T2, TPlugOptions extends saykit.IPlugOptions> extends saykit.Tweener {
		startValue: T2;
		endValue: T2;
		changeValue: T2;

		getter: () => T1;
		setter: (value: T1) => void;

		plugOptions: TPlugOptions;
		tweenPlugin: saykit.ABSTweenPlugin<T1, T2, TPlugOptions>;

		public changeStartValue(newStartValue: Object, newDuration?: number): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public changeEndValue(
			newEndValue: Object,
			newDuration?: number,
			snapStartValue?: boolean
		): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public changeValues(newStartValue: Object, newEndValue: Object, newDuration?: number): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public setFrom(relative: boolean, fromValue?: any, setImmediately?: boolean): saykit.Tweener;
		public reset(): void;
		public validate(): boolean;
		public updateDelay(elapsed: number): number;
		public startup(): boolean;
		public applyTween(
			prevPosition: number,
			prevCompletedLoops: number,
			newCompletedSteps: number,
			useInversePosition: boolean,
			updateMode: saykit.UpdateMode
		): boolean;
	}
	export class Sequence extends saykit.Tween {
		lastTweenInsertTime: number;
		sequencedTweens: Array<saykit.Tween>;

		public static doPrepend(inSequence: saykit.Sequence, t: saykit.Tween): saykit.Sequence;
		public static doInsert(inSequence: saykit.Sequence, t: saykit.Tween, atPosition: number): saykit.Sequence;
		public static doAppendInterval(inSequence: saykit.Sequence, interval: number): saykit.Sequence;
		public static doPrependInterval(inSequence: saykit.Sequence, interval: number): saykit.Sequence;
		public static doInsertCallback(inSequence: saykit.Sequence, callback: Function, atPosition: number): saykit.Sequence;

		public updateDelay(elapsed: number): number;
		public reset(): void;
		public validate(): boolean;
		public startup(): boolean;
		public applyTween(
			prevPosition: number,
			prevCompletedLoops: number,
			newCompletedSteps: number,
			useInversePosition: boolean,
			updateMode: saykit.UpdateMode
		): boolean;

		public static setup(s: saykit.Sequence): void;
		public static doStartup(s: saykit.Sequence): boolean;
		public static doApplyTween(
			s: saykit.Sequence,
			prevPosition: number,
			prevCompletedLoops: number,
			newCompletedSteps: number,
			useInversePosition: boolean,
			updateMode: saykit.UpdateMode
		): boolean;
	}
	export class TweenManager {
		static maxActive: number;
		static maxTweeners: number;
		static maxSequences: number;
		static hasActiveTweens: boolean;
		static hasActiveDefaultTweens: boolean;
		static hasActiveLateTweens: boolean;
		static hasActiveManualTweens: boolean;
		static totActiveTweens: number;
		static totActiveDefaultTweens: number;
		static totActiveLateTweens: number;
		static totActiveManualTweens: number;
		static totActiveTweeners: number;
		static totActiveSequences: number;
		static totPooledTweeners: number;
		static totPooledSequences: number;
		static totTweeners: number;
		static totSequences: number;
		static isUpdateLoop: boolean;

		public static getTweener<T1, T2, TPlugOptions extends saykit.IPlugOptions>(): saykit.TweenerCore<T1, T2, TPlugOptions>;
		public static getSequence(): saykit.Sequence;
		public static setUpdateType(t: saykit.Tween, updateType: saykit.UpdateType, isIndependentUpdate: boolean): void;
		public static addActiveTweenToSequence(t: saykit.Tween): void;
		public static despawnAll(): number;
		public static despawn(t: saykit.Tween, modifyActiveLists?: boolean): void;
		public static purgeAll(isApplicationQuitting: boolean): void;
		public static purgePools(): void;
		public static setCapacities(tweenersCapacity: number, sequencesCapacity: number): void;
		public static validate(): number;
		public static updateTweensWithType(updateType: saykit.UpdateType, deltaTime: number, independentTime: number): void;
		public static updateTweens(
			t: saykit.Tween,
			deltaTime: number,
			independentTime: number,
			isSingleTweenManualUpdate?: boolean
		): boolean;
		public static filteredOperation(
			operationType: saykit.OperationType,
			filterType: saykit.FilterType,
			id: any,
			optionalBool: boolean,
			optionalFloat: number,
			optionalObj?: Object,
			optionalArray?: Object[]
		): number;
		public static complete(t: saykit.Tween, modifyActiveLists?: boolean, updateMode?: saykit.UpdateMode): boolean;
		public static flip(t: saykit.Tween): boolean;
		public static forceInit(t: saykit.Tween, isSequenced?: boolean): void;
		public static goto(t: saykit.Tween, to: number, andPlay: boolean, updateMode: saykit.UpdateMode): boolean;
		public static pause(t: saykit.Tween): boolean;
		public static play(t: saykit.Tween): boolean;
		public static playBackwards(t: saykit.Tween): boolean;
		public static playForward(t: saykit.Tween): boolean;
		public static restart(t: saykit.Tween, includeDelay: boolean, changeDelayTo: number): boolean;
		public static rewind(t: saykit.Tween, includeDelay: boolean): boolean;
		public static smoothRewind(t: saykit.Tween): boolean;
		public static togglePause(t: saykit.Tween): boolean;

		public static totalPooledTweens(): number;
		public static totalPlayingTweens(): number;
		public static getActiveTweens(playing: boolean, fillableList: Array<saykit.Tween>): Array<saykit.Tween>;
		public static getTweensById(id: any, playingOnly: boolean, fillableList: Array<saykit.Tween>): Array<saykit.Tween>;
	}
	export class TweenExtensions {
		public static complete(t: saykit.Tween, withCallbacks?: boolean): void;
		public static flip(t: saykit.Tween): void;
		public static forceInit(t: saykit.Tween): void;
		public static goto(t: saykit.Tween, to: number, andPlay: boolean): void;
		public static gotoWithCallbacks(t: saykit.Tween, to: number, andPlay: boolean): void;
		public static kill(t: saykit.Tween, complete: boolean): void;
		public static manualUpdate(t: saykit.Tween, deltaTime: number, unscaledDeltaTime: number): void;
		public static pause(t: saykit.Tween): saykit.Tween;
		public static play(t: saykit.Tween): saykit.Tween;
		public static playBackwards(t: saykit.Tween): void;
		public static playForward(t: saykit.Tween): void;
		public static restart(t: saykit.Tween, includeDelay: boolean): void;
		public static rewind(t: saykit.Tween, includeDelay: boolean): void;
		public static smoothRewind(t: saykit.Tween): void;
		public static togglePause(t: saykit.Tween): void;

		public static getCompletedLoops(t: saykit.Tween): number;
		public static getDelay(t: saykit.Tween): number;
		public static getElapsedDelay(t: saykit.Tween): number;
		public static getDuration(t: saykit.Tween, includeLoops: boolean): number;
		public static getElapsed(t: saykit.Tween, includeLoops: boolean): number;
		public static getElapsedPercentage(t: saykit.Tween, includeLoops: boolean): number;
		public static getElapsedDirectionalPercentage(t: saykit.Tween): number;
		public static getIsActive(t: saykit.Tween): boolean;
		public static getIsBackwards(t: saykit.Tween): boolean;
		public static getIsComplete(t: saykit.Tween): boolean;
		public static getIsInitialized(t: saykit.Tween): boolean;
		public static getIsPlaying(t: saykit.Tween): boolean;
		public static getLoops(t: saykit.Tween): number;
	}
	export class TweenSettingsExtensions {
		public static setAutoKill(t: saykit.Tween, eautoKillOnCompletion: boolean): saykit.Tween;
		public static setId(t: saykit.Tween, id: any): saykit.Tween;
		public static setLoops(t: saykit.Tween, loops: number, loopType?: saykit.LoopType): saykit.Tween;
		public static setEase(t: saykit.Tween, easeFunc: Function): saykit.Tween;
		public static setRecyclable(t: saykit.Tween, recyclable: boolean): saykit.Tween;
		public static setUpdate(t: saykit.Tween, updateType: saykit.UpdateType, isIndependentUpdate: boolean): saykit.Tween;
		public static setInverted(t: saykit.Tween, inverted: boolean): saykit.Tween;
		public static onStart(t: saykit.Tween, action: Function): saykit.Tween;
		public static onPlay(t: saykit.Tween, action: Function): saykit.Tween;
		public static onPause(t: saykit.Tween, action: Function): saykit.Tween;
		public static onRewind(t: saykit.Tween, action: Function): saykit.Tween;
		public static onUpdate(t: saykit.Tween, action: Function): saykit.Tween;
		public static onStepComplete(t: saykit.Tween, action: Function): saykit.Tween;
		public static onComplete(t: saykit.Tween, action: Function): saykit.Tween;
		public static onKill(t: saykit.Tween, action: Function): saykit.Tween;
		public static setAs(t: saykit.Tween, tweenParams: saykit.TweenParams | saykit.Tween): saykit.Tween;
		public static setDelay(t: saykit.Tween, delay: number, asPrependedIntervalIfSequence: boolean): saykit.Tween;
		public static setRelative(t: saykit.Tween, isRelative: boolean): saykit.Tween;

		public static insertCallback(t: saykit.Tweener, atPosition: number, callback: Function): saykit.Tween;
		public static from(t: saykit.Tween, isRelative: boolean, fromValue?: any, setImmediately?: boolean): saykit.Tween;
		public static setSpeedBased(t: saykit.Tween, isSpeedBased: boolean): saykit.Tween;
		public static setOptions(t: saykit.Tween, snapping: boolean): saykit.Tween;
		public static setOptionsVec3(t: saykit.Tween, axisConstraint: saykit.AxisConstraint, snapping: boolean): saykit.Tween;
	}
	export class SequenceSettingsExtensions {
		public static append(s: saykit.Sequence, t: saykit.Tween): saykit.Tween;
		public static prepend(s: saykit.Sequence, t: saykit.Tween): saykit.Tween;
		public static join(s: saykit.Sequence, t: saykit.Tween): saykit.Tween;
		public static insert(s: saykit.Sequence, atPosition: number, t: saykit.Tween): saykit.Tween;
		public static appendInterval(s: saykit.Sequence, interval: number): saykit.Tween;
		public static prependInterval(s: saykit.Sequence, interval: number): saykit.Tween;
		public static appendCallback(s: saykit.Sequence, callback: Function): saykit.Tween;
		public static prependCallback(s: saykit.Sequence, callback: Function): saykit.Tween;
		public static insertCallback(s: saykit.Sequence, atPosition: number, callback: Function): saykit.Tween;
	}
	export class TweenParams {
		id: any;
		updateType: saykit.UpdateType;
		isIndependentUpdate: boolean;

		onStartCallback: Function;
		onPlayCallback: Function;
		onPauseCallback: Function;
		onRewindCallback: Function;
		onUpdateCallback: Function;
		onStepCompleteCallback: Function;
		onCompleteCallback: Function;
		onKillCallback: Function;

		isRecyclable: boolean;
		isSpeedBased: boolean;
		autoStart: boolean;
		autoKill: boolean;
		loops: number;
		loopType: saykit.LoopType;
		delay: number;
		isRelative: boolean;
		easeType: Function;
		snapping: boolean;

		public clear(): saykit.TweenParams;
	}

	//#endregion
}
