# CSP Console Reporting

A TypeScript/JavaScript package for handling Content Security Policy (CSP) directives and reporting violations in single page applications.

## 💡Why was this package created?

Handling Content Security Policy (CSP) can be a very cumbersome job in single page applications because of multiple reasons:

- the CSP header has to be updated dynamically on page changes
- HTML meta tag for CSP does not allow to specify reporting URLs
- assets enabled on one route, can be disabled on other route - HTML meta tag won't block an already loaded script based on changed HTML meta CSP values 

Each developer coding SPA applications and dealing with CSP will be facing the above-mentioned issues, so we decided to create this package and solve the problem once and forever.  

## ✅ What this package does?
- This package enables dynamic CSP header changes on given routes based on a provided config. 
- It serves as a proxy between your web application and your CSP reporting endpoint.
  - it enabled to specify the URL endpoint for collecting your violation reports
- It works both in `enforce` and `report-only` mode 

## ❌ What this package does not?
This package when installed to your JS SPA application won't secure your site against cyberattacks.

## ❓How to use this package?

### Install @cspconsole.com/reporting npm package

```bash
npm install @cspconsole.com/reporting
```

### Copy service-worker.js
To make sure that your SPA application backed by CSP headers will report correctly detected violations, **you need to manually copy** the `src/service-worker.js` file to your applications `public` folder.

Sadly this step cannot be automated by this NPM package due to possible security issues - well, we guess you wouldn't be happy if some NPM package copied scripts to your filesystem.😉 

This SW helps us to gather the information about the assets that are going to be fetched.

### Initialise the CSPconsole web guard
In your main TypeScript file, when your application is booted, you will need to use the `cspConsoleWebGuard()` function provided by this package.

The `GuardConfig` object has the following interface:
```ts
export type Config = {
  policies: { pathRegex: string; value: string }[];
  reportUri: string;
  mode: 'enforce' | 'reportOnly';
  debug?: boolean;
};

type GuardConfig = Config & {
  onGuardInit?(): void;
};
```

For the `policies` config we highly recommend to use a reporting tool like our https://cspconsole.com, where you can customize CSP configuration for your website based on actual violations that were reported through the `reportUri` endpoint.

The `mode` attribute specifies whether we want to only report the violation to the endpoint specified in `reportUri` attribute, or we want to block it immediately.

The `reportUri` attribute specifies the API endpoint that will collect violations. This endpoint should be backed by some UI where you can see all the violations and decide on the CSP of your web application.

The `debug` mode does not trigger API calls, it only logs to the console the violations.

The `onGuardInit` callback will contain the code, that will boot up your application. It has to be a callback, because at first we will need to setup the SW before even starting the application. 

A sample setup could look as follows:

