# Migração para NestJS - Finance Control App

## 📋 Visão Geral

Este documento detalha a migração completa do backend atual (Next.js API Routes) para um backend dedicado em **NestJS**, mantendo **exatamente os mesmos retornos** e funcionalidades. A implementação seguirá **Clean Architecture**, **SOLID** e **TDD**.

## 🎯 Objetivos

- ✅ Manter 100% da funcionalidade existente
- ✅ Retornos idênticos às APIs atuais
- ✅ Implementar Clean Architecture + SOLID
- ✅ Cobertura de testes (TDD)
- ✅ Performance otimizada
- ✅ Escalabilidade e manutenibilidade

---

## 📊 Análise da Estrutura Atual

### APIs Identificadas (24 endpoints principais)

#### 1. **Dashboard & Analytics**

- `GET /dashboard` - Dados do dashboard principal
- `GET /monthly-data` - Dados mensais para gráficos
- `GET /expense-breakdown` - Quebra de gastos por categoria
- `GET /recent-transactions` - Transações recentes

#### 2. **Transactions (CRUD Completo)**

- `GET /transactions/list` - Listagem com filtros e paginação
- `POST /transactions/create` - Criar transação
- `PUT /transactions/update` - Atualizar transação
- `DELETE /transactions/delete` - Deletar transação

#### 3. **Categories (CRUD Completo)**

- `GET /categories/list` - Listar categorias
- `POST /categories/create` - Criar categoria
- `PUT /categories/update` - Atualizar categoria
- `DELETE /categories/delete` - Deletar categoria

#### 4. **Goals (CRUD + Progress)**

- `GET /goals/list` - Listar metas
- `GET /goals` - Buscar metas (alternativo)
- `POST /goals/create` - Criar meta
- `PUT /goals/update` - Atualizar meta
- `PUT /goals/update-progress` - Atualizar progresso
- `DELETE /goals/delete` - Deletar meta

#### 5. **Savings Boxes (CRUD + Stats)**

- `GET /savings-boxes/list` - Listar cofrinhos
- `GET /savings-boxes/stats` - Estatísticas dos cofrinhos
- `GET /savings-boxes-total` - Total dos cofrinhos
- `GET /savings-boxes-summary` - Resumo dos cofrinhos
- `POST /savings-boxes/create` - Criar cofrinho
- `PUT /savings-boxes/update` - Atualizar cofrinho
- `DELETE /savings-boxes/delete` - Deletar cofrinho

#### 6. **Investments (CRUD + Summary)**

- `GET /investments/list` - Listar investimentos
- `GET /investments/summary` - Resumo dos investimentos
- `POST /investments/create` - Criar investimento
- `PUT /investments/update` - Atualizar investimento
- `DELETE /investments/delete` - Deletar investimento

#### 7. **Admin (Dashboard + Management)**

- `GET /admin/analytics` - Analytics do admin
- `GET /admin/users` - Listar usuários
- `GET /admin/feedbacks/list` - Listar feedbacks
- `PUT /admin/feedbacks/update` - Atualizar feedback
- `GET /admin/referrals` - Listar referrals

#### 8. **User Management**

- `GET /user-profile` - Perfil do usuário
- `PUT /user-profile` - Atualizar perfil
- `GET /user-settings` - Configurações do usuário
- `PUT /user-settings` - Atualizar configurações
- `GET /current-user` - Usuário atual

#### 9. **Export & Utilities**

- `POST /export` - Exportar dados
- `GET /referrals` - Sistema de referrals
- `POST /auth/email` - Autenticação por email
- `POST /feedback/send-notification` - Envio de feedback

---

## 🏗️ Arquitetura Proposta

### Clean Architecture Layers

