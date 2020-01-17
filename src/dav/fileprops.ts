export class FileProps {
    private _path: string;
    private _props: object;

	constructor(path: string, props: object) {
		this._path = path;
		this._props = props;
    }

    setProperty(name: string, value: string): FileProps {
        let newProps =  {...this._props};
        newProps[name] = value;
        return new FileProps(this._path, newProps);
    }
    
    getProperty(name: string): string {
        return this._props[name];
    }
    
}