# Framework Detection

Tables for detecting project frameworks and app types during init.

## npm/Node.js Projects

Read `package.json` dependencies and devDependencies:

| Dependency | Framework | app_type |
|------------|-----------|----------|
| next | Next.js | web |
| vite | Vite | web |
| remix | Remix | web |
| nuxt | Nuxt | web |
| @sveltejs/kit | SvelteKit | web |
| electron | Electron | desktop |
| @tauri-apps/api | Tauri | desktop |
| react-native | React Native | mobile |
| expo | Expo | mobile |
| express | Express | api |
| fastify | Fastify | api |
| hono | Hono | api |
| @nestjs/core | NestJS | api |
| commander | Commander | cli |
| yargs | Yargs | cli |

## Non-npm Project Types

Detect by presence of project files:

| Indicator | Framework | app_type |
|-----------|-----------|----------|
| .claude-plugin/ | Claude Code Plugin | claude-code-plugin |
| Cargo.toml | Rust | cli or lib |
| go.mod | Go | cli or lib |
| pyproject.toml | Python | cli or lib |

## Resolution

- If no match is found, or the detection is ambiguous (e.g., multiple frameworks detected), ask the user to confirm the `app_type`.
- Priority: more specific indicators (e.g., `next`) take precedence over generic ones (e.g., `express` when both are present in a Next.js project with API routes).
