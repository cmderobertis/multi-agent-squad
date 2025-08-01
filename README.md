# Multi-Agent Squad 🤖

An intelligent orchestration system for Claude Code that adapts to your project structure and manages development through specialized AI agents.

## 🌟 Overview

Multi-Agent Squad transforms Claude Code into a complete software development team. Simply start Claude in this directory, and it will:

1. **Ask you about your project** through natural conversation
2. **Create the perfect structure** based on your needs
3. **Set up specialized agents** for your project type
4. **Orchestrate development** through the entire lifecycle
5. **Integrate with your tools** (GitHub, Jira, etc.)

## 🚀 Quick Start

```bash
# 1. Clone this repository
git clone https://github.com/yourusername/multi-agent-squad.git
cd multi-agent-squad

# 2. Start Claude Code
claude

# 3. Start the orchestration with ONE of these commands:
/project          # Recommended: Start project orchestration
"Start project"   # Natural language also works
"Help me set up"  # Any variation works
```

The `/project` command triggers the complete orchestration setup!

## 🎯 How It Works

### First Time Setup

When you start Claude, it will ask you:

1. **"What are you building?"** - Describe your project
2. **"Is this new or existing?"** - It adapts accordingly  
3. **"Monorepo or multi-repo?"** - Your choice
4. **"How do you track tasks?"** - GitHub, Jira, or manual
5. **"Where should docs go?"** - Flexible documentation

Claude then creates the perfect structure for YOUR project.

### Flexible Structure Examples

#### For a Multi-Repo Web App
```
your-project/
├── CLAUDE.md          # Orchestration instructions
├── PROJECT.md         # Your project details
├── projects/          # Your repos (you manage these)
│   ├── frontend/      # Your React app
│   └── backend/       # Your API
├── docs/              # All documentation
└── .claude/agents/    # Your AI team
```

#### For a Monorepo
```
your-project/
├── CLAUDE.md          # Orchestration instructions
├── PROJECT.md         # Your project details
├── src/               # All your code
│   ├── frontend/
│   ├── backend/
│   └── shared/
├── docs/              # Documentation
└── .claude/agents/    # Your AI team
```

#### For a Documentation Project
```
your-project/
├── CLAUDE.md          # Orchestration instructions
├── PROJECT.md         # Project details
├── docs/              # All documentation
│   ├── architecture/
│   ├── guides/
│   └── api/
└── .claude/agents/    # Documentation-focused agents
```

## 🎭 Your AI Development Team

Based on your project, Claude will suggest relevant agents:

### For Full-Stack Projects
- **🎯 Prime Orchestrator** - Manages the entire workflow
- **📊 Product Manager** - Requirements and user stories
- **🏗️ Solution Architect** - System design
- **💻 Backend Engineer** - API development
- **🎨 Frontend Engineer** - User interface
- **✅ QA Engineer** - Testing
- **🔧 DevOps Engineer** - Deployment

### For API Projects
- **🏗️ API Architect** - API design
- **💻 Backend Engineer** - Implementation
- **📖 API Documentation Specialist** - Docs
- **✅ API Test Engineer** - Testing

### For Documentation Projects
- **📝 Technical Writer** - Documentation
- **🏗️ Information Architect** - Structure
- **👁️ Documentation Reviewer** - Quality

## 🛠️ Key Features

### Natural Language Control
Just talk to Claude normally:
- "I need to add user authentication"
- "Help me set up CI/CD"
- "Create API documentation"
- "Review our architecture"

### Intelligent Automation (Hooks)
Tell Claude what you want automated:
- **"I forget to run tests"** → Auto-runs tests for you
- **"Remind me of daily standups"** → 9 AM reminders
- **"Check my writing for errors"** → Auto grammar check
- **"Track my progress"** → Automatic progress logs
- Hooks are created based on YOUR needs, not pre-configured

### Extensive Integrations
- **Project Management** - GitHub, Jira, Linear, Azure DevOps, ClickUp
- **Communication** - Slack, Teams, Discord, Email notifications
- **Documentation** - Confluence, Notion, GitHub Wiki
- **CI/CD** - GitHub Actions, Jenkins, GitLab CI, CircleCI
- **Monitoring** - Sentry, Datadog, Prometheus, New Relic
- **Testing** - BrowserStack, SonarQube, Cypress
- **Time Tracking** - Toggl, Harvest, Clockify

### MCP Server Support
Extend Claude's capabilities with Model Context Protocol servers:
- **Database Explorer** - Query and explore PostgreSQL databases
- **Advanced GitHub** - Deep integration beyond CLI
- **Memory Server** - Persistent context across sessions
- **Test Runner** - Execute and monitor test suites
- **Container Management** - Docker and Kubernetes control
- **Custom Servers** - Create your own for proprietary tools

