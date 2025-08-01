# Project Description

Fill out this template to help the Multi-Agent Squad understand your project and generate appropriate agents.

## Project Overview

**Project Name:** [Your Project Name]

**Project Type:** (Check all that apply)
- [ ] Web Application (Full Stack)
- [ ] API Service (Backend Only)
- [ ] Mobile Application
- [ ] Desktop Application
- [ ] Data Platform
- [ ] Machine Learning System
- [ ] Microservices Architecture
- [ ] Monolithic Application
- [ ] Library/Framework
- [ ] Other: _______________

**Project Description:** (2-3 sentences about what you're building)
```
[Describe your project's purpose and main features]
```

**Target Users:**
```
[Who will use this? Developers, consumers, businesses?]
```

**Success Criteria:**
```
[What defines success for this project?]
```

## Repository Structure

**Repository Type:**
- [ ] Multi-Repository (Recommended for complex projects)
- [ ] Monorepo
- [ ] Single Repository

**Repositories:** (List each repository and its purpose)
```yaml
repositories:
  - name: frontend
    path: ./projects/frontend
    description: React/Vue/Angular web application
    primary_language: TypeScript
    framework: React
    
  - name: backend
    path: ./projects/backend
    description: REST API service
    primary_language: Python
    framework: FastAPI
    
  - name: mobile
    path: ./projects/mobile
    description: Mobile application
    primary_language: TypeScript
    framework: React Native
    
  # Add more repositories as needed
```

## Technology Stack

**Frontend:**
- Framework: [React/Vue/Angular/Other]
- Language: [TypeScript/JavaScript]
- State Management: [Redux/MobX/Vuex/Other]
- UI Library: [Material-UI/Ant Design/Bootstrap/Other]
- Build Tool: [Webpack/Vite/Parcel/Other]

**Backend:**
- Language: [Python/Node.js/Go/Java/Other]
- Framework: [Django/FastAPI/Express/Spring/Other]
- Database: [PostgreSQL/MySQL/MongoDB/Other]
- Cache: [Redis/Memcached/Other]
- Message Queue: [RabbitMQ/Kafka/SQS/Other]

**Infrastructure:**
- Cloud Provider: [AWS/GCP/Azure/Other]
- Container: [Docker/Kubernetes/Other]
- CI/CD: [GitHub Actions/Jenkins/GitLab CI/Other]
- Monitoring: [Prometheus/DataDog/New Relic/Other]

**Development Tools:**
- Version Control: [Git]
- Package Manager: [npm/yarn/pip/cargo/Other]
- Testing Framework: [Jest/Pytest/JUnit/Other]
- Linting: [ESLint/Pylint/Other]

## Development Workflow

**Git Workflow:**
- [ ] Feature Branches (feature/*)
- [ ] GitFlow (develop, release/*, hotfix/*)
- [ ] GitHub Flow (main + feature branches)
- [ ] Custom: _______________

**Code Review Process:**
- [ ] All changes require PR review
- [ ] Senior engineer approval needed
- [ ] Automated tests must pass
- [ ] Security scan required
- [ ] Performance benchmarks

**Deployment Strategy:**
- [ ] Continuous Deployment (auto-deploy main)
- [ ] Continuous Delivery (manual approval)
- [ ] Release Trains
- [ ] Feature Flags
- [ ] Blue-Green Deployment
- [ ] Canary Releases

## Team Structure

**Team Size:** [Number of developers]

**Roles Needed:** (Check all that apply)
- [ ] Product Owner/Manager
- [ ] Technical Lead
- [ ] Solution Architect
- [ ] Backend Engineers
- [ ] Frontend Engineers
- [ ] Full Stack Engineers
- [ ] DevOps Engineers
- [ ] QA Engineers
- [ ] Security Engineers
- [ ] Data Engineers
- [ ] ML Engineers
- [ ] UX/UI Designers

**Current Phase:**
- [ ] Planning/Design
- [ ] MVP Development
- [ ] Alpha/Beta
- [ ] Production
- [ ] Maintenance

## Integration Requirements

**GitHub Integration:**
- [ ] Create issues for features/bugs
- [ ] Automated PR creation
- [ ] Link commits to issues
- [ ] Update project board
- [ ] Status reporting

**GitHub Details:** (If using GitHub integration)
```yaml
github:
  organization: [your-org]
  project_board: [project-url]
  issue_labels:
    - feature
    - bug
    - enhancement
    - documentation
  auto_assign: true
  require_reviews: 2
```

**Other Integrations:**
- [ ] Slack notifications
- [ ] JIRA sync
- [ ] Linear sync
- [ ] Custom webhooks

## Current Challenges

**Technical Challenges:**
```
1. [e.g., Scaling to handle 1M users]
2. [e.g., Reducing API latency below 100ms]
3. [e.g., Implementing real-time features]
```

**Process Challenges:**
```
1. [e.g., Long PR review cycles]
2. [e.g., Inconsistent coding standards]
3. [e.g., Lack of automated testing]
```

## Agent Requirements

**Essential Agents:** (These will be created first)
- [ ] Prime Orchestrator (Coordinates all work)
- [ ] Product Manager (Requirements & priorities)
- [ ] Solution Architect (System design)
- [ ] Lead Developer (Code quality & standards)
- [ ] QA Engineer (Testing strategy)

**Specialized Agents:** (Based on your project needs)
- [ ] Frontend Specialist
- [ ] Backend Specialist
- [ ] Database Expert
- [ ] DevOps Engineer
- [ ] Security Expert
- [ ] Performance Engineer
- [ ] API Designer
- [ ] Mobile Developer
- [ ] Data Engineer
- [ ] ML Engineer

**Custom Agents:** (Specific to your domain)
```
1. [e.g., Trading Systems Expert - for fintech]
2. [e.g., Healthcare Compliance Specialist - for healthtech]
3. [e.g., Game Engine Developer - for gaming]
```

## Coding Standards

**Style Guides:**
- Frontend: [e.g., Airbnb JavaScript Style Guide]
- Backend: [e.g., PEP 8 for Python]
- Documentation: [e.g., JSDoc, Sphinx]

**Code Quality Requirements:**
- Minimum test coverage: [e.g., 80%]
- Maximum cyclomatic complexity: [e.g., 10]
- Required documentation: [e.g., All public APIs]

**Security Requirements:**
- [ ] OWASP Top 10 compliance
- [ ] Security scanning in CI/CD
- [ ] Dependency vulnerability checks
- [ ] Code signing
- [ ] Secrets management

## Additional Context

**Domain-Specific Knowledge:**
```
[Any industry-specific requirements or terminology the agents should know]
```

**Existing Documentation:**
```
[Links or paths to existing documentation, architecture diagrams, etc.]
```

**Reference Projects:**
```
[Similar projects or competitors for context]
```

**Special Considerations:**
```
[Anything else the agents should know about your project]
```

---

## Quick Start Checklist

Before generating agents, ensure you've:
- [ ] Filled out project overview
- [ ] Listed all repositories
- [ ] Specified technology stack
- [ ] Defined workflow preferences
- [ ] Selected required agents
- [ ] Added any domain-specific context

Once complete, run `python scripts/generate-agents.py` to create your custom agent squad!