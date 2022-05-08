import { Route } from '@athenna/http'

Route.get('/healthcheck', ({ response }) => {
  return response.status(200).send({ status: 'ok' })
})
