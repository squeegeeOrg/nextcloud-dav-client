interface Property {
    name: string,
    value: string
}

export class FileProps {

    private _path: string;
    private _props: object;

	constructor(path: string, props: object) {
		this._path = path;
		this._props = props;
    }

    path(): string {
        return this._path;
    }

    withProperty(name: string, value: string): FileProps {
        let newProps =  {...this._props};
        newProps[name] = value;
        return new FileProps(this._path, newProps);
    }
    
    property(name: string): string {
        return this._props[name];
    }

    all(): Array<Property> {
        return Object.keys(this._props).reduce((carry: Array<Property>, key: string) => {
            carry.push({name: key, value: this._props[key]});
            return carry;
        }, []);
    }
    
}