import { Client, FileProps, Tag } from '../index'
import { AxiosRequestConfig } from 'axios'
import { Project } from 'src/dav/project'

const username = 'username'
const token =
    '1gtlgCsANyXdTUFLgmWZINwKnqHPZYEZZQNr4ARUouONSjrFfdVGqWB1AEuuz9jtOcq3u7fD'

const projectname = 'project-1'
const baseURL = 'http://localhost/remote.php/dav/'

const config: AxiosRequestConfig = {
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
}

const run = async () => {
    try {
        const dav: Client = Client.create(config)
        const project: Project = await dav.createProject(
            username,
            projectname,
            'foreign-id',
        )
        console.log(project.id)
    } catch (error) {
        console.log(error)
    }
}

run().then()
