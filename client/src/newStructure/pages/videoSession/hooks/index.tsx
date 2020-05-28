import React from 'react';
import { config, IConfigArgs, copyToClipboard } from './utils';
import swal from 'sweetalert';
import $ from 'jquery';

interface IArgs {
  configArgs: IConfigArgs;
  isOpener: boolean;
  url: string;
  joinRoom: () => void;
  openRoom: () => void;
  onRoomCreated: () => void;
}

export const useSetup = ({
  configArgs,
  isOpener,
  url,
  joinRoom,
  openRoom,
  onRoomCreated
}: IArgs): void => {
  React.useEffect((): (() => void) => {
    config(configArgs);

    if (isOpener) {
      openRoom();

      copyToClipboard(url);

      swal(
        'Room Link Copied to Clipboard',
        'Paste and send your room URL to your patient',
        'success'
      );
    } else {
      joinRoom();
    }

    onRoomCreated();

    if ($('video', '#localStream')) {
      $('video', '#localStream').removeAttr('controls');
      console.log('removed');
    }

    return (): void => {
      // disconnect with all users
      configArgs.connection.current.getAllParticipants().forEach((pid: any) => {
        configArgs.connection.current.disconnectWith(pid);
      });

      // stop all local cameras
      configArgs.connection.current.attachStreams.forEach(function(
        localStream: any
      ) {
        localStream.stop();
      });

      // close socket.io connection
      configArgs.connection.current.closeSocket();
    };
  }, [configArgs]);
};
