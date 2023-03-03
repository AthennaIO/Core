import { Route } from '@athenna/http'

Route.get('/hello', ({ response }) => response.send({ ok: true }))
