let estadoJogo = 'MENU';

// IMAGEM DE FUNDO
let imagemFundoMenu = new Image();
imagemFundoMenu.src = "";

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

// Definição dos 3 Botões
let botoesMenu = [
    { id: '1P', texto: "Um Jogador", x: 0, y: 0, w: 400, h: 70 },
    { id: '2P', texto: "Dois Jogadores", x: 0, y: 0, w: 400, h: 70 },
    { id: 'SOBRE', texto: "Sobre nós / Como jogar", x: 0, y: 0, w: 400, h: 70 }
];

// Atualiza a posição do mouse
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
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
            }
        });
    } else if (estadoJogo === 'SOBRE') {
        estadoJogo = 'MENU'; // Qualquer clique na tela Sobre volta ao Menu
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
    des.fillText("Bad coffee", canvas.width / 2, 150); // Pode mudar o nome aqui!

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
    des.fillStyle = "black";
    des.fillRect(0, 0, canvas.width, canvas.height);

    des.fillStyle = "white";
    des.textAlign = "center";

    des.font = "50px Arial";
    des.fillText("Sobre Nós / Como Jogar", canvas.width / 2, 100);

    des.font = "30px Arial";
    des.fillText("Desenvolvedores: João, Abel e Davi", canvas.width / 2, 250);
    des.fillText("Jogador 1: WASD para andar.", canvas.width / 2, 330);
    des.fillText("Jogador 2: Setas do Teclado para andar.", canvas.width / 2, 380);
    des.fillText("Sobreviva à horda e recolha melhorias!", canvas.width / 2, 400);

    des.font = "20px Arial";
    des.fillText("(Clique em qualquer lugar para voltar)", canvas.width / 2, canvas.height - 100);
    des.textAlign = "left";
    des.textBaseline = "alphabetic";
}
