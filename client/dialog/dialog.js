//React
import React, { Component } from 'react';

import './dialog.css';

export class Dialog extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.width = 200;
        this.height = 200;
    }

    componentDidMount() {

    }
    //Should be overriden.
    drawItems() {
        return (<div></div>);
    }
    render() {
        //Dialog will black color the entire editor (not fully but 75%)
        return (
            <div style={{ position: "absolute", top: "0px", left: "0px", width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.75)", zIndex: 3, overflow: "auto" }}>
                <div style={{ backgroundColor: "bisque", border: "3px solid yellowgreen", width:  this.width + "px" , height:  this.height + "px" ,
                    maxWidth: "100vh", maxHeight: "100vh", overflow: "auto", position: "fixed", top: "50%", left: "50%",  transform: "translate(-50%, -50%)"}}>
                    {this.drawItems()}
                </div>
            </div >
        );
    }
}