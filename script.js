// Enhanced Setup for Playable Painting and Animation Web App

// Import necessary libraries if using a bundler (like Webpack or Vite)
// Example: import Konva from 'konva';

// HTML5 Canvas Setup
const canvasContainer = document.createElement("div");
canvasContainer.id = "canvasContainer";
canvasContainer.style.display = "flex";
canvasContainer.style.flexDirection = "column";
canvasContainer.style.alignItems = "center";
canvasContainer.style.justifyContent = "center";
canvasContainer.style.height = "100vh";
canvasContainer.style.backgroundColor = "#5d7d3d";
canvasContainer.style.padding = "30px";
canvasContainer.style.boxShadow = "0px 4px 6px rgba(156, 234, 21, 0.4)";
document.body.appendChild(canvasContainer);

document.body.style.margin = "0";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.color = "#f0f0f0";

const title = document.createElement("h1");
title.textContent = "Playable Painting & Animation";
title.style.marginBottom = "20px";
title.style.color = "#ffffff";
title.style.textAlign = "center";
title.style.fontSize = "2em";
canvasContainer.appendChild(title);

const canvas = document.createElement("canvas");
canvas.id = "playableCanvas";
canvas.width = window.innerWidth * 0.8; // Canvas width is 70% of the window width
canvas.height = window.innerHeight * 0.7; // Canvas height is 50% of the window height
canvas.style.border = "2px solid #888"; // Add a border for better visibility
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "0px 2px 8px rgba(183, 235, 13, 0.4)";
canvas.style.backgroundColor = "#ffffff";
canvasContainer.appendChild(canvas);

const ctx = canvas.getContext("2d");

// Basic Drawing Tools
let isDrawing = false;
let brushColor = "#000000";
let brushSize = 5;
let brushShape = "round";
let eraserMode = false;
let undoStack = [];
let redoStack = [];

// Add Undo Functionality
const saveState = () => {
  undoStack.push(canvas.toDataURL());
  redoStack = []; // Clear redo stack
};

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  saveState();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = eraserMode ? "#ffffff" : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = brushShape;
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx.closePath();
});

// Toolbar for Brush Options
const toolbar = document.createElement("div");
toolbar.id = "toolbar";
toolbar.style.marginBottom = "20px";
toolbar.style.display = "flex";
toolbar.style.gap = "10px";
toolbar.style.padding = "10px";
toolbar.style.borderRadius = "8px";
toolbar.style.backgroundColor = "#444";
toolbar.style.boxShadow = "0px 2px 6px rgba(0, 0, 0, 0.3)";
toolbar.style.color = "#fff";
canvasContainer.insertBefore(toolbar, canvas); // Move toolbar above the canvas

toolbar.innerHTML = `
  <label style="display:flex; align-items: center;">
    <span style="margin-right: 8px;">Color:</span>
    <input type="color" id="brushColor" value="#000000" style="border: none;"> 
  </label>
  <label style="display:flex; align-items: center;">
    <span style="margin-right: 8px;">Size:</span>
    <input type="range" id="brushSize" min="1" max="50" value="5"> 
  </label>
  <select id="brushShape" style="padding: 4px;">
    <option value="round">Round</option>
    <option value="square">Square</option>
  </select>
  <button id="eraserToggle" style="padding: 8px;">Eraser</button>
  <button id="undo" style="padding: 8px;">Undo</button>
  <button id="redo" style="padding: 8px;">Redo</button>
  <button id="clearCanvas" style="padding: 8px;">Clear</button>
  <select id="exportFormat" style="padding: 4px;">
    <option value="png">PNG</option>
    <option value="jpg">JPG</option>
    <option value="gif">GIF</option>
    <option value="pdf">PDF</option>
  </select>
  <button id="exportCanvas" style="padding: 8px;">Export</button>
`;

document.getElementById("brushColor").addEventListener("input", (e) => {
  brushColor = e.target.value;
});

document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = e.target.value;
});

document.getElementById("brushShape").addEventListener("change", (e) => {
  brushShape = e.target.value;
});

document.getElementById("eraserToggle").addEventListener("click", () => {
  eraserMode = !eraserMode;
  document.getElementById("eraserToggle").textContent = eraserMode
    ? "Brush"
    : "Eraser";
});

document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveState();
});

