package com.safenest.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.*;

@Service
public class SalaDeEsperaService {

    private final Map<String, CompletableFuture<Object>> pendentes = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public CompletableFuture<Object> aguardarResposta(String correlationId) {
        return aguardarResposta(correlationId, 8000);
    }

    public CompletableFuture<Object> aguardarResposta(String correlationId, long tempoLimiteMs) {
        CompletableFuture<Object> future = new CompletableFuture<>();
        pendentes.put(correlationId, future);

        ScheduledFuture<?> timeoutTask = scheduler.schedule(() -> {
            CompletableFuture<Object> pendente = pendentes.remove(correlationId);
            if (pendente != null) {
                pendente.completeExceptionally(
                        new TimeoutException("timeout: fechadura não respondeu a tempo"));
            }
        }, tempoLimiteMs, TimeUnit.MILLISECONDS);

        future.whenComplete((resultado, erro) -> timeoutTask.cancel(false));

        return future;
    }

    public void resolverResposta(String correlationId, Object payload) {
        CompletableFuture<Object> pendente = pendentes.remove(correlationId);
        if (pendente == null) return;

        pendente.complete(payload);
    }
}
