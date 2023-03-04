import React, { Component } from 'react';
import $ from 'jquery'
import axios from 'axios';
import mqtt from "mqtt";
import { login_api_mqtt } from '../urls/api';
// import TableScrollbar from 'react-table-scrollbar';
import { SessionOut, DataLoading, TableDetails } from "./Common";

export default class Servermaintenance extends Component {
   constructor(props) {
      super(props);
      this.state = {
         message: "",
         error: false,
         success: false,
         assetTagId: "",
         tagid: "",
         message1: "",
         primID: "",
         statusOnOff: "",
      };
   }

   componentDidMount() {
      $(".pagination").hide();
      $("#rangeDropdown").hide();
   }

   search = () => {
      let jsonData = {
         name: $("#staffname").val(),
         inventory: $("#inventory").val(),
      };
      if (jsonData.name && jsonData.inventory) {
         axios({ method: 'POST', url: '/api/asset/server/maintenance', data: jsonData })
            .then((response) => {
               let data = response.data;
               console.log("Response Server====>", response)
               if (response.status === 200 || response.status === 201) {
                  $("#server_table tbody").empty();
                  $("#server_table thead").empty();
                  $(".pagination").hide();
                  $("#rangeDropdown").hide();
                  if (data.length !== 0) {
                     $("#server_table").show();
                     $("#server_table thead").append(
                        "<tr>" +
                        "<th>SNO</th>" +
                        "<th>RACK NAME</th>" +
                        "<th>ASSET ID</th>" +
                        "<th>U-LOCATION</th>" +
                        "<th>FLOOR NAME</th>" +
                        " <th>ACTION</th>" +
                        "</tr>"
                     );
                     for (let i = 0; i < data.length; i++) {
                        let currPos = "", status = '';
                        if (data[i].maintenanceStatus === 0) {
                           status = "<span style='padding: 2px 9px;' class='ghostbutton btnON ghostTxt' id='ghostbutton_" + data[i].id + "'>Completed</span>";
                        } else {
                           status = "<span style='padding: 2px 9px;' class='ghostbutton btnOFF ghostTxt' id='ghostbutton_" + data[i].id + "'>Under Maintenance</span>";
                        }
                        if (data[i].location === 0 || data[i].location === 100) {
                           currPos = "<span class='outOfRack'>Out Of Rack</span>"
                        } else {
                           currPos = data[i].location
                        }
                        $("#server_table tbody").append(
                           "<tr>" +
                           "<td>" + (i + 1) + "</td>" +
                           "<td>" + data[i].placedIn.name + "</td>" +
                           "<td>" + data[i].tagid + "</td>" +
                           "<td>" + currPos + "</td>" +
                           "<td>" + data[i].floor.name + "</td>" +
                           "<td>" + status + "</td> " +
                           "</tr>"
                        )
                        $("#ghostbutton_" + data[i].id).on("click", () => {
                           this.setState({
                              assetTagId: data[i].tagid,
                              primID: data[i].id,
                              statusOnOff: data[i].maintenanceStatus
                           })
                           this.authentication()
                        });
                     }
                     this.setState({ loading: false });
                     this.showMessage(false, false, false, "");
                  } else {
                     $("#server_table").hide();
                     this.setState({ loading: false });
                     this.showMessage(false, true, false, "No Server Maintenance Data Found");
                  }
               }
            })
            .catch((error) => {
               console.log("error====>", error)
               $("#server_table").hide();
               if (error.response.status === 400) {
                  this.showMessage(false, true, false, "Bad Request");
               }
               else if (error.response.status === 404) {
                  this.showMessage(false, true, false, "Server Maintenance Data Not Found");
               } else if (error.response.status === 406) {
                  this.showMessage(false, true, false, "Server Maintenance Data Not Found");
               }
               else if (error.response.status === 403) {
                  $("#displayModal").css("display", "block");
               }
               this.setState({ loading: false })
            })
      } else {
         this.showMessage(true, true, false, "Required All The Fields");
      }
   }

