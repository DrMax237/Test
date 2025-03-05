const { ccclass, property, menu, executeInEditMode } = cc._decorator;

enum ComponentType {
    ParticleSystem = 0,
    Animation,
    Spine,
}

enum ControlType {
    AllKeys = 0,
    ExactKey,
}

enum KeyType {
    AllKeys = 0,
    ExactKey,
}

@ccclass('PlayInfo')
class PlayInfo {

    @property() delay: number = 0;
    @property(cc.Node) node: cc.Node = null;

}

@ccclass
@menu('Prohor/Helper')
@executeInEditMode
export default class Helper extends cc.Component {

    @property({ type: cc.Enum(ComponentType) }) component: ComponentType = ComponentType.ParticleSystem;
    @property({ type: cc.Enum(ControlType) }) control: ControlType = ControlType.AllKeys;

    @property({ type: cc.Enum(cc.macro.KEY), visible() { return this.control === ControlType.ExactKey } }) key: cc.macro.KEY = cc.macro.KEY.b;

    @property _autofind: boolean = false;
    @property
    set Autofind(v: boolean) {
        this._autofind = v;
        this._autofind && this.autofindNodes();
    };
    get Autofind(): boolean { return this._autofind };

    @property([PlayInfo]) playInfo: PlayInfo[] = [];

    onLoad() {
        if (!CC_EDITOR) {
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }
    }

    private onKeyDown(event) {
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
    }

    private autofindNodes() {
        const children = this.node.children;
        this.playInfo = [];

        children.forEach(child => {
            const info = new PlayInfo();
            info.node = child;

            this.playInfo.push(info);
        });
    }

    private play() {
        this.playInfo.forEach(info => {
            this.scheduleOnce(() => {
                switch (this.component) {
                    case ComponentType.Animation:
                        info.node.getComponent(cc.Animation).play();
                        break;
                    case ComponentType.ParticleSystem:
                        info.node.getComponent(cc.ParticleSystem).resetSystem();
                        break;
                    case ComponentType.Spine:
                        const spine = info.node.getComponent(sp.Skeleton);
                        spine.setAnimation(0, spine.animation, spine.loop);
                        break;
                }
            }, info.delay);
        });
    }
}