import './commands'

import { handleCommand } from './command-handler'
import { hint } from './output'
import { loadSystem, saveSystem } from './system'
import { $ } from './utils'

export let sys
let input

window.addEventListener('load', () => {
  loadSystem()

  input = $('.commandInput')
  input.focus()

  input.addEventListener('keydown', ({ key }) => {
    if (key === 'Enter' && input.value) {
      handleCommand(input.value)
      input.value = ''
    }
  })

  hint('Hint: Type "help" for a list of commands.')
})

window.addEventListener('unload', () => saveSystem())
