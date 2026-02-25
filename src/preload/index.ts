import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch {
    /* context isolation not available */
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
}
