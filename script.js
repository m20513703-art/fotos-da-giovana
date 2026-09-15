"use strict";

/* ============================================================
   MEUS MOMENTOS
   SCRIPT PRINCIPAL
   VERSÃO COM INDEXEDDB
============================================================ */


/* ============================================================
   CONFIGURAÇÕES
============================================================ */

const TOTAL_ALBUNS = 15;

const LIMITE_FOTOS_POR_ALBUM = 300;

const NOME_BANCO = "MeusMomentosDB";

const VERSAO_BANCO = 1;

const NOME_TABELA = "albuns";


/* ============================================================
   ESTADO
============================================================ */

let albuns = [];

let albumAtual = null;

let bancoDB = null;


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
   ABRIR INDEXEDDB
============================================================ */

function abrirBanco() {

    return new Promise(
        (resolve, reject) => {

            if (!window.indexedDB) {

                reject(
                    new Error(
                        "IndexedDB não está disponível neste navegador."
                    )
                );

                return;
            }


            const requisicao =
                indexedDB.open(
                    NOME_BANCO,
                    VERSAO_BANCO
                );


            /* =================================================
               CRIAR ESTRUTURA DO BANCO
            ================================================= */

            requisicao.onupgradeneeded =
                evento => {

                    const db =
                        evento.target.result;


                    if (
                        !db.objectStoreNames.contains(
                            NOME_TABELA
                        )
                    ) {

                        db.createObjectStore(
                            NOME_TABELA,
                            {
                                keyPath: "id"
                            }
                        );
                    }
                };


            /* =================================================
               SUCESSO
            ================================================= */

            requisicao.onsuccess =
                evento => {

                    bancoDB =
                        evento.target.result;


                    resolve(
                        bancoDB
                    );
                };


            /* =================================================
               ERRO
            ================================================= */

            requisicao.onerror =
                () => {

                    reject(
                        requisicao.error ||
                        new Error(
                            "Erro ao abrir o banco."
                        )
                    );
                };
        }
    );
}


/* ============================================================
   CRIAR ÁLBUNS INICIAIS
============================================================ */

function criarAlbunsIniciais() {

    const resultado = [];


    for (
        let i = 1;
        i <= TOTAL_ALBUNS;
        i++
    ) {

        resultado.push({

            id: i,

            nome: "",

            descricao: "",

            capa: null,

            fotos: []

        });
    }


    return resultado;
}


/* ============================================================
   SALVAR UM ÁLBUM
============================================================ */

function salvarAlbum(album) {

    return new Promise(
        (resolve, reject) => {

            if (!bancoDB) {

                reject(
                    new Error(
                        "Banco de dados não está aberto."
                    )
                );

                return;
            }


            const transacao =
                bancoDB.transaction(
                    NOME_TABELA,
                    "readwrite"
                );


            const tabela =
                transacao.objectStore(
                    NOME_TABELA
                );


            tabela.put(album);


            transacao.oncomplete =
                () => {

                    resolve(
                        true
                    );
                };


            transacao.onerror =
                () => {

                    reject(
                        transacao.error
                    );
                };
        }
    );
}


/* ============================================================
   SALVAR TODOS OS ÁLBUNS
============================================================ */

function salvarTodosAlbuns() {

    return new Promise(
        (resolve, reject) => {

            if (!bancoDB) {

                reject(
                    new Error(
                        "Banco de dados não está aberto."
                    )
                );

                return;
            }


            const transacao =
                bancoDB.transaction(
                    NOME_TABELA,
                    "readwrite"
                );


            const tabela =
                transacao.objectStore(
                    NOME_TABELA
                );


            albuns.forEach(
                album => {

                    tabela.put(
                        album
                    );
                }
            );


            transacao.oncomplete =
                () => {

                    resolve(
                        true
                    );
                };


            transacao.onerror =
                () => {

                    reject(
                        transacao.error
                    );
                };
        }
    );
}


/* ============================================================
   CARREGAR TODOS OS ÁLBUNS
============================================================ */

function carregarTodosAlbuns() {

    return new Promise(
        (resolve, reject) => {

            if (!bancoDB) {

                reject(
                    new Error(
                        "Banco de dados não está aberto."
                    )
                );

                return;
            }


            const transacao =
                bancoDB.transaction(
                    NOME_TABELA,
                    "readonly"
                );


            const tabela =
                transacao.objectStore(
                    NOME_TABELA
                );


            const requisicao =
                tabela.getAll();


            requisicao.onsuccess =
                () => {

                    resolve(
                        requisicao.result || []
                    );
                };


            requisicao.onerror =
                () => {

                    reject(
                        requisicao.error
                    );
                };
        }
    );
}


