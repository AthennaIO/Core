/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger } from '@athenna/logger'
import { normalize, parse } from 'path'
import { Http, Router } from '@athenna/http'
import { resolveEnvFile } from '@athenna/config'
import { Config as SecConfig, Path } from '@secjs/utils'
import { ResolveClassExport } from 'src/Utils/ResolveClassExport'
import { AthennaErrorHandler } from 'src/Utils/AthennaErrorHandler'

export class AthennaFactory {
  private static logger: Logger
  private static extension: '.js' | '.ts'

  constructor(fileName: string) {
    console.clear()

    AthennaFactory.resolveNodeTs(fileName)

    const secConfig = new SecConfig()

    secConfig.load(Path.config(`app${AthennaFactory.extension}`))
    process.env.NODE_ENV = SecConfig.get('app.environment')

    resolveEnvFile()

    secConfig.load(Path.config(`app${AthennaFactory.extension}`))
    Config.load(Path.config())

    AthennaFactory.logger = new Logger().channel('application', {
      formatterConfig: {
        context: AthennaFactory.name,
      },
    })

    const providers = AthennaFactory.getProviders()

    AthennaFactory.registerProviders(providers)
    AthennaFactory.bootProviders(providers)
    AthennaFactory.preloadFiles()
  }

  private static getProviders() {
    const providers = Config.get('app.providers')
    const providersNormalized: any[] = []

    providers.forEach(Provider => {
      providersNormalized.push(ResolveClassExport.resolve(Provider))
    })

    providersNormalized.forEach(Provider =>
      AthennaFactory.logger.log(`Registering ${Provider.name}`),
    )

    return providersNormalized
  }

  private static bootProviders(providers: any[]) {
    providers.forEach(Provider => new Provider().boot())
  }

  private static registerProviders(providers: any[]) {
    providers.forEach(Provider => new Provider().register())
  }

  private static preloadFiles() {
    const preloads = Config.get('app.preloads')

    preloads.forEach(preload => {
      preload = normalize(preload)

      const { dir, name } = parse(Path.config(preload))
      AthennaFactory.logger.log(`Preloading ${preload} file`)

      require(`${dir}/${name}${this.extension}`)
    })
  }

  private static resolveNodeTs(fileName: string) {
    const { ext } = parse(fileName)

    if (ext === '.ts') process.env.NODE_TS = 'true'
    else process.env.NODE_TS = 'false'

    AthennaFactory.extension = ext as any
  }

  async http(): Promise<Http> {
    const http = ioc.use<Http>('Athenna/Core/HttpServer')
    const route = ioc.use<Router>('Athenna/Core/HttpRoute')

    http.setErrorHandler(AthennaErrorHandler.http)

    route.register()

    const port = Config.get('app.port')
    const host = Config.get('app.host')

    await http.listen(port, host)

    AthennaFactory.logger.log(`Http server started on http://${host}:${port}`)

    return http
  }
}
