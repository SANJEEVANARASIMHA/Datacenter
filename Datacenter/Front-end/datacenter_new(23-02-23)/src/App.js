import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login.jsx'
import Home from './components/Pages/Home';
import Leftsidebar from './components/sidebar/Leftsidebar';
import Configuration from './components/Pages/Configuration';
import Health from './components/Pages/Health';
import Alerts from './components/Pages/Alerts';
import Tracking from './components/Pages/Tracking';
import RackDetail from './components/Pages/RackDetail';

import CardTempDetail from './components/Pages/CardTempDetail';
import CardHumiDetail from './components/Pages/CardHumiDetail';
import CardEnergyDetail from './components/Pages/CardEnergyDetail';
import AssetDetail from "./components/Pages/AssetDetail";
import RackTracking from './components/Pages/RackTracking';
import Tools from './components/Pages/Tools';
import RackLocationTracking from "./components/Pages/RackLocationTracking"; 

class App extends Component {
  constructor() {
    super();
    this.state = {
      isLogged: false,
      message: '',
      status: 'failed',
      alertval:0
    }
  }

  handleUserLogin = (childData) => {
    let storing = sessionStorage.getItem('isLogged');
    this.setState({ status: storing })
  }

handleCallback=(aldata)=>{
  console.log(aldata)
  this.setState({alertval:aldata})
}
  

  componentDidMount() {
    const storing = sessionStorage.getItem('isLogged')
    this.setState({ status: storing });

    // document.onkeydown = function (e) {
    //   if (e.keyCode == 123) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'C'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'X'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'Y'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'Z'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'V'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.keyCode == 67 && e.shiftKey && (e.ctrlKey || e.metaKey)) {
    //     return false;
    //   }
    //   if (e.keyCode == 'J'.charCodeAt(0) && e.altKey && (e.ctrlKey || e.metaKey)) {
    //     return false;
    //   }
    //   if (e.keyCode == 'I'.charCodeAt(0) && e.altKey && (e.ctrlKey || e.metaKey)) {
    //     return false;
    //   }
    //   if ((e.keyCode == 'V'.charCodeAt(0) && e.metaKey) || (e.metaKey && e.altKey)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'H'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'A'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'F'.charCodeAt(0)) {
    //     return false;
    //   }
    //   if (e.ctrlKey && e.keyCode == 'E'.charCodeAt(0)) {
    //     return false;
    //   }
    // }
    // if (document.addEventListener) {
    //   document.addEventListener('contextmenu', function (e) {
    //     e.preventDefault();
    //   }, false);
    // } else {
    //   document.attachEvent('oncontextmenu', function () {
    //     window.event.returnValue = false;
    //   });
    // }
  }
  render() {
    const { status } = this.state;
    if (status === "failed" || status === null) {
      return (
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route exact path="/login" element={<Login parentCallback={this.handleUserLogin} />} />
          </Routes>
        </Router>
      )
    } else {
      return (
        <Router>
          <Leftsidebar parentCallback={this.handleCallback} />
          <Routes>
            <Route path="/login" element={<Navigate to="/home" />} />
            <Route exact path="/home" element={<Home />} />
            <Route exact path="/config" element={<Configuration />} />
            <Route exact path="/health" element={<Health />} />
            <Route exact path="/alerts" element={<Alerts />} />
            <Route exact path="/realtime" element={<Tracking />} />
            <Route exact path="/reackdetails" element={<RackDetail />} />
            <Route exact path="/cardtempdet" element={<CardTempDetail />} />
            <Route exact path="/cardhumidet" element={<CardHumiDetail />} />
            <Route exact path="/cardenergydet" element={<CardEnergyDetail />} />
            <Route exact path="/assetdetail" element={<AssetDetail />} />
            <Route exact path="/tools" element={<Tools />} />
            <Route exact path="/racktracking" element={<RackTracking />} />
            <Route exact path="/racklocationtracking" element={<RackLocationTracking />} />
          </Routes>
        </Router>
      )
    }
  }
}

export default App;
