package com.safenest;

import com.safenest.controller.FechaduraController;
import com.safenest.model.Acesso;
import com.safenest.repository.*;
import com.safenest.service.*;
import org.eclipse.paho.client.mqttv3.*;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AberturaPeloAppTest {
    private final DispositivosService dispositivos = mock(DispositivosService.class);
    private final MqttListenerService mensagens = mock(MqttListenerService.class);
    private final FechaduraController controlador = new FechaduraController(
            dispositivos, mock(SalaDeEsperaService.class), mensagens);

    private MockHttpServletRequest prepararConta() {
        MockHttpServletRequest pedido = new MockHttpServletRequest();
        pedido.setAttribute("id_usuario", 7L);
        when(dispositivos.buscarFechaduraPorUsuario(7L)).thenReturn(2L);
        when(dispositivos.buscarFechadura(2L)).thenReturn("MAC-DE-TESTE");
        return pedido;
    }

    @Test
    void registraSomenteDepoisDeEnviarOComando() {
        MockHttpServletRequest pedido = prepararConta();
        when(mensagens.publish(anyString(), anyString())).thenReturn(true);
        assertEquals(200, controlador.abrirFechadura(pedido).getStatusCode().value());
        var ordem = inOrder(mensagens, dispositivos);
        ordem.verify(mensagens).publish("fechadura/MAC-DE-TESTE/comando", "{\"comando\":\"abrirfechadura\"}");
        ordem.verify(dispositivos).registrarAberturaPeloApp(7L);
    }

    @Test
    void naoRegistraQuandoOMqttFalha() {
        assertEquals(503, controlador.abrirFechadura(prepararConta()).getStatusCode().value());
        verify(dispositivos, never()).registrarAberturaPeloApp(anyLong());
    }

    @Test
    void naoAbreNemRegistraQuandoOUsuarioBloqueouOAcesso() {
        MockHttpServletRequest pedido = prepararConta();
        when(dispositivos.verificarTrancada(2L)).thenReturn(true);
        assertEquals(409, controlador.abrirFechadura(pedido).getStatusCode().value());
        verify(mensagens, never()).publish(anyString(), anyString());
        verify(dispositivos, never()).registrarAberturaPeloApp(anyLong());
    }

    @Test
    void acessoPeloAppTemUsuarioDataEOrigemSemInventarUmaTag() {
        AcessoRepository acessos = mock(AcessoRepository.class);
        DispositivosService servico = new DispositivosService(mock(MqttPublisherService.class),
                mock(FechaduraRepository.class), mock(NfcTagRepository.class), acessos, mock(AlertaRepository.class));
        servico.registrarAberturaPeloApp(7L);
        ArgumentCaptor<Acesso> registro = ArgumentCaptor.forClass(Acesso.class);
        verify(acessos).save(registro.capture());
        assertEquals(7L, registro.getValue().getIdUsuario());
        assertEquals("aplicativo", registro.getValue().getOrigem());
        assertNull(registro.getValue().getIdTag());
        assertNotNull(registro.getValue().getDataHora());
        assertEquals("rfid", new Acesso().getOrigem());
    }

    @Test
    void publicacaoMqttInformaFalhaAoChamador() throws Exception {
        MqttClient cliente = mock(MqttClient.class);
        doThrow(new MqttException(MqttException.REASON_CODE_CLIENT_NOT_CONNECTED))
                .when(cliente).publish(anyString(), any(MqttMessage.class));
        MqttListenerService servico = new MqttListenerService(cliente, dispositivos, mock(SalaDeEsperaService.class));
        assertFalse(servico.publish("topico-de-teste", "mensagem-de-teste"));
    }
}
