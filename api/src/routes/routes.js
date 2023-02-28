const generalResponse = require('../utils/generalResponse')
const pkg = require('../../package.json')
const security = require('../utils/security')
const service = require('../services/service')

const router = (app) => {
  app.get('/', (_, res) => {
    res.json(generalResponse.ok({
      name: pkg.name,
      author: pkg.author,
      description: pkg.description,
      version: pkg.version
    }))
  })

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

module.exports = router
