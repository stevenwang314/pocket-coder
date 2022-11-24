import './dialog.css';
import { Dialog } from './dialog';

//React
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import $ from 'jquery'

//We want to test this inherited dialog.
export class Dialog_Tag extends Dialog {
    constructor(props) {
        super(props);
        this.state = {};
        this.width = 500;
        this.height = 350;
    }
    componentDidMount() {
        if (this.props.selected != undefined) {
            $("#tagName").val(this.props.selected.tag_name);
            $("#tagColor").val("#" + this.props.selected.tag_color.data[0].toString(16).padStart(2, '0')
                + this.props.selected.tag_color.data[1].toString(16).padStart(2, '0')
                + this.props.selected.tag_color.data[2].toString(16).padStart(2, '0'));
           
        }
    }
    drawItems() {
        return (<Container>
            <Row>
                <Col xs={3}><Form.Label htmlFor="tagName" style={{ fontFamily: "Jost", fontSize: "16px" }}>Tag Name:</Form.Label></Col>
                <Col xs={9}><Form.Control id="tagName" placeholder="Name of Tag!"></Form.Control></Col>
            </Row>
            <Row>
                <Col xs={3}><Form.Label htmlFor="tagColor" style={{ fontFamily: "Jost", fontSize: "16px" }}>Tag color:</Form.Label></Col>
                <Col xs={9}><Form.Control id="tagColor" type="color" style={{ width: "100%" }} defaultValue="#FFFFFF"></Form.Control></Col>
            </Row>
            <Button variant="primary" onClick={() => {
                if ($("#tagName") != "") {
                    this.submit(true);
                }
            }} type="submit">Submit</Button>
            <Button variant="danger" onClick={() => { 
                this.submit(false);
            }}>X</Button>
        </Container>)
    }
    submit(shouldSubmit) {
        let current = new Date();
        let tag_id = (current.getMonth() + 1).toString().padStart(2, '0')
            + current.getDate().toString().padStart(2, '0')
            + current.getFullYear()
            + current.getHours().toString().padStart(2, '0')
            + current.getMinutes().toString().padStart(2, '0')
            + current.getSeconds().toString().padStart(2, '0')
            + current.getMilliseconds().toString().padStart(4, '0');
        let data = {
            tagId: this.props.selected != undefined ? this.props.selected.tag_id : tag_id,
            tagName: $("#tagName").val(),
            tagColor: $("#tagColor").val(),
        }
        this.props.submit(data, shouldSubmit);
    }
}