/* ============================================================
   PREPARAR ÁLBUNS
============================================================ */

async function prepararAlbuns() {

    let dados =
        await carregarTodosAlbuns();


    /* ========================================================
       PRIMEIRO ACESSO
    ======================================================== */

    if (
        !Array.isArray(dados) ||
        dados.length === 0
    ) {

        albuns =
            criarAlbunsIniciais();


        await salvarTodosAlbuns();

        return;
    }


    albuns =
        dados;


    /* ========================================================
       GARANTIR OS 15 ÁLBUNS
    ======================================================== */

    const padrao =
        criarAlbunsIniciais();


    padrao.forEach(
        albumPadrao => {

            const existente =
                albuns.find(
                    album =>
                        Number(album.id) ===
                        Number(albumPadrao.id)
                );


            if (!existente) {

                albuns.push(
                    albumPadrao
                );
            }
        }
    );


    /* ========================================================
       GARANTIR ESTRUTURA
    ======================================================== */

    albuns =
        albuns
            .slice(
                0,
                TOTAL_ALBUNS
            )
            .map(
                album => {

                    return {

                        id:
                            Number(
                                album.id
                            ),

                        nome:
                            typeof album.nome ===
                            "string"
                                ? album.nome
                                : "",

                        descricao:
                            typeof album.descricao ===
                            "string"
                                ? album.descricao
                                : "",

                        capa:
                            album.capa ||
                            null,

                        fotos:
                            Array.isArray(
                                album.fotos
                            )
                                ? album.fotos
                                : []
                    };
                }
            );


    /* ========================================================
       GARANTIR CAPA
    ======================================================== */

    albuns.forEach(
        album => {

            if (
                !album.capa &&
                album.fotos.length > 0
            ) {

                album.capa =
                    album.fotos[0];
            }
        }
    );


    await salvarTodosAlbuns();
}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

async function iniciar() {

    try {

        await abrirBanco();

        await prepararAlbuns();

        renderizarAlbuns();

    } catch (erro) {

        console.error(
            "Erro ao iniciar o sistema:",
            erro
        );


        alert(
            "Não foi possível abrir o armazenamento das fotos neste navegador."
        );
    }
}


/* ============================================================
   CRIAR URL TEMPORÁRIA DA FOTO
============================================================ */

function criarUrlFoto(foto) {

    if (
        foto instanceof Blob
    ) {

        return URL.createObjectURL(
            foto
        );
    }


    /*
     * Compatibilidade com fotos antigas
     * que eventualmente estejam em texto.
     */

    if (
        typeof foto === "string"
    ) {

        return foto;
    }


    return "";
}


/* ============================================================
   RENDERIZAR ÁLBUNS
============================================================ */

function renderizarAlbuns() {

    if (!listaAlbuns) {
        return;
    }


    listaAlbuns.innerHTML =
        "";


    albuns.forEach(
        album => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "album-card";


            card.dataset.id =
                album.id;


            /* =================================================
               CAPA
            ================================================= */

            const capa =
                document.createElement(
                    "div"
                );


            capa.className =
                "album-capa";


            if (album.capa) {

                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    criarUrlFoto(
                        album.capa
                    );


                imagem.alt =
                    album.nome ||
                    `Álbum ${album.id}`;


                capa.appendChild(
                    imagem
                );

            } else {

                const placeholder =
                    document.createElement(
                        "div"
                    );


                placeholder.className =
                    "album-placeholder";


                const icone =
                    document.createElement(
                        "span"
                    );


                icone.className =
                    "icone";


                icone.textContent =
                    "📸";


                const nome =
                    document.createElement(
                        "strong"
                    );


                nome.textContent =
                    album.nome ||
                    "Novo lugar";


                const texto =
                    document.createElement(
                        "span"
                    );


                texto.textContent =
                    "Clique para adicionar suas fotos";


                placeholder.appendChild(
                    icone
                );


                placeholder.appendChild(
                    nome
                );


                placeholder.appendChild(
                    texto
                );


                capa.appendChild(
                    placeholder
                );
            }


            /* =================================================
               OVERLAY
            ================================================= */

            const overlay =
                document.createElement(
                    "div"
                );


            overlay.className =
                "album-overlay";


            /* =================================================
               INFORMAÇÕES
            ================================================= */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "album-info";


            const titulo =
                document.createElement(
                    "h3"
                );


            titulo.textContent =
                album.nome ||
                `Lugar ${album.id}`;


            const descricao =
                document.createElement(
                    "p"
                );


            descricao.textContent =
                album.descricao ||
                `${album.fotos.length} foto(s)`;


            info.appendChild(
                titulo
            );


            info.appendChild(
                descricao
            );


            /* =================================================
               BOTÃO EDITAR
            ================================================= */

            const botaoEditar =
                document.createElement(
                    "button"
                );


            botaoEditar.type =
                "button";


            botaoEditar.className =
                "botao-editar";


            botaoEditar.textContent =
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


            /* =================================================
               MONTAR CARD
            ================================================= */

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


            /* =================================================
               ABRIR
            ================================================= */

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
        }
    );
}


