import json
import os
import random

def get_cards():
    cards = {
        "clubs": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
        "diamonds": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
        "hearts": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
        "spades": ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
    }
    deck = []
    for color in cards:
        for card in cards[color]:
            if card == "J":
                power = 11
            elif card == "Q":
                power = 12
            elif card == "K":
                power = 13
            elif card == "A":
                power = 14
            else:
                power = int(card)
            deck.append([color, card, power])
    random.shuffle(deck)
    return deck



class Store:
    def __init__(self):
        self.id = None
        self.connected = False
        self.in_room = False
        self.room = ""
        self.spectators = []
        self.players = []
        self.messages = []
        self.name = None
        self.playing = False
        self.status = "Waiting for players"
        self.deck = get_cards()
        self.gaming = False
        self.moves = []
        self.scores = []

        self.game_messages = []

    def start_playing(self):
        self.playing = True
        # self.deck = get_cards()

    def get_room_state(self):
        return json.dumps({
            "room": self.room,
            "spectators": self.spectators,
            "players": self.players,
            "messages": self.messages,
            "status": self.status,
            "scores": self.scores,
            "game_messages": self.game_messages
        })
    
    def set_room_state(self, room):
        self.room = room["room"]
        self.spectators = room["spectators"]
        self.players = room["players"]
        self.messages = room["messages"]
        self.status = room["status"]
        self.game_messages = room["game_messages"]
        self.scores = room["scores"]


    def connect(self):
        self.connected = True
    
    def set_id(self, id):
        self.id = id
    
    def set_name(self, name):
        self.name = name
    
    def join(self, room):
        self.room = room
        self.in_room = True
        self.spectators.append([self.id, self.name])

    def leave(self):
        self.room = ""
        self.in_room = False
        self.spectators = []
        self.players = []
        self.messages = []
        self.playing = False
        self.status = ""
        self.scores = []
        self.game_messages = []
        self.moves = []

    def add_spectator(self, spectator):
        self.spectators.append(spectator)

    def add_player(self, player):
        not_in = True
        for p in self.players:
            if p[0] == player[0]:
                not_in = False

        if len(self.players) < 2 and not_in:
            for spec in self.spectators:
                if spec[0] == player[0]:
                    self.spectators.remove(player)
            self.players.append(player)
            self.scores.append([player[0], 52])
            if len(self.players) == 2:
                self.set_status("Playing")
                self.gaming = True

    def add_message(self, message):
        self.messages.append(message)

    def set_status(self, status):
        self.status = status

    def remove_from_room(self, player):
        if player in self.players:
            self.players.remove(player)
            for score in self.scores:
                if score[0] == player[0]:
                    self.scores.remove(score)
            if len(self.players) < 2:
                self.set_status("Waiting for players")
        if player in self.spectators:
            self.spectators.remove(player)
    
    def update_score(self, id, amount):
        for score in self.scores:
            if score[0] == id:
                score[1] += amount

    def round(self, move1, move2):
        if move1[1][2] > move2[1][2]:
            if move1[0] == self.id:
                self.deck.append(move1[1])
                self.deck.append(move2[1])
                self.deck = self.deck[1:]
            else:
                self.deck = self.deck[1:]
            return move1[0]

        elif move1[1][2] < move2[1][2]:
            if move2[0] == self.id:
                self.deck.append(move2[1])
                self.deck.append(move1[1])
                self.deck = self.deck[1:]
            else:
                self.deck = self.deck[1:]
            return move2[0]
        else:
            if move2[0] == self.id:
                self.deck.append(move2[1])
                self.deck = self.deck[1:]
            else:
                self.deck.append(move1[1])
                self.deck = self.deck[1:]
            return False

    
    def make_move(self, move):
        if len(self.moves) >= 2:
            self.moves = []
        if len(self.game_messages) >= 3:
            self.game_messages = []
        for m in self.moves:
            if m[0] == move[0]:
                return

        if len(self.moves) < 2:
            self.moves.append(move)
            for p in self.players:
                if p[0] == move[0]:
                    player = p
            self.game_messages.append(f"{player[1]} played {move[1][1]} of {move[1][0]}")
        
        if len(self.moves) == 2:
            winner = self.round(self.moves[0], self.moves[1])
            if winner:
                for p in self.players:
                    if p[0] == winner:
                        player = p
                for s in self.scores:
                    if s[0] == winner:
                        s[1] += 1
                    else:
                        s[1] -= 1
                self.game_messages.append(f"{player[1]} won this round")
            else:
                self.game_messages.append("draw")
        


    def update_status(self):
        if len(self.players) < 2:
            self.status = "Waiting for players to join"
        if self.gaming:
            self.status = "Game started"
        

    
    def print_room(self):
        if self.in_room:
            os.system("clear")
            print("Room: " + self.room + "            " + "Status: " + self.status)
            print("Players: ")
            for player, score in zip(self.players, self.scores):
                print(player[1] + " " + str(score[1]))
            print("\n")
            print("Spectators:")
            for spec in self.spectators:
                print(spec[1] + " ", end="")
            print("\n")
            print("Chat: ")
            for msg in self.messages:
                print(f"{msg[0]}:  {msg[1]}")
            
            print("\n\n")
            print("Game status:")
            for msg in self.game_messages:
                print(msg)
            

    
        else:
            os.system("clear")
            print("Hello, ", self.name)
            print("type !join to join any room you want :)")
            print("\n\n")
            


