import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

let cameraQueue = Promise.resolve();

const runExclusive = (fn) => {
  const next = cameraQueue.then(fn, fn);
  cameraQueue = next.catch(() => {});
  return next;
};

const errorText = (err) => {
  if (!err) return 'Could not open camera';
  if (typeof err === 'string') return err;
  return err.message || String(err);
};

const waitFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

const stopInstance = async (instance) => {
  if (!instance) return;
  try {
    if (instance.isScanning) await instance.stop();
  } catch {
    /* already stopped */
  }
  try {
    await instance.clear();
  } catch {
    /* ignore */
  }
};

const QrCapture = ({ onDecode, paused = false }) => {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, '') || 'x';
  const regionId = `qr-capture-${reactId}`;
  const fileRegionId = `qr-file-${reactId}`;
  const onDecodeRef = useRef(onDecode);
  const fileInputRef = useRef(null);
  const cameraHostRef = useRef(null);
  const fileHostRef = useRef(null);
  const [camError, setCamError] = useState('');
  const [fileBusy, setFileBusy] = useState(false);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    if (paused) return undefined;

    let cancelled = false;
    let scanner = null;
    let fired = false;

    const stopScanner = () =>
      runExclusive(async () => {
        const current = scanner;
        scanner = null;
        await stopInstance(current);
      });

    const startScanner = () =>
      runExclusive(async () => {
        if (cancelled || document.hidden || scanner) return;
        await waitFrame();
        if (cancelled || document.hidden) return;
        const node = cameraHostRef.current || document.getElementById(regionId);
        if (!node) return;

        let instance;
        try {
          instance = new Html5Qrcode(regionId, { verbose: false });
        } catch (err) {
          throw new Error(errorText(err));
        }
        scanner = instance;

        const config = { fps: 8 };
        const onSuccess = (decodedText) => {
          if (cancelled || fired) return;
          fired = true;
          onDecodeRef.current?.(decodedText);
        };

        try {
          try {
            await instance.start({ facingMode: 'environment' }, config, onSuccess, () => {});
          } catch {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras.length) throw new Error('No camera found');
            if (cancelled) return;
            await instance.start(cameras[0].id, config, onSuccess, () => {});
          }
          if (cancelled) {
            await stopInstance(instance);
            if (scanner === instance) scanner = null;
          }
        } catch (err) {
          if (scanner === instance) scanner = null;
          await stopInstance(instance);
          throw new Error(errorText(err));
        }
      });

    const onVisibility = () => {
      if (document.hidden) {
        stopScanner();
        return;
      }
      if (cancelled || paused) return;
      fired = false;
      startScanner().catch((err) => {
        if (!cancelled) setCamError(errorText(err));
      });
    };

    setCamError('');
    startScanner().catch((err) => {
      if (!cancelled) setCamError(errorText(err));
    });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      stopScanner();
    };
  }, [paused, regionId]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || paused) return;
    setCamError('');
    setFileBusy(true);
    let reader = null;
    try {
      const node = fileHostRef.current || document.getElementById(fileRegionId);
      if (!node) throw new Error('File scanner is not ready');
      reader = new Html5Qrcode(fileRegionId, { verbose: false });
      const decodedText = await reader.scanFile(file, false);
      if (decodedText) onDecodeRef.current?.(decodedText);
    } catch (err) {
      setCamError(
        errorText(err).includes('No MultiFormat') || errorText(err).includes('QR')
          ? 'Could not read a QR code from that image. Try a clearer photo.'
          : 'Could not read a QR code from that image. Try a clearer photo.'
      );
    } finally {
      await stopInstance(reader);
      setFileBusy(false);
    }
  };

  return (
    <div className="qr-capture-wrap">
      {camError && <div className="alert alert-error">{camError}</div>}
      <div ref={cameraHostRef} id={regionId} className="qr-capture" />
      <div ref={fileHostRef} id={fileRegionId} className="qr-file-reader" aria-hidden="true" />
      <p className="muted" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
        Point the camera at the visitor’s phone QR or physical pass.
      </p>
      <div className="qr-file-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="qr-file-input"
          onChange={handleFile}
          disabled={paused || fileBusy}
        />
        <button
          type="button"
          className="btn btn-ghost"
          disabled={paused || fileBusy}
          onClick={() => fileInputRef.current?.click()}
        >
          {fileBusy ? 'Reading image…' : 'Choose QR from files'}
        </button>
      </div>
    </div>
  );
};

export default QrCapture;
