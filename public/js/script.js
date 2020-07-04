let socket = io();
let typingTimer;
let userNames;
let typingnameSet = new Set();
var typingName = "";



// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);


function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}


//room banabo, user table maintain
const usernameCatcher = () => {
    $('#nameAccept').modal({ dismissible: false }).modal('open');
    document.getElementById('full_name').focus();
    $("#nameForm").submit((e) => {
        e.preventDefault();
        toggleFullScreen();
        let loaderPrompt = $('#full_name').val();
        if (loaderPrompt.trim() == "") {
            $('#nameAccept').modal({ dismissible: false }).modal('open');
        } else {
            userNames = loaderPrompt;
            socket.emit('is_online', userNames);
        }
        $('#nameAccept').modal('close');
        document.getElementById('userResponse').focus();
        return false;
    });
};



$(document).ready(function() {
    $('.modal').modal();
    usernameCatcher();

    $("#headerName").on("click", () => {
        $('#online').modal('open');
    });

    document.getElementById("formChat").focus();

    $("#formChat").submit((e) => {
        e.preventDefault();
        let userResponse = $("#userResponse").val();
        socket.emit('message', {
            'usernames': userNames,
            'response': $('#userResponse').val()
        });
        //toggleFullScreen();
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

socket.on('is_online', (onlinePrompt) => {
    $('#is_online').text("");
    onlinePrompt.forEach(function(entry) {
        $('#is_online').append("<li>" + entry.name + "</li><br>");
    });
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
    console.log(socket.id);
    if (msg.response.trim() != "") {
        if (msg.usernames == userNames) {
            $('#displayChat').append("<li class='ownli'> <p style=' color:#" + msg.color + ";'>" + msg.usernames + ":</p>" + msg.response + "</li><br>");
        } else
            $('#displayChat').append("<li  class='displayli'> <p style='color:#" + msg.color + ";'>" + msg.usernames + ":</p>" + msg.response + "</li><br>");

        $('#displayChat').scrollTop($('#displayChat')[0].scrollHeight);
    }
});




//powershell code .