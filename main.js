const electron = require('electron');
const url = require('url');
const path = require('path');
// menu voor menu
// ipcMain voor overbrengen van data via ipcRenderer proces
// van html (render proces) naar main.js (main proces)
// ipcMain is de eventhandeler
// ipcReneder is de event trigger functie  
const {app, BrowserWindow, Menu, ipcMain} =electron;

// SET ENV
// als deze setting aan staat zie je dedevtools niet
process.env.NODE_ENV = 'production';

let mainWindow;
let addWIndow;

// listen for the app to be ready
app.on('ready', function(){
    // create new window
    mainWindow = new BrowserWindow({
        //regels beneden voor require issue in addWindow 
        webPreferences: {
            nodeIntegration: true
        }
        
    });
    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
        // dit maakt:
        // file://currentdir/mainWindow.html
    }));

    // quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert menu
    Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list item',
        //regels beneden voor require issue in addWindow 
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    // garbage collection handle
    addWindow.on('closed', function(){
        addWindow = null;
    })
}

// catch item:add
// e is event en het item
ipcMain.on('item:add', function(e, item){
// naar main window sturen
    // console.log(item);
    mainWindow.webContents.send('itemNaarMainWindow:add', item);
    addWindow.close();
});

// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('itemClearNaarMainWindow:clear');
                }
            },
            {
                label: 'Quit',
                // darwin is op een mac
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]       
    }
];

// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                },
            },
            {
                role: 'reload'
            }
        ]
    })
}