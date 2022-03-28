/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse, normalize } from 'path'
import { Http, Router } from '@athenna/http'
import { resolveEnvFile } from '@athenna/config'
import { Path, Config as SecConfig, Is } from '@secjs/utils'

export class AthennaFactory {
  private static extension: '.js' | '.ts'

  private static bootProviders() {
    const providers = Config.get('app.providers')

    providers.forEach(Provider => {
      if (Is.Class(Provider)) {
        return new Provider().boot()
      }

      if (Is.Object(Provider) && !Provider.default) {
        const firstProviderKey = Object.keys(Provider)[0]

        return new Provider[firstProviderKey]().boot()
      }

      // eslint-disable-next-line new-cap
      return new Provider.default().boot()
    })
  }

  private static registerProviders() {
    const providers = Config.get('app.providers')

    providers.forEach(Provider => {
      if (Is.Class(Provider)) {
        return new Provider().register()
      }

      if (Is.Object(Provider) && !Provider.default) {
        const firstProviderKey = Object.keys(Provider)[0]

        return new Provider[firstProviderKey]().register()
      }

      // eslint-disable-next-line new-cap
      return new Provider.default().register()
    })
  }

  private static preloadFiles() {
    const preloads = Config.get('app.preloads')

    preloads.forEach(preload => {
      const { dir, name } = parse(Path.pwd(normalize(preload)))

      require(`${dir}/${name}${this.extension}`)
    })
  }

  constructor(fileName: string) {
    AthennaFactory.resolveNodeTs(fileName)

    const secConfig = new SecConfig()

    secConfig.load(Path.config(`app${AthennaFactory.extension}`))
    process.env.NODE_ENV = SecConfig.get('app.environment')

    resolveEnvFile()

    secConfig.load(Path.config(`app${AthennaFactory.extension}`))
    Config.load(Path.config())

    AthennaFactory.registerProviders()
    AthennaFactory.bootProviders()
    AthennaFactory.preloadFiles()
  }

  http(): Http {
    const http = ioc.use<Http>('Athenna/Core/HttpServer')
    const route = ioc.use<Router>('Athenna/Core/HttpRoute')

    route.register()
    http.listen(Config.get('app.port'), Config.get('app.host'))

    return http
  }

  private static resolveNodeTs(fileName: string) {
    const { ext } = parse(fileName)

    if (ext === '.ts') process.env.NODE_TS = 'true'
    else process.env.NODE_TS = 'false'

    AthennaFactory.extension = ext as any
  }
}
