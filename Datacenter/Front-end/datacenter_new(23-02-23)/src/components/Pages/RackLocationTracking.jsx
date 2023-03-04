/* eslint-disable no-loop-func */
import React, { Component } from 'react'
import axios from "axios";
import $ from "jquery";
import ApexCharts from 'react-apexcharts';
import "./radiobutton.css";
import { linkClicked } from '../sidebar/Leftsidebar';
import { SessionOut, floorMap, chartOption, DataLoading } from "./Common";
import Lottie from 'react-lottie';
import animationData from '../animations/nographdata.json';

export default class RackTracking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            display: "",
            error: false,
            rackID: "",
            rackName: "",
            assetName: "",
            series: [],
            animateData: [0, 0, 0],
            alerts: [],
            loading: true,
        };
    }

    chart_Option = async (graphColor) => {
        let value = await chartOption(graphColor, "yyyy-MM-dd HH:mm");
        this.options = value;
    }

    componentDidMount = async () => {
        linkClicked(2, "#bc2a8d");
        this.floor = await floorMap();
        if (this.floor.floorData.length !== 0) {
            this.floorData = this.floor.floorData;
            this.plotFloorMap();
        } else {
            this.setState({ error: this.floor.error, message: this.floor.message });
        }
    }

    plotFloorMap = () => {
        let floorID = $("#fname").val();
        this.fimage = this.floorData[floorID];
        this.fWidth = this.fimage.width;
        this.fHeight = this.fimage.height;
        let imgheight = ($(window).height() - 157)
        $("#tempimg").attr({ "src": this.fimage.image, "alt": "temp" });
        $("#tempimg").attr("style", "width:auto;height:" + imgheight + "px");
        $("#lastupdated").css("display", "none");
        $("#temp").children("div").remove();
        $("#temp .sensors").remove();
        this.timeout = setTimeout(() => {
            this.rackCalling();
        }, 1 * 1000);
    };

    rackCalling = () => {
        this.rackMonitor("first");
        this.interval1 = setInterval(() => {
            this.rackMonitor("repeat");
        }, 15 * 1000);
    }

    rackMonitor = (rackCall) => {
        this.setState({ rackName: "", rackID: "" });
        $("#displayModal1").hide();
        if (rackCall === "first") {
            this.setState({ loading: true });
        } else {
            this.setState({ loading: false });
        }
        let floorID = $("#fname").val();
        this.wp = document.getElementById("temp").clientWidth;
        this.hp = document.getElementById("temp").clientHeight;
        axios({
            method: "GET",
            url: "/api/rack/monitor?id=" + this.floorData[floorID].id,
        })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    let wpx = this.wp / this.fWidth;
                    let hpx = this.hp / this.fHeight;
                    console.log("Rack Response=====>", response);
                    if (response.data.length !== 0) {
                        $("#temp").children("div").remove();
                        let data = response.data.asset;
                        $("#last_seen").text("Last Seen : " +
                            data[0].timestamp.replace("T", " ").substring(0, 19));
                        for (let i = 0; i < data.length; i++) {
                            let xaxis = 0, yaxis = 0;
                            xaxis = parseInt(wpx * parseFloat(data[i].x));
                            yaxis = parseInt(hpx * parseFloat(data[i].y));
                            let width = Math.ceil((data[i].x1 - data[i].x) * wpx) - 2;
                            let height = Math.ceil((data[i].y1 - data[i].y) * hpx) - 2;
                            let childDiv1 = document.createElement("div");
                            $(childDiv1).attr("id", data[i].name);
                            $(childDiv1).attr("class", "rack");
                            let bgColor = "";
                            if (data[i].usage === 42) {
                                bgColor = "rgba(255,0,0,0.7)";
                            }
                            else if (data[i].usage === 0) {
                                bgColor = "rgba(0,204,0,0.7)";
                            }
                            else {
                                let value1 = (data[i].usage * 2.3).toFixed(1);
                                let value2 = 0;
                                if (data[i].usage < 39) {
                                    value2 = ((data[i].usage * 2.3) + 10).toFixed(1);
                                } else {
                                    value2 = ((data[i].usage * 2.3) + 5).toFixed(1);
                                }

                                bgColor = "linear-gradient(to right, rgba(255,0,0,0.8) " +
                                    value1 + "%, rgba(0,204,0,0.7) " + value2 + "%)";
                            }
                            $(childDiv1).attr(
                                "style",
                                "border:0.4px solid black;background:" + bgColor +
                                ";position: absolute; cursor: pointer; left:" +
                                xaxis + "px; top:" + yaxis + "px;" +
                                "width:" + width + "px;height:" + height + "px;"
                            );

                            if (data[i].alert > 0) {
                                $(childDiv1).css("animation", "blink 0.7s linear infinite");
                                $(childDiv1).mouseover(() => {
                                    $(childDiv1).css("animation", "blink 0.1s linear ");
                                })
                                $(childDiv1).mouseleave(() => {
                                    $(childDiv1).css("animation", "blink 0.7s linear infinite");
                                })
                                let dts = data[i].alerts;
                                let alertData = [];
                                for (let i = 0; i < dts.length; i++) {
                                    alertData.push(dts[i].value);
                                }

                                let temp = alertData.includes(8) === true ? "<div class='modal_alert modal_alert1'><span>Temperature</span><i class='fas fa-exclamation-triangle'></i></div>" : "<div class='modal_alert'><span>Temperature</span><i class='fas fa-check'></i></div>"

                                let humi = alertData.includes(9) === true ? "<div class='modal_alert modal_alert1'><span>Humidity</span><i class='fas fa-exclamation-triangle'></i></div>" : "<div class='modal_alert'><span>Humidity</span><i class='fas fa-check'></i></div>"

                                let cap = alertData.includes(1) === true ? "<div class='modal_alert modal_alert1'><span>Capacity</span><i class='fas fa-exclamation-triangle'></i></div>" : "<div class='modal_alert'><span>Capacity</span><i class='fas fa-check'></i></div>"

                                let ener = alertData.includes(10) === true ? "<div class='modal_alert modal_alert1'><span>Energy</span><i class='fas fa-exclamation-triangle'></i></div>" : "<div class='modal_alert'><span>Energy</span><i class='fas fa-check'></i></div>"


                                let alertDiv = document.createElement("div");
                                $(alertDiv).attr("class", "modal-content1");
                                let divv = "<div style='background-color:#ff4d4d;' class='modalheader1'><span>" +
                                    "<i class='fas fa-exclamation-triangle'></i> Attention Required</span ></div ><div style='display: flex'><div style='width: 234px'><span class='modal_label'>Rack Name </span>: <span class='modalval'>" + data[i].name + "</span> <br /><span class='modal_label'>Rack ID </span>: <span class='modalval'>" + data[i].rack + "</span><br /><span class='modal_label'>Available U's</span>: <span class='modalval'>" + data[i].available + "</span><br /></div><div style='width: 141px;'><span class='modal_label'>Capacity</span>: <span class='modalval'>" + data[i].capacity + "</span><br /><span class='modal_label'>No.of Assets</span>: <span class='modalval'>" + data[i].count + "</span><br /><span class='modal_label'>Utilization</span>: <span class='modalval'>" + data[i].utilization + "%</span><br /></div></div><hr /><div style='display: flex;'><div>" + temp + humi + "</div><div style='margin-left: 30px;'>" + cap + ener + "</div></div>"
                                $(alertDiv).append(divv);
                                $(childDiv1).append(alertDiv);
                            } else {
                                let alertDiv = document.createElement("div");
                                $(alertDiv).attr("class", "modal-content1");
                                $(alertDiv).append(`
                                            <div class='modalheader1'>
                                                <span>Normal</span>
                                            </div>
                                            <div style="display: flex">
                                                <div style="width: 234px">
                                                    <span class='modal_label'>Rack Name </span>: <span class='modalval'>` + data[i].name + `</span> <br />
                                                    <span class='modal_label'>Rack ID </span>: <span class='modalval'>`+ data[i].rack + `</span><br />
                                                    <span class='modal_label'>Available U's</span>: <span class='modalval'>`+ data[i].available + `</span><br />
                                                </div>
                                                <div style="width: 141px;">
                                                    <span class='modal_label'>Capacity</span>: <span class='modalval'>`+ data[i].capacity + `</span><br />
                                                    <span class='modal_label'>No.of Assets</span>: <span class='modalval'>`+ data[i].count + `</span><br />
                                                    <span class='modal_label'>Utilization</span>: <span class='modalval'>`+ data[i].utilization + `%</span><br />
                                                </div>
                                            </div>
                                            <hr />
                                            <div style="display: flex;">
                                                <div>
                                                    <div class='modal_alert'>
                                                        <span>Temperature</span> 
                                                        <i class="fas fa-check"></i>
                                                    </div>
                                                    <div class='modal_alert'>
                                                        <span>Humidity</span> 
                                                        <i class="fas fa-check"></i>
                                                    </div>
                                                </div>
                                                <div style="margin-left: 30px;">
                                                    <div class='modal_alert'>
                                                        <span>Capacity</span> 
                                                        <i class="fas fa-check"></i>
                                                    </div>
                                                    <div class='modal_alert'>
                                                        <span>Energy</span>
                                                        <i class="fas fa-check"></i>
                                                    </div>
                                                </div>
                                            </div>`);
                                $(childDiv1).append(alertDiv);
                            }
                            $(childDiv1).on('click', () => {
                                sessionStorage.removeItem("racktracking_rackId")
                                this.animation(data[i].name, data[i].rack, "show")
                            });
                            this.setState({ loading: false });
                            $("#temp").append(childDiv1);
                        }

                        const racktrack = sessionStorage.getItem("racktracking_rackId");
                        let jsonData = JSON.parse(racktrack)
                        console.log("Rack Details---------->", jsonData);
                        if (jsonData !== null) {
                            if (jsonData.rackName.length !== 0 || jsonData.rackId.length !== 0) {
                                this.animation(jsonData.rackName, jsonData.rackId, "show");
                            }
                        }
                        this.showMessage(false, false, false, "");
                    } else {
                        $("#temp").children("div").remove();
                        this.setState({ loading: false });
                        this.showMessage(false, true, false, "No Rack Data Found");
                    }
                }
            })
            .catch((error) => {
                console.log("error===>", error);
                this.setState({ loading: false });
                if (error.response.status === 403) {
                    $("#displayModal1").css("display", "none")
                    $("#displayModal").css("display", "block");
                } else if (error.response.status === 400) {
                    this.showMessage(false, true, false, "Bad Request");
                } else if (error.response.status === 404) {
                    $("#temp").children("div").remove();
                    this.showMessage(false, true, false, "No Rack Data Found");
                }
            });
    };

    redirect = (id) => {
        axios({ method: 'GET', url: '/api/asset?tagid=' + id })
            .then((response) => {
                console.log("response===>", response)
                let data = response.data
                if (data.length !== 0 && response.status === 200) {
                    sessionStorage.setItem("assethistory", id);
                    window.location.pathname = "/assetdetail"
                } else {
                    this.showMessage(false, true, false, "No Data Found");
                }
            })
            .catch((error) => {
                console.log("error====>", error);
                if (error.response.status === 403) {
                    $("#displayModal1").css("display", "none")
                    $("#displayModal").css("display", "block");
                } else if (error.response.status === 400) {
                    this.showMessage(false, true, false, "Bad Request");
                } else if (error.response.status === 404) {
                    $("#temp").children("div").remove();
                    this.showMessage(false, true, false, "No Data Found");
                }
            })
    }

    animation = (rackName, rackId, status) => {
        console.log(rackName, "Animation---------->", rackId);
        this.setState({
            loading: true,
            rackID: rackId, rackName: rackName,
            assetName: "", display: "asset", series: []
        });
        clearInterval(this.interval1);
        $("#img_container .assets").remove();
        $("input[name=rack]").val(['asset']);
        if (status === "show") {
            $("#screen").animate({ "right": "0px" }, "slow");
            this.radioBtnChange(rackId);
        } else if (status === "hide") {
            clearInterval(this.interval);
            this.rackCalling();
            $("#screen").animate({ "right": "-70vw" }, "slow");
        }
    }

    radioBtnChange = (rackid) => {
        clearInterval(this.interval);
        $("#graphAnime").hide();
        $("#graphAnime").css("width", "80%");
        $("[name='rack']").removeAttr("checked");
        let radioCheck = $("input[name='rack']:checked").val();
        this.setState({ display: radioCheck, animateData: [0, 0, 0] });
        $("input[name=rack]").val([radioCheck]);
        $(".rack-asset-info").css("margin-left", "30%")
        $("#graph_det").css({ "margin-left": "28%", "width": "74%" });
        this.assetData(radioCheck, rackid, "first");
        this.setState({ series: [] })
        this.interval = setInterval(() => {
            this.assetData(radioCheck, rackid, "continuous");
        }, 15 * 1000)
    }

    assetData = (radioCheck, rackId, callStatus) => {
        $("#img_container .assets").remove();
        $("#rackImg").attr("src", "../images/mainframe.png");
        $("#rackImg").css({ "width": "200px", "height": "522px" });
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
        if (callStatus === "first") {
            this.setState({ loading: true });
        }
        axios({ method: "GET", url: "/api/rack/chart?id=" + rackId + "&&key=" + radioCheck })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    let dt = response.data;
                    console.log(radioCheck + ' Response==========>', response);
                    if (dt.length !== 0) {
                        let assetDt = dt.data;
                        if (assetDt.length !== 0) {
                            this.setState({ animateData: [dt.value1, dt.value2, dt.value3] })
                            for (let i = 0; i < assetDt.length; i++) {
                                if (assetDt[i].asset.location !== null) {
                                    $("#asset_" + assetDt[i].asset.location).css({
                                        "background": "rgba(255,35,0,0.6)",
                                        "cursor": "pointer"
                                    });
                                    $("#asset_" + assetDt[i].asset.location).attr("title",
                                        "AssetName : " + assetDt[i].asset.name +
                                        "\nAssetID : " + assetDt[i].asset.tagid +
                                        "\nLocation : U" + assetDt[i].asset.location +
                                        "\nLastSeen : " + assetDt[i].asset.lastseen.substring(0, 19).replace("T", " "));
                                    if (assetDt[i].alert.length > 0) {
                                        $("#asset_" + assetDt[i].asset.location).css("animation", "blink 1s linear infinite");
                                    }
                                    $("#asset_" + assetDt[i].asset.location).on("click", () => this.redirect(assetDt[i].asset.id))
                                }
                            }
                            this.showMessage(false, false, false, "");
                        }
                        let dtGraph = dt.graph;
                        if (dtGraph.length !== 0) {
                            if (callStatus === "first") {
                                let occupancy = [], tempF = [], tempB = [], humiF = [], humiB = [], energy = [];
                                if (radioCheck === "asset") {
                                    this.chart_Option(["#0000ff"]);
                                    for (let i = 0; i < dtGraph.length; i++) {
                                        let time = dtGraph[i].time.substring(0, 19).replace("T", " ");
                                        let date = new Date(time);
                                        let ms = date.getTime();
                                        occupancy.push([ms, dtGraph[i].count]);
                                    }
                                    this.setState({
                                        series: [
                                            { name: 'Occupancy', data: occupancy }
                                        ]
                                    });
                                } else if (radioCheck === "thermal") {
                                    this.chart_Option(["#ff1a1a", "#ff9900", "#00b386", "#009933"]);
                                    this.setState({ series: [] })
                                    for (let i = 0; i < dtGraph.length; i++) {
                                        let time = dtGraph[i].time;
                                        let date = new Date(time);
                                        let ms = date.getTime();
                                        tempF.push([ms, dtGraph[i].tempf.toFixed(0)]);
                                        tempB.push([ms, dtGraph[i].tempb.toFixed(0)]);
                                        humiF.push([ms, dtGraph[i].humidityf.toFixed(0)]);
                                        humiB.push([ms, dtGraph[i].humidityb.toFixed(0)]);
                                    }
                                    this.setState({
                                        series: [
                                            { name: 'Temperature(F)(°C)', data: tempF },
                                            { name: 'Temperature(B)(°C)', data: tempB },
                                            { name: 'Humidity(F)(RH)', data: humiF },
                                            { name: 'Humidity(B)(RH)', data: humiB },
                                        ]
                                    });
                                } else if (radioCheck === "energy") {
                                    this.chart_Option(["#6600cc"]);

                                    for (let i = 0; i < dtGraph.length; i++) {
                                        let time = dtGraph[i].time;
                                        let date = new Date(time);
                                        let ms = date.getTime();
                                        energy.push([ms, dtGraph[i].energy.toFixed(0)]);
                                    }
                                    this.setState({
                                        series: [{ name: 'Energy(kWh)', data: energy }]
                                    });
                                }
                            }
                        } else {
                            this.setState({ series: [], loading: false });
                            $("#graphAnime").show();
                            this.showMessage(false, false, false, "");
                        }
                        this.setState({ loading: false });
                        this.showMessage(false, false, false, "");
                    } else {
                        $("#graphAnime").show();
                        this.setState({ series: [], loading: false });
                        this.showMessage(false, false, false, "");
                    }
                }
            })
            .catch((error) => {
                console.log("------>", error);
                this.setState({ loading: false });
                if (error.response.status === 403) {
                    $("#displayModal1").css("display", "none")
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
        clearTimeout(this.timeout);
        clearTimeout(this.messageTimeout)
        clearInterval(this.interval);
        clearInterval(this.interval1);
    }

    render() {
        const { error, message, series,
            rackID, rackName, loading,
            display, animateData,
        } = this.state;
        return (
            <div id="realparent" style={{
                float: "right", width: "95%", background: '#E5EEF0',
                height: '100vh', marginLeft: '60px', position: "relative",
                overflow: "hidden",
            }}>
                <div id="realcontent" style={{ marginTop: '30px', marginLeft: '60px' }}>
                    <span className='main_header'>REAL-TIME TRACKING</span>
                    <div className='underline'></div>
                    <div className="inputdiv"
                        style={{
                            display: "flex", position: "relative",
                            marginTop: '20px'
                        }}>
                        <select
                            id="fname"
                            onChange={() => {
                                this.plotFloorMap();
                            }}>
                        </select>

                        <div
                            id="last_seen"
                            style={{
                                position: "absolute",
                                fontWeight: "600",
                                left: "30%",
                                color: "#00629b",
                                fontSize: "19px"
                            }}></div>
                    </div>

                    {error && (
                        <div style={{ margin: "20px 0", color: 'red' }}>
                            <strong>{message}</strong>
                        </div>
                    )}
                    <div
                        id="temp"
                        style={{
                            display: "block",
                            position: "relative",
                            width: "fit-content",
                        }}>
                        <img id="tempimg" alt=""></img>

                    </div>

                </div>
                <div id="screen" style={{
                    top: "0px", right: "-70vw",
                    position: "absolute", width: "70vw",
                    height: "100vh",
                    background: "#ffffff",
                    boxShadow: "#0000005c -2px -3px 20px 0px",
                }}>
                    <div style={{ margin: "5px 26px" }}>
                        <div style={{ display: "flex" }}>
                            <h3>RackName : {rackName}</h3>
                            <div onClick={() => {
                                sessionStorage.removeItem("racktracking_rackId")
                                this.animation("", "", "hide")
                            }}
                                style={{
                                    cursor: "pointer",
                                    position: "absolute",
                                    fontSize: "22px",
                                    color: "#ff5454",
                                    marginTop: "20px", right: "12px"
                                }}>
                                <span><i className="far fa-times-circle"></i></span>
                            </div>
                        </div>

                        <div id="radio_container" style={{ display: "flex", marginTop: '-5px' }}
                            onChange={() => this.radioBtnChange(rackID)}>
                            <label className='radiolabels'>
                                <input value="asset" type="radio" id="asset" name="rack" />
                                <span className='labelspan'>Asset</span>
                            </label>
                            <label className='radiolabels'>
                                <input value="thermal" type="radio" id="thermal" name="rack" />
                                <span className='labelspan'>Thermal</span>
                            </label>
                            <label className='radiolabels'>
                                <input value="energy" type="radio" id="energy" name="rack" />
                                <span className='labelspan'>Energy</span>
                            </label>
                        </div>

                        <div id="screen_content">
                            <span style={{ width: '12px', height: '12px', marginLeft: '5px', background: 'green', display: 'inline-block' }}></span>
                            <span style={{ paddingLeft: '3px' }}>Available</span>
                            <span style={{ width: '12px', height: '12px', background: 'red', display: 'inline-block', marginLeft: '29px' }}></span>
                            <span style={{ paddingLeft: '3px' }} >Occupied</span>

                            <div id="img_container"
                                style={{ position: "relative" }}>
                                <img id="rackImg"
                                    style={{
                                        position: "absolute",
                                    }} alt="" />
                            </div>
                            <div id="asset_details" style={{ display: "flex" }}>
                                {display === "asset" && (
                                    <div className="card" >
                                        <div className="content">
                                            <h3 style={{ marginTop: "22px" }}>Rack Details</h3>
                                            <div className="back from-left">
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">Capacity : </p>
                                                    <span className="ass-val" id='assetcapacity'>
                                                        {animateData[1]} </span>
                                                </div>
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">AssetCount :</p>
                                                    <span className="ass-val" id='assetcount'>
                                                        {animateData[0]}</span>
                                                </div>
                                                <div style={{ display: "flex" }} >
                                                    <p className="ass-info">Available U's : </p>
                                                    <span className="ass-val" id='assetuse'>
                                                        {animateData[2]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                )}

                                {display === "thermal" && (
                                    <div className="card">
                                        <div className="content">
                                            <h3 style={{ marginTop: "22px" }}>Thermal Details</h3>
                                            <div className="back from-left">
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">Min.Temp(°C) : </p>
                                                    <span className="ass-val" id='mintemp'>
                                                        {animateData[0].toFixed(1)}</span>
                                                </div>
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">Max.Temp(°C) : </p>
                                                    <span className="ass-val" id='maxtemp'>
                                                        {animateData[1].toFixed(1)}</span>
                                                </div>
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">Avg.Temp(°C) : </p>
                                                    <span className="ass-val" id='avgtemp'>
                                                        {animateData[2].toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                )}

                                {display === "energy" && (
                                    <div className="card">
                                        <div className="content">
                                            <h3 style={{ marginTop: "22px" }}>Energy Details</h3>
                                            <div className="back from-left">
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info" >Net Power(kWh): </p>
                                                    <span className="ass-val" id='netpower'>
                                                        {animateData[0].toFixed(1)}</span>
                                                </div>
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">Max.Power(kWh): </p>
                                                    <span className="ass-val" id='maxpower'>
                                                        {animateData[1].toFixed(1)}</span>
                                                </div>
                                                <div style={{ display: "flex" }}>
                                                    <p className="ass-info">Min.Power(kWh): </p>
                                                    <span className="ass-val" id='minpower'>
                                                        {animateData[2].toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                )}
                            </div>



                            <div id="graph_det" style={{ marginLeft: "27%", width: "74%", marginTop: '1%' }}>
                                {display === "asset" && series.length > 0 && (
                                    <span className='graph_det_name'>Capacity Graph</span>
                                )}
                                {display === "thermal" && series.length > 0 && (
                                    <span className='graph_det_name'>Thermal Graph</span>
                                )}
                                {display === "energy" && series.length > 0 && (
                                    <span className='graph_det_name'>Energy Graph</span>
                                )}
                                {series.length > 0 ? (
                                    <div id="chart" style={{
                                        marginTop: "30px",
                                        borderRadius: "10px", height: "70vh"
                                    }}>
                                        <div id="chart-timeline">
                                            {this.options !== undefined && (
                                                <ApexCharts options={this.options}
                                                    series={series}
                                                    // type="area"
                                                    height={450} />
                                            )}
                                        </div>
                                    </div>
                                ) : (null)}
                                <div
                                    id="graphAnime"
                                    style={{
                                        width: "93%",
                                        height: "67vh",
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
                                        width={400}
                                        height={400}
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
                            left: "0%"
                        }} className="frame">
                        <DataLoading />
                    </div>
                )}
            </div>
        )
    }
}