   authentication = () => {
      this.setState({ error: false, message1: '', });
      $('.textinput').val('')
      $('.modal_ghost').show();
      window.scrollTo(0, 500)
      $('.authenticate').css('display', 'block');
   }

   inputHandler = (event) => {
      this.setState({ [event.target.name]: event.target.value })
   }

   authenticate = (e) => {
      e.preventDefault();
      let uname = $("#username").val();
      let pwd = $("#password").val();
      const { statusOnOff, primID } = this.state;
      if (uname && pwd) {
         this.setState({ loading: true });
         $('.modal_ghost').hide();
         axios({
            method: "POST",
            url: login_api_mqtt,
            data: { username: uname, password: pwd },
         })
            .then((response) => {
               if (response.status === 200 || response.status === 201) {
                  this.mqttGhost(this, primID, statusOnOff);
               }
               else {
                  this.setState({ error: true, loading: false, message1: "Request Failed!" });
               }
            })
            .catch((error) => {
               $('.modal_ghost').show();
               this.setState({ error: true, loading: false, message1: "Invalid Credentials!" });
               $('.textinput').val('');
               if (error.response.status === 403) {
                  $("#displayModal").css("display", "block");
               }
            });
      }
      else {
         this.setState({ error: true, message1: "Required Credentials!" });
      }
   }

