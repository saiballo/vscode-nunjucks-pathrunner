# Nunjucks Pathrunner

> Nunjucks Pathrunner is a simple VS Code extension that enables Ctrl + click and Go to Definition support for Eleventy / Nunjucks template paths (`.njk`).

![](https://img.shields.io/badge/Made%20with%20love%20and-node-blue)
[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://lbesson.mit-license.org/)

## Features

- Ctrl + click support for `.njk` template paths
- Go to Definition (`F12`) integration
- Support for common Eleventy / Nunjucks template tags
- Workspace-specific settings support
- Configurable base include path

Perfect for Eleventy / Nunjucks projects that use many reusable Nunjucks templates, partials, layouts and macros.

## Supported syntax

The extension supports static template paths used in:

```njk
{% include "component/file.njk" %}
{% from "section/file.njk" import macro %}
{% extends "layout/base.njk" %}
{% import "macro/forms.njk" as forms %}
```

Supported tags:

- `include`
- `from`
- `extends`
- `import`

## Usage

Hold:

```
Ctrl + click
```

on a `.njk` template path to open the referenced file.

You can also use:

```
F12 → Go to Definition
```

The behavior is similar to native JavaScript imports in VS Code.

## Configuration

Nunjucks Pathrunner uses a base include path to resolve template references.

Default value:

```json
"nunjucksTemplatePath.includePath": "src/view/_include"
```

This means that a template reference like:

```njk
{% include "component/card.njk" %}
```

will be resolved as:

```txt
src/view/_include/component/card.njk
```

You can configure the base path globally or per workspace.

Open settings:

```
File > Preferences > Settings > search "Nunjucks Pathrunner Path"
```

or edit your `settings.json`:

```json
{
	"nunjucksTemplatePath.includePath": "src/view/_include"
}
```

You can change the path to match your project structure:

```json
{
	"nunjucksTemplatePath.includePath": "src/_includes"
}
```

Notes:

* `src/view/_include` is only the default value
* The path can be customized freely
* Workspace settings are supported, so each project can use a different include path

## Dynamic paths limitation

The extension can resolve only static template paths.

Examples that work:

```njk
{% include "component/card.njk" %}
{% from "section/card-awesome.njk" import cardAwesome with context %}
```

Examples that cannot be resolved:

```njk
{% include somePath + ".njk" %}
{% from someVar + "/card-awesome.njk" import cardAwesome with context %}
```

Dynamic paths cannot be resolved reliably because the final template path depends on runtime variables, data files, front matter, global data, computed data or template context.

## Compatibility

This extension works only in VS Code Desktop.
It is not supported in VS Code Web (vscode.dev / github.dev).

## Why Nunjucks Pathrunner?

Eleventy and Nunjucks projects often rely on reusable templates split across many folders.

Without native navigation support, moving between includes, layouts and macros can become slow and repetitive.

Nunjucks Pathrunner improves the editing experience by making static `.njk` template references behave like regular code imports.

## DevTeam

### ARMADA 429
<img src="https://raw.githubusercontent.com/saiballo/saiballo/refs/heads/master/armada429.png" width="80" height="80">
<br><br>

**Lorenzo "Saibal" Forti** - <lorenzo.forti@gmail.com>

## License

[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://lbesson.mit-license.org/)
![](https://img.shields.io/badge/License-Copyleft%20Saibal%20--%20All%20Rights%20Reserved-red)
