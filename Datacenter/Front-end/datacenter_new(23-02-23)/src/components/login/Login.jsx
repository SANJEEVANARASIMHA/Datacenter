import React, { Component } from 'react'
import axios from 'axios';
import './login_style.css';
import { login_api } from '../urls/api';
import sample from './login_bg.mp4'

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export default class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            message: true,
            error: false,
        }
    }
    toggle = () => {
        var x = document.getElementById("password");
        if (x.type === "password") {
          x.type = "text";
        } else {
          x.type = "password";
        }
    }


    inputHandler = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }

    login = (event) => {
        event.preventDefault();
        if (this.state.username && this.state.password) {
            axios({
                method: "POST",
                url: login_api,
                data: { username: this.state.username, password: this.state.password },
            })
                .then((response) => {
                    sessionStorage.setItem("isLogged", "success")
                    this.props.parentCallback("success")
                })
                .catch((error) => {
                    console.log('error=====>', error);
                    if (error.response.status === 403) {
                        this.setState({ error: true, message: 'User session had timed out. Please login again.' });
                    } else if(error.response.status === 401) {
                        this.setState({ error: true, message: "Wrong Credentials!" });
                    }else{
                        this.setState({ error: true, message: "Bad Request!" });
                    }
                    sessionStorage.setItem("isLogged", "failed")
                    this.props.parentCallback("failed")
                });
        }
        else {
            this.setState({ error: true, message: 'Login Failed' });
        }
    }

    render() {
        const { error, message } = this.state;
        return (
            <>

                <div style={{ display: 'flex' }}>
                    <div className="backgroundImg">
                        <video className='videoTag' autoPlay loop muted>
                            <source src={sample} type='video/mp4' />
                        </video>
                    </div>
                    <div className='login_container'>
                        <div className='loginCard'>
                            <img src="/images/vlogo.png" alt="" className='logo' />
                            <div style={{
                                padding: '10%',
                                marginTop: '-13px'
                            }}>
                                <h1 style={{ textAlign: 'center', fontSize: '25px' }}>LOGIN</h1>
                                <form>
                                    {
                                        error && (
                                            <div className='errorMsg'>{message}</div>
                                        )
                                    }
                                    <div>
                                        <input
                                            type="text" name="username"
                                            placeholder="Username"
                                            required="required"
                                            className='textinput'
                                            onChange={this.inputHandler} />
                                    </div>
                                    <div>
                                        <input type="password" id="password"
                                            name="password" placeholder="Password"
                                            required="required" autoComplete="off"
                                            className='textinput'
                                            onChange={this.inputHandler} />
                                    </div>
                                    <div className="input-group">
                                    <input
                                      type="checkbox"
                                      title="Show password"
                                      onClick={this.toggle}
                                    />
                                    <span style={{ fontSize: "15px", color: "gray" }}>
                                      Show Password
                                    </span>
                                  </div>
                                    <div className="buttons" style={{ textAlign: "center",marginTop:'12px' }}>
                                        <button
                                            onClick={this.login}
                                            className="btn-hover btn-color">Login</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </>
        )
    }
}
