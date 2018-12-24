import React, { Component } from 'react';
import { connect } from 'react-redux'
import {userEndpoint} from './api';
import logo from './logo.svg';
import './App.css';


class App extends Component {
    constructor(props) {
        super(props)
    }

  componentDidMount() {
      this.props.fecth()
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
            <h1>Users</h1>
            <p>From {process.env.REACT_APP_API_URL}/users</p>
            <ul>
                {this.props.users.map(user => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </header>

      </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
        users: state.users.data,
        loading: state.users.loading
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fecth: () => {
            dispatch(userEndpoint.read())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
