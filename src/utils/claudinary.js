import {v2} from "cloudinary"
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env4QNTCs4f7iejHhNZby1cwiUWOcY
})

const uploadOnClaudinary = async (localFilePath)=>{

  try {
    const responce  = await cloudinary.uploader.upload(localFilePath,{
      resourcetype: "auto"
    })
    console.log(`file is uploaded on ${responce.url}`);
    return responce;
  } catch (error) {
    fs.unlinkSync(localFilePath);
  }
}
export {uploadOnClaudinary};