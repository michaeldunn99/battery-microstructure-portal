const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');
const katex = require('katex');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Load the actual TSX components so this checks the rendering boundary as well as data.
require.extensions['.tsx'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
const MathText = require('../components/MathText.tsx').default;

test('inline math renders subscripts while preserving prose, percentages, and escaping', () => {
  const html = renderToStaticMarkup(React.createElement(MathText, {
    text: String.raw`Pore throat (\(a_y\)) versus chord (\(a_x\)); 95% confidence <script>.`,
  }));
  assert.equal((html.match(/class="katex"/g) || []).length, 2);
  assert.ok(html.includes('<msub>'));
  assert.ok(html.includes('95% confidence &lt;script&gt;.'));
  assert.ok(!html.includes('\\('));
  assert.equal(renderToStaticMarkup(React.createElement(MathText, {text: 'Ordinary prose'})), 'Ordinary prose');
});

test('all authored math expressions parse strictly, including all batch values', () => {
  let count = 0;
  for (const file of fs.readdirSync(path.join(__dirname, '../components')).filter(f => f.endsWith('.tsx'))) {
    const source = ts.createSourceFile(file, fs.readFileSync(path.join(__dirname, '../components', file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isStringLiteral(node)) {
        const formulas = [...node.text.matchAll(/\\\(([\s\S]*?)\\\)/g)].map(match => match[1]);
        if (ts.isPropertyAssignment(node.parent) && /^(latexSymbol|latexFormula|batch3Baseline|batch2Candidate|batch1Defective)$/.test(node.parent.name.getText(source))) formulas.push(node.text);
        if (ts.isJsxExpression(node.parent) && ts.isJsxAttribute(node.parent.parent) && node.parent.parent.name.getText(source) === 'formula') formulas.push(node.text);
        for (const formula of formulas) {
          assert.doesNotThrow(() => katex.renderToString(formula, { throwOnError: true, strict: 'error' }), `${file}: ${formula}`);
          count++;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  assert.ok(count >= 90, `Expected portal-wide math coverage; found ${count}`);
});
