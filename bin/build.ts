/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, File, Exec } from '@athenna/common'

/*
|--------------------------------------------------------------------------
| TypeScript build file path
|--------------------------------------------------------------------------
|
| Where the TypeScript build file will be saved.
*/

const path = Path.nodeModules('@athenna/tsconfig.build.json')

/*
|--------------------------------------------------------------------------
| TypeScript Config
|--------------------------------------------------------------------------
|
| Create the tsconfig file for building the project.
*/

const tsconfig = JSON.parse(
  new File('../tsconfig.json').getContentSync().toString(),
)

delete tsconfig['ts-node']

tsconfig.compilerOptions.rootDir = '../../src'
tsconfig.compilerOptions.outDir = '../../build'

tsconfig.include = ['../../src']
tsconfig.exclude = ['../../bin', '../../node_modules', '../../tests']

const tsconfigBuild = JSON.stringify(tsconfig)

/*
|--------------------------------------------------------------------------
| Compilation
|--------------------------------------------------------------------------
|
| Saving the file in some path, deleting old "build" folder, executing
| compilation and deleting the tsconfig file generated.
*/

const file = new File(path, Buffer.from(tsconfigBuild))

if (file.fileExists) {
  await file.remove()
}

await file.load()
await Exec.command(`rimraf ../build && tsc --project ${path}`)
await file.remove()
