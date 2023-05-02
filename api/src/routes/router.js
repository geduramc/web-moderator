import express from 'express'
import path from 'node:path'
import { generalResponse } from '../utils/generalResponse.js'
import { security } from '../utils/security.js'
import { service } from '../services/service.js'

export function router (app) {
  app.use('/', express.static(path.resolve('./app')))
  
  app.use('/icons', express.static(path.resolve('./extension/icons')))

  app.post('/auth', (req, res) => {
    const { name, user, key } = req.body
    security.auth({ name, user, key})
    .then(data => {
      res.send(generalResponse.ok(data))
    })
    .catch(err => {
      res.status(400).send(generalResponse.error(err))
    })
  })

  app.post('/moderation', security.verify, (req, res) => {
    const { file } = req.body
    service.moderation({ fileUrl: file })
    .then((res) => res.json())
    .then(data => {
      res.send(generalResponse.ok(data))
    })
    .catch(err => {
      res.status(400).send(generalResponse.error(err))
    })
  })

  app.use((_req, res, _next) => {
    res.status(404).send(generalResponse.error('Error, 404 Not Found'))
  })
}
