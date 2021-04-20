class Piece {
    constructor(initial_coordinate, color) {
        this.name = "";
        this.coordinate = initial_coordinate;
        this.file = initial_coordinate[0];
        this.rank = initial_coordinate[1];
        this.color = color;
        this.side = (charCode(this.file) <= charCode('d')) ? 'Q' : 'K';
        this.designation = this.color + this.side;
        this.move_count = 0;
        this.inGame = true;
        this.point_value = null;
        this.available_squares = [];
        this.opponent_color = (this.color == 'W') ? 'B' : 'W';
    }
    imageName() {
        return this.color + this.name;
    }
    incrementMoveCount() {
        this.move_count++;
    }
    outOfGame() {
        this.inGame = false;
        board.updateScore(this.color, this.point_value);
        board.displayOutPiece(this);
    }
    getAvailableSquares() {
        return this.available_squares;
    }
    changeCoordinate(new_coordinate) {
        this.coordinate = new_coordinate;
        this.file = new_coordinate[0];
        this.rank = new_coordinate[1];
    }
    canMoveToSquare(coordinates) {
        return this.available_squares.includes(coordinates);
    }
    isAllyPiece(piece) {
        return (piece.color == this.color);
    }
}

class Pawn extends Piece {
    constructor(initial_coordinate, color) {
        super(initial_coordinate, color);
        this.name = "Pawn";
        this.point_value = 1;
        this.en_passant_rank = (this.color == 'W') ? '5' : '4';
        this.promotion_rank = (this.color == 'W') ? '8' : '1';
        this.vertical_polarity = (this.color == 'W') ? 1 : -1;
    }
    updateAvailableSquares() {
        let squares = [];
        let mvmts = {
            'W': [[0, 1], [0, 2], [1, 1], [-1, 1]],
            'B': [[0, -1], [0, -2], [1, -1], [-1, -1]]
        }
        let this_mvmts = mvmts[this.color];
        for (let i = 0; i < this_mvmts.length; i++) {
            var next_square_coords = charCodeToString(charCode(this.file) + this_mvmts[i][0]) +
                charCodeToString(charCode(this.rank) + this_mvmts[i][1]);
            if (board.coordInBounds(next_square_coords)) {
                if ((i == 0) &&
                    !(board.squareHasPiece(next_square_coords))) {
                    if (board.getKing(this.color).isInCheck()) {
                        let king_in_check = board.getKing(this.color);
                        if (coordBlocksCheck(king_in_check, next_square_coords)) {
                            squares.push(next_square_coords);
                            continue;
                        } else continue;
                    }
                    squares.push(next_square_coords);
                } else if ((i == 1) &&
                    ((board.getKing(this.color).isInCheck()) ? (true) : (squares.length != 0)) &&
                    (this.move_count == 0) &&
                    !(board.squareHasPiece(next_square_coords))) {
                    if (board.getKing(this.color).isInCheck()) {
                        let king_in_check = board.getKing(this.color);
                        if (coordBlocksCheck(king_in_check, next_square_coords)) {
                            squares.push(next_square_coords);
                            continue;
                        } else continue;
                    }
                    squares.push(next_square_coords);
                } else if (((i == 2) || (i == 3)) &&
                    (board.squaresHavePieces(this.coordinate, next_square_coords)) &&
                    !(board.squaresHaveSamePieceColors(this.coordinate, next_square_coords))) {
                    if (board.getKing(this.color).isInCheck()) {
                        let king_in_check = board.getKing(this.color);
                        if (coordBlocksCheck(king_in_check, next_square_coords)) {
                            squares.push(next_square_coords);
                            continue;
                        } else continue;
                    }
                    squares.push(next_square_coords);
                }
            }
        }
        squares = mergeArrs(squares, this.enPassantSquares());
        this.available_squares = squares;
    }
    canEnPassant() {
        return this.enPassantSquares() != 0;
    }
    enPassantSquares() {
        let squares = [];
        if (this.rank == this.en_passant_rank) {
            let rightSquareCoord = nextCoordString(this.coordinate, 1, 0);
            let rightSquare = board.getSquare(rightSquareCoord);
            let leftSquareCoord = nextCoordString(this.coordinate, -1, 0);
            let leftSquare = board.getSquare(leftSquareCoord);

            if (board.coordInBounds(rightSquareCoord) && rightSquare.hasPiece()) {
                let rightSquarePiece = rightSquare.getPiece();
                if (!this.isAllyPiece(rightSquarePiece) &&
                    rightSquarePiece.move_count == 1 &&
                    rightSquareCoord == lastElementInArr(board.move_history)) {
                    squares.push(nextCoordString(rightSquareCoord, 0, this.vertical_polarity));
                }
            }
            if (board.coordInBounds(leftSquareCoord) && leftSquare.hasPiece()) {
                let leftSquarePiece = leftSquare.getPiece();
                if (!this.isAllyPiece(leftSquarePiece) &&
                    leftSquarePiece.move_count == 1 &&
                    leftSquareCoord == lastElementInArr(board.move_history)) {
                    squares.push(nextCoordString(leftSquareCoord, 0, this.vertical_polarity));
                }
            }
        }
        return squares;
    }
    attackSquares() {
        let attack_squares = [];
        let attack1 = nextCoordString(this.coordinate, 1, this.vertical_polarity);
        let attack2 = nextCoordString(this.coordinate, -1, this.vertical_polarity);
        if (board.coordInBounds(attack1)) attack_squares.push(attack1);
        if (board.coordInBounds(attack2)) attack_squares.push(attack2);
        return attack_squares;
    }
}

