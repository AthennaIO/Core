/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { Path, File, Folder } from '@athenna/common'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class BuildCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToBuildTheApplicationCode({ assert, command }: Context) {
    const output = await command.run('build')

    console.log(output.output.stdout)
    console.log(output.output.stderr)
    output.assertSucceeded()
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
  }

  @Test()
  public async shouldBeAbleToRunBuildCommandWithARelativePathToATsConfig({ assert, command }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/relative-path-tsconfig.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build-relative')))
    assert.isTrue(File.existsSync(Path.pwd('build-relative/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build-relative/app/hello.d.ts')))
  }

  @Test()
  public async shouldBeAbleToRunBuildCommandWithVite({ command }: Context) {
    const output = await command.run('build --vite', {
      path: Path.fixtures('consoles/build-vite.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Application successfully compiled')
  }

  @Test()
  public async shouldDeleteTheOldOutDirBeforeCompilingTheApplicationAgain({ assert, command }: Context) {
    await command.run('build')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))

    const output = await command.run('build')

    output.assertSucceeded()
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
  }

  @Test()
  public async shouldBeAbleToIncludeFilesInsideTheBuildFolderUsingIncludeSetting({ assert, command }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/include-files.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Copying included paths to build folder: README.md, LICENSE.md')
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/LICENSE.md')))
    assert.isTrue(File.existsSync(Path.pwd('build/README.md')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
  }

  @Test()
  public async shouldBeAbleToIncludeFoldersInsideTheBuildFolderUsingIncludeSetting({ assert, command }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/include-folders.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Copying included paths to build folder: src/*, templates/*')
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/src/index.ts')))
    assert.isTrue(File.existsSync(Path.pwd('build/templates/exception.edge')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
  }

  @Test()
  public async shouldBeAbleToIncludeFilesUsingGlobPatternsInsideTheBuildFolderUsingIncludeSetting({
    assert,
    command
  }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/include-files-glob.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Copying included paths to build folder: src/**/*Command.ts')
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
    assert.isTrue(File.existsSync(Path.pwd('build/src/commands/BuildCommand.ts')))
    assert.isTrue(File.existsSync(Path.pwd('build/src/commands/MakeServiceCommand.ts')))
  }

  @Test()
  public async shouldBeAbleToIncludeFoldersUsingGlobPatternsInsideTheBuildFolderUsingIncludeSetting({
    assert,
    command
  }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/include-folders-glob.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Copying included paths to build folder: templates/**/*.edge')
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/templates/exception.edge')))
    assert.isTrue(File.existsSync(Path.pwd('build/templates/provider.edge')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
  }

  @Test()
  public async shouldBeAbleToResolveTheOutDirFromTheOutDirSetting({ assert, command }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/resolve-outdir-setting.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build-relative')))
    assert.isTrue(File.existsSync(Path.pwd('build-relative/app/hello.js')))
    assert.isTrue(File.existsSync(Path.pwd('build-relative/app/hello.d.ts')))
  }

  @Test()
  public async shouldThrowUndefinedOutDirExceptionIfOutDirSettingIsNotSet({ command }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/outdir-not-set.ts')
    })

    output.assertFailed()
    output.assertLogged(
      'The commands.build.outDir setting is not defined in your .athennarc.json file. Please define it to continue.'
    )
  }

  @Test()
  public async shouldNotCopyDotEnvFileEvenIfItsPresentInIncludeArray({ assert, command }: Context) {
    const output = await command.run('build', {
      path: Path.fixtures('consoles/dont-copy-dot-env.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Application successfully compiled')

    assert.isTrue(Folder.existsSync(Path.pwd('build')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.js')))
    assert.isFalse(File.existsSync(Path.pwd('build/.env')))
    assert.isTrue(File.existsSync(Path.pwd('build/app/hello.d.ts')))
  }
}
