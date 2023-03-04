import React, { Component } from "react";
import { linkClicked } from "../sidebar/Leftsidebar";
import { getPagination, TableDetails, SessionOut, DataLoading } from "./Common";
import $ from "jquery";
import "./styles.css";
import axios from "axios";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
export default class Health extends Component {
   constructor() {
      super();
      this.state = {
         message: "",
         error: false,
         flag: false,
      };
   }

   componentDidMount() {
      linkClicked(6);
      $(".pagination").hide();
      $("#rangeDropdown").hide();
      var valdata = sessionStorage.getItem("cardvals");
      this.vals = JSON.parse(valdata)
      this.getTableDetails("first");
      // this.interval = setInterval(() => {
      //    this.getTableDetails("repeat");
      // }, 15 * 1000);
   }

   getTableDetails = (callStatus) => {
      if (callStatus === "first") {
         this.setState({ loading: true });
         $(".pagination").hide();
         $("#rangeDropdown").hide();
      } else {
         this.setState({ loading: false });
      }
      axios({ method: "GET", url: "/api/health?id=" + this.vals })
         .then((response) => {
            console.log(response)
            let data = response.data;
            $(".pagination").hide();
            $("#rangeDropdown").hide();
            $("#table_det tbody").empty();
            $("#table_det thead").empty();
            if (data.length !== 0 && response.status === 200) {
               this.setState({ loading: false });
               if ($("#healthtype").val() === "Master") {
                  let masterdata = data.master;
                  console.log('master', masterdata)
                  $(".pagination").hide();
                  $("#rangeDropdown").hide();
                  $("#table_det tbody").empty();
                  $("#table_det thead").empty();
                  if (masterdata.length > 0) {
                     $("#table_det thead").append(
                        "<tr>" +
                        "<th>SNO</th>" +
                        "<th>MASTER ID</th>" +
                        "<th>FLOOR NAME</th>" +
                        "<th>LAST SEEN</th>" +
                        " <th>STATUS</th>" +
                        "</tr>"
                     );
                     for (let i = 0; i < masterdata.length; i++) {
                        let status = 'red';
                        if ((new Date() - new Date(masterdata[i].lastseen)) <= (2 * 60 * 1000)) {
                           status = "green";
                        }
                        $("#table_det tbody").append(
                           "<tr class=row_" + (i + 1) + ">" +
                           "<td>" + (i + 1) + "</td>" +
                           "<td>" + masterdata[i].gatewayid + "</td>" +
                           "<td>" + masterdata[i].floor.name + "</td>" +
                           "<td>" + masterdata[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                           "<td><div id='outer_" + status + "'><div id='inner_" + status + "'></div></div></td> " +
                           "</tr>"
                        )
                     }
                     if (masterdata.length > 25) {
                        $(".pagination").show();
                        $("#rangeDropdown").show();
                        getPagination(this, "#table_det");
                     }
                     this.showMessage(false, false, false, "");
                  }
                  else {
                     this.setState({ loading: false });
                     this.showMessage(false, true, false, "No Master Data Found");
                  }
               }
               else if ($("#healthtype").val() === "Slave") {
                  let slavedata = data.slave;
                  console.log('slave', slavedata)
                  $(".pagination").hide();
                  $("#rangeDropdown").hide();
                  $("#table_det tbody").empty();
                  $("#table_det thead").empty();
                  if (slavedata.length !== 0) {
                     $("#table_det thead").append(
                        "<tr>" +
                        "<th>SNO</th>" +
                        "<th>SLAVE ID</th>" +
                        "<th>MASTER ID</th>" +
                        "<th>FLOOR NAME</th>" +
                        "<th>LAST SEEN</th>" +
                        " <th>STATUS</th>" +
                        "</tr>"
                     );
                     for (let i = 0; i < slavedata.length; i++) {
                        let status = 'red';
                        if ((new Date() - new Date(slavedata[i].lastseen)) <= (2 * 60 * 1000)) {
                           status = "green";
                        }
                        $("#table_det tbody").append(
                           "<tr class=row_" + (i + 1) + ">" +
                           "<td>" + (i + 1) + "</td>" +
                           "<td>" + slavedata[i].gatewayid + "</td>" +
                           "<td>" + slavedata[i].master.gatewayid + "</td>" +
                           "<td>" + slavedata[i].master.floor.name + "</td>" +
                           "<td>" + slavedata[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                           "<td><div id='outer_" + status + "'><div id='inner_" + status + "'></div></div></td> " +
                           "</tr>"
                        )
                     }
                     if (slavedata.length > 25) {
                        $(".pagination").show();
                        $("#rangeDropdown").show();
                        getPagination(this, "#table_det");
                     }
                     this.showMessage(false, false, false, "");
                  }

                  else {
                     this.setState({ loading: false });
                     this.showMessage(false, true, false, "No Slave Data Found");
                  }
               }
               else if ($("#healthtype").val() === 'Asset') {
                  let assetdata = data.asset;
                  console.log('asset', assetdata)
                  $(".pagination").hide();
                  $("#rangeDropdown").hide();
                  $("#table_det tbody").empty();
                  $("#table_det thead").empty();
                  if (assetdata.length > 0) {
                     $("#table_det thead").append(
                        "<tr>" +
                        "<th>SNO</th>" +
                        "<th>ASSET NAME</th>" +
                        "<th>ASSET ID</th>" +
                        "<th>BATTERY STATUS(%)</th>" +
                        "<th>LAST SEEN</th>" +
                        " <th>STATUS</th>" +
                        "</tr>"
                     );
                     for (let i = 0; i < assetdata.length; i++) {
                        let status = 'red';
                        if ((new Date() - new Date(assetdata[i].lastseen)) <= (2 * 60 * 1000)) {
                           status = "green";
                        }
                        $("#table_det tbody").append(
                           "<tr class=row_" + (i + 1) + ">" +
                           "<td>" + (i + 1) + "</td>" +
                           "<td>" + assetdata[i].name + "</td>" +
                           "<td>" + assetdata[i].tagid + "</td>" +
                           "<td>" + assetdata[i].battery + "</td>" +
                           "<td>" + assetdata[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                           "<td><div id='outer_" + status + "'><div id='inner_" + status + "'></div></div></td> " +
                           "</tr>"
                        )
                     }
                     if (assetdata.length > 25) {
                        $(".pagination").show();
                        $("#rangeDropdown").show();
                        getPagination(this, "#table_det");
                     }
                     this.showMessage(false, false, false, "");
                  }

                  else {
                     this.setState({ loading: false });
                     this.showMessage(false, true, false, "No Asset Data Found");
                  }
               }
            }
            if (data.length > 25) {
               $(".pagination").show();
               $("#rangeDropdown").show();
               getPagination(this, "#table_det");
            }
         })
         .catch((error) => {
            console.log(error)
            if (error.response.status === 404) {
               this.showMessage(false, true, false, "No Data Found");
            } else if (error.response.status === 403) {
               $("#displayModal").css("display", "block");
            } else if (error.response.status === 400) {
               this.showMessage(false, true, false, "Bad Request");
            }
         })
   };

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
      clearInterval(this.interval);
      clearTimeout(this.messageTimeout);
   }

   render() {
      const { message, error, loading } = this.state;
      return (
         <div
            id='divheight'
            style={{
               float: "right", width: "95%", background: '#E5EEF0',
               marginLeft: '60px', position: "relative",
               overflow: loading === true ? "hidden" : "none",
               height: loading === true ? "100vh" : "auto",
            }}>
            <div style={{ marginTop: "30px", marginLeft: "60px" }}>
               <span className="main_header">SYSTEM HEALTH</span>
               <div className="underline"></div>
               <div className="inputdiv" style={{ marginTop: "20px" }}>
                  <span className="label">Health:</span>
                  <select
                     name="healthtype"
                     id="healthtype"
                     required="required"
                     onChange={() => {
                        clearInterval(this.interval)
                        this.componentDidMount()
                     }}>
                     <option>Master</option>
                     <option>Slave</option>
                     <option>Asset</option>
                  </select>
               </div>
               {error && (
                  <div style={{ color: "red", marginTop: "20px" }}>
                     <strong>{message}</strong>
                  </div>
               )}
               <TableDetails />
            </div>

            {/* SessionOut Component used here!  */}
            <SessionOut />

            {loading === true && (
               <div
                  style={{
                     top: "0%",
                     left: "0%",
                     // marginLeft: "68px",
                     // width: "95%",
                  }} className="frame">
                  <DataLoading />
               </div>
            )}
         </div>
      );
   }
}
