"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmldom_1 = require("xmldom");
class MultiStatusResponse {
    constructor(href, propStat) {
        this.href = href;
        this.propStat = propStat;
    }
}
exports.MultiStatusResponse = MultiStatusResponse;
MultiStatusResponse.xmlNamespaces = {
    'DAV:': 'd',
    'http://owncloud.org/ns': 'oc',
    'http://nextcloud.org/ns': 'nc',
    'http://open-collaboration-services.org/ns': 'ocs',
};
MultiStatusResponse.fromString = (doc) => {
    const result = [];
    const xmlNamespaces = MultiStatusResponse.xmlNamespaces;
    const resolver = (namespace) => {
        let ii;
        for (ii in xmlNamespaces) {
            if (xmlNamespaces[ii] === namespace) {
                return ii;
            }
        }
        return undefined;
    };
    const responses = MultiStatusResponse._getElementsByTagName(doc, 'd:response', resolver);
    for (let i = 0; i < responses.length; i++) {
        const responseNode = responses[i];
        const response = new MultiStatusResponse(null, []);
        const hrefNode = MultiStatusResponse._getElementsByTagName(responseNode, 'd:href', resolver)[0];
        response.href = hrefNode.textContent || hrefNode.text;
        const propStatNodes = MultiStatusResponse._getElementsByTagName(responseNode, 'd:propstat', resolver);
        for (let j = 0; j < propStatNodes.length; j++) {
            const propStatNode = propStatNodes[j];
            const statusNode = MultiStatusResponse._getElementsByTagName(propStatNode, 'd:status', resolver)[0];
            const propStat = {
                status: statusNode.textContent || statusNode.text,
                properties: {},
            };
            const propNode = MultiStatusResponse._getElementsByTagName(propStatNode, 'd:prop', resolver)[0];
            if (!propNode) {
                continue;
            }
            for (let k = 0; k < propNode.childNodes.length; k++) {
                const prop = propNode.childNodes[k];
                const value = MultiStatusResponse._parsePropNode(prop);
                const namespace = MultiStatusResponse.xmlNamespaces[prop.namespaceURI] ||
                    prop.namespaceURI;
                propStat.properties[`${namespace}:${prop.localName || prop.baseName}`] = value;
            }
            response.propStat.push(propStat);
        }
        result.push(response);
    }
    return result;
};
MultiStatusResponse._parsePropNode = (e) => {
    let t = null;
    if (e.childNodes && e.childNodes.length > 0) {
        const n = [];
        for (let r = 0; r < e.childNodes.length; r++) {
            const i = e.childNodes[r];
            if (1 === i.nodeType) {
                n.push(i);
            }
        }
        if (n.length) {
            t = n;
        }
    }
    return t || e.textContent || e.text || '';
};
MultiStatusResponse._getElementsByTagName = (node, name, resolver) => {
    const parts = name.split(':');
    const tagName = parts[1];
    // @Sergey what to do here? namespace could be undefined, I put in a naive fix..
    const namespace = resolver(parts[0]) || '';
    if (typeof node === 'string') {
        const parser = new xmldom_1.DOMParser();
        node = parser.parseFromString(node, 'text/xml');
    }
    if (node.getElementsByTagNameNS) {
        return node.getElementsByTagNameNS(namespace, tagName);
    }
    return node.getElementsByTagName(name);
};
//# sourceMappingURL=multiStatusResponse.js.map