   mqttGhost = (this_key, id, status) => {
      this.setState({ loading: true });
      this.showMessage(false, false, false, "");
      let self = this_key, changeStatus = "";
      if (status === 1) {
         status = "OFF"; changeStatus = 0;
      } else {
         status = "ON"; changeStatus = 1;
      }
      let assetId = { "macaddress": this.state.assetTagId, "switch": changeStatus };
      assetId = JSON.stringify(assetId)
      var clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8)
      var host = "wss://dc.vacustech.in:8083";
      var options = {
         keepalive: 60,
         clientId: clientId,
         protocolId: "MQTT",
         protocolVersion: 4,
         clean: true,
         reconnectPeriod: 1000,
         connectTimeout: 30 * 1000,
         will: {
            topic: "WillMsg",
            payload: "Connection Closed abnormally..!",
            qos: 0,
            retain: false,
         },
      };
      var client = mqtt.connect(host)
      client.on('connect', function () {
         console.log("CONNECTED======>")
         let pub = client.publish('vacus/maintenance', assetId, options);
         console.log("Publisheron=====>", pub)
         self.ghostStatusChange(id, status);
      })
   }

   ghostStatusChange = (id, status) => {
      clearInterval(this.interval);
      let class1 = $("#ghostbutton_" + id).attr("class");
      let class2 = "";
      if (status === "OFF") {
         class2 = "ghostbutton btnON";;
      } else {
         class2 = "ghostbutton btnOFF";
      }
      axios({
         method: 'PATCH', url: "/api/asset/server/maintenance",
         data: { id: id, status: status }
      })
         .then((response) => {
            console.log("ghostStatusChange response====>", response)
            if (response.status === 200 || response.status === 201) {
               $("#ghostbutton_" + id).removeClass(class1);
               $("#ghostbutton_" + id).addClass(class2);
               $("#ghostbutton_" + id + " > span").text(status);
               this.showMessage(false, false, false, "");
               this.search();
            }
         })
         .catch((error) => {
            this.search();
            console.log("error======>", error)
            this.setState({ loading: false });
            if (error.response.status === 404) {
               this.showMessage(false, true, false, "No Server Maintenance Data Found");
            } else if (error.response.status === 403) {
               $("#displayModal").css("display", "block");
            }
         })
   }

   showMessage = (interval, error, success, msg) => {
      clearTimeout(this.messageTimeout);
      this.setState({ error: error, success: success, message: msg });
      if (interval) {
         this.messageTimeout = setTimeout(() => {
            this.setState({ error: false, success: false, message: "" });
         }, 5000)
      }
   }

   componentWillUnmount() {
      clearTimeout(this.messageTimeout)
   }

   render() {
      const { message, success, error, loading, message1 } = this.state;
      return (
         <>
            <div id='divheight'
               style={{
                  position: "relative",
                  overflow: loading === true ? "hidden" : "visible",
                  height: loading === true ? "100vh" : "auto",
               }}>
               {error && (
                  <div style={{ color: "red", marginBottom: "0px", marginTop: '20px' }}>
                     <strong>{message}</strong>
                  </div>
               )}

               {success && (
                  <div style={{ color: "green", marginBottom: "0px", marginTop: '20px' }}>
                     <strong>{message}</strong>
                  </div>
               )}
               <div style={{ marginTop: '35px' }}>
                  <div className="inputdiv">
                     <span className="label">Maintenance Staff </span>
                     <input
                        type="text"
                        id="staffname"
                        required="required"
                        placeholder=""
                     />
                  </div>
                  <div className="inputdiv" style={{ marginTop: '10px' }}>
                     <span className="label">Inventory Code </span>
                     <input
                        type="text"
                        name="inventory"
                        id="inventory"
                        required="required"
                     />
                  </div>
                  <button className="fancy-button"
                     style={{
                        width: '120px',
                        marginLeft: '240px', marginTop: '15px', marginBottom: '20px'
                     }} onClick={this.search}>Search</button>
               </div>

               <div id="common_table" style={{ paddingBottom: "100px" }}>
                  <div className="table_det">
                     <div
                        id="rangeDropdown"
                        style={{
                           float: "right",
                           position: "relative",
                           right: "6%",
                           marginBottom: "20px",
                           marginTop: "-6%",
                        }}>
                        <select name="state" style={{ width: "120px" }} id="maxRows">
                           <option value="25">25</option>
                           <option value="50">50</option>
                           <option value="75">75</option>
                           <option value="100">100</option>
                        </select>
                     </div>
                     <table style={{ width: "95%", position: "relative" }} id="server_table">
                        <thead></thead>
                        <tbody></tbody>
                     </table>
                  </div>
                  <div className="pagination">
                     <button
                        id="prev1"
                        className="moving"
                        data-page="prev"
                        style={{ marginRight: "30px" }}>
                        Prev
                     </button>
                     <button className="moving" data-page="next" id="prev">
                        Next
                     </button>
                  </div>
               </div>

               <div className="modal_ghost">
                  <div className='authenticate'>
                     <div className='authenticate_header'>
                        <div className='authenticate_icon'>
                           <i className="fas fa-times-circle" onClick={() => {
                              $('.modal_ghost').hide();
                              $('.textinput').val('')
                           }}></i>
                        </div>
                        <span>Authentication Required!</span>
                     </div>

                     <form>
                        {error && (
                           <span style={{ color: "red", textAlign: 'center' }}>
                              <strong>{message1}</strong>
                           </span>
                        )}
                        <div style={{ textAlign: 'center', marginTop: '-10px', padding: '15px' }}>
                           <div>
                              <input style={{ width: '200px', padding: '5px' }}
                                 type="text" id="username" name="username"
                                 placeholder=" Enter Username"
                                 required="required"
                                 autoComplete="off"
                                 className='textinput'
                                 onChange={this.inputHandler}
                              />
                           </div>
                           <div>
                              <input style={{ width: '200px', padding: '5px' }}
                                 type="password" id="password"
                                 name="password" placeholder="Enter Password"
                                 required="required" autoComplete="off"
                                 className='textinput'
                                 onChange={this.inputHandler}
                              />
                           </div>
                           <div className="buttons" style={{ textAlign: "center", }}>
                              <button style={{ cursor: 'pointer' }}
                                 onClick={this.authenticate}>Submit</button>
                           </div>
                        </div>
                     </form>

                  </div>
               </div>

               {/* SessionOut Component used here!  */}
               <SessionOut />
               <div className='tagtable' style={{ display: 'none', width: '1260px' }}>
                  <TableDetails />
               </div>
            </div>

            {
               loading === true && (
                  <div
                     style={{
                        top: "0%",
                        left: "0%",
                        boxShadow: "none",
                     }} className="frame">
                     <DataLoading />
                  </div>
               )
            }
         </>
      )
   }
}
