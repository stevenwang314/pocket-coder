import './dialog.css';
import { Dialog } from './dialog';

//React
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReactQuill from 'react-quill';

import $ from 'jquery'

//We want to test this inherited dialog.
export class Dialog_Folder extends Dialog {
    constructor(props) {
        super(props);
        this.state = {};
        this.width = 500;
        this.height = 350;
    }
    componentDidMount() {
        if (this.props.selected != undefined) {
            $("#folderName").val(this.props.selected.folder_name);
            $("#folderColor").val("#" + this.props.selected.folder_color.data[0].toString(16).padStart(2, '0') 
                                      + this.props.selected.folder_color.data[1].toString(16).padStart(2, '0') 
                                      + this.props.selected.folder_color.data[2].toString(16).padStart(2, '0'));
            $("#publicFolder").prop('checked', this.props.selected.is_public);
            $("#editFolder").prop('checked',this.props.selected.is_edittable);

            $("#publicFolder").prop('disabled', this.props.userId !== this.props.selected.user_id);
            $("#editFolder").prop('disabled',this.props.userId !== this.props.selected.user_id);
        }

     
    }
    drawItems() {
        return (
            <Container>
                <Row>
                    <Col xs={3}><Form.Label htmlFor="folderName" style={{ fontFamily: "Jost", fontSize: "16px" }}>Folder Name:</Form.Label></Col>
                    <Col xs={9}><Form.Control id="folderName" placeholder="Name of folder!"></Form.Control></Col>
                </Row>
                <Row>
                    <Col xs={3}><Form.Label htmlFor="folderColor" style={{ fontFamily: "Jost", fontSize: "16px" }}>Folder color:</Form.Label></Col>
                    <Col xs={9}><Form.Control id="folderColor" type="color" style={{ width: "100%" }} defaultValue="#FFFFFF"></Form.Control></Col>
                </Row>
                <Form.Check id="publicFolder" label="Public Folder" />
                <Form.Check id="editFolder" label="Allow other users to edit this folder:" />
                <Button variant="primary" onClick={() => {
                    let data = { 
                        id: this.props.selected != undefined ? this.props.selected.folder_id : -1,
                        folderName: $("#folderName").val(),
                        folderColor: $("#folderColor").val(),
                        isPublic: $("#publicFolder").is(":checked"),
                        isEdittable: $("#editFolder").is(":checked")
                    }
                    if ($("#folderName").val() != "") {
                        this.props.submit(data, true);
                    }
                }} type="submit">Submit</Button>
                <Button variant="danger" onClick={() => { this.props.submit(undefined, false) }}>X</Button>

            </Container>

        );
    }
}