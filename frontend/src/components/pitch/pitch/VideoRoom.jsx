import React, { useRef } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

const VideoRoom = ({
  roomName,
  displayName,
  userRole,
  onRoomLeft,
}) => {
  const apiRef = useRef(null);

  const handleApiReady = (externalApi) => {
    apiRef.current = externalApi;

    externalApi.addEventListener('videoConferenceLeft', () => {
      if (onRoomLeft) onRoomLeft();
    });

    if (userRole === 'audience') {
      externalApi.executeCommand('toggleAudio');
      externalApi.executeCommand('toggleVideo');
    }
  };

  const jitsiRoomName = `campuslaunch-${roomName}`;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg flex flex-col" style={{ minHeight: '480px', height: '70vh' }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={jitsiRoomName}
        userInfo={{
          displayName: displayName || 'CampusLaunch User',
        }}
        configOverwrite={{
          startWithAudioMuted: userRole === 'audience',
          startWithVideoMuted: userRole === 'audience',
          disableDeepLinking: true,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
          hideConferenceSubject: false,
          subject: `CampusLaunch Pitch: ${roomName}`,
          toolbarButtons: userRole === 'audience'
            ? ['chat', 'raisehand', 'tileview', 'fullscreen']
            : [
                'microphone', 'camera', 'desktop', 'chat',
                'raisehand', 'tileview', 'fullscreen', 'hangup'
              ],
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
        }}
        onApiReady={handleApiReady}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
          iframeRef.style.border = 'none';
          iframeRef.style.borderRadius = '12px';

          if (iframeRef.parentNode) {
            iframeRef.parentNode.style.flex = '1';
            iframeRef.parentNode.style.display = 'flex';
            iframeRef.parentNode.style.flexDirection = 'column';
          }
        }}
        spinner={() => (
          <div className="flex items-center justify-center h-64 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            <p className="ml-4 text-stone-600 font-bold text-sm uppercase tracking-widest">
              Connecting to live session...
            </p>
          </div>
        )}
      />
    </div>
  );
};

export default VideoRoom;
