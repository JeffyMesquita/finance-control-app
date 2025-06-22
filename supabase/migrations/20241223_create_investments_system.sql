-- Criar tabela de investimentos
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- renda_fixa, acoes, fundos, criptomoedas, etc
  description TEXT,
  initial_amount INTEGER NOT NULL DEFAULT 0, -- Valor em centavos
  current_amount INTEGER NOT NULL DEFAULT 0, -- Valor em centavos
  target_amount INTEGER, -- Valor em centavos
  investment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Cor para visualização
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de transações de investimentos
CREATE TABLE investment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('aporte', 'resgate', 'rendimento', 'taxa')),
  amount INTEGER NOT NULL, -- Valor em centavos
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_category ON investments(category);
CREATE INDEX idx_investments_is_active ON investments(is_active);
CREATE INDEX idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX idx_investment_transactions_date ON investment_transactions(transaction_date);

-- Configurar RLS (Row Level Security)
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para investments
CREATE POLICY "Users can view their own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para investment_transactions
CREATE POLICY "Users can view their own investment transactions" ON investment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investment transactions" ON investment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment transactions" ON investment_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment transactions" ON investment_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investments_updated_at 
  BEFORE UPDATE ON investments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_transactions_updated_at 
  BEFORE UPDATE ON investment_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 