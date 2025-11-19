import { app, BrowserWindow, autoUpdater, dialog } from 'electron';
import path from 'path';
import squirrelStartup from 'electron-squirrel-startup';
import { Round } from '../shared/round';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
    app.quit();
}


const setupAutoUpdater = () => {
    if (app.isPackaged) {
        const server = 'https://your-update-server.com/updates';
        // For Squirrel.Windows, the URL should point to the folder containing RELEASES
        const url = `${server}`;

        try {
            autoUpdater.setFeedURL({ url });

            autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
                const dialogOpts = {
                    type: 'info' as const,
                    buttons: ['Restart', 'Later'],
                    title: 'Application Update',
                    message: process.platform === 'win32' ? releaseNotes : releaseName,
                    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
                };

                dialog.showMessageBox(dialogOpts).then((returnValue) => {
                    if (returnValue.response === 0) autoUpdater.quitAndInstall();
                });
            });

            autoUpdater.on('error', (message) => {
                console.error('There was a problem updating the application');
                console.error(message);
            });

            // Check for updates immediately and then every 60 minutes
            autoUpdater.checkForUpdates();
            setInterval(() => {
                autoUpdater.checkForUpdates();
            }, 5 * 60 * 1000);
        } catch (error) {
            console.error('Failed to setup auto updater:', error);
        }
    }
};

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: Round.round(800),
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        console.log('Loading URL:', MAIN_WINDOW_VITE_DEV_SERVER_URL);
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        console.log('Loading file:', path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.print({
            silent: true
        })
    })
};

app.on('ready', () => {
    createWindow();
    setupAutoUpdater();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
