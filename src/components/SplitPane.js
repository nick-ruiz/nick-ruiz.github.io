import React, { Component } from "react";
import { v4 } from "uuid";
import defaultPic from "../resources/logo.jpg";
import bell from "../resources/bell.mp3";
import up from "../resources/up_arrow.png";
import down from "../resources/down_arrow.png";
import remove from "../resources/remove.png";

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
      editable: false,
      audio: true,
    };
    this.bell = new Audio(bell);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleAudio = this.handleAudio.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
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
    if (this.state.audio) this.bell.play();
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
    else clearInterval(this.timerID);
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
        file: defaultPic,
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    let x = e.target.story.value;
    let y = e.target.time.value;
    if (Number.isInteger(y - 0) && y !== "" && x !== "") {
      this.setState((state) => {
        const stories = [
          ...state.stories,
          { story: x, time: y, file: this.state.file, id: v4() },
        ];
        e.target.story.value = "";
        e.target.file.value = null;
        const current = stories[0];
        return {
          stories,
          current,
          errors: { isNan: false, isEmpty: false },
          file: defaultPic,
        };
      });
    } else {
      this.setState(() => {
        const isNan = !Number.isInteger(y - 0) || y === "";
        const isEmpty = x === "";
        const errors = { isNan: isNan, isEmpty: isEmpty };
        return { errors };
      });
    }
  }

  handleReset(e) {
    e.preventDefault();
    this.setState((state) => {
      clearInterval(this.timerID);
      const ticking = false;
      const stories = [...state.stories];
      let current = { story: "Headline", time: 30 };
      if (stories.length > 0) {
        current = {
          story: stories[0].story,
          time: stories[0].time,
          id: stories[0].id,
        };
      }
      const currentIndex = 0;
      const editable = false;
      return { ticking, stories, current, currentIndex, editable };
    });
  }

  handleClear(e) {
    e.preventDefault();
    this.setState(() => {
      clearInterval(this.timerID);
      const ticking = false;
      const stories = [];
      const current = { story: "Headline", time: 30 };
      const currentIndex = 0;
      const file = null;
      const editable = false;
      return { ticking, stories, current, currentIndex, file, editable };
    });
  }

  handleUp(e) {
    e.preventDefault();
    if (this.state.currentIndex === 0) return;
    this.setState((state) => {
      const stories = [...state.stories];
      const temp = stories[state.currentIndex];
      const currentIndex = state.currentIndex;
      stories[currentIndex] = stories[currentIndex - 1];
      stories[currentIndex - 1] = temp;
      return { stories, currentIndex: currentIndex - 1 };
    });
  }

  handleDown(e) {
    e.preventDefault();
    if (this.state.currentIndex >= this.state.stories.length - 1) return;
    this.setState((state) => {
      const stories = [...state.stories];
      const temp = stories[state.currentIndex];
      const currentIndex = state.currentIndex;
      stories[currentIndex] = stories[currentIndex + 1];
      stories[currentIndex + 1] = temp;
      return { stories, currentIndex: currentIndex + 1 };
    });
  }

  handleRemove(e) {
    e.preventDefault();
    this.setState((state) => {
      const stories = [...state.stories];
      stories.splice(state.currentIndex, 1);
      return {
        stories,
        currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
        current:
          stories.length > 0 ? stories[0] : { story: "Headline", time: 30 },
        editable: stories.length > 0,
      };
    });
  }

  handleEdit(e) {
    e.preventDefault();
    if (this.state.current.time < 0 && this.state.editable) {
      this.handleReset(e);
    } else {
      this.setState({
        editable: !this.state.editable,
        currentIndex:
          this.state.editable ||
          this.state.currentIndex > this.state.stories.length - 1
            ? 0
            : this.state.currentIndex,
      });
    }
  }

  handleSelect(index, e) {
    e.preventDefault();
    this.setState({ currentIndex: index });
  }

  handleAudio(e) {
    this.setState({ audio: e.target.checked });
  }

  handlePreview(e) {
    e.preventDefault();
    this.bell.play();
  }

  render() {
    const items = [];
    if (this.state.stories.length === 0) {
      items.push(
        <li key={0} className="selected">
          <StoryDiv text="ADD HEADLINES"></StoryDiv>
        </li>
      );
    } else if (this.state.editable) {
      let className = "editable clickable";
      for (const [index, value] of this.state.stories.entries()) {
        items.push(
          <li
            className={
              index === this.state.currentIndex
                ? className + " seledit"
                : className
            }
            key={value.id}
            onClick={(e) => this.handleSelect(index, e)}
          >
            {value.story}
          </li>
        );
      }
    } else if (this.state.current.time < 0) {
      items.push(
        <li key={0} className="selected">
          FINISHED
        </li>
      );
    } else {
      const start = Math.floor(this.state.currentIndex / 16) * 16;
      for (let i = start; i < this.state.stories.length; i++) {
        const value = this.state.stories[i];
        let diff = i - this.state.currentIndex;
        if (i === this.state.currentIndex) {
          items.push(
            <StoryDiv
              class="selected"
              text={value.story}
              key={value.id}
            ></StoryDiv>
          );
        } else if (diff < 0) {
          items.push(
            <StoryDiv
              class="faded"
              text={value.story}
              key={value.id}
            ></StoryDiv>
          );
        } else {
          items.push(
            <StoryDiv
              class="story"
              text={value.story}
              key={value.id}
            ></StoryDiv>
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
              <div className="audio">
                <label>Enable bell sound after timer reaches 0</label>
                <input
                  type="checkbox"
                  checked={this.state.audio}
                  onChange={this.handleAudio}
                ></input>{" "}
                <input
                  type="submit"
                  value="Preview Audio"
                  onClick={this.handlePreview}
                ></input>
              </div>
            </div>
            <div className="options">
              <input
                className={this.state.ticking ? "Playing" : "Start"}
                type="submit"
                value={this.state.ticking ? "Pause" : "Start Countdown"}
                onClick={this.handleStart}
                disabled={
                  this.state.stories.length <= 0 ||
                  this.state.currentIndex > this.state.stories.length - 1 ||
                  this.state.editable
                }
              ></input>
              <input
                className="Reset"
                type="submit"
                value="Start At Beginning"
                onClick={this.handleReset}
                disabled={this.state.currentIndex === 0 || this.state.editable}
              ></input>
              <input
                disabled={this.state.stories.length <= 0}
                className="Clear"
                type="submit"
                value="Clear All"
                onClick={this.handleClear}
              ></input>
              <input
                disabled={this.state.stories.length <= 0}
                className="Edit"
                type="submit"
                value={this.state.editable ? "Save" : "Edit Order"}
                onClick={this.handleEdit}
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
                  src={
                    this.state.current.file
                      ? this.state.current.file
                      : defaultPic
                  }
                ></img>
              </div>
              <div className="timer">
                <div className="clock">
                  {this.state.current.time < 0
                    ? this.convertSeconds(0)
                    : this.convertSeconds(this.state.current.time)}
                </div>
                {this.state.editable ? (
                  <EditDiv
                    handleUp={this.handleUp}
                    handleDown={this.handleDown}
                    handleRemove={this.handleRemove}
                    currentIndex={this.state.currentIndex}
                    storyLen={this.state.stories.length}
                  ></EditDiv>
                ) : (
                  <></>
                )}
              </div>
              <div
                className={
                  this.state.editable ? "stories edit-scroll" : "stories"
                }
              >
                <div className="items">{items}</div>
              </div>
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

function EditDiv(props) {
  return (
    <div className="edit-buttons">
      <div className="button-wrap">
        <div className="remove">
          <input
            type="image"
            src={remove}
            alt="Delete"
            onClick={props.handleRemove}
          ></input>
        </div>
        <div className="move">
          <input
            type="image"
            src={up}
            alt="Move Up"
            onClick={props.handleUp}
            disabled={props.currentIndex === 0}
          ></input>
          <input
            type="image"
            src={down}
            alt="Move Down"
            onClick={props.handleDown}
            disabled={props.currentIndex >= props.storyLen - 1}
          ></input>
        </div>
      </div>
    </div>
  );
}

function StoryDiv(props) {
  return <div className={props.class + " story-div"}>{props.text}</div>;
}

export default SplitPane;
