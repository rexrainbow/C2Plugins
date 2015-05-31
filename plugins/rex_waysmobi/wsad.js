/*!
 * wsad WebSDK v1.0.0a
 *
 * Copyright (c) 2015 wayStorm Co.Ltd. 
 *
 * Example:
 *     
 *      <div id="wsad"></div>
 *      <script src="http://cdn.waysmobi.com/web/wsad.js" async></script>
 *      <script>
 *         window.wsappid = "appid";
 *         (wsadq = window.wsadq || []).push('wsad');
 *      </script>
 */


var wsad = function(){
    function get_width(ele_id){
        var ele = document.getElementById(ele_id),
            window_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        if(ele == null){
            console.log('[WSAD info] No ad size limit, get window width');
            return window_width;
        }
        width = (ele.dataset.max_width || ele.offsetWidth || window_width);
        console.log('[WSAD info] Find ad size limit, get div max-width:' + width);
        return width; 
    }

    return {
        request_ad: function(appid, ele_id, ad_type, width){
           if(appid == undefined || appid == null){
             console.log('[WSAD error info] appid error, please declare appid with javascript: window.wsappid = "WSAD appid". If you dont have one, please contact us support@waystorm.com');
             console.error('[WSAD error info] appid error, please declare appid with javascript: window.wsappid = "WSAD appid". If you dont have one, please contact us support@waystorm.com');
           }
           else{
             ele_id = typeof ele_id !== 'undefined' ? ele_id : 'wsad';
             width = typeof width !== 'undefined' ? width : get_width(ele_id);
             interstitial = (ad_type == 'interstitial') ? 1 : 0;

             if(width >=960){
                 width = 960;
             }
             else if(width < 320){
                 width = 320;
             }
            
             if (parseInt(interstitial) == 1)
                 var height = width * 0.83333;
             else
                 var height = width * 0.15625;

             if (parseInt(interstitial) == 1)
                 url = '<iframe id="wsad_iframe" src="http://phone.waystorm.com/kernel/web/receiver?udid=web&interstitial=1&websdk=1&appid=' + appid +  '" style="width:' + width + 'px;height:' + height + 'px;border:0px;overflow:hidden;" scrolling="no"></iframe>';
             else
                 url = '<iframe id="wsad_iframe" src="http://phone.waystorm.com/kernel/web/receiver?udid=web&websdk=1&appid=' + appid +  '" style="width:' + width + 'px;height:' + height + 'px;border:0px;overflow:hidden;" scrolling="no"></iframe>';

             ad_div = document.getElementById(ele_id);
             if(ad_div == null){
                 console.log("[WSAD error info] No <div> called: " + ele_id + "! Please provide correct <div> id to show ad.");
                 console.error("[WSAD error info] No <div> called: " + ele_id + "! Please provide correct <div> id to show ad.");
             }
             else{
                ad_div.innerHTML = url;
             }
           }
        }
    }

}();
