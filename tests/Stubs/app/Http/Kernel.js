import { HttpKernel } from '@athenna/http'

export class Kernel extends HttpKernel {
  /**
   * The application's global HTTP middlewares.
   *
   * This middlewares are run during every request to your http server.
   */
  get globalMiddlewares() {
    return []
  }

  /**
   * The application's named HTTP middlewares.
   *
   * Here you define all your named middlewares to use inside routes/http file.
   */
  get namedMiddlewares() {
    return {}
  }
}