```
├── src/
│   ├── application/          # Application Layer
│   │   ├── use-cases/       # Business Logic
│   │   ├── interfaces/      # Contracts/Ports
│   │   └── dtos/           # Data Transfer Objects
│   ├── domain/              # Domain Layer
│   │   ├── entities/       # Business Entities
│   │   ├── value-objects/  # Value Objects
│   │   └── repositories/   # Repository Contracts
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── database/       # Supabase Implementation
│   │   ├── auth/          # Authentication
│   │   ├── email/         # Email Service
│   │   └── config/        # Configuration
│   └── presentation/        # Presentation Layer
│       ├── controllers/    # HTTP Controllers
│       ├── dtos/          # Request/Response DTOs
│       ├── guards/        # Authorization Guards
│       └── filters/       # Exception Filters
```

### SOLID Principles Implementation

- **S** - Single Responsibility: Cada classe/service tem uma única responsabilidade
- **O** - Open/Closed: Extensível via interfaces, fechado para modificação
- **L** - Liskov Substitution: Implementações intercambiáveis via contracts
- **I** - Interface Segregation: Interfaces específicas e coesas
- **D** - Dependency Inversion: Dependência de abstrações, não implementações

---

## 📦 Estrutura Detalhada do Projeto

### 1. Domain Layer

```typescript
// src/domain/entities/transaction.entity.ts
export class Transaction {
  constructor(
    public readonly id: TransactionId,
    public readonly accountId: AccountId,
    public readonly amount: Amount,
    public readonly categoryId: CategoryId,
    public readonly date: Date,
    public readonly description: string,
    public readonly type: TransactionType,
    public readonly isRecurring: boolean,
    public readonly installmentNumber?: number,
    public readonly totalInstallments?: number,
    public readonly notes?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: CreateTransactionData): Transaction {
    // Business rules validation
    return new Transaction(/* ... */);
  }

  update(data: UpdateTransactionData): Transaction {
    // Business rules for updates
    return new Transaction(/* ... */);
  }
}

// src/domain/value-objects/amount.vo.ts
export class Amount {
  constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error("Amount cannot be negative");
    }
  }

  getValue(): number {
    return this.value;
  }
}

// src/domain/repositories/transaction.repository.ts
export interface TransactionRepository {
  findById(id: TransactionId): Promise<Transaction | null>;
  findByUserId(
    userId: UserId,
    filters?: TransactionFilters
  ): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  delete(id: TransactionId): Promise<void>;
  getStatistics(userId: UserId): Promise<TransactionStatistics>;
}
```

### 2. Application Layer

```typescript
// src/application/use-cases/transaction/create-transaction.use-case.ts
@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(
    command: CreateTransactionCommand
  ): Promise<CreateTransactionResponse> {
    // 1. Validate business rules
    await this.validateBusinessRules(command);

    // 2. Create transaction entity
    const transaction = Transaction.create({
      accountId: new AccountId(command.accountId),
      amount: new Amount(command.amount),
      categoryId: new CategoryId(command.categoryId),
      date: new Date(command.date),
      description: command.description,
      type: command.type,
      isRecurring: command.isRecurring,
      installmentNumber: command.installmentNumber,
      totalInstallments: command.totalInstallments,
      notes: command.notes,
    });

    // 3. Save transaction
    await this.transactionRepository.save(transaction);

    // 4. Update account balance
    await this.updateAccountBalance(transaction);

    // 5. Emit domain event
    await this.eventBus.publish(new TransactionCreatedEvent(transaction));

    return {
      success: true,
      data: TransactionMapper.toDto(transaction),
    };
  }

  private async validateBusinessRules(
    command: CreateTransactionCommand
  ): Promise<void> {
    // Validate account exists and belongs to user
    const account = await this.accountRepository.findById(
      new AccountId(command.accountId)
    );
    if (!account) {
      throw new AccountNotFoundException();
    }

    // Validate category exists and belongs to user
    const category = await this.categoryRepository.findById(
      new CategoryId(command.categoryId)
    );
    if (!category) {
      throw new CategoryNotFoundException();
    }

    // Additional business rules...
  }
}

// src/application/dtos/transaction/create-transaction.dto.ts
export class CreateTransactionCommand {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsNumber()
  @IsOptional()
  installmentNumber?: number;

  @IsNumber()
  @IsOptional()
  totalInstallments?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateTransactionResponse extends BaseResponse<TransactionDto> {}
```

