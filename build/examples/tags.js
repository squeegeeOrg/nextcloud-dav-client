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
const username = 'arturking';
const token = 'aHUMzWsLlXbRYsQaGrmTKMW6AjGdD7EZTWhqauljhn2W1BU3gVWaWZ6LxeJJgJk62DE9bjYC';
const projectname = 'project1';
const baseURL = 'http://localhost/remote.php/dav/';
const config = {
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dav = index_1.Client.create(config);
        const fileProps = yield dav.fileProps(`files/${username}/${projectname}/`);
        const tag = yield dav.createTag('tag-25-01-09-14');
        console.log(tag.id);
        const tagsList = yield dav.tagsList(fileProps.property('oc:fileid'));
        console.log(tagsList);
        yield dav.addTag(fileProps.property('oc:fileid'), tag);
        const tagsListWithTag = yield dav.tagsList(fileProps.property('oc:fileid'));
        console.log(tagsListWithTag);
        yield dav.removeTag(fileProps.property('oc:fileid'), tag);
        const tagsListWithRemovedTag = yield dav.tagsList(fileProps.property('oc:fileid'));
        console.log(tagsListWithRemovedTag);
    }
    catch (error) {
        console.log(error);
    }
});
run().then();
//# sourceMappingURL=tags.js.map