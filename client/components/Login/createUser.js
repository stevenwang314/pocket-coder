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

export class CreateUser extends Component {
    constructor(props) {
        super(props);
        this.state = {}

        //Bind me
        this.signUp = this.signUp.bind(this);
    }

    signUp() {
        let userName = $("#username").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let passwordRepeat = $("#password-repeat").val();
        if (userName == "") {
            this.setState({ message: "Enter a username" });
        }
        else if (email == "") {
            this.setState({ message: "Enter a email" });
        }
        else if (email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) == null) {
            this.setState({ message: "Enter a email that is valid such as example@email.net" });
        }
        else if (password == "") {
            this.setState({ message: "Enter a password" });
        }
        else if (passwordRepeat == "") {
            this.setState({ message: "Enter the same password as previous.." });
        }
        else if (password != passwordRepeat) {
            this.setState({ message: "Password entered must match the same as the repeated password." });
        }
        else if (password == passwordRepeat) {
           
           PostgreSql.signUp(userName,email,password)
                .then(c=> {
                    if (c.success === false) { 
                        this.setState({ message: c.message });
                    } else {
                        this.props.setUser(c.username, c.id);
       
                    }
                });
        }
    }

    render() {
        return (<div id="login-frame">
            <div style={{ fontFamily: "Roboto", fontSize: "64px", color: "orange" }}>Pocket Coder</div>
            <div style={{ fontFamily: "Quicksand", fontSize: "20px" }}>All your snippets, in one pile for your Copy and Paste needs!</div>
            <div style={{ fontFamily: "Quicksand", fontSize: "28px" }}>Sign up to get started!</div>
            <div className="two-grid">
                <label htmlFor="username" style={{ fontFamily: "Quicksand", fontSize: "18px" }}>Username</label>
                <input id="username" placeholder="tell me about yourself"></input>
                <label htmlFor="email" style={{ fontFamily: "Quicksand", fontSize: "18px" }}>Email</label>
                <input id="email" type="email" placeholder="example@email.com"></input>
                <label htmlFor="password" style={{ fontFamily: "Quicksand", fontSize: "18px" }}>Password</label>
                <input id="password" type="password" placeholder="Password"></input>
                <label htmlFor="password-repeat" style={{ fontFamily: "Quicksand", fontSize: "18px" }}>Confirm Password</label>
                <input id="password-repeat" type="password" placeholder="Repeat the password"></input>
            </div>
            <div style={{ width: "100%" }}>
                <span style={{ fontFamily: "Quicksand", fontSize: "16px" }}>Already have an account?
                    <span onClick={() => {  this.props.setMenu(constants.MODE_LOGIN); }} style={{ color: "blue", fontWeight: "bold" }}> Login!</span>
                </span>
                <button className="btn btn-primary" style={{ position: "absolute", right: "0px", width: "96px" }} onClick={() => this.signUp()} >Sign up!</button>
            </div>
            {this.state.message != undefined && <div style={{ color: "red" }}>{this.state.message}</div>}
        </div>);
    }
}
