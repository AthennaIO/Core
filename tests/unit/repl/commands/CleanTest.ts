/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Color } from '@athenna/common'
import { Clean } from '#src/repl/commands/Clean'
import { Test, type Context, Mock, AfterEach } from '@athenna/test'

export default class CleanTest {
  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToCleanTheReplContext({ assert }: Context) {
    const context = {
      hello: 'world'
    }

    Mock.when(process.stdout, 'write').return(undefined)
    Clean.action.bind({
      context,
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })('hello')

    assert.isUndefined(context.hello)
  }

  @Test()
  public async shouldLogThatThePropertyToRemoveCannotBeEmpty({ assert }: Context) {
    const context = {
      hello: 'world'
    }

    Mock.when(process.stdout, 'write').return(undefined)
    Clean.action.bind({
      context,
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })()

    assert.calledWith(process.stdout.write, Color.red('You have not provided any property to remove.\n') + '\n')
    assert.calledWith(process.stdout.write, `Try like this: .clean ${Color.gray('(propertyName)')}\n\n`)
  }

  @Test()
  public async shouldLogThatThePropertyToRemoveDoesNotExistInReplContext({ assert }: Context) {
    const context = {
      hello: 'world'
    }

    Mock.when(process.stdout, 'write').return(undefined)
    Clean.action.bind({
      context,
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })('not-found')

    assert.calledWith(
      process.stdout.write,
      Color.red(`The property "not-found" doesn't exist inside REPL context.\n`) + '\n'
    )
    assert.calledWith(
      process.stdout.write,
      `Use the ${Color.gray('.ls')} command to check the properties available\n\n`
    )
  }

  @Test()
  public async shouldLogThatThePropertyWasSuccessfullyRemoved({ assert }: Context) {
    const context = {
      hello: 'world'
    }

    Mock.when(process.stdout, 'write').return(undefined)
    Clean.action.bind({
      context,
      displayPrompt: Mock.fake(),
      clearBufferedCommand: Mock.fake()
    })('hello')

    assert.isUndefined(context.hello)
    assert.calledWith(
      process.stdout.write,
      Color.green(`Property "hello" successfully removed from REPL context.\n`) + '\n'
    )
  }

  @Test()
  public async shouldReturnTheCommandSignature({ assert }: Context) {
    assert.deepEqual(Clean.signature(), 'clean')
  }

  @Test()
  public async shouldReturnTheCommandHelp({ assert }: Context) {
    assert.deepEqual(
      Clean.help(),
      `Clean any property of REPL global context. Example: .clean ${Color.gray('(propertyName)')}`
    )
  }
}