### 3. Infrastructure Layer

```typescript
// src/infrastructure/database/repositories/supabase-transaction.repository.ts
@Injectable()
export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async findById(id: TransactionId): Promise<Transaction | null> {
    const { data, error } = await this.supabaseClient
      .from("transactions")
      .select(
        `
        *,
        account:financial_accounts(*),
        category:categories(*)
      `
      )
      .eq("id", id.getValue())
      .single();

    if (error || !data) return null;

    return TransactionMapper.toDomain(data);
  }

  async findByUserId(
    userId: UserId,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    let query = this.supabaseClient
      .from("transactions")
      .select(
        `
        *,
        account:financial_accounts(*),
        category:categories(*)
      `
      )
      .eq("user_id", userId.getValue());

    // Apply filters
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
    if (filters?.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("date", filters.endDate);
    }
    if (filters?.search) {
      query = query.ilike("description", `%${filters.search}%`);
    }

    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query.order("date", { ascending: false });

    if (error) {
      throw new DatabaseException("Failed to fetch transactions", error);
    }

    return data.map(TransactionMapper.toDomain);
  }

  async save(transaction: Transaction): Promise<void> {
    const data = TransactionMapper.toPersistence(transaction);

    const { error } = await this.supabaseClient
      .from("transactions")
      .upsert(data);

    if (error) {
      throw new DatabaseException("Failed to save transaction", error);
    }
  }

  async delete(id: TransactionId): Promise<void> {
    const { error } = await this.supabaseClient
      .from("transactions")
      .delete()
      .eq("id", id.getValue());

    if (error) {
      throw new DatabaseException("Failed to delete transaction", error);
    }
  }
}

// src/infrastructure/database/mappers/transaction.mapper.ts
export class TransactionMapper {
  static toDomain(raw: any): Transaction {
    return new Transaction(
      new TransactionId(raw.id),
      new AccountId(raw.account_id),
      new Amount(raw.amount),
      new CategoryId(raw.category_id),
      new Date(raw.date),
      raw.description,
      raw.type,
      raw.is_recurring,
      raw.installment_number,
      raw.total_installments,
      raw.notes,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  static toPersistence(transaction: Transaction): any {
    return {
      id: transaction.id.getValue(),
      account_id: transaction.accountId.getValue(),
      amount: transaction.amount.getValue(),
      category_id: transaction.categoryId.getValue(),
      date: transaction.date.toISOString(),
      description: transaction.description,
      type: transaction.type,
      is_recurring: transaction.isRecurring,
      installment_number: transaction.installmentNumber,
      total_installments: transaction.totalInstallments,
      notes: transaction.notes,
      created_at: transaction.createdAt.toISOString(),
      updated_at: transaction.updatedAt.toISOString(),
    };
  }

  static toDto(transaction: Transaction): TransactionDto {
    return {
      id: transaction.id.getValue(),
      accountId: transaction.accountId.getValue(),
      amount: transaction.amount.getValue(),
      categoryId: transaction.categoryId.getValue(),
      date: transaction.date.toISOString(),
      description: transaction.description,
      type: transaction.type,
      isRecurring: transaction.isRecurring,
      installmentNumber: transaction.installmentNumber,
      totalInstallments: transaction.totalInstallments,
      notes: transaction.notes,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }
}
```

### 4. Presentation Layer

