const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function carregarModulo(relative, dependencies = {}, globals = {}) {
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
  const { lerPreferencias } = carregarModulo('src/design/preferences.js');
  assert.equal(lerPreferencias(null, { versao_adaptada: true }).adapted, true);
  assert.equal(lerPreferencias({ adapted: true }, { versao_adaptada: false }).adapted, false);
  const restored = lerPreferencias({ colorVision: true, configured: true }, { versao_adaptada: true });
  assert.equal(restored.colorVision, true);
  assert.equal(restored.configured, true);
});

test('preferences are isolated by account, with a separate guest choice', () => {
  const { chavePreferencias, lerPreferencias } = carregarModulo('src/design/preferences.js');
  assert.notEqual(chavePreferencias(1), chavePreferencias(2));
  assert.notEqual(chavePreferencias(), chavePreferencias(1));
  assert.equal(lerPreferencias(null, { versao_adaptada: false }).configured, false);
  assert.equal(lerPreferencias(null, null).adapted, false);
});

test('accessible mode returns original style sheets and contemporary mode does not mutate them', () => {
  let adapted = true;
  const original = { card: { minHeight: 64, backgroundColor: '#2B5081' }, normalText: { color: '#FFFFFF' } };
  const { useEstilos } = carregarModulo('src/design/useScreenStyles.js', {
    react: { useMemo: fn => fn() },
    'react-native': { StyleSheet: { flatten: value => value } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0 }) },
    './DesignProvider': { useVisual: () => ({ prefs: { adapted, colorVision: false }, c: { bg: '#F4F7FB', accent: '#0B2342', surface: '#FFFFFF', text: '#18283C', line: '#E3E8EF', raised: '#EDF1F6', muted: '#647286', red: '#AD4444' } }) },
  });
  assert.equal(useEstilos(original, 'ActivitysCard'), original);
  adapted = false;
  const modern = useEstilos(original, 'ActivitysCard');
  assert.equal(modern.card.backgroundColor, '#FFFFFF');
  assert.equal(modern.normalText.color, '#18283C');
  assert.equal(original.card.backgroundColor, '#2B5081');
});

test('accessible authentication has readable inputs and flexible sizes without changing other screens', () => {
  const { useEstilos } = carregarModulo('src/design/useScreenStyles.js', {
    react: { useMemo: fn => fn() },
    'react-native': { StyleSheet: { flatten: value => value } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0 }) },
    './DesignProvider': { useVisual: () => ({ prefs: { adapted: true, colorVision: false }, c: { red: '#AD4444' } }) },
  });
  const original = { container: {}, textInput: { color: '#848484', height: '100%' }, textSubContainer: {}, input: { width: 260, height: 60 }, title: { fontSize: 20 } };
  for (const screen of ['LoginScreen', 'RegisterEmailScreen', 'RegisterPasswordScreen', 'RegisterAgeScreen']) {
    const estilos = useEstilos(original, screen);
    assert.equal(estilos.textInput.color, '#000000');
    assert.equal(estilos.textSubContainer.color, '#000000');
    assert.equal(estilos.textInput.fontSize, 20);
    assert.equal(estilos.input.width, '100%');
    assert.equal(estilos.input.height, undefined);
    assert.equal(estilos.input.minHeight, 64);
    assert.equal(estilos.title.fontSize, 28);
  }
  const inicio = useEstilos(original, 'HomeScreen');
  assert.equal(inicio.input.width, 260);
  assert.equal(inicio.textInput.color, '#848484');
  assert.equal(original.input.width, 260);
});

// Executa um manipulador da tela sem acessar rede ou acionar dispositivos.
test('editar o nome da câmera preserva o endereço que não foi alterado', async () => {
  let enviado;
  const salvar = funcaoDaTela('CameraScreen.js', 'salvarCamera', {
    nome: ' Entrada ', endereco: '', cameraEditando: { id: 8 },
    Alert: { alert() { throw Error('Validação inesperada'); } },
    executar: acao => acao(), atualizarCamera: async (id, dados) => { enviado = { id, ...dados }; },
    setFormularioAberto() {}, setUrlVideo() {}, setEstadoCamera() {}, setEstadoIa() {}, setFoto() {}, atualizarLista: async () => {},
  });
  await salvar();
  assert.equal(enviado.id, 8);
  assert.equal(enviado.nomeUsuario, 'Entrada');
  assert.equal('endereco' in enviado, false);
});

