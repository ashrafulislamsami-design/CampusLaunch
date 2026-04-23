import { useState, useCallback } from 'react';

const useJitsiRoom = () => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);

  const joinRoom = useCallback(() => {
    setIsInRoom(true);
    setRoomError(null);
  }, []);

  const leaveRoom = useCallback(() => {
    setIsInRoom(false);
  }, []);

  const handleRoomError = useCallback((error) => {
    setRoomError(error);
    setIsInRoom(false);
  }, []);

  return {
    isInRoom,
    roomError,
    joinRoom,
    leaveRoom,
    handleRoomError,
  };
};

export default useJitsiRoom;
