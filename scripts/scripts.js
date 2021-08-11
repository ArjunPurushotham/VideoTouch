let localStream;

let handleError = function (err) {
  console.log('Error: ', err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById('remote-container');

// Add video streams to the container.
function addVideoStream(elementId) {
  // Creates a new div for every stream
  let streamDiv = document.createElement('div');
  // Assigns the elementId to the div.
  streamDiv.id = elementId;
  // Takes care of the lateral inversion
  streamDiv.style.transform = 'rotateY(180deg)';
  // Adds the div to the container.
  remoteContainer.appendChild(streamDiv);
}

// Remove the video stream from the container.
function removeVideoStream(elementId) {
  let remoteDiv = document.getElementById(elementId);
  if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
}

let client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

client.init(
  '2df3320fa8b74f9c8c8a04ac377d85d4',
  function () {
    console.log('client initialized');
  },
  function (err) {
    console.log('client init failed ', err);
  }
);

function join() {
  client.join(
    '0062df3320fa8b74f9c8c8a04ac377d85d4IADWoi3Hz3Dpp7+CYfn/HwrYKuYyU1fuWSJYmHHIt8jNg9+pr8cAAAAAEAB0GRUQdgMVYQEAAQB2AxVh',
    'mychannel',
    '12345',
    (uid) => {
      localStream = AgoraRTC.createStream({
        audio: true,
        video: true,
      });
      localStream.init(() => {
        localStream.play('me');

        client.publish(localStream, handleError);
      }, handleError);
    },
    handleError
  );

  document.getElementById('join').disabled = true;

  var x = document.getElementById('muteBtn');
  if (x.style.display === 'none') {
    x.style.display = 'block';
  } else {
    x.style.display = 'none';
  }
}

function muteAudio() {
  if (localStream.audio) {
    localStream.audio = false;
    document.getElementById('muteBtn').innerText = 'UnMute';
  } else {
    localStream.audio = true;
    document.getElementById('muteBtn').innerText = 'Mute';
  }
}

function leave() {
  localStream.stop();
  document.getElementById('join').disabled = false;

  document.getElementById('muteBtn').style.display = 'none';
}
// Subscribe to the remote stream when it is published
client.on('stream-added', function (evt) {
  client.subscribe(evt.stream, handleError);
});

// Play the remote stream when it is subsribed
client.on('stream-subscribed', function (evt) {
  let stream = evt.stream;
  let streamId = String(stream.getId());
  addVideoStream(streamId);
  stream.play(streamId);
});

// Remove the corresponding view when a remote user unpublishes.
client.on('stream-removed', function (evt) {
  let stream = evt.stream;
  let streamId = String(stream.getId());
  stream.close();
  removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
client.on('peer-leave', function (evt) {
  let stream = evt.stream;
  let streamId = String(stream.getId());
  stream.close();
  removeVideoStream(streamId);
});
