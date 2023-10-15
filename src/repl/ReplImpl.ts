/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Module, Options, String } from '@athenna/common'
import type { Command } from '#src/repl/helpers/Command'
import type { REPLServer, ReplOptions } from 'node:repl'
import { CommandBuilder } from '#src/repl/helpers/CommandBuilder'

type REPLWriteKey = {
  sequence?: string | undefined
  name?: string | undefined
  ctrl?: boolean | undefined
  meta?: boolean | undefined
  shift?: boolean | undefined
}

export class ReplImpl {
  /**
   * Holds the repl session.
   */
  public session: REPLServer

  /**
   * Start the repl session.
   */
  public async start(options?: ReplOptions): Promise<REPLServer> {
    options = Options.create(options, {
      prompt: ''
    })

    const { start } = await this.importRepl()

    this.session = start(options)

    return this.session
  }

  /**
   * Define a command in the repl session.
   */
  public command(signature: string): CommandBuilder {
    return new CommandBuilder(signature, this.session)
  }

  /**
   * Define a command using the implementation class.
   */
  public commandImpl(command: typeof Command): ReplImpl {
    this.command(command.signature())
      .help(command.help())
      .action(command.action)
      .register()

    return this
  }

  /**
   * Display the repl prompt.
   */
  public displayPrompt(preserveCursor?: boolean): ReplImpl {
    this.session.displayPrompt(preserveCursor)

    return this
  }

  /**
   * Set a different prompt to the repl session.
   */
  public setPrompt(prompt: string): ReplImpl {
    this.session.setPrompt(prompt)

    return this
  }

  /**
   * Write some message in the repl session.
   */
  public write(message: string | Buffer, key?: REPLWriteKey): ReplImpl {
    this.session.write(message, key)

    return this
  }

  /**
   * Clean the repl session content by simulating
   * pressing CTRL + L.
   */
  public clean(): ReplImpl {
    return this.write('', { ctrl: true, name: 'l' })
  }

  /**
   * Remove the domain error handler from the repl session.
   */
  public removeDomainErrorHandler(): ReplImpl {
    this.write('delete process?.domain?._events?.error\n')

    return this
  }

  /**
   * Set a key value in the repl context.
   */
  public setInContext(key: string, value: any): ReplImpl {
    this.session.context[key] = value

    return this
  }

  /**
   * Import a module in the repl session.
   */
  public import(key: string, path: string): ReplImpl {
    return this.write(`const ${key} = await import('${path}')`)
  }

  /**
   * Import a module and register all it properties
   * in the repl context.
   */
  public async importInContext(path: string) {
    let module = await Module.resolve(path, Config.get('rc.parentURL'), {
      import: true,
      getModule: false
    })

    if (module.default && Object.keys(module).length === 1) {
      module = module.default
    }

    if (Is.String(module) || !Object.keys(module).length) {
      let key = module.name

      if (!key || key === 'default') {
        key = String.toCamelCase(path.split('/').pop())
      }

      this.setInContext(key, module)

      return
    }

    Object.keys(module).forEach(key => this.setInContext(key, module[key]))
  }

  /**
   * Import the repl module.
   */
  private async importRepl(): Promise<any> {
    return await import('pretty-repl')
  }
}
