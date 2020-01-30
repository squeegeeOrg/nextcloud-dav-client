import chai, { expect } from 'chai'
import fs from 'fs';
import { MultiStatusResponse } from '../../../src/dav/multiStatusResponse'

describe('fromString', () => {
    it('should parse responses', () => {
      const xml = fs.readFileSync(__dirname + '/../../fixtures/responses/default.xml','utf8')
      const response = MultiStatusResponse.fromString(xml)
      expect(response).to.have.lengthOf(1)
    })

    it('should parse href', () => {
      const xml = fs.readFileSync(__dirname + '/../../fixtures/responses/default.xml','utf8')
      const response = MultiStatusResponse.fromString(xml)
      expect(response[0].href).to.equal('/remote.php/dav/files/matchish/project1/')
    })

    it('should parse stats of properties', () => {
      const xml = fs.readFileSync(__dirname + '/../../fixtures/responses/default.xml','utf8')
      const response = MultiStatusResponse.fromString(xml)
      expect(response[0].propStat).to.have.lengthOf(2)
      expect(response[0].propStat[0].status).to.equal('HTTP/1.1 200 OK')
      expect(response[0].propStat[1].status).to.equal('HTTP/1.1 404 Not Found')
      expect(response[0].propStat[0].properties).to.deep.equal({
        "d:getlastmodified": "Wed, 22 Jan 2020 04:31:10 GMT",
        "nc:has-preview": "false",
        "oc:fileid": "307",
        "ocs:share-permissions": "31"
      })
      expect(response[0].propStat[1].properties).to.deep.equal({
        "d:getcontentlength": "",
        "d:getcontenttype": ""
      })

    })

})
import { format } from 'path'
