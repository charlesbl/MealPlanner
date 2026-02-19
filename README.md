# MealPlanner

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.io/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

An intelligent meal planning application with conversational AI assistant, built with modern microservices architecture.

## ✨ Features

### 🤖 Conversational AI Assistant

- **Real-time chat** with streaming responses
- **Intelligent agent** powered by LangChain and OpenAI
- **Contextual conversation management** with persistence
- **Specialized tools** for recipe and meal plan management

### 📚 Recipe Library Management

- **Create and edit** detailed recipes
- **Categorization** by meal type (Breakfast, Lunch, Dinner, Snacks)
- **Complete descriptions** with ingredients, steps and chef tips
- **Search and filtering** by type or preferences

### 📅 Meal Planning

- **Weekly meal organization**
- **Selection from personal** recipe library
- **Flexible management** with easy add/remove
- **Intuitive interface** with swipe navigation

### 🔐 Authentication & Security

- **Complete system** for registration and login
- **Personalized data** per user
- **Secure API** with JWT tokens
- **Robust validation** with Zod schemas

## 🏗️ Architecture

### TypeScript Monorepo with pnpm Workspaces

```
MealPlanner/
├── apps/
│   ├── front/          # Vue.js 3 + TypeScript Interface
│   ├── api/            # Express REST API + TypeORM
│   ├── agent/          # LangChain + OpenAI AI Agent
│   └── db/             # PostgreSQL Configuration
└── packages/
    ├── shared-all/     # Shared Types & Services
    └── shared-back/    # Backend Utilities
```

### Tech Stack

#### Frontend

- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Vite** for build and development
- **Responsive interface** with custom CSS

#### Backend API

- **Express.js** with TypeScript
- **TypeORM** for PostgreSQL ORM
- **JWT** for authentication
- **Zod validation** on all endpoints
- **Modular architecture** by domain

#### AI Agent

- **LangChain** for AI orchestration
- **OpenAI GPT** (via OpenRouter) as LLM
- **PostgreSQL** for conversation persistence
- **Specialized tools** for each business action
- **SSE streaming** for real-time responses

#### Database

- **PostgreSQL 16** with Alpine Linux
- **TypeORM migrations** for schema management
- **Optimized relational** data
- **Indexes** for performance

#### DevOps

- **Docker** for containerization
- **Docker Compose** for orchestration
- **Configuration** via environment variables
- **Volumes** for data persistence

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker and Docker Compose

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd MealPlanner
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment configuration**

```bash
# Copy example files
cp apps/api/.env.example apps/api/.env
cp apps/agent/.env.example apps/agent/.env

# Edit variables (API keys, DB config, etc.)
```

4. **Start the database**

```bash
pnpm db:up
```

5. **Launch development services**

```bash
# Terminal 1 - API
pnpm dev:api

# Terminal 2 - AI Agent
pnpm dev:agent

# Terminal 3 - Frontend
pnpm dev:front
```

The application will be available at http://localhost:5173

### Production Deployment

```bash
# Build all services
pnpm build

# Deploy with Docker Compose
docker compose -f docker-compose.prod.yml up -d
```

## 🛠️ Available Scripts

### Development

- `pnpm dev:front` - User interface (Vite dev server)
- `pnpm dev:api` - REST API (nodemon)
- `pnpm dev:agent` - AI Agent (tsx watch)
- `pnpm dev:shared-all` - Shared package (build watch)

### Database

- `pnpm db:up` - Start PostgreSQL
- `pnpm db:down` - Stop PostgreSQL
- `pnpm db:purge` - Delete all data
- `pnpm migration:generate` - Generate a migration
- `pnpm migration:run` - Run migrations

### Build & Deployment

- `pnpm build` - Build all services
- `pnpm preview` - Frontend preview

## 📊 Data Model

### Main Entities

#### User

- User profile with authentication
- One-to-many relationship with recipes and meals

#### Recipe

- Recipe with name, description, types
- Belongs to a user
- Can be in multiple meals

#### Meal

- Planning item referencing a recipe
- Optional order for sequencing
- Belongs to a user

### Recipe Types

- `Breakfast` - Morning meal
- `Lunch` - Midday meal
- `Dinner` - Evening meal
- `Snacks` - Light meals

## 🔧 API Endpoints

### Authentication

- `POST /auth/register` - Create account
- `POST /auth/login` - Login

### Recipes (Library)

- `GET /library` - List recipes
- `POST /library` - Create recipe
- `PUT /library/:id` - Update recipe
- `DELETE /library/:id` - Delete recipe

### Planning

- `GET /plan` - List meal plan
- `POST /plan/add` - Add to plan
- `POST /plan/remove` - Remove from plan

### AI Agent

- `POST /chat` - Conversation with agent (SSE)

## 🧠 AI Agent Functionality

The agent uses several specialized tools:

- **`read_library`** - Browse recipe library
- **`add_or_update_recipe`** - Create/edit recipes
- **`remove_recipe`** - Delete a recipe
- **`read_plan`** - View current meal plan
- **`add_meal`** - Add recipe to plan
- **`remove_meal`** - Remove item from plan

The agent understands business context and guides users in:

- Creating detailed recipes
- Organizing their meals
- Discovering their library
- Intelligent meal planning

## 🎯 Use Cases

### For Users

1. **Recipe Creation** - "Help me create a carbonara pasta recipe"
2. **Planning** - "Add this recipe to my week"
3. **Organization** - "Show me my dinner recipes"
4. **Management** - "Remove meal number 3 from my plan"

### For Developers

- Modern microservices architecture
- Conversational AI integration
- TypeScript development patterns
- Frontend/backend state management
- Real-time streaming
- Secure authentication

## 🚀 Future Enhancements

- **External integrations** (nutrition APIs, shopping)
- **AI recommendations** based on history
- **Recipe sharing** between users
- **Automatic generation** of shopping lists
- **Advanced planning** (calories, allergens)
- **Mobile application** React Native/Flutter

## 📝 Technologies & Concepts Demonstrated

- **Microservices Architecture** with inter-service communication
- **Conversational Artificial Intelligence** with LangChain
- **Full-Stack TypeScript** with type sharing
- **Real-time streaming** with Server-Sent Events
- **Secure JWT Authentication**
- **Modern ORM** with TypeORM and migrations
- **Modern User Interface** with Vue.js 3
- **Multi-stage Docker** containerization
- **Monorepo** with pnpm workspaces
- **Data validation** with Zod schemas

---

_Built with TypeScript, Vue.js, Express.js, LangChain, and PostgreSQL_
