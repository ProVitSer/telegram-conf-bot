var confArrayNumber;
var notes = [];
var TelegramBot = require('node-telegram-bot-api');
var token = "ВАШ ТОКЕН";
var bot = new TelegramBot(token, {polling: true});

var namiLib = require("nami");
if (process.argv.length !== 6) {
	console.log("Use: <host> <port> <user> <secret>");
	process.exit();
}


bot.onText(/ping/, function (msg, match) {
bot.sendMessage(msg.chat.id, 'pong');
});

bot.onText(/\/conf (.+)$/, function (msg, match) {
confArrayNumber = match[1].split(';');
for(var i = 0; i < confArrayNumber.length; i++ ) {
bot.sendMessage( msg.from.id ,'Вызываем и добавляем в конференцию номер '+confArrayNumber[i]);
callConfNumber(confArrayNumber[i]);
  }
console.log(msg);

});

  bot.onText(/\/conftime (.+) number (.+)$/, function (msg, match) {
	var chatId = msg.from.id;
	var conftime = match[1];
	var confnumber = match[2];
	
	notes.push( { 'uid':chatId, 'time':conftime, 'number':confnumber } );
    bot.sendMessage(chatId, 'Отлично! Я обязательно создам конференцию, если буду работать :)');
	

});


function callConfNumber(confArrayNumber){
var action = new namiLib.Actions.Originate();
action.channel = "SIP/operator/"+confArrayNumber;
action.callerid = "3157776677";
action.priority = "1";
action.timeout = "50000";
action.context = "myasterbot";
action.exten = 9000;
action.ActionID = "1";
action.async = "yes";
nami.send(action);
} 

setInterval(function(){
   for (var i = 0; i < notes.length; i++){
         var curDate = new Date().getHours() + ':' + new Date().getMinutes();
              if ( notes[i]['time'] == curDate ) {
                  bot.sendMessage(notes[i]['uid'], 'Напоминаю, сейчас будет создана конференция с номерами : '+ notes[i]['number']);
							
				confArrayNumber = notes[0]['number'].split(';');
				for(var b = 0; b < confArrayNumber.length; b++ ) {
				callConfNumber(confArrayNumber[b]);
				bot.sendMessage( notes[i]['uid'],'Вызываем и добавляем в конференцию номер '+confArrayNumber[b]);
				}  
		 notes.splice(i,1);
		}
     }
},1000);

var namiConfig = {
    host: process.argv[2],
    port: process.argv[3],
    username: process.argv[4],
    secret: process.argv[5]
};

var nami = new namiLib.Nami(namiConfig);
process.on('SIGINT', function () {
    nami.close();
    process.exit();
});
nami.on('namiConnectionClose', function (data) {
    console.log('Reconnecting...');
    setTimeout(function () { nami.open(); }, 5000);
});

nami.on('namiInvalidPeer', function (data) {
	console.log("Invalid AMI Salute. Not an AMI?");
	process.exit();
});
nami.on('namiLoginIncorrect', function () {
	console.log("Invalid Credentials");
	process.exit();
});
nami.on('namiEvent', function (event) {
    console.log('Got Event: ' + util.inspect(event));
	
	
});
function standardSend(action) {
    nami.send(action, function (response) {
        console.log(' ---- Response: ' + util.inspect(response));
    });
}

nami.on('namiConnected', function (event) {
    standardSend(new namiLib.Actions.Status());
    standardSend(new namiLib.Actions.CoreStatus());
    standardSend(new namiLib.Actions.CoreSettings());
    standardSend(new namiLib.Actions.Ping());
    standardSend(new namiLib.Actions.CoreShowChannels());
    standardSend(new namiLib.Actions.DahdiShowChannels());
    standardSend(new namiLib.Actions.ListCommands());

    var action = new namiLib.Actions.Hangup();
    action.channel = "SIP/asdasd";
    standardSend(action);

    action = new namiLib.Actions.AbsoluteTimeout();
    action.channel = "SIP/asdasd";
    action.timeout = "3";
    standardSend(action);

    action = new namiLib.Actions.Command();
    action.command = "core show channels";
    standardSend(action);

    action = new namiLib.Actions.ExtensionState();
    action.exten = 1;
    action.context = "default";
    standardSend(action);

    action = new namiLib.Actions.GetConfig();
    action.filename = "sip.conf";
    standardSend(action);

    action = new namiLib.Actions.GetConfigJson();
    action.filename = "sip.conf";
    standardSend(action);
	

});
nami.open();
