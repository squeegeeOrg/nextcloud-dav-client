import axios, {
    AxiosInstance,
    AxiosBasicCredentials,
    AxiosRequestConfig,
} from 'axios'
import { FileProps } from './fileprops'
import { DOMParser } from 'xmldom'
import { Tag } from './tag'
interface MultiStatusResponse {
    href: string | null
    propStat: PropertyStatus[]
}

interface PropertyStatus {
    status: string
    properties: object
}

type ResolverFunction = (namespace: string) => string | undefined

export class Client {

    constructor(readonly connection: AxiosInstance) {}
    private xmlNamespaces: object = {
        'DAV:': 'd',
        'http://owncloud.org/ns': 'oc',
        'http://nextcloud.org/ns': 'nc',
        'http://open-collaboration-services.org/ns': 'ocs',
    }

    addTag = async (fileId: string, tag: Tag) =>  this.connection({
            method: 'PUT',
            url: `/systemtags-relations/files/${fileId}/${tag.id}`,
        })

    removeTag = async (fileId: string, tag: Tag) =>  await this.connection({
            method: 'DELETE',
            url: `/systemtags-relations/files/${fileId}/${tag.id}`,
        })

    tagslist = async (fileId: string): Promise<Tag[]> => {
        const url = `/systemtags-relations/files/${fileId}`
        const responses = await this._props(url, ['display-name', 'id'])
        return responses.reduce(
            (carry: Tag[], item: MultiStatusResponse) => {
                if (
                    item.propStat.length === 0 ||
                    item.propStat[0].status !== 'HTTP/1.1 200 OK'
                ) {
                    return carry
                }
                const tag = new Tag(
                    item.propStat[0].properties['{http://owncloud.org/ns}id'],
                    item.propStat[0].properties[
                        '{http://owncloud.org/ns}display-name'
                    ],
                )
                carry.push(tag)
                return carry
            },
            [],
        )
    }

    fileprops = async (
        path: string,
        names: string[] = ['fileId', 'foreign-id'],
    ): Promise<FileProps> => {
        const responses = await this._props(path, names)
        const response: MultiStatusResponse = responses[0]
        if (
            response.propStat.length === 0 ||
            response.propStat[0].status !== 'HTTP/1.1 200 OK'
        ) {
            throw new Error(
                `Can't find file ${path}. ${response.propStat[0].status}`,
            )
        }
        const props = Object.keys(response.propStat[0].properties).reduce(
            (carry, key) => {
                const name: string = key.replace('{http://owncloud.org/ns}', '')
                carry[name] = response.propStat[0].properties[key]
                return carry
            },
            {},
        )
        return new FileProps(path, props)
    }

    saveProps = async (fileprops: FileProps) => {

        // @ts-ignore axios doesn't have PROPPATCH method
        const rawResponse = await this.connection({
            method: 'PROPPATCH',
            url: fileprops.path(),
            data: `<?xml version="1.0"?>
            <d:propertyupdate  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
            ${fileprops
                .all()
                .filter(prop => prop.name !== 'fileId')
                .map(
                    // tslint:disable-next-line
                    prop => `<d:set>
              <d:prop>
                <oc:${prop.name}>${prop.value}</oc:${prop.name}>
              </d:prop>
            </d:set>`,
                )
                .join('')}</d:propertyupdate>`,
        })

        const responses: MultiStatusResponse[] = this._parseMultiStatus(
            rawResponse.data,
        )
        const response = responses[0]
        if (
            response.propStat.length === 0 ||
            response.propStat[0].status !== 'HTTP/1.1 200 OK'
        ) {
            throw new Error(
                `Can't update properties of file ${fileprops.path()}. ${
                    response.propStat[0].status
                }`,
            )
        }
    }

    private _props = async (
        path: string,
        names: string[],
    ): Promise<MultiStatusResponse[]> => {
        // @ts-ignore axios doesn't have PROPFIND method
        const rawResponse = await this.connection({
            method: 'PROPFIND',
            url: path,
            data: `<?xml version="1.0"?>
				<d:propfind  xmlns:d="DAV:"
					xmlns:oc="http://owncloud.org/ns"
					xmlns:nc="http://nextcloud.org/ns"
					xmlns:ocs="http://open-collaboration-services.org/ns">
                <d:prop>
                    ${
                // tslint:disable-next-line
                names.map(name => `<oc:${name} />`
                ).join('')}
				</d:prop>
				</d:propfind>`,
        })
        return this._parseMultiStatus(rawResponse.data)
    }