```typescript
// src/presentation/controllers/transaction.controller.ts
@Controller("transactions")
@UseGuards(AuthGuard)
@ApiTags("Transactions")
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase
  ) {}

  @Get("list")
  @ApiResponse({ type: GetTransactionsResponse })
  async getTransactions(
    @Query() query: GetTransactionsQuery,
    @CurrentUser() user: UserPayload
  ): Promise<GetTransactionsResponse> {
    const command = new GetTransactionsCommand({
      userId: user.id,
      page: query.page,
      pageSize: query.pageSize,
      month: query.month,
      type: query.type,
      category: query.category,
      search: query.search,
    });

    return await this.getTransactionsUseCase.execute(command);
  }

  @Post("create")
  @ApiResponse({ type: CreateTransactionResponse })
  async createTransaction(
    @Body() body: CreateTransactionRequest,
    @CurrentUser() user: UserPayload
  ): Promise<CreateTransactionResponse> {
    const command = new CreateTransactionCommand({
      ...body,
      userId: user.id,
    });

    return await this.createTransactionUseCase.execute(command);
  }

  @Put("update")
  @ApiResponse({ type: UpdateTransactionResponse })
  async updateTransaction(
    @Body() body: UpdateTransactionRequest,
    @CurrentUser() user: UserPayload
  ): Promise<UpdateTransactionResponse> {
    const command = new UpdateTransactionCommand({
      ...body,
      userId: user.id,
    });

    return await this.updateTransactionUseCase.execute(command);
  }

  @Delete("delete")
  @ApiResponse({ type: BaseResponse })
  async deleteTransaction(
    @Body() body: DeleteTransactionRequest,
    @CurrentUser() user: UserPayload
  ): Promise<BaseResponse> {
    const command = new DeleteTransactionCommand({
      transactionId: body.transactionId,
      userId: user.id,
    });

    return await this.deleteTransactionUseCase.execute(command);
  }
}

// src/presentation/dtos/transaction/get-transactions.dto.ts
export class GetTransactionsQuery {
  @IsNumberString()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsNumberString()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number = 10;

  @IsString()
  @IsOptional()
  month?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class GetTransactionsResponse extends BaseResponse<TransactionDto[]> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasMore: boolean;
}
```

---

## 🔐 Sistema de Autenticação

### Supabase JWT Guard

```typescript
// src/infrastructure/auth/guards/supabase-auth.guard.ts
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const {
        data: { user },
        error,
      } = await this.supabaseService.getClient().auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException("Invalid token");
      }

      request.user = {
        id: user.id,
        email: user.email,
        role: this.getUserRole(user),
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException("Authentication failed");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private getUserRole(user: any): UserRole {
    // Implementar lógica de roles baseada no Supabase
    const adminId = process.env.ADMIN_USER_ID;
    return user.id === adminId ? UserRole.ADMIN : UserRole.USER;
  }
}

// src/infrastructure/auth/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

// src/infrastructure/auth/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Admin access required");
    }

    return true;
  }
}
```

---

## 🧪 Estrutura de Testes (TDD)

### 1. Unit Tests

```typescript
// src/application/use-cases/transaction/create-transaction.use-case.spec.ts
describe("CreateTransactionUseCase", () => {
  let useCase: CreateTransactionUseCase;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let accountRepository: jest.Mocked<AccountRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: "TransactionRepository",
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: "AccountRepository",
          useValue: {
            findById: jest.fn(),
            updateBalance: jest.fn(),
          },
        },
        {
          provide: "CategoryRepository",
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    transactionRepository = module.get("TransactionRepository");
    accountRepository = module.get("AccountRepository");
    categoryRepository = module.get("CategoryRepository");
    eventBus = module.get(EventBus);
  });

  describe("execute", () => {
    it("should create a transaction successfully", async () => {
      // Arrange
      const command = new CreateTransactionCommand({
        accountId: "account-1",
        amount: 100,
        categoryId: "category-1",
        date: "2024-01-01",
        description: "Test transaction",
        type: TransactionType.EXPENSE,
        userId: "user-1",
      });

      const account = new Account(
        new AccountId("account-1"),
        "Test Account",
        1000
      );
      const category = new Category(
        new CategoryId("category-1"),
        "Test Category"
      );

      accountRepository.findById.mockResolvedValue(account);
      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(transactionRepository.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(TransactionCreatedEvent)
      );
    });

    it("should throw error when account does not exist", async () => {
      // Arrange
      const command = new CreateTransactionCommand({
        accountId: "invalid-account",
        amount: 100,
        categoryId: "category-1",
        date: "2024-01-01",
        description: "Test transaction",
        type: TransactionType.EXPENSE,
        userId: "user-1",
      });

      accountRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        AccountNotFoundException
      );
    });

    it("should throw error when category does not exist", async () => {
      // Arrange
      const command = new CreateTransactionCommand({
        accountId: "account-1",
        amount: 100,
        categoryId: "invalid-category",
        date: "2024-01-01",
        description: "Test transaction",
        type: TransactionType.EXPENSE,
        userId: "user-1",
      });

      const account = new Account(
        new AccountId("account-1"),
        "Test Account",
        1000
      );
      accountRepository.findById.mockResolvedValue(account);
      categoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        CategoryNotFoundException
      );
    });
  });
});
```

