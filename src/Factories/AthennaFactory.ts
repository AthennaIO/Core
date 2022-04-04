/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@secjs/utils'
import { Logger } from '@athenna/logger'
import { normalize, parse } from 'path'
import { Http, Router } from '@athenna/http'
import { resolveEnvFile } from '@athenna/config'
import { getAppEnvironment } from 'src/Utils/getAppEnvironment'
import { ResolveClassExport } from 'src/Utils/ResolveClassExport'
import { AthennaErrorHandler } from 'src/Utils/AthennaErrorHandler'

export class AthennaFactory {
  private static logger: any
  private static extension: '.js' | '.ts'

  constructor(fileName: string) {
    AthennaFactory.resolveNodeTs(fileName)

    process.env.NODE_ENV = getAppEnvironment(
      Path.config(`app${AthennaFactory.extension}`),
    )

    resolveEnvFile()
    Config.load(Path.config())

    AthennaFactory.logger = new Logger().channel('application', {
      formatterConfig: {
        context: AthennaFactory.name,
      },
    })

    if (
      !Env('APP_DEBUG') &&
      (Env('NODE_ENV') === 'test' || Env('NODE_ENV') === 'testing')
    ) {
      AthennaFactory.logger = {
        log: () => {},
        error: () => {},
      }
    } else {
      console.clear()
    }

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
    providers.forEach(Provider => {
      const provider = new Provider()

      provider.registerAttributes()

      if (provider.boot) provider.boot()
    })
  }

  private static registerProviders(providers: any[]) {
    providers.forEach(Provider => {
      const provider = new Provider()

      provider.registerAttributes()

      if (provider.register) provider.register()
    })
  }

  private static preloadFiles() {
    const preloads = Config.get('app.preloads')

    preloads.forEach(preload => {
      preload = normalize(preload)

      const { dir, name } = parse(Path.config(preload))
      AthennaFactory.logger.log(`Preloading ${name} file`)

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
    const http = ioc.safeUse<Http>('Athenna/Core/HttpServer')
    const route = ioc.safeUse<Router>('Athenna/Core/HttpRoute')

    http.setErrorHandler(AthennaErrorHandler.http)

    route.register()

    const port = Config.get('app.port')
    const host = Config.get('app.host')

    await http.listen(port, host)

    AthennaFactory.logger.log(`Http server started on http://${host}:${port}`)

    return http
  }
}
