package com.safenest.service;

import com.safenest.model.Acesso;
import com.safenest.model.Alerta;
import com.safenest.model.Fechadura;
import com.safenest.model.NfcTag;
import com.safenest.repository.AcessoRepository;
import com.safenest.repository.AlertaRepository;
import com.safenest.repository.FechaduraRepository;
import com.safenest.repository.NfcTagRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DispositivosService {

    private final FechaduraRepository fechaduraRepository;
    private final NfcTagRepository nfcTagRepository;
    private final AcessoRepository acessoRepository;
    private final AlertaRepository alertaRepository;

    public DispositivosService(FechaduraRepository fechaduraRepository,
                                NfcTagRepository nfcTagRepository,
                                AcessoRepository acessoRepository,
                                AlertaRepository alertaRepository) {
        this.fechaduraRepository = fechaduraRepository;
        this.nfcTagRepository = nfcTagRepository;
        this.acessoRepository = acessoRepository;
        this.alertaRepository = alertaRepository;
    }

    public String buscarFechadura(Long idFechadura) {
        return fechaduraRepository.findById(idFechadura)
                .map(Fechadura::getMacAddress)
                .orElse(null);
    }

    public Long buscarFechaduraPorMacAddress(String mac) {
        return fechaduraRepository.findByMacAddress(mac)
                .map(Fechadura::getId)
                .orElse(null);
    }

    public Long buscarFechaduraPorUsuario(Long idUsuario) {
        return fechaduraRepository.findByIdUsuario(idUsuario)
                .map(Fechadura::getId)
                .orElse(null);
    }

    public boolean verificarTag(String tag, Long idFechadura) {
        return nfcTagRepository.findByUidNfcAndIdFechadura(tag, idFechadura).isPresent();
    }

    public NfcTag salvarRegistroNoBanco(Long idUsuario, String uidNfc, Long idFechadura, String userName) {
        NfcTag nfcTag = new NfcTag();
        nfcTag.setIdUsuario(idUsuario);
        nfcTag.setUidNfc(uidNfc);
        nfcTag.setIdFechadura(idFechadura);
        nfcTag.setDataHora(LocalDateTime.now());
        nfcTag.setNomeTag(userName);
        return nfcTagRepository.save(nfcTag);
    }

    public Fechadura cadastrarFechaduraNoBanco(String macAddress, Long idUsuario) {
        Fechadura fechadura = new Fechadura();
        fechadura.setIdUsuario(idUsuario);
        fechadura.setMacAddress(macAddress);
        fechadura.setStatus(true);
        fechadura.setDataHora(LocalDateTime.now());
        fechadura.setBlocked(false);
        return fechaduraRepository.save(fechadura);
    }

    // retorna o valor de "blocked", ou null se a fechadura nao existir
    public Boolean verificarTrancada(Long idFechadura) {
        return fechaduraRepository.findById(idFechadura)
                .map(Fechadura::getBlocked)
                .orElse(null);
    }

    public Acesso addAcesso(String tag, Long idUsuario) {
        Acesso acesso = new Acesso();
        acesso.setIdTag(tag);
        acesso.setIdUsuario(idUsuario);
        return acessoRepository.save(acesso);
    }

    public Alerta addAlerta(String tipo, Long idUsuario) {
        Alerta alerta = new Alerta();
        alerta.setTipoAlerta(tipo);
        alerta.setIdUsuario(idUsuario);
        return alertaRepository.save(alerta);
    }

    public List<Alerta> obterAlertas(Long idUsuario) {
        return alertaRepository.findByIdUsuario(idUsuario);
    }

    public List<Acesso> obterAcessos(Long idUsuario) {
        return acessoRepository.findByIdUsuario(idUsuario);
    }

    public Long buscarUsuarioPorFechadura(Long idFechadura) {
        return fechaduraRepository.findById(idFechadura)
                .map(Fechadura::getIdUsuario)
                .orElse(null);
    }

    public boolean removerFechaduraDoBanco(Long idFechadura) {
        if (!fechaduraRepository.existsById(idFechadura)) {
            return false;
        }
        fechaduraRepository.deleteById(idFechadura);
        return true;
    }

    public Fechadura atualizarStatusFechadura(Long idFechadura, boolean blocked) {
        return fechaduraRepository.findById(idFechadura)
                .map(f -> {
                    f.setBlocked(blocked);
                    return fechaduraRepository.save(f);
                })
                .orElse(null);
    }
}
