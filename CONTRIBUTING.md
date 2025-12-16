# Contributing to runtyping

Thank you for your interest in contributing to runtyping! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Creating a New Package](#creating-a-new-package)

## Code of Conduct

By participating in this project, you are expected to uphold a professional and respectful environment. Please be considerate and constructive in your interactions with other contributors.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (versions 20, 22, 24, or 25 are supported)
- [Yarn](https://yarnpkg.com/) (latest version recommended)
- Git

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/runtyping.git
   cd runtyping
   ```

2. **Install dependencies**

   ```bash
   yarn
   ```

   This will install all dependencies and link the workspace packages together.

3. **Build all packages**

   ```bash
   yarn build
   ```

4. **Run tests to verify setup**

   ```bash
   yarn test
   ```

### Editor Setup

#### VSCode

If you're using VSCode, make sure to:

1. Accept the workspace TypeScript version when prompted
2. The project includes workspace settings and recommended extensions

#### Other Editors

For other editors, you'll need to install the [Yarn SDK](https://yarnpkg.com/getting-started/editor-sdks) for proper TypeScript support:

```bash
yarn dlx @yarnpkg/sdks <editor-name>
```

Please commit the generated SDK files with your PR if you're using a new editor.

## Project Structure

This is a monorepo managed with Yarn workspaces. The structure is:

```
runtyping/
├── packages/           # All packages live here
│   ├── generator/      # Core generator package
│   ├── io-ts/          # io-ts type writer
│   ├── runtypes/       # runtypes type writer
│   ├── valibot/        # valibot type writer
│   ├── yup/            # yup type writer
│   ├── zod/            # zod type writer
│   ├── zod-mini/       # zod-mini type writer
│   ├── zod-core/       # shared zod core utilities
│   └── test-type-writers/ # testing utilities
├── scaffold/           # Package scaffolding templates
└── .github/            # GitHub workflows and configuration
```

Each package contains:

- `src/` - Source code
- `test/` - Test files
- `fixtures/` - Test fixtures (for type writer packages)
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest test configuration
- `package.json` - Package metadata

## Making Changes

### Development Workflow

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

   Use descriptive branch names:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation changes
   - `refactor/` for code refactoring

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style and patterns
   - Add or update tests as needed
   - Update documentation if applicable

3. **Build and test locally**

   ```bash
   # Build all packages
   yarn build

   # Run all tests
   yarn test
   ```

## Testing

All packages use [Vitest](https://vitest.dev/) for testing.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests for a specific package
cd packages/zod
yarn test
```

### Writing Tests

- Place test files in the `test/` directory
- Use `.test.ts` or `.spec.ts` suffix for test files
- Fixtures should go in the `fixtures/` directory
- Follow existing test patterns in the package you're modifying

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This enables automatic changelog generation and semantic versioning.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi colons, etc)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools
- `ci`: Changes to CI configuration

### Examples

```bash
feat(zod): add support for branded types

fix(generator): handle circular references correctly

docs(readme): update installation instructions

test(valibot): add tests for optional fields
```

## Pull Request Process

1. **Ensure your code is ready**
   - All tests pass
   - Code builds successfully
   - No linting errors
   - Documentation is updated

2. **Update the Pull Request**
   - Provide a clear description of what changes you've made
   - Reference any related issues
   - Include screenshots for UI changes (if applicable)
   - List any breaking changes

3. **Submit the Pull Request**
   - Push your branch to your fork
   - Open a pull request against the `master` branch
   - Fill out the PR template completely

4. **Code Review**
   - Respond to feedback from maintainers
   - Make requested changes
   - Push updates to your branch (they'll automatically update the PR)

5. **CI Checks**
   - All CI checks must pass (tests run on Node.js 20, 22, 24, and 25)
   - Fix any failing tests or build issues

6. **Merge**
   - Once approved and all checks pass, a maintainer will merge your PR
   - The project uses automated releases, so your changes will be published automatically

## Creating a New Package

To create a new type writer package, use the scaffolding tool:

```bash
yarn scaffold
```

This will guide you through creating a new package with the proper structure and configuration.

## Questions or Issues?

- **Questions**: Open a [discussion](https://github.com/johngeorgewright/runtyping/discussions)
- **Bugs**: Open an [issue](https://github.com/johngeorgewright/runtyping/issues)
- **Security**: Contact the maintainers privately for security concerns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thanks!

Thank you for contributing to runtyping! Your efforts help make runtime validation easier for everyone. 🎉
