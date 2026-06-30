function trocaTab(id) {
    const tabIr = document.getElementById(id);
    const inicio = document.getElementById("nav-inicio");
    const camera = document.getElementById("nav-camera");
    const historico = document.getElementById("nav-historico");
    const emergencia = document.getElementById("nav-emergencia");

    inicio.classList.remove("nav-tab-ativo");
    camera.classList.remove("nav-tab-ativo");
    historico.classList.remove("nav-tab-ativo");
    emergencia.classList.remove("nav-tab-ativo");

    const inicioContent = document.getElementById("inicio-content");
    const cameraContent = document.getElementById("camera-content");
    const historicoContent = document.getElementById("historico-content");
    const emergenciaContent = document.getElementById("emergencia-content");

    inicioContent.classList.remove("content-ativo");
    cameraContent.classList.remove("content-ativo");
    historicoContent.classList.remove("content-ativo");
    emergenciaContent.classList.remove("content-ativo");

    if (id === "nav-inicio") {
        inicioContent.classList.add("content-ativo");
    } else if (id === "nav-camera") {
        cameraContent.classList.add("content-ativo");
    } else if (id === "nav-historico") {
        historicoContent.classList.add("content-ativo");
    } else if (id === "nav-emergencia") {
        emergenciaContent.classList.add("content-ativo");
    }


    tabIr.classList.add("nav-tab-ativo");
}