class Knight extends Piece {
    constructor(initial_coordinate, color) {
        super(initial_coordinate, color);
        this.name = "Knight";
        this.point_value = 3;
    }
    updateAvailableSquares() {
        let squares = [];
        let mvmts = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
        for (let i = 0; i < mvmts.length; i++) {
            let next_square_coords = charCodeToString(charCode(this.file) + mvmts[i][0]) +
                charCodeToString(charCode(this.rank) + mvmts[i][1]);
            if (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (!board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        if (board.getKing(this.color).isInCheck()) {
                            let king_in_check = board.getKing(this.color);
                            if (coordBlocksCheck(king_in_check, next_square_coords)) {
                                squares.push(next_square_coords);
                                continue;
                            } else continue;
                        }
                        squares.push(next_square_coords);
                    }
                } else {
                    if (board.getKing(this.color).isInCheck()) {
                        let king_in_check = board.getKing(this.color);
                        if (coordBlocksCheck(king_in_check, next_square_coords)) {
                            squares.push(next_square_coords);
                            continue;
                        } else continue;
                    }
                    squares.push(next_square_coords);
                }
            }
        }
        this.available_squares = squares;
    }
}

class Bishop extends Piece {
    constructor(initial_coordinate, color) {
        super(initial_coordinate, color);
        this.name = "Bishop";
        this.point_value = 3;
    }
    updateAvailableSquares() {
        let squares = [];
        let mvmts = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
        for (let i = 0; i < mvmts.length; i++) {
            let next_square_coords = charCodeToString(charCode(this.file) + mvmts[i][0]) +
                charCodeToString(charCode(this.rank) + mvmts[i][1]);
            while (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        break;
                    } else {
                        squares.push(next_square_coords);
                        break;
                    }
                } else {
                    squares.push(next_square_coords);
                    next_square_coords = nextCoordString(next_square_coords, mvmts[i][0], mvmts[i][1]);
                }
            }
        }
        this.available_squares = squares;
    }
}

class Rook extends Piece {
    constructor(initial_coordinate, color) {
        super(initial_coordinate, color);
        this.name = "Rook";
        this.point_value = 5;
    }
    updateAvailableSquares() {
        let squares = [];
        let mvmts = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        // horizontal
        for (let i = 0; i < (mvmts.length / 2); i++) {
            let next_square_coords = charCodeToString(charCode(this.file) + mvmts[i][0]) + this.rank;
            while (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        break;
                    } else {
                        squares.push(next_square_coords);
                        break;
                    }
                }
            }
            squares.push(next_square_coords);
            next_square_coords = nextCoordString(next_square_coords, mvmts[i][0], mvmts[i][1]);
        }
        // vertical
        for (let i = 2; i < mvmts.length; i++) {
            let next_square_coords = this.file + charCodeToString(charCode(this.rank) + mvmts[i][1]);
            while (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        break;
                    } else {
                        squares.push(next_square_coords);
                        break;
                    }
                }
                squares.push(next_square_coords);
                next_square_coords = nextCoordString(next_square_coords, mvmts[i][0], mvmts[i][1]);
            }
        }
        this.available_squares = squares;
    }
}

class Queen extends Piece {
    constructor(initial_coordinate, color) {
        super(initial_coordinate, color);
        this.name = "Queen";
        this.point_value = 9;
    }
    updateAvailableSquares() {
        let squares = [];
        // BISHOP MOVES
        let mvmts = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
        for (let i = 0; i < mvmts.length; i++) {
            let next_square_coords = charCodeToString(charCode(this.file) + mvmts[i][0]) +
                charCodeToString(charCode(this.rank) + mvmts[i][1]);
            while (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        break;
                    } else {
                        squares.push(next_square_coords);
                        break;
                    }
                } else {
                    squares.push(next_square_coords);
                    next_square_coords = nextCoordString(next_square_coords, mvmts[i][0], mvmts[i][1]);
                }
            }
        }
        // ROOK MOVES
        mvmts = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        // horizontal
        for (let i = 0; i < (mvmts.length / 2); i++) {
            let next_square_coords = charCodeToString(charCode(this.file) + mvmts[i][0]) + this.rank;
            while (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        break;
                    } else {
                        squares.push(next_square_coords);
                        break;
                    }
                }
                squares.push(next_square_coords);
                next_square_coords = nextCoordString(next_square_coords, mvmts[i][0], mvmts[i][1]);
            }
        }
        // vertical
        for (let i = 2; i < mvmts.length; i++) {
            let next_square_coords = this.file + charCodeToString(charCode(this.rank) + mvmts[i][1]);
            while (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        break;
                    } else {
                        squares.push(next_square_coords);
                        break;
                    }
                }
                squares.push(next_square_coords);
                next_square_coords = nextCoordString(next_square_coords, mvmts[i][0], mvmts[i][1]);
            }
        }
        this.available_squares = squares;
    }
}

