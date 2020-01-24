import { Client, FileProps, Tag } from '../index'
import { AxiosBasicCredentials } from 'axios'

// tslint:disable-next-line
const username = 'arturking'
// tslint:disable-next-line
const password = '333333'
const projectName = 'project1'
const baseURL = 'http://localhost/remote.php/dav/'

const auth: AxiosBasicCredentials = {
    username,
    password,
}

const run = async () => {
    const dav: Client = Client.create(baseURL, auth)
    const fileProps: FileProps = await dav.fileProps(
        `files/${username}/${projectName}/`,
    )
    console.log(fileProps.property('fileId'))
    const filePropsWithForeignId = fileProps.withProperty('foreign-id', 'foo')
    await dav.saveProps(filePropsWithForeignId)
    const filePropsRead = await dav.fileProps(`files/${username}/${projectName}/`)
    console.log(filePropsRead.all())
}

run().then()
