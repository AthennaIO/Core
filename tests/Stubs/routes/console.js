import { File, Path } from '@secjs/utils'
import { Artisan } from '@athenna/artisan'

Artisan.command('make:hello <name>', async function (name) {
  await new File(Path.pwd(`${name}.txt`), Buffer.from('Hello World!')).load()

  this.success('File successfully created!')
})
