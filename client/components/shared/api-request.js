//DEVELOPMENT CHECK
const base = window.location.href === "http://localhost:4242/" ? "http://localhost:3000" : "";

export function createFolder(_folder_name, _folder_color, _is_public, _is_edittable, _user_id) {
    return fetch(base + "/create-new-folder", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            folder_name: _folder_name,
            folder_color: _folder_color,
            is_public: _is_public,
            is_edittable: _is_edittable,
            user_id: _user_id
        })
    })
        .then(data => {
            return data.json();
        });
}
export function readFolder(_user_id) {
    return fetch(base + "/get-folders", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: _user_id
        })
    }).
        then(data => {
            return data.json();
        })
        .then(res => {
            if (res.results == "success") {
                return res.data;
            } else {
                return [];
            }
        });
}
export function updateFolder(_folder_id, _folder_name, _folder_color, _is_edittable, _is_public) {
    return fetch(base + "/change-folder", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            folder_id: _folder_id,
            folder_name: _folder_name,
            folder_color: _folder_color,
            is_public: _is_public,
            is_edittable: _is_edittable
        })
    })
        .then(data => {
            return data.json();
        });
}
export function deleteFolder(_folder_id, _user_id) {
    return fetch(base + "/delete-folder", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: _user_id,
            folder_id: _folder_id
        })
    }).then(data => {
        return data.json();
    });
}
//=================================================================================================================================
export function createSnippet(_folder_id, _user_id, data) {
    return fetch(base + "/create-snippet", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            folder_id: _folder_id,
            user_id: _user_id,
            snippet_name: data.snippetName,
            snippet_description: data.snippetDescription,
            snippet_color: data.snippetColor,
            snippet_id: data.snippetId,
            tag: data.tag,
            is_public: data.isPublic,
            is_edittable: data.isEdittable
        })
    })
        .then(data => {
            return data.json();
        });
}
export function updateSnippet(_snippet_name, _snippet_description, _snippet_color, _snippet_id, _tag, _is_public, _is_edittable) {
    return fetch(base + "/edit-snippet-info", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snippet_name: _snippet_name,
            snippet_description: _snippet_description,
            snippet_color: _snippet_color,
            snippet_id: _snippet_id,
            is_public: _is_public,
            is_edittable: _is_edittable,
            tag: _tag
        })
    })
        .then(data => {
            return data.json();
        });
}
export function deleteSnippet(_snippet_id) {
    return fetch(base + "/delete-snippet", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            snippet_id: _snippet_id
        })
    }).then(data => {
        return data.json();
    });
}
export function insertTagToSnippet(_snippet_id, _tag_id) {
    return fetch(base + "/insert-tag-to-snippet", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snippet_id: _snippet_id,
            tag_id: _tag_id
        })
    })
        .then(data => {
            return data.json();
        });
}

//==================================================================================================================================
export function readSnippetList(_folder_id, _user_id) {
    return fetch(base + "/get-snippet", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            folder_id: _folder_id,
            user_id: _user_id,

        })
    }).
        then(data => {
            return data.json();
        })
        .then(res => {
            if (res.results === "success") {
                return res.data;
            } else {
                return [];
            }
        });
}
export function readSnippetBySnippetId(_snippet_id) {
    return fetch(base + "/get-snippet-by-snippet-id", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           snippet_id: _snippet_id
        })
    }).
        then(data => {
            return data.json();
        })
        .then(res => {
            if (res.results === "success") {
                return res.data;
            } else {
                return [];
            }
        });
}
export function readSnippetListByTag(_tag_name) {
    return fetch(base + "/get-snippet-by-tag", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           tag_name: _tag_name
        })
    }).
        then(data => {
            return data.json();
        })
        .then(res => {
            if (res.results === "success") {
                return res.data;
            } else {
                return [];
            }
        });
}
//==================================================================================================================================
export function createTag(_tag_id, _tag_name, _tag_color) {
    return fetch(base + "/tag/create", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tag_id: _tag_id,
            tag_name: _tag_name,
            tag_color: _tag_color
        })
    })
        .then(data => {
            return data.json();
        });
}

