'use strict';

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

class Player {
    #symbol

    constructor(symbol) {
        this.#symbol = symbol;
    }

    getSymbol() {
        return this.#symbol;
    }
}


class AiPlayer extends Player {
    #difficulty

    constructor(symbol, difficulty) {
        super(symbol);
        this.#difficulty = difficulty;
    }

    setDifficulty(difficulty) {
        if (!['easy', 'medium', 'hard', 'impossible'].includes(difficulty)) return;
        this.#difficulty = difficulty;
    }

    getDifficulty() {
        return this.#difficulty;
    }

    decideMove(moveNum) {
        let pick;
        switch (this.#difficulty) {
            case 'easy':
                pick = this.#playRandomMove();
                break;
            case 'medium':
                pick = this.#findWinningMove();
                break;
            case 'hard':
            // If first move for AI, play corner/center depending on user move
            if (moveNum === 2) {
                pick = this.#handleFirstMove();
                break;
            }
                pick = this.#findWinningMove();
                break;   
        }
        gameBoard.setSquareValue(pick, this.getSymbol());
        visualsController.updateSquare(pick);
    }

    #playRandomMove() {
        let legalMoves = [];
        for (let i = 0; i < 9; i++) {
            const squareValue = gameBoard.getSquareValue(i);
            if (squareValue === '') legalMoves.push(i);
        }
        const randomPick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        return randomPick;

    }

    #blockWinningMoves() {
        for (let position of winningPositions) {
            const userSquares = position.filter(index => gameBoard.getSquareValue(index) === 'X');
            const openSquares = position.filter(index => gameBoard.getSquareValue(index) === '');

            // Check if possible for player to immediately win in this position
            if (userSquares.length == 2 && openSquares.length === 1) return openSquares[0];

        }

        // If no direct blocks available, pick random move
        return this.#playRandomMove();
    }


    #findWinningMove() {
        for (let position of winningPositions) {
            const aiSquares = position.filter(index => gameBoard.getSquareValue(index) === this.getSymbol());
            const openSquares = position.filter(index => gameBoard.getSquareValue(index) === '');

            // Check if possible for Ai to immediately win in this position
            if (aiSquares.length == 2 && openSquares.length === 1) return openSquares[0];
        }
        // If no direct winning move found, block direct winning moves
        return this.#blockWinningMoves();
    }

    #handleFirstMove() {
        // Play corner move if user went to center
        if (gameBoard.getSquareValue(4) === 'X') {
            const corners = [0, 2, 6, 8];
            const randomCorner = corners[Math.floor(Math.random() * corners.length)];
            return randomCorner;
        }
        // Play center otherwise
        else {
            return 4;
        }
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

    const isTie = () => {
        return board.every(square => square !== '');
    }

    const resetBoard = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = '';
        }
    };

    return { setSquareValue, getSquareValue, isTie, resetBoard };
})();


const visualsController = (() => {
    const squares = document.querySelectorAll('.board-square');
    squares.forEach(square => square.addEventListener('click', (e) => {
        if (e.target.hasChildNodes()) return;
        if (!gameController.isGameOver()) gameController.playRound(e.target.dataset.index);
    }));

    // Add event listeners for changing difficulty
    const difficultyBox = document.querySelector('#difficulty-dropbox');
    difficultyBox.addEventListener('change', (e) => gameController.setGameDifficulty(e.target.value));

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

    const displayResult = (winner, result) => {
        const resultBox = document.querySelector('.result-box');

        if (result === 'W') {
            resultBox.textContent = `Player ${winner.getSymbol()} Won`;
        }
        else if (result === 'T') {
            resultBox.textContent = "It's a Tie!";
        }
    };

    const resetVisuals = () => {
        for (let square of squares) {
            if (square.hasChildNodes()) square.firstChild.remove();
        }
        const resultBox = document.querySelector('.result-box');
        resultBox.textContent = '';
    };
    

    return { updateSquare, displayResult, resetVisuals };

})();


const gameController = (() => {
    const playerOne = new Player('X');
    const playerAI = new AiPlayer('O', 'easy');
    let move = 1;
    let isOver = false;


    const setGameDifficulty = (difficulty) => {
        playerAI.setDifficulty(difficulty);
        resetGame();
    };


    const playRound = (squareIndex) => {
        gameBoard.setSquareValue(squareIndex, playerOne.getSymbol());
        visualsController.updateSquare(squareIndex);
        visualsController.displayResult(playerOne, isOver);
        move++;

         if (checkWinner(playerOne)) {
             visualsController.displayResult(playerOne, 'W');
             return;
         }
         else if (gameBoard.isTie()) {
             visualsController.displayResult(playerOne, 'T');
             return;
         }

        const aiMove = playerAI.decideMove(move);
        visualsController.displayResult(playerAI, isOver);
        move++;

        if (checkWinner(playerAI)) {
            visualsController.displayResult(playerAI, 'W');
            return;
        }
        else if (gameBoard.isTie()) {
            visualsController.displayResult(playerAI, 'T');
            return;
        }
    };

    const checkWinner = (currPlayer) => {
        for (let position of winningPositions) {
            if (position.every(square => gameBoard.getSquareValue(square) === currPlayer.getSymbol())) {
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
        move = 1;
        isOver = false;
    };

    return { setGameDifficulty, playRound, checkWinner, isGameOver, resetGame, };

})();

