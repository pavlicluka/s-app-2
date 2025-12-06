import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Logo from './common/Logo'

export default function Login() {
  const { t, i18n } = useTranslation()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error(t('auth.fullNameRequired') || 'Polno ime je obvezno')
        }
        await signUp(email, password, fullName)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setError(err.message || (isSignUp ? t('auth.signupError') : t('auth.loginError')))
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (language: string) => {
    console.log('🌍 Login: Spreminjam jezik na:', language)
    i18n.changeLanguage(language)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setEmail('')
    setPassword('')
    setFullName('')
  }

  // Debug log
  console.log('🔵 Login render - isSignUp:', isSignUp, 'hasToggleButton: YES')

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-near-black">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" />
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-bg-surface-elevated border border-border-subtle rounded-md
                       px-4 py-2 pr-8 text-body-sm text-text-primary
                       focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                       transition-all duration-200 cursor-pointer"
            >
              <option value="sl">🇸🇮 Slovenščina</option>
              <option value="en">🇬🇧 English</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Globe className="h-4 w-4 text-text-secondary" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-bg-surface-elevated p-10 rounded-lg border border-border-moderate">
          <h2 className="text-2xl font-semibold text-text-primary mb-6 text-center">
            {isSignUp ? t('auth.createAccount') : t('auth.signInToAccount')}
          </h2>
          {/* DEBUG: Version 2.0 with registration */}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (only for signup) */}
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-body-sm font-medium text-text-primary mb-2">
                  {t('auth.fullName')}
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-bg-near-black border border-border-subtle rounded-md
                           text-body text-text-primary placeholder-text-tertiary
                           focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                           transition-all duration-200"
                  placeholder={t('auth.fullNamePlaceholder')}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-body-sm font-medium text-text-primary mb-2">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 bg-bg-near-black border border-border-subtle rounded-md
                         text-body text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                         transition-all duration-200"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-text-primary mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-12 px-4 bg-bg-near-black border border-border-subtle rounded-md
                         text-body text-text-primary placeholder-text-tertiary
                         focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/15
                         transition-all duration-200"
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-risk-high/15 border border-risk-high/30 rounded-md">
                <p className="text-body-sm text-risk-high">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-accent-primary text-white font-semibold rounded-sm
                       hover:brightness-110 hover:shadow-glow-accent-sm
                       active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-150"
            >
              {loading 
                ? (isSignUp ? t('auth.signingUp') : t('auth.signingIn'))
                : (isSignUp ? t('auth.signUp') : t('auth.signIn'))
              }
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-body-sm text-accent-primary hover:text-accent-secondary transition-colors"
            >
              {isSignUp 
                ? t('auth.alreadyHaveAccountSignIn')
                : t('auth.dontHaveAccountSignUp')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
