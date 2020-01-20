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
    console.log(fileprops.property('fileid'))
    fileprops = fileprops.withProperty('foreign-id', 'val')
    await dav.saveProps(fileprops)
    fileprops = await dav.fileprops(`files/${username}/${projectname}/`)
    console.log(fileprops.all())
})()
