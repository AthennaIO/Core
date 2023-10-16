/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { ReplImpl } from '#src'
import { Ls } from '#src/repl/commands/Ls'
import { Test, type Context, Mock, Cleanup, AfterEach } from '@athenna/test'

export default class ReplImplTest {
  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToStartAReplSession({ assert }: Context) {
    const repl = new ReplImpl()
    const startMock = Mock.fake()

    Mock.when(repl as any, 'importRepl').resolve({
      start: startMock
    })

    await repl.start()

    assert.calledWith(startMock, { prompt: '' })
  }

  @Test()
  public async shouldBeAbleToDefineAReplCommand({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      defineCommand: Mock.fake()
    } as any

    repl
      .command('test')
      .help('The command help description')
      .action(function action() {})
      .register()

    assert.calledWithMatch(repl.session.defineCommand, 'test', {
      help: 'The command help description'
    })
  }

  @Test()
  public async shouldBeAbleToDefineAReplCommandImpl({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      defineCommand: Mock.fake()
    } as any

    repl.commandImpl(Ls)

    assert.calledWithMatch(repl.session.defineCommand, 'ls', {
      help: 'List all Athenna preloaded methods/properties in REPL context and some of the Node.js globals.'
    })
  }

  @Test()
  public async shouldBeAbleToSetTheDisplayPromptOption({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      displayPrompt: Mock.fake()
    } as any

    repl.displayPrompt(true)
    repl.displayPrompt(false)

    assert.calledWithMatch(repl.session.displayPrompt, true)
    assert.calledWithMatch(repl.session.displayPrompt, false)
  }

  @Test()
  public async shouldBeAbleToSetTheReplPrompt({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      setPrompt: Mock.fake()
    } as any

    repl.setPrompt('> ')

    assert.calledWithMatch(repl.session.setPrompt, '> ')
  }

  @Test()
  public async shouldBeAbleToWriteSomeOperationInTheReplSession({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      write: Mock.fake()
    } as any

    repl.write('console.log(1)')

    assert.calledWithMatch(repl.session.write, 'console.log(1)')
  }

  @Test()
  public async shouldBeAbleToCleanTheReplSessionUsingCrtlLCommand({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      write: Mock.fake()
    } as any

    repl.clean()

    assert.calledWithMatch(repl.session.write, '', { ctrl: true, name: 'l' })
  }

  @Test()
  public async shouldBeAbleToRemoveTheDomainErrorHandlerOfTheReplSession({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      write: Mock.fake()
    } as any

    repl.removeDomainErrorHandler()

    assert.calledWithMatch(repl.session.write, 'delete process?.domain?._events?.error\n')
  }

  @Test()
  public async shouldBeAbleToSetValuesInReplSessionContext({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    repl.setInContext('test', 1)

    assert.equal(repl.session.context.test, 1)
  }

  @Test()
  public async shouldBeAbleToWriteAnImportOperationInTheReplSession({ assert }: Context) {
    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.import('common', '@athenna/common')

    const common = await import('@athenna/common')

    assert.deepEqual(repl.session.context.common.Clean, common.Clean)
  }

  @Test()
  @Cleanup(() => Config.clear())
  public async shouldBeAbleToImportAnEntireModuleInTheReplSession({ assert }: Context) {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.importAll('@athenna/common')

    const common = await import('@athenna/common')

    assert.deepEqual(repl.session.context.Clean, common.Clean)
    assert.deepEqual(repl.session.context.Collection, common.Collection)
  }

  @Test()
  @Cleanup(() => Config.clear())
  public async shouldBeAbleToImportAClassInTheReplSession({ assert }: Context) {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.importAll('#tests/fixtures/modules/default-class')

    const module = await import('#tests/fixtures/modules/default-class')

    assert.deepEqual(repl.session.context.ModuleOne, module.default)
  }

  @Test()
  @Cleanup(() => Config.clear())
  public async shouldBeAbleToImportAFunctionInTheReplSession({ assert }: Context) {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.importAll('#tests/fixtures/modules/default-fn')

    const module = await import('#tests/fixtures/modules/default-fn')

    assert.deepEqual(repl.session.context.moduleOne, module.default)
  }

  @Test()
  @Cleanup(() => Config.clear())
  public async shouldBeAbleToImportAnArrowFunctionInTheReplSession({ assert }: Context) {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.importAll('#tests/fixtures/modules/default-arrow-fn')

    const module = await import('#tests/fixtures/modules/default-arrow-fn')

    assert.deepEqual(repl.session.context.defaultArrowFn, module.default)
  }

  @Test()
  @Cleanup(() => Config.clear())
  public async shouldBeAbleToImportAConstantInTheReplSession({ assert }: Context) {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.importAll('#tests/fixtures/modules/default-const')

    const module = await import('#tests/fixtures/modules/default-const')

    assert.deepEqual(repl.session.context.defaultConst, module.default)
  }

  @Test()
  @Cleanup(() => Config.clear())
  public async shouldBeAbleToImportADefaultObjectInTheReplSession({ assert }: Context) {
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + sep))

    const repl = new ReplImpl()

    repl.session = {
      context: {}
    } as any

    await repl.importAll('#tests/fixtures/modules/default-object')

    const module = await import('#tests/fixtures/modules/default-object')

    assert.deepEqual(repl.session.context.ModuleOne, module.default.ModuleOne)
    assert.deepEqual(repl.session.context.ModuleTwo, module.default.ModuleTwo)
  }
}
