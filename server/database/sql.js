const { Client } = require('pg');
const consoleColor = require('../../src/color_console.js');
const date = require('../../src/date.js');
const crypto = require('crypto');

//==================================================
//Constant includes
//==================================================
const SUCCESS_CONNECT = `Successfully connected to the database`;

//=================================================
//Query constants
//=================================================
const QUERY_HAS_DATABASE = `SELECT datname from pg_database WHERE datname='codepocket'`;
const QUERY_CREATE_DATABASE = `CREATE DATABASE codepocket`;
const QUERY_READ_TAG = `SELECT * from tags ORDER BY tag_id ASC`;
const QUERY_UPDATE_CONTENT_INFO = "UPDATE snippetcontent SET content_name=$2, content_code=$3, content_description=$4 WHERE content_id=$1";
const QUERY_DELETE_CONTENT = "DELETE from snippetcontent WHERE content_id=$1";
const QUERY_DELETE_FOLDER = `DELETE from folder WHERE folder_id=$2 AND user_id = $1 `;
const QUERY_DELETE_SNIPPET_FROM_FOLDER = `DELETE FROM snippet WHERE folder_id=$1`;
const QUERY_DELETE_CONTENT_FROM_SNIPPET = "UPDATE snippet SET snippet_contents_ids=array_remove(snippet_contents_ids, $2) WHERE snippet_id = $1";
const QUERY_DELETE_CONTENT_RELATED_TO_SNIPPET = "DELETE FROM snippetcontent WHERE content_id = ANY(SELECT unnest(snippet_contents_ids) AS content_list FROM snippet WHERE snippet_id = $1 ORDER BY content_list ASC)";
const QUERY_DELETE_CONTENT_RELATED_TO_FOLDER = "DELETE FROM snippetcontent WHERE content_id = ANY(SELECT unnest(snippet_contents_ids) from folder RIGHT JOIN snippet ON folder.folder_id = snippet.folder_id WHERE snippet_contents_ids IS NOT NULL AND snippet.folder_id = $1)"
const QUERY_DELETE_TAG = "DELETE from tags WHERE tag_id = $1";
const QUERY_SETUP_TAGS = `CREATE TABLE tags (tag_id TEXT PRIMARY KEY,tag_name VARCHAR(255) NOT NULL DEFAULT 'untitled',tag_color BYTEA DEFAULT '\\xffffff')`
const QUERY_SETUP_SNIPPET_CONTENT = `CREATE TABLE snippetContent(content_id TEXT PRIMARY KEY,content_name VARCHAR(255) NOT NULL DEFAULT 'untitled',content_code TEXT DEFAULT '',content_description TEXT DEFAULT '')`;
const QUERY_SETUP_SNIPPET = `CREATE TABLE snippet(snippet_id TEXT PRIMARY KEY,snippet_name VARCHAR(255) NOT NULL DEFAULT 'folder',snippet_description TEXT,snippet_color BYTEA DEFAULT '\\xffffff',parameters  json[] default array[]::json[],snippet_contents_ids TEXT[],tag TEXT[],is_completed INT[],
    user_id INTEGER NOT NULL REFERENCES users(user_id),folder_id INTEGER NOT NULL REFERENCES folder(folder_id),is_public BOOLEAN DEFAULT false,is_edittable BOOLEAN DEFAULT false,is_favorite INT[],comment_id INT[]);`;
