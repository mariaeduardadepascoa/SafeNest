const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function load(relative, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const { code } = babel.transformSync(source, {
    babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/plugin-transform-react-jsx'],
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    exports: module.exports, module,
    require(name) { if (name in dependencies) return dependencies[name]; throw Error(`Unexpected dependency: ${name}`); },
    console: { log() {} }, ...globals,
  }, { filename: relative });
  return module.exports;
}

test('account preference selects the original accessible design across sessions', () => {
  const { resolvePreferences } = load('src/design/preferences.js');
  assert.equal(resolvePreferences(null, { versao_adaptada: true }).adapted, true);
  assert.equal(resolvePreferences({ adapted: true }, { versao_adaptada: false }).adapted, false);
  const restored = resolvePreferences({ colorVision: true, configured: true }, { versao_adaptada: true });
  assert.equal(restored.colorVision, true);
  assert.equal(restored.configured, true);
});

test('preferences are isolated by account, with a separate guest choice', () => {
  const { preferenceKey, resolvePreferences } = load('src/design/preferences.js');
  assert.notEqual(preferenceKey(1), preferenceKey(2));
  assert.notEqual(preferenceKey(), preferenceKey(1));
  assert.equal(resolvePreferences(null, { versao_adaptada: false }).configured, false);
  assert.equal(resolvePreferences(null, null).adapted, false);
});

test('accessible mode returns original style sheets and contemporary mode does not mutate them', () => {
  let adapted = true;
  const original = { card: { minHeight: 64, backgroundColor: '#2B5081' }, normalText: { color: '#FFFFFF' } };
  const { useScreenStyles } = load('src/design/useScreenStyles.js', {
    react: { useMemo: fn => fn() },
    'react-native': { StyleSheet: { flatten: value => value } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0 }) },
    './DesignProvider': { useDesign: () => ({ prefs: { adapted, colorVision: false }, c: { bg: '#F4F7FB', accent: '#0B2342', surface: '#FFFFFF', text: '#18283C', line: '#E3E8EF', raised: '#EDF1F6', muted: '#647286', red: '#AD4444' } }) },
  });
  assert.equal(useScreenStyles(original, 'ActivitysCard'), original);
  adapted = false;
  const modern = useScreenStyles(original, 'ActivitysCard');
  assert.equal(modern.card.backgroundColor, '#FFFFFF');
  assert.equal(modern.normalText.color, '#18283C');
  assert.equal(original.card.backgroundColor, '#2B5081');
});

test('accessible authentication has readable inputs and flexible sizes without changing other screens', () => {
  const { useScreenStyles } = load('src/design/useScreenStyles.js', {
    react: { useMemo: fn => fn() },
    'react-native': { StyleSheet: { flatten: value => value } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0 }) },
    './DesignProvider': { useDesign: () => ({ prefs: { adapted: true, colorVision: false }, c: { red: '#AD4444' } }) },
  });
  const original = { container: {}, textInput: { color: '#848484', height: '100%' }, textSubContainer: {}, input: { width: 260, height: 60 }, title: { fontSize: 20 } };
  for (const screen of ['LoginScreen', 'RegisterEmailScreen', 'RegisterPasswordScreen', 'RegisterAgeScreen']) {
    const styles = useScreenStyles(original, screen);
    assert.equal(styles.textInput.color, '#000000');
    assert.equal(styles.textSubContainer.color, '#000000');
    assert.equal(styles.textInput.fontSize, 20);
    assert.equal(styles.input.width, '100%');
    assert.equal(styles.input.height, undefined);
    assert.equal(styles.input.minHeight, 64);
    assert.equal(styles.title.fontSize, 28);
  }
  assert.equal(useScreenStyles(original, 'HomeScreen'), original);
  assert.equal(original.input.width, 260);
});

// Executa um manipulador da tela sem acessar rede ou acionar dispositivos.
function screenHandler(file, name, globals) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src/screens', file), 'utf8');
  const ast = babel.parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
  const component = ast.program.body.find(node => node.type === 'ExportDefaultDeclaration').declaration;
  const handler = component.body.body.find(node => node.type === 'FunctionDeclaration' && node.id.name === name);
  assert.ok(handler, `Função ${name} não encontrada`);
  const code = source.slice(handler.start, handler.end);
  const context = vm.createContext(globals);
  vm.runInContext(code, context);
  return vm.runInContext(name, context);
}

test('registration shows an explanation for missing data without sending requests', async () => {
  const alerts = [];
  const confirm = screenHandler('RegisterEmailScreen.js', 'confirmEmail', {
    verificacaoEmAndamento: { current: false }, emailSent: false, nome: '', email: '',
    Alert: { alert: (...args) => alerts.push(args) },
  });
  await confirm();
  assert.equal(alerts[0][0], 'Preencha seus dados');
});