### 2. Integration Tests

```typescript
// test/transactions.e2e-spec.ts
describe("TransactionsController (e2e)", () => {
  let app: INestApplication;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    supabaseService = moduleFixture.get<SupabaseService>(SupabaseService);
    await app.init();
  });

  describe("/transactions/list (GET)", () => {
    it("should return paginated transactions", async () => {
      // Arrange
      const user = await createTestUser();
      const token = await getAuthToken(user);

      // Act
      const response = await request(app.getHttpServer())
        .get("/transactions/list?page=1&pageSize=10")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page", 1);
      expect(response.body).toHaveProperty("limit", 10);
      expect(response.body).toHaveProperty("hasMore");
    });

    it("should filter transactions by type", async () => {
      // Arrange
      const user = await createTestUser();
      const token = await getAuthToken(user);
      await createTestTransaction(user.id, { type: "INCOME" });
      await createTestTransaction(user.id, { type: "EXPENSE" });

      // Act
      const response = await request(app.getHttpServer())
        .get("/transactions/list?type=INCOME")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe("INCOME");
    });
  });

  describe("/transactions/create (POST)", () => {
    it("should create a new transaction", async () => {
      // Arrange
      const user = await createTestUser();
      const token = await getAuthToken(user);
      const account = await createTestAccount(user.id);
      const category = await createTestCategory(user.id);

      const createTransactionDto = {
        accountId: account.id,
        amount: 100,
        categoryId: category.id,
        date: "2024-01-01",
        description: "Test transaction",
        type: "EXPENSE",
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/transactions/create")
        .set("Authorization", `Bearer ${token}`)
        .send(createTransactionDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toMatchObject({
        amount: 100,
        description: "Test transaction",
        type: "EXPENSE",
      });
    });

    it("should return 400 for invalid data", async () => {
      // Arrange
      const user = await createTestUser();
      const token = await getAuthToken(user);

      const invalidData = {
        amount: -100, // Invalid: negative amount
        description: "", // Invalid: empty description
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post("/transactions/create")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData)
        .expect(400);
    });
  });
});
```

---

## 🌍 Variáveis de Ambiente

### .env (Desenvolvimento)

```bash
# ==================== NODE.JS CONFIG ====================
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# ==================== SUPABASE CONFIG ====================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# ==================== JWT CONFIG ====================
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# ==================== RECAPTCHA CONFIG ====================
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# ==================== EMAIL CONFIG ====================
RESEND_API_KEY=re_your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAILS=admin1@yourdomain.com,admin2@yourdomain.com

# ==================== ADMIN CONFIG ====================
ADMIN_USER_ID=your-admin-user-id

# ==================== CORS CONFIG ====================
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# ==================== RATE LIMITING ====================
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# ==================== CACHE CONFIG ====================
REDIS_URL=redis://localhost:6379
CACHE_TTL=300

# ==================== MONITORING ====================
SENTRY_DSN=https://your-sentry-dsn
```

### .env.production

```bash
# ==================== NODE.JS CONFIG ====================
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# ==================== SUPABASE CONFIG ====================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-production-service-role-key

# ==================== SECURITY ====================
JWT_SECRET=your-super-secure-production-jwt-key
JWT_EXPIRES_IN=7d

# ==================== CORS CONFIG ====================
CORS_ORIGINS=https://yourdomain.com

# ==================== RATE LIMITING ====================
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=50

# ==================== MONITORING ====================
SENTRY_DSN=https://your-production-sentry-dsn
```

