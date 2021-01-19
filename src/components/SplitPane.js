import React, { Component } from "react";
import logo from "../resources/TwitchExtrudedWordmarkBlackOps.png";
import bell from "../resources/bell.mp3";

export class SplitPane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ticking: false,
      stories: [],
      current: { story: "Headline", time: 30 },
      currentIndex: 0,
      file: null,
      errors: { isEmpty: false, isNan: false },
    };
    this.bell = new Audio(bell);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if (this.state.current.time === 0) {
      this.handlePop();
    } else if (this.state.ticking) {
      this.setState({
        current: {
          time: this.state.current.time - 1,
          file: this.state.current.file,
        },
      });
    }
  }

  handlePop() {
    this.bell.play();
    let index = this.state.currentIndex + 1;
    if (index > this.state.stories.length - 1) {
      clearInterval(this.timerID);
      this.setState({
        current: {
          time: this.state.current.time - 1,
          file: this.state.current.file,
        },
        ticking: false,
        currentIndex: index,
      });
    } else {
      this.setState({
        currentIndex: index,
        current: this.state.stories[index],
      });
    }
  }

  handleStart(e) {
    e.preventDefault();
    if (!this.state.ticking)
      this.timerID = setInterval(() => this.tick(), 1000);
    this.setState((state) => {
      const ticking = !state.ticking;
      return { ticking };
    });
  }

  handleImage(e) {
    e.preventDefault();
    if (e.target.files[0]) {
      this.setState({
        file: URL.createObjectURL(e.target.files[0]),
      });
    } else {
      this.setState({
        file: logo,
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    let x = e.target.story.value;
    let y = e.target.time.value;
    if (Number.isInteger(y - 0) && x !== "") {
      this.setState((state) => {
        const stories = [
          ...state.stories,
          { story: x, time: y, file: this.state.file },
        ];
        e.target.story.value = "";
        e.target.file.value = null;
        const current = stories[0];
        return { stories, current, errors: { isNan: false, isEmpty: false } };
      });
    } else {
      this.setState(() => {
        const isNan = !Number.isInteger(y - 0);
        const isEmpty = x === "";
        const errors = { isNan: isNan, isEmpty: isEmpty };
        return { errors };
      });
    }
  }

  handleReset(e) {
    e.preventDefault();
    this.setState((state) => {
      const ticking = false;
      const stories = [...state.stories];
      let current = { story: "Headline", time: 30 };
      if (stories.length > 0) {
        current = { story: stories[0].story, time: stories[0].time };
      }
      const currentIndex = 0;
      return { ticking, stories, current, currentIndex };
    });
  }

  handleClear(e) {
    e.preventDefault();
    this.setState({
      ticking: false,
      stories: [],
      current: { story: "Headline", time: 30 },
      currentIndex: 0,
      file: null,
    });
  }

  render() {
    const items = [];
    if (this.state.stories.length === 0) {
      items.push(
        <li key={0} className="selected">
          ADD HEADLINES
        </li>
      );
    } else if (this.state.current.time < 0) {
      items.push(
        <li key={0} className="selected">
          FINISHED
        </li>
      );
    } else {
      for (const [index, value] of this.state.stories.entries()) {
        let diff = index - this.state.currentIndex;
        if (index === this.state.currentIndex) {
          items.push(
            <li className="selected" key={index}>
              {value.story}
            </li>
          );
        } else if (diff < 0) {
          items.push(
            <li className="faded" key={index}>
              {value.story}
            </li>
          );
        } else {
          items.push(
            <li className="story" key={index}>
              {value.story}
            </li>
          );
        }
      }
    }
    return (
      <div className="SplitPane">
        <div className="SplitPane-left">
          <div className="Dashboard">
            <div className="title">
              <h1>PTI STYLE COUNTDOWN</h1>
            </div>
            <div className="SubmitForm">
              <h2>Add Headlines</h2>
              <form onSubmit={this.handleSubmit}>
                <div className="in-box">
                  <label>Time (Seconds)</label>
                  <br />
                  {this.state.errors.isNan ? (
                    <span className="error">Must be a number</span>
                  ) : (
                    <></>
                  )}
                  <input type="text" name="time"></input>
                </div>
                <div className="in-box">
                  <label>Headline</label>
                  <br />
                  {this.state.errors.isEmpty ? (
                    <span className="error">Can't be empty</span>
                  ) : (
                    <></>
                  )}
                  <input type="text" name="story"></input>
                </div>
                <div className="file">
                  <label>Add image</label>
                  <br />
                  <input
                    onChange={this.handleImage}
                    type="file"
                    name="file"
                    accept="image/*"
                  ></input>
                </div>
                <div className="add">
                  <input className="Add" type="submit" value="Submit"></input>
                </div>
              </form>
            </div>
            <div className="options">
              <input
                className={this.state.ticking ? "Playing" : "Start"}
                type="submit"
                value={this.state.ticking ? "Pause" : "Start Countdown"}
                onClick={this.handleStart}
                disabled={
                  this.state.stories.length <= 0 ||
                  this.state.currentIndex > this.state.stories.length - 1
                }
              ></input>
              <input
                className="Reset"
                type="submit"
                value="Start At Beginning"
                onClick={this.handleReset}
                disabled={this.state.currentIndex === 0}
              ></input>
              <input
                disabled={this.state.stories.length <= 0}
                className="Clear"
                type="submit"
                value="Clear All"
                onClick={this.handleClear}
              ></input>
            </div>
          </div>
        </div>
        <div className="SplitPane-right">
          <div className="Panel">
            <div className="info">
              <div className="storypic">
                <img
                  alt=""
                  src={this.state.current.file ? this.state.current.file : logo}
                ></img>
              </div>
              <div className="timer">
                {this.state.current.time < 0
                  ? this.convertSeconds(0)
                  : this.convertSeconds(this.state.current.time)}
              </div>
              <div>{items}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  convertSeconds(s) {
    let date = new Date(s * 1000);
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
    let timeString =
      minutes.toString().padStart(1, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
    return timeString;
  }
}

export default SplitPane;
