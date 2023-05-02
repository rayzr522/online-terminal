import { FS } from './fs'

const SYSTEM_LS_KEY = 'online-terminal-state'

export let sys = {
  fs: new FS(),
}

export function loadSystem() {
  const serializedSys = localStorage.getItem(SYSTEM_LS_KEY)
  if (serializedSys) {
    try {
      const parsedSys = JSON.parse(serializedSys)
      sys = {
        fs: FS.deserialize(parsedSys.fs),
      }
    } catch {}
  }
}

export function saveSystem() {
  localStorage.setItem(SYSTEM_LS_KEY, JSON.stringify(sys))
}
