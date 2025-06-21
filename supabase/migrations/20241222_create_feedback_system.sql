-- Migration: Create Feedback System
-- Description: Sistema completo de feedbacks, sugestões e bug reports
-- Date: 2024-12-22

-- 1. Criar tabela de feedbacks
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('SUGGESTION', 'BUG_REPORT', 'FEEDBACK', 'FEATURE_REQUEST', 'OTHER')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  email VARCHAR(255),
  priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(15) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  browser_info JSONB, -- Para armazenar User-Agent, resolução, etc.
  page_url VARCHAR(500), -- Página onde o feedback foi enviado
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional, pode ser anônimo
  admin_notes TEXT, -- Notas internas para administradores
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. Criar índices para performance
CREATE INDEX idx_feedbacks_type ON feedbacks(type);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_priority ON feedbacks(priority);
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
-- Usuários podem ver apenas seus próprios feedbacks
CREATE POLICY "Users can view own feedbacks" ON feedbacks
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Qualquer usuário autenticado pode criar feedbacks
CREATE POLICY "Authenticated users can create feedbacks" ON feedbacks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin pode ver todos os feedbacks
CREATE POLICY "Admin can view all feedbacks" ON feedbacks
  FOR SELECT USING (auth.uid()::text = '5b2ee7d6-63ee-4d84-9e01-6aacb85ef2b4');

-- Admin pode atualizar feedbacks
CREATE POLICY "Admin can update feedbacks" ON feedbacks
  FOR UPDATE USING (auth.uid()::text = '5b2ee7d6-63ee-4d84-9e01-6aacb85ef2b4');

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para updated_at
CREATE TRIGGER update_feedbacks_updated_at
    BEFORE UPDATE ON feedbacks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Comentários para documentação
COMMENT ON TABLE feedbacks IS 'Sistema de feedbacks, sugestões e bug reports dos usuários';
COMMENT ON COLUMN feedbacks.type IS 'Tipo do feedback: SUGGESTION, BUG_REPORT, FEEDBACK, FEATURE_REQUEST, OTHER';
COMMENT ON COLUMN feedbacks.priority IS 'Prioridade: LOW, MEDIUM, HIGH, URGENT';
COMMENT ON COLUMN feedbacks.status IS 'Status: OPEN, IN_PROGRESS, RESOLVED, CLOSED';
COMMENT ON COLUMN feedbacks.browser_info IS 'Informações do navegador e dispositivo em JSON';
COMMENT ON COLUMN feedbacks.page_url IS 'URL da página onde o feedback foi enviado'; 