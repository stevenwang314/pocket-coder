//React
import React, { Component } from 'react';
//React - Bootstrap
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

import $ from 'jquery'
import "../Menu.css"
import { Form } from 'react-bootstrap';

export class Search_Result extends Component {
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
                <div style={{ position: "absolute", top: "64px", left: "0px", width: "556px", height: "1000px", overflowY: "auto", backgroundColor: "rgba(180,107,145,1.0)", border: "2.5px solid black", zIndex: "2" }}>
                    <Form.Label>{"There are " + this.props.list.length + " results found from search"}</Form.Label>
                    <Button variant="primary"
                        onClick={() => {

                            this.props.close();
                        }}>
                     Close</Button>
                    <ListGroup style={{ height: "calc(100vh - 144px)", overflowY: "auto" }}>
                        {this.props.list.map((snippet, id) => {
                            return (
                                <ListGroup.Item draggable="true" className="list" key={"folder" + id}
                                    //  style={{ backgroundColor: (this.props.indexR === id ? "teal" : (this.props.index === id ? "yellow" : "white")) }}
                                    onContextMenu={(event) => { this.showMenu(event, id) }}
                                    onClick={() => {
                                        this.props.change(id);
                                    }}
                                >
                                    {this.props.userId !== snippet.user_id && <span class="material-symbols-outlined">person</span>}
                                    {snippet.is_edittable === true ? <span style={{ fontSize: "12px" }} className="material-symbols-outlined">edit</span> :
                                        <span style={{ fontSize: "16px" }} className="material-symbols-outlined">lock</span>}
                                    {snippet.is_public === true ? <span style={{ fontSize: "12px" }} className="material-symbols-outlined">visibility</span> :
                                        <span style={{ fontSize: "16px" }} className="material-symbols-outlined">visibility_off</span>}
                                    {snippet.snippet_name}
                                    {snippet.content && snippet.content.map((c,index)=> {
                                        return (<li key={"query"+index}>{c.content_name}</li>)
                                    })}
                                </ListGroup.Item>
                            );
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
}