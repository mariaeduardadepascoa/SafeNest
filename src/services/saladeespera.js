// "Sala de espera": guarda quem está esperando a resposta de qual protocolo (correlationId)
const pendentes = new Map();

/**
 * Chame essa função quando você MANDA um comando e quer esperar a resposta da fechadura.
 * Retorna uma Promise que:
 *  - resolve quando a resposta certa chegar (via resolverResposta)
 *  - rejeita se o tempo limite acabar antes disso
 */
function aguardarResposta(correlationId, tempoLimiteMs = 8000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendentes.delete(correlationId);
            reject(new Error("timeout: fechadura não respondeu a tempo"));
        }, tempoLimiteMs);

        pendentes.set(correlationId, { resolve, timeout });
    });
}

/**
 * Chame essa função no lugar onde você ESCUTA as mensagens MQTT que a fechadura manda de volta.
 * Ela procura quem estava esperando esse correlationId e libera a resposta pra ele.
 */
function resolverResposta(correlationId, payload) {
    const pendente = pendentes.get(correlationId);
    if (!pendente) return; // ninguém esperando esse protocolo (ou já deu timeout)

    clearTimeout(pendente.timeout);
    pendentes.delete(correlationId);
    pendente.resolve(payload);
}

module.exports = { aguardarResposta, resolverResposta };