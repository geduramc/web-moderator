const jwt = require('jsonwebtoken')
const generalResponse = require('../utils/generalResponse')
const crypto = require('crypto')

const auth = ({ name, user, key }) => {
  return new Promise((resolve, reject) => {
    if(key != process.env.API_KEY) reject('invalid or missing api key')
    resolve({
      token: jwt.sign({
        name: name,
        user: user
      }, process.env.TOKEN_SECRET, null)
    })
  })
}

const verify = (req, res, next) => {
  try {
    const token = req.header('Authorization')
    if (!token) throw new Error('error')

    jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET)
    next()
  } catch (error) {
    res.status(401).json(generalResponse.error('invalid or missing token'))
  }
}

const sign = () => {
  const shasum = crypto.createHash('sha1')
  const timestamp = Math.ceil(Date.now() / 1000)
  const str = `moderation=aws_rek&timestamp=${timestamp}&upload_preset=ml_default${process.env.CLOUDINARY_SECRET}`
  shasum.update(str)
  return {
    timestamp: timestamp,
    signature: shasum.digest('hex')
  }
}

module.exports = { auth, verify, sign }
