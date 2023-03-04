import React, { Component } from "react";
import $ from "jquery";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import TableScrollbar from 'react-table-scrollbar';
import './styles.css';
import Lottie from 'react-lottie';
import animationData from '../animations/nographdata.json';
import { chartOption, DataLoading, SessionOut } from "./Common";
import { linkClicked } from "../sidebar/Leftsidebar";

export default class CardEnergyDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      message1: "",
      message: "",
      macId: "",
      series: [],
      chartCheck: 0,
      loading: true,
    };
  }

  chart_Option = async () => {
    let value = await chartOption(["#ff6600"], "yyyy-MM-dd HH:mm:ss");
    this.options = value;
  }

  componentDidMount() {
    linkClicked(0);
    let data = sessionStorage.getItem("cardvals");
    this.cardval = JSON.parse(data)
    this.chart_Option();
    this.energyDetails("first");
    this.interval = setInterval(() => this.energyDetails("repeat"), 20 * 1000);
  }

  energyDetails = (callStatus) => {
    if (callStatus === "first") {
      this.setState({ loading: true });
    } else {
      this.setState({ loading: false });
    }
    if ($("#filter").val() === "Rack") {
      axios({ method: "GET", url: "/api/racktemp?id=" + this.cardval })
        .then((response) => {
          const data = response.data;
          console.log("Max Rack Response====>", response);
          $("#energy_table tbody").empty();
          $("#energy_table thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#energy_details").show();
            $("#energy_table thead").append(
              "<tr>" +
              "<th>S.No</th>" +
              "<th>Rack Name</th>" +
              "<th colspan='2'>Energy(kWh)</th>" +
              "<th>Chart</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              if (i === 0 && this.state.chartCheck === 0) {
                $("#chart_name").text("Rack Name : " + data[i].name);
                this.setState({ chartCheck: 1 });
                this.rackChartData(data[i].id);
              }
              let energydiffer = data[i].energydiff;
              if (data[i].tempdiff === null || data[i].tempdiff === "") {
                energydiffer = 0;
              } else {
                energydiffer = data[i].tempdiff.toFixed(0);
              }
              let energy = data[i].energy;
              if (data[i].energy === null || data[i].energy === "") {
                energy = 0;
              } else {
                energy = data[i].energy.toFixed(2);
              }
              let valNum = null, energyNum = null;
              if (energydiffer > 0) {
                valNum = "<td style='color: #26df2c;'>+" + energydiffer +
                  "  <span><i class='far fa-angle-up'></i></span></td>"
              } else if (energydiffer < 0) {
                valNum = "<td style='color: #f00;'>" + energydiffer +
                  "  <span><i class='far fa-angle-down'></i></span></td>";
              } else {
                valNum = "<td>--</td>";
              }
              energyNum =
                energydiffer >= 0
                  ? "<td style='color: #26df2c;font-weight: 500'>" + energy + "</td>"
                  : "<td style='color: #f00;font-weight: 500;'>" + energy + "</td>";

              $("#energy_table tbody").append(
                "<tr><td>" +
                (i + 1) +
                "</td>" +
                "<td>" +
                data[i].name +
                "</td>" +
                valNum +
                energyNum +
                "<td><span>" +
                "<i id=" + data[i].id + " class='fas fa-info-circle'></i></span></td></tr>"
              );
              $("#" + data[i].id).on("click", () => {
                $("#chart_name").text("Rack Name : " + data[i].name);
                this.rackChartData(data[i].id);
              });
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            $("#energy_details").hide();
            this.setState({ loading: false });
            this.showMessage(false, true, false, "No Rack Data Found");
          }
        })
        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            $("#energy_details").hide();
            this.showMessage(false, true, false, "No Rack Data Found");
          } else if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
        })
    } else if ($("#filter").val() === "Asset") {
      axios({ method: "GET", url: "/api/assettemp?id=" + this.cardval })
        .then((response) => {
          const data = response.data;
          console.log("Asset Response====>", response);
          $("#energy_table tbody").empty();
          $("#energy_table thead").empty();
          if (data.length !== 0 && response.status === 200) {
            $("#energy_details").show();
            $("#energy_table thead").append(
              "<tr>" +
              "<th>S.No</th>" +
              "<th>Asset Name</th>" +
              "<th colspan='2'>Energy(kWh)</th>" +
              "<th>Chart</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              if (i === 0 && this.state.chartCheck === 0) {
                $("#chart_name").text("Asset Name : " + data[i].name);
                this.setState({ chartCheck: 1 });
                this.assetChartData(data[i].id);
              }
              let energydiffer = data[i].energydiff;
              if (data[i].energydiff === null || data[i].energydiff === "") {
                energydiffer = 0;
              } else {
                energydiffer = data[i].energydiff.toFixed(2);
              }
              let energy = data[i].energy.toFixed(2);
              if (data[i].energy === null || data[i].energy === "") {
                energy = 0;
              } else {
                energy = data[i].energy.toFixed(2);
              }

              let valNum = null, energyNum = null;
              if (energydiffer > 0) {
                valNum = "<td style='color: #26df2c;'>+" + energydiffer +
                  "  <span><i class='far fa-angle-up'></i></span></td>"
              } else if (energydiffer < 0) {
                valNum = "<td style='color: #f00;'>" + energydiffer +
                  "  <span><i class='far fa-angle-down'></i></span></td>";
              } else {
                valNum = "<td>--</td>";
              }

              energyNum =
                energydiffer >= 0
                  ? "<td style='color: #26df2c;font-weight: 500'>" + energy + "</td>"
                  : "<td style='color: #f00;font-weight: 500;'>" + energy + "</td>";
              $("#energy_table tbody").append(
                "<tr><td>" +
                (i + 1) +
                "</td>" +
                "<td>" +
                data[i].name +
                "</td>" +
                valNum +
                energyNum +
                "<td><span>" +
                "<i id=" + data[i].id + " class='fas fa-info-circle'></i></span></td></tr>"
              );
              $("#" + data[i].id).on("click", () => {
                $("#chart_name").text("Asset Name : " + data[i].name);
                this.assetChartData(data[i].id);
              });
            }
            this.setState({ loading: false });
            this.showMessage(false, false, false, "");
          } else {
            $("#energy_details").hide();
            this.setState({ loading: false });
            this.showMessage(false, true, false, "No Asset Data Found");
          }
        })
        .catch((error) => {
          console.log("ERROR====>", error);
          this.setState({ loading: false });
          if (error.response.status === 404) {
            $("#energy_details").hide();
            this.showMessage(false, true, false, "No Asset Data Found");
          } else if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
        })
    }
  }

  rackChartData = (macid) => {
    this.setState({ series: [], macId: macid, message1: "" })
    var date1 = new Date();
    var milliseconds1 = date1.getTime();
    let value = [];
    axios({ method: 'GET', url: '/api/rack/chart?id=' + macid + "&key=rackenergymax" })
      .then((response) => {
        console.log("RackChartData====>", response)
        let data = response.data
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let time = data[i].time;
            var date = new Date(time);
            var ms = date.getTime();
            value.push([ms, data[i].energy]);
          }
          this.setState({ series: [{ name: "Energy(kWh)", data: value }] });
          $("#graphAnime").css("display", "none");
        } else {
          this.setState({ macId: macid, series: [] });
          $("#graphAnime").css("display", "block");
        }

      })
      .catch((error) => {
        console.log(error)
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 404) {
          this.setState({ macId: macid, series: [] });
          $("#graphAnime").css("display", "block");
        }
        else if (error.response.status === 400) {
          this.showMessage(false, true, false, "Bad Request");
          this.setState({ macId: macid, series: [] });
          $("#graphAnime").css("display", "block");
        } else {
          this.showMessage(false, true, false, "Error Occurred. Please Try Again");
          this.setState({ macId: macid, series: [] });
          $("#graphAnime").css("display", "block");
        }
      })
  };

  assetChartData = (tagid) => {
    this.setState({
      macId: tagid, message1: "", series: []
    });
    let value = [];
    var date1 = new Date();
    var milliseconds1 = date1.getTime();
    axios({ method: "GET", url: "/api/asset/chart?id=" + tagid + "&key=assetenergymax" })
      .then((response) => {
        console.log("AssetChartData response====>", response);
        let data = response.data
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            let energy = data[i].energy;
            let chartDet = [];
            let time = data[i].time;
            var date = new Date(time);
            var milliseconds = date.getTime();
            chartDet.push(milliseconds);
            chartDet.push(energy);
            value.push(chartDet);
          }
          this.setState({ series: [{ name: "Energy(kWh)", data: value }] });
          $("#graphAnime").css("display", "none");
        }
        else {
          this.setState({ macId: tagid, series: [] });
          $("#graphAnime").css("display", "block");
        }
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 404) {
          this.setState({ macId: tagid, series: [] });
          $("#graphAnime").css("display", "block");
        }
        else if (error.response.status === 400) {
          this.showMessage(false, true, false, "Request Failed");
          this.setState({ macId: tagid, series: [] });
          $("#graphAnime").css("display", "block");
        } else {
          this.showMessage(false, true, false, "Error Occurred. Please Try Again");
          this.setState({ macId: tagid, series: [] });
          $("#graphAnime").css("display", "block");
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
  };

  render() {
    const { series, error, message1, message, loading } = this.state;
    return (
      <div
        style={{
          float: "right",
          width: "95%",
          position: "relative",
          background: "#E5EEF0",
          overflow: loading === true ? "hidden" : "none",
          height: loading === true ? "100vh" : "auto",
        }}>
        <div style={{ marginTop: "25px", marginLeft: "60px" }}>
          <span className="main_header">ENERGY</span>
          <div className="underline"></div>

          <div style={{ display: "flex", marginTop: "30px" }}>
            <div className="inputdiv"
              style={{ marginLeft: "10px" }}>
              <select
                name="filter"
                id="filter"
                style={{ width: "175px", border: "1px solid #99d1dd" }}
                onChange={() => {
                  this.setState({ chartCheck: 0 });
                  clearInterval(this.interval);
                  this.componentDidMount();
                }}>
                <option>Rack</option>
                <option>Asset</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: 'red', margin: '20px 20px' }}>
              <strong>{message}</strong>
            </div>
          )}

          <div style={{ display: "flex" }} id='energy_details'>
            <div className="box" style={{ height: "70vh", }}>
              <TableScrollbar>
                <table style={{ width: "95%" }} id="energy_table">
                  <thead></thead>
                  <tbody></tbody>
                </table>
              </TableScrollbar>
            </div>
            <div id="graphContainer" style={{
              marginLeft: "30px",
              width: "44%", marginTop: "10px"
            }}>
              <div
                id="chart"
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#FFF",
                  height: "70vh",
                }}>
                <div
                  id="chart_name"
                  style={{
                    marginLeft: "25px",
                    padding: "15px",
                    fontSize: "17px",
                    color: "#00629b",
                    fontWeight: "600",
                  }}>
                </div>
                <div
                  style={{
                    paddingLeft: "15px",
                    fontSize: "17px",
                    color: "#00629b",
                  }}>
                  <span style={{ fontWeight: 500, color: 'red' }}>{message1}</span>
                </div>
                {series.length ? (
                  <div id="chart-timeline">
                    {this.options !== undefined && (
                      <ApexCharts options={this.options}
                        series={series}
                        type="area"
                        height={370} />
                    )}
                  </div>
                ) : null}

                <div
                  id="graphAnime"
                  style={{
                    width: "83%",
                    height: "53vh",
                    display: "none",
                    border: "1px solid #d5d5d5",
                    marginTop: "20px",
                    marginLeft: "44px",
                    textAlign: "center"
                  }}>
                  <h3 style={{ textAlign: "center", color: "red" }}>
                    No Graph Data Found!
                  </h3>
                  <Lottie
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: animationData,
                      rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice'
                      }
                    }}
                    width={380}
                    height={330}
                    style={{
                      position: "relative",
                      margin: "-8% 0px 0px 12%",
                      padding: "0"
                    }}
                  />
                </div>
              </div>
            </div>
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
