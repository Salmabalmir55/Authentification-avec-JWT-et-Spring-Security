import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = await response.text()
  if (!response.ok) {
    let message = body
    try {
      const parsed = JSON.parse(body)
      message = parsed.message || parsed.error || body
    } catch {
      // The API currently returns plain-text messages for errors.
    }
    throw new Error(message || `La requête a échoué (${response.status}).`)
  }
  try {
    return body ? JSON.parse(body) : null
  } catch {
    return body
  }
}

function Brand({ compact = false }) {
  return (
    <a className={`brand${compact ? ' brand--compact' : ''}`} href="#accueil" aria-label="Sécura, accueil">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none"><path d="M16 3.5 27 8v7.2c0 6.4-4.5 11.4-11 13.3C9.5 26.6 5 21.6 5 15.2V8l11-4.5Z" stroke="currentColor" strokeWidth="1.8"/><path d="m11.5 15.8 3 3 6.4-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
      {!compact && <span className="brand__name">sécura<span>.</span></span>}
    </a>
  )
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('secura-token') || '')
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [results, setResults] = useState({ hello: null, profile: null })
  const [apiBusy, setApiBusy] = useState('')

  useEffect(() => {
    if (!token) return
    localStorage.setItem('secura-token', token)
  }, [token])

  function changeMode(nextMode) {
    setMode(nextMode)
    setNotice(null)
    setPassword('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice(null)
    if (password.length < 6) {
      setNotice({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' })
      return
    }
    setBusy(true)
    try {
      if (mode === 'register') {
        await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
        setNotice({ type: 'success', text: 'Votre compte est créé. Vous pouvez maintenant vous connecter.' })
        setMode('login')
        setPassword('')
      } else {
        const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        if (!data?.token) throw new Error("La réponse de l’API ne contient pas de jeton de connexion.")
        setToken(data.token)
        setNotice(null)
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Connexion impossible. Vérifiez votre serveur et réessayez.' })
    } finally {
      setBusy(false)
    }
  }

  async function callApi(endpoint) {
    setApiBusy(endpoint)
    setResults((current) => ({ ...current, [endpoint]: null }))
    try {
      const path = endpoint === 'hello' ? '/api/hello' : '/api/profile'
      const result = await request(path, { headers: { Authorization: `Bearer ${token}` } })
      setResults((current) => ({ ...current, [endpoint]: { type: 'success', text: typeof result === 'string' ? result : JSON.stringify(result) } }))
    } catch (error) {
      setResults((current) => ({ ...current, [endpoint]: { type: 'error', text: error.message || 'Impossible de joindre cette route.' } }))
    } finally {
      setApiBusy('')
    }
  }

  function logout() {
    localStorage.removeItem('secura-token')
    setToken('')
    setResults({ hello: null, profile: null })
    setNotice({ type: 'success', text: 'Vous êtes déconnecté·e.' })
  }

  return (
    <main className="app-shell" id="accueil">
      <header className="topbar">
        <Brand />
        <div className="topbar__meta"><span className="status-dot" /> Démonstration sécurité</div>
      </header>

      {token ? (
        <section className="workspace">
          <div className="workspace__intro">
            <div className="eyebrow"><span className="eyebrow__line" /> ESPACE SÉCURISÉ</div>
            <h1>Tout est <em>en ordre.</em></h1>
            <p>Votre session est active. Vous pouvez maintenant vérifier les routes protégées de votre API.</p>
          </div>
          <div className="session-card">
            <div className="session-card__top"><span className="session-icon">✓</span><div><strong>Session authentifiée</strong><span>Jeton JWT enregistré dans ce navigateur</span></div><span className="live-badge"><i /> Actif</span></div>
            <div className="session-card__email"><span>COMPTE CONNECTÉ</span><strong>{email || 'Votre compte'}</strong></div>
            <div className="session-card__actions">
              <button className="api-action" onClick={() => callApi('hello')} disabled={Boolean(apiBusy)}><span className="api-action__index">01</span><span><strong>Tester /api/hello</strong><small>Vérifier l’accès à la route protégée</small></span><span className="api-action__arrow">{apiBusy === 'hello' ? '…' : '↗'}</span></button>
              <button className="api-action" onClick={() => callApi('profile')} disabled={Boolean(apiBusy)}><span className="api-action__index">02</span><span><strong>Tester /api/profile</strong><small>Récupérer le profil de la session</small></span><span className="api-action__arrow">{apiBusy === 'profile' ? '…' : '↗'}</span></button>
            </div>
            {Object.entries(results).map(([key, result]) => result && <div className={`api-result api-result--${result.type}`} key={key}><span>{key === 'hello' ? '/api/hello' : '/api/profile'}</span><code>{result.text}</code></div>)}
            <div className="session-card__footer"><span>Les appels utilisent votre jeton Bearer.</span><button className="text-button" onClick={logout}>Se déconnecter <span>↗</span></button></div>
          </div>
          <p className="workspace__note"><span>i</span> Le jeton est conservé localement pour cette démonstration. Déconnectez-vous sur un appareil partagé.</p>
        </section>
      ) : (
        <section className="auth-layout">
          <div className="story-panel">
            <div className="story-panel__content">
              <div className="eyebrow"><span className="eyebrow__line" /> LA SÉCURITÉ, EN TOUTE SIMPLICITÉ</div>
              <h1>Vos accès,<br />sous <em>contrôle.</em></h1>
              <p className="story-panel__lead">Un espace de démonstration pour découvrir une authentification claire, fluide et protégée.</p>
              <div className="story-visual" aria-hidden="true">
                <div className="orbit orbit--outer" /><div className="orbit orbit--inner" />
                <div className="visual-card"><span className="visual-card__shield"><Brand compact /></span><span className="visual-card__label">PROTECTION ACTIVE</span><span className="visual-card__line visual-card__line--long" /><span className="visual-card__line" /><span className="visual-card__check">✓</span></div>
                <span className="visual-spark visual-spark--one">✳</span><span className="visual-spark visual-spark--two">✦</span><span className="visual-cross">+</span>
              </div>
            </div>
            <div className="story-panel__footer"><span>AUTHENTIFICATION SÉCURISÉE</span><span>JWT <i /> SESSION PRIVÉE</span></div>
          </div>

          <div className="form-panel">
            <div className="form-panel__inner">
              <div className="form-panel__heading">
                <div className="eyebrow eyebrow--muted">VOTRE ESPACE PERSONNEL</div>
                <h2>{mode === 'login' ? 'Ravi de vous revoir.' : 'Créer votre compte.'}</h2>
                <p>{mode === 'login' ? 'Connectez-vous pour accéder à votre espace.' : 'Quelques secondes suffisent pour commencer.'}</p>
              </div>

              <div className="mode-switch" role="tablist" aria-label="Type d’accès">
                <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => changeMode('login')}>Connexion</button>
                <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => changeMode('register')}>Créer un compte</button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Adresse e-mail</label>
                <div className="input-wrap"><span className="input-icon" aria-hidden="true">@</span><input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>

                <div className="label-row"><label htmlFor="password">Mot de passe</label>{mode === 'login' && <span className="field-hint">6 caractères minimum</span>}</div>
                <div className="input-wrap"><span className="input-icon input-icon--lock" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><rect x="4" y="8.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••••" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /><button type="button" className="show-password" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? 'Masquer' : 'Afficher'}</button></div>

                {notice && <div className={`notice notice--${notice.type}`} role="status"><span>{notice.type === 'error' ? '!' : '✓'}</span>{notice.text}</div>}

                <button className="submit-button" type="submit" disabled={busy}>{busy ? <><span className="spinner" /> Un instant…</> : <>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <span>↗</span></>}</button>
              </form>

              <div className="form-assurance"><span className="assurance-icon"><svg viewBox="0 0 20 20" fill="none"><path d="M10 2.5 16.5 5v4.3c0 3.8-2.7 6.8-6.5 8-3.8-1.2-6.5-4.2-6.5-8V5l6.5-2.5Z" stroke="currentColor" strokeWidth="1.4"/><path d="m7.4 9.9 1.8 1.8 3.6-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Vos données restent protégées</strong><small>Connexion chiffrée avec jeton sécurisé.</small></span></div>
              <p className="form-legal">En continuant, vous acceptez les conditions d’utilisation<br />et la politique de confidentialité.</p>
            </div>
          </div>
        </section>
      )}

      <footer className="page-footer"><span>© 2026 Sécura</span><span>Une démonstration d’authentification web</span><span><i className="status-dot" /> Connexion protégée</span></footer>
    </main>
  )
}

export default App
