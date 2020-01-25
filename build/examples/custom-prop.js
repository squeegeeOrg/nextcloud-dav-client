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
const index_1 = require("../index");
const axios_1 = __importDefault(require("axios"));
const username = 'arturking';
const token = 'aHUMzWsLlXbRYsQaGrmTKMW6AjGdD7EZTWhqauljhn2W1BU3gVWaWZ6LxeJJgJk62DE9bjYC';
const projectname = 'project1';
const baseURL = 'http://localhost/remote.php/dav/';
const config = {
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = axios_1.default.create(config);
    try {
        const dav = index_1.Client.create(config);
        let fileprops = yield dav.fileProps(`files/${username}/${projectname}/`);
        console.log(fileprops.property('oc:fileid'));
        fileprops = fileprops.withProperty('oc:foreign-id', 'qdwdfdsfderw');
        yield dav.saveProps(fileprops);
        fileprops = yield dav.fileProps(`files/${username}/${projectname}/`);
        console.log(fileprops.all());
    }
    catch (error) {
        console.log(error);
    }
});
run().then();
//# sourceMappingURL=custom-prop.js.map