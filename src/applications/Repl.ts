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

import { Color } from '@athenna/common'
import { type PrettyREPLServer, start } from 'pretty-repl'
import { INTERNAL_REPL_PROPS } from '#src/constants/InternalReplProps'

export class Repl {
  /**
   * The logger used to display logs before REPL session starts.
   */
  private static get log() {
    if (Env('CORE_TESTING', false)) {
      return {
        write: () => null,
        red: () => null,
        gray: () => null,
        green: () => null,
        purple: () => null,
        yellow: () => null
      }
    }

    return {
      write: m => process.stdout.write(m + '\n'),
      red: m => process.stdout.write(Color.red(m + '\n')),
      gray: m => process.stdout.write(Color.gray(m + '\n')),
      green: m => process.stdout.write(Color.green(m + '\n')),
      purple: m => process.stdout.write(Color.purple(m + '\n')),
      yellow: m => process.stdout.write(Color.yellow(m + '\n'))
    }
  }

  /**
   * Boot the Repl application and session.
   */
  public static async boot(): Promise<PrettyREPLServer> {
    const repl = start({ prompt: '' }).on('exit', Repl.handleExit)

    if (!Env('CORE_TESTING', false)) {
      repl.write('delete process.domain._events.error\n')
      repl.write('', { ctrl: true, name: 'l' })
    }

    Repl.log.write(chalkRainbow(figlet.textSync('REPL\n')))
    Repl.log.gray('To import your modules use dynamic imports:\n')
    Repl.log.gray("const { User } = await import('#app/Models/User')\n")

    Repl.log.write(
      `${Color.yellow.bold('To see all commands available type:')} .help\n`
    )

    repl.setPrompt(Repl.getPrompt())
    repl.displayPrompt(false)

    Repl.defineLsCommand(repl)
    Repl.defineCleanCommand(repl)

    return repl
  }

  /**
   * Handle the exit event of REPL session.
   */
  private static handleExit() {
    if (Env('CORE_TESTING', false)) {
      return
    }

    process.exit()
  }

  /**
   * Get the REPL prompt.
   */
  private static getPrompt() {
    if (Env('CORE_TESTING', false)) {
      return ''
    }

    return Color.purple.bold('Athenna ') + Color.green.bold('❯ ')
  }

  /**
   * Define the .ls command in the session.
   */
  private static defineLsCommand(repl: PrettyREPLServer) {
    repl.defineCommand('ls', {
      help: 'List all Athenna preloaded methods/properties in REPL context and some of the Node.js globals.',
      action() {
        this.clearBufferedCommand()

        const nodeInternals = []
        const athennaInternals = []

        Object.keys(repl.context).forEach(key => {
          if (INTERNAL_REPL_PROPS.includes(key)) {
            if (key.startsWith('__')) {
              return
            }

            nodeInternals.push(Color.yellow(` - ${key}`))
            return
          }

          athennaInternals.push(Color.yellow(` - ${key}`))
        })

        if (nodeInternals.length) {
          Repl.log.write(
            `${Color.green.bold('\nFROM NODE:')}\n\n${nodeInternals.join('\n')}`
          )
        }

        if (athennaInternals.length) {
          Repl.log.write(
            `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${athennaInternals.join(
              '\n'
            )}`
          )
        }

        Repl.log.write('')

        this.displayPrompt()
      }
    })
  }

  /**
   * Define the .clean command in the session.
   */
  private static defineCleanCommand(repl: PrettyREPLServer) {
    repl.defineCommand('clean', {
      help: `Clean any property of REPL global context. Example: .clean ${Color.gray(
        '(propertyName)'
      )}`,
      action(property) {
        this.clearBufferedCommand()

        Repl.log.write('')

        if (!property) {
          Repl.log.red('You have not provided any property to remove.')
          Repl.log.write(
            `Try like this: .clean ${Color.gray('(propertyName)')}\n`
          )

          return this.displayPrompt()
        }

        if (!repl.context[property]) {
          Repl.log.red(
            `The property "${property}" doesn't exist inside REPL global context.`
          )
          Repl.log.red(
            'Use the ".ls" command to check the properties available in REPL global context.'
          )

          return this.displayPrompt()
        }

        delete repl.context[property]

        Repl.log.green(
          `Property "${property}" successfully removed from REPL global context.\n`
        )

        this.displayPrompt()
      }
    })
  }
}
