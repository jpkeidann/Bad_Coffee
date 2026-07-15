let estadoJogo = 'MENU';

// IMAGEM DE FUNDO
let imagemFundoMenu = new Image();
imagemFundoMenu.src = "../Img/menu.png";

// Cores e tamanhos 
const configMenu = {
    corFundoPadrao: "black",
    corBotao: "#333333",
    corBotaoHover: "#666666", // Cor quando o mouse passa por cima
    corTexto: "white",
    fonteTitulo: "60px Arial",
    fonteBotao: "30px Arial"
};

// Posição do mouse para sabermos se está em cima do botão
let mouseX = 0;
let mouseY = 0;

// Configurações dos links interativos do GitHub e do botão Voltar
let linksGitHub = [];
let botaoVoltar = { x: 0, y: 0, w: 220, h: 50 };

// Definição dos 3 Botões do Menu Principal
let botoesMenu = [
    { id: '1P', texto: "Um Jogador", x: 0, y: 0, w: 400, h: 70 },
    { id: '2P', texto: "Dois Jogadores", x: 0, y: 0, w: 400, h: 70 },
    { id: 'SOBRE', texto: "Sobre nós / Como jogar", x: 0, y: 0, w: 400, h: 70 }
];

// Atualiza a posição do mouse (com suporte inteligente ao tamanho/posição do Canvas na página)
window.addEventListener('mousemove', (e) => {
    if (typeof canvas !== 'undefined') {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    } else {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Gerencia a mudança do cursor (mãozinha 'pointer' ao passar por cima de botões ou links)
    let hoverAtivo = false;

    if (estadoJogo === 'MENU') {
        botoesMenu.forEach(botao => {
            if (mouseX >= botao.x && mouseX <= botao.x + botao.w &&
                mouseY >= botao.y && mouseY <= botao.y + botao.h) {
                hoverAtivo = true;
            }
        });
    } else if (estadoJogo === 'SOBRE') {
        // Hover nos links dos desenvolvedores
        linksGitHub.forEach(link => {
            if (mouseX >= link.x && mouseX <= link.x + link.w &&
                mouseY >= link.y && mouseY <= link.y + link.h) {
                hoverAtivo = true;
            }
        });

        // Hover no botão Voltar
        if (mouseX >= botaoVoltar.x && mouseX <= botaoVoltar.x + botaoVoltar.w &&
            mouseY >= botaoVoltar.y && mouseY <= botaoVoltar.y + botaoVoltar.h) {
            hoverAtivo = true;
        }
    }

    document.body.style.cursor = hoverAtivo ? 'pointer' : 'default';
});

// Detecta o clique nos botões do menu e na tela "Sobre"
window.addEventListener('click', (e) => {
    if (estadoJogo === 'MENU') {
        botoesMenu.forEach(botao => {
            if (mouseX >= botao.x && mouseX <= botao.x + botao.w &&
                mouseY >= botao.y && mouseY <= botao.y + botao.h) {

                if (botao.id === '1P') {
                    estadoJogo = 'JOGANDO_1P';
                } else if (botao.id === '2P') {
                    estadoJogo = 'JOGANDO_2P';
                } else if (botao.id === 'SOBRE') {
                    estadoJogo = 'SOBRE';
                }
                document.body.style.cursor = 'default';
            }
        });
    } else if (estadoJogo === 'SOBRE') {
        let clicouLink = false;

        // Verifica se clicou em algum link do GitHub
        linksGitHub.forEach(link => {
            if (mouseX >= link.x && mouseX <= link.x + link.w &&
                mouseY >= link.y && mouseY <= link.y + link.h) {
                window.open(link.url, '_blank'); // Abre o link do desenvolvedor em nova aba
                clicouLink = true;
            }
        });

        // Se NÃO clicou em um link, qualquer clique (no botão Voltar ou na tela) retorna ao Menu
        if (!clicouLink) {
            estadoJogo = 'MENU';
            document.body.style.cursor = 'default';
        }
    }
});

function desenharMenu() {
    if (imagemFundoMenu.src && imagemFundoMenu.complete && imagemFundoMenu.naturalWidth !== 0) {
        des.drawImage(imagemFundoMenu, 0, 0, canvas.width, canvas.height);
    } else {
        des.fillStyle = configMenu.corFundoPadrao;
        des.fillRect(0, 0, canvas.width, canvas.height);
    }

    des.fillStyle = configMenu.corTexto;
    des.font = configMenu.fonteTitulo;
    des.textAlign = "center";
    

    let startY = canvas.height / 2 - 50;
    botoesMenu.forEach((botao, index) => {
        botao.x = canvas.width / 2 - botao.w / 2;
        botao.y = startY + (index * (botao.h + 30));

        let hover = mouseX >= botao.x && mouseX <= botao.x + botao.w &&
            mouseY >= botao.y && mouseY <= botao.y + botao.h;

        des.fillStyle = hover ? configMenu.corBotaoHover : configMenu.corBotao;
        des.fillRect(botao.x, botao.y, botao.w, botao.h);

        des.fillStyle = configMenu.corTexto;
        des.font = configMenu.fonteBotao;
        des.textBaseline = "middle";
        des.fillText(botao.texto, botao.x + botao.w / 2, botao.y + botao.h / 2);
    });
    des.textAlign = "left"; // Reseta o texto
    des.textBaseline = "alphabetic";
}

function desenharSobre() {
    // Fundo cinza escuro elegante com tema de Bad Coffee
    des.fillStyle = "#0F0F13";
    des.fillRect(0, 0, canvas.width, canvas.height);

    // Título Principal
    des.fillStyle = "#FFD700"; // Título dourado
    des.font = "bold 45px Arial";
    des.textAlign = "center";
    des.fillText("SOBRE O JOGO & COMO JOGAR", canvas.width / 2, 70);

    // Divisão do conteúdo em duas colunas bem estruturadas
    const colLeftX = canvas.width * 0.08;
    const colRightX = canvas.width * 0.55;
    
    // --- COLUNA 1: COMO JOGAR (ESQUERDA) ---
    let y = 140;
    des.textAlign = "left";
    des.fillStyle = "#FF5555"; // Título de Seção Vermelho
    des.font = "bold 24px Arial";
    des.fillText("🎮 COMO JOGAR", colLeftX, y);
    
    y += 30;
    des.fillStyle = "white";
    des.font = "bold 16px Arial";
    des.fillText("Objetivo Principal:", colLeftX, y);
    
    y += 22;
    des.font = "14px Arial";
    des.fillStyle = "#CCCCCC";
    des.fillText("Sobreviva ao ataque implacável de ondas de inimigos.", colLeftX, y);
    y += 20;
    des.fillText("Derrote inimigos, ganhe pontos e colete melhorias", colLeftX, y);
    y += 20;
    des.fillText("que surgem pelo mapa para ficar mais forte!", colLeftX, y);
    
    y += 35;
    des.fillStyle = "white";
    des.font = "bold 16px Arial";
    des.fillText("Controles - Jogador 1 (Solo ou Coop):", colLeftX, y);
    y += 22;
    des.font = "14px Arial";
    des.fillStyle = "#CCCCCC";
    des.fillText("• Teclas [ W, A, S, D ] para se movimentar.", colLeftX, y);
    
    y += 35;
    des.fillStyle = "white";
    des.font = "bold 16px Arial";
    des.fillText("Controles - Jogador 2 (Cooperativo):", colLeftX, y);
    y += 22;
    des.font = "14px Arial";
    des.fillStyle = "#CCCCCC";
    des.fillText("• Teclas [ SETAS ] do teclado para se movimentar.", colLeftX, y);
    


    // --- COLUNA 2: DESENVOLVEDORES (DIREITA) ---
    y = 140;
    des.fillStyle = "#55FF55"; // Título de Seção Verde
    des.font = "bold 24px Arial";
    des.fillText("👥 DESENVOLVEDORES", colRightX, y);
    
    y += 30;
    des.fillStyle = "#CCCCCC";
    des.font = "14px Arial";
    des.fillText("Projeto desenvolvido com muito café por:", colRightX, y);
    
    // Lista estruturada com os nomes reais e perfis reais fornecidos
    const desenvolvedores = [
        { nome: "João Pedro Keidann", displayLink: "github.com/jpkeidann", url: "https://github.com/jpkeidann" },
        { nome: "Abel Silva Neto", displayLink: "github.com/abelsilvaneto", url: "https://github.com/abelsilvaneto" },
        { nome: "Davi P. Fagundes", displayLink: "github.com/davipf273", url: "https://github.com/davipf273" },
        { nome: "Pedro Henrique Caldart Warmling", displayLink: "github.com/mendig0d0smares", url: "https://github.com/mendig0d0smares" }
    ];
    
    linksGitHub = []; // Limpa coordenadas para recalcular no quadro atual
    
    y += 30;
    desenvolvedores.forEach(dev => {
        des.fillStyle = "white";
        des.font = "bold 16px Arial";
        des.fillText(dev.nome, colRightX, y);
        
        y += 20;
        des.font = "13px Arial";
        
        // Medição do texto para definir o local exato onde o clique será ativado
        const metricasTexto = des.measureText(dev.displayLink);
        const linkX = colRightX;
        const linkY = y - 11; // Ajuste fino vertical do texto
        const linkW = metricasTexto.width;
        const linkH = 14;
        
        const mouseSobreLink = mouseX >= linkX && mouseX <= linkX + linkW &&
                               mouseY >= linkY && mouseY <= linkY + linkH;
        
        // Registra os dados da caixa delimitadora do link
        linksGitHub.push({ x: linkX, y: linkY, w: linkW, h: linkH, url: dev.url });
        
        if (mouseSobreLink) {
            des.fillStyle = "#FFFF55"; // Destaque amarelo ao passar o mouse
            // Desenha um sublinhado estiloso
            des.strokeStyle = "#FFFF55";
            des.lineWidth = 1;
            des.beginPath();
            des.moveTo(linkX, y + 2);
            des.lineTo(linkX + linkW, y + 2);
            des.stroke();
        } else {
            des.fillStyle = "#33CCFF"; // Azul claro de link comum
        }
        
        des.fillText(dev.displayLink, colRightX, y);
        y += 35; // Espaço confortável para o próximo desenvolvedor
    });

    // --- BOTÃO VOLTAR (RODAPÉ) ---
    botaoVoltar.w = 240;
    botaoVoltar.h = 45;
    botaoVoltar.x = canvas.width / 2 - botaoVoltar.w / 2;
    botaoVoltar.y = canvas.height - 80;
    
    const mouseSobreVoltar = mouseX >= botaoVoltar.x && mouseX <= botaoVoltar.x + botaoVoltar.w &&
                             mouseY >= botaoVoltar.y && mouseY <= botaoVoltar.y + botaoVoltar.h;
    
    // Cor do botão muda no Hover
    des.fillStyle = mouseSobreVoltar ? "#555555" : "#222226";
    des.fillRect(botaoVoltar.x, botaoVoltar.y, botaoVoltar.w, botaoVoltar.h);
    
    // Borda do botão
    des.strokeStyle = "white";
    des.lineWidth = 2;
    des.strokeRect(botaoVoltar.x, botaoVoltar.y, botaoVoltar.w, botaoVoltar.h);
    
    des.fillStyle = "white";
    des.font = "bold 16px Arial";
    des.textAlign = "center";
    des.textBaseline = "middle";
    des.fillText("VOLTAR AO MENU", botaoVoltar.x + botaoVoltar.w / 2, botaoVoltar.y + botaoVoltar.h / 2);
    
    // Texto de apoio informativo
    des.fillStyle = "#888888";
    des.font = "12px Arial";
    des.fillText("(Clique no botão ou em qualquer lugar da tela para voltar)", canvas.width / 2, canvas.height - 20);
    
    // Reseta configurações padrões para as próximas telas
    des.textAlign = "left";
    des.textBaseline = "alphabetic";
}