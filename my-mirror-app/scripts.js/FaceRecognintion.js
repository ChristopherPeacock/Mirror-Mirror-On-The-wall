let access;

// Make sure the script runs after the page and all external resources are loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add a small delay to ensure face-api.js is fully loaded
  setTimeout(() => {
    initFaceDetection();
  }, 0.1);
});

function initFaceDetection() {
  // Check if faceapi is loaded
  if (typeof faceapi === "undefined") {
    console.error(
      "face-api.js not loaded. Check your connection and try again."
    );
    document.getElementById("loading").textContent =
      "Error: face-api.js not loaded. Check console for details.";
    return;
  }

  console.log("face-api.js loaded successfully");

  const video = document.getElementById("video");
  const modelsPath = "scripts.js/models";

  // Load all required models
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelsPath),
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelsPath), // Add this model for face detection in images
  ])
    .then(() => {
      console.log("All models loaded successfully");
      startVideo();
    })
    .catch((error) => {
      console.error("Error loading models:", error);
    });

  // Function to process reference images and create labeled face descriptors
  async function loadLabeledImages() {
    const labels = [
      "face1",
      "face2",
      "face3",
      "face4",
      "face5",
      "face6",
      "face7",
      "face8",
      "face9",
    ];
    const labeledFaceDescriptors = [];

    console.log("Starting to load labeled images");

    for (const label of labels) {
      try {
        const imgPath = `./UserPictures/${label.replace("face", "face ")}.jpg`;
        console.log(`Loading image: ${imgPath}`);

        const img = await faceapi.fetchImage(imgPath);

        // Detect face in the reference image
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          console.log(`Successfully processed ${label}`);
          const faceDescriptor = detections.descriptor;
          labeledFaceDescriptors.push(
            new faceapi.LabeledFaceDescriptors(label, [faceDescriptor])
          );
        } else {
          console.warn(`No face detected in ${label}`);
        }
      } catch (error) {
        console.error(`Error processing ${label}:`, error);
      }
    }

    console.log(`Processed ${labeledFaceDescriptors.length} labeled images`);
    return labeledFaceDescriptors;
  }

  function startVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        console.log("Camera access granted");
        video.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }

  video.addEventListener("play", async () => {
    console.log("Video started playing");

    // Load labeled face descriptors
    const labeledFaceDescriptors = await loadLabeledImages();
    console.log(
      "Labeled face descriptors loaded:",
      labeledFaceDescriptors.length
    );

    // Create face matcher with labeled face descriptors
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    // Create canvas for drawing face detections
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    // Set canvas size to match video
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // Start detection loop
    setInterval(async () => {
      try {
        // Detect faces with landmarks, expressions, and descriptors
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptors();

        // Resize results to match display size
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        // Clear canvas before drawing new detections
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw detections, landmarks, and expressions
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // Match and display recognized faces
        if (resizedDetections.length > 0) {
          resizedDetections.forEach((detection) => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

            // Draw recognition result
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: bestMatch.toString(),
              boxColor: bestMatch.distance < 0.45 ? "green" : "red",
            });
            if (bestMatch.distance < 0.45) {
              console.log("Access granted");
              access = true;
            } else {
              console.log("Access denied");
              access = false;
            }
            drawBox.draw(canvas);
            drawBox.draw(canvas);

            console.log(`Face match result: ${bestMatch.toString()}`);
          });
        }
      } catch (error) {
        console.error("Error in detection loop:", error);
      }
    }, 100);
  });
}
