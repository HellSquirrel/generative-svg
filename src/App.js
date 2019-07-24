import React, { useRef, useState, useEffect } from "react";
import { assocPath } from "ramda";
import classNames from "classnames";
import "./App.css";
import anime from "animejs/lib/anime.es.js";

const countId = "count";
const controlsMeta = [
  { label: "x, %", initialValue: 50, id: "x" },
  { label: "y, %", initialValue: 50, id: "y" },
  { label: "count", initialValue: 2, id: countId },
  { label: "step x", initialValue: 0, id: "dx" },
  { label: "step y", initialValue: 0, id: "dy" },
  { label: "initial scale", initialValue: 1, id: "sc" },
  { label: "scale step", initialValue: 0, id: "dSc" },
  { label: "initial rotation, deg", initialValue: 0, id: "rot" },
  { label: "rotation step, deg", initialValue: 0, id: "dRot" },
  { label: "rotation origin x", initialValue: 0, id: "origX" },
  { label: "rotation origin y", initialValue: 0, id: "origY" },
  { label: "initial opacity", initialValue: 1, id: "o" },
  { label: "end opacity", initialValue: 0, id: "oe" },
  { label: "transition, ms", initialValue: 200, id: "tt" }
];

function getStylesFromControls(controlsMeta, controls, i) {
  const count = getValue(controlsMeta, controls, "count");
  const x = getValue(controlsMeta, controls, "x");
  const dx = getValue(controlsMeta, controls, "dx");
  const y = getValue(controlsMeta, controls, "y");
  const dy = getValue(controlsMeta, controls, "dy");
  const sc = getValue(controlsMeta, controls, "sc");
  const dSc = getValue(controlsMeta, controls, "dSc");
  const rot = getValue(controlsMeta, controls, "rot");
  const dRot = getValue(controlsMeta, controls, "dRot");
  const o = getValue(controlsMeta, controls, "o");
  const oe = getValue(controlsMeta, controls, "oe");
  const tt = getValue(controlsMeta, controls, "tt");
  const opacityStep = (o - oe) / count;
  return {
    position: "absolute",
    top: `${y + i * dy}%`,
    left: `${x + i * dx}%`,
    transition: `all ${tt}ms`,
    transform: `translate(-50%, -50%) scale(${sc + i * dSc}) rotate(${rot +
      i * dRot}deg)`,
    opacity: o - opacityStep * i,
    pointerEvents: "none"
  };
}

const getControl = (controlsMeta, idToFind) =>
  controlsMeta.find(({ id }) => idToFind === id);

const getValue = (controlsMeta, controls, idToFind) => {
  const valueInControls = controls[idToFind];
  if (valueInControls !== undefined) return valueInControls;
  return getControl(controlsMeta, idToFind).initialValue;
};

function App() {
  const input = useRef(null);
  const [files, setFiles] = useState([]);
  const [controls, setControls] = useState([{}]);
  const [controlsTexts, setControlsTexts] = useState([{}]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const count = getValue(controlsMeta, controls[currentSlide], countId);
  const fr = useRef(new FileReader());
  fr.current.onload = e => {
    setFiles(assocPath([currentSlide], e.target.result));
  };

  const file = files[currentSlide];

  return (
    <div className="app">
      <div className="controls">
        <input
          className="files"
          type="file"
          accept="image/*"
          onChange={() => {
            const fileSource = input.current.files[0];
            if (fileSource) {
              fr.current.readAsText(fileSource);
            }
          }}
          ref={input}
        />
        {controlsMeta.map(({ id, label }) => {
          return (
            <div className="controlGroup" key={id}>
              <label htmlFor={`i-${id}`}>{label}</label>
              <input
                type=""
                value={getValue(controlsMeta, controlsTexts[currentSlide], id)}
                placeholder={label}
                className="controlInput"
                onChange={event => {
                  let value = event.currentTarget.value;
                  setControlsTexts(assocPath([currentSlide, id], value));

                  const numberified = Number(value);
                  if (!Number.isNaN(numberified)) {
                    setControls(assocPath([currentSlide, id], numberified));
                  }
                }}
              />
            </div>
          );
        })}
      </div>
      {[...Array(controls.length)].map((_, index) => {
        const file = files[index];
        if (file) {
          return (
            <div
              key={index}
              style={{ display: index === currentSlide ? "block" : "none" }}
              className={classNames("paths", `p-${index}`)}
            >
              {[...Array(count)].map((_, index) => (
                <div
                  className="image"
                  alt=""
                  key={index}
                  style={getStylesFromControls(
                    controlsMeta,
                    controls[currentSlide],
                    index
                  )}
                  dangerouslySetInnerHTML={{ __html: file }}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
      <div className="slides">
        {[...Array(controls.length)].map((_, index) => (
          <button
            onClick={() => setCurrentSlide(index)}
            className={classNames("slide", { active: index === currentSlide })}
            key={index}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => {
            setControls(controls.concat([{ ...controls[currentSlide] }]));
            setControlsTexts(
              controlsTexts.concat([{ ...controlsTexts[currentSlide] }])
            );
            setCurrentSlide(controls.length - 1);
          }}
          className="slide"
        >
          +
        </button>
        <button
          className="slide"
          onClick={() => {
            setCurrentSlide(0);
            console.log("currentSlide is", currentSlide);
            const targets = document.querySelectorAll(`.paths.p-0 path`);

            const nextTargets = document.querySelector(`.paths.p-1 path`);

            console.log(targets, nextTargets);
            anime({
              targets,
              d: nextTargets.getAttribute("d"),
              duration: 1000,
              loop: true,
              direction: "alternate",
              easing: "linear"
            });
          }}
        >
          <span role="img" aria-label="play">
            ▶️
          </span>
        </button>
      </div>
    </div>
  );
}

export default App;
