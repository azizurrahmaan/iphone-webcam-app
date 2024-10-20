const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const statusMessage = document.getElementById("statusMessage");
const angleMessage = document.getElementById("angleMessage");

let socket;
let mediaStream = null;
let currentFacingMode = "environment";
let sensorPermissionGranted = false;
let isAngleCorrect = false;

// Initialize WebSocket connection
function initWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${window.location.host}`);

  socket.onopen = () => {
    statusMessage.textContent = "Connected to server";
    statusMessage.className = "success";
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.capture) {
      console.log("Capture signal received:", data);
      capturePhoto();
    }
  };

  socket.onclose = () => {
    statusMessage.textContent = "Disconnected from server";
    statusMessage.className = "error";
    setTimeout(initWebSocket, 5000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    statusMessage.textContent = "Connection error";
    statusMessage.className = "error";
  };
}

// Access the device camera
async function initCamera(facingMode = "user") {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 4096 },
        height: { ideal: 2160 },
      },
    });
    video.srcObject = mediaStream;
    video.classList.toggle("front-camera", facingMode === "user");
  } catch (error) {
    console.error("Error accessing camera:", error);
    statusMessage.textContent = "Camera access error";
    statusMessage.className = "error";
    // Optionally, you might want to add more user-friendly error messages here
    if (error.name === "NotAllowedError") {
      statusMessage.textContent =
        "Camera access denied. Please check your permissions.";
    } else if (error.name === "NotFoundError") {
      statusMessage.textContent = "No camera found on this device.";
    }
  }
}

// Switch camera
function switchCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  initCamera(currentFacingMode);
}

// Capture photo from video stream
function capturePhoto() {
  statusMessage.className = "error";
  if (!mediaStream) {
    statusMessage.textContent = "Camera not initialized";
    return;
  }

  if (!sensorPermissionGranted) {
    statusMessage.textContent = "Sensor permissions not granted";
    return;
  }

  if (!isAngleCorrect) {
    statusMessage.textContent = "Adjust phone angle before capturing";
    return;
  }
  statusMessage.textContent = "";
  statusMessage.className = "success";

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      uploadPhoto(blob);
    },
    "image/jpeg",
    0.95
  );
}

// Upload the captured photo to the server
function uploadPhoto(blob) {
  const formData = new FormData();
  formData.append("photo", blob, "capture.jpg");

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Upload response:", data);
      statusMessage.className = "success";
      statusMessage.textContent = "Photo captured and uploaded";
      setTimeout(
        () => (statusMessage.textContent = "Connected to server"),
        3000
      );
    })
    .catch((error) => {
      console.error("Upload error:", error);
      statusMessage.className = "error";
      statusMessage.textContent = "Failed to upload photo";
    });
}

// Check device orientation
function handleOrientation(event) {
  const beta = event.beta; // X-axis rotation
  const gamma = event.gamma; // Y-axis rotation

  // Calculate the angle of the phone from vertical
  const angle = Math.sqrt(beta * beta + gamma * gamma);

  if (angle >= 10 && angle <= 90) {
    video.style.display = "block";
    angleMessage.style.display = "none";
    isAngleCorrect = true;
    captureBtn.classList.add("angle-correct");
  } else {
    video.style.display = "none";
    angleMessage.style.display = "block";
    isAngleCorrect = false;
    captureBtn.classList.remove("angle-correct");

    if (angle < 10) {
      angleMessage.innerHTML = `Tilt phone slightly. Need 10° - 90°.<br>Current angle: <br>${angle.toFixed(
        1
      )}°`;
    } else {
      angleMessage.innerHTML = `Tilt phone less. Need 10° - 90°.<br>Current angle: <br>${angle.toFixed(
        1
      )}°`;
    }
  }
}

// Request permission for device sensors
function requestSensorPermissions() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          sensorPermissionGranted = true;
        } else {
          console.error("Permission for device orientation was denied");
          angleMessage.textContent =
            "Orientation access denied. Please enable and refresh.";
          sensorPermissionGranted = false;
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener("deviceorientation", handleOrientation);
    sensorPermissionGranted = true;
  }
}

// Event listeners
captureBtn.addEventListener("click", capturePhoto);
switchCameraBtn.addEventListener("click", switchCamera);

// Initialize the app
window.addEventListener("load", () => {
  initCamera();
  initWebSocket();

  // Create a button to request permissions
  const permissionBtn = document.createElement("button");
  permissionBtn.textContent = "Enable Orientation Sensors";
  permissionBtn.style.position = "absolute";
  permissionBtn.style.top = "20px";
  permissionBtn.style.padding = "10px";
  permissionBtn.style.left = "20px";
  permissionBtn.style.zIndex = "1000";
  document.body.appendChild(permissionBtn);

  permissionBtn.addEventListener("click", () => {
    requestSensorPermissions();
    permissionBtn.style.display = "none";
  });
});
