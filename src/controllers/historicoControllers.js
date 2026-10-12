const historico = require('../models/historico');

exports.obterHistorico = async (req, res) => {
    try {
        const { id } = req.params;

        // para as duas funções do model serem chamadas ao mesmo tempo
        const [acessos, alertas] = await Promise.all([
            historico.obterAcessos(id),
            historico.obterAlertas(id)
        ]);

        if (!acessos) {
            return res.status(500).json({ erro: "Erro ao buscar os acessos desse usuario" });
        }

        if (!alertas) {
            return res.status(500).json({ erro: "Erro ao buscar os alertas desse usuario" });
        }

        // lista filtrada por data
        let acessosComTipo = acessos.map((item) => ({ ...item, tipo: 'acesso' }));
        let alertasComTipo = alertas.map((item) => ({ ...item, tipo: 'alerta' }));

        const lista = [...acessosComTipo, ...alertasComTipo].sort ( //.sort organiza a lista do mais recente ao mais antigo
            (a, b) => new Date(b.data_hora) - new Date(a.data_hora)
        );

        return res.status(200).json(lista);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}