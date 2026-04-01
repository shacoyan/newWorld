import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ie-black px-4">
      {/* 背景装飾 - 赤いボーダーライン */}
      <div className="pointer-events-none absolute inset-0 m-4 border-2 border-ie-red/30 md:m-12" />
      <div className="pointer-events-none absolute inset-0 m-8 border border-ie-red/15 md:m-16" />

      {/* 上部装飾ライン */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-ie-red" />

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 上部小見出し */}
        <p className="mb-6 text-sm tracking-[0.4em] text-ie-red uppercase">
          ─── Since 2024 ───
        </p>

        {/* 大見出し */}
        <h1
          className="mb-4 text-6xl font-black tracking-wider text-ie-cream md:text-8xl lg:text-9xl"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          肉棒家
        </h1>

        {/* 赤い仕切り線 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px w-16 bg-ie-red md:w-24" />
          <div className="h-2 w-2 rotate-45 bg-ie-red" />
          <div className="h-px w-16 bg-ie-red md:w-24" />
        </div>

        {/* キャッチコピー */}
        <p className="mb-4 text-lg tracking-widest text-ie-cream/80 md:text-2xl">
          こんまにあるようで
        </p>
        <p className="mb-12 text-lg tracking-widest text-ie-cream/80 md:text-2xl">
          なかった記録帳
        </p>

        {/* ボタン群 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Link
            to="/login"
            className="min-w-[200px] border-2 border-ie-red bg-ie-red px-10 py-4 text-center text-lg font-bold tracking-widest text-white transition-all duration-300 hover:bg-transparent hover:text-ie-red"
          >
            ログイン
          </Link>
          <Link
            to="/signup"
            className="min-w-[200px] border-2 border-ie-cream/50 bg-transparent px-10 py-4 text-center text-lg font-bold tracking-widest text-ie-cream transition-all duration-300 hover:border-ie-cream hover:bg-ie-cream hover:text-ie-black"
          >
            新規登録
          </Link>
        </div>
      </div>

      {/* 下部装飾ライン */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-ie-red" />

      {/* 下部テキスト */}
      <p className="absolute bottom-8 text-xs tracking-widest text-ie-cream/30 md:bottom-12">
        家系ラーメン 記録のすべて
      </p>
    </div>
  );
}
