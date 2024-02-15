import fetch from "node-fetch"
import { security } from '../utils/security.js'

const moderation = ({ fileUrl }) => {
  const sign = security.sign()
  const data = new URLSearchParams()
  
  data.append('file', fileUrl)
  data.append('timestamp', sign.timestamp)
  data.append('api_key', process.env.CLOUDINARY_API_KEY)
  data.append('upload_preset', process.env.CLOUDINADY_UPLOAD_PRESET)
  data.append('moderation', 'aws_rek')
  data.append('signature', sign.signature)

  return fetch(`${process.env.CLOUDINADY_API}/${process.env.CLOUDINADY_NAME}/image/upload`, {
    method: 'post',
    body: data,
  })
}

export const service = { moderation }
