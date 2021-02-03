// resets the chessboard
function getNewBoard(){
    return [ // A                                 B                                                C                                            D                                                E                                    F                                                       G                            H                           
    /** 8*/[{piece:{type:'ROOK',   color:'BLACK', hasMoved:false}},  {piece:{type:'KNIGHT', color:'BLACK'}}  ,  {piece:{type:'BISHOP', color:'BLACK'}}   , {piece:{type:'QUEEN',   color:'BLACK'}}    ,  {piece:{type:'KING',  color:'BLACK', hasMoved:false}}   ,   {piece:{type:'BISHOP', color:'BLACK'}}  ,  {piece:{type:'KNIGHT', color:'BLACK'}}  , {piece:{type:'ROOK',   color:'BLACK', hasMoved:false}}],
    /** 7*/[{piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}, {piece:{type:'PAWN', color:'BLACK'}}],
    /** 6*/[{piece:null}, {piece:null}, {piece:null}, {piece:null}, {piece:null},{piece:null}, {piece:null}, {piece:null}],
    /** 5*/[{piece:null}, {piece:null}, {piece:null}, {piece:null}, {piece:null},{piece:null}, {piece:null}, {piece:null}],
    /** 4*/[{piece:null}, {piece:null}, {piece:null}, {piece:null}, {piece:null},{piece:null}, {piece:null}, {piece:null}],
    /** 3*/[{piece:null}, {piece:null}, {piece:null}, {piece:null}, {piece:null},{piece:null}, {piece:null}, {piece:null}],
    /** 2*/[{piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}, {piece:{type:'PAWN', color:'WHITE'}}],
    /** 1*/[{piece:{type:'ROOK',   color:'WHITE', hasMoved:false}},{piece:{type:'KNIGHT', color:'WHITE'}},{piece:{type:'BISHOP', color:'WHITE'}}, {piece:{type:'QUEEN',  color:'WHITE'}}, {piece:{type:'KING',  color:'WHITE', hasMoved:false}}, {piece:{type:'BISHOP', color:'WHITE'}} , {piece:{type:'KNIGHT', color:'WHITE'}} , {piece:{type:'ROOK',   color:'WHITE', hasMoved:false}}],
    ]
}

// get user input
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("close", function() {
  console.log("\nGG!");
  process.exit(0);
});

// BOARD STYLING
const boxPadding = "|               "
const rowPadding = new Array(9).join(boxPadding) + "|\n"
const boxBorder = "  |-------------------------------------------------------------------------------------------------------------------------------|\n"

// appends File labels to board
const appendLetters = (output) => {
  for (let i = 0; i < 8; i++) {
    output += "        " + String.fromCharCode(65 + i) + "       "
  }
  output += "\n"
  return output
}

// prints the board and current positions with rank and file labels
function printBoard(board) {
  let boardOutput = ""
  boardOutput = appendLetters(boardOutput)
  // top bar
  boardOutput += boxBorder

  for (let i = 0; i < 8; i++) {
    // upper box spacing
    boardOutput += "  " + rowPadding
    boardOutput += String(8 - i) + " "
    for (let j = 0; j < 8; j++) {
      // i = rank, j= file
      let square = board[i][j]
      if (!square.piece) {
        boardOutput += boxPadding
      } else {
        let piece = square.piece
        let squareOutput = piece.color + " " + piece.type
        let padding = 14 - squareOutput.length
        boardOutput += "|  " + squareOutput + new Array(padding).join(" ")
      }
    }
    boardOutput += "|  " + String(8 - i) + "\n"
    boardOutput += "  " + rowPadding

    boardOutput += boxBorder
  }

  boardOutput = appendLetters(boardOutput)
  console.log(boardOutput)
}

// rank to array index map
const rankMap = {
  1: 7,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 0,
}

// file to array index map
const fileMap = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
}

// initializes gameBoard
let gameBoard = getNewBoard()

// initializes game state
const gameState = {
  isCheck: false,
  lastMove: [null, null],
  lastMovePiece: null,
  isWhiteMove: true,
  special: null
}

// ensure the rank and file entered are accurate and convert them to array indexes
function convertCoords([file, rank]) {
  if (typeof rank !== "number" || typeof file !== "string") {
    throw new Error(`invalid rank ${rank}  and/or file ${file}.  Please input letter than number.`)
  }
  let i = rankMap[rank]
  let j = fileMap[file[0].toUpperCase()]
  if ((!i && i !== 0) || (!j && j !== 0)) {
    throw new Error(`invalid rank ${rank}  and/or file ${file}.  Please input letter than number.`)
  }
  return [j, i]
}

