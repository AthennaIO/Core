/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger } from '#src/repl/ui/Logger'
import { Color } from '@athenna/common'
import { Test, type Context, Mock, AfterEach, BeforeEach } from '@athenna/test'

export default class LoggerTest {
  @BeforeEach()
  public async beforeEach() {
    Mock.when(process.stdout, 'write').return(undefined)
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToWriteVanillaLogs({ assert }: Context) {
    Logger.write('Hello World')

    assert.calledWith(process.stdout.write, 'Hello World\n')
  }

  @Test()
  public async shouldBeAbleToWriteRedLogs({ assert }: Context) {
    Logger.red('Hello World')

    assert.calledWith(process.stdout.write, Color.red('Hello World') + '\n')
  }

  @Test()
  public async shouldBeAbleToWriteGrayLogs({ assert }: Context) {
    Logger.gray('Hello World')

    assert.calledWith(process.stdout.write, Color.gray('Hello World') + '\n')
  }

  @Test()
  public async shouldBeAbleToWriteGreenLogs({ assert }: Context) {
    Logger.green('Hello World')

    assert.calledWith(process.stdout.write, Color.green('Hello World') + '\n')
  }

  @Test()
  public async shouldBeAbleToWritePurpleLogs({ assert }: Context) {
    Logger.purple('Hello World')

    assert.calledWith(process.stdout.write, Color.purple('Hello World') + '\n')
  }

  @Test()
  public async shouldBeAbleToWriteYellowLogs({ assert }: Context) {
    Logger.yellow('Hello World')

    assert.calledWith(process.stdout.write, Color.yellow('Hello World') + '\n')
  }
}
