import { Route } from 'container/HttpRoute'

Route.get('/healthcheck', ({ response }) => {
  return response.status(200).send({ status: 'ok' })
})
