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
import Stack from 'react-bootstrap/Stack';
import $ from 'jquery';
import * as PostgreSql from '../components/shared/api-request';
import ReactQuill, { Quill } from 'react-quill';

//We want to test this inherited dialog.
export class Dialog_Parameters extends Dialog {
    constructor(props) {
        super(props);
        this.state = {
            paramsList: []
        };
        this.width = 600;
        this.height = 400;
    }
    componentDidMount() {
        if (this.props.param)
            this.setState({ paramsList: this.props.param });
    }
    drawItems() {
        return (
            <Container >
                <Row>
                    <div>Parameter Editor</div>
                </Row>
                <Stack direction="horizontal">
                    <Button variant="success" onClick={() => {
                        this.setState({
                            paramsList: [...this.state.paramsList, { name: "Steven", before: "0", after: "0", description: "" }]
                        });
                    }} type="submit">Add</Button>
                    <Button variant="primary"
                        onClick={() => {
                            this.props.submit(this.props.id, this.state.paramsList);
                            this.props.close(false);
                        }}
                        type="submit">
                        Submit
                    </Button>
                    <Button variant="danger"
                        onClick={() => {
                            this.props.close(false);
                        }}
                    >X</Button>
                </Stack >
                <div style={{ overflow: "auto", height: "300px" }}>
                    {this.state.paramsList.map((param, index) => {
                        return (
                            <div key={"param" + index} style={{ border: "1px solid black", marginBottom: "16px" }}>
                                <Stack direction="horizontal">
                                    <Form.Control id="paramName" style={{ fontFamily: "Jost", fontSize: "18px" }} value={param.name} placeholder="Name of parameter"
                                        onChange={(e) => {
                                            this.state.paramsList[index].name = e.target.value;
                                            this.setState({ paramsList: this.state.paramsList });
                                        }}
                                    >
                                    </Form.Control>
                                    <Form.Control id="paramName" style={{ fontFamily: "Jost", fontSize: "18px", width: "96px" }} value={param.before} placeholder="before"
                                        onChange={(e) => {
                                             this.state.paramsList[index].before = e.target.value;
                                             this.setState({ paramsList: this.state.paramsList });
                                        }}
                                    >
                                    </Form.Control>
                                    <Form.Label>To</Form.Label>
                                    <Form.Control id="paramName" style={{ fontFamily: "Jost", fontSize: "18px", width: "96px"  }} value={param.after} placeholder="after"
                                        onChange={(e) => {
                                             this.state.paramsList[index].after = e.target.value;
                                             this.setState({ paramsList: this.state.paramsList });
                                        }}
                                    >
                                    </Form.Control>
                                    <Button variant="danger"
                                        onClick={(e) => {
                                            this.setState({ paramsList: this.state.paramsList.filter((c, del_index) => { return del_index != index }) });
                                        }}>X</Button>
                                </Stack>
                                <details>
                                    <summary>Description (optional)</summary>
                                    <Form.Control id="contentName" placeholder="Parameter description" as="textarea" value={param.description}
                                        onChange={(e) => {
                                            this.state.paramsList[index].description = e.target.value;
                                            this.setState({ paramsList: this.state.paramsList });
                                        }}>

                                    </Form.Control>

                                </details>
                            </div>
                        );
                    })}
                </div>
            </Container >
        );
    }
}