// gets a piece on the board, 
function getPiece(board, [j, i]) {
  return board[i][j].piece
}

// we already have checked that we can move, this finalizes the movement.
async function executeMove([curJ, curI], [targetJ, targetI], isComplimentaryMove = false) {
  let currentPosition = gameBoard[curI][curJ]
  let targetPosition = gameBoard[targetI][targetJ]

  // move and take
  targetPosition.piece = currentPosition.piece
  currentPosition.piece = null

  if (targetPosition.piece.hasOwnProperty("hasMoved")) {
    targetPosition.piece.hasMoved = true
  }

  gameState.lastMove = [
    [curJ, curI],
    [targetJ, targetI]
  ]

  // if we did en passant or castle secondary move, don't change turn
  if (isComplimentaryMove) {
    gameState.special = null
    return
  }

  if (gameState.special === "EN_PASSANT") {
    if (gameState.isWhiteMove) {
      const deadPawnSquare = gameBoard[targetI + 1][targetJ]
      if (deadPawnSquare) {
        deadPawnSquare.piece = null
      }
    } else {
      const deadPawnSquare = gameBoard[targetI - 1][targetJ]
      if (deadPawnSquare) {
        deadPawnSquare.piece = null
      }

    }
  }

  if (targetPosition.piece.type === 'KING' && gameState.special === "CASTLE") {
    //move rook
    moveRookFromCastleMove()
  }
  if (targetPosition.piece.type === 'PAWN') {
    await checkPromotion(targetPosition.piece.color, [targetJ, targetI])
  }
  gameState.special = null
  gameState.isWhiteMove = !gameState.isWhiteMove
  gameState.lastMovePiece = targetPosition.piece.type
  // if the move is valid, its nota  self check, so set check to false
  gameState.isCheck = false
}

