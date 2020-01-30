import { Client, FileProps, Tag } from '../index'
import { AxiosRequestConfig } from 'axios'

const username = 'username'
const token =
    'aHUMzWsLlXbRYsQaGrmTKMW6AjGdD7EZTWhqauljhn2W1BU3gVWaWZ6LxeJJgJk62DE9bjYC'

const projectname = 'project1'
const baseURL = 'http://localhost/remote.php/dav/'

const config: AxiosRequestConfig = {
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
}

const run = async () => {
    try {
        const dav: Client = Client.create(config)
        const fileProps: FileProps = await dav.fileProps(
            `files/${username}/${projectname}/`,
        )
        const tag: Tag = await dav.createTag('tag-1')
        console.log(tag.id)
        const originTagsList = await dav.tagsList(
            fileProps.property('oc:fileid'),
        )
        console.log(originTagsList)
        await dav.addTag(fileProps.property('oc:fileid'), tag)
        const tagsListWithTag = await dav.tagsList(
            fileProps.property('oc:fileid'),
        )
        console.log(tagsListWithTag)
        await dav.removeTag(fileProps.property('oc:fileid'), tag)
        const tagsListWithRemovedTag = await dav.tagsList(
            fileProps.property('oc:fileid'),
        )
        console.log(tagsListWithRemovedTag)
    } catch (error) {
        console.log(error)
    }
}

run().then()
