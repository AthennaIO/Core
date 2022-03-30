/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger } from '@athenna/logger'
import { parse, normalize } from 'path'
import { Http, Router } from '@athenna/http'
import { resolveEnvFile } from '@athenna/config'
import { Path, Config as SecConfig, Is } from '@secjs/utils'

export class AthennaFactory {
  private static logger: Logger
  private static extension: '.js' | '.ts'

  private static bootProviders() {
    const providers = Config.get('app.providers')

    providers.forEach(Provider => {
      if (Is.Class(Provider)) {
        AthennaFactory.logger.log(`Booting ${Provider.name}`)

        return new Provider().boot()
      }

      if (Is.Object(Provider) && !Provider.default) {
        const firstProviderKey = Object.keys(Provider)[0]
        AthennaFactory.logger.log(`Booting ${firstProviderKey}`)

        return new Provider[firstProviderKey]().boot()
      }

      AthennaFactory.logger.log(`Booting ${Provider.default.name}`)

      // eslint-disable-next-line new-cap
      return new Provider.default().boot()
    })
  }

  private static registerProviders() {
    const providers = Config.get('app.providers')

    providers.forEach(Provider => {
      if (Is.Class(Provider)) {
        AthennaFactory.logger.log(`Registering ${Provider.name}`)

        return new Provider().register()
      }

      if (Is.Object(Provider) && !Provider.default) {
        const firstProviderKey = Object.keys(Provider)[0]
        AthennaFactory.logger.log(`Registering ${firstProviderKey}`)

        return new Provider[firstProviderKey]().register()
      }

      AthennaFactory.logger.log(`Registering ${Provider.default.name}`)

      // eslint-disable-next-line new-cap
      return new Provider.default().register()
    })
  }

  private static preloadFiles() {
    const preloads = Config.get('app.preloads')

    preloads.forEach(preload => {
      preload = normalize(preload)

      const { dir, name } = parse(Path.pwd(preload))
      AthennaFactory.logger.log(`Preloading ${preload} file`)

      require(`${dir}/${name}${this.extension}`)
    })
  }

  constructor(fileName: string) {
    AthennaFactory.resolveNodeTs(fileName)

    const secConfig = new SecConfig()

    secConfig.load(Path.config(`app${AthennaFactory.extension}`))
    process.env.NODE_ENV = SecConfig.get('app.environment')

    console.log(process.env.NODE_ENV)

    resolveEnvFile()

    secConfig.load(Path.config(`app${AthennaFactory.extension}`))
    Config.load(Path.config())

    AthennaFactory.logger = new Logger().channel('application', {
      formatterConfig: {
        context: AthennaFactory.name,
      },
    })

    AthennaFactory.registerProviders()
    AthennaFactory.bootProviders()
    AthennaFactory.preloadFiles()
  }

  async http(): Promise<Http> {
    const http = ioc.use<Http>('Athenna/Core/HttpServer')
    const route = ioc.use<Router>('Athenna/Core/HttpRoute')

    route.register()

    const port = Config.get('app.port')
    const host = Config.get('app.host')

    await http.listen(port, host)

    AthennaFactory.logger.log(`Http server started on http://${host}:${port}`)

    return http
  }

  private static resolveNodeTs(fileName: string) {
    const { ext } = parse(fileName)

    if (ext === '.ts') process.env.NODE_TS = 'true'
    else process.env.NODE_TS = 'false'

    AthennaFactory.extension = ext as any
  }
}
