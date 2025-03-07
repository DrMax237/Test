
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Iternal_own/Scripts/Game/Dispersion/DispersionObject.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcSXRlcm5hbF9vd25cXFNjcmlwdHNcXEdhbWVcXERpc3BlcnNpb25cXERpc3BlcnNpb25PYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBd0IsRUFBRSxDQUFDLFVBQVUsRUFBbkMsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFrQixDQUFDO0FBQzVDLElBQU0saUJBQWlCLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUdsRTtJQUFzQyxvQ0FBWTtJQUFsRDtRQUFBLHFFQWdJQztRQS9Ic0IsWUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixnQkFBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNsQixnQkFBVSxHQUFHLENBQUMsQ0FBQztRQUNkLHVCQUFpQixHQUFHLFNBQVMsQ0FBQztRQUM5Qix3QkFBa0IsR0FBRyxRQUFRLENBQUM7UUFDN0IsZ0JBQVUsR0FBRyxLQUFLLENBQUM7UUFDckIsa0JBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsYUFBTyxHQUFHLEdBQUcsQ0FBQztRQWFMLGFBQU8sR0FBWSxJQUFJLENBQUM7UUFDeEIsZ0JBQVUsR0FBUSxJQUFJLENBQUM7UUFDdkIsaUJBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsaUJBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsd0JBQWtCLEdBQVksSUFBSSxDQUFDOztJQXVHakUsQ0FBQztJQXJIQSxzQkFBSSxvQ0FBTTthQUFWO1lBQ0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7YUFDRCxVQUFXLEtBQWM7WUFDeEIsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUs7Z0JBQUUsT0FBTztZQUVuQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLENBQUMsWUFBWSxFQUFFLENB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O3lEQUF5QjtJQUN4QjtRQUE1QixRQUFRLENBQUMsaUJBQWlCLENBQUM7eURBQXlCO0lBQ3hCO1FBQTVCLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztnRUFBb0M7SUF6QnBELGdCQUFnQjtRQUQ1QixPQUFPO09BQ0ssZ0JBQWdCLENBZ0k1QjtJQUFELHVCQUFDO0NBaElELEFBZ0lDLENBaElxQyxFQUFFLENBQUMsU0FBUyxHQWdJakQ7QUFoSVksNENBQWdCIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gY2MuX2RlY29yYXRvcjtcbmNvbnN0IF9fcHJpdmF0ZVByb3BlcnR5ID0geyB2aXNpYmxlOiBmYWxzZSwgc2VyaWFsaXphYmxlOiBmYWxzZSB9O1xuXG5AY2NjbGFzc1xuZXhwb3J0IGNsYXNzIERpc3BlcnNpb25PYmplY3QgZXh0ZW5kcyBjYy5Db21wb25lbnQge1xuXHRAcHJvcGVydHkoY2MuQm9vbGVhbikgaXNTdWl0ID0gZmFsc2U7XG5cdEBwcm9wZXJ0eShjYy52MikgZGlzcGVyc2lvbiA9IGNjLnYyKCk7XG5cdEBwcm9wZXJ0eShjYy5GbG9hdCkgbW92aW5nVGltZSA9IDE7XG5cdEBwcm9wZXJ0eShjYy5TdHJpbmcpIG1vdmluZ1N0YXJ0RWFzaW5nID0gXCJxdWFkT3V0XCI7XG5cdEBwcm9wZXJ0eShjYy5TdHJpbmcpIG1vdmluZ0ZpbmlzaEVhc2luZyA9IFwicXVhZEluXCI7XG5cdEBwcm9wZXJ0eShjYy5Cb29sZWFuKSBpc1JvdGF0aW5nID0gZmFsc2U7XG5cdEBwcm9wZXJ0eShjYy5GbG9hdCkgcm90YXRpbmdUaW1lID0gMztcblx0QHByb3BlcnR5KGNjLkZsb2F0KSB6T2Zmc2V0ID0gNTAwO1xuXG5cdEBwcm9wZXJ0eSh7IHZpc2libGU6IGZhbHNlIH0pXG5cdGdldCB0YXJnZXQoKTogY2MuTm9kZSB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldDtcblx0fVxuXHRzZXQgdGFyZ2V0KHZhbHVlOiBjYy5Ob2RlKSB7XG5cdFx0aWYgKHRoaXMuX3RhcmdldCA9PT0gdmFsdWUpIHJldHVybjtcblxuXHRcdHRoaXMuX3RhcmdldCA9IHZhbHVlO1xuXHRcdHRoaXMuX29uU2V0VGFyZ2V0KCk7XG5cdH1cblxuXHRAcHJvcGVydHkoX19wcml2YXRlUHJvcGVydHkpIF90YXJnZXQ6IGNjLk5vZGUgPSBudWxsO1xuXHRAcHJvcGVydHkoX19wcml2YXRlUHJvcGVydHkpIHR3ZWVuU3RhcnQ6IGFueSA9IG51bGw7XG5cdEBwcm9wZXJ0eShfX3ByaXZhdGVQcm9wZXJ0eSkgdHdlZW5GaW5pc2g6IGFueSA9IG51bGw7XG5cdEBwcm9wZXJ0eShfX3ByaXZhdGVQcm9wZXJ0eSkgdHdlZW5Sb3RhdGU6IGFueSA9IG51bGw7XG5cdEBwcm9wZXJ0eShfX3ByaXZhdGVQcm9wZXJ0eSkgZGlzcGVyc2lvblBvc2l0aW9uOiBjYy5WZWMyID0gbnVsbDtcblxuXHRvbkxvYWQoKSB7XG5cdFx0dGhpcy5fc3Vic2NyaWJlVG9FdmVudHModHJ1ZSk7XG5cdH1cblx0b25FbmFibGUoKSB7XG5cdFx0dGhpcy5fcmVzZXQoKTtcblx0XHR0aGlzLl9zZXRSYW5kb21BbmdsZSgpO1xuXHRcdHRoaXMuX3N1YnNjcmliZVRvRXZlbnRzKHRydWUpO1xuXHR9XG5cdG9uRGlzYWJsZSgpIHtcblx0XHR0aGlzLnR3ZWVuUm90YXRlICYmIHRoaXMudHdlZW5Sb3RhdGUuc3RvcCgpO1xuXHRcdHRoaXMuX3N1YnNjcmliZVRvRXZlbnRzKGZhbHNlKTtcblx0fVxuXG5cdGRlbGV0ZSgpOiB2b2lkIHtcblx0XHRjb25zdCBwb29sYWJsZU9iamVjdCA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoc2F5a2l0LlBvb2xhYmxlT2JqZWN0KTtcblxuXHRcdHRoaXMubm9kZS5kZXN0cm95KHRydWUpO1xuXHR9XG5cblx0cHJpdmF0ZSBfc3Vic2NyaWJlVG9FdmVudHMoaXNPbjogYm9vbGVhbik6IHZvaWQge1xuXHRcdGNvbnN0IGZ1bmMgPSBpc09uID8gXCJvblwiIDogXCJvZmZcIjtcblxuXHRcdGNjLnN5c3RlbUV2ZW50W2Z1bmNdKHNheWtpdC5FdmVudC5TSVpFX0NIQU5HRSwgdGhpcy5vblNpemVDaGFuZ2UsIHRoaXMpO1xuXHR9XG5cdHByaXZhdGUgX3Jlc2V0KCk6IHZvaWQge1xuXHRcdHRoaXMudGFyZ2V0ID0gbnVsbDtcblx0XHR0aGlzLnR3ZWVuU3RhcnQgPSBudWxsO1xuXHRcdHRoaXMudHdlZW5GaW5pc2ggPSBudWxsO1xuXHRcdHRoaXMudHdlZW5Sb3RhdGUgPSBudWxsO1xuXHR9XG5cdHByaXZhdGUgX29uU2V0VGFyZ2V0KCk6IHZvaWQge1xuXHRcdGlmICghdGhpcy50YXJnZXQpIHJldHVybjtcblxuXHRcdHRoaXMuZGlzcGVyc2lvblBvc2l0aW9uID0gY2MudjIoXG5cdFx0XHQoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLmRpc3BlcnNpb24ueCxcblx0XHRcdChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMuZGlzcGVyc2lvbi55XG5cdFx0KTtcblxuXHRcdGNvbnN0IHRhcmdldFBvc2l0aW9uID0gdGhpcy50YXJnZXQuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLlZlYzIuWkVSTyk7XG5cdFx0Y29uc3QgdGltZSA9IHRoaXMuZGlzcGVyc2lvblBvc2l0aW9uLnggIT0gMCAmJiB0aGlzLmRpc3BlcnNpb25Qb3NpdGlvbi55ICE9IDAgPyB0aGlzLm1vdmluZ1RpbWUgOiAwLjE7XG5cblx0XHR0aGlzLnR3ZWVuU3RhcnQgPSBzYXlraXQudHdlZW5NYW5hZ2VyLmFkZChcblx0XHRcdHRoaXMubm9kZSxcblx0XHRcdHtcblx0XHRcdFx0eDogdGhpcy5ub2RlLnggKyB0aGlzLmRpc3BlcnNpb25Qb3NpdGlvbi54LFxuXHRcdFx0XHR5OiB0aGlzLm5vZGUueSArIHRoaXMuZGlzcGVyc2lvblBvc2l0aW9uLnksXG5cdFx0XHRcdHo6IHRoaXMuek9mZnNldCxcblx0XHRcdH0sXG5cdFx0XHR0aW1lLFxuXHRcdFx0dGhpcy5tb3ZpbmdTdGFydEVhc2luZ1xuXHRcdCk7XG5cblx0XHR0aGlzLnR3ZWVuU3RhcnQuYWRkQ29tcGxldGVDYWxsYmFjaygoKSA9PiB7XG5cdFx0XHR0aGlzLnR3ZWVuRmluaXNoID0gc2F5a2l0LnR3ZWVuTWFuYWdlci5hZGQoXG5cdFx0XHRcdHRoaXMubm9kZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHg6IHRhcmdldFBvc2l0aW9uLngsXG5cdFx0XHRcdFx0eTogdGFyZ2V0UG9zaXRpb24ueSxcblx0XHRcdFx0fSxcblx0XHRcdFx0dGhpcy5tb3ZpbmdUaW1lLFxuXHRcdFx0XHR0aGlzLm1vdmluZ0ZpbmlzaEVhc2luZ1xuXHRcdFx0KTtcblxuXHRcdFx0dGhpcy50d2VlbkZpbmlzaC5hZGRDb21wbGV0ZUNhbGxiYWNrKCgpID0+IHtcblx0XHRcdFx0dGhpcy5vbk1vdmluZ0VuZCgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRpZiAodGhpcy5pc1JvdGF0aW5nKSB7XG5cdFx0XHR0aGlzLnR3ZWVuUm90YXRlID0gc2F5a2l0LnR3ZWVuTWFuYWdlci5hZGQoXG5cdFx0XHRcdHRoaXMubm9kZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJvdGF0aW9uOiAzNjAsXG5cdFx0XHRcdFx0cm90YXRpb25YOiAzNjAsXG5cdFx0XHRcdFx0cm90YXRpb25ZOiAzNjAsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXMucm90YXRpbmdUaW1lXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXHRwcml2YXRlIF9zZXRSYW5kb21BbmdsZShhbmdsZTogbnVtYmVyKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmlzUm90YXRpbmcpIHJldHVybjtcblxuXHRcdHRoaXMubm9kZS5yb3RhdGlvbiA9IC1NYXRoLnJhbmRvbSgpICogMzYwO1xuXHRcdHRoaXMubm9kZS5yb3RhdGlvblggPSAtTWF0aC5yYW5kb20oKSAqIDM2MDtcblx0XHR0aGlzLm5vZGUucm90YXRpb25ZID0gLU1hdGgucmFuZG9tKCkgKiAzNjA7XG5cdH1cblxuXHRwcml2YXRlIG9uU2l6ZUNoYW5nZSgpOiB2b2lkIHtcblx0XHRpZiAoIXRoaXMudHdlZW5GaW5pc2gpIHJldHVybjtcblxuXHRcdGNvbnN0IHRhcmdldFBvc2l0aW9uID0gdGhpcy50YXJnZXQuY29udmVydFRvV29ybGRTcGFjZUFSKGNjLlZlYzIuWkVSTyk7XG5cblx0XHR0aGlzLnR3ZWVuRmluaXNoLmNoYW5nZVByb3BlcnRpZXMoe1xuXHRcdFx0eDogeyBpbml0aWFsOiB0aGlzLmRpc3BlcnNpb25Qb3NpdGlvbi54LCBmaW5pc2g6IHRhcmdldFBvc2l0aW9uLnggfSxcblx0XHRcdHk6IHsgaW5pdGlhbDogdGhpcy5kaXNwZXJzaW9uUG9zaXRpb24ueSwgZmluaXNoOiB0YXJnZXRQb3NpdGlvbi55IH0sXG5cdFx0fSk7XG5cdH1cblx0cHJpdmF0ZSBvbk1vdmluZ0VuZCgpOiB2b2lkIHtcblx0XHR0aGlzLmRlbGV0ZSgpO1xuXHR9XG59XG4iXX0=