-- Execute uma vez no SQL Editor do Neon. Não cria tabelas durante requisições.
CREATE TABLE IF NOT EXISTS proposal_requests (
 id uuid PRIMARY KEY,
 submission_key uuid NOT NULL UNIQUE,
 protocol text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 origin text NOT NULL DEFAULT 'Site ALT',
 status text NOT NULL DEFAULT 'Novo lead',
 condominio text NOT NULL,
 responsavel text NOT NULL,
 telefone text NOT NULL,
 email text NOT NULL,
 units integer,
 answers jsonb NOT NULL,
 consent_version text NOT NULL,
 notification_state text NOT NULL DEFAULT 'pending',
 notification_attempts integer NOT NULL DEFAULT 0,
 notification_lock_until timestamptz,
 notification_updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS proposal_rate_limits (
 key text PRIMARY KEY,
 count integer NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS proposals_created_idx ON proposal_requests(created_at DESC);
