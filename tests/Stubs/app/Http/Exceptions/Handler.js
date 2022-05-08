import { HttpExceptionHandler } from '@athenna/http'

/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| Athenna will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
*/

export class Handler extends HttpExceptionHandler {
  constructor() {
    super()
  }

  /**
   * The global exception handler of all HTTP requests.
   *
   * @param {import('@athenna/http').ErrorContextContract} ctx
   */
  async handle(ctx) {
    return super.handle(ctx)
  }
}
