//React
import React, { Component } from 'react';
//React-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
//Styles
import './Menu.css'
//Constants
import * as constants from '../shared/constants';
//Other Components
import { Snippet_Folder } from './Folder/Snippet_Folder';
import { Snippet_Tag } from './Tag/Snippet_Tag';
import { Snippet_Snippet } from './Snippet/Snippet_Snippet';

import * as PostgreSql from '../shared/api-request';
import $ from 'jquery'
import { Dialog_Folder } from '../../dialog/dialog_folder';
import { Dialog_SnippetProperty } from '../../dialog/dialog_snippetProperty';
import { Dialog_Tag } from '../../dialog/dialog_tag';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import { Search_Result } from './Search/Search_Result';

export class Menu extends Component {
    constructor(props) {
        //In a react component, always call super function to get properties (props)
        super(props);
        //Our state variable
        this.state = {
            selectedTab: "folders",
            //Main reason to put our list and selection here instead of separate components is because they should persist when user
            //switches components in the future.

            //Important index selected.
            selectedTag: { rightClick: -1, click: -1 },
            selectedFolder: { rightClick: -1, click: -1 },
            selectedSnippet: { rightClick: -1, click: -1 },
            //Important index editted.
            edittedTag: -1,
            edittedFolder: -1,
            edittedSnippet: -1,
            //Important list of data stored.
            folderList: [],
            tagList: [],
            snippetList: [],
            searchSnippetList: [],
            get_dialog: undefined,
            draggedElement: undefined,
            search_dialog: undefined
        };

        this.selectFolder_rightClick = this.selectFolder_rightClick.bind(this);
        this.selectFolder = this.selectFolder.bind(this);
        this.selectSnippet = this.selectSnippet.bind(this);
        this.selectTag = this.selectTag.bind(this);
        this.selectTag_rightClick = this.selectTag_rightClick.bind(this);
        this.removeFolder = this.removeFolder.bind(this);
        this.removeSnippet = this.removeSnippet.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.createFolder = this.createFolder.bind(this);
        this.createSnippet = this.createSnippet.bind(this);
        this.createTag = this.createTag.bind(this);
        this.editSnippet = this.editSnippet.bind(this);
        this.editFolder = this.editFolder.bind(this);
        this.editTag = this.editTag.bind(this);
        this.showCreateFolder = this.showCreateFolder.bind(this);
        this.showCreateTag = this.showCreateTag.bind(this);
        this.showCreateSnippet = this.showCreateSnippet.bind(this);
        this.updateFolder = this.updateFolder.bind(this);
        this.updateSnippet = this.updateSnippet.bind(this);
        this.updateTag = this.updateTag.bind(this);
        this.readSnippetList = this.readSnippetList.bind(this);
        this.readTag = this.readTag.bind(this);
        this.grabTag = this.grabTag.bind(this);
        this.snippetDragBegin = this.snippetDragBegin.bind(this);
        this.snippetDragEnd = this.snippetDragEnd.bind(this);
        this.snippetDragOver = this.snippetDragOver.bind(this);
        this.snippetDrop = this.snippetDrop.bind(this);
        this.selectSnippetR = this.selectSnippetR.bind(this);
        this.closeSearch = this.closeSearch.bind(this);
    }
    componentDidMount() {
        PostgreSql.readFolder(this.props.userId)
            .then(info => {
                this.setState({ folderList: info });
            });
        PostgreSql.readTag()
            .then(info => {
                this.setState({ tagList: info });
            });
    }
    render() {
        return (
            <div style={{ width: "100vw", height: "100vh" }} onClick={() => this.clearSelection()}>
                <div >
                    <div className="bottomLayer">
                        <div style={{ width: "100%", height: "64px", backgroundColor: "Tomato", color: "black", fontFamily: "Righteous", fontSize: "42px" }}>

                            {/*Search bar */}
                            <Stack direction="horizontal">
                                <span>Pocket Coder</span>
                                <Form.Control id="search" style={{ width: "50%", fontFamily: "Righteous" }} defaultValue="" placeholder="Search for something here"
                                    onChange={c => {
                                        if ($("#search").val() != "") {
                                            this.search($("#search").val());
                                        } else {
                                            this.closeSearch();
                                        }
                                    }}
                                >

                                </Form.Control>

                                <Button variant="success" onClick={c => { $("#search").val(""); this.closeSearch(); }}>
                                    <span className="material-symbols-outlined">backspace</span>
                                </Button>
                                <Button variant="success"
                                    onClick={c => {
                                        this.refreshWebpage();
                                    }}
                                >
                                    <span className="material-symbols-outlined">refresh</span>
                                </Button>
                            </Stack>
                        </div>

                        {/*Drop down for options */}
                        <Dropdown id="userInfo">
                            <Dropdown.Toggle variant="success" size="lg" id="dropdown-basic">
                                {this.props.user}
                            </Dropdown.Toggle>

                            <Dropdown.Menu >
                                <Dropdown.Item onClick={() => { this.props.setMenu(constants.MODE_LOGIN); }}>Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </div>
                    <Tabs id="tab" defaultActiveKey="folders" style={{ width: "320px", height: "36px" }} onSelect={(key) => { this.setState({ selectedTab: key }) }}>
                        <Tab eventKey="folders" title="Folder" ></Tab>
                        <Tab eventKey="tags" title="Tag"></Tab>
                    </Tabs>

                    {this.renderSelectedTab(this.state.selectedTab)}

                </div>
                <Snippet_Snippet
                    folderSelected={this.state.folderList[this.state.selectedFolder.click]}
                    change={this.selectSnippet}
                    changeR={this.selectSnippetR}
                    index={this.state.selectedSnippet.click}
                    indexR={this.state.selectedSnippet.rightClick}
                    indexTag={this.state.selectedTag.click}
                    add={this.showCreateSnippet}
                    delete={this.removeSnippet}
                    edit={this.editSnippet}
                    list={this.state.search_dialog == undefined ? this.state.snippetList : this.state.searchSnippetList}
                    tagList={this.state.tagList}
                    readSnippet={this.readSnippetList}
                    drag={this.snippetDragBegin}
                    endDrag={this.snippetDragEnd}
                    userId={this.props.userId}
                >
                </Snippet_Snippet>
                {this.state.search_dialog}
                {this.state.get_dialog}
            </div>);
    }
    renderSelectedTab(index) {

        switch (index) {
            case "folders":
                return (<Snippet_Folder
                    rightSelect={this.selectFolder_rightClick}
                    select={this.selectFolder}
                    indexR={this.state.selectedFolder.rightClick}
                    index={this.state.selectedFolder.click}
                    add={this.showCreateFolder}
                    delete={this.removeFolder}
                    list={this.state.folderList}
                    edit={this.editFolder}
                    onDragOver={this.snippetDragOver}
                    onDrop={this.snippetDrop}
                    userId={this.props.userId}
                >
                </Snippet_Folder>);
            case "tags":
                return (<Snippet_Tag
                    change={this.selectTag}
                    rightChange={this.selectTag_rightClick}
                    index={this.state.selectedTag.click}
                    indexR={this.state.selectedTag.rightClick}
                    add={this.showCreateTag}
                    delete={this.removeTag}
                    list={this.state.tagList}
                    edit={this.editTag}

                >
                </Snippet_Tag>);
        }
    }
    selectFolder_rightClick(index) {
        this.state.selectedFolder.rightClick = index;
        this.setState({ selectedFolder: this.state.selectedFolder });
    }
    selectFolder(folder_id, id) {
        this.state.selectedFolder.click = id;
        this.state.selectedTag.click = -1;
        this.setState({ selectedFolder: this.state.selectedFolder, selectedTag: this.state.selectedTag }, () => {
            let folder = this.state.fol
            PostgreSql.readSnippetList(folder_id, this.props.userId)
                .then(data => {
                    this.setState({ snippetList: data, selectedSnippet: { rightClick: -1, click: -1 } });
                });

        });
    }
    selectSnippet(index) {
        this.state.selectedSnippet.click = index;
        this.setState({ selectedSnippet: this.state.selectedSnippet });
    }
    selectSnippetR(index) {
        this.state.selectedSnippet.rightClick = index;
        this.setState({ selectedSnippet: this.state.selectedSnippet });
    }
    selectTag_rightClick(index) {
        this.state.selectedTag.rightClick = index;

        this.setState({ selectedTag: this.state.selectedTag });
    }
    selectTag(index) {
        this.state.selectedTag.click = index;
        this.state.selectedFolder.click = -1;
        this.state.selectedSnippet.click = -1;
        this.setState({
            selectedTag: this.state.selectedTag,
            selectFolder: this.state.selectedFolder,
            selectSnippet: this.state.selectedSnippet
        }, () => {
            this.readSnippetListByTag();
        });
    }
    clearSelection() {
        $("#rightClickMenu3").hide();
        $("#rightClickMenu2").hide();
        $("#rightClickMenu").hide();
        this.state.selectedFolder.rightClick = -1;
        this.state.selectedSnippet.rightClick = -1;
        this.state.selectedTag.rightClick = -1;
        this.setState({ selectedFolder: this.state.selectedFolder, selectedSnippet: this.state.selectedSnippet, selectedTag: this.state.selectedTag })
    }
    showCreateFolder() {
        this.setState({
            get_dialog: (<Dialog_Folder
                selected={undefined}
                submit={this.createFolder}
                cancel={this.createFolder}
                userId={this.props.userId}>
            </Dialog_Folder>)
        });
    }
    showCreateSnippet() {
        this.setState({
            get_dialog: (<Dialog_SnippetProperty
                selected={undefined}
                submit={this.createSnippet}
                cancel={this.createSnippet}
                getTag={this.readTag}
                list_tag={this.grabTag}
                userId={this.props.userId}
            >
            </Dialog_SnippetProperty>)
        });
    }
    showCreateTag() {

        this.setState({
            get_dialog: (<Dialog_Tag
                selected={undefined}
                submit={this.createTag}
                cancel={this.createTag}>
            </Dialog_Tag>)
        });

    }
    createFolder(item, should_add) {
        this.setState({
            get_dialog: undefined
        }, () => {
            if (should_add === true) {
                PostgreSql.createFolder(item.folderName, item.folderColor.replace('#', '\\x'), item.isPublic, item.isEdittable, this.props.userId)
                    .then(data => {
                        return PostgreSql.readFolder(this.props.userId);
                    })
                    .then(info => {
                        this.setState({ folderList: info });
                    });
            }
        })
    }
    createSnippet(data, should_add) {
        this.setState({
            get_dialog: undefined
        }, () => {
            if (should_add === true) {
                PostgreSql.createSnippet(this.state.folderList[this.state.selectedFolder.click].folder_id, this.props.userId, data)
                    .then(data => {
                        return PostgreSql.readSnippetList(this.state.folderList[this.state.selectedFolder.click].folder_id, this.props.userId);
                    })
                    .then(info => {
                        this.setState({ snippetList: info });
                    });
            }
        });
    }
    createTag(item, should_add) {
        this.setState({
            get_dialog: undefined

        }, () => {
            if (should_add === true) {
                PostgreSql.createTag(item.tagId, item.tagName, item.tagColor.replace('#', '\\x'))
                    .then(data => {
                        return PostgreSql.readTag();
                    })
                    .then(info => {
                        this.setState({ tagList: info });
                    });

            }
        })
    }
    editFolder(index) {
        this.setState({
            edittedFolder: index,
            get_dialog: (<Dialog_Folder
                selected={this.state.folderList[index]}
                submit={this.updateFolder}
                cancel={this.updateFolder}
                userId={this.props.userId}>
            </Dialog_Folder>)
        });

    }
    editSnippet(index) {
        this.setState({
            edittedSnippet: index,
            get_dialog: (<Dialog_SnippetProperty
                selected={this.state.snippetList[index]}
                submit={this.updateSnippet}
                getTag={this.readTag}
                list_tag={this.grabTag}
                userId={this.props.userId}
            >
            </Dialog_SnippetProperty>)
        });
    }
    editTag(index) {
        this.setState({
            edittedTag: index,
            get_dialog: (<Dialog_Tag
                selected={this.state.tagList[index]}
                submit={this.updateTag}>
            </Dialog_Tag>)
        });
    }
    readTag() {
        //If a return is used, the code will not be ran asynchronously and will wait until this promise function resolves/rejects altogether.
        //This is mainly used for snippet dialog which relies on calling this function as a prop in the dialog component.
        return PostgreSql.readTag()
            .then(info => {
                this.setState({
                    tagList: info,
                });
            })
    }
    readSnippetList(snippet_id) {
        this.setState({
            snippetList: []
        }, () => {
            if (this.state.search_dialog == undefined) {
                let id = this.state.folderList[this.state.selectedFolder.click].folder_id;
                return PostgreSql.readSnippetList(id, this.props.userId)
                    .then(info => {
                        this.setState({
                            snippetList: info
                        });
                    })
            } else {
                return PostgreSql.readSnippetBySnippetId(snippet_id)
                    .then(info => {
                        this.setState({
                            snippetList: info
                        }, () => {
                            if ($("#search").val() != "")
                                this.search($("#search").val());
                        });
                    })
            }
        });

    }
    readSnippetListByTag() {
        this.setState({
            snippetList: []
        }, () => {
            let tag_name = this.state.tagList[this.state.selectedTag.click].tag_name;
            return PostgreSql.readSnippetListByTag(tag_name)
                .then(info => {
                    this.setState({
                        snippetList: info
                    });
                })

        });
    }
    grabTag() {
        return this.state.tagList;
    }
    removeFolder(get_index) {
        PostgreSql.deleteFolder(get_index, this.props.userId)
            .then(data => {
                return PostgreSql.readFolder(this.props.userId);
            })
            .then(info => {
                this.setState({ folderList: info });
            });
    }
    removeSnippet(get_index) {
        PostgreSql.deleteSnippet(get_index)
            .then(data => {
                let id = this.state.folderList[this.state.selectedFolder.click].folder_id;
                return PostgreSql.readSnippetList(id, this.props.userId);
            })
            .then(info => {
                this.setState({ snippetList: info });
            });

    }
    removeTag(get_index) {
        //First delete any tag associated to snippet, then delete the tag, then update both snippet and tag.
        PostgreSql.deleteTagFromAllSnippet(this.state.tagList[get_index].tag_name)
            .then(data => {
                let id = this.state.folderList[this.state.selectedFolder.click].folder_id;
                return PostgreSql.readSnippetList(id, this.props.userId);
            })
            .then(info => {
                this.setState({ snippetList: info });
            })
            .then(data => {
                PostgreSql.deleteTag(this.state.tagList[get_index].tag_id)
            })
            .then(data => {
                return PostgreSql.readTag();
            })
            .then(info => {
                this.setState({
                    tagList: info
                })
            })

    }
    updateFolder(item, edit) {
        this.setState({
            get_dialog: undefined
        }, () => {
            if (edit === true) {
                //Update the folder.
                PostgreSql.updateFolder(item.id, item.folderName, item.folderColor.replace('#', '\\x'), item.isEdittable, item.isPublic)
                    .then(data => {
                        return PostgreSql.readFolder(this.props.userId);
                    })
                    .then(info => {
                        this.setState({ folderList: info });
                    });
            }
        });
    }
    updateSnippet(item, edit) {
        this.setState({
            get_dialog: undefined
        }, () => {
            if (edit === true) {
                //Update the folder.
                PostgreSql.updateSnippet(item.snippetName, item.snippetDescription, item.snippetColor.replace('#', '\\x'), item.snippetId, item.tag, item.isPublic, item.isEdittable)
                    .then(data => {
                        if (this.state.selectedFolder.click != -1) {
                            let id = this.state.folderList[this.state.selectedFolder.click].folder_id;
                            return PostgreSql.readSnippetList(id, this.props.userId);
                        } else if (this.state.selectedTag.click != -1) {
                            let name = this.state.tagList[this.state.selectedTag.click].tag_name;
                            return PostgreSql.readSnippetListByTag(name);
                        }
                    })
                    .then(info => {
                        this.setState({ snippetList: info });
                    });
            }
        });
    }
    updateTag(item, edit) {
        this.setState({
            get_dialog: undefined
        }, () => {
            if (edit === true) {
                //Update the folder.
                PostgreSql.updateTag(item.tagId, item.tagName, item.tagColor.replace('#', '\\x'))
                    .then(data => {
                        return PostgreSql.readTag();
                    })
                    .then(info => {
                        this.setState({ tagList: info });
                    });
            }
        });
    }
    //Trigger when a snippet is starting to be dragged
    snippetDragBegin(event, element) {
        this.clearSelection();
        //Begin drag
        if (element != undefined) {
            this.setState({
                draggedElement: element
            })
        }
    }
    //Trigger when a snippet is finished dragging
    snippetDragEnd(event) {
        this.setState({
            draggedElement: undefined
        })
    }
    //Trigger when a snippet is being dragged over
    snippetDragOver(event) {
        event.preventDefault();
        return false;
    }
    //Trigger when a snippet is dropped.
    snippetDrop(event, obj) {
        //Only allow snippets and folders belonging to the same user to be draggable.
        if (obj.user_id != this.props.userId || this.state.folderList[this.state.selectedFolder.click].user_id != this.props.userId) {
            return;
        }
        var rect = event.target.getBoundingClientRect();
        let targetted_obj = {
            x: rect.left,
            y: rect.top,
            width: event.target.clientWidth,
            height: event.target.clientHeight
        };
        let mouse_obj = {
            x: event.pageX,
            y: event.pageY,
            width: 1,
            height: 1
        };
        if (mouse_obj.x + mouse_obj.width >= targetted_obj.x && mouse_obj.x <= targetted_obj.x + targetted_obj.width && mouse_obj.y + mouse_obj.height >= targetted_obj.y && mouse_obj.y <= targetted_obj.y + targetted_obj.height) {
            PostgreSql.changeFolderDirectory(this.state.draggedElement.snippet_id, obj.folder_id)
                .then(data => {
                    let id = this.state.folderList[this.state.selectedFolder.click].folder_id;
                    return PostgreSql.readSnippetList(id, this.props.userId);
                })
                .then(info => {
                    this.setState({ snippetList: info, selectedSnippet: { rightClick: -1, click: -1 } });
                });
        }
    }
    search(word) {
        //To be continued
        PostgreSql.search(word, this.props.userId)
            .then(data => {
                this.setState({
                    searchSnippetList: data.data,
                    selectedSnippet: { rightClick: -1, click: -1 },
                }, () => {
                    this.setState({
                        search_dialog: (<Search_Result
                            list={this.state.searchSnippetList}
                            userId={this.props.userId}
                            index={this.state.selectedSnippet.click}
                            indexR={this.state.selectedSnippet.rightClick}
                            change={this.selectSnippet}
                            changeR={this.selectSnippetR}
                            close={this.closeSearch}

                        >
                        </Search_Result>)
                    });
                });

            })
    }
    closeSearch() {
        this.setState({
            search_dialog: undefined,
            searchSnippetList: [],
            selectedSnippet: { rightClick: -1, click: -1 },
            selectedFolder: { rightClick: -1, click: -1 }
        })
    }
    refreshWebpage() {
        PostgreSql.readFolder(this.props.userId)
            .then(info => {
                this.setState({ folderList: info });
            });
        PostgreSql.readTag()
            .then(info => {
                this.setState({ tagList: info });
            });
        this.setState({
            selectedTab: "folders",
            //Main reason to put our list and selection here instead of separate components is because they should persist when user
            //switches components in the future.

            //Important index selected.
            selectedTag: { rightClick: -1, click: -1 },
            selectedFolder: { rightClick: -1, click: -1 },
            selectedSnippet: { rightClick: -1, click: -1 },
            //Important index editted.
            edittedTag: -1,
            edittedFolder: -1,
            edittedSnippet: -1,
            //Important list of data stored.
            folderList: [],
            tagList: [],
            snippetList: [],
            searchSnippetList: [],
            get_dialog: undefined,
            draggedElement: undefined,
            search_dialog: undefined
        });
    }
}