```ts
import { cspConsoleWebGuard } from "@cspconsole.com/reporting";

...

cspConsoleWebGuard({
  mode: "enforce",
  reportUri: "https://app-cspconsole-com-d172968e.api.cspconsole.com/v1/reports",
  policies: [
    {
      pathRegex: "^/sign-up.*$",
      value:
              "default-src 'self'; connect-src 'self' https://*.tawk.to https://app-cspconsole-com-d172968e.api.cspconsole.com https://js.stripe.com wss://*.pusher.com; font-src 'self'; form-action 'none'; frame-ancestors 'none'; frame-src 'self' https://app.termly.io https://js.stripe.com; img-src 'self' https://*.tile.openstreetmap.org https://static.cspconsole.com; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'nonce-VkhvM2poTTZySkN3' 'self' 'unsafe-eval' 'unsafe-inline' https://app-cspconsole-com-d172968e.api.cspconsole.com https://app.termly.io https://cdn.cspconsole.com https://embed.tawk.to https://js.stripe.com; style-src 'self' 'unsafe-inline'; worker-src 'none'; ",
    },
    {
      pathRegex: "^/login.*$",
      value:
              "default-src 'self'; connect-src 'self' https://*.tawk.to https://app-cspconsole-com-d172968e.api.cspconsole.com https://js.stripe.com wss://*.pusher.com; font-src 'self'; form-action 'none'; frame-ancestors 'none'; frame-src 'self' https://app.termly.io https://js.stripe.com; img-src 'self' https://*.tile.openstreetmap.org https://static.cspconsole.com; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'nonce-VkhvM2poTTZySkN3' 'self' 'unsafe-eval' 'unsafe-inline' https://app-cspconsole-com-d172968e.api.cspconsole.com https://app.termly.io https://cdn.cspconsole.com https://embed.tawk.to https://js.stripe.com; style-src 'self' 'unsafe-inline'; worker-src 'none'; ",
    },
    {
      pathRegex: "^.*$",
      value:
              "default-src 'self'; connect-src 'self' https://app-cspconsole-com-d172968e.api.cspconsole.com https://js.stripe.com wss://*.pusher.com; font-src 'self'; form-action 'none'; frame-ancestors 'none'; frame-src 'self' https://app.termly.io https://js.stripe.com; img-src 'self' https://*.tile.openstreetmap.org https://static.cspconsole.com; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'nonce-VkhvM2poTTZySkN3' 'self' 'unsafe-eval' 'unsafe-inline' https://app-cspconsole-com-d172968e.api.cspconsole.com https://app.termly.io https://cdn.cspconsole.com https://embed.tawk.to https://js.stripe.com; style-src 'self' 'unsafe-inline'; worker-src 'none'; ",
    },
  ],
  onGuardInit: () => {
    initAutoLogin().then(() => {
      new Vue({
        router,
        store,
        render: (createElement) => {
          return createElement(MyApp);
        },
      }).$mount("#app");
    });
  },
});

```

### Enforce mode: Initialise the CSPconsole route guard

In case we want to use our CSP headers in `enforce` mode we will need to call `cspConsoleRouteGuard` on page change, before the content is loaded.

The route guard will first dynamically update the HTML meta CSP tag and then it will block all the unwanted assets based on the provided config for the current page.

#### Vue2 sample setup
```ts
import { cspConsoleRouteGuard } from "@cspconsole.com/reporting";

...

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  cspConsoleRouteGuard(to.path);
  next();
});

export default router;
```

#### Vue3 sample setup
```ts
import { cspConsoleRouteGuard } from "@cspconsole.com/reporting";

...

const router = createRouter({
  history: createWebHistory(), // equivalent to mode: 'history'
  routes,
});

router.beforeEach((to, from, next) => {
  cspConsoleRouteGuard(to.path);
});

export default router;

```

#### React sample setup

In React we could implement a RouteWatcher component with a `useEffect` listening to `location` changes.

```ts
import { cspConsoleRouteGuard } from "@cspconsole.com/reporting";

...

const RouteWatcher = () => {
  const location = useLocation();

  useEffect(() => {
    cspConsoleRouteGuard(location.pathname);
  }, [location]);

  return null;
};

const AppRouter = () => (
  <Router>
    <RouteWatcher />
    <Routes>
      {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
    </Routes>
  </Router>
);

export default AppRouter;
```

## 📒ESM / UDM
The package is built in two formats:

- **ESM** (`dist/index.esm.js`): ES module format for modern bundlers
- **UMD beta** (`dist/index.umd.js`): Universal module format for broader compatibility
  - this is still a WIP feature, we do not recommend to use it in the current version

TypeScript declarations are generated for both formats:
- `dist/types/indexEsm.d.ts`
- `dist/types/indexUmd.d.ts`

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

### Getting Help

If you encounter issues:

1. Check the [Issues](https://github.com/cspconsole/reporting/issues) page
2. Ensure you're using supported Node.js and npm versions
3. Try deleting `node_modules` and running `npm install` again
4. Create a new issue with detailed information about your environment and the problem
