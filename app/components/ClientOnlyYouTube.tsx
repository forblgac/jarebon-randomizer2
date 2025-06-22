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

  useEffect(() => {
    import("react-youtube").then((mod) => setYouTube(() => mod.default));
  }, []);

  if (!YouTube) return <div style={{ width: "100%", height: 300 }}>Loading...</div>;

  return (
    <YouTube
      videoId={videoId}
      opts={{
        width: "100%",
        playerVars: {
          autoplay: 1,
          start,
          end,
          controls: 1,
        },
      }}
      onReady={(e: any) => {
        playerRef.current = e.target;
        e.target.seekTo(start, true);
        if (playing) e.target.playVideo();
      }}
      onPlay={() => onPlayPause(true)}
      onPause={() => onPlayPause(false)}
      onEnd={onEnd}
      onStateChange={(e: any) => {
        if (e.data === 1 && playerRef.current) {
          playerRef.current.seekTo(start, true);
        }
        if (e.data === 0) {
          onEnd();
        }
      }}
    />
  );
}
