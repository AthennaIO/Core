/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { Module } from '@athenna/common'
import { BaseCommand, Option } from '@athenna/artisan'

export class ServeCommand extends BaseCommand {
  @Option({
    signature: '-e, --env <env>',
    description: 'Change the environment where the application will run.',
    default: ''
  })
  public env: string

  @Option({
    signature: '-w, --watch',
    description: 'Use nodemon to watch the application and restart on changes.',
    default: false
  })
  public watch: boolean

  public static signature(): string {
    return 'serve'
  }

  public static description(): string {
    return 'Serve your application.'
  }

  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.APP_ENV = this.env
      process.env.NODE_ENV = this.env
    }

    const entrypoint = Config.get(
      'rc.commands.serve.entrypoint',
      Path.bootstrap(`main.${Path.ext()}`)
    )

    if (this.watch) {
      const nodemon = this.getNodemon()

      nodemon({
        script: entrypoint.replace('.ts', '.js')
      })

      if (Config.is('rc.bootLogs', false)) {
        return
      }

      let isFirstRestart = true

      nodemon
        .on('start', () => {
          if (isFirstRestart) {
            return
          }

          console.clear()
          Log.channelOrVanilla('application').success(
            'Application successfully restarted'
          )
        })
        .on('restart', () => {
          isFirstRestart = false
        })

      return
    }

    await Module.resolve(entrypoint, Config.get('rc.parentURL'))
  }

  public getNodemon() {
    const require = Module.createRequire(import.meta.url)

    return require('nodemon')
  }
}