test('cadastrar câmera usa o usuário conectado e o endereço informado', async () => {
  let enviado;
  const salvar = funcaoDaTela('CameraScreen.js', 'salvarCamera', {
    nome: ' Entrada ', endereco: ' rtsp://servidor/entrada ', cameraEditando: null, usuario: { id_usuario: 42 },
    Alert: { alert() { throw Error('Validação inesperada'); } },
    executar: acao => acao(), cadastrarCamera: async dados => { enviado = dados; },
    setFormularioAberto() {}, setUrlVideo() {}, setEstadoCamera() {}, setEstadoIa() {}, setFoto() {}, atualizarLista: async () => {},
  });
  await salvar();
  assert.equal(enviado.idUsuario, 42);
  assert.equal(enviado.endereco, 'rtsp://servidor/entrada');
});

test('vídeo usa o endereço devolvido pela API para a câmera escolhida', async () => {
  let endereco;
  const abrir = funcaoDaTela('CameraScreen.js', 'verVideo', {
    pedidoDeVideo: { current: 0 },
    cameraAtual: { id: 8 }, executar: acao => acao(), setAvisoVideo() {},
    setUrlVideo: valor => { endereco = valor; },
    obterVideoCamera: async id => { assert.equal(id, 8); return 'http://servidor:8889/entrada/'; },
  });
  await abrir();
  assert.equal(endereco, 'http://servidor:8889/entrada/');
});

test('tocar no cartão abre os detalhes e inicia o vídeo da câmera tocada', () => {
  let selecionada;
  let detalhes = false;
  let video;
  const abrir = funcaoDaTela('CameraScreen.js', 'escolherCamera', {
    setCameraAtual: camera => { selecionada = camera; }, setDetalhesAbertos: valor => { detalhes = valor; },
    setUrlVideo() {}, setEstadoCamera() {}, setEstadoIa() {}, setAvisoVideo() {},
    verVideo: camera => { video = camera; },
  });
  const camera = { id: 9, nomeUsuario: 'Webcam SafeNest' };
  abrir(camera);
  assert.equal(selecionada, camera);
  assert.equal(detalhes, true);
  assert.equal(video, camera);
});

test('fechar detalhes impede que uma resposta atrasada reabra o vídeo', async () => {
  let concluir;
  let video = '';
  const pedidoDeVideo = { current: 0 };
  const abrir = funcaoDaTela('CameraScreen.js', 'verVideo', {
    pedidoDeVideo, cameraAtual: { id: 9 }, executar: acao => acao(), setAvisoVideo() {},
    setUrlVideo: valor => { video = valor; },
    obterVideoCamera: () => new Promise(resolve => { concluir = resolve; }),
  });
  const fechar = funcaoDaTela('CameraScreen.js', 'fecharDetalhes', {
    pedidoDeVideo, setDetalhesAbertos() {}, setAvisoVideo() {}, setUrlVideo: valor => { video = valor; },
  });
  const carregamento = abrir();
  fechar();
  concluir('http://servidor:8889/webcam/');
  await carregamento;
  assert.equal(video, '');
});

test('abrir no navegador usa a página de vídeo da API', async () => {
  let endereco;
  const abrir = funcaoDaTela('CameraScreen.js', 'abrirNoNavegador', {
    urlVideo: '', cameraAtual: { id: 9 }, executar: acao => acao(),
    obterVideoCamera: async id => { assert.equal(id, 9); return 'http://192.168.137.1:8889/webcam/'; },
    Linking: { openURL: async url => { endereco = url; } },
  });
  await abrir();
  assert.equal(endereco, 'http://192.168.137.1:8889/webcam/');
});