const QUERY_LINK_TO_SNIPPET = `UPDATE snippet SET snippet_contents_ids = array_append(snippet_contents_ids,$1) WHERE snippet_id=$2`;
const QUERY_INSERT_TAG_TO_SNIPPET = `UPDATE snippet SET tag = array_append(tag, $2) WHERE snippet_id = $1`;
const QUERY_ADD_USER = `INSERT INTO users(username, email, password, someKey, someIV) VALUES($1,$2,$3,$4,$5)`;
const QUERY_READ_FOLDERS = `SELECT * from folder WHERE user_id = $1  OR is_public = true ORDER BY folder_id ASC`;
const QUERY_READ_SNIPPET_INFO = `SELECT * from snippet WHERE snippet_id = $1`;
const QUERY_READ_SNIPPET = `SELECT * from snippet WHERE (user_id = $1 OR is_public = true) AND folder_id = $2  ORDER BY snippet_id ASC`;
const QUERY_READ_SNIPPET_BY_SNIPPET_ID = `SELECT * from snippet WHERE snippet_id = $1`;
const QUERY_READ_SNIPPET_BY_TAG = `SELECT * from snippet WHERE tag && ARRAY[ $1 ]`;
const QUERY_READ_CONTENT_FROM_SNIPPET = `SELECT content_id, content_name, content_code, content_description from (SELECT unnest(snippet_contents_ids) AS content_list FROM snippet WHERE snippet_id = $1) AS contentList LEFT JOIN snippetcontent ON snippetcontent.content_id = contentList.content_list ORDER BY content_id ASC`;
const QUERY_DELETE_SNIPPET = `DELETE from snippet WHERE snippet_id=$1`;
const QUERY_DELETE_TAG_FROM_ALL_SNIPPET = `UPDATE snippet SET tag = array_remove(tag, $1)`;
const QUERY_SEARCH = `SELECT *
FROM (
	SELECT snippet_name, snippet_id, json_agg(json_build_object('content_name',content_name, 'content_id', content_id)) AS content 
	FROM (	
		SELECT snippet_name, snippet_id, unnest(snippet_contents_ids) AS items FROM snippet
	) list
	INNER JOIN snippetcontent AS c
	ON c.content_id = list.items
	WHERE content_name ILIKE $1 OR snippet_name ILIKE $1 
	GROUP BY snippet_name, snippet_id
) ls
FULL JOIN snippet AS c
ON ls.snippet_id = c.snippet_id
WHERE c.user_id = $2 OR c.is_public = true;
`;
const QUERY_CHECK_EMAIL_EXISTS = `SELECT exists (SELECT 1 from users WHERE email=$1)`;
const QUERY_SETUP_FOLDER = `CREATE TABLE folder(folder_id SERIAL PRIMARY KEY, 
    folder_name VARCHAR(100) NOT NULL DEFAULT 'default',
    folder_color BYTEA DEFAULT '\\xFFFFFFFF',
    is_public BOOLEAN,
    is_edittable BOOLEAN,
    user_id INTEGER NOT NULL REFERENCES users(user_id))`;
const QUERY_GET_EMAIL = `SELECT * from users WHERE email=$1`;
const QUERY_SETUP_USERS = `CREATE TABLE users(user_id SERIAL PRIMARY KEY,username VARCHAR(50),email TEXT UNIQUE,password TEXT, someKey TEXT, someIV TEXT);`;
const QUERY_INSERT_FOLDER = `INSERT INTO folder (folder_name, folder_color, is_public, is_edittable, user_id) VALUES ($1, $3,$4,$5, $2)`;
const QUERY_CHANGE_FOLDER = `UPDATE folder SET folder_name=$2, folder_color=$3, is_edittable=$4, is_public=$5 WHERE folder_id =$1`;
const QUERY_CHANGE_USERNAME = `UPDATE users SET username=$2 WHERE user_id =$1`;
const QUERY_CHANGE_PASSWORD = `UPDATE users SET password=$2, someKey=$3, someIV=$4 WHERE user_id =$1`;
const QUERY_CHANGE_SNIPPET_INFO = `UPDATE snippet SET snippet_name=$1, snippet_description=$2, snippet_color=$3::bytea, is_public=$5, is_edittable=$6, tag=$7 WHERE snippet_id=$4`;
const QUERY_CHANGE_TAG = `UPDATE tags SET tag_name=$2, tag_color=$3::bytea WHERE tag_id =$1`;
const QUERY_CHANGE_SNIPPET_FOLDER_LOCATION = "UPDATE snippet SET folder_id=$1 WHERE snippet_id=$2";
const QUERY_CREATE_SNIPPET = `INSERT INTO snippet(user_id, folder_id, snippet_name, snippet_description, snippet_color, snippet_id,tag, is_public, is_edittable) VALUES($1, $2, $3,$4,$5::bytea,$6,$7,$8,$9)`;
const QUERY_CREATE_SNIPPET_CONTENT = `INSERT INTO snippetContent(content_id) VALUES($1)`;
const QUERY_CREATE_TAG = `INSERT INTO tags(tag_id,tag_name,tag_color) VALUES($1,$2,$3::bytea)`;
let client = undefined;