export function readTag() {
    return fetch(base + "/tag/get", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(data => {
            return data.json();
        })
        .then(res => {
            if (res.results === "success") {
                return res.data;
            } else {
                return [];
            }
        });
}
export function updateTag(_tag_id, _tag_name, _tag_color) {
    return fetch(base + "/tag/change", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tag_id: _tag_id,
            tag_name: _tag_name,
            tag_color: _tag_color
        })
    })
        .then(data => {
            return data.json();
        });
}
export function deleteTag(_tag_id) {
    return fetch(base + "/delete/tag", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tag_id: _tag_id,
        })
    })
        .then(data => {
            return data.json();
        });
}
export function deleteTagFromAllSnippet(_tag_name) {
    return fetch(base + "/delete/tag-from-all-snippet", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tag_name: _tag_name,
        })
    })
        .then(data => {
            return data.json();
        });
}
//==================================================================================================================================
export function createContent(_content_id) {
    return fetch(base + "/create-snippet-content", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content_id: _content_id,
        })
    })
        .then(data => {
            return data.json();
        });
}
export function getContent(_snippet_id) {
    return fetch(base + "/get-content-from-snippet", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snippet_id: _snippet_id,
        })
    })
        .then(data => {
            return data.json();
        })
        .then(res => {
            if (res.results === "success") {
                return res.data;
            } else {
                return [];
            }
        });
}
export function deleteContent(_content_id) {
    return fetch(base + "/delete-content", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content_id: _content_id,
        })
    })
        .then(data => {
            return data.json();
        });
}
export function linkContentToSnippet(_snippet_id, _content_id) {
    return fetch(base + "/link-snippet-content", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snippet_id: _snippet_id,
            content_id: _content_id
        })
    })
        .then(data => {
            return data.json();
        });
}

export function updateContent(_content_id, _content_name, _content_code, _content_description, _code_to_copy) {
    return fetch(base + "/change-content-info", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content_id: _content_id,
            content_name: _content_name,
            content_code: _content_code,
            content_description: _content_description,
            code_to_copy: _code_to_copy
        })
    })
        .then(data => {
            return data.json();
        });
}
export function removeContentFromSnippet(_content_id, _snippet_id) {
    return fetch(base + "/delete-content-from-snippet", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snippet_id: _snippet_id,
            content_id: _content_id
        })
    })
        .then(data => {
            return data.json();
        });
}
export function changeContentParameters(_snippet_id, _parameters) {
    return fetch(base + "/change-content-parameters", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            snippet_id: _snippet_id,
            parameters: _parameters
        })
    })
        .then(data => {
            return data.json();
        });
}
export function login(_email, _password) {
    return fetch(base + "/log-in", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: _email,
            password: _password
        })
    })
        .then(data => {
            return data.json();
        })
        .then((data) => {
            switch (data.results) {
                case 'error':
                    return { result: false, username: "", id: -1 };
                case 'success':
                    return { result: true, username: data.username, id: data.id };
            }
        })
}

export function signUp(_username, _email, _password) {
    return fetch(base + "/sign-up", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: _username,
            email: _email,
            password: _password
        })
    })
        .then(data => {
            return data.json();
        })
        .then((data) => {
            switch (data.results) {
                case 'error':
                    return { success: false, message: "Unspecified error, try again later.", username: "", id: -1 };
                case 'error user exists':
                    return { success: false, message: "This email has already been registered", username: "", id: -1 };
                case 'success':
                    return { success: true, message: "", username: data.username, id: data.id };
            }
        })
}

export function changeFolderDirectory(_snippet_id, _folder_id) {
    return fetch(base +"/set-folder-directory", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            snippet_id: _snippet_id,
            folder_id: _folder_id
        })
    })
        .then((data) => {
            return data.json();
        });
}

//==================================================================================================================================
export function search(_word, _user_id) {
    return fetch(base +"/search", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            word: _word,
            user_id:_user_id
        })
    })
        .then((data) => {
            return data.json();
        });
}