import React, { Component } from 'react'
import axios from 'axios'
import $ from "jquery";
import Lottie from 'react-lottie';
import TableScrollbar from 'react-table-scrollbar';
import ApexCharts from 'react-apexcharts';
import { SessionOut, chartOption } from "./Common";
import { linkClicked } from '../sidebar/Leftsidebar';
import animationData from '../animations/nographdata.json';
import alertTemp from '../animations/alert_lottie/alert_temp.json';
import alertHumi from '../animations/alert_lottie/alert_humidity.json';
import alertEnergy from '../animations/alert_lottie/alert_energy.json';

export default class AssetDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: [],
            series: [],
            error: false,
            message: "",
            eventName: "",
            jsonData1: {
                id: "---",
                location: "---",
                name: "---",
                placedInName: "---",
                tagid: "---",
                placedInMacid: "---",
                datacenter: '---',
                address: '---',
                manufacturer: '---',
                supplier: '---',
                maintenancestaffname: '---',
                maintenancecycle: '---',
                maintenancecontact: '---',
                voltage: 0,
                energy: 0,
                current: 0,
                power: 0,
                highpowerevent: 0,
                coldspot: 0,
                hotspot: 0,
                tempf: 0,
                tempb: 0,
                humidityf: 0,
                humidityb: 0,
            },
        };
    }
    componentDidMount() {
        linkClicked(5);
        $("#graphHeader").text("");
        let data = sessionStorage.getItem("assethistory");
        let assetPrimId = JSON.parse(data)
        this.showAssetHistory(assetPrimId, "first");
        this.interval = setInterval(() => {
            this.showAssetHistory(assetPrimId, "repeat");
            if (this.state.eventName === "U-Location") {
                this.uLocation("location", this.state.jsonData1.id);
            }
        }, 15 * 1000);
    }

    showAssetHistory = (id, callStatus) => {
        axios({ method: "GET", url: "/api/asset?tagid=" + id })
            .then((response) => {
                console.log("showAssetHistory====", response);
                let data = response.data;
                if (response.status === 200) {
                    if (data.length !== 0) {
                        let currPos = "";
                        if (data.location === 0 || data.location === 100) {
                            currPos = "Out Of Rack"
                        } else {
                            currPos = data.location
                        }
                        this.setState({
                            jsonData1: {
                                id: id,
                                location: currPos,
                                name: data.name,
                                placedInName: data.placedIn.name,
                                tagid: data.tagid,
                                placedInMacid: data.placedIn.macid,
                                datacenter: data.datacenter.length > 0 ? data.datacenter : '---',
                                address: data.address.length > 0 ? data.address : '---',
                                manufacturer: data.manufacturer.length > 0 ? data.manufacturer : '---',
                                supplier: data.supplier.length > 0 ? data.supplier : '---',
                                maintenancecycle: data.maintenancecycle.length > 0 ? data.maintenancecycle+" Months" : '---',
                                maintenancestaffname: data.maintenancestaffname.length > 0 ? data.maintenancestaffname : '---',
                                maintenancecontact: data.maintenancecontact.length > 0 ? data.maintenancecontact : '---',
                                voltage: data.voltage === null ? 0 : data.voltage.toFixed(2),
                                energy: data.energy > 0 ? (data.energy / 1000).toFixed(2) : 0,
                                current: data.current === null ? 0 : data.current.toFixed(2),
                                power: data.power === null ? 0 : data.power.toFixed(2),
                                highpowerevent: data.highpowerevent,
                                coldspot: data.coldspot === null ? 0 : data.coldspot.toFixed(2),
                                hotspot: data.hotspot === null ? 0 : data.hotspot.toFixed(2),
                                tempf: data.tempf === null ? 0 : data.tempf.toFixed(2),
                                tempb: data.tempb === null ? 0 : data.tempb.toFixed(2),
                                humidityf: data.humidityf === null ? 0 : data.humidityf.toFixed(2),
                                humidityb: data.humidityb === null ? 0 : data.humidityb.toFixed(2),
                            }
                        });
                    } 
                    this.getDetails(data, callStatus);
                } else {
                    $("html").animate({ scrollTop: 0 }, "slow");
                    this.showMessage(true, true, false, "No Asset History Data Found");
                }
            })
            .catch((error) => {
                console.log(' Error====', error);
                if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                } else if (error.response.status === 404) {
                    $("html").animate({ scrollTop: 0 }, "slow");
                    this.showMessage(true, true, false, "No Asset History Data Found");
                }
            })
    }

    getDetails = (jsonData, callStatus) => {
        $("#rackImg").attr("src", "../images/mainframe.png");
        $("#rackImg").css({ "width": "200px", "height": "522px" });
        $("#img_container .assets").remove();
        let incValue = 0;
        for (let i = 42; i >= 1; i--) {
            let assetDiv = document.createElement("div");
            $(assetDiv).attr("id", "asset_" + i);
            $(assetDiv).attr("class", "assets");
            $(assetDiv).css({
                "width": "175px",
                "height": "9px",
                "position": "absolute",
                "background": "rgba(16,255,0,0.6)",
                "left": "12px",
                "top": (13 + incValue).toString() + "px",
            });
            $("#img_container").append(assetDiv);
            incValue += 12;

        }
        let data = jsonData
        $("#asset_" + data.location).css({
            "background": "rgba(255,35,0,0.6)",
        });
        if (callStatus === "first") {
            this.show("voltage", data.id, "Voltage(V)")
        }
        let dts = data.alerts;
        let alertData = [];
        if (dts.length > 0) {
            $('.alertdiv').show();
            $("#asset_" + data.location).css("animation", "blink 0.9s linear infinite");
            for (let i = 0; i < dts.length; i++) {
                if (dts[i].value === 8) {
                    alertData.push({ id: 3, value: 8, type: "Temperature", animData: alertTemp, color: 'red' })
                } else if (dts[i].value === 9) {
                    alertData.push({ id: 4, value: 9, type: "Humidity", animData: alertHumi, color: 'blue' })
                } else if (dts[i].value === 10) {
                    alertData.push({ id: 5, value: 10, type: "Energy", animData: alertEnergy, color: 'orange' })
                }
            }
            this.setState({ alerts: alertData })
        } else {
            $('.alertdiv').hide();
        }
    }

    chart_Option = async (graphColor) => {
        let value = await chartOption(graphColor, "yyyy-MM-dd HH:mm:ss");
        this.options = value;
    }

    uLocation = (key, id) => {
        $("#graphAnime").hide();
        $("#graphHeader").text("U-Location");
        $(".box").show();
        this.setState({ eventName: "U-Location" });
        axios({ method: 'GET', url: '/api/asset/event?id=' + id + "&key=" + key })
            .then((response) => {
                console.log("Response==------===>", response);
                let data = response.data;
                $("#table_det tbody").empty();
                $("#table_det thead").empty();
                if (response.status === 200) {
                    $("#table_det thead").append(
                        "<tr>" +
                        "<th>SNO</th>" +
                        "<th>RACK NAME</th>" +
                        "<th>LOCATION</th>" +
                        "<th>START TIME</th>" +
                        "<th>END TIME</th>" +
                        "<th>DURATION</th>" +
                        "</tr>"
                    );
                    if (data.length !== 0) {
                        for (let i = 0; i < data.length; i++) {
                            let startTime = data[i].startTime.replace("T", " ").substr(0, 19);
                            let endTime = data[i].endTime.replace("T", " ").substr(0, 19);
                            let diff = (new Date(endTime) - new Date(startTime)) / 1000;
                            let hh = Math.floor(diff / 3600);
                            if (hh < 10) hh = "0" + hh;
                            let mm = Math.floor((diff % 3600) / 60);
                            if (mm < 10) mm = "0" + mm;
                            let ss = Math.floor((diff % 3600) % 60);
                            if (ss < 10) ss = "0" + ss;
                            let duration = hh + ":" + mm + ":" + ss;
                            let currPos = "";
                            if (data[i].location === 0 || data[i].location === 100) {
                                currPos = "<span class='outOfRack'>Out Of Rack</span>"
                            } else {
                                currPos = data[i].location
                            }
                            $("#table_det tbody").append(
                                "<tr>" +
                                "<td>" + (i + 1) + "</td>" +
                                "<td>" + data[i].rack.name + "</td>" +
                                "<td>" + currPos + "</td>" +
                                "<td>" + data[i].startTime.replace("T", " ").substr(0, 19) + "</td>" +
                                "<td>" + data[i].endTime.replace("T", " ").substr(0, 19) + "</td>" +
                                "<td>" + duration + "</td>" +
                                "</tr>"
                            )
                        }
                        this.setState({ series: [] });
                        this.showMessage(false, false, false, "");
                    } else {
                        $(".box").css("height", "auto");
                        this.showMessage(false, true, false, "No Data Found");
                    }
                }
            })
            .catch((error) => {
                console.log("error===>", error);
                if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                } else if (error.response.status === 400) {
                    this.showMessage(false, true, false, "Bad Request");
                } else if (error.response.status === 404) {
                    $("#temp").children("div").remove();
                    this.showMessage(false, true, false, "No Data Found");
                }
            });
    }

    show = (key, id, name) => {
        $("#graphAnime").hide();
        $("#graphHeader").text(name);
        this.setState({ series: [], eventName: name });
        this.showMessage(false, false, false, "");
        $(".box").hide();
        axios({ method: 'GET', url: '/api/asset/event?id=' + id + "&key=" + key })
            .then((response) => {
                console.log(name, " Responsegraph=====>", response);
                let data = response.data;
                if (response.status === 200) {
                    if (data.length !== 0) {
                        this.chart_Option(["#0000ff"]);
                        let graphData = [], graphName = name;
                        for (let i = 0; i < data.length; i++) {
                            let time = data[i].lastseen.substring(0, 19).replace("T", " ");
                            let date = new Date(time);
                            let ms = date.getTime();
                            if (name === "Energy(kWh)") {
                                graphName = name
                                graphData.push([ms, data[i].energy_diff.toFixed(0)]);
                            } else if (name === "Temperature Front(°C)") {
                                graphName = name
                                graphData.push([ms, data[i].tempf.toFixed(0)]);
                            } else if (name === "Temperature Back(°C)") {
                                graphName = name
                                graphData.push([ms, data[i].tempb.toFixed(0)]);
                            } else if (name === "Humidity Front(RH)") {
                                graphName = name
                                graphData.push([ms, data[i].humidityf.toFixed(0)]);
                            } else if (name === "Humidity Back(RH)") {
                                graphName = name
                                graphData.push([ms, data[i].humidityb.toFixed(0)]);
                            } else if (name === "Voltage(V)") {
                                graphName = name
                                graphData.push([ms, data[i].voltage.toFixed(0)]);
                            } else if (name === "Current(A)") {
                                graphName = name
                                graphData.push([ms, data[i].current.toFixed(0)]);
                            } else if (name === "Power Factor") {
                                graphData.push([ms, data[i].power.toFixed(0)]);
                            } else if (name === "Coldspot" || name === "Hotspot" || name === "High-Power") {
                                graphData.push([ms, data[i].eventValue]);
                            }
                        }
                        this.setState({
                            series: [{ name: graphName, data: graphData }]
                        });
                        this.showMessage(false, false, false, "");
                    } else {
                        $("#graphAnime").show();
                        this.setState({ series: [] });
                    }
                }
            })
            .catch((error) => {
                console.log("error===>", error);
                $("#graphAnime").show();
                if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                } else if (error.response.status === 400) {
                    this.showMessage(false, true, false, "Bad Request");
                } else if (error.response.status === 404) {
                    $("#temp").children("div").remove();
                    this.showMessage(false, true, false, "No Data Found");
                }
            });
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
        clearTimeout(this.messageTimeout);
    }

    render() {
        const { alerts, series, error, message, jsonData1 } = this.state;
        return (
            <div id='divheight'
                style={{
                    float: "right",
                    width: "95%",
                    background: "#E5EEF0",
                    marginLeft: "60px",
                    overflow: "hidden"
                }}>
                <div style={{ marginTop: "30px", marginLeft: "60px", }}>
                    <span className="main_header">ASSET DETAILS</span>
                    <div className="underline" style={{ marginBottom: "25px" }}></div>
                    <div style={{ display: 'inline-block' }}>
                        <div id="img_container" style={{ position: "relative" }}>
                            <img id="rackImg"
                                style={{position: "absolute"}} alt="" />
                        </div>
                    </div>
                    <div className='alertdiv'>
                        <div className='alertdiv_header'>
                            <span style={{ color: 'white', fontWeight: 700 }}>Alerts</span>
                        </div>
                        {alerts.length !== 0 &&
                            (alerts.map((item, index) => (
                                <div key={index}
                                    style={{
                                        marginTop: "4px", display: "flex",
                                        alignItems: "center"
                                    }}>
                                    <Lottie
                                        options={{
                                            loop: true,
                                            autoplay: true,
                                            animationData: item.animData,
                                            rendererSettings: {
                                                preserveAspectRatio: 'xMidYMid slice'
                                            }
                                        }}
                                        style={{ margin: "0", marginLeft: "30px" }}
                                        width={18}
                                        height={18}
                                    />
                                    <span style={{
                                        fontWeight: '700',
                                        fontSize: "13px",
                                        color: "#6e737e",
                                        marginTop: "-4px",
                                        marginLeft: "5px",
                                        display: 'inline-block',
                                    }}>{item.type}</span>
                                </div>
                            )))
                        }
                    </div>

                    <div style={{
                        display: "flex",
                        marginLeft: '250px',
                        marginTop: "-10px",
                    }}>
                        <div className="cardDiv">
                            <span style={{
                                fontSize: '22px',
                                color: '#00629B'
                            }}>
                                <i className="fas fa-map-marked-alt"></i>
                            </span> &nbsp;
                            <span style={{
                                color: '#00629B',
                                fontSize: '22px', fontWeight: 700
                            }}>U-Location</span>
                            <div className='childselect' style={{ marginTop: "8px" }}>
                                <div>
                                    <span style={{ width: '100px' }}>U-Location </span>
                                    <span> : &nbsp;
                                        {jsonData1.location}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.uLocation("location", jsonData1.id)}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '100px' }}>Asset Name </span>
                                    <span> : &nbsp;
                                        {jsonData1.name}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '100px' }}>Rack Name </span>
                                    <span> : &nbsp;
                                        {jsonData1.placedInName}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '100px' }}>Asset ID </span>
                                    <span> : &nbsp;
                                        {jsonData1.tagid}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '100px' }}>Rack ID </span>
                                    <span> : &nbsp;
                                        {jsonData1.placedInMacid}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="cardDiv">
                            <span style={{
                                fontSize: '22px',
                                color: '#00629B'
                            }}>
                                <i className="fas fa-info-circle"></i>
                            </span> &nbsp;
                            <span style={{
                                color: '#00629B',
                                fontSize: '22px', fontWeight: 700
                            }}>Basic Info</span>
                            <div className='childselect' style={{ marginTop: "15px" }}>
                                <div>
                                    <span style={{ width: '83px' }}>Data Center </span>
                                    <span style={{ color: '#00629B', fontWeight: 500 }}> : &nbsp;
                                        {jsonData1.datacenter}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '83px' }}>Manufacturer </span>
                                    <span style={{ color: '#00629B', fontWeight: 500 }}> : &nbsp;
                                        {jsonData1.manufacturer}
                                    </span>
                                </div>
                                <div >
                                    <span style={{ width: '83px' }}>Supplier </span>
                                    <span style={{ color: '#00629B', fontWeight: 500 }}> : &nbsp;
                                        {jsonData1.supplier}
                                    </span>
                                </div>
                                <div >
                                    <span style={{ width: '83px' }}>Address </span>
                                    <span style={{ color: '#00629B', fontWeight: 500 }}> : &nbsp;
                                        {jsonData1.address}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="cardDiv">
                            <span style={{
                                fontSize: '22px',
                                color: '#00629B'
                            }}>
                                <i className="fas fa-user-cog"></i>
                            </span> &nbsp;
                            <span style={{
                                color: '#00629B',
                                fontSize: '22px', fontWeight: 700
                            }}>Maintenance  Info</span>
                            <div className='childselect' style={{ marginTop: "15px" }}>
                                <div>
                                    <span style={{ width: '130px' }}>Maintenance Staff</span>
                                    <span> : &nbsp;
                                        {jsonData1.maintenancestaffname}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '130px' }}>Maintenance Cycle</span>
                                    <span> : &nbsp;
                                        {jsonData1.maintenancecycle}
                                    </span>
                                </div>
                                <div >
                                    <span style={{ width: '130px' }}>Maintenance Contact </span>
                                    <span> : &nbsp;
                                        {jsonData1.maintenancecontact}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        marginTop: '10px',
                        marginLeft: '250px',
                    }}>
                        <div className="cardDiv cardDiv1">
                            <span style={{
                                fontSize: '22px',
                                color: '#00629B'
                            }}>
                                <i className="far fa-battery-bolt"></i>
                            </span> &nbsp;
                            <span style={{
                                color: '#00629B',
                                fontSize: '22px', fontWeight: 700
                            }}>Energy Info</span>
                            <div className='childselect' style={{ marginTop: "5px" }}>
                                <div>
                                    <span style={{ width: '115px' }}>Voltage(V) </span>
                                    <span> : &nbsp;
                                        {jsonData1.voltage}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("voltage", jsonData1.id, "Voltage(V)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '115px' }}>Energy(kWh) </span>
                                    <span> : &nbsp;
                                        {jsonData1.energy}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("energy", jsonData1.id, "Energy(kWh)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '115px' }}>Current(A) </span>
                                    <span> : &nbsp;
                                        {jsonData1.current}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("current", jsonData1.id, "Current(A)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '115px' }}>Power Factor </span>
                                    <span> : &nbsp;
                                        {jsonData1.power}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("power", jsonData1.id, "Power Factor")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '115px' }}>High-Power </span>
                                    <span> : &nbsp;
                                        {jsonData1.highpowerevent}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show(3, jsonData1.id, "High-Power")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                            </div>

                            <hr />
                            <div style={{ marginTop: "1px" }}>
                                <span style={{
                                    fontSize: '22px',
                                    color: '#00629B'
                                }}>
                                    <i className="fas fa-temperature-hot"></i>
                                </span> &nbsp;
                                <span style={{
                                    color: '#00629B',
                                    fontSize: '22px', fontWeight: 700
                                }}>Thermal Info</span>
                            </div>
                            <div className='childselect' style={{ marginTop: "2px" }}>
                                <div>
                                    <span style={{ width: '145px' }}>Coldspot </span>
                                    <span> : &nbsp;
                                        {jsonData1.coldspot}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show(2, jsonData1.id, "Coldspot")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '145px' }}>Hotspot </span>
                                    <span> : &nbsp;
                                        {jsonData1.hotspot}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show(1, jsonData1.id, "Hotspot")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '145px' }}>Temperature Front(°C) </span>
                                    <span> : &nbsp;
                                        {jsonData1.tempf}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("tempf", jsonData1.id, "Temperature Front(°C)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div >
                                    <span style={{ width: '145px' }}>Temperature Back(°C) </span>
                                    <span> : &nbsp;
                                        {jsonData1.tempb}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("tempb", jsonData1.id, "Temperature Back(°C)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div>
                                    <span style={{ width: '145px' }}>Humidity Front(RH) </span>
                                    <span> : &nbsp;
                                        {jsonData1.humidityf}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("humidityf", jsonData1.id, "Humidity Front(RH)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                                <div >
                                    <span style={{ width: '145px' }}>Humidity Back(RH) </span>
                                    <span> : &nbsp;
                                        {jsonData1.humidityb}
                                        <i style={{ marginLeft: "5px", cursor: "pointer" }}
                                            onClick={() => this.show("humidityb", jsonData1.id, "Humidity Back(RH)")}
                                            className="fas fa-plus-circle"></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="cardDiv cardDiv2">
                            <span id="graphHeader" style={{
                                color: '#00629B', marginLeft: "20px",
                                fontSize: '22px', fontWeight: 700
                            }}></span>
                            <div className="box" style={{ width: "98.3%", height: "50vh", }}>
                                <TableScrollbar>
                                    <table style={{ width: "95%" }} id="table_det">
                                        <thead style={{ fontSize: "13px" }}></thead>
                                        <tbody style={{ fontSize: "13px" }}></tbody>
                                    </table>
                                </TableScrollbar>
                            </div>
                            {error && (
                                <div
                                    style={{ marginLeft: "30px", marginBottom: "-20px", color: "red" }}>
                                    <strong>{message}</strong>
                                </div>
                            )}
                            {series.length > 0 ? (
                                <div id="chart" style={{
                                    borderRadius: "10px", height: "60vh"
                                }}>
                                    <div id="chart-timeline">
                                        {this.options !== undefined && (
                                            <ApexCharts options={this.options}
                                                series={series}
                                                type="area"
                                                height={330} />
                                        )}
                                    </div>
                                </div>
                            ) : (null)}
                            <div
                                id="graphAnime"
                                style={{
                                    width: "93%",
                                    height: "46vh",
                                    border: "1px solid #d5d5d5",
                                    marginTop: "20px",
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
                                    width={350}
                                    height={300}
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

                {/* SessionOut Component used here!  */}
                <SessionOut />
            </div>
        )
    }
}
