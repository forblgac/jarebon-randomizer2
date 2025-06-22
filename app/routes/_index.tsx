// じゃれ本ランダマイザー トップページ
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import ClientOnlyYouTube from "../components/ClientOnlyYouTube";

type Work = {
  id: number;
  videoId: string;
  videoTitle: string;
  workTitle: string;
  author: string;
  startTime: number;
  endTime: number;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { promises: fs } = await import("fs");
  const { join } = await import("path");
  const filePath = join(process.cwd(), "public", "works.json");
  const file = await fs.readFile(filePath, "utf-8");
  const works: Work[] = JSON.parse(file);
  return json({ works });
};

export default function Index() {
  const { works } = useLoaderData<typeof loader>();
  const [current, setCurrent] = useState<Work>(() => getRandomWork(works));
  const [playing, setPlaying] = useState(true);

  function getRandomWork(works: Work[]) {
    return works[Math.floor(Math.random() * works.length)];
  }

  // currentが変わったら自動再生
  useEffect(() => {
    setPlaying(true);
  }, [current]);

  function handleEnd() {
    setCurrent(getRandomWork(works));
  }

  function handleSkip() {
    setCurrent(getRandomWork(works));
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">じゃれ本ランダマイザー</h1>
      <div className="w-full max-w-xl flex flex-col items-center gap-4">
        <ClientOnlyYouTube
          videoId={current.videoId}
          start={current.startTime}
          end={current.endTime}
          playing={playing}
          onEnd={handleEnd}
          onPlayPause={setPlaying}
        />
        <div className="mt-4 p-4 bg-white rounded shadow w-full">
          <div className="mb-2">
            <span className="font-semibold">元動画：</span>
            <a
              href={`https://www.youtube.com/watch?v=${current.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {current.videoTitle}
            </a>
          </div>
          <div className="mb-2">
            <span className="font-semibold">作品タイトル：</span>
            {current.workTitle}
          </div>
          <div className="mb-2">
            <span className="font-semibold">作者：</span>
            {current.author
              .split(/[、,]/)
              .map((name, i) => (
                <span
                  key={i}
                  className="inline-block bg-gray-200 text-gray-800 rounded px-2 py-0.5 mr-1 text-sm"
                >
                  {name.trim()}
                </span>
              ))}
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSkip}
          >
            次の作品へ
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "一時停止" : "再生"}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => {
              // ミュート解除
              const iframe = document.querySelector("iframe");
              if (iframe && iframe.contentWindow) {
                // YouTube IFrame API経由でアンミュート
                // ただしreact-youtubeのplayerRefがないので、ユーザーに一度再生/一時停止を促す
                iframe.focus();
              }
              // ユーザー操作で再生ボタンを押すとアンミュートされる
              alert("動画プレイヤーの再生ボタンを押すと音声が有効になります。");
            }}
          >
            ミュート解除方法
          </button>
        </div>
      </div>
    </main>
  );
}
