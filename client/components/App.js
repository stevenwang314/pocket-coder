import React, { Component } from 'react';

import { Login } from './Login/Login';
import { CreateUser } from './Login/createUser';
import { Menu } from './Menu/Menu';
import * as Constants from './shared/constants';

import {Quill } from 'react-quill';
var Block = Quill.import('blots/block');
//===================================================================================================
//Main Code
//===================================================================================================

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentMode: Constants.MODE_LOGIN,
            currentUser: "",
            currentUserId: -1,
        }

        //Bind function to always reference to main instead of itself
        this.setCurrentMode = this.setCurrentMode.bind(this);
        this.setUser = this.setUser.bind(this);
        
        //Quill configuration.
        Block.tagName = 'DIV';
        Quill.register(Block, true);
    }
    render() {
        //Return a jsx code
        switch (this.state.currentMode) {
            case Constants.MODE_LOGIN:
                return (<Login setMenu={this.setCurrentMode} setUser={this.setUser}></Login>);
                case Constants.MODE_CREATE_USER:
                return (<CreateUser setMenu={this.setCurrentMode} setUser={this.setUser}></CreateUser>);
            case Constants.MODE_MENU:
                return (<Menu setMenu={this.setCurrentMode} user={this.state.currentUser} userId={this.state.currentUserId}></Menu>);
        }

    }
    //Change modes which affects which main component to render.
    setCurrentMode(menu) {
        this.setState({ currentMode: menu });
    }
    setUser(user, id) {
        this.setState({currentUser : user, currentUserId: id}, ()=> {
            this.setCurrentMode(Constants.MODE_MENU);
        });
    }
}

//Export our App to other files!
export default App;