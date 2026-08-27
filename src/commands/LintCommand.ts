/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Argument, BaseCommand, Option } from '@athenna/artisan'
import { NotInstalledEslintException } from '#src/exceptions/NotInstalledEslintException'

export class LintCommand extends BaseCommand {
  @Argument({
    signature: '[paths...]',
    description:
      'The paths to lint. When empty, ESLint lints whatever its own configuration covers.',
    default: []
  })
  public paths: string[]

  @Option({
    signature: '--fix',
    description: 'Automatically fix the problems that can be fixed.',
    default: false
  })
  public fix: boolean

  @Option({
    signature: '--quiet',
    description: 'Report errors only, omitting warnings from the output.',
    default: false
  })
  public quiet: boolean

  @Option({
    signature: '--format <formatter>',
    description: 'The ESLint formatter used to render the results.',
    default: 'stylish'
  })
  public format: string

  public static signature(): string {
    return 'lint'
  }

  public static description(): string {
    return 'Lint your application code using ESLint.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ LINTING APPLICATION ])\n')

    const ESLint = await this.getESLint()
    const eslint = new ESLint({ cwd: Path.pwd(), fix: this.fix })

    /**
     * What gets linted and what gets ignored is defined by the ESLint
     * configuration of the application, never here. Linting "." is what
     * lets ESLint apply that configuration to the whole project, and it
     * is the only default that behaves the same in both config modes:
     * an empty list silently lints nothing in eslintrc mode.
     */
    const results = await eslint.lintFiles(
      this.paths.length ? this.paths : ['.']
    )

    if (this.fix) {
      await ESLint.outputFixes(results)
    }

    const reported = this.quiet ? ESLint.getErrorResults(results) : results
    const formatter = await eslint.loadFormatter(this.format)
    const output = await formatter.format(reported)

    if (output) {
      console.log(output)
    }

    const errors = this.countOf(reported, 'errorCount')
    const warnings = this.countOf(reported, 'warningCount')

    if (!errors && !warnings) {
      const fixed = results.filter(result => result.output).length

      this.logger.success(
        fixed
          ? `Fixed all lint problems in ${fixed} file${fixed > 1 ? 's' : ''}`
          : 'No lint problems found'
      )

      return
    }

    /**
     * ESLint only fails on errors and so does this command. Scripts chaining
     * "node artisan lint && ..." depend on warnings not breaking the build.
     */
    if (errors) {
      process.exitCode = 1
    }
  }

  /**
   * Resolve the ESLint class that matches the configuration style of the
   * application, so the command works the same with "eslint.config.js" and
   * with the legacy "eslintrc" format.
   */
  public async getESLint() {
    /**
     * ESLint 8 ships no type definitions while ESLint 9 does, so the
     * specifier is kept out of the type checker. It is also never a
     * dependency of this package: it is resolved from the application,
     * the same way "vite" is resolved by the build command.
     */
    const specifier = 'eslint'

    /**
     * Resolution is verified up front because the loader used to run the
     * application in TypeScript rethrows the failure of a dynamic import
     * without its "ERR_MODULE_NOT_FOUND" code, leaving nothing reliable to
     * branch on from inside a catch.
     */
    try {
      import.meta.resolve(specifier)
    } catch {
      throw new NotInstalledEslintException()
    }

    const { loadESLint } = await import(specifier)

    return await loadESLint()
  }

  private countOf(results: any[], key: string): number {
    return results.reduce((total, result) => total + result[key], 0)
  }
}