function funcaoDaTela(file, name, globals) {
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
  const confirm = funcaoDaTela('RegisterEmailScreen.js', 'confirmEmail', {
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
  const confirm = funcaoDaTela('RegisterEmailScreen.js', 'confirmEmail', {
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
  const change = funcaoDaTela('RegisterEmailScreen.js', 'codeChange', {
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

test('os dois visuais reconhecem um cadastro que termina depois da primeira consulta', async () => {
  for (const [arquivo, nome] of [['src/design/LockCard.js', 'CartaoFechadura'], ['src/components/FechaduraSection.js', 'useFechadura']]) {
    const codigo = fs.readFileSync(path.join(__dirname, '..', arquivo), 'utf8');
    const arvore = babel.parseSync(codigo, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
    const funcao = arvore.program.body.map(no => no.declaration || no).find(no => no.id?.name === nome);
    const efeito = funcao.body.body.find(no => no.expression?.callee?.name === 'useFocusEffect');
    const trecho = efeito.expression.arguments[0].arguments[0];
    let proximaConsulta;
    let consultas = 0;
    let identificador;
    let mensagem = '';
    const aoAbrir = vm.runInNewContext(`(${codigo.slice(trecho.start, trecho.end)})`, {
      setId: valor => { identificador = valor; }, setFechadura: valor => { identificador = valor; },
      setLoading() {}, setCarregando() {}, setBlocked() {},
      setError: valor => { mensagem = valor; }, setErro: valor => { mensagem = valor; },
      obterFechadura: async () => ++consultas === 1 ? null : 7,
      statusFechadura: async () => false,
      AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
      running: { current: false }, numeroDoComando: { current: 0 },
      setTimeout: acao => { proximaConsulta = acao; return 1; },
      clearTimeout() {},
    });
    const sair = aoAbrir();
    await new Promise(setImmediate);
    assert.equal(identificador, null);
    assert.equal(typeof proximaConsulta, 'function');
    const tentarNovamente = proximaConsulta;
    proximaConsulta = null;
    tentarNovamente();
    await new Promise(setImmediate);
    assert.equal(identificador, 7);
    assert.equal(mensagem, '');
    if (nome === 'CartaoFechadura') assert.equal(typeof proximaConsulta, 'function');
    else assert.equal(proximaConsulta, null);
    sair();
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
    AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
    acaoEmAndamento: { current: false }, numeroDoComando: { current: 0 }, setTimeout() {}, clearTimeout() {},
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
    AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
    acaoEmAndamento: { current: false }, numeroDoComando: { current: 0 }, setTimeout() {}, clearTimeout() {},
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

function consultaAutomaticaDaCamera(nome, globais) {
  const codigo = fs.readFileSync(path.join(__dirname, '../src/screens/CameraScreen.js'), 'utf8');
  const arvore = babel.parseSync(codigo, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
  const tela = arvore.program.body.find(no => no.type === 'ExportDefaultDeclaration').declaration;
  const chamadas = tela.body.body.filter(no => no.expression?.callee?.name === 'useFocusEffect');
  const trecho = chamadas.map(no => no.expression.arguments[0].arguments[0])
    .find(no => no.body.body.some(funcao => funcao.type === 'FunctionDeclaration' && funcao.id.name === nome));
  assert.ok(trecho);
  return vm.runInNewContext(`(${codigo.slice(trecho.start, trecho.end)})`, globais);
}

test('câmera consulta automaticamente, pausa em segundo plano e cancela ao sair', async () => {
  let consultas = 0;
  let agendada;
  let estado;
  const aplicativo = { currentState: 'active', addEventListener: () => ({ remove() {} }) };
  const abrir = consultaAutomaticaDaCamera('consultar', {
    cameraAtual: { id: 3 }, AppState: aplicativo,
    acaoEmAndamento: { current: false }, consultasAutomaticas: { current: { estado: false } },
    setEstadoCamera: valor => { estado = valor; }, setEstadoIa() {}, setErroConsulta() {},
    obterStatusCamera: async id => { consultas++; assert.equal(id, 3); return { status: 'online' }; },
    obterStatusIaCamera: async () => ({ estado: 'monitorando' }),
    setTimeout: (acao, intervalo) => { assert.equal(intervalo, 10000); agendada = acao; return 1; },
    clearTimeout: () => { agendada = null; },
  });
  const sair = abrir();
  await new Promise(setImmediate);
  assert.equal(estado.status, 'online');
  assert.equal(consultas, 1);
  aplicativo.currentState = 'background';
  await agendada();
  assert.equal(consultas, 1);
  aplicativo.currentState = 'active';
  await agendada();
  assert.equal(consultas, 2);
  const consultaAntiga = agendada;
  sair();
  assert.equal(agendada, null);
  await consultaAntiga();
  assert.equal(consultas, 2);
});

test('sincronização da câmera tenta novamente após erro e não cria consultas simultâneas', async () => {
  let concluir;
  let chamadas = 0;
  let agendada;
  let mensagem = '';
  const abrir = consultaAutomaticaDaCamera('sincronizar', {
    usuario: { id_usuario: 2 }, cameras: [{ id: 3 }],
    AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
    acaoEmAndamento: { current: false }, consultasAutomaticas: { current: { sincronizacao: false } },
    sincronizarCameras: id => {
      assert.equal(id, 2); chamadas++;
      if (chamadas === 1) return new Promise(resolve => { concluir = resolve; });
      return Promise.reject(Error('IA indisponível'));
    },
    setErroSincronizacao: valor => { mensagem = valor; },
    setTimeout: (acao, intervalo) => { assert.equal(intervalo, 60000); agendada = acao; return 1; },
    clearTimeout: () => { agendada = null; },
  });
  const sair = abrir();
  assert.equal(chamadas, 1);
  assert.equal(agendada, undefined);
  concluir({ erros: [] });
  await new Promise(setImmediate);
  assert.equal(mensagem, '');
  await agendada();
  assert.equal(chamadas, 2);
  assert.equal(mensagem, 'IA indisponível');
  sair();
  assert.equal(agendada, null);
});

test('abrir a fechadura envia um comando sem confirmação ou aviso de sucesso nos dois visuais', async () => {
  for (const acessivel of [false, true]) {
    const arquivo = acessivel ? 'src/components/LockButton.js' : 'src/design/LockCard.js';
    const codigo = fs.readFileSync(path.join(__dirname, '..', arquivo), 'utf8');
    const arvore = babel.parseSync(codigo, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
    const tela = acessivel
      ? arvore.program.body.flatMap(no => no.declarations || []).find(no => no.id.name === 'LockButton').init
      : arvore.program.body.find(no => no.declaration?.id?.name === 'CartaoFechadura').declaration;
    const funcao = acessivel
      ? tela.body.body.flatMap(no => no.declarations || []).find(no => no.id.name === 'handleAbrir').init
      : tela.body.body.find(no => no.id?.name === 'enviarComando');
    let comandos = 0;
    const enviar = async id => { assert.equal(id, 4); comandos++; };
    const executar = vm.runInNewContext(`(${codigo.slice(funcao.start, funcao.end)})`, {
      running: { current: false }, acaoEmAndamento: { current: false }, numeroDoComando: { current: 0 },
      id: 4, id_fechadura: 4, abrirFechadura: enviar,
      setBusy() {}, setCarregandoAbrir() {}, setRefresh() {},
      Alert: { alert() { assert.fail('Não deve abrir popup ao concluir a abertura'); } },
    });
    if (acessivel) await executar();
    else await executar(enviar, true);
    assert.equal(comandos, 1);
  }
});

test('contrast preference changes the interface in both designs and keeps readable text', () => {
  const { coresDoVisual } = carregarModulo('src/design/preferences.js');
  function brilho(hex) {
    const rgb = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  function compararCores(first, second) {
    const values = [brilho(first), brilho(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  }
  for (const adapted of [false, true]) {
    const standard = coresDoVisual({ adapted, colorVision: false });
    const adjusted = coresDoVisual({ adapted, colorVision: true });
    for (const key of ['bg', 'raised', 'text', 'muted', 'line', 'accent']) assert.notEqual(standard[key], adjusted[key]);
    assert.ok(compararCores(adjusted.text, adjusted.surface) >= 4.5);
    assert.ok(compararCores(adjusted.muted, adjusted.surface) >= 4.5);
    assert.ok(compararCores('#FFFFFF', adjusted.accent) >= 4.5);
    assert.ok(compararCores('#FFFFFF', adjusted.red) >= 4.5);
  }
});

test('contact redesign preserves phone calls, editing, deletion and saved photos', async () => {
  let edits = 0;
  let deletions = 0;
  const calls = [];
  const { default: ContactCard } = carregarModulo('src/components/ContactCard.js', {
    react: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    'react-native': { View: 'View', Image: 'Image', Pressable: 'Pressable', StyleSheet: { create: value => value },
      Linking: { openURL: async value => calls.push(value) }, Alert: { alert: () => assert.fail('Não deve falhar') } },
    '../design/DesignProvider': { useVisual: () => ({ c: {}, prefs: { adapted: false } }) },
    '../design/UI': { Icone: 'Icon', Texto: 'Text' },
  });
  const card = ContactCard({ nome_contato: 'Contato de teste', telefone: '(19) 99999-0000', foto: 'file:///foto-local.jpg', onEdit: () => edits++, onDelete: () => deletions++ });
  const elements = [];
  function percorrer(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(percorrer);
    elements.push(node);
    percorrer(node.props?.children);
  }
  percorrer(card);
  await elements.find(node => node.props?.accessibilityLabel === 'Ligar para Contato de teste').props.onPress();
  elements.find(node => node.props?.accessibilityLabel === 'Editar contato Contato de teste').props.onPress();
  elements.find(node => node.props?.accessibilityLabel === 'Excluir contato Contato de teste').props.onPress();
  assert.deepEqual(calls, ['tel:19999990000']);
  assert.equal(edits, 1);
  assert.equal(deletions, 1);
  assert.equal(elements.find(node => node.type === 'Image').props.source.uri, 'file:///foto-local.jpg');
});

test('foto do perfil é salva localmente e fica separada por conta', async () => {
  const dados = new Map([['fotos_contatos_emergencia', 'fotos-dos-contatos']]);
  const perfil = carregarModulo('src/context/FotoPerfilContext.js', {
    react: { createContext: () => ({}) }, './AuthContext': {},
    '@react-native-async-storage/async-storage': {
      getItem: async chave => dados.get(chave) || null,
      setItem: async (chave, valor) => dados.set(chave, valor), removeItem: async chave => dados.delete(chave),
    },
  });
  await perfil.guardarFotoPerfil(1, 'file:///perfil-1.jpg');
  await perfil.guardarFotoPerfil(2, 'file:///perfil-2.jpg');
  assert.equal(await perfil.lerFotoPerfil(1), 'file:///perfil-1.jpg');
  assert.equal(await perfil.lerFotoPerfil(2), 'file:///perfil-2.jpg');
  await perfil.guardarFotoPerfil(1, null);
  assert.equal(await perfil.lerFotoPerfil(1), null);
  assert.equal(await perfil.lerFotoPerfil(2), 'file:///perfil-2.jpg');
  assert.equal(dados.get('fotos_contatos_emergencia'), 'fotos-dos-contatos');
  assert.throws(() => perfil.chaveFotoPerfil(null), /Entre na sua conta/);
});

test('trocar de conta não mostra a foto do usuário anterior', () => {
  let id = 1;
  const { ProvedorFotoPerfil } = carregarModulo('src/context/FotoPerfilContext.js', {
    react: {
      createContext: () => ({ Provider: 'Contexto' }),
      createElement: (tipo, props) => ({ tipo, props }), useEffect() {}, useRef: valor => ({ current: valor }),
      useState: () => [{ idUsuario: 1, foto: 'file:///perfil-1.jpg' }, () => {}],
    },
    './AuthContext': { useAuth: () => ({ usuario: { id_usuario: id } }) },
    '@react-native-async-storage/async-storage': {},
  });
  assert.equal(ProvedorFotoPerfil({}).props.value.foto, 'file:///perfil-1.jpg');
  id = 2;
  assert.equal(ProvedorFotoPerfil({}).props.value.foto, null);
});

test('foto do perfil usa as mesmas opções da galeria dos contatos e respeita cancelamento e permissão', async () => {
  for (const caso of ['escolhida', 'cancelada', 'negada']) {
    let fotoSalva;
    let opcoes;
    let avisos = 0;
    const { Configuracoes } = carregarModulo('src/design/AppearanceScreen.js', {
      react: { createElement: (tipo, props, ...children) => ({ tipo, props: { ...props, children } }), useState: () => [false, () => {}] },
      'react-native': { Alert: { alert: () => avisos++ }, Pressable: 'Pressable', ScrollView: 'ScrollView', Switch: 'Switch', View: 'View' },
      'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
      'expo-image-picker': {
        requestMediaLibraryPermissionsAsync: async () => ({ status: caso === 'negada' ? 'denied' : 'granted' }),
        launchImageLibraryAsync: async dados => { opcoes = dados; return { canceled: caso === 'cancelada', assets: [{ uri: 'file:///nova-foto.jpg' }] }; },
      },
      './DesignProvider': { useVisual: () => ({ c: {}, prefs: {}, saving: false }) },
      './UI': { Logo: 'Logo', Botao: 'Botao', Cartao: 'Cartao', TituloSecao: 'TituloSecao', Icone: 'Icone', TituloPagina: 'TituloPagina', Linha: 'Linha', Tela: 'Tela', Texto: 'Texto' },
      '../context/AuthContext': { useAuth: () => ({ usuario: { id_usuario: 1 } }) },
      '../context/FotoPerfilContext': { useFotoPerfil: () => ({ foto: null, salvarFoto: async uri => { fotoSalva = uri; } }) },
      '../components/FotoDoPerfil': 'FotoDoPerfil',
    });
    const elementos = [];
    function percorrer(no) {
      if (!no || typeof no !== 'object') return;
      if (Array.isArray(no)) return no.forEach(percorrer);
      elementos.push(no); percorrer(no.props?.children);
    }
    percorrer(Configuracoes({ navigation: {} }));
    await elementos.find(no => no.props?.title === 'Adicionar foto de perfil').props.onPress();
    assert.equal(fotoSalva, caso === 'escolhida' ? 'file:///nova-foto.jpg' : undefined);
    assert.equal(avisos, caso === 'negada' ? 1 : 0);
    if (caso !== 'negada') {
      assert.equal(opcoes.allowsEditing, true);
      assert.equal(opcoes.quality, 0.7);
      assert.equal(Array.from(opcoes.aspect).join(','), '1,1');
      assert.equal(Array.from(opcoes.mediaTypes).join(','), 'images');
    }
  }
});

test('histórico identifica a abertura pelo app sem inventar uma tag', () => {
  let selecionado;
  const { default: CartaoAtividade } = carregarModulo('src/components/ActivitysCard.js', {
    react: { createElement: (tipo, props, ...children) => ({ tipo, props: { ...props, children } }) },
    '../design/useScreenStyles': { useEstilos: estilos => estilos },
    '../design/DesignProvider': { useVisual: () => ({ c: {}, prefs: {} }) },
    '@expo/vector-icons': { Feather: 'Feather' },
    'react-native': { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: valor => valor } },
    '../theme': { colorsLightMode: {}, typography: {} },
    '../../assets/houseIcon-entrada-permitida.svg': 'Casa', '../../assets/alertIcon-perigo.svg': 'Alerta',
    '../../assets/perigoIcon-acesso-negado2.svg': 'Negado', '../../assets/okIcon-entrada-permitida.svg': 'Correto',
  }, { Date, React: { createElement: (tipo, props, ...children) => ({ tipo, props: { ...props, children } }) } });
  for (const origem of ['aplicativo', undefined]) {
    const cartao = CartaoAtividade({ historico: { tipo: 'acesso', origem, id_tag: null, data_hora: new Date().toISOString() }, onPress: evento => { selecionado = evento; } });
    cartao.props.onPress();
    assert.equal(selecionado.titulo, 'Abertura pelo aplicativo');
    assert.equal(selecionado.origem, origem);
    assert.equal(JSON.stringify(cartao).includes('Tag null'), false);
  }
  const porTag = CartaoAtividade({ historico: { tipo: 'acesso', origem: 'rfid', id_tag: 3, data_hora: new Date().toISOString() }, onPress: evento => { selecionado = evento; } });
  porTag.props.onPress();
  assert.equal(selecionado.titulo, 'Entrada permitida');
  assert.equal(JSON.stringify(porTag).includes('Tag 3'), true);
});

test('modern contact modal saves the existing contact and preserves its photo', () => {
  const state = ['  Ana  ', ' (19) 99999-0000 ', 'file:///contato.jpg'];
  let saved;
  const { default: AddContactModal } = carregarModulo('src/components/AddContactModal.js', {
    react: {
      createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
      useState: () => [state.shift(), () => {}], useEffect() {},
    },
    'react-native': { View: 'View', Text: 'Text', Modal: 'Modal', TextInput: 'TextInput', Pressable: 'Pressable',
      Image: 'Image', ActivityIndicator: 'ActivityIndicator', KeyboardAvoidingView: 'KeyboardAvoidingView',
      ScrollView: 'ScrollView', Platform: { OS: 'android' }, StyleSheet: { create: value => value }, Alert: { alert: () => assert.fail('Dados válidos') } },
    '../design/useScreenStyles': { useEstilos: estilos => estilos },
    '../theme': { colorsLightMode: {}, typography: {} },
    'expo-image-picker': {}, '../../assets/personWhiteIcon.svg': {}, '../../assets/Pen tool.svg': {},
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 16 }) },
    '../design/DesignProvider': { useVisual: () => ({ c: {}, prefs: { adapted: false } }) },
    '../design/UI': { Botao: 'Button', Icone: 'Icon', Texto: 'Text' },
  });
  const modal = AddContactModal({ visible: true, contato: { id: 7 }, onClose() {}, onSave: value => { saved = value; }, salvando: false });
  const elements = [];
  function percorrer(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(percorrer);
    elements.push(node); percorrer(node.props?.children);
  }
  percorrer(modal);
  elements.find(node => node.type === 'Button').props.onPress();
  assert.equal(saved.id, 7);
  assert.equal(saved.nome, 'Ana');
  assert.equal(saved.telefone, '(19) 99999-0000');
  assert.equal(saved.foto, 'file:///contato.jpg');
  assert.ok(elements.some(node => node.type === 'KeyboardAvoidingView' && node.props.behavior === 'height'));
  assert.ok(elements.some(node => node.type === 'ScrollView'));
});

test('troca de cores mostra carregamento, salva a escolha e atualiza a paleta', async () => {
  const preferencias = carregarModulo('src/design/preferences.js');
  const valores = [{ adapted: false, colorVision: false, configured: true }, 1, false];
  const referencias = [];
  let posicaoEstado = 0;
  let posicaoReferencia = 0;
  let concluirGravacao;
  let gravado;
  const { ProvedorVisual } = carregarModulo('src/design/DesignProvider.js', {
    react: {
      createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
      createContext: () => ({ Provider: 'Contexto' }), useContext() {}, useEffect() {},
      useState: () => { const posicao = posicaoEstado++; return [valores[posicao], valor => { valores[posicao] = valor; }]; },
      useRef: inicial => { const posicao = posicaoReferencia++; if (!referencias[posicao]) referencias[posicao] = { current: inicial }; return referencias[posicao]; },
    },
    'react-native': { ActivityIndicator: 'Indicador', Modal: 'Modal', Text: 'Texto', View: 'View' },
    '@react-native-async-storage/async-storage': { setItem: (chave, texto) => { gravado = JSON.parse(texto); return new Promise(concluir => { concluirGravacao = concluir; }); } },
    '../context/AuthContext': { useAuth: () => ({ usuario: { id_usuario: 1, versao_adaptada: false }, setUsuario() {} }) },
    '../services/tokenStorage': { salvarUsuario: async () => {} },
    '../services/api': { atualizarPreferenciaAcessivel: () => assert.fail('Trocar cores não precisa alterar a API') },
    './preferences': preferencias,
  }, { setTimeout });
  function desenhar() { posicaoEstado = 0; posicaoReferencia = 0; return ProvedorVisual({ children: null }); }
  let tela = desenhar();
  const salvar = tela.props.value.savePreferences({ colorVision: true });
  tela = desenhar();
  assert.equal(tela.props.children[1].props.visible, true);
  assert.equal(gravado.colorVision, true);
  concluirGravacao();
  await salvar;
  tela = desenhar();
  assert.equal(tela.props.children[1].props.visible, false);
  assert.equal(tela.props.value.prefs.colorVision, true);
  assert.equal(tela.props.value.c.accent, '#123C69');
});

test('formulário acessível de contato usa as cores adaptadas nos campos', () => {
  const { coresDoVisual } = carregarModulo('src/design/preferences.js');
  const cores = coresDoVisual({ adapted: true, colorVision: true });
  const campos = ['Ana', '190', null];
  const { default: Formulario } = carregarModulo('src/components/AddContactModal.js', {
    react: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), useEffect() {}, useState: () => [campos.shift(), () => {}] },
    'react-native': { Modal: 'Modal', View: 'View', Text: 'Text', TextInput: 'Campo', Image: 'Image', Pressable: 'Pressable', ScrollView: 'Rolagem', KeyboardAvoidingView: 'Teclado', ActivityIndicator: 'Indicador', Platform: { OS: 'android' }, Alert: { alert() {} }, StyleSheet: { create: valor => valor } },
    'expo-image-picker': {},
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 16 }) },
    '../design/DesignProvider': { useVisual: () => ({ c: cores, prefs: { adapted: true, colorVision: true } }) },
    '../design/UI': { Botao: 'Botao', Icone: 'Icone', Texto: 'Texto' },
  });
  const tela = Formulario({ visible: true, contato: null, salvando: false, onClose() {}, onSave() {} });
  const encontrados = [];
  function percorrer(no) {
    if (Array.isArray(no)) return no.forEach(percorrer);
    if (!no || typeof no !== 'object') return;
    if (no.type === 'Campo') encontrados.push(no);
    percorrer(no.props?.children);
  }
  percorrer(tela);
  assert.equal(encontrados.length, 2);
  for (const campo of encontrados) {
    assert.equal(campo.props.style.color, cores.text);
    assert.equal(campo.props.style.borderColor, cores.line);
    assert.equal(campo.props.placeholderTextColor, cores.muted);
    assert.equal(campo.props.style.fontSize, 20);
    assert.equal(campo.props.style.minHeight, 64);
  }
});

function prepararTesteApi(responses, token = 'access') {
  const calls = [];
  const stored = [];
  const api = carregarModulo('src/services/api.js', {
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
  const { api, calls } = prepararTesteApi([{ body: { usuario: { id_usuario: 7, versao_adaptada: true } } }]);
  const user = await api.atualizarPreferenciaAcessivel(7, true);
  assert.equal(user.versao_adaptada, true);
  assert.match(calls[0].url, /:3000\/usuario\/7$/);
  assert.equal(calls[0].options.method, 'PUT');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer access');
  assert.deepEqual(JSON.parse(calls[0].options.body), { versao_adaptada: true });
});

test('device command refreshes expired tokens and retries the device API', async () => {
  const { api, calls, stored } = prepararTesteApi([
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
  const { api } = prepararTesteApi([{ status: 403, body: { erro: 'Sem permissão' } }]);
  await assert.rejects(api.atualizarPreferenciaAcessivel(7, true), /Sem permissão/);
});

test('explicit accessible choice at registration overrides the age default', async () => {
  const { api, calls } = prepararTesteApi([{ body: { usuario: { id_usuario: 1 } } }]);
  await api.cadastro('Pessoa', 'pessoa@example.com', '123456', '60+', false);
  assert.equal(JSON.parse(calls[0].options.body).versao_adaptada, false);
});

test('removing a lock uses the existing endpoint without trailing spaces', async () => {
  const { api, calls } = prepararTesteApi([{}]);
  await api.excluirFechadura();
  assert.match(calls[0].url, /:8080\/fechadura$/);
  assert.equal(calls[0].options.method, 'DELETE');
});
