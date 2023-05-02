import { error, info } from './output'

/**
 * @type {Map<string, any>}
 */
export const commands = new Map()

export function handleCommand(input) {
  info(`$ ${input}`)

  const split = input.split(' ')
  const name = split[0].toLowerCase()
  const args = split.slice(1)

  const command = commands[name]

  if (!command) {
    return error(`Unknown command: ${name}`)
  }

  try {
    let result = command(args)
    if (result !== undefined) {
      info(result)
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err)
    }
    error(err)
  }
}

/**
 *
 * @param {string} name The name of the command
 * @param {string} description The description of the command
 * @param {(args: string[]) => any} handler The handler function for the command
 */
export function registerCommand(name, description, handler) {
  let names = [].concat(name).map((i) => i.toLowerCase())
  handler.description = description
  names.forEach((i) => (commands[i] = handler))
}

export function checkArgs(args, amount, usage) {
  if (args.length < amount) {
    throw 'Usage: ' + usage
  }
}

registerCommand('help', 'shows a list of all commands', () => {
  let keys = Object.keys(commands).sort()
  let longest = keys.reduce((mem, next) => Math.max(mem, next.length), 0)
  return keys
    .map(
      (name) =>
        `${name}${' '.repeat(longest - name.length)} : ${
          commands[name].description
        }`
    )
    .join('\n')
})
