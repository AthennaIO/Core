/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from '@athenna/artisan'
import { isAbsolute, join, parse, sep } from 'node:path'
import { Exec, Path, File, Color } from '@athenna/common'

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

    const tsConfig = await new File(tsConfigPath).getContentAsJson()
    const metaFiles = Config.get('rc.commands.build.metaFiles', []).join(' ')
    const buildDir =
      parse(tsConfigPath).dir + sep + tsConfig.compilerOptions.outDir

    if (metaFiles.includes(' .env ')) {
      metaFiles.replace(' .env ', '')
    }

    const tasks = this.logger.task()

    tasks.add(
      `Delete old ${Color.yellow.bold(parse(buildDir).name)} folder`,
      async task => {
        await Exec.command(`${Path.nodeModulesBin('rimraf')} ${buildDir}`)
          .then(() => task.complete())
          .catch(error => {
            task.fail()
            throw error
          })
      },
    )

    tasks.add('Compile the application', async task => {
      await Exec.command(
        `${Path.nodeModulesBin('tsc')} --project ${tsConfigPath}`,
      )
        .then(() => task.complete())
        .catch(error => {
          task.fail()
          throw error
        })
    })

    if (metaFiles.length) {
      tasks.add(`Copy meta files: ${Color.gray(metaFiles)}`, async task => {
        await Exec.command(
          `${Path.nodeModulesBin('copyfiles')} ${metaFiles} ${buildDir}`,
        )
          .then(() => task.complete())
          .catch(error => {
            task.fail()
            throw error
          })
      })
    }

    await tasks.run()

    console.log()

    this.logger.success('Application successfully compiled')
  }
}
