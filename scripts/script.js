// script.js - atualizado
// ============================================
// CONFIG — um vídeo de hero por tema
// ============================================
const VIDEO_SOURCES = {
    tema1: "midia/videos/VideoInicioLilas.mp4", // TODO: trocar pelo vídeo do tema Blue
    tema2: "midia/videos/VideoInicioLilas.mp4", // tema Purple / Lilás
    tema3: "midia/videos/VideoInicioLilas.mp4", // TODO: trocar pelo vídeo do tema Black
};

// Imagens de fundo dos 3 cards de solução
const SOLUCAO_IMAGENS = {
    tema1: {
        camera: "midia/imgs/Azul/CameraDesconstruçãoAzul.png",
        smartPop: "midia/imgs/Azul/SmartPopAzul.png",
        joviEdu: "midia/imgs/Azul/JoviEduAzul.png",
    },
    tema2: {
        camera: "midia/imgs/Lilas/CameraDesconstruçãoLilas.png",
        smartPop: "midia/imgs/Lilas/SmartPopLilas.png",
        joviEdu: "midia/imgs/Lilas/JoviEduLilas.png",
    },
    tema3: {
        camera: "midia/imgs/Preto/CameraDesconstruçãoPreto.png",
        smartPop: "midia/imgs/Preto/SmartPopPreto.png",
        joviEdu: "midia/imgs/Preto/JoviEduPreto.png",
    },
};

// ============================================
// MENU — destaque do link ativo conforme o scroll
// ============================================

const sections = document.querySelectorAll("section[id]");
const links = document.querySelectorAll(".menu-link");

function atualizarMenuAtivo() {
    let atual = "";

    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 150) {
            atual = section.id;
        }
    });

    links.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${atual}`);
    });
}

// ============================================
// SISTEMA DE TEMAS
// ============================================

const heroVideo = document.getElementById("heroScrollVideo");
const solucaoImagem1 = document.getElementById("solucaoImagem1");
const solucaoImagem2 = document.getElementById("solucaoImagem2");
const solucaoImagem3 = document.getElementById("solucaoImagem3");
const temaInputs = {
    tema1: document.getElementById("tema1"),
    tema2: document.getElementById("tema2"),
    tema3: document.getElementById("tema3"),
};

function aplicarTema(tema, { persistir = true } = {}) {
    document.body.classList.remove("tema1", "tema2", "tema3");
    document.body.classList.add(tema);

    if (persistir) {
        localStorage.setItem("jovi-tema", tema);
    }

    trocarVideoDoTema(tema);
    trocarImagemDaSolucao(tema);
}

function trocarVideoDoTema(tema) {
    const novaFonte = VIDEO_SOURCES[tema];
    if (!heroVideo || !novaFonte) return;

    if (heroVideo.dataset.src === novaFonte) return;

    heroVideo.dataset.src = novaFonte;
    heroVideo.src = novaFonte;
    heroVideo.load();
}

function trocarImagemDaSolucao(tema) {
    const imagens = SOLUCAO_IMAGENS[tema];
    if (!imagens) return;

    if (solucaoImagem1 && imagens.camera) {
        solucaoImagem1.style.backgroundImage = `url("${imagens.camera}")`;
    }
    if (solucaoImagem2 && imagens.smartPop) {
        solucaoImagem2.style.backgroundImage = `url("${imagens.smartPop}")`;
    }
    if (solucaoImagem3 && imagens.joviEdu) {
        solucaoImagem3.style.backgroundImage = `url("${imagens.joviEdu}")`;
    }
}

Object.entries(temaInputs).forEach(([tema, input]) => {
    input?.addEventListener("click", () => aplicarTema(tema));
});

// Restaura o tema salvo
const temaSalvo = localStorage.getItem("jovi-tema") || "tema1";
document.body.classList.remove("tema1", "tema2", "tema3");
document.body.classList.add(temaSalvo);
if (temaInputs[temaSalvo]) temaInputs[temaSalvo].checked = true;
trocarVideoDoTema(temaSalvo);
trocarImagemDaSolucao(temaSalvo);

// ============================================
// HERO — vídeo e slogan controlados pelo scroll
// ============================================

const heroTrack = document.querySelector(".hero-scroll-track");
const headerEl = document.querySelector("header");
const veja = document.getElementById("veja");
const entenda = document.getElementById("entenda");
const capture = document.getElementById("capture");
const descricao = document.getElementById("heroDescricao");
const scrollProgressBar = document.getElementById("scrollProgress");

function atualizarLogoPorScroll() {
    if (!heroTrack || !headerEl) return;
    const aindaSobreHero = heroTrack.getBoundingClientRect().bottom > 100;
    headerEl.classList.toggle("past-hero", !aindaSobreHero);
}

if (heroVideo && heroTrack) {

    let duration = 0;

    heroVideo.addEventListener("loadedmetadata", () => {
        duration = heroVideo.duration || 0;
        atualizarHero();
    });

    heroVideo.addEventListener("play", () => heroVideo.pause());

    const clamp01 = x => Math.min(1, Math.max(0, x));
    const PASSO_VIDEO = 0.1;

    function quantizar(valor, passo) {
        return clamp01(Math.round(valor / passo) * passo);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function smoothstep(edge0, edge1, x) {
        const t = clamp01((x - edge0) / (edge1 - edge0));
        return t * t * (3 - 2 * t);
    }

    function faixaDaPalavra(progress, inicio, fim, fimDestaque, fimEsmaecer) {
        const entrada = smoothstep(inicio, fim, progress);
        const destaque = fimEsmaecer
            ? clamp01(entrada - smoothstep(fimDestaque, fimEsmaecer, progress))
            : entrada;
        return { in: entrada, active: destaque };
    }

    function aplicarFaixa(el, faixa) {
        if (!el) return;
        el.style.setProperty("--in", faixa.in.toFixed(3));
        el.style.setProperty("--active", faixa.active.toFixed(3));
    }

    function atualizarTexto(progress) {
        aplicarFaixa(veja, faixaDaPalavra(progress, 0, 0.08, 0.24, 0.34));
        aplicarFaixa(entenda, faixaDaPalavra(progress, 0.20, 0.28, 0.46, 0.56));
        aplicarFaixa(capture, faixaDaPalavra(progress, 0.42, 0.50, 1, null));

        if (descricao) {
            descricao.style.setProperty("--in", smoothstep(0.80, 0.92, progress).toFixed(3));
        }
    }

    function atualizarHero() {
        if (!duration) return;

        const rect = heroTrack.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const scrolled = -rect.top;

        const progress = clamp01(scrollable > 0 ? scrolled / scrollable : 0);
        const progressoVideo = quantizar(progress, PASSO_VIDEO);

        heroVideo.currentTime = easeInOutCubic(progressoVideo) * duration;
        atualizarTexto(progress);
    }

    let precisaAtualizar = false;
    function agendarAtualizacao() {
        if (precisaAtualizar) return;
        precisaAtualizar = true;
        requestAnimationFrame(() => {
            atualizarHero();
            atualizarBarraDeProgresso();
            atualizarMenuAtivo();
            atualizarLogoPorScroll();
            precisaAtualizar = false;
        });
    }

    function atualizarBarraDeProgresso() {
        if (!scrollProgressBar) return;
        const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
        const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
        scrollProgressBar.style.width = `${clamp01(progresso / 100) * 100}%`;
    }

    window.addEventListener("scroll", agendarAtualizacao, { passive: true });
    window.addEventListener("resize", agendarAtualizacao, { passive: true });

    if (heroVideo.readyState >= 1) {
        duration = heroVideo.duration;
    }
    agendarAtualizacao();
}