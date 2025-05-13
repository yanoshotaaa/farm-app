"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()

  // ユーザー情報のlocalStorageキー
  const USER_KEY = "farmapp_user"
  const AUTH_KEY = "farmapp_auth"

  // ログイン処理
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) {
      setError("ユーザーが登録されていません。新規登録してください。")
      return
    }
    const user = JSON.parse(userStr)
    if (user.email === email && user.password === password) {
      localStorage.setItem(AUTH_KEY, "true")
      router.push("/")
    } else {
      setError("メールアドレスまたはパスワードが間違っています。")
    }
  }

  // 新規登録処理
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return
    }
    localStorage.setItem(USER_KEY, JSON.stringify({ email, password }))
    localStorage.setItem(AUTH_KEY, "true")
    setError("")
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 font-bold rounded-l-lg ${!isSignup ? 'bg-green-600 text-white' : 'bg-gray-100 text-green-700'}`}
            onClick={() => { setIsSignup(false); setError(""); }}
          >
            ログイン
          </button>
          <button
            className={`px-4 py-2 font-bold rounded-r-lg ${isSignup ? 'bg-green-600 text-white' : 'bg-gray-100 text-green-700'}`}
            onClick={() => { setIsSignup(true); setError(""); }}
          >
            新規登録
          </button>
        </div>
        {!isSignup ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h1 className="text-2xl font-bold text-green-700 mb-2 text-center">ログイン</h1>
            <div>
              <label className="block text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors mt-2"
            >
              ログイン
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <h1 className="text-2xl font-bold text-green-700 mb-2 text-center">新規登録</h1>
            <div>
              <label className="block text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors mt-2"
            >
              新規登録
            </button>
          </form>
        )}
      </div>
    </div>
  )
} 