---

## 📋 Dependências do Projeto

### package.json

```json
{
  "name": "finance-control-backend",
  "version": "1.0.0",
  "description": "Backend em NestJS para Finance Control App",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/swagger": "^7.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/throttler": "^5.1.2",
    "@nestjs/cache-manager": "^2.2.1",
    "@nestjs/event-emitter": "^2.0.4",
    "@supabase/supabase-js": "^2.39.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "resend": "^3.2.0",
    "cache-manager": "^5.4.0",
    "ioredis": "^5.3.2",
    "winston": "^3.11.0",
    "@sentry/node": "^7.99.0",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "uuid": "^9.0.1",
    "date-fns": "^3.3.1",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "@types/jest": "^29.5.11",
    "@types/supertest": "^6.0.2",
    "@types/bcrypt": "^5.0.2",
    "@types/passport-jwt": "^4.0.1",
    "@types/uuid": "^9.0.7",
    "@types/lodash": "^4.14.202",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "jest": "^29.7.0",
    "prettier": "^3.2.4",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  }
}
```

---

## 🚀 Estrutura de Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Security: Run as non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  finance-backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## 📝 Estrutura Completa de DTOs

### Base Response Types

```typescript
// src/presentation/dtos/common/base-response.dto.ts
export class BaseResponse<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  error?: string;

  constructor(success: boolean, data?: T, error?: string) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success<T>(data: T): BaseResponse<T> {
    return new BaseResponse(true, data);
  }

  static error(error: string): BaseResponse {
    return new BaseResponse(false, undefined, error);
  }
}

export class PaginatedResponse<T> extends BaseResponse<T[]> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasMore: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    super(true, data);
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.hasMore = page * limit < total;
  }
}
```

### Transaction DTOs

```typescript
// src/presentation/dtos/transaction/transaction.dto.ts
export class TransactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ["INCOME", "EXPENSE"] })
  type: "INCOME" | "EXPENSE";

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty({ required: false })
  installmentNumber?: number;

  @ApiProperty({ required: false })
  totalInstallments?: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ required: false })
  account?: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
  };

  @ApiProperty({ required: false })
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: string;
  };
}
```

---

## 🎯 Endpoints Exatos com Retornos Idênticos

### 1. Dashboard Endpoints

```typescript
// GET /dashboard
// Retorno exato:
{
  "success": true,
  "data": {
    "totalBalance": 5000.00,
    "monthlyIncome": 3000.00,
    "monthlyExpenses": 2000.00,
    "monthlySavings": 1000.00,
    "gastosFuturos": 500.00,
    "incomeCount": 5,
    "maxIncome": 1500.00,
    "expenseCount": 15,
    "maxExpense": 300.00,
    "savings": 1000.00,
    "nextMonthExpenses": 1800.00,
    "nextMonthIncome": 3200.00
  }
}

// GET /monthly-data
// Retorno exato:
{
  "success": true,
  "data": [
    {
      "name": "Janeiro",
      "income": 3000,
      "expenses": 2000,
      "savings": 1000
    }
  ]
}
```

### 2. Transactions Endpoints

