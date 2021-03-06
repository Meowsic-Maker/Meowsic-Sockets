const gameRooms = {
  // [roomKey]: {
  //   roomKey: 'AAAAA'
  //   placedCats: { { x, y, spriteName, zoneName } ....}
  //   usernames: [ ],
  //   players: { sockedId#: { playerId: socket.id }, {}, ....},
  //   numPlayers: 0
  // }
};

//IMPORT AND INITIALIZE FIREBASE
const firebase = require("firebase/app");
const firebaseConfig = require("../firebaseConfig");
require("firebase/auth");
const firebaseApp = firebase.initializeApp(firebaseConfig);

module.exports = (io) => {
  //IO CREATES A SOCKET CONNECTION AS SOON AS A GAME WINDOW IS OPEN:
  io.on("connection", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    //WHEN CLIENT EMITS 'JOIN ROOM'
    socket.on("joinRoom", (roomKey, username) => {
      console.log(username)
      socket.join(roomKey);
      const roomInfo = gameRooms[roomKey];
      //Create a player state with current player info
      roomInfo.players[socket.id] = { playerId: socket.id, username: username || "Anony-mouse" };
      if (username !== "Anony-mouse") roomInfo.loggedInUser = username
      //Update number of players
      roomInfo.numPlayers = Object.keys(roomInfo.players).length;
      //Set initial room state on client side
      socket.emit("setState", roomInfo);
    });

    // WHEN A PLAYER DISCONNECTS FROM SOCKET
    socket.on("disconnect", function () {
      //Find which room they belong to
      let roomKey = 0;
      for (let keys1 in gameRooms) {
        for (let keys2 in gameRooms[keys1]) {
          Object.keys(gameRooms[keys1][keys2]).map((el) => {
            if (el === socket.id) {
              roomKey = keys1;
            }
          });
        }
      }
      // UPDATE ROOMINFO - REMOVE USERNAME
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        console.log("user disconnected: ", socket.id);
        // remove this player from our players object & update number of players
        delete roomInfo.players[socket.id];
        roomInfo.numPlayers = Object.keys(roomInfo.players).length;
        // emit a message to all players to remove this player
        io.to(roomKey).emit("disconnected", {
          players: roomInfo.players,
          numPlayers: roomInfo.numPlayers,
        });
      }
    });

    // ROOM KEY CODE LOGIC:
    // get a random code for the waiting room
    socket.on("getRoomCode", async function () {
      let key = codeGenerator();
      while (Object.keys(gameRooms).includes(key)) {
        key = codeGenerator();
      }
      gameRooms[key] = {
        roomKey: key,
        players: {},
        usernames: [],
        numPlayers: 0,
        placedCats: [],
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
      // checking if input credentials are valid
      if (!input.email.includes("@")) {
        // set this text to display on form!
        socket.emit("emailNotValid");
      }
      firebase
        .auth()
        .signInWithEmailAndPassword(input.email, input.password)
        .then(() => {
          const user = firebaseApp.auth().currentUser;
          if (user != null) {
            var username = user.displayName;
            var email = user.email;
            console.log(
              "user.displayName",
              user.displayName,
              "user.email",
              user.email
            );
          } // send back user obj
          socket.emit("userLoginSuccess", { username, email });
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(error.message);
          socket.emit("userNotValid")
        });

    });

    socket.on("userConnectedToRoom", function (args) {
      const { roomKey, socket } = args
      let roomInfo = gameRooms[roomKey]
      io.to(roomKey).emit("newUserUpdate", roomInfo)

    })

    socket.on("isSignUpValid", function (input) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(input.email, input.password)
        .then(() => {
          const user = firebaseApp.auth().currentUser;
          // set username input to displayName in user profile
          user.updateProfile({ displayName: input.username });
          if (user != null) {
            var username = user.displayName;
            var email = user.email;
            console.log(
              "user.displayName",
              user.displayName,
              "user.email",
              user.email
            );
          } // send back user obj
          socket.emit("userSignUpSuccess", { username: input.username, email });
        })
        .catch(function (error) {
          socket.emit("signUpNotValid", error.message)
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('error', error.message);
          socket.emit("signUpNotValid", error.message)
        });
    });

    //PLAYING CATS/ UPDATING SOCKETS:
    socket.on("catPlayed", function (args) {
      const { x, y, selectedDropZone, socketId, roomKey, spriteName } = args;
      //Create a cat object with details needed for re-rendering & push to the room's placedCats array
      const cat = { dropZone: selectedDropZone, spriteName: spriteName, x, y };
      gameRooms[roomKey].placedCats.push(cat);
      //Send an update to open sockets in the room
      io.to(roomKey).emit("catPlayedUpdate", args);
    });

    socket.on("catDestroyed", function (args) {
      const { selectedDropZone, roomKey } = args;
      //filter out the destroyed cat from the room's placed cats array:
      gameRooms[roomKey].placedCats = gameRooms[roomKey].placedCats.filter(
        (cat) => cat.dropZone !== selectedDropZone
      );
      //Send an update to open sockets in the room
      io.to(roomKey).emit("catDestroyedUpdate", args);
    });
  });
};

function codeGenerator() {
  let words = ['heart', 'pizza', 'water', 'happy', 'green', 'music', 'party', 'dream', 'apple', 'tiger', 'river', 'house',
    'light', 'story', 'candy', 'puppy', 'queen', 'king', 'plant', 'black', 'zebra', 'panda', 'mouse', 'dress', 'sweet',
    'beach', 'love', 'wolf', 'goat', 'fish', 'tree', 'song', 'star', 'city', 'duck', 'lion', 'fire', 'wood', 'cake', 'dark',
    'leaf', 'pear', 'boat', 'snow', 'book', 'rose', 'kitten', 'claw', 'bird', 'taco', 'hero', 'meow', 'yarn', 'string', 'scratch', 'bite']
  let code = "";
  code += words[Math.floor(Math.random() * words.length)].toUpperCase()
  let chars = "123456789";
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
