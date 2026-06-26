//DADOS DO APP E SITE PARA A VISU DO USUARIO

const historico = [
    { //ficticio
        id: 1,
        tipo_evento: 'Vibração suspeita',
        timestamp: '2026-06-21T14:30:00Z'
    }
];

exports.obterHistorico = (req, res) => {
    try {
        // No futuro: const data = await supabase.from...
        return res.status(200).json(historico);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar histórico" });
    }
};