test('registration keeps the send locked until email delivery finishes', async () => {
  let finishSend;
  const delivery = new Promise(resolve => { finishSend = resolve; });
  const states = [];
  const lock = { current: false };
  let lookups = 0;
  let sent = 0;
  const confirm = screenHandler('RegisterEmailScreen.js', 'confirmEmail', {
    verificacaoEmAndamento: lock, emailSent: false, nome: 'Maria', email: '  MARIA@example.com  ',
    setVerificando: state => states.push(state), setEmailError() {},
    verificarEmailExiste: async email => { assert.equal(email, 'maria@example.com'); lookups++; return false; },
    enviarCodigoVerificacao: () => delivery,
    setEmailSent: value => { if (value) sent++; }, Alert: { alert() {} },
  });
  const first = confirm();
  await confirm();
  await Promise.resolve();
  assert.equal(lock.current, true);
  assert.equal(lookups, 1);
  assert.equal(states.at(-1), true);
  finishSend();
  await first;
  assert.equal(lock.current, false);
  assert.equal(states.at(-1), false);
  assert.equal(sent, 1);
});

test('verification code accepts pasted numbers and ignores other characters', () => {
  let result;
  let focused;
  const change = screenHandler('RegisterEmailScreen.js', 'codeChange', {
    code: ['', '', '', ''], setCode: value => { result = Array.from(value); },
    codeRefs: [0, 1, 2, 3].map(index => ({ current: { focus: () => { focused = index; } } })),
  });
  change('12-34', 0);
  assert.deepEqual(result, ['1', '2', '3', '4']);
  assert.equal(focused, 3);
});

test('accessible history applies all three filters to the real events', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/screens/HistoryScreen.js'), 'utf8');
  const ast = babel.parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
  const component = ast.program.body.find(node => node.type === 'ExportDefaultDeclaration').declaration;
  const declaration = component.body.body.flatMap(node => node.declarations || []).find(node => node.id.name === 'visible');
  const expression = source.slice(declaration.init.start, declaration.init.end);
  const dados = [{ id: 1, tipo: 'acesso' }, { id: 2, tipo: 'alerta' }];
  for (const [filter, expected] of [['Todos', [1, 2]], ['Acessos', [1]], ['Alertas', [2]]]) {
    const filtered = vm.runInNewContext(expression, { dados, filter, prefs: { adapted: true } });
    assert.deepEqual(Array.from(filtered, event => event.id), expected);
  }
});

test('accessible lock reloads on return and ignores an outdated response from the previous visit', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/components/LockButton.js'), 'utf8');
  const ast = babel.parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
  const component = ast.program.body.flatMap(node => node.declarations || []).find(node => node.id.name === 'LockButton').init;
  const effect = component.body.body.find(node => node.type === 'ExpressionStatement' && node.expression.callee?.name === 'useFocusEffect');
  const callback = effect.expression.arguments[0].arguments[0];
  let finishOld;
  let calls = 0;
  const reported = [];
  const known = [];
  const focus = vm.runInNewContext(`(${source.slice(callback.start, callback.end)})`, {
    setCarregandoStatus() {}, setErroStatus() {}, setStatusConhecido: value => known.push(value),
    setTravado: value => reported.push(value),
    statusFechadura: () => {
      calls++;
      if (calls === 1) return new Promise(resolve => { finishOld = resolve; });
      return Promise.resolve(true);
    },
  });
  const leave = focus();
  leave();
  focus();
  await new Promise(setImmediate);
  finishOld(false);
  await new Promise(setImmediate);
  assert.equal(calls, 2);
  assert.deepEqual(reported, [true]);
  assert.equal(known.at(-1), true);
});

test('accessible lock marks the state as unavailable when consultation fails', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/components/LockButton.js'), 'utf8');
  const ast = babel.parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
  const component = ast.program.body.flatMap(node => node.declarations || []).find(node => node.id.name === 'LockButton').init;
  const effect = component.body.body.find(node => node.type === 'ExpressionStatement' && node.expression.callee?.name === 'useFocusEffect');
  const callback = effect.expression.arguments[0].arguments[0];
  let known = true;
  let loading = false;
  let message = '';
  const focus = vm.runInNewContext(`(${source.slice(callback.start, callback.end)})`, {
    setCarregandoStatus: value => { loading = value; }, setErroStatus: value => { message = value; },
    setStatusConhecido: value => { known = value; }, setTravado() { assert.fail('Não deve inventar um estado'); },
    statusFechadura: async () => { throw Error('Sem conexão'); },
  });
  focus();
  await new Promise(setImmediate);
  assert.equal(known, false);
  assert.equal(loading, false);
  assert.match(message, /Não foi possível consultar/);
});

