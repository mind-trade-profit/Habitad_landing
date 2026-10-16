/* ==========================================================================
   LANDING HABITAD — se planta en (ninguna: la landing es nativa) desde el panel de la tienda.

   Generado por tools/construir_home_tienda.py. NO se edita a mano: se edita
   prototipo/embudo.html y se vuelve a generar.

   Se instala pegando el cargador en

     Configuracion > Codigos externos > Codigos de tracking > Para la tienda

   El codigo de ese campo sale en TODAS las paginas del storefront; el guardia
   de ruta de aca abajo es el que decide en cual se planta la landing. Para
   apagarla se borran esos renglones: el theme vuelve a lo de siempre.
   ========================================================================== */
(function () {
  'use strict';

  /* Una sola vez, y solo en la pagina que corresponde. El cargador puede
     entrar dos veces -- una recarga parcial, una etiqueta duplicada -- y la
     landing no esta hecha para convivir consigo misma. */
  /* ══ MODO SEGURO ══
   Si la landing se rompe, la tienda de siempre tiene que quedar funcionando.
   Apagar la landing es: devolver la portada del theme (si ya se habia
   plantado), sacar las reglas que tapaban la portada y las que escondian las
   categorias, recordar la decision un rato y avisar a GA4 que paso. */
(function () {
  if (window.__habitadSeguro) return;
  var CLAVE = 'habitad:modo-seguro';
  var VIDA = 15 * 60 * 1000;          // cuanto recuerda la decision
  var BUILD = 'v17.20261016-1354-minimo';

  function recordar(motivo) {
    try { localStorage.setItem(CLAVE, JSON.stringify({t: new Date().getTime(), m: motivo})); } catch (e) {}
  }
  /* El motivo con el que se apago, o '' si no hay nada vigente. */
  function vigente() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (d && d.t && new Date().getTime() - d.t < VIDA) return String(d.m || 'recordado');
      if (d) olvidar();                 // vencida: se limpia
    } catch (e) {}
    return '';
  }
  function olvidar() { try { localStorage.removeItem(CLAVE); } catch (e) {} }

  /* A GA4 por las dos colas, igual que `track` en la landing. La de GA4 de la
     tienda (dataLayerTN) puede no estar todavia: se reintenta unos segundos. */
  function avisar(evento, datos, intento) {
    try {
      window.dataLayer = window.dataLayer || [];
      if (!intento) {
        var d = {event: evento};
        for (var k in datos) if (Object.prototype.hasOwnProperty.call(datos, k)) d[k] = datos[k];
        window.dataLayer.push(d);
      }
      var cola = window.dataLayerTN;
      if (cola && typeof cola.push === 'function') {
        cola.push(function () { return arguments; }('event', evento, datos));
      } else if ((intento || 0) < 6) {
        setTimeout(function () { avisar(evento, datos, (intento || 0) + 1); }, 1500);
      }
    } catch (e) {}
  }

  /* Saca lo nuestro que tapaba o escondia cosas del theme: las dos hojas del
     cargador y, dentro de la hoja que el panel imprime en el head (sin id), la regla que
     escondia las categorias y las que tapaban la portada. Se borran de la hoja
     y no se pisan con otras: asi las categorias vuelven a como las deja el
     theme, sin adivinar su display. */
  function limpiarEstilos() {
    var ids = ['habitad-sin-categorias', 'habitad-portada', 'habitad-tapa'];
    for (var i = 0; i < ids.length; i++) {
      var n = document.getElementById(ids[i]);
      if (n && n.parentNode) n.parentNode.removeChild(n);
    }
    var hojas = document.styleSheets;
    for (var h = 0; h < hojas.length; h++) {
      if (hojas[h].ownerNode && hojas[h].ownerNode.id === 'habitad-css') continue;
      var reglas = null;
      try { reglas = hojas[h].cssRules; } catch (e) { reglas = null; }
      if (!reglas) continue;
      for (var r = reglas.length - 1; r >= 0; r--) {
        var t = reglas[r].cssText || '';
        var categorias = /js-desktop-main-categories-col/.test(t) &&
                         /js-main-categories-container/.test(t) && /display:\s*none/.test(t);
        var tapa = /landing-habitad/.test(t) && /template-home/.test(t);
        if (categorias || tapa) { try { hojas[h].deleteRule(r); } catch (e) {} }
      }
    }
  }

  function seguro(motivo, detalle, recordado) {
    if (window.__habitadSeguroActivo) return;
    window.__habitadSeguroActivo = true;
    // 1 · si la landing ya estaba plantada, que devuelva la portada del theme
    try { if (typeof window.__habitadRestaurar === 'function') window.__habitadRestaurar(); } catch (e) {}
    // 2 · la marca en <html>, y las reglas propias fuera
    try { document.documentElement.className += ' habitad-seguro'; } catch (e) {}
    try { limpiarEstilos(); } catch (e) {}
    /* Respaldo: si por lo que sea no se pudo borrar la tapa de la hoja, esto la
       desarma igual. No depende del display de nadie. */
    try {
      var st = document.createElement('style');
      st.id = 'habitad-seguro-css';
      st.textContent =
        'html.habitad-seguro body.template-home .js-home-sections-container{max-height:none!important;overflow:visible!important;animation:none!important}' +
        'html.habitad-seguro body.template-home .js-home-sections-container::before,' +
        'html.habitad-seguro body.template-home .js-home-sections-container::after{display:none!important;content:none!important;animation:none!important}';
      (document.head || document.documentElement).appendChild(st);
    } catch (e) {}
    // 3 · recordarlo y contarlo (no si esto ya es la memoria de una vez anterior)
    if (!recordado) {
      recordar(motivo);
      avisar('landing_modo_seguro', {motivo: motivo, detalle: String(detalle || '').slice(0, 90), build: BUILD});
    }
    try {
      if (window.console && console.warn) console.warn('[landing] modo seguro: ' + motivo + (detalle ? ' - ' + detalle : ''));
    } catch (e) {}
  }

  window.__habitadSeguro = seguro;
  window.__habitadSeguroVigente = vigente;
  window.__habitadSeguroRecordar = recordar;
  window.__habitadSeguroOlvidar = olvidar;
  window.__habitadAvisar = avisar;
})();

  if (window.__landingHabitad) return;
  // El cargador ya decidio que hoy no hay landing (modo seguro): no se planta.
  if (window.__habitadSeguroActivo) return;
  /* En que paginas se planta y sobre que ancla del theme. La ruta va sin la
     barra final y en minusculas: la portada es "". */
  var DESTINOS = {};
  var aqui = location.pathname.replace(/\/+$/, '').toLowerCase();

  /* Aca vivian tres cosas que tocaban paginas donde la landing NO se planta:
     el CSS que escondia el menu "Categorias" del encabezado, el enganche del
     buscador del theme con el desvio de /search/, y el desvio a la landing de
     quien llegaba a una ficha desde un anuncio de Meta. El 16/09/2026 el
     cliente pidio dejar la tienda como estaba -- habilito las 35 categorias -- y
     se sacaron las tres. Estan en el historial: commits 56f3ae1 y 66230d2.
     Desde entonces esto no hace absolutamente nada fuera de DESTINOS. */
  /* Quien llega desde la landing a dejar una resena viene con #opiniones.
     Eso no es un ancla del theme: el widget de resenas de Nubea NO esta en la
     pagina al cargar, porque la tienda lo inyecta con "onfirstinteraction" --
     recien cuando el visitante toca algo. Asi que hay que despertarlo y
     despues bajar hasta el. Va antes del guardia de DESTINOS a proposito:
     esto pasa en las fichas de producto, no en la landing. */
  if (location.hash === '#opiniones' &&
      !Object.prototype.hasOwnProperty.call(DESTINOS, aqui)) alasOpiniones();

  function alasOpiniones() {
    var desde = Date.now();
    var reloj = setInterval(function () {
      despertar();
      var caja = cajaDeOpiniones();
      if (caja) {
        clearInterval(reloj);
        bajarHasta(caja);
        return;
      }
      if (Date.now() - desde > 20000) clearInterval(reloj);
    }, 300);
  }

  /* El widget de resenas, y NO cualquier cosa de la app. Nubea usa el prefijo
     "nubea-" tambien para los bloques de descripcion, asi que buscarlo por ahi
     deja al cliente a mitad de la ficha. Estos ids son los que pone hoy. */
  function cajaDeOpiniones() {
    var i, propios = document.querySelectorAll(
      '#product-reviews-widget,#product-reviews-container,#reviewsapp');
    for (i = 0; i < propios.length; i++) {
      if (propios[i].offsetHeight > 200) return propios[i];
    }
    /* Respaldo por si le cambian el id: el bloque que diga lo que dice el
       formulario. Se mira solo en los candidatos grandes, no en toda la pagina. */
    var otros = document.querySelectorAll('[id*="nubea"],[class*="nubea"],[data-nubea],' +
                                          '[id*="review"],[class*="review"]');
    for (i = 0; i < otros.length; i++) {
      if (otros[i].offsetHeight > 200 &&
          /Dej[a\u00e1] tu opini[o\u00f3]n|Opiniones de clientes/i.test(otros[i].innerText || '')) {
        return otros[i];
      }
    }
    return null;
  }

  /* De golpe y no con scroll suave: el formulario esta a unos 3.700px del
     tope, y animar eso son varios segundos de pantalla borrosa para alguien
     que ya dijo a donde queria ir. Con 70px de aire arriba, porque el
     encabezado de la tienda es fijo y si no tapa el titulo. */
  function bajarHasta(caja) {
    var puesto = saltar(caja);
    /* El widget sigue creciendo mientras carga estrellas y fotos, asi que se
       reacomoda una vez. Si el cliente ya se movio solo, se lo deja en paz. */
    setTimeout(function () {
      if (puesto >= 0 && Math.abs((window.pageYOffset || 0) - puesto) < 4) saltar(caja);
    }, 900);
  }

  function saltar(caja) {
    try {
      var y = caja.getBoundingClientRect().top + (window.pageYOffset || 0) - 70;
      window.scrollTo(0, y < 0 ? 0 : y);
      return Math.round(window.pageYOffset || 0);
    } catch (e) {
      caja.scrollIntoView();
      return -1;
    }
  }

  /* Los eventos con los que la tienda decide que hubo "primera interaccion".
     Se mandan una sola vez: repetirlos no acelera nada y ensucia la pagina. */
  var despierto = false;
  function despertar() {
    if (despierto) return;
    despierto = true;
    var lista = ['mousemove', 'mousedown', 'touchstart', 'wheel', 'keydown', 'scroll'];
    for (var i = 0; i < lista.length; i++) {
      try {
        window.dispatchEvent(new Event(lista[i], {bubbles: true}));
        document.dispatchEvent(new Event(lista[i], {bubbles: true}));
      } catch (e) { /* navegador viejo: se lo pierde y sigue */ }
    }
  }

  /* Aca plantaba la landing. Ya no: es la portada nativa del tema, que marca
     __habitadListo cuando su programa arranca. */
})();
