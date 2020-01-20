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
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const username = 'username';
const password = 'password';
const projectname = 'project1';
let baseURL = 'http://localhost/remote.php/dav/';
let auth = {
    username,
    password,
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    let dav = index_1.Client.create(baseURL, auth);
    let fileprops = yield dav.fileprops(`files/${username}/${projectname}/`);
    let tag = yield dav.createTag('tag-0');
    console.log(tag.id());
    let tagslist = yield dav.tagslist(fileprops.property('fileid'));
    console.log(tagslist);
    yield dav.addTag(fileprops.property('fileid'), tag);
    tagslist = yield dav.tagslist(fileprops.property('fileid'));
    console.log(tagslist);
    yield dav.removeTag(fileprops.property('fileid'), tag);
    tagslist = yield dav.tagslist(fileprops.property('fileid'));
    console.log(tagslist);
}))();
//# sourceMappingURL=tags.js.map