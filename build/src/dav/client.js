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
const fileProps_1 = require("./fileProps");
const tag_1 = require("./tag");
const multiStatusResponse_1 = require("./multiStatusResponse");
class Client {
    constructor(connection) {
        this.connection = connection;
        this.addTag = (fileId, tag) => __awaiter(this, void 0, void 0, function* () {
            return this.connection({
                method: 'PUT',
                url: `/systemtags-relations/files/${fileId}/${tag.id}`,
            });
        });
        this.removeTag = (fileId, tag) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connection({
                method: 'DELETE',
                url: `/systemtags-relations/files/${fileId}/${tag.id}`,
            });
        });
        this.tagsList = (fileId) => __awaiter(this, void 0, void 0, function* () {
            const url = `/systemtags-relations/files/${fileId}`;
            const responses = yield this._props(url, ['oc:display-name', 'oc:id']);
            return responses.reduce((carry, item) => {
                if (item.propStat.length === 0 ||
                    item.propStat[0].status !== 'HTTP/1.1 200 OK') {
                    return carry;
                }
                const tag = new tag_1.Tag(item.propStat[0].properties['oc:id'], item.propStat[0].properties['oc:display-name']);
                carry.push(tag);
                return carry;
            }, []);
        });
        this.fileProps = (path, names = [
            'd:getlastmodified',
            'd:getetag',
            'd:getcontenttype',
            'd:resourcetype',
            'oc:fileid',
            'oc:permissions',
            'oc:size',
            'd:getcontentlength',
            'nc:has-preview',
            'nc:mount-type',
            'nc:is-encrypted',
            'ocs:share-permissions',
            'oc:tags',
            'oc:favorite',
            'oc:comments-unread',
            'oc:owner-id',
            'oc:owner-display-name',
            'oc:share-types',
            'oc:share-types',
            'oc:foreign-id',
        ]) => __awaiter(this, void 0, void 0, function* () {
            const responses = yield this._props(path, names);
            const response = responses[0];
            if (response.propStat.length === 0 ||
                response.propStat[0].status !== 'HTTP/1.1 200 OK') {
                throw new Error(`Can't find file ${path}. ${response.propStat[0].status}`);
            }
            const props = Object.keys(response.propStat[0].properties).reduce((carry, key) => {
                const name = key.replace('{http://owncloud.org/ns}', '');
                carry[name] = response.propStat[0].properties[key];
                return carry;
            }, {});
            return new fileProps_1.FileProps(path, props);
        });
        this.saveProps = (fileProps) => __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore axios doesn't have PROPPATCH method
            const rawResponse = yield this.connection({
                method: 'PROPPATCH',
                url: fileProps.path,
                data: `<?xml version="1.0"?>
            <d:propertyupdate  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
            ${fileProps
                    .dirty()
                    .map(
                // tslint:disable-next-line
                prop => `<d:set>
              <d:prop>
                <${prop.name}>${prop.value}</${prop.name}>
              </d:prop>
            </d:set>`)
                    .join('')}</d:propertyupdate>`,
            });
            const responses = this._parseMultiStatus(rawResponse.data);
            const response = responses[0];
            if (response.propStat.length === 0 ||
                response.propStat[0].status !== 'HTTP/1.1 200 OK') {
                throw new Error(`Can't update properties of file ${fileProps.path}. ${response.propStat[0].status}`);
            }
        });
        this._props = (path, names) => __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore axios doesn't have PROPFIND method
            const rawResponse = yield this.connection({
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
                names.map(name => `<${name} />`).join('')}
				</d:prop>
				</d:propfind>`,
            });
            return this._parseMultiStatus(rawResponse.data);
        });
        this.createTag = (name) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.connection({
                method: 'POST',
                url: '/systemtags',
                data: {
                    userVisible: true,
                    userAssignable: true,
                    canAssign: true,
                    name,
                },
            });
            const url = response.headers['content-location'];
            const id = this._parseIdFromLocation(url);
            return new tag_1.Tag(id, name);
        });
        this._parseIdFromLocation = (url) => {
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
        };
        this._parseMultiStatus = (doc) => {
            return multiStatusResponse_1.MultiStatusResponse.fromString(doc);
        };
    }
}
exports.Client = Client;
Client.create = (config) => {
    return new Client(axios_1.default.create(config));
};
//# sourceMappingURL=client.js.map