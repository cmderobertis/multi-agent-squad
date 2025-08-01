#!/usr/bin/env python3
"""
Claude Code Agent Generator
Generates appropriate agents based on project needs
"""

import os
import sys
import yaml
import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

class AgentGenerator:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.agents_dir = self.base_path / ".claude" / "agents"
        self.templates_dir = self.base_path / "templates"
        self.project_file = self.base_path / "PROJECT.md"
        
    def parse_project_file(self) -> Dict:
        """Parse PROJECT.md to extract project information"""
        if not self.project_file.exists():
            print("Error: PROJECT.md not found. Please create it first.")
            sys.exit(1)
            
        with open(self.project_file, 'r') as f:
            content = f.read()
            
        project_info = {
            'name': self._extract_field(content, 'Project Name'),
            'type': self._extract_field(content, 'Project Type'),
            'language': self._extract_field(content, 'Primary Language'),
            'framework': self._extract_field(content, 'Framework'),
            'database': self._extract_field(content, 'Database'),
            'testing': self._extract_field(content, 'Testing'),
            'challenges': self._extract_field(content, 'Current Challenges'),
            'requirements': self._extract_requirements(content),
            'style_guide': self._extract_field(content, 'Style Guide'),
        }
        
        return project_info
    
    def _extract_field(self, content: str, field: str) -> str:
        """Extract a field value from the markdown content"""
        pattern = rf'\*\*{field}\*\*: (.+?)(?:\n|$)'
        match = re.search(pattern, content)
        if match:
            return match.group(1).strip()
        
        # Try section headers
        pattern = rf'## {field}\n(.+?)(?:\n\n|$)'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        return ""
    
    def _extract_requirements(self, content: str) -> List[str]:
        """Extract checked requirements from the Agent Requirements section"""
        requirements = []
        pattern = r'- \[x\] (.+?)(?:\n|$)'
        matches = re.findall(pattern, content)
        requirements.extend(matches)
        return requirements
    
    def ask_clarifying_questions(self, project_info: Dict) -> Dict:
        """Ask user for any missing or unclear information"""
        print("\n=== Claude Code Agent Generator ===\n")
        
        if not project_info['name']:
            project_info['name'] = input("What is your project name? ").strip()
        
        if not project_info['type']:
            print("\nProject types: Web App, API, CLI, Library, Mobile App, Desktop App, Other")
            project_info['type'] = input("What type of project is this? ").strip()
        
        if not project_info['language']:
            project_info['language'] = input("What is the primary programming language? ").strip()
        
        if not project_info['requirements']:
            print("\nWhat tasks do you need help with? (comma-separated)")
            print("Options: implementation, architecture, review, testing, docs, refactoring, performance, security, debugging")
            requirements = input("Tasks: ").strip()
            project_info['requirements'] = [r.strip() for r in requirements.split(',')]
        
        print(f"\nGenerating agents for: {project_info['name']}")
        print(f"Type: {project_info['type']}")
        print(f"Language: {project_info['language']}")
        print(f"Tasks: {', '.join(project_info['requirements'])}")
        
        confirm = input("\nProceed with agent generation? (y/n): ").strip().lower()
        if confirm != 'y':
            print("Agent generation cancelled.")
            sys.exit(0)
            
        return project_info
    
    def determine_agents(self, project_info: Dict) -> List[Dict]:
        """Determine which agents to create based on project needs"""
        agents = []
        
        # Map requirements to agent types
        agent_mapping = {
            'implementation': ['developer', 'builder'],
            'architecture': ['architect', 'designer'],
            'review': ['reviewer', 'quality'],
            'testing': ['tester', 'qa'],
            'docs': ['documenter', 'technical-writer'],
            'refactoring': ['refactorer', 'optimizer'],
            'performance': ['performance', 'optimizer'],
            'security': ['security', 'auditor'],
            'debugging': ['debugger', 'troubleshooter'],
            'api design': ['api-designer', 'architect'],
            'database design': ['database-architect', 'data-modeler'],
            'devops': ['devops', 'infrastructure']
        }
        
        # Determine agents based on requirements
        selected_agents = set()
        for req in project_info['requirements']:
            req_lower = req.lower()
            for key, agent_types in agent_mapping.items():
                if key in req_lower:
                    selected_agents.update(agent_types)
        
        # Always include a primary developer agent for the language
        if project_info['language']:
            lang = project_info['language'].lower()
            if 'python' in lang:
                selected_agents.add('python-developer')
            elif 'javascript' in lang or 'typescript' in lang:
                selected_agents.add('javascript-developer')
            elif 'java' in lang:
                selected_agents.add('java-developer')
            elif 'go' in lang:
                selected_agents.add('go-developer')
            else:
                selected_agents.add('developer')
        
        # Convert to agent definitions
        for agent_type in selected_agents:
            agents.append({
                'type': agent_type,
                'name': f"{project_info['name'].lower().replace(' ', '-')}-{agent_type}",
                'project_info': project_info
            })
        
        return agents
    
    def load_template(self, agent_type: str) -> Optional[str]:
        """Load agent template if it exists"""
        template_file = self.templates_dir / f"{agent_type}.md"
        if template_file.exists():
            with open(template_file, 'r') as f:
                return f.read()
        
        # Try generic templates
        if 'developer' in agent_type:
            generic_file = self.templates_dir / "developer.md"
        elif 'architect' in agent_type:
            generic_file = self.templates_dir / "architect.md"
        elif 'test' in agent_type or 'qa' in agent_type:
            generic_file = self.templates_dir / "tester.md"
        else:
            generic_file = self.templates_dir / "generic.md"
        
        if generic_file.exists():
            with open(generic_file, 'r') as f:
                return f.read()
        
        return None
    
    def generate_agent(self, agent: Dict) -> str:
        """Generate agent content from template or create custom"""
        template = self.load_template(agent['type'])
        
        if template:
            # Replace placeholders in template
            content = template
            content = content.replace('{{PROJECT_NAME}}', agent['project_info']['name'])
            content = content.replace('{{PROJECT_TYPE}}', agent['project_info']['type'])
            content = content.replace('{{LANGUAGE}}', agent['project_info']['language'])
            content = content.replace('{{FRAMEWORK}}', agent['project_info']['framework'])
            content = content.replace('{{STYLE_GUIDE}}', agent['project_info']['style_guide'])
            content = content.replace('{{AGENT_NAME}}', agent['name'])
            content = content.replace('{{TIMESTAMP}}', datetime.now().isoformat())
            
            return content
        else:
            # Generate default agent
            return self.generate_default_agent(agent)
    
    def generate_default_agent(self, agent: Dict) -> str:
        """Generate a default agent when no template exists"""
        agent_type = agent['type'].replace('-', ' ').title()
        project = agent['project_info']
        
        content = f"""# {agent_type} Agent

## Role
You are a specialized {agent_type} for the {project['name']} project.

## Project Context
- **Type**: {project['type']}
- **Language**: {project['language']}
- **Framework**: {project['framework']}
- **Testing**: {project['testing']}

## Responsibilities
"""
        
        # Add type-specific responsibilities
        if 'developer' in agent['type']:
            content += """- Implement features according to project requirements
- Write clean, maintainable code following project standards
- Ensure code is properly tested and documented
- Optimize for performance and readability
"""
        elif 'architect' in agent['type']:
            content += """- Design system architecture and components
- Make technology decisions aligned with project goals
- Ensure scalability and maintainability
- Document architectural decisions
"""
        elif 'test' in agent['type'] or 'qa' in agent['type']:
            content += """- Write comprehensive test cases
- Ensure code coverage meets project standards
- Identify and report bugs
- Validate functionality against requirements
"""
        elif 'review' in agent['type']:
            content += """- Review code for quality and standards compliance
- Provide constructive feedback
- Ensure best practices are followed
- Check for security vulnerabilities
"""
        
        content += f"""
## Guidelines
- Always follow the project's coding standards
- Consider the existing codebase patterns
- Prioritize clarity and maintainability
- Test your changes thoroughly

## Style Guide
{project['style_guide'] if project['style_guide'] else 'Follow language-specific best practices'}

---
Generated: {datetime.now().isoformat()}
"""
        
        return content
    
    def create_agents(self, agents: List[Dict]):
        """Create agent files in the .claude/agents directory"""
        self.agents_dir.mkdir(parents=True, exist_ok=True)
        
        created_agents = []
        
        for agent in agents:
            agent_file = self.agents_dir / f"{agent['name']}.md"
            content = self.generate_agent(agent)
            
            with open(agent_file, 'w') as f:
                f.write(content)
            
            created_agents.append(agent_file)
            print(f"Created: {agent_file.relative_to(self.base_path)}")
        
        return created_agents
    
    def create_agent_index(self, agents: List[Dict]):
        """Create an index file listing all agents"""
        index_file = self.agents_dir / "README.md"
        
        content = f"""# Project Agents

Generated agents for {agents[0]['project_info']['name']} project.

## Available Agents

"""
        
        for agent in agents:
            agent_type = agent['type'].replace('-', ' ').title()
            content += f"- **[{agent['name']}](./{agent['name']}.md)** - {agent_type}\n"
        
        content += f"""
## Usage

To use an agent in Claude Code:
1. Open the agent file in your editor
2. Copy the agent instructions
3. Start a new Claude Code session with those instructions

## Regenerating Agents

To regenerate or update agents:
```bash
python scripts/generate-agents.py
```

---
Generated: {datetime.now().isoformat()}
"""
        
        with open(index_file, 'w') as f:
            f.write(content)
        
        print(f"\nCreated agent index: {index_file.relative_to(self.base_path)}")
    
    def run(self):
        """Main execution flow"""
        # Parse project file
        project_info = self.parse_project_file()
        
        # Ask clarifying questions if needed
        project_info = self.ask_clarifying_questions(project_info)
        
        # Determine which agents to create
        agents = self.determine_agents(project_info)
        
        if not agents:
            print("No agents to generate based on requirements.")
            return
        
        print(f"\nGenerating {len(agents)} agents...")
        
        # Create agent files
        self.create_agents(agents)
        
        # Create index
        self.create_agent_index(agents)
        
        print("\nAgent generation complete!")
        print(f"Agents created in: {self.agents_dir.relative_to(self.base_path)}")


if __name__ == "__main__":
    generator = AgentGenerator()
    generator.run()