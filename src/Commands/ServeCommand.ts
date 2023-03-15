/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, Path } from '@athenna/common'
import { BaseCommand, CommandSettings, Option } from '@athenna/artisan'

export class ServeCommand extends BaseCommand {
  @Option({
    signature: '-w, --watch',
    description:
      'Watch for file changes and re-start the application on changes.',
    default: false,
  })
  public watch: boolean

  @Option({
    signature: '-e, --env <env>',
    description:
      'Change the evironment where the application will run. Default is ""',
    default: '',
  })
  public env: string

  public static settings(): CommandSettings {
    return {
      stayAlive: true,
    }
  }

  public static signature(): string {
    return 'serve'
  }

  public static description(): string {
    return 'Serve your application.'
  }

  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.NODE_ENV = this.env
    }

    if (this.watch) {
      let execCmd = "'npm run start --silent'"
      const nodemon = await import('nodemon')
      const ignorePaths = `--ignore ${Path.tests()} ${Path.storage()} ${Path.nodeModules()}`

      if (Env('NODEMON_NPM_ARGS', '') !== '') {
        execCmd = execCmd.concat(' ', Env('NODEMON_NPM_ARGS'))
      }

      nodemon.default(
        `--quiet ${ignorePaths} --watch ${Path.pwd()} --exec ${execCmd}`,
      )
    }

    await Module.resolve(
      Config.get('rc.commandsPaths.serve', '#bootstrap/main'),
      Config.get('rc.meta'),
    )
  }
}