// validates that a rook can make the movement entered
function canRookMakeMove(board, [curJ, curI], [targetJ, targetI]) {
  if (curJ === targetJ) {
    //move vertical
    if (curI < targetI) {
      //move down
      for (let i = curI + 1; i < targetI; i++) {
        if (getPiece(board, [targetJ, i])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else if (curI > targetI) {
      //move up
      for (let i = curI - 1; i > targetI; i--) {
        if (getPiece(board, [targetJ, i])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else {
      throw new Error(`Impossible Move ${curJ} ${curI} to ${targetJ} ${targetI}`)
    }
  } else if (curI === targetI) {
    //move horizontal
    if (curJ < targetJ) {
      //move right
      for (let j = curJ + 1; j < targetJ; j++) {
        if (getPiece(board, [j, targetI])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else if (curJ > targetJ) {
      //move left
      for (let j = curJ - 1; j > targetJ; j--) {
        if (getPiece(board, [j, targetI])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else {
      throw new Error(`Impossible Move ${curJ} ${curI} to ${targetJ} ${targetI}`)
    }
  } else {
    throw new Error(`Impossible Move ${curJ} ${curI} to ${targetJ} ${targetI}`)
  }
}

// validates that a bishop can make the movement entered
function canBishopMakeMove(board, [curJ, curI], [targetJ, targetI]) {
  const distanceJ = Math.abs(curJ - targetJ)
  const distanceI = Math.abs(curI - targetI)
  if (distanceJ !== distanceI) {
    throw new Error(`Impossible Bishop Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
  }
  if (curI < targetI) {
    //move down
    if (curJ < targetJ) {
      //move right
      for (let i = 1; i < distanceI; i++) {
        if (getPiece(board, [curJ + i, curI + i])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else if (curJ > targetJ) {
      //move left
      for (let i = 1; i < distanceI; i++) {
        if (getPiece(board, [curJ - i, curI + i])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else {
      throw new Error(`Impossible Bishop Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
    }
  } else if (curI > targetI) {
    //move up
    if (curJ < targetJ) {
      //move right
      for (let i = 1; i < distanceI; i++) {
        if (getPiece(board, [curJ + i, curI - i])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else if (curJ > targetJ) {
      //move left
      for (let i = 1; i < distanceI; i++) {
        if (getPiece(board, [curJ - i, curI - i])) {
          throw new Error(`Invalid Move, piece blocking ${curJ} ${curI} to ${targetJ} ${targetI}`)
        }
      }
      return true
    } else {
      throw new Error(`Impossible Bishop Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
    }
  } else {
    throw new Error(`Impossible Move ${curJ} ${curI} to ${targetJ} ${targetI}`)
  }
}

// validates that a queen can make the movement entered
function canQueenMakeMove(board, curPos, targetPos) {
  let rookMove = null
  let bishopMove = null
  try {
    rookMove = canRookMakeMove(board, curPos, targetPos)
  } catch (e) {
    // impossible rook move
    rookMove = false
  }
  try {
    bishopMove = canBishopMakeMove(board, curPos, targetPos)
  } catch (e) {
    // impossible bishop move
    bishopMove = false
  }
  if (!rookMove && !bishopMove) {
    throw new Error(`Impossible Queen move to ${curPos} to ${targetPos}`)
  }
  return true
}

// validates that a knight can make the movement entered
function canKnightMakeMove([curJ, curI], [targetJ, targetI]) {
  const distanceJ = Math.abs(curJ - targetJ)
  const distanceI = Math.abs(curI - targetI)
  const isLShape = (distanceJ === 1 || distanceI === 1) && (distanceJ === 2 || distanceI === 2)
  if (!isLShape) {
    throw new Error(`Impossible Knight Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
  }
  return true
}

// moves a rook to complete castling movement
function moveRookFromCastleMove() {
  const [curPos, targetPos] = gameState.lastMove
  if (targetPos[0] === 6) {
    //kingSide
    if (targetPos[1] === 7) {
      // was white
      executeMove([7, 7], [5, 7], true)
    } else {
      //was black
      executeMove([7, 0], [5, 0], true)
    }
  } else {
    //queenSide
    if (targetPos[1] === 7) {
      // was white
      executeMove([0, 7], [3, 7], true)
    } else {
      //was black
      executeMove([0, 0], [3, 0], true)
    }
  }
}

// verifies a king can castle king side
function canCastleKingSide(board) {
  const isWhite = gameState.isWhiteMove
  if (isWhite) {
    // check h1 rook and path
    const h1Piece = getPiece(board, [7, 7])
    // verifies path is clear
    if (!h1Piece || h1Piece.type !== 'ROOK' || h1Piece.hasMoved || getPiece(board, [6, 7]) || getPiece(board, [5, 7])) {
      throw new Error(`Illegal White Kingside Castle`)
    }
    if(doesThisMovePutMeInCheck([4, 7], [5, 7]) || doesThisMovePutMeInCheck([4, 7], [6, 7])){
      throw new Error(`White cannot Kingside Castle through check`)
    }
  } else {
    // isBlack
    // check h8 rook and path
    const h8Piece = getPiece(board, [7, 0])
    // verifies path is clear
    if (!h8Piece || h8Piece.type !== 'ROOK' || h8Piece.hasMoved || getPiece(board, [6, 0]) || getPiece(board, [5, 0])) {
      throw new Error(`Illegal Black Kingside Castle`)
    }
    if(doesThisMovePutMeInCheck([4, 0], [5, 0]) || doesThisMovePutMeInCheck([4, 0], [6, 0])){
      throw new Error(`Black cannot Kingside Castle through check`)
    }
  }
  gameState.special = "CASTLE"
  return true
}

// verifies a king can castle queen side
function canCastleQueenSide(board) {
  const isWhite = gameState.isWhiteMove
  if (isWhite) {
    // check a1 rook and path
    const a1Piece = getPiece(board, [0, 7])
    // verifies path is clear
    if (!a1Piece || a1Piece.type !== 'ROOK' || a1Piece.hasMoved || getPiece(board, [1, 7]) || getPiece(board, [2, 7]) || getPiece(board, [3, 7])) {
      throw new Error(`Illegal White QueenSide Castle`)
    }
    if(doesThisMovePutMeInCheck([4, 7], [3, 7]) || doesThisMovePutMeInCheck([4, 7], [2, 7])){
      throw new Error(`White cannot QueenSide Castle through check`)
    }
  } else {
    // isBlack
    // check a8 rook and path
    const a8Piece = getPiece(board, [0, 0])
    // verifies path is clear
    if (!a8Piece || a8Piece.type !== 'ROOK' || a8Piece.hasMoved || getPiece(board, [1, 0]) || getPiece(board, [2, 0]) || getPiece(board, [3, 0])) {
      throw new Error(`Illegal Black QueenSide Castle`)
    }
    if(doesThisMovePutMeInCheck([4, 0], [3, 0]) || doesThisMovePutMeInCheck([4, 0], [2, 0])){
      throw new Error(`Black cannot QueenSide Castle through check`)
    }
  }
  gameState.special = "CASTLE"
  return true
}

// validates that a king can make the movement entered
function canKingMakeMove(board, [curJ, curI], [targetJ, targetI]) {
  const distanceJ = Math.abs(curJ - targetJ)
  const distanceI = Math.abs(curI - targetI)
  // if 1 square movement
  if ((distanceJ === 1 || distanceJ === 0) && (distanceI === 1 || distanceI === 0)) {
    return true
  } else if (distanceJ === 2) {
    // castle logic
    const king = getPiece(board, [curJ, curI])
    if (king.hasMoved) {
      throw new Error(`Impossible King Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
    }
    if (curJ - targetJ < 0) {
      // move right
      return canCastleKingSide(board)
    } else {
      // move left
      return canCastleQueenSide(board)
    }
    throw new Error(`Impossible King Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
  } else {
    throw new Error(`Impossible King Move, ${curJ} ${curI} to ${targetJ} ${targetI}`)
  }
}

// allows the user to choose the promotion piece
async function promote([targetJ, targetI]) {
  const answer = await new Promise((resolve, reject) => {
    rl.question(`${gameState.isWhiteMove? 'White':'Black'}- what promotion would you like: Queen or Knight?`, function(answer) {
      if (answer.toUpperCase() === 'Q' || answer.toUpperCase() === 'QUEEN') {
        resolve({
          type: 'QUEEN',
          color: gameState.isWhiteMove ? 'WHITE' : 'BLACK'
        })
      } else if (answer.toUpperCase() === 'K' || answer.toUpperCase() === 'KNIGHT') {
        resolve({
          type: 'KNIGHT',
          color: gameState.isWhiteMove ? 'WHITE' : 'BLACK'
        })
      } else {
        resolve(null)
      }
    })
  })
  if (answer === null) {
    return await promote([targetJ, targetI])
  } else {
    gameBoard[targetI][targetJ].piece = answer
  }
}

//verifies that a pawn has promoted
async function checkPromotion(color, [targetJ, targetI]) {
  if (color === 'WHITE' && targetI === 0) {
    return promote([targetJ, targetI])
  } else if (color === 'BLACK' && targetI === 7) {
    return promote([targetJ, targetI])
  }
}

// validates that a pawn can make the movement entered
function canPawnMakeMove(board, color, [curJ, curI], [targetJ, targetI]) {
  if (color === 'WHITE') {
    if (targetI - curI === -1) {
      // 1 square movements up
      if (targetJ - curJ === -1) {
        // attack left
        if (getPiece(board, [targetJ, targetI])) {
          return true
        } else {
          const lastMoveStart = gameState.lastMove[0]
          const lastMoveEnd = gameState.lastMove[1]
          const doStartMovesMatch = lastMoveStart ? (lastMoveStart[0] === curJ - 1 && lastMoveStart[1] === curI - 2) : false
          const doEndMovesMatch = lastMoveEnd ? (lastMoveEnd[0] === curJ - 1 && lastMoveEnd[1] === curI) : false
          if (gameState.lastMovePiece === 'PAWN' && doStartMovesMatch && doEndMovesMatch) {
            gameState.special = 'EN_PASSANT'
            return true
          } else {
            throw new Error('Pawn cannot en passant')
          }
        }
      } else if (targetJ - curJ === 1) {
        // attack right
        if (getPiece(board, [targetJ, targetI])) {
          return true
        } else {
          const lastMoveStart = gameState.lastMove[0]
          const lastMoveEnd = gameState.lastMove[1]
          const doStartMovesMatch = lastMoveStart ? (lastMoveStart[0] === curJ + 1 && lastMoveStart[1] === curI - 2) : false
          const doEndMovesMatch = lastMoveEnd ? (lastMoveEnd[0] === curJ + 1 && lastMoveEnd[1] === curI) : false
          if (gameState.lastMovePiece === 'PAWN' && doStartMovesMatch && doEndMovesMatch) {
            gameState.special = 'EN_PASSANT'
            return true
          } else {
            throw new Error('Pawn cannot en passant')
          }
        }
      } else if (targetJ - curJ === 0) {
        // go forward 1
        if (getPiece(board, [targetJ, targetI])) {
          throw new Error(`Pawn is blocked: ${[curJ, curI]} ${[targetJ, targetI]}`)
        }
        return true
      } else {
        throw new Error(`Pawns can only move one square: not ${[curJ, curI]} ${[targetJ, targetI]}`)
      }
    } else if (targetI - curI === -2) {
      // 2 square movement up
      if (targetJ - curJ === 0) {
        // path is clear and is first move
        if (!getPiece(board, [targetJ, curI - 1]) && !getPiece(board, [targetJ, curI - 2]) && curI === 6) {
          return true
        } else {
          throw new Error(`Illegal pawn move: ${[curJ, curI]} ${[targetJ, targetI]}`)
        }
      } else {
        throw new Error(`Illegal pawn move: ${[curJ, curI]} ${[targetJ, targetI]}`)
      }
    } else {
      throw new Error(`Illegal pawn move: ${[curJ, curI]} ${[targetJ, targetI]}`)
    }
  } else {
    // black pawn
    if (targetI - curI === 1) {
      // 1 square movements down
      if (targetJ - curJ === -1) {
        // attack left
        if (getPiece(board, [targetJ, targetI])) {
          return true
        } else {
          const lastMoveStart = gameState.lastMove[0]
          const lastMoveEnd = gameState.lastMove[1]
          const doStartMovesMatch = lastMoveStart ? (lastMoveStart[0] === curJ - 1 && lastMoveStart[1] === curI + 2) : false
          const doEndMovesMatch = lastMoveEnd ? (lastMoveEnd[0] === curJ - 1 && lastMoveEnd[1] === curI) : false
          if (gameState.lastMovePiece === 'PAWN' && doStartMovesMatch && doEndMovesMatch) {
            gameState.special = 'EN_PASSANT'
            return true
          } else {
            throw new Error('Pawn cannot en passant')
          }
        }
      } else if (targetJ - curJ === 1) {
        // attack right
        if (getPiece(board, [targetJ, targetI])) {
          return true
        } else {
          const lastMoveStart = gameState.lastMove[0]
          const lastMoveEnd = gameState.lastMove[1]
          const doStartMovesMatch = lastMoveStart ? (lastMoveStart[0] === curJ + 1 && lastMoveStart[1] === curI + 2) : false
          const doEndMovesMatch = lastMoveEnd ? (lastMoveEnd[0] === curJ + 1 && lastMoveEnd[1] === curI) : false
          if (gameState.lastMovePiece === 'PAWN' && doStartMovesMatch && doEndMovesMatch) {
            gameState.special = 'EN_PASSANT'
            return true
          } else {
            throw new Error('Pawn cannot en passant')
          }
        }
      } else if (targetJ - curJ === 0) {
        // go forward 1
        if (getPiece(board, [targetJ, targetI])) {
          throw new Error(`Pawn is blocked: ${[curJ, curI]} ${[targetJ, targetI]}`)
        }
        return true
      } else {
        throw new Error(`Pawns can only move one square: not ${[curJ, curI]} ${[targetJ, targetI]}`)
      }
    } else if (targetI - curI === 2) {
      // 2 square movement down
      if (targetJ - curJ === 0) {
        // path is clear and is first move
        if (!getPiece(board, [targetJ, curI + 1]) && !getPiece(board, [targetJ, curI + 2]) && curI === 1) {
          return true
        } else {
          throw new Error(`Illegal pawn move: ${[curJ, curI]} ${[targetJ, targetI]}`)
        }
      } else {
        throw new Error(`Illegal pawn move: ${[curJ, curI]} ${[targetJ, targetI]}`)
      }
    } else {
      throw new Error(`Illegal pawn move: ${[curJ, curI]} ${[targetJ, targetI]}`)
    }
  }
}

// ensures that a piece does not move onto a square occupied by a piece of the same color
function checkIfTargetSquareSameTeam(board, color, curPos, [targetJ, targetI]) {
  // if same team, reject
  const targetSquare = getPiece(board, [targetJ, targetI])
  if (targetSquare && (targetSquare.color === color)) {
    throw new Error(`Invalid Move, moving to square with same color piece: ${curPos} to ${targetJ} ${targetI}`)
  }
}

// validates that a piece can make the entered move
function validateMove(board, piece, curPos, targetPos) {
  checkIfTargetSquareSameTeam(board, piece.color, curPos, targetPos)
  switch (piece.type) {
    case 'ROOK': {
      return canRookMakeMove(board, curPos, targetPos)
    }
    case 'KNIGHT': {
      return canKnightMakeMove(curPos, targetPos)
    }
    case 'BISHOP': {
      return canBishopMakeMove(board, curPos, targetPos)
    }
    case 'QUEEN': {
      return canQueenMakeMove(board, curPos, targetPos)
    }
    case 'KING': {
      return canKingMakeMove(board, curPos, targetPos)
    }
    case 'PAWN': {
      return canPawnMakeMove(board, piece.color, curPos, targetPos)
    }
    default: {
      throw new Error(`Invalid piece: ${piece}`)
    }
  }
}

// gets king position by color
function getKingPositionByColor(color, board){
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      const piece = board[i][j].piece
      if(piece && piece.type === 'KING' && piece.color === color){
        return [j, i]
      }
    }
  }
}

// checks if any specified color piece can reach the passed in position
function canReachPosition(color, board, position){
  let piecesThatCanReach = []
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      const piece = board[i][j].piece
      if(piece && piece.color === color){
        try{
          if(validateMove(board, piece, [j, i], position)){
            if(piece.type === 'PAWN' && Math.abs(position[1] - i) === 2){
              // pawns cant take when they move 2
              continue
            }
            piecesThatCanReach.push({piece, position: [j, i]})
          }
        } catch(e){
          // do nothing
        }
      }
    }
  }
  return piecesThatCanReach
}

// checks if player caused check
function checkForCheck(gameboard){
  const colorMakingMove = gameState.isWhiteMove? 'WHITE' : 'BLACK'
  const colorCausingCheck = gameState.isWhiteMove? 'BLACK' : 'WHITE'
  const kingToCheckPosition = getKingPositionByColor(colorMakingMove, gameboard)
  const pieceCausingCheck = canReachPosition(colorCausingCheck, gameboard, kingToCheckPosition)
  if(pieceCausingCheck[0]){
    console.log(pieceCausingCheck[0].piece.type + ' on ' + pieceCausingCheck[0].position + ' causes check.')
    return true
  }
  return false
}

// creates a fake board and checks if check was not prevented
function doesThisMovePutMeInCheck([curJ, curI], [targetJ, targetI]){
  const temporaryGameBoard = JSON.parse(JSON.stringify(gameBoard))
  let currentPosition = temporaryGameBoard[curI][curJ]
  let targetPosition = temporaryGameBoard[targetI][targetJ]

  // simulate move and/or take
  targetPosition.piece = currentPosition.piece
  currentPosition.piece = null

  return checkForCheck(temporaryGameBoard)
}

// get squares the rook uses to cause check
function getRookCheckPathSquares(rookPosition, targetKingPosition){
  let pathsToBlock = []
  if(rookPosition[0] === targetKingPosition[0]){
    // column
    if(rookPosition[1] < targetKingPosition[1]){
      // count up row to get spaces
      for(let i = targetKingPosition[1] - 1; i > rookPosition[1]; i--){
        pathsToBlock.push([rookPosition[0], i])
      }
        pathsToBlock.push(rookPosition)
    }
    else if(rookPosition[1] > targetKingPosition[1]){
      // count down row to get spaces
      for(let i = targetKingPosition[1] + 1; i < rookPosition[1]; i++){
        pathsToBlock.push([rookPosition[0], i])
      }
        pathsToBlock.push(rookPosition)
    }
  }
  else if(rookPosition[1] === targetKingPosition[1]){
    // row
    if(rookPosition[0] < targetKingPosition[0]){
      // count left to get spaces
      for(let j = targetKingPosition[0] - 1; j > rookPosition[0]; j--){
        pathsToBlock.push([j, rookPosition[1]])
      }
        pathsToBlock.push(rookPosition)
    }
    else if(rookPosition[0] > targetKingPosition[0]){
      // count right to get spaces
      for(let j = targetKingPosition[0] + 1; j < rookPosition[0]; j++){
        pathsToBlock.push([j, rookPosition[1]])
      }
        pathsToBlock.push(rookPosition)
      
    }
    
  }
  return pathsToBlock
}

// get squares the bishops uses to cause check
function getBishopCheckPathSquares(bishopPosition, targetKingPosition){
  let pathsToBlock = []
  if(Math.abs(bishopPosition[0] - targetKingPosition[0]) === Math.abs(bishopPosition[1] - targetKingPosition[1]))
  if(bishopPosition[0] < targetKingPosition[0]){
    // from left
    if(bishopPosition[1] < targetKingPosition[1]){
      // from up
      for(let i = 1; i < targetKingPosition[1] - bishopPosition[1]; i++){
        pathsToBlock.push([targetKingPosition[0] - i, targetKingPosition[1] - i])
      }
        pathsToBlock.push(bishopPosition)
    }
    else{
      // from down
      for(let i = 1; i < bishopPosition[1] - targetKingPosition[1]; i++){
        pathsToBlock.push([targetKingPosition[0] - i, targetKingPosition[1] + i])
      }
        pathsToBlock.push(bishopPosition)
    }
  }
  else {
    // from right
    if(bishopPosition[1] < targetKingPosition[1]){
      // from up
      for(let i = 1; i < targetKingPosition[1] - bishopPosition[1]; i++){
        pathsToBlock.push([targetKingPosition[0] + i, targetKingPosition[1] - i])
      }
        pathsToBlock.push(bishopPosition)
    }
    else{
      // from down
      for(let i = 1; i < bishopPosition[1] - targetKingPosition[1]; i++){
        pathsToBlock.push([targetKingPosition[0] + i, targetKingPosition[1] + i])
      }
        pathsToBlock.push(bishopPosition)
    }
    
  }
  return pathsToBlock
}

// get squares that can block or stop check
function getCheckPathSquares(piecesCausingCheck, targetKingPosition){
  let pathsToBlock = []
  piecesCausingCheck.forEach(({piece, position})=>{
    if(piece.type === 'KNIGHT' || piece.type === 'PAWN'){
      pathsToBlock.push(position)
    }
    if(piece.type === 'ROOK'){
      const rookSquares = getRookCheckPathSquares(position, targetKingPosition)
      pathsToBlock.push(...rookSquares)
    }
    if(piece.type === 'BISHOP'){
      const bishopSquares = getBishopCheckPathSquares(position, targetKingPosition)
      pathsToBlock.push(...bishopSquares)
    }
    if(piece.type === 'QUEEN'){
      const rookSquares = getRookCheckPathSquares(position, targetKingPosition)
      pathsToBlock.push(...rookSquares)
      const bishopSquares = getBishopCheckPathSquares(position, targetKingPosition)
      pathsToBlock.push(...bishopSquares)
    }
  })
  return pathsToBlock
}

// get valid in board squares the king can attempt to move to
function getValidKingMoves([j, i]){
  let validMoves = [[j, i + 1], [j, i - 1], [j + 1, i], [j - 1, i], [j + 1, i + 1], [j + 1, i - 1], [j - 1, i + 1], [j - 1, i - 1]]
  return validMoves.filter(([j, i])=>{
    return j > -1 && j < 8 && i > -1 && i < 8
  })
}

// check if there is a move to escape check
function canEscapeCheck(board, squaresToBlock, colorToMove){
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      const piece = gameBoard[i][j].piece
      if(piece && piece.color === colorToMove){
        try{
            for(let squareIndex = 0; squareIndex < squaresToBlock.length; squareIndex++){
              try{
                  if(validateMove(board, piece, [j, i], squaresToBlock[squareIndex])){
                    if(piece.type === 'PAWN' && Math.abs(squaresToBlock[squareIndex][1] - i) === 2){
                      // pawns cant take when they move 2
                      continue
                    }
                    const causesCheck = doesThisMovePutMeInCheck([j, i], squaresToBlock[squareIndex])
                    if(!causesCheck){
                      return true
                    }
                  }
              }catch(e){
                // do nothing
              }
            }
            // check king moves
            if(piece.type === 'KING'){
              const validKingMoves = getValidKingMoves([j, i])
                for(let index = 0; index < validKingMoves.length; index++){
                  try{
                      if(validateMove(board, piece, [j, i], validKingMoves[index])){
                        const causesCheck = doesThisMovePutMeInCheck([j, i], validKingMoves[index])
                        if(!causesCheck){
                          return true
                        }
                      }
                  } catch(e){
                    // do nothing
                  }
                }
            }
        } catch(e){
          // do nothing
        }
      }
    }
  }
  return false
}

// check if board has checkmate
function checkIsCheckmate(board){
  const colorMakingMove = gameState.isWhiteMove? 'WHITE' : 'BLACK'
  const colorCausingCheck = gameState.isWhiteMove? 'BLACK' : 'WHITE'
  const kingToCheckPosition = getKingPositionByColor(colorMakingMove, gameBoard)
  // get all pieces causing check
  const piecesCausingCheck = canReachPosition(colorCausingCheck, gameBoard, kingToCheckPosition)
  // get paths
  const squaresToBlock = getCheckPathSquares(piecesCausingCheck, kingToCheckPosition)
  const aMoveExistsToStopCheck = canEscapeCheck(board, squaresToBlock, colorMakingMove)
  return !aMoveExistsToStopCheck
}

// takes in the entered move and performs the action if valid
async function makeMove(currentSquare, targetSquare) {
  try {
    if (!currentSquare || !targetSquare) {
      throw new Error(`Invalid movement: ${currentSquare} ${targetSquare}`)
    }
    const currentPosition = convertCoords([currentSquare[0], Number(currentSquare[1])])
    const targetPosition = convertCoords([targetSquare[0], Number(targetSquare[1])])
    if (currentPosition[0] === targetPosition[0] && currentPosition[1] === targetPosition[1]) {
      throw new Error('Piece did not move')
    }
    const currentPiece = getPiece(gameBoard, currentPosition)
    if (!currentPiece) {
      throw new Error(`No piece at ${currentSquare}`)
    }
    if((gameState.isWhiteMove && currentPiece.color !== 'WHITE') || (!gameState.isWhiteMove  && currentPiece.color !== 'BLACK')){
      throw new Error('That is not your piece!')
    }
    const isValidMove = validateMove(gameBoard, currentPiece, currentPosition, targetPosition)
    if (isValidMove) { 
      // does this move cause a self check, or not stop check
      const isSelfCheck = doesThisMovePutMeInCheck(currentPosition, targetPosition)
      if(isSelfCheck){
        throw new Error('Move results in check against yourself')
      }
      // else set check to not check, make move
      await executeMove(currentPosition, targetPosition)
      const didMoveCauseCheck = checkForCheck(gameBoard)
      if(didMoveCauseCheck){
        gameState.isCheck = true
        const isCheckMate= checkIsCheckmate(gameBoard)
        if(isCheckMate){
          printBoard(gameBoard)
          console.log('CHECKMATE')
          rl.close()
        }
      }
    } else {
      throw new Error('Invalid move')
    }
    printBoard(gameBoard)
    if(gameState.isCheck){
      console.log('CHECK')
    }
  } catch (err) {
    console.log(err)
  } finally {
    return Promise.resolve()
  }
}

// allows us to loop and get input moves from the user
async function getInput() {
  const curSquare = await new Promise((resolve, reject) => {
    rl.question(`${gameState.isWhiteMove? 'White':'Black'}- select piece to move:`, function(curPos) {
      resolve(curPos)
    })
  })
  const targetSquare = await new Promise((resolve, reject) => {
    rl.question(`${gameState.isWhiteMove? 'White':'Black'}- select square to move to:`, function(targetPos) {
      resolve(targetPos)
    });
  })
  await makeMove(curSquare, targetSquare).then(getInput)
}

// call getInput to begin game
printBoard(gameBoard)
// comment this line out during simulateGame testing
getInput()

async function simulateGame(){
/** Fools Check with 1 escape square*/
// await makeMove("f2","f3")
// await makeMove("e7","e6")
// await makeMove("g2","g4")
// await makeMove("a7","a6")
// await makeMove("e2","e4")
// await makeMove("d8","h4")

/** knight queen double attack checkmate*/
// await makeMove("e2","e4")
// await makeMove("b8","c6")
// await makeMove("e4","e5")
// await makeMove("c6","e5")
// await makeMove("a2","a3")
// await makeMove("d7","d5")
// await makeMove("a1","a2")
// await makeMove("d8","d6")
// await makeMove("a2","a1")
// await makeMove("d6","e6")
// await makeMove("a1","a2")
// await makeMove("e5","f3")

/** Fools Mate */
// await makeMove("f2","f3")
// await makeMove("e7","e6")
// await makeMove("g2","g4")
// await makeMove("d8","h4")

}
// allows us to see how a game would proceed
// make sure to comment out getInput() for testing
// simulateGame()


