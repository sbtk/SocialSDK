require(["sbt/Endpoint", "sbt/dom", "sbt/config"], function(Endpoint, dom, config) {
    var ep = Endpoint.find("connections");
    config.Properties["loginUi"] = "dialog";
    ep.authenticate({
        forceAuthentication: false,
        load: function(response){
            dom.setText("content", "Successfully logged in");    
        },
        error: function(response){
            dom.setText("content", "Cancelled log in");
        }      
    });
});