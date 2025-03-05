
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/Iternal_own/Scripts/Game/Dispersion/DispersionObject');
require('./assets/Iternal_own/Scripts/Ui/ResultSpineStar/ResultSpineStar');
require('./assets/Scripts/Helper');

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Helper.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'bef3dE1LNZJgaFS3O2lsFC6', 'Helper');
// Scripts/Helper.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, menu = _a.menu, executeInEditMode = _a.executeInEditMode;
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["ParticleSystem"] = 0] = "ParticleSystem";
    ComponentType[ComponentType["Animation"] = 1] = "Animation";
    ComponentType[ComponentType["Spine"] = 2] = "Spine";
})(ComponentType || (ComponentType = {}));
var ControlType;
(function (ControlType) {
    ControlType[ControlType["AllKeys"] = 0] = "AllKeys";
    ControlType[ControlType["ExactKey"] = 1] = "ExactKey";
})(ControlType || (ControlType = {}));
var KeyType;
(function (KeyType) {
    KeyType[KeyType["AllKeys"] = 0] = "AllKeys";
    KeyType[KeyType["ExactKey"] = 1] = "ExactKey";
})(KeyType || (KeyType = {}));
var PlayInfo = /** @class */ (function () {
    function PlayInfo() {
        this.delay = 0;
        this.node = null;
    }
    __decorate([
        property()
    ], PlayInfo.prototype, "delay", void 0);
    __decorate([
        property(cc.Node)
    ], PlayInfo.prototype, "node", void 0);
    PlayInfo = __decorate([
        ccclass('PlayInfo')
    ], PlayInfo);
    return PlayInfo;
}());
var Helper = /** @class */ (function (_super) {
    __extends(Helper, _super);
    function Helper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.component = ComponentType.ParticleSystem;
        _this.control = ControlType.AllKeys;
        _this.key = cc.macro.KEY.b;
        _this._autofind = false;
        _this.playInfo = [];
        return _this;
    }
    Object.defineProperty(Helper.prototype, "Autofind", {
        get: function () { return this._autofind; },
        set: function (v) {
            this._autofind = v;
            this._autofind && this.autofindNodes();
        },
        enumerable: false,
        configurable: true
    });
    ;
    ;
    Helper.prototype.onLoad = function () {
        if (!CC_EDITOR) {
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    };
    Helper.prototype.onKeyDown = function (event) {
        switch (this.control) {
            case ControlType.AllKeys:
                this.play();
                break;
            case ControlType.ExactKey:
                if (event.keyCode === this.key) {
                    this.play();
                }
                break;
        }
    };
    Helper.prototype.autofindNodes = function () {
        var _this = this;
        var children = this.node.children;
        this.playInfo = [];
        children.forEach(function (child) {
            var info = new PlayInfo();
            info.node = child;
            _this.playInfo.push(info);
        });
    };
    Helper.prototype.play = function () {
        var _this = this;
        this.playInfo.forEach(function (info) {
            _this.scheduleOnce(function () {
                switch (_this.component) {
                    case ComponentType.Animation:
                        info.node.getComponent(cc.Animation).play();
                        break;
                    case ComponentType.ParticleSystem:
                        info.node.getComponent(cc.ParticleSystem).resetSystem();
                        break;
                    case ComponentType.Spine:
                        var spine = info.node.getComponent(sp.Skeleton);
                        spine.setAnimation(0, spine.animation, spine.loop);
                        break;
                }
            }, info.delay);
        });
    };
    __decorate([
        property({ type: cc.Enum(ComponentType) })
    ], Helper.prototype, "component", void 0);
    __decorate([
        property({ type: cc.Enum(ControlType) })
    ], Helper.prototype, "control", void 0);
    __decorate([
        property({ type: cc.Enum(cc.macro.KEY), visible: function () { return this.control === ControlType.ExactKey; } })
    ], Helper.prototype, "key", void 0);
    __decorate([
        property
    ], Helper.prototype, "_autofind", void 0);
    __decorate([
        property
    ], Helper.prototype, "Autofind", null);
    __decorate([
        property([PlayInfo])
    ], Helper.prototype, "playInfo", void 0);
    Helper = __decorate([
        ccclass,
        menu('Prohor/Helper'),
        executeInEditMode
    ], Helper);
    return Helper;
}(cc.Component));
exports.default = Helper;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFNLElBQUEsS0FBaUQsRUFBRSxDQUFDLFVBQVUsRUFBNUQsT0FBTyxhQUFBLEVBQUUsUUFBUSxjQUFBLEVBQUUsSUFBSSxVQUFBLEVBQUUsaUJBQWlCLHVCQUFrQixDQUFDO0FBRXJFLElBQUssYUFJSjtBQUpELFdBQUssYUFBYTtJQUNkLHFFQUFrQixDQUFBO0lBQ2xCLDJEQUFTLENBQUE7SUFDVCxtREFBSyxDQUFBO0FBQ1QsQ0FBQyxFQUpJLGFBQWEsS0FBYixhQUFhLFFBSWpCO0FBRUQsSUFBSyxXQUdKO0FBSEQsV0FBSyxXQUFXO0lBQ1osbURBQVcsQ0FBQTtJQUNYLHFEQUFRLENBQUE7QUFDWixDQUFDLEVBSEksV0FBVyxLQUFYLFdBQVcsUUFHZjtBQUVELElBQUssT0FHSjtBQUhELFdBQUssT0FBTztJQUNSLDJDQUFXLENBQUE7SUFDWCw2Q0FBUSxDQUFBO0FBQ1osQ0FBQyxFQUhJLE9BQU8sS0FBUCxPQUFPLFFBR1g7QUFHRDtJQUFBO1FBRWdCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFDWCxTQUFJLEdBQVksSUFBSSxDQUFDO0lBRTVDLENBQUM7SUFIZTtRQUFYLFFBQVEsRUFBRTsyQ0FBbUI7SUFDWDtRQUFsQixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQzswQ0FBc0I7SUFIdEMsUUFBUTtRQURiLE9BQU8sQ0FBQyxVQUFVLENBQUM7T0FDZCxRQUFRLENBS2I7SUFBRCxlQUFDO0NBTEQsQUFLQyxJQUFBO0FBS0Q7SUFBb0MsMEJBQVk7SUFBaEQ7UUFBQSxxRUFrRUM7UUFoRStDLGVBQVMsR0FBa0IsYUFBYSxDQUFDLGNBQWMsQ0FBQztRQUMxRCxhQUFPLEdBQWdCLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFFa0IsU0FBRyxHQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcs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QUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzsyQ0FBNEM7SUFFa0I7UUFBdEcsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLGdCQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFBLENBQUMsQ0FBQyxFQUFFLENBQUM7dUNBQW9DO0lBRWhJO1FBQVQsUUFBUTs2Q0FBNEI7SUFFckM7UUFEQyxRQUFROzBDQUlSO0lBR3FCO1FBQXJCLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRDQUEyQjtJQWYvQixNQUFNO1FBSDFCLE9BQU87UUFDUCxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQ3JCLGlCQUFpQjtPQUNHLE1BQU0sQ0FrRTFCO0lBQUQsYUFBQztDQWxFRCxBQWtFQyxDQWxFbUMsRUFBRSxDQUFDLFNBQVMsR0FrRS9DO2tCQWxFb0IsTUFBTSIsImZpbGUiOiIiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHksIG1lbnUsIGV4ZWN1dGVJbkVkaXRNb2RlIH0gPSBjYy5fZGVjb3JhdG9yO1xuXG5lbnVtIENvbXBvbmVudFR5cGUge1xuICAgIFBhcnRpY2xlU3lzdGVtID0gMCxcbiAgICBBbmltYXRpb24sXG4gICAgU3BpbmUsXG59XG5cbmVudW0gQ29udHJvbFR5cGUge1xuICAgIEFsbEtleXMgPSAwLFxuICAgIEV4YWN0S2V5LFxufVxuXG5lbnVtIEtleVR5cGUge1xuICAgIEFsbEtleXMgPSAwLFxuICAgIEV4YWN0S2V5LFxufVxuXG5AY2NjbGFzcygnUGxheUluZm8nKVxuY2xhc3MgUGxheUluZm8ge1xuXG4gICAgQHByb3BlcnR5KCkgZGVsYXk6IG51bWJlciA9IDA7XG4gICAgQHByb3BlcnR5KGNjLk5vZGUpIG5vZGU6IGNjLk5vZGUgPSBudWxsO1xuXG59XG5cbkBjY2NsYXNzXG5AbWVudSgnUHJvaG9yL0hlbHBlcicpXG5AZXhlY3V0ZUluRWRpdE1vZGVcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBlciBleHRlbmRzIGNjLkNvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoeyB0eXBlOiBjYy5FbnVtKENvbXBvbmVudFR5cGUpIH0pIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZSA9IENvbXBvbmVudFR5cGUuUGFydGljbGVTeXN0ZW07XG4gICAgQHByb3BlcnR5KHsgdHlwZTogY2MuRW51bShDb250cm9sVHlwZSkgfSkgY29udHJvbDogQ29udHJvbFR5cGUgPSBDb250cm9sVHlwZS5BbGxLZXlzO1xuXG4gICAgQHByb3BlcnR5KHsgdHlwZTogY2MuRW51bShjYy5tYWNyby5LRVkpLCB2aXNpYmxlKCkgeyByZXR1cm4gdGhpcy5jb250cm9sID09PSBDb250cm9sVHlwZS5FeGFjdEtleSB9IH0pIGtleTogY2MubWFjcm8uS0VZID0gY2MubWFjcm8uS0VZLmI7XG5cbiAgICBAcHJvcGVydHkgX2F1dG9maW5kOiBib29sZWFuID0gZmFsc2U7XG4gICAgQHByb3BlcnR5XG4gICAgc2V0IEF1dG9maW5kKHY6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fYXV0b2ZpbmQgPSB2O1xuICAgICAgICB0aGlzLl9hdXRvZmluZCAmJiB0aGlzLmF1dG9maW5kTm9kZXMoKTtcbiAgICB9O1xuICAgIGdldCBBdXRvZmluZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2F1dG9maW5kIH07XG5cbiAgICBAcHJvcGVydHkoW1BsYXlJbmZvXSkgcGxheUluZm86IFBsYXlJbmZvW10gPSBbXTtcblxuICAgIG9uTG9hZCgpIHtcbiAgICAgICAgaWYgKCFDQ19FRElUT1IpIHtcbiAgICAgICAgICAgIGNjLnN5c3RlbUV2ZW50Lm9uKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5LRVlfRE9XTiwgdGhpcy5vbktleURvd24sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbktleURvd24oZXZlbnQpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmNvbnRyb2wpIHtcbiAgICAgICAgICAgIGNhc2UgQ29udHJvbFR5cGUuQWxsS2V5czpcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ29udHJvbFR5cGUuRXhhY3RLZXk6XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IHRoaXMua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXV0b2ZpbmROb2RlcygpIHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLm5vZGUuY2hpbGRyZW47XG4gICAgICAgIHRoaXMucGxheUluZm8gPSBbXTtcblxuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBuZXcgUGxheUluZm8oKTtcbiAgICAgICAgICAgIGluZm8ubm9kZSA9IGNoaWxkO1xuXG4gICAgICAgICAgICB0aGlzLnBsYXlJbmZvLnB1c2goaW5mbyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGxheSgpIHtcbiAgICAgICAgdGhpcy5wbGF5SW5mby5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5jb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb21wb25lbnRUeXBlLkFuaW1hdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ubm9kZS5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb21wb25lbnRUeXBlLlBhcnRpY2xlU3lzdGVtOlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5ub2RlLmdldENvbXBvbmVudChjYy5QYXJ0aWNsZVN5c3RlbSkucmVzZXRTeXN0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIENvbXBvbmVudFR5cGUuU3BpbmU6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGluZSA9IGluZm8ubm9kZS5nZXRDb21wb25lbnQoc3AuU2tlbGV0b24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BpbmUuc2V0QW5pbWF0aW9uKDAsIHNwaW5lLmFuaW1hdGlvbiwgc3BpbmUubG9vcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBpbmZvLmRlbGF5KTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------

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
//------QC-SOURCE-SPLIT------
