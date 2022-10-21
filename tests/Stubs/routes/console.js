import { File, Path } from '@athenna/common'
import { Artisan } from '@athenna/artisan'

Artisan.command('make:hello <name>', async function (name) {
  await new File(Path.pwd(`${name}.txt`), Buffer.from('Hello World!')).load()

  this.success('File successfully created!')
})