### Smart Development Workflow
1. **Requirements** → PM agent creates specs
2. **Design** → Architect creates system design
3. **Implementation** → Engineers build it
4. **Testing** → QA ensures quality
5. **Deployment** → DevOps handles release

### Git Worktree Support (Optional)
For multi-repo projects with parallel development:
```bash
./scripts/worktree-manager.sh create-feature auth frontend backend
```

## 📋 No Complex Setup Required

Unlike other tools, Multi-Agent Squad:
- ✅ **No installation process** - Just clone and start
- ✅ **No configuration files** - Claude asks what you need
- ✅ **No forced structure** - Adapts to your preferences
- ✅ **No learning curve** - Plain English control

## 🔧 System Requirements

### Required
- **Git** - For version control
- **Claude Code** - The AI interface

### Optional
- **GitHub CLI** (`gh`) - For GitHub integration
- **Python 3.8+** - For automation scripts
- **Jira API Token** - For Jira integration

Claude will check what you have and work with it!

## 🎯 Example Workflows

### Starting a New SaaS Product
```
You: "I want to build a SaaS product for team collaboration"
Claude: "Great! Is this a new project?"
You: "Yes, brand new"
Claude: "Will you use separate repos for frontend and backend?"
You: "Yes, we prefer separate repos"
Claude: [Creates structure, suggests agents, begins planning]
```

### Organizing an Existing Project
```
You: "I have a messy React app that needs organization"
Claude: "I'll help! Where is your code currently?"
You: "Everything is in a src folder"
Claude: "Is this just frontend or do you have backend too?"
You: [Continues with reorganization]
```

### Documentation Project
```
You: "We need to document our API"
Claude: "I'll set up a documentation project. Do you have existing docs?"
You: "Some scattered markdown files"
Claude: [Creates doc structure, organizes existing content]
```

## 🤝 Integration Options

Multi-Agent Squad supports 30+ integrations across all aspects of agile development:

### Quick Integration Setup
```bash
# Interactive integration setup
python scripts/integration-setup.py

# Set up MCP servers for enhanced capabilities
python scripts/mcp-server-setup.py

# Configure specific agile tools
python scripts/agile-tools-setup.py
```

### Popular Integrations

#### Project Management
- **GitHub** - Issues, PRs, Projects (via `gh` CLI)
- **Jira** - Full sprint and epic management
- **Linear** - Modern issue tracking
- **Azure DevOps** - Enterprise agile tools

#### Communication
- **Slack** - Real-time notifications and updates
- **Microsoft Teams** - Enterprise communication
- **Email** - Digests and critical alerts

#### Development Tools
- **MCP Servers** - Direct database access, enhanced file operations
- **CI/CD** - GitHub Actions, Jenkins, GitLab CI
- **Monitoring** - Sentry, Datadog, Prometheus
- **Testing** - Automated test runners, quality gates

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the complete list and setup instructions.

## 📚 Advanced Features

### Custom Agent Creation
```
You: "I need an agent who understands blockchain"
Claude: [Creates specialized blockchain agent]
```

### MCP Server Capabilities
```
You: "Show me all users in the database"
Claude: [Uses PostgreSQL MCP server to query directly]

You: "What's our test coverage trend?"
Claude: [Uses Analytics MCP server to show metrics]
```

### Multi-Environment Support
- Development
- Staging  
- Production
- All managed through conversation

### Automated Workflows
- Code review orchestration
- Deployment pipelines
- Documentation updates
- Sprint ceremonies
- All through plain English

### Critical Decision Gates
Claude always asks permission for:
- Production deployments
- Database migrations
- Security changes
- Main branch merges
- Resource deletion

## 🛡️ Philosophy

Multi-Agent Squad believes in:
- **Flexibility** - Your project, your way
- **Simplicity** - No complex commands or configs
- **Intelligence** - Agents with real expertise
- **Adaptability** - Works with what you have
- **Transparency** - Clear, documented decisions

## 🚦 Getting Help

Just ask Claude:
- "How do I add a new feature?"
- "What agents do I have?"
- "Show me the project status"
- "Help me with deployment"

## 📄 License

MIT License - see LICENSE file

## 🙏 Contributing

We welcome contributions! The best way to contribute is to use the system and share your experience.

---

**Ready to start?** Just `cd` into this directory and start Claude Code. No installation, no configuration, just natural conversation to build amazing software!

*Multi-Agent Squad: Where AI meets human creativity to build exceptional software.*