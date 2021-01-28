const initialGame = {
    room: "",
    spectators: [],
    players: [],
    messages: [],
    moves: [],
    scores: [],
    winner: null
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
                ...action.payload
            }
        default:
            return state
    };
};

export default game;