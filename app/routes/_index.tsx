// じゃれ本ランダマイザー トップページ
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect, useMemo } from "react";
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

function extractAuthors(works: Work[]): string[] {
  const set = new Set<string>();
  works.forEach((w) =>
    w.author.split(/[、,]/).forEach((name) => set.add(name.trim()))
  );
  return Array.from(set).filter(Boolean);
}

export default function Index() {
  const { works } = useLoaderData<typeof loader>();
  const allAuthors = useMemo(() => extractAuthors(works), [works]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(allAuthors);
  const [current, setCurrent] = useState<Work | null>(() => getRandomWork(works, allAuthors));
  const [playing, setPlaying] = useState(true);

  function getRandomWork(works: Work[], filterAuthors: string[]) {
    const filtered = works.filter((w) => {
      // 作品の著者名を分割・トリムして配列化
      const authorNames = w.author.split(/[、,]/).map((n) => n.trim());
      // 選択著者と1つでも一致すればOK
      return authorNames.some((name) => filterAuthors.includes(name));
    });
    // 選択著者が0件ならnull返す
    if (filterAuthors.length === 0 || filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // currentが変わったら自動再生
  useEffect(() => {
    setPlaying(true);
  }, [current]);

  // フィルタが変わったら新しい作品を選ぶ
  useEffect(() => {
    const next = getRandomWork(works, selectedAuthors);
    if (next) setCurrent(next);
  }, [selectedAuthors]);

  function handleEnd() {
    const next = getRandomWork(works, selectedAuthors);
    if (next) setCurrent(next);
  }

  function handleSkip() {
    const next = getRandomWork(works, selectedAuthors);
    if (next) setCurrent(next);
  }

  function toggleAuthor(author: string) {
    setSelectedAuthors((prev) =>
      prev.includes(author)
        ? prev.filter((a) => a !== author)
        : [...prev, author]
    );
  }

  function selectAllAuthors() {
    setSelectedAuthors(allAuthors);
  }

  function clearAllAuthors() {
    setSelectedAuthors([]);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">じゃれ本ランダマイザー</h1>
      {/* 著者フィルタUI */}
      <div className="mb-4 w-full max-w-xl bg-white rounded shadow p-4">
        <div className="mb-2 font-semibold">著者フィルター</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {allAuthors.map((author) => (
            <button
              key={author}
              className={
                "px-3 py-1 rounded border font-bold transition " +
                (selectedAuthors.includes(author)
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-blue-100")
              }
              onClick={() => toggleAuthor(author)}
            >
              {author}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-gray-300 rounded text-sm"
            onClick={selectAllAuthors}
          >
            すべて選択
          </button>
          <button
            className="px-2 py-1 bg-gray-300 rounded text-sm"
            onClick={clearAllAuthors}
          >
            すべて解除
          </button>
        </div>
      </div>
      <div className="w-full max-w-xl flex flex-col items-center gap-4">
        {current ? (
          <>
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
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-lg text-gray-500">
            選択された著者の作品がありません
          </div>
        )}
      </div>
    </main>
  );
}
