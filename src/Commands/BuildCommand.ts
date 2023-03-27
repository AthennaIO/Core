/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exec, File, Folder } from '@athenna/common'
import { BaseCommand, Option } from '@athenna/artisan'

export class BuildCommand extends BaseCommand {
  @Option({
    signature: '--clean',
    description: 'Clean all .js and .d.ts files instead of building your code.',
    default: false,
  })
  public clean: boolean

  @Option({
    signature: '--ignore-on-clean [folders]',
    description: 'Ignore the given folders when cleaning the application.',
    default: 'tests|node_modules',
  })
  public ignoreOnClean: string

  public static signature(): string {
    return 'build'
  }

  public static description(): string {
    return 'Compile your application code to JavaScript.'
  }

  public async handle(): Promise<void> {
    if (this.clean) {
      this.logger.simple('({bold,green} [ CLEANING APPLICATION ])\n')

      const folder = await new Folder(Path.pwd()).load()
      const files = folder.getFilesByPattern(
        `!(${this.ignoreOnClean})/**/*.@(js|d.ts|js.map)`,
      )

      await this.logger.promiseSpinner(
        () => Exec.concurrently(files, file => file.remove()),
        {
          stream: process.stdout,
          text: 'Cleaning all .js, .d.ts and .js.map files from your application',
          successText: 'Application successfully cleaned',
          failText: 'Failed to clean your application:',
        },
      )

      return
    }

    this.logger.simple('({bold,green} [ BUILDING APPLICATION ])\n')

    const tsConfig = await this.getTsConfig()

    await this.logger.promiseSpinner(
      () => Exec.command(`${Path.bin('tsc')} --project ${tsConfig.path}`),
      {
        stream: process.stdout,
        text: 'Compiling all .ts files from your application',
        successText: 'Application successfully compiled',
        failText: 'Failed to compile your application:',
      },
    )
  }

  private getTsConfig(): Promise<File> {
    const path = Config.get(
      'rc.commands.build.tsconfig',
      '../../tmp/tsconfig.build.json',
    )

    const content = {
      extends: this.toPosix(Path.pwd('tsconfig.json')),
      include: [this.toPosix(Path.pwd('**/*'))],
      exclude: [this.toPosix(Path.tests()), this.toPosix(Path.nodeModules())],
    }

    return new File(path, JSON.stringify(content, null, 2)).load()
  }

  private toPosix(path: string): string {
    if (process.platform === 'win32') {
      return path.replace(/\\/g, '/').slice(2)
    }

    return path
  }
}
