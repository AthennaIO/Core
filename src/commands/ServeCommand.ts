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
import { Path, Module } from '@athenna/common'
import { BaseCommand, Option } from '@athenna/artisan'

export class ServeCommand extends BaseCommand {
  @Option({
    signature: '-w, --watch',
    description:
      'Use nodemon to watch the application and restart on changes (also turn on vite --watch if using it).',
    default: false
  })
  public watch: boolean

  @Option({
    signature: '-v, --vite',
    description: 'Use vite to build your application static files.',
    default: false
  })
  public vite: boolean

  public static signature(): string {
    return 'serve'
  }

  public static description(): string {
    return 'Serve your application.'
  }

  public async handle(): Promise<void> {
    const entrypoint = Config.get(
      'rc.commands.serve.entrypoint',
      Path.bin(`main.${Path.ext()}`)
    )

    if (this.vite) {
      const vite = this.getVite()
      const PluginRestart = this.getVitePluginRestart()

      const defaultConfig = {
        root: Path.pwd(),
        assetsUrl: '/assets',
        buildDirectory: 'public/assets',
        logLevel: Config.get('rc.bootLogs', true) ? 'info' : 'silent',
        build: {
          watch: this.watch
            ? {
                clearScreen: true,
                include: 'src/resources/views/**/*.edge',
                exclude: 'node_modules/**'
              }
            : undefined,
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
            },
            input: ['src/resources/css/app.scss', 'src/resources/js/app.js']
          }
        },
        plugins: [PluginRestart({ reload: ['src/resources/views/**/*.edge'] })]
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

      vite.build(config)
    }

    if (this.watch) {
      const nodemon = this.getNodemon()

      nodemon({
        script: entrypoint.replace('.ts', '.js'),
        ignore: [
          '.git',
          '.github',
          '.idea',
          '.vscode',
          '.fleet',
          'node_modules/**/node_modules'
        ],
        watch: [
          './',
          'package.json',
          '.athennarc.json',
          'tsconfig.json',
          '.env',
          '.env.dev',
          '.env.test',
          '.env.testing',
          '.env.example'
        ],
        ext: '*.*',
        ...Config.get('rc.commands.serve.nodemon', {})
      })

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

  public getVite() {
    const require = Module.createRequire(import.meta.url)

    return require('vite')
  }

  public getVitePluginRestart() {
    const require = Module.createRequire(import.meta.url)

    return require('vite-plugin-restart')
  }

  public getNodemon() {
    const require = Module.createRequire(import.meta.url)

    return require('nodemon')
  }
}
