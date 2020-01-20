import { Client, FileProps, Tag } from '../index'
import { AxiosBasicCredentials } from 'axios'

const username = 'username'
const  password = 'password'
const projectname = 'project1'
let baseURL: string = 'http://localhost/remote.php/dav/'

let auth: AxiosBasicCredentials = {
    username,
    password,
}

;(async () => {
    let dav: Client = Client.create(baseURL, auth)
    let fileprops: FileProps = await dav.fileprops(`files/${username}/${projectname}/`)
    let tag: Tag = await dav.createTag('tag-0')
    console.log(tag.id())
    let tagslist = await dav.tagslist(fileprops.property('fileid'))
    console.log(tagslist)
    await dav.addTag(fileprops.property('fileid'), tag)
    tagslist = await dav.tagslist(fileprops.property('fileid'))
    console.log(tagslist)
    await dav.removeTag(fileprops.property('fileid'), tag)
    tagslist = await dav.tagslist(fileprops.property('fileid'))
    console.log(tagslist)
})()
