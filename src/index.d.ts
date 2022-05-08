import { Logger } from '@athenna/logger'

export class Ignite {
  /**
   * Mocking the Logger when client doesn't want to show it.
   *
   * @return {Logger}
   */
  static getLogger(): Logger

  fire(): Promise<Application>

  /**
   * Get the instance of the application inside of Ignite class.
   *
   * @return {Application}
   */
  getApplication(): Application
}

export class Application {
  /**
   * Boot a new Artisan inside this Application instance.
   *
   * @return {Promise<import('@athenna/artisan').ArtisanImpl>}
   */
  bootArtisan(): Promise<import('@athenna/artisan').ArtisanImpl>

  /**
   * Boot a new HttpServer inside this Application instance.
   *
   * @return {Promise<import('@athenna/http').Http>}
   */
  bootHttpServer(): Promise<import('@athenna/http').Http>

  /**
   * Shutdown the HttpServer inside this Application instance.
   *
   * @return {Promise<void>}
   */
  shutdownHttpServer(): Promise<void>
}
