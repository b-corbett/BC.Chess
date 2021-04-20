class Square {
    constructor(coordinate) {
        this.coordinate = coordinate;
        this.piece = null;
    }

    // SETTERS
    setPiece(piece) {
        this.piece = piece;
    }
    // #########

    // GETTERS
    getPiece() {
        return this.piece;
    }
    getPieceColor() {
        return (this.hasPiece()) ? this.piece.color : null;
    }
    // ########

    // CHECKERS
    hasPiece() {
        return this.piece != null;
    }
    sameColorPieceAs(square_obj) {
        return this.piece.color == square_obj.piece.color;
    }
    // ########


}