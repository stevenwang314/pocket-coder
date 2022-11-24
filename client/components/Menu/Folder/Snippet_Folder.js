//React
import React, { Component } from 'react';
//React - Bootstrap
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import $ from 'jquery'
import "../Menu.css"



const BASE_Y = "100px";
const WIDTH = "300px";

export class Snippet_Folder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItem: -1,
            selectedIndex: -1

        };
    }

    componentDidMount() {

    }

    render() {

        return (
            <div style={{ userSelect: "none" }}>
                <div style={{ position: "absolute", top: BASE_Y, width: WIDTH, backgroundColor: "rgba(180,107,145,0.52)", border: "2.5px solid black" }}>
                    {/*A button that adds new folders */}
                    <span style={{ fontFamily: "Dosis", fontSize: "48px", color: "black" }}>Folder</span>
                    <Button variant="success" onClick={c => { this.props.add(); }}><span className="material-symbols-outlined">create_new_folder</span></Button>
                    {/*Note that the difference uses the original position of the absolute frame*/}
                    <ListGroup id="lb" style={{ height: "calc(100vh - 184px)", overflowY: "auto", border: "1px solid black" }}>
                        {this.props.list.map((folder_info, id) => {
                            let color = "#" + folder_info.folder_color.data[0].toString(16).padStart(2, "0") + folder_info.folder_color.data[1].toString(16).padStart(2, "0") + folder_info.folder_color.data[2].toString(16).padStart(2, "0");
                            return <ListGroup.Item className="list" key={"folder" + id}
                                style={{
                                    fontFamily: "Roboto",
                                    fontSize: "24px",
                                    background: (this.props.index === id ? "linear-gradient(90deg, " + color + " 0%, rgb(255,255,255) 25%,rgb(0,0,0) 75%," + color + " 100%)" : (this.props.indexR === id ? "teal" : color)),
                                    border: (this.props.index === id ? "5px solid black" : ""),
                                    borderRadius: (this.props.index === id ? "25px" : "")
                                }}
                                onContextMenu={(event) => { this.showMenu(event, folder_info.folder_id, id) }}
                                onClick={(event) => { this.props.select(folder_info.folder_id, id) }}
                                onDragOver={event => { this.props.onDragOver(event) }}
                                onDrop={event => { this.props.onDrop(event, folder_info) }}
                            >
                                {this.props.userId !== folder_info.user_id && <span className="material-symbols-outlined">person</span>}
                                {folder_info.is_edittable === true ? 
                                    <span style={{ fontSize: "12px" }} className="material-symbols-outlined">edit</span> :
                                    <span style={{ fontSize: "16px" }} className="material-symbols-outlined">lock</span>}
                                {folder_info.is_public === true ? 
                                    <span style={{ fontSize: "12px" }} className="material-symbols-outlined">visibility</span> :
                                    <span style={{ fontSize: "16px" }} className="material-symbols-outlined">visibility_off</span>}
                                {folder_info.folder_name}
                            </ListGroup.Item>
                        })}
                    </ListGroup>

                </div>
                {/*This is a right click menu which has no relation to part of the snippet drawing as it is drawn on its own (by default, the right click menu context is invisible.) */}
                {this.rightClickMenu()}
            </div>
        );
    }

    showMenu(e, id, index) {
        var top = e.pageY + 5;
        var left = e.pageX;

        // Show contextmenu
        $("#rightClickMenu").show(100).css({
            top: top + "px",
            left: left + "px"
        });

        e.preventDefault();
        this.setState({ selectedItem: id, selectedIndex: index })
        this.props.rightSelect(index);

    }

    rightClickMenu() {
        return (
            <div id="rightClickMenu"
                style={{
                    zIndex: "1",
                    display: "none",
                    position: "absolute",
                    left: "600px",
                    top: "200px"
                   
                }}>
                <div className="rightClickElements" style={{ border: "1px solid black", width: "200px",
                 backgroundColor: (this.state.selectedIndex == -1 || this.props.userId === this.props.list[this.state.selectedIndex].user_id ||  this.props.list[this.state.selectedIndex].is_edittable === true ? "white" : "gray") }}
                    onClick={() => {
                        if (this.props.userId === this.props.list[this.state.selectedIndex].user_id || this.props.list[this.state.selectedIndex].is_edittable === true)
                            this.props.edit(this.state.selectedIndex)
                    }}>
                    <span className="material-symbols-outlined">edit</span>Edit
                </div>
                <div className="rightClickElements" style={{ border: "1px solid black", width: "200px",
                 backgroundColor: (this.state.selectedIndex == -1 || this.props.userId === this.props.list[this.state.selectedIndex].user_id ? "white" : "gray") }}
                    onClick={() => {
                        if (this.props.userId === this.props.list[this.state.selectedIndex].user_id)
                            this.props.delete(this.state.selectedItem)
                    }}>
                    <span className="material-symbols-outlined">delete</span>Delete
                </div>
            </div>
        );

    }

}