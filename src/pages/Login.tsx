import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sprout, Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading, error } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (password !== confirmPassword) {
        alert('パスワードが一致しません');
        return;
      }
      if (password.length < 6) {
        alert('パスワードは6文字以上にしてください');
        return;
      }
      try {
        await signUp(email, password);
        navigate('/dashboard');
      } catch (err) {
        // エラーはストアで処理される
      }
    } else {
      try {
        await signIn(email, password);
        navigate('/dashboard');
      } catch (err) {
        // エラーはストアで処理される
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Sprout className="mx-auto h-16 w-16 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            農業作物管理アプリ
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder={isSignUp ? '6文字以上' : 'パスワード'}
                minLength={isSignUp ? 6 : undefined}
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="label flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  パスワード（確認）
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="パスワードを再入力"
                  minLength={6}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isSignUp ? '既にアカウントをお持ちですか？ログイン' : 'アカウントをお持ちでない方は新規登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

