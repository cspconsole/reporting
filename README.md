# CSP Console Reporting

A TypeScript/JavaScript package for handling Content Security Policy (CSP) directives and reporting violations in single page applications.

## 📋 Prerequisites

Before setting up the development environment, ensure you have the following installed:

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: Version 2.20 or higher
- **Operating System**: Linux, macOS, or Windows

### Verify Prerequisites

```bash
node --version
npm --version
git --version
```

## 🚀 Developer Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cspconsole/reporting.git
cd reporting
```

### 2. Install Dependencies

Install all required dependencies using npm:

```bash
npm install
```

This will install:
- TypeScript compiler and types
- Rollup bundler for building the package
- Jest testing framework with TypeScript support
- ESLint for code linting
- All other development dependencies listed in `package.json`

### 3. Build the Package

Build both ESM and UMD versions of the package:

```bash
npm run build
```

This command will:
- Bundle the source code using Rollup
- Generate TypeScript declaration files
- Create distribution files in the `dist/` directory

### 4. Run Tests

Execute the test suite to ensure everything is working correctly:

```bash
npm test
```

### 5. Lint the Code

Check code quality and style:

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── CspConsoleGuardService.ts    # Main CSP guard service
├── reporter.ts                  # CSP violation reporter
├── service-worker.js           # Service worker for CSP handling
├── config/                     # Configuration services
├── directives/                 # CSP directive parsing and handling
├── document-parser/            # HTML document parsing utilities
├── guard/                      # Guard services for CSP enforcement
├── hasher/                     # Hashing utilities
├── mime-type/                  # MIME type handling
├── reporting/                  # Reporting services
├── router/                     # Routing utilities
└── __tests__/                  # Test files and fixtures
```

## 🛠️ Development Workflow

### Building for Development

For development with file watching:

```bash
npm run build -- --watch
```

### Running Tests in Watch Mode

```bash
npm test -- --watch
```

### Type Checking

The project uses TypeScript with strict mode enabled. Type checking is performed during the build process, but you can also run it separately:

```bash
npx tsc --noEmit
```

## 📦 Package Distribution

The package is built in two formats:

- **ESM** (`dist/index.esm.js`): ES module format for modern bundlers
- **UMD** (`dist/index.umd.js`): Universal module format for broader compatibility

TypeScript declarations are generated for both formats:
- `dist/types/indexEsm.d.ts`
- `dist/types/indexUmd.d.ts`

## 🧪 Testing

This project uses Jest with TypeScript support and jsdom for browser environment simulation.

Test files are located in `__tests__/` directories throughout the source tree.

### Running Specific Tests

```bash
# Run tests for a specific service
npm test -- --testPathPattern=DirectiveParserService

# Run tests in a specific directory
npm test -- src/directives/__tests__
```

## 🔧 Configuration Files

- **`tsconfig.json`**: TypeScript compiler configuration
- **`jest.config.mjs`**: Jest testing framework configuration
- **`eslint.config.js`**: ESLint linting rules
- **`rollup.config.js`**: Rollup bundler configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and ensure tests pass
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- **Homepage**: [cspconsole.com](https://cspconsole.com)
- **Repository**: [GitHub](https://github.com/cspconsole/reporting)
- **Issues**: [GitHub Issues](https://github.com/cspconsole/reporting/issues)

## 🆘 Troubleshooting

### Common Issues

**Build Errors**: Ensure all dependencies are installed with `npm install`

**TypeScript Errors**: Check that your Node.js version is 16.x or higher

**Test Failures**: Verify that jsdom is properly installed for browser environment simulation

**Import Errors**: Make sure you're importing from the correct entry point (`dist/index.esm.js` or `dist/index.umd.js`)

### Getting Help

If you encounter issues:

1. Check the [Issues](https://github.com/cspconsole/reporting/issues) page
2. Ensure you're using supported Node.js and npm versions
3. Try deleting `node_modules` and running `npm install` again
4. Create a new issue with detailed information about your environment and the problem