function start() {
    client = new Client({
        host:  process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        port: process.env.POSTGRES_PORT,
        password: process.env.POSTGRES_PASSWORD,
        database:process.env.POSTGRES_DATABASE
    })
    client.connect(err => {
        if (err) {
            console.log(consoleColor.foregroundRed + date.getTime() + "- " + err);
            //Failed connection
        } else {
            console.log(consoleColor.foregroundGreen + date.getTime() + "- " + SUCCESS_CONNECT);
            //Successful connection
        }
    });
}
function baseStart() {
    client = new Client({
        host:  process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        port: process.env.POSTGRES_PORT,
        password: process.env.POSTGRES_PASSWORD,
        database:process.env.POSTGRES_DATABASE_INIT
    })
    client.connect(err => {
        if (err) {
            //Failed connection
        } else {
            //Success connection
        }
    });
}
function addUser(username, email, password) {
    //We will use a AES encryption and a random 64 bit key and 32 bit;
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    //We want to encrypt their credentials so the users are not able to figure out what password they receive.
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(password);
    encrypted_password = Buffer.concat([encrypted, cipher.final()]).toString('hex');

    //Create a user based on given information.
    return client.query(QUERY_ADD_USER, [username, email, encrypted_password, key.join(","), iv.join(",")]);

}
function hasDatabase() {

    //Successful connection
    return client.query(QUERY_HAS_DATABASE)
        .then(results => {
            return (results.rows.length > 0);
        });

}
function createDatabase() {
    return client.query(QUERY_CREATE_DATABASE);
}

function checkIfEmailExists(email) {
    return client.query(QUERY_CHECK_EMAIL_EXISTS, [email]);
}
function getEmail(email) {
    return client.query(QUERY_GET_EMAIL, [email]);
}

function setupUsers() {
    return client.query(QUERY_SETUP_USERS);
}
function setupFolder() {
    return client.query(QUERY_SETUP_FOLDER);
}
function setupSnippet() {
    return client.query(QUERY_SETUP_SNIPPET);
}
function setupSnippetContent() {
    return client.query(QUERY_SETUP_SNIPPET_CONTENT);
}
function setupTags() {
    return client.query(QUERY_SETUP_TAGS);
}
function createFolder(folder_name, folder_color, is_public, is_edittable, user_id) {
    return client.query(QUERY_INSERT_FOLDER, [folder_name, user_id, folder_color, is_public, is_edittable]);
}

function changeFolder(folder_id, folder_name, folder_color, allowEdit, isPublic) {
    return client.query(QUERY_CHANGE_FOLDER, [folder_id, folder_name, folder_color, allowEdit, isPublic]);
}
function changeUsername(id, new_name) {
    return client.query(QUERY_CHANGE_USERNAME, [id, new_name]);
}
function changePassword(id, new_name, key, iv) {
    //We will use a AES encryption and a random 64 bit key and 32 bit;
    return client.query(QUERY_CHANGE_PASSWORD, [id, new_name, key, iv]);
}

function changeSnippetInfo(snippet_name, snippet_description, snippet_color, snippet_id, snippet_tag, is_public, is_edittable) {
    return client.query(QUERY_CHANGE_SNIPPET_INFO, [snippet_name, snippet_description, snippet_color, snippet_id, is_public, is_edittable, snippet_tag]);
}
function changeContentInfo(content_id, content_name, content_code, content_description) {
    return client.query(QUERY_UPDATE_CONTENT_INFO, [content_id, content_name, content_code, content_description]);
}
function changeTag(tag_id, tag_name, tag_color) {
    return client.query(QUERY_CHANGE_TAG, [tag_id, tag_name, tag_color]);
}
function changeContentParameters(snippet_id, parameters) {
    return client.query(`UPDATE snippet SET parameters = array[ ${parameters} ]::json[] WHERE snippet_id = '${snippet_id}'`);
}
function changeSnippetFolderLocation(folder_id, snippet_id) {
    return client.query(QUERY_CHANGE_SNIPPET_FOLDER_LOCATION, [folder_id, snippet_id])
}
function createSnippet(user_id, folder_id, snippet_name, snippet_description, snippet_color, snippet_id, tag, is_public, is_edittable) {
    return client.query(QUERY_CREATE_SNIPPET,
        [user_id, folder_id, snippet_name, snippet_description, snippet_color, snippet_id, tag, is_public, is_edittable]);
}
function createSnippetContent(content_id) {
    return client.query(QUERY_CREATE_SNIPPET_CONTENT, [content_id]);
}

function createTag(tag_id, tag_name, tag_color) {
    return client.query(QUERY_CREATE_TAG, [tag_id, tag_name, tag_color]);
}
function insertTagToSnippet(snippet_id, tag_id) {
    return client.query(QUERY_INSERT_TAG_TO_SNIPPET, [snippet_id, tag_id]);
}
function linkSnippetContentToSnippet(snippet_id, content_id) {
    return client.query(QUERY_LINK_TO_SNIPPET, [content_id, snippet_id]);
}

