//==================================================
//Module includes
//==================================================
const statusCode = require('./../../src/statusCode.js');
const database = require('./sql.js');
const crypto = require('crypto');

const consoleColor = require('../../src/color_console.js');
const date = require('../../src/date.js');

addUser = (request, response) => {

    database.checkIfEmailExists(request.body.email)
        .then(res => {
            if (res.rows[0].exists === false) {
                //Create a user based on given information.
                return database.addUser(request.body.username, request.body.email, request.body.password)
            }
            else {
                response.writeHead(statusCode.STATUS_CODE_OK);
                response.write(JSON.stringify({ "results": "error user exists", "message": "Email account already exists" }));
                response.end();
                return Promise.reject('user-error');
            }
        })
        .then(data => {
            return database.getEmail(request.body.email);
        })
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully created account!", "username": data.rows[0].username, "id": data.rows[0].user_id }));
            response.end();
        })
        .catch(err => {
            if (err != 'user-error') {
                response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
                response.write(JSON.stringify({ "results": "error", "message": err.message }));
                response.end();
            }
        });
}

loginUser = (request, response) => {

    //Create a user based on given information.
    database.getEmail(request.body.email)
        .then(data => {
            if (data.rows.length == 1) {
                let iv = Buffer.from(data.rows[0].someiv.split(","), 'hex');
                let encryptedText = Buffer.from(data.rows[0].password, 'hex');
                let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(data.rows[0].somekey.split(",")), iv);
                let decrypted = decipher.update(encryptedText);
                decrypted = Buffer.concat([decrypted, decipher.final()]).toString();

                if (decrypted == request.body.password) {

                    response.writeHead(statusCode.STATUS_CODE_OK);
                    response.write(JSON.stringify({ "results": "success", "message": "Successfully logged in!", "username": data.rows[0].username, "id": data.rows[0].user_id }));
                    response.end();
                } else {
                    response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
                    response.write(JSON.stringify({ "results": "error", "message": "Unable to log in, either the email or password is correct." }));
                    response.end();
                }
            } else {
                response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
                response.write(JSON.stringify({ "results": "error", "message": "Unable to log in, either the email or password is correct." }));
                response.end();
            }
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(err.message)
            response.end();
        });
}
editUserName = (request, response) => {

    database.changeUsername(request.body.id, request.body.user_name)
        .then(res => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully changed user name!", "username": request.body.user_name, "id": request.body.id }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

editUserPassword = (request, response) => {
    //When a user changes their password, we shall create and new key and encrypt with new key for security purposes.

    //We will use a AES encryption and a random 64 bit key and 32 bit;
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    //We want to encrypt their credentials so the users are not able to figure out what password they receive.
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(request.body.password);
    encrypted_password = Buffer.concat([encrypted, cipher.final()]).toString('hex');

    database.changePassword(request.body.id, encrypted_password, key.join(","), iv.join(","))
        .then(res => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully changed user password!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

setupDatabase = (request, response) => {
    return database.hasDatabase()
        .then(res=>{
            if (res === false) {
                console.log(consoleColor.foregroundGreen + date.getTime() + "- No database found... creating new database.");
                return database.createDatabase()
                    .then(c=> {
                        console.log(consoleColor.foregroundGreen + date.getTime() + "- Created the database!");
                        return true;
                    })
                    .catch(err=> {
                        console.log(consoleColor.foregroundRed + date.getTime() + "- Failed to create the database...");
                        return false;
                    });
            } else {
                return false;
            }
        })

}
setup = (request, response) => {

    database.setupUsers()
        .then(data=> {
            console.log(consoleColor.foregroundCyan + date.getTime() + "- Created user table!");
            return database.addUser(process.env.ADMIN_USER,process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        })
        .then(data => {
            console.log(consoleColor.foregroundCyan + date.getTime() + "- Created user admin!");
            return database.setupFolder();
        })
        .then(data => {
            console.log(consoleColor.foregroundCyan + date.getTime() + "- Created folder table!");
            return database.setupSnippet();
        })
        .then(data => {
            console.log(consoleColor.foregroundCyan + date.getTime() + "- Created snippet table!");
            return database.setupTags();
        })
        .then(data => {
            console.log(consoleColor.foregroundCyan + date.getTime() + "- Created tag table!");
            return database.setupSnippetContent();
        })
        .then(data => {
            console.log(consoleColor.foregroundCyan + date.getTime() + "- Created snippet content table!");
        })
        .catch(err => {
            console.log(consoleColor.foregroundRed + date.getTime() + "- Unexpected error...");
        });
}

createFolder = (request, response) => {
    database.createFolder(request.body.folder_name, request.body.folder_color, request.body.is_public, request.body.is_edittable, request.body.user_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully created a new folder." }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

getFolders = (request, response) => {
    database.getFolders(request.body.user_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully grab the folders", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

deleteFolder = (request, response) => {
    database.deleteContentRelatedToFolder(request.body.folder_id)
        .then(data => {
            //Then delete the snippet altogether.
            return database.deleteSnippetFromFolder(request.body.folder_id);
        })
        .then(data => {
            //Then delete the snippet altogether.
            return database.deleteFolder(request.body.user_id, request.body.folder_id)
        })
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully delete the selected folder!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
deleteSnippet = (request, response) => {
    //First delete any content that has been related to the snippet
    database.deleteContentRelatedToSnippet(request.body.snippet_id)
        .then(data => {
            //Then delete the snippet altogether.
            return database.deleteSnippet(request.body.snippet_id)
        })
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully delete the selected Snippet!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
deleteContent = (request, response) => {
    database.deleteContent(request.body.content_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully delete the selected content!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
deleteContentFromSnippet = (request, response) => {
    database.deleteContentFromSnippet(request.body.snippet_id, request.body.content_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully delete the selected content!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

changeFolder = (request, response) => {

    database.changeFolder(request.body.folder_id, request.body.folder_name, request.body.folder_color, request.body.is_edittable, request.body.is_public)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully editted the selected folder!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

createSnippet = (request, response) => {
    database.createSnippet(request.body.user_id, request.body.folder_id, request.body.snippet_name, request.body.snippet_description,
        request.body.snippet_color, request.body.snippet_id, request.body.tag, request.body.is_public, request.body.is_edittable)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully created a new snippet!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

createSnippetContent = (request, response) => {
    database.createSnippetContent(request.body.content_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully created a new snippet content!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

createTag = (request, response) => {
    database.createTag(request.body.tag_id, request.body.tag_name, request.body.tag_color)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully created a new tag!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
changeTag = (request, response) => {
    database.changeTag(request.body.tag_id, request.body.tag_name, request.body.tag_color)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully changed the tag!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
deleteTag = (request, response) => {
    database.deleteTag(request.body.tag_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully deleted the tag!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
deleteTagFromAllSnippet = (request, response) => {
    database.deleteTagFromAllSnippet(request.body.tag_name)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully deleted the tag from all snippets!" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
getTags = (request, response) => {
    database.getTags()
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully grabbed the tag!", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
linkSnippetContentToSnippet = (request, response) => {
    database.linkSnippetContentToSnippet(request.body.snippet_id, request.body.content_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully linked content to snippet" }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
getContentsFromSnippet = (request, response) => {
    database.getContentsFromSnippet(request.body.snippet_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully linked content to snippet", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
getSnippet = (request, response) => {
    database.getSnippet(request.body.user_id, request.body.folder_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully grabbed a snippet!", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
getSnippetBySnippetId = (request, response) => {
    database.getSnippetBySnippetId(request.body.snippet_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully grabbed a snippet!", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
getSnippetByTag = (request, response) => {
    database.getSnippetByTag(request.body.tag_name)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully grabbed a snippet!", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
getSnippetInfo = (request, response) => {
    database.getSnippetInfo(request.body.snippet_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully grabbed a snippet information", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
editSnippetInfo = (request, response) => {
    database.changeSnippetInfo(request.body.snippet_name, request.body.snippet_description, request.body.snippet_color, request.body.snippet_id, request.body.tag, request.body.is_public, request.body.is_edittable)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully editted a snippet!", "data": data.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
changeContentInfo = (request, response) => {
    database.changeContentInfo(request.body.content_id, request.body.content_name, request.body.content_code, request.body.content_description)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully changed content info", }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
changeContentParameters = (request, response) => {
    database.changeContentParameters(request.body.snippet_id, request.body.parameters)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "successfully changed content info", }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
insertTagToSnippet = (request, response) => {
    database.insertTagToSnippet(request.body.snippet_id, request.body.tag_id)
        .then(data => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully inserted a tag to snippet." }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
updateSnippetFolderLocation = (request, response) => {
    database.changeSnippetFolderLocation(request.body.folder_id,request.body.snippet_id)
        .then(res => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully updated snippet new folder location." }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}
search = (request, response) => {
    database.search(request.body.word, request.body.user_id)
        .then(res => {
            response.writeHead(statusCode.STATUS_CODE_OK);
            response.write(JSON.stringify({ "results": "success", "message": "Successfully searched for snippets.","data": res.rows }));
            response.end();
        })
        .catch(err => {
            response.writeHead(statusCode.STATUS_CODE_BAD_REQUEST);
            response.write(JSON.stringify({ "results": "error", "message": err.message }));
            response.end();
        });
}

//==================================================
//Export our api!
//==================================================
exports.addUser = addUser;
exports.loginUser = loginUser;
exports.editUserName = editUserName;
exports.editUserPassword = editUserPassword;
exports.editSnippetInfo = editSnippetInfo;
exports.setup = setup;
exports.createFolder = createFolder;
exports.getFolders = getFolders;
exports.deleteFolder = deleteFolder;
exports.deleteSnippet = deleteSnippet;
exports.deleteContent = deleteContent;
exports.changeFolder = changeFolder;
exports.createSnippet = createSnippet;
exports.getSnippet = getSnippet;
exports.getSnippetInfo = getSnippetInfo;
exports.getSnippetByTag = getSnippetByTag;
exports.getSnippetBySnippetId = getSnippetBySnippetId;
exports.createSnippetContent = createSnippetContent;
exports.linkSnippetContentToSnippet = linkSnippetContentToSnippet;
exports.getContentsFromSnippet = getContentsFromSnippet;
exports.changeContentInfo = changeContentInfo;
exports.createTag = createTag;
exports.changeTag = changeTag;
exports.deleteTag = deleteTag;
exports.deleteTagFromAllSnippet = deleteTagFromAllSnippet;
exports.getTags = getTags;
exports.insertTagToSnippet = insertTagToSnippet;
exports.deleteContentFromSnippet = deleteContentFromSnippet;
exports.changeContentParameters = changeContentParameters;
exports.setupDatabase = setupDatabase;
exports.updateSnippetFolderLocation = updateSnippetFolderLocation;
exports.search = search;