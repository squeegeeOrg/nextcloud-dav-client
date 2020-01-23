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
    let fileprops: FileProps = await dav.fileprops(
        `files/${username}/${projectname}/`,
    )
    console.log(fileprops.property('fileId'))
    fileprops = fileprops.withProperty('foreign-id', 'foo')
    await dav.saveProps(fileprops)
    fileprops = await dav.fileprops(`files/${username}/${projectname}/`)
    console.log(fileprops.all())
}

run()
