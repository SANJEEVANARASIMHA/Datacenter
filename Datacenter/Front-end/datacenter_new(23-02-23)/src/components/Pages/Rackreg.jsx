import React, { Component } from 'react'
import { upload_floormap, rackmonitor_register } from '../urls/api';
import axios from 'axios';
import $ from 'jquery';
import { SessionOut } from "./Common";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
export default class Rackreg extends Component {
   constructor() {
      super()
      this.state = {
         message: '',
         error: false,
         success: false,
      }
   }

   componentDidMount() {
      this.floorMap()
   }

   floorMap = () => {
      $("#fname").empty();
      axios({ method: "GET", url: upload_floormap })
         .then((response) => {
            console.log('Response--->', response);
            let data = response.data;
            if (data.length !== 0 && response.status === 200) {
               for (let i = 0; i < data.length; i++) {
                  $("#fname").append("<option value=" + data[i].id + ">" + data[i].name + "</option>")
               }
               this.showMessage(false, false, false, "")
            } else {
               this.showMessage(false, true, false, "No Floor Map Uploaded. Please Upload Floor Map To Begin");
            }
         })
         .catch((error) => {
            console.log('Error----->', error);
            if (error.response.status === 403) {
               $("#displayModal").css("display", "block");
            } else {
               this.showMessage(false, true, false, "Error Occurred. Please Try Again.")
            }
         })
   }

   rackRegistration = (e) => {
      e.preventDefault();
      let data = {
         floor: $("#fname").val(),
         macid: $('#rackid').val(),
         capacity: $('#capacity').val(),
         templow: $('#tempmin').val(),
         humilow: $('#humidmin').val(),
         temphigh: $('#tempmax').val(),
         humihigh: $('#humidmax').val(),
         energy: $('#energy').val(),
         x: $('#x1').val(),
         x1: $('#x2').val(),
         y: $('#y1').val(),
         y1: $('#y2').val(),
         name: $("#rackname").val(),
      }
      console.log('JSONDATA=======>', data)
      if (data.macid && data.capacity && data.x &&
         data.y && data.x1 && data.y1 && data.templow &&
         data.humilow && data.temphigh && data.humihigh &&
         data.name && data.energy) {
         if (
            $('#rackid').val().length !== 17 ||
            $('#rackid').val().match("^5a-c2-15-07-[a-x0-9]{2}-[a-x0-9]{2}") === null
         ) {
            this.showMessage(true, true, false, "Invalid Rack ID Entered. Please Follow The Pattern 5a-c2-15-07-00-00")
         } else {
            axios({
               method: "POST",
               url: rackmonitor_register,
               data: data
            })
               .then((response) => {
                  console.log(response);
                  if (response.status === 201 || response.status === 200) {
                     $('#rackid').val('');
                     $('#capacity').val('');
                     $('#tempmin').val('');
                     $('#humidmin').val('');
                     $('#tempmax').val('');
                     $('#humidmax').val('');
                     $("#energy").val('');
                     $('#x1').val('');
                     $('#x2').val('');
                     $('#y1').val('');
                     $('#y2').val('');
                     $("#rackname").val('');
                     $("#removerack").css("display", "none");
                     this.showMessage(true, false, true, "Rack Registered Successfully")
                  }
               })
               .catch((error) => {
                  console.log("error==>", error);
                  if (error.response.status === 403) {
                     $("#displayModal").css("display", "block");
                  } else if (error.response.status === 400) {
                     this.showMessage(true, true, false, "Bad Request")
                  } else {
                     this.showMessage(true, true, false, "Error Occurred. Please Try Again")
                  }
               });
         }
      } else {
         this.showMessage(true, true, false, "Please Fill Out All The Fields")
      }
   }

   removeRack = () => {
      console.log("==")
      let data = {
         macid: $("#rackidrmv").val(),
      };
      console.log(data)
      if ($("#rackidrmv").val().length === 0) {
         this.showMessage(true, true, false, "Required Rack ID")
      } else if (
         $('#rackidrmv').val().length !== 17 ||
         $('#rackidrmv').val().match("^5a-c2-15-07-[a-x0-9]{2}-[a-x0-9]{2}") === null
      ) {
         this.showMessage(true, true, false, "Invalid Rack ID Entered. Please Follow The Pattern 5a-c2-15-07-00-00");
      } else {
         axios({
            method: "DELETE",
            url: rackmonitor_register,
            data: data,
         })
            .then((response) => {
               console.log(response);
               if (response.status === 200) {
                  $("#rackidrmv").val("");
                  $("#removerack").css("display", "none");
                  this.showMessage(true, false, true, "Rack Removed Successfully")
               } else {
                  this.showMessage(true, true, false, "Rack Not Removed")
               }
            })
            .catch((error) => {
               console.log(error);
               if (error.response.status === 403) {
                  $("#displayModal").css("display", "block");
               } else {
                  this.showMessage(true, true, false, "Error Occurred. Please Try Again")
               }
            });
      }
   }

