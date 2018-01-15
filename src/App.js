import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import fire from "./firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "./actions/libraryActions";

import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import PropTypes from "prop-types";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clientId: "",
      adding: false,
      newSlug: "",
      newPrice: "",
      newActive: ""
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div className="App">
        {!this.props.library.authenticated ? <LoginForm /> : ""}
        {this.props.library.authenticated ? <Dashboard /> : ""}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    library: state.library
  };
}

function mapDispatchToProps(dispatch) {
  return {
    libraryActions: bindActionCreators(libraryActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
