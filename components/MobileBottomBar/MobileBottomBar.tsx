"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import styles from "./MobileBottomBar.module.css";

interface MobileBottomBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  title: string;
}

export default function MobileBottomBar({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  title,
}: MobileBottomBarProps) {
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.mobileBottomBar}>
      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.mediaInfo}>
          <div className={styles.title}>{title}</div>
          <div className={styles.time}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={onSkipBack}
            aria-label="Skip back 10 seconds"
          >
            <SkipBack size={20} />
          </button>

          <button
            className={styles.playButton}
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            className={styles.controlButton}
            onClick={onSkipForward}
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
