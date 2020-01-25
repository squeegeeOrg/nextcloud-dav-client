import { Client, FileProps } from '../index'
import axios, { AxiosRequestConfig } from 'axios'

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
    const client = axios.create(config)
    try {
        const dav: Client = Client.create(config)

        let fileprops: FileProps = await dav.fileProps(
            `files/${username}/${projectname}/`,
        )

        console.log(fileprops.property('oc:fileid'))
        fileprops = fileprops.withProperty('oc:foreign-id', 'qdwdfdsfderw')
        await dav.saveProps(fileprops)
        fileprops = await dav.fileProps(`files/${username}/${projectname}/`)
        console.log(fileprops.all())
    } catch (error) {
        console.log(error)
    }
}

run().then()
