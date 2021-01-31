const initialGame = {
    room: "",
    spectators: [],
    players: [],
    messages: [],
    moves: [],
    scores: [],
    winner: null,
    status: ""
};


const game = (state = initialGame, action) => {
    switch (action.type) {
        case "JOIN":
            return {
                ...state,
                ...action.payload                
            }
        case "LEAVE":
            return initialGame
        case "UPDATE":
            return {
                ...state,
                ...action.payload.room
            }
        case "MOVE":
            return state.moves.length < 2
            ? {
                ...state,
                moves: [...state.moves, action.payload.move]
            }
            : {
                ...state,
                moves: [action.payload.move]
            }
        default:
            return state
    };
};

export default game;