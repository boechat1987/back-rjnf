'use strict'
const Drive = use('Drive');
const Helpers = use('Helpers');
const S3 = use('App/Models/S3');

class S3Controller {
    
    async getS3File({params}){
        const {file} = params;
        const result = await Drive.disk('s3').getUrl(file);
        return result
    }

    async sendS3File({request}){
        
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
            await Drive.disk("s3").put(`${Date.now()+file.clientName}`, file.stream, {
            ContentType: file.headers['content-type'],
            ACL: 'public-read'
            })
        })
        await request.multipart.process()
        return 'download successful'
    }

    async listS3Files(){
        const result = await S3.all();
        return result
    }

    async saveHardCopy({request}){
        const datenow = Date.now();
        const profilePic = request.file('file', {
            types: ['vnd.ms-excel','vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            size: '10mb'
          })
        
          await profilePic.move(Helpers.tmpPath('uploads'), {
            name: datenow+profilePic.clientName,
            overwrite: true
          })
        
          if (!profilePic.moved()) {
            return profilePic.error()
          }
         try{ await S3.create({name:datenow+profilePic.clientName})}
         catch (e){
             console.log(e)
         }
          return 'File moved'
    }
    
}

module.exports = S3Controller
