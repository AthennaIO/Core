/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/* eslint-disable no-ex-assign */

import { Path, File, Exec, Folder, Is } from '@athenna/common'

/*
|--------------------------------------------------------------------------
| The tsconfig.build.json path and the compile command.
|--------------------------------------------------------------------------
|
| The path where tsconfig.build.json will be created and the compilation
| command that will be used to compile the files.
*/

const path = Path.nodeModules('@athenna/tsconfig.build.json')
const compileCommand = `node_modules/.bin/tsc --project ${path}`

/*
|--------------------------------------------------------------------------
| Before all hook.
|--------------------------------------------------------------------------
|
| This function will be executed before the compilation starts. Briefly,
| this function will create a tsconfig.build.json file with the correct
| configurations to compile the files such as rootDir, outDir, etc and
| also delete the old build folder if it exists.
*/

async function beforeAll() {
  const tsconfig = await new File('../tsconfig.json').getContentAsBuilder()

  tsconfig.delete('ts-node')
  tsconfig.set('include', ['../../src'])
  tsconfig.set('compilerOptions.rootDir', '../../src')
  tsconfig.set('compilerOptions.outDir', '../../build')
  tsconfig.set('exclude', ['../../bin', '../../node_modules', '../../tests'])

  const oldBuild = new Folder(Path.pwd('/build'))
  await new File(path, JSON.stringify(tsconfig.get())).load()

  if (oldBuild.folderExists) await oldBuild.remove()
}

/*
|--------------------------------------------------------------------------
| After all hook.
|--------------------------------------------------------------------------
|
| This function will be executed after some error occurs or after the compi
| lation finishes. This function just delete the tsconfig.build.json file if
| it exists.
*/

async function afterAll() {
  const tsConfigBuild = await new File(path).load()

  if (tsConfigBuild.fileExists) await tsConfigBuild.remove()
}

try {
  await beforeAll()

  const { stdout } = await Exec.command(compileCommand)

  if (stdout) console.log(stdout)
} catch (error) {
  if (!Is.Exception(error)) error = error.toAthennaException()

  console.error(await error.prettify())
} finally {
  await afterAll()
}