class King extends Piece {
    constructor(initial_coordinate, color) {
        super(initial_coordinate, color);
        this.name = "King";
        this.castle_sides = [];
    }
    updateAvailableSquares() {
        let squares = [];
        let mvmts = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
        for (let i = 0; i < mvmts.length; i++) {
            let next_square_coords = charCodeToString(charCode(this.file) + mvmts[i][0]) + charCodeToString(charCode(this.rank) + mvmts[i][1]);
            if (board.coordInBounds(next_square_coords)) {
                if (board.squareHasPiece(next_square_coords)) {
                    if (board.squaresHaveSamePieceColors(this.coordinate, next_square_coords)) {
                        continue;
                    }
                }
                squares.push(next_square_coords);
            }
        }
        if (this.canCastle()) {
            for (let i = 0; i < this.castle_sides.length; i++) {
                if (this.castle_sides[i] == 'K') {
                    squares.push(charCodeToString(charCode(this.file) + 2) + charCodeToString(charCode(this.rank)));
                } else if (this.castle_sides[i] == 'Q') {
                    squares.push(charCodeToString(charCode(this.file) - 2) + charCodeToString(charCode(this.rank)));
                }
            }
        }
        let opponents_moves = board.getColorAttackMoves(this.opponent_color);
        for (let i = 0; i < opponents_moves.length; i++) {
            squares = removeItemFromArr(squares, opponents_moves[i]);
        }
        this.available_squares = squares;
    }
    castleSides() {
        let castle_sides = ['K', 'Q'];
        let next_square_coords = null;
        if (this.move_count == 0) {
            // King side
            let KRook = board.getSquare('h' + this.rank).getPiece();
            if ((KRook instanceof Rook) && (KRook.designation == (this.color + 'K')) && (KRook.move_count == 0)) {
                for (let i = 1; i <= 2; i++) {
                    next_square_coords = charCodeToString(charCode(this.file) + i) + charCodeToString(charCode(this.rank));
                    if (board.squareHasPiece(next_square_coords)) {
                        castle_sides.splice(castle_sides.indexOf('K'), 1);
                        break;
                    }
                }
            } else { castle_sides.splice(castle_sides.indexOf('K'), 1); }
            // Queen side
            let QRook = board.getSquare('a' + this.rank).getPiece();
            if ((QRook instanceof Rook) && (QRook.designation == (this.color + 'Q')) && (QRook.move_count == 0)) {
                for (let i = -1; i >= -3; i--) {
                    next_square_coords = charCodeToString(charCode(this.file) + i) + charCodeToString(charCode(this.rank));
                    if (board.squareHasPiece(next_square_coords)) {
                        castle_sides.splice(castle_sides.indexOf('Q'), 1);
                        break;
                    }
                }
            } else { castle_sides.splice(castle_sides.indexOf('Q'), 1); }
        } else {
            castle_sides = [];
        }
        this.castle_sides = castle_sides;
    }
    canCastle() {
        this.castleSides();
        return this.castle_sides.length != 0;
    }
    isInCheck() {
        let opponents_moves = board.getColorAttackMoves(this.opponent_color);
        return opponents_moves.includes(this.coordinate);
    }
    pieceInCheckBy() {
        for (let i = 0; i < pieces[this.opponent_color].length; i++) {
            let opposing_piece = pieces[this.opponent_color][i];
            if (opposing_piece.getAvailableSquares().includes(this.coordinate)) {
                return opposing_piece;
            }
        }
        return null;
    }
}
var pieces = {
    'W': [
        new Pawn('a2', 'W'), new Pawn('b2', 'W'), new Pawn('c2', 'W'), new Pawn('d2', 'W'),
        new Pawn('e2', 'W'), new Pawn('f2', 'W'), new Pawn('g2', 'W'), new Pawn('h2', 'W'),
        new Knight('b1', 'W'), new Knight('g1', 'W'), new Bishop('c1', 'W'), new Bishop('f1', 'W'),
        new Rook('a1', 'W'), new Rook('h1', 'W'), new Queen('d1', 'W'), new King('e1', 'W')
    ],
    'B': [
        new Pawn('a7', 'B'), new Pawn('b7', 'B'), new Pawn('c7', 'B'), new Pawn('d7', 'B'),
        new Pawn('e7', 'B'), new Pawn('f7', 'B'), new Pawn('g7', 'B'), new Pawn('h7', 'B'),
        new Knight('b8', 'B'), new Knight('g8', 'B'), new Bishop('c8', 'B'), new Bishop('f8', 'B'),
        new Rook('a8', 'B'), new Rook('h8', 'B'), new Queen('d8', 'B'), new King('e8', 'B')
    ]
}