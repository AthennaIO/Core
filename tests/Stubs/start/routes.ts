import { Route } from '../../../container'

Route.get('/healthcheck', ({ response }) => {
  return response.status(200).send({ status: 'ok' })
})
