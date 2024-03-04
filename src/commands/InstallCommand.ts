/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Module, Path } from '@athenna/common'
import { Argument, BaseCommand, Option } from '@athenna/artisan'

export class InstallCommand extends BaseCommand {
  @Argument({
    signature: '<...libraries>',
    description: 'The libraries to install in your project.'
  })
  public libraries: string[]

  @Option({
    signature: '--registry',
    description:
      'Change the package manager that will be used to install the libraries',
    default: 'npm'
  })
  public registry: string

  @Option({
    signature: '-D, --save-dev',
    description: 'Install libraries as devDependencies.',
    default: false
  })
  public isDev: boolean

  public static signature(): string {
    return 'install'
  }

  public static description(): string {
    return 'Install libraries and automatically run the configurer if it exist.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ INSTALLING LIBRARIES ])\n')

    const task = this.logger.task()

    task.addPromise(`Installing ${this.libraries.join(', ')} libraries`, () => {
      return this.npm.install(this.libraries, {
        registry: Config.get('rc.commands.install.registry', this.registry),
        dev: this.isDev
      })
    })

    for (const library of this.libraries) {
      const path = Path.nodeModules(`${library}/configurer/index.js`)

      if (!(await File.exists(path))) {
        continue
      }

      task.addPromise(`Configuring ${library}`, async () => {
        const Configurer = await Module.getFrom(path)

        return new Configurer().setPath(path).configure()
      })
    }

    await task.run()

    this.logger.success(
      `Successfully installed ${this.libraries.join(', ')} libraries`
    )
  }
}
