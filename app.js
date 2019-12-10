/* Google login [ Google Console URL Below to register your client and get client_id and client_secret]

 https://console.developers.google.com/apis/dashboard?project=test-login-oidc&supportedpurview=project

*/

function onLoadFunction() {
  gapi.client.setApiKey('AIzaSyDJb-MNvnN8H5hmcBVmXe4npWOUpSVzz8A');
  gapi.client.load('plus', 'v1', function() {});
}


/* ----------------------------------------------------------------------------------------------- */

/* Facebook login [ Facebook Developer URL Below to register your client and get client_id and client_secret]

 https://developers.facebook.com/docs/javascript/quickstart

 */

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '771179440000386',
      cookie     : true,
      xfbml      : true,
      version    : 'v4.0'
    });
      
    FB.AppEvents.logPageView();  
    
    FB.getLoginStatus( function(response) {
      if(response.status === 'connected'){

      }else{
        // not authorized
      }
    }) 
      
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

