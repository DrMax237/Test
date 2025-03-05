class InputSource {
    constructor() {
        this.id = 0;
        this.list = { None: 0 };
    }

    add(key, id = this.list[key] || ++this.id) {
        if (typeof key !== "string")
            cc.error("InputSource", "add", "Key is not string", key);
        this.list[key] = id;

        return id;
    }
}

saykit.InputSource = new Proxy(new InputSource(), {
    get: function (target, name) {
        if (target[name]) return target[name];
        if (target.list[name] !== undefined) return target[name];

        return target.add(name);
    },
});