```typescript
// GET /transactions/list?page=1&pageSize=10&month=2024-01&type=EXPENSE
// Retorno exato:
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "account_id": "account-uuid",
      "amount": 100.00,
      "category_id": "category-uuid",
      "date": "2024-01-15",
      "description": "Compra no supermercado",
      "type": "EXPENSE",
      "is_recurring": false,
      "installment_number": null,
      "total_installments": null,
      "notes": null,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "user_id": "user-uuid",
      "account": {
        "id": "account-uuid",
        "name": "Conta Corrente",
        "type": "CHECKING",
        "balance": 5000.00,
        "currency": "BRL"
      },
      "category": {
        "id": "category-uuid",
        "name": "Alimentação",
        "color": "#FF5722",
        "icon": "utensils",
        "type": "EXPENSE"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "hasMore": true
}

// POST /transactions/create
// Body:
{
  "account_id": "account-uuid",
  "amount": 100.00,
  "category_id": "category-uuid",
  "date": "2024-01-15",
  "description": "Nova transação",
  "type": "EXPENSE",
  "is_recurring": false
}
// Retorno exato:
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "account_id": "account-uuid",
    "amount": 100.00,
    "category_id": "category-uuid",
    "date": "2024-01-15",
    "description": "Nova transação",
    "type": "EXPENSE",
    "is_recurring": false,
    "installment_number": null,
    "total_installments": null,
    "notes": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "user_id": "user-uuid"
  }
}
```

---

## 🔧 Configuração do Módulo Principal

### main.ts

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger } from "@nestjs/common";
import helmet from "helmet";
import * as compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger documentation
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Finance Control API")
      .setDescription("API para controle financeiro pessoal")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
```

### app.module.ts

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { EventEmitterModule } from "@nestjs/event-emitter";

// Modules
import { DatabaseModule } from "./infrastructure/database/database.module";
import { AuthModule } from "./infrastructure/auth/auth.module";
import { TransactionModule } from "./application/modules/transaction.module";
import { CategoryModule } from "./application/modules/category.module";
import { GoalModule } from "./application/modules/goal.module";
import { SavingsBoxModule } from "./application/modules/savings-box.module";
import { InvestmentModule } from "./application/modules/investment.module";
import { DashboardModule } from "./application/modules/dashboard.module";
import { AdminModule } from "./application/modules/admin.module";
import { UserModule } from "./application/modules/user.module";
import { ExportModule } from "./application/modules/export.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
        limit: parseInt(process.env.RATE_LIMIT_LIMIT) || 100,
      },
    ]),

    // Cache
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
    }),

    // Events
    EventEmitterModule.forRoot(),

    // Infrastructure
    DatabaseModule,
    AuthModule,

    // Application modules
    TransactionModule,
    CategoryModule,
    GoalModule,
    SavingsBoxModule,
    InvestmentModule,
    DashboardModule,
    AdminModule,
    UserModule,
    ExportModule,
  ],
})
export class AppModule {}
```

---

## 📈 Cronograma de Implementação

### Fase 1: Fundação (2 semanas)

- ✅ Setup do projeto NestJS
- ✅ Configuração da Clean Architecture
- ✅ Implementação da autenticação Supabase
- ✅ Configuração de testes (Jest)
- ✅ Setup do Docker e Docker Compose

### Fase 2: Core Entities (3 semanas)

- ✅ Implementação completa de Transactions
- ✅ Implementação completa de Categories
- ✅ Implementação completa de Financial Accounts
- ✅ Testes unitários e de integração

### Fase 3: Advanced Features (3 semanas)

- ✅ Implementação de Goals
- ✅ Implementação de Savings Boxes
- ✅ Implementação de Investments
- ✅ Dashboard e Analytics

### Fase 4: Admin & Utils (2 semanas)

- ✅ Sistema administrativo
- ✅ Export/Import de dados
- ✅ Sistema de feedback
- ✅ Notificações por email

### Fase 5: Performance & Production (1 semana)

- ✅ Cache Redis
- ✅ Rate limiting
- ✅ Monitoring (Sentry)
- ✅ Deploy em produção

**Total: 11 semanas de desenvolvimento**

---

## 🎛️ Configurações Avançadas

### Rate Limiting

```typescript
// src/infrastructure/guards/rate-limit.guard.ts
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Different limits for different user types
    if (user?.role === "ADMIN") {
      limit = limit * 5; // Admins get 5x more requests
    }

    return super.handleRequest(context, limit, ttl);
  }
}
```

### Logging Configuration

```typescript
// src/infrastructure/logging/logger.service.ts
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
        new winston.transports.File({ filename: "logs/combined.log" }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
```

