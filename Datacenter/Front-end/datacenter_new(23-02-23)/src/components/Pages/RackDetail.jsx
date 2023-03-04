import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import { upload_floormap } from "../urls/api";
import { getPagination, SessionOut, DataLoading } from "./Common";
import { linkClicked } from "../sidebar/Leftsidebar";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default class Assetdetail extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      error: false,
      flag: false,
      loading: true,
    };
  }

  componentDidMount() {
    linkClicked(4);
    $(".pagination").hide();
    $("#rangeDropdown").hide();
    sessionStorage.removeItem("assethistory");
    var valdata = sessionStorage.getItem("cardvals");
    this.vals = JSON.parse(valdata)
    axios({ method: "GET", url: upload_floormap })
      .then((response) => {
        if (response.status === 200 && response.data.length !== 0) {
          for (let i = 0; i < response.data.length; i++) {
            $("#fname").append(
              "<option value=" +
              response.data[i].id +
              ">" +
              response.data[i].name +
              "</option>"
            );
          }
          this.getTableDetails("first");
          this.interval = setInterval(() => {
            this.getTableDetails("repeat");
          }, 15 * 1000);
        } else {
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          this.showMessage(false, true, false, "No Floor Map Details Found");
        }
      })
      .catch((error) => {
        if (error.response.status === 404) {
          this.showMessage(false, true, false, "No Data Found");
        } else if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 400) {
          this.showMessage(false, true, false, "Bad Request");
        }
      });
  }

  getTableDetails = (callStatus) => {
    if (callStatus === "first") {
      this.setState({ loading: true });
      $(".pagination").hide();
      $("#rangeDropdown").hide();
    } else {
      this.setState({ loading: false });
    }
    let activeBtn = $('.myDIV').find('button.active').attr('id');
    if (activeBtn === "rackBtn") {
      axios({ method: "GET", url: "/api/rack?id=" + this.vals })
        .then((response) => {
          const data = response.data;
          console.log("rackBtn=====>", response);
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_asset tbody").empty();
          $("#table_asset thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_asset thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>RACK NAME</th>" +
              "<th>CAPACITY</th>" +
              "<th>NO.OF ASSETS</th>" +
              "<th>AVAILABLE U'S</th>" +
              "<th>UNIT USAGE</th>" +
              "<th>LAST SEEN</th>" +
              "<th>DETAILS</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              $("#table_asset tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].name + "</td>" +
                "<td>" + data[i].capacity + "</td>" +
                "<td>" + data[i].count + "</td>" +
                "<td>" + data[i].available + "</td>" +
                "<td>" + data[i].usage + "</td>" +
                "<td>" + data[i].timestamp.substring(0, 19).replace("T", " ") + "</td>" +
                "<td><div class='assetrack' id='assetrack" + i + "'><i class='fas fa-info-circle'></i></div></td> " +
                "</tr>"
              )
              $("#assetrack" + i).on("click", () => {
                this.showRackDetails(data[i].name, data[i].id);
              })
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_asset");
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            this.setState({ loading: false });
            this.showMessage(false, true, false, "No Rack Details found");
          }
        })

        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            this.showMessage(false, true, false, "No Data Found");
          } else if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else {
            this.showMessage(false, true, false, "No Data Found");
          }
        })
    }
    else if (activeBtn === "assetBtn") {
      axios({ method: "GET", url: "/api/asset?id=" + this.vals })
        .then((response) => {
          const data = response.data;
          console.log('assettag_det=====>', response);
          $(".pagination").hide();
          $("#rangeDropdown").hide();
          $("#table_asset tbody").empty();
          $("#table_asset thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#table_asset thead").append(
              "<tr>" +
              "<th>SNO</th>" +
              "<th>ASSET NAME</th>" +
              "<th>RACK NAME</th>" +
              "<th>UNIT USAGE</th>" +
              "<th>HISTORY</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              let rackname = data[i].placedIn === null ? "Outside" : data[i].placedIn.name

              $("#table_asset tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].name + "</td>" +
                "<td>" + rackname + "</td>" +
                "<td>" + data[i].usage + "</td>" +
                "<td><i  id='imgClick" + i + "' class='imgdiv fas fa-info-circle'></i></td> " +
                "</tr>"
              );

              $("#imgClick" + i).on("click", () => {
                this.showAssetHistory(data[i].id);
              })

            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_asset");
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            this.setState({ loading: false });
            this.showMessage(false, true, false, "No Asset Details found");
          }
        })
        .catch((error) => {
          console.log('Error====', error);
          this.setState({ loading: false });
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else if (error.response.status === 404) {
            this.showMessage(false, true, false, "No Data Found");
          }
          else if (error.response.status === 400) {
            this.showMessage(false, true, false, "Bad Request");
          }
        })
    }
  };

  showRackDetails = (rackName, rackId) => {
    sessionStorage.setItem("racktracking_rackId", JSON.stringify({ rackName: rackName, rackId: rackId }));
    window.location.pathname = "/racktracking"
  }

  showAssetHistory = (id) => {
    this.setState({ loading: true });
    clearTimeout(this.timeout);
    axios({ method: "GET", url: "/api/asset?tagid=" + id })
      .then((response) => {
        console.log("showAssetHistory====", response);
        let data = response.data;
        if (data.length !== 0 && response.status === 200) {
          this.setState({ loading: false });
          this.showMessage(false, false, false, "");
          sessionStorage.setItem("assethistory", id);
          window.location.pathname = "/assetdetail"
        } else {
          this.setState({ loading: false });
          $("html").animate({ scrollTop: 0 }, "slow");
          this.showMessage(true, true, false, "No Asset History Data Found");
        }
      })
      .catch((error) => {
        console.log(' Error====', error);
        this.setState({ loading: false });
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 404) {
          $("html").animate({ scrollTop: 0 }, "slow");
          this.showMessage(true, true, false, "No Asset History Data Found");
        }
      })
  }

  btnOption = (e) => {
    $(".myDIV").parent().find('button').removeClass("active");
    this.setState({ flag: true });
    $("#" + e.target.id).addClass("active");
    this.getTableDetails("first")
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
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    clearTimeout(this.messageTimeout);
  }

  render() {
    const { message, error, loading } = this.state;
    return (
      <div id='divheight'
        style={{
          float: "right", width: "95%", background: '#E5EEF0',
          marginLeft: '60px', position: "relative",
          overflow: loading === true ? "hidden" : "none",
          height: loading === true ? "100vh" : "auto",
        }}>
        <div style={{ marginTop: "30px", marginLeft: "60px" }}>
          <span className="main_header">DETAILS</span>
          <div className="underline" style={{ marginBottom: "30px" }}></div>
          <div style={{ display: "flex" }} className="myDIV">
            <button id="rackBtn" onClick={this.btnOption}
              className="fancy-button active">
              Rack View
            </button>
            <button id="assetBtn" onClick={this.btnOption}
              className="fancy-button ">
              Asset View
            </button>
          </div>

          <div style={{ marginTop: "30px", display: "none" }} id="rackmonitor">
            <div className="inputdiv">
              <span className="label">Floor Name </span>
              <select
                name="fname"
                id="fname"
                required="required"
                onChange={() => this.getTableDetails("first")}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: "red", marginTop: "20px" }}>
              <strong>{message}</strong>
            </div>
          )}

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
              <table style={{ width: "95%", position: "relative" }} id="table_asset">
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


        {loading === true && (
          <div
            style={{
              top: "0%",
              left: "0%",
            }} className="frame">
            <DataLoading />
          </div>
        )}
        {/* SessionOut Component used here!  */}
        <SessionOut />
      </div>
    );
  }
}
