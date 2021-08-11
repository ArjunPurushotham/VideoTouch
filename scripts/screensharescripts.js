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

//needed in addition for Screenshare

//create a new client
var screenClient = AgoraRTC.createClient({
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

screenClient.init('2df3320fa8b74f9c8c8a04ac377d85d4', function () {
  screenClient.join(
    '0062df3320fa8b74f9c8c8a04ac377d85d4IADWoi3Hz3Dpp7+CYfn/HwrYKuYyU1fuWSJYmHHIt8jNg9+pr8cAAAAAEAB0GRUQdgMVYQEAAQB2AxVh',
    'mychannel',
    12345,
    function (err) {
      console.log(err);
    }
  );
});

function shareScreen(uid) {
  // Create the stream for screen sharing.
  const streamSpec = {
    streamID: uid,
    audio: false,
    //needed to show video and screen together,false if only screenshare
    video: true,
    screen: true,
  };
  // Set relevant properties according to the browser.
  // Note that you need to implement isFirefox and isCompatibleChrome.
  //   if (isFirefox()) {
  //     streamSpec.mediaSource = 'window';
  //   } else if (!isCompatibleChrome()) {
  //     streamSpec.extensionId = 'minllpmhdgpndnkomcoccfekfegnlikg';
  //   }
  screenStream = AgoraRTC.createStream(streamSpec);
  // Initialize the stream.
  screenStream.init(
    function () {
      // Play the stream.
      screenStream.play('me');

      // Publish the stream.
      screenClient.publish(screenStream);
    },
    function (err) {
      console.log(err);
    }
  );
}
//video call
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

  var y = document.getElementById('scshare');
  if (y.style.display === 'none') {
    y.style.display = 'block';
  } else {
    y.style.display = 'none';
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

function screenshareleave() {
  localStream.stop();
  document.getElementById('screen share').disabled = false;
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
