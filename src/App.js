import React, { useRef, useState } from "react";
import "./App.css";

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
  { label: "opacity step", initialValue: 0, id: "dO" }
];

function getStylesFromControls(controlsMeta, controls, i) {
  const x = getValue(controlsMeta, controls, "x");
  const dx = getValue(controlsMeta, controls, "dx");
  const y = getValue(controlsMeta, controls, "y");
  const dy = getValue(controlsMeta, controls, "dy");
  const sc = getValue(controlsMeta, controls, "sc");
  const dSc = getValue(controlsMeta, controls, "dSc");
  const rot = getValue(controlsMeta, controls, "rot");
  const dRot = getValue(controlsMeta, controls, "dRot");
  const o = getValue(controlsMeta, controls, "o");
  const dO = getValue(controlsMeta, controls, "dO");
  return {
    position: "absolute",
    top: `${y + i * dy}%`,
    left: `${x + i * dx}%`,
    transition: `all 200ms`,
    transform: `translate(-50%, -50%) scale(${sc + i * dSc}) rotate(${rot +
      i * dRot}deg)`,
    opacity: o - i * dO,
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
  const [file, setFile] = useState(null);
  const [controls, setControls] = useState({});
  const [controlsTexts, setControlsTexts] = useState({});
  const count = getValue(controlsMeta, controls, countId);

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
              setFile(URL.createObjectURL(fileSource));
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
                value={getValue(controlsMeta, controlsTexts, id)}
                placeholder={label}
                className="controlInput"
                onChange={event => {
                  let value = event.currentTarget.value;
                  setControlsTexts(old => ({
                    ...old,
                    [id]: value
                  }));

                  const numberified = Number(value);
                  if (!Number.isNaN(numberified)) {
                    setControls(old => ({ ...old, [id]: numberified }));
                  }
                }}
              />
            </div>
          );
        })}
      </div>
      {file &&
        [...Array(count)].map((_, index) => (
          <img
            src={file}
            className="image"
            alt=""
            key={index}
            style={getStylesFromControls(controlsMeta, controls, index)}
          />
        ))}
    </div>
  );
}

export default App;
