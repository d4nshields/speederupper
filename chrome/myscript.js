var preferences = {
    'isActive': true,
    'html5pref': false
};
var MIN = 0.5,
    MAX = 4.0;

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('jquery-ui.css');
(document.head||document.documentElement).appendChild(style);
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('spdr-styles.css');
(document.head||document.documentElement).appendChild(style);


if ("undefined" !== typeof chrome) {
    chrome.runtime.onMessage.addListener(

    function(message, sender, sendResponse) {
        switch (message.call) {
        case 'set':
            for (var k in message.prefs)
            if (message.prefs.hasOwnProperty(k)) {
                preferences[k] = message.prefs[k];
            }
            break;
        case 'get':
            sendResponse(preferences);
            break;
        }
        // now that preferences are set, let's set the visibility of #spdr based on what we have
        if (!preferences.isActive) {
            $('#spdr').css('display', 'none');
        }
        else {
            $('#spdr').css('display', 'block');
        }
    });
}

var spdrPosID;

function setupSPDR() {
    if ($("#spdr").length < 1) {
        $("<div id='spdr' style='width:49px;height:510px;position:absolute;top:15px;\
          background-color: rgba( 200, 200, 200, 0.5);\
          border:1px solid #d22e2e;border-radius:4px;padding:4px 4px 4px 4px;'>\
            <img id='spdr-image' style='position:absolute;top:-22px;left:0px;width:100%'>\
            <div id='spdr-col1' style='color:black;float:left;height:100%'>\
            </div>\
            <div id='spdr-slider' style='float:right;height:502px;vertical-align:middle;'></div>\
            <div class='spdr-buttons' style='position:absolute;top:510px;left:1px;height:20px;width:55px;'>\
             <button id='spdr-reset' style='position:absolute;left:4px;background-color: #999999;border:1px solid #d22e2e;border-radius:4px;'>RESET</button>\
            </div>\
          </div>").insertBefore("#player-api");
        // load the image(s)
        var imgURL = chrome.extension.getURL("stopwatch-top.png");
        $("#spdr #spdr-image").prop('src', imgURL);
        // add labels
        var labels = [
        0.5, 1, 2, 3, 4];
        var $amounts = "";
        for (var i = 0; i < labels.length; i++) {
            var val = labels[i];
            $amounts += '<span id="spdr-label' + i + '" class="spdr-amount" style="color:black;position:absolute;bottom:' + (1.5 + (96 * (val - MIN) / (MAX - MIN))) + '%">' + val.toFixed(1) + 'x--</span>';
        }
        $('#spdr #spdr-col1').append($amounts);
    }
}

function updateVideoElement(rate) {
    if ("undefined" !== typeof document.getElementsByTagName("video")[0]) {
        document.getElementsByTagName("video")[0].playbackRate = rate;
    }
    $('#spdr #spdr-amount').css({
        'position': 'absolute',
        'bottom': $('#spdr .ui-slider-handle').css('bottom')
    });

}

function spdrPositioner() {
    var playerApiPosition = document.getElementById("player-api").getBoundingClientRect().left;
    if (playerApiPosition < 0) {
        return;
    }
    $("#spdr").css("left", (document.getElementById("player-api").getBoundingClientRect().left - 60) + 'px');
    if( preferences['isActive']) {
      $("#spdr #spdr-slider").slider("value", document.getElementsByTagName('video')[0].playbackRate);
    } else {
      $("#spdr #spdr-slider").slider("value", 1.0);
    }
}

function spdrPositionerScheduler() {
    if ("undefined" !== typeof spdrPosID) {
        window.clearTimeout(spdrPosID);
    }
    spdrPosID = window.setInterval(spdrPositioner, 500);
}

function setCookie(cname,cvalue,exdays)
{
  var d = new Date();
  d.setTime(d.getTime()+(exdays*24*60*60*1000));
  var expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
      {
          var c = ca[i].trim();
            if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
  return "";
}

$(function() {

    getCookie( 'PREF')

    if ($('video').length < 1) {
        preferences['isActive'] = false;
    }
    setupSPDR();
    $(window).resize(spdrPositionerScheduler);
    spdrPositionerScheduler();
    $("#spdr #spdr-reset").click(function(e) {
        $("#spdr #spdr-slider").slider("value", 1.0);
        updateVideoElement(1.0);
        e.preventDefault();
    });
    $("#spdr #spdr-slider").slider({
        value: 1.0,
        min: MIN,
        max: MAX,
        step: 0.01,
        orientation: "vertical",
        slide: function(event, ui) {
            updateVideoElement(ui.value);
            $('video').first().bind('play', function(e) {
                updateVideoElement($("#spdr #spdr-slider").slider("value"));
            });
        }
    });
    if( !preferences['isActive']) {
      $('#spdr').append( '<div id="spdr-overlay" style="position:absolute; top:0; left:-1px; width:59px;height:529px; background-color: rgba( 255,255,255,0.75)">');
      $('#spdr #spdr-slider').slider( "disable");
    } else {
      var pbRate = document.getElementsByTagName('video')[0].playbackRate;
      updateVideoElement(pbRate);
      $("#spdr #spdr-slider").slider("value", pbRate);
    }
});

