"use strict";

/* ============================================================
   MEUS MOMENTOS
   SCRIPT PRINCIPAL
============================================================ */


/* ============================================================
   CONFIGURAÇÕES
============================================================ */

const TOTAL_ALBUNS = 15;
const LIMITE_FOTOS_POR_ALBUM = 300;


/* ============================================================
   ESTADO DOS ÁLBUNS
============================================================ */

let albuns = [];

let albumAtual = null;


/* ============================================================
   ELEMENTOS DO HTML
============================================================ */

const listaAlbuns =
    document.getElementById("listaAlbuns");

const modalAlbum =
    document.getElementById("modalAlbum");

const conteudoAlbum =
    document.getElementById("conteudoAlbum");

const fecharModal =
    document.getElementById("fecharModal");

const modalEdicao =
    document.getElementById("modalEdicao");

const fecharEdicao =
    document.getElementById("fecharEdicao");

const nomeLugar =
    document.getElementById("nomeLugar");

const descricaoLugar =
    document.getElementById("descricaoLugar");

const salvarEdicao =
    document.getElementById("salvarEdicao");

const cancelarEdicao =
    document.getElementById("cancelarEdicao");


/* ============================================================
   CRIAR ÁLBUNS INICIAIS
============================================================ */

function criarAlbunsIniciais() {

    const resultado = [];

    for (let i = 1; i <= TOTAL_ALBUNS; i++) {

        resultado.push({
            id: i,
            nome: "",
            descricao: "",
            capa: "",
            fotos: []
        });
    }

    return resultado;
}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

function iniciar() {

    albuns = criarAlbunsIniciais();

    renderizarAlbuns();
}


/* ============================================================
   RENDERIZAR ÁLBUNS
============================================================ */

function renderizarAlbuns() {

    if (!listaAlbuns) {
        return;
    }

    listaAlbuns.innerHTML = "";

    albuns.forEach(album => {

        const card =
            document.createElement("article");

        card.className =
            "album-card";

        card.dataset.id =
            album.id;


        /* ====================================================
           CAPA
        ==================================================== */

        const capa =
            document.createElement("div");

        capa.className =
            "album-capa";


        if (album.capa) {

            const imagem =
                document.createElement("img");

            imagem.src =
                album.capa;

            imagem.alt =
                album.nome ||
                `Álbum ${album.id}`;

            capa.appendChild(
                imagem
            );

        } else {

            const placeholder =
                document.createElement("div");

            placeholder.className =
                "album-placeholder";

            placeholder.innerHTML = `
                <span class="icone">📸</span>

                <strong>
                    ${album.nome || "Novo lugar"}
                </strong>

                <span>
                    Clique para adicionar suas fotos
                </span>
            `;

            capa.appendChild(
                placeholder
            );
        }


        /* ====================================================
           OVERLAY
        ==================================================== */

        const overlay =
            document.createElement("div");

        overlay.className =
            "album-overlay";


        /* ====================================================
           INFORMAÇÕES
        ==================================================== */

        const info =
            document.createElement("div");

        info.className =
            "album-info";


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            album.nome ||
            `Lugar ${album.id}`;


        const descricao =
            document.createElement("p");

        descricao.textContent =
            album.descricao ||
            `${album.fotos.length} foto(s)`;


        info.appendChild(
            titulo
        );

        info.appendChild(
            descricao
        );


        /* ====================================================
           BOTÃO EDITAR
        ==================================================== */

        const botaoEditar =
            document.createElement("button");

        botaoEditar.type =
            "button";

        botaoEditar.className =
            "botao-editar";

        botaoEditar.innerHTML =
            "✏️";

        botaoEditar.title =
            "Editar lugar";


        botaoEditar.addEventListener(
            "click",
            evento => {

                evento.stopPropagation();

                abrirEdicao(
                    album.id
                );
            }
        );


        /* ====================================================
           MONTAR CARD
        ==================================================== */

        card.appendChild(
            capa
        );

        card.appendChild(
            overlay
        );

        card.appendChild(
            info
        );

        card.appendChild(
            botaoEditar
        );


        /* ====================================================
           ABRIR ÁLBUM
        ==================================================== */

        card.addEventListener(
            "click",
            () => {

                abrirAlbum(
                    album.id
                );
            }
        );


        listaAlbuns.appendChild(
            card
        );
    });
}


