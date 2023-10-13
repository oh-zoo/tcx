import {Command, ux} from '@oclif/core'

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
    arr.slice(i * size, (i * size) + size),
  )

/**
 * Log wallet phrase
 * @param command this
 * @param phrase string
 * @returns Promise<void>
 */
export const phrase = async ({command, phrase}:
  {
    command: Command,
    phrase: string,
  },
): Promise<void> => {
  const words = phrase.split(' ')
  const chunks = chunk(words, 4)

  const data = chunks.map(chunk => {
    const [col1, col2, col3, col4] = chunk
    return {col1, col2, col3, col4}
  })

  command.log()
  ux.table(data, {
    col1: {header: '', minWidth: 10},
    col2: {header: '', minWidth: 10},
    col3: {header: '', minWidth: 10},
    col4: {header: '', minWidth: 10},
  }, {'no-header': true})
  command.log()
}
