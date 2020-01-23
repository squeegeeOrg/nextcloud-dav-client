interface Property {
    name: string
    value: string
}

export class FileProps {

    constructor(readonly path: string, readonly props: object) {}

    withProperty(name: string, value: string): FileProps {
        const newProps = { ...this.props }
        newProps[name] = value
        return new FileProps(this.path, newProps)
    }

    property = (name: string): string => {
        return this.props[name]
    }

    all = (): Property[] => {
        return Object.keys(this.props).reduce(
            (carry: Property[], key: string) => {
                carry.push({ name: key, value: this.props[key] })
                return carry
            },
            [],
        )
    }
}
