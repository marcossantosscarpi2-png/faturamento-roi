'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Mode = 'login' | 'register';

export function EmailAuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
  const buttonLabel = mode === 'login' ? 'Entrar' : 'Criar conta';
  const canSubmit = useMemo(() => {
    if (!username.trim() || !password) return false;
    if (mode === 'register' && password !== password2) return false;
    return true;
  }, [username, password, password2, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError(mode === 'register' && password !== password2 ? 'As senhas não conferem' : 'Preencha os campos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || (mode === 'login' ? 'Erro ao entrar' : 'Erro ao registrar'));
        return;
      }
      toast.success(mode === 'login' ? 'Bem-vindo!' : 'Conta criada com sucesso!');
      router.refresh();
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={[
            'rounded-lg px-3 py-2 text-sm font-medium border transition-colors',
            mode === 'login' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-muted',
          ].join(' ')}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={[
            'rounded-lg px-3 py-2 text-sm font-medium border transition-colors',
            mode === 'register'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-transparent hover:bg-muted',
          ].join(' ')}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium mb-2">Usuário</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border px-4 py-2"
          placeholder="Seu usuário"
          autoComplete="username"
          autoFocus
        />

        <label className="block text-sm font-medium mb-2 mt-4">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-2"
          placeholder="Mínimo 8 caracteres"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        {mode === 'register' && (
          <>
            <label className="block text-sm font-medium mb-2 mt-4">Confirmar senha</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full rounded-lg border px-4 py-2"
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </>
        )}

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="mt-4 w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === 'login' ? 'Entrando...' : 'Criando...'}
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </form>
    </div>
  );
}

