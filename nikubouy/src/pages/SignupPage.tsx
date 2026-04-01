import React from 'react';
import SignupForm from '../components/Auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ie-black px-4">
      {/* 装飾ボーダー */}
      <div className="pointer-events-none absolute inset-0 m-4 border border-ie-red/20 md:m-12" />

      <div className="relative z-10 w-full max-w-md">
        {/* ページタイトル */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-wider text-ie-cream">
            新規登録
          </h2>
          <div className="mx-auto mt-4 h-px w-20 bg-ie-red" />
        </div>

        {/* サインアップフォーム */}
        <div className="border border-ie-red/30 bg-ie-dark/50 p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
