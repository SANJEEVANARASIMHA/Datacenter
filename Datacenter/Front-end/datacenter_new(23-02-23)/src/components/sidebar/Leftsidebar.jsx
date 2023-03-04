import React, { Component } from 'react'
import './sidebar.css'
import { Link } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery'

const Background = { backgroundColor: "#00629B", color: 'black' };
var clickedID = null, alertCount = 0;
export function linkClicked(id) {
  clickedID = id
  let element = document.getElementsByClassName("sidebarmenu");
  element[0].style.backgroundColor = "";
  element[0].firstChild.style.color = "";
  element[1].style.backgroundColor = "";
  element[1].firstChild.style.color = "";
  element[2].style.backgroundColor = "";
  element[2].firstChild.style.color = "";
  element[3].style.backgroundColor = "";
  element[3].firstChild.style.color = "";
  element[4].style.backgroundColor = "";
  element[4].firstChild.style.color = "";
  element[5].style.backgroundColor = "";
  element[5].firstChild.style.color = "";
  element[6].style.backgroundColor = "";
  element[6].firstChild.style.color = "";

  if (alertCount === 0) {
    element[id].style.backgroundColor = "#00629B";
    element[id].firstChild.style.color = "white";
  } else if (alertCount !== 0 && clickedID !== 3) {
    element[id].style.backgroundColor = "#00629B";
    element[id].firstChild.style.color = "white";
    alertAnime();
  } else if (alertCount !== 0 && clickedID === 3) {
    alertAnime();
  }
}

export const alertAnime = () => {
  $("#alert").css("background-color", '#e74c3c')
  $('#alert').css('animation-name', 'blink');
  $("#alert_icon").css("color", 'white')
  $("#alert").css("animation-iteration-count", "infinite");
}

export default class Leftsidebar extends Component {
  componentDidMount() {
    linkClicked(0);
    var valdata = sessionStorage.setItem("cardvals", "0")
    valdata = sessionStorage.getItem("cardvals");
    this.vals = JSON.parse(valdata)
    this.alertData();
    this.interval = setInterval(() => {
      var valdata = sessionStorage.getItem("cardvals");
      this.vals = JSON.parse(valdata)
      this.alertData();
    }, 3 * 1000);
  }

  alertData = () => {
    axios({ method: 'GET', url: '/api/systemstatus?id=' + this.vals })
      .then((response) => {
        let data = response.data;
        console.log("ALERT COUNT=======>", response);
        let alertcount = data.alert_count;
        if (alertcount !== 0) {
          alertCount = alertcount;
          alertAnime()
        }
        else {
          alertCount = 0;
          $("#alert").css("animation-iteration-count", "0");
          linkClicked(clickedID);
        }
      })
      .catch((error) => {
        console.log("system status error----->", error)
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        }
      })
  }

  logout = () => {
    sessionStorage.removeItem('isLogged')
    sessionStorage.removeItem('cardvals')
    window.location.pathname = '/login'
  }

  homeRedirect = () => {
    window.location.pathname = '/home'
  }

  render() {
    return (
      <div>
        <div className='sidebar'>
          <img src="/images/vacuslogo.png" alt="" style={{ width: '45px', marginTop: '15px', cursor: 'pointer' }} onClick={this.homeRedirect} />

          <Link to='/home'>
            <div className='sidebarmenu' title="Home" style={Background}
              onClick={() => linkClicked(0)}
            >
              <i style={{ fontSize: '20px', color: '#000', paddingTop: '9px' }} className="fas fa-home-alt"></i>
            </div>
          </Link>

          <Link to='/config'>
            <div className='sidebarmenu' title="Configuration" onClick={() => linkClicked(1)} style={Background}>
              <i style={{ fontSize: '20px', color: '#000', paddingTop: '9px' }} className="fas fa-cog" id='icon'></i>
            </div>
          </Link>

          <Link to='/realtime'>
            <div className='sidebarmenu' title="Real-Time Tracking" onClick={() => linkClicked(2)} style={Background}>
              <i style={{ fontSize: '20px', color: '#000', paddingTop: '9px' }} className="fas fa-map-marker-alt" id='icon'></i>
            </div>
          </Link>

          <Link to='/alerts'>
            <div className='sidebarmenu'
              id='alert' title="Alerts" onClick={() => linkClicked(3)} style={Background}>
              <i id='alert_icon' style={{ fontSize: '20px', color: '#000', paddingTop: '8px', paddingLeft: '5px', transform: 'rotate(30deg)' }} className="fas fa-bell"></i>
            </div>
          </Link>

          <Link to='/reackdetails'>
            <div className='sidebarmenu' title="Details" onClick={() => linkClicked(4)} style={Background}>
              <i style={{ fontSize: '20px', color: '#000', paddingTop: '9px' }} className="fas fa-server"></i>
            </div>
          </Link>

          <Link to='/tools'>
            <div className='sidebarmenu' title="Tools" onClick={() => linkClicked(5)} style={Background}>
              <i style={{ fontSize: '20px', color: '#000', paddingTop: '9px' }} className="fas fa-tools"></i>
            </div>
          </Link>

          <Link to='/health'>
            <div className='sidebarmenu' title="System Health" onClick={() => linkClicked(6)} style={Background}>
              <i style={{ fontSize: '20px', color: '#000', paddingTop: '10px' }} className="fas fa-heartbeat" id='icon'></i>
            </div>
          </Link>

          <div className='sidebarmenu' style={{ marginTop: '65px' }} title="Logout" onClick={this.logout}>
            <i style={{ fontSize: '20px', color: '#FF5454', paddingTop: '9px', marginLeft: '-3px', transform: 'rotate(180deg)', marginTop: '8px' }} className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    )
  }
}
