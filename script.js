// Playable Painting and Animation - Complete JS File
document.addEventListener("DOMContentLoaded", function () {
  // Initialize canvas
  const canvas = document.getElementById("playableCanvas");
  const ctx = canvas.getContext("2d");

  // Set initial white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Drawing state
  const state = {
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    brushColor: "#000000",
    brushSize: 5,
    brushShape: "round",
    eraserMode: false,
    undoStack: [canvas.toDataURL()], // Initial state
    redoStack: [],
    maxUndoSteps: 20,
  };

  // Animation state
  const animation = {
    frames: [],
    isPlaying: false,
    playbackInterval: null,
    maxFrames: 50,
  };

  // ======================
  // DRAWING FUNCTIONALITY
  // ======================

  function startDrawing(e) {
    state.isDrawing = true;
    [state.lastX, state.lastY] = getPosition(e);
    saveState();
  }

  function draw(e) {
    if (!state.isDrawing) return;

    const [x, y] = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = state.eraserMode ? "#ffffff" : state.brushColor;
    ctx.lineWidth = state.brushSize;
    ctx.lineCap = state.brushShape;
    ctx.lineJoin = "round";
    ctx.stroke();

    state.lastX = x;
    state.lastY = y;
  }

  function stopDrawing() {
    state.isDrawing = false;
  }

  function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return [
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top,
    ];
  }

  function saveState() {
    if (state.undoStack.length >= state.maxUndoSteps) {
      state.undoStack.shift();
    }
    state.undoStack.push(canvas.toDataURL());
    state.redoStack = [];
  }

  function undo() {
    if (state.undoStack.length > 1) {
      // Keep at least initial state
      state.redoStack.push(state.undoStack.pop());
      restoreState(state.undoStack[state.undoStack.length - 1]);
    }
  }

  function redo() {
    if (state.redoStack.length > 0) {
      state.undoStack.push(state.redoStack.pop());
      restoreState(state.undoStack[state.undoStack.length - 1]);
    }
  }

  function restoreState(dataURL) {
    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
  }

  // ======================
  // ANIMATION FUNCTIONALITY
  // ======================

  function addFrame() {
    if (animation.frames.length >= animation.maxFrames) {
      alert(`Maximum of ${animation.maxFrames} frames reached`);
      return;
    }
    animation.frames.push(canvas.toDataURL());
    updateFrameCounter();
  }

  function playAnimation() {
    if (animation.frames.length === 0) {
      alert("No frames to play! Add frames first.");
      return;
    }

    if (animation.isPlaying) {
      stopAnimation();
      return;
    }

    animation.isPlaying = true;
    document.getElementById("playAnimation").textContent = "Stop Animation";

    const speed =
      parseInt(document.getElementById("playbackSpeed").value) || 500;
    let currentFrame = 0;

    animation.playbackInterval = setInterval(function () {
      const img = new Image();
      img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = animation.frames[currentFrame];

      currentFrame = (currentFrame + 1) % animation.frames.length;
    }, speed);
  }

  function stopAnimation() {
    clearInterval(animation.playbackInterval);
    animation.isPlaying = false;
    document.getElementById("playAnimation").textContent = "Play Animation";
  }

  function updateFrameCounter() {
    document.getElementById(
      "frameCounter"
    ).textContent = `Frames: ${animation.frames.length}`;
  }

  function exportAnimation() {
    if (animation.frames.length === 0) {
      alert("No frames to export!");
      return;
    }

    try {
      const zip = new JSZip();
      animation.frames.forEach(function (frame, index) {
        const imgData = frame.replace(/^data:image\/png;base64,/, "");
        zip.file(`frame_${index + 1}.png`, imgData, { base64: true });
      });

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "animation.zip";
        link.click();
      });
    } catch (error) {
      alert("Error exporting animation: " + error.message);
    }
  }

  // ======================
  // TOOLBAR CONTROLS
  // ======================

  function setupToolbar() {
    // Brush color
    document
      .getElementById("brushColor")
      .addEventListener("input", function (e) {
        state.brushColor = e.target.value;
      });

    // Brush size
    document
      .getElementById("brushSize")
      .addEventListener("input", function (e) {
        state.brushSize = parseInt(e.target.value);
        document.getElementById("brushSizeValue").textContent = state.brushSize;
      });

    // Brush shape
    document
      .getElementById("brushShape")
      .addEventListener("change", function (e) {
        state.brushShape = e.target.value;
      });

    // Eraser toggle
    document
      .getElementById("eraserToggle")
      .addEventListener("click", function () {
        state.eraserMode = !state.eraserMode;
        this.textContent = state.eraserMode ? "Brush (E)" : "Eraser (E)";
      });

    // Clear canvas
    document
      .getElementById("clearCanvas")
      .addEventListener("click", function () {
        if (confirm("Clear the entire canvas?")) {
          saveState();
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      });

    // Undo/Redo
    document.getElementById("undo").addEventListener("click", undo);
    document.getElementById("redo").addEventListener("click", redo);

    // Export canvas
    document
      .getElementById("exportCanvas")
      .addEventListener("click", function () {
        const format = document.getElementById("exportFormat").value;
        const link = document.createElement("a");

        if (format === "png" || format === "jpg") {
          link.download = `drawing.${format}`;
          link.href = canvas.toDataURL(`image/${format}`);
          link.click();
        } else if (format === "pdf") {
          try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
              orientation:
                canvas.width > canvas.height ? "landscape" : "portrait",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("drawing.pdf");
          } catch (error) {
            alert("Error generating PDF. Make sure jsPDF is loaded.");
          }
        }
      });
  }

  function setupAnimationControls() {
    // Add frame
    document.getElementById("addFrame").addEventListener("click", addFrame);

    // Play animation
    document
      .getElementById("playAnimation")
      .addEventListener("click", playAnimation);

    // Clear frames
    document
      .getElementById("clearFrames")
      .addEventListener("click", function () {
        if (
          animation.frames.length > 0 &&
          confirm("Clear all animation frames?")
        ) {
          animation.frames = [];
          updateFrameCounter();
        }
      });

    // Export animation
    document
      .getElementById("exportAnimation")
      .addEventListener("click", exportAnimation);

    // Playback speed
    document
      .getElementById("playbackSpeed")
      .addEventListener("input", function (e) {
        document.getElementById(
          "speedValue"
        ).textContent = `${e.target.value}ms`;
      });
  }

  // ======================
  // EVENT LISTENERS
  // ======================

  function setupDrawingEvents() {
    // Mouse events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Touch events
    canvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      startDrawing(e.touches[0]);
    });

    canvas.addEventListener("touchmove", function (e) {
      e.preventDefault();
      draw(e.touches[0]);
    });

    canvas.addEventListener("touchend", stopDrawing);
  }

  function setupKeyboardShortcuts() {
    document.addEventListener("keydown", function (e) {
      // Ignore if typing in an input
      if (document.activeElement.tagName === "INPUT") return;

      switch (e.key.toLowerCase()) {
        case "e":
          document.getElementById("eraserToggle").click();
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) undo();
          break;
        case "y":
          if (e.ctrlKey || e.metaKey) redo();
          break;
        case "c":
          document.getElementById("clearCanvas").click();
          break;
        case "a":
          document.getElementById("addFrame").click();
          break;
        case "p":
          document.getElementById("playAnimation").click();
          break;
        case "escape":
          if (animation.isPlaying) stopAnimation();
          break;
      }
    });
  }

  // ======================
  // INITIALIZATION
  // ======================

  function init() {
    setupToolbar();
    setupAnimationControls();
    setupDrawingEvents();
    setupKeyboardShortcuts();
    updateFrameCounter();

    // Set initial brush size display
    document.getElementById("brushSizeValue").textContent = state.brushSize;
    document.getElementById("speedValue").textContent = `${
      document.getElementById("playbackSpeed").value
    }ms`;
  }

  // Start the application
  init();
});
