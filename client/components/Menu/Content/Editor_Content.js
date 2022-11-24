import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as PostgreSql from '../../shared/api-request';
import { Dialog_ContentEditor } from '../../../dialog/dialog_contentEditor';
import $ from 'jquery';
import * as cheerio from 'cheerio';

export class Editor_Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editted: -1,
            dialog: undefined
        };
        this.closeDialog = this.closeDialog.bind(this);
        this.submitDialog = this.submitDialog.bind(this);
    }
    componentDidMount() {
        this.props.getContent();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {

    }
    render() {

        return (
            <div >
                {/*Only draw if we have a snippet available */}
                {this.props.snippet && <div style={{ position: "absolute", top: "64px", left: "556px", width: "1000px", height: "calc(100vh - 144px)" }}>
                    <Button variant="primary"
                        onClick={() => {

                            this.newContent();
                        }}
                    >New Content</Button>
                    <div style={{
                        overflow: "auto", height: "calc(100vh - 176px)", backgroundColor: "#" + this.props.snippet.snippet_color.data[0].toString(16).padStart(2, "0") +
                            this.props.snippet.snippet_color.data[1].toString(16).padStart(2, "0") +
                            this.props.snippet.snippet_color.data[2].toString(16).padStart(2, "0"), border: "1px solid black"
                    }}>
                        <div style={{ fontFamily: "Righteous", fontSize: "36px" }}>{this.props.snippet.snippet_name}</div>
                        <div id="contentDescription" style={{ fontFamily: "Quicksand", fontSize: "12px" }} dangerouslySetInnerHTML={{ __html: this.props.snippet.snippet_description }}></div>
                        {this.props.snippet.tag && this.props.snippet.tag.map((c, index) => {
                            return <span key={"tagList" + index} style={{
                                backgroundColor: "white", border: "1px solid black",
                                backgroundColor: "#" + this.props.tagList[index].tag_color.data[0].toString(16).padStart(2, "0") +
                                    this.props.tagList[index].tag_color.data[1].toString(16).padStart(2, "0") +
                                    this.props.tagList[index].tag_color.data[2].toString(16).padStart(2, "0")
                            }}>{c}</span>
                        })}
                        {this.props.list.length > 0 && this.props.list.map((c, index) => {
                            return (<Container key={"content" + index} style={{ border: "1px solid black", marginBottom: "32px" }}>
                                <Button variant="success" onClick={() => {
                                    this.setState({
                                        editted: index,
                                        dialog: <Dialog_ContentEditor selected={index}
                                            id={c.content_id}
                                            content={c}
                                            close={this.closeDialog}
                                            submit={this.submitDialog}></Dialog_ContentEditor>
                                    })
                                }}><span className="material-symbols-outlined">Create</span></Button>

                                <Button variant="primary" onClick={() => {
                                    let str = document.getElementById("code" + index).innerText;
                                    navigator.clipboard.writeText(str);
                                }}>
                                    <span className="material-symbols-outlined">Assignment</span>
                                </Button>
                                <Button style={{ position: "relative", left: "85%" }} variant="danger" onClick={() => {
                                    if (confirm("Are you sure you want to delete the content?")) {
                                        this.setState({
                                            editted: -1,
                                        })
                                        this.deleteContent(c.content_id);
                                    }
                                }}>
                                    <span className="material-symbols-outlined">Delete</span>
                                </Button>
                                {/*A content name */}
                                <Row>
                                    <Col>
                                        <Form.Label htmlFor="folderName" style={{ fontFamily: "Jost", fontSize: "32px" }}>{c.content_name}</Form.Label>
                                    </Col>
                                </Row>
                                <Form.Check type="switch" id={"parameters" + index} label="Apply Parameters" />
                                {/*A descripion that explains a source code */}
                                <Row style={{ maxHeight: "25vh", overflow: "auto", border: "1px solid black" }}>
                                    <Col>
                                        <Form.Label id={"code" + index} dangerouslySetInnerHTML={{ __html: $("#parameters" + index).is(":checked") ? this.replaceTextWithParameters(c.content_code, this.props.snippet, index) : c.content_code }}></Form.Label>
                                    </Col>
                                </Row>
                                {/*A descripion that explains a content */}
                                <Row style={{ maxHeight: "25vh", overflow: "auto" }}>
                                    <Col>
                                        <Form.Label id={"description" + index} dangerouslySetInnerHTML={{ __html: c.content_description }}></Form.Label>
                                    </Col>
                                </Row>
                            </Container>);
                        })}
                    </div>
                </div >}
                {this.state.dialog != undefined && <div style={{ position: "absolute", top: "0px", left: "0px", width: "100%", height: "100%" }}>{this.state.dialog} </div>}
            </div>);
    }

    newContent() {
        let current = new Date();
        let content_id = (current.getMonth() + 1).toString().padStart(2, '0')
            + current.getDate().toString().padStart(2, '0')
            + current.getFullYear()
            + current.getHours().toString().padStart(2, '0')
            + current.getMinutes().toString().padStart(2, '0')
            + current.getSeconds().toString().padStart(2, '0')
            + current.getMilliseconds().toString().padStart(4, '0');

        PostgreSql.createContent(content_id)

            .then((data) => {
                return PostgreSql.linkContentToSnippet(this.props.snippet.snippet_id, content_id);
            }).then((data) => {
                return this.props.getContent();
            })

    }
    submitDialog(content_id, content_name, content_code, content_description, code_to_copy) {
        PostgreSql.updateContent(content_id, content_name, content_code, content_description, code_to_copy)
            .then((data) => {
                return this.props.getContent();
            })
        this.setState({
            dialog: undefined
        });

    }
    closeDialog() {
        this.setState({
            dialog: undefined
        })
    }
    deleteContent(id) {
        return PostgreSql.deleteContent(id)
            .then((c) => {
                return PostgreSql.removeContentFromSnippet(id, this.props.snippet.snippet_id);
            })
            .then((c) => {
                return this.props.getContent();
            })
    }

    replaceTextWithParameters(code, content, index) {
        let original = this;
        const $ = cheerio.load(code, null, false);

        $("*").contents().map(function () {
            if (this.type === "text") {
                //We need to instantiate a old data to prevent chain parameter replacements.
                //Such param1 -> 0 for (1) and 0 -> 23 for (2). Due to transitive property, param1 -> 23 because (1 + 2)

                //Create our one regex that matches each before word in parameters
                let matched = [];
                for (let k = 0; k < content.parameters.length; k++) {
                    matched.push("(" +
                        content.parameters[k].before
                            .replace("$", "\\$")
                            .replace("#", "\\#")
                            .replace("!", "\\!")
                            .replace("?", "\\?")
                        + "\\b)");
                }
                let n_regex = new RegExp(matched.join("|"), "g");

                //Translate our parameter array into a map for use with replace
                let obj = content.parameters.reduce((c, obj, index) => {
                    c[obj.before] = { default: obj.after, input: original.props.paramAfter[index] };
                    return c;
                }, {});
                //The replace function utilizes a function that handles words that are being modified and we get to replace it with a value of our own. That
                //is what our map object we crafted from previous line was for!
                this.data = this.data.replace(n_regex, function (matched) {
                    if (obj[matched] != undefined)
                        return obj[matched].input == '' ? obj[matched].default : obj[matched].input;
                    else
                        return "";
                });

                /*for (let k = 0; k < content.parameters.length; k++) {
                    let n_regex = new RegExp("\\b" + content.parameters[k].before + "\\b", "g");
                    this.data = this.data.replace(n_regex, (original.props.paramAfter[k] == "" || original.props.paramAfter[k] == undefined) ? content.parameters[k].after : original.props.paramAfter[k]);
                }*/
            }
        })
        return $.html();

    }

}