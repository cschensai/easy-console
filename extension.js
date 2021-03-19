// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "easy-console" is now active!');

	// 获取当前编辑器对象
	let currentEditor = vscode.window.activeTextEditor;
	// 当编辑器文本变化时，重置编辑器对象
	vscode.window.onDidChangeActiveTextEditor(editor => currentEditor = editor);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// 注册命令
	let disposable = vscode.commands.registerTextEditorCommand('easy-console', async () => {
		// The code you place here will be executed every time your command is executed
		try {
			// 获取选中的区域
			const sel = currentEditor.selection;
			// 匹配log的正则表达式
			const reg = /[\S]+\.(clog|cwarn|cerror|cinfo|cdir)$/;
			// 获取单词范围对象
			const ran = currentEditor.document.getWordRangeAtPosition(sel.anchor, reg);
			if (!ran) {
				Promise.reject('请使用如下格式：xxx.clog|xxx.cwarn|xxx.cerror|xxx.cinfo|xxx.cdir');
				return false;
			}
			// 获取当前文档对象
			const doc = currentEditor.document;
			// 获取当前行数
			const line = ran.start.line;
			// 获取当前输入文本
			const inputText = doc.getText(ran);
			const prefix = inputText.replace(/\.(clog|cwarn|cerror|cinfo|cdir)/, '');
			// 获取当前行的偏移量
			const [_, type] = inputText.split('.');
			const idx = doc.lineAt(line).firstNonWhitespaceCharacterIndex;
			// 格式化新文本
			const map = {
				clog: 'log',
				cwarn: 'warn',
				cerror: 'error',
				cinfo: 'info',
				cdir: 'dir',
			}
			const newText = `console.${map[type]}('my-log ${prefix}', ${prefix})`;
			await currentEditor.edit(e => {
				// 将旧文本替换为新文本
				e.replace(ran, newText);
			})
			// 光标定位到末尾
			const endIdx = new vscode.Position(line, newText.length + idx);
			currentEditor.selection = new vscode.Selection(endIdx, endIdx);
		} catch (error) {
			console.log('error', error);
		}
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
