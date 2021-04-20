const delay = ms => new Promise(res => setTimeout(res, ms));
const sleep = async () => {
    await delay(2000);
};

function formatCoord(file_key, rank_index) {
    return (fileConvert[file_key] + ranks[rank_index]).toString();
}

function convertCodeToCoord(file_char_code, rank_char_code) {
    return charCodeToString(file_char_code) + charCodeToString(rank_char_code);
}
function charCode(char) {
    return char.charCodeAt();
}
function charCodeToString(code) {
    return String.fromCharCode(code);
}
function nextCharCodeString(char, rep) {
    return String.fromCharCode(charCode(char) + (rep));
}
function nextCoordString(from_coord, horizontal, vertical) {
    let next_file = nextCharCodeString(from_coord[0], horizontal);
    let next_rank = nextCharCodeString(from_coord[1], vertical);
    return next_file + next_rank;
}

function coordinateRange(from_coordinate, to_coordinate) {
    let from_file = charCode(from_coordinate[0]), from_rank = charCode(from_coordinate[1]);
    let to_file = charCode(to_coordinate[0]), to_rank = charCode(to_coordinate[1]);
    let range = [];
    if (board.fileInBounds(charCodeToString(from_file)) && board.fileInBounds(charCodeToString(to_file)) &&
        board.rankInBounds(charCodeToString(from_rank)) && board.rankInBounds(charCodeToString(to_rank))) {
        if (from_coordinate == to_coordinate) {
            return [from_coordinate];
        } else if (from_file == to_file) {
            let current_rank = from_rank;
            if (from_rank > to_rank) {
                while (current_rank >= to_rank) {
                    range.push(convertCodeToCoord(from_file, current_rank));
                    current_rank = current_rank - 1;
                }
            } else {
                while (current_rank <= to_rank) {
                    range.push(convertCodeToCoord(from_file, current_rank));
                    current_rank = current_rank + 1;
                }
            }
        } else if (from_rank == to_rank) {
            let current_file = from_file;
            if (from_file > to_file) {
                while (current_file >= to_file) {
                    range.push(convertCodeToCoord(current_file, from_rank));
                    current_file = current_file - 1;
                }
            } else {
                while (current_file <= to_file) {
                    range.push(convertCodeToCoord(current_file, from_rank));
                    current_file = current_file + 1;
                }
            }
        } else if (Math.abs(from_file - to_file) == Math.abs(from_rank - to_rank)) {
            let current_file = from_file;
            let current_rank = from_rank;
            if (from_file > to_file) {
                if (from_rank > to_rank) {
                    while (current_rank >= to_rank) {
                        range.push(convertCodeToCoord(current_file, current_rank));
                        current_file = current_file - 1;
                        current_rank = current_rank - 1;
                    }
                } else {
                    while (current_rank <= to_rank) {
                        range.push(convertCodeToCoord(current_file, current_rank));
                        current_file = current_file - 1;
                        current_rank = current_rank + 1;
                    }
                }
            } else {
                if (from_rank > to_rank) {
                    while (current_rank >= to_rank) {
                        range.push(convertCodeToCoord(current_file, current_rank));
                        current_file = current_file + 1;
                        current_rank = current_rank - 1;
                    }
                } else {
                    while (current_rank <= to_rank) {
                        range.push(convertCodeToCoord(current_file, current_rank));
                        current_file = current_file + 1;
                        current_rank = current_rank + 1;
                    }
                }
            }
        }
    }
    return range;
}
function coordBlocksCheck(king_in_check, coordinate) {
    return coordinateRange(king_in_check.pieceInCheckBy().coordinate, king_in_check.coordinate).includes(coordinate);
}

function changeBackground() {
    let selector_DIV = document.getElementById("backg-selector");
    document.body.style.backgroundImage = "url('Backgrounds/" + selector_DIV.value + "-backg.jpg')";
    if (selector_DIV.value == "space" ||
        selector_DIV.value == "chess" ||
        selector_DIV.value == "underwater") {
        document.getElementById("go-arrows").style.filter = "invert(100%)";
    } else {
        document.getElementById("go-arrows").style.filter = "none";
    }
}

function removeItemFromArr(arr, item) {
    let index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
    return arr;
}
function mergeArrs(arr1, arr2) {
    let merged = arr1.concat(arr2);
    return merged.filter((item, pos) => merged.indexOf(item) == pos);
}
function lastElementInArr(arr) {
    return arr[arr.length - 1];
}
function kingCheckStyleToggle(color) {
    board.inCheckStyle(color, board.getKing(color).isInCheck())
}