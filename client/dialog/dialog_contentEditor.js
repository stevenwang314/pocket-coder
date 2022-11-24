import './dialog.css';
import 'react-quill/dist/quill.snow.css';
import { Dialog } from './dialog';

//React
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import $ from 'jquery';

import ReactQuill, {Quill } from 'react-quill';

//We want to test this inherited dialog.
export class Dialog_ContentEditor extends Dialog {
    constructor(props) {
        super(props);
        this.state = {
            descInput: "",
            codeInput: ""
        };
        this.width = 1000;
        this.height = 600;

        this.modules = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],
              
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction
              
                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],
              
                ['clean']                                         // remove formatting button
            ],
        };


    }
    componentDidMount() {
        if (this.props.selected != undefined) {
            let a = this.props.content;
            $("#contentName").val(a.content_name);
            this.setState({descInput: a.content_description, codeInput: a.content_code})
           // this.setState({})
        }
    }
    drawItems() {
        return (
            <Container>
                <Row>
                    <Col xs={4}><Form.Label htmlFor="contentName" style={{ fontFamily: "Jost", fontSize: "16px" }}>Content Name:</Form.Label></Col>
                    <Col xs={8}><Form.Control id="contentName" placeholder="Name of folder!"></Form.Control></Col>
                </Row>

                <Row>
                    <Col><Form.Label htmlFor="contentCode" style={{ fontFamily: "Jost", fontSize: "24px" }}>Source Code</Form.Label></Col>
                </Row>
                <Row>
                    <Col>
                        <ReactQuill id="contentCode"
                            theme="snow"
                            modules={this.modules}
             
                            value={this.state.codeInput}
                            onChange={(e) => { this.setState({ codeInput: e }); }}
                            />
                    </Col>
                </Row>
                <Row>
                    <Col><Form.Label htmlFor="contentDescription" style={{ fontFamily: "Jost", fontSize: "24px" }}>Description:</Form.Label></Col>

                </Row>
                <Row>
                    <Col>
                        <ReactQuill id="contentDescription"
                            theme="snow"
                            modules={this.modules}
                          
                            value={this.state. descInput}
                            onChange={(e) => { this.setState({  descInput: e }); }}
                            />
                    </Col>
                </Row>
                <Button variant="primary" onClick={() => {
                    //Change content
                   this.props.submit(this.props.id, $("#contentName").val(),this.state.codeInput,this.state.descInput,"abc");
                }} type="submit">Submit</Button>
                <Button variant="danger" onClick={() => {
                    this.props.close();
                }}>X</Button>

            </Container>

        );
    }
}