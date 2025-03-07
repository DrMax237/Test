
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Iternal_own/Scripts/Ui/ResultSpineStar/ResultSpineStar.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcSXRlcm5hbF9vd25cXFNjcmlwdHNcXFVpXFxSZXN1bHRTcGluZVN0YXJcXFJlc3VsdFNwaW5lU3Rhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU0sSUFBQSxLQUF3QixFQUFFLENBQUMsVUFBVSxFQUFuQyxPQUFPLGFBQUEsRUFBRSxRQUFRLGNBQWtCLENBQUM7QUFFNUMsSUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLEVBQUUsWUFBWSxNQUFNLENBQUM7QUFDcEQsSUFBTSxtQkFBbUIsR0FBRyxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxDQUFDO0FBR3pHO0lBQThCLG1DQUFZO0lBQTFDO1FBQUEscUVBMkJDO1FBMUIrQixVQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osVUFBSSxHQUFHLElBQUksQ0FBQztRQUVyQixhQUFPLEdBQVksS0FBSyxDQUFDOztJQXVCaEQsQ0FBQztJQXRCQSxzQkFBSSxtQ0FBTTthQUFWO1lBQ0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7YUFDRCxVQUFXLEtBQUs7WUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUVyQixJQUFJLEtBQUssRUFBRTtnQkFDVixJQUFJLENBQUMsSUFBSSxZQUFZLEVBQUUsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0U7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRTlFLElBQUksSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2lCQUNoQzthQUNEO1FBQ0YsQ0FBQzs7O09BZkE7SUFpQkQsZ0NBQU0sR0FBTixVQUFPLE1BQU07UUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBekI4QjtRQUE5QixRQUFRLENBQUMsbUJBQW1CLENBQUM7aURBQWE7SUFDWjtRQUE5QixRQUFRLENBQUMsbUJBQW1CLENBQUM7aURBQWE7SUFFckI7UUFBckIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7b0RBQTBCO0lBSjFDLGVBQWU7UUFEcEIsT0FBTztPQUNGLGVBQWUsQ0EyQnBCO0lBQUQsc0JBQUM7Q0EzQkQsQUEyQkMsQ0EzQjZCLEVBQUUsQ0FBQyxTQUFTLEdBMkJ6QyIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IGNjLl9kZWNvcmF0b3I7XG5cbmNvbnN0IF9faXNTcGluZUV4aXN0cyA9IHdpbmRvdy5zcCBpbnN0YW5jZW9mIE9iamVjdDtcbmNvbnN0IF9fc2tlbGV0b25Db21wb25lbnQgPSB7IHR5cGU6IF9faXNTcGluZUV4aXN0cyA/IHNwLlNrZWxldG9uIDogY2MuQXNzZXQsIHZpc2libGU6IF9faXNTcGluZUV4aXN0cyB9O1xuXG5AY2NjbGFzc1xuY2xhc3MgUmVzdWx0U3BpbmVTdGFyIGV4dGVuZHMgY2MuQ29tcG9uZW50IHtcblx0QHByb3BlcnR5KF9fc2tlbGV0b25Db21wb25lbnQpIGJhY2sgPSBudWxsO1xuXHRAcHJvcGVydHkoX19za2VsZXRvbkNvbXBvbmVudCkgbWFpbiA9IG51bGw7XG5cblx0QHByb3BlcnR5KGNjLkJvb2xlYW4pIF9hY3RpdmU6IGJvb2xlYW4gPSBmYWxzZTtcblx0Z2V0IGFjdGl2ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fYWN0aXZlO1xuXHR9XG5cdHNldCBhY3RpdmUodmFsdWUpIHtcblx0XHR0aGlzLl9hY3RpdmUgPSB2YWx1ZTtcblxuXHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0dGhpcy5iYWNrIGluc3RhbmNlb2Ygc3AuU2tlbGV0b24gJiYgdGhpcy5iYWNrLnNldEFuaW1hdGlvbigwLCBcImFwcGVhclwiLCBmYWxzZSk7XG5cdFx0XHR0aGlzLm1haW4gaW5zdGFuY2VvZiBzcC5Ta2VsZXRvbiAmJiB0aGlzLm1haW4uc2V0QW5pbWF0aW9uKDAsIFwiYXBwZWFyXCIsIGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tYWluIGluc3RhbmNlb2Ygc3AuU2tlbGV0b24gJiYgdGhpcy5tYWluLnNldEFuaW1hdGlvbigwLCBcImVtcHR5XCIsIGZhbHNlKTtcblxuXHRcdFx0aWYgKHRoaXMuYmFjayBpbnN0YW5jZW9mIHNwLlNrZWxldG9uKSB7XG5cdFx0XHRcdHRoaXMuYmFjay5jbGVhclRyYWNrKDApO1xuXHRcdFx0XHR0aGlzLmJhY2suc2V0U2xvdHNUb1NldHVwUG9zZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHRvZ2dsZShhY3RpdmUpIHtcblx0XHR0aGlzLmFjdGl2ZSA9IGFjdGl2ZTtcblx0fVxufVxuIl19