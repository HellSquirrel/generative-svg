import React, { useRef, useState, useEffect } from "react";
import { assocPath } from "ramda";
import classNames from "classnames";
import "./App.css";
import { interpolate } from "flubber";
import { getStub } from "./svgStub";
import svgpath from "svgpath";

const viewBox = {
  width: 500,
  height: 500
};

const countId = "count";
const controlsMeta = [
  { label: "x, %", initialValue: 50, id: "x" },
  { label: "y, %", initialValue: 50, id: "y" },
  { label: "count", initialValue: 5, id: countId },
  { label: "step x", initialValue: 0, id: "dx" },
  { label: "step y", initialValue: 0, id: "dy" },
  { label: "initial scale", initialValue: 1, id: "sc" },
  { label: "scale step", initialValue: 0, id: "dSc" },
  { label: "initial rotation, deg", initialValue: 0, id: "rot" },
  { label: "rotation step, deg", initialValue: 4, id: "dRot" },
  { label: "rotation origin x", initialValue: 0, id: "origX" },
  { label: "rotation origin y", initialValue: 0, id: "origY" },
  { label: "initial opacity", initialValue: 1, id: "o" },
  { label: "end opacity", initialValue: 0, id: "oe" },
  { label: "transition, ms", initialValue: 1000, id: "tt" }
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
    transition: `all ${tt}ms linear`,
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
  const shapes = useRef(null);
  const [files, setFiles] = useState([]);
  const [controls, setControls] = useState([{}]);
  const [controlsTexts, setControlsTexts] = useState([{}]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const count = animate
    ? getValue(controlsMeta, controls[animationStep], countId)
    : getValue(controlsMeta, controls[animationStep], countId);

  const file = animate ? files[0] : files[currentSlide];

  useEffect(() => {
    if (
      animate &&
      animationStep < controls.length &&
      file &&
      files[animationStep] &&
      animationStep
    ) {
      let done = false;
      const d1 = shapes.current.querySelector("path").getAttribute("d");
      const elements = shapes.current.querySelectorAll("path");
      const d2Container = document.createElement("div");
      d2Container.innerHTML = files[animationStep];
      const path2 = d2Container.querySelector("path");
      const d2 = path2.getAttribute("d");
      const interpolator = interpolate(d1, d2, {
        maxSegmentLength: 0.5
      });
      const transitionTime = getValue(
        controlsMeta,
        controls[animationStep],
        "tt"
      );

      const speed = 1 / transitionTime;
      const stamp = performance.now();
      const run = () => {
        if (!animate) return;
        const delta = performance.now() - stamp;
        requestAnimationFrame(() => {
          if (delta < transitionTime) {
            [...elements].forEach(e => {
              e.setAttribute("d", interpolator(delta * speed));
            });
            run();
          } else if (!done) {
            done = true;
            if (animationStep + 1 < controls.length) {
              setAnimationStep(animationStep + 1);
            }
          }
        });
      };
      run();
    }
  }, [animate, animationStep, controls, controls.length, file, files]);

  const fr = useRef(new FileReader());
  fr.current.onload = e => {
    const svg = e.target.result;
    const fragment = document.createElement("div");
    fragment.innerHTML = svg;
    const [_, __, currentWidth, currentHeight] = fragment
      .querySelector("svg")
      .getAttribute("viewBox")
      .split(" ");

    const pathEl = fragment.querySelector("path");
    const svgEl = fragment.querySelector("svg");

    const dx = 0.5 * (viewBox.width - Number(currentWidth));
    const dy = 0.5 * (viewBox.height - Number(currentHeight));
    const d = svgpath(pathEl.getAttribute("d"))
      .translate(dx, dy)
      .toString();

    pathEl.setAttribute("d", d);

    const svgText = getStub(viewBox.width, viewBox.height, svgEl.innerHTML);
    setFiles(assocPath([currentSlide], svgText));
  };

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
      <div ref={shapes}>
        {file &&
          [...Array(count)].map((_, index) => (
            <div
              className="image"
              alt=""
              key={index}
              style={getStylesFromControls(
                controlsMeta,
                controls[animate ? animationStep : currentSlide],
                index
              )}
              dangerouslySetInnerHTML={{ __html: file }}
            />
          ))}
      </div>
      {/* <div
        className="image"
        alt=""
        style={getStylesFromControls(
          controlsMeta,
          controls[animate ? animationStep : currentSlide],
          0
        )}
        dangerouslySetInnerHTML={{ __html: files[1] }}
      /> */}

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
            setCurrentSlide(controls.length);
          }}
          className="slide"
        >
          +
        </button>
        <button
          className="slide"
          onClick={() => {
            setAnimate(!animate);
            setAnimationStep(1);
          }}
        >
          {animate ? (
            <span role="img" aria-label="pause">
              ◾
            </span>
          ) : (
            <span role="img" aria-label="play">
              ▶
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
