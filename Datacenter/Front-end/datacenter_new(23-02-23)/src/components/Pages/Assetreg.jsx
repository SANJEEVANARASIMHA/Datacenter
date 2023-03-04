import React, { Component } from "react";
import axios from "axios";
import $ from 'jquery';
import { upload_floormap, asset_rack_det, asset_register } from '../urls/api';
import { SessionOut } from "./Common";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default class Assetreg extends Component {
  constructor() {
    super();
    this.state = {
      error: false,
      success: false,
      message: ''
    }
  }
  componentDidMount = () => {
    $("#fname").empty();
    var valdata = sessionStorage.getItem("cardvals");
    this.vals = JSON.parse(valdata)
    axios({ method: "GET", url: upload_floormap })
      .then((response) => {
        console.log('Response--->', response);
        const data = response.data;
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            $("#fname").append(
              "<option value=" + data[i].id + ">" + data[i].name + "</option>"
            );
          }
          this.getRackDetails();
        } else {
          this.showMessage(false, true, false, "No Floor Map Uploaded. Please Upload Floor Map To Begin");
        }
      })
      .catch((error) => {
        console.log('Error----->', error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else {
          this.showMessage(false, true, false, "Error Occurred. Please Try Again");
        }
      })
  };

  getRackDetails = async () => {
    axios({
      method: "GET",
      url: asset_rack_det + this.vals,
    })
      .then((response) => {
        console.log("-------->", response);
        if (response.status === 200) {
          $("#rackid").empty();
          if (response.data.length !== 0) {
            let data = response.data;
            for (let i = 0; i < data.length; i++) {
              $("#rackid").append(
                "<option value=" + data[i].id + ">" + data[i].rack + "</option>"
              );
            }
            this.showMessage(false, false, false, "");
          } else {
            this.showMessage(true, true, false, "No Rack Registered For The Floor. Please Select Some Other Floor");
          }
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 400) {
          this.showMessage(true, true, false, "Request Failed");
        } else {
          this.showMessage(true, true, false, "Error Occurred. Please Try Again");
        }
      });
  };

  registerAsset = (e) => {
    e.preventDefault();
    $("#removeAsset").css("display", "none")
    let data = {
      tagid: $("#tagid").val(),
      name: $("#assetname").val(),
      assetsn: $("#assetsno").val(),
      devicemodel: $("#dmodel").val(),
      assetunitusage: $("#ausage").val(),
      rackno: $("#rackid").val(),
      address: $("#address").val(),
      datacenter: $("#datacenter").val(),
      floor: $("#fname").val(),
      rooms: $("#rooms").val(),
      columns: $("#columns").val(),
      macaddr: $("#macaddress").val(),
      description: $("#description").val(),
      manufacturer: $("#manufactures").val(),
      serialno: $("#serialno").val(),
      supplier: $("#supplier").val(),
      macaddr2: $("#macaddress2").val(),
      equipmentcategory: $("#equipcategory").val(),
      lifecycle: $("#lifecycle").val(),
      maintenancecycle: $("#mainlifecycle").val(),
      pricipal: $("#principal").val(),
      tempmin: $('#mintemp').val(),
      tempmax: $('#maxtemp').val(),
      energymax: $('#energymax').val(),
      weight: 0.0,
      power: 0.0,
      current: 0,
      voltage: 0.0,
      firstusetime: $("#firstusetime").val(),
      inventorycode: $("#inventcode").val(),
      staffemail: $("#staffemail").val(),
      staffname: $("#staffname").val(),
      staffcontact: $("#maintaincon").val(),
      lastupdatedtime: $("#lastupdatedtime").val(),
      nextupdatedtime: $("#nextupdatedtime").val(),
    }
    console.log('datas', data)
    if (!(data.tagid && data.name && data.assetsn && data.devicemodel &&
      data.assetunitusage && data.datacenter && data.tempmin && data.tempmax &&
      data.energymax && data.name && data.maintenancecycle && data.inventorycode &&
      data.staffemail && data.staffname && data.staffcontact &&
      data.datacenter && data.manufacturer && data.supplier && data.address)
    ) {
      $("html").animate({ scrollTop: 0 }, "slow");
      this.showMessage(true, true, false, "Please Fill Out All The Mandatory Fields");
    } else if (
      $("#tagid").val().match("^5a-c2-15-02-[a-x0-9]{2}-[a-x0-9]{2}") === null
    ) {
      $("html").animate({ scrollTop: 0 }, "slow");
      this.showMessage(true, true, false, "Invalid MAC ID Entered. Please Follow The Pattern 5a-c2-15-02-00-00");
    } else {
      axios({ method: "POST", url: asset_register, data: data })
        .then((response) => {
          console.log("Response===>", response);
          if (response.status === 201 || response.status === 200) {
            $("#tagid").val("");
            $("#assetsno").val("");
            $("#dmodel").val("");
            $("#ausage").val("");
            $("#assetname").val("");
            $("#address").val("");
            $("#datacenter").val("");
            $("#rooms").val("");
            $("#columns").val("");
            $("#macaddress").val("");
            $("#description").val("");
            $("#manufactures").val("");
            $("#serialno").val("");
            $("#supplier").val("");
            $("#macaddress2").val("");
            $("#equipcategory").val("");
            $("#lifecycle").val("");
            $("#mainlifecycle").val("");
            $("#principal").val("");
            $("#maintaincon").val("");
            $("#firstusetime").val("");
            $("#inventcode").val("");
            $("#staffemail").val("");
            $("#staffname").val("");
            $("#lastupdatedtime").val("");
            $("#nextupdatedtime").val("");
            $('#mintemp').val("");
            $('#maxtemp').val("");
            $('#energymax').val("");
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, false, true, "Asset Registered Successfully");
          } else {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else if (error.response.status === 400) {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, "Bad Request");
          } else if (error.response.status === 406) {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, "Maximum Unit Storage Left Is : " +
              error.response.data.capacity);
          } else {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, "Error Occurred While Registering Asset. Please Try Again");
          }
        });
    }
  };

  removeAsset = () => {
    window.scrollTo(0, 1000);
    let data = {
      tagid: $("#rmvasset").val(),
    };
    console.log(data)
    if ($("#rmvasset").val().length === 0) {
      $("html").animate({ scrollTop: 0 }, "slow");
      this.showMessage(true, true, false, "Required Asset TagID");
    } else if (
      $("#rmvasset").val().match("^5a-c2-15-02-[a-x0-9]{2}-[a-x0-9]{2}") === null
    ) {
      $("html").animate({ scrollTop: 0 }, "slow");
      this.showMessage(true, true, false, "Invalid MAC ID Entered. Please Follow The Pattern 5a-c2-15-02-00-00");
    } else {
      axios({
        method: "DELETE",
        url: asset_register,
        data: data,
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            $("#rmvasset").val("");
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, false, true, "Asset Removed Successfully");
          } else {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, "Asset Not Removed");
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else if (error.response.status === 404) {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, "Asset Not Found");
          } else {
            $("html").animate({ scrollTop: 0 }, "slow");
            this.showMessage(true, true, false, "Error Occurred. Please Try Again");
          }
        });
    }
  }

  remove = () => {
    $("html").animate({ scrollTop: 700 }, "slow");
    document.getElementById("removeAsset").style.display =
      $("#removeAsset").css("display") === "block" ? "none" : "block";
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
    const { error, message, success } = this.state;
    return (
      <div >
        {error && (
          <div style={{ color: "red", textTransform: "capitalize", marginBottom: "20px" }}>
            <strong>{message}</strong>
          </div>
        )}

        {success && (
          <div style={{ color: "green", textTransform: "capitalize", marginBottom: "20px" }}>
            <strong>{message}</strong>
          </div>
        )}
        <div style={{ marginTop: "10px", justifyContent: "space-between" }}>
          <p
            style={{
              fontSize: "25px",
              marginTop: "0px",
              marginBottom: "12px",
              color: "#00629B",
              fontWeight: 500,
            }}
          >
            Assets
          </p>
          <form>
            <div style={{ display: "flex" }}>
              <div className="inputdiv">
                <input type="text" placeholder="Tag MAC ID (5a-c2-15-02-00-00)*" id="tagid" />
              </div>

              <div className="inputdiv" style={{ marginLeft: "30px" }}>
                <input type="text" placeholder="Asset Name*" id="assetname" required />
              </div>
            </div>
            <p
              style={{
                fontSize: "25px",
                marginTop: "10px",
                marginBottom: "12px",
                color: "#00629B",
                fontWeight: 500,
              }}
            >
              Basic Info
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="text" required placeholder="Asset SN*" id="assetsno" />
              </div>

              <div className="inputdiv">
                <input type="text" placeholder="Device Model*" id="dmodel" />
              </div>
              <div className="inputdiv">
                <input type="text" placeholder="Asset Usage*" id="ausage" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <select placeholder="Rack ID*" id="rackid" />
              </div>

              <div className="inputdiv">
                <input type="text" maxLength={60} placeholder="Address*" id="address" />
              </div>
              <div className="inputdiv">
                <input type="text" placeholder="Data Center*" id="datacenter" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <select placeholder="FloorName*" id="fname" />
              </div>

              <div className="inputdiv">
                <input type="text" placeholder="Room" id="rooms" />
              </div>
              <div className="inputdiv">
                <input type="text" placeholder="Column" id="columns" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="text" placeholder="MAC Address" id="macaddress" />
              </div>

              <div className="inputdiv">
                <input type="text" placeholder="Description" id="description" />
              </div>
              <div className="inputdiv">
                <input
                  type="text"
                  placeholder="Manufacturer*"
                  id="manufactures"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="text" placeholder="Serial Number*" id="serialno" />
              </div>

              <div className="inputdiv">
                <input type="text" placeholder="Supplier*" id="supplier" />
              </div>

              <div className="inputdiv">
                <input type="text" placeholder="Mac Address2" id="macaddress2" />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="number" placeholder="Min Temperature (°C)*" id="mintemp" />
              </div>

              <div className="inputdiv">
                <input type="number" placeholder="Max Temperature (°C)*" id="maxtemp" />
              </div>

              <div className="inputdiv">
                <input type="number" placeholder="Max Energy (Wh)*" id="energymax" />
              </div>
            </div>

            <p
              style={{
                fontSize: "25px",
                marginTop: "10px",
                marginBottom: "12px",
                color: "#00629B",
                fontWeight: 500,
              }}
            >
              Pro Info
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input
                  type="text"
                  placeholder="Equipment Category"
                  id="equipcategory"
                />
              </div>

              <div className="inputdiv">
                <input type="number" placeholder="Life Cycle" id="lifecycle" />
              </div>
              <div className="inputdiv">
                <input
                  type="number"
                  placeholder="Maintenance Life Cycle(months)*"
                  id="mainlifecycle"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="text" placeholder="Principal" id="principal" />
              </div>
              <div className="inputdiv">
                <input type="text" placeholder="Inventory Code*" id="inventcode" />
              </div>

              <div className="inputdiv">
                <input type="number" placeholder="Weight (Kg)" id="weight" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="number" placeholder="Power (W)" id="power" />
              </div>

              <div className="inputdiv">
                <input type="number" placeholder="Current (A)" id="current" />
              </div>
              <div className="inputdiv">
                <input type="number" placeholder="Voltage (V)" id="voltage" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >

              <div className="inputdiv">
                <input
                  type="text"
                  placeholder="Maintenance Staff Name*"
                  id="staffname"
                />
              </div>

              <div className="inputdiv">
                <input
                  type="tel"
                  placeholder="Maintenance Staff Contact*"
                  id="maintaincon"
                />
              </div>
              <div className="inputdiv">
                <input
                  type="text"
                  placeholder="Maintenance Staff Email*"
                  id="staffemail"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "85%",
              }}
            >
              <div className="inputdiv">
                <input type="datetime-local" id='firstusetime' />
              </div>

              <div className="inputdiv">
                <input type="datetime-local" id='lastupdatedtime' />
              </div>
              <div className="inputdiv">
                <input type="datetime-local" id='nextupdatedtime' />
              </div>
            </div>

            <div style={{
              display: "flex", width: "85%",
              marginLeft: "230px", marginBottom: "20px"
            }}>
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
                onClick={(e) => this.registerAsset(e)}
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
          </form>
          <div id='removeAsset' style={{
            marginTop: '40px',
            display: 'none', marginBottom: "20px"
          }}>
            <div className="inputdiv">
              <span className="label" style={{ width: '140px' }}>Asset ID :</span>
              <input type="text" name="y2" id="rmvasset" required="required"
                placeholder="Tag MAC ID (5a-c2-15-02-00-00)"
              />
              <div
                onClick={() => this.removeAsset()}
                className="remove rmv"
                style={{ width: "150px", marginLeft: "240px", marginBottom: '30px' }}>
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
        </div>
        {/* SessionOut Component used here!  */}
        <SessionOut />
      </div>
    );
  }
}