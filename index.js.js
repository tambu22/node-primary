var request = require('request');

var endpointDemo = 'http://demo-api.primary.com.ar:8081/pbcp/';
var endPointProd = 'https://api.primary.com.ar/';

 function RofexSession(userName, password, account, endpoint){
    this.userName = userName;
    this.password = password;
    this.account = account;
    this.endpoint = '';
    if(endpoint === 'prod')
      this.endpoint = endPointProd;
    else
      this.endpoint = endpointDemo;
    this.cookieJar; 
    }
    RofexSession.prototype.getToken = methodGetToken;
    RofexSession.prototype.login = methodLogin;
    RofexSession.prototype.doApiCall = methodDoApiCall;
    RofexSession.prototype.getMarketData = methodGetMarketData;
    RofexSession.prototype.getMarketDataHistoric = methodGetMarketDataHistoric;
    RofexSession.prototype.getActiveOrders = methodGetActiveOrders;    
    RofexSession.prototype.massCancel = methodMassCancel;
    RofexSession.prototype.cancelByID = methodCancelByID;
    RofexSession.prototype.getAllSegments = methodGetAllSegments;
    RofexSession.prototype.getAllInstruments = methodGetAllInstruments;
    RofexSession.prototype.getAllInstrumentsDetail = methodGetAllInstrumentsDetail;
    RofexSession.prototype.getInstrumentDetail = methodGetInstrumentDetail;
    RofexSession.prototype.getInstrumentsByCFICode = methodGetInstrumentsByCFICode;
    RofexSession.prototype.getInstrumentsByMarketSegmentID = methodGetInstrumentsByMarketSegmentID;
    RofexSession.prototype.getAllOrders = methodGetAllOrders;
    RofexSession.prototype.getOrdersFillers = methodGetOrdersFillers;
    RofexSession.prototype.getOrderById = methodGetOrderById;
    RofexSession.prototype.getOrderDetailedById = methodGetOrderDetailedById;
    RofexSession.prototype.newOrder = methodNewOrder;
   
    function methodNewOrder(marketId,symbol,price,orderQty,ordType,side,timeInForce,cancelPrevious){
      if(marketId===undefined) marketId = 'ROFX';
      if(ordType===undefined) ordType = 'LIMIT';
      if(timeInForce===undefined) timeInForce = 'DAY';
      if(cancelPrevious===undefined) cancelPrevious = 'false';
      return this.doApiCall("rest/order/newSingleOrder",{marketId:marketId,symbol:symbol,price:price,orderQty:orderQty,ordType:ordType,side:side,timeInForce:timeInForce,account:this.account,cancelPrevious:cancelPrevious});
    }
    function methodGetOrderDetailedById(clientId,proprietary){
      return this.doApiCall("rest/order/allById", {clOrdId: clientId, proprietary: proprietary});
    }
    function methodGetOrderById(clientId,proprietary){
      return this.doApiCall("rest/order/id", {clOrdId: clientId, proprietary: proprietary});
    }
    function methodGetOrdersFillers(){
       return this.doApiCall("rest/order/filleds",{accountId: this.account});
    }
    function methodGetAllOrders(){
       return this.doApiCall("rest/order/all",{accountId: this.account});
    }
    function methodGetInstrumentsByMarketSegmentID(MarketSegmentID,MarketId){
      if(MarketId===undefined) MarketId = 'ROFX';
      return this.doApiCall("rest/instruments/bySegment",{MarketSegmentID: MarketSegmentID, MarketID: MarketId});
    }
    function methodGetInstrumentsByCFICode(CFICode){
      return this.doApiCall("rest/instruments/byCFICode",{CFICode: CFICode});
    }
    function methodGetInstrumentDetail(symbol, marketId){
       if(marketId===undefined) marketId = 'ROFX';
      return this.doApiCall("rest/instruments/detail",{symbol:symbol, marketId: marketId});
    }  
    function methodGetAllInstrumentsDetail(){
      return this.doApiCall("rest/instruments/details");
    }     
    function methodGetAllInstruments(){
      return this.doApiCall("rest/instruments/all");
    }     
    function methodGetAllSegments(){
      return this.doApiCall("rest/segment/all");
    }      
    function methodCancelByID(clientId,proprietary){
      return this.doApiCall("rest/order/cancelById", {clOrdId: clientId, proprietary: proprietary});
    }
    function methodMassCancel(){
      this.getActiveOrders().then(function(body) {
            body.orders.forEach(function (order){
              this.cancelByID(order.clOrdId,order.proprietary).then(function(body) {
                if(body.status === "OK"){
                  console.log("Offer from" + body.order.clientId + " Canceled");
                }
              },                                                                     
              function(err) {
                console.log(err);
              });
            });    
        
          },
          function(err) {
            console.log(err);
          }
      );
    }
    function methodGetActiveOrders(){
      return this.doApiCall("rest/order/actives", {accountId: this.account});
    }
    function methodLogin (){
      this.cookieJar = request.jar();
      var me=this;
      var promise = new Promise(function(resolve, reject) {
       request.post({url:me.endpoint+'j_spring_security_check',jar:  me.cookieJar, form: {j_username:me.userName,j_password:  me.password}}, function(err,response,body) {
          if (err) {
            reject(err);
            return;
          }
         console.log("login OK")
          resolve();
          return;
        });
      });
      return promise;
    }
    function methodDoApiCall(path,params){
      var url = this.endpoint + path;
      var args = '';
      if(params === undefined) params = {};
      else{
        var args = Object.keys(params).map(function(key) {
          return key + '=' + params[key];
        }).join('&');
        args = '?'+args;
      }
      var me = this; 
      
      var promise = new Promise(function(resolve, reject) {
          console.log((me.cookieJar));
          request.get({url:url+args, jar: me.cookieJar }, function(err,response,body) {
          if (err) {
            reject(err);
            return;
          }
          resolve(body);
          return;
        });
      });
      return promise;
    }
    function methodGetMarketData(symbol, entries, depth, market_id){
      if (depth === undefined) depth=1;
      if (market_id === undefined) market_id="ROFX";
      return this.doApiCall('rest/marketdata/get',{marketId: market_id ,symbol: symbol, entries: entries,depth:depth});
    }
    function methodGetMarketDataHistoric(symbol, date, market_id){
      if (market_id === undefined) market_id="ROFX";
      return this.doApiCall('rest/data/getTrades',{marketId: market_id ,symbol: symbol, date: date});
    }
    function methodGetToken(){
      var me = this;
        var promise = new Promise(function(resolve, reject) {
          request.get({url:'https://api.primary.com.ar/marketdata.html',jar: me.cookieJar}, function(err,response,body) {
          if (err) {
            reject(err);
            return;
          }
          resolve(body,response);
          return;
        });
      });
      return promise;
    }
    
module.exports = RofexSession;
