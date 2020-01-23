import { Client, FileProps, Tag } from '../index'
import { AxiosBasicCredentials } from 'axios'
// tslint:disable-next-line
const username = 'arturking'
// tslint:disable-next-line
const password = '333333'
const projectname = 'project1'
const baseURL = 'http://localhost/remote.php/dav/'

const auth: AxiosBasicCredentials = {
    username,
    password,
}

const run = async () => {
    const dav: Client = Client.create(baseURL, auth)
    const fileprops: FileProps = await dav.fileprops(
        `files/${username}/${projectname}/`,
    )
    const tag: Tag = await dav.createTag('tag-1')
    console.log(tag.id)
    let tagslist = await dav.tagslist(fileprops.property('fileid'))
    console.log(tagslist)
    await dav.addTag(fileprops.property('fileid'), tag)
    tagslist = await dav.tagslist(fileprops.property('fileid'))
    console.log(tagslist)
    await dav.removeTag(fileprops.property('fileid'), tag)
    tagslist = await dav.tagslist(fileprops.property('fileid'))
    console.log(tagslist)
}

run()
