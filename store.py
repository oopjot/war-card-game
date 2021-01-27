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
            deck.append([color, card])
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


    def start_playing(self):
        self.playing = True
        self.shuffle()

    def get_room_state(self):
        return json.dumps({
            "room": self.room,
            "spectators": self.spectators,
            "players": self.players,
            "messages": self.messages
        })
    
    def shuffle(self):
        random.shuffle(self.deck)
    
    def set_room_state(self, room):
        self.room = room["room"]
        self.spectators = room["spectators"]
        self.players = room["players"]
        self.messages = room["messages"]

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
            if len(self.players) == 2:
                self.set_status("Playing")

    def add_message(self, message):
        self.messages.append(message)

    def set_status(self, status):
        self.status = status

    def remove_from_room(self, name):
        if name in self.players:
            self.players.remove(name)
            if len(self.players) < 2:
                self.set_status("Waiting for players")
        if name in self.spectators:
            self.spectators.remove(name)
    
    def print_room(self):
        if self.in_room:
            os.system("clear")
            print("Room: " + self.room + "            " + "Status: " + self.status)
            print("Players: ")
            for player in self.players:
                print(player[1], " ", end="")
            print("\n")
            print("Spectators:")
            for spec in self.spectators:
                print(spec[1] + " ", end="")
            print("\n")
            print("Chat: ")
            for msg in self.messages:
                print(f"{msg[0]}:  {msg[1]}")
            
            print(self.spectators)
    
        else:
            os.system("clear")
            print("Hello, ", self.name)
            print("type !join to join any room you want :)")
            print("\n\n")
            


