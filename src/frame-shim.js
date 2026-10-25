// 注入编辑器 srcdoc 的第一段脚本：把对虚拟来源的 fetch / EventSource 交给插件页的桥，
// 并按作品给 storage 加命名空间（srcdoc 的 location.pathname 都是 "srcdoc"，运行时按它存未保存的改动）。
(function(){
  if(window.__mdnShim)return;
  window.__mdnShim=true;
  var config=window.__MDN_FRAME__||{};
  var bridge=null;
  for(var w=window;;w=w.parent){
    try{if(w.__mdnBridge){bridge=w.__mdnBridge;break;}}catch(e){}
    if(w===w.parent)break;
  }
  if(!bridge)return;

  function scoped(store){
    var prefix='mdn:'+config.key+':';
    function keys(){var out=[];for(var i=0;i<store.length;i++){var k=store.key(i);if(k&&k.indexOf(prefix)===0)out.push(k.slice(prefix.length));}return out;}
    return {
      getItem:function(k){return store.getItem(prefix+k);},
      setItem:function(k,v){store.setItem(prefix+k,v);},
      removeItem:function(k){store.removeItem(prefix+k);},
      clear:function(){keys().forEach(function(k){store.removeItem(prefix+k);});},
      key:function(i){var k=keys()[i];return k===undefined?null:k;},
      get length(){return keys().length;}
    };
  }
  ['localStorage','sessionStorage'].forEach(function(name){
    try{var store=window[name];var view=scoped(store);Object.defineProperty(window,name,{configurable:true,get:function(){return view;}});}catch(e){}
  });

  var realFetch=window.fetch;
  window.fetch=function(input,init){
    var url=typeof input==='string'?input:input&&input.href!==undefined&&!input.url?input.href:input&&input.url;
    var path=url?bridge.toPath(url,document.baseURI):null;
    if(!path)return realFetch.apply(this,arguments);
    return (async function(){
      var req=typeof input==='object'&&input.url?input:null;
      var method=String((init&&init.method)||(req&&req.method)||'GET').toUpperCase();
      var headers={};new Headers((init&&init.headers)||(req&&req.headers)||{}).forEach(function(v,k){headers[k]=v;});
      var body=init&&init.body!==undefined?init.body:req&&method!=='GET'&&method!=='HEAD'?await req.arrayBuffer():undefined;
      var result=await bridge.request({method:method,path:path,headers:headers,body:body});
      var empty=method==='HEAD'||result.status===204||result.status===304;
      var response=new Response(empty?null:result.bytes,{status:result.status,headers:result.headers});
      Object.defineProperty(response,'url',{value:new URL(url,document.baseURI).href});
      return response;
    })();
  };

  var RealEventSource=window.EventSource;
  function VirtualEventSource(url){
    var path=bridge.toPath(String(url),document.baseURI);
    if(!path)return new RealEventSource(url);
    var target=document.createDocumentFragment();
    var source=this,closed=false;
    source.url=new URL(String(url),document.baseURI).href;
    source.readyState=1;
    source.onmessage=source.onerror=source.onopen=null;
    source.addEventListener=target.addEventListener.bind(target);
    source.removeEventListener=target.removeEventListener.bind(target);
    source.dispatchEvent=target.dispatchEvent.bind(target);
    source.close=function(){closed=true;source.readyState=2;};
    (async function(){
      // after=-1：只订阅、取当前游标，不重放此前的改动
      var after=-1;
      while(!closed){
        try{
          var result=await bridge.events(path,after);
          if(closed)break;
          result.events.forEach(function(item){
            var event=new MessageEvent(item.type,{data:item.data});
            source.dispatchEvent(event);
            if(item.type==='message'&&source.onmessage)source.onmessage(event);
          });
          after=result.cursor;
        }catch(e){
          if(source.onerror)source.onerror(new Event('error'));
          await new Promise(function(resolve){setTimeout(resolve,3000);});
        }
      }
    })();
  }
  VirtualEventSource.CONNECTING=0;VirtualEventSource.OPEN=1;VirtualEventSource.CLOSED=2;
  window.EventSource=VirtualEventSource;

  // 运行中给 iframe 设虚拟来源地址时同步改为 srcdoc，避免先导航失败、多一次 load
  var frameSrc=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'src');
  Object.defineProperty(HTMLIFrameElement.prototype,'src',{configurable:true,enumerable:frameSrc.enumerable,get:frameSrc.get,set:function(value){
    if(!bridge.adoptFrame(this,String(value),document.baseURI,window))frameSrc.set.call(this,value);
  }});
  var setAttribute=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(name,value){
    if(this instanceof HTMLIFrameElement&&String(name).toLowerCase()==='src'&&bridge.adoptFrame(this,String(value),document.baseURI,window))return;
    return setAttribute.apply(this,arguments);
  };

  bridge.watch(window);
})();