   remove = () => {
      document.getElementById("removerack").style.display =
         $("#removerack").css("display") === "block" ? "none" : "block";
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
      const { message, error, success } = this.state
      return (
         <div style={{
            marginLeft: "0px",
            marginTop: '20px',
            width: "100%",
            height: "67vh"
         }}>
            {error && (
               <div style={{ color: 'red', marginBottom: '20px' }}>
                  <strong>{message}</strong>
               </div>
            )}

            {success && (
               <div style={{ color: 'green', marginBottom: '20px' }}>
                  <strong>{message}</strong>
               </div>
            )}

            <div style={{ marginTop: '30px', display: 'flex' }}>
               <div>
                  <div className="inputdiv">
                     <span className="label">Floor Name</span>
                     <select name="fname" id="fname" required="required" />
                  </div>

                  <div className="inputdiv">
                     <span className="label" >X (in m)</span>
                     <input type="number" name="x1" id="x1" required="required"
                     />
                  </div>

                  <div className="inputdiv">
                     <span className="label">X1 (in m)</span>
                     <input type="number" name="x2" id="x2" required="required"
                     />
                  </div>
                  <div className="inputdiv">
                     <span className="label">Rack Name</span>
                     <input type="text" name="rackname" id="rackname" required="required"
                     />
                  </div>
                  <div className="inputdiv">
                     <span className="label">Temperature(in °C)</span>
                     <input type="number" name="tempmin" id="tempmin"
                        required="required" placeholder='Min' />
                     <input type="number" name="tempmax" id="tempmax"
                        required="required" placeholder='Max' />
                  </div>
                  <div className="inputdiv">
                     <span className="label">Humidity (in RH)</span>
                     <input type="number" name="humidmin"
                        id="humidmin" required="required"
                        placeholder='Min' />
                     <input type="number" name="humidmax"
                        id="humidmax" required="required"
                        placeholder='Max' />
                  </div>
               </div>
               <div style={{ marginLeft: '60px' }}>
                  <div className="inputdiv">
                     <span className="label" style={{ width: '140px' }}>Rack Mac ID</span>
                     <input type="text" name="rackid"
                        id="rackid" required="required"
                        placeholder='5a-c2-15-07-00-00'
                     />
                  </div>
                  <div className="inputdiv">
                     <span className="label"
                        style={{ width: '140px' }}>Y (in m)</span>
                     <input type="number" name="y1" id="y1" required="required"
                     />
                  </div>
                  <div className="inputdiv">
                     <span className="label" style={{ width: '140px' }}>Y1 (in m)</span>
                     <input type="number" name="y2" id="y2" required="required"
                     />
                  </div>
                  <div className="inputdiv">
                     <span className="label" style={{ width: '140px' }}>Energy (in Wh)</span>
                     <input type="number" name="energy" id="energy"
                        required="required" placeholder='Max' />
                  </div>
                  <div className="inputdiv">
                     <span className="label" style={{ width: '140px' }}>Capacity</span>
                     <input type="number" name="capacity" id="capacity"
                        required="required" placeholder='Max'
                     />
                  </div>
               </div>
            </div>

            <div style={{ display: "flex", width: "85%", marginLeft: "180px" }}>
               <div
                  onClick={() => this.remove()}
                  className="remove rmv"
                  style={{ width: "150px", marginLeft: "9px" }}>
                  <div
                     style={{
                        marginLeft: "25px",
                        marginTop: "5px",
                        cursor: "pointer",
                        fontFamily: "Poppins-Regular",
                     }}
                  >
                     Remove
                  </div>
                  <div className="icon">
                     <i
                        style={{
                           fontSize: "18px",
                           marginLeft: "10px",
                           marginTop: "7px",
                        }}
                        className="fas fa-file-times"
                     ></i>
                  </div>
               </div>

               <div
                  onClick={(e) => this.rackRegistration(e)}
                  className="register reg"
                  style={{ width: "150px", marginLeft: "60px" }}>
                  <div
                     style={{
                        marginLeft: "25px",
                        marginTop: "5px",
                        cursor: "pointer",
                        fontFamily: "Poppins-Regular",
                     }}>
                     Register
                  </div>
                  <div className="icon">
                     <i
                        style={{
                           fontSize: "18px",
                           marginLeft: "10px",
                           marginTop: "7px",
                        }}
                        className="fas fa-file-plus"
                     ></i>
                  </div>
               </div>
            </div>

            <div id='removerack' style={{ marginTop: '40px', display: 'none' }}>
               <div className="inputdiv">
                  <span className="label" style={{ width: '170px' }}>Rack Mac ID</span>
                  <input type="text" name="y2" id="rackidrmv" required="required" placeholder='5a-c2-15-07-00-00'
                  />
                  <div
                     onClick={() => this.removeRack()}
                     className="remove rmv"
                     style={{ width: "150px", marginLeft: "190px", marginBottom: '30px' }}>
                     <div
                        style={{
                           marginLeft: "25px",
                           marginTop: "5px",
                           cursor: "pointer",
                           fontFamily: "Poppins-Regular",
                        }}
                     >
                        Remove
                     </div>
                     <div className="icon">
                        <i
                           style={{
                              fontSize: "18px",
                              marginLeft: "10px",
                              marginTop: "7px",
                           }}
                           className="fas fa-file-times"
                        ></i>
                     </div>
                  </div>
               </div>
            </div>
            {/* SessionOut Component used here!  */}
            <SessionOut />
         </div>
      )
   }
}
