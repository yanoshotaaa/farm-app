"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ユーザー情報のlocalStorageキー
  const USER_KEY = "farmapp_user"
  const AUTH_KEY = "farmapp_auth"

  // ログイン処理
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isClient) return

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
    if (!isClient) return

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return
    }
    localStorage.setItem(USER_KEY, JSON.stringify({ email, password }))
    localStorage.setItem(AUTH_KEY, "true")
    setError("")
    router.push("/")
  }

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="relative w-full max-w-md px-6 py-8">
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-2xl mx-auto mb-8"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-8"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-1/2 mx-auto mb-8"></div>
            <div className="bg-white/50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="relative w-full max-w-md px-6 py-8">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl transform -rotate-1"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl"></div>
        
        {/* メインコンテンツ */}
        <div className="relative">
          {/* ロゴ */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-2xl font-bold tracking-tight">Y</span>
            </div>
          </div>

          {/* タイトル */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              農場管理システム
            </h1>
            <p className="text-gray-500 mt-2">Enterprise Edition</p>
          </div>

          {/* タブ切り替え */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 p-1 rounded-xl">
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !isSignup 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                onClick={() => { setIsSignup(false); setError(""); }}
              >
                ログイン
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSignup 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                onClick={() => { setIsSignup(true); setError(""); }}
              >
                新規登録
              </button>
            </div>
          </div>

          {/* フォーム */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            {!isSignup ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="example@farm.com"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  ログイン
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="example@farm.com"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  新規登録
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 