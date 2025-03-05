"use strict";
cc._RF.push(module, '6563e+EEv9Ozrb5O23ikdRW', 'ResultSpineStar');
// Iternal_own/Scripts/Ui/ResultSpineStar/ResultSpineStar.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var __isSpineExists = window.sp instanceof Object;
var __skeletonComponent = { type: __isSpineExists ? sp.Skeleton : cc.Asset, visible: __isSpineExists };
var ResultSpineStar = /** @class */ (function (_super) {
    __extends(ResultSpineStar, _super);
    function ResultSpineStar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.back = null;
        _this.main = null;
        _this._active = false;
        return _this;
    }
    Object.defineProperty(ResultSpineStar.prototype, "active", {
        get: function () {
            return this._active;
        },
        set: function (value) {
            this._active = value;
            if (value) {
                this.back instanceof sp.Skeleton && this.back.setAnimation(0, "appear", false);
                this.main instanceof sp.Skeleton && this.main.setAnimation(0, "appear", false);
            }
            else {
                this.main instanceof sp.Skeleton && this.main.setAnimation(0, "empty", false);
                if (this.back instanceof sp.Skeleton) {
                    this.back.clearTrack(0);
                    this.back.setSlotsToSetupPose();
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    ResultSpineStar.prototype.toggle = function (active) {
        this.active = active;
    };
    __decorate([
        property(__skeletonComponent)
    ], ResultSpineStar.prototype, "back", void 0);
    __decorate([
        property(__skeletonComponent)
    ], ResultSpineStar.prototype, "main", void 0);
    __decorate([
        property(cc.Boolean)
    ], ResultSpineStar.prototype, "_active", void 0);
    ResultSpineStar = __decorate([
        ccclass
    ], ResultSpineStar);
    return ResultSpineStar;
}(cc.Component));

cc._RF.pop();