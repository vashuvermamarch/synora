import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UploadCloud, Bookmark, X } from 'lucide-react';
import api from '../api/client';

export default function CreateResource() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const fullLink = link.trim() ? (link.toLowerCase().startsWith('http') ? link : `https://${link}`) : '';
      await api.post('/resources/create/', { title, description, link: fullLink, tags: tags.join(', ') });
      navigate('/resources');
    } catch (err) {
      console.error(err);
      alert('Failed to create resource. Please ensure all fields are valid.');
    }
    finally { setLoading(false); }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = currentTag.trim().toUpperCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewImage(url);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <>
      <style>{`
        .cr-page {
          min-height: 100vh;
          background-color: #f9f9f9;
          background-image: radial-gradient(circle, #000 1.5px, transparent 1.5px);
          background-size: 40px 40px;
          padding: 80px 40px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .cr-container {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
        }

        @media (min-width: 1024px) {
          .cr-container {
            grid-template-columns: 1fr 400px;
          }
        }

        /* Typography */
        .cr-heading {
          font-size: 5rem;
          font-weight: 900;
          line-height: 0.9;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: -2px;
          color: #000;
        }

        @media (min-width: 768px) {
          .cr-heading { font-size: 6rem; }
        }

        .cr-subheading-block {
          background-color: #000;
          color: #fff;
          font-family: monospace;
          padding: 8px 16px;
          display: inline-block;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 1rem;
          margin-bottom: 40px;
        }

        /* Form Container */
        .cr-form-box {
          background-color: #fff;
          border: 6px solid #000;
          box-shadow: 16px 16px 0px 0px #000;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        @media (min-width: 768px) {
          .cr-form-box { padding: 60px; }
        }

        .cr-alert {
          background-color: #E5E7EB;
          border: 4px solid #000;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cr-alert-text {
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }

        /* Form Fields */
        .cr-label {
          display: block;
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.85rem;
          margin-bottom: 10px;
          color: #000;
        }

        .cr-input {
          width: 100%;
          background-color: #fff;
          border: 4px solid #000;
          padding: 16px;
          font-weight: 900;
          font-size: 1.1rem;
          text-transform: uppercase;
          outline: none;
          color: #000;
          transition: background-color 0.2s;
        }
        .cr-input::placeholder { color: #A0A0A0; font-weight: bold; }
        .cr-input:focus { background-color: #E5E7EB; }

        .cr-textarea {
          min-height: 160px;
          resize: vertical;
          font-weight: 600;
        }

        /* Upload Box */
        .cr-upload-box {
          width: 100%;
          border: 4px dashed #000;
          background-color: #fff;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .cr-upload-box:hover { background-color: #E5E7EB; }
        .cr-upload-text {
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.85rem;
        }

        /* URL Field */
        .cr-url-group {
          display: flex;
          border: 4px solid #000;
          background-color: #fff;
        }
        .cr-url-group:focus-within { background-color: #E5E7EB; }
        .cr-url-prefix {
          background-color: #000;
          color: #fff;
          font-weight: 900;
          text-transform: uppercase;
          padding: 16px 24px;
          border-right: 4px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .cr-url-input {
          flex: 1;
          background-color: transparent;
          border: none;
          padding: 16px;
          font-weight: 900;
          font-size: 1.1rem;
          text-transform: uppercase;
          outline: none;
        }

        /* Tags */
        .cr-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }
        .cr-tag {
          background-color: #FACC15; /* primary yellow */
          border: 3px solid #000;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 8px 16px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cr-tag-remove {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cr-tag-remove:hover { color: #fff; }

        /* Buttons */
        .cr-footer {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 20px;
        }
        @media (min-width: 768px) {
          .cr-footer { flex-direction: row; }
        }
        
        .cr-btn {
          border: 6px solid #000;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 20px;
          font-size: 1.25rem;
          box-shadow: 8px 8px 0px 0px #000;
          transition: all 0.2s;
          cursor: pointer;
          text-align: center;
        }
        .cr-btn:active {
          transform: translate(4px, 4px);
          box-shadow: 4px 4px 0px 0px #000;
        }
        .cr-btn-primary { background-color: #FACC15; color: #000; flex: 2; }
        .cr-btn-primary:hover { background-color: #000; color: #fff; }
        .cr-btn-secondary { background-color: #fff; color: #000; flex: 1; }
        .cr-btn-secondary:hover { background-color: #E5E7EB; }

        /* LIVE PREVIEW SECTION */
        .cr-preview-pane {
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: sticky;
          top: 40px;
          align-self: flex-start;
        }
        .cr-preview-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cr-preview-line { flex: 1; border-top: 4px solid #000; }
        .cr-preview-title {
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          font-size: 1.5rem;
          letter-spacing: 2px;
        }

        /* Preview Card */
        .cr-card {
          background-color: #fff;
          border: 6px solid #000;
          box-shadow: 12px 12px 0px 0px #000;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .cr-card-image-box {
          height: 250px;
          border-bottom: 6px solid #000;
          position: relative;
          background-color: #1A1A1A;
          background-image: radial-gradient(circle, #333 2px, transparent 2px);
          background-size: 16px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .cr-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cr-card-placeholder {
          color: #fff;
          font-weight: 900;
          opacity: 0.2;
          font-size: 4rem;
        }
        .cr-card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background-color: #000;
          color: #fff;
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: 2px solid #000;
          padding: 6px 12px;
          font-size: 0.65rem;
        }
        
        .cr-card-content {
          padding: 32px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .cr-card-title {
          font-weight: 900;
          text-transform: uppercase;
          font-size: 1.8rem;
          line-height: 1.1;
          margin-bottom: 24px;
          word-break: break-word;
          letter-spacing: -1px;
        }
        .cr-card-desc-box {
          border-left: 6px solid #FACC15;
          padding-left: 16px;
          margin-bottom: 24px;
        }
        .cr-card-desc {
          font-weight: 500;
          font-size: 1.1rem;
          line-height: 1.6;
          opacity: 0.9;
        }
        
        .cr-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: auto;
        }
        .cr-card-tag {
          background-color: #fff;
          border: 2px solid #000;
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 6px 10px;
          font-size: 0.65rem;
        }

        .cr-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 6px solid #000;
          padding: 24px 32px;
        }
        .cr-footer-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cr-author-box {
          width: 24px;
          height: 24px;
          background-color: #FACC15;
          border: 2px solid #000;
        }
        .cr-author-text {
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 2px;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }

        /* Editor Tip */
        .cr-tip {
          background-color: #000;
          border: 6px solid #000;
          padding: 32px;
          color: #fff;
        }
        .cr-tip-title {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 1.25rem;
          margin-bottom: 16px;
        }
        .cr-tip-text {
          font-weight: 500;
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.6;
          opacity: 0.9;
        }
      `}</style>

      <div className="cr-page">
        <div className="cr-container">

          {/* LEFT PANE: FORM */}
          <div>
            <div className="cr-header">
              <h1 className="cr-heading">SHARE A<br />RESOURCE</h1>
              <div className="cr-subheading-block">
                PROPAGATE KNOWLEDGE TO THE COLLECTIVE.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="cr-form-box">

              <div className="cr-alert">
                <ShieldCheck size={28} strokeWidth={3} />
                <span className="cr-alert-text">ONLY VERIFIED USERS CAN PUBLISH RESOURCES TO THE PUBLIC DIRECTORY.</span>
              </div>

              <div>
                <label className="cr-label">RESOURCE TITLE</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="cr-input"
                  placeholder="E.G. NEUTRAL DENSITY PHOTOGRAPHY GUIDE"
                  required
                />
              </div>

              <div>
                <label className="cr-label">DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="cr-input cr-textarea"
                  placeholder="WHAT IS THIS RESOURCE? HOW DOES IT HELP?"
                  required
                />
              </div>

              <div>
                <label className="cr-label">COVER IMAGE</label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <div className="cr-upload-box" onClick={triggerFileInput}>
                  <UploadCloud size={48} strokeWidth={2} />
                  <span className="cr-upload-text">DROP IMAGE OR CLICK TO BROWSE</span>
                </div>
              </div>

              <div>
                <label className="cr-label">RESOURCE URL</label>
                <div className="cr-url-group">
                  <div className="cr-url-prefix">HTTPS://</div>
                  <input
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    className="cr-url-input"
                    placeholder="WWW.SKILLSWAP.CC/ASSET-ID"
                  />
                </div>
              </div>

              <div>
                <label className="cr-label">RELATED SKILLS</label>
                {tags.length > 0 && (
                  <div className="cr-tag-list">
                    {tags.map(t => (
                      <span key={t} className="cr-tag">
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="cr-tag-remove">
                          <X size={14} strokeWidth={4} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={currentTag}
                  onChange={e => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="cr-input"
                  placeholder="TYPE SKILL AND PRESS ENTER"
                />
              </div>

              <div className="cr-footer">
                <button type="submit" disabled={loading} className="cr-btn cr-btn-primary">
                  {loading ? 'PUBLISHING...' : 'PUBLISH RESOURCE'}
                </button>
                <button type="button" onClick={() => navigate('/resources')} className="cr-btn cr-btn-secondary">
                  SAVE DRAFT
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT PANE: LIVE PREVIEW */}
          <div className="cr-preview-pane">

            <div className="cr-preview-header">
              <div className="cr-preview-line"></div>
              <h2 className="cr-preview-title">LIVE PREVIEW</h2>
              <div className="cr-preview-line"></div>
            </div>

            <div className="cr-card">

              <div className="cr-card-image-box">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="cr-card-image" />
                ) : (
                  <span className="cr-card-placeholder">DATA</span>
                )}
                <div className="cr-card-badge">NEW ASSET</div>
              </div>

              <div className="cr-card-content">
                <h3 className="cr-card-title">
                  {title || 'NEO-BRUTALIST LAYOUT SECRETS'}
                </h3>

                <div className="cr-card-desc-box">
                  <p className="cr-card-desc">
                    {description || 'A comprehensive guide on mastering the digital print aesthetic through CSS Grid and aggressive typography hierarchy.'}
                  </p>
                </div>

                <div className="cr-card-tags">
                  {(tags.length > 0 || currentTag.trim()) ? (
                    <>
                      {tags.map(t => (
                        <span key={t} className="cr-card-tag">{t}</span>
                      ))}
                      {currentTag.trim() && (
                        <span className="cr-card-tag" style={{ borderStyle: 'dashed', opacity: 0.6 }}>
                          {currentTag.trim().toUpperCase()}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="cr-card-tag">UI DESIGN</span>
                      <span className="cr-card-tag">VISUAL HIERARCHY</span>
                    </>
                  )}
                </div>

                {link && (
                  <div style={{ marginTop: '24px', backgroundColor: '#FACC15', border: '4px solid #000', padding: '12px', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    🔗 {link}
                  </div>
                )}
              </div>

              <div className="cr-card-footer">
                <div className="cr-footer-author">
                  <div className="cr-author-box"></div>
                  <span className="cr-author-text">ANON DESIGNER</span>
                </div>
                <Bookmark size={20} strokeWidth={3} />
              </div>

            </div>

            <div className="cr-tip">
              <h4 className="cr-tip-title">EDITOR'S TIP</h4>
              <p className="cr-tip-text">
                "High contrast and thick borders create authority. Use yellow only for the path you want users to travel."
              </p>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
