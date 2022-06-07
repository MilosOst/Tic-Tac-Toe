'use strict';

class Player {
    #symbol

    constructor(symbol) {
        this.#symbol = symbol;
    }

    getSymbol() {
        return this.#symbol;
    }
}


const gameBoard = (() => {
    const board = ['', '', '', '', '', '', '', '', ''];

    const setSquareValue = (index, value) => {
        if (index < 0 || index >= board.length) return;
        board[index] = value;
    };

    const getSquareValue = (index) => {
        if (index < 0 || index >= board.length) return;
        return board[index];
    };

    const resetBoard = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = '';
        }
    };

    return { setSquareValue, getSquareValue, resetBoard };
})();


const visualsController = (() => {
    const squares = document.querySelectorAll('.board-square');
    squares.forEach(square => square.addEventListener('click', (e) => {
        if (e.target.hasChildNodes()) return;
        if (!gameController.isGameOver()) gameController.playRound(e.target.dataset.index);
    }));

    const restartBtn = document.querySelector('#restart');
    restartBtn.addEventListener('click', () => gameController.resetGame());


    const updateSquare = (index) => {
        const squareSymbol = gameBoard.getSquareValue(index);
        const squareImg = document.createElement('img');

        if (squareSymbol === 'X') {
            squareImg.src = './imgs/x.svg';
            squareImg.alt = 'X';
        }
        else {
            squareImg.src = './imgs/circle.svg';
            squareImg.alt = 'O';
        }
        squares[index].appendChild(squareImg);
    };

    const displayResult = (winner, isOver) => {
        const resultBox = document.querySelector('.result-box');

        if (isOver) resultBox.textContent = `Player ${winner.getSymbol()} Won`;
        else resultBox.textContent = `Player ${winner.getSymbol()}'s Turn`;

    };

    const resetVisuals = () => {
        for (let square of squares) {
            if (square.hasChildNodes()) square.firstChild.remove();
        }
        const resultBox = document.querySelector('.result-box');
        resultBox.textContent = "Player X's Turn"
    };
    

    return { updateSquare, displayResult, resetVisuals };

})();


const gameController = (() => {
    const playerOne = new Player('X');
    const playerTwo = new Player('O');
    let currentPlayerMove = playerOne;
    let isOver = false;


    const playRound = (squareIndex) => {
        gameBoard.setSquareValue(squareIndex, currentPlayerMove.getSymbol());
        visualsController.updateSquare(squareIndex);
        visualsController.displayResult(currentPlayerMove, isOver);

        checkWinner();
        visualsController.displayResult(currentPlayerMove, isOver);
        currentPlayerMove = (currentPlayerMove === playerOne) ? playerTwo : playerOne;
    };

    const checkWinner = () => {
        const winningPositions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let position of winningPositions) {
            if (position.every(square => gameBoard.getSquareValue(square) === currentPlayerMove.getSymbol())) {
                isOver = true;
                return true;
            }}
    };

    const isGameOver = () => {
        return isOver;
    };

    const resetGame = () => {
        gameBoard.resetBoard();
        visualsController.resetVisuals();

        isOver = false;
        currentPlayerMove = playerOne;
    };

    return {playRound, isGameOver, resetGame};

})();

