const BaseValue = cc.Class({
    name: "BaseValue",
    properties: {},

    _setProperty(otherProperty) {
        let out = otherProperty.clone ? otherProperty.clone() : otherProperty;

        return out;
    },

    _lerpProperty(propertyFrom, propertyTo, ratio) {
        let out = null;

        if (propertyFrom.lerp) {
            out = propertyFrom.lerp(propertyTo, ratio, out);
        } else {
            out = propertyFrom + (propertyTo - propertyFrom) * ratio;
        }

        return out;
    },

    _inverseProperty(property, isX, isY, isZ) {
        if (this._isNumber(property)) return -property;

        isX && this._isNumber(property.x) && (property.x *= -1);
        isY && this._isNumber(property.y) && (property.y *= -1);
        isZ && this._isNumber(property.z) && (property.z *= -1);

        isX && this._isNumber(property.width) && (property.width *= -1);
        isY && this._isNumber(property.height) && (property.height *= -1);
    },

    _isNumber(value) {
        return typeof value === "number";
    },
});

const UniversalValue = cc.Class({
    name: "UniversalValue",
    extends: BaseValue,
    properties: {},

    set(newUniversalValue) {
        this.portrait = this._setProperty(newUniversalValue.portrait);
        this.landscape = this._setProperty(newUniversalValue.landscape);
    },

    lerp(fromUniversalValue, toUniversalValue, ratio) {
        this.portrait = this._lerpProperty(
            fromUniversalValue.portrait,
            toUniversalValue.portrait,
            ratio
        );
        this.landscape = this._lerpProperty(
            fromUniversalValue.landscape,
            toUniversalValue.landscape,
            ratio
        );
    },

    inverse(isX, isY, isZ) {
        this.portrait = this._inverseProperty(this.portrait, isX, isY, isZ);
        this.landscape = this._inverseProperty(this.landscape, isX, isY, isZ);
    },
});

const SeparateValue = cc.Class({
    name: "SeparateValue",
    extends: BaseValue,
    properties: {},

    set(newSeparateValue) {
        this.portraitTablet = this._setProperty(
            newSeparateValue.portraitTablet
        );
        this.landscapeTablet = this._setProperty(
            newSeparateValue.landscapeTablet
        );

        this.portraitPhone = this._setProperty(newSeparateValue.portraitPhone);
        this.landscapePhone = this._setProperty(
            newSeparateValue.landscapePhone
        );
    },

    lerp(fromSeparateValue, toSeparateValue, ratio) {
        this.portraitTablet = this._lerpProperty(
            fromSeparateValue.portraitTablet,
            toSeparateValue.portraitTablet,
            ratio
        );
        this.landscapeTablet = this._lerpProperty(
            fromSeparateValue.landscapeTablet,
            toSeparateValue.landscapeTablet,
            ratio
        );

        this.portraitPhone = this._lerpProperty(
            fromSeparateValue.portraitPhone,
            toSeparateValue.portraitPhone,
            ratio
        );
        this.landscapePhone = this._lerpProperty(
            fromSeparateValue.landscapePhone,
            toSeparateValue.landscapePhone,
            ratio
        );
    },

    inverse(isX, isY, isZ) {
        this.portraitTablet = this._inverseProperty(
            this.portraitTablet,
            isX,
            isY,
            isZ
        );
        this.landscapeTablet = this._inverseProperty(
            this.landscapeTablet,
            isX,
            isY,
            isZ
        );

        this.portraitPhone = this._inverseProperty(
            this.portraitPhone,
            isX,
            isY,
            isZ
        );
        this.landscapePhone = this._inverseProperty(
            this.landscapePhone,
            isX,
            isY,
            isZ
        );
    },
});

const SizeUniversalValue = cc.Class({
    name: "SizeUniversalValue",
    extends: UniversalValue,

    properties: {
        portrait: cc.size(0, 0),
        landscape: cc.size(0, 0),
    },
});

const SizeSeparateValue = cc.Class({
    name: "SizeSeparateValue",
    extends: SeparateValue,

    properties: {
        portraitTablet: cc.size(0, 0),
        landscapeTablet: cc.size(0, 0),

        portraitPhone: cc.size(0, 0),
        landscapePhone: cc.size(0, 0),
    },
});

const Vec3UniversalValue = cc.Class({
    name: "Vec3UniversalValue",
    extends: UniversalValue,

    properties: {
        portrait: cc.v3(0, 0, 0),
        landscape: cc.v3(0, 0, 0),
    },
});

const Vec3SeparateValue = cc.Class({
    name: "Vec3SeparateValue",
    extends: SeparateValue,

    properties: {
        portraitTablet: cc.v3(0, 0, 0),
        landscapeTablet: cc.v3(0, 0, 0),

        portraitPhone: cc.v3(0, 0, 0),
        landscapePhone: cc.v3(0, 0, 0),
    },
});

const Vec2UniversalValue = cc.Class({
    name: "Vec2UniversalValue",
    extends: UniversalValue,

    properties: {
        portrait: cc.Vec2.ZERO,
        landscape: cc.Vec2.ZERO,
    },
});

const Vec2SeparateValue = cc.Class({
    name: "Vec2SeparateValue",
    extends: SeparateValue,

    properties: {
        portraitTablet: cc.Vec2.ZERO,
        landscapeTablet: cc.Vec2.ZERO,

        portraitPhone: cc.Vec2.ZERO,
        landscapePhone: cc.Vec2.ZERO,
    },
});

const NumberUniversalValue = cc.Class({
    name: "NumberUniversalValue",
    extends: UniversalValue,

    properties: {
        portrait: 0,
        landscape: 0,
    },
});

const NumberSeparateValue = cc.Class({
    name: "NumberSeparateValue",
    extends: SeparateValue,

    properties: {
        portraitTablet: 0,
        landscapeTablet: 0,

        portraitPhone: 0,
        landscapePhone: 0,
    },
});

//#endregion

const ResizeValueTypes = {
    SizeUniversalValue,
    SizeSeparateValue,
    Vec3UniversalValue,
    Vec3SeparateValue,
    Vec2UniversalValue,
    Vec2SeparateValue,
    NumberUniversalValue,
    NumberSeparateValue,
};

saykit.ResizeValueTypes = module.exports = ResizeValueTypes;
