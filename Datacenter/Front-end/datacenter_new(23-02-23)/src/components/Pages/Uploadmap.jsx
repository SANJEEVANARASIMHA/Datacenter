import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import { upload_floormap } from "../urls/api";
import { SessionOut } from "./Common";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default class Uploadmap extends Component {
  constructor() {
    super();
    this.state = {
      image: null,
      message: "",
      success: false,
      error: false,
    };
  }
  componentDidMount() {
    this.floorMap();
  }

  floorMap = () => {
    $("#mapfname").empty();
    axios({ method: "GET", url: upload_floormap })
      .then((response) => {
        console.log('Response--->', response);
        let data = response.data;
        if (data.length !== 0 && response.status === 200) {
          for (let i = 0; i < data.length; i++) {
            $("#mapfname").append("<option value=" + data[i].id + ">" + data[i].name + "</option>")
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

  handleImage = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      this.setState({
        image: file,
      });
    };
    reader.readAsDataURL(file);
  };

  uploadMap = () => {
    let form_data = new FormData();
    form_data.append("name", $("#fname").val());
    form_data.append("image", this.state.image);
    form_data.append("width", parseFloat($("#width").val()));
    form_data.append("height", parseFloat($("#height").val()));
    this.setState({ error: false, message: "" });
    if (
      $("#uploadimage").val() &&
      $("#width").val() &&
      $("#height").val() &&
      $("#fname").val() !== ""
    ) {
      axios({
        method: "POST",
        url: upload_floormap,
        data: form_data,
        headers: { "content-type": "multipart/formdata" },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 201 || response.status === 200) {
            this.showMessage(true, false, true, "Floor Map Uploaded Successfully");
            $("#uploadimage").val("");
            $("#width").val("");
            $("#height").val("");
            $("#fname").val("");
          }
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 403) {
            $("#displayModal").css("display", "block");
          }
          else if (err.response.status === 404) {
            this.showMessage(false, true, false, "No Data Found");
          }
        });
    } else {
      this.showMessage(true, true, false, "Please Fill Out All The Fields");
    }
  };

  removeMap = () => {
    let data = {
      id: $("#mapfname").val(),
    };
    console.log(data)
    if ($("#mapfname").val().length === 0) {
      this.showMessage(true, true, false, "Required Floor ID");
    } else {
      axios({
        method: "DELETE",
        url: upload_floormap,
        data: data,
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            $("#mapfname option:selected").remove();
            $("#removemap").css("display", "none");
            this.showMessage(true, false, true, "Floor Removed Successfully");
          } else {
            this.showMessage(true, true, false, "Floor Not Removed");
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            $("#displayModal").css("display", "block");
          } else {
            this.showMessage(true, true, false, "Error Occurred Please Try Again");
          }
        });
    }
  }

  remove = () => {
    this.floorMap();
    document.getElementById("removemap").style.display =
      $("#removemap").css("display") === "block" ? "none" : "block";
  }

  sessionTimeout = () => {
    $("#displayModal").css("display", "none");
    sessionStorage.removeItem('isLogged')
    window.location.pathname = '/login'
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
      <div>
        <div>
          {error && (
            <div style={{ color: "red", margin: "20px 0" }}>
              <strong>{message}</strong>
            </div>
          )}

          {success && (
            <div style={{ color: "green", margin: "20px 0" }}>
              <strong>{message}</strong>
            </div>
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <div className="inputdiv">
            <span className="label">Floor Name </span>
            <input type="text" name="fname" id="fname" required="required" />
          </div>

          <div className="inputdiv">
            <span className="label">Width(in m)</span>
            <input type="number" name="width" id="width" required="required" />
          </div>

          <div className="inputdiv">
            <span className="label">Height(in m)</span>
            <input
              type="number"
              name="height"
              id="height"
              required="required"
            />
          </div>
          <div className="inputdiv">
            <span className="label">Floor Image</span>
            <input
              type="file"
              accept="image/*"
              name="image"
              id="uploadimage"
              required="required"
              onChange={this.handleImage}
            />
          </div>

          <div style={{ display: "flex", width: "85%", marginLeft: "175px" }}>
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
              onClick={() => this.uploadMap()}
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

          <div id='removemap' style={{ marginTop: '40px', display: 'none' }}>
            <div className="inputdiv">
              <span className="label">Floor Name</span>
              <select name="mapfname" id="mapfname" required="required" />
            </div>
            <div
              onClick={() => this.removeMap()}
              className="remove rmv"
              style={{ width: "150px", marginLeft: "184px", marginBottom: '30px' }}>
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
        <SessionOut />
      </div>
    );
  }
}
