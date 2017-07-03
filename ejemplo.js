ses = new RofexSession('User','Password','Account', 'demo');

ses.login().then(
function() {
        console.log("Login OK");
        ses.getMarketData("MERV - XMEV - YPFD - 72hs","OF",10).then(function(body) {
          console.log(body);
        },
        function(err){
          console.log(err);
        });
    },
function(err) {
	console.log("Cant Loging", err);
}
});