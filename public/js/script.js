let socket = io();
let typingTimer;
let userNames;
let typingnameSet = new Set();
var typingName = "";



const usernameCatcher = () => {
    let loaderPrompt = prompt("Enter your name : ", "your name here");
    userNames = loaderPrompt;
};

document.onload = usernameCatcher();
var colors = ['#ff0000', '#00ff00', '#0000ff'];
var random_color = colors[Math.floor(Math.random() * colors.length)];


$(document).ready(function() {
    $("#formChat").submit((e) => {
        e.preventDefault();
        let userResponse = $("#userResponse").val();
        socket.emit('message', {
            'usernames': userNames,
            'response': $('#userResponse').val()
        });
        $('#displayChat').scrollTop($('#displayChat')[0].scrollHeight);
        $("#userResponse").val("");
        timeoutFunction();
        return false;
    });

    $("#userResponse").keypress(() => {
        socket.emit('typingFunction', {
            'usernames': userNames,
            'function': ' is typing...   '
        });
    });

    $("#userResponse").keyup(() => {
        clearTimeout(typingTimer);
        timeoutFunction();
    });

    const timeoutFunction = () => {
        typingTimer = setTimeout(() => {
            socket.emit('typingFunction', {
                'usernames': userNames,
                'function': "remove"
            });
        }, 1000);
    }
});


socket.on('typingFunction', function(typing) {
    if (typing.length == 0) {
        $('#typingPrompt').text("");
    } else if (typing.length != 0) {
        typing.forEach(function(entry) {
            typingName = typingName.concat(" " + entry);
        });
        $('#typingPrompt').text(typingName + " is typing .... ");
        typingName = "";
    }
});


socket.on('message', function(msg) {
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    if (msg.usernames == userNames) {
        $('#displayChat').append("<li class='ownli'> <p style='text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-size: 1.2em; color:#" + randomColor + ";'>" + msg.usernames + ":</p>" + msg.response + "<br></li>");
        $('#title').css('color', random_color);
    } else
        $('#displayChat').append("<li  class='displazyli'> <p style='text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-size: 1.2em; color:#" + randomColor + ";'>" + msg.usernames + "</p>" + msg.response + "<br></li>");
});




//powershell code .