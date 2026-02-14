# Dotnet Generator

Workflow accelerators for modern .NET development in VS Code.

Dotnet Generator removes repetitive scaffolding and wiring so you can
focus on writing actual business logic instead of boilerplate.

Built for real-world .NET teams using VS Code.

------------------------------------------------------------------------

## ✨ Why This Extension Exists

VS Code has excellent C# support via C# Dev Kit --- but it lacks fast,
opinionated scaffolding for common .NET workflows.

Dotnet Generator fills that gap by providing:

-   Project-aware class generation\
-   Service + interface pair creation\
-   Automatic dependency injection registration\
-   Constructor generation from readonly fields\
-   Multi-project namespace detection\
-   Auto-formatting on file creation

This extension focuses on workflow acceleration --- not replacing Roslyn
features that VS Code already handles well.

------------------------------------------------------------------------

## 🚀 Features

### Generate C# Class

Right-click a folder → **Generate C# Class**

-   Creates class with correct namespace\
-   Uses nearest `.csproj` for namespace resolution\
-   Works in multi-project solutions\
-   Auto-formats on creation

------------------------------------------------------------------------

### Generate C# Interface

Right-click a folder → **Generate C# Interface**

-   Automatically prefixes with `I`\
-   Uses project-aware namespace detection\
-   Auto-formats

------------------------------------------------------------------------

### Generate Service Pair (With Auto Registration)

Right-click a folder → **Generate C# Service**

Creates:

    IUserService.cs
    UserService.cs

Then automatically updates `Program.cs`:

``` csharp
builder.Services.AddScoped<IUserService, UserService>();
```

Also inserts the correct `using` statement if missing.

✔ No duplicate registrations\
✔ No duplicate using statements\
✔ Works in real-world projects\
✔ Auto-formats after modification

This eliminates repetitive dependency injection wiring.

------------------------------------------------------------------------

### Generate Constructor from Readonly Fields

Run:

    Generate Constructor from Fields

Automatically builds a constructor from `private readonly` fields.

Example:

``` csharp
private readonly IUserRepository _repo;
private readonly ILogger<UserService> _logger;
```

Generates:

``` csharp
public UserService(IUserRepository repo, ILogger<UserService> logger)
{
    _repo = repo;
    _logger = logger;
}
```

✔ Inserts inside class body\
✔ Prevents duplicate constructors\
✔ Respects formatting rules

------------------------------------------------------------------------

### Multi-Project Aware Namespace Resolution

In solutions structured like:

    Api/
    Application/
    Infrastructure/

Namespaces are resolved using the nearest `.csproj`, not the workspace
root.

This ensures correct behavior in:

-   Clean Architecture solutions\
-   Modular monoliths\
-   Multi-project repositories\
-   Vertical slice architectures

------------------------------------------------------------------------

## 📦 Requirements

-   VS Code\
-   C# Dev Kit (recommended for formatting support)\
-   .NET SDK (only required for compiling projects, not for file
    generation)

------------------------------------------------------------------------

## 🛠 How to Use

1.  Right-click a folder in your project.

2.  Select the desired generation command.

3.  For constructor generation, run via Command Palette:

        Generate Constructor from Fields

------------------------------------------------------------------------

## 🎯 Roadmap

-   Feature folder generation (Vertical Slice)
-   DTO generation from model
-   Primary constructor conversion
-   Advanced scaffolding options

------------------------------------------------------------------------

## 🤝 Contributing

Feedback and pull requests are welcome.

If you have workflow pain points in .NET + VS Code, open an issue.

------------------------------------------------------------------------

## 📄 License

MIT License