/* ============================================================
   ABRIR ÁLBUM
============================================================ */

function abrirAlbum(id) {

    const album =
        albuns.find(
            item =>
                item.id === id
        );

    if (!album) {
        return;
    }

    albumAtual =
        id;

    renderizarConteudoAlbum(
        album
    );

    modalAlbum.classList.add(
        "ativo"
    );

    modalAlbum.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


/* ============================================================
   RENDERIZAR CONTEÚDO DO ÁLBUM
============================================================ */

function renderizarConteudoAlbum(album) {

    conteudoAlbum.innerHTML = "";


    /* ====================================================
       TÍTULO
    ==================================================== */

    const titulo =
        document.createElement("h2");

    titulo.textContent =
        album.nome ||
        `Lugar ${album.id}`;


    /* ====================================================
       DESCRIÇÃO
    ==================================================== */

    const descricao =
        document.createElement("p");

    descricao.className =
        "descricao";

    descricao.textContent =
        album.descricao ||
        "Este álbum ainda não possui uma descrição.";


    /* ====================================================
       INPUT DE FOTO
    ==================================================== */

    const inputFoto =
        document.createElement("input");

    inputFoto.type =
        "file";

    inputFoto.accept =
        "image/*";

    inputFoto.multiple =
        true;

    inputFoto.style.display =
        "none";


    /* ====================================================
       BOTÃO ADICIONAR FOTO
    ==================================================== */

    const botaoAdicionar =
        document.createElement("button");

    botaoAdicionar.type =
        "button";

    botaoAdicionar.className =
        "botao-principal";

    botaoAdicionar.innerHTML =
        "📸 Adicionar fotos";


    botaoAdicionar.addEventListener(
        "click",
        () => {

            inputFoto.click();
        }
    );


    /* ====================================================
       SELECIONAR FOTOS
    ==================================================== */

    inputFoto.addEventListener(
        "change",
        evento => {

            processarFotos(
                evento.target.files,
                album
            );

            inputFoto.value =
                "";
        }
    );


    /* ====================================================
       BOTÃO EDITAR
    ==================================================== */

    const botaoEditar =
        document.createElement("button");

    botaoEditar.type =
        "button";

    botaoEditar.className =
        "botao-secundario";

    botaoEditar.innerHTML =
        "✏️ Editar informações";


    botaoEditar.addEventListener(
        "click",
        () => {

            fecharModalAlbum();

            abrirEdicao(
                album.id
            );
        }
    );


    /* ====================================================
       AÇÕES
    ==================================================== */

    const acoes =
        document.createElement("div");

    acoes.className =
        "acoes-edicao";

    acoes.appendChild(
        botaoAdicionar
    );

    acoes.appendChild(
        botaoEditar
    );


    /* ====================================================
       GALERIA
    ==================================================== */

    const galeria =
        document.createElement("div");

    galeria.className =
        "galeria";


    album.fotos.forEach(
        (foto, indice) => {

            const item =
                document.createElement("div");

            item.className =
                "galeria-item";


            /* ================================================
               IMAGEM
            ================================================= */

            const imagem =
                document.createElement("img");

            imagem.src =
                foto;

            imagem.alt =
                `${album.nome || "Foto"} ${indice + 1}`;


            /* ================================================
               BOTÃO APAGAR
            ================================================= */

            const botaoApagar =
                document.createElement("button");

            botaoApagar.type =
                "button";

            botaoApagar.innerHTML =
                "🗑️";

            botaoApagar.title =
                "Apagar foto";

            botaoApagar.className =
                "botao-apagar-foto";


            botaoApagar.addEventListener(
                "click",
                evento => {

                    evento.stopPropagation();


                    const confirmar =
                        confirm(
                            "Tem certeza que deseja apagar esta foto?"
                        );


                    if (!confirmar) {
                        return;
                    }


                    /* ========================================
                       APAGAR FOTO
                    ======================================== */

                    album.fotos.splice(
                        indice,
                        1
                    );


                    /* ========================================
                       SE ERA A CAPA
                    ======================================== */

                    if (
                        album.capa === foto
                    ) {

                        if (
                            album.fotos.length > 0
                        ) {

                            album.capa =
                                album.fotos[0];

                        } else {

                            album.capa =
                                "";
                        }
                    }


                    /* ========================================
                       ATUALIZAR TELA
                    ======================================== */

                    renderizarAlbuns();

                    renderizarConteudoAlbum(
                        album
                    );
                }
            );


            /* ================================================
               ABRIR FOTO GRANDE
            ================================================= */

            item.addEventListener(
                "click",
                () => {

                    abrirFotoGrande(
                        foto,
                        album.nome
                    );
                }
            );


            item.appendChild(
                imagem
            );

            item.appendChild(
                botaoApagar
            );


            galeria.appendChild(
                item
            );
        }
    );


    /* ====================================================
       ÁLBUM SEM FOTOS
    ==================================================== */

    if (
        album.fotos.length === 0
    ) {

        const vazio =
            document.createElement("p");

        vazio.className =
            "descricao";

        vazio.textContent =
            "Ainda não existem fotos neste lugar.";

        galeria.appendChild(
            vazio
        );
    }


    /* ====================================================
       MONTAR CONTEÚDO
    ==================================================== */

    conteudoAlbum.appendChild(
        titulo
    );

    conteudoAlbum.appendChild(
        descricao
    );

    conteudoAlbum.appendChild(
        acoes
    );

    conteudoAlbum.appendChild(
        inputFoto
    );

    conteudoAlbum.appendChild(
        galeria
    );
}


/* ============================================================
   PROCESSAR FOTOS
============================================================ */

function processarFotos(
    arquivos,
    album
) {

    if (
        !arquivos ||
        arquivos.length === 0
    ) {
        return;
    }


    const quantidadeDisponivel =
        LIMITE_FOTOS_POR_ALBUM -
        album.fotos.length;


    if (
        quantidadeDisponivel <= 0
    ) {

        alert(
            `Este álbum já atingiu o limite de ${LIMITE_FOTOS_POR_ALBUM} fotos.`
        );

        return;
    }


    const arquivosSelecionados =
        Array.from(
            arquivos
        ).slice(
            0,
            quantidadeDisponivel
        );


    arquivosSelecionados.forEach(
        arquivo => {

            if (
                !arquivo.type.startsWith(
                    "image/"
                )
            ) {
                return;
            }


            const leitor =
                new FileReader();


            leitor.onload =
                evento => {

                    album.fotos.push(
                        evento.target.result
                    );


                    /* =========================================
                       PRIMEIRA FOTO VIRA CAPA
                    ========================================= */

                    if (
                        !album.capa
                    ) {

                        album.capa =
                            evento.target.result;
                    }


                    renderizarAlbuns();


                    if (
                        albumAtual ===
                        album.id
                    ) {

                        renderizarConteudoAlbum(
                            album
                        );
                    }
                };


            leitor.readAsDataURL(
                arquivo
            );
        }
    );


    if (
        arquivos.length >
        quantidadeDisponivel
    ) {

        alert(
            `Foram selecionadas mais fotos do que o limite disponível. Apenas ${quantidadeDisponivel} serão adicionadas.`
        );
    }
}


/* ============================================================
   ABRIR FOTO GRANDE
============================================================ */

function abrirFotoGrande(
    foto,
    nomeAlbum
) {

    const modalFoto =
        document.createElement("div");

    modalFoto.className =
        "modal ativo";


    const conteudo =
        document.createElement("div");

    conteudo.className =
        "modal-conteudo";

    conteudo.style.textAlign =
        "center";


    const fechar =
        document.createElement("button");

    fechar.type =
        "button";

    fechar.className =
        "fechar-modal";

    fechar.innerHTML =
        "×";


    const imagem =
        document.createElement("img");

    imagem.src =
        foto;

    imagem.alt =
        nomeAlbum ||
        "Foto";

    imagem.style.width =
        "100%";

    imagem.style.maxHeight =
        "75vh";

    imagem.style.objectFit =
        "contain";

    imagem.style.borderRadius =
        "16px";


    fechar.addEventListener(
        "click",
        () => {

            modalFoto.remove();
        }
    );


    modalFoto.addEventListener(
        "click",
        evento => {

            if (
                evento.target ===
                modalFoto
            ) {

                modalFoto.remove();
            }
        }
    );


    conteudo.appendChild(
        fechar
    );

    conteudo.appendChild(
        imagem
    );

    modalFoto.appendChild(
        conteudo
    );

    document.body.appendChild(
        modalFoto
    );
}


/* ============================================================
   ABRIR EDIÇÃO
============================================================ */

function abrirEdicao(id) {

    const album =
        albuns.find(
            item =>
                item.id === id
        );

    if (!album) {
        return;
    }


    albumAtual =
        album.id;


    nomeLugar.value =
        album.nome;


    descricaoLugar.value =
        album.descricao;


    modalEdicao.classList.add(
        "ativo"
    );

    modalEdicao.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


/* ============================================================
   SALVAR EDIÇÃO
============================================================ */

function salvarAlteracoes() {

    if (
        albumAtual === null
    ) {
        return;
    }


    const album =
        albuns.find(
            item =>
                item.id === albumAtual
        );


    if (!album) {
        return;
    }


    const novoNome =
        nomeLugar.value.trim();


    const novaDescricao =
        descricaoLugar.value.trim();


    album.nome =
        novoNome;


    album.descricao =
        novaDescricao;


    fecharModalEdicao();


    renderizarAlbuns();


    if (
        modalAlbum.classList.contains(
            "ativo"
        )
    ) {

        renderizarConteudoAlbum(
            album
        );
    }
}


/* ============================================================
   FECHAR ÁLBUM
============================================================ */

function fecharModalAlbum() {

    modalAlbum.classList.remove(
        "ativo"
    );

    modalAlbum.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}


/* ============================================================
   FECHAR EDIÇÃO
============================================================ */

function fecharModalEdicao() {

    modalEdicao.classList.remove(
        "ativo"
    );

    modalEdicao.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}


/* ============================================================
   EVENTOS DOS BOTÕES
============================================================ */

if (fecharModal) {

    fecharModal.addEventListener(
        "click",
        fecharModalAlbum
    );
}


if (fecharEdicao) {

    fecharEdicao.addEventListener(
        "click",
        fecharModalEdicao
    );
}


if (salvarEdicao) {

    salvarEdicao.addEventListener(
        "click",
        salvarAlteracoes
    );
}


if (cancelarEdicao) {

    cancelarEdicao.addEventListener(
        "click",
        fecharModalEdicao
    );
}


/* ============================================================
   CLICAR FORA DO MODAL
============================================================ */

if (modalAlbum) {

    modalAlbum.addEventListener(
        "click",
        evento => {

            if (
                evento.target ===
                modalAlbum
            ) {

                fecharModalAlbum();
            }
        }
    );
}


if (modalEdicao) {

    modalEdicao.addEventListener(
        "click",
        evento => {

            if (
                evento.target ===
                modalEdicao
            ) {

                fecharModalEdicao();
            }
        }
    );
}


/* ============================================================
   TECLA ESC
============================================================ */

document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key ===
            "Escape"
        ) {

            fecharModalAlbum();

            fecharModalEdicao();
        }
    }
);


/* ============================================================
   INICIAR SISTEMA
============================================================ */

iniciar();