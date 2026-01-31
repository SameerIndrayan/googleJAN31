"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";

interface OverlayText {
  timestamp: number; // in seconds
  phase: "pre-snap" | "mid-play" | "post-play";
  text: string;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [currentOverlay, setCurrentOverlay] = useState<OverlayText | null>(null);
  const [overlayData, setOverlayData] = useState<OverlayText[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      
      // Find the current overlay based on timestamp
      const activeOverlay = overlayData
        .filter(overlay => overlay.timestamp <= video.currentTime)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      // Show overlay if we're within 3 seconds of its timestamp
      if (activeOverlay && video.currentTime - activeOverlay.timestamp < 3) {
        setCurrentOverlay(activeOverlay);
      } else {
        setCurrentOverlay(null);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [overlayData]);

  const analyzeVideo = async () => {
    const video = videoRef.current;
    if (!video) {
      setAnalysisError("Video element not found");
      return;
    }

    // Get duration from video element if state hasn't updated yet
    const videoDuration = video.duration || duration;
    if (!videoDuration || isNaN(videoDuration)) {
      setAnalysisError("Please wait for video to load completely");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      // Fetch the video file
      const response = await fetch("/football-clip.mp4");
      if (!response.ok) {
        throw new Error(`Video file not found. Make sure football-clip.mp4 is in the public folder. (Status: ${response.status})`);
      }
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Video file is empty");
      }
      const file = new File([blob], "football-clip.mp4", { type: "video/mp4" });

      // Send to API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("duration", videoDuration.toString());

      const apiResponse = await fetch("/api/analyze-video", {
        method: "POST",
        body: formData,
      });

      const data = await apiResponse.json();

      if (data.success && data.overlays) {
        setOverlayData(data.overlays);
        setAnalysisError("");
      } else {
        setAnalysisError(data.error || "Failed to generate overlays");
      }
    } catch (error: any) {
      setAnalysisError(error.message || "Failed to analyze video");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "pre-snap":
        return "bg-blue-600";
      case "mid-play":
        return "bg-yellow-600";
      case "post-play":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Football Play Understanding Overlay
          </h1>
              <p className="text-gray-400">
                Accessible play-by-play explanations for beginners and deaf viewers
              </p>
            </div>
            <button
              onClick={analyzeVideo}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Overlays
                </>
              )}
            </button>
          </div>
          {analysisError && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {analysisError}
            </div>
          )}
          {overlayData.length === 0 && !isAnalyzing && (
            <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-200 text-sm">
              {duration > 0 ? (
                <>Video loaded ({formatTime(duration)}). Click "Generate Overlays" to analyze your video and create synchronized text overlays automatically.</>
              ) : (
                <>Waiting for video to load... Make sure football-clip.mp4 is in the public folder.</>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Video Player - Left Side */}
          <div className="md:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-auto"
                src="/football-clip.mp4"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>

              {/* Overlay Text */}
              {overlayVisible && currentOverlay && (
                <div className="absolute bottom-20 left-0 right-0 px-4">
                  <div
                    className={`${getPhaseColor(
                      currentOverlay.phase
                    )} text-white px-6 py-4 rounded-lg shadow-2xl max-w-2xl mx-auto`}
                  >
                    <div className="text-sm font-semibold mb-1 uppercase tracking-wide opacity-90">
                      {currentOverlay.phase.replace("-", " ")}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold leading-tight">
                      {currentOverlay.text}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Controls */}
              <div className="bg-gray-800 p-4">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={togglePlay}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Play
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setOverlayVisible(!overlayVisible)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                  >
                    {overlayVisible ? (
                      <>
                        <EyeOff className="w-5 h-5" />
                        Hide Overlay
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        Show Overlay
                      </>
                    )}
                  </button>

                  <div className="ml-auto text-sm text-gray-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Timeline with Markers */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    style={{
                      background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                        (currentTime / duration) * 100
                      }%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`,
                    }}
                  />
                  {/* Timeline Markers */}
                  <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
                    {overlayData.map((overlay, index) => (
                      <div
                        key={index}
                        className="absolute w-1 h-2 bg-white opacity-60"
                        style={{
                          left: `${(overlay.timestamp / duration) * 100}%`,
                        }}
                        title={`${overlay.phase}: ${overlay.text}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Overlay Panel - Right Side */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 h-full">
              <h2 className="text-xl font-bold mb-4">Play Breakdown</h2>
              
              <div className="space-y-4">
                {/* Pre-Snap */}
                <div>
                  <div className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">
                    Pre-Snap
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    {overlayData
                      .filter((o) => o.phase === "pre-snap")
                      .map((overlay, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded ${
                            currentOverlay?.timestamp === overlay.timestamp
                              ? "bg-blue-600/30 border border-blue-500"
                              : "bg-gray-700/50"
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {formatTime(overlay.timestamp)}
                          </div>
                          <div>{overlay.text}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Mid-Play */}
                <div>
                  <div className="text-sm font-semibold text-yellow-400 mb-2 uppercase tracking-wide">
                    Mid-Play
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    {overlayData
                      .filter((o) => o.phase === "mid-play")
                      .map((overlay, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded ${
                            currentOverlay?.timestamp === overlay.timestamp
                              ? "bg-yellow-600/30 border border-yellow-500"
                              : "bg-gray-700/50"
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {formatTime(overlay.timestamp)}
                          </div>
                          <div>{overlay.text}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Post-Play */}
                <div>
                  <div className="text-sm font-semibold text-green-400 mb-2 uppercase tracking-wide">
                    Post-Play
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    {overlayData
                      .filter((o) => o.phase === "post-play")
                      .map((overlay, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded ${
                            currentOverlay?.timestamp === overlay.timestamp
                              ? "bg-green-600/30 border border-green-500"
                              : "bg-gray-700/50"
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {formatTime(overlay.timestamp)}
                          </div>
                          <div>{overlay.text}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
