-- Migration: Create Savings Boxes System
-- Description: Cria sistema de cofrinhos digitais (savings boxes) com transações e vinculação às metas
-- Date: 2024-12-22

-- 1. Criar tabela principal dos cofrinhos
CREATE TABLE savings_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  current_amount DECIMAL(12,2) DEFAULT 0.00,
  target_amount DECIMAL(12,2), -- Meta opcional para o cofrinho
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'piggy-bank',
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de transações dos cofrinhos
CREATE TABLE savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_box_id UUID NOT NULL REFERENCES savings_boxes(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'TRANSFER')),
  description TEXT,
  source_account_id UUID REFERENCES financial_accounts(id),
  target_savings_box_id UUID REFERENCES savings_boxes(id), -- Para transferências entre cofrinhos
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modificar tabela financial_goals para incluir vinculação com cofrinhos
ALTER TABLE financial_goals 
ADD COLUMN savings_box_id UUID REFERENCES savings_boxes(id);

-- 4. Criar índices para performance
CREATE INDEX idx_savings_boxes_user_id ON savings_boxes(user_id);
CREATE INDEX idx_savings_boxes_is_active ON savings_boxes(is_active);
CREATE INDEX idx_savings_transactions_savings_box_id ON savings_transactions(savings_box_id);
CREATE INDEX idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_type ON savings_transactions(type);
CREATE INDEX idx_financial_goals_savings_box_id ON financial_goals(savings_box_id);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE savings_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança para savings_boxes
CREATE POLICY "Users can only see their own savings_boxes" 
ON savings_boxes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings_boxes" 
ON savings_boxes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings_boxes" 
ON savings_boxes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings_boxes" 
ON savings_boxes FOR DELETE USING (auth.uid() = user_id);

-- 7. Criar políticas de segurança para savings_transactions
CREATE POLICY "Users can only see their own savings_transactions" 
ON savings_transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings_transactions" 
ON savings_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar trigger para atualizar updated_at na tabela savings_boxes
CREATE TRIGGER update_savings_boxes_updated_at BEFORE UPDATE ON savings_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Criar função para validar transações de cofrinhos
CREATE OR REPLACE FUNCTION validate_savings_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que o usuário é dono do cofrinho
    IF NOT EXISTS (
        SELECT 1 FROM savings_boxes 
        WHERE id = NEW.savings_box_id AND user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User does not own this savings box';
    END IF;
    
    -- Para saques, validar se há saldo suficiente
    IF NEW.type = 'WITHDRAW' AND NEW.amount > 0 THEN
        DECLARE
            current_balance DECIMAL(12,2);
        BEGIN
            SELECT current_amount INTO current_balance 
            FROM savings_boxes 
            WHERE id = NEW.savings_box_id;
            
            IF current_balance < NEW.amount THEN
                RAISE EXCEPTION 'Insufficient balance in savings box';
            END IF;
        END;
    END IF;
    
    -- Para transferências, validar cofrinho de destino
    IF NEW.type = 'TRANSFER' AND NEW.target_savings_box_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM savings_boxes 
            WHERE id = NEW.target_savings_box_id AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'User does not own the target savings box';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar trigger para validar transações
CREATE TRIGGER validate_savings_transaction_trigger
    BEFORE INSERT ON savings_transactions
    FOR EACH ROW EXECUTE FUNCTION validate_savings_transaction();

-- 12. Criar função para atualizar saldo do cofrinho automaticamente
CREATE OR REPLACE FUNCTION update_savings_box_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar saldo do cofrinho de origem
    IF TG_OP = 'INSERT' THEN
        -- Depósito: adicionar ao saldo
        IF NEW.type = 'DEPOSIT' THEN
            UPDATE savings_boxes 
            SET current_amount = current_amount + NEW.amount 
            WHERE id = NEW.savings_box_id;
        END IF;
        
        -- Saque: subtrair do saldo
        IF NEW.type = 'WITHDRAW' THEN
            UPDATE savings_boxes 
            SET current_amount = current_amount - NEW.amount 
            WHERE id = NEW.savings_box_id;
        END IF;
        
        -- Transferência: subtrair do origem e adicionar ao destino
        IF NEW.type = 'TRANSFER' THEN
            UPDATE savings_boxes 
            SET current_amount = current_amount - NEW.amount 
            WHERE id = NEW.savings_box_id;
            
            UPDATE savings_boxes 
            SET current_amount = current_amount + NEW.amount 
            WHERE id = NEW.target_savings_box_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 13. Criar trigger para atualizar saldo automaticamente
CREATE TRIGGER update_savings_box_balance_trigger
    AFTER INSERT ON savings_transactions
    FOR EACH ROW EXECUTE FUNCTION update_savings_box_balance();

-- 14. Comentários nas tabelas para documentação
COMMENT ON TABLE savings_boxes IS 'Cofrinhos digitais - sistema de poupança por categorias/propósitos';
COMMENT ON TABLE savings_transactions IS 'Histórico de movimentações dos cofrinhos (depósitos, saques, transferências)';
COMMENT ON COLUMN financial_goals.savings_box_id IS 'Cofrinho vinculado à meta (opcional)';

-- 15. Inserir dados de exemplo (opcional - apenas para desenvolvimento)
-- REMOVER EM PRODUÇÃO
/*
INSERT INTO savings_boxes (name, description, target_amount, color, icon, user_id) VALUES
('Viagem para o Japão', 'Economias para a viagem dos sonhos', 15000.00, '#10B981', 'plane', auth.uid()),
('Fundo de Emergência', 'Reserva para emergências', 10000.00, '#EF4444', 'shield', auth.uid()),
('Casa Nova', 'Entrada para comprar casa própria', 50000.00, '#8B5CF6', 'home', auth.uid());
*/ 