import { Route } from 'src/Modules/HttpRoute'

Route.get('/healthcheck', ({ response }) => {
  return response.status(200).send({ status: 'ok' })
})
