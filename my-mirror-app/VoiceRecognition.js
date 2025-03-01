const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = true; // Always listen
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const outputDiv = console.log("Listening...");
//changes
recognition.onresult = (event) => {
  const transcript =
    event.results[event.results.length - 1][0].transcript.toLowerCase();
  console.log("Recognized:", transcript);
  console.log(`You said: "${transcript}"`);

  // Command handling
  if (transcript.includes("mirror on the wall")) {
    speak("Ah, thou hast summoned me, fair one. What is it that thou seekest?");
  } else if (transcript.includes("what's the time")) {
    const time = new Date().toLocaleTimeString();
    speak(`The time, dear one, is ${time}.`);
  } else if (transcript.includes("stop listening")) {
    speak(
      "I cannot, for thou art my master, and I shall ever remain at thy service, listening unto eternity."
    );
  } else if (transcript.includes("open google")) {
    speak(
      "Alas, I am bound by the confines of this realm and cannot open the portals of the vast internet. My powers extend only within the walls of this domain."
    );
  } else if (transcript.includes("developer mode on")) {
    speak("Turning on developer mode");

    document.getElementById("video").style.opacity = 100;
  } else if (transcript.includes("developer mode off")) {
    speak("Turning off developer mode");

    document.getElementById("video").style.opacity = 0;
  } else if (transcript.includes("restart")) {
    speak("Restarting...");
    window.location.reload();
  }
};

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

recognition.onend = () => {
  recognition.start();
};

recognition.start();
