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
      const authorNames = w.author.split(/[、,]/).map((n) => n.trim());
      return authorNames.some((name) => filterAuthors.includes(name));
    });
    if (filterAuthors.length === 0 || filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  useEffect(() => {
    setPlaying(true);
  }, [current]);

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
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 font-sans">
      <div className="w-full max-w-2xl px-2 py-8 flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-700 drop-shadow mb-2 tracking-tight">
          じゃれ本ランダマイザー
        </h1>
        {/* 著者フィルタUI */}
        <section className="bg-white/80 rounded-2xl shadow-lg p-4 mb-2">
          <div className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7V7a4 4 0 00-8 0v2m12 4v1a4 4 0 01-3 3.87M5 13v1a4 4 0 003 3.87" /></svg>
            著者フィルター
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2">
            {allAuthors.map((author) => (
              <button
                key={author}
                className={
                  "whitespace-nowrap px-4 py-1.5 rounded-full border font-bold transition-all duration-150 shadow-sm " +
                  (selectedAuthors.includes(author)
                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-600 scale-105 ring-2 ring-indigo-200"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100 hover:scale-105")
                }
                onClick={() => toggleAuthor(author)}
              >
                {author}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-200 transition"
              onClick={selectAllAuthors}
            >
              すべて選択
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-300 transition"
              onClick={clearAllAuthors}
            >
              すべて解除
            </button>
          </div>
        </section>
        <section className="flex flex-col items-center gap-6">
          <div className="w-full flex justify-center">
            <div className="bg-white/90 rounded-2xl shadow-2xl p-4 w-full max-w-xl flex flex-col items-center">
              {current ? (
                <>
                  <div className="w-full flex justify-center mb-4">
                    <ClientOnlyYouTube
                      videoId={current.videoId}
                      start={current.startTime}
                      end={current.endTime}
                      playing={playing}
                      onEnd={handleEnd}
                      onPlayPause={setPlaying}
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <div>
                      <span className="font-semibold text-gray-700">元動画：</span>
                      <a
                        href={`https://www.youtube.com/watch?v=${current.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline hover:text-indigo-800 font-medium"
                      >
                        {current.videoTitle}
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">作品タイトル：</span>
                      <span className="ml-1 text-lg font-bold text-indigo-700">{current.workTitle}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">作者：</span>
                      {current.author
                        .split(/[、,]/)
                        .map((name, i) => (
                          <span
                            key={i}
                            className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 py-0.5 mr-1 text-sm font-semibold"
                          >
                            {name.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 w-full justify-center">
                    <button
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow hover:scale-105 hover:from-indigo-500 hover:to-blue-500 transition-all duration-150"
                      onClick={handleSkip}
                    >
                      次の作品へ
                    </button>
                    <button
                      className="px-6 py-2 bg-gray-600 text-white rounded-xl font-bold shadow hover:bg-gray-800 transition-all duration-150"
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
          </div>
        </section>
      </div>
    </main>
  );
}