test('contrast preference changes the interface in both designs and keeps readable text', () => {
  const { getDesignColors } = load('src/design/preferences.js');
  function luminance(hex) {
    const rgb = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  function contrast(first, second) {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  }
  for (const adapted of [false, true]) {
    const standard = getDesignColors({ adapted, colorVision: false });
    const adjusted = getDesignColors({ adapted, colorVision: true });
    for (const key of ['bg', 'raised', 'text', 'muted', 'line', 'accent']) assert.notEqual(standard[key], adjusted[key]);
    assert.ok(contrast(adjusted.text, adjusted.surface) >= 4.5);
    assert.ok(contrast(adjusted.muted, adjusted.surface) >= 4.5);
    assert.ok(contrast('#FFFFFF', adjusted.accent) >= 4.5);
    assert.ok(contrast('#FFFFFF', adjusted.red) >= 4.5);
  }
});

test('contact redesign preserves phone calls, editing, deletion and saved photos', async () => {
  let edits = 0;
  let deletions = 0;
  const calls = [];
  const { default: ContactCard } = load('src/components/ContactCard.js', {
    react: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    'react-native': { View: 'View', Image: 'Image', Pressable: 'Pressable', StyleSheet: { create: value => value },
      Linking: { openURL: async value => calls.push(value) }, Alert: { alert: () => assert.fail('Não deve falhar') } },
    '../design/DesignProvider': { useDesign: () => ({ c: {}, prefs: { adapted: false } }) },
    '../design/UI': { Icon: 'Icon', Txt: 'Text' },
  });
  const card = ContactCard({ nome_contato: 'Contato de teste', telefone: '(19) 99999-0000', foto: 'file:///foto-local.jpg', onEdit: () => edits++, onDelete: () => deletions++ });
  const elements = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    elements.push(node);
    visit(node.props?.children);
  }
  visit(card);
  await elements.find(node => node.props?.accessibilityLabel === 'Ligar para Contato de teste').props.onPress();
  elements.find(node => node.props?.accessibilityLabel === 'Editar contato Contato de teste').props.onPress();
  elements.find(node => node.props?.accessibilityLabel === 'Excluir contato Contato de teste').props.onPress();
  assert.deepEqual(calls, ['tel:19999990000']);
  assert.equal(edits, 1);
  assert.equal(deletions, 1);
  assert.equal(elements.find(node => node.type === 'Image').props.source.uri, 'file:///foto-local.jpg');
});

function apiHarness(responses, token = 'access') {
  const calls = [];
  const stored = [];
  const api = load('src/services/api.js', {
    '../services/tokenStorage': {
      obterAccessToken: async () => token,
      obterRefreshToken: async () => 'refresh',
      salvarTokens: async (...args) => stored.push(args),
      salvarUsuario: async () => {}, obterUsuario: async () => null,
      deletarTokens: async () => stored.push('deleted'), deletarUsuario: async () => {},
    },
  }, {
    fetch: async (url, options) => {
      calls.push({ url, options });
      const { status = 200, body = {} } = responses.shift() || {};
      return { status, ok: status >= 200 && status < 300, json: async () => body, text: async () => JSON.stringify(body) };
    },
  });
  return { api, calls, stored };
}

test('accessible design preference is saved through the real authenticated user endpoint', async () => {
  const { api, calls } = apiHarness([{ body: { usuario: { id_usuario: 7, versao_adaptada: true } } }]);
  const user = await api.atualizarPreferenciaAcessivel(7, true);
  assert.equal(user.versao_adaptada, true);
  assert.match(calls[0].url, /:3000\/usuario\/7$/);
  assert.equal(calls[0].options.method, 'PUT');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer access');
  assert.deepEqual(JSON.parse(calls[0].options.body), { versao_adaptada: true });
});

test('device command refreshes expired tokens and retries the device API', async () => {
  const { api, calls, stored } = apiHarness([
    { status: 401 }, { body: { accessToken: 'renewed' } }, { body: { mensagem: 'comando enviado' } },
  ]);
  await api.abrirFechadura(9);
  assert.match(calls[0].url, /:8080\/fechadura\/abrir$/);
  assert.match(calls[1].url, /:3000\/auth\/refresh$/);
  assert.equal(calls[2].url, calls[0].url);
  assert.equal(calls[2].options.headers.Authorization, 'Bearer renewed');
  assert.equal(stored[0][0], 'renewed');
  assert.equal(stored[0][1], 'refresh');
});

test('a rejected account update is surfaced rather than reported as saved', async () => {
  const { api } = apiHarness([{ status: 403, body: { erro: 'Sem permissão' } }]);
  await assert.rejects(api.atualizarPreferenciaAcessivel(7, true), /Sem permissão/);
});

test('explicit accessible choice at registration overrides the age default', async () => {
  const { api, calls } = apiHarness([{ body: { usuario: { id_usuario: 1 } } }]);
  await api.cadastro('Pessoa', 'pessoa@example.com', '123456', '60+', false);
  assert.equal(JSON.parse(calls[0].options.body).versao_adaptada, false);
});

test('removing a lock uses the existing endpoint without trailing spaces', async () => {
  const { api, calls } = apiHarness([{}]);
  await api.excluirFechadura();
  assert.match(calls[0].url, /:8080\/fechadura$/);
  assert.equal(calls[0].options.method, 'DELETE');
});
