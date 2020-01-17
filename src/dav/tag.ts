export class Tag {
    private _id: string
    private _name: string

    constructor(id: string, name: string) {
        this._id = id
        this._name = name
    }

    id(): string {
        return this._id
    }

    name(): string {
        return this._name
    }
}
