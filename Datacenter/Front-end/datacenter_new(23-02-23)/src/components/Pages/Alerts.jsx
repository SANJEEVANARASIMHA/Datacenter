import React, { Component } from "react";
import {
  alert_asset, alert_humi,
  alert_temp, alert_energy
} from "../urls/api";
import axios from "axios";
import $ from "jquery";
import "./mediastyle.css";
import { linkClicked } from "../sidebar/Leftsidebar";
import { getPagination, SessionOut, DataLoading } from "./Common";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default class Alerts extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      error: false,
      loading: false,
    };
  }

  componentDidMount() {
    linkClicked(3);
    var valdata = sessionStorage.getItem("cardvals");
    this.vals = JSON.parse(valdata)
    this.getTableDetails("first");
    this.interval = setInterval(() => this.getTableDetails("repeat"), 15 * 1000)
  }

  getTableDetails = (callStatus) => {
    if (callStatus === "first") {
      this.setState({ loading: true });
      $(".pagination").hide();
      $("#rangeDropdown").hide();
    } else {
      this.setState({ loading: false });
    }
    if ($("#alerttype").val() === 'Temperature') {
      axios({ method: "GET", url: alert_temp + this.vals })
        .then((response) => {
          const data = response.data;
          console.log('Temperature=====>', response);
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th>TEMPERATURE(°C)</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + data[i].temperature.toFixed(2) + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
              this.setState({ loading: true });
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            this.setState({ loading: false });
            this.showMessage(false, true, false, "Temperature Alert Data Not Found");
          }
        })
        .catch((error) => {
          console.log('Health Slave gate Error====', error);
          if (error.response.status === 403) {
            this.setState({ loading: false });
            $("#displayModal").css("display", "block");
          }
        })
    } else if ($("#alerttype").val() === 'Humidity') {
      axios({ method: "GET", url: alert_humi + this.vals })
        .then((response) => {
          console.log('Humidity=====>', response);
          const data = response.data;
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th>HUMIDITY(RH)</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr><td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + data[i].humidity.toFixed(2) + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            this.setState({ loading: false });
            this.showMessage(false, true, false, "Humidity Alert Data Not Found");
          }
        })
        .catch((error) => {
          console.log('Error====', error);
          this.setState({ loading: false });
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
        })
    }
    else if ($("#alerttype").val() === 'Energy') {
      axios({ method: "GET", url: alert_energy + this.vals })
        .then((response) => {
          console.log('Energy=====>', response);
          const data = response.data;
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET ID</th>" +
              "<th style='text-transform:none;'>ENERGY(kWh)</th>" +
              "<th>LAST SEEN</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_alert tbody").append(
                "<tr><td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + data[i].macid.tagid + "</td>" +
                "<td>" + (data[i].energy / 1000).toFixed(2) + "</td>" +
                "<td>" + data[i].lastseen.replace("T", " ").substr(0, 19) + "</td>" +
                "</tr>"
              )
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            this.setState({ loading: false });
            this.showMessage(false, true, false, "Energy Alert Data Not Found");
          }
        })
        .catch((error) => {
          console.log('Error====', error);
          this.setState({ loading: false });
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
        })
    }
    else if ($("#alerttype").val() === 'Asset Movement') {
      axios({ method: "GET", url: alert_asset + this.vals })
        .then((response) => {
          const data = response.data;
          console.log('image====>', response)
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_alert tbody").empty();
          $("#table_alert thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_alert thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>ASSET NAME</th>" +
              "<th>ASSET LAST POSITION</th>" +
              "<th>ASSET CURRENT POSITION</th>" +
              "<th>LAST SEEN</th>" +
              "<th>IMAGE</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              let time = data[i].timestamp.replace("T", " ").substr(0, 19);
              let currPos = "";
              let lastPos = "";
              if (data[i].placedIN === 0 || data[i].placedIN === 100) {
                currPos = "<span class='outOfRack'>Out Of Rack</span>"
              } else {
                currPos = data[i].placedIN
              }
              if (data[i].removedFrom === 0 || data[i].removedFrom === 100) {
                lastPos = "<span class='outOfRack'>Out Of Rack</span>"
              } else {
                lastPos = data[i].removedFrom
              }
              $("#table_alert tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].macid.rackno.name + "</td>" +
                "<td>" + data[i].macid.name + "</td>" +
                "<td>" + lastPos + "</td>" +
                "<td>" + currPos + "</td>" +
                "<td>" + time + "</td>" +
                "<td><i id='imgClick" + i + "' class='imgdiv fas fa-camera-alt'></i></td> " +
                "</tr>"
              )
              $("#imgClick" + i).on("click", () => {
                this.showImage(time)
              })
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_alert");
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            this.setState({ loading: false });
            this.showMessage(false, true, false, "Asset Movement Alert Data Not Found");
          }
        })
        .catch((error) => {
          this.setState({ loading: false });
          console.log('image Error====', error);
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
        })
    }
  };

  showImage = (time) => {
    this.setState({ message: "", error: false });
    $(".img-container").css("display", "none");
    window.scrollTo(0, 100)
    axios({ method: "GET", url: "/api/image?time=" + time })
      .then((response) => {
        console.log("Image URLS=====>", response);
        const data = response.data;
        let length = data.length > 3 ? 3 : data.length;
        if (data.length !== 0 && response.status === 200) {
          this.setState({ message: "", error: false });
          if (length === 1) {
            $("#imgblock1").delay(150).fadeIn();
            $("#img1").attr("src", data[0].image)
            $("#imgblock1 p").text(data[0].timeStamp.replace("T", " ").substr(0, 19))
          } else if (length === 2) {
            $("#imgblock2").delay(150).fadeIn();
            $("#img2").attr("src", data[0].image);
            $("#img3").attr("src", data[1].image);
            $("#imgblock2 #time1").text(data[0].timeStamp.replace("T", " ").substr(0, 19))
            $("#imgblock2 #time2").text(data[1].timeStamp.replace("T", " ").substr(0, 19))
          } else if (length === 3) {
            $("#imgblock3").delay(150).fadeIn();
            $("#img4").attr("src", data[0].image);
            $("#img5").attr("src", data[1].image);
            $("#img6").attr("src", data[2].image);
            $("#imgblock3 #time1").text(data[0].timeStamp.replace("T", " ").substr(0, 19))
            $("#imgblock3 #time2").text(data[1].timeStamp.replace("T", " ").substr(0, 19))
            $("#imgblock3 #time3").text(data[2].timeStamp.replace("T", " ").substr(0, 19))
          }

        }
        else {
          $("html").animate({ scrollTop: 0 }, "slow");
          this.setState({ message: "Asset Movement Image Data Not Found", error: true });
        }
      })
      .catch((error) => {
        console.log('image Error====', error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === "404") {
          $("html").animate({ scrollTop: 0 }, "slow");
          this.setState({ message: "No Asset Movement Image Data Found", error: true });
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

  componentWillUnmount = () => {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    clearTimeout(this.messageTimeout);
  };

  render() {
    const { error, message, loading } = this.state;
    return (
      <div id='divheight'
        style={{
          float: "right", width: "95%", background: '#E5EEF0',
          marginLeft: '60px', position: "relative",
          overflow: loading === true ? "hidden" : "visible",
          height: loading === true ? "100vh" : "auto",
        }}>
        <div style={{ marginTop: "30px", marginLeft: "60px" }}>
          <span className="main_header">ALERTS</span>
          <div className="underline"></div>

          <div style={{ marginTop: "30px" }}>
            <span className="label">Alert</span>
            <select style={{ marginBottom: '30px' }}
              name="alerttype"
              id="alerttype"
              required="required"
              onChange={() => this.getTableDetails("first")}>
              <option>Asset Movement</option>
              <option>Temperature</option>
              <option>Humidity</option>
              <option>Energy</option>
            </select>
            {error && (
              <div
                style={{ marginLeft: "10px", color: "red" }}>
                <strong>{message}</strong>
              </div>
            )}
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
                  marginTop: "-3%",
                }}>
                <select name="state" style={{ width: "120px" }} id="maxRows">
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="75">75</option>
                  <option value="100">100</option>
                </select>
              </div>
              <table style={{ width: "95%", position: "relative" }} id="table_alert">
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
        </div>


        <div className="img-container" id="imgblock1">
          <div className="hideimg">
            <span><i className="far fa-times-circle"
              onClick={() => {
                $(".img-container").delay(500).fadeOut();
              }}>
            </i></span>
          </div>

          <img id="img1" className="img" alt="" />
          <p className="img_time" style={{ marginLeft: "7%" }}></p>
        </div>

        <div className="img-container" id="imgblock2">
          <div className="hideimg">
            <span><i className="far fa-times-circle"
              onClick={() => {
                $(".img-container").delay(500).fadeOut();
              }}>
            </i></span>
          </div>

          <div style={{ display: "flex" }}>
            <img id="img2" className="img" alt="" />
            <img id="img3" className="img" alt="" />
            <p className="img_time" id="time1" style={{ marginLeft: "2%" }}></p>
            <p className="img_time" id="time2" style={{ marginLeft: "52%" }}></p>
          </div>
        </div>

        <div className="img-container" id="imgblock3">
          <div className="hideimg">
            <span><i className="far fa-times-circle"
              onClick={() => {
                $(".img-container").delay(500).fadeOut();
              }}>
            </i></span>
          </div>

          <div style={{ display: "flex" }}>
            <img id="img4" className="img" alt="" />
            <img id="img5" className="img" alt="" />
            <img id="img6" className="img" alt="" />
            <p className="img_time" id="time1" style={{ marginLeft: "2%" }}></p>
            <p className="img_time" id="time2" style={{ marginLeft: "35%" }}></p>
            <p className="img_time" id="time3" style={{ marginLeft: "68%" }}></p>
          </div>
        </div>

        {/* SessionOut Component used here!  */}
        <SessionOut />

        {loading === true && (
          <div
            style={{
              top: "0%",
              left: "0%",
            }} className="frame">
            <DataLoading />
          </div>
        )}
      </div>
    );
  }
}