//React
import React, { Component } from 'react';
//React - Bootstrap
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

import $ from 'jquery'
import "../Menu.css"
import { Editor_Content } from '../Content/Editor_Content';

import * as PostgreSql from '../../shared/api-request';
import { Menu_Parameters } from '../Parameters/menu_parameters';

export class Snippet_Snippet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItem: undefined,

            contentList: [],
            parameter_after_input: []
        };

        this.getContent = this.getContent.bind(this);
        this.editParameter = this.editParameter.bind(this);
    }
    componentDidMount() {

    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.index != prevProps.index && this.props.index != -1) {
            this.setState({
                parameter_after_input: [...Array(this.props.list[this.props.index].parameters.length,)]
            }, () => {
                this.state.parameter_after_input.fill("");
            })
            this.getContent();
        }
    }
    render() {
        return (
            <div>
                 <div style={{
                    backgroundColor: (this.props.folderSelected ? "#" + this.props.folderSelected.folder_color.data[0].toString(16).padStart(2, "0") +
                        this.props.folderSelected.folder_color.data[1].toString(16).padStart(2, "0") +
                        this.props.folderSelected.folder_color.data[2].toString(16).padStart(2, "0") + "bf" : "#FFFFFF")
                    , position: "absolute", top: "64px", width: "256px", left: "300px", border: "2.5px solid black"
                }}>
                    {/*A button that adds new tags */}
                    {this.props.folderSelected  && <span style={{ fontFamily: "Dosis", fontSize: "48px", color: "black" }}>{this.props.folderSelected.folder_name}</span>}
                    {this.props.folderSelected  && <Button variant="success" onClick={c => { this.props.add(this.props.folderSelected.folder_id) }}><span className="material-symbols-outlined">add</span></Button>}
                    <ListGroup style={{ height: "calc(100vh - 144px)", overflowY: "auto" }}>
                        {this.props.list.map((snippet, id) => {
                            return (
                                <ListGroup.Item draggable="true" className="list" key={"folder" + id}
                                    style={{ backgroundColor: (this.props.indexR === id ? "teal" : (this.props.index === id ? "yellow" : "white")) }}
                                    onContextMenu={(event) => { this.showMenu(event, id) }}
                                    onClick={() => {
                                        this.props.change(id);
                                    }}
                                    onDragStart={(event) => {
                                        this.props.drag(event, snippet);
                                    }}
                                    onDragEnd={(event) => {
                                        this.props.endDrag(event);
                                    }}
                                >
                                    {this.props.userId !== snippet.user_id && <span class="material-symbols-outlined">person</span>}
                                    {snippet.is_edittable === true ? <span style={{ fontSize: "12px" }} className="material-symbols-outlined">edit</span> :
                                        <span style={{ fontSize: "16px" }} className="material-symbols-outlined">lock</span>}
                                    {snippet.is_public === true ? <span style={{ fontSize: "12px" }} className="material-symbols-outlined">visibility</span> :
                                        <span style={{ fontSize: "16px" }} className="material-symbols-outlined">visibility_off</span>}
                                    {snippet.snippet_name}
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </div>
                
                {this.props.index != -1 && <Editor_Content
                    snippet={this.props.list[this.props.index]}
                    getContent={this.getContent}
                    list={this.state.contentList}
                    tagList={this.props.tagList}
                    paramAfter={this.state.parameter_after_input}
                >
                </Editor_Content>}
                {this.props.index != -1 && <Menu_Parameters
                    snippet={this.props.list[this.props.index]}
                    getContent={this.getContent}
                    readSnippet={this.props.readSnippet}
                    parameters={this.state.parameter_after_input}
                    changeParameters={this.editParameter}
                >
                </Menu_Parameters>}

                {/*This is a right click menu which has no relation to part of the snippet drawing as it is drawn on its own (by default, the right click menu context is invisible.) */}
                {this.rightClickMenu()}

            </div>
        );
    }

    showMenu(e, index) {
        var top = e.pageY + 5;
        var left = e.pageX;

        // Show contextmenu
        $("#rightClickMenu2").show(100).css({
            top: top + "px",
            left: left + "px"
        });

        e.preventDefault();
        this.setState({
            selectedItem: this.props.list[index],
        })
        this.props.changeR(index);

    }

    rightClickMenu() {
        return (
            <div id="rightClickMenu2" style={{ zIndex: "1", display: "none", position: "absolute", left: "600px", top: "200px", }}>
                <div className="rightClickElements" style={{
                    border: "1px solid black", width: "200px",
                    backgroundColor: (this.props.indexR == -1 || this.props.list.length === 0 || this.props.userId === this.props.list[this.props.indexR].user_id || this.props.list[this.props.indexR].is_edittable === true ? "white" : "gray")
                }}
                    onClick={() => {
                        if (this.props.userId === this.props.list[this.props.indexR].user_id || this.props.list[this.props.indexR].is_edittable === true)
                            this.props.edit(this.props.indexR)
                    }
                    }><span className="material-symbols-outlined">edit</span>Edit</div>
                <div className="rightClickElements" style={{
                    border: "1px solid black", width: "200px",
                    backgroundColor: (this.props.indexR == -1 || this.props.list.length === 0 || this.props.userId === this.props.list[this.props.indexR].user_id  ? "white" : "gray")
                }}
                    onClick={() => {
                        if (this.props.userId === this.props.list[this.props.indexR].user_id)
                            this.props.delete(this.state.selectedItem.snippet_id)
                    }}><span className="material-symbols-outlined">delete</span>Delete</div>
            </div>
        );

    }

    getContent() {
        this.setState({
            contentList: []
        }, ()=> {
            return PostgreSql.getContent(this.props.list[this.props.index].snippet_id)

            .then((data) => {
                this.setState({ contentList: data });
            });
        })
  
    }

    editParameter(index, value) {
        this.state.parameter_after_input[index] = value;
        this.setState({ parameter_after_input: this.state.parameter_after_input });
    }
}

