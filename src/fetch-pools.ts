import {Command, ux} from '@oclif/core'
import axios from 'axios'
import chalk from 'chalk'

import {Pools} from './types'

/**
 * Fetches mainnet pools from midgard
 * @param command this
 * @returns Promise<Pools>
 */
export const fetchPools = async (command: Command): Promise<Pools> => {
  ux.action.start('Fetching pools')
  const uri = 'https://midgard.ninerealms.com/v2/pools'
  try {
    const {data: pools} = await axios.get<Pools>(uri)
    ux.action.stop()
    return pools
  } catch {
    ux.action.stop()
    command.error(chalk.red(`Error fetching pools at ${uri}`))
  }
}
