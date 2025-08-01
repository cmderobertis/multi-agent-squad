# Claude Code Agent Generator

A focused system for generating project-specific Claude Code agents based on your project's needs.

## Overview

This tool helps you create specialized agents for Claude Code that understand your project's context, technology stack, and specific requirements. Instead of generic agents, you get tailored assistants that follow your coding standards and practices.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-agent-squad
   ```

2. **Describe your project**
   Edit `PROJECT.md` with your project details:
   ```bash
   # Edit the project description
   edit PROJECT.md
   ```

3. **Generate agents**
   ```bash
   python scripts/generate-agents.py
   ```

4. **Use your agents**
   - Find generated agents in `.claude/agents/`
   - Copy agent content to start a Claude Code session
   - Each agent is specialized for specific tasks

## How It Works

### 1. Project Description
Fill out `PROJECT.md` with:
- Project name and type
- Technology stack
- Development workflow
- Current challenges
- Required agent types

### 2. Agent Generation
The generator:
- Parses your project information
- Asks clarifying questions
- Determines needed agents
- Creates specialized agents from templates

### 3. Agent Usage
Generated agents include:
- Clear role definitions
- Project-specific context
- Relevant guidelines
- Best practices for your stack

## Available Templates

### Developer Agents
- `developer.md` - Generic developer template
- `python-developer.md` - Python-specific development
- `javascript-developer.md` - JavaScript/TypeScript development

### Specialized Agents
- `architect.md` - System design and architecture
- `tester.md` - Testing and quality assurance
- `reviewer.md` - Code review and quality checks

### Generic Template
- `generic.md` - Base template for custom agents

## Project Structure

```
.
├── PROJECT.md              # Your project description
├── scripts/
│   └── generate-agents.py  # Agent generator script
├── templates/              # Agent templates
│   ├── developer.md
│   ├── architect.md
│   ├── tester.md
│   └── ...
├── .claude/
│   └── agents/            # Generated agents (Claude Code native)
└── docs/
    └── AGENT_GUIDELINES.md # Guide for creating effective agents
```

## Creating Custom Templates

1. Add new templates to `templates/` directory
2. Use placeholders:
   - `{{PROJECT_NAME}}` - Project name
   - `{{PROJECT_TYPE}}` - Project type
   - `{{LANGUAGE}}` - Primary language
   - `{{FRAMEWORK}}` - Framework
   - `{{AGENT_NAME}}` - Generated agent name

3. Follow the structure:
   - Role definition
   - Project context
   - Core responsibilities
   - Guidelines and best practices

## Best Practices

### For Project Description
- Be specific about your tech stack
- List actual challenges you face
- Check all applicable agent requirements
- Include your coding standards

### For Agent Usage
- Use one agent per task type
- Keep agents focused on their role
- Update agents as project evolves
- Combine agents for complex tasks

## Examples

### Example: Web Application Project
```markdown
# PROJECT.md
Project Name: E-commerce Platform
Project Type: Web Application
Primary Language: Python
Framework: Django + React
...
```

Generated agents:
- `ecommerce-platform-python-developer.md`
- `ecommerce-platform-architect.md`
- `ecommerce-platform-tester.md`

### Example: API Service Project
```markdown
# PROJECT.md
Project Name: Payment API
Project Type: API Service
Primary Language: Node.js
Framework: Express
...
```

Generated agents:
- `payment-api-javascript-developer.md`
- `payment-api-api-designer.md`
- `payment-api-security.md`

## Tips for Effective Agents

1. **Keep agents focused** - One role per agent
2. **Include context** - Project-specific information
3. **Be prescriptive** - Clear dos and don'ts
4. **Update regularly** - As project evolves

## Contributing

To add new agent templates:
1. Create template in `templates/`
2. Update generator mappings in `generate-agents.py`
3. Document in guidelines

## License

[Your license here]

---

**Note**: This tool is designed specifically for Claude Code's native agent system. Place generated agents in `.claude/agents/` for Claude Code to recognize them.