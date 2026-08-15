// ====================================
// SMART ID - REPARO SMART
// script.js
// ====================================

// Aguarda o carregamento da página
document.addEventListener("DOMContentLoaded", () => {

    animarEntrada();

    configurarCertificados();

    configurarContatos();

    copiarMatricula();

});


// ===============================
// ANIMAÇÃO
// ===============================

function animarEntrada(){

    const elementos = document.querySelectorAll(
        ".perfil,.card,.titulo,.certificados,.todos,.contatos,.qrcode,footer"
    );

    elementos.forEach((item, index)=>{

        item.style.opacity="0";
        item.style.transform="translateY(30px)";

        setTimeout(()=>{

            item.style.transition=".6s";

            item.style.opacity="1";

            item.style.transform="translateY(0px)";

        },150*index);

    });

}


// =========================================
// SMART ID
// SISTEMA DE CERTIFICADOS
// =========================================


// ELEMENTOS

const modal = document.getElementById("modalCertificado");

const btnAbrir = document.getElementById("btnAbrirCertificado");

const btnFechar = document.getElementById("fecharModal");

const btnCancelar = document.getElementById("cancelarCertificado");

const formulario = document.getElementById("formCertificado");

const arquivoInput = document.getElementById("arquivoCertificado");

const nomeArquivo = document.getElementById("nomeArquivo");

const lista = document.getElementById("listaCertificados");

const semCertificados = document.getElementById("semCertificados");


// =========================================
// BANCO TEMPORÁRIO
// =========================================

let certificados = JSON.parse(
    localStorage.getItem("smartID_certificados")
) || [];


// =========================================
// ABRIR MODAL
// =========================================

function abrirFormularioCertificado(){

    modal.classList.add("ativo");

}


// botão adicionar

if(btnAbrir){

    btnAbrir.addEventListener("click", () => {

        abrirFormularioCertificado();

    });

}


// =========================================
// FECHAR MODAL
// =========================================

function fecharFormulario(){

    modal.classList.remove("ativo");

    formulario.reset();

    nomeArquivo.textContent = "Apenas arquivos PDF";

}


btnFechar.addEventListener("click", fecharFormulario);

btnCancelar.addEventListener("click", fecharFormulario);


// =========================================
// ESCOLHER PDF
// =========================================

arquivoInput.addEventListener("change", () => {

    const arquivo = arquivoInput.files[0];

    if(!arquivo){

        nomeArquivo.textContent = "Apenas arquivos PDF";

        return;

    }


    // verifica se é PDF

    if(arquivo.type !== "application/pdf"){

        alert("Selecione apenas arquivos PDF.");

        arquivoInput.value = "";

        nomeArquivo.textContent = "Apenas arquivos PDF";

        return;

    }


    nomeArquivo.textContent = arquivo.name;

});


// =========================================
// ADICIONAR CERTIFICADO
// =========================================

formulario.addEventListener("submit", (evento) => {

    evento.preventDefault();


    const nome =
        document.getElementById("nomeCertificado").value.trim();


    const descricao =
        document.getElementById("descricaoCertificado").value.trim();


    const validade =
        document.getElementById("validadeCertificado").value;


    const arquivo =
        arquivoInput.files[0];


    if(!arquivo){

        alert("Selecione o certificado em PDF.");

        return;

    }


    // verifica tamanho

    if(arquivo.size > 10 * 1024 * 1024){

        alert("O PDF deve ter no máximo 10 MB.");

        return;

    }


    // transforma PDF em arquivo digital

    const leitor = new FileReader();


    leitor.onload = function(){

        const certificado = {

            id: Date.now(),

            nome: nome,

            descricao: descricao,

            validade: validade,

            arquivo: leitor.result,

            nomeArquivo: arquivo.name

        };


        certificados.push(certificado);


        salvarCertificados();


        renderizarCertificados();


        fecharFormulario();


    };


    leitor.readAsDataURL(arquivo);

});


// =========================================
// SALVAR
// =========================================

function salvarCertificados(){

    try{

        localStorage.setItem(
            "smartID_certificados",
            JSON.stringify(certificados)
        );

    }catch(erro){

        console.error(erro);

        alert(
            "Não foi possível salvar o certificado. " +
            "O armazenamento do navegador pode estar cheio."
        );

    }

}


// =========================================
// MOSTRAR CERTIFICADOS
// =========================================

