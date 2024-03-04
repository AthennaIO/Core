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

import { Rc } from '@athenna/config'
import { Repl } from '#src/facades/Repl'
import { Ls } from '#src/repl/commands/Ls'
import { Path, Color } from '@athenna/common'
import { Clean } from '#src/repl/commands/Clean'
import { CommanderHandler } from '@athenna/artisan'
import { Repl as ReplApp } from '#src/applications/Repl'
import { ReplProvider } from '#src/providers/ReplProvider'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class ReplTest {
  @BeforeEach()
  public async beforeEach() {
    new ReplProvider().register()
    await Config.loadAll(Path.fixtures('config'))
    await Rc.setFile(Path.fixtures('rcs/.athennarc.json'))
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    Mock.restoreAll()
    CommanderHandler.reconstruct()
  }

  @Test()
  public async shouldBeAbleToBootAReplApplication({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Repl.when('start').resolve(undefined)
    Repl.when('write').returnThis()
    Repl.when('setPrompt').returnThis()
    Repl.when('displayPrompt').returnThis()
    Repl.when('commandImpl').returnThis()

    await ReplApp.boot()

    assert.calledOnceWith(Repl.setPrompt, Color.purple.bold('Athenna ') + Color.green.bold('❯ '))
  }

  @Test()
  public async shouldBeAbleToBootAReplApplicationAndSeeTheReplStartupLogs({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Repl.when('start').resolve(undefined)
    Repl.when('write').returnThis()
    Repl.when('setPrompt').returnThis()
    Repl.when('displayPrompt').returnThis()
    Repl.when('commandImpl').returnThis()
    Repl.when('shutdownProviders').returnThis()

    await ReplApp.boot()

    assert.calledWith(process.stdout.write, chalkRainbow(figlet.textSync('REPL\n')) + '\n')
    assert.calledWith(process.stdout.write, Color.gray('To import your modules use dynamic imports:\n') + '\n')
    assert.calledWith(process.stdout.write, Color.gray("const { User } = await import('#app/models/User')\n") + '\n')
    assert.calledWith(process.stdout.write, Color.yellow.bold('To see all commands available type:') + ' .help\n\n')
  }

  @Test()
  public async shouldBeAbleToBootAReplApplicationAndDeleteTheDomainErrorHandler({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Repl.when('start').resolve(undefined)
    Repl.when('write').returnThis()
    Repl.when('setPrompt').returnThis()
    Repl.when('displayPrompt').returnThis()
    Repl.when('commandImpl').returnThis()
    Repl.when('shutdownProviders').returnThis()

    await ReplApp.boot()

    assert.calledWith(Repl.write, 'delete process?.domain?._events?.error\n')
    assert.calledWith(Repl.write, '', { ctrl: true, name: 'l' })
  }

  @Test()
  public async shouldBeAbleToBootAReplApplicationAndRegisterTheLsCommand({ assert }: Context) {
    Mock.when(process.stdout, 'write').return(undefined)
    Repl.when('start').resolve(undefined)
    Repl.when('write').returnThis()
    Repl.when('setPrompt').returnThis()
    Repl.when('displayPrompt').returnThis()
    Repl.when('commandImpl').returnThis()
    Repl.when('shutdownProviders').returnThis()

    await ReplApp.boot()

    assert.calledWith(Repl.commandImpl, Ls)
    assert.calledWith(Repl.commandImpl, Clean)
  }
}
