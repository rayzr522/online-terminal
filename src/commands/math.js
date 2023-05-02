import { registerCommand } from '../command-handler'
import { mapToNumbers } from '../utils'

// Math
registerCommand(['add', '+'], 'adds two or more numbers', (args) =>
  mapToNumbers(args).reduce((mem, next) => mem + next, 0)
)
registerCommand(['subtract', '-'], 'subtracts two or more numbers', (args) => {
  let numbers = mapToNumbers(args)
  let first = numbers.shift()
  return numbers.reduce((mem, next) => mem - next, first)
})
registerCommand(['multiply', '*'], 'multiplies two or more numbers', (args) =>
  mapToNumbers(args).reduce((mem, next) => mem * next, 1)
)
