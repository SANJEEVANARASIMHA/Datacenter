import React, { Component } from "react";
import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import "./styles.css";
import $ from "jquery";
import axios from "axios";
import { RACKDATA } from "../Pages/AllRackData";
import { SessionOut, DataLoading } from "../Pages/Common";

export default class ServerPositioning extends Component {
    constructor() {
        super();
        this.state = {
            error: false,
            message: "",
            loading: false,
            labels: [
                "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00",
                "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
                "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00", ""
            ],
            values: [
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
            ],
        }
    }

    componentDidMount() {
        this.graphDatas(this);
        this.floorMap();
    }

    floorMap = () => {
        axios({
            method: "GET",
            url: "/api/uploadmap",
        })
            .then((response) => {
                console.log(response);
                let data = response.data;
                if (data.length !== 0 && response.status === 200) {
                    for (let i = 0; i < data.length; i++) {
                        $("#fname").append(
                            "<option  value=" + data[i].id + " >" + data[i].name + "</option>"
                        );
                    }
                } else {
                    this.showMessage(false, true, false, "No Floor Map Uploaded. Please Upload Floor Map To Begin");
                }
            })
            .catch((error) => {
                console.log(error);
                if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                }
            });
    }

    graphDatas = (this_key) => {
        const { labels, values } = this.state;
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        var cnvs = document.createElement("canvas");
        $(cnvs).attr("id", "tempChart");
        $(cnvs).attr("width", "1100px");
        $(cnvs).attr("height", "400px");
        $(cnvs).css("margin", "10px");
        $("#chartCanvas").append(cnvs);
        const tempChart = $("#tempChart");
        new Chart(tempChart, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "CPU",
                        yAxisID: "y",
                        data: values,
                        pointHitRadius: 5,
                        fill: true,
                        pointHoverRadius: 10,
                        borderWidth: 1,
                        backgroundColor: "rgba(54, 162, 235, 0.4)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        tension: 0.3
                    }
                ]
            },
            options: {
                barPercentage: 1,
                categoryPercentage: 1.01,
                scales: {
                    y: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: {
                            beginAtZero: true,
                        },
                        labels: "Cpu Utilize"
                    },
                    x: {
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true,
                            display: true,
                            align: "end",
                            callback: (v, i) => (i === 0 ? "" : labels[i - 1])
                        }
                    }
                },
                onHover: function (e) {
                    const point = e.chart.getElementsAtEventForMode(
                        e,
                        "nearest",
                        { intersect: false },
                        false
                    );
                    if (point.length) e.native.target.style.cursor = "grab";
                    else e.native.target.style.cursor = "default";
                },
                responsive: false,
                plugins: {
                    legend: {
                        display: false,
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems, data) {
                                let ind = tooltipItems[0].dataIndex;
                                let labtime = "";
                                if (ind === 0) {
                                    labtime = "00:00";
                                } else {
                                    labtime = labels[tooltipItems[0].dataIndex - 1]
                                }
                                let lab = labtime + " - " + tooltipItems[0].label
                                return "Time: " + lab;
                            },
                            label: function (tooltipItems, data) {
                                return "Usage: " + tooltipItems.formattedValue + "%";
                            }
                        }
                    },
                    dragData: {
                        round: 0,
                        showTooltip: true,
                        onDragStart: function (e) {
                            // console.log("------------", e)
                        },
                        onDrag: function (e, datasetIndex, index, value) {
                            e.target.style.cursor = "grabbing";
                            if (value < 10) return false;
                        },
                        onDragEnd: function (e, datasetIndex, index, value) {
                            e.target.style.cursor = "default";
                            this_key.changeGraphData(index, value);
                        }
                    }
                }
            }
        });

    }

    changeGraphData = (index, val) => {
        const { values } = this.state;
        let ddd = [];
        for (let i = 0; i < values.length; i++) {
            if (i === index) {
                ddd.push(val);
            } else {
                ddd.push(values[i]);
            }
        }
    }

    changeZones = () => {
        let aisle = $("#aisle").val();
        this.selectedZones = []
        $("#subtn").css("display", "block");
        $("html").animate({ scrollTop: 400 }, "slow");
        $(".table_det").css("display", "none");
        if (aisle !== "") {
            $("#temp").css("display", "block");
            let data = [
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-01",
                    "x": 0.574,
                    "y": 0.723,
                    "x1": 1.336,
                    "y1": 1.923,
                    "name": "Rack1"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-02",
                    "x": 2.203,
                    "y": 0.723,
                    "x1": 2.965,
                    "y1": 1.923,
                    "name": "Rack2"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-03",
                    "x": 3.832,
                    "y": 0.723,
                    "x1": 4.594,
                    "y1": 1.923,
                    "name": "Rack3"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-04",
                    "x": 5.461,
                    "y": 0.723,
                    "x1": 6.223,
                    "y1": 1.923,
                    "name": "Rack4"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-05",
                    "x": 7.09,
                    "y": 0.723,
                    "x1": 7.852,
                    "y1": 1.923,
                    "name": "Rack5"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-06",
                    "x": 8.719,
                    "y": 0.723,
                    "x1": 9.481,
                    "y1": 1.923,
                    "name": "Rack6"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-07",
                    "x": 10.348,
                    "y": 0.723,
                    "x1": 11.11,
                    "y1": 1.923,
                    "name": "Rack7"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-08",
                    "x": 11.977,
                    "y": 0.723,
                    "x1": 12.739,
                    "y1": 1.923,
                    "name": "Rack8"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-09",
                    "x": 13.606,
                    "y": 0.723,
                    "x1": 14.368,
                    "y1": 1.923,
                    "name": "Rack9"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-0A",
                    "x": 15.235,
                    "y": 0.723,
                    "x1": 15.997,
                    "y1": 1.923,
                    "name": "Rack10"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-0B",
                    "x": 16.864,
                    "y": 0.723,
                    "x1": 17.626,
                    "y1": 1.923,
                    "name": "Rack11"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-0C",
                    "x": 18.493,
                    "y": 0.723,
                    "x1": 19.255,
                    "y1": 1.923,
                    "name": "Rack12"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-0D",
                    "x": 20.122,
                    "y": 0.723,
                    "x1": 20.884,
                    "y1": 1.923,
                    "name": "Rack13"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-0E",
                    "x": 21.751,
                    "y": 0.723,
                    "x1": 22.513,
                    "y1": 1.923,
                    "name": "Rack14"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-0F",
                    "x": 23.38,
                    "y": 0.723,
                    "x1": 24.142,
                    "y1": 1.923,
                    "name": "Rack15"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-10",
                    "x": 25.009,
                    "y": 0.723,
                    "x1": 25.771,
                    "y1": 1.923,
                    "name": "Rack16"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-11",
                    "x": 26.638,
                    "y": 0.723,
                    "x1": 27.4,
                    "y1": 1.923,
                    "name": "Rack17"
                },



                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-12",
                    "x": 0.574,
                    "y": 2.2,
                    "x1": 1.336,
                    "y1": 3.4,
                    "name": "Rack18"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-13",
                    "x": 2.203,
                    "y": 2.2,
                    "x1": 2.965,
                    "y1": 3.4,
                    "name": "Rack19"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-14",
                    "x": 3.832,
                    "y": 2.2,
                    "x1": 4.594,
                    "y1": 3.4,
                    "name": "Rack20"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-15",
                    "x": 5.461,
                    "y": 2.2,
                    "x1": 6.223,
                    "y1": 3.4,
                    "name": "Rack21"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-16",
                    "x": 7.09,
                    "y": 2.2,
                    "x1": 7.852,
                    "y1": 3.4,
                    "name": "Rack22"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-17",
                    "x": 8.719,
                    "y": 2.2,
                    "x1": 9.481,
                    "y1": 3.4,
                    "name": "Rack23"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-18",
                    "x": 10.348,
                    "y": 2.2,
                    "x1": 11.11,
                    "y1": 3.4,
                    "name": "Rack24"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-19",
                    "x": 11.977,
                    "y": 2.2,
                    "x1": 12.739,
                    "y1": 3.4,
                    "name": "Rack25"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-1A",
                    "x": 13.606,
                    "y": 2.2,
                    "x1": 14.368,
                    "y1": 3.4,
                    "name": "Rack26"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-1B",
                    "x": 15.235,
                    "y": 2.2,
                    "x1": 15.997,
                    "y1": 3.4,
                    "name": "Rack27"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-1C",
                    "x": 16.864,
                    "y": 2.2,
                    "x1": 17.626,
                    "y1": 3.4,
                    "name": "Rack28"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-1D",
                    "x": 18.493,
                    "y": 2.2,
                    "x1": 19.255,
                    "y1": 3.4,
                    "name": "Rack29"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-1E",
                    "x": 20.122,
                    "y": 2.2,
                    "x1": 20.884,
                    "y1": 3.4,
                    "name": "Rack30"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-1F",
                    "x": 21.751,
                    "y": 2.2,
                    "x1": 22.513,
                    "y1": 3.4,
                    "name": "Rack31"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-20",
                    "x": 23.38,
                    "y": 2.2,
                    "x1": 24.142,
                    "y1": 3.4,
                    "name": "Rack32"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-21",
                    "x": 25.009,
                    "y": 2.2,
                    "x1": 25.771,
                    "y1": 3.4,
                    "name": "Rack33"
                },
                {
                    "floor": 4,
                    "macid": "5a-c2-15-07-00-22",
                    "x": 26.638,
                    "y": 2.2,
                    "x1": 27.4,
                    "y1": 3.4,
                    "name": "Rack34"
                }
            ];
            let ractStart = [0, 34, 68, 102, 136, 170, 204]
            let temp_client = document.getElementById("temp");
            $("#tempimg").attr("src", "../images/rackzones/" + aisle + ".png");
            if (temp_client !== null) { // temp_client shouldn't be null value
                this.wp = document.getElementById("tempimg").clientWidth;
                this.hp = document.getElementById("tempimg").clientHeight;
                this.fWidth = 31.486;
                this.fHeight = 24.368;
                let wpx = 1044 / this.fWidth;
                let hpx = 808 / this.fHeight;
                $("#temp").children("div").remove();
                for (let i = 0; i < data.length; i++) {
                    let xaxis = 0, yaxis = 0;
                    xaxis = parseInt(wpx * parseFloat(data[i].x));
                    yaxis = parseInt(hpx * parseFloat(data[i].y)) - 8;
                    let width = Math.ceil((data[i].x1 - data[i].x) * wpx) - 2;
                    let height = Math.ceil((data[i].y1 - data[i].y) * hpx) - 2;
                    let childDiv1 = document.createElement("div");
                    $(childDiv1).attr("id", data[i].name);
                    $(childDiv1).attr("class", "rack");
                    $(childDiv1).attr(
                        "style",
                        "border:none;position: absolute;background-color:none; cursor: pointer; left:" +
                        xaxis + "px; top:" + yaxis + "px;" +
                        "width:" + width + "px;height:" + height + "px;"
                    );
                    $(childDiv1).on("click", () => {

                        let aisleId = parseInt(aisle[4])
                        let rackid = parseInt(data[i].name.substring(4, data[i].name.length))

                        if (this.selectedZones.indexOf(ractStart[aisleId - 1] + rackid) === -1) {
                            this.selectedZones.push(ractStart[aisleId - 1] + rackid);
                            if (this.selectedZones.length <= 10) {
                                let checkRackBg = $("#" + data[i].name).css("background-color");
                                if (checkRackBg === 'rgba(0, 0, 0, 0)') {
                                    $("#" + data[i].name).css({
                                        "background-color": "#00cc00b3",
                                        "border": "0.4px solid black",
                                    });
                                } else {
                                    $("#" + data[i].name).css({
                                        "background-color": 'rgba(0, 0, 0, 0)',
                                        "border": "none",
                                    })
                                }
                            } else {
                                this.selectedZones = this.selectedZones.filter(item => item !== ractStart[aisleId - 1] + rackid);
                                this.showMessage(true, true, false, "Rack Selection Limit Exceeded");
                                $("html").animate({ scrollTop: 0 }, "slow");
                            }
                        }
                        else {
                            this.selectedZones = this.selectedZones.filter(item => item !== ractStart[aisleId - 1] + rackid);
                            $("#" + data[i].name).css({
                                "background-color": 'rgba(0, 0, 0, 0)',
                                "border": "none",
                            })
                        }
                    })
                    $("#temp").append(childDiv1);
                }
            }
        } else {
            $("#temp").css("display", "none");
        }
    }

    sendGraphData = () => {
        let floor = $("#fname").val();
        let aisle = $("#aisle").val();
        let coordinates = []
        for (let i = 0; i < this.selectedZones.length; i++) {
            let ind = this.selectedZones[i] - 1;
            coordinates.push(RACKDATA[ind]);
        }
        if (floor !== "" && aisle !== "") {
            if (this.selectedZones.length !== 0) {
                $(".table_det").css("display", "block");
                this.setState({ error: false, message: '' })
                this.props.parentCallback(true);
                setTimeout(() => {
                    this.props.parentCallback(false);
                    const { labels, values } = this.state;
                    let graph_data = []
                    for (let i = 0; i < values.length; i++) {
                        graph_data.push({ time: labels[i], cpu: values[i] });
                    }
                    axios({
                        method: 'POST', url: '/api/server/position',
                        data: { id: floor, graph: graph_data, rack: coordinates }
                    })
                        .then((response) => {
                            console.log("sendGraphData=====>", response)
                            let data = response.data;
                            $("#server_table tbody").empty();
                            $("#server_table thead").empty();
                            if (response.status === 200 || response.status === 201) {
                                if (data.length !== 0) {
                                    const location = [1, 1, 1, 1, 2, 2, 1, 1, 2, 1];
                                    const cooling = [3.08, 3.80, 4.2, 4.6, 5.04, 5.2, 6.43, 7.81, 7.99, 8.56]
                                    $("#server_table thead").append(
                                        "<tr>" +
                                        "<th>SNO</th>" +
                                        "<th>RACK ID</th>" +
                                        "<th>RACK NAME</th>" +
                                        "<th>U-LOCATION</th>" +
                                        "<th style='text-transform:none;'>COOLING LOAD REQUIRED(kWh)</th>" +
                                        "<th>RACK LOCATION</th>" +
                                        "</tr>"
                                    );
                                    for (let i = 0; i < data.length; i++) {
                                        $("#server_table tbody").append(
                                            "<tr>" +
                                            "<td>" + (i + 1) + "</td>" +
                                            "<td>" + data[i].macid + "</td>" +
                                            "<td>" + data[i].name + "</td>" +
                                            "<td>" + location[i] + "</td>" +
                                            "<td>" + cooling[i] + "</td>" +
                                            "<td><div class='imgdiv' id='rackloc" + i + "'><i class='fas fa-location-circle'></i></div></td> " +
                                            "</tr>"
                                        );
                                        $("#rackloc" + i).on("click", () => {
                                            this.redirection(data[i].name, data[i].id);
                                        })
                                    }
                                    $("html").animate({ scrollTop: 700 }, "slow");
                                } else {
                                    // $("#temp").children("div").remove();
                                    this.showMessage(false, true, false, "No Data Found For Selected Rack");
                                }
                            }
                        })
                        .catch((error) => {
                            console.log('Error====', error);
                            this.props.parentCallback(false);
                            if (error.response.status === 403) {
                                $("#displayModal").css("display", "block");
                            } else if (error.response.status === 400) {
                                this.showMessage(false, true, false, "Bad Request");
                            } else if (error.response.status === 404) {
                                // $("#temp").children("div").remove();
                                this.showMessage(false, true, false, "No Data Found For Selected Rack");
                            }
                            $("html").animate({ scrollTop: 0 }, "slow");
                        })
                }, 1 * 1000);
            } else {
                $(".table_det").css("display", "none");
                $("html").animate({ scrollTop: 0 }, "slow");
                this.showMessage(false, true, false, "Please Select Rack");
            }
        } else {
            $(".table_det").css("display", "none");
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(false, true, false, "Required All Fields");
        }
    }

    redirection = (rackName, rackId) => {
        // sessionStorage.setItem("rack_location",
        //     JSON.stringify({ rackName: rackName, rackId: rackId }));
        // window.location.pathname = "/realtime"
        sessionStorage.setItem("racktracking_rackId", JSON.stringify({ rackName: rackName, rackId: rackId }));
        window.location.pathname = "/racktracking"
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
        const { error, message, loading } = this.state;
        return (
            <>
                <div
                    id='divheight'
                    style={{
                        position: "relative",
                        height: "auto",
                    }}>

                    {error && (
                        <div style={{ margin: "20px 10px", color: 'red' }}>
                            <strong>{message}</strong>
                        </div>
                    )}

                    <div style={{ marginTop: "30px", }}>
                        <span id='positionheader'>Average CPU Utilization</span>
                        <div id="chartCanvas" >
                            <div id="charttime">00:00</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginLeft: '10px', marginTop: '10px' }}>
                        <div className="inputdiv">
                            <span className="label">Select Floor </span>
                            <select name="fname" id="fname" required="required" />
                        </div>

                        <div className="inputdiv" style={{ marginLeft: '145px' }}>
                            <span className="label">Select Aisle </span>
                            <select name="aisle" id="aisle" required="required"
                                onChange={() => this.changeZones()}>
                                <option value="">--Select Option--</option>
                                <option value="zone1">Zone-1</option>
                                <option value="zone2">Zone-2</option>
                                <option value="zone3">Zone-3</option>
                                <option value="zone4">Zone-4</option>
                                <option value="zone5">Zone-5</option>
                                <option value="zone6">Zone-6</option>
                                <option value="zone7">Zone-7</option>
                            </select>
                        </div>
                    </div>

                    <div
                        id="temp"
                        style={{
                            margin: "30px 10px 0px",
                            display: "none",
                            position: "relative",
                            width: "fit-content",
                        }}>
                        <img id="tempimg"
                            style={{ width: "auto", height: "auto" }} alt="">
                        </img>
                    </div>

                    <button id='subtn' className="fancy-button"
                        style={{ width: '120px', marginTop: "15px", marginLeft: '10px', display: 'none' }}
                        onClick={this.sendGraphData}>Submit</button>

                    <div id="common_table" style={{ paddingBottom: "50px", marginLeft: '10px' }}>
                        <div className="table_det">
                            <table style={{ width: "86%", position: "relative" }} id="server_table">
                                <thead></thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* SessionOut Component used here!  */}
                <SessionOut />

                {
                    loading === true && (
                        <div
                            style={{
                                top: "0%",
                                left: "0%"
                            }} className="frame">
                            <DataLoading />
                        </div>
                    )
                }
            </>
        )
    }
}