"use strict";
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