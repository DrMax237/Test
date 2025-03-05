const DEFAULT_RATIO = saykit.settings.screenBaseRatio;

const SizeUniversalValue = saykit.ResizeValueTypes.SizeUniversalValue;
const SizeSeparateValue = saykit.ResizeValueTypes.SizeSeparateValue;
const Vec3UniversalValue = saykit.ResizeValueTypes.Vec3UniversalValue;
const Vec3SeparateValue = saykit.ResizeValueTypes.Vec3SeparateValue;
const Vec2UniversalValue = saykit.ResizeValueTypes.Vec2UniversalValue;
const Vec2SeparateValue = saykit.ResizeValueTypes.Vec2SeparateValue;
const NumberUniversalValue = saykit.ResizeValueTypes.NumberUniversalValue;
const NumberSeparateValue = saykit.ResizeValueTypes.NumberSeparateValue;

//Enums
const ScaleType = cc.Enum({
    FitRelative: 0,
    FillRelative: 1,
    UnproportionalRelative: 2,
    Absolute: 3,
});

const ZValueType = cc.Enum({
    EqualsX: 0,
    EqualsY: 1,
    XLerpToY: 2,
    Absolute: 3,
});

const SizeType = cc.Enum({
    Absolute: 0,
    Relative: 1,
});

const PositionType = cc.Enum({
    Relative: 0,
    Absolute: 1,
});

const ResizeValue = cc.Class({
    name: "ResizeValue",

    properties: {
        valueType: { default: null },
        value: null,
        zValueType: {
            default: ZValueType.Absolute,
            type: ZValueType,
            visible() {
                return this.is3D;
            },
        },
        zValueLerpRatio: {
            default: 0.5,
            visible() {
                return this.is3D && this.zValueType === ZValueType.XLerpToY;
            },
        },

        isSeparate: {
            visible: false,
            default: false,
            notify() {
                this._createValue();
            },
        },

        is3D: {
            default: false,
            visible: false,
            notify() {
                this._createValue();
            },
        },
    },

    ctor() {
        this._createValue();
    },

    _createValue() {},

    getInitalValue() {
        const orientation = saykit.settings.isLandscape
            ? "landscape"
            : "portrait";
        let value = this.value[orientation];

        if (this.isSeparate) {
            const suff =
                saykit.settings.screenRatio > DEFAULT_RATIO
                    ? "Phone"
                    : "Tablet";
            value = this.value[orientation + suff];
        }

        return value;
    },
});

const Scale = cc.Class({
    name: "Scale",
    extends: ResizeValue,

    properties: {
        valueType: {
            default: ScaleType.FitRelative,
            type: ScaleType,
            visible: true,
            override: true,
        },
        value: { default: null, override: true },
    },

    _createValue() {
        let valueConstuctor = null;

        switch (true) {
            case this.isSeparate && this.is3D:
                valueConstuctor = Vec3SeparateValue;
                break;
            case this.isSeparate && !this.is3D:
                valueConstuctor = Vec2SeparateValue;
                break;
            case !this.isSeparate && this.is3D:
                valueConstuctor = Vec3UniversalValue;
                break;
            case !this.isSeparate && !this.is3D:
                valueConstuctor = Vec2UniversalValue;
                break;
        }

        if (!valueConstuctor) return;

        this.value = new valueConstuctor();
    },

    getValue(selfSize, spaceSize, angle) {
        const value = this.getInitalValue();
        const size = spaceSize || saykit.settings.gameSize;
        const sizeRotated = this.is3D
            ? cc.v2(size.width, size.height)
            : cc
                  .v2(selfSize.width, selfSize.height)
                  .rotate((angle * Math.PI) / 180);

        const baseX = (size.width * value.x) / Math.abs(sizeRotated.x);
        const baseY = (size.height * value.y) / Math.abs(sizeRotated.y);
        const out = this.is3D ? cc.v3(baseX, baseY, 1) : cc.v2(baseX, baseY);

        switch (this.valueType) {
            case ScaleType.FitRelative:
                {
                    const minScale = Math.min(out.x, out.y);

                    out.x = minScale;
                    out.y = minScale;
                }
                break;

            case ScaleType.FillRelative:
                {
                    const maxScale = Math.max(out.x, out.y);

                    out.x = maxScale;
                    out.y = maxScale;
                }
                break;

            case ScaleType.Absolute:
                out.x = value.x;
                out.y = value.y;
                break;

            case ScaleType.UnproportionalRelative:
            default:
                break;
        }

        if (!this.is3D) return out;

        //calculate z scale based on x and y
        switch (this.zValueType) {
            case ZValueType.EqualsX:
                out.z = out.x;
                break;
            case ZValueType.EqualsY:
                out.z = out.y;
                break;
            case ZValueType.XLerpToY:
                out.z = (out.y - out.x) * this.zValueLerpRatio + out.x;
                break;
            case ZValueType.Absolute:
                out.z = value.z;
                break;
        }

        return out;
    },
});

