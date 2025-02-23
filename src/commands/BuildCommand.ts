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
import { isAbsolute, join, parse } from 'node:path'
import { BaseCommand, Option } from '@athenna/artisan'
import { copyfiles } from '@athenna/tsconfig/copyfiles'
import { UndefinedOutDirException } from '#src/exceptions/UndefinedOutDirException'

export class BuildCommand extends BaseCommand {
  @Option({
    signature: '-v, --vite',
    description: 'Use vite to build your application static files.',
    default: false
  })
  public vite: boolean

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
    const includedPaths = Color.gray(include.join(', '))

    const outDir = this.getOutDir()
    const outDirName = Color.yellow.bold(parse(outDir).name)

    const tasks = this.logger.task()

    tasks.addPromise(`Deleting old ${outDirName} folder`, () => rimraf(outDir))

    tasks.addPromise(
      `Compiling the application with ${compiler} compiler`,
      () => tsc(tsConfigPath)
    )

    if (this.vite) {
      const vite = await this.getVite()

      tasks.addPromise(
        `Compiling static files using ${Color.yellow.bold('vite')}`,
        async () => {
          const config = await this.getViteConfig(vite)

          return vite.build(config)
        }
      )

      if (Config.exists('http.vite.ssrEntrypoint')) {
        tasks.addPromise(
          `Compiling SSR entrypoint using ${Color.yellow.bold('vite')}`,
          async () => {
            const config = await this.getViteConfig(vite)

            if (!config.build) {
              config.build = {}
            }

            if (!config.build.rollupOptions) {
              config.build.rollupOptions = {}
            }

            config.build.ssr = true
            config.build.outDir = Config.get('http.vite.ssrBuildDirectory')
            config.build.rollupOptions.input = Config.get(
              'http.vite.ssrEntrypoint'
            )

            return vite.build(config)
          }
        )
      }
    }

    if (include.length) {
      tasks.addPromise(
        `Copying included paths to ${outDirName} folder: ${includedPaths}`,
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

  public async getVite() {
    return import('vite')
  }

  public async getViteConfig(vite: any) {
    const { config } = await vite.loadConfigFromFile(
      {
        command: 'build',
        mode: 'production'
      },
      undefined,
      Path.pwd()
    )

    return config
  }
}
