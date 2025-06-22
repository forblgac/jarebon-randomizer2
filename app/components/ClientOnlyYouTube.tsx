// クライアントのみでYouTubeを描画するコンポーネント
import { useEffect, useRef, useState } from "react";

type Props = {
  videoId: string;
  start: number;
  end: number;
  playing: boolean;
  onEnd: () => void;
  onPlayPause: (playing: boolean) => void;
};

export default function ClientOnlyYouTube({
  videoId,
  start,
  end,
  playing,
  onEnd,
  onPlayPause,
}: Props) {
  const [YouTube, setYouTube] = useState<any>(null);
  const playerRef = useRef<any>(null);
  const [firstPlay, setFirstPlay] = useState(true);

  useEffect(() => {
    import("react-youtube").then((mod) => setYouTube(() => mod.default));
  }, []);

  // current（videoId, start, end）が変わった時だけplayerを制御
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(start, true);
      if (playing) {
        playerRef.current.playVideo();
        // 2回目以降はアンミュート
        if (!firstPlay) {
          playerRef.current.unMute();
        }
      } else {
        playerRef.current.pauseVideo();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, start, end]);

  // playingが変わった時だけ再生/一時停止
  useEffect(() => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.playVideo();
        if (!firstPlay) {
          playerRef.current.unMute();
        }
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [playing, firstPlay]);

  if (!YouTube) return <div style={{ width: "100%", height: 360 }}>Loading...</div>;

  return (
    <div className="w-full" style={{ maxWidth: 640 }}>
      <YouTube
        videoId={videoId}
        opts={{
          width: "100%",
          height: "360",
          playerVars: {
            autoplay: 1,
            mute: firstPlay ? 1 : 0,
            start,
            end,
            controls: 1,
            rel: 0,
            modestbranding: 1,
          },
        }}
        onReady={(e: any) => {
          playerRef.current = e.target;
          e.target.seekTo(start, true);
          if (playing) e.target.playVideo();
          if (!firstPlay) {
            e.target.unMute();
          }
        }}
        onPlay={() => {
          onPlayPause(true);
          if (firstPlay) setFirstPlay(false);
        }}
        onPause={() => onPlayPause(false)}
        onEnd={onEnd}
        onStateChange={() => {}}
      />
    </div>
  );
}
