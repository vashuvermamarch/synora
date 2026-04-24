import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Video as VideoIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import RatingModal from '../components/RatingModal';
import type { Session } from '../types';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function VideoSession() {
  const { roomName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [displayName, setDisplayName] = useState(localStorage.getItem('synora_display_name') || '');
  const [showPrompt, setShowPrompt] = useState(false);
  const [jitsiInitialized, setJitsiInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  // Load session info
  useEffect(() => {
    if (isAuthenticated && roomName) {
      api.get(`/sessions/room/${roomName}/`)
        .then(res => setSession(res.data))
        .catch(err => console.error("Failed to fetch session:", err));
    }
  }, [isAuthenticated, roomName]);

  // Configuration Constants
  const SYNO_SECRET_KEY = "SynoraHost2026";
  const urlParams = new URLSearchParams(location.search);
  const isHost = urlParams.get('secret') === SYNO_SECRET_KEY || isAuthenticated;

  useEffect(() => {
    // Determine if we need to show the name prompt
    if (!isAuthenticated && !displayName) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
      // Use authenticated username if available
      const finalName = isAuthenticated ? user?.username : displayName;
      if (finalName) startJitsi(finalName);
    }
  }, [isAuthenticated, displayName, roomName]);

  const startJitsi = (name: string) => {
    if (jitsiInitialized || !jitsiContainerRef.current || !roomName) return;
    setJitsiInitialized(true);

    const domain = 'jitsi.riot.im';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: name,
        id: localStorage.getItem('synora_user_id') || `guest-${Math.floor(Math.random() * 9000)}`
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        // CRITICAL: Disable all moderator requirements to prevent Jitsi from asking for login
        enableModeratedMeetings: false,
        startRoomsWithoutModerator: true,
        enableNoisyDetection: true,
        disableModeratorIndicator: true,
      },
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 2,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen', 'fodeviceselection', 'hangup',
          'chat', 'raisehand', 'tileview'
        ]
      }
    };

    const initApi = () => {
      if (window.JitsiMeetExternalAPI) {
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Listen for meeting end
        apiRef.current.addEventListeners({
          videoConferenceLeft: () => {
            if (isAuthenticated && session) {
              setShowRatingModal(true);
            } else {
              navigate('/sessions');
            }
          },
          readyToClose: () => {
            if (isAuthenticated && session) {
              setShowRatingModal(true);
            } else {
              navigate('/sessions');
            }
          }
        });
      } else {
        setTimeout(initApi, 500);
      }
    };
    initApi();
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as any).guestName.value.trim();
    if (input.length >= 2) {
      setDisplayName(input);
      localStorage.setItem('synora_display_name', input);
      if (!localStorage.getItem('synora_user_id')) {
        localStorage.setItem('synora_user_id', `syno-guest-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setShowPrompt(false);
    }
  };

  useEffect(() => {
    return () => {
      if (apiRef.current) apiRef.current.dispose();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-surface" style={{ padding: '6rem 2rem' }}>

      {/* GUEST NAME PROMPT MODAL */}
      {showPrompt && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[6px] border-secondary p-12 max-w-md w-full shadow-[16px_16px_0px_0px_#000]">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary border-[4px] border-secondary flex items-center justify-center">
                <User size={40} strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-2">IDENTIFY_YOURSELF</h2>
            <p className="font-mono text-xs text-muted text-center uppercase tracking-widest mb-8">Enter a display name to join the secure session</p>

            <form onSubmit={handlePromptSubmit}>
              <input
                name="guestName"
                type="text"
                required
                placeholder="YOUR_NAME_HERE..."
                className="w-full border-[4px] border-secondary p-4 font-bold text-lg mb-6 outline-none focus:bg-primary/10 transition-colors"
                autoFocus
              />
              <button type="submit" className="w-full bg-primary border-[4px] border-secondary py-4 font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                START_SESSION
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/sessions" className="bg-white border-[4px] border-secondary p-2 hover:bg-secondary hover:text-white transition-colors" style={{ boxShadow: '4px 4px_0px_0px_#000' }}>
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              <VideoIcon size={32} strokeWidth={3} />
              LIVE_SESSION
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isHost && (
              <div className="bg-[#22C55E] text-white border-[4px] border-secondary font-black uppercase tracking-widest px-4 py-2 hidden md:block" style={{ boxShadow: '4px 4px_0px_0px_#000' }}>
                HOST_MODERATOR_ACTIVE
              </div>
            )}
            <div className="bg-primary border-[4px] border-secondary font-black uppercase tracking-widest px-4 py-2" style={{ boxShadow: '4px 4px_0px_0px_#000' }}>
              ROOM: {roomName}
            </div>
          </div>
        </div>

        <div
          ref={jitsiContainerRef}
          className="w-full bg-white border-[6px] border-secondary overflow-hidden"
          style={{ height: 'calc(100vh - 250px)', boxShadow: '16px 16px_0px_0px_#000' }}
        />

        <div className="mt-8 bg-black text-white p-4 font-mono text-[10px] uppercase tracking-[0.3em] text-center">
          SYNORA SECURE CHANNEL // ENCRYPTED_HANDSHAKE_V4 // NO_LOGGING_MODE
        </div>
      </div>

      {session && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => navigate('/sessions')}
          sessionId={session.id}
          partnerName={session.user1_name === user?.username ? session.user2_name : session.user1_name}
          onSuccess={() => {
            // We can optionally show a success toast here
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}
