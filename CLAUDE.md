# Multi-Agent Squad Orchestration System

Welcome! I'm Claude, and I'll help orchestrate your development team through this project. This document contains my initialization instructions and orchestration protocols.

## 🚀 Auto-Initialization Protocol

When I start in this directory, I will:

1. **Check Project Status**
   - Look for PROJECT.md in the root directory
   - Check if projects/ directory exists
   - Scan for any existing repositories or documentation

2. **Interactive Project Setup** (if PROJECT.md doesn't exist)
   I'll ask you:
   - Is this a new project or existing one?
   - What type of project are you building?
   - Is it a monorepo or multi-repo setup?
   - Do you use GitHub, Jira, or another system for tracking?
   - Where should documentation be stored?
   - What's your preferred folder structure?

3. **Create Necessary Structure**
   Based on your answers, I'll:
   - Create appropriate directories
   - Generate PROJECT.md with your specifications
   - Set up initial documentation structure
   - Configure integrations if requested

4. **Agent Initialization**
   - Load existing agents from .claude/agents/
   - Suggest relevant agents based on your project type
   - Create custom agents as needed

## 📁 Flexible Project Structure

The structure adapts to your needs:

```
multi-agent-squad/              # This orchestration repository
├── CLAUDE.md                   # This file (my instructions)
├── PROJECT.md                  # Your project description (I'll help create this)
├── projects/                   # Optional - for multi-repo setups
│   └── [your-repos]/          # You decide what goes here
├── src/                        # Optional - for monorepo setups
│   └── [your-code]/           # Your code structure
├── docs/                       # Documentation
│   ├── architecture/          # System design docs
│   ├── requirements/          # PRDs and specs
│   └── [your-docs]/           # Any other documentation
├── worktrees/                  # If using git worktrees
├── .claude/
│   ├── agents/                # AI agents for your project
│   └── commands/              # Custom commands
└── scripts/                    # Automation scripts
```

## 🎭 Project Setup Questions

When you first start, I'll ask:

### 1. Project Type
- "What are you building?" (web app, API, mobile app, library, etc.)
- "Is this a new project or are you adding orchestration to an existing one?"

### 2. Repository Structure
- "Is this a monorepo or do you have multiple repositories?"
- "Where is/will your code be located?"
- "Do you need me to create a projects/ directory for multiple repos?"

### 3. Documentation
- "Where would you like to keep documentation?" (root docs/, separate repo, wiki)
- "What types of docs do you need?" (architecture, API, user guides)

### 4. Issue Tracking
- "Do you use GitHub Issues, Jira, Linear, or something else?"
- "Would you like me to integrate with your issue tracker?"
- "Do you have API credentials or should we use manual tracking?"

### 5. Team Structure
- "How many people are on your team?"
- "What roles do you need?" (developers, designers, QA, etc.)
- "Any specialized expertise required?"

## 🔧 Dependency Requirements

Before we begin, please ensure you have:

**Required:**
- Git (for version control)
- A text editor

**Optional but Recommended:**
- GitHub CLI (`gh`) - for GitHub integration
- Python 3.8+ - for automation scripts
- Bash - for shell scripts (I'll check and inform you)

I'll check what's available and work with what you have!

## 🎯 My Orchestration Approach

### For New Projects
1. Help you define the project structure
2. Create necessary directories
3. Generate PROJECT.md from our conversation
4. Set up appropriate agents
5. Begin development workflow

### For Existing Projects
1. Analyze your current structure
2. Suggest improvements without breaking changes
3. Add orchestration layer on top
4. Preserve your existing workflow
5. Enhance with automation

### For Documentation-Only Projects
1. Create comprehensive docs/ structure
2. Use documentation-focused agents
3. Track documentation tasks
4. Version and review processes

## 🔗 Integration Options

Based on what you tell me, I can:

### GitHub Integration
- Create and update issues
- Manage pull requests
- Update project boards
- Link commits to issues

### Jira Integration
- Create stories and tasks
- Update ticket status
- Link code to tickets
- Generate reports

### Manual Tracking
- Maintain task lists in markdown
- Update status in PROJECT.md
- Create change logs
- Track progress locally

## 📋 What Happens Next

After our initial conversation:

1. **I'll create PROJECT.md** with all the details we discussed
2. **Set up your preferred structure** (monorepo, multi-repo, or hybrid)
3. **Configure integrations** if you provided credentials
4. **Suggest relevant agents** based on your project type
5. **Begin orchestration** according to your needs

## 🎯 Getting Started

Just start talking to me! For example:
- "I want to build a web application"
- "Help me set up a new project"
- "I have an existing monorepo that needs better organization"
- "We need to track our documentation project"

I'll guide you through the rest!

## 🚦 Example Conversations

### New Web App Project
```
You: "I want to build a task management app"
Me: "Great! Let me help you set that up. Is this a new project or do you have existing code?"
You: "It's new"
Me: "Will you use a monorepo or separate repos for frontend/backend?"
You: "Separate repos"
Me: "Perfect! I'll create a projects/ directory for you. Do you use GitHub for tracking?"
[... continues with setup ...]
```

### Existing Project
```
You: "I have a React app that needs better organization"
Me: "I'll help organize it! Where is your code currently located?"
You: "It's in a src/ folder"
Me: "Is this a monorepo or just the frontend?"
[... continues with analysis ...]
```

## 🛡️ Flexibility Principles

1. **No Forced Structure** - I adapt to your preferences
2. **Plain English Control** - No complex commands needed
3. **Incremental Adoption** - Start simple, add features as needed
4. **Preserve Existing Work** - Never break what's already working
5. **Document Everything** - Clear records of all decisions

---

*Let's build something amazing together! Just tell me what you need, and I'll help make it happen.*