/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '@athenna/config'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default Queue Connection Name
  |--------------------------------------------------------------------------
  |
  | Athenna's queue API supports an assortment of back-ends via a single
  | API, giving you convenient access to each back-end using the same
  | syntax for every one. Here you may define a default connection.
  |
  */

  default: Env('QUEUE_CONNECTION', 'memory'),

  /*
   |--------------------------------------------------------------------------
   | Queue Connections
   |--------------------------------------------------------------------------
   |
   | Here you may configure the connection information for each server that
   | is used by your application. A default configuration has been added
   | for each back-end shipped with Athenna. You are free to add more.
   |
   | Drivers: "memory", "database", "awsSqs", "fake"
   |
   */

  connections: {
    memory: {
      driver: 'memory',
      queue: 'queue_name',
      deadletter: 'deadletter_queue_name',
      attempts: 1
    }
  }
}
