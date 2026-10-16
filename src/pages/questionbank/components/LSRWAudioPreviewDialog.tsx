import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Slider,
  Alert,
  Tooltip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import Replay5RoundedIcon from "@mui/icons-material/Replay5Rounded";
import Forward5RoundedIcon from "@mui/icons-material/Forward5Rounded";
import Button from "../../../components/common/Button";
import { resolveAudioUrl, formatAudioTime } from "../../../utils/audioUtils";

interface LSRWAudioPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fileName?: string;
  audioUrl?: string;
  autoPlay?: boolean;
}

const LSRWAudioPreviewDialog: React.FC<LSRWAudioPreviewDialogProps> = ({
  open,
  onClose,
  title,
  fileName,
  audioUrl,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolvedUrl = resolveAudioUrl(audioUrl);

  useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setErrorMessage(null);
      setIsBuffering(false);
      return;
    }

    if (!resolvedUrl) {
      setErrorMessage("No audio source URL available for this exercise.");
      return;
    }

    setErrorMessage(null);
    setIsBuffering(true);

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsBuffering(false);
      if (autoPlay) {
        audio.play().catch((err) => {
          console.warn("Autoplay blocked or failed:", err);
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      if (!duration && audio.duration) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    const handleError = (e: any) => {
      console.error("Audio preview element error:", e, audio.error);
      setIsBuffering(false);
      setIsPlaying(false);
      const code = audio.error?.code;
      if (code === 4) {
        setErrorMessage("Audio file could not be found or format is unsupported.");
      } else if (code === 2) {
        setErrorMessage("Network error while loading audio.");
      } else {
        setErrorMessage("Unable to play audio from backend server.");
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [open, resolvedUrl, autoPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      if (!resolvedUrl) {
        setErrorMessage("No audio URL found for this exercise.");
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      setErrorMessage(null);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio play error:", err);
          setIsPlaying(false);
          setErrorMessage("Failed to play audio. Check server connection or file format.");
        });
    }
  }, [isPlaying, resolvedUrl]);

  const handleSeek = (_: Event, value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = (val / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration || audio.duration || 0));
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const val = (Array.isArray(value) ? value[0] : value) / 100;
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume > 0 ? volume : 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 0,
          boxShadow: "0 24px 50px rgba(16, 24, 40, 0.22)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eaecf0",
          bgcolor: "#fcfcfd",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GraphicEqRoundedIcon sx={{ color: "#1570ef" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#101828", fontSize: "15px" }}>
            Audio Playback
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#667085" }}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, textAlign: "center" }}>
        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2, textAlign: "left", fontSize: "12px", borderRadius: "8px" }}>
            {errorMessage}
          </Alert>
        )}

        <Typography variant="body1" sx={{ fontWeight: 700, color: "#101828", mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: "#667085", display: "block", mb: 3 }}>
          {fileName || "audio_recording.mp3"}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2.5 }}>
          <Tooltip title="Rewind 5s">
            <IconButton
              onClick={() => handleSkip(-5)}
              disabled={!audioRef.current}
              size="small"
              sx={{ color: "#475467", "&:hover": { bgcolor: "#f2f4f7" } }}
            >
              <Replay5RoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          <Box
            onClick={togglePlay}
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: isPlaying ? "#1570ef" : "#eff8ff",
              border: isPlaying ? "3px solid #b2ddff" : "2px solid #b2ddff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isPlaying ? "0 4px 14px rgba(21, 112, 239, 0.35)" : "none",
              "&:hover": {
                transform: "scale(1.06)",
                bgcolor: isPlaying ? "#175cd3" : "#d1e9ff",
              },
            }}
          >
            {isPlaying ? (
              <PauseRoundedIcon sx={{ color: "#ffffff", fontSize: 32 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ color: "#1570ef", fontSize: 36, ml: 0.4 }} />
            )}
          </Box>

          <Tooltip title="Forward 5s">
            <IconButton
              onClick={() => handleSkip(5)}
              disabled={!audioRef.current}
              size="small"
              sx={{ color: "#475467", "&:hover": { bgcolor: "#f2f4f7" } }}
            >
              <Forward5RoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ px: 1, mb: 1.5 }}>
          <Slider
            size="small"
            value={progressPercent}
            onChange={handleSeek}
            disabled={!duration && !currentTime}
            sx={{
              color: "#1570ef",
              height: 4,
              "& .MuiSlider-thumb": {
                width: 12,
                height: 12,
                transition: "0.2s",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0 0 0 6px rgba(21, 112, 239, 0.16)",
                },
              },
              "& .MuiSlider-rail": {
                bgcolor: "#eaecf0",
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: -0.5 }}>
            <Typography variant="caption" sx={{ color: "#475467", fontWeight: 600, fontSize: 11.5 }}>
              {formatAudioTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#667085", fontSize: 11.5 }}>
              {isBuffering ? "Buffering..." : formatAudioTime(duration)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 1,
            px: 1,
            borderTop: "1px solid #f2f4f7",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "55%" }}>
            <IconButton size="small" onClick={toggleMute} sx={{ color: "#667085", p: 0.5 }}>
              {isMuted || volume === 0 ? (
                <VolumeOffRoundedIcon sx={{ fontSize: 18, color: "#d92d20" }} />
              ) : (
                <VolumeUpRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
            <Slider
              size="small"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              sx={{
                color: "#667085",
                height: 3,
                "& .MuiSlider-thumb": {
                  width: 10,
                  height: 10,
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.2,
              py: 0.3,
              borderRadius: "12px",
              bgcolor: isPlaying ? "#ecfdf3" : "#f2f4f7",
              color: isPlaying ? "#027a48" : "#475467",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isPlaying ? "#12b76a" : "#98a2b3",
              }}
            />
            {isPlaying ? "Playing" : "Ready"}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, justifyContent: "center" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            color: "#344054",
            borderColor: "#d0d5dd",
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LSRWAudioPreviewDialog;
