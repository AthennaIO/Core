/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Color } from '@athenna/common'
import { Ls } from '#src/repl/commands/Ls'
import { Test, type Context, Mock, AfterEach } from '@athenna/test'

export default class LsTest {
  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToListTheReplContext({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Ls.action.bind({
      context: {
        ...this.nodeContext,
        ...this.athennaContext
      },
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })()

    assert.calledWith(process.stdout.write, `${Color.green.bold('\nFROM NODE:')}\n\n${this.nodeInternals.join('\n')}\n`)
    assert.calledWith(
      process.stdout.write,
      `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${this.athennaInternals.join('\n')}\n`
    )
  }

  @Test()
  public async shouldBeAbleToHideFromListVariablesThatStartWith__({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Ls.action.bind({
      context: {
        __hello: 'world', // Will not be listed
        ...this.nodeContext,
        ...this.athennaContext
      },
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })()

    assert.calledWith(process.stdout.write, `${Color.green.bold('\nFROM NODE:')}\n\n${this.nodeInternals.join('\n')}\n`)
    assert.calledWith(
      process.stdout.write,
      `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${this.athennaInternals.join('\n')}\n`
    )
  }

  @Test()
  public async shouldNotShowNodeInternalsIfTheyAreNotInReplContext({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Ls.action.bind({
      context: {
        ...this.athennaContext
      },
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })()

    assert.notCalledWith(
      process.stdout.write,
      `${Color.green.bold('\nFROM NODE:')}\n\n${this.nodeInternals.join('\n')}\n`
    )
    assert.calledWith(
      process.stdout.write,
      `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${this.athennaInternals.join('\n')}\n`
    )
  }

  @Test()
  public async shouldNotShowAthennaInternalsIfTheyAreNotInReplContext({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Ls.action.bind({
      context: {
        ...this.nodeContext
      },
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })()

    assert.calledWith(process.stdout.write, `${Color.green.bold('\nFROM NODE:')}\n\n${this.nodeInternals.join('\n')}\n`)
    assert.notCalledWith(
      process.stdout.write,
      `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${this.athennaInternals.join('\n')}\n`
    )
  }

  @Test()
  public async shouldReturnTheCommandSignature({ assert }: Context) {
    assert.deepEqual(Ls.signature(), 'ls')
  }

  @Test()
  public async shouldReturnTheCommandHelp({ assert }: Context) {
    assert.deepEqual(
      Ls.help(),
      'List all Athenna preloaded methods/properties in REPL context and some of the Node.js globals.'
    )
  }

  private nodeInternals = [
    Color.yellow(' - global'),
    Color.yellow(' - queueMicrotask'),
    Color.yellow(' - clearImmediate'),
    Color.yellow(' - setImmediate'),
    Color.yellow(' - structuredClone'),
    Color.yellow(' - clearInterval'),
    Color.yellow(' - clearTimeout'),
    Color.yellow(' - setInterval'),
    Color.yellow(' - setTimeout'),
    Color.yellow(' - atob'),
    Color.yellow(' - btoa'),
    Color.yellow(' - performance'),
    Color.yellow(' - fetch')
  ]

  private athennaInternals = [
    Color.yellow(' - Path'),
    Color.yellow(' - ioc'),
    Color.yellow(' - container'),
    Color.yellow(' - Env'),
    Color.yellow(' - Config')
  ]

  private nodeContext = {
    global: '',
    queueMicrotask: '',
    clearImmediate: '',
    setImmediate: '',
    structuredClone: '',
    clearInterval: '',
    clearTimeout: '',
    setInterval: '',
    setTimeout: '',
    atob: '',
    btoa: '',
    performance: '',
    fetch: ''
  }

  private athennaContext = {
    Path: '',
    ioc: '',
    container: '',
    Env: '',
    Config: ''
  }
}
