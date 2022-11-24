//React
import React, { Component } from 'react';
//React - Bootstrap
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

import * as Random from '../../../../src/random';
import '../Menu.css';
import $ from 'jquery'
const BASE_Y = "100px";
const WIDTH = "300px";

export class Snippet_Tag extends Component {
    constructor(props) {
        super(props);
        this.state = {
      
        };

    }
    componentDidMount() {

    }

    render() {
        return (
            <div style={{ userSelect: "none" }}>
                <div style={{ backgroundColor: "rgba(255,0,0,0.75)", top: BASE_Y, width: WIDTH, position: "absolute", border: "2.5px solid black" }}>
                    {/*A button that adds new tags */}
                    <span style={{ fontFamily: "Dosis", fontSize: "48px", color: "black" }}>Tag</span>
                    <Button variant="success" onClick={c => { this.props.add(Random.generateRandomString(Random.generateNumber(3, 15))); }}><span className="material-symbols-outlined">tag</span></Button>
                    <ListGroup style={{ height: "calc(100vh - 184px)", overflowY: "auto" }}>
                        {this.props.list.map((tag, id) => {
                            let color = "#" + tag.tag_color.data[0].toString(16).padStart(2, "0") + tag.tag_color.data[1].toString(16).padStart(2, "0") + tag.tag_color.data[2].toString(16).padStart(2, "0");

                            return <ListGroup.Item
                                className="list" key={"tag" + id}
                                style={this.props.indexR === id ? { backgroundColor: "teal" } : (this.props.index === id ? { backgroundColor: "yellow" } :  { backgroundColor: color })}
                                onContextMenu={(event) => { this.showMenu(event, id) }}
                                onClick={(event)=> {
                                    this.props.change(id)
                                }}
                                >{tag.tag_name}
                              
                            </ListGroup.Item>
                        })}
                    </ListGroup>

                </div>
                {/*This is a right click menu which has no relation to part of the snippet drawing as it is drawn on its own (by default, the right click menu context is invisible.) */}
                {this.rightClickMenu()}
            </div>
        );
    }

    showMenu(e, index) {
        var top = e.pageY + 5;
        var left = e.pageX;

        // Show contextmenu
        $("#rightClickMenu3").show(100).css({
            top: top + "px",
            left: left + "px"
        });

        e.preventDefault();

        this.props.rightChange(index);

    }

    rightClickMenu() {
        return (
            <div id="rightClickMenu3" style={{ zIndex: "1", display: "none", position: "absolute", left: "600px", top: "200px" }}>
                <div className="rightClickElements" style={{ border: "1px solid black", width: "200px" }} onClick={() => { this.props.edit(this.props.indexR) }}><span className="material-symbols-outlined">edit</span>Edit</div>
                <div className="rightClickElements" style={{ border: "1px solid black", width: "200px" }} onClick={() => { this.props.delete(this.props.indexR) }}><span className="material-symbols-outlined">delete</span>Delete</div>
            </div>
        );

    }
}