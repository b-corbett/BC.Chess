class Turn {
    constructor() {
        this.current = 'W';
        this.opposing = 'B';
    }
    next() {
        let temp = this.current;
        this.current = this.opposing;
        this.opposing = temp;
    }
}
var turn = new Turn();


function mainInit() {
    window.oncontextmenu = function () {
        if (square_in_focus != null) {
            board.availableStyle(square_in_focus.getPiece(), false);
            square_in_focus = null;
        }
    };
    var chess_board_DIV = document.getElementById("chess-board");
    chess_board_DIV.addEventListener("contextmenu", e => e.preventDefault());

    let go_arrows_IMG = document.getElementById("go-arrows");
    go_arrows_IMG.addEventListener("click", () => {
        changeBackground();
    }, false);

    let flip_board_BUTTON = document.getElementById("flip-board");
    flip_board_BUTTON.addEventListener("click", () => {
        board.flipBoard();
    }, false);

    board.initBoard();
    board.initPieces();
    changeBackground();
}

window.onload = function () {
    mainInit();
}

function onSquareClick(clicked_coordinate) {
    let clicked_square = board.getSquare(clicked_coordinate);
    if (clicked_square == square_in_focus) return;
    if (square_in_focus == null && clicked_square.hasPiece()) {
        if (clicked_square.getPieceColor() == turn.current) {
            square_in_focus = clicked_square;
            board.availableStyle(square_in_focus.getPiece(), true);
            return;
        } else return;
    }


    if (clicked_square.hasPiece()) {
        if (square_in_focus.sameColorPieceAs(clicked_square)) {
            board.availableStyle(square_in_focus.getPiece(), false);
            square_in_focus = clicked_square;
            board.availableStyle(square_in_focus.getPiece(), true);
        } else if (square_in_focus.getPiece().canMoveToSquare(clicked_coordinate)) {
            board.movePiece(square_in_focus.getPiece(), clicked_coordinate);
        } else {
            board.availableStyle(square_in_focus.getPiece(), false);
        }
    } else if (square_in_focus != null) {
        if (square_in_focus.getPiece().canMoveToSquare(clicked_coordinate)) {
            board.movePiece(square_in_focus.getPiece(), clicked_coordinate);
        } else {
            board.availableStyle(square_in_focus.getPiece(), false);
            square_in_focus = null;
        }
    }
}
