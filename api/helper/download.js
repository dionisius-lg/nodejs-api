const fs = require('fs')
const path = require('path')
const axios = require('axios').default

 
/**
 * download file
 * @param  {string} fileUrl - the absolute url of the file you want to download
 * @param  {string} downloadFolder - the path of the downloaded file on your machine
 */
exports.downloadFile = async (fileUrl, downloadFolder) => {
    
    return new Promise(async (resolve, reject) => {
        try {
            // Get the file name
            const fileName = path.basename(fileUrl) 
        
            // The path of the downloaded file on our machine 
            const localFilePath = path.join(downloadFolder, fileName)
            console.log('localFilePath: ', localFilePath);
            
            const response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream',
            })
           
            response.data.pipe(fs.createWriteStream(localFilePath))
            
            response.data.on('end', () => { 
                resolve({
                    filename: fileName, 
                    status: true
                })
            })
    
            response.data.on('error', (e) => {
                console.log('Error download file!')
                resolve({
                    error: e,
                    status: false
                })
            })

        } catch (error) {
            // console.log('Error: ', error)
            resolve({
                error: error,
                status: false
            })
        }
    })    
}


/**
 * check if file exist
 * @param  {string} fileName - filename to be check
 */
exports.isFileExist = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.access(fileName, fs.F_OK, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

 