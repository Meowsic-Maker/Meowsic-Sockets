const gameRooms = {
    // [roomKey]: {
    //   roomKey: 'AAAAA'
    //   placedCats: { { x, y, spriteName, zoneName } ....}
    //   users: [ ],
    //   players: { sockedId#: { playerId: socket.id }, {}, ....},
    //   numPlayers: 0
    // }
}



//IMPORT AND INITIALIZE FIREBASE
const firebase = require('firebase/app')
const firebaseConfig = require("../firebaseConfig")
require('firebase/auth');
const firebaseApp = firebase.initializeApp(firebaseConfig);

module.exports = (io) => {
    //IO CREATES A SOCKET CONNECTION AS SOON AS A GAME WINDOW IS OPEN:
    io.on("connection", (socket) => {
        console.log(`A socket connection to the server has been made: ${socket.id}`);

        //WHEN CLIENT EMITS 'JOIN ROOM'
        socket.on("joinRoom", (roomKey) => {
            socket.join(roomKey);
            const roomInfo = gameRooms[roomKey];
            //here is where we are creating a player state with current player info
            roomInfo.players[socket.id] = { playerId: socket.id };
            // update number of players
            roomInfo.numPlayers = Object.keys(roomInfo.players).length;

            console.log("roomInfo", roomInfo);
            // set initial state on client side: (Which INCLUDED placed cats!!)
            socket.emit("setState", roomInfo);

        });

        // WHEN A PLAYER DISCONNECTS FROM SOCKET
        socket.on("disconnect", function () {
            //Find which room they belong to
            let roomKey = 0;
            for (let keys1 in gameRooms) {
                for (let keys2 in gameRooms[keys1]) {
                    Object.keys(gameRooms[keys1][keys2]).map((el) => {
                        if (el === socket.id) { roomKey = keys1 }
                    });
                }
            }

            const roomInfo = gameRooms[roomKey];
            if (roomInfo) {
                console.log("user disconnected: ", socket.id);
                // remove this player from our players object
                delete roomInfo.players[socket.id];
                // update numPlayers
                roomInfo.numPlayers = Object.keys(roomInfo.players).length;
                // emit a message to all players to remove this player
                io.to(roomKey).emit("disconnected", {
                    playerId: socket.id,
                    numPlayers: roomInfo.numPlayers,
                });
                //ADD some logic to delete rooms if there are no more players and it's not saved??
            }
        });


        //ROOM KEY CODE LOGIC:
        // get a random code for the waiting room
        socket.on("getRoomCode", async function () {
            let key = codeGenerator();
            while (Object.keys(gameRooms).includes(key)) {
                key = codeGenerator();
            }
            gameRooms[key] = {
                roomKey: key,
                players: {},
                numPlayers: 0,
                placedCats: []
            };
            socket.emit("roomCreated", key);
        });
        socket.on("isKeyValid", function (input) {
            Object.keys(gameRooms).includes(input)
                ? socket.emit("keyIsValid", input)
                : socket.emit("keyNotValid");
        });


        //FIREBASE verification
        socket.on("isUserValid", function (input) {
            // input username & password?
            firebase.auth().signInWithEmailAndPassword(
                input.username,
                input.password
            ).then(() => {
                const user = firebaseApp.auth().currentUser;
                if (user != null) {
                    var name = user.displayName;
                    var email = user.email;
                    var photoUrl = user.photoURL;
                } // send back user obj
                socket.emit("userLoginSuccess", { name, email, photoUrl })
            }
            ).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error)
            });
            // ).then(user => {
            //     console.log("THIS IS OUR USER", user)
            // }).catch(err => {
            //     console.log(err)
            // })
            // if (user !== undefined) {
            //
            // } else {
            // socket.emit("UserNotValid")
            // }
        })

        socket.on("isSignUpValid", function (input) {
            // input username & password?
            firebase.auth().createUserWithEmailAndPassword(
                input.email,
                input.password
            ).then(() => {
                const user = firebaseApp.auth().currentUser;
                if (user != null) {
                    var name = user.displayName;
                    var email = user.email;
                    var photoUrl = user.photoURL;
                } // send back user obj
                socket.emit("userSignUpSuccess", { name, email, photoUrl })
            }
            ).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error)
            });
            // ).then(user => {
            //     console.log("THIS IS OUR USER", user)
            // }).catch(err => {
            //     console.log(err)
            // })
            // if (user !== undefined) {
            //
            // } else {
            // socket.emit("UserNotValid")
            // }
        })


        //PLAYING CATS/ UPDATING SOCKETS:
        socket.on('catPlayed', function (args) {
            const { x, y, selectedDropZone, socketId, roomKey, spriteName } = args

            //Create a cat object with details needed for re-rendering
            const cat = {
                dropZone: selectedDropZone,
                spriteName: spriteName,
                x, y
            }
            //push that cat object to the rooms/placed cats array
            //being stored to update NEW sockets:
            gameRooms[roomKey].placedCats.push(cat)

            //send placed cat info to other OPEN sockets:
            io.emit('catPlayedUpdate', args);
        });
    });
};

function codeGenerator() {
    let code = "";
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