document.getElementById("undo").addEventListener("click", () => {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    const lastState = undoStack.pop();
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
});

document.getElementById("redo").addEventListener("click", () => {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    const nextState = redoStack.pop();
    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
});

document.getElementById("exportCanvas").addEventListener("click", () => {
  const format = document.getElementById("exportFormat").value;
  const link = document.createElement("a");

  if (format === "png" || format === "jpg") {
    link.download = `canvas_image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  } else if (format === "gif") {
    alert("GIF export is not yet implemented.");
  } else if (format === "pdf") {
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 190, 90);
    pdf.save("canvas_image.pdf");
  }
});

// Animation Features (Frame-by-Frame)
let frames = [];
let currentFrame = 0;
let isAddingFrame = false;

const addFrame = () => {
  if (isAddingFrame) {
    isAddingFrame = false;
    document.getElementById("addFrame").textContent = "Add Frame";
    return;
  }
  isAddingFrame = true;
  document.getElementById("addFrame").textContent = "Deselect Frame";
  const frame = canvas.toDataURL();
  frames.push(frame);
  currentFrame = frames.length - 1;
  console.log(`Frame ${currentFrame + 1} added.`);
};

const playAnimation = (speed = 500) => {
  if (frames.length === 0) {
    alert("No frames available to play. Please add at least one frame.");
    return;
  }
  let index = 0;
  const interval = setInterval(() => {
    if (index >= frames.length) {
      clearInterval(interval);
    } else {
      const img = new Image();
      img.src = frames[index];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      index++;
    }
  }, speed); // Adjustable playback speed
};

// Animation Controls
const animationControls = document.createElement("div");
animationControls.id = "animationControls";
animationControls.style.marginBottom = "20px";
animationControls.style.display = "flex";
animationControls.style.gap = "10px";
animationControls.style.padding = "10px";
animationControls.style.borderRadius = "8px";
animationControls.style.backgroundColor = "#444";
animationControls.style.boxShadow = "0px 2px 6px rgba(0, 0, 0, 0.3)";
animationControls.style.color = "#fff";
canvasContainer.insertBefore(animationControls, toolbar); // Move animation controls above the toolbar

animationControls.innerHTML = `
  <button id="addFrame" style="padding: 8px;">Add Frame</button>
  <button id="playAnimation" style="padding: 8px;">Play Animation</button>
  <button id="saveAnimation" style="padding: 8px;">Save</button>
  <button id="exportAnimation" style="padding: 8px;">Export Animation</button>
  <input type="number" id="playbackSpeed" min="100" max="2000" value="500" style="padding: 4px;"> ms (Playback Speed)
  <input type="file" id="importAnimation" accept=".zip" style="padding: 4px;">
`;

document.getElementById("addFrame").addEventListener("click", addFrame);
document.getElementById("playAnimation").addEventListener("click", () => {
  const speed =
    parseInt(document.getElementById("playbackSpeed").value, 10) || 500;
  playAnimation(speed);
});

document.getElementById("saveAnimation").addEventListener("click", () => {
  console.log("Animation saved with", frames.length, "frames.");
});

document.getElementById("exportAnimation").addEventListener("click", () => {
  const zip = new JSZip();
  frames.forEach((frame, index) => {
    const imgData = frame.replace(/^data:image\/png;base64,/, "");
    zip.file(`frame_${index + 1}.png`, imgData, { base64: true });
  });
  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "animation_frames.zip";
    link.click();
  });
});

document
  .getElementById("importAnimation")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      frames = [];
      const frameFiles = Object.keys(loadedZip.files).sort();
      for (const fileName of frameFiles) {
        const fileData = await loadedZip.file(fileName).async("base64");
        frames.push(`data:image/png;base64,${fileData}`);
      }
      console.log(`${frames.length} frames imported.`);
    }
  });

// Accessibility: Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "z": // Undo
      document.getElementById("undo").click();
      break;
    case "y": // Redo
      document.getElementById("redo").click();
      break;
    case "e": // Toggle Eraser
      document.getElementById("eraserToggle").click();
      break;
    case "a": // Add Frame
      document.getElementById("addFrame").click();
      break;
    case "p": // Play Animation
      document.getElementById("playAnimation").click();
      break;
    case "c": // Clear Canvas
      document.getElementById("clearCanvas").click();
      break;
    default:
      break;
  }
});
