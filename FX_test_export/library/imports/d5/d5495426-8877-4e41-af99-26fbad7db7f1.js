"use strict";
cc._RF.push(module, 'd5495QmiHdOQa+ZJvutfbfx', 'DispersionObject');
// Iternal_own/Scripts/Game/Dispersion/DispersionObject.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispersionObject = void 0;
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var __privateProperty = { visible: false, serializable: false };
var DispersionObject = /** @class */ (function (_super) {
    __extends(DispersionObject, _super);
    function DispersionObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isSuit = false;
        _this.dispersion = cc.v2();
        _this.movingTime = 1;
        _this.movingStartEasing = "quadOut";
        _this.movingFinishEasing = "quadIn";
        _this.isRotating = false;
        _this.rotatingTime = 3;
        _this.zOffset = 500;
        _this._target = null;
        _this.tweenStart = null;
        _this.tweenFinish = null;
        _this.tweenRotate = null;
        _this.dispersionPosition = null;
        return _this;
    }
    Object.defineProperty(DispersionObject.prototype, "target", {
        get: function () {
            return this._target;
        },
        set: function (value) {
            if (this._target === value)
                return;
            this._target = value;
            this._onSetTarget();
        },
        enumerable: false,
        configurable: true
    });
    DispersionObject.prototype.onLoad = function () {
        this._subscribeToEvents(true);
    };
    DispersionObject.prototype.onEnable = function () {
        this._reset();
        this._setRandomAngle();
        this._subscribeToEvents(true);
    };
    DispersionObject.prototype.onDisable = function () {
        this.tweenRotate && this.tweenRotate.stop();
        this._subscribeToEvents(false);
    };
    DispersionObject.prototype.delete = function () {
        var poolableObject = this.node.getComponent(saykit.PoolableObject);
        this.node.destroy(true);
    };
    DispersionObject.prototype._subscribeToEvents = function (isOn) {
        var func = isOn ? "on" : "off";
        cc.systemEvent[func](saykit.Event.SIZE_CHANGE, this.onSizeChange, this);
    };
    DispersionObject.prototype._reset = function () {
        this.target = null;
        this.tweenStart = null;
        this.tweenFinish = null;
        this.tweenRotate = null;
    };
    DispersionObject.prototype._onSetTarget = function () {
        var _this = this;
        if (!this.target)
            return;
        this.dispersionPosition = cc.v2((Math.random() - 0.5) * this.dispersion.x, (Math.random() - 0.5) * this.dispersion.y);
        var targetPosition = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        var time = this.dispersionPosition.x != 0 && this.dispersionPosition.y != 0 ? this.movingTime : 0.1;
        this.tweenStart = saykit.tweenManager.add(this.node, {
            x: this.node.x + this.dispersionPosition.x,
            y: this.node.y + this.dispersionPosition.y,
            z: this.zOffset,
        }, time, this.movingStartEasing);
        this.tweenStart.addCompleteCallback(function () {
            _this.tweenFinish = saykit.tweenManager.add(_this.node, {
                x: targetPosition.x,
                y: targetPosition.y,
            }, _this.movingTime, _this.movingFinishEasing);
            _this.tweenFinish.addCompleteCallback(function () {
                _this.onMovingEnd();
            });
        });
        if (this.isRotating) {
            this.tweenRotate = saykit.tweenManager.add(this.node, {
                rotation: 360,
                rotationX: 360,
                rotationY: 360,
            }, this.rotatingTime);
        }
    };
    DispersionObject.prototype._setRandomAngle = function (angle) {
        if (!this.isRotating)
            return;
        this.node.rotation = -Math.random() * 360;
        this.node.rotationX = -Math.random() * 360;
        this.node.rotationY = -Math.random() * 360;
    };
    DispersionObject.prototype.onSizeChange = function () {
        if (!this.tweenFinish)
            return;
        var targetPosition = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this.tweenFinish.changeProperties({
            x: { initial: this.dispersionPosition.x, finish: targetPosition.x },
            y: { initial: this.dispersionPosition.y, finish: targetPosition.y },
        });
    };
    DispersionObject.prototype.onMovingEnd = function () {
        this.delete();
    };
    __decorate([
        property(cc.Boolean)
    ], DispersionObject.prototype, "isSuit", void 0);
    __decorate([
        property(cc.v2)
    ], DispersionObject.prototype, "dispersion", void 0);
    __decorate([
        property(cc.Float)
    ], DispersionObject.prototype, "movingTime", void 0);
    __decorate([
        property(cc.String)
    ], DispersionObject.prototype, "movingStartEasing", void 0);
    __decorate([
        property(cc.String)
    ], DispersionObject.prototype, "movingFinishEasing", void 0);
    __decorate([
        property(cc.Boolean)
    ], DispersionObject.prototype, "isRotating", void 0);
    __decorate([
        property(cc.Float)
    ], DispersionObject.prototype, "rotatingTime", void 0);
    __decorate([
        property(cc.Float)
    ], DispersionObject.prototype, "zOffset", void 0);
    __decorate([
        property({ visible: false })
    ], DispersionObject.prototype, "target", null);
    __decorate([
        property(__privateProperty)
    ], DispersionObject.prototype, "_target", void 0);
    __decorate([
        property(__privateProperty)
    ], DispersionObject.prototype, "tweenStart", void 0);
    __decorate([
        property(__privateProperty)
    ], DispersionObject.prototype, "tweenFinish", void 0);
    __decorate([
        property(__privateProperty)
    ], DispersionObject.prototype, "tweenRotate", void 0);
    __decorate([
        property(__privateProperty)
    ], DispersionObject.prototype, "dispersionPosition", void 0);
    DispersionObject = __decorate([
        ccclass
    ], DispersionObject);
    return DispersionObject;
}(cc.Component));
exports.DispersionObject = DispersionObject;

cc._RF.pop();