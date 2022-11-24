//React
import React, { Component } from 'react';
//React-bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
//Styles
import './login.css'
//Constants
import * as constants from '../shared/constants';

import $ from 'jquery'
import * as PostgreSql from '../shared/api-request';

const DEFAULT_ID = "";
const DEFAULT_PASS = "";

export class Login extends Component {
    constructor(props) {
        //In a react component, always call super function to get properties (props)
        super(props);
        //Our state variable
        this.state = {
            message: ""

        };
    }

    render() {
        return (
            <Form id="login-frame" style={{  userSelect: "none" }}>
                <Form.Label style={{ fontFamily: "Roboto", fontSize: "48px", color: "orange" }}>Pocket Coder</Form.Label>
                <div style={{ fontFamily: "Quicksand", fontSize: "20px" }}>All your snippets, in one pile for your Copy and Paste needs!</div>
                <div style={{ fontFamily: "Dosis", fontSize: "32px", color: "darksalmon" }}>Login to your account</div>
                <div className="two-grid">
                    {/*Email input*/}
                    <Form.Label htmlFor="email" style={{ fontFamily: "Jost", fontSize: "24px" }}>Email</Form.Label>
                    <Form.Control id="email" type="email" placeholder="Username" defaultValue={DEFAULT_ID}></Form.Control>
                    {/*Password input*/}
                    <Form.Label htmlFor="password" style={{ fontFamily: "Jost", fontSize: "24px" }}>Password</Form.Label>
                    <Form.Control id="password" type="password" placeholder="Password" defaultValue={DEFAULT_PASS}></Form.Control>
                    {/*Login*/}
                    <div></div>
                    <Button variant="primary" onClick={() => { this.login() }} > Login</Button>
                </div>
                <div style={{ width: "100%" }}>
                    <Form.Label style={{ fontFamily: "Quicksand", fontSize: "16px" }}>Don't have an account?
                        <Form.Label id="signUpLink" onClick={() => { this.props.setMenu(constants.MODE_CREATE_USER); }} >Sign up!
                        </Form.Label>
                    </Form.Label>

                    {this.state.message != undefined && <div style={{ color: "red" }}>{this.state.message}</div>}
                </div>

            </Form>
        );
    }

    login() {
        let emailInput = $("#email").val();
        let passInput = $("#password").val();
        if (emailInput == "") {
            this.setState({ message: "Fill out the email!" });
        }
        else if (emailInput.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) == null) {
            this.setState({ message: "Enter a email that is valid such as example@email.net" });
        }
        else if (passInput == "") {
            this.setState({ message: "Fill out the password!" });
        }
        else if (emailInput != "" && passInput != "") {
            PostgreSql.login(emailInput, passInput)
                .then(result => {
                    if (result.result === true) {
                        //Successful login
                        this.props.setUser(result.username, result.id);
               
                    } else {
                        this.setState({ message: "Invalid Email or password!" });
                    }
                })


        }
    }
}

export default Login;