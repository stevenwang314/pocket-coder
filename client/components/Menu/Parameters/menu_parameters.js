import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as PostgreSql from '../../shared/api-request';
import { Dialog_Parameters } from '../../../dialog/dialog_parameters';

export class Menu_Parameters extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditted: false,
           
        };
        this.toggleEditor = this.toggleEditor.bind(this);
        this.submitData = this.submitData.bind(this);
    }
    componentDidMount() {
       
    }
    submitData(snippet_id, params) {

        let a = params.map(c=> "\'" + JSON.stringify(c) + "\'").join(",");
        return PostgreSql.changeContentParameters(snippet_id, a)
            .then(c => {
                this.props.readSnippet(snippet_id)
            })
    }
    toggleEditor(edit) {
        this.setState({ isEditted: edit });
    }
    render() {
        return (
            <div>
                {this.props.snippet && <div style={{ left: "1556px", top: "64px", position: "absolute", backgroundColor: "grey" }} >
                    <span >Contents Parameters</span>
                    <Button variant="success"
                        onClick={c => {
                            this.toggleEditor(true);
                        }}>
                        <span className="material-symbols-outlined">edit</span>
                    </Button>
                    { this.props.snippet.parameters.map(
                        (c,index) => {
                            return (<Container key={"paramEdit" + index }>
                                <Row>
                                    <Col xs={2}><Form.Label  style={{ fontFamily: "Jost", fontSize: "14px" }}>{c.name}</Form.Label></Col>
                                    <Col xs={3}><Form.Label  style={{ fontFamily: "Jost", fontSize: "14px" }}>{c.before}</Form.Label></Col>
                                    <Col xs={1}><Form.Label  style={{ fontFamily: "Jost", fontSize: "14px" }}>to</Form.Label></Col>
                                    <Col xs={6}>

                                        <Form.Control id="contentName" placeholder={c.after}
                                            onChange={(e) => {
                                                this.props.changeParameters(index, e.target.value);
                                            }}
                                            value={this.props.parameters[index] ? this.props.parameters[index] : ""}>

                                        </Form.Control>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col><Form.Label style={{ fontFamily: "Jost", fontSize: "14px" }}>
                                        {c.description}
                                    </Form.Label></Col>
                                </Row>
                            </Container>);
                        }
                    )}
                    {/**/}
                </div>}
                {this.state.isEditted === true && <Dialog_Parameters
                    close={this.toggleEditor}
                    id={this.props.snippet.snippet_id}
                    param={this.props.snippet.parameters}
                    submit={this.submitData}
                >
                </Dialog_Parameters>}
            </div>
        );
    }

}