import './dialog.css';
import "react-widgets/styles.css";
import 'react-quill/dist/quill.snow.css';

import { Dialog } from './dialog';

//React
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Combobox from "react-widgets/Combobox";
import * as PostgreSql from '../components/shared/api-request';
import ReactQuill from 'react-quill';

import $ from 'jquery'

export class Dialog_SnippetProperty extends Dialog {
    constructor(props) {
        super(props);
        this.state = {
            tagList: this.props.selected != undefined ? (this.props.selected.tag != null ? this.props.selected.tag : []) : [],
            tagInput: "",
            groupTagList: this.props.list_tag(),
            descriptionInput: this.props.selected != undefined ? this.props.selected.snippet_description : ""
        };
        this.width = 600;
        this.height = 500;

        this.modules = {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ],
        };

        this.formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ];
    }

    componentDidMount() {
        this.props.getTag();
        if (this.props.selected != undefined) {
            $("#snippetName").val(this.props.selected.snippet_name)
            //  $("#snippetDescription").val(this.props.selected.snippet_description)
            $("#snippetColor").val("#" + this.props.selected.snippet_color.data[0].toString(16).padStart(2, '0') +
                this.props.selected.snippet_color.data[1].toString(16).padStart(2, '0') +
                this.props.selected.snippet_color.data[2].toString(16).padStart(2, '0'));
            $("#publicSnippet").prop('checked', this.props.selected.is_public);
            $("#edittableSnippet").prop('checked', this.props.selected.is_edittable);

            $("#publicSnippet").prop('disabled', this.props.userId !== this.props.selected.user_id);
            $("#edittableSnippet").prop('disabled',this.props.userId !== this.props.selected.user_id);
        }
    }

    drawItems() {
        return (
            <Container>
                <Row>
                    <Col xs={3}><Form.Label htmlFor="snippetName" style={{ fontFamily: "Jost", fontSize: "16px" }}>Name:</Form.Label></Col>
                    <Col xs={9}><Form.Control id="snippetName" placeholder="Name of snippet!"></Form.Control></Col>
                </Row>
                {/*Contains all tags listed here */}
                <Row>
                    <Col xs={1}><Form.Label htmlFor="snippetTag" style={{ fontFamily: "Jost", fontSize: "16px" }}>Tag:</Form.Label></Col>
                    <Col xs={11} style={{ overflow: "auto" }}>{
                    this.state.tagList.map((c, index) => { 
                        return <span key={"tagList" + index} style={{ backgroundColor: "white", border: "1px solid black" }} 
                            onClick={(event)=> {
                                this.deleteTag(index);
                            }

                            }>{c}</span> 
                    }
                    )}</Col>

                </Row>
                <Row>
                    <Col xs={6}> <Combobox value={this.state.tagInput} onChange={(e) => {
                        this.setState({ tagInput: e });
                    }} hideEmptyPopup data={this.state.groupTagList != null ? this.state.groupTagList.map(c => { return c.tag_name }) : []} placeholder="Search for a tag" /></Col>
                    <Col xs={6}> <Button variant="success"
                        onClick={() => {
                            this.createNewTag(this.state.tagInput);
                            this.setState({ tagInput: "" });
                        }}
                        type="submit" >New tag</Button></Col>
                </Row>
                <Row>
                    <Col xs={3}><Form.Label htmlFor="snippetColor" style={{ fontFamily: "Jost", fontSize: "16px" }}>Color:</Form.Label></Col>
                    <Col xs={9}><Form.Control id="snippetColor" type="color" style={{ width: "100%" }} defaultValue="#FFFFFF"></Form.Control></Col>
                </Row>
                <Row>
                    <Col> <Form.Label htmlFor="snippetColor" style={{ fontFamily: "Jost", fontSize: "16px" }}>Description:</Form.Label></Col>
                </Row>
                <Row>
                    <Col >
                        <ReactQuill id="snippetDescription"
                            style={{ fontFamily: "Jost", fontSize: "16px" }}
                            defaultValue={this.state.descriptionInput}
                            placeholder="Enter a description here!" theme="snow"
                            value={this.state.descriptionInput}
                            onChange={(e) => { this.setState({ descriptionInput: e }); }}
                            modules={this.modules}
                            formats={this.formats}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col><Form.Check id="publicSnippet" label="Public" /></Col>
                    <Col><Form.Check id="edittableSnippet" label="Edittable" /></Col>
                </Row>
                <Button variant="primary"
                    onClick={() => { if ($("#snippetName").val() != "") this.submit(true) }}
                    type="submit">Submit</Button>
                <Button variant="danger"
                    onClick={() => { this.submit(false) }}
                >X</Button>
            </Container>
        );
    }
    deleteTag(_index) {
        this.setState({
            tagList : this.state.tagList.filter((c,index)=> { return index != _index })
        })
    }
    createTag(tag_id, tag_name, tag_color) {
        return PostgreSql.createTag(tag_id, tag_name, tag_color.replace('#', '\\x'))
            .then(data => {
                return this.props.getTag();
            })
            .then(data => {
                this.setState({
                    groupTagList: this.props.list_tag()
                })
            })
    }
    createNewTag(text) {
        let a = this.props.list_tag().find(c => c.tag_name === text);
        if (a == undefined) {
            let current = new Date();
            let tag_id = (current.getMonth() + 1).toString().padStart(2, '0')
                + current.getDate().toString().padStart(2, '0')
                + current.getFullYear()
                + current.getHours().toString().padStart(2, '0')
                + current.getMinutes().toString().padStart(2, '0')
                + current.getSeconds().toString().padStart(2, '0')
                + current.getMilliseconds().toString().padStart(4, '0');
            this.createTag(tag_id, text, "#FFFFFF");

        }
        this.setState({
            tagList: [...this.state.tagList, text],

        });
    }
    submit(shouldSubmit) {
        let current = new Date();
        let snippet_id = (current.getMonth() + 1).toString().padStart(2, '0')
            + current.getDate().toString().padStart(2, '0')
            + current.getFullYear()
            + current.getHours().toString().padStart(2, '0')
            + current.getMinutes().toString().padStart(2, '0')
            + current.getSeconds().toString().padStart(2, '0')
            + current.getMilliseconds().toString().padStart(4, '0');
        let data = {
            snippetName: $("#snippetName").val(),
            snippetDescription: this.state.descriptionInput,
            snippetColor: $("#snippetColor").val().replace('#', '\\x'),
            snippetId: this.props.selected != undefined ? this.props.selected.snippet_id : snippet_id,
            isPublic: $("#publicSnippet").is(":checked"),
            isEdittable: $("#edittableSnippet").is(":checked"),
            tag: this.state.tagList
        }
        this.props.submit(data, shouldSubmit);
    }
}