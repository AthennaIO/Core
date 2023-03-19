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

import { ReplOptions } from '#src/Types/ReplOptions'
import { PrettyREPLServer, start } from 'pretty-repl'
import { Color, Exec, Options } from '@athenna/common'
import { INTERNAL_REPL_PROPS } from '#src/Constants/InternalReplProps'

export class Repl {
  /**
   * Boot the Repl application and session.
   */
  public static async boot(options?: ReplOptions): Promise<PrettyREPLServer> {
    options = Options.create(options, {
      context: {},
    })

    const repl = start({ prompt: '' }).on('exit', () => process.exit())

    if (!Env('CORE_TESTING', false)) {
      repl.write('delete process.domain._events.error\n')
      repl.write('', { ctrl: true, name: 'l' })
    }

    Repl.log.write(chalkRainbow(figlet.textSync('REPL\n')))
    Repl.log.gray('To import your modules use dynamic imports:\n')
    Repl.log.gray("const { User } = await import('#app/Models/User')\n")
    Repl.log.gray(
      'Use the "routes/repl" file to setup REPL global properties automatically\n',
    )

    Repl.log.write(
      `${Color.yellow.bold('To see all commands available type:')} .help\n`,
    )

    repl.setPrompt(Color.purple.bold('Athenna ') + Color.green.bold('❯ '))
    repl.displayPrompt(false)

    this.defineLsCommand(repl)
    this.defineClearCommand(repl)

    await Exec.concurrently(Object.keys(options.context), async key => {
      repl.context[key] = await options.context[key]
    })

    return repl
  }

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
        yellow: () => null,
      }
    }

    return {
      write: m => process.stdout.write(m + '\n'),
      red: m => process.stdout.write(Color.red(m + '\n')),
      gray: m => process.stdout.write(Color.gray(m + '\n')),
      green: m => process.stdout.write(Color.green(m + '\n')),
      purple: m => process.stdout.write(Color.purple(m + '\n')),
      yellow: m => process.stdout.write(Color.yellow(m + '\n')),
    }
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
            `${Color.green.bold('\nFROM NODE:')}\n\n${nodeInternals.join(
              '\n',
            )}`,
          )
        }

        if (athennaInternals.length) {
          Repl.log.write(
            `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${athennaInternals.join(
              '\n',
            )}`,
          )
        }

        Repl.log.write('')

        this.displayPrompt()
      },
    })
  }

  /**
   * Define the .clear command in the session.
   */
  private static defineClearCommand(repl: PrettyREPLServer) {
    repl.defineCommand('clean', {
      help: `Clean any property of REPL global context. Example: .clean ${Color.gray(
        '(propertyName)',
      )}`,
      action(property) {
        this.clearBufferedCommand()

        Repl.log.write('')

        if (!property) {
          Repl.log.red('You have not provided any property to remove.')
          Repl.log.write(
            `Try like this: .clean ${Color.gray('(propertyName)')}\n`,
          )

          return this.displayPrompt()
        }

        if (!repl.context[property]) {
          Repl.log.red(
            `The property "${property}" doesn't exist inside REPL global context.`,
          )
          Repl.log.red(
            'Use the ".ls" command to check the properties available in REPL global context.',
          )

          return this.displayPrompt()
        }

        delete repl.context[property]

        Repl.log.green(
          `Property "${property}" successfully removed from REPL global context.\n`,
        )

        this.displayPrompt()
      },
    })
  }
}
