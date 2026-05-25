/**
* @preserve
* Filename: extension.js
*
* Created: 09/05/2026 (18:48:49)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 10/05/2026 (19:38:24)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2026 - Tutti i diritti riservati
*
* Comments:
*/

/* eslint-disable no-undefined */

"use strict";

const path = require("path");
const vscode = require("vscode");

const deactivate = () => {};

const getConfig = () => {

	const config = vscode.workspace.getConfiguration("nunjucksTemplatePath");

	return {
		"includePath": config.get("includePath", "src/view/_include")
	};
};

const getWorkspace = (document) => {

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

	if (typeof workspaceFolder === "undefined") return undefined;

	return workspaceFolder;
};

const templateExists = async (targetUri, templatePath, includePath) => {

	try {

		await vscode.workspace.fs.stat(targetUri);

		return true;

	} catch {

		vscode.window.showWarningMessage(`Template not found: ${templatePath} in ${includePath}`);

		return false;
	}
};

const activate = (context) => {

	const definitionProvider = vscode.languages.registerDefinitionProvider(
		[
			{
				"language": "nunjucks",
				"scheme": "file"
			},
			{
				"pattern": "**/*.njk",
				"scheme": "file"
			}
		],
		{
			async provideDefinition(document, position) {

				const text = document.getText();
				// espressione regolare per intercettare i vari pattern include o import di nunjucks (per gli include anche html)
				const regex = /{%\s*(?:include|extends|import|from)\s+["']([^"']+\.(?:njk|html))["']/g;

				let match;

				while ((match = regex.exec(text)) !== null) {

					const templatePath = match[1];

					const pathStartIndex = match.index + match[0].indexOf(templatePath);
					const pathEndIndex = pathStartIndex + templatePath.length;

					const originRange = new vscode.Range(document.positionAt(pathStartIndex), document.positionAt(pathEndIndex));

					if (originRange.contains(position) === false) continue;

					const workspace = getWorkspace(document);

					if (typeof workspace === "undefined") return undefined;

					const { includePath } = getConfig();

					const targetPath = path.resolve(workspace.uri.fsPath, includePath, templatePath);

					// check se template esiste
					const targetUri = vscode.Uri.file(targetPath);

					// eslint-disable-next-line no-await-in-loop
					if (await templateExists(targetUri, templatePath, includePath) === false) return undefined;

					const targetRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

					return [
						{
							"originSelectionRange": originRange,
							"targetUri": targetUri,
							"targetRange": targetRange,
							"targetSelectionRange": targetRange
						}
					];

				}

				return undefined;
			}
		}
	);

	context.subscriptions.push(definitionProvider);
};

module.exports = {
	activate,
	deactivate
};
