import { ConsoleExceptionHandler } from '@athenna/artisan'

/*
|--------------------------------------------------------------------------
| Console Exception Handler
|--------------------------------------------------------------------------
|
| Athenna will forward all exceptions occurred during an Artisan command
| execution to the following class. You can learn more about exception
| handling by reading docs.
|
*/

export class Handler extends ConsoleExceptionHandler {
  /**
   * The global exception handler of all Artisan commands.
   *
   * @param {any} error
   */
  async handle(error) {
    return super.handle(error)
  }
}
