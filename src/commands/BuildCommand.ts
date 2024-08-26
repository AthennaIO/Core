/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { rimraf } from 'rimraf'
import { tsc } from '@athenna/tsconfig/tsc'
import { Path, Color } from '@athenna/common'
import { BaseCommand } from '@athenna/artisan'
import { isAbsolute, join, parse } from 'node:path'
import { copyfiles } from '@athenna/tsconfig/copyfiles'
import { UndefinedOutDirException } from '#src/exceptions/UndefinedOutDirException'

export class BuildCommand extends BaseCommand {
  public static signature(): string {
    return 'build'
  }

  public static description(): string {
    return 'Compile your application code from TypeScript to JavaScript.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ BUILD APPLICATION ])\n')

    let tsConfigPath = Config.get('rc.commands.build.tsconfig')

    if (!isAbsolute(tsConfigPath)) {
      tsConfigPath = join(Path.pwd(), tsConfigPath)
    }

    const include = Config.get<string[]>('rc.commands.build.include', [])

    if (include.includes('.env')) {
      include.splice(include.indexOf('.env'), 1)
    }

    const compiler = Color.yellow.bold('tsc')
    const includedFiles = Color.gray(include.join(', '))

    const outDir = this.getOutDir()
    const outDirName = Color.yellow.bold(parse(outDir).name)

    const tasks = this.logger.task()

    tasks.addPromise(`Deleting old ${outDirName} folder`, () => rimraf(outDir))

    tasks.addPromise(
      `Compiling the application with ${compiler} compiler`,
      () => tsc(tsConfigPath)
    )

    if (include.length) {
      tasks.addPromise(
        `Copying included paths to ${outDirName} folder: ${includedFiles}`,
        () => copyfiles(include, outDir)
      )
    }

    await tasks.run()

    console.log()

    this.logger.success('Application successfully compiled')

    this.logger
      .instruction()
      .head('Running compiled code')
      .add(`cd ${outDirName}`)
      .add('npm ci --omit=dev')
      .add('Define your production environment variables')
      .add(`node ${Color.yellow.bold(`${parse(Path.bin()).name}/main.js`)}`)
      .render()
  }

  private getOutDir(): string {
    if (!Config.exists('rc.commands.build.outDir')) {
      throw new UndefinedOutDirException()
    }

    return Path.pwd(Config.get('rc.commands.build.outDir'))
  }
}
