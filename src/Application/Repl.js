/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import figlet from 'figlet'
import chalkRainbow from 'chalk-rainbow'

import { start } from 'node:repl'
import { ColorHelper } from '@athenna/logger'
import { File, Module, Options, Path } from '@athenna/common'
import { LoggerHelper } from '#src/Helpers/LoggerHelper'
import { INTERNAL_REPL_PROPS } from '#src/Constants/InternalReplProps'

const ui = LoggerHelper.replUi
const log = LoggerHelper.replLog

export class Repl {
  /**
   * Simple vanilla logger.
   *
   * @type {import('@athenna/logger').VanillaLogger}
   */
  #logger

  /**
   * An instance of the Ioc class that is a Monostate with
   * the Awilix container inside.
   *
   * @type {import('@athenna/ioc').Ioc}
   */
  #container

  /**
   * Creates a new instance of Repl.
   *
   * @param logger {import('@athenna/logger').VanillaLogger}
   * @param container {import('@athenna/ioc').Ioc}
   */
  constructor(logger, container) {
    this.#logger = logger
    this.#container = container
  }

  /**
   * Boot the REPL server application.
   *
   * @param {{
   *   routePath?: string,
   * }} [options]
   * @return {Promise<import('node:repl').Http>}
   */
  async boot(options) {
    options = Options.create(options, {
      routePath: Path.routes(`repl.${Path.ext()}`),
    })

    const repl = start({ prompt: '' }).on('exit', () => process.exit())

    repl.write('delete process.domain._events.error\n')
    repl.write(null, { ctrl: true, name: 'l' })

    log.write(chalkRainbow(figlet.textSync('REPL\n')))
    log.gray('To import your modules use dynamic imports:\n')
    log.gray("const { User } = await import('#app/Models/User')\n")
    log.gray(
      'Use the "routes/repl" file to setup REPL global properties automatically\n',
    )

    log.write(
      `${ui.yellow.bold('To see all commands available type:')} .help\n`,
    )

    repl.setPrompt(ui.purple.bold('Athenna ') + ColorHelper.green.bold('❯ '))
    repl.displayPrompt(false)

    const routePath = Path.routes(`repl.${Path.ext()}`)

    if (await File.exists(routePath)) {
      const context = await Module.get(import(routePath))

      Object.keys(context).forEach(key => (repl.context[key] = context[key]))
    }

    this.#defineLsCommand(repl)
    this.#defineCleanCommand(repl)

    return repl
  }

  #defineLsCommand(repl) {
    repl.defineCommand('ls', {
      help: 'List all Athenna preloaded methods/properties in REPL context.',
      action() {
        this.clearBufferedCommand()

        log.write('')
        Object.keys(repl.context).forEach(key => {
          if (INTERNAL_REPL_PROPS.includes(key)) {
            return
          }

          log.yellow(key)
        })
        log.write('')

        this.displayPrompt()
      },
    })
  }

  #defineCleanCommand(repl) {
    repl.defineCommand('clean', {
      help: `Clean any property of REPL global context. Example: .clean ${ui.gray(
        '(propertyName)',
      )}`,
      action(property) {
        this.clearBufferedCommand()

        log.write('')

        if (!property) {
          log.red('You have not provided any property to remove.')
          log.write(`Try like this: .clean ${ui.gray('(propertyName)')}\n`)

          return this.displayPrompt()
        }

        if (!repl.context[property]) {
          log.red(
            `The property "${property}" doesnt exist inside REPL global context.`,
          )
          log.red(
            'Use the ".ls" command to check the properties available in REPL global context.',
          )

          return this.displayPrompt()
        }

        delete repl.context[property]

        log.green(
          `Property "${property}" successfully removed from REPL context.\n`,
        )

        this.displayPrompt()
      },
    })
  }
}
