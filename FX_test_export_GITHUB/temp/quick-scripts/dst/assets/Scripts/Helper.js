
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