"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileProps {
    constructor(path, props) {
        this._path = path;
        this._props = props;
    }
    path() {
        return this._path;
    }
    withProperty(name, value) {
        let newProps = Object.assign({}, this._props);
        newProps[name] = value;
        return new FileProps(this._path, newProps);
    }
    property(name) {
        return this._props[name];
    }
    all() {
        return Object.keys(this._props).reduce((carry, key) => {
            carry.push({ name: key, value: this._props[key] });
            return carry;
        }, []);
    }
}
exports.FileProps = FileProps;
//# sourceMappingURL=fileprops.js.map