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
      const folder = await new Folder(Path.pwd()).load()
      const files = folder.getFilesByPattern(
        `!(${this.ignoreOnClean})/**/*.@(js|d.ts)`,
      )

      await Exec.concurrently(files, file => file.remove()).then(() =>
        this.logger.success('Application successfully cleaned.'),
      )

      return
    }

    const tsConfig = await this.getTsConfig()

    await Exec.command(`${Path.bin('tsc')} --project ${tsConfig.path}`).then(
      () => this.logger.success('Application successfully compiled.'),
    )
  }

  private getTsConfig(): Promise<File> {
    const path = Config.get(
      'rc.commandsManifest.build.tsconfig',
      '../../tmp/tsconfig.build.json',
    )

    const content = {
      extends: this.toPosixPath(Path.pwd('tsconfig.json')),
      include: [this.toPosixPath(Path.pwd('**/*'))],
      exclude: [
        this.toPosixPath(Path.tests()),
        this.toPosixPath(Path.nodeModules()),
      ],
    }

    return new File(path, JSON.stringify(content, null, 2)).load()
  }

  private toPosixPath(path: string): string {
    return path.replace(/\\/g, '/').slice(2)
  }
}