function getContentsFromSnippet(snippet_id) {
    return client.query(QUERY_READ_CONTENT_FROM_SNIPPET, [snippet_id]);
}
function getSnippet(user_id, folder_id) {
    return client.query(QUERY_READ_SNIPPET, [user_id, folder_id]);
}
function getSnippetBySnippetId(snippet_id) {
    return client.query(QUERY_READ_SNIPPET_BY_SNIPPET_ID, [snippet_id]);
}
function getSnippetByTag(tag_name) {
    return client.query(QUERY_READ_SNIPPET_BY_TAG, [tag_name]);
}
function getTags() {
    return client.query(QUERY_READ_TAG);
}
function getSnippetInfo(snippet_id) {
    return client.query(QUERY_READ_SNIPPET_INFO, [snippet_id]);
}
function getFolders(user_id) {
    return client.query(QUERY_READ_FOLDERS, [user_id]);
}


function deleteContent(content_id) {
    return client.query(QUERY_DELETE_CONTENT, [content_id]);
}
function deleteContentFromSnippet(snippet_id, content_id) {
    return client.query(QUERY_DELETE_CONTENT_FROM_SNIPPET, [snippet_id, content_id]);
}
function deleteContentRelatedToSnippet(snippet_id) {
    return client.query(QUERY_DELETE_CONTENT_RELATED_TO_SNIPPET, [snippet_id]);
}
function deleteContentRelatedToFolder(folder_id) {
    return client.query(QUERY_DELETE_CONTENT_RELATED_TO_FOLDER, [folder_id]);
}
function deleteFolder(user_id, folder_id) {
    return client.query(QUERY_DELETE_FOLDER, [user_id, folder_id]);
}
function deleteSnippet(snippet_id) {
    return client.query(QUERY_DELETE_SNIPPET, [snippet_id]);
}
function deleteSnippetFromFolder(folder_id) {
    return client.query(QUERY_DELETE_SNIPPET_FROM_FOLDER, [folder_id]);
}
function deleteTag(tag_id) {
    return client.query(QUERY_DELETE_TAG, [tag_id]);
}
function deleteTagFromAllSnippet(tag_name) {
    return client.query(QUERY_DELETE_TAG_FROM_ALL_SNIPPET, [tag_name]);
}

function search(word, user_id) {
    return client.query(QUERY_SEARCH, ["%" + word + "%", user_id]);
}
//==================================================
exports.addUser = addUser;
exports.baseStart = baseStart;
exports.start = start;
exports.checkIfEmailExists = checkIfEmailExists;

//Create
exports.hasDatabase = hasDatabase;
exports.createDatabase = createDatabase;
exports.createFolder = createFolder;
exports.createSnippet = createSnippet;
exports.createTag = createTag;
exports.insertTagToSnippet = insertTagToSnippet;
//Read
exports.getEmail = getEmail;
exports.getFolders = getFolders;
exports.getSnippet = getSnippet;
exports.getSnippetInfo = getSnippetInfo;
exports.getContentsFromSnippet = getContentsFromSnippet;
exports.getTags = getTags;
exports.getSnippetByTag = getSnippetByTag;
exports.getSnippetBySnippetId = getSnippetBySnippetId;
//Update
exports.changeUsername = changeUsername;
exports.changePassword = changePassword;
exports.changeFolder = changeFolder;
exports.changeSnippetInfo = changeSnippetInfo;
exports.createSnippetContent = createSnippetContent;
exports.linkSnippetContentToSnippet = linkSnippetContentToSnippet;
exports.changeContentInfo = changeContentInfo;
exports.changeTag = changeTag;
exports.changeContentParameters = changeContentParameters;
exports.changeSnippetFolderLocation = changeSnippetFolderLocation;
//Delete
exports.deleteFolder = deleteFolder;
exports.deleteSnippet = deleteSnippet;
exports.deleteContent = deleteContent;
exports.deleteContentFromSnippet = deleteContentFromSnippet;
exports.deleteContentRelatedToSnippet = deleteContentRelatedToSnippet;
exports.deleteContentRelatedToFolder = deleteContentRelatedToFolder;
exports.deleteSnippetFromFolder = deleteSnippetFromFolder;
exports.deleteTag = deleteTag;
exports.deleteTagFromAllSnippet = deleteTagFromAllSnippet;
//Setup
exports.setupFolder = setupFolder;
exports.setupUsers = setupUsers;
exports.setupSnippet = setupSnippet;
exports.setupTags = setupTags;
exports.setupSnippetContent = setupSnippetContent;
//Search
exports.search = search;