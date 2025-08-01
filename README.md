# Multi-Agent Squad 🤖

An advanced orchestration system for Claude Code that manages multi-repository software development through specialized AI agents, git worktrees, and automated workflows.

## 🌟 Overview

Multi-Agent Squad transforms Claude Code into a complete software development team. When you start Claude in this directory, it automatically:

1. **Reads CLAUDE.md** for orchestration instructions
2. **Discovers your project** structure and repositories  
3. **Manages git worktrees** for isolated feature development
4. **Orchestrates specialized agents** through the entire SDLC
5. **Integrates with GitHub** for issue tracking and PRs

## 🚀 Quick Start

```bash
# 1. Clone this repository
git clone https://github.com/yourusername/multi-agent-squad.git
cd multi-agent-squad

# 2. Set up your project structure
mkdir -p projects/{frontend,backend}
cd projects/frontend && git init && cd ../..
cd projects/backend && git init && cd ../..

# 3. Fill out PROJECT.md or run discovery
python scripts/discover-project.py

# 4. Start Claude Code
claude

# Claude will automatically read CLAUDE.md and begin orchestration
```

## 📁 Repository Structure

```
multi-agent-squad/
├── CLAUDE.md                 # Auto-initialization instructions for Claude
├── PROJECT.md               # Your project description (template provided)
├── projects/                # Your actual code repositories (git ignored)
│   ├── frontend/           # Example: React/Vue/Angular app
│   ├── backend/            # Example: API service
│   └── mobile/             # Example: React Native app
├── worktrees/              # Active feature branches (git ignored)
│   └── [repo]/[feature]/   # Isolated development environments
├── .claude/
│   ├── agents/             # Specialized AI agents
│   │   ├── orchestration/  # Prime orchestrator
│   │   ├── product/        # Product management
│   │   ├── architecture/   # System design
│   │   ├── engineering/    # Development
│   │   ├── quality/        # QA and testing
│   │   └── operations/     # DevOps
│   └── commands/           # Custom Claude commands
└── scripts/                # Automation tools
```

## 🎭 Available Agents

### Core Team
- **🎯 Prime Orchestrator** - Coordinates all agents and manages workflows
- **📊 Product Manager** - Creates PRDs and manages requirements
- **🏗️ Solution Architect** - Designs system architecture
- **💻 Senior Backend Engineer** - Builds robust APIs and services
- **🎨 Senior Frontend Engineer** - Creates exceptional user interfaces
- **✅ QA Engineer** - Ensures quality through comprehensive testing
- **🔧 DevOps Engineer** - Manages infrastructure and deployments

## 🛠️ Key Features

### 1. Git Worktree Management
```bash
# Create worktrees for a new feature across multiple repos
./scripts/worktree-manager.sh create-feature auth-system frontend backend

# List all active worktrees
./scripts/worktree-manager.sh list-active

# Clean up merged worktrees
./scripts/worktree-manager.sh cleanup-merged
```

### 2. GitHub Integration
```bash
# Create a feature issue
python scripts/github-integration.py create-issue "user-auth" \
  "Add OAuth authentication" --repos frontend backend

# Create pull requests
python scripts/github-integration.py create-pr backend user-auth --issue 47
```

### 3. Custom Commands
- `/start-feature` - Begin new feature with full orchestration
- `/project-status` - View comprehensive project status
- `/create-agent` - Generate specialized agents
- `/manage-worktrees` - Control git worktrees

## 🔄 Development Workflow

### Starting a New Feature

1. **Tell Claude what you need**
   ```
   "I need to add user authentication with OAuth support"
   ```

2. **Claude orchestrates the team**
   - PM creates requirements
   - Architect designs solution
   - Creates GitHub issue
   - Sets up worktrees
   - Assigns developers
   - Tracks progress

3. **Development happens in isolation**
   - Each repo gets its own worktree
   - Changes are coordinated
   - Tests are automated
   - Reviews are thorough

