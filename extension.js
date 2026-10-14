/**
* @preserve
* Filename: extension.js
*
* Created: 09/05/2026 (18:48:49)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 14/10/2026 (18:44:12)
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

/**
 * Recupera la configurazione dell'estensione per il documento indicato.
 *
 * @param {vscode.TextDocument} document Documento VS Code di riferimento.
 * @returns {{includePath: string}} Percorso configurato per gli include dei template.
 */
const getConfig = (document) => {

	const config = vscode.workspace.getConfiguration("nunjucksTemplatePath", document.uri);

	return {
		"includePath": config.get("includePath", "src/view/_include")
	};
};

/**
 * Restituisce la cartella del workspace che contiene il documento.
 *
 * @param {vscode.TextDocument} document Documento da associare al workspace.
 * @returns {vscode.WorkspaceFolder|undefined} Cartella del workspace, se disponibile.
 */
const getWorkspace = (document) => {

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

	if (typeof workspaceFolder === "undefined") return undefined;

	return workspaceFolder;
};

/**
 * Verifica l'esistenza del template richiesto nel filesystem del workspace.
 *
 * Mostra un avviso se il file non è disponibile.
 *
 * @param {vscode.Uri} targetUri URI del template da verificare.
 * @param {string} templatePath Percorso del template richiesto.
 * @param {string} includePath Percorso di inclusione che ha richiesto il template.
 * @returns {Promise<boolean>} `true` se il template esiste, altrimenti `false`.
 */
const templateExists = async (targetUri, templatePath, includePath) => {

	try {

		await vscode.workspace.fs.stat(targetUri);

		return true;

	} catch {

		vscode.window.showWarningMessage(`Template not found: ${templatePath} in ${includePath}`);

		return false;
	}
};

/**
 * Attiva il provider di definizione per i riferimenti a template Nunjucks.
 *
 * Risolve solo i percorsi `.njk` e `.html` inclusi, estesi o importati
 * all'interno del workspace configurato e non restituisce una definizione
 * quando il file di destinazione non esiste.
 *
 * @param {vscode.ExtensionContext} context Contesto dell'estensione usato per registrare il provider.
 */
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
				const regex = /{%-?\s*(?:include|extends|import|from)\s+["']([^"']+\.(?:njk|html))["']/g;

				let match;

				while ((match = regex.exec(text)) !== null) {

					const templatePath = match[1];

					const pathStartIndex = match.index + match[0].indexOf(templatePath);
					const pathEndIndex = pathStartIndex + templatePath.length;

					const originRange = new vscode.Range(document.positionAt(pathStartIndex), document.positionAt(pathEndIndex));

					if (originRange.contains(position) === false) continue;

					const workspace = getWorkspace(document);

					if (typeof workspace === "undefined") return undefined;

					const { includePath } = getConfig(document);

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
