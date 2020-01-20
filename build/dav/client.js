"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fileprops_1 = require("./fileprops");
const xmldom_1 = require("xmldom");
const tag_1 = require("./tag");
class Client {
    constructor(connection) {
        this.xmlNamespaces = {
            'DAV:': 'd',
            'http://owncloud.org/ns': 'oc',
            'http://nextcloud.org/ns': 'nc',
            'http://open-collaboration-services.org/ns': 'ocs',
        };
        this._connection = connection;
    }
    static create(baseURL, auth) {
        return new Client(axios_1.default.create({ baseURL, auth }));
    }
    addTag(fileid, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._connection({
                method: 'PUT',
                url: `/systemtags-relations/files/${fileid}/${tag.id()}`,
            });
        });
    }
    removeTag(fileid, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._connection({
                method: 'DELETE',
                url: `/systemtags-relations/files/${fileid}/${tag.id()}`,
            });
        });
    }
    tagslist(fileid) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `/systemtags-relations/files/${fileid}`;
            const responses = yield this._props(url, ['display-name', 'id']);
            var tags = responses.reduce((carry, item) => {
                if (item.propStat.length === 0 ||
                    item.propStat[0].status !== 'HTTP/1.1 200 OK') {
                    return carry;
                }
                const tag = new tag_1.Tag(item.propStat[0].properties['{http://owncloud.org/ns}id'], item.propStat[0].properties['{http://owncloud.org/ns}display-name']);
                carry.push(tag);
                return carry;
            }, []);
            return tags;
        });
    }
    fileprops(path, names = ['fileid', 'foreign-id']) {
        return __awaiter(this, void 0, void 0, function* () {
            const responses = yield this._props(path, names);
            let response = responses[0];
            if (response.propStat.length === 0 ||
                response.propStat[0].status !== 'HTTP/1.1 200 OK') {
                throw new Error(`Can't find file ${path}. ${response.propStat[0].status}`);
            }
            const props = Object.keys(response.propStat[0].properties).reduce((carry, key) => {
                const name = key.replace('{http://owncloud.org/ns}', '');
                carry[name] = response.propStat[0].properties[key];
                return carry;
            }, {});
            return new fileprops_1.FileProps(path, props);
        });
    }
    saveProps(fileprops) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore axios doesn't have PROPPATCH method
            const rawResponse = yield this._connection({
                method: 'PROPPATCH',
                url: fileprops.path(),
                data: `<?xml version="1.0"?>
            <d:propertyupdate  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
            ${fileprops
                    .all()
                    .filter(prop => prop.name !== 'fileid')
                    .map(prop => `<d:set>
              <d:prop>
                <oc:${prop.name}>${prop.value}</oc:${prop.name}>
              </d:prop>
            </d:set>`)
                    .join('')}</d:propertyupdate>`,
            });
            const responses = this._parseMultiStatus(rawResponse.data);
            var response = responses[0];
            if (response.propStat.length === 0 ||
                response.propStat[0].status !== 'HTTP/1.1 200 OK') {
                throw new Error(`Can't update properties of file ${fileprops.path()}. ${response.propStat[0].status}`);
            }
        });
    }
    _props(path, names) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore axios doesn't have PROPFIND method
            const rawResponse = yield this._connection({
                method: 'PROPFIND',
                url: path,
                data: `<?xml version="1.0"?>
				<d:propfind  xmlns:d="DAV:"
					xmlns:oc="http://owncloud.org/ns"
					xmlns:nc="http://nextcloud.org/ns"
					xmlns:ocs="http://open-collaboration-services.org/ns">
                <d:prop>
                    ${names.map(name => `<oc:${name} />`).join('')}
				</d:prop>
				</d:propfind>`,
            });
            return this._parseMultiStatus(rawResponse.data);
        });
    }
    createTag(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._connection({
                method: 'POST',
                url: '/systemtags',
                data: {
                    userVisible: true,
                    userAssignable: true,
                    canAssign: true,
                    name: name,
                },
            });
            var url = response.headers['content-location'];
            const id = this._parseIdFromLocation(url);
            return new tag_1.Tag(id, name);
        });
    }
    _parseIdFromLocation(url) {
        const queryPos = url.indexOf('?');
        if (queryPos > 0) {
            url = url.substr(0, queryPos);
        }
        const parts = url.split('/');
        let result;
        do {
            result = parts[parts.length - 1];
            parts.pop();
        } while (!result && parts.length > 0);
        return result;
    }
    _parseMultiStatus(doc) {
        let result = [];
        const xmlNamespaces = this.xmlNamespaces;
        const resolver = function (namespace) {
            let ii;
            for (ii in xmlNamespaces) {
                if (xmlNamespaces[ii] === namespace) {
                    return ii;
                }
            }
            return undefined;
        }.bind(this);
        const responses = this._getElementsByTagName(doc, 'd:response', resolver);
        let i;
        for (i = 0; i < responses.length; i++) {
            let responseNode = responses[i];
            let response = {
                href: null,
                propStat: [],
            };
            let hrefNode = this._getElementsByTagName(responseNode, 'd:href', resolver)[0];
            response.href = hrefNode.textContent || hrefNode.text;
            let propStatNodes = this._getElementsByTagName(responseNode, 'd:propstat', resolver);
            let j = 0;
            for (j = 0; j < propStatNodes.length; j++) {
                let propStatNode = propStatNodes[j];
                let statusNode = this._getElementsByTagName(propStatNode, 'd:status', resolver)[0];
                let propStat = {
                    status: statusNode.textContent || statusNode.text,
                    properties: {},
                };
                let propNode = this._getElementsByTagName(propStatNode, 'd:prop', resolver)[0];
                if (!propNode) {
                    continue;
                }
                let k = 0;
                for (k = 0; k < propNode.childNodes.length; k++) {
                    let prop = propNode.childNodes[k];
                    let value = this._parsePropNode(prop);
                    propStat.properties['{' +
                        prop.namespaceURI +
                        '}' +
                        (prop.localName || prop.baseName)] = value;
                }
                response.propStat.push(propStat);
            }
            result.push(response);
        }
        return result;
    }
    _parsePropNode(e) {
        let t = null;
        if (e.childNodes && e.childNodes.length > 0) {
            let n = [];
            for (let r = 0; r < e.childNodes.length; r++) {
                let i = e.childNodes[r];
                if (1 === i.nodeType)
                    n.push(i);
            }
            if (n.length) {
                t = n;
            }
        }
        return t || e.textContent || e.text || '';
    }
    _getElementsByTagName(node, name, resolver) {
        let parts = name.split(':');
        let tagName = parts[1];
        let namespace = resolver(parts[0]);
        if (typeof node === 'string') {
            let parser = new xmldom_1.DOMParser();
            node = parser.parseFromString(node, 'text/xml');
        }
        if (node.getElementsByTagNameNS) {
            return node.getElementsByTagNameNS(namespace, tagName);
        }
        return node.getElementsByTagName(name);
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map