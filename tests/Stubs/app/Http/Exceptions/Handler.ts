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
  public constructor() {
    super()
  }

  /**
   * The global exception handler of all HTTP requests.
   *
   * @param ctx
   */
  public async handle(ctx): Promise<void> {
    return super.handle(ctx)
  }
}
