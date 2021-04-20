class Board {
    constructor() {
        this.whiteBottom = true;
        this.moveJustMade = [null, null];
        this.squares = [];
        this.move_history = [];
        this.attack_squares = {
            'W': [],
            'B': []
        };
        this.scores = { 'W': 0, 'B': 0 };
    }

    updateScore(color, value) {
        this.scores[color] += value;
        let relative_score = this.scores['W'] - this.scores['B'];
        let white_counter_DIV = document.getElementById("white-counter");
        let black_counter_DIV = document.getElementById("black-counter");
        if (relative_score > 0) {
            white_counter_DIV.innerHTML = '+' + relative_score;
            black_counter_DIV.innerHTML = "";
        } else if (relative_score < 0) {
            black_counter_DIV.innerHTML = '+' + (-1 * relative_score);
            white_counter_DIV.innerHTML = "";
        } else {
            white_counter_DIV.innerHTML = "";
            black_counter_DIV.innerHTML = "";
        }
    }
    displayOutPiece(piece) {
        let out_piece_display_DIV = (piece.color == 'W') ?
            document.getElementById("black-display") : document.getElementById("white-display");
        let out_piece_IMG = document.createElement("img");
        out_piece_IMG.classList.add("out-piece");
        out_piece_IMG.src = "Pieces/" + piece.imageName() + ".png";
        out_piece_display_DIV.appendChild(out_piece_IMG);
    }

    logMove(to_coordinate) {
        this.move_history.push(to_coordinate);
    }

    updateColorAttackMoves(color) {
        let squares = [];
        for (let i = 0; i < pieces[color].length; i++) {
            let current_piece = pieces[color][i];
            current_piece.updateAvailableSquares();
            if (current_piece.inGame) {
                if (current_piece instanceof Pawn) {
                    squares = mergeArrs(squares, current_piece.attackSquares());
                } else {
                    squares = mergeArrs(squares, current_piece.getAvailableSquares());
                }
            }
        }
        this.attack_squares[color] = squares;
    }

    // GETTERS
    getSquare(coordinate) {
        for (let i = 0; i < this.squares.length; i++) {
            let current_square = this.squares[i];
            if (current_square.coordinate == coordinate) {
                return current_square;
            }
        }
        return null;
    }
    getSquarePieceColor(coordinate) {
        let square = this.getSquare(coordinate);
        return square.getPieceColor();
    }
    getColorAttackMoves(color) {
        return this.attack_squares[color];
    }
    getRook(designation) {
        for (let i = 0; i < Object.keys(pieces).length; i++) {
            let color = Object.keys(pieces)[i];
            for (let j = 0; j < pieces[color].length; j++) {
                if ((pieces[color][j] instanceof Rook) &&
                    (pieces[color][j].inGame) &&
                    (pieces[color][j].designation == designation)) {
                    return pieces[color][j];
                }
            }
        }
        return null;
    }
    getKing(color) {
        for (let i = 0; i < Object.keys(pieces).length; i++) {
            let current_color = Object.keys(pieces)[i];
            for (let j = 0; j < pieces[current_color].length; j++) {
                if ((pieces[current_color][j] instanceof King) &&
                    pieces[current_color][j].color == color) {
                    return pieces[color][j];
                }
            }
        }
        return null;
    }
    // ########

    // MOVING FUNCTIONALITY
    finalizeMove(piece, to_coordinate, current_file, current_rank) {
        if (board.squareHasPiece(to_coordinate)) {
            board.getSquare(to_coordinate).getPiece().outOfGame();
            this.removePieceImage(board.getSquare(to_coordinate).getPiece());
        }
        this.removePieceImage(piece);
        piece.changeCoordinate(to_coordinate);
        this.drawPieceImage(piece);
        this.logMove(to_coordinate);
        this.moveJustMadeStyle(current_file + current_rank, to_coordinate);
        piece.incrementMoveCount();
        piece.updateAvailableSquares();
        this.updateColorAttackMoves(piece.color);
        this.updateColorAttackMoves(piece.opponent_color);
        square_in_focus = null;
    }
    movePiece(piece, to_coordinate) {
        let current_file = piece.file;
        let current_rank = piece.rank;
        let new_file = to_coordinate[0];
        let new_rank = to_coordinate[1];

        if (piece instanceof King) {
            if (piece.canCastle()) {
                if ((piece.castle_sides.includes('K')) &&
                    (to_coordinate == nextCoordString(piece.coordinate, 2, 0))) {
                    board.castle(piece, 'K');
                    return;
                } else if ((piece.castle_sides.includes('Q')) &&
                    (to_coordinate == nextCoordString(piece.coordinate, -2, 0))) {
                    board.castle(piece, 'Q');
                    return;
                }
            }
        } else if (piece instanceof Pawn) {
            let promotion_rank = (piece.color == 'W') ? '8' : '1';
            if (new_rank == promotion_rank) {
                this.availableStyle(piece, false);
                let piece_index = pieces[turn.current].indexOf(piece);
                piece = new Queen(current_file + current_rank, piece.color);
                pieces[turn.current][piece_index] = piece;
            } else if (piece.canEnPassant()) {
                if (to_coordinate == nextCoordString(piece.coordinate, 1, piece.vertical_polarity) ||
                    to_coordinate == nextCoordString(piece.coordinate, -1, piece.vertical_polarity)) {
                    this.enPassant(piece, to_coordinate);
                }
            }
        }
        this.finalizeMove(piece, to_coordinate, current_file, current_rank);
        kingCheckStyleToggle(piece.color);
        kingCheckStyleToggle(piece.opponent_color);
        turn.next();
    }
    enPassant(piece, to_coordinate) {
        let vertical_polarity = (piece.color == 'W') ? -1 : 1;
        let taken_piece = board.getSquare(nextCoordString(to_coordinate, 0, vertical_polarity)).getPiece();
        taken_piece.outOfGame();
        this.removePieceImage(taken_piece);
    }
    castle(king, side) {
        let rook = this.getRook(king.color + side);
        let king_move = (side == 'K') ? 2 : -2;
        let rook_move = (side == 'K') ? -2 : 3;
        this.movePiece(rook, nextCoordString(rook.coordinate, rook_move, 0));
        this.movePiece(king, nextCoordString(king.coordinate, king_move, 0));
    }
    // ##############

    // BOUNDS CHECKERS
    rankInBounds(rank) {
        return (charCode(rank) <= charCode('8') &&
            charCode(rank) >= charCode('1'));
    }
    fileInBounds(file) {
        return (charCode(file) <= charCode('h') &&
            charCode(file) >= charCode('a'));
    }
    coordInBounds(coordinate) {
        let file = coordinate[0];
        let rank = coordinate[1];
        return (this.fileInBounds(file) && this.rankInBounds(rank));
    }
    // ###########

    // SQUARE CHECKERS
    squareHasPiece(coordinate) {
        return this.getSquare(coordinate).hasPiece();
    }
    squaresHavePieces(coordinate1, coordinate2) {
        return (this.getSquare(coordinate1).hasPiece() && this.getSquare(coordinate2).hasPiece());
    }
    squaresHaveSamePieceColors(coordinate1, coordinate2) {
        let square1 = this.getSquare(coordinate1);
        let square2 = this.getSquare(coordinate2);
        if (square1.hasPiece() && square2.hasPiece()) {
            return (square1.getPieceColor() === square2.getPieceColor())
        }
        return false;
    }
    // ############

    // SQUARE STYLING
    availableStyle(source_piece, doShow) {
        source_piece.updateAvailableSquares();
        let available_squares = source_piece.getAvailableSquares();
        console.log(available_squares);
        for (let i = 0; i < available_squares.length; i++) {
            let square_id = available_squares[i];
            let square_DIV = document.getElementById(square_id);
            square_DIV.style.boxShadow = (doShow) ? "inset 0 0 30px 5px #00abe0" : "none";
        }
    }
    inCheckStyle(king_color, doShow) {
        let king = board.getKing(king_color);
        let king_square_DIV = document.getElementById(king.coordinate);
        let f = (doShow) ? "inset 0 0 30px 5px #ff3636" : "none"
        king_square_DIV.style.boxShadow = (doShow) ? "inset 0 0 30px 5px #ff3636" : "none";
    }
    moveJustMadeStyle(old_coord, new_coord) {
        if (this.moveJustMade[0] != null) {
            document.getElementById(this.moveJustMade[0]).style.boxShadow = "none";
            document.getElementById(this.moveJustMade[1]).style.boxShadow = "none";
        }
        this.moveJustMade = [old_coord, new_coord];
        let old_square_DIV = document.getElementById(old_coord);
        let new_square_DIV = document.getElementById(new_coord);
        old_square_DIV.style.boxShadow = "inset 0 0 30px 5px #fdce91";
        new_square_DIV.style.boxShadow = "inset 0 0 30px 5px #fdce91"
    }
    // ##############

    // UTILITY
    flipBoard() {
        let chess_board_DIV = document.getElementById("chess-board");
        chess_board_DIV.style.transform =
            (this.whiteBottom) ? "translate(-50%, -50%) rotateZ(180deg)" : "translate(-50%, -50%)";
        let piece_images = document.getElementsByClassName("piece");
        for (let i = 0; i < piece_images.length; i++) {
            piece_images[i].style.transform = (this.whiteBottom) ? "rotateZ(180deg)" : "none";
        }
        this.flipPointCounters();
        this.flipOutPieceDisplays();
        this.whiteBottom = !this.whiteBottom;
    }
    flipPointCounters() {
        let white_counter_DIV = document.getElementById("white-counter");
        let black_counter_DIV = document.getElementById("black-counter");
        if (this.whiteBottom) {
            white_counter_DIV.style.top = "60.5%";
            black_counter_DIV.style.top = "29.1%";
        } else {
            white_counter_DIV.style.top = "29.1%";
            black_counter_DIV.style.top = "60.5%";
        }
    }
    flipOutPieceDisplays() {
        let white_display_DIV = document.getElementById("white-display");
        let black_display_DIV = document.getElementById("black-display");
        if (this.whiteBottom) {
            white_display_DIV.style.top = "8%";
            black_display_DIV.style.top = "71%";
        } else {
            white_display_DIV.style.top = "71%";
            black_display_DIV.style.top = "8%";
        }
    }
    // ########

    // PIECE IMAGES
    drawPieceImage(piece) {
        let piece_IMG = document.createElement("img");
        piece_IMG.style.transform = (this.whiteBottom) ? "none" : "rotateZ(180deg)";
        piece_IMG.classList.add("piece");
        piece_IMG.src = "Pieces/" + piece.imageName() + ".png";
        document.getElementById(piece.coordinate).appendChild(piece_IMG);
        this.getSquare(piece.coordinate).setPiece(piece);
    }
    removePieceImage(piece) {
        let square_DIV = document.getElementById(piece.coordinate);
        square_DIV.removeChild(square_DIV.firstChild);
        this.getSquare(piece.coordinate).setPiece(null);
        this.availableStyle(piece, false);
    }
    // ##########

    initBoard() {
        let chess_board_DIV = document.getElementById("chess-board");
        let do_color_white = true;
        let file_index = 1;
        let rank_index = 7;

        for (let i = 1; i <= 64; i++) {
            let square_DIV = document.createElement("div");
            square_DIV.classList.add("square");
            (do_color_white) ? square_DIV.classList.add("white") : square_DIV.classList.add("black");
            square_DIV.id = formatCoord(file_index++, rank_index);
            square_DIV.addEventListener('click', onSquareClick.bind(this, square_DIV.id), false);
            chess_board_DIV.appendChild(square_DIV);
            this.squares.push(new Square(square_DIV.id));

            do_color_white = !do_color_white;
            if (file_index > 8) {
                do_color_white = !do_color_white;
                file_index = 1;
                rank_index--;
            }
        }
    }
    initPieces() {
        for (let i = 0; i < Object.keys(pieces).length; i++) {
            let color = Object.keys(pieces)[i];
            for (let j = 0; j < pieces[color].length; j++) {
                let current_piece = pieces[color][j];
                this.drawPieceImage(current_piece);
                this.getSquare(current_piece.coordinate).setPiece(current_piece);
                // current_piece.updateAvailableSquares();
            }
        }
    }
}
var board = new Board();

