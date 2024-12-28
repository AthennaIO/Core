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
import { isAbsolute, join, parse } from 'node:path'
import { Path, Color, Module } from '@athenna/common'
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

    if (include.length) {
      tasks.addPromise(
        `Copying included paths to ${outDirName} folder: ${includedPaths}`,
        () => copyfiles(include, outDir)
      )
    }

    if (this.vite) {
      const vite = this.getVite()

      tasks.addPromise(
        `Compiling static files using ${Color.yellow.bold('vite')}`,
        async () => {
          const config = await this.getViteConfig(vite)

          return vite.build(config)
        }
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

  public getVite() {
    const require = Module.createRequire(import.meta.url)

    return require('vite')
  }

  public async getViteConfig(vite: any) {
    const defaultConfig = {
      root: Path.pwd(),
      assetsUrl: '/assets',
      buildDirectory: 'public/assets',
      logLevel: 'silent',
      css: {
        preprocessorOptions: {
          scss: {
            api: 'modern'
          }
        }
      },
      build: {
        assetsDir: '',
        manifest: true,
        emptyOutDir: true,
        outDir: 'public/assets',
        assetsInlineLimit: 0,
        rollupOptions: {
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]'
          }
        }
      }
    }

    const { config: fileConfig } = await vite.loadConfigFromFile(
      {
        command: 'build',
        mode: 'development'
      },
      undefined,
      Path.pwd()
    )

    const config = vite.mergeConfig(defaultConfig, fileConfig)
    await vite.build(config)

    return config
  }
}
