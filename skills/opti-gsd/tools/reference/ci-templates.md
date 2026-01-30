# CI/CD Language-Specific Detection Templates

Reference templates for auto-detecting toolchain configuration by language/platform.

## Rust (Cargo.toml)

```json
{
  "package_manager": "cargo",
  "build": "cargo build --release",
  "test": "cargo test",
  "lint": "cargo clippy -- -D warnings"
}
```

## Python (pyproject.toml or requirements.txt)

```json
{
  "package_manager": "pip",
  "build": "python -m build",
  "test": "pytest",
  "lint": "ruff check .",
  "typecheck": "mypy ."
}
```

## Go (go.mod)

```json
{
  "package_manager": "go",
  "build": "go build ./...",
  "test": "go test ./...",
  "lint": "golangci-lint run"
}
```

## C# (.csproj or .sln)

```json
{
  "package_manager": "dotnet",
  "build": "dotnet build",
  "test": "dotnet test",
  "lint": "dotnet format --verify-no-changes"
}
```
