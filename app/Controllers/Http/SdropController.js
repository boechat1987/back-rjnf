'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Drive = use('Drive');
const Helpers = use('Helpers');
const Sdrop = use('App/Models/Sdrop');
/**
 * Resourceful controller for interacting with sdrops
 */
class SdropController {
  
  async getSdropFile({params}){
    const {file} = params;
    const result = await Drive.disk('sdrop').getUrl(file);
    return result
}

async sendSdropFile({request}){
    
    const validationOptions = {
        types: ['vnd.ms-excel','vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        size: '10mb'
    }
    
    request.multipart.file('file', validationOptions, async file => {
        // run validation rules
        await file.runValidations()
        // catches validation errors, if any and then throw exception
        const error = file.error()
        if (error.message) {
        throw new Error(error.message)
        }
        await Drive.disk("sdrop").put(`${Date.now()+file.clientName}`, file.stream, {
        ContentType: file.headers['content-type'],
        ACL: 'public-read'
        })
    })
    await request.multipart.process()
    return 'download successful'
}

async listSdropFiles(){
    const result = await Sdrop.all();
    return result
}

async saveHardCopy({request}){
    const datenow = Date.now();
    
    const profilePic = request.file('file', {
        types: ['octet-stream','vnd.ms-excel','vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        size: '10mb'
      })
      await profilePic.move(Helpers.tmpPath('uploads'), {
        name: datenow+profilePic.clientName,
        overwrite: true
      })
      
      if (!profilePic.moved()) {
        return profilePic.error()
      }
     try{ await Sdrop.create({name:datenow+profilePic.clientName})}
     catch (e){
         console.log(e)
     }
      return 'File moved'
}

}

module.exports = SdropController
