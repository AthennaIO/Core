/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@secjs/utils'
import { Command, Commander } from '@athenna/artisan'

export class Build extends Command {
  /**
   * The name and signature of the console command.
   */
  protected signature = 'build'

  /**
   * The console command description.
   */
  protected description = 'Compile project from Typescript to Javascript.'

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @return {void}
   */
  public addFlags(commander: Commander): Commander {
    return commander
  }

  /**
   * Execute the console command.
   *
   * @return {Promise<void>}
   */
  async handle(_: any, commander: any): Promise<void> {
    this.simpleLog('[ BUILDING PROJECT ]', 'rmNewLineStart', 'bold', 'green')

    try {
      const rimrafPath = Path.noBuild().pwd('node_modules/.bin/rimraf')
      let tscPath = Path.noBuild().pwd('node_modules/.bin/tsc')

      const tscArgs = commander.args.join(' ')

      if (tscArgs) {
        tscPath = tscPath.concat(` ${tscArgs}`)
      }

      await this.execCommand(`${rimrafPath} dist`)
      await this.execCommand(tscPath)

      this.success('Built successfully.')
    } catch (error) {
      this.error('Failed to build project.')
    }
  }
}
