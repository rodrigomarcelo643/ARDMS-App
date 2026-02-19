# Contributing to MedSIS App 🤝

<!-- Contribution Badges -->
<div align="center" style="margin-bottom: 30px;">
  <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge" alt="Contributions Welcome" />
  <img src="https://img.shields.io/badge/PRs-Welcome-blue?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Code%20Review-Required-orange?style=for-the-badge" alt="Code Review" />
  <img src="https://img.shields.io/badge/Tests-100%25-success?style=for-the-badge" alt="Tests Required" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License" />
</div>

Thank you for your interest in contributing to MedSIS App! This document provides guidelines and instructions for contributing to the Medical Student Information System.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Process](#contribution-process)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. By participating in this project, you agree to:

- ✅ Be respectful and professional
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other contributors
- ✅ Maintain confidentiality of student data

### Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Trolling or insulting comments
- ❌ Publishing private information without permission
- ❌ Unauthorized access to student data
- ❌ Any conduct violating the Data Privacy Act of 2012

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

```bash
# Required Software
- Node.js (v18 or higher)
- npm or yarn
- Git
- Expo CLI
- Android Studio / Xcode (for mobile testing)
- TypeScript knowledge
- React Native experience
```

### Repository Access

**For Authorized Contributors:**
1. Request access from the MSIS Development Team
2. Sign the Contributor License Agreement (CLA)
3. Receive repository access credentials

**Contact:** dev@msis.eduisync.io

## 💻 Development Setup

### 1. Fork the Repository

```bash
# Note: Forking requires authorization
# Contact dev@msis.eduisync.io for access
```

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/MedSIS-App.git
cd MedSIS-App
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/MSIS-Official/MedSIS-App.git
git remote -v
```

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Add required environment variables
EXPO_PUBLIC_API_URL=your_api_url
```

### 6. Start Development Server

```bash
npx expo start
```

## 🔄 Contribution Process

### Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTRIBUTION WORKFLOW                     │
└─────────────────────────────────────────────────────────────┘

1. 🔍 IDENTIFY ISSUE
   ↓
   - Check existing issues
   - Create new issue if needed
   - Get issue assigned to you
   ↓
2. 🔱 CREATE BRANCH
   ↓
   - Fork repository (if not done)
   - Create feature/fix branch
   - Follow naming conventions
   ↓
3. 💻 DEVELOP
   ↓
   - Write clean code
   - Follow coding standards
   - Add/update tests
   - Update documentation
   ↓
4. ✅ TEST
   ↓
   - Run all tests (100% pass required)
   - Test on Android/iOS
   - Check for security issues
   - Verify Data Privacy compliance
   ↓
5. 📝 COMMIT
   ↓
   - Follow commit message format
   - Sign commits (if required)
   - Reference issue number
   ↓
6. 🚀 PUSH & PR
   ↓
   - Push to your fork
   - Create Pull Request
   - Fill PR template completely
   - Request review
   ↓
7. 🔍 CODE REVIEW
   ↓
   - Address review comments
   - Make requested changes
   - Update PR as needed
   ↓
8. ✨ MERGE
   ↓
   - PR approved by 2+ reviewers
   - All checks passing
   - Merged to main branch
   - Celebrate! 🎉
```

## 📝 Commit Guidelines

### Commit Message Format

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **security**: Security-related changes
- **ci**: CI/CD changes

### Scopes

- **auth**: Authentication system
- **profile**: User profile management
- **folder**: Document management
- **evaluations**: Evaluation system
- **messages**: Messaging system
- **ai**: AI assistant
- **notifications**: Notification system
- **ui**: UI components
- **api**: API integration

### Examples

```bash
# Feature
feat(auth): add biometric authentication support

Implemented fingerprint and face ID authentication for enhanced security.
Includes fallback to password authentication.

Closes #123

# Bug Fix
fix(messages): resolve real-time message sync issue

Fixed WebSocket connection dropping after 5 minutes of inactivity.
Added automatic reconnection with exponential backoff.

Fixes #456

# Documentation
docs(readme): update installation instructions

Added troubleshooting section for common setup issues.
Updated dependency versions.

# Security
security(api): implement rate limiting for login attempts

Added rate limiting to prevent brute force attacks.
Maximum 5 attempts per 15 minutes per IP address.

Addresses security audit finding #789
```

## 🔀 Pull Request Process

### Before Creating a PR

- ✅ Ensure your branch is up to date with main
- ✅ All tests pass (100% required)
- ✅ Code follows style guidelines
- ✅ Documentation is updated
- ✅ No security vulnerabilities introduced
- ✅ Data Privacy Act compliance verified

### PR Title Format

```
<type>(<scope>): <description>
```

Example:
```
feat(auth): add OTP resend functionality
fix(profile): resolve avatar upload issue
docs(contributing): add commit guidelines
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security fix

## Related Issue
Closes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Tested on Android
- [ ] Tested on iOS
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Security Checklist
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization verified
- [ ] Data Privacy Act compliance checked

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
```

### Review Process

1. **Automated Checks** (must pass)
   - ✅ All tests passing
   - ✅ Code coverage maintained
   - ✅ Linting checks pass
   - ✅ Build successful

2. **Code Review** (2 approvals required)
   - 👀 Code quality review
   - 🔒 Security review
   - 📱 UX/UI review
   - 📚 Documentation review

3. **Final Approval**
   - ✅ All comments addressed
   - ✅ Changes approved
   - ✅ Ready to merge

## 💎 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface UserProfile {
  student_id: string;
  name: string;
  email: string;
  avatar?: string;
}

const fetchUserProfile = async (id: string): Promise<UserProfile> => {
  // Implementation
};

// ❌ Bad: Avoid 'any' type
const fetchData = async (id: any): Promise<any> => {
  // Implementation
};
```

### React Native Best Practices

```typescript
// ✅ Good: Functional components with hooks
const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  return <View>{/* Component JSX */}</View>;
};

// ✅ Good: Proper error handling
try {
  const response = await api.post('/endpoint', data);
  if (response.data.success) {
    // Handle success
  }
} catch (error) {
  console.error('Error:', error);
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: error.message,
  });
}
```

### File Organization

```
app/
├── (tabs)/           # Tab screens
├── auth/             # Authentication screens
├── screens/          # Additional screens
└── _layout.tsx       # Root layout

components/
├── ui/               # UI components
└── *.tsx             # Reusable components

contexts/             # React contexts
services/             # API services
hooks/                # Custom hooks
constants/            # Constants and config
tests/                # Test files
```

### Naming Conventions

```typescript
// Components: PascalCase
const UserProfile = () => {};

// Functions: camelCase
const fetchUserData = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Interfaces: PascalCase with 'I' prefix (optional)
interface IUserData {
  id: string;
  name: string;
}

// Files: kebab-case or PascalCase
// user-profile.tsx or UserProfile.tsx
```

## 🧪 Testing Requirements

### Test Coverage

- **Minimum Coverage**: 100% (strictly enforced)
- **Test Types**: Unit, Integration, E2E

### Running Tests

```bash
# Run all tests
node tests/test-runner.js

# Run specific test file
node tests/auth/login.test.js

# Run with coverage
npm run test:coverage
```

### Writing Tests

```typescript
// Example test structure
describe('Authentication', () => {
  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await login('student123', 'password');
      expect(result.success).toBe(true);
    });

    it('should fail with invalid credentials', async () => {
      const result = await login('invalid', 'wrong');
      expect(result.success).toBe(false);
    });
  });
});
```

### Test Checklist

- ✅ All new code has tests
- ✅ Edge cases covered
- ✅ Error handling tested
- ✅ Security scenarios tested
- ✅ Data Privacy compliance tested

## 🔒 Security Guidelines

### Security Requirements

1. **Authentication**
   - Never hardcode credentials
   - Use secure token storage
   - Implement proper session management

2. **Data Protection**
   - Encrypt sensitive data
   - Follow Data Privacy Act of 2012
   - Validate all user inputs

3. **API Security**
   - Use HTTPS only
   - Implement rate limiting
   - Validate API responses

### Security Checklist

```typescript
// ✅ Good: Secure credential storage
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', encryptedToken);

// ❌ Bad: Plain text storage
AsyncStorage.setItem('password', userPassword);

// ✅ Good: Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Good: Sanitize user input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};
```

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

**Contact:** security@msis.eduisync.io

Include:
- Detailed description
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

## 📚 Documentation Standards

### Code Documentation

```typescript
/**
 * Authenticates a user with student ID and password
 * 
 * @param studentId - The student's unique identifier
 * @param password - The user's password
 * @returns Promise resolving to authentication result
 * @throws {AuthenticationError} If credentials are invalid
 * 
 * @example
 * const result = await authenticateUser('2024-12345', 'password123');
 */
const authenticateUser = async (
  studentId: string,
  password: string
): Promise<AuthResult> => {
  // Implementation
};
```

### README Updates

When adding new features, update:
- Feature list in README.md
- Installation instructions (if needed)
- Usage examples
- API documentation

## 🎯 Issue Guidelines

### Creating Issues

Use appropriate issue templates:

**Bug Report:**
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
Add screenshots

**Environment**
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 15.0]
- App Version: [e.g. 1.0.0]
```

**Feature Request:**
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered
```

## 🏆 Recognition

### Contributors

All contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

### Contribution Levels

- 🥉 **Bronze**: 1-5 merged PRs
- 🥈 **Silver**: 6-15 merged PRs
- 🥇 **Gold**: 16+ merged PRs
- 💎 **Diamond**: Significant feature contributions

## 📞 Getting Help

### Communication Channels

- **Email**: dev@msis.eduisync.io
- **Issues**: GitHub Issues (for bugs/features)
- **Security**: security@msis.eduisync.io

### Response Times

- **Bug Reports**: 24-48 hours
- **Feature Requests**: 3-5 business days
- **Security Issues**: Within 24 hours
- **General Questions**: 2-3 business days

## 📄 License

By contributing to MedSIS App, you agree that your contributions will be licensed under the same proprietary license as the project. See [LICENSE.md](LICENSE.md) for details.

---

**Thank you for contributing to MedSIS App!** 🎉

Your contributions help improve the educational experience for medical students at Southwestern University PHINMA.

---

**MSIS Development Team**  
**Version 1.0.0 - December 5, 2025**  
**Copyright © 2025 MSIS. All Rights Reserved.**
