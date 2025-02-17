import { ipcMain, app } from 'electron';
import { resolve } from 'path';
import { homedir } from 'os';
import { WindowsManager } from './windows-manager';

(process.env as any)['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
app.commandLine.appendSwitch('--enable-transparent-visuals');
ipcMain.setMaxListeners(0);

app.setPath('userData', resolve(homedir(), '.wexond'));

export const windowsManager = new WindowsManager();

// app.setAsDefaultProtocolClient('http');
// app.setAsDefaultProtocolClient('https');

process.on('uncaughtException', error => {
  console.error(error);
});

/*
app.on('window-all-closed', () => {
  if (platform() !== 'darwin') {
    app.quit();
  }
});
*/