4. **Seamless integration**
   - PRs are linked to issues
   - Merges are synchronized
   - Worktrees are cleaned up
   - Issues are closed

## 📋 PROJECT.md Configuration

The `PROJECT.md` file tells agents about your project:

```yaml
repositories:
  - name: frontend
    path: ./projects/frontend
    framework: React
    language: TypeScript
    
  - name: backend
    path: ./projects/backend
    framework: FastAPI
    language: Python
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Git 2.5+ (for worktree support)
- Python 3.8+ (for scripts)
- GitHub CLI (optional, for GitHub integration)
- Claude Code

### 2. Initial Setup
```bash
# Run the discovery script to analyze your project
python scripts/discover-project.py

# Or manually edit PROJECT.md
edit PROJECT.md
```

### 3. GitHub Integration (Optional)
```bash
# Install GitHub CLI
brew install gh  # macOS
# or visit: https://cli.github.com/

# Authenticate
gh auth login
```

## 🎯 Example Use Cases

### Full-Stack Feature Development
```
You: "Create a real-time chat feature"
Claude: Orchestrates PM → Architect → Backend (WebSocket) → Frontend (UI) → QA
Result: Coordinated implementation across all repositories
```

### Bug Fix Across Repos
```
You: "Fix the user profile loading issue"
Claude: Creates worktrees → Assigns developers → Fixes → Tests → PRs
Result: Synchronized fix with minimal disruption
```

### Architecture Refactoring
```
You: "Migrate from REST to GraphQL"
Claude: Plans migration → Creates incremental tasks → Manages compatibility
Result: Smooth transition without breaking changes
```

## 🤝 Best Practices

1. **One Feature = One Set of Worktrees**
   - Keep features isolated
   - Clean up after merging

2. **Let Agents Specialize**
   - PM for requirements
   - Architect for design
   - Engineers for implementation

3. **Trust the Orchestration**
   - Claude manages the workflow
   - Agents hand off seamlessly

4. **Keep PROJECT.md Updated**
   - Reflects current state
   - Helps agents understand context

## 🔍 Troubleshooting

### Common Issues

**"Claude doesn't recognize my project"**
- Ensure CLAUDE.md exists
- Run `python scripts/discover-project.py`
- Check PROJECT.md is filled out

**"Worktree creation failed"**
- Ensure you have git 2.5+
- Check repository exists in projects/
- Verify you're on a valid branch

**"GitHub integration not working"**
- Install and authenticate gh CLI
- Check repository permissions
- Verify issue/PR templates

## 📚 Advanced Features

### Custom Agent Creation
```python
# Create a specialized agent for your domain
/create-agent "Blockchain Security Expert" \
  --experience=15 \
  --specialty="Smart Contract Auditing"
```

### Multi-Environment Workflows
- Development worktrees
- Staging branches
- Production deployments
- All orchestrated by agents

### Intelligent Code Reviews
- Multiple agents review different aspects
- Security, performance, and style checks
- Automated feedback incorporation

## 🛡️ Security & Best Practices

- **Isolated Development** - Worktrees prevent cross-contamination
- **Access Control** - Each repo can have different permissions  
- **Automated Security Scans** - Built into CI/CD pipeline
- **Code Review Requirements** - Enforced by orchestration

## 🤖 How It Works

1. **CLAUDE.md** provides Claude with initialization instructions
2. **PROJECT.md** describes your specific project
3. **Agents** have specialized expertise and experience
4. **Orchestrator** coordinates everything
5. **Worktrees** isolate development
6. **GitHub** tracks progress

## 🎉 Benefits

- **10x Faster Development** - Parallel work across repos
- **Higher Quality** - Multiple specialized reviews
- **Better Coordination** - Automated orchestration
- **Clean Git History** - Isolated feature branches
- **Full Visibility** - GitHub integration

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

Inspired by modern software development best practices and the need for better AI-assisted development workflows.

---

**Ready to supercharge your development?** Start Claude Code in this directory and let the Multi-Agent Squad transform how you build software!