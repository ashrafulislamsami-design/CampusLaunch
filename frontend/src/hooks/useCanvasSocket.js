import { useEffect, useRef, useState, useCallback } from 'react';
import { SOCKET_URL } from '../components/canvas/canvasConstants';

// Real-time collaboration hook. Dynamically imports socket.io-client so the
// library isn't in the main bundle unless the canvas page is actually opened.
export default function useCanvasSocket({ teamId, user, enabled = true }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [sectionFocus, setSectionFocus] = useState({});
  const listenersRef = useRef({});

  useEffect(() => {
    if (!enabled || !teamId || !user?._id) return undefined;

    let mounted = true;
    let s;

    (async () => {
      const { io } = await import('socket.io-client');
      if (!mounted) return;
      s = io(`${SOCKET_URL}/canvas`, { transports: ['websocket', 'polling'] });

      s.on('connect', () => {
        setConnected(true);
        s.emit('canvas:join', {
          teamId,
          userId: user._id,
          userName: user.name || user.email || 'Member'
        });
      });
      s.on('disconnect', () => setConnected(false));

      s.on('canvas:presence:update', ({ activeUsers }) => {
        setActiveUsers(activeUsers || []);
      });
      s.on('canvas:section:focused', ({ sectionKey, userId, userName, color }) => {
        setSectionFocus((prev) => ({ ...prev, [sectionKey]: { userId, userName, color } }));
      });
      s.on('canvas:section:blurred', ({ sectionKey, userId }) => {
        setSectionFocus((prev) => {
          if (prev[sectionKey]?.userId === userId) {
            const next = { ...prev };
            delete next[sectionKey];
            return next;
          }
          return prev;
        });
      });

      // Re-dispatch raw events for the page to pick up via onEvent().
      ['canvas:card:added', 'canvas:card:updated', 'canvas:card:deleted', 'canvas:card:reordered', 'canvas:saved'].forEach((evt) => {
        s.on(evt, (payload) => {
          const cb = listenersRef.current[evt];
          if (cb) cb(payload);
        });
      });

      setSocket(s);
    })();

    return () => {
      mounted = false;
      if (s) {
        s.removeAllListeners();
        s.disconnect();
      }
    };
  }, [enabled, teamId, user?._id]);

  const onEvent = useCallback((evt, cb) => {
    listenersRef.current[evt] = cb;
  }, []);

  const emit = useCallback(
    (evt, payload) => {
      if (socket && connected) socket.emit(evt, payload);
    },
    [socket, connected]
  );

  return { socket, connected, activeUsers, sectionFocus, onEvent, emit };
}
