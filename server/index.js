//==================================================
//Module includes
//==================================================
//Grab the express module as a replacement from built-in Node.js http module
const express = require('express');
const app = express();
//Load the path module that is responsible for file paths
const path = require('path');
//Enable ALL cors request.
const cors = require('cors');
const consoleColor = require('../src/color_console.js');
const favicon = require('serve-favicon')
const date = require('../src/date.js');
const sql = require('./database/sql.js');
const api = require('./database/api.js');
//Load up the filesystem module
const fs = require('fs');
const localtunnel = require('localtunnel');
//==================================================
//Loading config file.
//==================================================
let fileData = fs.readFileSync("config.txt", 'utf8');

let get_data = fileData.split('\r\n');
for (let items in get_data) {
    let props = get_data[items].split("=");
    switch (props[0]) {
        case "admin_email":
            process.env.ADMIN_EMAIL = props[1];
            break;
        case "admin_user":
            process.env.ADMIN_USER = props[1];
            break;
        case "admin_password":
            process.env.ADMIN_PASSWORD = props[1];
            break;
        case "custom_server_domain_name":
            process.env.CUSTOM_SERVER_DOMAIN_NAME = props[1];
            break;
        case "server_port":
            process.env.SERVER_PORT = props[1];
            break;
        case "postgres_host":
            process.env.POSTGRES_HOST = props[1];
            break;
        case "postgres_user":
            process.env.POSTGRES_USER = props[1];
            break;
        case "postgres_port":
            process.env.POSTGRES_PORT = props[1];
            break;
        case "postgres_password":
            process.env.POSTGRES_PASSWORD = props[1];
            break;
        case "postgres_database":
            process.env.POSTGRES_DATABASE = props[1];
            break;
        case "postgres_database_init":
            process.env.POSTGRES_DATABASE_INIT = props[1];
            break;
    }
}
//==================================================
//Constants
//==================================================
//Initial values
const PORT_NUMBER = process.env.SERVER_PORT;
const CUSTOM_SUBDOMAIN_NAME = process.env.CUSTOM_SERVER_DOMAIN_NAME;
//Messages
const SUCCESS_CONNECT = `Successfully created a server with port ${PORT_NUMBER}`;
const ERROR_FAILED_CONNECT = `Unable to create a server with port ${PORT_NUMBER}`;

const PRODUCTION = "PRODUCTION";
const DEVELOPMENT = "DEVELOPMENT";
//==================================================
//Server startup
//==================================================
//Used to parse JSON bodies
app.use(express.json());
app.use(cors());

Initialize(PRODUCTION);

//Api files
app.post('/sign-up', api.addUser);
app.post('/log-in', api.loginUser);
app.post('/edit-user-name', api.editUserName);
app.post('/edit-user-password', api.editUserPassword);
app.post('/edit-snippet-info', api.editSnippetInfo);
app.post('/setup', api.setup);
app.post('/create-new-folder', api.createFolder);
app.post('/insert-tag-to-snippet', api.insertTagToSnippet);
app.post('/get-folders', api.getFolders);
app.post('/change-folder', api.changeFolder);
app.post('/create-snippet', api.createSnippet);
app.post('/change-content-info', api.changeContentInfo);
app.post('/get-content-from-snippet', api.getContentsFromSnippet);
app.post('/get-snippet', api.getSnippet);
app.post('/get-snippet-by-tag', api.getSnippetByTag);
app.post('/get-snippet-by-snippet-id', api.getSnippetBySnippetId);
app.post('/get-snippet-info', api.getSnippetInfo);
app.post('/create-snippet-content', api.createSnippetContent);
app.post('/link-snippet-content', api.linkSnippetContentToSnippet);
app.post('/tag/change', api.changeTag);
app.post('/tag/create', api.createTag);
app.post('/tag/get', api.getTags);
app.post('/change-content-parameters', api.changeContentParameters);
app.post('/set-folder-directory', api.updateSnippetFolderLocation);
app.post('/search', api.search);

app.delete('/delete-folder', api.deleteFolder);
app.delete('/delete-snippet', api.deleteSnippet);
app.delete('/delete-content', api.deleteContent);
app.delete('/delete/tag', api.deleteTag);
app.delete('/delete/tag-from-all-snippet', api.deleteTagFromAllSnippet);
app.delete('/delete-content-from-snippet', api.deleteContentFromSnippet);

function Initialize(value) {
       //Production Mode
    if (value === PRODUCTION) {
        //Since we will use pkg to create an executable, the directory of our dist file is different and will use a custom directory related to snapshot
        //rather than our main directory.
        function getDir() {
            if (process.pkg) {
                return path.resolve(process.execPath + "/..");
            } else {
                return path.join(require.main ? require.main.path : process.cwd());
            }
        }
        app.use('/', express.static(getDir() + '/dist'));
        app.use(favicon(path.join(getDir(), 'favicon.ico')))
        app.get('/', function (req, res) {
            res.sendFile(getDir() + '/dist/index.html');
        });

    } else if (value === DEVELOPMENT) {
        //Development uses our local directory.
        const DIST_DIR = path.join(__dirname, '../dist');
        const HTML_FILE = path.join(DIST_DIR, 'index.html');
        app.use(express.static(DIST_DIR));
        app.use(favicon(path.join(__dirname, '../favicon.ico')))
        app.get('/', (request, response) => {
            console.log(HTML_FILE);
            response.sendFile(HTML_FILE);
        });
    }

    //Create our HTTP server.
    app.listen(PORT_NUMBER, function () {
        //Function is called when we are succesfully create our server
        console.log(consoleColor.foregroundGreen + date.getTime() + "- " + SUCCESS_CONNECT);
        //Utilized local tunnel for production purposes. Local tunnel will expose our localhost to public world.
        if (value == PRODUCTION) {
            const tunnel = localtunnel(PORT_NUMBER, { subdomain: CUSTOM_SUBDOMAIN_NAME }, (err, tunnel) => {
                console.log(consoleColor.foregroundWhite + date.getTime() + "- Your public Url is: " + tunnel.url);
                console.log(consoleColor.foregroundWhite + date.getTime() + "- Or you can use https://localhost:" + PORT_NUMBER + "/");
            });
            tunnel.on('close', function () {
                console.log(consoleColor.foregroundRed + date.getTime() + "- Shutting Down Terminal...");
            });
        }
        sql.baseStart();
        api.setupDatabase()
            .then(c => {
                //Create a new database.
                sql.start();
                if (c === true)
                    return api.setup();
                else
                    return false;
            });
    })
        .on('error', function (err) {
            //Or trigger a failure when it didn't
            console.log(consoleColor.foregroundRed + date.getTime() + "- " + ERROR_FAILED_CONNECT);
        })
}
