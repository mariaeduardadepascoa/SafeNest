
const pendentes = new Map();

function aguardarResposta(correlationId, tempoLimiteMs = 8000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendentes.delete(correlationId);
            reject(new Error("timeout: fechadura não respondeu a tempo"));
        }, tempoLimiteMs);

        pendentes.set(correlationId, { resolve, timeout });
    });
}

function resolverResposta(correlationId, payload) {
    const pendente = pendentes.get(correlationId);
    if (!pendente) return; 

    clearTimeout(pendente.timeout);
    pendentes.delete(correlationId);
    pendente.resolve(payload);
}

module.exports = { aguardarResposta, resolverResposta };