function renderizarCertificados(){

    lista.innerHTML = "";


    if(certificados.length === 0){

        semCertificados.style.display = "block";

        return;

    }


    semCertificados.style.display = "none";


    certificados.forEach(certificado => {

        const card =
            document.createElement("div");


        card.className =
            "certificado-card";


        const status =
            verificarValidade(certificado.validade);


        card.innerHTML = `

            <div class="certificado-icone">

                <i class="fa-solid fa-file-pdf"></i>

            </div>


            <div class="certificado-info">

                <h3>
                    ${escaparHTML(certificado.nome)}
                </h3>

                <p>
                    ${escaparHTML(certificado.descricao)}
                </p>

                <div class="certificado-validade">

                    Validade:
                    ${formatarData(certificado.validade)}

                </div>

                <span class="status-certificado ${status.classe}">

                    ${status.texto}

                </span>

            </div>


            <button
                class="btn-abrir-pdf"
                onclick="abrirPDF(${certificado.id})"
                title="Visualizar PDF">

                <i class="fa-solid fa-eye"></i>

            </button>


            <button
                class="btn-excluir-certificado"
                onclick="excluirCertificado(${certificado.id})"
                title="Excluir">

                <i class="fa-solid fa-trash"></i>

            </button>

        `;


        lista.appendChild(card);

    });

}


// =========================================
// ABRIR PDF
// =========================================

function abrirPDF(id){

    const certificado =
        certificados.find(item => item.id === id);


    if(!certificado){

        return;

    }


    const novaAba =
        window.open();


    novaAba.document.write(`

        <html>

        <head>

            <title>
                ${certificado.nome}
            </title>

            <style>

                body{
                    margin:0;
                    background:#222;
                }

                iframe{
                    width:100%;
                    height:100vh;
                    border:none;
                }

            </style>

        </head>

        <body>

            <iframe
                src="${certificado.arquivo}">
            </iframe>

        </body>

        </html>

    `);

}


// =========================================
// EXCLUIR
// =========================================

function excluirCertificado(id){

    const confirmar =
        confirm(
            "Deseja realmente excluir este certificado?"
        );


    if(!confirmar){

        return;

    }


    certificados =
        certificados.filter(
            certificado => certificado.id !== id
        );


    salvarCertificados();

    renderizarCertificados();

}


// =========================================
// FORMATAR DATA
// =========================================

function formatarData(data){

    if(!data){

        return "--/--/----";

    }


    const partes =
        data.split("-");


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =========================================
// VERIFICAR VALIDADE
// =========================================

function verificarValidade(data){

    const hoje =
        new Date();


    const validade =
        new Date(data + "T23:59:59");


    const diferenca =
        validade - hoje;


    const dias =
        Math.ceil(
            diferenca /
            (1000 * 60 * 60 * 24)
        );


    if(dias < 0){

        return {

            texto:"Vencido",

            classe:"status-vencido"

        };

    }


    if(dias <= 30){

        return {

            texto:`Vence em ${dias} dias`,

            classe:"status-vencendo"

        };

    }


    return {

        texto:"Válido",

        classe:"status-valido"

    };

}


// =========================================
// PROTEÇÃO CONTRA HTML
// =========================================

function escaparHTML(texto){

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;

}


// =========================================
// INICIALIZAR
// =========================================

renderizarCertificados();



// ===============================
// CONTATOS
// ===============================

function configurarContatos(){

    const botoes=document.querySelectorAll(".botao");

    botoes.forEach(botao=>{

        botao.addEventListener("mouseenter",()=>{

            botao.style.transform="scale(1.08)";

        });

        botao.addEventListener("mouseleave",()=>{

            botao.style.transform="scale(1)";

        });

    });

}



// ===============================
// COPIAR MATRÍCULA
// ===============================

function copiarMatricula(){

    const matricula=document.querySelector(".matricula");

    if(!matricula) return;

    matricula.style.cursor="pointer";

    matricula.title="Clique para copiar";

    matricula.addEventListener("click",()=>{

        navigator.clipboard.writeText("0001");

        alert("Matrícula copiada!");

    });

}



// ===============================
// VER TODOS CERTIFICADOS
// ===============================

const botao=document.querySelector(".todos button");

if(botao){

botao.addEventListener("click",()=>{

    alert("Em breve será aberta a lista completa de certificados.");

});

}



// ===============================
// QR CODE
// ===============================

const qr=document.querySelector(".qrcode img");

if(qr){

qr.addEventListener("click",()=>{

    qr.style.transform="scale(1.1)";

    setTimeout(()=>{

        qr.style.transform="scale(1)";

    },250);

});

}



// ===============================
// FOTO DO FUNCIONÁRIO
// ===============================

const foto=document.querySelector(".foto");

if(foto){

foto.addEventListener("click",()=>{

    foto.classList.toggle("zoom");

});

}



// ===============================
// DATA ATUAL
// ===============================

function dataAtual(){

    const data=new Date();

    console.log("Último acesso:",data.toLocaleString());

}

dataAtual();



// ===============================
// SIMULAÇÃO NFC
// ===============================

function detectarNFC(){

    console.log("Tag NFC reconhecida.");

}

detectarNFC();



// ===============================
// VERIFICAÇÃO DO FUNCIONÁRIO
// ===============================

function verificarFuncionario(){

    const status=true;

    if(status){

        console.log("Funcionário verificado.");

    }else{

        console.log("Funcionário não encontrado.");

    }

}

verificarFuncionario();