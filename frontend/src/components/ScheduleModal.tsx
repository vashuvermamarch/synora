import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Timer } from 'lucide-react';
import api from '../api/client';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number | string;
  userName?: string;
  swapRequestId?: number | string;
  onSuccess?: () => void;
}

export default function ScheduleModal({ isOpen, onClose, userId, userName, swapRequestId, onSuccess }: ScheduleModalProps) {
  const [partnerId, setPartnerId] = useState(userId || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronize state when props change
  useEffect(() => {
    if (userId) setPartnerId(userId);
  }, [userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/sessions/create/', {
        user2: typeof partnerId === 'string' ? parseInt(partnerId) : partnerId,
        date,
        time,
        duration,
        swap_request_id: swapRequestId
      });
      alert('Session request sent!');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      alert('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm-overlay" onClick={onClose}>
      <style>{`
        .sm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .sm-container {
          background-color: #fff;
          border: 6px solid #000;
          width: 100%;
          max-width: 500px;
          box-shadow: 12px 12px 0px #000;
          position: relative;
          display: flex;
          flex-direction: column;
          animation: modalPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes modalPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .sm-header {
          background-color: #FFD100;
          border-bottom: 6px solid #000;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sm-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 2rem;
          letter-spacing: -0.02em;
          color: #000;
          margin: 0;
          text-transform: uppercase;
        }

        .sm-close-btn {
          background-color: #000;
          color: #fff;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .sm-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .sm-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .sm-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          color: #000;
        }

        .sm-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sm-input-icon {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: #000;
        }

        .sm-input {
          width: 100%;
          border: 4px solid #000;
          padding: 0.75rem 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 0.85rem;
          outline: none;
          background-color: #fff;
          appearance: none;
        }
        .sm-input:focus { background-color: #F3F4F6; }

        /* Hide default browser icons for date and time */
        input::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
        input::-webkit-inner-spin-button,
        input::-webkit-clear-button {
          display: none;
          -webkit-appearance: none;
        }
        
        .sm-textarea {
          width: 100%;
          border: 4px solid #000;
          padding: 1rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          min-height: 120px;
          resize: none;
          outline: none;
        }

        .sm-footer-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .sm-btn {
          border: 6px solid #000;
          padding: 1.25rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 1.25rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.1s;
          text-align: center;
        }
        .sm-btn:active { transform: translate(4px, 4px); box-shadow: none; }

        .sm-btn-confirm {
          background-color: #FFD100;
          box-shadow: 6px 6px 0px #000;
        }
        .sm-btn-confirm:hover { background-color: #000; color: #fff; }

        .sm-btn-cancel {
          background-color: #fff;
          box-shadow: 6px 6px 0px #000;
        }
        .sm-btn-cancel:hover { background-color: #E5E7EB; }

        .sm-status-bar {
          background-color: #000;
          color: #fff;
          padding: 0.6rem;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="sm-container" onClick={e => e.stopPropagation()}>
        <div className="sm-header">
          <h2 className="sm-title">SCHEDULE_SESSION</h2>
          <button className="sm-close-btn" onClick={onClose}>
            <X size={20} strokeWidth={4} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sm-body">
          {!userId && (
            <div>
              <label className="sm-label">PARTNER_USER_ID</label>
              <input 
                type="number" 
                className="sm-input" 
                value={partnerId} 
                onChange={e => setPartnerId(e.target.value)} 
                required 
                placeholder="E.G. 42"
              />
            </div>
          )}

          <div className="sm-input-row">
            <div>
              <label className="sm-label">SELECT_DATE</label>
              <div className="sm-input-wrapper">
                <input 
                  type="date" 
                  className="sm-input" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                />
                <Calendar size={18} className="sm-input-icon" />
              </div>
            </div>
            <div>
              <label className="sm-label">START_TIME</label>
              <div className="sm-input-wrapper">
                <input 
                  type="time" 
                  className="sm-input" 
                  value={time} 
                  onChange={e => setTime(e.target.value)} 
                  required 
                />
                <Clock size={18} className="sm-input-icon" />
              </div>
            </div>
          </div>

          <div>
            <label className="sm-label">SESSION_DURATION</label>
            <div className="sm-input-wrapper">
              <select 
                className="sm-input appearance-none" 
                value={duration} 
                onChange={e => setDuration(parseInt(e.target.value))}
              >
                <option value={30}>30 MINUTES</option>
                <option value={60}>60 MINUTES</option>
                <option value={90}>90 MINUTES</option>
                <option value={120}>120 MINUTES</option>
              </select>
              <Timer size={18} className="sm-input-icon" />
            </div>
          </div>

          <div>
            <label className="sm-label">SESSION_DETAILS_&_GOALS</label>
            <textarea 
              className="sm-textarea" 
              placeholder="What are we working on today? List your core objectives..."
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </div>

          <div className="sm-footer-btns">
            <button type="submit" className="sm-btn sm-btn-confirm" disabled={loading}>
              {loading ? 'SYNCING...' : 'CONFIRM_SESSION'}
            </button>
            <button type="button" className="sm-btn sm-btn-cancel" onClick={onClose}>
              CANCEL
            </button>
          </div>
        </form>

        <div className="sm-status-bar">
          SECURE_SYNC_V2.4 // SKILLSWAP_ENCRYPTED_LINK
        </div>
      </div>
    </div>
  );
}