    createTag = async (name: string): Promise<Tag> => {
        const response = await this.connection({
            method: 'POST',
            url: '/systemtags',
            data: {
                userVisible: true,
                userAssignable: true,
                canAssign: true,
                name,
            },
        })
        const url = response.headers['content-location']
        const id = this._parseIdFromLocation(url)
        return new Tag(id, name)
    }

    private _parseIdFromLocation = (url: string): string => {
        const queryPos = url.indexOf('?')
        if (queryPos > 0) {
            url = url.substr(0, queryPos)
        }

        const parts = url.split('/')
        let result
        do {
            result = parts[parts.length - 1]
            parts.pop()
        } while (!result && parts.length > 0)

        return result
    }

    private _parseMultiStatus = (doc: string): MultiStatusResponse[] => {
        const result: MultiStatusResponse[] = []
        const xmlNamespaces: object = this.xmlNamespaces
        const resolver: ResolverFunction = (namespace: string) => {
            let ii: string
            for (ii in xmlNamespaces) {
                if (xmlNamespaces[ii] === namespace) {
                    return ii
                }
            }
            return undefined
        }

        const responses = this._getElementsByTagName(
            doc,
            'd:response',
            resolver,
        )
        for (let i = 0; i < responses.length; i++) {
            const responseNode: any = responses[i]
            const response: MultiStatusResponse = {
                href: null,
                propStat: [],
            }

            const hrefNode: any = this._getElementsByTagName(
                responseNode,
                'd:href',
                resolver,
            )[0]

            response.href = hrefNode.textContent || hrefNode.text

            const propStatNodes = this._getElementsByTagName(
                responseNode,
                'd:propstat',
                resolver,
            )

            for (let j = 0; j < propStatNodes.length; j++) {
                const propStatNode: any = propStatNodes[j]
                const statusNode: any = this._getElementsByTagName(
                    propStatNode,
                    'd:status',
                    resolver,
                )[0]

                const propStat: PropertyStatus = {
                    status: statusNode.textContent || statusNode.text,
                    properties: {},
                }

                const propNode: any = this._getElementsByTagName(
                    propStatNode,
                    'd:prop',
                    resolver,
                )[0]
                if (!propNode) {
                    continue
                }
                for (let k = 0; k < propNode.childNodes.length; k++) {
                    const prop: any = propNode.childNodes[k]
                    const value: any = this._parsePropNode(prop)
                    propStat.properties[
                        '{' +
                            prop.namespaceURI +
                            '}' +
                            (prop.localName || prop.baseName)
                    ] = value
                }
                response.propStat.push(propStat)
            }

            result.push(response)
        }

        return result
    }

    private _parsePropNode = (e: any): string => {
        let t: any[] | null = null
        if (e.childNodes && e.childNodes.length > 0) {
            const n: any[] = []
            for (let r = 0; r < e.childNodes.length; r++) {
                const i: any = e.childNodes[r]
                if (1 === i.nodeType) { n.push(i) }
            }
            if (n.length) {
                t = n
            }
        }
        return t || e.textContent || e.text || ''
    }

    private _getElementsByTagName = (
        node: any,
        name: string,
        resolver: ResolverFunction,
    ): any => {
        const parts: string[] = name.split(':')
        const tagName: string = parts[1]
        // @Sergey what to do here? namespace could be undefined, I put in a naive fix..
        const namespace: string = resolver(parts[0]) || ''
        if (typeof node === 'string') {
            const parser: DOMParser = new DOMParser()
            node = parser.parseFromString(node, 'text/xml')
        }
        if (node.getElementsByTagNameNS) {
            return node.getElementsByTagNameNS(namespace, tagName)
        }
        return node.getElementsByTagName(name)
    }

    static create(baseURL: string, auth: AxiosBasicCredentials) {
        return new Client(axios.create({ baseURL, auth }))
    }
}
