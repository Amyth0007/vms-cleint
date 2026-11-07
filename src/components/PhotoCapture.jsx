import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { captureFromVideo, compressImageFile } from '../utils/photo';
import VisitorAvatar from './VisitorAvatar';

const stopStream = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

const PhotoCapture = ({
  value,
  onChange,
  name = 'Visitor',
  compact = false,
  allowSkip = true,
}) => {
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [skipped, setSkipped] = useState(false);

  const closeCamera = () => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
  };

  useEffect(() => () => closeCamera(), []);

  useEffect(() => {
    if (!live || !videoRef.current || !streamRef.current) return undefined;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    return undefined;
  }, [live]);

  const uploadBlob = async (blob) => {
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('photo', blob, 'visitor.jpg');
      const res = await api.post('/uploads/photo', form);
      if (!res.data.success) throw new Error(res.data.message || 'Upload failed');
      onChange?.(res.data.data.url);
      setSkipped(false);
      closeCamera();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save photo');
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    setError('');
    setSkipped(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission was blocked. You can still upload a photo.'
          : 'Could not open the camera. You can still upload a photo.'
      );
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    try {
      const blob = await captureFromVideo(videoRef.current);
      await uploadBlob(blob);
    } catch (err) {
      setError(err.message || 'Could not capture photo');
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setSkipped(false);
    try {
      const blob = await compressImageFile(file);
      await uploadBlob(blob);
    } catch (err) {
      setError(err.message || 'Could not read that image');
    }
  };

  if (skipped && !value) {
    return (
      <div className="photo-capture photo-capture-skipped">
        <p className="muted">Photo skipped — QR still works at the gate.</p>
        <button type="button" className="btn-link" onClick={() => setSkipped(false)}>
          Add a photo
        </button>
      </div>
    );
  }

  return (
    <div className={`photo-capture ${compact ? 'photo-capture-compact' : ''}`}>
      <div className="photo-capture-head">
        <label className="form-label" style={{ marginBottom: 0 }}>
          Photo <span className="optional-tag">optional</span>
        </label>
        <p className="muted">Capture a face photo, or skip and use QR only.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {live ? (
        <div className="photo-stage">
          <video ref={videoRef} playsInline muted autoPlay className="photo-video" />
          <div className="photo-actions">
            <button type="button" className="btn" onClick={handleCapture} disabled={busy}>
              {busy ? 'Saving…' : 'Capture'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={closeCamera} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="photo-preview-row">
          <VisitorAvatar src={value} name={name} size={compact ? 72 : 96} />
          <div className="photo-actions">
            <button type="button" className="btn" onClick={startCamera} disabled={busy}>
              {value ? 'Retake photo' : 'Open camera'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? 'Uploading…' : 'Upload photo'}
            </button>
            {allowSkip && !value && (
              <button type="button" className="btn-link" onClick={() => setSkipped(true)} disabled={busy}>
                Skip for now
              </button>
            )}
            {value && (
              <button type="button" className="btn-link" onClick={() => onChange?.('')} disabled={busy}>
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="qr-file-input"
        onChange={handleFile}
      />
    </div>
  );
};

export default PhotoCapture;
