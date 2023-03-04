import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import { SessionOut } from "./Common";
import { master_register, slave_register } from "../urls/api";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default class Slave extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      error: false,
      success: false,
    };
  }
  componentDidMount() {
    this.getMasterGatewayID()
  }

  getMasterGatewayID = () => {
    axios({ method: "GET", url: master_register })
      .then((response) => {
        if (response.status === 200 && response.data.length !== 0) {
          for (let i = 0; i < response.data.length; i++) {
            $("#masterid").append(
              "<option value=" +
              response.data[i].id +
              ">" +
              response.data[i].gatewayid +
              "</option>"
            );
          }
        } else {
          this.showMessage(true, true, false, "No Master Gateway Found");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
        } else {
          this.showMessage(true, true, false, "Error Occurred. Please Try Again");
        }
      });
  }

  registerSlave = () => {
    let data = {
      masterid: $("#masterid").val(),
      macaddress: $("#slaveregid").val(),
    };
    if ($("#slaveregid").val().length === 0 || $("#masterid").val() === null) {
      this.showMessage(true, true, false, "Required All Fields");
    } else if ($("#slaveregid").val().length !== 17 ||
      data.macaddress.match("^5a-c2-15-0a-[a-x0-9]{2}-[a-x0-9]{2}") === null) {
      this.showMessage(true, true, false, "Invalid ID Entered. Please Follow The Pattern 5a-c2-15-08-00-00");
    } else {
      axios({ method: "POST", url: slave_register, data: data })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            $("#slaveregid").val("");
            this.showMessage(true, false, true, "Slave Gateway Registered Successfully");
          } else {
            this.showMessage(true, true, false, "Slave Gateway Not Registered");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else if (error.response.status === 400) {
            this.showMessage(true, true, false, "Slave Gateway Already Exist");
          } else if (error.response.status === 404) {
            this.showMessage(true, true, false, "Slave Gateway ID Does Not Exist");
          } else {
            this.showMessage(true, true, false, "Error Occurred. Please Try Again");
          }
        });
    }
  };

  removeSlave = () => {
    let data = {
      macaddress: $("#slaveregid").val(),
    };
    if ($("#slaveregid").val().length === 0) {
      this.showMessage(true, true, false, "Required Slave Gateway ID");
    } else if ($("#slaveregid").val().length !== 17 ||
      data.macaddress.match("^5a-c2-15-0a-[a-x0-9]{2}-[a-x0-9]{2}") === null) {
      this.showMessage(true, true, false, "Invalid ID Entered. Please Follow The Pattern 5a-c2-15-0a-00-00");
    } else {
      axios({
        method: "DELETE",
        url: slave_register,
        data: data,
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200 || response.status === 201) {
            $("#slaveregid").val("");
            this.showMessage(true, false, true, "Slave Gateway Removed Successfully");
          } else {
            this.showMessage(true, true, false, "Slave Gateway Not Removed");
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else if (error.response.status === 404) {
            this.showMessage(true, true, false, "Slave Gateway ID Does Not Exist");
          } else {
            this.showMessage(true, true, false, "Error Occurred. Please Try Again");
          }
        });
    }
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
    clearTimeout(this.messageTimeout)
  }

  render() {
    const { message, error, success } = this.state;
    return (
      <div style={{
        marginLeft: "0px",
        marginTop: '20px',
        width: "100%",
        height: "67vh"
      }}>
        <div style={{ marginTop: "30px", justifyContent: "space-between" }}>
          {error && (
            <div style={{ color: "red", marginBottom: "20px" }}>
              <strong>{message}</strong>
            </div>
          )}

          {success && (
            <div style={{ color: "green", marginBottom: "20px" }}>
              <strong>{message}</strong>
            </div>
          )}

          <div>
            <div className="inputdiv">
              <span className="label">Master Gateway ID:</span>
              <select name="masterid" id="masterid" required="required" />
            </div>

            <div className="inputdiv">
              <span className="label">Slave Gateway ID :</span>
              <input
                type="text"
                name="id"
                id="slaveregid"
                required="required"
                placeholder="5a-c2-15-0a-00-00"
              />
            </div>

            <div style={{ display: "flex", width: "85%", marginLeft: "175px" }}>
              <div
                onClick={this.removeSlave}
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
                onClick={this.registerSlave}
                className="register reg"
                style={{ width: "150px", marginLeft: "60px" }}>
                <div
                  style={{
                    marginLeft: "25px",
                    marginTop: "5px",
                    cursor: "pointer",
                    fontFamily: "Poppins-Regular",
                  }}
                >
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
          </div>
        </div>

        {/* SessionOut Component used here!  */}
        <SessionOut />
      </div>
    );
  }
}
