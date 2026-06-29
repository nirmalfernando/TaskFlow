import { useState, useRef, useCallback } from 'react';

export type VoiceState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg;codecs=opus';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      setVoiceState('recording');
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access and try again.'
          : 'Could not start recording. Please check your microphone.';
      onError?.(msg);
      setVoiceState('error');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    recorder.onstop = () => {
      const mimeType = recorder.mimeType;
      const blob = new Blob(chunksRef.current, { type: mimeType });

      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      setVoiceState('processing');

      // Resolve the blob via the provided callback chain
      void (async () => {
        try {
          const { transcribeAudio } = await import('@/services/ai.service');
          const transcript = await transcribeAudio(blob, mimeType);
          onTranscript(transcript);
        } catch {
          onError?.('Transcription failed. Please try again or type your task.');
          setVoiceState('error');
          return;
        }
        setVoiceState('idle');
      })();
    };

    recorder.stop();
  }, [onTranscript, onError]);

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    chunksRef.current = [];
    setVoiceState('idle');
  }, []);

  return { voiceState, startRecording, stopRecording, cancel };
}
