export interface IConfigArgs {
  connection: any;
  isLocal: boolean;
  localConnected: boolean;
  onConnected: () => void;
  onLocalConnected: () => void;
  onRemoteConnected: () => void;
}

export const config = ({
  connection,
  isLocal,
  localConnected,
  onConnected,
  onLocalConnected,
  onRemoteConnected,
}: IConfigArgs): void => {
  // SECURITY WARNING: all connections go through someone else's server... we need to run our own copy
  // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

  // all below lines are optional; however recommended.
  connection.session = {
    audio: true,
    video: true,
    data: true,
  };
  connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  };

  if (isLocal) {
    connection.videosContainer = document.getElementById('localStream');
  } else {
    connection.videosContainer = document.getElementById('remoteStream');
  }

  connection.onopen = (): void => onConnected();

  connection.onstream = (event: any) => {
    event.mediaElement.play();
    setTimeout(function () {
      event.mediaElement.play();
    }, 5000);

    let videoContainer;

    // the first time this function is called it is from the local stream,
    // the 2nd time this function is called is because of the remote stream
    if (!localConnected) {
      videoContainer = document.getElementById('localStream');
      onLocalConnected();
    } else {
      videoContainer = document.getElementById('remoteStream');
      onRemoteConnected();
    }

    videoContainer?.appendChild(event.mediaElement);

    event.mediaElement.removeAttribute('controls');

    // @ts-ignore
    window.connection = connection;
  };

  // @ts-ignore
  window.connection = connection;
};

export const copyToClipboard = (str: any) => {
  const el = document.createElement('textarea'); // Create a <textarea> element
  el.value = str; // Set its value to the string that you want copied
  el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px'; // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  const selected =
    // @ts-ignore
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? // @ts-ignore
        document.getSelection()?.getRangeAt(0) // Store selection if found
      : false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el); // Remove the <textarea> element

  if (selected) {
    // If a selection existed before copying
    // @ts-ignore
    document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
    // @ts-ignore
    document.getSelection().addRange(selected); // Restore the original selection
  }
};
