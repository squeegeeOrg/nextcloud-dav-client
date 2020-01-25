"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileProps {
    constructor(path, props, dirtyProps = {}) {
        this.path = path;
        this.props = props;
        this.dirtyProps = dirtyProps;
        this.withProperty = (name, value) => {
            const dirty = { [name]: value };
            return new FileProps(this.path, this.props, dirty);
        };
        this.property = (name) => {
            return this.dirtyProps[name] || this.props[name];
        };
        this.all = () => {
            return Object.keys(Object.assign(Object.assign({}, this.props), this.dirtyProps)).reduce((carry, key) => {
                carry.push({ name: key, value: this.dirtyProps[key] || this.props[key] });
                return carry;
            }, []);
        };
        this.dirty = () => {
            return Object.keys(this.dirtyProps).reduce((carry, key) => {
                carry.push({ name: key, value: this.dirtyProps[key] });
                return carry;
            }, []);
        };
    }
}
exports.FileProps = FileProps;
//# sourceMappingURL=fileProps.js.map