/* ============================================================
   ABRIR ÁLBUM
============================================================ */

function abrirAlbum(id) {

    const album =
        albuns.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!album) {
        return;
    }


    albumAtual =
        album.id;


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

function renderizarConteudoAlbum(
    album
) {

    conteudoAlbum.innerHTML =
        "";


    /* ========================================================
       TÍTULO
    ======================================================== */

    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        album.nome ||
        `Lugar ${album.id}`;


    /* ========================================================
       DESCRIÇÃO
    ======================================================== */

    const descricao =
        document.createElement(
            "p"
        );


    descricao.className =
        "descricao";


    descricao.textContent =
        album.descricao ||
        "Este álbum ainda não possui uma descrição.";


    /* ========================================================
       CONTADOR
    ======================================================== */

    const contador =
        document.createElement(
            "p"
        );


    contador.className =
        "descricao";


    contador.textContent =
        `${album.fotos.length} / ${LIMITE_FOTOS_POR_ALBUM} fotos`;


    /* ========================================================
       INPUT
    ======================================================== */

    const inputFoto =
        document.createElement(
            "input"
        );


    inputFoto.type =
        "file";


    inputFoto.accept =
        "image/*";


    inputFoto.multiple =
        true;


    inputFoto.style.display =
        "none";


    /* ========================================================
       BOTÃO ADICIONAR
    ======================================================== */

    const botaoAdicionar =
        document.createElement(
            "button"
        );


    botaoAdicionar.type =
        "button";


    botaoAdicionar.className =
        "botao-principal";


    botaoAdicionar.textContent =
        "📸 Adicionar fotos";


    botaoAdicionar.addEventListener(
        "click",
        () => {

            inputFoto.click();
        }
    );


    /* ========================================================
       SELECIONAR FOTOS
    ======================================================== */

    inputFoto.addEventListener(
        "change",
        async evento => {

            await processarFotos(
                evento.target.files,
                album
            );


            inputFoto.value =
                "";
        }
    );


    /* ========================================================
       BOTÃO EDITAR
    ======================================================== */

    const botaoEditar =
        document.createElement(
            "button"
        );


    botaoEditar.type =
        "button";


    botaoEditar.className =
        "botao-secundario";


    botaoEditar.textContent =
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


    /* ========================================================
       AÇÕES
    ======================================================== */

    const acoes =
        document.createElement(
            "div"
        );


    acoes.className =
        "acoes-edicao";


    acoes.appendChild(
        botaoAdicionar
    );


    acoes.appendChild(
        botaoEditar
    );


    /* ========================================================
       GALERIA
    ======================================================== */

    const galeria =
        document.createElement(
            "div"
        );


    galeria.className =
        "galeria";


    album.fotos.forEach(
        (foto, indice) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "galeria-item";


            /* =================================================
               IMAGEM
            ================================================= */

            const imagem =
                document.createElement(
                    "img"
                );


            imagem.src =
                criarUrlFoto(
                    foto
                );


            imagem.alt =
                `${album.nome || "Foto"} ${indice + 1}`;


            /* =================================================
               BOTÃO APAGAR
            ================================================= */

            const botaoApagar =
                document.createElement(
                    "button"
                );


            botaoApagar.type =
                "button";


            botaoApagar.className =
                "botao-apagar-foto";


            botaoApagar.textContent =
                "🗑️";


            botaoApagar.title =
                "Apagar foto";


            botaoApagar.addEventListener(
                "click",
                async evento => {

                    evento.stopPropagation();


                    const confirmar =
                        confirm(
                            "Tem certeza que deseja apagar esta foto?"
                        );


                    if (!confirmar) {
                        return;
                    }


                    /* =========================================
                       APAGAR
                    ========================================= */

                    album.fotos.splice(
                        indice,
                        1
                    );


                    /* =========================================
                       ATUALIZAR CAPA
                    ========================================= */

                    if (
                        album.capa ===
                        foto
                    ) {

                        album.capa =
                            album.fotos.length > 0
                                ? album.fotos[0]
                                : null;
                    }


                    /* =========================================
                       SALVAR
                    ========================================= */

                    try {

                        await salvarAlbum(
                            album
                        );

                    } catch (erro) {

                        console.error(
                            erro
                        );

                        alert(
                            "Não foi possível salvar a exclusão da foto."
                        );

                        return;
                    }


                    /* =========================================
                       ATUALIZAR
                    ========================================= */

                    renderizarAlbuns();

                    renderizarConteudoAlbum(
                        album
                    );
                }
            );


            /* =================================================
               FOTO GRANDE
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


    /* ========================================================
       SEM FOTOS
    ======================================================== */

    if (
        album.fotos.length ===
        0
    ) {

        const vazio =
            document.createElement(
                "p"
            );


        vazio.className =
            "descricao";


        vazio.textContent =
            "Ainda não existem fotos neste lugar.";


        galeria.appendChild(
            vazio
        );
    }


    /* ========================================================
       MONTAR
    ======================================================== */

    conteudoAlbum.appendChild(
        titulo
    );


    conteudoAlbum.appendChild(
        descricao
    );


    conteudoAlbum.appendChild(
        contador
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

async function processarFotos(
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


    /* ========================================================
       ADICIONAR CADA FOTO
    ======================================================== */

    for (
        const arquivo of arquivosSelecionados
    ) {

        if (
            !arquivo.type.startsWith(
                "image/"
            )
        ) {

            continue;
        }


        try {

            /*
             * O IndexedDB consegue guardar
             * o próprio arquivo Blob.
             *
             * Não precisamos transformar
             * a foto em Base64.
             */

            const foto =
                new Blob(
                    [arquivo],
                    {
                        type:
                            arquivo.type
                    }
                );


            album.fotos.push(
                foto
            );


            /* ===============================================
               PRIMEIRA FOTO = CAPA
            =============================================== */

            if (
                !album.capa
            ) {

                album.capa =
                    foto;
            }


            /* ===============================================
               SALVAR NO INDEXEDDB
            =============================================== */

            await salvarAlbum(
                album
            );


            /* ===============================================
               ATUALIZAR TELA
            =============================================== */

            renderizarAlbuns();


            if (
                albumAtual ===
                album.id
            ) {

                renderizarConteudoAlbum(
                    album
                );
            }

        } catch (erro) {

            console.error(
                "Erro ao salvar foto:",
                erro
            );


            /*
             * Remove a foto se não conseguiu
             * gravar no banco.
             */

            album.fotos.pop();


            if (
                album.fotos.length ===
                0
            ) {

                album.capa =
                    null;
            }


            alert(
                "Não foi possível salvar esta foto."
            );

            break;
        }
    }


    /* ========================================================
       LIMITE
    ======================================================== */

    if (
        arquivos.length >
        quantidadeDisponivel
    ) {

        alert(
            `Apenas ${quantidadeDisponivel} foto(s) foram adicionadas porque este álbum atingiu o limite.`
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
        document.createElement(
            "div"
        );


    modalFoto.className =
        "modal ativo";


    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.className =
        "modal-conteudo";


    conteudo.style.textAlign =
        "center";


    const fechar =
        document.createElement(
            "button"
        );


    fechar.type =
        "button";


    fechar.className =
        "fechar-modal";


    fechar.textContent =
        "×";


    const imagem =
        document.createElement(
            "img"
        );


    imagem.src =
        criarUrlFoto(
            foto
        );


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
                Number(item.id) ===
                Number(id)
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
   SALVAR NOME E DESCRIÇÃO
============================================================ */

async function salvarAlteracoes() {

    if (
        albumAtual === null
    ) {

        return;
    }


    const album =
        albuns.find(
            item =>
                Number(item.id) ===
                Number(albumAtual)
        );


    if (!album) {
        return;
    }


    album.nome =
        nomeLugar.value.trim();


    album.descricao =
        descricaoLugar.value.trim();


    /* ========================================================
       SALVAR NO INDEXEDDB
    ======================================================== */

    try {

        await salvarAlbum(
            album
        );

    } catch (erro) {

        console.error(
            erro
        );


        alert(
            "Não foi possível salvar as informações do álbum."
        );

        return;
    }


    /* ========================================================
       FECHAR
    ======================================================== */

    fecharModalEdicao();


    /* ========================================================
       ATUALIZAR
    ======================================================== */

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

    if (!modalAlbum) {
        return;
    }


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

    if (!modalEdicao) {
        return;
    }


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
   BOTÕES
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
   ESC
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