---

## 🔄 Migration Strategy

### Estratégia de Migração Gradual

1. **Setup Paralelo**: Deploy do NestJS backend em paralelo ao atual
2. **Feature Flag**: Usar feature flags para alternar entre backends
3. **Shadow Testing**: Rodar testes em ambos os backends simultaneamente
4. **Gradual Rollout**: Migrar endpoints um por vez
5. **Monitoring**: Monitorar performance e erros durante a migração

### Health Checks

```typescript
// src/infrastructure/health/health.controller.ts
@Controller("health")
export class HealthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
    ]);

    const status = checks.every((check) => check.status === "fulfilled")
      ? "healthy"
      : "unhealthy";

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: checks[0].status === "fulfilled" ? "up" : "down",
        cache: checks[1].status === "fulfilled" ? "up" : "down",
        external: checks[2].status === "fulfilled" ? "up" : "down",
      },
    };
  }

  private async checkDatabase(): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from("users")
      .select("id")
      .limit(1);

    if (error) throw error;
  }

  private async checkRedis(): Promise<void> {
    await this.redisService.ping();
  }

  private async checkExternalServices(): Promise<void> {
    // Check external services like Resend, Recaptcha, etc.
  }
}
```

---

## ✅ Checklist de Implementação

### Setup Inicial

- [ ] Criar projeto NestJS
- [ ] Configurar TypeScript e ESLint
- [ ] Setup Docker e Docker Compose
- [ ] Configurar variáveis de ambiente
- [ ] Setup CI/CD pipeline

### Arquitetura

- [ ] Implementar estrutura Clean Architecture
- [ ] Configurar dependency injection
- [ ] Setup repositórios e interfaces
- [ ] Implementar mappers

### Autenticação & Autorização

- [ ] Integração com Supabase Auth
- [ ] Guards de autenticação
- [ ] Guards de autorização (admin)
- [ ] Decorators customizados

### Entidades Core

- [ ] Transactions (CRUD + filtros)
- [ ] Categories (CRUD)
- [ ] Financial Accounts (CRUD)
- [ ] Goals (CRUD + progress)
- [ ] Savings Boxes (CRUD + transactions)
- [ ] Investments (CRUD + summary)

### Features Avançadas

- [ ] Dashboard e analytics
- [ ] Sistema administrativo
- [ ] Export de dados
- [ ] Sistema de feedback
- [ ] Notificações por email

### Testes

- [ ] Unit tests (use cases)
- [ ] Integration tests (repositories)
- [ ] E2E tests (endpoints)
- [ ] Performance tests

### Performance & Produção

- [ ] Cache Redis
- [ ] Rate limiting
- [ ] Monitoring (Sentry)
- [ ] Health checks
- [ ] Deploy em produção

---

## 📚 Conclusão

Este documento fornece um plano detalhado e preciso para migrar o backend atual do Finance Control App para **NestJS**, mantendo **100% da funcionalidade** e implementando as **melhores práticas** de desenvolvimento.

A arquitetura proposta segue **Clean Architecture**, **SOLID** e **TDD**, garantindo:

- ✅ **Manutenibilidade** - Código limpo e bem estruturado
- ✅ **Escalabilidade** - Arquitetura preparada para crescimento
- ✅ **Testabilidade** - Cobertura completa de testes
- ✅ **Performance** - Otimizações de cache e rate limiting
- ✅ **Segurança** - Autenticação robusta e validações
- ✅ **Monitoramento** - Logs estruturados e health checks

### Próximos Passos

1. **Revisão do documento** - Validar todos os requisitos
2. **Setup do ambiente** - Configurar projeto NestJS
3. **Implementação incremental** - Seguir cronograma proposto
4. **Testes contínuos** - Manter qualidade durante desenvolvimento
5. **Deploy gradual** - Migração sem downtime

---

**Documento criado em:** 2024-01-15  
**Versão:** 1.0  
**Autor:** Equipe de Desenvolvimento Finance Control  
**Status:** 📋 Pronto para implementação
