export class Project {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly foreignID: string,
        readonly url: string,
    ) {}
}
