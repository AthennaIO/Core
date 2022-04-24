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
   * Set if error logs will come with stack.
   *
   * @protected
   */
  protected addStack = false

  /**
   * The global exception handler of all Artisan commands.
   *
   * @param error
   */
  public async handle(error): Promise<void> {
    return super.handle(error)
  }
}