const Size = cc.Class({
    name: "Size",
    extends: ResizeValue,

    properties: {
        valueType: {
            default: SizeType.Absolute,
            type: SizeType,
            visible: true,
            override: true,
        },
        value: { default: null, override: true },

        _originalSize: { default: null, serializable: false },
    },

    _createValue() {
        this.value = this.isSeparate
            ? new SizeSeparateValue()
            : new SizeUniversalValue();
    },

    getValue(selfSize, spaceSize) {
        const value = this.getInitalValue();

        if (this._originalSize === null && selfSize) {
            this._originalSize = cc.size(selfSize.width, selfSize.height);
        }

        const size = spaceSize || saykit.settings.gameSize;
        const out = cc.size(
            value.width * size.width,
            value.height * size.height
        );

        switch (this.valueType) {
            case SizeType.Absolute:
                out.width = value.width;
                out.height = value.height;
                break;

            case SizeType.Relative:
            default:
                break;
        }

        return out;
    },

    getOriginalSize() {
        return this._originalSize;
    },
});

const Position = cc.Class({
    name: "Position",
    extends: ResizeValue,

    properties: {
        valueType: {
            default: PositionType.Relative,
            type: PositionType,
            visible: true,
            override: true,
        },
        value: { default: null, override: true },
    },

    _createValue() {
        let valueConstuctor = null;

        switch (true) {
            case this.isSeparate && this.is3D:
                valueConstuctor = Vec3SeparateValue;
                break;
            case this.isSeparate && !this.is3D:
                valueConstuctor = Vec2SeparateValue;
                break;
            case !this.isSeparate && this.is3D:
                valueConstuctor = Vec3UniversalValue;
                break;
            case !this.isSeparate && !this.is3D:
                valueConstuctor = Vec2UniversalValue;
                break;
        }

        if (!valueConstuctor) return;

        this.value = new valueConstuctor();
    },

    getValue(spaceSize) {
        const value = this.getInitalValue();
        const out = this.is3D ? cc.v3() : cc.v2();
        const size = spaceSize || saykit.settings.gameSize;

        switch (this.valueType) {
            case PositionType.Relative:
                out.x = value.x * size.width;
                out.y = value.y * size.height;
                break;

            case PositionType.Absolute:
                out.x = value.x;
                out.y = value.y;
                break;
        }

        if (!this.is3D) return out;

        switch (this.zValueType) {
            case ZValueType.EqualsX:
                out.z = out.x;
                break;
            case ZValueType.EqualsY:
                out.z = out.y;
                break;
            case ZValueType.XLerpToY:
                out.z = (out.y - out.x) * this.zValueLerpRatio + out.x;
                break;
            case ZValueType.Absolute:
                out.z = value.z;
                break;
        }

        return out;
    },
});

const Anchor = cc.Class({
    name: "Anchor",
    extends: ResizeValue,

    properties: {
        valueType: { default: null, visible: false, override: true },
        value: { default: null, override: true, override: true },
    },

    _createValue() {
        this.value = this.isSeparate
            ? new Vec2SeparateValue()
            : new Vec2UniversalValue();
    },

    getValue(ratio) {
        const value = this.getInitalValue();

        return value;
    },
});

const Rotation = cc.Class({
    name: "Rotation",
    extends: ResizeValue,

    properties: {
        valueType: { default: null, visible: false, override: true },
        value: { default: null, override: true, override: true },
    },

    _createValue() {
        this.value = this.isSeparate
            ? new NumberSeparateValue()
            : new NumberUniversalValue();

        let valueConstuctor = null;

        switch (true) {
            case this.isSeparate && this.is3D:
                valueConstuctor = Vec3SeparateValue;
                break;
            case this.isSeparate && !this.is3D:
                valueConstuctor = NumberSeparateValue;
                break;
            case !this.isSeparate && this.is3D:
                valueConstuctor = Vec3UniversalValue;
                break;
            case !this.isSeparate && !this.is3D:
                valueConstuctor = NumberUniversalValue;
                break;
        }

        if (!valueConstuctor) return;

        this.value = new valueConstuctor();
    },

    getValue(ratio) {
        const value = this.getInitalValue();

        return value;
    },
});

const ResizeValues = {
    Position,
    Scale,
    Size,
    Anchor,
    Rotation,

    ScaleType,
    SizeType,
    PositionType,
};

saykit.ResizeValues = module.exports = ResizeValues;
