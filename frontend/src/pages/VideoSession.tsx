import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function VideoSession() {
  const { roomName } = useParams();
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/sessions" className="btn btn-outlined py-1 px-3 text-sm"><ArrowLeft size={14}/> BACK</Link>
        <h1 className="text-2xl font-bold">VIDEO SESSION</h1>
        <span className="badge badge-primary">{roomName}</span>
      </div>
      <div className="card p-0 overflow-hidden" style={{height:'calc(100vh - 10rem)'}}>
        <iframe src={jitsiUrl} className="w-full h-full border-0" allow="camera;microphone;fullscreen;display-capture" title="Jitsi Video Session"/>
      </div>
    </div>
  );
}
