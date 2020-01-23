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
    const fileProps: FileProps = await dav.fileProps(
        `files/${username}/${projectname}/`,
    )
    const tag: Tag = await dav.createTag('tag-1')
    console.log(tag.id)
    const tagsList = await dav.tagsList(fileProps.property('fileId'))
    console.log(tagsList)
    await dav.addTag(fileProps.property('fileId'), tag)
    const tagsListWithFileId = await dav.tagsList(fileProps.property('fileId'))
    console.log(tagsListWithFileId)
    await dav.removeTag(fileProps.property('fileId'), tag)
    const tagsListRead = await dav.tagsList(fileProps.property('fileId'))
    console.log(tagsListRead)
}

run().then()
