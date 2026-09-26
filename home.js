/* ==========================================================================
   LANDING HABITAD — se planta en /catalogos desde el panel de la tienda.

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
  if (window.__landingHabitad) return;
  /* En que paginas se planta y sobre que ancla del theme. La ruta va sin la
     barra final y en minusculas: la portada es "". */
  var DESTINOS = {"/catalogos": {"ancla": ".user-content", "esconder": "section[data-store=\"page-title\"]"}};
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

  if (!Object.prototype.hasOwnProperty.call(DESTINOS, aqui)) return;
  window.__landingHabitad = true;

  var ANCLA = DESTINOS[aqui].ancla;
  var ENVOLTORIO = 'landing-habitad';

  /* 1 · Tapar el contenido viejo ANTES de que se vea. Si esperamos a tener
     todo listo, el visitante ve medio segundo de la pagina anterior y despues
     un salto. Se tapa con una regla que se saca cuando la landing ya esta. */
  var tapa = document.createElement('style');
  tapa.id = 'habitad-tapa';
  tapa.textContent = ANCLA + '{visibility:hidden !important}';
  (document.head || document.documentElement).appendChild(tapa);

  /* Red de seguridad: si algo falla, a los 6 segundos se destapa el contenido
     del theme. Es preferible la pagina vieja a una pantalla en blanco. */
  var red = setTimeout(destapar, 6000);
  function destapar() {
    var t = document.getElementById('habitad-tapa');
    if (t) t.parentNode.removeChild(t);
  }

  function alCargar(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  alCargar(function () {
    var destino = document.querySelector(ANCLA);
    if (!destino) {                       // el theme cambio de estructura
      clearTimeout(red);
      destapar();
      if (window.console) console.warn('[landing] no se encontro ' + ANCLA);
      return;
    }

    /* 2 · El CSS de la landing, ya acotado a .landing-habitad para que no se
       pise con el de Brasilia. */
    var css = document.createElement('style');
    css.id = 'habitad-css';
    css.textContent = "\n/* ===========================================================================\n   PROTOTIPO DEL EMBUDO — Habitad Natural\n   Orden de secciones segun la seccion 2 del brief:\n     HERO > QUE NECESITAS CUIDAR > MINORISTA|MAYORISTA > CATALOGO >\n     TIMELINE > RECOMENDACIONES > CROSS-SELL > PACKS > BENEFICIOS >\n     TESTIMONIOS > INSTITUCIONAL > CTA FINAL\n   =========================================================================== */\n/* ══ PALETA OFICIAL ══════════════════════════════════════════════════════\n   Los dos colores de marca. Cambiando estas dos lineas cambia toda la pagina.\n\n     --verde   #14823C   del isologo de la tienda\n     --fucsia  #E01560   del banner de Club Habitad+ (ahi mide #FA2065; va un\n                         punto mas oscuro para que el texto blanco encima\n                         llegue al minimo de contraste: 4,74:1 contra 4,13:1)\n\n   El turquesa y el lima que traia el theme de la tienda quedaron afuera.\n   Reparto: FUCSIA lo que hay que apretar, VERDE estado y progreso -- el mismo\n   reparto que usa el banner del Club. */:root{\n  --verde:#14823C; --verde-hondo:#0E5F2B; --verde-suave:#E9F3EB;\n  /* Verde claro: el de la hoja del isologo. Es el unico que se lee sobre el\n     fondo oscuro de la barra fija; el #14823C ahi se apaga. */\n  --verde-claro:#8CBE32;\n  --fucsia:#E01560; --fucsia-hondo:#B70F4D; --fucsia-suave:#FDEAF1;\n  /* Dorado de la escalera de beneficios. Sobre el fondo oscuro de la barra da\n     5,2:1, asi que se lee tambien en un telefono al sol. */\n  --dorado:#E3B23C;\n  --tinta:#3F3D38; --tinta-suave:#6f6b62; --crema:#FBF5EC; --papel:#fff;\n  --borde:#e6e4da; --btn-txt:#fff; --alerta:#b3261e; --ok:#2e7d52;\n  --r:14px; --sombra:0 1px 2px rgba(63,61,56,.05),0 8px 24px rgba(63,61,56,.07);\n  --sombra-alta:0 18px 50px rgba(63,61,56,.18);\n}.landing-habitad *,.landing-habitad *::before,.landing-habitad *::after{box-sizing:border-box}.landing-habitad{scroll-behavior:smooth;scroll-padding-top:16px}\n/* Sin esto, saltar a una seccion la dejaba debajo de la barra de categorias.\n   Se mide sola: ver la funcion que pone --barra-cat. */.landing-habitad{scroll-padding-top:calc(var(--barra-cat, 0px) + 12px)}.landing-habitad{margin:0;font-family:Raleway,system-ui,-apple-system,\"Segoe UI\",sans-serif;\n  color:var(--tinta);background:var(--papel);line-height:1.55;padding-bottom:0}.landing-habitad h1,.landing-habitad h2,.landing-habitad h3{font-family:Lora,Georgia,serif;margin:0;line-height:1.22}.landing-habitad .wrap{max-width:1180px;margin:0 auto;padding:0 20px}.landing-habitad .bloque{padding:56px 0}.landing-habitad .bloque--crema{background:var(--crema)}.landing-habitad .tit{font-size:clamp(22px,3vw,32px);text-align:center;margin-bottom:8px}.landing-habitad .sub{text-align:center;color:var(--tinta-suave);margin:0 auto 26px;max-width:640px}.landing-habitad .pendiente{color:var(--alerta);font-weight:600}\n\n/* Revelado al scroll. El contenido NUNCA se esconde solo por CSS: la clase\n   .armado la pone el script y hay red de seguridad por tiempo. */.landing-habitad .rev{transition:opacity .55s ease,transform .55s ease}.landing-habitad .rev.armado{opacity:0;transform:translateY(20px)}.landing-habitad .rev.armado.visto{opacity:1;transform:none}.landing-habitad .aviso{background:var(--tinta);color:#fff;font-size:13px;padding:10px 20px;text-align:center}.landing-habitad .aviso b{color:var(--verde-claro)}\n\n/* ---- HERO ---- */\n/* El alto del banner NO se elige: sale de la propia pieza. `aspect-ratio` con\n   la proporcion exacta del archivo -- 1884x835 en escritorio, 1136x1385 en\n   celular -- hace que el alto se calcule solo a cualquier ancho, del monitor\n   grande al telefono, y que la imagen entre ENTERA y a la vez llene el ancho:\n   no hay recorte ni franjas de crema a los costados, porque la caja tiene la\n   misma proporcion que la foto.\n\n   Antes estaba clavado con un clamp de 430px y las piezas de escritorio\n   entraban contenidas, achicadas y con crema a los lados. Esto es lo mismo\n   que hace el propio inicio de la tienda.\n\n   SIN TOPE DE ALTO. El max-height de 78vh que habia antes era lo unico que\n   rompia la proporcion: al topar, la caja quedaba mas ancha que la pieza y\n   `cover` recortaba a los costados, o sea que el banner dejaba de verse\n   entero justo en las pantallas grandes. Ahora manda la proporcion sola. */.landing-habitad .hero{background:var(--crema);padding:0;text-align:center;\n  aspect-ratio:1884 / 835}.landing-habitad .hero h1{font-size:clamp(28px,4.6vw,46px);margin-bottom:14px}.landing-habitad .hero p{max-width:620px;margin:0 auto 28px;font-size:clamp(15px,1.7vw,18px);color:var(--tinta-suave)}.landing-habitad .cta{display:inline-block;background:var(--fucsia);color:var(--btn-txt);border:0;border-radius:999px;\n  padding:15px 34px;font:inherit;font-weight:700;font-size:16px;text-decoration:none;cursor:pointer;\n  transition:transform .15s,box-shadow .15s}.landing-habitad .cta:hover{transform:translateY(-2px);box-shadow:var(--sombra)}.landing-habitad .cta--linea{background:transparent;border:1.5px solid var(--tinta);color:var(--tinta)}\n\n/* ---- CHIPS DE CATEGORÍA ----\n   Las categorias de la tienda, leidas en vivo (ver CATEGORÍAS EN VIVO). Se\n   acomodan en filas y se ven todas juntas. Antes iban en una sola fila que\n   habia que arrastrar de costado: en celular se veian tres y las otras nueve\n   quedaban escondidas sin ninguna señal de que estaban.\n   Los nombres los escribe el administrador y pueden ser largos (\"próstata,\n   regulación menstrual menopausia\"): una pastilla nunca pasa del ancho de la\n   fila, y si no entra en un renglon usa dos. */.landing-habitad .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;padding:4px 20px 15px}.landing-habitad .chip{flex:0 0 auto;background:var(--papel);border:1.5px solid var(--borde);\n  border-radius:999px;padding:11px 20px;font:inherit;font-weight:600;font-size:14.5px;color:var(--tinta);\n  cursor:pointer;transition:.16s;min-height:44px;max-width:100%;\n  line-height:1.25;text-align:center;overflow-wrap:anywhere}.landing-habitad .chip:hover{border-color:var(--verde);color:var(--verde)}.landing-habitad .chip[aria-pressed=\"true\"]{background:var(--verde);border-color:var(--verde);color:#fff}.landing-habitad .chip .n{opacity:.65;font-weight:500;margin-left:6px;font-size:13px}\n/* Subcategorias de la elegida: la misma pastilla, mas chica y de contorno,\n   para que se lea como un segundo nivel y no como mas categorias. */.landing-habitad .chips--sub{gap:7px;padding-top:0}.landing-habitad .chips--sub .chip{min-height:36px;padding:7px 15px;font-size:13px;border-width:1px;background:transparent}.landing-habitad .chips--sub .chip[aria-pressed=\"true\"]{background:var(--papel);border-color:var(--verde);color:var(--verde)}.landing-habitad .chips[hidden],.landing-habitad .chips-mas[hidden]{display:none}\n\n/* ---- SELECTOR DE CLIENTE, progresivo ---- */.landing-habitad .seg-nivel{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}.landing-habitad .seg-btn{background:var(--papel);border:2px solid var(--borde);border-radius:var(--r);\n  padding:20px 30px;min-width:220px;cursor:pointer;font:inherit;text-align:center;transition:.18s}.landing-habitad .seg-btn:hover{border-color:var(--verde)}.landing-habitad .seg-btn b{display:block;font-size:17px;font-weight:700;margin-bottom:3px}.landing-habitad .seg-btn span{font-size:13.5px;color:var(--tinta-suave)}.landing-habitad .seg-btn[aria-pressed=\"true\"]{border-color:var(--verde);background:var(--verde-suave)}.landing-habitad .seg-nivel2{margin-top:16px;display:none}.landing-habitad .seg-nivel2.on{display:block;animation:baja .35s ease}\n@keyframes baja{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}.landing-habitad .seg-activo{margin-top:18px;text-align:center;font-size:14px;background:var(--verde-suave);\n  border-radius:10px;padding:12px 18px;display:none}.landing-habitad .seg-activo.on{display:block}.landing-habitad .seg-activo b{color:var(--verde)}\n\n/* ---- TARJETA DE PRODUCTO ---- */.landing-habitad .grilla{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(226px,1fr))}\n/* padding y box-shadow van explicitos: Brasilia tiene su propio .card, con\n   16px de relleno y sombra, y en la tienda se sumaban a la tarjeta. En un\n   celular el nombre quedaba en 97px de ancho y el \"+\" del contador en 7px. */.landing-habitad .card{border:1px solid var(--borde);border-radius:var(--r);background:var(--papel);\n  display:flex;flex-direction:column;overflow:hidden;transition:.18s;\n  padding:0;box-shadow:none}.landing-habitad .card:hover{box-shadow:var(--sombra);transform:translateY(-3px)}.landing-habitad .foto{aspect-ratio:1;background:var(--crema);display:grid;place-items:center;position:relative;\n  color:#c3ccae;font-size:40px;overflow:hidden}\n/* Envases y proporciones originales: contain, nunca cover.\n   La imagen va en absoluto: como hijo normal de la grilla, una foto mas alta\n   que ancha agrandaba el cuadro -- de 224 a 252px -- y con el la tarjeta. */.landing-habitad .foto img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}.landing-habitad .tag{position:absolute;top:10px;left:10px;background:var(--verde);color:#fff;font-size:11.5px;\n  font-weight:700;padding:4px 9px;border-radius:6px}.landing-habitad .tag--bug{background:var(--alerta);top:auto;bottom:10px}\n/* El descuento va arriba a la DERECHA: la esquina izquierda es la que usan\n   los stickers de Nubea, y ahi se pisaban. */.landing-habitad .card .tag:not(.tag--bug){left:auto;right:10px}.landing-habitad .card-body{padding:14px;display:flex;flex-direction:column;gap:7px;flex:1}.landing-habitad .card h3{font-size:15px;font-family:Raleway,sans-serif;font-weight:700;line-height:1.32}.landing-habitad .pres{font-size:12.5px;color:var(--verde);font-weight:700;text-transform:uppercase;letter-spacing:.03em}.landing-habitad .desc{font-size:13px;color:var(--tinta-suave);margin:0;display:-webkit-box;-webkit-line-clamp:2;\n  -webkit-box-orient:vertical;overflow:hidden}.landing-habitad .caracs{list-style:none;margin:0;padding:0;font-size:12.5px;color:var(--tinta-suave)}.landing-habitad .caracs li{padding-left:15px;position:relative;line-height:1.45}.landing-habitad .caracs li::before{content:'✓';position:absolute;left:0;color:var(--ok);font-weight:700}.landing-habitad .precios{display:flex;align-items:baseline;gap:8px;margin-top:auto;flex-wrap:wrap}.landing-habitad .precio{font-size:19px;font-weight:700}.landing-habitad .precio-viejo{font-size:13.5px;color:var(--tinta-suave);text-decoration:line-through}.landing-habitad .precio-seg{font-size:11.5px;background:var(--verde);color:#fff;padding:2px 7px;border-radius:5px;font-weight:700}.landing-habitad .acciones{display:flex;gap:8px;align-items:center}.landing-habitad .qty{display:flex;align-items:center;border:1.5px solid var(--borde);border-radius:9px;overflow:hidden}.landing-habitad .qty button{width:32px;height:38px;border:0;background:transparent;font-size:17px;cursor:pointer;\n  color:var(--tinta);font-family:inherit}.landing-habitad .qty button:hover{background:var(--crema)}.landing-habitad .qty-campo{width:38px;text-align:center;font:inherit;font-weight:700;font-size:14px;\n  border:0;background:transparent;color:var(--tinta);padding:0;-moz-appearance:textfield}.landing-habitad .qty-campo:focus{outline:2px solid var(--verde);outline-offset:-2px;border-radius:4px}.landing-habitad .citem__qty .qty-campo{width:34px;font-size:13.5px}.landing-habitad .add{flex:1;background:var(--fucsia);color:var(--btn-txt);border:0;border-radius:9px;padding:11px 8px;\n  font:inherit;font-weight:700;font-size:14px;cursor:pointer;min-height:38px}.landing-habitad .add:hover:not(:disabled){filter:brightness(1.06)}\n/* Sin stock: apagado y sin cursor de mano. Antes quedaba igual que uno que\n   funciona y el cliente lo apretaba sin entender por que no pasaba nada. */.landing-habitad .add:disabled{background:var(--borde);color:var(--tinta-suave);cursor:not-allowed;\n  box-shadow:none;font-weight:600}.landing-habitad .add.ok{background:var(--verde);color:#fff}\n/* Antes era un enlace subrayado de 13px que casi no se veia. Ahora es un\n   boton con borde: mismo lugar, mucho mas claro que se puede tocar. */.landing-habitad .vermas{background:var(--papel);border:1.5px solid var(--verde);color:var(--verde);\n  font:inherit;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none;\n  padding:9px 14px;border-radius:9px;align-self:stretch;text-align:center;\n  transition:background .16s,color .16s}.landing-habitad .vermas:hover{background:var(--verde);color:#fff}.landing-habitad .vertodo{text-align:center;margin-top:26px}.landing-habitad .vacio{grid-column:1/-1;text-align:center;padding:52px 24px;border:2px dashed var(--borde);\n  border-radius:var(--r);color:var(--tinta-suave);background:#fcfcf7}.landing-habitad .vacio-tienda{display:inline-block;margin-top:14px;padding:9px 16px;\n  border:1px solid var(--verde);border-radius:999px;font-size:13px;\n  font-weight:600;color:var(--verde);text-decoration:none}.landing-habitad .vacio-tienda:hover{background:var(--verde-suave)}.landing-habitad .vacio strong{display:block;color:var(--tinta);font-size:16px;margin-bottom:6px}\n\n/* ---- TIMELINE DE VARIOS HITOS ---- */.landing-habitad .timeline{background:var(--papel);border:1.5px solid var(--borde);border-radius:var(--r);padding:24px}.landing-habitad .bf-msg.festejo{color:var(--verde-claro);font-weight:700;animation:late .5s ease}\n@keyframes late{0%{transform:scale(.94)}55%{transform:scale(1.05)}100%{transform:scale(1)}}.landing-habitad .tl-sub{margin:0 0 20px;font-size:14px;color:var(--tinta-suave);text-align:center}.landing-habitad .tl-pista{position:relative;height:10px;background:#eceadd;border-radius:99px;margin:34px 0 0}.landing-habitad .tl-pista i{position:absolute;inset:0 auto 0 0;background:var(--verde);border-radius:99px;width:0;\n  transition:width .5s cubic-bezier(.4,0,.2,1)}.landing-habitad .tl-hito{position:absolute;top:50%;transform:translate(-50%,-50%);text-align:center}.landing-habitad .tl-punto{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #d8d5c6;\n  transition:.35s;display:grid;place-items:center;font-size:10px;color:#fff}.landing-habitad .tl-hito.logrado .tl-punto{background:var(--verde);border-color:var(--verde)}.landing-habitad .tl-hito.proximo .tl-punto{border-color:var(--verde);box-shadow:0 0 0 5px rgba(20,130,60,.16)}.landing-habitad .tl-lbl{position:absolute;top:26px;left:50%;transform:translateX(-50%);white-space:nowrap;\n  font-size:11.5px;color:var(--tinta-suave);line-height:1.3}.landing-habitad .tl-lbl b{display:block;color:var(--tinta);font-size:12.5px}.landing-habitad .tl-hito.logrado .tl-lbl b{color:var(--verde)}.landing-habitad .tl-pie{margin-top:58px;font-size:12.5px;color:var(--tinta-suave);text-align:center}\n\n/* ---- SUGERENCIAS ---- */.landing-habitad .sugerencias{display:none}.landing-habitad .sugerencias.on{display:block}.landing-habitad .mini-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(215px,1fr))}.landing-habitad .mini{background:var(--papel);border:1px solid var(--borde);border-radius:11px;padding:12px;\n  display:flex;gap:11px;align-items:center}.landing-habitad .mini .ico{width:46px;height:46px;border-radius:9px;background:var(--crema);flex:0 0 auto;overflow:hidden}.landing-habitad .mini .ico img{width:100%;height:100%;object-fit:contain}.landing-habitad .mini .txt{min-width:0;flex:1}.landing-habitad .mini b{display:block;font-size:13px;line-height:1.3;font-weight:700;overflow:hidden;\n  text-overflow:ellipsis;white-space:nowrap}.landing-habitad .mini .pr{font-size:13px;color:var(--tinta-suave)}.landing-habitad .mini button{background:var(--tinta);color:#fff;border:0;border-radius:8px;padding:9px 13px;\n  font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;flex:0 0 auto}\n\n/* ---- COMBOS · carrusel de portada ----\n   Una carta al frente y las vecinas escalonadas detras, cada una de un color.\n   La posicion la pone ubicarCombos() con transform: el CSS dice como se ve\n   cada carta y cuanto tarda en moverse, no donde esta.\n   La foto va en contain y sobre blanco: las piezas de los combos son graficos\n   con texto adentro, y recortarlas se comeria lo que dicen. */.landing-habitad .cf{position:relative;margin-top:4px}.landing-habitad .cf-escena{position:relative;height:560px;overflow:hidden;overflow:clip;border-radius:20px;\n  touch-action:pan-y;-webkit-user-select:none;user-select:none;outline:none}.landing-habitad .cf-escena:focus-visible{box-shadow:inset 0 0 0 3px var(--verde)}.landing-habitad .cf-pista{position:absolute;inset:0}.landing-habitad .cf-carta{position:absolute;top:26px;left:50%;width:300px;margin-left:-150px;\n  display:flex;flex-direction:column;gap:10px;padding:12px 14px 14px;border-radius:22px;\n  background:var(--cf-color,var(--fucsia));color:#fff;cursor:pointer;\n  box-shadow:0 22px 40px -22px rgba(40,25,15,.55);\n  transition:transform .55s cubic-bezier(.2,.9,.25,1),opacity .35s,box-shadow .35s}.landing-habitad .cf-carta--frente{cursor:default;box-shadow:0 34px 60px -24px rgba(40,25,15,.62)}.landing-habitad .cf-carta--fuera{opacity:0;pointer-events:none}.landing-habitad .cf-quieta .cf-carta{transition:none}.landing-habitad .cf-arriba{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:38px}.landing-habitad .cf-ico{flex:0 0 auto;width:38px;height:38px;padding:0;border:0;border-radius:50%;\n  background:transparent;color:#fff;display:grid;place-items:center;cursor:pointer;\n  transition:background .15s,transform .15s}.landing-habitad .cf-ico:hover{background:rgba(255,255,255,.18)}.landing-habitad .cf-ico:active{transform:scale(.9)}.landing-habitad .cf-ico svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;\n  stroke-linecap:round;stroke-linejoin:round}.landing-habitad .cf-fav[aria-pressed=\"true\"] svg{fill:currentColor}.landing-habitad .cf-estado{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;\n  background:rgba(0,0,0,.3);border-radius:99px;padding:4px 10px}.landing-habitad .cf-foto{display:block;width:100%;aspect-ratio:1;padding:0;border:0;border-radius:16px;\n  overflow:hidden;background:#fff;cursor:pointer;box-shadow:0 14px 26px -16px rgba(0,0,0,.5)}.landing-habitad .cf-foto img{display:block;width:100%;height:100%;object-fit:contain;-webkit-user-drag:none}.landing-habitad .cf-sin-foto{display:grid;place-items:center;height:100%;font-size:46px}.landing-habitad .cf-pie{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:0 2px}.landing-habitad .cf-nombre{margin:0;font-family:Raleway,system-ui,-apple-system,\"Segoe UI\",sans-serif;\n  font-size:14px;font-weight:800;line-height:1.25;letter-spacing:.02em;text-transform:uppercase;\n  color:#fff;cursor:pointer;min-height:2.5em;display:-webkit-box;-webkit-line-clamp:2;\n  -webkit-box-orient:vertical;overflow:hidden}.landing-habitad .cf-precio{flex:0 0 auto;font-size:19px;font-weight:800;line-height:1.15;white-space:nowrap}.landing-habitad .cf-agregar{position:relative;display:flex;align-items:center;justify-content:center;\n  width:100%;min-height:46px;padding:0 16px 0 40px;border:0;border-radius:12px;\n  background:#fff;color:var(--tinta);font:inherit;font-size:15px;font-weight:700;cursor:pointer;\n  transition:transform .15s,box-shadow .15s,background .15s}.landing-habitad .cf-agregar::before{content:'+';position:absolute;left:16px;top:50%;transform:translateY(-52%);\n  font-size:24px;font-weight:400;line-height:1}.landing-habitad .cf-agregar.ok::before,.landing-habitad .cf-agregar:disabled::before{content:none}.landing-habitad .cf-agregar:hover:not(:disabled){box-shadow:0 8px 18px -8px rgba(0,0,0,.45)}.landing-habitad .cf-agregar:active:not(:disabled){transform:scale(.98)}.landing-habitad .cf-agregar:disabled{background:rgba(255,255,255,.6);cursor:default;padding-left:16px}.landing-habitad .cf-agregar.ok{background:var(--verde-suave);color:var(--verde-hondo);padding-left:16px}.landing-habitad .cf-flecha{position:absolute;top:calc(50% - 38px);z-index:30}.landing-habitad .cf-flecha--izq{left:max(0px,calc(50% - 545px))}.landing-habitad .cf-flecha--der{right:max(0px,calc(50% - 545px))}.landing-habitad .cf-cuenta{margin:6px 0 0;text-align:center;font-size:13px;color:var(--tinta-suave)}.landing-habitad .cf-aviso{position:absolute;left:50%;bottom:40px;z-index:40;margin:0;padding:8px 16px;\n  border-radius:99px;background:var(--tinta);color:#fff;font-size:13px;font-weight:600;\n  white-space:nowrap;opacity:0;pointer-events:none;transform:translate(-50%,8px);\n  transition:opacity .2s,transform .2s}.landing-habitad .cf-aviso.on{opacity:1;transform:translate(-50%,0)}.landing-habitad .cf-pista .vacio{position:absolute;top:26px;left:50%;transform:translateX(-50%);width:min(520px,90%)}\n@media(max-width:700px){.landing-habitad .cf-carta{width:min(76vw,290px);margin-left:calc(min(76vw,290px) / -2)}.landing-habitad .cf-nombre{font-size:13px}.landing-habitad .cf-precio{font-size:17px}\n}\n@media(prefers-reduced-motion:reduce){.landing-habitad .cf-carta,.landing-habitad .cf-aviso{transition:none}\n}\n\n/* ══ NUBEA ══\n   Badges, stickers y bloques que el cliente configura en Nubea. Los colores,\n   textos, formas y esquinas vienen de su panel; aca solo el esqueleto, con\n   las mismas medidas que usan los widgets de Nubea en la tienda. */.landing-habitad .nb-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;pointer-events:none}.landing-habitad .nb-badge{display:inline-flex;align-items:center;gap:4px;max-width:100%;\n  font:600 11px/1.6 system-ui,-apple-system,\"Segoe UI\",sans-serif}.landing-habitad .nb-badge--pill{padding:2px 8px;border-radius:999px;white-space:normal}.landing-habitad .nb-badge--icon_text{font-size:12px;line-height:1.4}.landing-habitad .nb-badge--plain_line{font-weight:400;line-height:1.4}.landing-habitad .nb-badge svg{flex:0 0 auto;width:12px;height:12px;fill:none;stroke:currentColor;\n  stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.landing-habitad .ficha .nb-badges{margin:0 0 12px}.landing-habitad .nb-stickers{position:absolute;inset:0;pointer-events:none;z-index:3}.landing-habitad .nb-sticker{position:absolute;display:inline-flex;align-items:center;justify-content:center;\n  text-align:center;line-height:1.15;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.2);\n  font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif}.landing-habitad .nb-sticker img{display:block;max-width:none;height:auto}.landing-habitad .cf-foto,.landing-habitad .ficha__principal{position:relative}.landing-habitad .nb-bloques{display:grid;gap:10px;margin:0 0 16px}.landing-habitad .nb-bloque{border:1px solid;border-radius:12px;padding:12px 14px;font-size:13.5px;line-height:1.45}.landing-habitad .nb-bloque__cab{display:flex;align-items:flex-start;gap:10px}.landing-habitad .nb-bloque__cab b{display:block;font-weight:700}.landing-habitad .nb-bloque__cab p{margin:2px 0 0}.landing-habitad .nb-bloque svg{flex:0 0 auto;width:18px;height:18px;fill:none;stroke:currentColor;\n  stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.landing-habitad .nb-bloque__fila{display:flex;align-items:center;gap:10px;padding:3px 0}.landing-habitad .nb-bloque__fila span{font-weight:600}.landing-habitad .nb-bloque__fila em{margin-left:auto;text-align:right;font-style:normal}.landing-habitad .nb-bloque__pie{margin:10px 0 0;padding-top:10px;border-top:1px dashed;font-weight:600}\n\n/* ---- BENEFICIOS ---- */.landing-habitad .benes{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.landing-habitad .bene{text-align:center;padding:20px 14px;background:var(--papel);border-radius:var(--r);border:1px solid var(--borde)}.landing-habitad .bene .ico{font-size:26px;display:block;margin-bottom:8px}.landing-habitad .bene b{display:block;font-size:14.5px;margin-bottom:3px}.landing-habitad .bene span{font-size:13px;color:var(--tinta-suave)}\n\n/* ---- TESTIMONIOS ---- */.landing-habitad .testis{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;scroll-snap-type:x mandatory}.landing-habitad .testi{flex:0 0 300px;scroll-snap-align:center;background:var(--papel);border:1px solid var(--borde);\n  border-radius:var(--r);padding:20px}.landing-habitad .testi .estrellas{color:#e0a92b;font-size:14px;letter-spacing:2px}.landing-habitad .testi p{font-size:14px;margin:9px 0 12px;font-style:italic}.landing-habitad .testi .quien{display:flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700}.landing-habitad .verificado{background:var(--ok);color:#fff;font-size:10.5px;font-weight:700;padding:2px 8px;\n  border-radius:99px;display:inline-flex;align-items:center;gap:3px}\n\n/* ---- INSTITUCIONAL Y CTA FINAL ---- */.landing-habitad .insti{text-align:center;max-width:640px;margin:0 auto}.landing-habitad .insti p{font-size:16px;color:var(--tinta-suave)}.landing-habitad .final{background:var(--tinta);color:#fff;text-align:center;padding:56px 20px}.landing-habitad .final h2{color:#fff;font-size:clamp(21px,3vw,30px);margin-bottom:10px}.landing-habitad .final p{color:#d5d2c9;margin:0 auto 24px;max-width:520px}.landing-habitad .final .cta--linea{border-color:#fff;color:#fff}.landing-habitad .final .cta{margin:5px}\n\n/* ---- VISTA RAPIDA ---- */.landing-habitad .hab-modal{position:fixed;inset:0;background:rgba(30,29,26,.55);display:none;place-items:center;z-index:80;padding:20px}.landing-habitad .hab-modal.on{display:grid}.landing-habitad .modal-caja{background:var(--papel);border-radius:18px;max-width:640px;width:100%;max-height:86vh;\n  overflow:auto;box-shadow:var(--sombra-alta)}.landing-habitad .modal-top{display:flex;gap:18px;padding:22px;border-bottom:1px solid var(--borde);align-items:center}.landing-habitad .modal-top .foto{width:132px;height:132px;flex:0 0 auto;border-radius:11px;aspect-ratio:auto}.landing-habitad .modal-cerrar{position:sticky;top:0;float:right;background:none;border:0;font-size:26px;cursor:pointer;\n  color:var(--tinta-suave);padding:10px 16px;line-height:1;z-index:2}.landing-habitad .modal-cuerpo{padding:22px}.landing-habitad .nota{background:var(--crema);border-left:3px solid var(--verde);padding:11px 14px;font-size:12.5px;\n  color:var(--tinta-suave);border-radius:0 8px 8px 0;margin-bottom:16px}\n\n/* ---- BARRA FIJA: timeline + carrito en un solo elemento ---- */.landing-habitad .barra-fija{position:fixed;left:0;right:0;bottom:0;background:var(--tinta);color:#fff;\n  padding:0 20px 10px;z-index:60;transform:translateY(115%);\n  transition:transform .32s cubic-bezier(.4,0,.2,1);box-shadow:0 -6px 26px rgba(0,0,0,.18)}.landing-habitad .barra-fija.visible{transform:none}.landing-habitad .bf-timeline{max-width:1140px;margin:0 auto;padding:10px 8px 4px}\n/* LA ESCALERA DE BENEFICIOS.\n   Tres columnas iguales: la primera pegada a la izquierda, la del medio\n   centrada y la ultima a la derecha, apuntando cada una a su tramo. Los\n   puntos siguen sobre la barra, en su posicion exacta, marcando el progreso.\n\n   Van separadas del punto a proposito: cada etiqueta mide varios cientos de\n   pixeles y los hitos pueden caer a 100px uno del otro, asi que colgadas del\n   punto se pisaban en minorista y en distribuidor y se salian por arriba de\n   la barra. Repartidas parejo entran a cualquier ancho y a cualquier cuerpo.\n\n   Tamaños: beneficio 17,5px e importe 23,5px. Salieron de sumarle 12px a los\n   originales (11,5 y 17,5) y despues bajarle 6. */\n/* Tantas columnas como hitos tenga el segmento: mayorista tiene cuatro desde\n   que se sumo el envio gratis, y con repeat(3) el cuarto caia a una segunda\n   fila y descuadraba la barra. Lo pone pintarHitos(). */.landing-habitad .tl-etiquetas{display:grid;grid-template-columns:repeat(var(--hitos,3),1fr);gap:14px;\n  padding:0 2px 12px;font-size:17.5px;line-height:1.15;color:var(--dorado)}.landing-habitad .tl-etiquetas span{display:block;text-align:center}.landing-habitad .tl-etiquetas span:first-child{text-align:left}.landing-habitad .tl-etiquetas span:last-child{text-align:right}.landing-habitad .tl-etiquetas b{display:block;font-weight:700;font-size:23.5px;\n  font-family:Raleway,system-ui,sans-serif;letter-spacing:.01em;margin-bottom:2px}.landing-habitad .tl-etiquetas .pendiente{font-size:.72em}\n@media(max-width:640px){\n  /* En celular, seis menos igual: beneficio 15,5 e importe 20,5. Con el\n     cuerpo anterior tres importes en 375px no dejaban ni un pixel de aire\n     entre columnas; con este ya entran holgados. */.landing-habitad .tl-etiquetas{gap:6px;padding:0 0 10px;font-size:15.5px}.landing-habitad .tl-etiquetas b{font-size:20.5px;letter-spacing:-.01em}\n  /* Con cuatro hitos la columna cae a unos 80px en un celular de 375: con el\n     cuerpo de tres, \"$150.000\" no entra y se parte en dos renglones. */.landing-habitad .tl-etiquetas[data-hitos=\"4\"]{font-size:12.5px;gap:4px}.landing-habitad .tl-etiquetas[data-hitos=\"4\"] b{font-size:15px}.landing-habitad .tl-etiquetas[data-hitos=\"5\"]{font-size:11px;gap:3px}.landing-habitad .tl-etiquetas[data-hitos=\"5\"] b{font-size:13px}\n}.landing-habitad .bf-row{max-width:1140px;margin:0 auto;display:flex;align-items:center;gap:14px}.landing-habitad .bf-cant{background:var(--fucsia);color:var(--btn-txt);border-radius:999px;min-width:28px;height:28px;\n  display:grid;place-items:center;font-weight:700;font-size:13px;flex:0 0 auto}.landing-habitad .bf-info{flex:1;min-width:0;display:flex;align-items:baseline;gap:12px}.landing-habitad .bf-monto{font-weight:700;font-size:18px;flex:0 0 auto}.landing-habitad .bf-msg{font-size:13.5px;color:#d9d6cd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.landing-habitad .bf-ir{background:var(--fucsia);color:var(--btn-txt);border:0;border-radius:9px;padding:12px 22px;\n  font:inherit;font-weight:700;cursor:pointer;white-space:nowrap;flex:0 0 auto}.landing-habitad .bf-ir:hover{filter:brightness(1.06)}\n/* el timeline dentro de la barra oscura invierte los colores de la pista */.landing-habitad .barra-fija .tl-pista{background:rgba(255,255,255,.18);margin:0;height:8px}.landing-habitad .barra-fija .tl-pista i{background:var(--verde-claro)}.landing-habitad .barra-fija .tl-punto{background:var(--tinta);border-color:rgba(255,255,255,.42);width:17px;height:17px;border-width:2.5px}.landing-habitad .barra-fija .tl-hito.logrado .tl-punto{background:var(--verde-claro);border-color:var(--verde-claro);color:var(--tinta)}.landing-habitad .barra-fija .tl-hito.proximo .tl-punto{border-color:var(--verde-claro);box-shadow:0 0 0 4px rgba(140,190,50,.26)}\n/* Importe y beneficio, los dos en dorado y los dos DOCE PIXELES MAS GRANDES\n   que como estaban. Ver .tl-etiquetas, que es donde se dibujan ahora.\n   La etiqueta colgada del punto queda sin usar dentro de la barra. */.landing-habitad .barra-fija .tl-lbl{display:none}\n\n/* resumen del traspaso al carrito */.landing-habitad .resumen{list-style:none;margin:0 0 4px;padding:0}.landing-habitad .resumen li{display:flex;justify-content:space-between;gap:12px;font-size:14px;\n  padding:9px 0;border-bottom:1px dashed var(--borde)}.landing-habitad .resumen li span:first-child{min-width:0}.landing-habitad .resumen li b{flex:0 0 auto}.landing-habitad .resumen-total{display:flex;justify-content:space-between;padding:12px 0 4px;font-size:16px}.landing-habitad .resumen-total b{font-size:20px}.landing-habitad .resumen-nota{margin:0;font-size:13px;color:var(--verde);font-weight:700}\n\n/* El boton de WhatsApp lo agrega la tienda: no se duplica aca. */\n\n@media(max-width:640px){.landing-habitad .grilla{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:13px}.landing-habitad .bloque{padding:42px 0}.landing-habitad .seg-btn{min-width:0;flex:1;padding:16px 14px}.landing-habitad .tl-lbl{font-size:10px}.landing-habitad .tl-lbl b{font-size:11px}\n  /* La barra lleva el timeline adentro, asi que no entra en 64 px. Se compacta\n     todo lo posible: los importes de los hitos se ocultan y queda el nombre. */.landing-habitad .barra-fija{padding:0 13px 9px}.landing-habitad .bf-timeline{padding:38px 6px 2px}.landing-habitad .bf-row{gap:10px}.landing-habitad .bf-info{flex-direction:column;align-items:flex-start;gap:0}.landing-habitad .bf-monto{font-size:16px;line-height:1.2}.landing-habitad .bf-msg{font-size:11.5px;max-width:100%}.landing-habitad .bf-ir{padding:11px 14px;font-size:13px}.landing-habitad .bf-timeline{padding-top:8px}.landing-habitad .barra-fija .tl-punto{width:14px;height:14px}.landing-habitad .modal-top{flex-direction:column;align-items:stretch}.landing-habitad .modal-top .foto{width:100%;height:150px}.landing-habitad .ficha div{grid-template-columns:1fr;gap:2px}.landing-habitad .caracs{display:none}   /* la tarjeta mobile no debe crecer de mas */\n}\n@media(prefers-reduced-motion:reduce){.landing-habitad{scroll-behavior:auto}.landing-habitad *{animation-duration:.01ms!important;transition-duration:.01ms!important}\n}\n\n/* ---- HERO CON CARRUSEL DE FONDO ----\n   Los cuatro banners son los mismos que rotan hoy en el inicio de la tienda,\n   bajados del CDN. Cada uno tiene su version de escritorio y de celular: la\n   elige <picture>, no JavaScript. */.landing-habitad .hero{position:relative;overflow:hidden;isolation:isolate}.landing-habitad .hero__fondos{position:absolute;inset:0;z-index:0}.landing-habitad .hero__slide{position:absolute;inset:0;opacity:0;transition:opacity 1.1s ease}.landing-habitad .hero__slide.activa{opacity:1}.landing-habitad .hero__slide img{width:100%;height:100%;object-fit:cover;display:block}.landing-habitad .hero__fondos{position:absolute;inset:0;z-index:0}.landing-habitad .hero{display:block}\n/* Velo crema: mantiene el texto oscuro de la marca legible sobre la foto. */.landing-habitad .hero__velo{position:absolute;inset:0;z-index:1;\n  background:linear-gradient(180deg,rgba(251,245,236,0) 0%,rgba(251,245,236,.10) 68%,rgba(251,245,236,.92) 100%)}.landing-habitad .hero__contenido{position:relative;z-index:2}.landing-habitad .hero h1{text-shadow:0 1px 0 rgba(255,255,255,.55)}.landing-habitad .hero__puntos{position:absolute;left:0;right:0;bottom:14px;z-index:4;\n  display:flex;gap:7px;justify-content:center}.landing-habitad .hero__punto{width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;\n  background:rgba(63,61,56,.28);transition:.2s}.landing-habitad .hero__punto[aria-current=\"true\"]{background:var(--tinta);width:22px;border-radius:99px}\n\n/* La pieza entera es un enlace. Sin nada dibujado encima: la unica señal es\n   el puntero, porque la pieza ya trae su propia llamada. */.landing-habitad .hero__enlace{position:absolute;inset:0;z-index:2;display:block}.landing-habitad .hero__enlace[hidden]{display:none}.landing-habitad .hero__enlace span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}\n\n/* El boton de verdad, dentro del banner y abajo a la derecha. La sombra lo\n   despega de la foto: sin ella, sobre una zona clara se pierde. */.landing-habitad .hero__cta{position:absolute;z-index:3;right:clamp(16px,4vw,52px);bottom:clamp(16px,3.4vw,40px);\n  background:var(--fucsia);color:#fff;padding:13px 30px;font-size:15.5px;\n  box-shadow:0 6px 22px rgba(63,61,56,.28),0 2px 6px rgba(63,61,56,.18)}.landing-habitad .hero__cta:hover{background:var(--fucsia-hondo);transform:translateY(-2px)}\n@media(max-width:700px){\n  /* En celular la esquina no alcanza: va centrado abajo, arriba de los puntos. */.landing-habitad .hero__cta{left:50%;right:auto;transform:translateX(-50%);bottom:38px;\n    padding:12px 22px;font-size:14px;max-width:calc(100% - 32px)}.landing-habitad .hero__cta:hover{transform:translateX(-50%) translateY(-2px)}\n  /* Las piezas de celular son verticales: otra proporcion, mismo criterio. */.landing-habitad .hero{aspect-ratio:1136 / 1385}\n}\n\n/* ---- BUSCADOR Y CATEGORÍAS PEGADOS ARRIBA DEL CATÁLOGO ----\n   Quedan fijos mientras se recorre la grilla: son los dos filtros y tienen que\n   estar siempre a mano. Sin ninguna categoria visible en la tienda queda solo\n   el buscador. El id chipsBarra lo usan la medida de --barra-cat y el salto\n   al catalogo. */.landing-habitad .chips-barra{position:sticky;top:0;z-index:40;background:var(--crema);\n  padding-top:8px;box-shadow:0 6px 14px -12px rgba(63,61,56,.5)}.landing-habitad .chips-barra.pegada{box-shadow:0 8px 18px -12px rgba(63,61,56,.55)}\n\n/* ---- ELEGIR CATEGORIA ----\n   El boton y el panel. La clave es que el panel tiene alto propio y scroll\n   propio: cuantas categorias ves no depende del ancho de la pantalla. */.landing-habitad .cat-elige{padding-top:4px;padding-bottom:2px}.landing-habitad .cat-elige__fila{display:flex;gap:10px;align-items:center;justify-content:center;\n  flex-wrap:wrap}.landing-habitad .cat-abrir{display:inline-flex;align-items:center;gap:9px;cursor:pointer;\n  background:var(--papel);border:1.5px solid var(--borde);border-radius:999px;\n  padding:11px 18px;font:inherit;font-size:14.5px;color:var(--tinta);\n  max-width:100%;transition:border-color .18s,box-shadow .18s}.landing-habitad .cat-abrir:hover{border-color:var(--verde)}.landing-habitad .cat-abrir[aria-expanded=\"true\"]{border-color:var(--verde);\n  box-shadow:0 0 0 3px var(--verde-suave)}.landing-habitad .cat-abrir__et{color:var(--tinta-suave);font-size:13px;flex:none}.landing-habitad .cat-abrir__val{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.landing-habitad .cat-abrir__flecha{display:flex;flex:none;width:16px;height:16px;color:var(--tinta-suave);\n  transition:transform .2s}.landing-habitad .cat-abrir__flecha svg{width:100%;height:100%}.landing-habitad .cat-abrir[aria-expanded=\"true\"] .cat-abrir__flecha{transform:rotate(180deg)}.landing-habitad .cat-quitar{cursor:pointer;background:none;border:0;font:inherit;font-size:13px;\n  font-weight:600;color:var(--verde);text-decoration:underline;\n  text-underline-offset:3px;padding:6px 4px}.landing-habitad .cat-panel{max-width:860px;margin:10px auto 0;background:var(--papel);\n  border:1.5px solid var(--borde);border-radius:14px;\n  box-shadow:0 10px 30px -18px rgba(63,61,56,.6);overflow:hidden}.landing-habitad .cat-panel__buscar{display:flex;align-items:center;gap:8px;padding:10px 14px;\n  border-bottom:1px solid var(--borde)}.landing-habitad .cat-panel__buscar input{flex:1;min-width:0;border:0;background:none;font:inherit;\n  font-size:14px;color:var(--tinta);outline:none}\n/* El alto lo fija el panel, no el contenido: con 3 categorias o con 40, ocupa\n   lo mismo y se desplaza adentro. Eso es lo que lo hace igual en toda pantalla. */.landing-habitad .cat-panel__lista{max-height:clamp(220px,46vh,340px);overflow-y:auto;overscroll-behavior:contain;\n  padding:12px;margin:0;gap:8px;justify-content:flex-start}.landing-habitad .cat-panel__vacio{margin:0;padding:0 14px 14px;font-size:13.5px;color:var(--tinta-suave)}.landing-habitad .chips--sub{margin-top:10px;justify-content:center}\n@media(max-width:640px){.landing-habitad .chips-barra{padding-top:6px}.landing-habitad .chips-barra.pegada .buscador{margin-bottom:2px}.landing-habitad .cat-abrir{font-size:14px;padding:10px 15px}.landing-habitad .cat-panel__lista{max-height:clamp(200px,52vh,330px);padding:10px;gap:7px}.landing-habitad .chip{padding:8px 13px;font-size:12.5px;min-height:36px;border-width:1px}.landing-habitad .chip .n{margin-left:4px;font-size:11px}\n}.landing-habitad .variante-sel{width:100%;padding:8px 9px;border:1.5px solid var(--borde);border-radius:9px;\n  background:var(--papel);font:inherit;font-size:13px;color:var(--tinta);cursor:pointer}.landing-habitad .variante-sel:focus{border-color:var(--verde);outline:none}\n\n/* ══ CATÁLOGO EN BANNER · 4 columnas × 2 filas ══\n   grid-auto-flow:column con dos filas hace que las tarjetas se acomoden de\n   arriba hacia abajo y después a la derecha. El ancho de cada columna es un\n   cuarto del visible, así entran exactamente 4 y el resto queda para el\n   scroll horizontal. Sin paginar a mano: el navegador hace el trabajo. */.landing-habitad .carrusel-cat{position:relative;display:flex;align-items:center;gap:10px}.landing-habitad .carrusel-cat .grilla{\n  display:grid;\n  grid-auto-flow:column;\n  /* Cada tarjeta de su alto. Con filas 1fr y stretch, la tarjeta mas alta de\n     TODO el catalogo estiraba a las demas: sin categorias son 149 productos,\n     y los que tienen desplegable dejaban un hueco de 70px debajo de la\n     descripcion en todas. Las filas quedan parejas igual, porque las\n     tarjetas miden lo mismo por construccion: foto cuadrada, titulo en dos\n     lineas, franja fija para descripcion o desplegable, y franja fija para\n     los badges. */\n  grid-template-rows:repeat(2,auto);\n  /* Sin columnas explicitas. La regla base de .grilla -- la de la grilla vieja,\n     que no era carrusel -- le dejaba columnas fijas a la primera pagina y el\n     resto tomaba el ancho del carrusel: seis tarjetas angostas, y con la foto\n     cuadrada, 28px mas bajas que las demas. */\n  grid-template-columns:none;\n  grid-auto-columns:calc((100% - 3 * 20px) / 4);\n  gap:20px;\n  flex:1;min-width:0;\n  overflow-x:auto;scroll-snap-type:x proximity;scroll-behavior:smooth;\n  padding:4px 2px 16px;\n  align-items:start;\n}.landing-habitad .carrusel-cat .card{scroll-snap-align:start}.landing-habitad .cat-flecha{flex:0 0 auto;width:44px;height:44px;border-radius:50%;\n  background:var(--papel);border:1.5px solid var(--borde);color:var(--tinta);\n  display:grid;place-items:center;cursor:pointer;box-shadow:var(--sombra);\n  transition:border-color .16s,opacity .16s}.landing-habitad .cat-flecha:hover:not(:disabled){border-color:var(--verde);color:var(--verde)}.landing-habitad .cat-flecha:disabled{opacity:.3;cursor:default}.landing-habitad .cat-flecha svg{width:22px;height:22px}.landing-habitad .cat-pista{text-align:center;font-size:13px;color:var(--tinta-suave);margin:2px 0 0}\n/* La grilla vacía ocupa las dos filas y todo el ancho. */.landing-habitad .carrusel-cat .vacio{grid-row:1 / -1;grid-column:1 / -1;min-width:100%}\n\n@media(max-width:1000px){.landing-habitad .carrusel-cat .grilla{grid-auto-columns:calc((100% - 2 * 16px) / 3);gap:16px}\n}\n@media(max-width:700px){\n  /* En celular manda el dedo: dos columnas visibles. Las flechas de los OTROS\n     carruseles (combos, reseñas) se apagan; las del catalogo no, pero cambian\n     de sitio -- ver abajo. */.landing-habitad .cat-flecha{display:none}.landing-habitad .carrusel-cat .grilla{grid-auto-columns:calc((100% - 13px) / 2);gap:13px}\n\n  /* Las del catalogo FLOTAN sobre los bordes en vez de ir al costado. Al\n     costado se comian 88px de los 375 de un celular y las tarjetas quedaban\n     sin lugar; flotando se ven, se tocan y no le sacan ancho a nada.\n\n     Van medio translucidas y con sombra para que se despeguen de la foto que\n     tienen detras sin taparla. */.landing-habitad .carrusel-cat{position:relative}.landing-habitad .cat-flecha--izq,.landing-habitad .cat-flecha--der{display:grid;position:absolute;top:50%;z-index:6;\n    transform:translateY(-50%);\n    width:40px;height:40px;\n    background:rgba(255,255,255,.94);\n    box-shadow:0 3px 14px rgba(63,61,56,.3);\n    transition:opacity .18s}.landing-habitad .cat-flecha--izq{left:-5px}.landing-habitad .cat-flecha--der{right:-5px}.landing-habitad .cat-flecha--izq svg,.landing-habitad .cat-flecha--der svg{width:20px;height:20px}\n  /* En la punta se desvanecen en vez de apagarse a medias: una flecha al 30%\n     sigue pareciendo tocable y no lleva a ningun lado. */.landing-habitad .cat-flecha--izq:disabled,.landing-habitad .cat-flecha--der:disabled{opacity:0;pointer-events:none}\n}\n\n/* ══ Reseñas de Trusty / Opiniones Nube ══\n   La app inyecta su propio markup adentro de .estrellas. Solo se le da lugar\n   y se lo alinea; los estilos de las estrellas los pone ella. */.landing-habitad .estrellas:empty{display:none}.landing-habitad .estrellas.sin-resenas{font-size:12px;color:var(--tinta-suave);font-style:italic}.landing-habitad .estrellas .astros{color:#e0a92b;letter-spacing:1px;font-size:14px;line-height:1}.landing-habitad .estrellas b{font-size:13px;font-weight:700}.landing-habitad .estrellas .cuenta{font-size:12px;color:var(--tinta-suave)}.landing-habitad .estrellas{display:flex;align-items:center;gap:6px;min-height:18px}.landing-habitad .estrellas img{width:15px;height:15px}.landing-habitad .estrellas .reviewsapp-rating{display:flex;gap:1px}\n\n/* ══ FICHA DE PRODUCTO EN EL POPUP ══\n   Estructura de Mercado Libre: galeria a la izquierda, todo lo que decide la\n   compra a la derecha, y la descripcion abajo a lo ancho. El objetivo es que\n   el cliente no tenga que ir a otra pagina. */.landing-habitad .modal-caja--ficha{max-width:1000px;width:100%}.landing-habitad .ficha{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);\n  gap:26px 26px;padding:26px 26px 6px;align-items:start}\n/* Dos filas en la izquierda -- foto arriba, descripcion abajo -- y la derecha\n   ocupando las dos: es lo que cierra el hueco blanco que quedaba bajo la foto. */.landing-habitad .ficha__galeria{display:grid;grid-template-columns:62px 1fr;gap:12px;align-items:start;\n  grid-column:1;grid-row:1}.landing-habitad .ficha__datos{grid-column:2;grid-row:1 / span 2;min-width:0}.landing-habitad .ficha__info{grid-column:1;grid-row:2;min-width:0}.landing-habitad .ficha__miniaturas{display:flex;flex-direction:column;gap:8px}.landing-habitad .ficha__mini{width:62px;height:62px;border:1.5px solid var(--borde);border-radius:9px;\n  overflow:hidden;background:var(--crema);cursor:pointer;padding:0}.landing-habitad .ficha__mini img{width:100%;height:100%;object-fit:contain;display:block}.landing-habitad .ficha__mini[aria-current=\"true\"]{border-color:var(--verde);box-shadow:0 0 0 2px rgba(20,130,60,.2)}.landing-habitad .ficha__principal{background:var(--crema);border-radius:var(--r);aspect-ratio:1;\n  display:grid;place-items:center;overflow:hidden;min-height:0;width:100%}.landing-habitad .ficha__principal img{width:100%;height:100%;object-fit:contain}.landing-habitad .ficha__cintas{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}.landing-habitad .ficha__cinta{background:var(--verde-suave);color:var(--verde-hondo);font-size:12px;font-weight:700;\n  padding:4px 10px;border-radius:6px}.landing-habitad .ficha__vendidos{margin:0 0 4px;font-size:13px;color:var(--tinta-suave)}.landing-habitad .ficha__titulo{font-size:20px;line-height:1.25;margin:0 0 6px}.landing-habitad .ficha__estrellas{margin-bottom:14px;min-height:18px}.landing-habitad .ficha__estrellas .astros{color:#e0a92b;letter-spacing:1px}.landing-habitad .ficha__estrellas b{margin-left:5px}.landing-habitad .ficha__estrellas .cuenta{color:var(--tinta-suave);font-size:12.5px;margin-left:4px}.landing-habitad .ficha__precios{margin-bottom:16px}.landing-habitad .ficha__lista{font-size:14px;color:var(--tinta-suave);text-decoration:line-through}.landing-habitad .ficha__fila{display:flex;align-items:baseline;gap:10px;margin-top:2px}.landing-habitad .ficha__precio{font-size:32px;font-weight:700;line-height:1.1}.landing-habitad .ficha__off{color:var(--ok);font-weight:700;font-size:15px}.landing-habitad .ficha__transferencia{margin:6px 0 0;font-size:14px;color:var(--ok);font-weight:600}.landing-habitad .ficha__compra{display:flex;gap:10px;align-items:center;margin-bottom:18px}.landing-habitad .ficha__compra .add{flex:1;padding:14px;font-size:15px}.landing-habitad .ficha__compra .add:disabled{background:var(--borde);color:var(--tinta-suave);\n  cursor:not-allowed}.landing-habitad .ficha__garantias{list-style:none;margin:0;padding:0;display:grid;gap:9px;\n  border-top:1px solid var(--borde);padding-top:14px}.landing-habitad .ficha__garantias li{font-size:13px;color:var(--tinta-suave);line-height:1.45}.landing-habitad .ficha__garantias b{color:var(--tinta)}.landing-habitad .ficha__descripcion{padding:6px 26px 26px}.landing-habitad .ficha__descripcion h4,.landing-habitad .ficha__info h4{margin:0 0 8px;font-family:Lora,Georgia,serif;font-size:17px}.landing-habitad .ficha__descripcion p,.landing-habitad .ficha__info p{margin:0 0 16px;font-size:14.5px;line-height:1.6;color:var(--tinta-suave)}\n/* La descripcion de la tienda viene con renglones -- son los <br> y los\n   parrafos de la ficha. Sin esto se aplastaban en un solo bloque. */.landing-habitad #mv-carac{white-space:pre-line}.landing-habitad .ficha__vermas-desc{background:none;border:0;padding:0;margin:-10px 0 16px;font:inherit;\n  font-size:13.5px;font-weight:700;color:var(--verde);cursor:pointer;text-decoration:underline}.landing-habitad .ficha__vermas-desc:hover{color:var(--verde-hondo)}.landing-habitad .ficha__ficha-tecnica{margin:0 0 14px;display:grid;gap:0}.landing-habitad .ficha__ficha-tecnica > div{display:grid;grid-template-columns:130px 1fr;gap:12px;\n  font-size:14px;padding:9px 0;border-bottom:1px dashed var(--borde)}.landing-habitad .ficha__ficha-tecnica dt{font-weight:700}.landing-habitad .ficha__ficha-tecnica dd{margin:0;color:var(--tinta-suave)}\n\n@media(max-width:820px){.landing-habitad .ficha{grid-template-columns:1fr;gap:18px;padding:20px 18px 4px}\n  /* Una sola columna: manda el orden del HTML -- galeria, datos, descripcion --\n     y las celdas fijas de arriba estorbarian. */.landing-habitad .ficha__galeria,.landing-habitad .ficha__datos,.landing-habitad .ficha__info{grid-column:auto;grid-row:auto}\n  /* En celular las miniaturas van debajo, en fila. */.landing-habitad .ficha__galeria{grid-template-columns:1fr;gap:10px}.landing-habitad .ficha__miniaturas{flex-direction:row;order:2;overflow-x:auto}.landing-habitad .ficha__principal{order:1;aspect-ratio:4/3}.landing-habitad .ficha__precio{font-size:27px}.landing-habitad .ficha__descripcion{padding:4px 18px 20px}.landing-habitad .ficha__ficha-tecnica div{grid-template-columns:1fr;gap:2px}\n}\n\n/* ══ Reseñas dentro de la ficha ══ */.landing-habitad .ficha__resenas{border-top:1px solid var(--borde);padding-top:18px;margin-top:6px}.landing-habitad .ficha__resenas-cab{display:flex;justify-content:space-between;align-items:center;\n  gap:12px;margin-bottom:14px;flex-wrap:wrap}.landing-habitad .ficha__resenas-cab h4{margin:0;font-family:Lora,Georgia,serif;font-size:17px}.landing-habitad .vermas--chico{font-size:14px;padding:7px 12px;align-self:auto}.landing-habitad .resumen-resenas{display:flex;gap:18px;align-items:center;background:var(--crema);\n  border-radius:var(--r);padding:14px 18px;margin-bottom:14px}.landing-habitad .resumen-resenas .nota-grande{font-size:34px;font-weight:700;line-height:1}.landing-habitad .resumen-resenas .astros{color:#e0a92b;font-size:15px;letter-spacing:1px;display:block}.landing-habitad .resumen-resenas small{color:var(--tinta-suave);font-size:12.5px}.landing-habitad .resena{border:1px solid var(--borde);border-radius:var(--r);padding:14px 16px;margin-bottom:10px}.landing-habitad .resena__cab{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;margin-bottom:4px}.landing-habitad .resena__autor{font-weight:700;font-size:14px}.landing-habitad .resena__fecha{color:var(--tinta-suave);font-size:12.5px}.landing-habitad .resena__verificada{background:var(--ok);color:#fff;font-size:10.5px;font-weight:700;\n  padding:2px 8px;border-radius:99px}.landing-habitad .resena__astros{color:#e0a92b;font-size:13px;letter-spacing:1px}.landing-habitad .resena__titulo{font-weight:700;font-size:14px;margin:3px 0 2px}.landing-habitad .resena__texto{margin:0;font-size:14px;line-height:1.55;color:var(--tinta-suave)}.landing-habitad .resenas-vacio{background:var(--crema);border-radius:var(--r);padding:16px 18px;\n  font-size:14px;color:var(--tinta-suave);margin:0}.landing-habitad .ficha__confianza{display:grid;gap:12px;margin-top:18px;border-top:1px solid var(--borde);\n  padding-top:16px}.landing-habitad .ficha__confianza div{display:grid;gap:2px}.landing-habitad .ficha__confianza b{font-size:14px}.landing-habitad .ficha__confianza span{font-size:13px;color:var(--tinta-suave);line-height:1.5}\n\n/* ══ Distintivos ══ */.landing-habitad .sellos{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;text-align:center}.landing-habitad .sello{padding:16px 14px}\n/* En la ficha son mas chicos: acompañan, no compiten con el producto. */.landing-habitad .sellos--ficha{margin-top:18px;border-top:1px solid var(--borde);padding-top:16px;gap:8px;\n  grid-template-columns:repeat(3,1fr)}.landing-habitad .sellos--ficha .sello{padding:4px}.landing-habitad .sellos--ficha .sello__ico{width:40px;height:40px;font-size:17px;margin-bottom:7px}.landing-habitad .sellos--ficha .sello b{font-size:13px}.landing-habitad .sellos--ficha .sello span{font-size:11.5px;line-height:1.35}.landing-habitad .sello__ico{display:grid;place-items:center;width:56px;height:56px;margin:0 auto 10px;\n  border-radius:50%;border:2px solid var(--verde);font-size:24px;color:var(--verde)}.landing-habitad .sello b{display:block;font-size:15px;margin-bottom:3px}.landing-habitad .sello span{font-size:13px;color:var(--tinta-suave)}\n\n/* ══ Preguntas frecuentes ══ */.landing-habitad .faq{max-width:760px;margin:0 auto}.landing-habitad .faq details{border-bottom:1px solid var(--borde)}.landing-habitad .faq summary{cursor:pointer;padding:15px 34px 15px 0;font-size:16px;font-weight:600;\n  position:relative;list-style:none}.landing-habitad .faq summary::-webkit-details-marker{display:none}.landing-habitad .faq summary::after{content:'+';position:absolute;right:6px;top:11px;font-size:24px;\n  color:var(--fucsia);font-weight:700}.landing-habitad .faq details[open] summary::after{content:'−'}.landing-habitad .faq p{margin:0 0 16px;font-size:14.5px;line-height:1.6;color:var(--tinta-suave)}\n\n/* ══ Tarjetas parejas ══\n   El alto lo fija la fila, no el contenido. Lo variable se acota: el nombre\n   a dos lineas y el bloque de estrellas con alto reservado, aunque el\n   producto no tenga ninguna. */.landing-habitad .card h3{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;\n  overflow:hidden;min-height:2.7em}.landing-habitad .estrellas{min-height:20px}.landing-habitad .estrellas:empty{display:flex}.landing-habitad .card .precios{margin-top:auto}\n/* Franja del medio de la tarjeta: la descripcion en dos lineas o, si el\n   producto tiene variantes, el desplegable en su lugar. Mismo alto en las\n   dos, asi una tarjeta con variantes no es mas alta que las demas. */.landing-habitad .card-medio{font-size:13px;line-height:1.55;height:calc(2 * 1.55em);\n  display:flex;align-items:center;overflow:hidden}.landing-habitad .card-medio .desc{flex:1}.landing-habitad .card-medio .variante-sel{margin:0}\n/* Los badges de Nubea en una franja fija de dos renglones de pastilla. */.landing-habitad .card .nb-badges{height:40px;overflow:hidden;align-content:flex-start}\n/* Sin stock no hay cantidad que elegir: el contador se va y \"Sin stock\" usa la\n   fila entera. En celular no entraban juntos, el boton se partia en dos\n   renglones y esas tarjetas quedaban 21px mas altas. */.landing-habitad .card--sin-stock .qty{display:none}.landing-habitad .card .variante-sel{margin-top:2px}\n\n/* ══ Banner de marca registrada ══ */.landing-habitad .bloque--marca{padding:34px 0}.landing-habitad .marca{width:100%;height:auto;display:block;border-radius:var(--r);\n  box-shadow:var(--sombra)}\n\n/* ══ Muro de reseñas ══\n   Carrusel horizontal que avanza solo: no estira la pagina hacia abajo.\n   Al ir todas las tarjetas en una sola fila, la mas alta le impone el alto a\n   las demas; por eso el texto se recorta y la foto va a medida fija. */.landing-habitad .carrusel-rev{position:relative;display:flex;align-items:center;gap:10px}.landing-habitad .muro{display:grid;grid-auto-flow:column;\n  grid-auto-columns:calc((100% - 2 * 18px) / 3);gap:18px;\n  overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;\n  scrollbar-width:none;padding:4px 2px;align-items:start}.landing-habitad .muro::-webkit-scrollbar{display:none}.landing-habitad .muro__item{scroll-snap-align:start;background:var(--papel);border:1px solid var(--borde);\n  border-radius:var(--r);padding:16px 18px;display:flex;flex-direction:column;\n  /* Alto fijo: lo decide el diseño, no la reseña mas larga. Lo que no entra\n     se corta adentro, y el pie queda siempre a la vista. */\n  height:300px;overflow:hidden}.landing-habitad .muro__item--foto{border-color:var(--verde)}.landing-habitad .muro__astros{color:#e0a92b;font-size:14px;letter-spacing:1px}.landing-habitad .muro__titulo{font-weight:700;font-size:14.5px;margin:6px 0 4px;flex:0 0 auto;\n  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden}.landing-habitad .muro__texto{margin:0 0 10px;font-size:14px;line-height:1.55;color:var(--tinta-suave);\n  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:7;overflow:hidden;\n  flex:0 1 auto;min-height:0}\n/* Con foto queda menos lugar para el texto, y la foto es la que convence. */.landing-habitad .muro__item--foto .muro__texto{-webkit-line-clamp:2}.landing-habitad .muro__foto{width:100%;height:100px;object-fit:cover;border-radius:10px;\n  display:block;margin-bottom:10px;flex:0 0 auto}.landing-habitad .muro__pie{margin-top:auto;flex:0 0 auto;display:flex;gap:8px;align-items:center;\n  border-top:1px dashed var(--borde);padding-top:9px}.landing-habitad .muro__inicial{width:30px;height:30px;border-radius:50%;background:var(--verde-suave);\n  color:var(--verde);display:grid;place-items:center;font-weight:700;font-size:13px;flex:0 0 auto}.landing-habitad .muro__quien{min-width:0}.landing-habitad .muro__autor{font-weight:700;font-size:13.5px;display:block}.landing-habitad .muro__producto{font-size:12px;color:var(--tinta-suave);display:block;overflow:hidden;\n  text-overflow:ellipsis;white-space:nowrap}.landing-habitad .muro__verificada{margin-left:auto;background:var(--ok);color:#fff;font-size:10.5px;\n  font-weight:700;padding:2px 8px;border-radius:99px;flex:0 0 auto}\n@media(max-width:1000px){.landing-habitad .muro{grid-auto-columns:calc((100% - 16px) / 2);gap:16px}}\n@media(max-width:640px){.landing-habitad .muro{grid-auto-columns:100%}}\n\n/* ══ Combos y preguntas dentro de la ficha ══ */.landing-habitad .ficha__combos{margin-top:20px;border-top:1px solid var(--borde);padding-top:16px}.landing-habitad .ficha__combos h4{font-size:15px;margin:0 0 2px}.landing-habitad .ficha__combos-sub{margin:0 0 11px;font-size:13px;color:var(--tinta-suave)}.landing-habitad .ficha__combos-lista{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(275px,1fr))}.landing-habitad .ficha__faq{margin-top:20px;border-top:1px solid var(--borde);padding-top:16px}.landing-habitad .ficha__faq h4{font-size:15px;margin:0 0 4px}\n/* En la ficha las preguntas van al ancho de la columna, no centradas. */.landing-habitad .ficha__faq .faq{max-width:none;margin:0}.landing-habitad .ficha__faq .faq summary{font-size:14.5px;padding:12px 30px 12px 0}.landing-habitad .ficha__faq .faq p{font-size:13.5px}\n\n/* ══ Popup de la historia ══ */.landing-habitad .hist h3{font-family:Lora,serif;font-size:24px;line-height:1.25;margin:2px 0 10px}.landing-habitad .hist h4{font-size:16px;margin:0 0 8px}.landing-habitad .hist p{margin:0 0 10px;font-size:14.5px;line-height:1.62;color:var(--tinta-suave)}.landing-habitad .hist__cab{display:grid;grid-template-columns:230px 1fr;gap:24px;align-items:start;\n  padding-bottom:20px;border-bottom:1px solid var(--borde)}.landing-habitad .hist__retrato{margin:0}.landing-habitad .hist__retrato img{width:100%;border-radius:14px;display:block;box-shadow:var(--sombra)}\n/* Si la foto todavia no esta en img/, se ve el hueco con la instruccion en\n   vez de un icono roto. */.landing-habitad .hist__retrato--falta img{display:none}.landing-habitad .hist__retrato--falta::before{content:'Falta la foto: dejala en img/santiago.webp';\n  display:grid;place-items:center;text-align:center;aspect-ratio:3/4;border-radius:14px;\n  border:2px dashed var(--borde);color:var(--tinta-suave);font-size:12.5px;padding:14px}.landing-habitad .hist__retrato figcaption{margin-top:9px;text-align:center;line-height:1.35}.landing-habitad .hist__retrato figcaption b{display:block;font-size:14.5px}.landing-habitad .hist__retrato figcaption span{font-size:12.5px;color:var(--tinta-suave)}.landing-habitad .hist__ojo{text-transform:uppercase;letter-spacing:.11em;font-size:11.5px;font-weight:700;\n  color:var(--verde);margin:0 0 4px}.landing-habitad .hist__bloque{padding-top:20px;margin-top:20px;border-top:1px solid var(--borde)}.landing-habitad .hist__pilares{display:grid;gap:13px;grid-template-columns:repeat(auto-fit,minmax(238px,1fr))}.landing-habitad .hist__pilares div{background:var(--crema);border-radius:11px;padding:14px}.landing-habitad .hist__pilares b{display:block;font-size:14px;margin-bottom:3px}.landing-habitad .hist__pilares span{font-size:13px;line-height:1.5;color:var(--tinta-suave)}.landing-habitad .hist__firma{margin-top:14px}.landing-habitad .hist__firma b{display:block;font-family:Lora,serif;font-size:17px;color:var(--tinta)}.landing-habitad .hist__firma span{font-size:13.5px}.landing-habitad .hist__aviso{margin-top:22px;background:var(--crema);border-left:3px solid var(--verde);\n  border-radius:0 10px 10px 0;padding:14px 16px}.landing-habitad .hist__aviso b{display:block;font-size:13.5px;margin-bottom:5px}.landing-habitad .hist__aviso p{margin:0;font-size:12.5px;line-height:1.55}\n\n/* Cifras y grafico */.landing-habitad .hist__cifras{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));\n  margin:14px 0 18px}.landing-habitad .hist__cifra{background:var(--crema);border-radius:11px;padding:14px;text-align:center}.landing-habitad .hist__cifra b{display:block;font-family:Lora,serif;font-size:27px;color:var(--verde);line-height:1.1}.landing-habitad .hist__cifra span{display:block;font-size:12.5px;color:var(--tinta-suave);margin-top:3px}.landing-habitad .hist__grafico{margin:0;background:var(--crema);border-radius:12px;padding:16px}.landing-habitad .hist__grafico figcaption{font-size:14px;font-weight:700;margin-bottom:12px}.landing-habitad .hist__barras{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:10px;\n  align-items:end;height:150px}.landing-habitad .hist__barra{display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:5px}.landing-habitad .hist__barra i{display:block;background:var(--verde);border-radius:5px 5px 0 0;min-height:3px;\n  transition:height .5s cubic-bezier(.4,0,.2,1)}.landing-habitad .hist__barra em{font-style:normal;font-size:12px;font-weight:700;text-align:center}.landing-habitad .hist__barra small{font-size:11px;color:var(--tinta-suave);text-align:center}.landing-habitad .hist__fuente{margin:11px 0 0;font-size:11.5px;color:var(--tinta-suave);line-height:1.5}\n@media(max-width:760px){.landing-habitad .hist__cab{grid-template-columns:1fr}.landing-habitad .hist__retrato{max-width:230px;margin:0 auto}\n}\n\n/* Aviso de cambio de segmento */.landing-habitad .aviso-seg{max-width:760px;margin:10px auto 0;background:#fff8e1;border:1px solid #e8d9a0;\n  border-radius:10px;padding:11px 14px;font-size:13.5px;line-height:1.5;color:#6b5a1e;\n  text-align:center;display:none}.landing-habitad .aviso-seg.on{display:block}\n\n/* ══ Ficha: envio, compra rapida y sello ══ */.landing-habitad .ficha__envio{margin:10px 0 0;background:var(--verde-suave);color:var(--verde-hondo);border-radius:9px;\n  padding:9px 12px;font-size:13.5px;font-weight:600;display:flex;gap:8px;align-items:center}.landing-habitad .ficha__envio::before{content:'\\1f69a';font-size:15px}.landing-habitad .ficha__rapida{width:100%;margin-top:9px;background:var(--papel);color:var(--tinta);\n  border:1.5px solid var(--tinta);border-radius:9px;padding:12px 8px;font-size:14.5px;\n  font-weight:700;font-family:inherit;cursor:pointer;transition:.16s}.landing-habitad .ficha__rapida:hover{background:var(--tinta);color:#fff}\n\n/* El sello va sobre la caja, corrido a la izquierda del boton de cerrar para\n   no pisarlo. */.landing-habitad .ficha__sello{position:absolute;top:12px;right:54px;z-index:3;margin:0;\n  width:66px;height:66px;pointer-events:none}.landing-habitad .ficha__sello img{width:100%;height:100%;object-fit:contain;display:block}.landing-habitad .modal-caja--ficha{position:relative}\n/* Mientras el archivo no este, se ve el hueco con la instruccion en vez de un\n   icono roto. */.landing-habitad .ficha__sello--falta img{display:none}.landing-habitad .ficha__sello--falta::before{content:'sello: img/marca-registrada.webp';\n  display:grid;place-items:center;text-align:center;width:100%;height:100%;\n  border:2px dashed var(--borde);border-radius:50%;font-size:8px;line-height:1.15;\n  color:var(--tinta-suave);padding:7px}\n@media(max-width:760px){\n  /* Se achica pero NO se acerca al borde: a 46px rozaba el boton de\n     cerrar por 1px. */.landing-habitad .ficha__sello{width:48px;height:48px;top:10px;right:56px}\n}\n\n/* Cualquier regla que fije display -- flex, grid, block -- le gana al atributo\n   hidden y el elemento queda a la vista igual. Le paso a la linea de envio\n   gratis de la ficha, que se mostraba tambien a mayoristas. Esta regla corta\n   la familia entera de ese error. */.landing-habitad [hidden]{display:none !important}\n\n/* ══ Carrito ══\n   Mismo tono claro que el resto del sitio: el paso de compra no tiene por que\n   cambiar de piel. */.landing-habitad .modal-caja--carrito{background:var(--papel);color:var(--tinta);max-width:560px}.landing-habitad .carrito__tit{font-family:Lora,serif;font-size:22px;text-align:center;margin:0 0 18px}.landing-habitad .carrito__items{list-style:none;margin:0;padding:0;max-height:44vh;overflow-y:auto}.landing-habitad .citem{display:grid;grid-template-columns:56px 1fr auto auto;gap:12px;align-items:center;\n  padding:12px 0;border-bottom:1px solid var(--borde)}.landing-habitad .citem__foto{width:56px;height:56px;border-radius:9px;object-fit:contain;background:var(--crema);\n  display:block}.landing-habitad .citem__txt{min-width:0}.landing-habitad .citem__nom{font-size:13.5px;font-weight:600;line-height:1.3;color:var(--tinta);\n  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.landing-habitad .citem__unit{font-size:12px;color:var(--tinta-suave)}\n/* Contador: el mismo gesto que en las tarjetas del catalogo. */.landing-habitad .citem__qty{display:flex;align-items:center;border:1.5px solid var(--borde);border-radius:8px;\n  overflow:hidden;flex:0 0 auto}.landing-habitad .citem__qty button{background:var(--crema);border:0;color:var(--tinta);width:28px;height:30px;\n  font-size:15px;cursor:pointer;font-family:inherit;line-height:1}.landing-habitad .citem__qty button:hover{background:#e7e4d8}.landing-habitad .citem__sub{font-size:14px;font-weight:700;white-space:nowrap;min-width:74px;text-align:right}.landing-habitad .citem__quitar{background:none;border:0;color:#a09a8c;font-size:19px;line-height:1;cursor:pointer;\n  padding:2px 4px;border-radius:6px;transition:.15s}.landing-habitad .citem__quitar:hover{color:var(--alerta);background:#fbeceb}.landing-habitad .carrito__cuentas{padding:14px 0 2px}.landing-habitad .carrito__fila{display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;\n  font-size:14px;color:var(--tinta-suave)}.landing-habitad .carrito__fila b{font-size:19px;color:var(--tinta)}.landing-habitad .carrito__fila:last-child b{font-size:14px;font-weight:600;color:var(--verde)}.landing-habitad .carrito__beneficio{margin:6px 0 0;font-size:13px;color:var(--verde);font-weight:700}.landing-habitad .carrito__vacio{text-align:center;color:var(--tinta-suave);padding:26px 0;font-size:14px}.landing-habitad .carrito__botones{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.landing-habitad .carrito__seguir,.landing-habitad .carrito__ir{border-radius:9px;padding:13px 10px;font-size:14.5px;\n  font-weight:700;font-family:inherit;cursor:pointer;transition:.16s}.landing-habitad .carrito__seguir{background:none;border:1.5px solid var(--borde);color:var(--tinta)}.landing-habitad .carrito__seguir:hover{border-color:var(--tinta)}.landing-habitad .carrito__ir{background:var(--fucsia);border:0;color:#fff}.landing-habitad .carrito__ir:hover{background:var(--fucsia-hondo)}.landing-habitad .carrito__ir:disabled{opacity:.55;cursor:default}.landing-habitad .carrito__nota{margin:14px 0 0;font-size:11.5px;line-height:1.5;color:var(--tinta-suave)}\n@media(max-width:560px){.landing-habitad .citem{grid-template-columns:48px 1fr auto;grid-template-areas:'f t x' 'f q s';row-gap:8px}.landing-habitad .citem__foto{grid-area:f;width:48px;height:48px}.landing-habitad .citem__txt{grid-area:t}.landing-habitad .citem__qty{grid-area:q}.landing-habitad .citem__sub{grid-area:s}.landing-habitad .citem__quitar{grid-area:x;align-self:start}.landing-habitad .carrito__botones{grid-template-columns:1fr}\n}\n\n/* ══ Panel de envio de la ficha ══ */.landing-habitad .envio-caja{margin-top:14px;border:1px solid var(--borde);border-radius:12px;padding:14px 16px}.landing-habitad .envio-caja h4{font-size:14.5px;margin:0 0 10px}.landing-habitad .envio-fila{display:flex;align-items:center;gap:9px;padding:4px 0;font-size:13.5px}.landing-habitad .envio-ico{font-size:14px;width:19px;text-align:center;flex:0 0 auto}.landing-habitad .envio-fila b{font-weight:600;color:var(--tinta)}.landing-habitad .envio-val{margin-left:auto;text-align:right;color:var(--tinta-suave);font-size:13px}.landing-habitad .envio-gratis{margin:11px 0 0;padding-top:11px;border-top:1px dashed var(--borde);\n  font-size:14px;font-weight:700;color:var(--verde)}.landing-habitad .distintivos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;\n  text-align:center}.landing-habitad .distintivo-ico{width:46px;height:46px;margin:0 auto 7px;border-radius:50%;\n  border:1.5px solid var(--verde);color:var(--verde);display:grid;place-items:center;\n  font-size:19px}.landing-habitad .distintivos div span:last-child{font-size:11.5px;line-height:1.35;color:var(--tinta-suave);\n  display:block}\n/* En celular hay una regla vieja y muy amplia -- \".ficha div\" -- que pone en\n   una sola columna cualquier div de la ficha, y de paso le cambia el gap.\n   Aca las tres columnas se declaran de nuevo para no quedar a merced de ese\n   efecto no buscado, que ya rompio esta ficha una vez. */\n@media(max-width:700px){\n  /* \".ficha .distintivos\" y no \".distintivos\" a secas: \".ficha div\" tiene mas\n     especificidad (clase + elemento) y le ganaba. */.landing-habitad .ficha .distintivos{grid-template-columns:repeat(3,1fr);gap:8px}.landing-habitad .distintivo-ico{width:40px;height:40px;font-size:17px}.landing-habitad .distintivos div span:last-child{font-size:10.5px}\n}\n\n/* ══ Flechas del banner ══ */.landing-habitad .hero__flecha{position:absolute;top:50%;transform:translateY(-50%);z-index:3;\n  width:42px;height:42px;border-radius:50%;border:0;cursor:pointer;\n  background:rgba(255,255,255,.82);color:var(--tinta);display:grid;place-items:center;\n  box-shadow:0 2px 10px rgba(0,0,0,.16);transition:background .16s}.landing-habitad .hero__flecha:hover{background:#fff}.landing-habitad .hero__flecha svg{width:21px;height:21px}.landing-habitad .hero__flecha--izq{left:14px}.landing-habitad .hero__flecha--der{right:14px}\n@media(max-width:700px){.landing-habitad .hero__flecha{width:34px;height:34px}.landing-habitad .hero__flecha svg{width:17px;height:17px}.landing-habitad .hero__flecha--izq{left:7px}.landing-habitad .hero__flecha--der{right:7px}}\n\n/* ══ Buscador ══ */.landing-habitad .buscador{position:relative;max-width:520px;margin:0 auto 10px;padding:0 20px}.landing-habitad .buscador__campo{display:flex;align-items:center;gap:9px;background:var(--papel);\n  border:1.5px solid var(--borde);border-radius:999px;padding:0 8px 0 15px;\n  transition:border-color .16s}.landing-habitad .buscador__campo:focus-within{border-color:var(--verde)}.landing-habitad .buscador__lupa{font-size:14px;opacity:.55;flex:0 0 auto}.landing-habitad .buscador__campo input{flex:1;min-width:0;border:0;background:none;font:inherit;\n  font-size:14.5px;color:var(--tinta);padding:11px 0;outline:none}.landing-habitad .buscador__campo input::-webkit-search-cancel-button{display:none}.landing-habitad .buscador__limpiar{background:none;border:0;font-size:20px;line-height:1;cursor:pointer;\n  color:var(--tinta-suave);padding:4px 8px;border-radius:50%}.landing-habitad .buscador__limpiar:hover{color:var(--tinta)}\n\n@media(max-width:640px){.landing-habitad .buscador{padding:0 12px;margin-bottom:8px}.landing-habitad .buscador__campo input{font-size:16px;padding:9px 0}\n}\n\n/* Lo que abre la ficha se comporta como tal: puntero y un leve realce. */.landing-habitad .abre-ficha{cursor:pointer}.landing-habitad .card h3.abre-ficha:hover{color:var(--verde)}.landing-habitad .card .foto.abre-ficha:hover img{transform:scale(1.03)}.landing-habitad .card .foto img{transition:transform .22s}\n\n\n/* Aviso de monto minimo sin cumplir */.landing-habitad .carrito__bloqueo{margin:10px 0 0;padding:10px 12px;border-radius:9px;\n  background:#fff8e1;border:1px solid #e8d9a0;color:#6b5a1e;\n  font-size:13px;font-weight:600;line-height:1.45}\n\n/* Selector de productos minoristas (cambio 3) */.landing-habitad .mino__campo{margin:4px 0 12px}.landing-habitad .mino__lista{max-height:min(50vh,420px);overflow:auto;display:grid;gap:8px}.landing-habitad .mino__item{display:grid;grid-template-columns:46px 1fr auto auto;gap:11px;align-items:center;\n  border:1px solid var(--borde);border-radius:11px;padding:8px 10px;background:var(--papel)}.landing-habitad .mino__foto{width:46px;height:46px;border-radius:8px;object-fit:cover;background:var(--crema)}.landing-habitad .mino__nom{font-size:13.5px;font-weight:600;line-height:1.3;display:-webkit-box;\n  -webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.landing-habitad .mino__precio{font-size:14px;font-weight:700;white-space:nowrap}.landing-habitad .mino__add{background:var(--fucsia);color:#fff;border:0;border-radius:8px;padding:9px 13px;\n  font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}.landing-habitad .mino__add:hover{background:var(--fucsia-hondo)}.landing-habitad .mino__add.ok{background:var(--verde)}.landing-habitad .mino__nada{color:var(--tinta-suave);font-size:14px;text-align:center;padding:22px 0}\n@media(max-width:560px){.landing-habitad .mino__item{grid-template-columns:42px 1fr auto;grid-template-areas:'f n n' 'f p a';row-gap:6px}.landing-habitad .mino__foto{grid-area:f;width:42px;height:42px}.landing-habitad .mino__nom{grid-area:n}.landing-habitad .mino__precio{grid-area:p}.landing-habitad .mino__add{grid-area:a}\n}\n\n/* Productos que no viajan al segmento nuevo */.landing-habitad .seg-aviso__caja{background:var(--crema);border-radius:10px;padding:11px 13px;margin:-8px 0 18px;\n  font-size:13px;color:var(--tinta-suave)}.landing-habitad .seg-aviso__caja b{display:block;color:var(--tinta);margin-bottom:5px;font-size:13px}.landing-habitad .seg-aviso__caja ul{margin:0;padding-left:17px;line-height:1.5}\n\n/* Confirmacion de cambio de segmento */.landing-habitad .hab-modal--chico .modal-caja{max-width:430px}.landing-habitad .seg-aviso__txt{color:var(--tinta-suave);font-size:14.5px;margin:10px 0 20px}.landing-habitad .seg-aviso__txt b{color:var(--tinta)}.landing-habitad .seg-aviso__botones{display:grid;gap:9px}\n@media(min-width:460px){.landing-habitad .seg-aviso__botones{grid-template-columns:1fr 1fr}}\n\n/* El selector de compra, ya embebido en la seccion del catalogo. */.landing-habitad .seg-caja{padding-top:26px;padding-bottom:4px}.landing-habitad .tit--chico{font-size:clamp(19px,2.2vw,25px)}.landing-habitad .seg-caja .sub{margin-bottom:18px}\n/* ══ CATÁLOGO EN CELULAR ══\n   La grilla de escritorio no entraba en un telefono: dos columnas de 159px\n   con el contador cortado y \"Ver detalles\" partido en dos renglones, y en la\n   tienda el .card de Brasilia le sumaba 16px de relleno por lado. Lo unico\n   que decia hacia donde seguir era un \"Deslizá para ver más\" al pie.\n\n   Se probo una lista hacia abajo, de a 12, y el cliente la descarto: la\n   pagina se volvia muy larga. En celular el catalogo SE DESLIZA DE COSTADO,\n   pero con tarjetas que se leen: dos por columna, apaisadas, la foto a la\n   izquierda y la botonera abajo a lo ancho. Cada columna mide el 86% del\n   ancho, asi la siguiente asoma por el borde y el catalogo entero entra en\n   una pantalla de alto.\n\n   Para que nadie se pierda: arriba, un boton \"Deslizá para ver más →\" que\n   adelanta una columna (al final dice \"Volver al principio\"); abajo, una\n   barra y \"1–2 de 151 productos\". Y la primera vez que el catalogo entra en\n   pantalla, la grilla amaga hacia el costado y vuelve.\n\n   El cuerpo de la tarjeta se disuelve (display:contents) en la grilla de la\n   tarjeta para bajar la botonera a lo ancho sin tocar el marcado, que es el\n   mismo de escritorio. La fila de \"Ver detalles\" es 1fr: el aire que sobre\n   queda ahi, y la botonera siempre al pie.\n\n   Va al final de la hoja a proposito: gana por orden a todo lo anterior. */.landing-habitad .cat-deslizar,.landing-habitad .cat-progreso{display:none}\n@keyframes cat-empuje{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}\n@media(max-width:700px){.landing-habitad .cat-pista{display:none}.landing-habitad .cat-deslizar{display:flex;align-items:center;justify-content:center;gap:8px;\n    margin:0 auto 10px;padding:9px 18px;min-height:40px;border-radius:999px;\n    border:1.5px solid var(--verde);background:var(--verde-suave);color:var(--verde-hondo);\n    font:inherit;font-weight:700;font-size:14px;cursor:pointer}.landing-habitad .cat-deslizar__flecha{display:inline-block;font-size:17px;line-height:1;\n    animation:cat-empuje 1.3s ease-in-out infinite}.landing-habitad .cat-deslizar--fin .cat-deslizar__flecha{animation:none}.landing-habitad .cat-progreso{display:block;margin:6px 0 0}.landing-habitad .cat-progreso__barra{position:relative;height:4px;border-radius:99px;\n    background:var(--borde);overflow:hidden}.landing-habitad .cat-progreso__relleno{position:absolute;top:0;bottom:0;left:0;width:10%;\n    border-radius:99px;background:var(--verde)}.landing-habitad .cat-progreso__texto{margin:7px 0 0;text-align:center;font-size:13px;color:var(--tinta-suave)}\n}\n@media(max-width:700px) and (prefers-reduced-motion:reduce){.landing-habitad .cat-deslizar__flecha{animation:none}\n}\n@media(max-width:640px){.landing-habitad .carrusel-cat{display:block}.landing-habitad .carrusel-cat .grilla{grid-auto-flow:column;grid-template-rows:repeat(2,auto);\n    grid-auto-columns:86%;gap:12px;align-items:stretch;\n    overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;\n    scroll-padding:0 20px;margin:0 -20px;padding:2px 20px 8px;scrollbar-width:none}.landing-habitad .carrusel-cat .grilla::-webkit-scrollbar{display:none}.landing-habitad .carrusel-cat .card{display:grid;padding:11px;column-gap:11px;row-gap:3px;\n    grid-template-columns:clamp(74px,24vw,100px) minmax(0,1fr);\n    grid-template-rows:auto auto auto auto auto 1fr auto;align-items:start;\n    scroll-snap-align:start}.landing-habitad .carrusel-cat .card:hover{transform:none}.landing-habitad .carrusel-cat .card .foto{grid-column:1;grid-row:1 / 7;border-radius:10px}.landing-habitad .carrusel-cat .card .card-body{display:contents}.landing-habitad .carrusel-cat .card h3{grid-column:2;grid-row:1;font-size:14px;line-height:1.3;\n    -webkit-line-clamp:3;min-height:0}.landing-habitad .carrusel-cat .card .estrellas{grid-column:2;grid-row:2;min-height:0}.landing-habitad .carrusel-cat .card .estrellas.sin-resenas{display:none}.landing-habitad .carrusel-cat .card .card-medio{grid-column:2;grid-row:3;height:auto}.landing-habitad .carrusel-cat .card .card-medio .desc{display:none}.landing-habitad .carrusel-cat .card .precios{grid-column:2;grid-row:4;margin-top:2px}.landing-habitad .carrusel-cat .card .precio{font-size:17.5px}.landing-habitad .carrusel-cat .card .nb-badges{grid-column:2;grid-row:5;height:auto;max-height:44px;margin-top:1px}.landing-habitad .carrusel-cat .card .vermas{grid-column:2;grid-row:6;justify-self:start;align-self:start;border:0;\n    background:none;color:var(--verde);padding:2px 0;font-size:13px;\n    text-decoration:underline;text-underline-offset:3px}.landing-habitad .carrusel-cat .card .vermas:hover{background:none;color:var(--verde-hondo)}.landing-habitad .carrusel-cat .card .acciones{grid-column:1 / -1;grid-row:7;margin-top:8px;gap:9px}.landing-habitad .carrusel-cat .card .qty{flex:0 0 auto}.landing-habitad .carrusel-cat .card .qty button{width:40px;height:42px;font-size:19px}.landing-habitad .carrusel-cat .card .qty-campo{width:42px;font-size:16px}.landing-habitad .carrusel-cat .card .add{min-height:44px;font-size:15px}\n  /* Las etiquetas de la foto, a la medida de una foto chica. */.landing-habitad .carrusel-cat .card .tag{font-size:10px;padding:3px 6px;top:6px}.landing-habitad .carrusel-cat .card .tag:not(.tag--bug){right:6px}.landing-habitad .carrusel-cat .card .tag--bug{top:auto;bottom:6px;left:6px}\n  /* ¿Para vos o para revender?: los dos botones lado a lado y mas bajos. En\n     la tienda quedaban apilados -- el minimo de 220px de escritorio no\n     entraba dos veces en 335 -- y el bloque ocupaba 357px antes del catalogo. */.landing-habitad .seg-caja{padding-top:18px}.landing-habitad .seg-caja .sub{font-size:14px;margin-bottom:12px}.landing-habitad .seg-nivel{flex-wrap:nowrap;gap:10px}.landing-habitad .seg-btn{min-width:0;flex:1 1 0;padding:12px 8px}.landing-habitad .seg-btn b{font-size:14.5px}.landing-habitad .seg-btn span{display:block;font-size:12px;line-height:1.3}\n}\n/* En los telefonos mas angostos la botonera se achica para que \"Agregar\" no\n   quede apretado. */\n@media(max-width:360px){.landing-habitad .carrusel-cat .card .qty button{width:34px}.landing-habitad .carrusel-cat .card .qty-campo{width:36px}\n}\n";
    document.head.appendChild(css);

    /* 2 bis · Lo que el theme deja afuera del ancla y la landing repite. Este
       selector NO va acotado: apunta al theme a proposito. Se agrega recien
       aca, con el ancla ya confirmada, para que un theme cambiado no termine
       escondiendo el titulo de una pagina que quedo sin landing. */
    var sobra = DESTINOS[aqui].esconder;
    if (sobra) {
      var recorte = document.createElement('style');
      recorte.id = 'habitad-recorte';
      recorte.textContent = sobra + '{display:none !important}';
      document.head.appendChild(recorte);
    }

    /* 3 · La landing entra donde estaba el contenido. La cabecera, el pie, el
       buscador y el carrito del theme quedan intactos. */
    var caja = document.createElement('div');
    caja.className = ENVOLTORIO;
    caja.innerHTML = "\n\n\n\n<!-- ══ 3 · HERO ══ -->\n<header class=\"hero\">\n  <!-- Carrusel de fondo. Las imágenes salen de FONDOS, más abajo: agregar una\n       es sumar un archivo a prototipo/img/ y una línea a ese arreglo. -->\n  <div class=\"hero__fondos\" id=\"heroFondos\" aria-hidden=\"true\"><\/div>\n  <div class=\"hero__velo\" aria-hidden=\"true\"><\/div>\n  <!-- Enlace que cubre la pieza entera. Las piezas traen su llamada dibujada\n       (\"CONOCÉ EL CLUB\") y nadie podia apretarla, porque es parte de la\n       imagen; con esto, apretarla funciona. -->\n  <a class=\"hero__enlace\" id=\"heroEnlace\" href=\"#necesidades\"><span><\/span><\/a>\n  <!-- El boton de verdad, DENTRO del banner. Va abajo a la derecha porque es\n       la unica esquina que las cuatro piezas dejan libre: la llamada dibujada\n       (\"CONOCÉ EL CLUB\"), los \"+ ENVÍOS GRATIS\" y el \"Bienestar natural que\n       impulsa tu negocio\" viven todos en la mitad izquierda. -->\n  <a class=\"cta hero__cta\" id=\"heroCta\" href=\"#necesidades\"><\/a>\n  <!-- Sin texto encima: los banners ya traen su propio mensaje y titular\n       y precio, y superponerles otro título los volvía ilegibles. El H1 de la\n       página pasa a ser el del catálogo. -->\n<\/header>\n\n<!-- ══ 4 + 6 · CATÁLOGO ══\n     Se ve todo el catalogo del segmento elegido. Para achicar estan las\n     categorias de la tienda -- las que el administrador deja visibles en\n     Tiendanube, leidas en vivo -- y el buscador, pegados arriba mientras se\n     recorre la grilla. -->\n<section class=\"bloque bloque--crema rev\" id=\"necesidades\">\n  <div class=\"wrap\">\n    <h1 class=\"tit\">¿Qué estás buscando?<\/h1>\n    <p class=\"sub\" id=\"catIntro\">Todo el catálogo a la vista. Escribí el nombre de un producto o lo que\n       necesitás cuidar, y la grilla se filtra al instante.<\/p>\n  <\/div>\n\n  <div class=\"chips-barra\" id=\"chipsBarra\">\n    <!-- Buscador propio: filtra la grilla de abajo y abre la ficha de ESTA\n         landing, no la del theme. -->\n    <div class=\"buscador\" role=\"search\">\n      <label class=\"buscador__campo\">\n        <span class=\"buscador__lupa\" aria-hidden=\"true\">🔍<\/span>\n        <input type=\"search\" id=\"buscar\" autocomplete=\"off\" enterkeyhint=\"search\"\n               aria-controls=\"grilla\" aria-label=\"Buscar en el catálogo\"\n               placeholder=\"Buscá un producto: aceite, crema, dolor, piel...\">\n        <button type=\"button\" class=\"buscador__limpiar\" id=\"buscarLimpiar\"\n                aria-label=\"Borrar la búsqueda\" hidden>&times;<\/button>\n      <\/label>\n    <\/div>\n    <!-- Las categorias ya no viven aca: se eligen desde el panel que esta\n         debajo del selector de minorista/mayorista. En la barra pegada quedo\n         solo el buscador, que es lo que hace falta a mano mientras se recorre\n         la grilla. -->\n  <\/div>\n\n\n  <!-- ══ 5 · MINORISTA | MAYORISTA ══\n       Va DESPUES de las categorias y ANTES de la grilla, que es el orden que\n       pidio el cliente: primero se entiende que hay, despues se elige con que\n       precios verlo. Y va dentro de esta seccion, no como seccion aparte,\n       para que la barra de categorias siga pegada arriba sobre la grilla. -->\n  <div class=\"wrap seg-caja\" id=\"segmento\">\n    <h2 class=\"tit tit--chico\">¿Comprás para vos o para revender?<\/h2>\n    <p class=\"sub\">Si revendés tenés precios diferenciados en todo el catálogo.<\/p>\n\n    <div class=\"seg-nivel\" id=\"segN1\">\n      <button class=\"seg-btn\" type=\"button\" data-seg=\"minorista\" aria-pressed=\"false\">\n        <b>MINORISTA<\/b><span>Precio de lista, sin mínimo<\/span><\/button>\n      <button class=\"seg-btn\" type=\"button\" data-abre=\"mayorista\" aria-pressed=\"false\">\n        <b>MAYORISTA<\/b><span>Para revender<\/span><\/button>\n    <\/div>\n\n    <div class=\"seg-nivel2\" id=\"segN2\">\n      <div class=\"seg-nivel\">\n        <button class=\"seg-btn\" type=\"button\" data-seg=\"mayorista\" aria-pressed=\"false\">\n          <b>MAYORISTA 20%<\/b><span>Mínimo $100.000<\/span><\/button>\n        <button class=\"seg-btn\" type=\"button\" data-seg=\"distribuidor\" aria-pressed=\"false\">\n          <b>DISTRIBUIDOR 30%<\/b><span>Mínimo $250.000<\/span><\/button>\n      <\/div>\n    <\/div>\n\n    <div class=\"seg-activo\" id=\"segActivo\"><\/div>\n  <\/div>\n\n  <!-- ══ 5 bis · ELEGIR CATEGORIA ══\n       Un boton que dice cual esta puesta y abre un panel con TODAS. El panel\n       tiene alto fijo y se desplaza solo, asi que cuantas ves no depende del\n       ancho de la pantalla: en un celular angosto son una por fila y se baja,\n       en una pantalla ancha son varias por fila. Antes eran una nube de\n       pastillas que se recortaba o empujaba el catalogo hacia abajo.\n\n       Las subcategorias van afuera del panel, debajo del boton: son pocas y\n       sirven para afinar sin volver a abrir nada. -->\n  <div class=\"wrap cat-elige\" id=\"catElige\" hidden>\n    <div class=\"cat-elige__fila\">\n      <button class=\"cat-abrir\" id=\"catAbrir\" type=\"button\"\n              aria-expanded=\"false\" aria-controls=\"catPanel\">\n        <span class=\"cat-abrir__et\">Categoría<\/span>\n        <b class=\"cat-abrir__val\" id=\"catAbrirVal\">Todas<\/b>\n        <span class=\"cat-abrir__flecha\" aria-hidden=\"true\">\n          <svg viewBox=\"0 0 24 24\"><path d=\"M6 9l6 6 6-6\" fill=\"none\" stroke=\"currentColor\"\n            stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n        <\/span>\n      <\/button>\n      <button class=\"cat-quitar\" id=\"catQuitar\" type=\"button\" hidden>Quitar filtro<\/button>\n    <\/div>\n\n    <div class=\"cat-panel\" id=\"catPanel\" hidden>\n      <label class=\"cat-panel__buscar\">\n        <span aria-hidden=\"true\">🔍<\/span>\n        <input type=\"search\" id=\"catFiltro\" autocomplete=\"off\"\n               placeholder=\"Filtrá las categorías...\"\n               aria-label=\"Filtrar la lista de categorías\">\n      <\/label>\n      <div class=\"chips cat-panel__lista\" id=\"chips\" role=\"group\" aria-label=\"Categorías\"><\/div>\n      <p class=\"cat-panel__vacio\" id=\"catPanelVacio\" hidden>Ninguna categoría con ese nombre.<\/p>\n    <\/div>\n\n    <div class=\"chips chips--sub\" id=\"subchips\" role=\"group\" aria-label=\"Subcategorías\" hidden><\/div>\n  <\/div>\n\n  <div class=\"wrap\">\n    <p class=\"sub\" id=\"cat-sub\" style=\"margin-top:18px\"><\/p>\n    <h2 class=\"tit\" id=\"cat-tit\" hidden><\/h2>\n    <!-- En celular el catalogo se desliza de costado: este boton lo dice y\n         adelanta una columna; al final vuelve al principio. -->\n    <button type=\"button\" class=\"cat-deslizar\" id=\"catDeslizar\" hidden>\n      <span class=\"cat-deslizar__texto\">Deslizá para ver más<\/span>\n      <span class=\"cat-deslizar__flecha\" aria-hidden=\"true\">→<\/span>\n    <\/button>\n    <div class=\"carrusel-cat\">\n      <button type=\"button\" class=\"cat-flecha cat-flecha--izq\" data-cat=\"-1\"\n              aria-label=\"Ver productos anteriores\">\n        <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M15 5l-7 7 7 7\" fill=\"none\"\n          stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n      <\/button>\n      <div class=\"grilla\" id=\"grilla\"><\/div>\n      <button type=\"button\" class=\"cat-flecha cat-flecha--der\" data-cat=\"1\"\n              aria-label=\"Ver mas productos\">\n        <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 5l7 7-7 7\" fill=\"none\"\n          stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n      <\/button>\n    <\/div>\n    <!-- En celular: por donde va el cliente dentro del catalogo. -->\n    <div class=\"cat-progreso\" id=\"catProgreso\" hidden>\n      <div class=\"cat-progreso__barra\"><span class=\"cat-progreso__relleno\" id=\"catProgresoRelleno\"><\/span><\/div>\n      <p class=\"cat-progreso__texto\" id=\"catProgresoTexto\"><\/p>\n    <\/div>\n    <p class=\"cat-pista\" data-cat-pista><\/p>\n    <!-- Sin boton \"Ver todo\": el carrusel ya muestra el catalogo entero. -->\n  <\/div>\n<\/section>\n\n<!-- ══ 11 y 12 · RECOMENDACIONES Y CROSS-SELL ══\n     El timeline ya no vive acá: se movio a la barra fija del pie, que aparece\n     recien cuando el carrito tiene algo. Ver el bloque #barraFija. -->\n<section class=\"bloque rev\">\n  <div class=\"wrap\">\n\n    <!-- 11 · RECOMENDACIONES -->\n    <div class=\"sugerencias\" id=\"m9\" style=\"margin-top:34px\">\n      <h3 class=\"tit\" style=\"font-size:20px\" id=\"m9-tit\"><\/h3>\n      <p class=\"sub\" style=\"margin-bottom:16px\">Sumando alguno de estos llegás al beneficio.<\/p>\n      <div class=\"mini-grid\" id=\"m9-lista\"><\/div>\n    <\/div>\n\n    <!-- El cross-sell se retiro: su lugar lo ocupa el muro de reseñas. -->\n  <\/div>\n<\/section>\n\n<!-- ══ 13 · PACKS ══ -->\n<section class=\"bloque bloque--crema rev\" id=\"combos\">\n  <div class=\"wrap\">\n    <h2 class=\"tit\">Ofertas packs y combos Habitad<\/h2>\n    <p class=\"sub\">Combinaciones armadas, a menor precio que comprándolas por separado.<\/p>\n    <div class=\"cf\" id=\"cfCombos\">\n      <div class=\"cf-escena\" id=\"cfEscena\" tabindex=\"0\" role=\"region\"\n           aria-roledescription=\"carrusel\" aria-label=\"Packs y combos\">\n        <div class=\"cf-pista\" id=\"packs\"><\/div>\n      <\/div>\n      <button type=\"button\" class=\"cat-flecha cf-flecha cf-flecha--izq\" data-cf=\"-1\"\n              aria-label=\"Combo anterior\">\n        <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M15 5l-7 7 7 7\" fill=\"none\"\n          stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n      <\/button>\n      <button type=\"button\" class=\"cat-flecha cf-flecha cf-flecha--der\" data-cf=\"1\"\n              aria-label=\"Combo siguiente\">\n        <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 5l7 7-7 7\" fill=\"none\"\n          stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n      <\/button>\n      <p class=\"cf-cuenta\" id=\"cfCuenta\" aria-live=\"polite\"><\/p>\n      <p class=\"cf-aviso\" id=\"cfAviso\" role=\"status\"><\/p>\n    <\/div>\n  <\/div>\n<\/section>\n\n<!-- ══ 14 · BENEFICIOS ══ -->\n<section class=\"bloque rev\">\n  <div class=\"wrap\">\n    <h2 class=\"tit\">Por qué comprarnos<\/h2>\n    <p class=\"sub\">&nbsp;<\/p>\n    <div class=\"benes\" data-escalonar>\n      <div class=\"bene\"><span class=\"ico\">🌱<\/span><b>Fabricación propia<\/b><span>Elaboramos lo que vendemos<\/span><\/div>\n      <div class=\"bene\"><span class=\"ico\">📦<\/span><b>Stock permanente<\/b><span>Reposición constante<\/span><\/div>\n      <div class=\"bene\"><span class=\"ico\">🧾<\/span><b>Amplio catálogo<\/b><span>367 productos publicados<\/span><\/div>\n      <div class=\"bene\"><span class=\"ico\">💬<\/span><b>Atención personalizada<\/b><span>Te asesoramos por WhatsApp<\/span><\/div>\n      <div class=\"bene\"><span class=\"ico\">🚚<\/span><b>Envíos a todo el país<\/b>\n        <span id=\"beneEnvio\">Gratis superando $60.000<\/span><\/div>\n      <div class=\"bene\"><span class=\"ico\">🤝<\/span><b>Minorista y mayorista<\/b><span>Precios según tu perfil<\/span><\/div>\n    <\/div>\n  <\/div>\n<\/section>\n\n<!-- Los testimonios de ejemplo se retiraron: eran texto inventado con\n     \"Nombre Apellido\". Las opiniones reales estan abajo, en un solo muro, para\n     no repartir reseñas por todo el inicio como pasa en la tienda actual. -->\n\n<!-- ══ MURO DE RESEÑAS ══\n     Las 90 reseñas reales de la tienda vienen de Trusty (Opiniones Nube), por\n     su endpoint publico. Se muestran las mejores: primero las que traen foto.\n     La otra app instalada, Lily Reviews, responde 402 \"necesario pagar el\n     plan\", asi que sus reseñas no se pueden traer. -->\n<section class=\"bloque rev\" id=\"resenas\">\n  <div class=\"wrap\">\n    <h2 class=\"tit\">Lo que dicen quienes ya compraron<\/h2>\n    <p class=\"sub\" id=\"muroSub\"><\/p>\n    <div class=\"carrusel-rev\">\n      <button type=\"button\" class=\"cat-flecha\" data-rev=\"-1\"\n              aria-label=\"Ver reseñas anteriores\">\n        <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M15 5l-7 7 7 7\" fill=\"none\"\n          stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n      <\/button>\n      <div class=\"muro\" id=\"muro\"><\/div>\n      <button type=\"button\" class=\"cat-flecha\" data-rev=\"1\"\n              aria-label=\"Ver más reseñas\">\n        <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 5l7 7-7 7\" fill=\"none\"\n          stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><\/svg>\n      <\/button>\n    <\/div>\n  <\/div>\n<\/section>\n\n<!-- ══ MARCA REGISTRADA ══\n     El banner que ya usa la tienda en su inicio. Es respaldo real: INPI. -->\n<section class=\"bloque bloque--marca rev\">\n  <div class=\"wrap\">\n    <img class=\"marca\" src=\"https://mind-trade-profit.github.io/Habitad_landing/img/marca.webp\" width=\"1489\" height=\"475\" loading=\"lazy\"\n         alt=\"Habitad Natural es una marca registrada, avalada por el INPI Argentina\">\n  <\/div>\n<\/section>\n\n<!-- ══ PREGUNTAS FRECUENTES ══\n     Las respuestas salen de las páginas reales de la tienda: envíos y pagos,\n     política de devolución y cómo comprar. No están inventadas. -->\n<section class=\"bloque bloque--crema rev\">\n  <div class=\"wrap\">\n    <h2 class=\"tit\">Preguntas frecuentes<\/h2>\n    <p class=\"sub\">Lo que más nos consultan antes de comprar.<\/p>\n    <div class=\"faq\" id=\"faq\" data-escalonar><\/div>\n  <\/div>\n<\/section>\n\n<!-- ══ 16 · INSTITUCIONAL ══ -->\n<section class=\"bloque rev\">\n  <div class=\"wrap insti\">\n    <h2 class=\"tit\">Habitad Natural<\/h2>\n    <p>Productos naturales elaborados con dedicación, atención personalizada y un catálogo\n       pensado para acompañar distintas rutinas de cuidado.<\/p>\n    <button type=\"button\" class=\"cta cta--linea\" id=\"abrirHistoria\">Conocé nuestra historia<\/button>\n  <\/div>\n<\/section>\n\n\n<!-- ══ HISTORIA DE LA MARCA ══\n     Mismo patron de popup que la ficha de producto. El texto es el que\n     entrego el cliente; no se invento nada. Los numeros del panel salen del\n     catalogo real y de las reseñas de Trusty, y cada uno dice de donde sale. -->\n<div class=\"hab-modal\" id=\"modalHistoria\">\n  <div class=\"modal-caja modal-caja--ficha\">\n    <button class=\"modal-cerrar\" id=\"historiaCerrar\" aria-label=\"Cerrar\">&times;<\/button>\n    <div class=\"modal-cuerpo hist\">\n\n      <header class=\"hist__cab\" data-anima>\n        <figure class=\"hist__retrato\">\n          <img src=\"https://mind-trade-profit.github.io/Habitad_landing/img/santiago.webp\" alt=\"Santiago Pérez, fundador y CEO de Habitad Natural\"\n               onerror=\"this.closest('.hist__retrato').classList.add('hist__retrato--falta')\">\n          <figcaption><b>Santiago Pérez<\/b><span>Fundador y CEO<\/span><\/figcaption>\n        <\/figure>\n        <div class=\"hist__intro\">\n          <p class=\"hist__ojo\">Nuestra historia<\/p>\n          <h3>Una historia que nació del deseo de cuidar naturalmente<\/h3>\n          <p>Habitad Natural nació de una convicción sencilla pero profunda: la naturaleza\n             puede acompañarnos en la construcción de hábitos de bienestar más conscientes.<\/p>\n          <p>Lo que comenzó como un interés personal por las plantas medicinales y los\n             conocimientos tradicionales fue creciendo con estudio, dedicación y experiencia.\n             Con el tiempo, esa búsqueda se transformó en un proyecto familiar y, más\n             adelante, en una marca argentina dedicada a acercar productos naturales a\n             personas, comercios y profesionales de todo el país.<\/p>\n        <\/div>\n      <\/header>\n\n      <section class=\"hist__bloque\">\n        <h4>El camino de Santiago<\/h4>\n        <p>Su camino comenzó a partir de una inquietud personal: comprender mejor el vínculo\n           entre las plantas, los hábitos diarios y el bienestar integral. Esa curiosidad lo\n           llevó a formarse en naturopatía, plantas medicinales y jugos naturales, además de\n           incursionar en el estudio de la homeopatía.<\/p>\n        <p>Su formación no busca reemplazar la mirada médica ni presentarse como profesional\n           de la medicina. Su propósito es recuperar conocimientos tradicionales, estudiarlos\n           responsablemente y convertirlos en propuestas naturales que puedan acompañar el\n           cuidado cotidiano de las personas.<\/p>\n        <p>A medida que fue profundizando ese recorrido, Santiago comprendió que no alcanzaba\n           con ofrecer un producto. Era necesario crear una marca cercana, capaz de escuchar,\n           orientar con responsabilidad y mantener una relación humana con cada persona que se\n           acercara buscando una opción natural. Así nació Habitad Natural.<\/p>\n        <p>Primero fueron las consultas, las primeras elaboraciones y las recomendaciones\n           entre personas. Después llegaron nuevos productos, clientes de diferentes lugares\n           del país, comercios interesados en sumar la línea y miles de experiencias\n           compartidas.<\/p>\n      <\/section>\n\n      <section class=\"hist__bloque hist__crecimiento\" data-anima>\n        <h4>De un propósito personal a una comunidad nacional<\/h4>\n        <p>Nuestro crecimiento no se mide solamente por la cantidad de productos o pedidos\n           enviados. También se refleja en las personas que vuelven a elegirnos, en los\n           comercios que incorporan nuestra línea y en las experiencias que nuestra comunidad\n           comparte después de conocernos.<\/p>\n        <div class=\"hist__cifras\" id=\"histCifras\"><\/div>\n        <figure class=\"hist__grafico\">\n          <figcaption id=\"histGraficoTit\"><\/figcaption>\n          <div id=\"histGrafico\"><\/div>\n          <p class=\"hist__fuente\" id=\"histFuente\"><\/p>\n        <\/figure>\n      <\/section>\n\n      <section class=\"hist__bloque\">\n        <h4>Lo que nos diferencia<\/h4>\n        <div class=\"hist__pilares\">\n          <div><b>Atención personalizada<\/b><span>Escuchamos cada consulta y damos información\n            clara para elegir el producto más adecuado según el uso buscado.<\/span><\/div>\n          <div><b>Elaboración diaria<\/b><span>Trabajamos continuamente para ofrecer productos\n            frescos y mantener el stock disponible.<\/span><\/div>\n          <div><b>Selección consciente<\/b><span>Elegimos con cuidado las materias primas y\n            valoramos los ingredientes naturales y de origen orgánico.<\/span><\/div>\n          <div><b>Trazabilidad<\/b><span>Cuidamos cada etapa, desde la selección de los\n            ingredientes hasta la preparación y el despacho del pedido.<\/span><\/div>\n          <div><b>Una relación cercana<\/b><span>No queremos ser una marca distante: nos\n            interesa acompañar y seguir mejorando a partir de cada experiencia.<\/span><\/div>\n          <div><b>Alcance nacional<\/b><span>Realizamos envíos a todo el país para que más\n            personas y comercios accedan a nuestra propuesta.<\/span><\/div>\n        <\/div>\n      <\/section>\n\n      <section class=\"hist__bloque\">\n        <h4>También acompañamos a otros negocios<\/h4>\n        <p>Habitad Natural cuenta con propuestas especiales para comercios, dietéticas,\n           herboristerías, almacenes naturales, distribuidores y personas que desean incorporar\n           una línea natural a su actividad: atención personalizada, stock permanente, catálogo\n           digitalizado, productos de fabricación diaria y acompañamiento comercial.<\/p>\n      <\/section>\n\n      <section class=\"hist__bloque\">\n        <h4>Nuestra manera de entender el bienestar<\/h4>\n        <p>Para nosotros, cuidarse naturalmente no significa rechazar la medicina ni reemplazar\n           tratamientos profesionales. Significa prestar atención a los hábitos, conocer mejor\n           nuestro cuerpo y recuperar una relación más consciente con los recursos que ofrece\n           la naturaleza.<\/p>\n        <p>Detrás de cada pedido hay personas reales preparando productos para otras personas\n           reales. Ese vínculo humano es uno de nuestros mayores valores.<\/p>\n        <p class=\"hist__firma\"><b>Habitad Natural<\/b><span>Siempre pensando en tu bienestar.<\/span><\/p>\n      <\/section>\n\n      <!-- Aviso legal: viene del texto del cliente y no se toca. -->\n      <aside class=\"hist__aviso\">\n        <b>Información importante<\/b>\n        <p>La información proporcionada por Habitad Natural tiene carácter general y educativo.\n           Nuestros productos no son medicamentos y no están destinados a diagnosticar, tratar,\n           curar ni prevenir enfermedades. Su utilización no reemplaza la consulta, el\n           diagnóstico ni el tratamiento indicado por un profesional de la salud. Ante una\n           enfermedad, síntomas persistentes, embarazo, lactancia, uso de medicación o cualquier\n           condición particular, siempre recomendamos realizar la consulta correspondiente.<\/p>\n      <\/aside>\n\n    <\/div>\n  <\/div>\n<\/div>\n\n<!-- ══ 17 · CTA FINAL ══ -->\n<section class=\"final rev\">\n  <h2>¿Ya sabés qué necesitás cuidar?<\/h2>\n  <p>Volvé arriba y elegí tu necesidad: el catálogo se filtra solo y agregás\n     sin salir de esta página.<\/p>\n  <a class=\"cta\" href=\"#necesidades\">Volver al catálogo<\/a>\n<\/section>\n\n<!-- ══ 7 · VISTA RÁPIDA ══ -->\n<div class=\"hab-modal\" id=\"modal\">\n  <div class=\"modal-caja modal-caja--ficha\">\n    <button class=\"modal-cerrar\" id=\"modalCerrar\" aria-label=\"Cerrar\">&times;<\/button>\n\n    <!-- Marca registrada: fija en la esquina superior derecha de todas las\n         fichas, sin depender del segmento ni del producto. -->\n    <figure class=\"ficha__sello\" id=\"fichaSello\">\n      <img src=\"https://mind-trade-profit.github.io/Habitad_landing/img/marca-registrada.webp\"\n           alt=\"Habitad Natural, marca registrada en el INPI Argentina, clase 3 internacional\"\n           onerror=\"this.closest('.ficha__sello').classList.add('ficha__sello--falta')\">\n    <\/figure>\n\n    <div class=\"ficha\">\n      <!-- Columna izquierda: galería, como en Mercado Libre -->\n      <div class=\"ficha__galeria\" data-anima>\n        <div class=\"ficha__miniaturas\" id=\"mvMiniaturas\"><\/div>\n        <!-- Sin src: un src=\"\" hace que el navegador pida la propia pagina como si\n                 fuera una imagen, en cada carga y para nada. Lo llena abrirVista(). -->\n            <div class=\"ficha__principal\"><img id=\"mvFoto\" alt=\"\"><\/div>\n      <\/div>\n\n      <!-- Columna derecha: todo lo que decide la compra, sin scrollear -->\n      <div class=\"ficha__datos\" data-anima>\n        <div class=\"ficha__cintas\" id=\"mvCintas\"><\/div>\n        <p class=\"ficha__vendidos\" id=\"mvVendidos\"><\/p>\n        <h3 class=\"ficha__titulo\" id=\"mv-nom\"><\/h3>\n        <div class=\"ficha__estrellas\" id=\"mvEstrellas\"><\/div>\n\n        <div class=\"ficha__precios\">\n          <span class=\"ficha__lista\" id=\"mvLista\"><\/span>\n          <div class=\"ficha__fila\">\n            <span class=\"ficha__precio\" id=\"mv-precio\"><\/span>\n            <span class=\"ficha__off\" id=\"mvOff\"><\/span>\n          <\/div>\n          <p class=\"ficha__transferencia\" id=\"mvTransferencia\"><\/p>\n        <\/div>\n\n        <!-- Badges de Nubea para la ficha (\"junto al precio\"). -->\n        <div class=\"nb-badges\" id=\"mvNubeaBadges\" hidden><\/div>\n\n        <!-- El envio gratis es un beneficio minorista: la linea aparece solo\n             para ese segmento, la maneja abrirVista(). -->\n        <p class=\"ficha__envio\" id=\"mvEnvio\" hidden><\/p>\n\n        <div class=\"ficha__compra\">\n          <div class=\"qty\" id=\"mvQty\">\n            <button type=\"button\" data-d=\"-1\">-<\/button>\n            <input class=\"qty-campo\" type=\"text\" inputmode=\"numeric\" autocomplete=\"off\"\n                   value=\"1\" aria-label=\"Cantidad\">\n            <button type=\"button\" data-d=\"1\">+<\/button>\n          <\/div>\n          <button class=\"add\" id=\"mv-add\">Agregar al carrito<\/button>\n        <\/div>\n\n        <!-- Agrega este producto y abre el carrito, sin pasar por la tienda.\n             Antes se llevaba SOLO este producto y se iba derecho a /comprar/,\n             que con la landing cargada dejaba el resto afuera; por eso habia\n             que esconderlo. Ahora suma al carrito como cualquier otro boton,\n             asi que puede estar siempre. -->\n        <button class=\"ficha__rapida\" id=\"mvRapida\" type=\"button\">\n          Comprar ahora<\/button>\n\n        <!-- Bloques de Nubea: garantia, envio y los que el cliente sume. -->\n        <div class=\"nb-bloques\" id=\"mvNubeaBloques\" hidden><\/div>\n\n        <div class=\"envio-caja\" id=\"mvEnvioCaja\">\n          <h4>Información de envío<\/h4>\n          <div class=\"envio-fila\"><span class=\"envio-ico\">🚚<\/span>\n            <b>Envío<\/b><span class=\"envio-val\" id=\"mvEnvioPlazo\"><\/span><\/div>\n          <div class=\"envio-fila\"><span class=\"envio-ico\">⏱<\/span>\n            <b>Despacho<\/b><span class=\"envio-val\" id=\"mvEnvioDespacho\"><\/span><\/div>\n        <\/div>\n\n        <!-- Los distintivos de la marca, en el mismo bloque de confianza. -->\n        <div class=\"distintivos\">\n          <div><span class=\"distintivo-ico\">☘<\/span><span>Productos orgánicos y vegetales<\/span><\/div>\n          <div><span class=\"distintivo-ico\">✦<\/span><span>Fabricación propia y diaria<\/span><\/div>\n          <div><span class=\"distintivo-ico\">★<\/span><span>Elegido por profesionales<\/span><\/div>\n        <\/div>\n      <\/div>\n\n      <!-- ══ La descripcion, debajo de la foto ══\n           La columna de la derecha es mucho mas larga que la galeria, asi que\n           aca quedaba un hueco blanco grande. Lo llenan la descripcion y la\n           ficha tecnica.\n\n           Va como tercera celda de la grilla, no dentro de la galeria: asi en\n           celular, con una sola columna, cae DESPUES del boton de compra. Si\n           estuviera dentro de la galeria quedaria entre la foto y el precio, y\n           empujaria la compra fuera de pantalla. -->\n      <div class=\"ficha__info\" data-anima>\n        <h4>Descripción<\/h4>\n        <p id=\"mv-carac\"><\/p>\n        <button type=\"button\" class=\"ficha__vermas-desc\" id=\"mvVerDesc\"\n                aria-controls=\"mv-carac\" aria-expanded=\"false\" hidden><\/button>\n        <dl class=\"ficha__ficha-tecnica\">\n          <div><dt>Ideal para<\/dt><dd id=\"mv-ideal\"><\/dd><\/div>\n          <div><dt>Presentación<\/dt><dd id=\"mv-pres\"><\/dd><\/div>\n          <div><dt>Uso<\/dt><dd id=\"mv-uso\"><\/dd><\/div>\n        <\/dl>\n      <\/div>\n    <\/div>\n\n    <div class=\"ficha__descripcion\" data-anima>\n      <!-- Combos que sirven para lo mismo. Van acá, con el cliente decidiendo,\n           para que pueda sumarlos sin volver al inicio. -->\n      <section class=\"ficha__combos\" id=\"mvCombosCaja\" hidden>\n        <h4>Combos para lo mismo<\/h4>\n        <p class=\"ficha__combos-sub\">Salen menos que comprar los productos por separado.<\/p>\n        <div class=\"ficha__combos-lista\" id=\"mvCombos\"><\/div>\n      <\/section>\n\n      <!-- Reseñas del producto -->\n      <section class=\"ficha__resenas\">\n        <div class=\"ficha__resenas-cab\">\n          <h4>Reseñas de clientes<\/h4>\n          <button type=\"button\" class=\"vermas vermas--chico\" id=\"mvEscribir\">Escribir reseña<\/button>\n        <\/div>\n        <div id=\"mvResenas\"><\/div>\n      <\/section>\n\n\n      <!-- El bloque \"Compra protegida / Cambios y devoluciones / Elaboracion\n           propia\" se retiro de aca. La politica de devolucion no se pierde:\n           esta en las preguntas de abajo, que es donde el cliente la busca. -->\n\n      <!-- Las mismas preguntas del inicio: son sobre envios, pagos y\n           devoluciones, asi que valen igual para cualquier producto. Acá\n           evitan que el cliente tenga que cerrar la ficha para resolverlas. -->\n      <section class=\"ficha__faq\">\n        <h4>Preguntas frecuentes<\/h4>\n        <div class=\"faq\" id=\"mvFaq\"><\/div>\n      <\/section>\n    <\/div>\n  <\/div>\n<\/div>\n\n\n<!-- ══ 9 + 18 · TIMELINE Y CARRITO, FIJOS AL PIE ══\n     Un solo elemento: la barra aparece recien cuando hay algo en el carrito y\n     lleva el progreso hacia los beneficios adentro. -->\n<!-- Nubea dibuja su barra de envio gratis solo si NO encuentra este\n     contenedor. En la landing la barra que vale es la de abajo, que cuenta el\n     carrito de la landing; la de Nubea cuenta el de la tienda y daba otro numero.\n     El umbral y los textos de Nubea los usa igual la barra de abajo. -->\n<div data-free-shipping-bar-container data-landing hidden><\/div>\n<div class=\"barra-fija\" id=\"barraFija\">\n  <div class=\"bf-timeline\">\n    <!-- En celular las etiquetas salen de arriba de los puntos y se reparten\n         en tres columnas iguales acá. Lo llena pintarHitos(). -->\n    <div class=\"tl-etiquetas\" id=\"tlEtiquetas\" aria-hidden=\"true\"><\/div>\n    <div class=\"tl-pista\" id=\"tl-pista\"><i id=\"tl-fill\"><\/i><\/div>\n  <\/div>\n  <div class=\"bf-row\">\n    <span class=\"bf-cant\" id=\"bfCant\">0<\/span>\n    <div class=\"bf-info\">\n      <span class=\"bf-monto\" id=\"bfMonto\">$0<\/span>\n      <span class=\"bf-msg\" id=\"bfMsg\">Seguí sumando<\/span>\n    <\/div>\n    <button class=\"bf-ir\" id=\"bfIr\">Pasar al carrito →<\/button>\n  <\/div>\n<\/div>\n\n<!-- ══ TRASPASO AL CARRITO DE TIENDANUBE ══ -->\n<!-- Cambiar de tipo de compra vacia el carrito, porque los precios, los\n     minimos y hasta que productos existen son otros. Nunca en silencio. -->\n<div class=\"hab-modal hab-modal--chico\" id=\"modalSegmento\">\n  <div class=\"modal-caja\" role=\"alertdialog\" aria-labelledby=\"segAvisoTit\">\n    <div class=\"modal-cuerpo\">\n      <h3 id=\"segAvisoTit\"><\/h3>\n      <p class=\"seg-aviso__txt\" id=\"segAvisoTxt\"><\/p>\n      <!-- Los productos que no viajan al segmento nuevo, cuando los hay. -->\n      <div class=\"seg-aviso__caja\" id=\"segAvisoCaja\" hidden>\n        <b id=\"segAvisoCajaTit\"><\/b>\n        <ul id=\"segAvisoLista\"><\/ul>\n      <\/div>\n      <div class=\"seg-aviso__botones\">\n        <button type=\"button\" class=\"carrito__seguir\" id=\"segAvisoNo\"><\/button>\n        <button type=\"button\" class=\"carrito__ir\" id=\"segAvisoSi\"><\/button>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n\n<!-- Cambio 3: el mayorista o el distribuidor suma productos que su lista no\n     publica, a precio de lista, SIN dejar de ser mayorista. -->\n<div class=\"hab-modal\" id=\"modalMinorista\">\n  <div class=\"modal-caja modal-caja--carrito\">\n    <button class=\"modal-cerrar\" id=\"minoCerrar\" aria-label=\"Cerrar\">&times;<\/button>\n    <div class=\"modal-cuerpo\">\n      <h3 id=\"minoTit\">¿Qué producto minorista querés agregar?<\/h3>\n      <p class=\"seg-aviso__txt\" id=\"minoSub\"><\/p>\n      <label class=\"buscador__campo mino__campo\">\n        <span class=\"buscador__lupa\" aria-hidden=\"true\">🔍<\/span>\n        <input type=\"search\" id=\"minoBuscar\" autocomplete=\"off\"\n               placeholder=\"Buscar por nombre...\">\n      <\/label>\n      <div class=\"mino__lista\" id=\"minoLista\"><\/div>\n    <\/div>\n  <\/div>\n<\/div>\n\n<div class=\"hab-modal\" id=\"modalCheckout\">\n  <div class=\"modal-caja modal-caja--carrito\">\n    <button class=\"modal-cerrar\" id=\"checkoutCerrar\" aria-label=\"Cerrar\">&times;<\/button>\n    <div class=\"modal-cuerpo carrito\">\n      <h3 class=\"carrito__tit\" data-anima>Tu compra<\/h3>\n      <ul class=\"carrito__items\" id=\"checkoutLista\" data-anima><\/ul>\n\n      <div class=\"carrito__cuentas\" data-anima>\n        <div class=\"carrito__fila\"><span>Subtotal<\/span><b id=\"checkoutTotal\">$0<\/b><\/div>\n        <div class=\"carrito__fila\"><span>Envío<\/span><b id=\"checkoutEnvio\"><\/b><\/div>\n      <\/div>\n      <p class=\"carrito__beneficio\" id=\"checkoutBeneficio\"><\/p>\n      <!-- Mayorista y distribuidor tienen monto minimo. Por debajo, el boton\n           de finalizar queda apagado y acá se dice por qué. -->\n      <p class=\"carrito__bloqueo\" id=\"checkoutBloqueo\" hidden><\/p>\n\n      <div class=\"carrito__botones\" data-anima>\n        <button class=\"carrito__seguir\" id=\"checkoutSeguir\" type=\"button\">Seguir comprando<\/button>\n        <button class=\"carrito__ir\" id=\"checkoutIr\" type=\"button\">Finalizar compra<\/button>\n      <\/div>\n      <p class=\"carrito__nota\">\n        En la tienda real este botón carga los productos con la API del propio theme\n        y te lleva a <b>/carrito<\/b>. De ahí en adelante todo es Tiendanube:\n        envío, medios de pago y checkout, sin que toquemos nada.<\/p>\n    <\/div>\n  <\/div>\n<\/div>\n\n<!-- anime.js va servido desde el propio sitio, no desde un CDN: una landing\n     de venta no puede quedar colgada de que responda un tercero. Son 17 KB.\n     Si aun asi no cargara, el codigo de abajo lo detecta y todo funciona sin\n     animacion, sin esconder nada. -->\n";
    destino.innerHTML = '';
    destino.appendChild(caja);

    /* 3 bis · A todo el ancho. El theme envuelve la pagina en .container, que
       tiene max-width y aire a los costados, y la landing quedaba en una
       columna angosta entre dos margenes blancos. Sus bandas de color estan
       hechas para llegar al borde -- la columna centrada la pone .wrap, dos
       niveles mas adentro.

       Se mide y se sangra en vez de usar 100vw: 100vw incluye la barra de
       scroll, que en este equipo son 15px, y la landing terminaba corrida
       medio pixel a la izquierda y cortada a la derecha. clientWidth no la
       incluye. Se mide el PADRE, que no depende de estos margenes, asi que
       recalcular no se muerde la cola. */
    function aTodoElAncho() {
      var ancho = document.documentElement.clientWidth;
      /* Sin ancho todavia no se fija nada. Pasa con una pestaña que carga sin
         mostrarse o un navegador de app (Instagram, Facebook) que todavia no
         pinto: clientWidth da 0, la landing quedaba en width 0 -- tarjetas de
         34px -- y asi seguia hasta el proximo resize. Se deja el ancho natural
         del contenedor y se vuelve a medir cuando haya uno de verdad. */
      if (!ancho) {
        caja.style.width = caja.style.marginLeft = caja.style.marginRight = '';
        return;
      }
      var r = destino.getBoundingClientRect();
      caja.style.width = ancho + 'px';
      caja.style.marginLeft = (-r.left) + 'px';
      caja.style.marginRight = (r.right - ancho) + 'px';
    }
    aTodoElAncho();

    var reloj;
    var remedir = function () {
      clearTimeout(reloj);
      reloj = setTimeout(aTodoElAncho, 120);
    };
    window.addEventListener('resize', remedir);
    window.addEventListener('pageshow', remedir);
    document.addEventListener('visibilitychange', remedir);
    /* Y si el ancho cambia sin que llegue un resize -- navegadores de app,
       pestañas que se muestran --, lo ve el observador. Solo cuenta el ancho:
       el alto de la pagina cambia todo el tiempo y no es motivo. */
    if ('ResizeObserver' in window) {
      var anchoVisto = -1;
      new ResizeObserver(function () {
        var w = document.documentElement.clientWidth;
        if (w !== anchoVisto) { anchoVisto = w; remedir(); }
      }).observe(document.documentElement);
    }

    /* 4 · Los popups y la barra de compra salen al <body>. Adentro de un
       contenedor con `transform` -- y los carruseles del theme tienen --
       `position:fixed` deja de ser fijo y la barra se pierde a mitad de la
       pagina. Se llevan envueltos en la misma clase para que su CSS siga
       aplicando. */
    var flotante = document.createElement('div');
    flotante.className = ENVOLTORIO;
    document.body.appendChild(flotante);
    var sueltos = caja.querySelectorAll('.hab-modal, .barra-fija');
    for (var i = 0; i < sueltos.length; i++) flotante.appendChild(sueltos[i]);

    clearTimeout(red);
    destapar();

    /* 5 · anime.js primero -- el guion lo usa para las animaciones y tiene red
       propia si no llega -- y despues la landing. */
    var lib = document.createElement('script');
    lib.src = 'https://mind-trade-profit.github.io/Habitad_landing/js/anime.min.js';
    lib.onload = lib.onerror = arrancar;
    document.head.appendChild(lib);
  });

  function arrancar() {
    try {
      encender();
    } catch (e) {
      if (window.console) console.error('[landing] no arranco:', e);
      destapar();
    }
  }

  function encender() {

/* ===========================================================================
   Datos REALES de la API de administracion, 25/08/2026.
   Nombres tal cual el catalogo, con sus sufijos de segmento, para que se vea
   lo que hay que limpiar antes de lanzar.
   =========================================================================== */

/* 9 · HITOS. Configurables, nunca hardcodeados en la vista.
   Hoy solo el de $60.000 existe de verdad en la tienda. */
/* 9 · HITOS POR SEGMENTO
   Un mayorista con minimo de compra de $100.000 no puede ver una barra que
   celebra a los $30.000: el hito tiene que arrancar en su minimo real. Cada
   segmento tiene su propia escalera. Configurable, nunca en la vista. */
const TIERS_POR_SEGMENTO = {
  /* Beneficios definidos por el cliente. El envio gratis es SOLO minorista:
     mayorista y distribuidor no lo tienen, por eso no figura en sus escaleras
     ni aparece despues en el resumen de compra, que se arma desde aca. */
  minorista: [
    /* Los montos los subio el cliente el 25/09/2026. El hito del 6% por
       transferencia se saco: prometia algo distinto de lo que cobra el
       checkout -- la tienda da 5% en todo el catalogo y sin minimo -- y quedo
       reemplazado por las tres cuotas. */
    {min:50000,  nombre:'2 cuotas sin interés',   real:true},
    {min:60000,  nombre:'Envío gratis',           real:true},
    {min:100000, nombre:'3 cuotas sin interés',   real:true}
  ],
  /* Los dos regalos los entrega un CUPON de la tienda, no la landing: aca
     solo se anuncian. Se probo agregarlos solos al carrito y se descarto,
     porque del otro lado no existe el precio 0 y el cliente los pagaria. */
  mayorista: [
    {min:100000, nombre:'Mínimo mayorista',       real:true},
    /* Promocion 806521 de la tienda: envio gratis desde $150.000 sobre las
       categorias mayorista y distribuidor. Es real y estaba sin anunciar. */
    {min:150000, nombre:'Envío gratis',           real:true},
    {min:200000, nombre:'2 perfumes de regalo',   real:true},
    {min:280000, nombre:'Prioridad de envío',     real:true}
  ],
  distribuidor: [
    /* El envio gratis del distribuidor arranca en $150.000, por debajo de su
       minimo de compra: cuando llega a los $250.000 ya lo tiene. Por eso van
       anunciados juntos, en vez de inventar un hito que nunca esta solo. */
    {min:250000, nombre:'Mínimo distribuidor + envío gratis', real:true},
    {min:320000, nombre:'Prioridad de envío',     real:true},
    {min:380000, nombre:'Gel criogénico de regalo', real:true}
  ]
};

/* Desde cuanto es gratis el envio, por segmento. El minorista lo manda Nubea
   (su barra de envio gratis es la promocion 765333); los otros dos salen de la
   promocion 806521, que la landing no puede leer sola porque la API publica no
   la expone. Si el cliente cambia esos montos en el panel, se cambian aca. */
const ENVIO_GRATIS = {minorista: 60000, mayorista: 150000, distribuidor: 150000};
const umbralEnvioDe = seg => seg === 'minorista'
  ? (typeof nubea !== 'undefined' && nubea ? nubea.umbralEnvio() : ENVIO_GRATIS.minorista)
  : (ENVIO_GRATIS[seg] || ENVIO_GRATIS.mayorista);

let TIERS = TIERS_POR_SEGMENTO.minorista;

/* 5 · SEGMENTOS. En la tienda real los resuelve Tiendanube con sus tablas de
   precios; acá se simula el multiplicador solo para ver el efecto. */
const SEGMENTOS = {
  minorista:    {label:'Minorista',    mult:1,   off:0},
  mayorista:    {label:'Mayorista',    mult:.80, off:20},
  distribuidor: {label:'Distribuidor', mult:.70, off:30}
};
let segmento = 'minorista';

const NECESIDADES = [
  {id:'dolor',label:'Dolor y movilidad',n:40},   {id:'descanso',label:'Descanso y calma',n:19},
  {id:'piel',label:'Piel y cabello',n:35},       {id:'defensas',label:'Defensas',n:20},
  {id:'cardiovascular',label:'Corazón y presión',n:18}, {id:'respiracion',label:'Respiración',n:10},
  {id:'digestion',label:'Digestión',n:9},        {id:'hongos',label:'Hongos',n:7},
  {id:'femenino',label:'Cuidado femenino',n:8},  {id:'corporal',label:'Cuidado diario',n:14},
  {id:'aromas',label:'Aromas y ambiente',n:43},  {id:'packs',label:'Packs y combos',n:27,destacado:true}
];

/* Descuento por pagar con transferencia. VERIFICADO contra la tienda: tres
   productos al azar dan exactamente el 95% del precio publicado ($132.000 ->
   $87.780 sobre el precio con 30% off; $18.900 -> $17.955; $9.750 ->
   $9.262,50), o sea 5%, y sin monto minimo.

   El brief pide "6% desde $90.000" y lo deja a confirmar. Hasta que la tienda
   lo cambie, la landing muestra 5%: de las dos opciones, prometer 6% y cobrar
   5% en el checkout es la unica que rompe la compra en el ultimo paso. */
const TRANSFERENCIA = 5;

/* ── Las reseñas las maneja Nubea ──
   La tienda tiene DOS apps de reseñas instaladas y solo una funciona:

     · **Avalie** (`avalie.meuarquivodigital.com`) esta con el plan sin pagar.
       Contesta «Necessário pagar o plano para ter acesso» para todos los
       productos, asi que su pagina abre en blanco y su bloque `#reviewsapp`
       queda vacio hasta en las fichas propias de Tiendanube. **No se usa.**
     · **Nubea** es la que anda: es la misma app que ya nos da los badges y los
       bloques de ficha. Su widget de reseñas se carga en el inicio de la tienda
       con `onfirstinteraction` y es el que el cliente ve funcionando.

   De aca salen las reseñas que muestra la ficha. Escribir una se hace en la
   ficha de la tienda, porque el widget de Nubea necesita `LS.product` o el
   formulario de producto del theme, y en /catalogos no existe ninguno de los
   dos. */
const RESENAS_API = 'https://api.nubea.com.ar/product-reviews/public';

/* CATALOGO REAL - 145 productos de habitadnatural.com.
   Cada uno con los precios de las publicaciones que la tienda tiene para
   cada segmento: pr.minorista / pr.mayorista / pr.distribuidor. Un producto
   solo aparece en un segmento si existe esa publicacion. */
const PRODUCTOS = [
  {"n": "7 Chakras sagrada madre", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/sahumerios-proo-2-c5ff97e64a18daf8de17408345402104-640-0.webp", "d": "7 Chakras | Bombas Defumadoras\n|| Buena Defumación || Se conserva Bien en el ambiente\nPuntos 7 chakras:\nMuladhara, el chakra raíz\nSua adhisthana, el chakra sacral\nManipura, el chakra del plexo solar:\nAnahata, el chakra corazón:\nVishuddha, el chakra de la garganta:\ngña-akhia, el chakra del tercer ojo:\nSahasrara, el chakra corona\nAnte cualquier duda pueden conectarse con nosotros por la via mail en la seccion de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertosformas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["aromas"], "pr": {"minorista": 1800, "mayorista": 1800}, "st": {"minorista": false, "mayorista": false}, "ids": {"minorista": 229337647, "mayorista": 232205841}, "mangos": {"minorista": "7-chakras-sagrada-madre", "mayorista": "7-chakras-sagrada-madre1"}},
  {"n": "Aceite Cannabidol Medicinal 86 % CBD", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-cannabidol-b36ab5ef5a02afb0c117577873453992-640-0.webp", "d": "Aceite Cannabidol Medicinal\nEl cannabidol medicinal de alto porcentaje (86% ) es usado para patologías crónicas como fibromialgia , artrosis reumatoidea, problemas en huesos tendones rectificaciones cervicales hernias discales y rodillas ciatico lumbar artritis en manos diabetes ansiedad trastornos de panico e insomnio\nComo se toma:\nel de 86% es vehículo en aceite de impacto directo sublingual\nen epilepsia 1 gota sublingual\nen problemas neuronales 1 gota\nen trastorno de ansiedad 3 gotas\nniños con hiperactividad 1 gota\nartrosis artritis ,reumatoide, 3 a 6 gotas- dosis autoevaluativa\nfibromialgia 10 gotas\ncáncer 10 gotas se podría repetir dosis en el día según cada caso a evaluación\nLa dosis es siempre autoevaluativa ya que cada caso es distinto. Todos tenemos sistemas inmunes diferentes y eso modifica el impacto inmune.\nEs preciso la autoevaluacion ya que compara con la tabla anunciada pede ser que para mismo caso a tratar lleve menos o mas gotas por dosis", "necs": ["descanso"], "pr": {"minorista": 30000}, "st": {"minorista": false}, "ids": {"minorista": 229337695}, "rat": {"n": 3, "avg": 4.0}, "vend": "+150 vendidos"},
  {"n": "Aceite de Almendras para Nutrición e Hidratación – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-almendras-catalogo-7b18f6074211f2e88717803556802078-640-0.webp", "d": "Aceite De Almendras Por 30 ml\nPrincipales beneficios del aceite de almendras:\nEs un excelente hidratante.\nControla el eccema o el acné.\nTiene cualidades emolientes.\nEs un producto desinflamatorio.\nAlivia el herpes.\nSuaviza la piel.\nTrata la psoriasis, la irritación y la dermatitis.\nAlivia las erupciones cutáneas\nEste producto puede usarse de forma directa sobre piel y uñas, tambien como principio activo para fabricar cosmetica cremas o geles", "necs": ["dolor", "piel"], "pr": {"minorista": 8400, "mayorista": 6720}, "st": {"minorista": true, "mayorista": true}, "ids": {"minorista": 229338109, "mayorista": 229338111}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-almendras-catalogo-7b18f6074211f2e88717803556802078-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-7d8014be3e43f15a5017803556874934-480-0.webp"], "vend": "+20 vendidos", "mangos": {"minorista": "aceite-de-almendras-por-30-cc-habitad-natural", "mayorista": "aceite-de-almendras-por-30-cc-habitad-naturalpublicacion-mayorista"}},
  {"n": "Aceite de Caléndula para el Cuidado de la Piel – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-calendula-catalogo-4e7c477c5b400949b317803532107206-640-0.webp", "d": "ACEITE ORGANICO DE CALENDULA EN FLORES 30cc\nPrincipales beneficios del aceite de flores puras de calendula\nEs un excelente hidratante.\nControla el eccema o el acné.\nTiene cualidades emolientes.\nEs un producto desinflamatorio.\nAlivia el herpes.\nSuaviza la piel.\nTrata la psoriasis, la irritación y la dermatitis.\nAlivia las erupciones cutáneas\nsirve para pequeñas rosaceas\nquemaduras de primer grado\nmodo de uso:\ncolocar sobre piel en forma directa , masajear suave en forma circular\ntambien sirve como principio activo para agregar en cremas o fabricar cosmetica artesanal", "necs": ["piel"], "pr": {"mayorista": 6400, "minorista": 8000}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 229338099, "minorista": 229337980}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-calendula-catalogo-4e7c477c5b400949b317803532107206-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-dcea1554f358f3dbb217803532227299-480-0.webp"], "vend": "+60 vendidos", "mangos": {"mayorista": "aceite-de-calendula-de-cultivo-organico-vegetal-por-30-mlm-mayotista-solo-si-cubre-monto-mayorista", "minorista": "aceite-de-calendula-de-cultivo-organico-vegetal-por-30-mlm"}},
  {"n": "Aceite De Cannabidol BUENOS RESULTADOS Cepa Satiba", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/flyer_cbd_logo_transparent-2ed5ae5ea1bf1277a517575168915584-640-0.webp", "d": "Aceite De Cannabidol Cepa Satiba\nComo se toma:\nEl vehículo en aceite de impacto directo sublingual en epilepsia 2 gota sublingual en problemas neuronales 1-2 gota en trastorno de ansiedad 3-6 gotas niños con hiperactividad 1 gota artrosis artritis ,reumatoide, 5 a 10 gotas- dosis autoevaluativa fibromialgia 10 gotas cáncer 10 gotas se podría repetir dosis en el día según cada caso a evaluación\nLa dosis es siempre autoevaluativa ya que cada caso es distinto. Todos tenemos sistemas inmunes diferentes y eso modifica el impacto inmune.\nEs preciso la autoevaluacion ya que compara con la tabla anunciada pede ser que para mismo caso a tratar lleve menos o mas gotas por dosis", "necs": ["descanso"], "pr": {"minorista": 20000}, "st": {"minorista": false}, "ids": {"minorista": 229337998}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/flyer_cbd_logo_transparent-2ed5ae5ea1bf1277a517575168915584-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/sello-habitad-100-natural-863d8a77335cd467da17575168930884-480-0.webp"], "vend": "+80 vendidos"},
  {"n": "Aceite De Coco Vehicular para sesiones de masajes X 30 Mlm", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-coco-catalogo-596c5723f38f2c20bf17803561172298-640-0.webp", "d": "Aceite de coco vehicular para masajes descontracturantes\nIdeal para masajes descontracturantes\nEn aromaterapia el coco es de estimulacion de la energia vital es por eso que se obtiene un combo perfecto entre aroma estimulacion vital y relajacion\nAnte cualquier duda pueden conectarse con nosotros por la via mail en la seccion de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nProducto de uso topico\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["dolor"], "pr": {"minorista": 6000}, "st": {"minorista": true}, "ids": {"minorista": 229337969}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-coco-catalogo-596c5723f38f2c20bf17803561172298-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-80d8298d9755dc177a17803561242062-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "aceite-de-coco-vehicular-para-sesiones-de-masajes-x-30-mlm"}},
  {"n": "Aceite de Jarilla Orgánico para Masajes y Bienestar Articular – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-jarilla-catalogo-27688f754973f4270917803587346540-640-0.webp", "d": "Aceite Orgánico de Jarilla x 30cc\nDescubrí el poder natural del Aceite de Jarilla , un aceite de prensa en frío, 100% orgánico y equilibrado, ideal para uso tópico y cosmético. Proveniente de Habitad Natural, este aceite es un aliado esencial para el cuidado de tu piel y cabello.\nPropiedades y Beneficios\nRegenera la piel, ayudando a recuperar su vitalidad y salud natural.\nAlivia irritaciones y sensaciones de incomodidad, proporcionando un efecto calmante.\nProtege contra daños externos, formando una barrera natural que mantiene la hidratación.\nUsos recomendados\nEste aceite es perfecto para uso tópico y puede incorporarse en la elaboración de shampoos y otros productos cosméticos caseros, potenciando sus beneficios naturales gracias a su pureza y calidad orgánica.\nCaracterísticas del producto\nPresentación: frasco de 30cc.\nMétodo de extracción: prensado en frío, que conserva todas las propiedades activas del aceite.\nOrigen: aceite 100% orgánico, libre de químicos y aditivos sintéticos.\n¿Por qué elegir Aceite de Jarilla de Habitrad Natural?\nEste aceite ofrece una experiencia única para quienes buscan un producto natural que equilibre, regenere y proteja la piel y el cuero cabelludo. Su fórmula artesanal y orgánica garantiza la máxima pureza y eficacia.\nIncorporá el Aceite Orgánico de Jarilla a tu rutina diaria y sentí la diferencia de un cuidado natural, profundo y efectivo.", "necs": ["dolor"], "pr": {"minorista": 10100, "distribuidor": 7070, "mayorista": 8000}, "st": {"minorista": true, "distribuidor": true, "mayorista": true}, "ids": {"minorista": 338877630, "distribuidor": 341343378, "mayorista": 341343331}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1e70300b-81dd-491d-8958-ca7b8e38f8eb-0025dd3ec98ef9ac1917764610594620-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-jarilla-catalogo-27688f754973f4270917803587346540-480-0.webp"], "mangos": {"minorista": "aceite-organico-de-jarilla-x-30cc-jnx3d", "distribuidor": "aceite-organico-de-jarilla-x-30cc-mayorista-11sce", "mayorista": "aceite-organico-de-jarilla-x-30cc-mayorista-ale6k"}},
  {"n": "Aceite de Jojoba para Piel y Cabello – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-jojoba-catalogo-2e80f9c268954d570217802677804794-640-0.webp", "d": "ACEITE DE JOJOBA ORGANICO 30cc\nPropiedades antiarrugas. ...\nnutre y fortalece el cabello\nBeneficios antioxidantes. ...\nregula oleseidad de la piel\nHidratación tanto de la piel como del cabello. ...\nrico aroma\nEfectos antienvejecimiento. ..\nRegulación de la segregación de grasa. ..\nEfectos antiacné ..\nEfecto regenerador.\nESTE PRODUCTO ES DE USO TOPICO PARA PIELES, Y CABELLOS\nEste producto tiene su explicacion en el dorso del frasco", "necs": ["dolor", "piel"], "pr": {"mayorista": 6700, "minorista": 8400}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 229338098, "minorista": 229337981}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-jojoba-catalogo-2e80f9c268954d570217802677804794-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-590e0caeb8d523601617802679154411-480-0.webp"], "vend": "+60 vendidos", "mangos": {"mayorista": "aceite-de-jojoba-por-30-mlm-mayorista-solo-si-cubre-monto-mayorista", "minorista": "aceite-de-jojoba-por-30-mlm-rico-aroma"}},
  {"n": "Aceite de Lavanda para el Bienestar y la Relajación – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-lavanda-catalogo-f34acfeefeace70a9917805023618730-640-0.webp", "d": "ACEITE DE CULTIVO ORGANICO LAVANDAS\nConocido por sus propiedades calmantes, se ha utilizado durante siglos de diversas maneras para ayudar a calmar y equilibrar. Con un aroma rico y calmante, el Aceite de Lavanda se utiliza a menudo para ayudar a relajar los sentidos antes de acostarse.\n¿Qué hace el aceite de lavanda en la piel?\nEl aceite de lavanda puede beneficiar la piel de muchas maneras. Tiene la capacidad de disminuir el acné, ayudar a igualar el tono de la piel y atenuar las líneas finas y las arrugas. Además, el aceite de lavanda tiene otros usos, como mejorar la salud del cabello y favorecer la digestión.\nESTE ACEITE NO ES DE INGESTA, SOLO DE USO CORPORAL\nSe coloca para equilibrar los estados de animo en puntos energeticos como en la sien , la nuca ,muñecas de las manos y tambien se puede ayudar colocando debajo de la fosa nasal\nEste aceite no te causara ardor ni irritación en la piel por ser de cultivo orgánico no invasivo. Te permite trabajar sin consecuencias negativas a diferencia de un aceite esencial\nRECORDATORIO: Este aceite no es para preparar jabones.\nEste producto tiene su explicacion en el dorso del frasco\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["dolor", "descanso", "piel"], "pr": {"minorista": 8000, "mayorista": 6400, "distribuidor": 5600}, "st": {"minorista": true, "mayorista": true, "distribuidor": true}, "ids": {"minorista": 229337977, "mayorista": 229338101, "distribuidor": 358890828}, "rat": {"n": 2, "avg": 4.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-lavanda-catalogo-f34acfeefeace70a9917805023618730-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-f26f75ddf6101bba2e17805023719821-480-0.webp"], "vend": "+50 vendidos", "mangos": {"minorista": "aceite-de-flores-lavanda-de-cultivo-organico-por-30-mlm", "mayorista": "aceite-de-lavanda-de-cultivo-organico-por-30-mlm-publicacion-mayorista", "distribuidor": "aceite-de-lavanda-para-el-bienestar-y-la-relajacion-30-ml-venta-minorista-copia-1k1qb"}},
  {"n": "Aceite de Lino Orgánico con Omega 3 para Elasticidad y Fortalecimiento – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-lino-catalogo-9d5a2e36f68c44280e17803574452368-640-0.webp", "d": "Aceite Orgánico de Lino x 30cc – un producto natural esencial para el cuidado personal y cosmético. Este aceite, obtenido por prensado en frío , conserva todas sus propiedades nutritivas y es rico en omega 3 , conocido por su poder hidratante, reparador y fortalecedor.\nPresentado en un frasco de 30cc con incerto gotero, permite una aplicación precisa y cómoda. Es ideal para untar sobre las puntas o la mitad del cabello , mejorando la elasticidad, el brillo y fortaleciendo cada hebra, además de prevenir el daño y la sequedad.\nTambién puede usarse como principio activo en la elaboración de cremas y shampoos , potenciando sus beneficios nutritivos y protectores. Su fórmula 100% orgánica garantiza un cuidado natural y efectivo para la piel y el cabello.\nUn aliado indispensable para quienes buscan productos naturales de alta calidad y múltiples usos en su rutina de belleza y cuidado personal.", "necs": ["piel"], "pr": {"minorista": 10100}, "st": {"minorista": true}, "ids": {"minorista": 338830064}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/5965bcb1-9347-4968-88d3-dcb94ada1e0b-6292c44ee44b9f36d717764526429497-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-lino-catalogo-9d5a2e36f68c44280e17803574452368-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-b353865cca20b525bc17803574580277-480-0.webp"], "mangos": {"minorista": "aceite-organico-lino-x-30cc-1il1p"}},
  {"n": "Aceite de Menta para el Bienestar y la Vitalidad – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-menta-catalogo-75b86cc11d7324eb9517802635871945-640-0.webp", "d": "ACEITE DE MENTA DE CULTIVO ORGANICO 30 ml\nQUE PUEDES LOGRAR CON EL ACEITE ORGANICO DE MENTA...\nEl aceite de menta aporta una gran sensación de frescor y posee beneficios como antibacteriano, bactericida, astringente y antiséptico natural. También reduce la inflamación y el picor. Por todo ello, resulta especialmente adecuado para tratar el acné.\nPRODUCTO DE USO TOPICO - SIEN- NUCA-FOSAS NASALES\nNO ES UN ACEITE ESENCIAL-\nEste producto tiene su explicacion en el dorso del frasco", "necs": ["respiracion"], "pr": {"mayorista": 5000, "distribuidor": 5600, "minorista": 7500}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 229338102, "distribuidor": 330187544, "minorista": 229337976}, "vend": "+30 vendidos", "mangos": {"mayorista": "aceite-de-menta-de-cultivo-organico-30-mlm-mayorista-solo-si-cubre-monto-mayorista", "distribuidor": "aceite-de-menta-de-cultivo-organico-30-mlm-negocios-distribuidor-d1xq5", "minorista": "aceite-de-menta-de-cultivo-organico-30-mlm"}},
  {"n": "Aceite de Orégano Orgánico – 30 ml - Producto elaborado con materias primas seleccionadas./venta por unidad", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/fc3013aa-e6cf-4a58-bb59-97f5ac32a795-9df82b5e9834dc45d817801551269213-640-0.webp", "d": "ACEITE DE OREGANO ORGANICO PRENSADO EN FRIO\nEl Orégano refuerza sistema inmune, levanta las defensas cont. vitamina A,B,C,D,K,Y\nEs muy bueno para ayudar en mujeres con problemas hormonales\nTrabaja la cándida\nEs microbacteriano\nAyuda en el agotamiento y fatiga muscular\nRegula periodo menstrual\nAyuda en inflamación de intestinos\nCombate gases y flatulencias\nayuda a regular situaciones hormonales en la mujer\nEste producto es por ingesta y su dosis es autoevaluativa, quiere decir que asi como se explica en la etiqueta dorso del frasco, se toma 5 gotas sublinglual diaria si es posible en ayunas pero se debe ir autoevaluando dia a dia si debe bajar la dosis o subirla\nEste producto es fabricado de forma orgánica con un aceite vehicular de oliva virgen prensado en frio y sus plantas se cultivan en huertas orgánicas sin pesticidas ni herbicidas. sus componentes flavonoides como el carvacrol y el timol siempre en menor medida que un sintético por su forma de extracción pero de impacto no invasivo.\nEl aceite de orégano orgánico es conocido por sus propiedades medicinales y se utiliza comúnmente por sus efectos antimicrobianos, antioxidantes, y antiinflamatorios. Los componentes principales del aceite de orégano, especialmente cuando es un extracto o un oleato (un aceite infusionado con orégano), incluyen varios compuestos bioactivos.\nAnte cualquier duda pueden conectarse conn nosotros por la via mail\nEste producto tiene su explicacion en el dorso del frasco\nFormas de pago- este producto se puede pagar con todas las formas de pago\nEste producto es un seplemento dietario no reemplaza a un farmaco ni a un tratamiento farmacalógico\nante la duda cosulte a su medico", "necs": ["defensas", "digestion", "hongos"], "pr": {"mayorista": 7600, "distribuidor": 6650, "minorista": 9500}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 229338106, "distribuidor": 330186963, "minorista": 229337965}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/2581ef57-651c-4d1b-b505-fc4c1cad36d4-363e123881a7bc096117682724496885-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2fb1c216-2554-41ad-a5a2-71cd168543dd-8c1d922512c6916db617682724611961-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/fc3013aa-e6cf-4a58-bb59-97f5ac32a795-9df82b5e9834dc45d817801551269213-480-0.webp"], "vend": "+500 vendidos", "mangos": {"mayorista": "aceite-de-cultivo-organico-30-ml-oregano-publicacion-mayorista", "distribuidor": "aceite-de-cultivo-organico-30-ml-oregano-publicacion-minorista-negocios-distribuidor-7hl6y", "minorista": "aceite-de-cultivo-organico-30-ml-oregano-publicacion-minorista"}},
  {"n": "Aceite de Pepita de Uva para Hidratación y Firmeza – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-pepirta-de-uva-catalogo-7fe86bc9bc5791c6e417803539994605-640-0.webp", "d": "🌿 Beneficios del Aceite de Pepitas de Uva\n✅ Poderoso antioxidante natural\nRico en resveratrol, flavonoides y vitamina E, ayuda a combatir los radicales libres, previniendo el envejecimiento prematuro.\n💧 Hidratación profunda sin obstruir poros\nSu textura ligera penetra fácilmente, ideal para piel grasa o mixta, sin dejar sensación pesada.\n✨ Regenerador y reafirmante cutáneo\nEstimula la producción de colágeno y mejora la elasticidad de la piel, reduciendo líneas finas y estrías.\n🌱 Propiedades antiinflamatorias y cicatrizantes\nCalma irritaciones, alivia quemaduras solares y favorece la regeneración de la dermis.\n💇‍♀️ Fortalece y da brillo al cabello\nNutre el cuero cabelludo, reduce la caspa y devuelve el brillo natural al cabello seco o dañado.\n💅 Cuidado de uñas y cutículas\nFortalece las uñas frágiles y suaviza las cutículas gracias a su composición rica en ácidos grasos esenciales.\n🩸 Mejora la circulación y elasticidad vascular\nPuede colaborar en tratamientos para piernas cansadas o várices, usado en masajes tópicos", "necs": ["piel"], "pr": {"mayorista": 9500, "minorista": 9500}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 358891215, "minorista": 276353878}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-pepirta-de-uva-catalogo-7fe86bc9bc5791c6e417803539994605-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-27d975ed8b240b83ca17803540083559-480-0.webp"], "vend": "+40 vendidos", "mangos": {"mayorista": "aceite-de-pepita-de-uva-para-el-cuidado-de-la-piel-y-el-cabello-30-venta-minorista-copia-wcrss", "minorista": "aceite-de-pepitas-de-uva"}},
  {"n": "Aceite de Romero para el Bienestar Diario – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/762d7a0b-df53-400f-8093-18f6c5639a17-f06cdc9f2b6adaeafa17802665345672-640-0.webp", "d": "ACEITE DE ROMERO DE CULTIVO ORGANICO 30CC\n¿Qué beneficios tiene el aceite de romero?\nEs importante saber para qué sirve y cuándo se debe de aplicar y cuando no. En el caso del aceite de romero, sabemos que este tiene propiedades antibacterianas y antisépticas, astringentes y desinfectantes, cicatrizantes, antiinflamatorias, analgésicas y digestivas. Y más específicamente, ayuda desde controlar la grasa y la caspa del cuero cabelludo, hasta retrasar el envejecimiento y mejorar el acné, o incluso aliviar contracturas y dolores musculares.\n‘Este aceite puede ayudar a la arteriosclerosis, bronquitis, escalofríos, resfriados, colitis, cistitis, dispepsia, agotamiento nervioso, sistema inmunológico (estimular), otitis, palpitaciones, prevenir infecciones respiratorias, acidez estomacal, enfermedades relacionadas con el estrés’.\nAdemás, la Biblioteca Nacional de Medicina (NIH) establece que ‘el romero tiene importantes propiedades antimicrobianas, antiinflamatorias, antioxidantes, antiapoptóticas, antitumorales, antinociceptivas y neuroprotectoras. También, muestra relevantes efectos clínicos sobre el estado de ánimo, el aprendizaje, la memoria, el dolor, la ansiedad y el sueño’. Gracias a sus múltiples beneficios, este elemento ha tomado el podium como uno de los mejores ingredientes naturales para la salud y la belleza.\n¿Qué hace el aceite de romero en la piel?\nLos expertos recomiendan utilizar aceite de romero, 100% natural y de presión en frío. Su uso en la piel ayuda a frenar el envejecimiento, reduciendo la apariencia de arrugas y líneas de expresión, y aportando firmeza y elasticidad. También es un componente calmante que ayuda a batallar problemas dermatológicos como la dermatitis y el acné, pues sus beneficios astringentes, antibacterianos y antiinflmatorios permiten controlar los excesos de grasa y reducir la apariencia de granos y espinillas.\nESTE PRODUCTO SE PUEDE USAR COMO PRINCIPIO ACTIVO PARA FABRICAR COSMETICA , POR SU ORIGEN VEGETAL Y ORGANICO", "necs": ["dolor", "digestion"], "pr": {"mayorista": 6400, "minorista": 8000, "distribuidor": 8000}, "st": {"mayorista": false, "minorista": true, "distribuidor": true}, "ids": {"mayorista": 229338103, "minorista": 229337972, "distribuidor": 358890046}, "rat": {"n": 1, "avg": 5.0}, "vend": "+60 vendidos", "mangos": {"mayorista": "aceite-de-romero-cultivo-organico-x-30-mlm-publicacion-mayorista", "minorista": "aceite-de-romero-cultivo-organico-x-30-mlm", "distribuidor": "aceite-de-romero-para-el-bienestar-diario-30-ml-venta-minorista-copia-vh7n1"}},
  {"n": "Aceite de Rosa Mosqueta para la Piel – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-roda-mosqueta-7b680896c8fce176cd17802641017852-640-0.webp", "d": "URL de video no configurada", "necs": ["piel"], "pr": {"mayorista": 6400, "minorista": 7200}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 229338097, "minorista": 229337982}, "rat": {"n": 2, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aceite-de-roda-mosqueta-7b680896c8fce176cd17802641017852-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-f0c8beffb73a4419bc17802642840994-480-0.webp"], "vend": "+100 vendidos", "mangos": {"mayorista": "aceite-de-rosa-mosqueta-por-30-mlm-mayorista-solo-si-cubre-monto-mayorista", "minorista": "aceite-de-rosa-mosqueta-por-30-mlm"}},
  {"n": "Aceite esencial AROMANZA varias fragancias", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/60b728be-eca4-41d7-b135-bdeecb08084d-f20ddb9974863d307317599622855412-640-0.webp", "d": "🌿 ¡Nuevo Ingreso en Habitad Natural! Descubrí las nuevas esencias de Aromanza , creadas para conectar cuerpo, mente y entorno. ✨ Aromas naturales que equilibran, relajan y elevan tu energía. Elegí la tuya y llená tus espacios de bienestar 🌸\n#HabitadNatural #Aromanza #EsenciasNaturales #Bienestar #Aromaterapia #Holístico #NuevoIngreso", "necs": ["descanso", "aromas"], "pr": {"minorista": 2000}, "st": {"minorista": true}, "ids": {"minorista": 299031005}, "opcion": "aroma", "vars": [{"id": 1334064480, "n": "vainillas encantadas (abundancia)", "p": 2000, "s": true}, {"id": 1334064494, "n": "Lavanda del valle (anti-stres)", "p": 2000, "s": true}, {"id": 1334064503, "n": "Orquidea salvaje (deseo)", "p": 2000, "s": true}, {"id": 1334064517, "n": "Flor oriental ( pureza)", "p": 2000, "s": true}, {"id": 1334064527, "n": "Cereza patchouli (superacion)", "p": 2000, "s": true}, {"id": 1334064537, "n": "Premiun limon (abre caminos)", "p": 2000, "s": true}, {"id": 1334064545, "n": "Gardenia flores blancas (Bienestar)", "p": 2000, "s": true}, {"id": 1334064557, "n": "Pasion rosa (fascinasion)", "p": 2000, "s": true}, {"id": 1334064566, "n": "Coco vainilla (dicha y satisfaccion)", "p": 2000, "s": true}, {"id": 1334064577, "n": "Lemon-naranja (positividad", "p": 2000, "s": true}], "vend": "+40 vendidos", "mangos": {"minorista": "aceite-esencial-aromanza-varias-fragancias"}},
  {"n": "Aceite Herbal para Momentos de Estrés – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/686e8a47-f3bb-4bd6-876f-a47d14f16ad7-d7137e0477a0402dcb17801584919343-640-0.webp", "d": "Aceite para \"MIGRAÑA\" - Alivio Natural 10cc\nEl Aceite de Lavanda, Artemisa y Menta es tu aliado perfecto para combatir migrañas , dolores de cabeza y el estrés diario. Su fórmula única combina propiedades relajantes y analgésicas que te ayudarán a encontrar el equilibrio que tanto necesitas.\nPropiedades Terapéuticas:\nLavanda : Ideal para calmar la mente y reducir la tensión.\nArtemisa : Conocida por sus beneficios analgésicos.\nMenta : Refresca y revitaliza, aliviando la incomodidad.\nInstrucciones de Uso:\nAplica unas gotas en las sienes y masajea suavemente. Para un efecto óptimo, inhala su aroma mientras te relajas en un ambiente tranquilo.\nNo dejes que el dolor limite tu vida . ¡Descubre el poder de la naturaleza con nuestro aceite para migraña y vive cada día sin preocupaciones", "necs": ["descanso"], "pr": {"distribuidor": 5950, "minorista": 8500, "mayorista": 6800}, "st": {"distribuidor": true, "minorista": true, "mayorista": true}, "ids": {"distribuidor": 326645413, "minorista": 252115590, "mayorista": 252115709}, "vend": "+100 vendidos", "mangos": {"distribuidor": "aceite-para-migrana-dolor-de-cabeza-por-estres-negocios-distribuidor-1bs3d", "minorista": "aceite-para-migrana-dolor-de-cabeza-por-estres", "mayorista": "aceite-para-migrana-promo-lanzamiento-pulicacion-mayorista"}},
  {"n": "ALMOHADILLA DE LAVANDA -TERMICA-chica", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/5e33d1ff-2700-477d-a103-f8e5928a08de-d0ed67150d6eb793fb17581901040636-640-0.webp", "d": "Almohadilla de Lavanda - Térmica\nLa Almohadilla Térmica de Lavanda es el aliado perfecto para el alivio de diversas dolencias. Con una combinación única de semillas de lavanda silvestre y semillas de lino , esta almohadilla está diseñada para proporcionar calor o frío, adaptándose a tus necesidades.\nBeneficios\nAlivio de calambres y contracturas : Ideal para esos momentos en que el cuerpo pide un descanso.\nDescanso de la vista : Colócala sobre tus ojos para relajar la tensión acumulada.\nReducción de fiebre : Utilízala fría para ayudar a controlar la temperatura corporal.\nAlivio de dolores de cabeza e inflamaciones : La calidez de la almohadilla ayuda a calmar el dolor y mejorar la circulación.\nModo de Uso\nCalor : Calienta en el microondas durante unos minutos.\nFrío : Refrigera en la nevera para un alivio refrescante.\nEste producto es fácil de usar y muy efectivo . Además, está fabricado con materiales de alta calidad, garantizando su durabilidad y eficacia.\nal Cliente\nAnte cualquier duda, puedes conectarte con nosotros a través de e-mail en la sección de contacto o por nuestras redes sociales. Estamos aquí para acompañarte con los brazos abiertos .\nFormas de Pago\nEste producto se puede pagar con todas las formas de pago disponibles.\nNo dejes pasar la oportunidad de cuidar de tu bienestar de forma natural con nuestra Almohadilla Térmica de Lavanda. ¡Tu cuerpo te lo agradecerá", "necs": ["aromas"], "pr": {"minorista": 6000}, "st": {"minorista": true}, "ids": {"minorista": 261162851}, "vend": "+20 vendidos", "mangos": {"minorista": "almohadilla-de-lavanda-termica"}},
  {"n": "ALMOHADILLA DE LAVANDA -TERMICA- - grande c /funda", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/habitad_almohaditas_1024x1024-58460e727d78e71c4517712609643536-640-0.webp", "d": "Almohadilla de Lavanda - Térmica\nLa Almohadilla Térmica de Lavanda es el aliado perfecto para el alivio de diversas dolencias. Con una combinación única de semillas de lavanda silvestre y semillas de lino , esta almohadilla está diseñada para proporcionar calor o frío, adaptándose a tus necesidades.\nBeneficios\nAlivio de calambres y contracturas : Ideal para esos momentos en que el cuerpo pide un descanso.\nDescanso de la vista : Colócala sobre tus ojos para relajar la tensión acumulada.\nReducción de fiebre : Utilízala fría para ayudar a controlar la temperatura corporal.\nAlivio de dolores de cabeza e inflamaciones : La calidez de la almohadilla ayuda a calmar el dolor y mejorar la circulación.\nModo de Uso\nCalor : Calienta en el microondas durante unos minutos.\nFrío : Refrigera en la nevera para un alivio refrescante.\nEste producto es fácil de usar y muy efectivo . Además, está fabricado con materiales de alta calidad, garantizando su durabilidad y eficacia.\nal Cliente\nAnte cualquier duda, puedes conectarte con nosotros a través de e-mail en la sección de contacto o por nuestras redes sociales. Estamos aquí para acompañarte con los brazos abiertos .\nFormas de Pago\nEste producto se puede pagar con todas las formas de pago disponibles.\nNo dejes pasar la oportunidad de cuidar de tu bienestar de forma natural con nuestra Almohadilla Térmica de Lavanda. ¡Tu cuerpo te lo agradecerá", "necs": ["aromas"], "pr": {"minorista": 10000}, "st": {"minorista": true}, "ids": {"minorista": 325691328}, "mangos": {"minorista": "almohadilla-de-lavanda-termica-grande-c-funda-13hk8"}},
  {"n": "antifaz relajante con semillas lavanda", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/0d43fe6a-883a-4eba-90cc-923306c20a15-4e19ed070069ec406d17583720561890-640-0.webp", "d": "Antifaz Relajante con Semillas de Lavanda\nDescubre el placer del descanso ocular con nuestro antifaz relajante con semillas de lavanda . Diseñado para ofrecerte una experiencia de relajación única, este antifaz es ideal para combatir el estrés y la fatiga visual.\nCaracterísticas: - Semillas de lavanda: Proporcionan un aroma suave y calmante, favoreciendo un descanso reparador. - Diseño ergonómico: Se ajusta perfectamente a tu rostro, bloqueando la luz y permitiendo una relajación total. - Material suave: Confeccionado con tejidos que cuidan tu piel y aportan confort en cada uso.\nModo de uso: Colócalo sobre los ojos y relájate durante unos minutos. Ideal para meditar, dormir o simplemente disfrutar de un momento de paz.\nPara más información o consultas, no dudes en contactarnos a través de nuestras redes o email. ¡Permítete un descanso merecido", "necs": ["aromas"], "pr": {"minorista": 5000}, "st": {"minorista": true}, "ids": {"minorista": 267053898}, "mangos": {"minorista": "antifaz-relajante-con-semillas-lavanda"}},
  {"n": "Armonizador de ambiente - (Nudo de Bruja)", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/19-a60b1e23e7ff331c9c17502766564234-640-0.webp", "d": "Armonizar de Hambiente - Nudo de Bruja\nEl Armonizar de Hambiente es un producto diseñado especialmente para concentrar una mejor vibración positiva en tu hogar , promoviendo un ambiente lleno de paz y armonía. Ideal para quienes buscan equilibrar sus pensamientos y calmar la mente, este collar Nudo de Bruja actúa como un amuleto que atrae serenidad y bienestar.\nEl desequilibrio emocional y mental puede afectar nuestro entorno, y este collar ayuda a restaurar la tranquilidad interior , generando una energía positiva que se refleja en el hogar. Su uso constante contribuye a crear un espacio donde la calma y la armonía son protagonistas.\nIncorpora el Armonizar de Hambiente en tu vida diaria y siente cómo la energía positiva transforma tu espacio, favoreciendo un clima de paz y bienestar para toda la familia.", "necs": ["aromas"], "pr": {"minorista": 12000}, "st": {"minorista": true}, "ids": {"minorista": 276988257}, "mangos": {"minorista": "armonizador-de-ambiente-nudo-de-bruja"}},
  {"n": "Bálsamo Labial con Karité, Cacao y Coco para Hidratación Profunda – 28g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-95-f15acec2d52037b23d17578487783522-640-0.webp", "d": "Bálsamo labialx 28grs\nMejora su apariencia. ...\nEvita que envejezcan. ...\nLos protege de las agresiones externas.\nBálsamo labial premium realizado a base de karité manteca de cacao aceite de coco medicinal y vitamina e\nMuy bueno en restaurar labios pero tambien por su accion regeneradora de la vitamina e y el cacao restaura muy bien esas narises inflamadas rojas y dañadas por rinitis severa, tambien en escemas en la piel en otro sector del cuerpo y acne facial,\nNo dudes en probarlo y ver lo maravilloso que es.\nApto_. En bebes niños y adultos\nEste producto tiene su explicacion en el dorso del frasco", "necs": ["piel"], "pr": {"mayorista": 7360, "distribuidor": 6430, "minorista": 9200}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 229338120, "distribuidor": 328233358, "minorista": 233297128}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/7622575c-7dbf-44e5-8e7e-5be567880067-103ce2b5eb07c733fd17591073195549-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-95-f15acec2d52037b23d17578487783522-480-0.webp"], "vend": "+40 vendidos", "mangos": {"mayorista": "balsamos-labiales-habitad-natural-x-28grs-mayorista-debe-cubrir-monto-mayorista", "distribuidor": "balsamos-labiales-habitad-natural-x-28grs-negocios-distribuidor-10q6z", "minorista": "balsamos-labiales-habitad-natural-x-28grs"}},
  {"n": "Bálsamo Sanalotodo para Irritaciones y Cuidado de la Piel – 40 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/probalo-3-b06f062ae3ce0efd3e17572904069655-640-0.webp", "d": "🧴🌿 BÁLSAMO SANALOTODO – HÁBITAT NATURAL 🌿🧴 En este video te contamos todo sobre nuestro bálsamo multiuso elaborado con plantas medicinales y cera de abejas , ideal para acompañar procesos de la piel de forma natural, eficaz y respetuosa.\nFormulado con: 🍃 Bardana – depurativa, útil para pieles con acné o impurezas 🌾 Yerba del sapo – antiinflamatoria y desintoxicante 🌸 Lavanda – calmante, ayuda a regenerar 🌱 Tea Tree (árbol del té) – antimicrobiano natural 🌿 Llantén – cicatrizante y refrescante 🍯 Cera de abejas – protege y sella la piel sin taparla\n✅ Ideal para tratar naturalmente: ✔️ Acné ✔️ Urticarias ✔️ Picaduras ✔️ Lastimaduras ✔️ Eczemas y problemas cutáneos en general\n💚 Sin fragancias sintéticas ni químicos agresivos. 🌍 Producto artesanal, hecho con amor y conciencia.", "necs": ["piel"], "pr": {"distribuidor": 4830, "mayorista": 5520, "minorista": 6900}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 328233524, "mayorista": 249687221, "minorista": 229337845}, "vend": "+60 vendidos", "mangos": {"distribuidor": "balsamo-sanalotodo-x-40-habitad-natural-negocios-distribuidor-1abb2", "mayorista": "balsamo-sanalotodo-x-40-habitad-natural-publicacion-mayorista", "minorista": "balsamo-sanalotodo-x-40-habitad-natural"}},
  {"n": "Bálsamo Vick Pecho para Confort y Bienestar Respiratorio – 40g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a7e0e4bc-11c1-4387-b676-6b713c0c9c88-ef8f162768cc8f6f5e17843926992666-640-0.webp", "d": "VICK- PECHO ORGANICO X 45GRS\nEste producto se usa en situaciones de tos, catarro, resfrió congestión\nSe debe aplicar en la zona del pecho y friccionar con la palma de la mano generando calor también se puede frotar en la zona de los pulmones y nariz irritada\nAnte cualquier duda pueden conectarse con nosotros por la via e-mail en la sección de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nEste producto tiene su explicación en el dorso del frasco\nINGREDIENTES:\nMENTA\nMENTOL\nEUCALIPTO\nROMERO\nALCANFOR\nCERA DE ABEJA\nTOMILLO", "necs": ["respiracion"], "pr": {"distribuidor": 5600, "mayorista": 6400, "minorista": 8000}, "st": {"distribuidor": true, "mayorista": true, "minorista": false}, "ids": {"distribuidor": 328234342, "mayorista": 229338087, "minorista": 229338004}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/128c1338-b379-472b-b66b-55d9faa4145c-fb79d66ffceaed9e4317843927023853-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2fb1c216-2554-41ad-a5a2-71cd168543dd-d4e8cef027122515db17721922373313-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a7e0e4bc-11c1-4387-b676-6b713c0c9c88-ef8f162768cc8f6f5e17843926992666-480-0.webp"], "vend": "+60 vendidos", "mangos": {"distribuidor": "vick-pecho-para-asma-tos-catarro-negocios-distribuidor-zg9r8", "mayorista": "vick-pecho-para-asma-tos-catarro-publicacion-mayorista", "minorista": "vick-pecho-para-asma-tos-catarro"}},
  {"n": "Blend de Té con Lavanda – Armonía y Bienestar en Cada Taza", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-lavanda-500539b44b5709b25a17807031471423-640-0.webp", "d": "Blend Lavanda – Té Orgánico Premium\nDescubrí el blend de té orgánico que combina lo mejor de la naturaleza para ofrecerte una experiencia única y saludable. Nuestro Blend Lavanda está elaborado con hebras rojas orgánicas y semillas solas de flores de lavanda, seleccionadas cuidadosamente para garantizar la máxima calidad y pureza.\nCaracterísticas principales:\nIngredientes 100% orgánicos: Hebras rojas y semillas de lavanda cultivadas sin pesticidas ni químicos.\nAroma y sabor natural: La lavanda aporta un toque floral delicado, mientras que las hebras rojas ofrecen un sabor suave y ligeramente dulce, ideal para relajarte.\nPropiedades relajantes y antioxidantes: La lavanda es reconocida por sus efectos calmantes sobre el sistema nervioso, mientras que las hebras rojas son ricas en antioxidantes que ayudan a cuidar tu salud.\nBeneficios del Blend Lavanda:\nPromueve la relajación y reduce el estrés diario.\nAyuda a mejorar la calidad del descanso y la conciliación del sueño.\nContribuye a la hidratación y bienestar general gracias a sus componentes naturales.\nLibre de aditivos y conservantes, apto para consumo diario.\nModo de preparación:\nColocar una cucharadita de blend en agua caliente, dejar infusionar por 5 a 7 minutos y disfrutar. Ideal para tomar a cualquier hora del día, especialmente en momentos de pausa y tranquilidad.\nEste blend es la opción perfecta para quienes buscan un té orgánico con propiedades beneficiosas y un sabor exquisito. Elaborado con ingredientes naturales, cuidamos cada detalle para que vivas una experiencia saludable y placentera.\nDisfrutá de un momento de calma con nuestro Blend Lavanda, el té que tu cuerpo y mente agradecerán.\nContenido neto: Presentación en envase hermético para conservar frescura y aroma.\nOrigen: Producto elaborado en Argentina con certificación orgánica.\nPara más información o consultas, no dudes en contactarnos. Estamos comprometidos con tu bienestar y la calidad de nuestros productos.", "necs": ["descanso"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342887015}, "mangos": {"minorista": "blend-lavanda-1ibk7"}},
  {"n": "Blend Herbal Cola de Quirquincho para Energía y Vitalidad Diaria", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-cola-quirquincho-b459dbf4811c98c96717806987247046-640-0.webp", "d": "Cola de Quirquincho – Planta afrodisíaca y natural para el bienestar\nLa cola de quirquincho es una planta originaria de Sudamérica, reconocida por sus múltiples beneficios para la salud. Tradicionalmente utilizada como un potente afrodisíaco, esta planta también es valorada por su acción en la mejora de la circulación venosa y el alivio de las várices.\nPropiedades destacadas:\nAfrodisíaco natural: Su uso ancestral la posiciona como una alternativa natural para estimular la libido y mejorar la vitalidad.\nAlivio para las várices: Gracias a sus compuestos activos, ayuda a fortalecer las paredes venosas, favoreciendo la circulación y reduciendo la sensación de pesadez en las piernas.\nEfecto similar al viagra natural: Muchos usuarios destacan su eficacia para mejorar el rendimiento y la función sexual sin recurrir a medicamentos sintéticos.\nEste producto es ideal para quienes buscan opciones naturales y seguras para mejorar su bienestar íntimo y circulatorio. La cola de quirquincho se presenta en formato práctico y fácil de incorporar en tu rutina diaria.\nModo de uso recomendado:\nSe sugiere consultar con un especialista antes de iniciar su consumo, especialmente en casos de condiciones crónicas o tratamientos concomitantes. Su empleo regular y controlado puede brindar resultados óptimos en el corto y mediano plazo.\nOrigen y calidad garantizada:\nProveniente de cultivos sudamericanos, garantizamos un producto de alta pureza y eficacia, pensado para quienes valoran las soluciones naturales y tradicionales.\nDescubrí los beneficios de la cola de quirquincho y sumá a tu salud un aliado natural con respaldo ancestral y moderno.", "necs": ["dolor"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342891698}, "vend": "+40 vendidos", "mangos": {"minorista": "cola-de-quirquincho-aehs1"}},
  {"n": "Blend Herbal de Melisa para Calma y Relajación/Venta Minorista", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-melisa-3509cc033bb0af4e3617807013921052-640-0.webp", "d": "Melisa: Tu aliada natural para el bienestar emocional y físico\nLa melisa es reconocida por sus poderes tranquilizantes que ayudan a inducir la calma y mejorar el estado de ánimo. Esta planta medicinal es un recurso natural ideal para quienes buscan un apoyo efectivo y suave para aliviar el estrés diario y favorecer una sensación de tranquilidad.\nAdemás, la melisa actúa como un aliado analgésico durante el ciclo menstrual , contribuyendo a reducir molestias y dolores asociados a esta etapa. Su efecto calmante resulta especialmente beneficioso para mejorar el confort y la calidad de vida en esos días.\nBeneficios destacados:\nEfecto calmante y relajante natural\nMejora el estado anímico y combate la ansiedad\nAlivio de dolores menstruales gracias a sus propiedades analgésicas\nComplemento ideal para quienes prefieren tratamientos naturales\nFórmula segura y adecuada para uso diario\nEste producto es una opción confiable para quienes valoran los remedios naturales respaldados por la tradición y la ciencia. La melisa se presenta como un recurso accesible para apoyar el bienestar integral, promoviendo equilibrio emocional y alivio físico.\nModo de uso: Se recomienda seguir las indicaciones específicas del envase para aprovechar al máximo sus beneficios. Consultar siempre con un profesional de la salud ante cualquier duda o condición particular.\nDescubrí los efectos positivos de la melisa, una planta que combina tradición y eficacia para cuidar tu salud de manera natural y responsable.\nProducto disponible para toda Argentina, con garantía de calidad y entrega rápida.", "necs": ["descanso"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342918145}, "mangos": {"minorista": "te-de-melisa-1m3um"}},
  {"n": "Blend Herbal para el Bienestar Cardiovascular", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-anticardiaca-3a845c822a4d13cc3417807024709154-640-0.webp", "d": "Mezcla Anti-Cardíaca: Tu aliada natural para el cuidado del corazón\nMezcla Anti-Cardíaca es una infusión especialmente formulada y recomendada para personas con afecciones cardíacas, dificultad respiratoria y otras condiciones relacionadas con el corazón. Su combinación única de hierbas tradicionales ayuda a apoyar la salud cardiovascular de manera natural y efectiva.\nIngredientes naturales y beneficios\nEsta mezcla contiene: - Cabo Toril - Melisa - Cedrón - Sanguinaria - Zarzaparilla - Pasiónaria - Siete Sangrías\nCada uno de estos ingredientes ha sido seleccionado por sus propiedades que contribuyen a mejorar la circulación, aliviar las dificultades respiratorias y fortalecer el sistema cardiovascular, ayudando a mantener un corazón sano y activo.\nModo de uso recomendado\nPara preparar la infusión: 1. Coloca una cucharadita de la mezcla por cada taza de agua. 2. Hierve durante un minuto. 3. Cuela y endulza con miel al gusto.\nSe recomienda consumir tres tazas diarias para obtener los mejores resultados y promover el bienestar general del sistema cardíaco.\nCalidad y confianza\nEste producto está pensado para quienes buscan una alternativa natural para complementar el tratamiento de enfermedades cardiovasculares bajo supervisión médica. La mezcla anti-cardíaca es un aliado para el cuidado diario, ofreciendo un apoyo suave y constante.\nImportante: Consulta siempre con tu médico antes de incorporar cualquier producto natural a tu régimen de salud, especialmente si estás bajo tratamiento o tienes afecciones específicas.\nCon la Mezcla Anti-Cardíaca , cuida tu corazón con la fuerza de la naturaleza y la tradición herbal argentina.", "necs": ["cardiovascular"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342876109}, "rat": {"n": 1, "avg": 5.0}, "vend": "+20 vendidos", "mangos": {"minorista": "mezcla-anti-cardiaca-9g7ym"}},
  {"n": "Blend Herbal para el Bienestar durante el Ciclo Menstrual", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/regulador-mestrual-ded08cd7378d5678fc17807064449538-640-0.webp", "d": "Regulador Menstrual Natural – Equilibrio y Bienestar Femenino\n¿Buscas una solución natural para regular tus periodos menstruales y aliviar dolores e inflamaciones? Nuestro Regulador Menstrual es la respuesta ideal para cuidar tu salud femenina de manera efectiva y segura.\nBeneficios principales:\nRegulariza los periodos menstruales , ayudando a restablecer el ciclo natural del cuerpo.\nCalma los dolores e inflamaciones asociados al período, proporcionando un alivio reconfortante.\nPromueve el bienestar general durante los días sensibles.\nModo de preparación y uso:\nPara aprovechar todas sus propiedades, prepara una taza con una cucharadita de la mezcla. Hierve durante un minuto, cuela y consume tres tazas al día durante una semana. Este ritual natural te ayudará a restablecer el equilibrio hormonal y aliviar molestias.\nIngredientes cuidadosamente seleccionados:\nDoradilla verde\nCulandrillo\nCola de caballo\nMarcela\nEspina colorada\nMenta\nMarrubio\nCanchalagua\nIncacuyo\nEstos ingredientes tradicionales, reconocidos por sus propiedades medicinales, trabajan en sinergia para brindar un efecto regulador y calmante.\nCalidad y confianza desde Argentina\nNuestro producto es elaborado con plantas de alta calidad, siguiendo métodos naturales y respetuosos con el medio ambiente. Ideal para quienes prefieren tratamientos naturales y efectivos para su salud femenina.\nConsejo: Consulta siempre con un profesional de la salud antes de iniciar cualquier tratamiento herbal, especialmente si estás embarazada, lactando o tomando otros medicamentos.\nDescubre el poder de la naturaleza con nuestro Regulador Menstrual y vive cada etapa de tu ciclo con mayor confort y equilibrio.", "necs": ["femenino"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342825885}, "mangos": {"minorista": "regulador-menstrual-1t8xa"}},
  {"n": "Blend Herbal para el Bienestar durante la Menopausia", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-menopausia-d02756a3199da0d4f417807011262869-640-0.webp", "d": "Blend de té para menopausia – Alivio natural para tus síntomas\nEste blend de té especialmente formulado está diseñado para acompañar y aliviar los procesos naturales de la menopausia, ayudando a reducir los molestos sofocones y aportando bienestar general.\nIngredientes cuidadosamente seleccionados:\nDoradilla\nNencia\nYerba de la perdiz\nCongorosa\nMenta inglesa\nMelisa\nPeperina\nPasiflora\nValeriana\nHamamelis\nCada uno de estos componentes aporta propiedades que contribuyen a equilibrar el organismo femenino durante esta etapa, brindando un efecto calmante y regulador.\nModo de uso recomendado: Para obtener mejores resultados, se sugiere consumir 3 tazas al día . La medida de cada taza es de 1/2 taza del preparado infusionado. Esta dosificación ayuda a mantener un efecto constante y suave a lo largo del día.\nBeneficios principales:\nDisminuye la intensidad y frecuencia de los sofocones\nPromueve la relajación y mejora el sueño\nContribuye a equilibrar el sistema nervioso\nRefuerza el bienestar emocional y físico\nEl consumo regular de este blend de té es una alternativa natural y efectiva para sobrellevar la menopausia con mayor confort y calidad de vida.\nConsejos adicionales: Para potenciar sus efectos, se recomienda acompañar la infusión con una dieta equilibrada y hábitos saludables. Ante cualquier duda, consulte con un profesional de la salud.\nDisfrutá de una infusión creada con ingredientes naturales y pensada para cuidar de vos en esta etapa única de la vida. ¡Tu bienestar es nuestra prioridad", "necs": ["femenino"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 343354366}, "vend": "+20 vendidos", "mangos": {"minorista": "menopausia-8n0x1"}},
  {"n": "Blend Herbal para el Bienestar frente a Parásitos Intestinales", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-antiparasitaria-63bd451a0ff1357bab17806995827760-640-0.webp", "d": "Anti-Parasitaria: Combate Efectivo contra Amebas y Lombrices Oxiuros\nEl producto Anti-Parasitaria está especialmente formulado para eliminar toda clase de parásitos intestinales en niños y adultos, brindando una solución natural y segura para el cuidado digestivo. Su composición única combina ingredientes tradicionales y reconocidos por sus propiedades antiparasitarias, tales como helecho macho, paico, altamisa, suico, tomillo, cáscaras de naranja dulce, cuasia, menta, ajenjo amargo y simarruba.\nModo de uso sencillo y práctico: Para su preparación, se recomienda colocar una cucharita del producto por taza, hervir durante un minuto, colar y endulzar a gusto. Se aconseja tomar tres tazas diarias durante una semana para obtener resultados óptimos.\nBeneficios principales: - Elimina amebas y lombrices oxiuros , dos de los parásitos intestinales más comunes. - Ideal para toda la familia , apto para niños y adultos. - Ingredientes naturales que ayudan a mejorar la salud intestinal sin efectos secundarios adversos. - Apoya la limpieza profunda del organismo, mejorando el bienestar general.\nEste producto es una alternativa confiable para quienes buscan un tratamiento antiparasitario natural, efectivo y de fácil administración. La combinación de plantas medicinales seleccionadas actúa de manera sinérgica para erradicar parásitos y favorecer la recuperación de la flora intestinal.\nRecomendaciones: Consulte con un profesional de la salud ante cualquier duda y para complementar el tratamiento según sus necesidades particulares.\n¡Cuide su salud y la de su familia con Anti-Parasitaria , la opción natural para un intestino libre de parásitos!\nContenido neto: presentado en envase práctico para su fácil uso diario. Origen: Elaborado con ingredientes naturales en Argentina, garantizando calidad y autenticidad.", "necs": ["digestion", "hongos"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342882427}, "vend": "+80 vendidos", "mangos": {"minorista": "anti-parasitaria-1ilvm"}},
  {"n": "Blend Herbal para el Bienestar Hemorroidal", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-antihemorroidal-b1e8038449fdb3c86717806851967100-640-0.webp", "d": "Anti-Hemorroidal: Alivio Natural y Eficaz para Hemorroides\nEl Anti-Hemorroidal es una solución natural diseñada para aliviar cualquier tipo de hemorroides, ya sean internas o externas, sangrantes o inflamadas. Su fórmula combina ingredientes tradicionales y efectivos que actúan para reducir la inflamación, el dolor y el sangrado, mejorando tu bienestar diario.\nComposición y Beneficios\nEste producto contiene una mezcla de plantas medicinales reconocidas por sus propiedades terapéuticas:\nCola de caballo: desinflamante y cicatrizante.\nCentaura menor: ayuda a reducir el sangrado.\nMil en rama: favorece la circulación y calma la irritación.\nTomillo y menta hojas: propiedades antisépticas y refrescantes.\nHamamelis: fortalece las venas y calma el dolor.\nMarcela y mastuerzo: alivian la inflamación y promueven la regeneración de tejidos.\nModo de Uso\nPara obtener un alivio efectivo, se recomienda preparar una infusión con una cucharada por taza y tomar tres tazas diarias . Además, se pueden aplicar fomentos tibios directamente sobre las hemorroides para un efecto calmante y desinflamante.\nPor qué elegir Anti-Hemorroidal\nEste producto es ideal para quienes buscan un tratamiento natural, confiable y fácil de incorporar a su rutina diaria. Gracias a su composición basada en plantas medicinales, ofrece una alternativa segura para mejorar los síntomas y favorecer la recuperación.\nNota: Siempre es recomendable consultar con un profesional de la salud ante cualquier duda o si los síntomas persisten.\nAnti-Hemorroidal es tu aliado para cuidar tu salud con el poder de la naturaleza.", "necs": ["digestion"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342881617}, "vend": "+30 vendidos", "mangos": {"minorista": "anti-hemorroidal-al3eg"}},
  {"n": "Blend Herbal para el Bienestar Prostático", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-prostata-4859e11399b9cc9d5817806265896210-640-0.webp", "d": "Tratamiento natural para la próstata 30grs– Alivio y bienestar\nEste tratamiento está especialmente formulado para aliviar molestias relacionadas con la próstata, como inflamaciones y ardor al orinar. Es ideal para quienes experimentan deseos frecuentes de orinar con escasa fuerza y cantidad, ofreciendo un apoyo natural para mejorar la calidad de vida.\nModo de preparación y uso: Se recomienda preparar una infusión con dos cucharas de la mezcla por cada litro de agua. Hervir durante 2 minutos, colar y consumir una taza cada 6 horas para obtener mejores resultados.\nIngredientes naturales y sus beneficios: - Brusquilla y cola de caballo : reconocidas por sus propiedades antiinflamatorias y diuréticas. - Uva ursi : ayuda a calmar el ardor y las irritaciones urinarias. - Siete sangrías y fresno : contribuyen a mejorar la función renal y urinaria. - Cepa caballo , zarzaparrilla y congorosa : fortalecen el sistema urinario y aportan antioxidantes naturales.\nEste producto es una alternativa natural y segura que puede integrarse en su rutina diaria para mantener la salud prostática.\nRecomendaciones: Consulte con su médico antes de iniciar cualquier tratamiento, especialmente si presenta síntomas persistentes o está bajo medicación. La constancia en el consumo es clave para notar mejorías.\nConfíe en un producto elaborado con ingredientes cuidadosamente seleccionados, para cuidar su bienestar de manera natural y efectiva.", "necs": ["femenino"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342846131}, "rat": {"n": 1, "avg": 4.0}, "vend": "+130 vendidos", "mangos": {"minorista": "tratamiento-prostata-14fye"}},
  {"n": "Blend Herbal para el Descanso Nocturno", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blends-para-dormir-3150a4d2df4b0659a617806263207434-640-0.webp", "d": "Blend para Dormir: Té Orgánico para un Sueño Pleno\nDescubrí nuestro blend de té orgánico especialmente formulado para acompañarte en el momento previo a un sueño reparador. Este blend combina hebras negras de té , junto con flores puras de manzanilla , cedrón y melisa orgánica , ingredientes reconocidos por sus propiedades relajantes y calmantes.\nIngredientes Naturales y Orgánicos\nHebras negras de té : Aportan un sabor suave y equilibrado, además de favorecer la relajación.\nManzanilla : Conocida por sus efectos calmantes y su capacidad para aliviar la ansiedad.\nCedrón : Tradicionalmente utilizado para mejorar la calidad del sueño y reducir el estrés.\nMelisa orgánica : Refuerza el efecto relajante y ayuda a preparar el cuerpo para un descanso profundo.\nBeneficios del Blend para Dormir\nEste blend es ideal para tomar antes de entrar en el ciclo de sueño, facilitando la transición hacia un descanso natural y sin interrupciones. Al ser un producto orgánico, garantizamos la pureza y calidad de cada ingrediente, cuidando tu bienestar y salud.\nCómo Prepararlo\nPara disfrutar de todas sus propiedades, simplemente infusioná una cucharadita del blend en agua caliente durante 5 a 7 minutos. Se recomienda consumirlo aproximadamente 30 minutos antes de acostarte para maximizar sus efectos.\nPresentación y Uso\nEnvase hermético que conserva la frescura y aroma de las hierbas.\nContenido neto ideal para varias preparaciones.\nProducto apto para toda la familia, sin aditivos ni conservantes artificiales.\nElegí nuestro blend para dormir y redescubrí la sensación de un descanso profundo y natural. Un aliado perfecto para tus noches en Argentina, donde la calidad y lo orgánico se unen para cuidar de vos.", "necs": ["descanso"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342887600}, "vend": "+20 vendidos", "mangos": {"minorista": "blend-para-domrir-1whgj"}},
  {"n": "Blend Herbal para el Equilibrio del Ácido Úrico X 30 gr", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/bloend-acido-urico-51439b0b092bd67eea17807063096790-640-0.webp", "d": "Blend de Té para el Tratamiento del Ácido Úrico\nEste blend especialmente formulado es una opción natural y efectiva para quienes buscan reducir el ácido úrico, combatir la gota, la artritis y aliviar el dolor muscular. Cada ingrediente ha sido seleccionado por sus propiedades terapéuticas que actúan en sinergia para brindar un tratamiento integral.\nIngredientes Clave: - Abedul : conocido por sus propiedades diuréticas que ayudan a eliminar toxinas. - Hipérico : utilizado tradicionalmente para reducir inflamaciones. - Amargón : apoya la función renal y digestiva. - Fresno : ayuda a mejorar la circulación y reducir el dolor articular. - Heliotropium : favorece la desintoxicación del organismo. - Poleo y Peperina : brindan efecto calmante y digestivo. - Apio Cimarrón e Incacuyo : fortalecen el sistema urinario y ayudan a controlar los niveles de ácido úrico.\nModo de uso: Prepare una infusión con una cucharadita del blend por taza. Se recomienda tomar de 3 a 4 tazas diarias, preferentemente distribuidas a lo largo del día para mantener un efecto constante.\nEste blend es una alternativa natural que acompaña y complementa los tratamientos convencionales. Su uso regular puede contribuir a mejorar la calidad de vida y a reducir las molestias asociadas a estas patologías.\nCalidad y confianza: Nuestro blend de té es elaborado con ingredientes naturales, cuidadosamente seleccionados y procesados para conservar todas sus propiedades. Ideal para quienes buscan un método natural y efectivo para tratar el ácido úrico y sus síntomas relacionados.\nConsulte siempre con su médico antes de iniciar cualquier tratamiento.\nBeneficios principales: - Reduce niveles de ácido úrico. - Combate la gota y la artritis. - Alivia el dolor muscular. - Promueve la desintoxicación natural del cuerpo.\nDescubra el poder de la naturaleza para cuidar su salud con este blend único y tradicional.", "necs": ["dolor"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342841719}, "mangos": {"minorista": "acido-urico-ubpfb"}},
  {"n": "Blend Herbal para el Equilibrio del Colesterol", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-colesterol-026f710149e38e162917807033456965-640-0.webp", "d": "Colesterol - Infusión Natural para el Bienestar Cardiovascular\nEsta infusión está especialmente formulada para combatir la acumulación y depósito de grasa , ayudando a mantener niveles saludables de colesterol en el organismo. Además, contribuye a disminuir la viscosidad sanguínea , favoreciendo una circulación óptima y un sistema cardiovascular más saludable.\nIngredientes Naturales: - Muérdago - Crataegus - Bolsa de pastor - Llanten - Poleo - Corazoncillo - Heliotropium - Corteza de Lapacho\nModo de preparación: Para obtener todos sus beneficios, coloque cuatro cucharadas de la mezcla en un litro de agua. Lleve a hervor por un minuto, luego cuele. Puede consumirla tanto fría como caliente, recomendándose la ingesta de cuatro tazas diarias para un mejor efecto.\nBeneficios clave: - Ayuda a controlar los niveles de colesterol. - Favorece la circulación sanguínea al reducir la viscosidad de la sangre. - Ingredientes 100% naturales con propiedades tradicionales reconocidas. - Ideal para quienes buscan un complemento natural para el cuidado cardiovascular.\nEste producto está pensado para quienes valoran el cuidado natural y efectivo de su salud. La combinación de plantas seleccionadas ofrece un apoyo integral para mantener un corazón sano y una circulación equilibrada.\nDisfrute de una infusión que cuida su bienestar desde la raíz, con ingredientes naturales y una preparación sencilla que puede adaptarse a su rutina diaria.\nContenido: Presentación en formato ideal para preparar hasta un litro de infusión diaria.\nPara más información o consultas, estamos disponibles para acompañarlo en su camino hacia una vida más saludable.", "necs": ["cardiovascular"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342885444}, "vend": "+50 vendidos", "mangos": {"minorista": "colesterol-h77jo"}},
  {"n": "Blend Herbal para la Circulación y Bienestar de las Piernas", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-varices-ca43c79c6f0da927ab17807037915011-640-0.webp", "d": "Anti-Varices: Apoyo natural para la salud circulatoria\nEste producto está especialmente indicado para mejorar el movimiento circulatorio en personas que sufren de várices. Su fórmula única ayuda a purificar la sangre y fortalecer las venas propensas a debilitarse, contribuyendo así a una mejor calidad de vida.\nIngredientes naturales cuidadosamente seleccionados:\nHamamelis hojas : reconocida por sus propiedades astringentes y antiinflamatorias que favorecen la circulación.\nBardana hojas : ayuda a depurar la sangre y mejora la salud vascular.\nNogal hojas : aporta antioxidantes que protegen las paredes venosas.\nMil en rama : estimula el flujo sanguíneo y refuerza las venas.\nMelisa, tomillocedrón y cola de caballo : combinados para brindar un efecto calmante y antioxidante, aliviando molestias asociadas.\nModo de uso:\nPara aprovechar todos sus beneficios, se recomienda preparar una infusión con una cucharada por taza y consumir tres tazas diarias , ya sea fría o caliente según preferencia.\nEste producto es una excelente opción para quienes buscan un apoyo natural y efectivo para mantener una buena circulación y aliviar las molestias causadas por las várices. Su composición basada en plantas medicinales aporta una acción integral que actúa desde adentro, fortaleciendo las paredes venosas y purificando la sangre.\n¡Incorpórelo a su rutina diaria y sienta la diferencia en su bienestar circulatorio", "necs": ["dolor"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342879214}, "vend": "+20 vendidos", "mangos": {"minorista": "anti-varices-1ch8z"}},
  {"n": "Blend Herbal para Memoria, Vista y Oído", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-de-memoria-vista-y-oido-7fc50d739173d9316617807027210993-640-0.webp", "d": "Memoria, Vista y Oído es una infusión especialmente diseñada para potenciar tu bienestar mental y sensorial de forma natural. Esta fórmula única combina ingredientes tradicionales reconocidos por sus beneficios antioxidantes y estimulantes para la mente y los sentidos.\nEntre sus componentes se destacan el Ginkgo Biloba , la Equinácea , la Rosa Mosqueta , el Té Verde , la Menta y la Peperina . Esta combinación actúa capturando los radicales libres, ayudando a prevenir el envejecimiento prematuro y promoviendo una mejor función cognitiva y sensorial.\nPara aprovechar todas sus propiedades, se recomienda preparar la infusión con una cucharadita por taza, dejándola hervir un minuto. Puedes endulzar a gusto y tomar hasta tres tazas por día para obtener mejores resultados. Esta rutina diaria contribuye a mantener tu memoria activa, mejorar la vista y cuidar el oído.\nEste producto se destaca por su alta calidad y por ser una opción natural para quienes buscan cuidar su salud de manera integral. Ideal para personas que desean prevenir el desgaste cognitivo y sensorial asociado al paso del tiempo.\nBeneficios clave:\nPreviene el envejecimiento prematuro gracias a su acción antioxidante.\nEstimula la memoria y la concentración .\nMejora la salud visual y auditiva .\nIngredientes 100% naturales seleccionados cuidadosamente.\nDisfrutá de una infusión saludable que apoya tu mente y sentidos con ingredientes naturales tradicionales, ideales para un estilo de vida equilibrado y consciente.\nModo de uso: Una cucharadita por taza, hervir un minuto, endulzar a gusto y tomar 3 tazas al día.\nIngredientes: Ginkgo Biloba, Equinácea, Rosa Mosqueta, Té Verde, Menta, Peperina.\nApostá por tu salud con Memoria, Vista y Oído , el aliado natural para cuidar lo que más valorás.", "necs": ["defensas"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342897103}, "vend": "+20 vendidos", "mangos": {"minorista": "memoria-vista-y-oido-917qr"}},
  {"n": "Blend Herbal verde para Articulaciones y Movilidad", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-antirreumatico-5f02276b83c71cc06317806973259794-640-0.webp", "d": "Tratamiento Antirreumático: Alivio Natural para tus Dolores\nEl Tratamiento Antirreumático es una infusión especialmente formulada para combatir el reumatismo en todas sus formas y aliviar dolores musculares, gota, ciática y artritis. Gracias a su combinación única de hierbas medicinales, actúa eficazmente para reducir el ácido úrico y mejorar tu bienestar general.\nIngredientes Naturales y Potentes\nEsta mezcla contiene ingredientes seleccionados por sus propiedades terapéuticas comprobadas: - Apio - Cimarrón - Contrayerba - Fresno - Jarilla hojas - Mil hombres - Cedrón - Tramontada - Tomillo - Te del burro - Heliotropium\nCada uno aporta beneficios específicos que contribuyen a la disminución de inflamaciones y el alivio de molestias articulares y musculares.\nModo de Preparación y Uso\nPara preparar esta infusión, coloca una cucharita por taza de agua , hierve durante un minuto y deja reposar. Se recomienda consumir tres tazas diarias para obtener resultados óptimos. Puedes endulzar a gusto.\nBeneficios Destacados\nElimina dolores musculares y articulares\nReduce inflamaciones asociadas a reumatismo, artritis y ciática\nAyuda a controlar el ácido úrico\nPromueve la recuperación natural y el bienestar\nEste tratamiento es ideal para quienes buscan una opción natural y efectiva para mejorar la calidad de vida sin depender únicamente de medicamentos convencionales.\nNota: Consulta siempre con un profesional de la salud antes de iniciar cualquier tratamiento, especialmente si tienes condiciones médicas preexistentes o estás tomando otros medicamentos.\nCon el Tratamiento Antirreumático, cuidá tu cuerpo de manera natural y sentí la diferencia día a día.", "necs": ["dolor"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342880369}, "vend": "+20 vendidos", "mangos": {"minorista": "tratamiento-atirreumatico-s7hfs"}},
  {"n": "blend Sedante nervioso- descanso nerviosismo palpitaciones ansiedad insomnios", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/blend-sedante-nervioso-b2503dab78d15da46717807096309794-640-0.webp", "d": "Sedante Nervioso: Alivio Natural para Trastornos Nerviosos\nEste Sedante Nervioso es una mezcla cuidadosamente elaborada de hierbas naturales, excelente para aliviar trastornos nerviosos que provocan vértigo, irritabilidad e insomnio. Su fórmula incluye ingredientes tradicionales como pasionaria, melisa, tilo flor, raíz de valeriana, flor de azahar, peperina, menta y salvia , conocidos por sus propiedades calmantes y relajantes.\nModo de uso: Para preparar la infusión, coloque una cucharadita de la mezcla por taza de agua. Hierva durante un minuto y consuma una taza por la mañana y otra por la noche. Esta sencilla preparación ayuda a equilibrar el sistema nervioso, promoviendo un descanso reparador y reduciendo la sensación de ansiedad.\nBeneficios principales: - Disminuye la irritabilidad y el estrés diario. - Alivia el vértigo producido por trastornos nerviosos. - Mejora la calidad del sueño, combatiendo el insomnio. - Contribuye a la relajación general del cuerpo y la mente.\nEl Sedante Nervioso es una solución natural, ideal para quienes buscan un apoyo efectivo sin efectos secundarios agresivos. Su combinación de plantas medicinales es tradicionalmente usada en Argentina y otros países, brindando confianza y bienestar a quienes lo consumen.\nPresentación: Viene presentado en un envase práctico que conserva la frescura y calidad de las hierbas, facilitando su uso diario.\nSi buscas un producto natural para cuidar tu salud mental y emocional, este sedante es una excelente opción para incluir en tu rutina.\nPara cualquier consulta o información adicional, no dudes en contactarnos. Estamos comprometidos con tu bienestar integral.", "necs": ["descanso"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342817642}, "vend": "+10 vendidos", "mangos": {"minorista": "sedante-nervioso-18r11"}},
  {"n": "BRUMA AURICA CONTRA LA ENVIDIA, EL ENOJO y LA BRONCA x250cc", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/15297479962249909940-f1211eb363f40b6c5117796643906547-640-0.webp", "d": "la Bruma áurica contra la envidia y el enojo:\nSignificado y uso , Significado esotérico\nUna bruma áurica es un aerosol o spray que se utiliza en prácticas esotéricas y espirituales para limpiar, proteger y fortalecer el aura de una persona. El aura es considerada un campo energético que rodea el cuerpo físico y puede verse afectada por energías negativas como la envidia y el enojo.\nContra la envidia:\nLa envidia es vista como una energía negativa que puede afectar tanto al envidioso como a la persona envidiada. Una bruma áurica diseñada para combatir la envidia busca repeler esta energía y proteger a la persona de su influencia.\nContra el enojo:\nEl enojo, tanto propio como el de los demás, puede desequilibrar el campo energético. La bruma áurica contra el enojo tiene la intención de calmar y equilibrar las energías, promoviendo la paz interior y la armonía.", "necs": ["aromas"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338269}, "vend": "+20 vendidos", "mangos": {"minorista": "bruma-aurica-contra-la-envidia-el-enojo-y-la-bronca"}},
  {"n": "Bruma Aurica x 125 con valvula atomizadora", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/bruma-aurica-125-8302ce2e0d31d9ab5617796618213506-640-0.webp", "d": "Bruma Áurica x 100 ml – Protección y armonía en cada ambiente\nDescubrí la Bruma Áurica contra la envidia y el enojo , diseñada especialmente para cortar malas vibras, bronca y queja. Ideal para usar en reuniones, concentraciones de personas, charlas o discusiones, te ayuda a mantener la calma y el equilibrio emocional.\nFormulada con ingredientes naturales como lavanda, romero, laurel, ruda, eucalipto, cítricos y bergamota , su aroma fresco y envolvente purifica el ambiente y fortalece tu energía positiva.\nmodo de uso:\nAplicala pulverizando suavemente en el espacio o alrededor tuyo para sentir cómo disuelve las energías negativas emitidas por otros. Es el aliado perfecto para transformar la tensión en paz y bienestar.\nideal cuando hay mucho recambio de personas\n¡Incorporá esta esencia mágica en tu rutina y disfrutá de ambientes más livianos y protegidos", "necs": ["aromas"], "pr": {"minorista": 4800}, "st": {"minorista": true}, "ids": {"minorista": 302633057}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/bruma-aurica-125-8302ce2e0d31d9ab5617796618213506-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-41903ec0d30966dfd917728530794288-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/subtitulo-2-612287f810669af0b417796622131794-480-0.webp"], "vend": "+50 vendidos", "mangos": {"minorista": "bruma-aurica-x-100-con-valvula-atomizadora-eo7cg"}},
  {"n": "Carbon Neutro X24 sagrada madre", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-57a33367bacd901fb417426751100170-640-0.webp", "d": "Carbón neutro x 24 SAGRADA MADRE || CAJA X 24\n-Carbones Defumadores\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CON NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOSO\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["aromas"], "pr": {"minorista": 3500}, "st": {"minorista": true}, "ids": {"minorista": 229337557}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-57a33367bacd901fb417426751100170-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-49a69bda9f6445b80817426751112308-480-0.webp"], "mangos": {"minorista": "carbon-neutro-x24-sagrada-madre"}},
  {"n": "Cascada de Humo mdf arbolito de la vida/con cono de regalo", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/hornito-imitacion-arbol-3c770931c0b54cea2a17487301921208-640-0.webp", "d": "Cascada de Humo MDF Árbolito de la Vida Descubrí la magia y armonía que trae a tu hogar esta exclusiva cascada de humo elaborada en MDF, con el diseño emblemático del Árbol de la Vida. Su delicada estructura permite que el humo fluya suavemente, creando un espectáculo visual único que invita a la relajación y meditación.\nEste objeto decorativo no solo es hermoso, sino que también aporta un significado profundo: el Árbol de la Vida simboliza crecimiento, conexión y equilibrio espiritual. Ideal para ambientes zen, salas de estar o espacios de yoga.\nCaracterísticas principales: - Material: MDF resistente y liviano - Diseño artesanal con detalles finos - Fácil de usar con conos o varitas de incienso - Perfecta para crear un ambiente cálido y armonioso\nTransformá tu espacio y conectate con la energía positiva que solo el Árbol de la Vida puede brindar.\n¡Sumá esta pieza única a tu colección y disfrutá de un ambiente lleno de paz y belleza", "necs": ["aromas"], "pr": {"minorista": 4800}, "st": {"minorista": false}, "ids": {"minorista": 273890750}, "mangos": {"minorista": "cascada-de-humo-mdf-arbolito-de-la-vida-con-cono-de-regalo"}},
  {"n": "cascadas de humo", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-57-18c97a8318a0f7da3717432783258462-640-0.webp", "d": "Cascadas de Humo 7 Chacras en MDF\nDescubra la armonía y el equilibrio que las Cascadas de Humo 7 Chacras en MDF pueden aportar a su espacio. Este exquisito producto, diseñado con un enfoque en la estética y la funcionalidad, es ideal para quienes buscan mejorar la energía en su hogar o lugar de trabajo.\nFabricadas en MDF de alta calidad , estas cascadas de humo están elaboradas para resistir el paso del tiempo , a la vez que ofrecen una presentación elegante y moderna. Con un diseño que simboliza los siete chacras, cada cascada permite la difusión de humo de manera suave y envolvente, creando un ambiente de tranquilidad y bienestar .\nCaracterísticas destacadas: - Material Duradero: MDF de primera calidad, asegurando resistencia y estética. - Diseño Único: Representación artística de los siete chacras, perfecta para la meditación y la relajación. - Fácil Uso: Ideal para iniciarse en la práctica de la aromaterapia y la meditación.\nIncorpore un toque de sutileza y sofisticación a su vida diaria. Este producto no solo es funcional, sino que también actúa como un elemento decorativo que realza cualquier espacio.\nAnte cualquier duda, no dude en contactar con nosotros a través de la sección de contacto en nuestra página web o por nuestras redes sociales. Estamos aquí para acompañarlo en su experiencia de compra.\nFormas de pago: Este producto se puede abonar a través de todas las modalidades disponibles en nuestra tienda.\nTransforme su entorno con las Cascadas de Humo 7 Chacras en MDF y disfrute de un viaje hacia el bienestar.", "necs": ["aromas"], "pr": {"minorista": 8000}, "st": {"minorista": false}, "ids": {"minorista": 262474153}, "mangos": {"minorista": "cascadas-de-humo"}},
  {"n": "Cazcadas De Humo En PDF por 1 Unidad", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-50-f5cfc53e0e6088e6cf17426719370806-640-0.webp", "d": "Cazcadas De Humo En PDF por 1 Unidad -------(Mayorista)\nDurabilidad y Estilo en Cada Cazcada Las cazcadas de humo en PDF son la opción perfecta para quienes buscan un producto duradero y económico . A diferencia de las tradicionales cazcadas de yeso, estas no se rompen ni se lastiman, lo que las convierte en ideales para decorar o regalar .\nVersatilidad y Diseño Atractivo Con un diseño atractivo, estas cazcadas son ideales como adorno en cualquier ambiente. Su estética encantadora las hace perfectas para cualquier ocasión, desde eventos especiales hasta la decoración de tu hogar.\nRegalo Perfecto Sorprende a tus seres queridos con un regalo único. Las cazcadas de humo en PDF son un detalle original y significativo que seguramente será apreciado.\nFácil de Usar Su uso es simple, lo que permite disfrutar de momentos especiales sin complicaciones.\nContáctanos Ante cualquier duda, puedes conectarte con nosotros por e-mail en la sección de contacto, o a través de nuestras redes y WhatsApp. Estamos aquí para ayudarte.\nFormas de Pago Este producto se puede pagar con todas las formas de pago disponibles.", "necs": ["aromas"], "pr": {"minorista": 2800}, "st": {"minorista": false}, "ids": {"minorista": 229337888}, "opcion": "Cazcadas de Humo", "vars": [{"id": 1023925539, "n": "Buda 3D", "p": 2800, "s": false}, {"id": 1023925544, "n": "Mano de Fatima", "p": 2800, "s": false}, {"id": 1023925547, "n": "Ganesha", "p": 2800, "s": false}], "mangos": {"minorista": "cazcadas-de-humo-en-pdf-por-1-unidad"}},
  {"n": "Cobre Coloidal Premium – 250 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/8396c1dc-ed8b-4750-82d9-f7504c833301-0e7b6216eab789bd2517830871691200-640-0.webp", "d": "COBRE COLOIDAL X 250 ML\nPRODUCTO CON PROSPECTO\nSu función:\nIndispensable en la pigmentación de la piel y el cabello, ayuda regular niveles de colesterol,Ayuda antirreunematica, Participa en la sintesis de hemoglobina y de regular las emociones,Estimula el cerebro\nRegula el funcionamiento de la glandula tiroides\nDesintoxica la sangre y limpia las arterias..., Producto en iones de cobre, ciclo de 3 meses\nTomar 5 ml diarios , terminar la dosis , descanzar 30 dias y luego puede continuar .\nel dezcanso es para manetener el correcto equilibrio\nAnte cualquier duda , se comuinica con nosotros y discontinua su ingesta", "necs": ["piel", "defensas", "cardiovascular"], "pr": {"distribuidor": 5600, "mayorista": 6400, "minorista": 8000}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 330186314, "mayorista": 229338222, "minorista": 229337699}, "vend": "+70 vendidos"},
  {"n": "COLGANTE ELEFANTE ABUNDANCIA CON ARMONIZADOR 7 CHACRAS 22CM", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/colgante-luina-y-sol-7-chacras-con-esfera-armonizador-1-3a5d66750309937a0b17629861242538-640-0.webp", "d": "COLGANTE ELEFANTE ABUNDANCIA CON ARMONIZADOR 7 CHACRAS\nDescubre el poder de la armonía y la abundancia con nuestro exclusivo Colgante Elefante Abundancia con Armonizador 7 Chacras , una pieza única de 22 cm diseñada especialmente para equilibrar y energizar tu ambiente.\nEste colgante combina la simbología del elefante, reconocido en muchas culturas como símbolo de protección, sabiduría y prosperidad, con un armonizador que trabaja sobre los 7 chacras principales, ayudando a desbloquear y potenciar la energía vital de tu entorno.\nBeneficios clave:\nArmonización del ambiente: El colgante ayuda a equilibrar las energías, promoviendo un espacio de paz y bienestar.\nActivación de los 7 chacras: Facilita el flujo energético que conecta cuerpo y mente, mejorando tu concentración y vitalidad.\nSímbolo de abundancia: El elefante atrae prosperidad y buena suerte para tu hogar o lugar de trabajo.\nTamaño ideal: Con sus 22 cm de longitud, es un accesorio visible y decorativo que aporta estilo y energía positiva.\nPerfecto para quienes buscan un ambiente cargado de buenas vibras y energía renovadora. Ideal para colocar en salas, oficinas o espacios personales donde deseas fomentar la tranquilidad y el crecimiento personal.\nEleva la energía de tu entorno con este colgante armónico y siente cómo la abundancia y el equilibrio fluyen en tu vida diaria. ¡No esperes más para transformar tu ambiente!\n¡Haz tu pedido ahora y lleva contigo la energía positiva del Colgante Elefante Abundancia con Armonizador 7 Chacras", "necs": ["aromas"], "pr": {"minorista": 12000}, "st": {"minorista": false}, "ids": {"minorista": 306933990}, "mangos": {"minorista": "colgante-elefante-abundancia-con-armonizador-7-chacras-22cm-7owx6"}},
  {"n": "Colgante mano Fátima ojo turco con armonizador de ambiente", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/nuevo-ingreso-1-ee253680cc893b70ba17447266203305-640-0.webp", "d": "Colgante Mano Fátima Ojo Turco con Armonizador de Ambiente ✨\nTransformá tu espacio con el Colgante Armonizador de Ambiente , diseñado específicamente para elevar la energía de tu hogar. Este colgante, faceteado en cristal , combina la poderosa mano de Fátima y el ojo turco para ofrecerte mucho más que una simple decoración.\nBeneficios Inigualables:\n🌈 Activa la protección energética : Aleja las vibras negativas y crea un entorno de paz.\n🧿 Canaliza la vibración de los 7 chakras : Promueve el equilibrio y la armonía en tu vida diaria.\n💎 Eleva la frecuencia del espacio : Siente cómo tu hogar se transforma en un refugio de tranquilidad.\nIdeal para colgar en entradas, ventanas o rincones de meditación , su diseño facetado no solo es estéticamente hermoso, sino que también refleja la luz y transforma la energía del ambiente, creando una atmósfera de calma y bienestar.\nConectá con lo sutil, sentí la calma y protegé tu espacio con este hermoso colgante. 🌬️\n🛒 Disponible en nuestra tienda online en la sección Holística . 📍 Consultanos por mensaje o accedé a través del link en bio .", "necs": ["aromas"], "pr": {"minorista": 10000}, "st": {"minorista": false}, "ids": {"minorista": 265245118}, "mangos": {"minorista": "colgante-mano-fatima-ojo-turco-con-armonizador-de-ambiente"}},
  {"n": "COMBO ACEITE PARA TU CUIDADO DE PIEL Y UÑAS", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a54ef2f1-727a-4987-bf49-576a60172d59-770e2500788c85480217692944586521-640-0.webp", "d": "Combo Aceite Cuidado de Piel y Uñas\nDescubre el Poder de la Naturaleza\nEl Combo Aceite para tu Cuidado de Piel y Uñas de la reconocida marca Habitad Natural es la solución perfecta para quienes buscan un tratamiento eficaz y placentero para la piel y las uñas.\nIngredientes Premium\nEste exclusivo combo combina ACEITE DE ALMENDRAS, LAVANDA y JOJOBA , ofreciendo una rica experiencia sensorial . El aceite de almendras es conocido por sus propiedades hidratantes, mientras que la lavanda no solo proporciona un aroma relajante, sino que también calma la piel. Por su parte, el aceite de jojoba nutre y fortalece tus uñas, dejándolas brillantes y saludables.\nModo de Uso\nPara disfrutar al máximo de sus beneficios, aplica el aceite de forma circular sobre la piel y las uñas hasta su completa absorción. Su textura ligera y no grasa permite que se absorba rápidamente, dejándote una sensación de frescura.\nAcción Terapéutica\nEste combo no solo humecta, sino que también ayuda a restaurar la barrera cutánea , promoviendo una piel más suave y radiante. Es ideal para cualquier tipo de piel y también ayuda a prevenir el quiebre de las uñas.\nal Cliente\nAnte cualquier consulta, no dudes en contactarnos a través de nuestras redes sociales o por e-mail. En Habitad Natural , estamos aquí para acompañarte en tu viaje hacia un cuidado personal integral.\nFormas de Pago\nEste producto puede ser adquirido mediante todas las formas de pago disponibles, facilitando tu experiencia de compra.\nNo esperes más para darle a tu piel y uñas el cuidado que merecen. Adquiere hoy el Combo Aceite de Habitad Natural y siente la diferencia", "necs": ["packs"], "pr": {"minorista": 18900}, "st": {"minorista": true}, "ids": {"minorista": 264859226}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/a54ef2f1-727a-4987-bf49-576a60172d59-770e2500788c85480217692944586521-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/benficios-combo-piel-b05ff703e3fd13dc6a17813099019955-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-4fbc93c931d21da49217692944624627-480-0.webp"], "vend": "+30 vendidos", "mangos": {"minorista": "combo-aceite-para-tu-cuidado-de-piel-y-unas"}},
  {"n": "COMBO ANSIEDAD-POR FITOTERAPIA", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a6f9e06c-6e01-41e1-9b7e-abe16d4beb4e-39586fc9b6044aa87717754078954898-640-0.webp", "d": "COMBO ANSIEDAD-POR FITOTERAPIA\nContiene: Una mezcla especial de ingredientes naturales diseñados para aliviar la ansiedad , el insomnio , el estrés , la irritación y los ataques de pánico .\nAcción terapéutica: Este combo de blends de tés proporciona un efecto calmante que ayuda a restaurar el equilibrio emocional y promueve un sueño reparador. Cada ingrediente ha sido seleccionado por sus propiedades relajantes y su capacidad de mejorar el bienestar general.\nModo de uso: Infundir una cucharada del blend en agua caliente durante 5-7 minutos. Consumir una taza antes de dormir o en momentos de alta tensión para disfrutar de sus beneficios.\nContacto: Si tienes dudas, no dudes en comunicarte con nosotros a través de nuestro correo electrónico, redes sociales o WhatsApp. Estamos aquí para acompañarte.\nFormas de pago: Este producto se puede abonar con todas las formas de pago.", "necs": ["descanso", "packs"], "pr": {"minorista": 4800}, "st": {"minorista": true}, "ids": {"minorista": 267319742}, "vend": "+120 vendidos", "mangos": {"minorista": "combo-ansiedad-por-fitoterapia"}},
  {"n": "COMBO ANTIAGE-LINEAS DE EXPRESION", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/95e2565b-7c28-4d65-88f3-4a8bb675bba4-319bce1480b237703617811360463082-640-0.webp", "d": "COMBO ANTIAGE - LÍNEAS DE EXPRESIÓN Renueva la juventud de tu piel con un cuidado natural y efectivo.\nEste exclusivo combo está formulado con un compuesto natural que combina extractos de caléndula, manzanilla, lavanda y aloe vera , ingredientes reconocidos por su acción regeneradora y calmante. Su fórmula anti age, libre de parabenos y no invasiva, está especialmente diseñada para atenuar líneas de expresión, arrugas y los signos visibles del paso del tiempo.\nLa crema y el contorno de ojos trabajan en sinergia para ofrecer un cuidado profundo y refrescante, promoviendo la regeneración celular y mejorando la textura y elasticidad de la piel. Su acción refrescante aporta una sensación inmediata de bienestar y luminosidad, ideal para pieles que requieren un tratamiento delicado pero efectivo.\nBeneficios destacados: - Combate arrugas y líneas de expresión con ingredientes naturales. - Regenerador celular que revitaliza la piel. - Fórmula sin parabenos, segura y respetuosa con la piel. - Textura ligera que se absorbe fácilmente, ideal para el contorno de ojos. - Acción no invasiva, perfecta para un cuidado diario.\nModo de uso: Aplicar la crema sobre el rostro limpio, realizando suaves masajes circulares hasta su completa absorción. Para el contorno de ojos, utilizar una pequeña cantidad y dar toques suaves con la yema de los dedos, evitando frotar. Repetir a diario, mañana y noche, para mejores resultados.\nDescubre cómo la naturaleza y la ciencia se unen en este combo antiage para preservar la juventud y luminosidad de tu piel con elegancia y eficacia.", "necs": ["packs"], "pr": {"minorista": 20800}, "st": {"minorista": true}, "ids": {"minorista": 274922446}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/95e2565b-7c28-4d65-88f3-4a8bb675bba4-319bce1480b237703617811360463082-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/beneficios-de-antiage-cdd1c0cf56b8ad9b6417811368894898-480-0.webp"], "vend": "+50 vendidos", "mangos": {"minorista": "combo-antiage-lineas-de-expresion"}},
  {"n": "COMBO ARTRITIS 2", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/729e00f7-de06-4abc-812b-ae463a4ab9c6-d0343669320cd6418617846379224648-640-0.webp", "d": "COMBO ARTRITIS 2: Solución Integral para Dolores Articulares Crónicos\nEste combo exclusivo combina la Tintura Madre Mil Hombres y el Ungüento Patologías Crónicas para ofrecer un tratamiento completo tanto por ingesta como por aplicación externa, ideal para quienes sufren de dolores articulares persistentes.\nTintura Madre Mil Hombres Este remedio natural actúa desde el interior, fortaleciendo el organismo y ayudando a aliviar las molestias asociadas a artritis, artrosis y otros problemas articulares crónicos. Su fórmula tradicional cuenta con un prospecto detallado para un uso seguro y eficaz.\nUngüento Patologías Crónicas Especialmente diseñado para atacar los dolores articulares de forma localizada, este ungüento se aplica directamente sobre la piel. Gracias a su composición equilibrada, alivia y mejora la movilidad en zonas afectadas como rodillas, codos, tobillos y columna. Su acción por fricción ayuda a expandir el tejido y activar el flujo sanguíneo, potenciando la recuperación.\nModo de uso recomendado: 1. Tomar la tintura según las indicaciones del prospecto para un efecto sistémico. 2. Aplicar el ungüento con la yema de los dedos en la zona dolorida. 3. Friccionar suavemente con la palma de la mano en movimientos circulares y verticales hasta 3 veces. 4. Para mejores resultados, cubrir la zona con un paño de lana o aplicar calor moderado durante 8 minutos para mantener el calor y favorecer la circulación.\nEste combo es una solución natural y eficaz para quienes buscan mejorar su calidad de vida y reducir el impacto de dolencias articulares crónicas. Aprovechá la sinergia de estos productos y sentí la diferencia.\nDisponible para todo el país, con todas las formas de pago.", "necs": ["packs"], "pr": {"minorista": 14175}, "st": {"minorista": true}, "ids": {"minorista": 272257148}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/729e00f7-de06-4abc-812b-ae463a4ab9c6-d0343669320cd6418617846379224648-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-4b4421d3e514c0d85117846379325557-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "combo-artritis-2"}},
  {"n": "COMBO ARTRITIS HOMEO+FITOTERAPIA", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a0221cfa-48d8-48bf-ae5b-aa79924509a3-27a1351def389745b417842930355995-640-0.webp", "d": "COMBO ARTRITIS HOMEO+FITOTERAPIA\nDescubre el Combo Artritis Homeo + Fitoterapia , una solución integral diseñada para combatir los síntomas de la artritis y mejorar tu calidad de vida. Este tratamiento combina la eficacia de la tintura madre de mil hombres con propiedades fitoterapéuticas antirreumáticas, ofreciendo un enfoque natural y efectivo.\nBeneficios del producto:\nAlivio de los dolores articulares : La combinación de ingredientes activos trabaja en sinergia para reducir las molestias asociadas a la artritis y otras afecciones reumáticas.\nTratamiento de 60 días : Con una ingesta regular, notarás mejoras significativas en un plazo de dos meses.\nProductos con prospecto : Cada combo incluye un prospecto informativo que detalla las instrucciones de uso, asegurando que obtengas el máximo beneficio.\nInstrucciones de uso:\nPara un tratamiento efectivo, se recomienda seguir las indicaciones del prospecto. La tintura madre se debe ingerir en la dosis recomendada, facilitando así su acción en el organismo.\nse toma con 1/4 vaso de agua 20gotas 2 veces al dia , y se conbina con la fitoterapia en te 3 tazas x dia\n1 cucharita por taza, dejar reposar no menos de 85 minutos colar y tomar , endulzar solo con mile o stevia, no azucar)\nAl incorporar el Combo Artritis Homeo + Fitoterapia en tu rutina diaria, no solo estarás eligiendo un producto natural, sino también un aliado en tu bienestar. Este combo es ideal para quienes buscan alternativas más saludables y menos invasivas.\nCompra segura y fácil:\nEste producto está disponible para la compra a través de nuestra tienda en línea, con diversas opciones de pago para tu comodidad. No dejes pasar la oportunidad de mejorar tu bienestar de manera natural.\n¡Transforma tu salud y bienestar con nuestro Combo Artritis Homeo + Fitoterapia", "necs": ["packs"], "pr": {"minorista": 16500}, "st": {"minorista": true}, "ids": {"minorista": 272247861}, "vend": "+30 vendidos", "mangos": {"minorista": "combo-artritis-homeofitoterapia"}},
  {"n": "Combo Calmante Y Restauracion..", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-refrescante-d2c5612c3ecf97f77817813685859898-640-0.webp", "d": "Combo de geles calmantes\ncriogenico : Para impactos, golpes y torceduras apto en deportistas niños y adultos\nGel de aloe vera : para irritaciones y pieles dañadas- restauracion\nante cualquier duda pueden conectarse con nosotros por la via mail en la seccion de contacto o por redes o por wap, estamos a disosicion para guiarlos\nEste producto tiene su explicacion en el dorso del frasco\nfecha de vencimiento en el dorso de la etiqueta\nformas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["packs"], "pr": {"minorista": 9750}, "st": {"minorista": true}, "ids": {"minorista": 229338241}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/cb5b4718-f37d-4126-891b-b6c2ca0c93f6-a02d28ea47d28b4cb517813691152217-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-refrescante-d2c5612c3ecf97f77817813685859898-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-1e1289b98c875ece7817692965016973-480-0.webp"], "vend": "+30 vendidos", "mangos": {"minorista": "combo-calmante-y-restauracion"}},
  {"n": "Combo Dolores En Frío X 2 :Tintura Madre De Árnica + Aceite De Romero Organico", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/0e1e55dd-a910-4922-a35c-a820ff5a817e-e75aec0497ecf50c3d17692599303297-640-0.webp", "d": "Combo Dolores En Frio aceite y tintura de arnica\nEste combo consta de un a ceite De romero organico de prensado en frio\nY una t intura madre de árnica\nMODO DE USO:\nse toma por Ingesta( 5 Gotas) o se aplica de forma Tópica Por Masajes, Muy Bueno Para Masajes En Piernas Por Mala Circulación Sirve Para Estimulacion Con Calor Para Crecimiento De Cabello Colocandolo De Forma Topica. Con Acciones Fungicas En La Ingesta\nEn La Tintura de flores de arnica Se Pasa Sobre La Zona A Trabajar Sin Barrrerla.. Se Expande Sin Friccionar\nTambién Se Puede Usar Por Ingesta 15 Gotas Con 1/4 Vasito De Agua\nAnte Cualquier Duda Pueden Conectarse Con Nosotros Por La Vía Mail\nEste Producto Tiene Su Explicacion En El Dorso Del Frasco y su fecha de vencimiento\nFormas De Pago- Este Producto Se Puede Pagar Con Todas Las Formas De Pago", "necs": ["packs"], "pr": {"minorista": 9750}, "st": {"minorista": true}, "ids": {"minorista": 229338237}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/0e1e55dd-a910-4922-a35c-a820ff5a817e-e75aec0497ecf50c3d17692599303297-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-6d9f2afb121abf885b17692599323831-480-0.webp"], "vend": "+30 vendidos", "mangos": {"minorista": "combo-dolores-en-frio-x-2-tintura-madre-de-arnica-aceite-de-romero-organico-k9xdo"}},
  {"n": "Combo Dolores ( Ideal Masajistas-traumatologos) Coca+cannabis+árnica/+romero+jarilla+aguaribay", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/60ffe1cb-1e99-489a-926b-fd1134990f69-cf24a02be019edf7b117842908448648-640-0.webp", "d": "Combo Dolores doble unguento premium\n( ideal masajistas-traumatólogos-kinesiólogos)\ncoca+cannabis+árnica alcanfor+jengibre/\n+romero, jarilla ,aguaribay, arnica y alcanfor\nEste combo consta de dos ungüentos potentes,\nel primero coca cannabis , árnica con jengibre y alcanfor y cera de abeja\nel segundo contiene árnica, romero, jarrilla, aguaribay con jengibre y alcanfor, cera de abeja\nAccion Terapeutica:\nExpansión de tejido-calmante-mejora movimiento articulatorio\nModo de uso:\nEstos ungüentos son excelentes para masajes por expansión de tejido,\nse debe untar con la yema del dedo en la zona a trabajar y\nluego con una presión leve pero constante se debe friccionar\ncon la zona externa de la palma de la mano, trabajan por expancion de tejido y calor\nSe usan para problemas de índole articulatorio. artrosis-artritis-ciático lumbar-hernias-rectificaciones cervicales-espalda-\nrodillas-manguito rotador.\nAnte cualquier duda pueden conectarse con nosotros\npor la vía mail en la sección de contacto o por redes o por whatsapp\nla idea siempre es acompañarlos con los brazos abiertos\nEste producto tiene su explicacion en el dorso del frasco y fecha de vencimiento\nformas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["packs"], "pr": {"minorista": 18560}, "st": {"minorista": true}, "ids": {"minorista": 229338230}, "rat": {"n": 4, "avg": 5.0}, "vend": "+310 vendidos", "mangos": {"minorista": "combo-dolores-ideal-masajistas-traumatologos-cocacannabisarnica-romerojarillaaguaribay-73unq"}},
  {"n": "COMBO ESTOMACAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-esromacal-eddb893b34d78c285517581076925964-640-0.webp", "d": "Combo Estomacal - Fitoerapia Natural para la Salud Renal\nDescripción del Producto:\nEl Combo Estomacal es una combinación poderosa de ingredientes naturales, diseñado para apoyar el funcionamiento saludable de los riñones y desinfectar las vías urinarias. Este producto integra la tintura madre de carqueja con una mezcla de plantas medicinales que incluyen llantén, palo pichi, yerba meona, yerba de la piedra, cola de caballo, turca, ortiga, parietaria, uva ursi y verónica .\nBeneficios:\nFitoerapia de Cálculos Renales: Los ingredientes del Combo Estomacal ayudan a prevenir y tratar los cálculos renales, promoviendo una correcta función renal.\nDesinfección de Vías Urinarias: Gracias a su composición, este producto actúa como un desinfectante natural, ayudando a mantener las vías urinarias limpias y saludables.\nActivación de Funcionamiento Renal: Con su formulación, el Combo Estomacal potencia el rendimiento de los riñones, favoreciendo la eliminación de toxinas y desechos del organismo.\nInstrucciones de Uso:\nPara disfrutar de los beneficios de este producto, se recomienda tomar una dosis de tintura madre de carqueja diluida en agua, 20 GOTAS según las indicaciones , Y ALTERNAR 2 tasas diarias de la fitoterapia 2 veces al dia 10 minutos de reposo\nPrecauciones:\nConsultar a un médico antes de comenzar cualquier tratamiento fitoterapéutico, especialmente si se está bajo tratamiento médico o se padecen condiciones preexistentes.\nFormas de Pago:\nEl Combo Estomacal puede ser adquirido mediante diversas opciones de pago, facilitando su acceso a todos los interesados en mejorar su salud renal.\nTransforma tu bienestar con el Combo Estomacal y aprovecha los beneficios de la fitoterapia para una vida más saludable.", "necs": ["packs"], "pr": {"minorista": 10400}, "st": {"minorista": true}, "ids": {"minorista": 272258311}, "vend": "+30 vendidos", "mangos": {"minorista": "combo-estomacal"}},
  {"n": "COMBO gripe- UNGUENTO + TE", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-gripe-f5e630998ac65c221117813542135038-640-0.webp", "d": "COMBO UNGUENTO VICK + TE CALIENTE\nDescubre el Combo Ungüento Vick Pecho Habitad Natural para combatir resfriados, tos y catarro. Este producto combina la efectiva acción del ungüento Vick con un delicioso té caliente que te ayudará a sentirte mejor en momentos de malestar.\nAcción Terapéutica: El ungüento Vick, conocido por sus propiedades descongestionantes, se aplica directamente en el pecho y la espalda. Su formulación permite aliviar la congestión y facilitar la respiración, mientras que el calor del té proporciona un efecto reconfortante y ayuda a mantenerte hidratado.\nInstrucciones de Uso: Aplica una pequeña cantidad de ungüento en el pecho y frota suavemente hasta que se absorba. Para maximizar los efectos, disfruta de una taza de té caliente después de aplicar el ungüento. Esto potenciará su acción y te brindará una sensación de bienestar.\nNo dejes que el resfriado te detenga. ¡Prueba nuestro combo y respira aliviado!\nCONTIENE : 1 UNGUENTO FRASCO VIDRIO X 40GRS + UNA FITOTERAPIA EN TE SOBRE", "necs": ["packs", "respiracion"], "pr": {"minorista": 8900}, "st": {"minorista": true}, "ids": {"minorista": 276305576}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/31532b3b-c491-4d42-9acf-8c5700c9cfa2-4dba39b10e8285938517813552329217-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-gripe-f5e630998ac65c221117813542135038-480-0.webp"], "mangos": {"minorista": "combo-unguento-te-qm477"}},
  {"n": "COMBO HEPATICO FITOTERAPIA", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/bacef18f-f278-4bb2-afd4-a2a6f22f871d-bb4216e56abec3108c17810399643633-640-0.webp", "d": "💚 Combo Hepático Fitoterapéutico – Habitad Natural 💚 Un blend natural en hebras pensado para acompañar tu bienestar digestivo y hepático. 🌿 Incluye Té Rojo con Canela + Té Digestivo Hepático. ✨ Elaborado con hierbas nobles: peperina, poleo francés, cocú, incacuyo, boldo, tomillo, paico, cáscara de naranja, congorosa y espina colorada. ☕ Modo de uso : 1 cucharada por taza, hervir 1 minuto. 🕒 Tomar 3 tazas al día, durante el día o después de las comidas.\nUna infusión para equilibrar y depurar naturalmente. TRABAJA POR ENCIMA INSTETINAL", "necs": ["packs"], "pr": {"minorista": 4800}, "st": {"minorista": true}, "ids": {"minorista": 272214211}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/bacef18f-f278-4bb2-afd4-a2a6f22f871d-bb4216e56abec3108c17810399643633-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-hepatico-por-fitoterapia-6d6007123e8b5069fb17810405274948-480-0.webp"], "vend": "+290 vendidos", "mangos": {"minorista": "combo-hepatico-fitoterapia"}},
  {"n": "combo invierno-protección para un bienestar natural -mejora de forma natural", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-05-16t194141-300-5e9aa204a04062f0a017789716632066-640-0.webp", "d": "Combo Invierno - Protección para un Bienestar Natural\nDescubrí el Combo Invierno , especialmente diseñado para cuidar tu salud de manera natural durante la temporada fría. Este conjunto incluye tinturas madre , blends de té y Vick pecho grande , combinados para brindarte múltiples beneficios que mejoran tu bienestar general.\nPropiedades y beneficios\nExpectorante natural: Las tinturas madre y el Vick ayudan a despejar las vías respiratorias, facilitando la expulsión de mucosidad y aliviando la congestión.\nCalma la tos y el dolor de garganta: Ingredientes seleccionados para suavizar irritaciones y reducir la frecuencia de la tos.\nMejora las defensas: Los blends de té contienen mezclas de hierbas que fortalecen el sistema inmunológico, ayudándote a enfrentar mejor los virus y bacterias propios del invierno.\ncontiene:\n2 vick pecho/1 tintura de uña de gato/tintura de ambay/barba de piedra/anacahuita\n1/blens contra la gripe/1 antiasmatica/ 1 expectorante/1 pulmonaria\n¿Cómo usarlo?\nTinturas madre: Tomá la dosis recomendada para potenciar tus defensas y apoyar la recuperación respiratoria.\nBlends de té: Prepará una infusión caliente y disfrutá de sus efectos calmantes y revitalizantes.\nVick pecho: Aplicalo en el pecho o espalda para un alivio inmediato y prolongado de la congestión y la tos.\nEste combo es ideal para quienes buscan una alternativa natural y efectiva para cuidarse en épocas de frío, manteniendo el cuerpo protegido y confortable.\nDetalles del producto\nProducto elaborado con ingredientes naturales de alta calidad.\nPresentación conveniente para facilitar su uso diario.\nPerfecto para toda la familia.\nGarantizá tu bienestar esta temporada con el Combo Invierno - Protección para un Bienestar Natural y enfrentá el invierno con la mejor defensa natural.\nForma parte de quienes eligen cuidarse con productos naturales y efectivos. ¡Hacé tu pedido ahora y disfrutá de un invierno más saludable", "necs": ["packs", "respiracion"], "pr": {"minorista": 47000}, "st": {"minorista": true}, "ids": {"minorista": 344594335}, "mangos": {"minorista": "combo-invierno-proteccion-para-un-bienestar-natural-mejora-de-forma-natural-1l0dg"}},
  {"n": "Combo Masajes-con Canela Cúrcuma Jengibre Y Alcanfor + Tintura De Árnica", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-masajes1-854d45feff45cdb76217813468068820-640-0.webp", "d": "Combo Masajes UNGUENTO+ TINTURA\nCONTENIDO :\nUNGÚENTO para masajes de calambres y contracturas + una TINTURA MADRE\n(UNGÚENTO)- cúrcuma canela jengibre alcanfory árnica c/cera de abeja\n(TINTURA)- flores de árnicas con romero e tintura madre, apto para ingesta o uso tópico\nla ingesta de la tintura es 10 gotas en 1/4 vasode agua.(base alcohol cereal)\nMODOS DE USO :\nEl unguento es para masajes para calambres y contracturas en cervicales o espalda alta támbien en piernas , muy bueno para personas con calambres generando calor y expandiendo los tejidos..\nen personas con mucha inflamacion se usa la tintura madre de flores de arnica y romero. esta es en estado frio hidrohalcólica, se pasa sobre la zona inflamada sin barrerla , una vez que la persona este mejor de la inflamación se puede untar el unguento, si hubiera inflamacion no se debe usar el unguento primero para no estimular la inflamación.\neste producto tiene su explicacion en el dorso del frasco y fecha de vencimiento\nAnte cualquier duda pueden conectarse con nosotros por la via mail y wap sap", "necs": ["dolor", "packs"], "pr": {"minorista": 12750}, "st": {"minorista": true}, "ids": {"minorista": 229338235}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/2fb1c216-2554-41ad-a5a2-71cd168543dd-5b3a711f6cb73c62af17678231959778-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-masajes1-854d45feff45cdb76217813468068820-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/f68e5d3f-f710-437a-8d70-c1f29d837527-6bbe912b93b50501bc17813468107526-480-0.webp"], "vend": "+40 vendidos", "mangos": {"minorista": "combo-masajes-con-canela-curcuma-jengibre-y-alcanfort-tintura-de-arnica"}},
  {"n": "COMBO NUTRICION-ALMENDRAS", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/679e6f5b-1670-4b0a-930d-90b6e1959b1c-80274592e1d7c1969717759560492721-640-0.webp", "d": "COMBO NUTRICION-ALMENDRAS\nDescubre el poder de la Crema de Almendras combinada con Aceite de Almendras , un dúo perfecto que nutre profundamente tu piel. Estas fórmulas ricas en nutrientes y aromas envolventes son ideales para revitalizar y humectar tu dermis, dejándola suave y radiante.\nBeneficios : - Hidratación intensa : La crema y el aceite se complementan para ofrecer una humectación duradera. - Aroma delicioso : Disfruta de una experiencia sensorial única que transformará tu rutina de cuidado personal.\nModo de uso : Aplica la crema en movimientos circulares hasta su completa absorción, seguido del aceite para sellar la hidratación.\nPara consultas, no dudes en contactarnos a través de nuestro e-mail o redes sociales. Estamos aquí para acompañarte en cada paso de tu cuidado.\nFormas de pago : Aceptamos todas las modalidades de pago para tu comodidad.", "necs": ["dolor", "packs"], "pr": {"minorista": 19400}, "st": {"minorista": true}, "ids": {"minorista": 264902701}, "vend": "+20 vendidos", "mangos": {"minorista": "combo-nutricion-almendras"}},
  {"n": "Combo Para Contornos De Ojos Gel Criogénico +argan+aceite De Zanahoria+lavanda+coco+calendula", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a2afa913-b5d3-4fe7-8ea1-35d7b9595296-4b34380a449de2e1c617833053268144-640-0.webp", "d": "Combo Ojos Criogénico + Regenerador celular\nUno es un gel criogénico para zonas inflamadas de colocacion diurna..o nocturna\nse usa para zonas inlflamadas patitas de gallo pequeñas rosaceas irritacion de pómulos\nbolsitas sobre los ojos\nel otro es un regenerador celular efecto natural de 5 aceites\nSu uso es nocturno contorno de ojos para trabajar la restauracion de tejido celular\ngel diurno CRIOGENICO contiene: argan zanahoria vitamina (e ) menta ,mentol..\naceites nocturnos REGENERADOR CELULAR contiene: argán zanahoria lavanda coco caléndula flores, manzanilla, extracto ciglogico de aloe vera ,extracto anti age , anti -acné, ante\nBENEFICIOS:\nREDUCE LINEAS DE EXPRESION\nHIDRATA PROFUNDAMENTE\nREGENRA LA PIEL\nILUMINA LA MIRADA\nREDUCE BOLSITAS DE LOS OJOS", "necs": ["packs"], "pr": {"minorista": 15000}, "st": {"minorista": true}, "ids": {"minorista": 229338233}, "rat": {"n": 5, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/49f6b7d4-d3ba-48b4-ba08-87261b16afc6-702978bd5aadcec50917809665607313-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a2afa913-b5d3-4fe7-8ea1-35d7b9595296-4b34380a449de2e1c617833053268144-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-contorno-ojos-7977da6ebe437f3a3b17809629465747-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-9beb94fcfc2c4aad6b17693820579588-480-0.webp"], "vend": "+190 vendidos", "mangos": {"minorista": "combo-para-contornos-de-ojos-gel-criogenico-arganaceite-de-zanahorialavandacococalendula"}},
  {"n": "COMBO PARA PROBLEMAS Y PROTECCION DE LA DERMIS", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-calndula-sanalotodo-3fe1c649d45cee330417811412281349-640-0.webp", "d": "COMBO PROTEGE LA DERMIS\nDescripción del Producto:\nEl Combo Proteje la Dermis es una combinación única de crema de flores de caléndula , extracto de zanahoria , lavanda y un bálsamo Sanalotodo con 5 hierbas especializadas para tratar problemas dermatológicos. Ideal para combatir afecciones como acné , urticaria , heridas , alergias , quemaduras y otras lesiones cutáneas.\nAcción Terapéutica:\nEsta fórmula innovadora promueve la restauración de la piel , ayudando a calmar irritaciones y a regenerar el tejido celular. Su acción hidratante y antiinflamatoria la convierte en un aliado esencial para mantener tu dermis saludable y protegida.\nModo de Uso:\nAplica la crema sobre la zona afectada realizando movimientos circulares hasta que se absorba completamente. Repite según sea necesario para obtener resultados óptimos.\nAsesoramiento Personalizado:\nAnte cualquier consulta, no dudes en contactarnos a través de nuestro correo electrónico, redes sociales o WhatsApp. Estamos aquí para acompañarte en tu camino hacia una piel más saludable.\nFormas de Pago:\nEste producto admite todas las formas de pago disponibles, facilitando tu compra.\n¡Cuida tu piel con el Combo Proteje la Dermis", "necs": ["packs"], "pr": {"minorista": 15500}, "st": {"minorista": true}, "ids": {"minorista": 264902578}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/8629d102-4d01-4cb4-8307-80e0d125d8cc-29568e7f356d3b534c17811422223574-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-calndula-sanalotodo-3fe1c649d45cee330417811412281349-480-0.webp"], "vend": "+40 vendidos", "mangos": {"minorista": "combo-para-problemas-y-proteccion-de-la-dermis"}},
  {"n": "COMBO PIEL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-pieles-72587b196271a4738f17812266130175-640-0.webp", "d": "Combo Piel -flores de caludula puras + semillas de jojoba\nAceites Naturales para Cuidado Integral\nDescubrí el Combo Piel , una combinación exclusiva de dos aceites vegetales 100% naturales que aportan múltiples beneficios tanto para la piel como para el cabello. Este set está compuesto por:\nAceite de flores de caléndula con lavanda orgánica\nAceite de jojoba puro\nBeneficios y Propiedades\nLas flores de caléndula y lavanda , presentes en el primer aceite, son reconocidas por sus propiedades reparadoras y regeneradoras celulares . Se pueden aplicar directamente sobre la piel para tratar heridas, irritaciones y distintos problemas cutáneos, acelerando la cicatrización y calmando inflamaciones.\nEl aceite de jojoba, por su parte, es un potente hidratante y nutritivo para piel y cabello . Su fórmula natural ayuda a equilibrar la producción de sebo, previene la sequedad y fortalece el folículo piloso, otorgando brillo y vitalidad.\nModo de Uso\nPara la piel , aplicar el aceite de caléndula con manzanilla directamente sobre la zona afectada, realizando un suave masaje hasta su completa absorción.\nEl aceite de jojoba puede usarse diariamente en rostro, cuerpo y cuero cabelludo para mantener la hidratación y salud general.\nAmbos aceites son ideales también como principios activos para fabricar tus propios productos cosméticos , ya que no contienen componentes sintéticos ni dañinos.\nPor qué elegir nuestro Combo Piel\nEste combo es una opción natural y efectiva para quienes buscan cuidar su piel y cabello con productos de calidad, elaborados con ingredientes orgánicos y libres de químicos. Aprovechá los beneficios de estos aceites vegetales y potenciá tu rutina de cuidado personal con una solución segura y versátil.\nContenido: Aceite de caléndula con lavanda orgánica + Aceite de jojoba puro Origen: Producto natural, sin aditivos sintéticos Presentación: Frascos cosméticos aptos para fácil aplicación\nTransformá tu rutina de cuidado con el Combo Piel, el aliado natural para una piel y cabello saludables.", "necs": ["packs"], "pr": {"minorista": 13120}, "st": {"minorista": true}, "ids": {"minorista": 229338238}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/6335b980-ebbd-45d1-98ae-0844a43119c9-2dd574863cfb57b2b217812266308038-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-pieles-72587b196271a4738f17812266130175-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-c1d09ee07fd5dcb39517692566129829-480-0.webp"], "vend": "+40 vendidos", "mangos": {"minorista": "combo-piel"}},
  {"n": "COMBO PIERNAS CANSADAS", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-piernas-cansadas-ef220c739d4a2910d717813525944272-640-0.webp", "d": "COMBO PIERNAS CANSADAS: Alivio y frescura para tu cuerpo\n¿Sufrís de piernas cansadas , contracturas o inflamaciones después del ejercicio o una larga jornada? Nuestro Combo Piernas Cansadas es el aliado perfecto para vos. Formulado con geles relajantes musculares que combinan acción tíbia y criogénica , actúa eficazmente contra golpes , esguinces y contracturas .\nEste combo incluye geles refrescantes e hipoalergénicos , ideales para deportistas, personas de la tercera edad y quienes requieren un cuidado especial. Su fórmula avanzada mejora la circulación y reduce la inflamación, brindándote una sensación de alivio duradero.\nBeneficios clave: - Alivio inmediato para piernas cansadas e inflamadas - Acción dual: calor suave y efecto frío para acelerar la recuperación - Seguro para pieles sensibles y uso diario\nRecuperá tu bienestar y disfrutá cada paso con el Combo Piernas Cansadas . ¡Tu cuerpo te lo agradecerá", "necs": ["packs"], "pr": {"minorista": 11250}, "st": {"minorista": true}, "ids": {"minorista": 284963989}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/ba216fe6-3024-48c6-bc5a-aab30de9daa6-54df178fb44461bad317581170357444-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-piernas-cansadas-ef220c739d4a2910d717813525944272-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/masaje_sueco_ecopostural-44131351d8b54c5b9817581170695229-480-0.webp"], "vend": "+20 vendidos", "mangos": {"minorista": "combo-piernas-cansadas"}},
  {"n": "Combo Premium de Ungüentos para Articulaciones y Músculos – 100 g c/u", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/1766514b-064a-4463-ba5c-e4a847f7dddc-3378be46a876f2edba17842905034792-640-0.webp", "d": "COMBO UNGUENTOS COMPLETO! PARA DOLORES CRONICOS ARTICULARES O MUSCULARES\nDescripción del Producto:\nDescubre el COMBO UNGUENTOS COMPLETO , una solución diseñada para proporcionar alivio integral en patologías crónicas y cuidar del tejido muscular . Este combo incluye opciones de coca y cannabis para quienes enfrentan casos más severos, brindando un enfoque natural y efectivo.\nComponentes Clave:\nCoca y Cannabis : Estos ingredientes son reconocidos por sus potentes propiedades antiinflamatorias y analgésicas, ideales para el tratamiento de dolores intensos.\nFlores de árnica, romero , jarilla, aguaribay ,Jengibre y Alcanfor : Conocidos por sus cualidades para mejorar la circulación y reducir la inflamación, complementan perfectamente la acción de los otros ingredientes.\ncanela y cúrcuma\nTejido Muscular : Formulados para favorecer la recuperación y fortalecer las áreas afectadas, este combo es ideal tanto para deportistas como para quienes padecen lesiones.\n117grs cada uno aprox\nModo de Uso:\nAplica una cantidad apropiada sobre la zona afectada.\nRealiza un masaje suave hasta que el ungüento se absorba completamente.\nSe recomienda cubrir la zona con un paño de lana para mantener el calor, lo que potenciará la circulación sanguínea y acelerará el proceso de recuperación.\nAcción Terapéutica:\nEste combo no solo alivia el dolor, sino que también promueve la restauración del tejido celular y mejora la movilidad. Es una opción excelente para quienes sufren de enfermedades crónicas o lesiones musculares.\nal Cliente:\nSi tienes alguna duda, no dudes en contactarnos a través de correo electrónico, redes sociales o WhatsApp. Estamos aquí para ofrecerte el soporte que necesitas.\nFormas de Pago:\nEl COMBO UNGUENTOS COMPLETO es accesible a través de diversas opciones de pago, facilitando así tu compra y experiencia.\n¡No esperes más! Mejora tu calidad de vida con el COMBO UNGUENTOS COMPLETO hoy mismo.", "necs": ["dolor", "packs"], "pr": {"minorista": 26580}, "st": {"minorista": true}, "ids": {"minorista": 264853608}, "rat": {"n": 4, "avg": 5.0}, "vend": "+440 vendidos", "mangos": {"minorista": "combo-unguentos-completo-x-100grs-c-u-rjbf8"}},
  {"n": "Combo Proteccion Energias Malas", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2025-12-04t124815-406-9066f73aedef3b526517648633047948-640-0.webp", "d": "Descubrí el Combo Protección Energías Malas , la combinación perfecta para mantener tu entorno lleno de armonía y tranquilidad. Este set incluye:\nBruma Áurica x 250cc : diseñada especialmente para repeler la envidia y el enojo, creando un escudo energético que protege tu espacio de las malas vibras y energías negativas.\nPerfume relajante : con una fórmula que ayuda a reducir el cortisol y baja la ansiedad, aportando calma y equilibrio en momentos de alta tensión o reuniones numerosas.\nIdeal para quienes buscan armonización, paz y protección en ambientes donde hay mucha interacción social. Su acción ayuda a neutralizar las energías dañinas del entorno y promueve un estado de serenidad, facilitando la convivencia y el bienestar general.\nEste combo es tu aliado para espacios de trabajo, reuniones familiares o cualquier lugar donde quieras mantener un ambiente positivo y libre de malas energías.\n¡Protegé tu energía y sentí la diferencia!\nModo de uso: rociá la bruma en el ambiente y sobre tu cuerpo para activar la protección. Aplicá el perfume en puntos de pulso para una sensación profunda de relajación y equilibrio emocional.\nHecho en Argentina con ingredientes seleccionados para cuidar tu bienestar energético y emocional.", "necs": ["packs"], "pr": {"minorista": 12000}, "st": {"minorista": true}, "ids": {"minorista": 311146552}, "vend": "+30 vendidos", "mangos": {"minorista": "combo-proteccion-energias-malas-ii0mh"}},
  {"n": "COMBO PSORIASIS", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/295bfed1-6135-4ecc-a14f-bd3c457d6a6d-55f75337b5c577c23b17758368564326-640-0.webp", "d": "COMBO SORIASIS\nEl Combo Soriasis es un tratamiento integral diseñado para combatir los efectos de la psoriasis de manera efectiva a través de la fitoterapia. Este producto combina ingredientes naturales que favorecen la salud de la piel y promueven una rápida recuperación.\nComponentes Clave: Nuestro combo incluye una crema especializada que contiene vitaminas E y D , junto con extractos de caléndula , manzanilla , zanahoria y aloe vera . con manteca de palta, manteca de manzanilla .Estos ingredientes están seleccionados por sus propiedades regenerativas y humectantes, que ayudan a restaurar el tejido celular en la dermis.\nFITOTERAPIA: es un te con una dosis diaria de 3 tasas x dia , (le medida de media tasa) ingredientes: bardana, enula campana , baila bien ,malva ,llanten, manzanilla,fumaria,sanalotodo\npara: placas escematosas,piel seca y agrietada,ardor,prurito, picazon,\nModo de Uso: Para obtener los mejores resultados, aplique la crema de forma circular sobre la zona afectada hasta lograr una humectación completa. Se recomienda realizar este procedimiento varias veces al día según sea necesario.\nAcción Terapéutica: El Combo Soriasis está formulado para disminuir la picazón y el daño celular, promoviendo un alivio significativo en las áreas afectadas. Su uso constante puede resultar en una mejora notable de la condición de la piel.\nal Cliente: Si tiene alguna duda o consulta acerca de este producto, no dude en contactarnos a través de nuestras redes sociales, correo electrónico o WhatsApp. Estamos aquí para acompañarlo en su tratamiento con la mejor posible.\nFormas de Pago: Este producto se puede abonar a través de todas las formas de pago disponibles.\n¡Descubra la efectividad de la fitoterapia en el cuidado de su piel con el Combo Soriasis", "necs": ["packs"], "pr": {"minorista": 19200}, "st": {"minorista": true}, "ids": {"minorista": 264910384}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/295bfed1-6135-4ecc-a14f-bd3c457d6a6d-55f75337b5c577c23b17758368564326-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-04-10t113848-101-b0f93b6a689aa2f50c17758369352151-480-0.webp"], "vend": "+80 vendidos", "mangos": {"minorista": "combo-soriasis"}},
  {"n": "COMBO VARICES CREMA 100cc + FITOTERAPIA", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/84447aac-cf68-4dc2-b382-28b980d5597a-c25652862871deda7e17810422488334-640-0.webp", "d": "Combo Varices Crema + Fitoterapia\nIngredientes Clave:\nCrema para varices que combina la potencia del hamamelis , romero y centella asiática . Estos ingredientes son conocidos por sus propiedades beneficiosas para mejorar la circulación sanguínea y reducir la apariencia de las varices. tambien contiene manteca de palta manteca de manzanillo y manteca de centella asiatica para ayudar a retener humedad y darle ese tiempo que necesita los tejidos para su restauracion\nModo de Uso:\nAplique la crema de forma circular sobre la zona afectada hasta que se absorba completamente. Se recomienda usarla diariamente para obtener mejores resultados. hasta 3 veces al dia, en varices muy dilatadas , se puede colocar una hora antes en la heladera y usarla en estado frio, para ayudar mas a la desinflamacion en la zona . este producto va con su prospecto, recordamos que no todas las varices son iguales , y ademas requieren de acompañamiento alimenticio y ejercicio cardiovascular\nAcción Terapéutica:\nEste combo no solo ayuda a aliviar la incomodidad asociada a las varices, sino que también promueve la salud vascular a través de la fitoterapia. Los extractos naturales trabajan en sinergia para fortalecer las venas y mejorar la elasticidad de la piel.\nSi tiene alguna consulta, no dude en contactarnos por e-mail o a través de nuestras redes sociales. Estamos aquí para ayudarlo.\nFormas de Pago:\nEste producto está disponible para todas las formas de pago.", "necs": ["dolor", "packs"], "pr": {"minorista": 16800}, "st": {"minorista": false}, "ids": {"minorista": 265076596}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/84447aac-cf68-4dc2-b382-28b980d5597a-c25652862871deda7e17810422488334-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-7-a9c44b5c92503f23ba17755169298579-480-0.webp"], "vend": "+70 vendidos", "mangos": {"minorista": "combo-varices-crema-fitoterapia"}},
  {"n": "combo vick+tintura anacahuita", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-vick-tintura-6c9c3ffe91d97e619017581084508408-640-0.webp", "d": "Combo Vick + Tintura Madre de Anacahuita: Alivio Natural para Tos, Asma y Resfríos\nEste combo combina la eficacia tradicional del Vick Pectoral con la poderosa tintura madre de anacahuita, una planta reconocida en la medicina natural argentina por sus propiedades expectorantes y antiinflamatorias.\n¿Para qué sirve? Ideal para aliviar la tos, el asma leve, los estados gripales y resfríos. La tintura madre de anacahuita actúa suavizando las vías respiratorias, mientras que el Vick ayuda a despejar el pecho, facilitando la respiración.\nModo de uso: - Aplicar Vick en el pecho y espalda para activar su efecto descongestivo. - Tomar tintura madre de anacahuita según indicación, para potenciar el alivio natural.\nEste combo es una opción efectiva y complementaria para el cuidado respiratorio, especialmente en temporadas frías o cuando aparecen síntomas gripales. Recuerda consultar siempre con un profesional de la salud antes de iniciar cualquier tratamiento.\n¡Cuida tu respiración con la fuerza de la naturaleza y la confianza del Vick", "necs": ["packs", "respiracion"], "pr": {"minorista": 13500}, "st": {"minorista": true}, "ids": {"minorista": 276627193}, "mangos": {"minorista": "combo-vicktintura-anacahuita"}},
  {"n": "combo x 2 vick-pecho invierno X 90grs c/u", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/fed47233-d0fa-4aad-915b-d7feb82d0ce9-9b28ea6a9871e6354317843930808202-640-0.webp", "d": "Combo x 2 Vick-Pecho Invierno\nLa pomada Vick-Pecho es la solución ideal para aliviar la tos, el asma, el resfrío y el catarro, apta para niños y adultos. Su fórmula combina ingredientes naturales como tomillo, romero, menta, eucalipto y alcanfor , que actúan en sinergia para facilitar la respiración y calmar las molestias en el pecho.\nAcción Terapéutica: Su aplicación proporciona un efecto descongestivo y calmante, ayudando a despejar las vías respiratorias y mejorar el descanso durante los episodios de congestión.\nModo de Uso: Aplica una cantidad moderada sobre el pecho y la espalda, masajeando suavemente hasta su absorción. Para potenciar el efecto, se recomienda cubrir la zona con una prenda abrigada, especialmente antes de dormir.\nVentajas del Combo: Este pack por 2 unidades te asegura tener siempre a mano este remedio natural durante el invierno, ideal para toda la familia. No permitas que la tos o el resfrío afecten tu bienestar, ¡respirá mejor con Vick-Pecho", "necs": ["packs", "respiracion"], "pr": {"minorista": 13000}, "st": {"minorista": true}, "ids": {"minorista": 276626744}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/fed47233-d0fa-4aad-915b-d7feb82d0ce9-9b28ea6a9871e6354317843930808202-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-b30fda9fda0fb8e0b317843930813164-480-0.webp"], "vend": "+50 vendidos", "mangos": {"minorista": "combo-x-2-vick-pecho-invierno-x-90grs-c-u-d4h36"}},
  {"n": "Conos Cascadas x 3 unidades", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/conos-cascada-d8fdfd256aaece129917271840464373-640-0.webp", "d": "Conos Cascadas x 3 unidades - Buena Defumación Aromática\nDescubre la magia de nuestros Conos Cascadas , una opción ideal para quienes buscan una defumación pura y aromática . Cada pack incluye tres unidades cuidadosamente elaboradas con una mezcla de aromas relajantes que transformarán tu ambiente.\nAromas Destacados:\nEsencia de la India\nPimpollo de Jazmín\nFrutilla\nVainilla\nMango\nChampa\nRosa\nLavanda\nMil Flores\nEnergía Limpia\nPalo Santo\nSándalo\nCada cono está diseñado para ofrecer una experiencia sensorial única, ideal para meditación, relajación o simplemente para disfrutar de un espacio más acogedor.\nal Cliente\nAnte cualquier duda, pueden conectarse con nosotros a través de e-mail en la sección de contacto, redes sociales. Estamos aquí para acompañarlos con los brazos abiertos.\nFormas de Pago\nEste producto se puede pagar con todas las formas de pago disponibles. ¡No esperes más para disfrutar de estos maravillosos aromas", "necs": ["aromas"], "pr": {"minorista": 400}, "st": {"minorista": true}, "ids": {"minorista": 229337643}, "opcion": "Integraciones", "vars": [{"id": 1022309180, "n": "Escencia De La India", "p": 500, "s": true}, {"id": 1022309182, "n": "Frutilla", "p": 500, "s": true}, {"id": 1022309183, "n": "Vainilla", "p": 500, "s": true}, {"id": 1022309184, "n": "Lavanda", "p": 500, "s": true}, {"id": 1022309185, "n": "Violeta", "p": 500, "s": true}, {"id": 1022309186, "n": "Sandalo", "p": 500, "s": true}, {"id": 1022309189, "n": "Palo Santo", "p": 500, "s": true}, {"id": 1022309192, "n": "Mil Flores", "p": 500, "s": true}, {"id": 1022309195, "n": "Energía Limpia", "p": 500, "s": true}, {"id": 1022309199, "n": "Mango", "p": 500, "s": true}, {"id": 1022309203, "n": "Champa", "p": 400, "s": true}], "vend": "+10 vendidos", "mangos": {"minorista": "conos-cascadas-x-3-unidades"}},
  {"n": "Crema de Almendras para Nutrición e Hidratación de la Piel – 100 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-9-bd5e14cb869e46461317759525371820-640-0.webp", "d": "CREMA DE ALMENDRAS X 100grs\nBeneficios de la crema de almendras para la salud Es rica en grasas saludables que promueven la salud del corazón. Proporciona una buena dosis de proteínas vegetales para el desarrollo muscular y la reparación celular.\nEsta crema es apta para todo tipo de pieles se puede usar en cuerpo rostro y manos, de riquisimo aroma en frasco de vidrio\nPRESENTACION frasco vidrio ambar x 100 grs con tapa inhibidora", "necs": ["dolor", "piel"], "pr": {"distribuidor": 11900, "minorista": 17000, "mayorista": 13600}, "st": {"distribuidor": true, "minorista": true, "mayorista": true}, "ids": {"distribuidor": 328624283, "minorista": 229337989, "mayorista": 229338094}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/33652b1d-dd97-432a-9d71-25580ac19e8b-acb7aa875c0374fa8917759525506552-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-4a51d2a464624eab7717759525788680-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/f5cd7f3c-e6bb-4d7a-873e-5beec5214b8f-614838581ce0dc69d617759525414063-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-8-67152aa9a3f91d202817759525461068-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-9-bd5e14cb869e46461317759525371820-480-0.webp"], "vend": "+50 vendidos", "mangos": {"distribuidor": "crema-de-almendras-natural-por-100cc-habitad-natural-negocios-distribuidor-i52ar", "minorista": "crema-de-almendras-natural-por-100cc-habitad-natural", "mayorista": "crema-de-almendras-natural-por-100cc-publicacion-mayorista"}},
  {"n": "Crema de Almendras para Nutrición e Hidratación de la Piel – 50g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-96-038ca3cfaab7a7bc7817596241644404-640-0.webp", "d": "CREMA DE ALMENDRAS X 100grsv\nBeneficios de la crema de almendras para la salud Es rica en grasas saludables que promueven la salud del corazón. Proporciona una buena dosis de proteínas vegetales para el desarrollo muscular y la reparación celular.\nEsta crema es apta para todo tipo de pieles se puede usar en cuerpo rostro y manos, de riquisimo aroma en frasco de vidrio\nAnte cualquier duda pueden conectarse con nosotros por la via mail en la seccion de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nPRESENTACION frasco vidrio ambar x 100cc con tapa inhibidora", "necs": ["dolor", "piel"], "pr": {"mayorista": 7000, "distribuidor": 6300, "minorista": 9000}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 298195873, "distribuidor": 326140897, "minorista": 298168107}, "vend": "+10 vendidos", "mangos": {"mayorista": "crema-de-almendras-natural-por-50cc-habitad-natural-mayorista-unicamente", "distribuidor": "crema-de-almendras-natural-por-50cc-habitad-natural-negocios-distribuidor-1kfxv", "minorista": "crema-de-almendras-natural-por-50cc-habitad-natural"}},
  {"n": "Crema de Caléndula, Manzanilla y Árbol de Té para la Piel – 100 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/d97b494e-9d1b-4a7f-844b-30e8b22e5279-5e106f6ba3f06b130a17755049593682-640-0.webp", "d": "CREMA DE FLORES DE CALENDULA ORGANICA X 100GRS\nLa crema de caléndula con manzanilla y te-tree es muy buena para hidratar la piel , siendo restauradora celular , es apta para niños, se puede usar en quemaduras de primer grado , también para personas con irritabilidad en zonas inguinales, pequeñas rosaceas manchitas lastimaduras en la dermis enrojecimiento acne. para casos de mucha irritacion aconsejamos colocar la crema una hora antes en la heladera y usarla en estado frio para acelerar el proceso desinflamatorio.\nEn pieles muy afectadas se puede colocar 3 veces al dia.\nINGREDIENTES:\nFLORES DE CALENDULA\nMANTECA DE PALTA\nMANTECA DE MANZANILLA\nMANTECA DE CALENDULA\nACEITE VEGETAL DE FLORES DE MANZANILLA PURAS\nEXTRACO DE ZANAHORIA\nALOE VERA\nEXTRACTO COGLOGICO ANTI ACNE\nAnte cualquier duda pueden conectarse con nosotros por la via mail en la seccion de contacto o por redes o por wap,\nEste producto tiene su explicacion en el dorso del frasco", "necs": ["piel"], "pr": {"distribuidor": 10500, "minorista": 15000, "mayorista": 12000}, "st": {"distribuidor": true, "minorista": true, "mayorista": true}, "ids": {"distribuidor": 328245690, "minorista": 229337992, "mayorista": 229338092}, "rat": {"n": 2, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/03edb702-b32b-4540-84d3-e501ddf8b735-de82eff23b06c146a617755049718834-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/8647a275-2c98-4795-85d8-2ad4f4eca06e-979e1faccc924dd73617755049752315-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/d97b494e-9d1b-4a7f-844b-30e8b22e5279-5e106f6ba3f06b130a17755049593682-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-ceb604857d270ab6cc17755049800620-480-0.webp"], "vend": "+120 vendidos", "mangos": {"distribuidor": "crema-de-calendula-con-manzanilla-y-te-tre-100-cc-habitad-natural-negocios-distribuidor-w4wqz", "minorista": "crema-de-calendula-con-manzanilla-y-te-tre-100-cc-habitad-natural", "mayorista": "crema-de-calendula-con-manzanilla-y-te-tre-100-cc-publicacion-mayorista"}},
  {"n": "Crema de Caléndula, Manzanilla y Árbol de Té para la Piel – 50g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/e86355c0-b3c3-4752-b1c8-8611795f2ac4-1976c8d8506f54eb0817755114652452-640-0.webp", "d": "CREMA DE FLORES DE CALENDULA ORGANICA X 50 GRS\nLa crema de caléndula con manzanilla y te-tree es muy buena para hidratar la piel , siendo restauradora celular , es apta para niños, se puede usar en quemaduras de primer grado , también para personas con irritabilidad en zonas inguinales, pequeñas rosaceas manchitas lastimaduras en la dermis enrojecimiento acne. para casos de mucha irritacion aconsejamos colocar la crema una hora antes en la heladera y usarla en estado frio para acelerar el proceso desinflamatorio.\nEn pieles muy afectadas se puede colocar 3 veces al dia.\nINGREDIENTES:\nFLORES DE CALENDULA\nMANTECA DE PALTA\nMANTECA DE MANZANILLA\nMANTECA DE CALENDULA\nACEITE VEGETAL DE FLORES DE MANZANILLA PURAS\nEXTRACO DE ZANAHORIA\nALOE VERA\nEXTRACTO COGLOGICO ANTI ACNE", "necs": ["piel"], "pr": {"distribuidor": 6300, "mayorista": 7200, "minorista": 9000}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 328246333, "mayorista": 303490059, "minorista": 297642945}, "rat": {"n": 2, "avg": 4.5}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/70261794-5147-4845-b389-d6020257303e-238f156327ba165e3217755114778295-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a0ade6ed-2f62-48c8-a078-d4a0086b40bd-88be4f0e2af7f7155517755116799727-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/e86355c0-b3c3-4752-b1c8-8611795f2ac4-1976c8d8506f54eb0817755114652452-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-1-a130e2623d4709303517755115170006-480-0.webp"], "vend": "+20 vendidos", "mangos": {"distribuidor": "crema-de-calendula-con-manzanilla-y-te-tre-50-cc-habitad-natural-negocios-distribuidordor-9fd4b", "mayorista": "crema-de-calendula-con-manzanilla-y-te-tre-50-cc-habitad-natural-publicacion-para-pedidos-mayorista-16vqf", "minorista": "crema-de-calendula-con-manzanilla-y-te-tre-50-cc-habitad-natural"}},
  {"n": "Crema Facial Anti-Age para el Cuidado de la Piel – 100 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/e824fa4a-eebf-4ca8-95e2-3470632f0e97-ca171d8d638d7ba34317759099855967-640-0.webp", "d": "CREMA ANTI-AGE X 100GRS\nLa Solución para un Piel Radiante y Saludable\nLa Crema Anti-Age es un tratamiento avanzado que combina extracto glicólico , aloe vera , y una potente mezcla de vitaminas C, B1, B2, B5 y B6 . Este producto está formulado para combatir los signos del daño solar , así como para hidratar y nutrir la piel, siendo una opción ideal para quienes buscan un efecto antiarrugas y antienvejecimiento .\nBeneficios\nHidratación Profunda : Gracias al aloe vera, tu piel se mantendrá humectada y saludable.\nPrevención del Envejecimiento : Las vitaminas en su fórmula ayudan a mejorar la elasticidad y luminosidad de la piel.\nAlivio para Problemas de Piel : Ideal para personas con soriasis y escemas , proporcionando un efecto calmante.\nINGREDIENTES:\nMANTECA DE PALTA\nMANTECA DE MANZANILLA\nCALENDULA\nEXTRACTO CIGLOGICO ALOE VERA\nTENSOR FACIAL\nEXTRACTO ANTI AGE\nMIEL\nROSA MOSQUETA\nLAVANDA\nInstrucciones de Uso\nAplica una pequeña cantidad sobre la piel limpia, realizando suaves masajes hasta su completa absorción. Para resultados óptimos, utilízala diariamente.\nFormas de Pago : La Crema Anti-Age está disponible con todas las opciones de pago en nuestra tienda.\nPara consultas, contáctanos a través de nuestras redes sociales o correo electrónico. Estamos aquí para ayudarte a lograr una piel radiante.", "necs": ["piel"], "pr": {"mayorista": 14400, "distribuidor": 12600, "minorista": 18000}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 245511249, "distribuidor": 326139114, "minorista": 245510080}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1678da23-f6f2-47a7-8a2a-431bf855bfa8-9259329bb6015c7d1517759099890994-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/e824fa4a-eebf-4ca8-95e2-3470632f0e97-ca171d8d638d7ba34317759099855967-480-0.webp"], "vend": "+110 vendidos", "mangos": {"mayorista": "crema-anti-age-100-cc-mayorista-debe-cubrir-monto-mayorista", "distribuidor": "crema-anti-age-100cc-negocios-ms1us", "minorista": "crema-anti-age-100cc-wgfrj"}},
  {"n": "Crema Facial Anti-Age para el Cuidado de la Piel – 50g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/24842ffd-6ba0-4bdc-bb52-0b9345657080-37d5a3aecf9a4573b117596653066255-640-0.webp", "d": "CREMA ANTI-AGE X 100GRS\nLa Solución para un Piel Radiante y Saludable\nLa Crema Anti-Age es un tratamiento avanzado que combina extracto glicólico , aloe vera , y una potente mezcla de vitaminas C, B1, B2, B5 y B6 . Este producto está formulado para combatir los signos del daño solar , así como para hidratar y nutrir la piel, siendo una opción ideal para quienes buscan un efecto antiarrugas y antienvejecimiento .\nBeneficios\nHidratación Profunda : Gracias al aloe vera, tu piel se mantendrá humectada y saludable.\nPrevención del Envejecimiento : Las vitaminas en su fórmula ayudan a mejorar la elasticidad y luminosidad de la piel.\nAlivio para Problemas de Piel : Ideal para personas con soriasis y escemas , proporcionando un efecto calmante.\nINGREDIENTES:\nMANTECA DE PALTA\nMANTECA DE MANZANILLA\nCALENDULA\nEXTRACTO CIGLOGICO ALOE VERA\nTENSOR FACIAL\nEXTRACTO ANTI AGE\nMIEL\nROSA MOSQUETA\nLAVANDA\nInstrucciones de Uso\nAplica una pequeña cantidad sobre la piel limpia, realizando suaves masajes hasta su completa absorción. Para resultados óptimos, utilízala diariamente.\nFormas de Pago : La Crema Anti-Age está disponible con todas las opciones de pago en nuestra tienda.\nPara consultas, contáctanos a través de nuestras redes sociales o correo electrónico. Estamos aquí para ayudarte a lograr una piel radiante.", "necs": ["piel"], "pr": {"distribuidor": 6300, "mayorista": 7000, "minorista": 9000}, "st": {"distribuidor": true, "mayorista": true, "minorista": false}, "ids": {"distribuidor": 328241433, "mayorista": 298195652, "minorista": 298003517}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/24842ffd-6ba0-4bdc-bb52-0b9345657080-37d5a3aecf9a4573b117596653066255-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-dfd61c71ea9396738117721962225646-480-0.webp"], "vend": "+40 vendidos", "mangos": {"distribuidor": "crema-anti-age-x-50-cc-formula-potenciada-negocios-distribidor-sdlxn", "mayorista": "crema-anti-age-x-50-cc-formula-potenciada-publicacion-para-pedido-mayorista-98evb", "minorista": "crema-anti-age-x-50-cc-formula-potenciada"}},
  {"n": "Crema Facial Exfoliante con Nuez Rallada – 100g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/f244ee03-d0cc-44fc-9141-210adf826e96-c62e757bb5a9ec337017838675275793-640-0.webp", "d": "CREMA EXFOLIANTE FACIAL 100grs\nLa crema Exfoliante facial contiene una graduación solo para el rostro no para piernas\nSe debe pasar con la yema de los dedos en forma circular y luego se debe enjaguar con agua tibia o limpiar con algodón tibio\ncontiene 100 cc sin aroma\nproducto organico", "necs": ["piel"], "pr": {"distribuidor": 8400, "mayorista": 9600, "minorista": 10000}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 330185198, "mayorista": 229338091, "minorista": 229337995}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/crema-exfoliante1-c27c4ea19adffa2ace17838685647581-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/f244ee03-d0cc-44fc-9141-210adf826e96-c62e757bb5a9ec337017838675275793-480-0.webp"], "vend": "+50 vendidos", "mangos": {"distribuidor": "crema-exfoliante-facial-100cc-habitad-natural-negocios-distribuidor-epze5", "mayorista": "crema-exfoliante-facial-100cc-habitad-natural-pulicacion-mayorista", "minorista": "crema-exfoliante-facial-100cc-habitad-natural"}},
  {"n": "Crema para Psoriasis con Aloe Vera, Palta, Rosa Mosqueta y Vitamina D – 50g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/9b62ba36-1c00-4900-9b15-186f6872c250-92b691dc946761684c17596690850469-640-0.webp", "d": "Crema Para Soriasis sin parabenos\nContiene :\nVitamina E, D con Calendula manzanilla extracto de zanahoria y aloe vera, aceite de rosa mosqueta extracto cicglogico anti.acne manteca de palta manteca de manzanilla , aciete vegetal de flores pura de manzanillas\nModos De Uso:\npasar de forma circular sobre la zona a trabajar hasta humectacion completa 3 veces por dia\nAccion terapeutica: ayuda a restaurar tejido celular en la dermis, disminuye picazon y daño celular\neste producto tiene su explicación en el dorso del frasco y va con su prospecto", "necs": ["piel"], "pr": {"mayorista": 7000, "minorista": 9000, "distribuidor": 12600}, "st": {"mayorista": true, "minorista": true, "distribuidor": true}, "ids": {"mayorista": 298195622, "minorista": 298005113, "distribuidor": 326348499}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/9b62ba36-1c00-4900-9b15-186f6872c250-92b691dc946761684c17596690850469-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-7a8ffc07d9dfcc048a17723225312133-480-0.webp"], "vend": "+20 vendidos", "mangos": {"mayorista": "crema-para-soriasis-sin-parabenos-c-vit-e-d-x50cc-mayorista", "minorista": "crema-para-soriasis-sin-parabenos-c-vit-e-d-x50cc", "distribuidor": "crema-para-soriasis-x-100cc-sin-parabenos-c-vit-e-d-copia-1fjby"}},
  {"n": "Crema para Varices con Hamamelis, Romero y Centella Asiática – 50g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-4-c2ea727e0c268607d717755144459392-640-0.webp", "d": "CREMA DE VARICES CON HAMAMELIS Y ROMERO X 100CC\nLos extractos de hamamelis se han evaluado experimentalmente y han demostrado propiedades astringentes, antiflogísticas y hemostáticas. Son de utilidad en tratamientos, sobre todo tópicos, de lesiones superficiales de la piel, eccemas, quemaduras, alteraciones varicosas y hemorroides\nPARA TENER EN CUENTA:\nLas varices son una de las patologías complejas, que tienen como relación para tratarla , la alimentación de la personas, su peso corporal ,el sedentarismo, las horas que pueda estar de pie o sentado su flujo sanguíneo y el ejercicio fisico .Esto hace de la patologia un importante acompañamiento para mejorar\nEn varices inflamadas se debe colocar una hora antes en la heladera y usarla en frio\nAnte cualquier duda pueden conectarse con nosotros por la via e-mail en la sección de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nEste producto tiene su explicación en el dorso del frasco", "necs": ["dolor"], "pr": {"distribuidor": 6300, "mayorista": 7000, "minorista": 9000}, "st": {"distribuidor": true, "mayorista": false, "minorista": true}, "ids": {"distribuidor": 328210635, "mayorista": 298197026, "minorista": 298169074}, "rat": {"n": 2, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/3c24870b-4400-4119-b14f-19ae6b4ce4ce-f13f650e4a23fb262517755150030816-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a62a0633-d708-4cf7-8f6b-d71c7f5e1880-43f77097be676a565e17755148578685-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-4-c2ea727e0c268607d717755144459392-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unnamed-6-d2c7549e7373135ba617755151124447-480-0.webp"], "vend": "+50 vendidos", "mangos": {"distribuidor": "crema-de-varices-por-50cc-con-hamamelis-romero-y-centella-asiatica-copia-1rbcz", "mayorista": "crema-de-varices-por-50cc-con-hamamelis-romero-y-centella-asiatica-mayorista", "minorista": "crema-de-varices-por-50cc-con-hamamelis-romero-y-centella-asiatica-p4zyv"}},
  {"n": "Difusor De Aroma Para Auto", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/cace3ae1-a950-4746-93a3-064797ca8115-0a2d30b88bf3816bfd17740555526524-640-0.webp", "d": "DIFUSOR DE AROMA PARA AUTO\n¡ Los difusores de auto se pusieron de moda! Si buscas una manera fácil y efectiva de disfrutar de ricos aromas durante tus viajes, este es el producto ideal para ti.\nCaracterísticas:\nFácil de usar: Simplemente colócalo en la ventilación de tu auto y disfruta de la fragancia que elijas.\nVariedad de aromas: Desde frescos y cítricos hasta suaves y relajantes, hay una opción para cada gusto.\n¿Qué esperas? Dale un toque especial a cada trayecto con nuestro difusor de aroma para auto. Es la forma perfecta de transformar tu experiencia de conducción, haciéndola más placentera.\nal Cliente\nAnte cualquier duda, no dudes en conectarte con nosotros a través de e-mail en la sección de contacto, o por redes sociales y WhatsApp. Siempre estamos aquí para acompañarte con los brazos abiertos.\nFormas de Pago\nEste producto se puede pagar con todas las formas de pago disponibles.\n¡Haz de cada viaje un momento único con nuestro difusor de aroma para auto", "necs": ["aromas"], "pr": {"minorista": 4500}, "st": {"minorista": true}, "ids": {"minorista": 229338243}, "opcion": "Integraciones", "vars": [{"id": 1022303022, "n": "Uva Dulce", "p": 4500, "s": true}, {"id": 1022303024, "n": "Coco", "p": 4500, "s": true}, {"id": 1022303025, "n": "Escencia De La India", "p": 4500, "s": true}, {"id": 1022303028, "n": "Manzana Canela", "p": 4500, "s": true}, {"id": 1481228217, "n": "citric  orange", "p": 4500, "s": true}, {"id": 1481228218, "n": "ocean blue", "p": 4500, "s": true}, {"id": 1481228220, "n": "maderas de sandalo", "p": 4500, "s": true}, {"id": 1481228221, "n": "la vida es bella", "p": 4500, "s": true}, {"id": 1481228223, "n": "hawai", "p": 4500, "s": true}, {"id": 1481228224, "n": "mix floral", "p": 4500, "s": true}, {"id": 1481228225, "n": "pumita", "p": 4500, "s": true}, {"id": 1481228226, "n": "auto sport", "p": 4500, "s": true}, {"id": 1481228227, "n": "swit candy", "p": 4500, "s": true}, {"id": 1481228229, "n": "pimpollos de jazmin", "p": 4500, "s": true}], "mangos": {"minorista": "difusor-de-aroma-para-auto"}},
  {"n": "Difusor de Aromas para Auto", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/50482072-379c-4daa-bcf6-f00e473e0fd5-20aa97add825fed85617700630269473-640-0.webp", "d": "Descubre el poder del bienestar con nuestro Difusor de Aromas para Auto — ilumínate en cada viaje . Diseñado para transformar tu experiencia en el vehículo, este difusor combina funcionalidad y estilo en un solo producto.\nCon su tecnología avanzada, el difusor de aromas para auto te permite disfrutar de fragancias relajantes y revitalizantes mientras conduces. Su diseño compacto y elegante se integra perfectamente en cualquier espacio, aportando un toque de sofisticación y tranquilidad en cada trayecto.\n¿Quieres crear un ambiente cálido y acogedor, o tal vez purificar el aire de tu coche? Este difusor es tu mejor aliado, ya que dispersa aromas de alta calidad que mejoran tu estado de ánimo y te brindan una sensación de calma y armonía. Además, su iluminación sutil iluminará tu interior, dándole un toque especial y envolvente.\nPerfecto para quienes valoran su bienestar, este difusor se adapta a cualquier estilo de vida, ayudándote a comenzar cada día con energía o a relajarte después de una jornada agotadora. Es fácil de usar: solo agrega unas gotas de tu aceite esencial favorito, enciéndelo y disfruta del ambiente que deseas.\n¡Convierte cada viaje en una experiencia sensorial única! Nuestro difusor de aromas para auto es el complemento ideal para quienes buscan bienestar, estilo y funcionalidad en su vehículo.\nCompra ahora y transforma tu vehículo en un oasis de paz y luz . La mejor calidad y diseño argentino, disponibles para ti en nuestro tienda online.", "necs": ["aromas"], "pr": {"minorista": 4500}, "st": {"minorista": true}, "ids": {"minorista": 267078369}, "opcion": "aroma", "vars": [{"id": 1429755924, "n": "pumita", "p": 4500, "s": true}, {"id": 1429755926, "n": "citric-orange", "p": 4500, "s": true}, {"id": 1429755927, "n": "ocean blue", "p": 4500, "s": true}, {"id": 1429755928, "n": "pimpollos de jazmin", "p": 4500, "s": true}, {"id": 1429755932, "n": "maderas de sandalo", "p": 4500, "s": true}, {"id": 1429755933, "n": "la vida es bella", "p": 4500, "s": true}, {"id": 1429755934, "n": "sweet Candy", "p": 4500, "s": true}, {"id": 1429755936, "n": "mix floral", "p": 4500, "s": true}, {"id": 1429755937, "n": "hawalian", "p": 4500, "s": true}], "mangos": {"minorista": "difusor-de-aromas-para-auto"}},
  {"n": "DIFUSOR PARA AUTO", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/difusor-de-auto-947d5e4f8c8e8b6ba417381579429131-640-0.webp", "d": "DIFUSOR PARA AUTO - VARIOS AROMAS MARCA AROMANZA\nDescubre la forma perfecta de transformar tu experiencia de conducción con nuestro Difusor para Auto de la reconocida marca Aromanaza . Este elegante difusor colgante no solo embellece el interior de tu vehículo, sino que también llena el ambiente con aromas relajantes y revitalizantes que hacen de cada viaje un momento especial.\nCaracterísticas Principales:\nVarios Aromas: Elige entre una variedad de fragancias que se adaptan a tu estado de ánimo y preferencias. Desde frescos y cítricos hasta suaves y florales, hay un aroma para cada conductor.\nDiseño Práctico: Su diseño colgante se adapta perfectamente a cualquier vehículo, permitiendo una instalación rápida y sencilla. Además, su elegante acabado complementará la estética de tu auto.\nDurabilidad: Cada difusor está diseñado para ofrecer una larga duración del aroma, asegurando que tu auto siempre huela bien, ya sea en trayectos cortos o largos viajes.\nBeneficios:\nAumenta el Bienestar: Los aromas pueden ayudar a reducir el estrés y la ansiedad, creando un ambiente más placentero mientras conduces.\nElimina Olores No Deseados: Neutraliza los olores desagradables del auto, dejando un aire fresco que revitaliza tu experiencia de manejo.\nInstrucciones de Uso:\nColoca el difusor en el lugar deseado dentro de tu auto.\nDeja que el aroma se difunda naturalmente, disfrutando de una atmósfera agradable durante tus viajes.\nReemplaza el difusor cuando sientas que el aroma ha disminuido.\nHaz de cada viaje una experiencia única y agradable con el Difusor para Auto de Aromanaza . Transforma tu auto en un refugio de aromas que te acompañarán a donde vayas. ¡No esperes más para disfrutar de esta experiencia!\n¡Adquiere el tuyo hoy y siente la diferencia", "necs": ["aromas"], "pr": {"minorista": 4500}, "st": {"minorista": true}, "ids": {"minorista": 252635038}, "opcion": "aroma", "vars": [{"id": 1155230459, "n": "rosas", "p": 4500, "s": true}, {"id": 1155230462, "n": "citronella", "p": 4500, "s": false}, {"id": 1155230463, "n": "limon", "p": 4500, "s": true}, {"id": 1155230464, "n": "citric", "p": 4500, "s": true}, {"id": 1155230466, "n": "mango maracuya", "p": 4500, "s": true}, {"id": 1155230468, "n": "coco", "p": 4500, "s": true}, {"id": 1155230470, "n": "dulce uva", "p": 4500, "s": true}, {"id": 1155230475, "n": "naranja pimienta", "p": 4500, "s": true}, {"id": 1481207609, "n": "dulces vainillas", "p": 4500, "s": true}], "mangos": {"minorista": "difusor-para-auto"}},
  {"n": "difusores de ambiente iluminarte", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-38-62d5cc6fb36327e0d517426556820842-640-0.webp", "d": "Difusor de Ambiente Iluminarte\nTransforma tu espacio con el Difusor de Ambiente Iluminarte . Este elegante accesorio no solo proporciona una fragancia envolvente, sino que también es un elemento decorativo que realza la estética de cualquier ambiente.\nVariedades de Aromas\nEl difusor está disponible en varios aromas , permitiéndote elegir la fragancia que mejor se adapte a tu estado de ánimo o a la ocasión. Desde notas frescas y florales hasta aromas más cálidos y envolventes, cada opción está diseñada para brindar una experiencia sensorial única.\nVarillas de Bambú\nIncorporando varillas de bambú , este difusor asegura una dispersión uniforme y prolongada de la fragancia en el aire. El bambú no solo es estéticamente agradable, sino que también es una opción sostenible y ecológica.\nUso Versátil\nIdeal para el hogar, la oficina o cualquier espacio que desees personalizar con un toque olfativo especial. Simplemente coloca el difusor en el área deseada y deja que la magia de los aromas transforme tu entorno.\nPresentación y Pago\nSe presenta en un diseño atractivo, perfecto para regalar o para uso personal. Disponibles todas las formas de pago , facilitando tu compra.\nPara cualquier consulta, no dudes en contactarnos a través de nuestro correo electrónico, redes sociales o WhatsApp. Nuestro objetivo es acompañarte con los brazos abiertos.", "necs": ["aromas"], "pr": {"minorista": 4000}, "st": {"minorista": true}, "ids": {"minorista": 255158720}, "vend": "+10 vendidos", "mangos": {"minorista": "difusores-de-ambiente-iluminarte"}},
  {"n": "Esencias Para Hornito Y Lamparas De Sal Iluminarte", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/14439e37-5e56-4b08-952f-8f8c6a932f51-ee346cb68e99ae702717783450374387-640-0.webp", "d": "Esencias Para Hornito Y Lamparas De Sal Iluminarte\nTransforma tu espacio con nuestras Esencias Para Hornito y Lámparas de Sal Iluminarte . Cada frasco contiene un aceite esencial concentrado , ideal para crear un ambiente acogedor y perfumado. Disfruta de una variedad de aromas cautivadores que incluyen:\nPatchouli\nCoco\nSándalo\nPalo Santo\nMadera Oriental\nLavanda\nLimón\nVainilla\nBergamota\nJazmín\nDurazno\nMaracuyá\nMirra\nNardo\nOpium\nVioleta\nRomero\nSai Champa\nCada fragancia está diseñada para brindarte un buen aroma que perdura en el ambiente, ideal para relajarte y disfrutar de momentos especiales en tu hogar.\nInstrucciones de uso: Este producto tiene su explicación en el dorso del frasco.\nFormas de pago: Este producto se puede pagar con todas las formas de pago .", "necs": ["descanso", "aromas"], "pr": {"minorista": 1500}, "st": {"minorista": true}, "ids": {"minorista": 229337692}, "opcion": "Integraciones", "vars": [{"id": 1022301398, "n": "Coco", "p": 1500, "s": true}, {"id": 1022301399, "n": "Benjuí", "p": 1500, "s": false}, {"id": 1022301400, "n": "Energía Limpia", "p": 1500, "s": true}, {"id": 1022301401, "n": "Escencia De La India", "p": 1500, "s": false}, {"id": 1022301403, "n": "Frutilla", "p": 1500, "s": false}, {"id": 1022301405, "n": "Incienso", "p": 1500, "s": true}, {"id": 1022301406, "n": "Jazmin", "p": 1500, "s": false}, {"id": 1022301408, "n": "Lavanda", "p": 1500, "s": true}, {"id": 1022301409, "n": "Limon", "p": 1500, "s": true}, {"id": 1022301412, "n": "Manzana", "p": 1500, "s": false}, {"id": 1022301415, "n": "Mirra", "p": 1500, "s": true}, {"id": 1022301417, "n": "Palo Santo", "p": 1500, "s": true}, {"id": 1022301419, "n": "Sandalo", "p": 1500, "s": true}, {"id": 1022301421, "n": "Violeta", "p": 1500, "s": true}, {"id": 1022301426, "n": "Vainilla", "p": 1500, "s": true}, {"id": 1022301429, "n": "Durazno", "p": 1500, "s": false}, {"id": 1022301430, "n": "Champa", "p": 1500, "s": true}, {"id": 1022301432, "n": "Maracuya", "p": 1500, "s": false}, {"id": 1022301435, "n": "Opium", "p": 1500, "s": false}, {"id": 1022301439, "n": "Romero", "p": 1500, "s": false}, {"id": 1022301441, "n": "Bergamota", "p": 1500, "s": true}, {"id": 1022301443, "n": "Patchouli", "p": 1500, "s": true}, {"id": 1022301445, "n": "Madera Oriental", "p": 1500, "s": false}, {"id": 1022301447, "n": "Azahar", "p": 1500, "s": false}, {"id": 1022301452, "n": "Nardo", "p": 1500, "s": false}, {"id": 1429650185, "n": "reyna de la noche", "p": 1500, "s": true}, {"id": 1429676038, "n": "canela mistica", "p": 1500, "s": true}, {"id": 1429709625, "n": "yagra", "p": 1500, "s": true}, {"id": 1429709628, "n": "7 poderes", "p": 1500, "s": true}, {"id": 1429714703, "n": "rosa bulgrara", "p": 1500, "s": true}, {"id": 1429724969, "n": "atrae dinero", "p": 1500, "s": true}], "rat": {"n": 1, "avg": 5.0}, "vend": "+90 vendidos", "mangos": {"minorista": "esencias-para-hornito-y-lamparas-de-sal-iluminarte"}},
  {"n": "Esencias Para Humificadores Por 1 Unidad", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/4cc89012-e02d-4bf7-bc8c-1f004d84248c-f1bd13776145e48ec817583707477742-640-0.webp", "d": "Esencias Para Humificadores - 1 Unidad\nTransforma tu hogar en un espacio de bienestar y relajación con nuestras Esencias Para Humificadores . Disponibles en varios aromas , estas esencias están diseñadas para ofrecerte una experiencia aromática única, ideal para cualquier ocasión.\nBeneficios de nuestras esencias:\nAromatiza tu espacio: Disfruta de fragancias que transforman tu ambiente, creando un refugio de paz y tranquilidad.\nRelax y bienestar: Cada aroma ha sido seleccionado para aportar calma y bienestar, perfectas para momentos de meditación o descanso.\nFácil de usar: Solo necesitas añadir unas gotas a tu humificador y dejar que el aroma llene el aire.\nVariedad de Aromas:\nLavanda: Ideal para promover el sueño y reducir el estrés.\nEucalipto: Perfecto para despejar la mente y respirar con facilidad.\nCítrico: Aporta energía y frescura, ideal para comenzar el día.\nModo de uso: Agrega entre 5 a 10 gotas de esencia en tu humificador según el tamaño del ambiente.\nImportante: Mantener fuera del alcance de los niños. No ingerir.\nAnte cualquier duda, pueden conectarse con nosotros por la vía e-mail en la sección de contacto, o por redes sociales o WhatsApp. La idea siempre es acompañarlos con los brazos abiertos.\nFormas de pago: Este producto se puede pagar con todas las formas de pago.", "necs": ["descanso", "aromas"], "pr": {"mayorista": 4000, "minorista": 5000}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 229337919, "minorista": 229337889}, "opcion": "Integraciones", "vars": [{"id": 1023910353, "n": "Canela", "p": 5000, "s": true}, {"id": 1023910357, "n": "Coco", "p": 5000, "s": true}, {"id": 1023910362, "n": "Limon", "p": 5000, "s": true}, {"id": 1023910364, "n": "Jazmin", "p": 5000, "s": false}, {"id": 1023910367, "n": "Limon Hengibre", "p": 5000, "s": false}, {"id": 1023910370, "n": "Champa", "p": 5000, "s": true}, {"id": 1023910372, "n": "Miel", "p": 5000, "s": true}, {"id": 1023910377, "n": "Lavanda", "p": 5000, "s": true}, {"id": 1023910379, "n": "Patchouli", "p": 5000, "s": false}, {"id": 1023910384, "n": "Naranja", "p": 5000, "s": true}, {"id": 1023910386, "n": "Eucalipto", "p": 5000, "s": false}, {"id": 1023910389, "n": "Frutos Rojos", "p": 5000, "s": false}, {"id": 1023910392, "n": "Azahar", "p": 5000, "s": false}, {"id": 1023910394, "n": "Sandalo", "p": 5000, "s": false}, {"id": 1023910396, "n": "Vainilla", "p": 5000, "s": false}, {"id": 1023910397, "n": "Tilo Mandarina", "p": 5000, "s": false}], "vend": "+10 vendidos", "mangos": {"mayorista": "esencias-para-humificadores-por-1-unidad-mayorista", "minorista": "esencias-para-humificadores-por-1-unidad"}},
  {"n": "Estres , nervios, y angustias", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/estres-4db140640125fe19e417807095307507-640-0.webp", "d": "Té Negro en Hebras - Blend para Estrés, Nervios y Angustias\nDescubrí el poder natural de nuestro blend orgánico de té negro en hebras , especialmente formulado para mejorar la salud intestinal y aliviar los efectos del estrés diario, nervios y angustias. Este producto combina cuidadosamente ingredientes tradicionales y orgánicos que trabajan en sinergia para brindarte bienestar tanto físico como emocional.\nIngredientes Clave:\nTé negro en hebras : Rico en antioxidantes que favorecen la digestión y ayudan a regular el sistema intestinal.\nAlbahaca orgánica : Conocida por sus propiedades calmantes, ayuda a reducir la ansiedad y mejora la función intestinal.\nCedro orgánico : Aporta efectos relajantes para el sistema nervioso, ideal para jornadas atareadas.\nToronjil orgánico : Tradicionalmente usado para calmar nervios y promover un estado de tranquilidad.\nBeneficios:\nEste blend es ideal para consumir después de una jornada intensa, ayudando a combatir cuadros de estrés y nerviosismo . Su acción combinada favorece la digestión y el equilibrio intestinal, dos aspectos fundamentales para mantener una buena salud y calidad de vida.\nModo de consumo:\nPrepará una infusión con una cucharadita de este blend en agua caliente, dejá reposar por 5 a 7 minutos y disfrutá sus efectos relajantes y digestivos. Se recomienda su consumo diario para mejores resultados.\nCon este producto, podés cuidar tu cuerpo y mente de forma natural, aprovechando lo mejor de la naturaleza orgánica. Ideal para quienes buscan una solución efectiva y saludable para el manejo del estrés y el bienestar intestinal.\nContenido: Presentación en envase hermético para conservar la frescura y calidad de las hierbas.\nPara cualquier consulta, nuestro equipo está disponible para acompañarte en tu experiencia de bienestar natural.", "necs": ["descanso"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342818686}, "vend": "+10 vendidos", "mangos": {"minorista": "estres-nervios-y-angustias-4mq2y"}},
  {"n": "Gel Criogénico Efecto Frío con Menta y Mentol para Piernas Cansadas y Masajes Deportivos – 100 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/gel-golpes-79932dde79b2e6635e17808783337977-640-0.webp", "d": "Gel criogenico para golpes y torceduras o esguinces:\nEs especial para generar un shock de frio en zonas inflamadas por su efecto criogenio, apto para usos en golpes torceduras esguinces o articulacion inflamada, muy bueno para deportistas\nRecomendacion: dejar 1hr en la heladera antes de su aplicacion para casos de mucha inflamacion\nContiene:\nMenta\nmentol\nAceite de argán\nPago protegido", "necs": ["dolor", "corporal"], "pr": {"mayorista": 6400, "distribuidor": 5600, "minorista": 8000}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 229338239, "distribuidor": 326137561, "minorista": 229338236}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/gel-golpes-79932dde79b2e6635e17808783337977-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-16746ef4c81d79df2417808783501608-480-0.webp"], "vend": "+360 vendidos", "mangos": {"mayorista": "gel-criogenico-con-menta-y-mentol-argan-para-golpes-y-torceduras-o-esguinces-publicacion-mayorista", "distribuidor": "gel-criogenico-copn-menta-y-mentol-argan-para-golpes-y-torceduras-o-esguinces-copia-yqjdw", "minorista": "gel-criogenico-copn-menta-y-mentol-argan-para-golpes-y-torceduras-o-esguinces"}},
  {"n": "Gel Criogénico para el Contorno de Ojos y la Apariencia de Bolsas – 30 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/contorno-criogenico-922d31e0cddeb4679b17808788392790-640-0.webp", "d": "Gel criogenico para contorno de Ojos para las bolsitas X 30GRS\nEste producto es para uso diurno en casos de inflamaciones sobre la zona baja del ojo . Ejemplo : pomulos patitas de gallo\nbolsas debajo de los ojos.\nPara casos inflamados se puede ayudar aun mas colocando el producto en la heladera 1 hora antes de su aplicacion\nIngredientes: gel criogenico con mentol, menta, aceite de argan , aceite de zanahoria..(efecto frio)\nuso:\nSu aplicacion es de dosis minima.. Sobre la zona.. Solo apoyar con la yema del dedo\nAnte cualquier duda pueden conectarse conn nosotros por la via mail en la seccion de contacto o por redes o por wap", "necs": ["corporal"], "pr": {"distribuidor": 5600, "minorista": 10000, "mayorista": 6000}, "st": {"distribuidor": true, "minorista": true, "mayorista": true}, "ids": {"distribuidor": 326643618, "minorista": 229338223, "mayorista": 229338228}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/beneficios-del-gel-criogenico-7a811c713deecbcf8917811767467122-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/contorno-criogenico-922d31e0cddeb4679b17808788392790-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-4d11a8c9badc11a03717808788502378-480-0.webp"], "vend": "+110 vendidos", "mangos": {"distribuidor": "gel-contorno-de-ojos-bolsitas-criogenico-negocios-distribuidor-y73no", "minorista": "gel-contorno-de-ojos-bolsitas-criogenico", "mayorista": "gel-contorno-de-ojos-criogenico-mayorista-debe-cubrir-monto-mayorista"}},
  {"n": "Gel de Aloe Vera con Vitamina E para Hidratación y Suavidad de la Piel – 200 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-94-0ff0296cb940d8986517578486209779-640-0.webp", "d": "Gel aloe vera con vitamina E\nEl gel de aloe vera es restaurador y humectante de facil absorcion con aloe de vera y vitamina E mentolado calmante para\npieles sensibles, apto en niños y adultos\nhipoalergénico, bactericida restaurador\nde fácil aplicación se puede pasar 3 veces por día en afecciones de la dermis irritadas\nEste producto tiene su explicación en el dorso del frasco", "necs": ["dolor", "piel", "corporal"], "pr": {"distribuidor": 6300, "mayorista": 7200, "minorista": 9000}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 330288641, "mayorista": 256646778, "minorista": 229337842}, "rat": {"n": 4, "avg": 5.0}, "vend": "+110 vendidos", "mangos": {"distribuidor": "gel-de-aloe-vera-con-vitamina-e-para-todo-tipo-de-pieles-copia-1x723", "mayorista": "gel-de-aloe-vera-con-vitamina-e-para-todo-tipo-de-pieles-mayorista-debe-cubrir-monto-mayorista", "minorista": "gel-de-aloe-vera-con-vitamina-e-para-todo-tipo-de-pieles"}},
  {"n": "Gel Efecto Tibio para Masajes y Bienestar Muscular – 100 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/relajante-muscula-f27af87d02e9d8f3f717808779754114-640-0.webp", "d": "Gel tibio relajante muscular x 100cc Disfrutá del efecto tibio que este gel ofrece para un alivio profundo y duradero. Su fórmula exclusiva garantiza una excelente absorción , ideal para masajes que favorecen la distensión de tejidos y el relax muscular.\nPerfecto para deportistas o quienes sufren de carga muscular intensa, también es un aliado para combatir la sensación de piernas cansadas. Aplicalo después del entrenamiento o en momentos de tensión para sentir cómo el calor tibio penetra y relaja cada fibra muscular.\nSu acción concentrada ayuda a reducir la fatiga, promoviendo una sensación de bienestar y movilidad. Además, es sencillo de usar y se adapta a tus rutinas diarias para que siempre estés listo para dar lo mejor.\n¡Viví la experiencia de un masaje profesional en casa con este gel tibio relajante", "necs": ["dolor", "corporal"], "pr": {"mayorista": 5400, "distribuidor": 4900, "minorista": 7000}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 292559700, "distribuidor": 329451203, "minorista": 284191759}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-031756e9cc5800b36817808779809357-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/relajante-muscula-f27af87d02e9d8f3f717808779754114-480-0.webp"], "vend": "+100 vendidos", "mangos": {"mayorista": "gel-tibio-relajante-muscular-x-100cc-mayorista", "distribuidor": "gel-tibio-relajante-muscular-x-100cc-negocios-distribuidor-8kb3v", "minorista": "gel-tibio-relajante-muscular-x-100cc"}},
  {"n": "Gel Para Celulitis Con 4 Principios Activos", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/probalo-4-ce59c0af0d59a5d0b717572987053581-640-0.webp", "d": "Gell para celulitis\nCafe,romero,centella asiatica,hamamelis)\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["piel", "corporal"], "pr": {"minorista": 6000}, "st": {"minorista": true}, "ids": {"minorista": 229337686}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/811ed14e-e752-47c4-aa00-579b0b16384e-c118e74fe6bd2f7b3117572987083548-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/probalo-4-ce59c0af0d59a5d0b717572987053581-480-0.webp"], "vend": "+70 vendidos", "mangos": {"minorista": "gel-para-celulitis-con-4-principios-activos"}},
  {"n": "Hongos de pino secos orgánicos", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/c2b2a99a-2072-4b24-b257-79ae068a02f4-e4c362ce58ec61b22a17719382814479-640-0.webp", "d": "Hongos de pino secos orgánicos\nDescubrí los Hongos de pino secos orgánicos , un producto natural ideal para tus recetas y preparados saludables. Cultivados de forma orgánica, estos hongos conservan todo su sabor y propiedades nutricionales, aportando antioxidantes y nutrientes esenciales.\nPerfectos para infusiones, caldos o como complemento en tu cocina diaria.\nAnte cualquier consulta, estamos disponibles para acompañarte.\nFormas de pago variadas y seguras.", "necs": ["defensas", "cardiovascular"], "pr": {"minorista": 4000}, "st": {"minorista": true}, "ids": {"minorista": 327320747}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/c2b2a99a-2072-4b24-b257-79ae068a02f4-e4c362ce58ec61b22a17719382814479-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-217fb71a81e38f50fb17719384989637-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/sello-habitad-100-natural-025dd86a07a241d59d17719385083288-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "hongos-de-pino-secos-organicos-1peul"}},
  {"n": "Hornillo De Ceramica Para Esencias", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/hornillos-para-esencias-de-ceramica-400x400-fd3bad6cb909f3857617265841695967-640-0.webp", "d": "HORNILLO DE CERÁMICA PARA ESENCIAS\nDescubre nuestro elegante hornillo de cerámica para esencias , una pieza única que aporta un toque de distinción a tu hogar. Este hornillo no solo es funcional, sino que también es un hermoso objeto decorativo que complementará cualquier ambiente.\nCaracterísticas del producto:\nViene con una vela de regalo: Disfruta de la experiencia aromática desde el primer uso, gracias a la vela que incluye. Perfecta para crear un ambiente acogedor y relajante.\nDiseño atractivo y colorido: Nuestros hornillos están disponibles en una variedad de colores, ideales para adaptarse a tu estilo y decoración.\nIdeal para esencias: Perfecto para utilizar con tus esencias favoritas, permitiendo que los aromas se difundan suavemente por todo el espacio.\nUso y cuidado:\nPara un rendimiento óptimo, asegúrate de utilizar esencias de calidad y sigue las instrucciones de uso. Este hornillo es muy fácil de limpiar y mantener, asegurando que se vea siempre como nuevo.\nSi tienes alguna consulta, no dudes en contactarnos a través de nuestro e-mail o redes sociales. Estamos aquí para ayudarte y acompañarte en tu compra.\nFormas de pago: Este producto se puede pagar con todas las formas de pago disponibles.\nEmbellece tu hogar y disfruta de momentos de relajación con nuestro hornillo de cerámica para esencias. ¡Haz tu pedido hoy mismo", "necs": ["aromas"], "pr": {"minorista": 2600}, "st": {"minorista": false}, "ids": {"minorista": 229338250}, "mangos": {"minorista": "hornillo-de-ceramica-para-esencias"}},
  {"n": "HORNITO CERAMICA ROJO", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-74ddf94208aae9ad8717487086468564-640-0.webp", "d": "Hornito Cerámica Rojo para Vela Esmaltado\nEmbellece tu hogar con nuestro Hornito Cerámica Rojo , un accesorio perfecto para realzar la atmósfera de cualquier espacio. Su acabado esmaltado no solo le confiere un toque de elegancia, sino que también asegura su resistencia y larga duración.\nCaracterísticas:\nDiseño Atractivo: Su vibrante color rojo crea un ambiente cálido y acogedor.\nMaterial Premium: Fabricado en cerámica de alta calidad, ideal para soportar el calor de la vela.\nEste hornito es perfecto para utilizar con nuestras esencias , permitiendo que los aromas se desplieguen y transformen tu hogar en un refugio de paz y relajación.\nInstrucciones de uso: Coloca una vela en el interior y enciéndela. Agrega unas gotas de tu esencia favorita para potenciar la experiencia aromática.", "necs": ["aromas"], "pr": {"minorista": 6500}, "st": {"minorista": false}, "ids": {"minorista": 273828105}, "opcion": "Color", "vars": [{"id": 1223135303, "n": "Celeste", "p": 6500, "s": false}, {"id": 1223135308, "n": "Violeta", "p": 6500, "s": false}, {"id": 1223135312, "n": "Negro", "p": 6500, "s": false}, {"id": 1223135316, "n": "Rojo", "p": 6500, "s": false}], "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-15ae7720d54530092117487086511241-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-74ddf94208aae9ad8717487086468564-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/3-484910d2c6f5ad5c8417487093437362-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/4-19b0a1ee6de132168817487093462729-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/5-5b5613874c7d0c0b8917487093503906-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/6-47134b198b3d41190e17487093519722-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/7-3fe12c9af7293322d217487093601775-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/8-9d465bd71743e0a83117487093646570-480-0.webp"], "mangos": {"minorista": "hornito-ceramica-rojo"}},
  {"n": "HORNITO PARA ESENCIAS IMITACION ARBOL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-d615835d859816228817487110477672-640-0.webp", "d": "HORNITO PARA ESENCIAS IMITACION ARBOL\nDescubre la magia de nuestro Hornito para Esencias Imitación Árbol , un elemento esencial para transformar tu hogar. Este elegante hornito no solo es una pieza decorativa, sino que también te permite disfrutar de fragancias cautivadoras que llenan el ambiente de armonía y bienestar.\nInstrucciones de uso: Coloca unas gotas de tu esencia favorita en el recipiente y enciende una vela en la base. ¡Deja que el aroma te envuelva!\nFormas de pago: Aceptamos todas las formas de pago.", "necs": ["aromas"], "pr": {"minorista": 3500}, "st": {"minorista": false}, "ids": {"minorista": 273831187}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-d615835d859816228817487110477672-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-4af0f573bc5051193417487110519110-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/3-a05b973b6613c6ae6617487110539551-480-0.webp"], "mangos": {"minorista": "hornito-para-esencias-imitacion-arbol"}},
  {"n": "Humidificador ultrasónico USB", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/qh3sx7da8kpvcg8gfmevir5t4biqfcmn7mqein6w-1-982a1df27ba24ec51f17719332276475-640-0.webp", "d": "Humidificador ultrasónico USB\nDisfrutá de un ambiente fresco y saludable con nuestro Humidificador ultrasónico USB . Ideal para espacios pequeños, su tecnología ultrasónica genera una neblina fina que hidrata el aire sin ruido. Fácil de conectar a cualquier puerto USB, es práctico y portátil para usar en casa, oficina o auto.\nMejorá tu bienestar respiratorio y cuidá tu piel con este dispositivo eficiente y moderno.\nForma de pago flexible y envío rápido en Argentina.", "necs": ["aromas"], "pr": {"minorista": 15000}, "st": {"minorista": true}, "ids": {"minorista": 327311262}, "opcion": "Color", "vars": [{"id": 1455503622, "n": "Beige", "p": 15000, "s": true}, {"id": 1455503624, "n": "Marrón", "p": 15000, "s": true}], "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/d_nq_np_2x_961244-mla73196956778_122023-f-bb56cf63dbd7f7f9b917719336656700-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/qh3sx7da8kpvcg8gfmevir5t4biqfcmn7mqein6w-1-982a1df27ba24ec51f17719332276475-480-0.webp"], "mangos": {"minorista": "humidificador-ultrasonico-usb-1xfgt"}},
  {"n": "humificador Difusor de aroma ultrasónico diseño jarrón", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-e6878eb7268dcec82a17719344878538-640-0.webp", "d": "Difusor de aroma ultrasónico diseño jarrón\nEste difusor combina funcionalidad y estética para transformar cualquier ambiente. Su tecnología ultrasónica dispersa aromas de manera silenciosa y eficiente, creando un espacio relajante y armonioso.\nCon un diseño elegante que imita un jarrón, es ideal para decorar y perfumar hogares u oficinas. Fácil de usar y compatible con aceites esenciales, aporta bienestar y frescura en cada rincón.\nDisfrutá de un ambiente único con estilo y tranquilidad.", "necs": ["aromas"], "pr": {"minorista": 19000}, "st": {"minorista": true}, "ids": {"minorista": 327311451}, "opcion": "Color", "vars": [{"id": 1455503157, "n": "Beige", "p": 19000, "s": true}, {"id": 1455503158, "n": "Marrón", "p": 19000, "s": true}], "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-f46d38f03ec35f025717719344878877-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-e6878eb7268dcec82a17719344878538-480-0.webp"], "mangos": {"minorista": "difusor-de-aroma-ultrasonico-diseno-jarron-hswa5"}},
  {"n": "Jabón con Aloe Vera y Aceite de Cannabis para el Cuidado de la Piel", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/cf6b3762-30f0-4f6c-888f-b1334e2edfde-8a4c24963d24719bed17650466192891-640-0.webp", "d": "Jabón terapéutico con Aloe Vera y CBD para dolores articulares\nEste jabón terapéutico combina las propiedades hidratantes del Aloe Vera con los beneficios antiinflamatorios y analgésicos del CBD , ideal para aliviar dolores articulares causados por artritis, artrosis, o contracturas musculares.\nSu fórmula natural actúa directamente en la piel, facilitando la relajación de músculos y articulaciones, promoviendo el bienestar y mejorando la movilidad. Es un producto pensado para quienes buscan un cuidado diario suave pero efectivo.\nModo de uso: Aplicar sobre la zona afectada con movimientos suaves y circulares, dejando actuar para potenciar el efecto calmante. Se recomienda usar regularmente para mejores resultados.\nPerfecto para quienes necesitan un soporte natural en su rutina de cuidado articular, este jabón es una opción segura y eficaz para aliviar el malestar de manera constante.", "necs": ["corporal"], "pr": {"mayorista": 2000, "minorista": 2500, "distribuidor": 1750}, "st": {"mayorista": true, "minorista": true, "distribuidor": true}, "ids": {"mayorista": 359585486, "minorista": 311575650, "distribuidor": 330175201}, "rat": {"n": 1, "avg": 5.0}, "vend": "+140 vendidos", "mangos": {"mayorista": "jabon-con-aloe-vera-y-aceite-de-cannabis-para-el-cuidado-de-la-piel-copia-kscsy", "minorista": "jabon-terapeutico-aiodn", "distribuidor": "jabon-terapeutico-negocios-distribuidor-118ni"}},
  {"n": "Kit Humito Sagrado 7 Variedades Sagrada Madre", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-51-d0305f953063328e9e17426726594044-640-0.webp", "d": "Kit humito sagrado 7 variedades\nCombo de carboncitos defumadores con pastillas y semillas || aromáticos muy buen aroma\nAromas y Trabajos:\n7 energías\nPurificación : incienso, copal, salvia, palo santo\nProsperidad: yagra, ratnamalia, lemongras estoraque, incienso, benjuí\nProtección: citronela incienso, reyna de la noche, naranja, ruda, romero, lemongras\nAmor y union: rosa incienso romero eucalipto laurel cedro\nEnergía limpia: sándalo incienso mirra canela anís\nAnte cualquier duda pueden conectarse conn nosotros por la via mail en la seccion de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["aromas"], "pr": {"minorista": 1800}, "st": {"minorista": false}, "ids": {"minorista": 229337671}, "opcion": "Integraciones", "vars": [{"id": 1023904158, "n": "7 Energías", "p": 1800, "s": false}, {"id": 1023904164, "n": "Amor y Unión", "p": 1800, "s": false}, {"id": 1023904168, "n": "Prosperidad", "p": 1800, "s": false}, {"id": 1023904173, "n": "Proteccion", "p": 1800, "s": false}, {"id": 1023904177, "n": "Purificacion", "p": 1800, "s": false}, {"id": 1023904183, "n": "Energía Limpia", "p": 1800, "s": false}], "mangos": {"minorista": "kit-humito-sagrado-7-variedades-sagrada-madre"}},
  {"n": "Lamparas De Sal Del Himalaya GRANDE", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/210b1693-501d-45bb-8daa-2783d7c8406c-eb8d9ca4490acba9f417583699892052-640-0.webp", "d": "Lamparas De Sal Del Himalaya grande\nLas lámparas de sal del himalaya son piezas de roca salina talladas que se utilizan con fines decorativos y terapéuticos. Se cree que tienen varios beneficios, tanto para la salud como para el bienestar general del ambiente. A continuación, te explico algunos de los efectos y beneficios que se les atribuyen:\nBeneficios de las lámparas de sal del himalaya\nPurificación del aire:\nSe dice que las lámparas de sal del himalaya actúan como purificadores naturales del aire. Absorben partículas de polvo, polen, humo y otros contaminantes a través de un proceso conocido como higroscopia.\nReducción de iones positivos:\nLas lámparas de sal emiten iones negativos cuando están encendidas, lo cual puede neutralizar los iones positivos emitidos por dispositivos electrónicos (como teléfonos móviles, computadoras y televisores). Los iones negativos están asociados con la mejora del estado de ánimo y la calidad del aire.\nMejora del estado de ánimo:\nLa luz suave y cálida que emiten estas lámparas puede ayudar a crear un ambiente relajante y acogedor. Esto puede contribuir a reducir el estrés y la ansiedad, promoviendo un estado de ánimo más positivo.\nMejora de la calidad del sueño:\nDebido a su efecto calmante, las lámparas de sal del himalaya pueden ayudar a mejorar la calidad del sueño. La luz tenue no interfiere con la producción de melatonina, la hormona del sueño.\nAlivio de alergias y asma:\nAlgunos creen que las lámparas de sal pueden ayudar a reducir los síntomas de alergias y asma al limpiar el aire de partículas irritantes.\nEfecto estético y decorativo:\nLas lámparas de sal del himalaya tienen un aspecto natural y atractivo que puede mejorar la estética de cualquier espacio. Su luz cálida y suave puede crear una atmósfera agradable y acogedora.\nUso de las lámparas de sal del himalaya\nColocación:\nColoca la lámpara en una habitación donde pases mucho tiempo, como la sala de estar, el dormitorio o la oficina. Es especialmente beneficioso tenerla cerca de dispositivos electrónicos.\nEncendido:\nMantén la lámpara encendida la mayor parte del tiempo para maximizar sus beneficios. No solo cuando estés en la habitación, ya que su efecto es continuo y acumulativo.\nMantenimiento:\nLas lámparas de sal pueden sudar en ambientes muy húmedos, por lo que es importante colocarlas sobre una superficie que no se dañe con la humedad. Límpialas suavemente con un paño seco si acumulan polvo.\nPago protegidomercado pago", "necs": ["aromas"], "pr": {"minorista": 35000}, "st": {"minorista": true}, "ids": {"minorista": 229338270}, "mangos": {"minorista": "lamparas-de-sal-del-himalaya-grande-iwdgm"}},
  {"n": "Lavero 7 chacras armonizador", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-46-73ffc816304e40813b17426662134149-640-0.webp", "d": "Llavero Armonizador 7 Chacras con Esfera Diamantada\nDescubre el equilibrio y la armonía en tu vida con nuestro Llavero Armonizador 7 Chacras . Diseñado especialmente para aquellos que buscan una conexión más profunda con su energía interior, este llavero es mucho más que un simple accesorio.\nEsfera Diamantada : La esfera diamantada no solo le da un toque elegante, sino que también actúa como un potenciador energético , ayudando a alinear tus chacras y a equilibrar tus emociones.\nDiseño Único : Cada llavero está elaborado con materiales de alta calidad, garantizando durabilidad y un estilo distintivo. Su diseño compacto lo convierte en el compañero ideal para llevar siempre contigo.\nBeneficios Energéticos : Al llevar este llavero, podrás experimentar una mejora en tu bienestar físico y emocional. Ideal para quienes practican meditación o buscan un objeto que les recuerde su camino hacia la paz interior.\nSi tienes alguna pregunta o deseas consultar disponibilidad , no dudes en ponerte en contacto con nosotros. Estamos aquí para ayudarte a encontrar el equilibrio que buscas.\nFormas de pago : Este producto se puede pagar con todas las formas de pago disponibles en nuestra tienda.\n¡No esperes más para llevar contigo la energía de los 7 chacras", "necs": ["aromas"], "pr": {"minorista": 3000}, "st": {"minorista": false}, "ids": {"minorista": 229338252}, "mangos": {"minorista": "lavero-7-chacras-armonizador"}},
  {"n": "Llavero 7 chacras yoga meditacion", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-40-43f2869b558a27c0d117426571717974-640-0.webp", "d": "Llavero 7 Chacras Yoga Meditación\nConéctate con tu energía interior a través de nuestro exclusivo Llavero 7 Chacras . Este hermoso accesorio no solo es funcional, sino que también es un símbolo de equilibrio y armonía en tu vida cotidiana.\nCaracterísticas del Producto:\nDiseño Único : Cada llavero está meticulosamente diseñado con los símbolos de los siete chacras, promoviendo la meditación y el bienestar.\nMateriales de Alta Calidad : Fabricado con materiales duraderos que garantizan una larga vida útil, ideal para llevar tus llaves con estilo.\nIdeal para Practicantes de Yoga : Perfecto para quienes buscan integrar la espiritualidad en su día a día. Este llavero se convierte en un recordatorio constante de tu práctica de yoga y meditación.\nRegalo Perfecto : Sorprende a amigos o familiares interesados en el yoga y la meditación. Un regalo significativo que simboliza el crecimiento personal y la energía positiva.\nBeneficios:\nFomenta la Meditación : Lleva contigo un símbolo de paz y balance que te ayudará a recordar la importancia de la meditación en tu vida.\nAumenta la Consciencia : Este llavero es una excelente herramienta para mantenerte enfocado en tus objetivos espirituales y emocionales.\nNo dudes en adquirir el Llavero 7 Chacras hoy mismo y comienza tu viaje hacia la paz interior.\nFormas de Pago\nEste producto se puede pagar con todas las formas de pago disponibles. Si tienes alguna duda, no dudes en contactarnos a través de nuestro correo electrónico o redes sociales.\n¡Invierte en tu bienestar y armonía", "necs": ["aromas"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 229338256}, "mangos": {"minorista": "llavero-7-chacras-yoga-meditacion"}},
  {"n": "Llavero -- Búho", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/22-c63c0c5dfbce1b456117502769367217-640-0.webp", "d": "Llavero Búho\nEl Llavero Búho es un accesorio único que no solo sirve para mantener tus llaves organizadas, sino que también simboliza sabiduría, conocimiento, protección y buena suerte . Este llavero, con su diseño encantador, es perfecto para quienes valoran estos significados en su vida diaria.\nCaracterísticas del Producto:\nMaterial: Fabricado con materiales de alta calidad que garantizan durabilidad.\nDiseño: Elegante y distintivo, ideal para cualquier estilo personal.\nSimbolismo: Un búho en tu llavero puede ser un recordatorio constante de la importancia de la sabiduría en la toma de decisiones.\nUso:\nEste llavero es perfecto para regalar a amigos y familiares, o simplemente para disfrutarlo tú mismo. Aporta un toque especial a tus llaves y puede ser un excelente tema de conversación.\nNo dejes pasar la oportunidad de tener este Llavero Búho , un accesorio que combina funcionalidad y significado.", "necs": ["aromas"], "pr": {"minorista": 4000}, "st": {"minorista": false}, "ids": {"minorista": 276989559}, "mangos": {"minorista": "llavero-buho"}},
  {"n": "llaveros armonizador - con ojo turco", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/llavero-armonizador-2540cb8c3fd6bc919a17583191454175-640-0.webp", "d": "Llavero Armonizador Facetado : una pieza única que combina funcionalidad y estética en un diseño delicado y elegante. Este llavero ha sido cuidadosamente elaborado con un acabado facetado que refleja la luz, aportando un toque de sofisticación y energía positiva a tu día a día.\nIdeal para quienes valoran la armonía y el equilibrio, el llavero armonizador no solo cumple su función de mantener tus llaves organizadas, sino que también actúa como un objeto de protección y bienestar emocional. Gracias a su diseño facetado, este accesorio irradia energía y buenas vibras en cada movimiento.\nFabricado en Argentina, este llavero es perfecto para regalar o para complementar tu colección personal. Su tamaño compacto y peso ligero facilitan su uso y transporte, permitiéndote llevar bienestar en cada paso.\n¿Por qué elegir nuestro Llavero Armonizador Facetado?\nDiseño exclusivo y elegante en acabado facetado.\nMaterial de alta calidad que asegura durabilidad.\nFunción de armonizador energético, promoviendo equilibrio y paz interior.\nIdeal para regalar y regalarse, en cualquier ocasión especial.\nIncorpora este hermoso llavero a tu rutina diaria y experimenta cómo la energía positiva puede acompañarte en todo momento. Aprovechá la oportunidad de adquirir un accesorio que combina belleza, funcionalidad y bienestar, con la confianza de estar comprando en una tienda argentina comprometida con la calidad y la satisfacción del cliente.", "necs": ["aromas"], "pr": {"minorista": 4000}, "st": {"minorista": false}, "ids": {"minorista": 267066426}, "mangos": {"minorista": "llaveros-armonizador-con-ojo-turco"}},
  {"n": "llaveros holisticos", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/7e90f49e-19ef-46b5-9abf-1eaa77f82fba-410b9ce1a726f8664217817855949278-640-0.webp", "d": "Descubrí nuestros llaveros holísticos de acero y resina , diseñados con símbolos poderosos como la Mano de Fátima , Palo Santo y los 7 chakras , acompañados de delicados flecos y figuras de Buda. Cada pieza es un amuleto de protección y energía positiva, ideal para llevar siempre contigo. ¡Un accesorio que combina estilo y espiritualidad para tu día a día", "necs": ["aromas"], "pr": {"minorista": 4500}, "st": {"minorista": true}, "ids": {"minorista": 351182530}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/121edaba-b696-4ea5-9d51-0fdd915c9631-b197c2ec3b327cb61817817901492088-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/3fa2a8f8-955f-4e39-823a-35459b6504b4-abc161de6eaa6744a717817864753337-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/7e90f49e-19ef-46b5-9abf-1eaa77f82fba-410b9ce1a726f8664217817855949278-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/915ae404-9b63-480e-8812-bc812eb9f485-8b5ca2c80279ccc4e317817875080058-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/92653862-d8cb-4e03-8994-1b1d78ba0c1d-13f10e1df1365052c217817867599199-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a55311dd-6d35-46c7-94de-ba120089b448-2b7e3a5eebec24f88117817904190130-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/df2c40a5-493f-4eba-8131-f5994d001b57-18245c3771ade3c71c17817871599016-480-0.webp"], "mangos": {"minorista": "llaveros-holisticos-1ssvm"}},
  {"n": "Llaveros Mano De Fatima 1/unidad (Promo Verano 10+1)", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/llavero-mano-de-fatima-5a37472c3ddc1c81da17271934504762-640-0.webp", "d": "Llaveros Mano Fatima Esmaltada Con Dije\nVarios colores y diseños de mandala\n(producto en promocion verano 10+1 ) opcional\nSe elije 10 en cantidad recibe 11 equivale al 10% de descuento sobre esta compra\nAnte cualquier duda pueden conectarse conn nosotros por la via mail en la seccion de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["aromas"], "pr": {"minorista": 1500}, "st": {"minorista": false}, "ids": {"minorista": 229337929}, "opcion": "Llaveros", "vars": [{"id": 1022295318, "n": "Mano Fatima con Flecos", "p": 3000, "s": false}, {"id": 1022295323, "n": "Mano Fatima Esmaltada con Dije", "p": 3000, "s": false}, {"id": 1022295326, "n": "Ojo Turco con Flecos", "p": 1500, "s": false}], "mangos": {"minorista": "llaveros-mano-de-fatima-1-unidad-promo-verano-101"}},
  {"n": "Loción para el Cuidado de Uñas y Pies – 30 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/locion-hongos-catalogo-026a5deb9f60c770c817801573040273-640-0.webp", "d": "Locion pedica´para onicomicosis 30CC\n( HONGOS EN UÑAS )\nMODO DE USO:\nSe debe colocar 4 gotas por día 2 en la cutícula y dos por debajo de la uña, si no se tiene gotero se puede humectar una gasa con la loción y colocar sobre la superficie de la uña y así todos los días.\nCada 7 días se debe limar para remover el hongo muerto y seguir colocando la loción y volver a limar..\nLa loción se encarga de matarlo pero queda como célula muerta pegado es por eso que con la lima se remueve dicha celula muerta y logramos porosidad para que la loción siga haciendo efecto mas profundo.\nCon el correr de los días verán como la uña empieza a sanar y ponerse de color rosa.\nLa velocidad de curación se la da su propio pH corporal y el grado de avance que tenga cada persona\nLa onicomicosis es la infección micótica de la lámina ungueal o el lecho ungueal. Las uñas presentan deformación y decoloración amarillenta o blanquecina. El diagnóstico se basa en el aspecto de las uñas, el examen microscópico húmedo, el cultivo, PCR (polymerase chain reaction) o una combinación de ellos.\nfabricada con : ajo,romero,jarilla,alcanfor,limon, bidestilada, aloe vera\nEste producto tiene su explicacion en el dorso del frasco", "necs": ["hongos"], "pr": {"distribuidor": 5600, "mayorista": 6400, "minorista": 8000}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 358877975, "mayorista": 229338105, "minorista": 229337967}, "rat": {"n": 2, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/locion-hongos-catalogo-026a5deb9f60c770c817801573040273-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-a6a9f0c8659bd3e07217801573068463-480-0.webp"], "vend": "+390 vendidos", "mangos": {"distribuidor": "locion-para-el-cuidado-de-unas-y-pies-30-ml-venta-minorista-copia-f9dko", "mayorista": "locion-pedica-para-onicomicosis-hongos-x-1-publicacion-mayorista", "minorista": "locion-pedica-para-onicomicosis-hongos-x-1"}},
  {"n": "PACK X 2 GEL CRIÓGENICO CONTORNO DE OJOS PARA BOLSITAS", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/pack-contorno-bolsitas-904c739a4749be495517808792758061-640-0.webp", "d": "Gel criogénico para contorno de Ojos para las bolsitas x 30grs pack x 2 efecto frio\nEste producto es para uso diurno en casos de inflamaciones sobre la zona baja del ojo .\nEjemplo : pómulos, patitas de gallo, bolsas debajo de los ojos.\npara casos inflamados se puede ayudar, puedes ayudar colocando el producto en la heladera 1 hora antes de su aplicación, asi se acelera los procesos desinflamatorios de las bolsitas\nIngredientes : gel criogénico con mentol, menta, aceite de argán, aceite de zanahoria..\nSu aplicacion es de dosis minima.. Sobre la zona.. Solo apoyar con la yema del dedo\nAnte cualquier duda pueden conectarse con nosotros por la via mail", "necs": ["packs", "corporal"], "pr": {"minorista": 16000}, "st": {"minorista": true}, "ids": {"minorista": 264245934}, "rat": {"n": 2, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/beneficios-del-gel-criogenico-a4169049f05d34a93317811768054559-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-0181cbb0cc275bb5f517721941495268-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/pack-contorno-bolsitas-904c739a4749be495517808792758061-480-0.webp"], "vend": "+40 vendidos", "mangos": {"minorista": "pack-x-2-gel-criogenico-contorno-de-ojos-para-bolsitas-4qzfw"}},
  {"n": "Palo Santo Peruano cortado paquete", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/add19a5b-55a3-4036-bcdf-238b6bd0e570-ce1962d96c6743f49d17581933465963-640-0.webp", "d": "Palo Santo\n#dicipa lo negativo | trabaja las emociones || buen aroma\nPalo santo : Es utilizado para aliviar las enfermedades causadas por el estrés, así como para mantener la calma y el equilibrio emocional, elevar la autoestima y mejorar el humor. el incienso de esta madera contiene propiedades medicinales antirreumáticas, diuréticas, depurativas y antisépticas, además de ser una gran fuente de antioxidantes.\nAnte cualquier duda pueden conectarse conn nosotros por la via mail en la seccion de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["aromas"], "pr": {"minorista": 2000}, "st": {"minorista": true}, "ids": {"minorista": 229337625}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/add19a5b-55a3-4036-bcdf-238b6bd0e570-ce1962d96c6743f49d17581933465963-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/palo-santo-fondo-ia-43f441c23123901df917373167309227-1024-1024-0b09529afee2f2122e17581933471937-480-0.webp"], "vend": "+40 vendidos", "mangos": {"minorista": "palo-santo-peruano-cortado-paquete"}},
  {"n": "Perfume Aurico Flores Silvestres C/ Lavanda baja ansiedad", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/probalo-234c2815a8539ea0e617572809405855-640-0.webp", "d": "Perfume Aurico\nEl rociador áurico de flores silvestres de muy ricos aromas permite y ayuda a la armonización a través de la conexión por aromaterapia se puede rociar también sobre la ropa y sentirás por un largo rato este bellísimo aroma estimulante de la paz que te acompaña para poder armonizar tus chacras ideal para meditar masajes reiki presentación en envase pep, con pipeta rociadera con un flor de lavanda en su interior para la combinación de ilianol para el estrés\nPrecio por unidad en 60mll\nAnte cualquier duda pueden conectarse con nosotros por la via e- mail en la sección de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["descanso", "aromas"], "pr": {"minorista": 8000}, "st": {"minorista": true}, "ids": {"minorista": 229337848}, "vend": "+110 vendidos", "mangos": {"minorista": "perfume-aurico-flores-silvestres-c-lavanda-baja-ansiedad"}},
  {"n": "Plata Coloidal Premium – 250 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a380fc92-ce5a-4f81-bea2-1d8081431a95-fa0fd5956b721ce07617822602784800-640-0.webp", "d": "Plata Coloidal 250 ml\nLos iones de plata se usan para Corrigir como primer medida la glándula peneal, luego la tiroides, saca todo los residuos químicos que nos dejan fármacos por el hígado, sube nuestro PH de la sangre y nos ponemos alcalinos. Regenera células nuevas en el cuerpo mata patógenos cancerígenos regula azúcar en sangre en personas diabéticas, sirve para mejorar la cándida.. ES UN AUTO- REGENERADOR CELULAR, ayuda a limpiar el higado, sirve en higados grasos, mata patogenos cancerigenos,sirve par liberticulos y varias patologias mas\nLa plata coloidal esta fabricada desde un rango de -23ppm a 30ppm -- La dosis promedio para un ser humano debe rondar en los 5 mlm (media tapita) , para patologias cronicas La plata coloidal abarca alrededor de 600 patologias entre las mas conocidas estan la diabetes, el ph corporal la glandula peneal la tiroides corta infecciones internas y externas , hongos de piel, hongo internos ulceras, alergias intestinales hemorroides sangrantes sangrado uterino liberticulos etc. Limpia y desinfecta vias urinarias limpia los residuos quimicos que peuden dejar algunos farmacos por el higado - mejora el higado graso regula muy bien la azucar en sangre Un cuerpo humano necesita como minimo 240mlm de ingesta para empezar en un cambio de ciclo.- asi como un farmaco tiene una dosis especifica y un tiempo los iones tambien lo tienen. para patologias cronicas se debe tomar o hacer un tratamiento con un piso de 3 meses luego se deja un ventana de tiempo de 30-60 dias y luego se puede continuar . una vez realizado este tratamiento de descanza sin ingesta de 3 meses", "necs": ["defensas", "digestion", "hongos", "femenino"], "pr": {"distribuidor": 6370, "minorista": 9100, "mayorista": 7280}, "st": {"distribuidor": true, "minorista": true, "mayorista": true}, "ids": {"distribuidor": 330186182, "minorista": 229337696, "mayorista": 229338221}, "rat": {"n": 4, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/295ccda0-97a3-468e-b93d-6539b5dc5509-ebcc4773b680bd11a517855849327000-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a380fc92-ce5a-4f81-bea2-1d8081431a95-fa0fd5956b721ce07617822602784800-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-054c58d5ecf04b373517822602866924-480-0.webp"], "vend": "+420 vendidos"},
  {"n": "POUCH MIX DEFUMACION CON CARBON ( VRINDA)", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-caa597b704c2c1d6f417425886069981-640-0.webp", "d": "POUCH MIX DEFUMACION CON CARBON ( VRINDA)\nDescubre el poder de la defumación con el Pouch Mix de Carbon Vrinda. Este innovador producto está diseñado para purificar el ambiente y crear una atmósfera de bienestar en tu hogar o espacio personal.\nIngredientes Clave:\nCarbón Activado: Conocido por sus propiedades absorbentes, ayuda a eliminar impurezas y olores no deseados, brindando un aire más limpio y fresco.\nModo de Uso:\nColoca el pouch en la zona que deseas purificar y deja que el carbón haga su magia. Es ideal para usar en salas, oficinas o cualquier espacio que necesite una renovación de energía.\nBeneficios:\nPurificación del Aire: El carbón activado atrapa partículas y contaminantes, mejorando la calidad del aire que respiras.\nAmbiente Relajante: Crea un espacio propicio para la meditación y la concentración, promoviendo una sensación de calma y tranquilidad.\nal Cliente\nAnte cualquier duda, puedes conectarte con nosotros a través del e-mail en la sección de contacto, o por nuestras redes sociales. Siempre estamos aquí para acompañarte con los brazos abiertos.\nFormas de Pago\nEste producto se puede pagar con todas las formas de pago disponibles en nuestra tienda.\nTransforma tu espacio con la defumación natural que ofrece el Pouch Mix de Carbon Vrinda. ¡Haz tu pedido hoy y siente la diferencia", "necs": ["aromas"], "pr": {"minorista": 2500}, "st": {"minorista": false}, "ids": {"minorista": 261182783}, "opcion": "Integraciones", "vars": [{"id": 1158669962, "n": "MIX DE 7 CHAKRAS", "p": 2500, "s": false}, {"id": 1158669970, "n": "MIX DE EXITO", "p": 2500, "s": false}, {"id": 1158669977, "n": "MIX DE PROSPERIDAD", "p": 2500, "s": false}, {"id": 1158669981, "n": "MIX DE AMOR", "p": 2500, "s": false}, {"id": 1158669988, "n": "MIX DE INTENCIONES", "p": 2500, "s": false}], "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/1-caa597b704c2c1d6f417425886069981-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/2-8278a8ae90719884cc17425886099418-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/3-b2e1ab7dfb19c6671717425886142227-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/4-9bbaf74aa3b50c5b9d17425886185253-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/5-2f377b05e7ba097d6717425886220059-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/6-98c011f277327ad68a17425886296144-480-0.webp"], "mangos": {"minorista": "pouch-mix-defumacion-con-carbon-vrinda"}},
  {"n": "PROMO RESTAURADOR-CREMA +ACEITE FLORES", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-salendula-aceite-b38ab4acf1cd4b361d17811354631923.png", "d": "🌼 COMBO RESTAURADOR – ACEITE + CREMA DE CALÉNDULA 🌼\nUn dúo natural pensado para restaurar, calmar y nutrir la piel desde lo más profundo. Hechos con flores puras de caléndula , este combo combina el poder regenerador de la naturaleza con la suavidad de una fórmula artesanal.\n🔸 Aceite de Caléndula Infusión lenta de flores en aceite vegetal, enriquecido con: 🥕 Extracto de zanahoria – Aporta betacarotenos que regeneran y protegen 💜 Lavanda – Calma, relaja y aporta propiedades antiinflamatorias\nIdeal para pieles sensibles, secas, irritadas o expuestas al sol.\n🔸 Crema de Caléndula Textura liviana y humectante, perfecta para uso diario en rostro y cuerpo. Hidrata, alivia y ayuda a restaurar el equilibrio natural de la piel.\n✔️ 100% natural ✔️ Libre de parabenos y fragancias artificiales ✔️ Apta para todas las edades\n💚 Usalo en pieles delicadas, quemaduras, rosácea, eczemas o simplemente para embellecer tu piel con lo mejor de las plantas.\n🛒 ¡Disponible ahora en nuestra tienda! 👉 Elegí bienestar. Elegí naturaleza. 🌿", "necs": ["packs"], "pr": {"minorista": 16000}, "st": {"minorista": true}, "ids": {"minorista": 266087721}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/3a83b40e-a908-486d-a8ce-bcfdd042059e-54dbe4abc47c0a6a3117594498813441-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/combo-salendula-aceite-b38ab4acf1cd4b361d17811354631923.png-480-0.webp"], "vend": "+60 vendidos", "mangos": {"minorista": "promo-restaurador-crema-aceite-flores"}},
  {"n": "Pulsera OJO turco EXTENSIBLE", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/ojo-turco-proteccion-1-7ebb4215a74b0bb31717462123291507-640-0.webp", "d": "Pulsera Ojo Turco Extensible\nLa pulsera Ojo Turco es un accesorio elegante y significativo, ideal para quienes buscan protección y estilo. Esta pulsera está diseñada con un encantador ojo turco, conocido por su capacidad de alejar las energías negativas y brindar buena suerte.\nCaracterísticas del producto:\nExtensible : Se adapta cómodamente a diferentes tamaños de muñeca, asegurando un ajuste perfecto.\nMateriales de alta calidad : Confeccionada con materiales resistentes y duraderos.\nEstilo versátil : Perfecta para usar en cualquier ocasión, ya sea de manera informal o más elegante.\nLa pulsera Ojo Turco es el regalo ideal para seres queridos, simbolizando protección y bienestar.\nSi tienes alguna pregunta, no dudes en contactarnos a través de nuestro correo electrónico o redes sociales. Estamos aquí para ayudarte.\nFormas de pago : Este producto se puede abonar con todas las formas de pago disponibles.", "necs": ["aromas"], "pr": {"minorista": 4500}, "st": {"minorista": true}, "ids": {"minorista": 268224030}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/ojo-turco-proteccion-1-7ebb4215a74b0bb31717462123291507-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/ojo-turco-proteccion-496a4852313e08300817462123438847-480-0.webp"], "mangos": {"minorista": "pulsera-ojo-turco-extensible"}},
  {"n": "SAHUMOS ARTESANALES SINERGICOS x 1", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/sahumos-400px-5032a9f909582a04ed17272674529405-640-0.webp", "d": "SAHUMO\nARTESANALES\n-El Sahúmo de Lavanda tiene propiedades relajantes, asisten a la sanación espiritual, liberar bloqueos personales y atrae energías positivas, dando apertura, purificación y conexión espiritual. Ideal para limpieza energética de todos tus ambientes.\n-Sahumo de Romerillo : trabaja sobre la limpieza, curación, protección y alineación del espíritu, tambien compensa y purifica el chakra de la garganta \"vishuddha\"\nSahumos para disipar lo negativo || Modo de uso: prender en una de las puntas del producto y pasarlo desde en fondo de tu hogar hacia la puerta principal , con movimientos circulares , al terminar de pasarlo apagarlo con la punta del pie y/e utilizarlo cuando se precise nuevamente\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["aromas"], "pr": {"minorista": 2000}, "st": {"minorista": true}, "ids": {"minorista": 229337599}, "vend": "+10 vendidos", "mangos": {"minorista": "sahumos-artesanales-sinergicos-x-1"}},
  {"n": "Sales de Baño Marinas para Relax y Bienestar", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/930684b5-07ad-4851-b46c-1b705b3a0af1-8ff2490ac1d6ce2e6417573314767093-640-0.webp", "d": "Sales de Baño con Semillas Aromáticas - Marca Habitad Natura\nSumérgete en una experiencia de relajación única con las Sales de Baño con Semillas Aromáticas de Habitad Natural. Diseñadas para revitalizar cuerpo y mente, estas sales combinan minerales esenciales y el poder de las semillas aromáticas para un momento de autocuidado incomparable.\nBeneficios:\nRelajación profunda: Ayudan a aliviar el estrés y la tensión muscular, promoviendo un descanso reparador.\nExfoliación natural: Las semillas aromáticas exfolian suavemente la piel, dejándola suave y revitalizada.\nAromaterapia: Los aromas naturales favorecen la calma, el equilibrio emocional y la sensación de bienestar.\nHidratación y cuidado: Los minerales esenciales nutren la piel, dejándola radiante y saludable\nTransforma tu baño en un oasis de tranquilidad con las Sales de Baño con Semillas Aromáticas de Habitad Natural, el aliado perfecto para tu rutina de bienestar.\nLAS SALES PUEDEN SER DE VIOLEETAS LAVANDAS LIMON REYNA DE LA NOCHE MANZANA VERDE COCO MIL FLORES DEPENDE EL STOCK DEL MOMENTO", "necs": ["descanso", "piel", "corporal"], "pr": {"distribuidor": 4200, "mayorista": 5000, "minorista": 6000}, "st": {"distribuidor": true, "mayorista": true, "minorista": true}, "ids": {"distribuidor": 326644347, "mayorista": 249755113, "minorista": 249755058}, "opcion": "aroma", "vars": [{"id": 1519756715, "n": "Pasion rosa (fascinasion)", "p": 6000, "s": true}, {"id": 1519756717, "n": "rosas", "p": 6000, "s": true}, {"id": 1519756718, "n": "limon", "p": 6000, "s": true}, {"id": 1519756719, "n": "pimpollos de jazmin", "p": 6000, "s": true}, {"id": 1519756720, "n": "Lavanda del valle (anti-stres)", "p": 6000, "s": true}, {"id": 1519756721, "n": "coco", "p": 6000, "s": true}], "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/930684b5-07ad-4851-b46c-1b705b3a0af1-8ff2490ac1d6ce2e6417573314767093-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/logo-de-registro-de-marca-d8734de4549a5f056f17781185354889-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/sales-de-bano-pie-ab8d15c7a92badb48617781185184170-480-0.webp"], "mangos": {"distribuidor": "sales-de-bano-marina-con-esencias-y-semillas-x-unidad-copia-b0mqu", "mayorista": "sales-de-bano-marina-con-esencias-y-semillas-x-unidad-mayorista-debe-cubrir-monto-mayorista", "minorista": "sales-de-bano-marina-con-esencias-y-semillas-x-unidad"}},
  {"n": "Semillas de Chía Ricas en Fibra y Omega 3", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/semillas-de-chia-3b2a2f97cf7a57ffd717265792543688-640-0.webp", "d": "Las semillas de chía son ricas en nutrientes y tienen múltiples propiedades beneficiosas para la salud. A continuación te detallo algunas de las principales propiedades de las semillas de chía :\n1. Ricas en Omega-3 :\nLas semillas de chía son una de las fuentes vegetales más ricas en ácidos grasos Omega-3 , especialmente el ácido alfa-linolénico (ALA). Los Omega-3 son esenciales para la salud del corazón, reducen la inflamación y pueden ayudar a mejorar los niveles de colesterol.\n2. Fuente de fibra :\nSon extremadamente ricas en fibra , lo que promueve una buena digestión y salud intestinal. La fibra también ayuda a controlar los niveles de azúcar en la sangre y puede ayudar en la pérdida de peso al aumentar la sensación de saciedad.\n3. Alto contenido en proteínas :\nLas semillas de chía contienen una cantidad significativa de proteínas vegetales , lo que las convierte en una excelente opción para vegetarianos y veganos. Las proteínas son esenciales para la reparación y el crecimiento muscular.\n4. Ricas en antioxidantes :\nContienen antioxidantes que ayudan a combatir los radicales libres, reduciendo el daño celular y el envejecimiento prematuro. Los antioxidantes también pueden reducir el riesgo de enfermedades crónicas.\n5. Minerales esenciales :\nLas semillas de chía son una buena fuente de varios minerales importantes, incluyendo: Calcio : Importante para la salud ósea.\nMagnesio : Ayuda en la función muscular y nerviosa.\nFósforo : Esencial para la formación de huesos y dientes.\nZinc : Importante para el sistema inmunológico.\n6. Hidratación :\nLas semillas de chía pueden absorber entre 9 y 12 veces su peso en agua, formando un gel que ayuda a mantener el cuerpo hidratado por más tiempo. Esto es especialmente útil para atletas o personas que realizan actividades físicas.\n7. Regulación de los niveles de azúcar en la sangre :\nDebido a su alto contenido de fibra soluble, las semillas de chía pueden ayudar a controlar los niveles de glucosa en sangre , lo que es beneficioso para personas con diabetes o que buscan estabilizar sus niveles de azúcar.\n8. Efecto saciante :\nGracias a su contenido en fibra y su capacidad para expandirse cuando se mezclan con líquidos, las semillas de chía proporcionan una sensación de saciedad, lo que puede ser útil para el control del peso y reducir los antojos.\n9. Mejoran la salud digestiva :\nLas semillas de chía ayudan a prevenir el estreñimiento al facilitar el tránsito intestinal gracias a su fibra soluble, que también alimenta a las bacterias saludables del intestino.\n10. Facilidad de uso en la cocina :\nSon muy versátiles y fáciles de incorporar en la dieta. Se pueden agregar a batidos, yogures, ensaladas, panes, y se usan para hacer pudines o como reemplazo del huevo en recetas veganas.\n11. Aptas para personas con intolerancia al gluten :\nLas semillas de chía no contienen gluten, lo que las convierte en una excelente fuente de fibra y nutrientes para personas con enfermedad celíaca o sensibilidad al gluten.\nEn resumen, las semillas de chía son un súper alimento con muchos beneficios para la salud, desde el control del peso y la digestión hasta la protección cardiovascular. Son una opción fácil y saludable para incluir en cualquier dieta.", "necs": ["defensas", "cardiovascular"], "pr": {"minorista": 600}, "st": {"minorista": true}, "ids": {"minorista": 229338259}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/chia-3ea213d43e4f22f33e17265794507614-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-08ab71dc15f017468d17716736709986-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/semillas-de-chia-3b2a2f97cf7a57ffd717265792543688-480-0.webp"], "vend": "+60 vendidos", "mangos": {"minorista": "semillas-de-chia"}},
  {"n": "Super Conos!! X 3", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/conos-70922c5c6a7d57fa7a17583691206831-640-0.webp", "d": "Super Conos!! - Buena Defumación\nLos Super Conos son la elección perfecta para quienes buscan una experiencia de defumación excepcional. Con una buena defumación , estos conos no solo llenan el ambiente de fragancias cautivadoras, sino que también se conservan bien durante mucho tiempo, asegurando que cada uso sea tan fresco como el primero.\nCaracterísticas destacadas:\nDurabilidad : Diseñados para mantener su aroma y efectividad.\nAromas variados : Desde esencias florales hasta fragancias más profundas, ideales para cualquier ocasión.\nFácil de usar : Simplemente enciende la punta y disfruta de la experiencia aromática.\nCada cono está elaborado con ingredientes de alta calidad, lo que garantiza que tu espacio se llene de vibras positivas y energía renovada. Además, son ideales para meditación, yoga o simplemente para crear un ambiente acogedor en tu hogar.\nFormas de pago : Este producto se puede pagar con todas las formas de pago disponibles en nuestra tienda.\nAnte cualquier duda, pueden conectarse con nosotros a través del e-mail en la sección de contacto, o bien por redes sociales. ¡Estamos aquí para acompañarlos con los brazos abiertos", "necs": ["aromas"], "pr": {"minorista": 2000}, "st": {"minorista": true}, "ids": {"minorista": 229337624}, "opcion": "Integraciones", "vars": [{"id": 1022310439, "n": "Coco", "p": 2000, "s": true}, {"id": 1022310442, "n": "Sandalo", "p": 2000, "s": true}, {"id": 1022310446, "n": "Violeta", "p": 2000, "s": true}, {"id": 1022310450, "n": "Vainilla", "p": 2000, "s": true}, {"id": 1022310453, "n": "Incienso Vainilla", "p": 2000, "s": true}, {"id": 1022310459, "n": "7 Poderes", "p": 2000, "s": true}, {"id": 1022310462, "n": "Nardo", "p": 2000, "s": true}, {"id": 1022310467, "n": "Limon", "p": 2000, "s": true}, {"id": 1022310471, "n": "Champa", "p": 2000, "s": true}], "mangos": {"minorista": "super-conos15"}},
  {"n": "suplemento dietario calcio 500 c/vitamina D", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/suolemento-dietario-para-huesos-a560d15eaecc34129f17685031144045-640-0.webp", "d": "Suplemento dietario Calcio 500 con Vitamina D – Laboratorio Natufarma\nEste suplemento es ideal para quienes buscan fortalecer sus huesos y mantener un sistema óseo saludable. Cada dosis aporta 500 mg de calcio , un mineral esencial para la formación y mantenimiento de huesos y dientes fuertes.\nLa fórmula se complementa con vitamina D , que facilita la absorción del calcio en el organismo, optimizando su aprovechamiento y contribuyendo a la prevención de enfermedades óseas como la osteoporosis.\nCaracterísticas principales:\nProducto de alta calidad, elaborado por Laboratorio Natufarma.\nIndicado para adultos que requieren un aporte extra de calcio.\nFavorece la salud ósea y el correcto funcionamiento muscular.\nPresentación fácil de consumir y dosificar.\nIncorpore este suplemento a su rutina diaria para apoyar la salud de sus huesos y disfrutar de una vida activa y saludable.\ncontiene: caja de 50 comorimidos + prospecto", "necs": ["defensas"], "pr": {"minorista": 8500}, "st": {"minorista": true}, "ids": {"minorista": 318719037}, "mangos": {"minorista": "suplemento-dietario-calcio-500-c-vitamina-d-1beag"}},
  {"n": "Té Verde con Jengibre para el Bienestar Diario", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/verdejengibre-a6c012667e35d813c617807091689067-640-0.webp", "d": "Té Verde Orgánico con Jengibre – Hebras\nDescubrí los beneficios de nuestro Té Verde Orgánico con Jengibre en Hebras , una infusión natural ideal para cuidar tu bienestar general y aliviar molestias musculares y articulares.\nPropiedades y beneficios\nEste té combina té verde orgánico de alta calidad con jengibre, reconocido por sus múltiples propiedades medicinales. Es especialmente recomendado para personas que sufren de dolores musculares y articulares , ya que el jengibre ayuda a reducir inflamaciones y calmar el malestar.\nAdemás, es una excelente opción para quienes atraviesan estados gripales, ya que tiene un poder antioxidante que contribuye a fortalecer el sistema inmunológico y mejorar la respuesta del organismo frente a infecciones.\nModo de preparación\nPara disfrutar de sus beneficios, colocá una cucharadita de las hebras por taza de agua caliente. Podés endulzar la infusión con miel o stevia, opciones naturales que complementan el sabor y potencian sus efectos saludables.\nPor qué elegir nuestro té\n100% orgánico y libre de pesticidas\nElaborado con ingredientes seleccionados para garantizar pureza y frescura\nPromueve el bienestar articular y muscular\nRefuerza el sistema inmune con antioxidantes naturales\nIdeal para quienes buscan una infusión natural que aporte alivio y bienestar en su rutina diaria.\nDisfrutá de un momento de relax y salud con nuestro Té Verde Orgánico con Jengibre en Hebras , un aliado natural para cuidar tu cuerpo desde adentro.\nContenido neto: acorde a presentación.\nForma de pago: Aceptamos múltiples métodos para tu comodidad.\nConsultanos ante cualquier duda, estamos para acompañarte en tu camino hacia una vida más saludable.", "necs": ["dolor", "defensas"], "pr": {"minorista": 3000}, "st": {"minorista": true}, "ids": {"minorista": 342821960}, "vend": "+10 vendidos", "mangos": {"minorista": "hebras-verde-con-jengibre-11bc1"}},
  {"n": "TES EN HEBRAS ROJO VERDE Y NEGRO", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/te-organico-fefa7b9990bb6d885617807099430759-640-0.webp", "d": "Tés Orgánicos en Hebras – Verde, Negro y Rojo\nDescubrí la pureza y el sabor auténtico de nuestros tés orgánicos en hebras , presentados en elegantes sobres tipo tubo. Disfrutá de una experiencia sensorial única con tres variedades seleccionadas:\n🍃 Té Verde : Refrescante y antioxidante, ideal para revitalizar cuerpo y mente. 🌑 Té Negro : Intenso y energizante, perfecto para comenzar el día con vitalidad. 🍷 Té Rojo : Suave y equilibrado, ideal para acompañar momentos de bienestar.\nCada envase rinde 35 infusiones , brindándote calidad y aroma en cada taza. ¡Disfrutá lo mejor de la naturaleza en cada sorbo", "necs": ["cardiovascular"], "pr": {"minorista": 1500}, "st": {"minorista": true}, "ids": {"minorista": 257934408}, "opcion": "Color", "vars": [{"id": 1138511382, "n": "Verde", "p": 1500, "s": true}, {"id": 1138511383, "n": "Negro", "p": 1500, "s": true}, {"id": 1138511384, "n": "Rojo", "p": 1500, "s": true}], "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/te-negro-actualizado-ace54dc22abefc74dd17407949457082-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/te-organico-fefa7b9990bb6d885617807099430759-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/te-rojo-actualizado-58673193224b797ec717407949000090-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/te-verde-actualizado-4fcb57b4ad73a92e8617407947810713-480-0.webp"], "vend": "+100 vendidos", "mangos": {"minorista": "tes-en-hebras-rojo-verde-y-negro"}},
  {"n": "TINTURA MADRE ANIS ESTRELLADO X 100CC HABITAD NATURAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/91ce0d2f-ed3d-44b0-b24a-0ee62de43237-aa2dc94a94c9cfc7e217704158856927-640-0.webp", "d": "TINTURA MADRE ANIS ESTRELLADO:\nSE USA PARA COMBATIR GASES FLATOS , COLICOS INTESTINALES EN NIÑOS Y ADULTOS\nI NGESTA Y MODO DE USO:\nSU INGESTA ES CON AGUA , LA DOSIS ES DE 20 GOTAS LA MEDIDA ES EN UN VASO MEDIDA DE SHOT DE TEKILA. .PUEDE INGERIR HASTA 3 VECES AL DIA.\nRECORDAR QUE LA DOSIS ES AUTOEVALUATIVA YA QUE CADA SER HUMANO TIENE UN SISTEMA INMUNOLOGICO DISTINTO AL OTRO Y ESO MODIFICA EL IMPACTO AUN TENIENDO LA MISMA PATOLOGIA DE BASE\nEL PH CORPORAL TAMBIEN MODIFICA LA CANTIDAD DE VECES QUE SE PUEDeS TOMAR\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\nESTE PRODUCTO TIENE SU EXPLICACION EN EL DORSO DEL FRASCO\neste producto no reemplaza a un tratamiento farmacologico\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["femenino"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338028}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/91ce0d2f-ed3d-44b0-b24a-0ee62de43237-aa2dc94a94c9cfc7e217704158856927-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-caf7d54e1574b081f417704158937591-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "tintura-madre-anis-estrellado-x-100cc-habitad-natural"}},
  {"n": "TINTURA MADRE DE ANACAHUITA X 100CC HABITAD NATURAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/87411241-68d2-4fca-bc86-0ad9fa17b5c1-e3be1ab34d0ed643a417704167964970-640-0.webp", "d": "ANACAHUITA TINTURA MADRE\nINGESTA Y MODO DE USO\nSU INGESTA ES CON AGUA , LA DOSIS ES DE 20 GOTAS LA MEDIDA ES EN UN VASO MEDIDA DE SHOT DE TEKILA. .PUEDE INGERIR HASTA 3 VECES AL DIA.\nRECORDAR QUE LA DOSIS ES AUTOEVALUATIVA YA QUE CADA SER HUMANO TIENE UN SISTEMA INMUNOLOGICO DISTINTO AL OTRO Y ESO MODIFICA EL IMPACTO AUN TENIENDO LA MISMA PATOLOGIA DE BASE\nEL PH CORPORAL TAMBIEN MODIFICA LA CANTIDAD DE VECES QUE SE PUEDES TOMAR\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\nESTE PRODUCTO TIENE SIU EXPLICACION EN EL DORSO DEL FRASCO\nESTE PRODUCTO NO REEMPLAZA A UN TRATAMEINTO FARMACOLOGICO\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["respiracion"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338031}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/87411241-68d2-4fca-bc86-0ad9fa17b5c1-e3be1ab34d0ed643a417704167964970-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-ee665db2d0509b6ba417704168012769-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "tintura-madre-de-anacahuita-x-100cc-habitad-natural"}},
  {"n": "TINTURA MADRE DE BARBA DE PIEDRA X 100 C HABITAD NATURAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/aa0e656e-a8bb-46c9-83ce-406ba3216052-b70443acf296f7f15d17702464315496-640-0.webp", "d": "TINTURA MADRE DE BARBA DE PIEDRA :\nPARA TRATAR LAS INFECCIONES URINARIAS PROBLEMAS DE REUMATISMOS DOLORES DE GARGANTA\ningesta y modo de uso:\nla medida es de 20 gotas en un vaso con agua medida tipo shot de tequila hasta 3 veces por dia\nRECORDAR QUE LA DOSIS ES AUTOEVALUATIVA YA QUE CADA SER HUMANO TIENE UN SISTEMA INMUNOLOGICO DISTINTO AL OTRO Y ESO MODIFICA EL IMPACTO AUN TENIENDO LA MISMA PATOLOGIA DE BASE\nEL PH CORPORAL TAMBIEN MODIFICA LA CANTIDAD DE VECES QUE SE PUEDS TOMAR\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\neste prodcuto tiene su explicacion en el dorso del frasco y no representa a un tratamiento farmacologico ante la duda consulte a su medico.\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["defensas", "respiracion"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338037}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/aa0e656e-a8bb-46c9-83ce-406ba3216052-b70443acf296f7f15d17702464315496-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-3ce60d1a89fa54038517702464444338-480-0.webp"], "mangos": {"minorista": "tintura-madre-de-barba-de-piedra-x-100-c-habitad-natural"}},
  {"n": "Tintura Madre de Cardo Mariano – Protección Antioxidante y Digestiva", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/da71911f-61a1-44a1-8592-ded75477a71c-2bb6369b153a27b27c17711922579796-640-0.webp", "d": "Tintura Madre Cardo Mariano : un aliado natural para tu salud hepática y bienestar general.\nEl Cardo Mariano es reconocido por su capacidad para eliminar toxinas del hígado , ayudando a purificar y desintoxicar la sangre de manera efectiva. Entre sus múltiples beneficios, destaca su acción antioxidante, que protege las células hepáticas, favorece la digestión y contribuye a mantener el equilibrio del organismo.\nModo de uso: Se recomienda tomar 20 gotas diluidas en un cuarto de vaso de agua, preferentemente dos veces al día. No es aconsejable su consumo en embarazadas, durante la lactancia ni en niños.\nEste producto natural es ideal para quienes buscan apoyar la función hepática y promover una limpieza interna segura y efectiva. Para cualquier consulta, nuestro equipo está disponible para acompañarte en tu elección.\nFormas de pago: aceptamos todos los medios disponibles en Argentina.", "necs": ["defensas", "digestion", "hongos"], "pr": {"minorista": 18000}, "st": {"minorista": false}, "ids": {"minorista": 325557160}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/da71911f-61a1-44a1-8592-ded75477a71c-2bb6369b153a27b27c17711922579796-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-b3670374d65794198817711922744256-480-0.webp"], "vend": "+40 vendidos", "mangos": {"minorista": "tintura-madre-cardo-mariano-1ozoo"}},
  {"n": "Tintura Madre de Carqueja – Digestión y Cuidado Hepático", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/carqueja-aaa41b89276595fcdd17577639571384-640-0.webp", "d": "Tintura Madre de Carqueja\nEnvase vidrio ambar x 100cc con incerto dosificador\nsirve para enfermedades del hígado estomago riñones como depurativa\nayuda a controlar la glucemia, disminuir la presión arterial, combatir la retención de líquidos, fortalecer el sistema inmune, mejorar la función del hígado, disminuir el colesterol malo, también ayuda en el tratamiento de inflamación entre los tantos beneficios que tiene,\neste producto es una tintura madre orgánica hidroalcolica de cereal , no es un fármaco y se debe tomar con agua en una dosis de 20 gotas en una medida de agua tipo vaso tequila. hasta 3 veces por dia. recuerde que cada sistema inmune es distinto al otro y puede cambiar los impactos modificando la cantidad de dosis a tomar. ante alguna duda puede comunicarse al wap de la web\neste producto es un suplemento dietario, no es un medicamento. suplementa dietas insuficientes. consulte a su médico y/o farmacéutico.\ntodos los productos organicos de habitad van con un pequeño prospecto\naviso legal\n• edad mínima recomendada: 10 años.\n• este producto es un suplemento dietario, no es un medicamento. suplementa dietas insuficientes. consulte a su médico y/o farmacéutico.", "necs": ["digestion", "hongos"], "pr": {"mayorista": 7000, "distribuidor": 6600, "minorista": 9000}, "st": {"mayorista": true, "distribuidor": true, "minorista": true}, "ids": {"mayorista": 229338272, "distribuidor": 328623628, "minorista": 229338271}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/carqueja-aaa41b89276595fcdd17577639571384-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-21db1190bca9d997a517723209245393-480-0.webp"], "vend": "+40 vendidos", "mangos": {"mayorista": "tintura-madre-de-carqueja-mayorista-debe-cubrir-monto-mayorista", "distribuidor": "tintura-madre-de-carqueja-negocios-distribuidor-eieom", "minorista": "tintura-madre-de-carqueja"}},
  {"n": "TINTURA MADRE DE LENGUA DE VACA HABITAD NATURAL X 100 CC", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/3ec09a45-7a34-4536-922b-95a02414239b-6f709581c95fddc55417704173616430-640-0.webp", "d": "TINTURA MADRE DE LENGUA:\nLA LENGUA DE VACA SE USA COMO UN TONICO EN GENERAL REPARADOR DE ENERGIAS, COMBATE LAS ANEMIAS\ningesta y modo de uso:\nse toma con agua 20 gotas en una medida tipo shot de tequila no se debe tomar sola , y puede variar hasta 3 veces al dia\nRECORDAR QUE LA DOSIS ES AUTOEVALUATIVA YA QUE CADA SER HUMANO TIENE UN SISTEMA INMUNOLOGICO DISTINTO AL OTRO Y ESO MODIFICA EL IMPACTO AUN TENIENDO LA MISMA PATOLOGIA DE BASE\nEL PH CORPORAL TAMBIEN MODIFICA LA CANTIDAD DE VECES QUE SE PUEDS TOMAR\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\nESTE PRODUCTO SE ENVIA CON EL VASO DE REGALO Y TIENE SIU EXPLICACION EN EL DORSO DEL FRASCO\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["femenino"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338040}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/3ec09a45-7a34-4536-922b-95a02414239b-6f709581c95fddc55417704173616430-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-50760e77502d3370d417704173696901-480-0.webp"], "mangos": {"minorista": "tintura-madre-de-lengua-de-vaca-habitad-natural-x-100-cc"}},
  {"n": "TINTURA MADRE DE LLANTEN X 100 C HABITAD NATURAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/b82e0cb2-89e4-4b79-aae8-17a74b0b8bb3-9706c9efc50508fed117704169005610-640-0.webp", "d": "TINTURA MADRE LLANTEN:\nPARA TRATAR LA CANDIDIASIS LAS ULCERAS LOS DOLORES DE GARGANTA EL ESTREÑIMINETO\ningesta y modo de uso:\nSU INGESTA ES CON AGUA , LA DOSIS ES DE 20 GOTAS , LA MEDIDA ES UN VASO DE SHOT DE TEKILA. .PUEDE INGERIR HASTA 3 VECES AL DIA.\nRECORDAR QUE LA DOSIS ES AUTOEVALUATIVA YA QUE CADA SER HUMANO TIENE UN SISTEMA INMUNOLOGICO DISTINTO AL OTRO Y ESO MODIFICA EL IMPACTO AUN TENIENDO LA MISMA PATOLOGIA DE BASE\nEL PH CORPORAL TAMBIEN MODIFICA LA CANTIDAD DE VECES QUE SE PUEDS TOMAR\neste producto no representa a un tratamiento farmacologico ante la duda consulte a su medico de cabecera\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\nESTE PRODUCTO TIENE SIU EXPLICACION EN EL DORSO DEL FRASCO", "necs": ["respiracion"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338036}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/b82e0cb2-89e4-4b79-aae8-17a74b0b8bb3-9706c9efc50508fed117704169005610-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-90fb38904c1df86ee317704169041158-480-0.webp"], "vend": "+20 vendidos", "mangos": {"minorista": "tintura-madre-de-llanten-x-100-c-habitad-natural"}},
  {"n": "TINTURA MADRE DE MELISA X 100 C HABITAD NATURAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a44eec08-788a-435c-a10b-0ca70a61128e-202da13896096f274f17708472289574-640-0.webp", "d": "TINTURA MADRE DE MELISA\nLa tintura madre de melisa se usa para combatir malas digestiones trtar estados de nervios angustias o histerias, este producto es una tintura madre.tipo homeopatico. se debe tomar con agua en una dosis de 20 gotas en una medida tipo shit de tequila. hasta 3 veces al dia\nno consumir en enbarazadas ni periodos de lactancia no apta para niños\nEste producto no representa un tratameinto farmacologico ante la duda consulte a su medico", "necs": ["descanso"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338041}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/a44eec08-788a-435c-a10b-0ca70a61128e-202da13896096f274f17708472289574-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-344f0b44311688a3b817708472357445-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "tintura-madre-de-melisa-x-100-c-habitad-natural"}},
  {"n": "Tintura Madre de Moringa para el Bienestar General – 100 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/b49f7298-e298-4378-8f11-8bef238533f2-dbf59c12287c1cc9b117577839107182-640-0.webp", "d": "TINTURA MADRE DE MORINGA:\nla moringa es anti-hongos, anti tumoral, desinflamatoria, normaliza azucar en sangre y es energizante entre otros beneficios.\ningesta y modo de uso:\nsu ingesta es con agua, la dosis es de 20 gotas, la medida es un vaso con agua medida de shot de tequila. puede ingerir hasta 3 veces al dia.\nrecordar que la dosis es autoevaluativa ya que cada ser humano tiene un sistema inmunologico distinto al otro y eso modifica el impacto aun teniendo la misma patologia de base.\nel ph corporal tambien modifica la cantidad de veces que se puede tomar.", "necs": ["dolor", "defensas", "respiracion", "digestion", "hongos", "femenino", "cardiovascular"], "pr": {"mayorista": 5000, "minorista": 9000}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 229338045, "minorista": 229338043}, "vend": "+20 vendidos", "mangos": {"mayorista": "tintura-madre-de-moringa-x-100-cc-habitad-natural-mayorista-solo-si-cubre-monto-mayorista", "minorista": "tintura-madre-de-moringa-x-100-cc-habitad-natural"}},
  {"n": "TINTURA MADRE DE PAJARO BOBO/ HABITAD NATURAL POR 100 CC", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/pajaro-bobo-5392a87e4cc1b9145917708462933979-640-0.webp", "d": "TINTURA MADRE DE PAJARO BOBO\nCOMBATE EL COLESTEROL Y EL ACIDO URICO\nEste producto es una tintura madre organica homeopatica dinamizada\nMODO DE USO:\nSe toma por ingesta 20 gotas en una medida de agua tipo tequila hasta 2 veces al dia\ndebemos entender que cada sistema inmune es distinto al otro y no todos necesitan la misma dosis\nesto quiere decir que la dosis es autoevaluativa: cada persona tiene un sistema inmune distinto al otro y tambien un ph corporal distinto.\nEsto hace que cada individuo debe autoevaluarse para poder saber en que dosis de la planta tiene mejor impacto\nEste producto es un suplemento dietario no representa un tratamiento farmacologico y ante la duda debe consultar a su medico", "necs": ["defensas", "cardiovascular"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338026}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-98bcc1bdae80eed12817708463096819-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/pajaro-bobo-5392a87e4cc1b9145917708462933979-480-0.webp"], "vend": "+20 vendidos", "mangos": {"minorista": "tintura-madre-de-pajaro-bobo-habitad-natural-por-100-cc"}},
  {"n": "TINTURA MADRE DE PASIONARIA", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/a59f97a3-f5e7-4a2a-8298-d9e7944f7636-b7525210f866eabc4b17702467382719-640-0.webp", "d": "Tintura Madre Pasiónaria\nLa tintura madre de pasionaria es un extracto natural elaborado a partir de las flores y hojas de la planta de pasionaria, conocida por sus propiedades relajantes y sedantes. Este producto es ideal para quienes buscan un alivio natural ante el estrés y la ansiedad.\nAcción Terapéutica\nRelajante Natural: Ayuda a calmar el sistema nervioso y reduce los síntomas de ansiedad.\nMejora del Sueño: Promueve un sueño reparador y disminuye el insomnio, facilitando el descanso.\nAntiespasmódico: Eficaz en el alivio de cólicos y malestar digestivo.\nRelaja palpitaciones\nInstrucciones de Uso\nSe recomienda tomar de 20 a 30 gotas diluidas en un poco de agua, dos a tres veces al día . Para potenciar sus efectos, puede ser útil consumirla antes de dormir.\nConsejos Adicionales\nPara obtener los mejores resultados, combine la tintura madre de pasionaria con hábitos saludables como una alimentación equilibrada y técnicas de relajación, como la meditación o el yoga.\nForma de Pago\nEste producto está disponible para comprar con todas las formas de pago .\nPara cualquier consulta, no duden en comunicarse con nosotros a través de email o por redes sociales . Estamos aquí para acompañarlos en su camino hacia el bienestar.", "necs": ["descanso"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 245005484}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/a59f97a3-f5e7-4a2a-8298-d9e7944f7636-b7525210f866eabc4b17702467382719-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-fb1a3ed638529bdb8817702467471709-480-0.webp"], "vend": "+30 vendidos", "mangos": {"minorista": "tintura-madre-de-pasionaria"}},
  {"n": "TINTURA MADRE DE VALERIANA X 100CC HABITAD NATURAL", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/f3d49ae0-d1fb-4bb1-835a-fe721054b8f0-568a82eade884ea1ac17703388535991-640-0.webp", "d": "TINTURA MADRE ALERIANA\nMUY BUEN SEDANTE ANTIPASMODICO, COMBATE NERVIOSISIMO EN GENERAL.\nINGESTA : SU INGESTA ES CON AGUA , LA DOSIS ES DE 20 GOTAS CON AGUA , LA MEDIDA ES UN VASO CON AGUA MEDIDA DE SHOT DE TEKILA. .PUEDE INGERIR HASTA 3 VECES AL DIA.\nRECORDAR QUE LA DOSIS ES AUTOEVALUATIVA YA QUE CADA SER HUMANO TIENE UN SISTEMA INMUNOLOGICO DISTINTO AL OTRO Y ESO MODIFICA EL IMPACTO AUN TENIENDO LA MISMA PATOLOGIA DE BASE\nEL PH CORPORAL TAMBIEN MODIFICA LA CANTIDAD DE VECES QUE SE PUEDeS TOMAR\nMODO DE USO:\nSe toma por ingesta 20 gotas en una medida de agua tipo tequila hasta 3 veces por dia\ndebemos entender que cada sistema inmune es distinto al otro y no todos necesitan la misma dosis\nesto quiere decir que la dosis es autoevaluativa: cada persona tiene un sistema inmune distinto al otro y tambien un ph corporal distinto.\nEsto hace que cada individuo debe autoevaluarse para poder saber en que dosis de la planta tiene mejor impacto\nEste producto es un suplemento dietario no representa un tratamiento farmacologico y ante la duda debe consultar a su medicoA\nANTE CUALQUIER DUDA PUEDEN CONECTARSE CONN NOSOTROS POR LA VIA MAIL EN LA SECCION DE CONTACTO O POR REDES O POR WAP, LA IDEA SIEMPRE ES ACOMPAÑARLOS CON LOS BRAZOS ABIERTOS\nTIENE SU EXPLICACION EN EL DORSO DEL FRASCO\nFORMAS DE PAGO- ESTE PRODUCTO SE PUEDE PAGAR CON TODAS LAS FORMAS DE PAGO", "necs": ["descanso"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338027}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-702ada8b58343779d417703388641703-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/f3d49ae0-d1fb-4bb1-835a-fe721054b8f0-568a82eade884ea1ac17703388535991-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "tintura-madre-de-valeriana-x-100cc-habitad-natural"}},
  {"n": "TINTURA MADRE-DIENTE DE LEON", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/13b4e8fc-efc0-4015-b9c8-98510ada5a71-13808faa298883aa3517711891737269-640-0.webp", "d": "Tintura Madre de Diente de León La Tintura Madre de Diente de León es un complemento natural ideal para mantener el equilibrio hepático y promover el efecto diurético. Esta fórmula ayuda a depurar y desintoxicar el organismo , facilitando la eliminación de líquidos retenidos y toxinas acumuladas.\nSu uso es sencillo y efectivo: se recomienda tomar 20 gotas en 1/4 vaso de agua , hasta dos veces al día. Es importante no consumir durante el embarazo, la lactancia ni en niños.\nEste producto es una opción natural para quienes buscan apoyar la salud hepática y mejorar la función renal, favoreciendo el bienestar general mediante una acción depurativa y diurética suave pero constante.\nAdemás de los ya mencionados:\nBeneficios adicionales:\nContiene silimarina (complejo hepatoprotector).\nProtege las células hepáticas frente a toxinas.\nApoyo en hígado graso (como complemento).\nFavorece la regeneración hepática.\nSoporte en procesos de detoxificación profunda.\nContribuye a la función digestiva.\nApoyo en digestiones pesadas.\nAcción antioxidante celular.\nPuede colaborar en regulación de colesterol (como apoyo).\nApoyo hepático en tratamientos prolongados (siempre bajo control profesional).\nAnte cualquier consulta, nuestro equipo está disponible para asesorarte y acompañarte en tu camino hacia una mejor salud.\nFormas de pago: aceptamos todas las modalidades para tu comodidad.", "necs": ["defensas"], "pr": {"minorista": 15000}, "st": {"minorista": true}, "ids": {"minorista": 325552731}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/13b4e8fc-efc0-4015-b9c8-98510ada5a71-13808faa298883aa3517711891737269-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-8a74ee7c9d92f02a5517711902901524-480-0.webp"], "vend": "+10 vendidos", "mangos": {"minorista": "tintura-madre-diente-de-leon-1h53t"}},
  {"n": "TINTURA MADRE MEMORIA X 100CC HABITAD NATURAL C/GINKO BILOBA", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/tintura_madre_memoria_ginkgo_1024x1024-7983860e0e58ca51da17576278800789-640-0.webp", "d": "LA TINTURA MADRE MEMORIA\ntiene altos niveles antioxidante, capturando los radicales libres para prevenir el envejecimiento prematuro de los tejidos, en irrigacion cerebral , memoria vista y oido .\nrealizada: con ginko biloba, equinacea, rosa mosqueta, te verde, menta peperina\nFORMAS DE USO:\ncolocar 20 gotas en un 1/4 vaso de agua , se puede tomar hasta 3 veces al dia, no todos los casos son inguales, la dosis puede ser autoevaluativa, algunas personas con 1 ingesta ya no necesitan otras pueden necesitar mas\nva con su prospecto adjunto", "necs": ["defensas"], "pr": {"minorista": 9000}, "st": {"minorista": false}, "ids": {"minorista": 229338116}, "vend": "+20 vendidos", "mangos": {"minorista": "tintura-madre-memoria-x-100cc-habitad-natural-c-ginko-biloba"}},
  {"n": "Tintura Madre Mil Hombres para Articulaciones y Movilidad – 100 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/4678a0e1-438c-4303-98d4-90ce4f387938-33aecfaf38855f39db17703391235038-640-0.webp", "d": "TINTURA MADRE DE MIL HOMBRES", "necs": ["dolor", "defensas"], "pr": {"mayorista": 7400, "minorista": 10000}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 229338047, "minorista": 229338042}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/4678a0e1-438c-4303-98d4-90ce4f387938-33aecfaf38855f39db17703391235038-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-fbab2154073be83b4a17703391399455-480-0.webp"], "vend": "+40 vendidos", "mangos": {"mayorista": "tintura-madre-de-mil-hombres-x-100-cc-habitad-natural-mayotista-solo-si-cubre-monto-mayorista", "minorista": "tintura-madre-de-mil-hombres-x-100-cc-habitad-natural"}},
  {"n": "Tintura Madre Uña de Gato para el Bienestar del Sistema Inmunológico – 100 ml", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/b0539c0d-2f64-4976-92b9-45da32d62680-9551f4306b1e3ed4d817704177092070-640-0.webp", "d": "Tintura Madre Uña de Gato\nLa Tintura Madre de Uña de Gato es un extracto natural reconocido por sus propiedades antiinflamatorias y antioxidantes. Ideal para fortalecer el sistema inmunológico y aliviar molestias articulares. Presentada en frascos de vidrio que garantizan la pureza y conservación de sus principios activos.\npresentacion: envase x 100cc , extracto tintura hidroalcolico,\nmodo de uso: ingesta de 20 gotas en 1/4 vaso con agua hasta dos veces al dia\nProducto natural, apto para quienes buscan bienestar integral.\nConsulta siempre con un profesional antes de su uso.", "necs": ["dolor", "defensas", "femenino"], "pr": {"mayorista": 6500, "minorista": 9000}, "st": {"mayorista": true, "minorista": true}, "ids": {"mayorista": 323688556, "minorista": 323688440}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/b0539c0d-2f64-4976-92b9-45da32d62680-9551f4306b1e3ed4d817704177092070-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-5115e969665b42ebd517704178037373-480-0.webp"], "mangos": {"mayorista": "tintura-madre-una-de-gato-solo-mayorista-8orl2", "minorista": "tintura-madre-una-de-gato-zfnl5"}},
  {"n": "Ungüento Premium de Árnica para Articulaciones – 117 g", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unguento-arnica-dolores-cronicos-artrosis-habitad-natural-69960331b0ca1ff58017778132390795-640-0.webp", "d": "Pomada para patologías crónicas 117grs aprox\nEste ungüento se usa para tratar patologias cronicas, como artrosis artritis, manguito rotador ,ciatico lumbar,espalda,problemas de rodilla, tobillos\nInstrucciones de uso:\nSe debe pasar con la yema del dedo y luego friccionar con la zona externa de la palma teniendo una presión leve pero constante\nGenerando calor. Untar hasta 3 veces si lo desea y combinar con calor 10 minutos\nINGREDIENTES:\nTINTURA MADRE DE FLORES DE ARNICA PURA\nROMERO VEGETAL\nAGUARIBAY TINTURA\nJARILLA VEGETAL\nJENGIBRE\nALCANFOR\nCERA DE ABEJA\nOLIVA PREMIUM\nEste producto tiene su explicacion en el dorso del frasco", "necs": ["dolor"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338137}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/2581ef57-651c-4d1b-b505-fc4c1cad36d4-1dd364fdd23db8f0d717676683176371-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unguento-arnica-dolores-cronicos-artrosis-habitad-natural-69960331b0ca1ff58017778132390795-480-0.webp"], "vend": "+150 vendidos", "mangos": {"minorista": "pomada-para-patologias-cronicas-x-1-habitad-natural"}},
  {"n": "Ungüento Premium de Árnica para Articulaciones – 117 g ( recuperacion muscular)", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unguento-calambres-contracturas-recuperacion-muscular-habitad-natural-2a48b7309e093ec16017778138623379-640-0.webp", "d": "POMADA PARA CALAMBRES Y CONTRACTURAS HABITAD NATURAL\nEsta pomada es un unguento, asi como un traumatologo, kinesiologo o masajistas usan unguentos,aqui tenemos el producto ideal para masajes corporales,\nACCION TERAPUETICA: trabaja por expansion de tejido genera calor y distiende el calambre\nalivia calambres y desataduras de contracturas alIviando dolor y mejorando el movimineto articular nuevamente , apto para calambres y contracturas en piernas y espalda o tension cervicales\nSE DEBE MASAJEAR HASTA 3 VECES EN LA ZONA DE DOLOR O CONTRACTURA\nREALIZADO A CONCIENCIA PENSANDO EN EL CUIDADO DEL CLIENTE\nINGREDIENTES .\nCURCUMA\nCANELA\nJENGIBRE\nALCANFORT\nOLIVA PREMIUM\nCERA DE ABEJA\ncontenido neto: 117grs envase cosmetico\nexplicacion al dorso y fecha de vencimiento\nalivia calambres y desataduras de contracturas aloviando dolor y mejorando el movimineto articular nuevamente , apto para calambres y contracturas en piernas y espalda o tension cervicales", "necs": ["dolor"], "pr": {"minorista": 9000}, "st": {"minorista": true}, "ids": {"minorista": 229338002}, "rat": {"n": 1, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-6df68ca84556dd79ea17721955136116-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unguento-calambres-contracturas-recuperacion-muscular-habitad-natural-2a48b7309e093ec16017778138623379-480-0.webp"], "vend": "+60 vendidos", "mangos": {"minorista": "pomada-para-calambres-y-contracturas-x-117grs-habitad-natural-nhd4i"}},
  {"n": "Ungüento premium para Articulaciones 117gr- con, coca/cannabis/árnica/jengibre/alcanfor", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unguento-articulaciones-cannabis-arnica-dolores-cronicos-habitad-natural-0c37dd1f1536fe9b8517777735319631-640-0.webp", "d": "POMADA PARA DOLORES CRÓNICOS ARTICULARES 100% - COCA + CANNABIS - ÁRNICA - JENGIBRE - ALCANFOR 117GR\nDescubrí el poder de nuestro ungüento premium , formulado con cera de abeja y principios activos puros , utilizados por profesionales para tratar dolores articulares crónicos. Esta pomada genera calor a través de la fricción, expandiendo los tejidos y activando sus ingredientes naturales para aliviar molestias en rodillas, cervicales, lumbares, ciático, hernias, artrosis, artritis y fibromialgia.\nSu fórmula incluye tintura madre de coca, cannabidiol de alto porcentaje, árnica, jengibre orgánico y alcanfor, combinados en un preparado que mejora la circulación y reduce la inflamación.\nModo de uso: aplicar con la yema del dedo, friccionar con presión constante hasta 3 veces y cubrir la zona con un paño para potenciar el calor y acelerar la recuperación.\nIdeal para quienes buscan un tratamiento efectivo y natural para el bienestar articular. ¡Probalo y sentí la diferencia!\nContenido neto: 117 gramos.", "necs": ["dolor"], "pr": {"distribuidor": 9240, "minorista": 13200, "mayorista": 10560}, "st": {"distribuidor": true, "minorista": true, "mayorista": true}, "ids": {"distribuidor": 328236598, "minorista": 229337688, "mayorista": 229337687}, "rat": {"n": 9, "avg": 5.0}, "gal": ["https://acdn-us.mitiendanube.com/stores/004/937/911/products/2581ef57-651c-4d1b-b505-fc4c1cad36d4-a7e1e403424c69845517676677466706-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/diseno-sin-titulo-2026-01-16t200952-509-c096644ef76d94e5dd17687379139902-480-0.webp", "https://acdn-us.mitiendanube.com/stores/004/937/911/products/unguento-articulaciones-cannabis-arnica-dolores-cronicos-habitad-natural-0c37dd1f1536fe9b8517777735319631-480-0.webp"], "vend": "+620 vendidos", "revs": [{"a": "Andrea", "f": "2026-03-15", "r": 5, "t": "Eficacia comprobada", "x": "Mis compras llegaron en el tiempo pactado . Muy conforme con los productos. Eficacia comprobada . Muy recomendable"}], "mangos": {"distribuidor": "pomada-para-dolores-cronicos-articulares-100-coca-cannabis-arnica-jengibre-alcanfort-117grs-negocios-distribiuidor-1knpe", "minorista": "pomada-para-dolores-cronicos-articulares-100-coca-cannabis-arnica-jengibre-alcanfort-117grs-o5mg3", "mayorista": "pomada-para-dolores-cronicos-articulares-100-coca-cannabisarnica-con-jengibre-publicacion-mayorista"}},
  {"n": "Varillas 7 Chakras", "img": "https://acdn-us.mitiendanube.com/stores/004/937/911/products/sagrada-madre-varilla-2e99b1f3a0c1eeb6fa17269293501422-640-0.webp", "d": "Varillas 7 chakras\nmuladhara, el chakra raíz\nsua adhisthana, el chakra sacral\nmanipura, el chakra del plexo solar:\nanahata, el chakra corazón:\nvishuddha, el chakra de la garganta:\ngña-akhia, el chakra del tercer ojo:\nsahasrara, el chakra corona\nAnte cualquier duda pueden conectarse con nosotros por la via e-mail en la sección de contacto o por redes o por wap, la idea siempre es acompañarlos con los brazos abiertos\nFormas de pago- este producto se puede pagar con todas las formas de pago", "necs": ["aromas"], "pr": {"minorista": 2600}, "st": {"minorista": false}, "ids": {"minorista": 229337642}, "mangos": {"minorista": "varillas-7-chakras"}},
];

/* 13 · PACKS con lo que incluyen, explícito */
// Los packs ya no son una lista aparte: son la necesidad 'packs'.

/* ══════════ SANEO DE LOS TEXTOS DEL CATALOGO ══════════
   Los nombres y las descripciones llegan de la tienda tal cual y traen de
   todo: mayusculas sostenidas, restos de codigo ("X 30 Mlm", "x 1"), guiones
   sueltos al final y -- lo serio -- promesas de resultado y nombres de
   enfermedad, que ANMAT no permite en un cosmetico ni en un suplemento.

   Se limpia ACA, al cargar, y no en el archivo del catalogo, porque ese
   catalogo se regenera desde la tienda cada pocas horas: cualquier arreglo
   escrito a mano se perderia en la proxima sincronizacion. Esto es la red.
   Lo definitivo es corregir las fichas en la tienda; el informe que sale de
   tools/auditar_catalogo.py dice cuales y por que.

   Lo que NO hace: renombrar. "Crema para Psoriasis con Aloe Vera" sin la
   palabra psoriasis no quiere decir nada, y elegir como se llama un producto
   es una decision comercial. Esos nombres van listados en el informe para
   que los cambie una persona. */

/* La lista, en un solo lugar. tools/auditar_catalogo.py la LEE de aca, asi
   que no hay dos copias que se puedan desincronizar.

   YA NO SE USA PARA BORRAR TEXTO. La landing muestra la descripcion de la
   tienda tal cual; esta lista queda solo para el informe, que dice que fichas
   hay que corregir en Tiendanube y por que. Se busca sin acentos y
   en minuscula, con limites de palabra donde hace falta: sin ellos "curcuma"
   contaba como "cura" y las "gotas" del gotero como la enfermedad. */
const PROHIBIDO_LISTA = [
  /* Promesas de resultado y de accion farmacologica */
  'viagra natural', 'afrodisiac', 'cur[ao]\\b', 'curar\\b', 'curativ',
  'elimina', 'combate', 'trata\\b', 'tratamiento', 'previene', 'controla el',
  'desinflama', 'antiinflamator', 'antibiotic', 'antibacterian', 'antivira',
  'antimicotic', 'antifungic', 'antiseptic', 'analgesic', 'sedante',
  'diuretic', 'expectorante', 'laxante', 'cicatriza', 'regenera el',
  'restaurar tejido', 'efectividad', 'garantiza', 'resultados', 'adelgaza',
  'quema grasa', 'milagro', 'terapeutic', 'medicinal', 'remedio',
  'alivia', 'alivio', 'disminuye', 'reduce el', 'reduce la',
  'beneficios para la salud', 'propiedades medicinales', 'uso medicinal',
  /* Patologias */
  '\\bgota\\b', 'artritis', 'artrosis', 'p?soriasis', 'ecc?zema', 'eccema',
  'bronquitis', 'arterioesclerosis', 'arteriosclerosis', 'aterosclerosis',
  'cistitis', 'diabetes', 'hipertension', '\\bcancer\\b', '\\btumor',
  '\\basma\\b', 'colitis', 'gastritis', '\\bulcera', 'hemorroide', 'varices',
  'acido urico', 'colesterol', 'menopausia', 'prostat', 'candidiasis',
  'reuma', 'lumbago', 'ciatica', 'migraña', 'insomnio', 'depresion',
  'patologias cronicas', 'dolores cronicos', 'celulitis', '\\bacne\\b',
  'parasito'
];
const PROHIBIDO = new RegExp(PROHIBIDO_LISTA.join('|'), 'i');

const CIERRE_LEGAL = 'Información orientativa. Este producto no reemplaza ' +
  'tratamientos ni indicaciones profesionales. Ante cualquier duda, consulte ' +
  'con un profesional de la salud.';

const plano = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Palabras que se quedan como estan al deshacer las mayusculas sostenidas:
   unidades, siglas y numeros romanos que en minuscula perderian sentido. */
const INTOCABLES = new Set(['ml','cc','gr','g','kg','cm','mm','led','cbd','thc',
  'x','xl','uv','pH','ok','tv','usb','2','3','4','5','7','12','24','30','x2','x3']);

function tituloLimpio(n){
  let t = (n || '').replace(/\s+/g, ' ').trim();
  t = t.replace(/\bMlm\b/gi, 'ml');            // "X 30 Mlm" -> "x 30 ml"
  t = t.replace(/\bHabitrad\b/gi, 'Hábitad');
  t = t.replace(/\bCRIÓGENICO\b/gi, 'Criogénico');
  t = t.replace(/\s*[-–—/+·,;]+\s*$/, '');      // guion o barra sueltos al final
  t = t.replace(/\s+x\s*1$/i, '');             // "x 1" no dice nada
  // Parentesis abierto y nunca cerrado: se cierra al final.
  const abre = (t.match(/\(/g) || []).length, cierra = (t.match(/\)/g) || []).length;
  if (abre > cierra) t = t + ')'.repeat(abre - cierra);

  // Mayusculas sostenidas: se pasan a capital por palabra.
  const letras = t.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, '');
  const gritadas = letras.length > 6 &&
    letras === letras.toUpperCase();
  if (gritadas){
    t = t.split(' ').map(w => {
      if (INTOCABLES.has(plano(w))) return plano(w);
      if (!/[A-Za-zÁÉÍÓÚÑÜ]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
  }
  return t.replace(/\s+/g, ' ').trim();
}

/* La descripcion es la de la tienda, TAL CUAL. Antes de esto se tiraba la
   oracion entera que tuviera una promesa de resultado o el nombre de una
   patologia, y el resultado era otro texto: con razon el cliente dijo que
   esas no eran las descripciones de sus productos.

   La correccion de ANMAT va donde corresponde, que es la ficha en Tiendanube.
   tools/auditar_catalogo.py lista cuales y por que, y el sincronizador trae
   la version corregida en cuanto se guarda alla.

   Aca solo se normalizan los espacios -- vienen con saltos y tabulaciones del
   editor -- y se agrega al final la leyenda que pidio el cliente, que suma
   sin tocar nada de lo que el texto dice. */
function descripcionLimpia(d){
  const t = (d || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ')
                     .replace(/\n{2,}/g, '\n').trim();
  if (!t) return CIERRE_LEGAL;
  return t + (/[.!?]$/.test(t) ? '' : '.') + ' ' + CIERRE_LEGAL;
}

/* Se aplica una sola vez, antes de que nada dibuje: asi el nombre limpio es
   el que ven las tarjetas, la ficha, el buscador, el carrito y los eventos,
   sin tener que acordarse de limpiarlo en cada lugar. */
PRODUCTOS.forEach(p => {
  p.n = tituloLimpio(p.n);
  p.d = descripcionLimpia(p.d);
});

const ars = n => '$' + Math.round(n).toLocaleString('es-AR');
const $ = s => document.querySelector(s);

/* `a ?? b` escrito a mano. NO es `a || b`: eso tambien se caeria a b con 0 o
   con '', y aca hay precios e indices de variante donde 0 es un valor bueno.

   Se escribe asi porque `??` y `?.` son de ES2020 (marzo de 2020) y en un
   telefono anterior son un ERROR DE SINTAXIS, que se detecta al parsear y tira
   abajo el archivo entero -- guardia de ruta incluido. Como /catalogos no
   tiene contenido propio en el admin, eso deja la pagina en blanco. */
const siNula = (a, b) => (a === null || a === undefined) ? b : a;
const limpio = n => n.split(/\/\//)[0].trim();
// El precio es el REAL de la publicacion de ese segmento. Antes se simulaba
// con un multiplicador; ahora los tres salen de la tienda y son verificables.
const varElegida = new Map();
const precioDe = p => {
  if (p.vars){ const v = p.vars[siNula(varElegida.get(p.n), 0)]; if (v && v.p) return v.p; }
  /* Si la tienda no publica el producto en este segmento se cae al precio de
     lista. Sin esto devolvia undefined, el subtotal quedaba en NaN y la barra
     desaparecia para siempre: era el motivo de que al pasar a mayorista no se
     viera nada aunque siguieras agregando. */
  return siNula(siNula(p.pr[segmento], p.pr.minorista), 0);
};
// Un producto existe en un segmento solo si la tienda lo publica para ese
// segmento. Eso es lo que hace que la grilla cambie de verdad al elegir.
const hayEn = (p, seg) => p.pr[seg] != null;

/* Monto minimo de compra de cada segmento. Los dos primeros los confirma el
   propio banner de la tienda ("MONTO MÍNIMO DE COMPRA $100.000") y su menu;
   el de distribuidor lo definio el cliente. */
const MINIMOS = {minorista: 0, mayorista: 100000, distribuidor: 250000};
/* Ordenados por minimo creciente: sirve para saber si un cambio de segmento
   sube o baja. */
const ESCALA = ['minorista', 'mayorista', 'distribuidor'];

/* El precio de una LINEA DEL CARRITO sale del segmento con el que entro, no
   del que se esta mirando. Un mayorista puede tener cargado un producto que
   la lista mayorista no publica y que entro a precio de lista: ese sigue
   valiendo lo de lista aunque el resto del carrito sea mayorista.

   La variante tambien queda fijada al agregar. Antes el precio de una linea
   ya cargada cambiaba si despues se tocaba el desplegable de la tarjeta. */
function precioEn(i, seg){
  const p = i.prod;
  if (p.vars){
    const v = p.vars[siNula(siNula(i.vi, varElegida.get(p.n)), 0)];
    if (v && v.p) return v.p;
  }
  return siNula(siNula(p.pr[seg], p.pr.minorista), 0);
}
const precioItem = i => precioEn(i, i.seg || segmento);
const totalCarrito = () => Object.values(carrito)
  .reduce((a, i) => a + precioItem(i) * i.cant, 0);
const conStock = p => p.st[segmento] !== false;
// Estrellas a partir de la calificacion REAL. Un producto sin resenas no
// muestra una nota inventada: muestra una invitacion. Poner 4 estrellas por
// defecto seria mostrar una nota que nadie dio.
function estrellasDe(p){
  if (!p.rat) return '<div class="estrellas sin-resenas" data-estrellas>Sé el primero en opinar</div>';
  const llenas = Math.round(p.rat.avg);
  let html = '<div class="estrellas" data-estrellas title="' + p.rat.avg +
             ' de 5 sobre ' + p.rat.n + ' reseña' + (p.rat.n > 1 ? 's' : '') +
             '"><span class="astros">';
  for (let i = 1; i <= 5; i++) html += (i <= llenas ? '\u2605' : '\u2606');
  return html + '</span><b>' + p.rat.avg.toFixed(1) + '</b>' +
         '<span class="cuenta">(' + p.rat.n + ')</span></div>';
}


/* ══════════ MEDICION ══════════
   Un solo lugar por donde pasan todos los eventos de la landing, y de ahi
   salen a tres destinos: el dataLayer (para Tag Manager), GA4 y el pixel de
   Meta. Los sitios que llaman a track() no saben nada de esto y no tienen que
   saberlo.

   LA COMPRA NO SE MIDE ACA. La landing termina en /comprar/ y de ahi en
   adelante manda Tiendanube, que ya dispara su propio `purchase` en la pagina
   de gracias con el numero de orden y el total real. Si esta landing tambien
   lo disparara, cada venta contaria dos veces y el embudo entero quedaria
   inservible. Por eso hay un freno explicito mas abajo.

   DENTRO DE LA TIENDA NO SE CARGA NADA. Si la landing corre en el theme,
   Tiendanube ya tiene puestos gtag y fbq con sus ids; ahi solo se usan los
   que ya estan. Los ids de abajo son para cuando la landing corre suelta
   (por ejemplo el preview publico). Vacios, no se carga ninguna etiqueta. */
const MEDICION = {
  ga4:   '',      // 'G-XXXXXXXXXX'  · dejar vacio si la tienda ya lo carga
  meta:  '',      // '1234567890'    · idem
  moneda: 'ARS',
  /* Poner en true para ver cada evento en la consola con lo que se manda.
     Sirve para revisar contra el DebugView de GA4 y el Events Manager. */
  debug: false
};

/* Que es cada evento nuestro en GA4 y en Meta. Los que no tienen equivalente
   estandar van como evento propio con su mismo nombre, que es lo que hay que
   hacer: inventarle un nombre estandar a algo que no lo es ensucia los
   informes que ya vienen armados. */
const EVENTOS = {
  select_customer_type: {ga4: 'select_customer_type'},
  search:               {ga4: 'search',           meta: 'Search'},
  view_item:            {ga4: 'view_item',        meta: 'ViewContent'},
  add_to_cart:          {ga4: 'add_to_cart',      meta: 'AddToCart'},
  cross_sell_add:       {ga4: 'add_to_cart',      meta: 'AddToCart'},
  remove_from_cart:     {ga4: 'remove_from_cart'},
  view_cart:            {ga4: 'view_cart'},
  begin_checkout:       {ga4: 'begin_checkout',   meta: 'InitiateCheckout'},
  quick_buy:            {ga4: 'begin_checkout',   meta: 'InitiateCheckout'},
  add_to_cart_error:    {ga4: 'add_to_cart_error'},
  hero_cta:             {ga4: 'select_promotion'},
  select_category:      {ga4: 'select_content'},
  // Carrusel de combos: guardar en favoritos y compartir.
  add_to_wishlist:      {ga4: 'add_to_wishlist',  meta: 'AddToWishlist'},
  share:                {ga4: 'share'}
};

/* El identificador que espera el catalogo de Meta en content_ids es el de la
   VARIANTE, no el de la publicacion: el theme arma variantMetaContentIds con
   el de variante, y son distintos aun con una sola variante. Lo trae el
   catalogo vivo en p.vids.

   Si no lo sabemos -- catalogo todavia sin leer, o una publicacion sin
   variantes conocidas -- se devuelve null y el evento sale sin content_ids,
   como salia antes: un id inventado seria peor, porque Meta lo cuenta y no lo
   puede atribuir a nada. */
function idParaMeta(p, seg, vi){
  const donde = seg || segmento;
  if (p.vars){
    const v = p.vars[siNula(siNula(vi, varElegida.get(p.n)), 0)];
    if (v && v.id) return String(v.id);
  }
  const vid = p.vids && siNula(p.vids[donde], p.vids.minorista);
  return vid ? String(vid) : null;
}

/* Arma el items[] que espera GA4 a partir de una lista de {prod, cant}.
   meta_id viaja de prestado para que track() arme content_ids; se lo saca
   antes de mandarlo a GA4. */
const itemsGA = lista => (lista || []).map(i => {
  const seg = i.seg || segmento;
  return {
    item_name: i.prod.n,
    item_id: String((i.prod.ids || {})[seg] || (i.prod.ids || {}).minorista || ''),
    meta_id: idParaMeta(i.prod, seg, i.vi),
    item_category: (NECESIDADES.find(n => i.prod.necs.includes(n.id)) || {}).label || '',
    item_variant: SEGMENTOS[seg].label,
    price: precioEn(i, seg),
    quantity: i.cant
  };
});

const track = (event, data) => {
  const d = Object.assign({}, data || {});

  /* El freno. Si algun dia alguien agrega un purchase aca, que se entere. */
  if (event === 'purchase' || event === 'Purchase'){
    console.warn('La compra la mide Tiendanube en la pagina de gracias. ' +
                 'Medirla tambien aca la contaria dos veces.');
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({event}, d));

  const mapa = EVENTOS[event] || {ga4: event};
  const conPlata = d.value != null
    ? Object.assign({currency: MEDICION.moneda}, d) : d;

  if (typeof gtag === 'function' && mapa.ga4){
    // meta_id y sinMeta son de la casa: GA4 no los espera.
    const paraGA4 = Object.assign({evento_landing: event}, conPlata);
    delete paraGA4.sinMeta;
    if (paraGA4.items){
      paraGA4.items = paraGA4.items.map(i => {
        const limpio = Object.assign({}, i); delete limpio.meta_id; return limpio;
      });
    }
    gtag('event', mapa.ga4, paraGA4);
  }
  if (typeof fbq === 'function' && mapa.meta && !d.sinMeta){
    const paraMeta = {
      content_name: d.item_name || d.need_name || d.query || event,
      content_type: 'product',
      value: d.value || 0,
      currency: MEDICION.moneda
    };
    /* Sin content_ids, Meta recibe el evento y no lo puede atribuir a ninguna
       publicacion del catalogo: no sirve para los anuncios de catalogo ni para
       armar publicos. Con ellos, cada ViewContent y cada AddToCart quedan
       pegados al producto que el cliente miro. */
    const conId = (d.items || []).filter(i => i.meta_id);
    if (conId.length){
      paraMeta.content_ids = conId.map(i => i.meta_id);
      paraMeta.contents = conId.map(i => ({id: i.meta_id, quantity: i.quantity,
                                           item_price: i.price}));
    }
    fbq('track', mapa.meta, paraMeta);
  }
  if (MEDICION.debug){
    console.log('[medicion]', event, '->',
                'GA4:' + (mapa.ga4 || '-'), 'Meta:' + (mapa.meta || '-'), conPlata);
  }
};

/* Las etiquetas, SOLO si la landing corre suelta y hay id configurado. */
(function cargarEtiquetas(){
  if (MEDICION.ga4 && typeof gtag !== 'function'){
    const g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEDICION.ga4;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', MEDICION.ga4);
  }
  if (MEDICION.meta && typeof fbq !== 'function'){
    /* Cargador oficial del pixel, reducido a lo que hace falta. */
    const n = window.fbq = function(){
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const t = document.createElement('script');
    t.async = true; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(t);
    fbq('init', MEDICION.meta);
    fbq('track', 'PageView');
  }
})();


/* ---- Carrusel de fondo del hero ----
   Esta lista es la BASE: las piezas que viven en prototipo/img/. Dentro de la
   tienda, bannersVivos (mas abajo) la reemplaza por los banners que el
   administrador tenga puestos en el panel, asi que agregar uno en Tiendanube
   alcanza para que aparezca aca. Esto queda como respaldo para la vista previa
   y para cuando la tienda no conteste. */
/* `cta` es la llamada de cada pieza. `ir` es una accion de esta pagina;
   `href` es una direccion de la tienda. Una pieza sin `cta` no muestra boton. */
const FONDOS = [
  {escritorio:'https://mind-trade-profit.github.io/Habitad_landing/img/slide1.webp', celular:'https://mind-trade-profit.github.io/Habitad_landing/img/slide5.webp',
   cta:{txt:'Ver el catálogo', ir:'catalogo'}},
  {escritorio:'https://mind-trade-profit.github.io/Habitad_landing/img/slide2.webp', celular:'https://mind-trade-profit.github.io/Habitad_landing/img/slide6.webp',
   cta:{txt:'Conocé Club Habitad+', href:'https://habitadnatural.com/club-habitad/'}},
  {escritorio:'https://mind-trade-profit.github.io/Habitad_landing/img/slide3.webp', celular:'https://mind-trade-profit.github.io/Habitad_landing/img/slide7.webp',
   cta:{txt:'Ver las reseñas', ir:'resenas'}},
  {escritorio:'https://mind-trade-profit.github.io/Habitad_landing/img/slide4.webp', celular:'https://mind-trade-profit.github.io/Habitad_landing/img/slide8.webp',
   cta:{txt:'Ver precios mayoristas', ir:'mayorista'}}
];

/* Se arma con una lista de piezas y se puede volver a armar con otra: es lo
   que usa bannersVivos cuando la tienda contesta con banners distintos. */
var heroCarrusel = (function (){
  const caja = $('#heroFondos'), hero = $('.hero');
  const boton = $('#heroCta'), enlace = $('#heroEnlace');
  let piezas = [], slides = [], puntos = null, flechas = [];
  let actual = 0, reloj = null;

  /* El boton acompaña al banner que se esta viendo. Es uno solo y cambia,
     en vez de uno por pieza: asi no hay cuatro botones apilados esperando. */
  function ponerCta(i){
    const c = piezas[i] && piezas[i].cta;
    [boton, enlace].forEach(el => {
      if (!el) return;
      el.hidden = !c;
      if (!c) return;
      el.href = c.href || '#necesidades';
      el.target = c.href ? '_blank' : '';
      el.rel = c.href ? 'noopener' : '';
      el.dataset.ir = c.ir || '';
    });
    if (!c) return;
    boton.textContent = c.txt;
    // El enlace que cubre la pieza no muestra texto, pero tiene que decir a
    // donde va: es lo unico que un lector de pantalla puede anunciar.
    enlace.querySelector('span').textContent = c.txt;
  }

  const seguirCta = el => e => {
    const ir = el.dataset.ir;
    if (!ir) return;                     // direccion de la tienda: se sigue
    e.preventDefault();
    track('hero_cta', {slide: actual, action: ir, desde: el.id});
    if (ir === 'catalogo') return irAlCatalogo();
    if (ir === 'mayorista') return pedirSegmento('mayorista');
    const destino = document.getElementById(ir);
    if (destino) destino.scrollIntoView({behavior: 'smooth', block: 'start'});
  };
  if (boton) boton.onclick = seguirCta(boton);
  if (enlace) enlace.onclick = seguirCta(enlace);

  function mostrar(i, manual){
    if (!slides.length) return;
    slides[actual].classList.remove('activa');
    if (puntos) puntos.children[actual].setAttribute('aria-current', 'false');
    actual = (i + slides.length) % slides.length;
    slides[actual].classList.add('activa');
    if (puntos) puntos.children[actual].setAttribute('aria-current', 'true');
    ponerCta(actual);
    if (manual) arrancar();
  }

  function arrancar(){
    clearInterval(reloj);
    if (slides.length < 2) return;
    // Quien pidió menos movimiento ve solo la primera imagen, quieta.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    reloj = setInterval(() => mostrar(actual + 1), 5500);
  }

  /* Flechas, igual que en el catalogo: sin ellas, el banner que ya paso no se
     puede recuperar salvo esperando toda la vuelta. */
  const FLECHAS = [
    ['-1', 'M15 5l-7 7 7 7', 'Ver el banner anterior', 'izq'],
    ['1',  'M9 5l7 7-7 7',   'Ver el banner siguiente', 'der']
  ];

  function armar(fondos){
    if (!caja || !hero || !fondos || !fondos.length) return false;
    clearInterval(reloj);
    piezas = fondos;
    actual = 0;

    caja.innerHTML = '';
    if (puntos){ puntos.remove(); puntos = null; }
    flechas.forEach(f => f.remove());
    flechas = [];

    piezas.forEach((f, i) => {
      const pic = document.createElement('picture');
      pic.className = 'hero__slide' + (i === 0 ? ' activa' : '');
      const fuente = document.createElement('source');
      fuente.media = '(max-width: 700px)';
      fuente.srcset = f.celular || f.escritorio;
      const img = document.createElement('img');
      img.src = f.escritorio;
      img.alt = '';
      if (i === 0) img.setAttribute('fetchpriority', 'high');
      else img.loading = 'lazy';
      pic.appendChild(fuente); pic.appendChild(img);
      caja.appendChild(pic);
    });
    slides = [...caja.children];

    /* Con una sola pieza no hay a donde ir: ni puntos ni flechas. */
    if (piezas.length > 1){
      puntos = document.createElement('div');
      puntos.className = 'hero__puntos';
      piezas.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'hero__punto';
        b.setAttribute('aria-label', 'Ver imagen ' + (i + 1));
        b.setAttribute('aria-current', i === 0);
        b.onclick = () => mostrar(i, true);
        puntos.appendChild(b);
      });
      hero.appendChild(puntos);

      FLECHAS.forEach(([dir, d, etiqueta, lado]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hero__flecha hero__flecha--' + lado;
        b.setAttribute('aria-label', etiqueta);
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '" fill="none" ' +
          'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        b.onclick = () => mostrar(actual + Number(dir), true);
        hero.appendChild(b);
        flechas.push(b);
      });
    }

    ponerCta(0);
    arrancar();
    return true;
  }

  // No rotar mientras la pestaña está en segundo plano.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(reloj); else arrancar();
  });

  armar(FONDOS);
  return {armar, cuantas: () => piezas.length};
})();


/* ══════════ LOS BANNERS SALEN DEL PANEL ══════════
   El administrador agrega, saca o reordena banners en el inicio de la tienda y
   el hero de la landing los toma solo. Antes eran cuatro archivos fijos que
   habia que bajar del CDN, renombrar y volver a publicar a mano.

   De donde salen. La landing se planta en /catalogos, no en el inicio, asi que
   el carrusel del theme no esta en esta pagina: hay que ir a buscarlo. Se lee
   el inicio entero y se saca `section[data-store="home-slider"]`, que trae dos
   listas -- una de escritorio y una de celular -- emparejadas por posicion.

   La llamada de cada banner. El theme deja poner un enlace por banner desde el
   panel; si esta, se usa. Si no, la llamada es "Ver el catalogo", que es a
   donde queremos llevar a todo el mundo. **Para que un banner lleve a otro
   lado, se le pone el enlace en el panel de Tiendanube y listo.**

   Fuera de la tienda no corre: en la vista previa quedan las piezas de
   FONDOS. */
var bannersVivos = (function (){
  const EN_TIENDA = /(^|\.)habitadnatural\.com$/i.test(location.hostname);
  const GUARDADO = 'habitad:banners:v1';
  /* Leer el inicio cuesta medio mega: es la pagina mas pesada de la tienda.
     Los banners cambian cada varias semanas, asi que no hace falta pedirlo en
     cada visita. Un visitante nuevo lo ve al dia igual; uno que vuelve, a las
     seis horas. Para verlo ya: __banners.refrescar(true) en la consola. */
  const FRESCO = 6 * 60 * 60 * 1000;
  // Ancho que se le pide a cada version. Pedir el 1920 en celular es tirar
  // megas a la basura; pedir el 640 en escritorio se ve mal.
  const ANCHO = {escritorio: 1920, celular: 1024};

  let ultimo = 0, enCurso = null;
  const api = {enTienda: EN_TIENDA, informe: null, aplicarGuardado, refrescar};

  function absoluta(u){
    u = String(u || '');
    if (!u) return '';
    if (u.indexOf('//') === 0) return 'https:' + u;
    return u;
  }

  /* De un srcset, la version mas chica que llegue al ancho pedido; si ninguna
     llega, la mas grande que haya. */
  function mejorImagen(img, tope){
    const set = img.getAttribute('data-srcset') || img.getAttribute('srcset') || '';
    const cands = [];
    set.split(',').forEach(x => {
      const m = /(\S+)\s+(\d+)w/.exec(x.trim());
      if (m) cands.push({u: m[1], w: +m[2]});
    });
    if (cands.length){
      cands.sort((a, b) => a.w - b.w);
      const justa = cands.find(c => c.w >= tope) || cands[cands.length - 1];
      return absoluta(justa.u);
    }
    const suelta = img.getAttribute('data-src') || img.getAttribute('src') || '';
    return suelta.indexOf('data:') === 0 ? '' : absoluta(suelta);
  }

  function enlaceDe(slide){
    if (!slide) return '';
    const a = slide.querySelector('a[href]');
    if (!a) return '';
    const h = a.getAttribute('href') || '';
    // Los <use href="#arrow-long"> de los iconos no son enlaces.
    return h && h.charAt(0) !== '#' ? h : '';
  }

  function leerInicio(html){
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sec = doc.querySelector('section[data-store="home-slider"]');
    if (!sec) return [];
    const cajas = [...sec.querySelectorAll('.js-home-slider-container')];
    let escritorio = [], celular = [];
    cajas.forEach(c => {
      const slides = [...c.querySelectorAll('.swiper-slide')];
      if (c.classList.contains('d-md-none')) celular = slides;
      else escritorio = slides;
    });
    const cuantos = Math.max(escritorio.length, celular.length);
    const piezas = [];
    for (let i = 0; i < cuantos; i++){
      const se = escritorio[i], sc = celular[i];
      const ie = se && se.querySelector('img');
      const ic = sc && sc.querySelector('img');
      const de = ie ? mejorImagen(ie, ANCHO.escritorio) : '';
      const dc = ic ? mejorImagen(ic, ANCHO.celular) : '';
      // Sin ninguna de las dos no hay pieza. Con una sola, esa va a los dos.
      if (!de && !dc) continue;
      const href = enlaceDe(se) || enlaceDe(sc);
      piezas.push({
        escritorio: de || dc,
        celular: dc || de,
        cta: href ? {txt: 'Ver más', href: absoluta(href)}
                  : {txt: 'Ver el catálogo', ir: 'catalogo'}
      });
    }
    return piezas;
  }

  function guardar(piezas){
    try { localStorage.setItem(GUARDADO, JSON.stringify({t: Date.now(), piezas})); }
    catch (e) { /* sin lugar o bloqueado: la proxima vez se lee de nuevo */ }
  }

  /* Lo de la visita anterior, antes de pedir nada: el banner sale al dia desde
     el primer pintado en vez de cambiar a los dos segundos. */
  function aplicarGuardado(){
    if (!EN_TIENDA) return false;
    let g = null;
    try { g = JSON.parse(localStorage.getItem(GUARDADO) || 'null'); } catch (e) { return false; }
    if (!g || !Array.isArray(g.piezas) || !g.piezas.length) return false;
    ultimo = g.t || 0;
    const puesto = heroCarrusel.armar(g.piezas);
    api.informe = {origen: 'guardado', t: ultimo, banners: g.piezas.length};
    return puesto;
  }

  function refrescar(forzar){
    if (!EN_TIENDA) return Promise.resolve(null);
    if (enCurso) return enCurso;
    if (!forzar && Date.now() - ultimo < FRESCO) return Promise.resolve(null);
    const t0 = Date.now();
    enCurso = fetch('/', {credentials: 'same-origin'})
      .then(r => { if (!r.ok) throw new Error('el inicio respondio ' + r.status); return r.text(); })
      .then(html => {
        const piezas = leerInicio(html);
        /* Cero banners es un error de lectura -- el theme cambio, la pagina
           vino a medias --, no una tienda sin banners. Se deja lo que hay. */
        if (!piezas.length) throw new Error('no se encontro ningun banner en el inicio');
        ultimo = Date.now();
        guardar(piezas);
        heroCarrusel.armar(piezas);
        api.informe = {origen: 'tienda', t: ultimo, ms: ultimo - t0, banners: piezas.length};
        return piezas;
      })
      .catch(err => {
        if (window.console) console.warn('[banners] no se pudo leer el inicio:', err);
        return null;
      })
      .then(r => { enCurso = null; return r; });
    return enCurso;
  }

  // Para mirar desde la consola: __banners.informe
  window.__banners = api;
  return api;
})();

/* Preguntas frecuentes. Las respuestas salen de las páginas reales de la
   tienda: envíos y pagos, política de devolución y cómo comprar. */
const PREGUNTAS = [
 ['¿Cuánto tarda el envío?',
  'El plazo se cuenta desde que el paquete está en viaje y no incluye el armado del ' +
  'pedido ni feriados, sábados o domingos. Al elegir el medio de envío vas a ver el ' +
  'plazo estimado para tu dirección.'],
 ['¿Cuánto cuesta el envío?',
  'Depende del medio que elijas y de tu código postal: el costo exacto aparece antes ' +
  'de pagar. En compras minoristas, superando los $60.000 el envío es gratis; ' +
  'las compras mayoristas y de distribuidor no incluyen envío bonificado.'],
 ['¿Puedo rastrear mi pedido?',
  'Sí. Una vez despachado te enviamos por mail el comprobante y el seguimiento.'],
 ['¿Hacen envíos al interior?', 'Sí, a todo el país.'],
 ['¿Tienen precio mayorista?',
  'Sí. Hay lista mayorista con 20% de descuento y mínimo de $100.000, y lista ' +
  'distribuidor con 30% y mínimo de $250.000. Se activan al vincular tu cuenta.'],
 ['¿Puedo devolver un producto?',
  'Los productos son orgánicos y esterilizados, así que no se aceptan cambios ni ' +
  'devoluciones de productos abiertos. Si llega dañado, roto o incorrecto lo ' +
  'resolvemos dentro de las 48 horas de recibido.'],
 ['¿Qué medios de pago aceptan?',
  'Tarjetas de crédito y débito de cualquier banco, transferencia bancaria, efectivo ' +
  'en puntos de pago y Mercado Pago. Pagando por transferencia hay un ' + TRANSFERENCIA + '% adicional ' +
  'de descuento.']
];

const cajaFaq = $('#faq');
if (cajaFaq) cajaFaq.innerHTML = PREGUNTAS.map(([q, a]) =>
  '<details><summary>' + q + '</summary><p>' + a + '</p></details>').join('');

/* Muro de reseñas. Los datos son reales, de Trusty: 90 reseñas aprobadas de
   la tienda. Se muestran de a 9 y el boton revela el resto. */
const TIENDA_ID = 4937911;
const RESENAS_TOTAL = 90;   // aprobadas que devuelve Trusty
/* Copia local de las reseñas: es lo que se ve si el pedido en vivo falla. */
let RESENAS = [{"a": "Sandra", "f": "2026-08-27", "r": 5, "t": "Increíble!", "x": "El producto es espectacular, lo uso diariamente para mis masajes faciales, aroma exquisito y no deja piel oleosa. Estoy muy conforme. Recomendó 100%. Lo único que demoro 8 días en llegarme, Habitad es de Merlo, San Luis y yo de San Luis Capital. No se porque todo tiene que pasar por Buenos Aires, pero bueno, eso no es problema d", "p": "Aceite de Jojoba para Piel y Cabello – 30 ml", "img": "https://images-tiendanube.s3.amazonaws.com/reviews/4937911/1787845997845.jpg"}, {"a": "JORGE AGUSTÍN PÉREZ", "f": "2026-03-11", "r": 5, "t": "EXCELENTE", "x": "Realmente MUY BUENOS PRODUCTOS Y MUY EFECTIVOS...Ya realice varias compras porque eliminan rápidamente nuestros dolores: manguito rotador, rodillas, cintura, cuello, etc...", "p": "COMBO UNGUENTOS COMPLETO! x 100grs c/u", "img": "https://images-tiendanube.s3.amazonaws.com/reviews/4937911/1773261683263.jpg"}, {"a": "Juan Antonio ALBERTO", "f": "2026-03-03", "r": 5, "t": "Muy buen producto", "x": "Muy bueno. Hace rato buscaba algo natural a base de calendula. Me lo aplique sobre unas erupciones alérgicas y me ha dado buen resultado.", "p": "Crema De Calendula Con Manzanilla Y Te-tre 100 Cc /habitad", "img": "https://images-tiendanube.s3.amazonaws.com/reviews/4937911/1772549723115.jpg"}, {"a": "Rosa", "f": "2026-07-22", "r": 5, "t": "Productos para la piel", "x": "Muy buenos. Los retiré hoy.", "p": "Gel De Aloe Vera Con Vitamina E Para Todo Tipo De Pieles", "img": "https://images-tiendanube.s3.amazonaws.com/reviews/4937911/1784692955915.jpg"}, {"a": "Laura", "f": "2026-03-26", "r": 5, "t": "Pedido recibido excelente.", "x": "Recibí el pedido hace unos días y quise esperar a calificar una vez consuma las tinturas. Debo decir que son de muy buena calidad. Todo viene con un prospecto adjunto, lo que me parece genial. El pedido llegó bien empaquetado y sin problemas. Gracias continuaré pidiendo.", "p": "Aceite de cultivo orgánico 30 ml. Oregano", "img": null}, {"a": "Daniel", "f": "2026-04-14", "r": 5, "t": "Una buena opción !!!", "x": "En principio creo que los productos son buenos, y a un precio razonable. El envío estuvo muy bien, en tiempo y forma. Lo recomiendo y volveré a comprar. Gracias.", "p": "BLENDS DE TES ORGANICOS PARA TRATAMIENTOS POR FITOTERAPIA", "img": null}, {"a": "Andrea", "f": "2026-03-15", "r": 5, "t": "Eficacia comprobada", "x": "Mis compras llegaron en el tiempo pactado . Muy conforme con los productos. Eficacia comprobada . Muy recomendable", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Karina Lourdes Spinoso", "f": "2026-08-04", "r": 5, "t": "Excelente", "x": "Desde la atención al cliente por mail o WhatsApp, pasando por los productos geniales que venden y el pedido llega en tiempo y forma, es para recomendar y seguir comprando. En mi caso lo hago para mi mamá que tiene artrosis crónica y el combo dolores crónicos la alivia un montón, hasta la próxima, saludos", "p": "Combo Dolores ( Ideal Masajistas-traumatologos) Coca+canna", "img": null}, {"a": "Ricardo", "f": "2026-05-07", "r": 4, "t": "Recuperación real y comprobada", "x": "Desde que descubrí esta pomada no dejo de recomendarla a mis familiares con problemas articulares. Mi papá sufre de ciática crónica y, tras dos semanas aplicándola cada noche, su movilidad mejoró notablemente. Además, el aroma suave no resulta invasivo y el envase protegido mantiene la frescura. La compra mayorista resultó práct", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "SUSANA CORREA", "f": "2026-08-12", "r": 5, "t": "DOLORES", "x": "Siempre compro los unguento para dolores crónicos, ya hace varios años, me son muy efectivo para mis dolores de artritis rematoidea, y ahora voy a probar unas gotitas para micosis. Yyyyy el pedido siempre me llega bien y a tiempo, muchas gracias HABITAD NATURAL", "p": "Ungüento premium para Articulaciones 117gr- con, coca/cann", "img": null}, {"a": "Rita Irene", "f": "2026-08-14", "r": 5, "t": "No recibí el ungüento para calambres recibí el de articulaciones", "x": "No recibí el ungüento para calambres recibí el de las articulaciones igual lo empecé a usar porque tenía mucho dolor de rodilla y es excelente hace tres días que lo uso y me calmo el dolor y los otros productos excelente también ya los empecé a usar gracias", "p": "Ungüento Premium de Árnica para Articulaciones – 117 g ( r", "img": null}, {"a": "Mariela", "f": "2026-07-13", "r": 5, "t": "Combo para ojos", "x": "Compré hace unos días el combo , el pedido llegó rápido y el empaquetado excelente ,muy importante al momento de recibir los productos. Tanto el gel como el rolon nocturno son refrescantes y de muy buena calidad.Saludos!", "p": "Combo Para Contornos De Ojos Gel Criogénico +argan+aceite ", "img": null}, {"a": "Nancy", "f": "2026-08-05", "r": 5, "t": "Llego todo muy cuidado !", "x": "Comencé a tomarla tintura madre de carqueja ,no tiene para nada gusto feo,iré viendo los resultados! Solo me equivoque en el pedido de hierbas quería para bajar la glucemia y pedí renal ! Pero todo perfecto! 🫂", "p": "TE DE COCA x unidad infusion propiedades naturales rinde +", "img": null}, {"a": "Alicia Beatríz Caldini", "f": "2026-03-12", "r": 5, "t": "Cumple su función", "x": "Los diferentes productos al que pude acceder cumplieron con las expectativas que por lo menos esperaba. El hecho de ser naturales los hace más agradable a la función por las cuales uno espera de ellos.", "p": "Plata Coloidal x 250cc", "img": null}, {"a": "miguel angel benitez", "f": "2026-06-02", "r": 5, "t": "opinion sobre productos adquiridos", "x": "he comprado varios productos en este lugar ,y puedo decir que son excelentes en calidad y efectividad y precios razonables ,estoy muy satisfecho con sus productos ,y pienso seguir comprandoles ,gracias", "p": "Combo Dolores En Frío X 2 :Tintura Madre De Árnica + Aceit", "img": null}, {"a": "Oscar Pardo", "f": "2026-03-03", "r": 3, "t": "Cannabidol medicinal", "x": "Aún no puedo decir que note alguna mejoría en mis dolores de articulaciones,rodillas y manos. Estoy tomando 3 gotas (hoy pase a cuatro) todavía tengo insomnio. Estoy en el comienzo del tratamiento.", "p": "Aceite Cannabidol Medicinal 86 % CBD", "img": null}, {"a": "Analia Gimenez", "f": "2026-07-01", "r": 5, "t": "Muy buenos productos", "x": "Cumplieron se principio a fin con el proceso de compra, todo llegó perfecto y en los tiempos informados. Asimismo los productos son de muy buena calidad. Volveré a comprar sin dudas. Muchas gracias", "p": "Locion Pedica Para Onicomicosis Hongos 30CC", "img": null}, {"a": "Ana", "f": "2026-03-03", "r": 5, "t": "Combo antiedad", "x": "Recibí todo excelente,embalaje y productos en perfecto estado y rapidez.los productos tienen un aroma riquísimo, obviamente que necesito un tiempo para ver resultados pero por ahora todo impecable", "p": "COMBO ANTIAGE-LINEAS DE EXPRESION", "img": null}, {"a": "Sandra", "f": "2026-06-13", "r": 5, "t": "Excelente", "x": "Es la tercera vez que compro la crema de calendula, es excelente y muy rendidora.Tengo Rosacea, no puedo usar cualquier producto, con esta crema encontré lo que necesitaba.", "p": "Crema De Calendula Con Manzanilla Y Te-tre 100 Cc /habitad", "img": null}, {"a": "JORGE AGUSTÍN PÉREZ", "f": "2026-03-11", "r": 5, "t": "EXCELENTE", "x": "Realmente MUY BUENOS PRODUCTOS Y MUY EFECTIVOS...Ya realice varias compras porque eliminan rápidamente nuestros dolores: manguito rotador, rodillas, cintura, cuello, etc...", "p": "COMBO UNGUENTOS COMPLETO! x 100grs c/u", "img": null}, {"a": "Claudia", "f": "2026-07-09", "r": 5, "t": "Tratamiento artrosis y dolores articulares", "x": "Me parece algo bueno, siendo natural. La crema me esta resultando para dormir, calma mucho el dolor. Las gotas y el te recien empece a tomar, ya veremos los resultados", "p": "Combo Dolores ( Ideal Masajistas-traumatologos) Coca+canna", "img": null}, {"a": "Horacio Costa", "f": "2026-07-29", "r": 5, "t": "Pomada para dolores crónicos", "x": "Ya lo veníamos usando. Lo compramos en varias oportunidades que visitamos Merlo. Es muy efectivo. Calma los dolores articulares rápidamente y el efecto es duradero.-", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% - COCA+ CANN", "img": null}, {"a": "Elena", "f": "2026-03-06", "r": 4, "t": "Cannabidol", "x": "Empecé el lunes con 3 gotas por dolor de tendones de mi pierna derecha desde diciembre Hoy viernes me levanté mejor Ojalá siga mejorando Si es así lo escribo.", "p": "Aceite Cannabidol Medicinal 86 % CBD", "img": null}, {"a": "Alejandra Fernández Criado", "f": "2026-04-01", "r": 5, "t": "Muy bien.", "x": "Muy conforme, mejoró la forma de protejerlos para el traslado y llegaron en perfectas condiciones Me encantan los productos, los recomiendo.", "p": "Combo Para Contornos De Ojos Gel Criogenico +argan+aceite ", "img": null}, {"a": "Miguel Angel Gutiérrez", "f": "2026-06-24", "r": 5, "t": "Gel criogenico", "x": "Hace muy poco que lo empecé a usar y parece que va surtiendo efecto, hay que esperar un poco mas de tiempo para ver excelentes resultados", "p": "GEL CONTORNO DE OJOS (bolsitas) criogenico", "img": null}, {"a": "Laura", "f": "2026-08-05", "r": 1, "t": "Excelentes", "x": "Recibí de manera rápida y confiable los productos, los cuales son de excelente calidad y con una buena presentación. Muy recomendables!", "p": "Aceite de Lavanda para el Bienestar y la Relajación – 30 m", "img": null}, {"a": "Alejandro Ramón Carricondo", "f": "2026-04-11", "r": 5, "t": "Muy bueno", "x": "Lo acabo de comprar. Impecable la presentación, la información y el envío. Necesito tiempo para evaluar la funcionalidad del producto.", "p": "TINTURA MADRE DE PAJARO BOBO/ HABITAD NATURAL POR 100 CC", "img": null}, {"a": "Juan Antonio ALBERTO", "f": "2026-03-03", "r": 5, "t": "Muy buenos  productos", "x": "Este ya comencé a usarlo. Muy bueno. Recomendable mas siendo un producto natural. Excelente el envío y servicio de distribución", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% - COCA+ CANN", "img": null}, {"a": "Monica", "f": "2026-05-13", "r": 5, "t": "Todo super..", "x": "Gracias por cumplir..todo lo pedido llegó y para mi sorpresa muy rápido..ahora esperando los resultados..nuevamente gracias.", "p": "Gel De Aloe Vera Con Vitamina E Para Todo Tipo De Pieles", "img": null}, {"a": "Rosana Kozaczuk", "f": "2026-07-27", "r": 5, "t": "Sobre el pedido", "x": "Me parecieron muy lindos los productos.Estoy tomando la Árnica x mis dolores de espalda.veremos que resultados obtengo.", "p": "Aceite De Romero Cultivo Orgánico X 30CC", "img": null}, {"a": "Santiago Borquez", "f": "2026-08-05", "r": 5, "t": "Bienestar general", "x": "Recibí en buenas condiciones de envío los productos que solicite y ya los estoy utilizando. Muchas gracias.", "p": "COMBO PARA PROBLEMAS Y PROTECCION DE LA DERMIS", "img": null}, {"a": "Miguel", "f": "2026-07-05", "r": 5, "t": "Loción pedica", "x": "Lo estoy probando hace una semana y realmente parece que cumple su función. Es muy recomendable", "p": "Locion Pedica Para Onicomicosis Hongos 30CC", "img": null}, {"a": "Vanesa", "f": "2026-08-04", "r": 5, "t": "Excelente", "x": "Muy buenos productos!llegó todo perfecto. Cada producto con la explicación correspondiente", "p": "Aceite de Rosa Mosqueta para la Piel – 30 ml", "img": null}, {"a": "Andrea", "f": "2026-05-07", "r": 4, "t": "Grandes resultados", "x": "La combinación de coca y cannabis realmente me sorprendió. Mis lumbares ya no duelen tanto.", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Victoria", "f": "2026-03-05", "r": 5, "t": "Excelente", "x": "El producto que compre es muy bueno. Me respondieron enseguida. Muy conforme con la compra", "p": "jabon terapeutico", "img": null}, {"a": "Marisa Lorena Chazarreta", "f": "2026-08-03", "r": 5, "t": "Muy buenos productos", "x": "Ds mi segunda compra en el año,son productos naturales realmente buenos,los recomiendo", "p": "Gel De Aloe Vera Con Vitamina E Para Todo Tipo De Pieles", "img": null}, {"a": "Diego", "f": "2026-05-06", "r": 5, "t": "Alivio concentrado", "x": "Basta un poco de fricción y el calor se mantiene. Perfecto para mis dolores crónicos.", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Macarena Trullenque", "f": "2026-07-01", "r": 5, "t": "Buena presentación", "x": "Los productos me llegaron en perfecta condiciones . Buena presentación de todos !", "p": "Vick- Pecho Para Asma.tos.catarro (PUBLICACION MAYORISTA)", "img": null}, {"a": "María", "f": "2026-06-10", "r": 5, "t": "los productos llegaron todos de diez todo cuidadosamente bien embalado", "x": "recien empiezo a probarlos no puedo opinar sobre el producto en si por el momento", "p": "Gel De Aloe Vera Con Vitamina E Para Todo Tipo De Pieles", "img": null}, {"a": "Ana Rita Roman", "f": "2026-06-10", "r": 5, "t": "Productos naturales", "x": "Excelente, muchas propiedades , recomendable para aquellos nos gusta lo natural.", "p": "Plata Coloidal x 250cc", "img": null}, {"a": "Marcelo Fabiani", "f": "2026-07-27", "r": 5, "t": "Recomendable", "x": "Muy buena atención, celeridad en el envío y muy buena calidad de los productos.", "p": "Combo Para Contornos De Ojos Gel Criogénico +argan+aceite ", "img": null}, {"a": "Lucía", "f": "2026-05-06", "r": 5, "t": "Cuidado profesional", "x": "Producto premium como el que usan los fisioterapeutas. El envío fue muy rápido.", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Marisol Cerra", "f": "2026-07-24", "r": 5, "t": "Gel contorno de ojos", "x": "Recibí el producto en tiempo y forma,protegido y con folletos de uso. Gracias!", "p": "PACK X 2 GEL CRIÓGENICO CONTORNO DE OJOS PARA BOLSITAS", "img": null}, {"a": "Nicolas", "f": "2026-08-13", "r": 5, "t": "Ungüento premiun", "x": "Ya compre varias veces y lo recomendé a otras personas a mi me dio resultado", "p": "Ungüento premium para Articulaciones 117gr- con, coca/cann", "img": null}, {"a": "Aldo Hugo Cesario", "f": "2026-06-11", "r": 5, "t": "Servicio de envío", "x": "Muy buen servicio, en menos de una semana ya está disponible el producto!!", "p": "COMBO VARICES CREMA 100cc + FITOTERAPIA", "img": null}, {"a": "BEATRIZ OZAN", "f": "2026-04-29", "r": 5, "t": "Pedido llegó en tiempo y forma", "x": "Perfecto todo. Llegó todo lo que encargue bien embalado.super recomendado", "p": "Aceite De flores Lavanda De Cultivo Organico Por 30 mlm", "img": null}, {"a": "Juan", "f": "2026-06-08", "r": 5, "t": "Excelencia", "x": "Muy buen producto y para destacar la HUMANA atención. Vuelvo a comprar.", "p": "mezcla anti-cardiaca", "img": null}, {"a": "Brigitte Mugler", "f": "2026-03-03", "r": 5, "t": "Me gusta la crema para ArtralgiaA cronicas", "x": "No se como comprar las cremas llego hasta envío y no encuentro como pagar", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% - COCA+ CANN", "img": null}, {"a": "Hilda Susana Rodríguez", "f": "2026-08-05", "r": 4, "t": "Crema natural Caléndula", "x": "Compré el día 27/7 y llegó 5/8. Cumple con lo que esperaba. Me gusta", "p": "Crema De Calendula Con Manzanilla Y Te-tre 50 Cc /habitad ", "img": null}, {"a": "Gladys", "f": "2026-07-03", "r": 5, "t": "Muy buena", "x": "Absorve bien, es fresca y se siente agradable a la piel ( no pegote).", "p": "Crema para Varices Por 100 Cc /con Hamamelis Romero Y Cent", "img": null}, {"a": "Gustavo", "f": "2026-05-15", "r": 5, "t": "Excelente", "x": "Muy buena la crema que compre me resulta muy buena para mis rodillas.", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% - COCA+ CANN", "img": null}, {"a": "Karina Yagrossi", "f": "2026-07-21", "r": 5, "t": "excelente atención,!!", "x": "Todo es excelente , los productos, la atención, volveré a comprar!", "p": "Plata Coloidal x 250cc", "img": null}, {"a": "Susana Correa", "f": "2026-03-11", "r": 5, "t": "COMBO TRATAMIENTO CRONICO", "x": "El unguento de cremas me alivia el dolor de mi artritis rematoidea", "p": "COMBO UNGUENTOS COMPLETO! x 100grs c/u", "img": null}, {"a": "Sergio", "f": "2026-04-03", "r": 5, "t": "Excelentes productos", "x": "Estoy tomandolos y voy notando la diferencia, se nota la calidad", "p": "TINTURA MADRE DE MIL HOMBRES X 100 CC HABITAD NATURAL", "img": null}, {"a": "Graciela", "f": "2026-08-22", "r": 5, "t": "Combo psoriasis", "x": "Hola buen día..acabo de recibir mi combo...muchísimas gracias..", "p": "COMBO PSORIASIS", "img": null}, {"a": "Maríana", "f": "2026-03-09", "r": 3, "t": "Aún no recibí mi pedido", "x": "Aún no recibí mi pedido una vez lo tenga con Migo les escribo", "p": "Aceite De flores Lavanda De Cultivo Organico Por 30 mlm", "img": null}, {"a": "Beatriz", "f": "2026-06-05", "r": 5, "t": "COMBO DOLORES CRONICOS", "x": "Los productos son muy buenos, buena presentaciòn y efectivos.", "p": "Combo Dolores ( Ideal Masajistas-traumatologos) Coca+canna", "img": null}, {"a": "Claudia", "f": "2026-06-30", "r": 5, "t": "Esencias", "x": "Son exelentes todos los productos, la atención y la entrega", "p": "Esencias Para Hornito Y Lamparas De Sal Iluminarte", "img": null}, {"a": "Aldo Hugo Cesario", "f": "2026-02-27", "r": 3, "t": "El correo Andreani o cumple con los días pautados!!", "x": "El correo Andreani cumple con los días pautados!!", "p": "Crema De Varices Por 50Cc /con Hamamelis Romero Y Centella", "img": null}, {"a": "Edgardo Di Luzio", "f": "2026-07-25", "r": 3, "t": "Envase", "x": "Recién llevo 1 toma confío que me va hacer bien", "p": "blend ADELGAZANTE-bienestar", "img": null}, {"a": "Maria Graciela Gonzalez", "f": "2026-06-22", "r": 5, "t": "Excelente", "x": "Excelente para cuidar la piel de forma natural", "p": "Aceite De Calendula De Cultivo Orgánico Vegetal Por 30 cc", "img": null}, {"a": "Maria Graciela Gonzalez", "f": "2026-06-22", "r": 5, "t": "Excelente", "x": "Una crema natural y liviana que cuida la piel.", "p": "Crema De Calendula Con Manzanilla Y Te-tre 50 Cc /habitad ", "img": null}, {"a": "Maria concepcion Imaz", "f": "2026-05-20", "r": 5, "t": "de diez", "x": "todo muy bueno muchas gracias desde ayacucho", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Cristian", "f": "2026-04-19", "r": 5, "t": "Migraña", "x": "Después de un año ... chau migraña buenissima", "p": "Aceite Cannabidol Medicinal 86 % CBD", "img": null}, {"a": "Karina Estrabiz", "f": "2026-05-12", "r": 5, "t": "Imperdible", "x": "Excelentes productos Super recomendables!!", "p": "Gel Para Celulitis Con 4 Principios Activos", "img": null}, {"a": "Aldo Hugo", "f": "2026-05-02", "r": 5, "t": "Crema para varices", "x": "Muy buena crema para varices!! Recomendable", "p": "Crema De Varices Por 50Cc /con Hamamelis Romero Y Centella", "img": null}, {"a": "María Elena Palladino", "f": "2026-08-11", "r": 5, "t": "Excelente", "x": "No solo el tamaño sino por su efectividad", "p": "TINTURA MADRE DE PEZUÑA DE VACA X 100 C HABITAD NATURAL", "img": null}, {"a": "Pablo Daniel PEREYRA", "f": "2026-08-06", "r": 4, "t": "Producto para la próstata", "x": "Esperé contar en mi cuerpo con resultados", "p": "tratamiento -prostata", "img": null}, {"a": "Maria Graciela Gonzalez", "f": "2026-06-22", "r": 5, "t": "Efectivo", "x": "Ayuda mucho en el tratamiento del dolor", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% - COCA+ CANN", "img": null}, {"a": "Karina Estrabiz", "f": "2026-06-23", "r": 5, "t": "Productos muy buenos", "x": "Excelentes productos y muy accesibled!", "p": "jabon terapeutico", "img": null}, {"a": "Vanina", "f": "2026-07-17", "r": 5, "t": "Muy buena", "x": "Excelente mí piel la recibe muy bien", "p": "Aceite De Rosa Mosqueta Por 30cc (mayorista) PARA MONTO MA", "img": null}, {"a": "Miriam", "f": "2026-04-02", "r": 5, "t": "Gel contorno de ojos combo", "x": "Excelente calidad y textura! Gracias!", "p": "Combo Para Contornos De Ojos Gel Criogenico +argan+aceite ", "img": null}, {"a": "Alr", "f": "2026-02-17", "r": 5, "t": "Más información", "x": "Podrías far testimonios en Artrosis", "p": "MAQUINA ENERGIA ESCALAR POR 1 UNIDAD", "img": null}, {"a": "Lidia", "f": "2026-05-15", "r": 5, "t": "Todo perfecto", "x": "Rapidez y todo en orden! Genios", "p": "Plata Coloidal x 250cc", "img": null}, {"a": "Mariela", "f": "2026-07-29", "r": 5, "t": "Excelente", "x": "Excelente atención y productos", "p": "FLORES DE MARCELA -CALMANTE-RELAJANTE X INFUSION", "img": null}, {"a": "Mirian", "f": "2026-07-26", "r": 4, "t": "Recomendable", "x": "Hasta ahora muy buen producto", "p": "TINTURA MADRE DE PEZUÑA DE VACA X 100 C HABITAD NATURAL (m", "img": null}, {"a": "Maria concepcion Imaz", "f": "2026-06-11", "r": 5, "t": "DE 10", "x": "gracias todo exelente", "p": "BLENDS DE TES ORGANICOS PARA TRATAMIENTOS POR FITOTERAPIA", "img": null}, {"a": "Carlos", "f": "2026-05-06", "r": 5, "t": "Recomendable al 100%", "x": "Recomendable al 100%.", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Karina Estrabiz", "f": "2026-03-09", "r": 5, "t": "Muy recomendable", "x": "Excelentes productos!", "p": "Combo Dolores!!! Ideal Masajistas-traumatologos Coca+canna", "img": null}, {"a": "Patricia", "f": "2026-06-23", "r": 5, "t": "Sahumerios,cremas anti age,para varices ,aceite de jojoba", "x": "Excelentes Productos", "p": "Sahumerios botánicos", "img": null}, {"a": "Aldo Hugo", "f": "2026-06-02", "r": 5, "t": "Crema para várices!!", "x": "Muy buen producto!!", "p": "Crema De Varices Por 50Cc /con Hamamelis Romero Y Centella", "img": null}, {"a": "MARTA SUSANA PEREZ de ALBENIZ", "f": "2026-03-29", "r": 4, "t": "Bueno. Buen perfume", "x": "Bueno. Buen perfume", "p": "DESODORANTE NATURAL UNISEX HABITAD NATURAL X 40C", "img": null}, {"a": "Laura", "f": "2026-08-18", "r": 5, "t": "Opinión", "x": "Buenos productos", "p": "Combo Premium de Ungüentos para Articulaciones y Músculos ", "img": null}, {"a": "Mariana", "f": "2026-08-14", "r": 5, "t": "Excelente", "x": "En calidad precio", "p": "FLORES DE MARCELA -CALMANTE-RELAJANTE X INFUSION (mayorist", "img": null}, {"a": "Gabriela", "f": "2026-05-05", "r": 5, "t": "Alivio inmediato", "x": "Alivio inmediato.", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Nancy", "f": "2026-08-27", "r": 5, "t": "Muy buen producto", "x": "Fáciles de usar", "p": "Carbon Neutro X24 sagrada madre", "img": null}, {"a": "Maria concepcion Imaz", "f": "2026-05-29", "r": 5, "t": "EXELENTE PRODUCTO", "x": "AMO ESTA CREMITA", "p": "POMADA PARA DOLORES CRONICOS ARTICULARES 100% COCA + CANNA", "img": null}, {"a": "Cecilia", "f": "2026-08-18", "r": 5, "t": "Muy lindos", "x": "Refrescantes", "p": "Combo Para Contornos De Ojos Gel Criogénico +argan+aceite ", "img": null}, {"a": "Aldo Hugo", "f": "2026-04-18", "r": 5, "t": "Compra crema para varices!!", "x": "Muy buena!!", "p": "Crema De Varices Por 50Cc /con Hamamelis Romero Y Centella", "img": null}, {"a": "Silvia Fernández", "f": "2026-08-04", "r": 5, "t": "Gel criogeno", "x": "Excelente", "p": "PACK X 2 GEL CRIÓGENICO CONTORNO DE OJOS PARA BOLSITAS", "img": null}];

(function muro(){
  const caja = $('#muro');
  if (!caja) return;
  const inicial = a => (a || '?').trim().charAt(0).toUpperCase();

  function pintar(){
    const prom = (RESENAS.reduce((a, r) => a + r.r, 0) / RESENAS.length).toFixed(1);
    $('#muroSub').textContent = RESENAS.length + ' opiniones de compradores verificados \u00b7 ' +
      prom + ' de promedio';
    caja.innerHTML = RESENAS.map(r =>
      '<article class="muro__item' + (r.img ? ' muro__item--foto' : '') + '">' +
        '<div class="muro__astros">' + '\u2605'.repeat(r.r) + '\u2606'.repeat(5 - r.r) + '</div>' +
        (r.t ? '<p class="muro__titulo">' + r.t + '</p>' : '') +
        '<p class="muro__texto">' + r.x + '</p>' +
        (r.img ? '<img class="muro__foto" src="' + r.img + '" alt="Foto de ' + r.a +
                 '" loading="lazy">' : '') +
        '<div class="muro__pie"><span class="muro__inicial">' + inicial(r.a) + '</span>' +
        '<span class="muro__quien"><span class="muro__autor">' + r.a + '</span>' +
        '<span class="muro__producto">' + r.p + '</span></span>' +
        '<span class="muro__verificada">Verificada</span></div>' +
      '</article>').join('');
  }
  pintar();

  /* Las reseñas se piden en vivo a Trusty. Su endpoint publico responde con
     Access-Control-Allow-Origin: *, asi que el navegador puede leerlo desde
     cualquier dominio. Cuando un cliente deja una opinion nueva aparece sola,
     sin tocar el codigo y sin tope de cantidad.
     Si el pedido falla se queda la copia horneada, que ya esta pintada. */
  const LIMPIAR = /\s*[-\u2013]{0,2}\s*(?:\/\/.*|(?:PUBLICACION|COMPRA|VENTA)\s+(?:MINO\w*|MAYO\w*|DISTRI\w*)[-\s]*|CATALOGO)\s*[-\u2013]*\s*$/i;

  fetch('https://www.opinionesnube.com/reviews/' + TIENDA_ID)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(lista => {
      const utiles = lista.filter(r => r.approved && (r.text || '').trim());
      if (!utiles.length) return;
      const puntaje = r => (r.images || []).length * 1000 +
        (r.highlighted ? 500 : 0) + Math.min((r.text || '').length, 300);
      utiles.sort((a, b) => puntaje(b) - puntaje(a));
      RESENAS = utiles.map(r => ({
        a: (r.authorName || '').trim().slice(0, 38),
        f: (r.date || '').slice(0, 10),
        r: Number(r.rating) || 5,
        t: (r.title || '').trim().slice(0, 70),
        x: (r.text || '').replace(/\s+/g, ' ').trim().slice(0, 330),
        p: (r.productName || '').split('//')[0].trim()
             .replace(LIMPIAR, '').replace(/^[\s\-\u2013]+|[\s\-\u2013]+$/g, '').slice(0, 58),
        img: (r.images || [])[0] || null
      }));
      pintar();
      if (typeof arrancarCarrusel === 'function') arrancarCarrusel();
    })
    .catch(() => { /* se queda la copia local, que ya esta a la vista */ });

  /* Cada cuanto avanza. A 1s no se llega a leer una reseña entera; con esto
     se lee y sigue moviendose solo. Es el unico numero que hay que tocar. */
  const VELOCIDAD_MS = 4000;

  /* El paso sale de la distancia real entre dos tarjetas, asi no hay que
     repetir aca el ancho ni el gap que ya define el CSS en cada pantalla. */
  const paso = () => caja.children.length > 1
    ? caja.children[1].offsetLeft - caja.children[0].offsetLeft
    : caja.clientWidth;

  function mover(dir){
    const tope = caja.scrollWidth - caja.clientWidth - 2;
    if (dir > 0 && caja.scrollLeft >= tope) caja.scrollTo({left: 0});
    else caja.scrollBy({left: paso() * dir});
  }

  let reloj = null;
  const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function arrancar(){ if (!reloj && !quieto()) reloj = setInterval(() => mover(1), VELOCIDAD_MS); }
  function frenar(){ clearInterval(reloj); reloj = null; }

  document.querySelectorAll('[data-rev]').forEach(b => {
    b.onclick = () => { mover(Number(b.dataset.rev)); frenar(); arrancar(); };
  });

  /* Se frena cuando el mouse esta encima, cuando alguien lo recorre con el
     teclado o el dedo, y cuando la pestaña no esta a la vista. */
  caja.addEventListener('mouseenter', frenar);
  caja.addEventListener('mouseleave', arrancar);
  caja.addEventListener('focusin', frenar);
  caja.addEventListener('focusout', arrancar);
  caja.addEventListener('touchstart', frenar, {passive: true});
  document.addEventListener('visibilitychange', () => document.hidden ? frenar() : arrancar());

  /* Y solo corre mientras la seccion se ve: girar fuera de pantalla no le
     sirve a nadie y deja la pista en cualquier lado cuando el cliente llega. */
  if ('IntersectionObserver' in window){
    let hablo = false;
    new IntersectionObserver(es => es.forEach(e => {
      hablo = true;
      e.isIntersecting ? arrancar() : frenar();
    }), {threshold: .25}).observe(caja);
    /* Red de seguridad, la misma idea que en el revelado: si el observer no
       dispara, el carrusel arranca igual en vez de quedarse clavado. */
    setTimeout(() => { if (!hablo) arrancar(); }, 2500);
  } else arrancar();
})();


/* ---- Popup de la historia ----
   Los numeros NO estan inventados: salen del catalogo real y de las reseñas.
   - unidades: suma de los "+N vendidos" que la propia tienda publica en cada
     ficha. Son pisos ("+150" es al menos 150), por eso se muestra "mas de".
   - reseñas y promedio: las 90 aprobadas que devuelve Trusty.
   - productos: los del catalogo sincronizado.
   Si manana se quiere mostrar clientes atendidos, hay que traer el numero
   real del admin y reemplazar la serie de abajo: no se completa a ojo. */
const HIST_SERIE = [
  ['Feb', 2], ['Mar', 16], ['Abr', 8], ['May', 13],
  ['Jun', 16], ['Jul', 16], ['Ago', 19]
];

(function historia(){
  const abrir = $('#abrirHistoria'), caja = $('#modalHistoria');
  if (!abrir || !caja) return;

  const unidades = PRODUCTOS.reduce((a, p) => {
    const m = /(\d+)/.exec(p.vend || '');
    return a + (m ? +m[1] : 0);
  }, 0);
  const conRat = PRODUCTOS.filter(p => p.rat);
  const totalRes = conRat.reduce((a, p) => a + p.rat.n, 0);
  const promedio = totalRes
    ? (conRat.reduce((a, p) => a + p.rat.avg * p.rat.n, 0) / totalRes).toFixed(1) : '\u2014';

  /* Cada cifra guarda su valor aparte para que despues pueda contarse hasta
     el, en vez de aparecer de golpe. */
  $('#histCifras').innerHTML = [
    [unidades, '+', '', 'unidades vendidas'],
    [PRODUCTOS.length, '', '', 'productos en el cat\u00e1logo'],
    [RESENAS.length, '', '', 'rese\u00f1as verificadas'],
    [promedio, '', ' \u2605', 'promedio de calificaci\u00f3n']
  ].map(([n, pre, suf, t]) =>
    '<div class="hist__cifra"><b data-n="' + n + '" data-pre="' + pre + '" data-suf="' +
    suf + '">' + pre + Number(n).toLocaleString('es-AR') + suf + '</b>' +
    '<span>' + t + '</span></div>').join('');

  const tope = Math.max(...HIST_SERIE.map(x => x[1]));
  $('#histGraficoTit').textContent = 'Opiniones verificadas por mes (2026)';
  $('#histGrafico').innerHTML = '<div class="hist__barras">' + HIST_SERIE.map(([m, v]) =>
    '<div class="hist__barra"><em>' + v + '</em>' +
    '<i style="height:' + Math.round(v / tope * 100) + '%"></i>' +
    '<small>' + m + '</small></div>').join('') + '</div>';
  $('#histFuente').textContent = 'Fuente: rese\u00f1as aprobadas en Trusty desde que la app est\u00e1 ' +
    'instalada (febrero de 2026). Mide la actividad de la comunidad, no el total ' +
    'de clientes hist\u00f3ricos de la marca.';

  abrir.onclick = () => { abrirModal('modalHistoria'); animarHistoria(); track('view_historia', {}); };
  $('#historiaCerrar').onclick = () => cerrarModal('modalHistoria');
  caja.onclick = e => { if (e.target === caja) cerrarModal('modalHistoria'); };
  addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal('modalHistoria'); });
})();

/*══════════ ANIMACIONES ══════════
   Regla que ordena todo esto: la animacion NUNCA decide si algo se ve. Si
   anime.js no cargo, o el visitante pidio menos movimiento, las cosas
   aparecen igual, de una. Ya paso una vez en este proyecto que media pagina
   quedo invisible esperando a un script; no se repite. */
const ANIM = {
  hay: typeof anime === 'function',
  quieto: matchMedia('(prefers-reduced-motion: reduce)').matches
};
ANIM.activo = ANIM.hay && !ANIM.quieto;
const SALIDA = 'cubicBezier(.2,.9,.25,1)';

/* Garantiza que algo pase, lo termine la animacion o no.
   HACE FALTA DE VERDAD: si requestAnimationFrame no avanza -- pestaña sin
   pintar, equipo saturado, modo de bajo consumo -- anime deja puesto el estado
   inicial y no lo levanta nunca. Sin esto, un popup se abriria invisible y una
   fila del carrito no se llegaria a borrar. */
function pase(hecho, ms){
  let listo = false;
  const una = () => { if (listo) return; listo = true; hecho(); };
  setTimeout(una, ms);
  return una;
}

/* Deja el elemento como estaba, sin los estilos que puso anime. */
function destapar(m, caja, piezas){
  anime.remove([m, caja, ...piezas]);
  anime.set([m, caja], {opacity: '', translateY: '', scale: ''});
  if (piezas.length) anime.set(piezas, {opacity: '', translateY: ''});
}

/* Abre un popup. La caja entra desde abajo con un poco de escala, y las
   piezas marcadas con data-anima caen escalonadas detras. */
function abrirModal(id){
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('on');
  if (!ANIM.activo) return;
  const caja = m.querySelector('.modal-caja');
  const piezas = m.querySelectorAll('[data-anima]');
  anime.remove([m, caja, ...piezas]);
  anime.set(m, {opacity: 0});
  anime.set(caja, {opacity: 0, translateY: 26, scale: .97});
  anime({targets: m, opacity: 1, duration: 180, easing: 'linear'});
  anime({targets: caja, opacity: 1, translateY: 0, scale: 1,
         duration: 430, easing: SALIDA});
  if (piezas.length){
    anime.set(piezas, {opacity: 0, translateY: 14});
    anime({targets: piezas, opacity: 1, translateY: 0,
           delay: anime.stagger(60, {start: 130}), duration: 400, easing: SALIDA});
  }

  // Red: a los 900 ms, si el popup sigue abierto pero invisible, se destapa a
  // la fuerza. Un popup abierto que no se ve es peor que uno sin animacion.
  clearTimeout(m._redAbrir);
  m._redAbrir = setTimeout(() => {
    if (m.classList.contains('on') && getComputedStyle(m).opacity !== '1'){
      destapar(m, caja, piezas);
    }
  }, 900);
}

/* Cierra un popup. Se saca la clase .on recien cuando termina la salida, para
   que no desaparezca de golpe. Los estilos que dejo anime se limpian, asi la
   proxima apertura arranca de cero. */
function cerrarModal(id){
  const m = document.getElementById(id);
  if (!m || !m.classList.contains('on')) return;
  /* La ficha de producto es la unica que tiene direccion propia. Se limpia
     aca y no en cada boton, asi vale para el boton de cerrar, la tecla Escape
     y el clic afuera, sin repetir la llamada en tres lugares. */
  if (id === 'modal' && typeof sacarFichaDeLaDireccion === 'function'){
    sacarFichaDeLaDireccion();
  }
  const caja = m.querySelector('.modal-caja');
  const piezas = m.querySelectorAll('[data-anima]');
  if (!ANIM.activo){ m.classList.remove('on'); return; }
  clearTimeout(m._redAbrir);
  anime.remove([m, caja, ...piezas]);
  // Red: si la salida no termina sola, el popup quedaria abierto para siempre.
  const cerrar = pase(() => { m.classList.remove('on'); destapar(m, caja, piezas); }, 420);
  anime({targets: caja, opacity: 0, translateY: 16, scale: .985,
         duration: 190, easing: 'easeInQuad'});
  anime({targets: m, opacity: 0, duration: 210, easing: 'linear', complete: cerrar});
}

/* Anima el interior del popup de la historia: las barras crecen desde cero y
   las cifras suben hasta su numero. Se llama cada vez que se abre. */
function animarHistoria(){
  if (!ANIM.activo) return;
  const barras = document.querySelectorAll('.hist__barra i');
  if (barras.length){
    anime.remove(barras);
    // El alto final se guarda la primera vez: despues la barra ya vale 0.
    barras.forEach(b => { if (!b.dataset.alto) b.dataset.alto = b.style.height; });
    anime.set(barras, {height: '0%'});
    anime({targets: barras, height: el => el.dataset.alto,
           delay: anime.stagger(65, {start: 240}), duration: 720, easing: 'easeOutExpo'});
    // Red: el grafico no puede quedarse plano si los frames no avanzan.
    pase(() => barras.forEach(b => {
      if (b.style.height === '0%'){ anime.remove(b); b.style.height = b.dataset.alto; }
    }), 1300);
  }
  document.querySelectorAll('.hist__cifra b').forEach((el, i) => {
    const n = Number(el.dataset.n);
    if (!isFinite(n)) return;
    contarHasta(el, n, el.dataset.suf, el.dataset.pre, 200 + i * 90);
  });
}

/* Numeros que suben hasta su valor, para las cifras de la historia. */
function contarHasta(el, valor, sufijo, prefijo, demora){
  const decimales = String(valor).includes('.') ? 1 : 0;
  const escribir = v => el.textContent = (prefijo || '') +
    v.toLocaleString('es-AR', {minimumFractionDigits: decimales,
                               maximumFractionDigits: decimales}) + (sufijo || '');
  if (!ANIM.activo){ escribir(valor); return; }
  anime.remove(el);
  const dato = {n: 0};
  anime({targets: dato, n: valor, duration: 1300, delay: demora || 0, easing: 'easeOutExpo',
    update(){ escribir(decimales ? Number(dato.n.toFixed(1)) : Math.round(dato.n)); }});
  // Red: la cifra tiene que terminar en su numero, cuente o no.
  pase(() => { anime.remove(dato); escribir(valor); }, (demora || 0) + 1500);
}



/* ---- 5 · selector de cliente, progresivo ---- */
/* Al elegir el tipo de cliente se baja al catalogo.
   Antes, lo unico que cambiaba a la vista era el cartelito de "estas viendo
   precios mayoristas", que queda arriba de todo: el cliente elegia y no sabia
   adonde mirar. Se baja hasta la barra de categorias, que deja los chips
   arriba y los productos justo debajo.

   Si el cambio vacio el carrito, se espera un momento antes de bajar para que
   alcance a leer el aviso: si no, se lo llevaria por delante sin verlo. */
function irAlCatalogo(){
  /* Se salta a la grilla, no a la barra de categorias: desde que el selector
     de compra quedo debajo de las categorias, saltar a la barra empujaba la
     pagina para ARRIBA justo despues de elegir el segmento. Se le descuenta
     el alto de la barra pegada, que si no tapa la primera fila. */
  const destino = $('.carrusel-cat') || $('#chipsBarra');
  if (!destino) return;
  const aviso = $('#avisoSeg');
  const demora = aviso && aviso.classList.contains('on') ? 1200 : 120;
  const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    const barra = $('#chipsBarra');
    const tapa = barra ? barra.offsetHeight + 8 : 0;
    const y = Math.max(0, destino.getBoundingClientRect().top + window.scrollY - tapa);
    const antes = window.scrollY;
    window.scrollTo({top: y, behavior: suave ? 'smooth' : 'instant'});
    /* Red: el desplazamiento suave no avanza si los frames estan congelados
       -- pestaña en segundo plano, equipo saturado -- y ahi el cliente se
       queda arriba, que es exactamente el problema que esto venia a resolver.
       Si a los 700 ms no se movio, se salta de una.
       Va 'instant' y no 'auto': el CSS de la pagina tiene scroll-behavior
       smooth, y 'auto' se lo queda, con lo cual el respaldo se congelaba
       igual que aquello de lo que venia a proteger. */
    if (suave) setTimeout(() => {
      if (Math.abs(window.scrollY - antes) >= 8) return;   // ya se movio, listo
      /* Para forzarlo hay que apagar el scroll-behavior:smooth del CSS: si
         queda puesto, hasta un scroll pedido como 'instant' se encola detras
         del suave que quedo colgado, y no pasa nada. Se apaga, se salta y se
         devuelve como estaba. */
      const html = document.documentElement;
      const previo = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      html.style.scrollBehavior = previo;
    }, 700);
  }, demora);
}

/* Los botones se marcan SIEMPRE desde `segmento`, nunca desde el clic: si el
   cliente cancela el cambio, la marca tiene que volver sola a donde estaba. */
function marcarSegmento(){
  document.querySelectorAll('#segN1 .seg-btn, #segN2 .seg-btn').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.seg === segmento));
  });
  // El boton MAYORISTA del primer nivel solo abre el segundo: queda marcado
  // mientras se este en cualquiera de los dos precios de reventa.
  const abre = document.querySelector('#segN1 [data-abre]');
  if (abre) abre.setAttribute('aria-pressed', String(segmento !== 'minorista'));
  $('#segN2').classList.toggle('on', segmento !== 'minorista');
}

/* Pedir el cambio no es hacerlo: si hay carrito armado se pregunta primero.
   Vaciarlo sin avisar es la forma mas cara de perder una compra. */
/* ══════════ CAMBIAR DE TIPO DE COMPRA ══════════
   Con el carrito vacio, cambiar de segmento es apretar un boton y nada mas.
   Con el carrito cargado hay dos caminos, y son distintos a proposito:

   SUBIR (a mayorista o a distribuidor) exige el minimo de compra del segmento
   al que se va, medido con los precios de ESE segmento -- que es lo que la
   tienda va a cobrar. Si no llega, se dice cuanto falta y no se cambia nada.
   Si llega, el carrito NO se vacia: se convierte, los productos pasan a los
   precios nuevos y de ahi en mas se compra libremente.

   Nada de esto pasa solo. Un minorista que se pasa de $100.000 sigue siendo
   minorista: el cambio de segmento es una decision suya, no del carrito.

   BAJAR a la lista minorista no cambia el segmento. Un mayorista que quiere
   un producto que su lista no publica no tiene por que renunciar a sus
   precios en todo lo demas: se le abre un selector y lo suma a precio de
   lista, con el resto del carrito intacto. Eso si, tambien tiene que estar
   cumpliendo su propio minimo. */
let segPedido = null;

const faltaPara = (seg, total) => Math.max(0, MINIMOS[seg] - total);

/* Que lineas del carrito pasan a otro segmento: las que la lista de destino
   publica, a su precio, y los combos, a precio de lista, porque la landing
   los vende asi en los tres segmentos. Antes los combos no viajaban: un
   carrito de combos de $212.640 medía $0 a precio mayorista, y el aviso pedia
   los $100.000 enteros mientras la barra mostraba $212.640. */
const viajaA = (p, destino) => hayEn(p, destino) || p.necs.includes('packs');

function pintarAviso(o){
  $('#segAvisoTit').textContent = o.titulo;
  $('#segAvisoTxt').innerHTML = o.texto;
  const caja = $('#segAvisoCaja');
  caja.hidden = !(o.lista && o.lista.length);
  if (!caja.hidden){
    $('#segAvisoCajaTit').textContent = o.listaTit;
    $('#segAvisoLista').innerHTML = o.lista
      .map(n => '<li>' + n + '</li>').join('');
  }
  const no = $('#segAvisoNo'), si = $('#segAvisoSi');
  no.textContent = o.no;
  si.hidden = !o.si;
  if (o.si) si.textContent = o.si;
  abrirModal('modalSegmento');
}

function pedirSegmento(id){
  if (id === segmento){ marcarSegmento(); irAlCatalogo(); return; }
  if (!Object.keys(carrito).length){ aplicarSegmento(id); irAlCatalogo(); return; }
  segPedido = id;
  if (ESCALA.indexOf(id) > ESCALA.indexOf(segmento) || id !== 'minorista')
    return pedirAscenso(id);
  return pedirMinorista();
}

/* Subir: se mide el carrito con los precios del destino. */
function pedirAscenso(destino){
  const items = Object.values(carrito);
  const viajan = items.filter(i => viajaA(i.prod, destino));
  const quedan = items.filter(i => !viajaA(i.prod, destino));
  const ahora = totalCarrito();
  const despues = viajan.reduce((a, i) => a + precioEn(i, destino) * i.cant, 0);
  const falta = faltaPara(destino, despues);
  const nombre = SEGMENTOS[destino].label.toLowerCase();

  if (falta){
    track('segment_min_bloqueado', {to: destino, total: despues, missing: falta});
    /* Dos datos y nada mas: cuanto falta y contra que minimo. La cuenta de
       "tenes tanto a precio tal y tanto a precio tal otro" era exacta y no la
       leia nadie; el minimo si hace falta, porque sin el numero de referencia
       el cliente no sabe si le conviene seguir sumando. */
    /* Si parte del carrito no cuenta, se dice cuanto suma y cuanto cuenta, y
       que queda afuera. Sin esa linea el aviso contradecia a la barra: la
       barra sumaba todo y el aviso solo lo que la lista de destino publica. */
    const n = quedan.length;
    return pintarAviso({
      titulo: 'Te faltan ' + ars(falta),
      texto: 'Para comprar a precio <b>' + nombre + '</b> te faltan <b>' +
        ars(falta) + '</b>: el mínimo de activación ' + nombre + ' es <b>' +
        ars(MINIMOS[destino]) + '</b>.' +
        (n ? '<br><br>Tu carrito suma <b>' + ars(ahora) + '</b>, pero a precio ' + nombre +
             ' cuenta <b>' + ars(despues) + '</b>: ' +
             (n === 1 ? 'hay un producto que no tiene' : 'hay ' + n + ' productos que no tienen') +
             ' precio ' + nombre + ' y no ' + (n === 1 ? 'suma' : 'suman') + ' para el mínimo.'
           : '') +
        '<br><br>Seguí sumando y volvé a tocar ' +
        SEGMENTOS[destino].label.toUpperCase() +
        ': ahí tu carrito pasa solo a los precios nuevos.',
      listaTit: n === 1 ? 'No tiene precio ' + nombre + ':' : 'No tienen precio ' + nombre + ':',
      lista: quedan.map(i => i.prod.n),
      no: 'Seguir comprando'
    });
  }

  track('segment_change_prompt', {from: segmento, to: destino,
                                  total: ahora, total_destino: despues});
  pintarAviso({
    titulo: '¿Pasamos tu carrito a precio ' + nombre + '?',
    texto: 'Llegaste al mínimo de <b>' + ars(MINIMOS[destino]) + '</b>. ' +
      'Tus <b>' + viajan.reduce((a, i) => a + i.cant, 0) + ' producto' +
      (viajan.reduce((a, i) => a + i.cant, 0) > 1 ? 's' : '') + '</b> pasan a precio ' +
      nombre + ': <b>' + ars(ahora) + '</b> → <b>' + ars(despues) + '</b>.' +
      (viajan.some(i => !hayEn(i.prod, destino))
        ? ' Los combos siguen a precio de lista, igual que en toda la lista ' + nombre + '.' : ''),
    listaTit: quedan.length === 1
      ? 'Este producto sale del carrito, porque la lista ' + nombre + ' no lo publica:'
      : 'Estos ' + quedan.length + ' productos salen del carrito, porque la lista ' +
        nombre + ' no los publica:',
    lista: quedan.map(i => i.prod.n),
    no: 'Mantener como está',
    si: 'Pasar a ' + nombre
  });
}

/* Bajar a la lista minorista: no se cambia de segmento, se suma. */
function pedirMinorista(){
  const total = totalCarrito();
  const falta = faltaPara(segmento, total);
  const nombre = SEGMENTOS[segmento].label.toLowerCase();
  segPedido = null;
  marcarSegmento();

  if (falta){
    track('minorista_bloqueado', {segment: segmento, total, missing: falta});
    return pintarAviso({
      titulo: 'Te faltan ' + ars(falta),
      texto: 'Para poder sumar productos de la lista minorista te faltan <b>' +
        ars(falta) + '</b>: el mínimo de activación ' + nombre + ' es <b>' +
        ars(MINIMOS[segmento]) + '</b>.',
      no: 'Seguir comprando'
    });
  }
  abrirSelectorMinorista();
}

$('#segAvisoNo').onclick = () => {
  if (segPedido) track('segment_change_cancel', {from: segmento, to: segPedido});
  segPedido = null;
  marcarSegmento();                      // la marca vuelve al segmento vigente
  cerrarModal('modalSegmento');
};
$('#segAvisoSi').onclick = () => {
  const id = segPedido; segPedido = null;
  cerrarModal('modalSegmento');
  if (!id) return;
  convertirCarrito(id);
  aplicarSegmento(id, true);             // true: el carrito ya viene convertido
  irAlCatalogo();
};
$('#modalSegmento').onclick = e => {
  if (e.target.id === 'modalSegmento') $('#segAvisoNo').onclick();
};

/* Los que no existen en el destino se van; el resto queda con los precios
   nuevos. No hay tercera opcion: dejarlos con el precio viejo seria cobrar
   dos listas en la misma compra sin que el cliente lo haya pedido. */
function convertirCarrito(destino){
  Object.entries(carrito).forEach(([k, i]) => {
    if (!viajaA(i.prod, destino)) delete carrito[k];
    else i.seg = destino;
  });
}

/* ══════════ SELECTOR DE PRODUCTOS MINORISTAS ══════════
   Solo lo que la lista del segmento vigente NO publica: si el producto existe
   en mayorista, agregarlo a precio de lista seria cobrarle de mas. */
function productosSoloMinoristas(){
  return PRODUCTOS.filter(p => hayEn(p, 'minorista') && !hayEn(p, segmento) &&
                               p.st.minorista !== false);
}

/* Igual que la del buscador, que es local de su bloque: minusculas, sin
   acentos y sin puntuacion, para que "aloe" encuentre "Áloe". */
const claveMino = t => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

function pintarSelectorMinorista(texto){
  const caja = $('#minoLista');
  const q = claveMino(texto || '');
  const palabras = q.split(' ').filter(w => w.length > 1);
  const lista = productosSoloMinoristas()
    .filter(p => !palabras.length || palabras.every(w => claveMino(p.n).includes(w)))
    .slice(0, 40);

  if (!lista.length){
    caja.innerHTML = '<p class="mino__nada">' + (texto
      ? 'Nada con <b>' + texto.replace(/[<>&]/g, '') + '</b> fuera de la lista ' +
        SEGMENTOS[segmento].label.toLowerCase() + '.'
      : 'Todo el catálogo está publicado en tu lista.') + '</p>';
    return;
  }
  caja.innerHTML = '';
  lista.forEach(p => {
    const fila = document.createElement('div');
    fila.className = 'mino__item';
    fila.innerHTML =
      (p.img ? '<img class="mino__foto" src="' + p.img + '" alt="" loading="lazy">'
             : '<span class="mino__foto"></span>') +
      '<span class="mino__nom">' + p.n + '</span>' +
      '<span class="mino__precio">' + ars(p.pr.minorista) + '</span>' +
      '<button type="button" class="mino__add">+ Agregar</button>';
    fila.querySelector('.mino__add').onclick = e => {
      // Clave propia: si el mismo producto entrara despues por el catalogo a
      // precio mayorista, serian dos lineas distintas y esta bien que lo sean.
      agregar(p, 'minorista-' + p.n, 1, e.currentTarget, 'minorista');
      track('add_minorista_desde_mayorista', {item_name: p.n, segment: segmento});
    };
    caja.appendChild(fila);
  });
}

function abrirSelectorMinorista(){
  $('#minoSub').innerHTML = 'Estos no están publicados en la lista <b>' +
    SEGMENTOS[segmento].label.toLowerCase() + '</b>, así que van a precio de lista. ' +
    'El resto de tu carrito no se toca y seguís comprando como ' +
    SEGMENTOS[segmento].label.toLowerCase() + '.';
  $('#minoBuscar').value = '';
  pintarSelectorMinorista('');
  track('abre_selector_minorista', {segment: segmento});
  abrirModal('modalMinorista');
}

$('#minoBuscar').addEventListener('input', e => pintarSelectorMinorista(e.target.value));
$('#minoCerrar').onclick = () => cerrarModal('modalMinorista');
$('#modalMinorista').onclick = e => {
  if (e.target.id === 'modalMinorista') cerrarModal('modalMinorista');
};

$('#segN1').addEventListener('click', e => {
  const b = e.target.closest('.seg-btn'); if (!b) return;
  if (b.dataset.abre === 'mayorista'){
    $('#segN2').classList.add('on');              // recién acá aparecen 20% y 30%
    b.setAttribute('aria-pressed','true');
    return;
  }
  pedirSegmento('minorista');
});
$('#segN2').addEventListener('click', e => {
  const b = e.target.closest('.seg-btn'); if (!b) return;
  pedirSegmento(b.dataset.seg);
});

/* Cambiar de segmento a mano arranca una compra nueva: los precios, los
   minimos y hasta que productos existen son otros, asi que mezclar lo cargado
   antes no tiene sentido. El ascenso automatico de mas abajo es la excepcion,
   porque ahi la compra es la misma. */
function aplicarSegmento(id, conservarCarrito){
  const habia = Object.keys(carrito).length;
  if (!conservarCarrito && habia && id !== segmento){
    Object.keys(carrito).forEach(k => delete carrito[k]);
    avisoCarrito('Vaciamos el carrito porque cambiaste a precios ' +
      SEGMENTOS[id].label.toLowerCase() + '. Cargá de nuevo desde este catálogo.');
    track('cart_cleared_by_segment', {from: segmento, to: id, lines: habia});
  }
  segmentoElegido = true;
  ponerSegmento(id);
  track('select_customer_type', {segment:id});

  pintar(); pintarPacks(); recalcular();
  // Si la ficha esta abierta al cambiar de segmento, el boton se actualiza.
  const rapida = $('#mvRapida');
  if (rapida && vista) rapida.hidden = segmento !== 'minorista' || !conStock(vista.p);
}

/* Lo que cambia al pasar a un segmento, sin pintar ni medir. Lo usa tambien
   el carrito guardado al recuperar la visita anterior: ahi el cliente no
   eligio nada de nuevo, asi que no se cuenta como una eleccion. */
function ponerSegmento(id){
  segmento = id;
  marcarSegmento();
  const s = SEGMENTOS[id];
  const caja = $('#segActivo');
  caja.classList.add('on');
  caja.innerHTML = s.off
    ? 'Estás viendo precios de <b>' + s.label + '</b>, con ' + s.off + '% de descuento aplicado. ' +
      '<br><small>En la tienda real el descuento lo aplica Tiendanube con sus tablas de precios, ' +
      'al vincular tu cuenta. Acá se simula para que veas el efecto.</small>'
    : 'Estás viendo <b>precios de lista</b>.';
  // La escalera de beneficios cambia con el segmento: un mayorista arranca
  // en su minimo de compra, no en los hitos del consumidor final.
  TIERS = TIERS_POR_SEGMENTO[id] || TIERS_POR_SEGMENTO.minorista;
  logradosPrevios = 0;
  pintarHitos();
  /* Los tres segmentos tienen envio gratis, con montos distintos: $60.000 el
     minorista (promocion 765333, la que refleja Nubea) y $150.000 el mayorista
     y el distribuidor (promocion 806521). Hasta el 25/09/2026 aca decia "A
     cargo del comprador" a los dos ultimos, que era falso. */
  const beneEnvio = $('#beneEnvio');
  if (beneEnvio) beneEnvio.textContent = 'Gratis superando ' + ars(umbralEnvioDe(id));
}

/* Aviso corto arriba del catalogo. Se usa tanto al vaciar el carrito como al
   ascender de segmento: en los dos casos al cliente le cambio algo debajo de
   los pies y hay que decirselo. */
let avisoTimer = null;
function avisoCarrito(texto){
  const caja = $('#segActivo');
  if (!caja) return;
  let aviso = $('#avisoSeg');
  if (!aviso){
    aviso = document.createElement('p');
    aviso.id = 'avisoSeg'; aviso.className = 'aviso-seg';
    caja.insertAdjacentElement('afterend', aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add('on');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => aviso.classList.remove('on'), 7000);
}

/* La barra de categorias avisa cuando queda pegada arriba, para achicarse.
   Con un centinela de un pixel arriba de ella: mientras se ve, la barra esta
   suelta; cuando sale de pantalla, esta pegada. Sin escuchar el scroll. */
(function barraPegada(){
  const barra = $('#chipsBarra');
  if (!barra || !('IntersectionObserver' in window)) return;
  const testigo = document.createElement('div');
  testigo.setAttribute('aria-hidden', 'true');
  testigo.style.cssText = 'height:1px;margin-bottom:-1px';
  barra.parentNode.insertBefore(testigo, barra);
  new IntersectionObserver(
    ([e]) => barra.classList.toggle('pegada', !e.isIntersecting),
    {threshold: 0}
  ).observe(testigo);

  const medir = () => document.documentElement.style
    .setProperty('--barra-cat', barra.offsetHeight + 'px');
  medir();
  addEventListener('resize', medir);
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(barra);
})();

/* El pie de la pagina se aparta exactamente lo que mide la barra de compra.
   Estaba clavado en 96px y la barra mide 99 en celular, asi que el ultimo
   renglon quedaba debajo. Y con el carrito vacio no hace falta apartar nada. */
function apartarPie(){
  const bf = $('#barraFija');
  const alto = bf && bf.classList.contains('visible') ? bf.offsetHeight + 14 : 0;
  document.body.style.paddingBottom = alto + 'px';
}
addEventListener('resize', apartarPie);

/* ---- 6 · catálogo ---- */
const carrito = {};

/* ══ El renglon de la tarjeta ══
   La descripcion completa vive en la ficha y no se toca. Para las dos lineas
   de la tarjeta se busca la primera frase que diga algo nuevo, salteando dos
   cosas que traen casi todas las fichas de la tienda:

     1. el arranque que repite el nombre del producto ("Aceite De Almendras
        Por 30 ml" debajo de "Aceite de Almendras para Nutricion..."), y
     2. los encabezados en mayusculas sostenidas ("ACEITE DE CULTIVO ORGANICO
        LAVANDAS Conocido por sus...").

   Debajo del titulo, las dos se leen como un segundo titulo mal escrito. */
const soloLetras = t => plano(t).replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

/* Saltea las palabras del arranque que no tienen ni una minuscula: son el
   encabezado en mayusculas, no la frase. */
function sinGritos(t){
  const w = t.split(/\s+/);
  let i = 0;
  while (i < w.length && !/[a-záéíóúüñ]/.test(w[i])) i++;
  // Si TODA la linea esta en mayusculas no queda nada: se devuelve entera,
  // que es mejor que un renglon vacio.
  return i < w.length ? w.slice(i).join(' ') : t;
}

function resumenTarjeta(p){
  /* Palabras propias del titulo, de cuatro letras para arriba: "de", "para" y
     "con" estan en todos lados y no dicen si una linea repite al producto. */
  const delTitulo = new Set(soloLetras(p.n).split(' ').filter(w => w.length > 3));
  /* La leyenda legal va pegada al final de la ultima linea, no en una propia:
     hay que sacarla de cada renglon antes de mirarlo, porque si no, en un
     producto de descripcion corta el renglon de la tarjeta seria la leyenda. */
  const lineas = (p.d || '').split('\n')
    .map(t => t.replace(CIERRE_LEGAL, '').trim()).filter(Boolean);

  for (const linea of lineas){
    const frase = sinGritos(linea);
    const q = soloLetras(frase);
    if (q.length < 18) continue;                 // "Contiene :", "Modo de uso"

    /* Renglon entero en mayusculas: es un encabezado del editor, no una
       frase. Comparar solo los primeros caracteres no alcanzaba -- "ACEITE DE
       CULTIVO ORGANICO LAVANDAS" no empieza igual que "Aceite de Lavanda
       para el Bienestar" y se colaba igual. */
    const letras = frase.replace(/[^A-Za-zÁÉÍÓÚÜÑ]/g, '');
    if (letras.length > 6 && letras === letras.toUpperCase()) continue;

    /* Y el renglon que vuelve a nombrar el producto con otras palabras
       ("Aceite Organico de Jarilla x 30cc" debajo de "Aceite de Jarilla
       Organico para Masajes"): corto y con la mitad de las palabras del
       titulo. Se pide que sea corto para no tirar una frase larga que
       ademas nombra el producto, que si aporta. */
    const propias = q.split(' ').filter(w => w.length > 3);
    const repetidas = propias.filter(w => delTitulo.has(w)).length;
    if (q.length < 52 && propias.length && repetidas / propias.length >= 0.5) continue;

    return frase;
  }

  // Nada paso el filtro: la primera linea con texto, al menos sin gritar.
  const suelta = lineas.find(t => t.length > 18);
  return suelta ? sinGritos(suelta) : '';
}

function tarjeta(p, key){
  const pr = precioDe(p), lista = p.pr.minorista;
  const rebaja = (segmento !== 'minorista' && lista && pr && lista > pr)
    ? Math.round((1 - pr / lista) * 100) : 0;
  const sinStock = !conStock(p);
  const el = document.createElement('article');
  el.className = 'card js-item-product' + (sinStock ? ' card--sin-stock' : '');
  // Ancla oficial de Tiendanube: es por donde las apps instaladas encuentran
  // el producto. Trusty / Opiniones Nube inyecta las estrellas aca.
  const idTienda = p.ids.minorista || p.ids.mayorista || p.ids.distribuidor;
  if (idTienda) el.setAttribute('data-store', 'product-item-' + idTienda);
  el.innerHTML =
    '<div class="foto">' +
      (p.img ? '<img src="' + p.img + '" alt="' + p.n + '" loading="lazy">' : '🌿') +
      (rebaja ? '<span class="tag">' + rebaja + '% OFF</span>' : '') +
      (sinStock ? '<span class="tag tag--bug">sin stock</span>' : '') +
      (nubea ? nubea.stickersHtml(p) : '') + '</div>' +
    '<div class="card-body">' +
      '<h3>' + p.n + '</h3>' +
      // Hueco donde la app deja las estrellas. Vacio no ocupa lugar.
      estrellasDe(p) +
      /* Con variantes, el desplegable va en el lugar de la descripcion: elegir
         la variante es lo que hace falta en la tarjeta, y la descripcion
         entera sigue en la ficha. El nombre de la opcion queda en la etiqueta
         accesible. */
      '<div class="card-medio">' + (p.vars
        ? '<select class="variante-sel" data-variante aria-label="' + (p.opcion || 'Variante') +
          '" title="' + (p.opcion || 'Variante') + '">' + p.vars.map((v, i) =>
          '<option value="' + i + '"' + (v.s ? '' : ' disabled') + '>' + v.n +
          (v.s ? '' : ' (sin stock)') + '</option>').join('') + '</select>'
        : '<p class="desc">' + resumenTarjeta(p) + '</p>') + '</div>' +
      '<div class="precios"><span class="precio">' + ars(pr) + '</span>' +
        (rebaja ? '<span class="precio-viejo">' + ars(lista) + '</span>' +
                  '<span class="precio-seg">-' + rebaja + '%</span>' : '') + '</div>' +
      /* La franja de badges va en todas las tarjetas apenas Nubea tenga alguno
         para la grilla, aunque a este producto no le toque: si no, las que
         no tienen quedarian mas bajas. */
      (function(){
        if (!nubea || !nubea.datos.badges.badges.some(x => x.showInGrid !== false)) return '';
        return '<div class="nb-badges">' + nubea.badgesHtml(p, 'tarjeta') + '</div>';
      })() +
      '<div class="acciones">' +
        '<div class="qty"><button type="button" data-d="-1">-</button>' +
        campoCantidad(1, 'Cantidad de ' + p.n) +
        '<button type="button" data-d="1">+</button></div>' +
        '<button class="add" type="button"' + (sinStock ? ' disabled' : '') + '>' +
        (sinStock ? 'Sin stock' : 'Agregar') + '</button></div>' +
      '<button class="vermas" type="button">Ver detalles</button></div>';
  const cuenta = armarContador(el.querySelector('.qty'));
  const sel = el.querySelector('[data-variante]');
  if (sel) sel.onchange = () => { varElegida.set(p.n, +sel.value);
    el.querySelector('.precio').textContent = ars(precioDe(p)); };
  if (!sinStock) el.querySelector('.add').onclick =
    e => agregar(p, key, cuenta.leer(), e.target);
  /* La foto y el nombre tambien abren la ficha: hay clientes que ignoran el
     boton y hacen clic en la imagen, que es lo que uno espera de una tarjeta
     de producto. Los controles de cantidad y el boton de agregar quedan
     afuera a proposito, para que un clic ahi no abra nada. */
  el.querySelector('.vermas').onclick = () => abrirVista(p, key);
  el.querySelectorAll('.foto, h3').forEach(z => {
    z.classList.add('abre-ficha');
    z.onclick = () => abrirVista(p, key);
  });
  return el;
}

/* ---- Catalogo ----
   Se ve todo lo que se puede comprar en el segmento elegido. Para achicar hay
   dos filtros que no se mezclan: la categoria de la tienda o el buscador. Los
   combos entran en los tres segmentos, a precio de lista, igual que en su
   carrusel.

   Sin busqueda va primero lo que se puede comprar y lo mas elegido -- reseñas,
   ventas --; con busqueda, lo que mejor coincide con lo escrito.

   var y no let: pintar() se puede llamar antes de que el guion llegue hasta
   aca, y con let eso seria un error en vez de una busqueda vacia. */
var busqueda = '';

function pintar(){
  const g = $('#grilla'); g.innerHTML = '';
  const seg = SEGMENTOS[segmento].label.toLowerCase();
  const texto = (busqueda || '').trim();
  const delSegmento = PRODUCTOS.filter(p => p.necs.includes('packs') || hayEn(p, segmento));
  // Las pastillas se rehacen en cada pintado: sus cantidades cambian con el
  // segmento, y la lista con lo que haga el administrador.
  const cat = categoriasVivas ? categoriasVivas.pintarChips(delSegmento, !!texto) : null;
  const items = texto
    ? buscarProductos(texto)
    : (cat ? cat.productos : delSegmento).sort(ordenDestacados);

  $('#cat-sub').textContent = !items.length ? '' : texto
    ? items.length + (items.length === 1 ? ' resultado' : ' resultados') +
      ' para «' + texto + '» con precio ' + seg + '.'
    : items.length + (items.length === 1 ? ' producto' : ' productos') + ' con precio ' + seg +
      (cat ? ' en ' + cat.n : '') + '.';

  if (!items.length){
    const limpio = texto.replace(/[<>&"]/g, '');
    if (texto){
      // Se dice si existe con otro precio: es la diferencia entre "no lo hay"
      // y "no lo vendemos a este segmento".
      const enOtro = PRODUCTOS.filter(p => coincide(p, texto)).length;
      /* La salida a la tienda: la landing no tiene todas las publicaciones, y
         el que busca desde el encabezado del theme espera encontrarlas. El
         &tienda=1 es para que home.js no lo devuelva para aca. */
      g.innerHTML = '<div class="vacio"><strong>Nada con «' + limpio + '»</strong>' +
        (enOtro && segmento !== 'minorista'
          ? 'Hay ' + enOtro + ' con precio de lista: cambiá a Minorista para verlos.'
          : 'Probá con otra palabra: el nombre del producto o lo que necesitás cuidar.') +
        '<a class="vacio-tienda" href="/search/?q=' + encodeURIComponent(texto) +
        '&tienda=1">Buscar «' + limpio + '» en el catálogo completo</a></div>';
    } else {
      g.innerHTML = '<div class="vacio"><strong>No hay productos ' + seg + ' publicados</strong>' +
        'La tienda todavía no publica productos para este segmento.</div>';
    }
    if (typeof actualizarFlechasCat === 'function') actualizarFlechasCat();
    return;
  }
  // La clave es el producto, no la posicion en la grilla: el mismo producto
  // agregado con y sin busqueda tiene que sumar en la misma linea del carrito.
  items.forEach(p => g.appendChild(tarjeta(p, 'cat-' +
    (p.ids.minorista || p.ids.mayorista || p.ids.distribuidor))));
  // Cada busqueda arranca desde el principio de la grilla.
  g.scrollLeft = 0;
  if (typeof actualizarFlechasCat === 'function') actualizarFlechasCat();
}

/* ---- Packs ----
   La seccion existia con el contenedor vacio: no habia nada que lo llenara.
   Los packs son los 26 productos de la necesidad 'packs' del catalogo real,
   asi que se pintan con la misma tarjeta y se agregan igual que el resto. */
/* Los nombres de los combos vienen de la tienda en MAYUSCULAS -- 14 de los 26
   -- y en una tarjeta con serif se leen como un grito. Se pasan a mayuscula
   inicial SOLO cuando el nombre entero esta en mayusculas; los que ya vienen
   mezclados no se tocan. Es de presentacion: el catalogo no se modifica. */
function nombrePack(n){
  const t = (n === n.toUpperCase()) ? n.toLowerCase() : n;
  // Algunos ademas vienen arrancando en minuscula ("combo vick+tintura").
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* ══════════ COMBOS · CARRUSEL DE PORTADA ══════════
   Lo pidio el cliente con una referencia: una carta al frente y las vecinas
   escalonadas detras, cada una de un color, con corazon y compartir arriba,
   nombre y precio abajo y el boton ancho de agregar. Reemplaza a la tarjeta
   de pack con panel flotante, que se leia como una fila mas del catalogo.

   Los combos se venden a precio de lista en los tres segmentos -- la tienda
   no los publica con precio mayorista ni distribuidor -- asi que no se
   filtran por segmento: es preferible venderlos a lista que esconderlos.

   Las cartas no se mueven con scroll sino con transform: cada una sabe a que
   distancia esta de la del frente, y de eso sale su corrimiento, su escala y
   si se ve. El circulo no tiene punta: despues del ultimo viene el primero. */

/* Cinco colores de la familia de la marca, todos con texto blanco por arriba
   de 4,5:1: fucsia 4,72 · verde 4,90 · terracota 5,18 · fucsia hondo 6,59 ·
   verde hondo 7,81. El dorado quedo afuera: con blanco da 1,96. */
const COLORES_COMBO = ['#E01560', '#14823C', '#C2410C', '#B70F4D', '#0E5F2B'];

const ICONO_CORAZON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.4-4.5-9.5-9C1.1 8.3 2.8 4.9 6.2 4.6c2.1-.2 3.9 1 5.8 3.2 1.9-2.2 3.7-3.4 5.8-3.2 3.4.3 5.1 3.7 3.7 6.7-2.1 4.5-9.5 9-9.5 9z"/></svg>';
const ICONO_COMPARTIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/></svg>';

/* Los nombres llegan de la tienda en vivo: se escapan antes de ir al HTML. */
const escCombo = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const idCombo = p => p.ids.minorista || p.ids.mayorista || p.ids.distribuidor;
function vendidosDe(p){ return parseInt(String(p.vend || '').replace(/\D/g, ''), 10) || 0; }

const cf = {items: [], cartas: [], activo: 0};

let favoritos = new Set();
try {
  favoritos = new Set(JSON.parse(localStorage.getItem('habitad:favoritos') || '[]').map(String));
} catch (e) { /* sin almacenamiento: los favoritos duran la visita */ }

/* Primero lo que se puede comprar, despues lo que tiene reseñas y ventas, y
   al final el nombre. El alfabetico ponia al frente lo que empezaba con "A".
   Lo usan el carrusel de combos, el catalogo y las sugerencias. */
function ordenDestacados(a, b){
  return (conStock(b) - conStock(a)) ||
    (((b.rat && b.rat.n) || 0) - ((a.rat && a.rat.n) || 0)) ||
    (vendidosDe(b) - vendidosDe(a)) ||
    a.n.localeCompare(b.n, 'es');
}

function cartaCombo(p, i, total){
  const sinStock = !conStock(p);
  const conOpciones = !!(p.vars && p.vars.length > 1);
  const nombre = nombrePack(p.n);
  const clave = 'combo-' + idCombo(p);
  /* En el circulo el ultimo es vecino del primero: si le toca el mismo color,
     se corre al tercero de la paleta. */
  const nc = COLORES_COMBO.length;
  const color = COLORES_COMBO[(total > 1 && i === total - 1 && i % nc === 0) ? 2 : i % nc];

  const el = document.createElement('div');
  el.className = 'cf-carta';
  el.style.setProperty('--cf-color', color);
  el.setAttribute('role', 'group');
  el.setAttribute('aria-roledescription', 'combo');
  el.setAttribute('aria-label', (i + 1) + ' de ' + total + ': ' + nombre);
  el.innerHTML =
    '<div class="cf-arriba">' +
      '<button type="button" class="cf-ico cf-fav" aria-pressed="' +
        favoritos.has(String(idCombo(p))) + '" aria-label="Guardar en favoritos">' +
        ICONO_CORAZON + '</button>' +
      (sinStock ? '<span class="cf-estado">Sin stock</span>' : '') +
      '<button type="button" class="cf-ico cf-compartir" aria-label="Compartir este combo">' +
        ICONO_COMPARTIR + '</button>' +
    '</div>' +
    '<button type="button" class="cf-foto" aria-label="Ver detalles de ' + escCombo(nombre) + '">' +
      (p.img ? '<img data-src="' + escCombo(p.img) + '" alt="" decoding="async" draggable="false">'
             : '<span class="cf-sin-foto" aria-hidden="true">🌿</span>') +
      (nubea ? nubea.stickersHtml(p) : '') +
    '</button>' +
    '<div class="cf-pie">' +
      '<h3 class="cf-nombre">' + escCombo(nombre) + '</h3>' +
      '<b class="cf-precio">' + ars(precioDe(p)) + '</b>' +
    '</div>' +
    '<button type="button" class="cf-agregar"' + (sinStock ? ' disabled' : '') + '>' +
      (sinStock ? 'Sin stock' : conOpciones ? 'Elegir opción' : 'Agregar al carrito') +
    '</button>';

  const abrir = () => abrirVista(p, clave);
  el.querySelector('.cf-foto').addEventListener('click', abrir);
  el.querySelector('.cf-nombre').addEventListener('click', abrir);
  const boton = el.querySelector('.cf-agregar');
  // Un combo con opciones abre la ficha: ahi se elige cual.
  if (!sinStock) boton.addEventListener('click', () =>
    conOpciones ? abrir() : agregar(p, clave, 1, boton));
  el.querySelector('.cf-fav').addEventListener('click', e => alternarFavorito(p, e.currentTarget));
  el.querySelector('.cf-compartir').addEventListener('click', () => compartirCombo(p));

  /* Una carta de costado no se usa: primero se trae al frente. Va en captura
     para que el clic no llegue a los botones de adentro. */
  el.addEventListener('click', e => {
    const pos = cf.cartas.indexOf(el);
    if (pos === cf.activo) return;
    e.preventDefault();
    e.stopPropagation();
    irACombo(pos);
  }, true);
  return el;
}

function alternarFavorito(p, boton){
  const id = String(idCombo(p));
  const ahora = !favoritos.has(id);
  if (ahora) favoritos.add(id); else favoritos.delete(id);
  try { localStorage.setItem('habitad:favoritos', JSON.stringify([...favoritos])); } catch (e) {}
  boton.setAttribute('aria-pressed', String(ahora));
  avisoCombo(ahora ? 'Guardado en favoritos' : 'Quitado de favoritos');
  if (ahora) track('add_to_wishlist', {item_name: p.n, value: precioDe(p),
                                       items: itemsGA([{prod: p, cant: 1}])});
}

/* Compartir: la hoja nativa del telefono si existe -- WhatsApp, Instagram, lo
   que el cliente tenga --, y si no, el link al portapapeles. Se comparte la
   ficha del combo en la tienda; si el catalogo vivo todavia no trajo la
   direccion, se comparte esta pagina con el ancla del carrusel. */
async function compartirCombo(p){
  const u = p.urls && (p.urls.minorista || p.urls.mayorista || p.urls.distribuidor);
  const url = u || (location.origin + location.pathname + '#combos');
  const nombre = nombrePack(p.n);
  const medir = metodo => track('share', {method: metodo, content_type: 'combo',
                                          item_id: String(idCombo(p)), item_name: p.n});
  if (navigator.share){
    try {
      await navigator.share({title: nombre, text: nombre + ' · Habitad Natural', url});
      medir('hoja_nativa');
    } catch (e) { /* lo cerro sin compartir */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    avisoCombo('Link copiado');
    medir('copiar_link');
  } catch (e) {
    window.open('https://wa.me/?text=' + encodeURIComponent(nombre + ' ' + url), '_blank', 'noopener');
    medir('whatsapp');
  }
}

let relojAvisoCombo = 0;
function avisoCombo(texto){
  const a = $('#cfAviso');
  if (!a) return;
  a.textContent = texto;
  a.classList.add('on');
  clearTimeout(relojAvisoCombo);
  relojAvisoCombo = setTimeout(() => a.classList.remove('on'), 1800);
}

/* Distancia de una carta a la del frente, por el lado mas corto del circulo.
   Con tres o menos no hay circulo: van en fila. */
function distanciaCombo(i){
  const n = cf.cartas.length;
  let d = i - cf.activo;
  if (n > 3){
    if (d > n / 2) d -= n;
    else if (d < -n / 2) d += n;
  }
  return d;
}

function ubicarCombos(){
  const escena = $('#cfEscena');
  if (!escena) return;
  if (!cf.cartas.length){ escena.style.height = ''; return; }
  /* Medidas tomadas de la referencia: la vecina corrida dos tercios de carta
     y al 84%, la de mas afuera a una carta y un decimo y al 70%. En celular
     solo se asoman las vecinas. */
  const angosto = escena.clientWidth < 700;
  const PASO = angosto ? [0, .7] : [0, .66, 1.1];
  const ESCALA = angosto ? [1, .82] : [1, .84, .7];
  const ancho = cf.cartas[0].offsetWidth || 300;
  cf.cartas.forEach((carta, i) => {
    const d = distanciaCombo(i), a = Math.abs(d), lado = Math.sign(d);
    const visible = a < PASO.length;
    const paso = visible ? PASO[a] : PASO[PASO.length - 1] + .35;
    const escala = visible ? ESCALA[a] : ESCALA[ESCALA.length - 1] * .9;
    carta.style.transform = 'translateX(' + (lado * paso * ancho).toFixed(1) + 'px) scale(' + escala + ')';
    carta.style.zIndex = String(20 - Math.min(a, 19));
    carta.classList.toggle('cf-carta--frente', d === 0);
    carta.classList.toggle('cf-carta--fuera', !visible);
    carta.setAttribute('aria-hidden', String(d !== 0));
    carta.querySelectorAll('button').forEach(b => { b.tabIndex = d === 0 ? 0 : -1; });
    // La foto se pide recien cuando la carta esta por asomarse.
    if (a <= PASO.length){
      const img = carta.querySelector('img[data-src]');
      if (img){ img.src = img.dataset.src; img.removeAttribute('data-src'); }
    }
  });
  escena.style.height = (cf.cartas[cf.activo].offsetHeight + 52) + 'px';
  const cuenta = $('#cfCuenta');
  if (cuenta) cuenta.textContent = 'Combo ' + (cf.activo + 1) + ' de ' + cf.cartas.length;
}

function irACombo(i){
  const n = cf.cartas.length;
  if (!n) return;
  cf.activo = ((i % n) + n) % n;
  ubicarCombos();
}

function pintarPacks(){
  const pista = $('#packs');
  if (!pista) return;
  const items = PRODUCTOS.filter(p => p.necs.includes('packs')).sort(ordenDestacados);
  const aPrecioDeLista = segmento !== 'minorista' && !items.some(p => hayEn(p, segmento));
  const sub = pista.closest('.bloque').querySelector('.sub');
  /* El combo que estaba al frente sigue al frente: al cambiar de segmento o al
     llegar datos nuevos de la tienda, el cliente no pierde por donde iba. */
  const alFrente = cf.items[cf.activo];
  const idAntes = alFrente ? idCombo(alFrente) : null;

  cf.items = items;
  pista.classList.add('cf-quieta');
  pista.innerHTML = '';
  if (!items.length){
    cf.cartas = [];
    pista.innerHTML = '<div class="vacio"><strong>No hay combos publicados</strong>' +
      'La tienda no tiene combos a la venta en este momento.</div>';
    if (sub) sub.textContent = '';
    ubicarCombos();
    return;
  }
  cf.cartas = items.map((p, i) => cartaCombo(p, i, items.length));
  cf.cartas.forEach(c => pista.appendChild(c));
  const donde = idAntes == null ? -1 : items.findIndex(p => idCombo(p) === idAntes);
  cf.activo = donde >= 0 ? donde : 0;
  ubicarCombos();
  // Se ubican sin transicion; de ahi en adelante, con.
  void pista.offsetHeight;
  requestAnimationFrame(() => pista.classList.remove('cf-quieta'));

  if (sub) sub.textContent = items.length +
    ' combinaciones armadas, a menor precio que comprándolas por separado.' +
    (aPrecioDeLista ? ' Los combos van a precio de lista: no tienen precio ' +
      SEGMENTOS[segmento].label.toLowerCase() + ' publicado.' : '');
}

document.querySelectorAll('[data-cf]').forEach(b =>
  b.addEventListener('click', () => irACombo(cf.activo + Number(b.dataset.cf))));
{
  const escena = $('#cfEscena');
  if (escena){
    escena.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      irACombo(cf.activo + (e.key === 'ArrowRight' ? 1 : -1));
    });
    /* Deslizar, con el dedo o arrastrando el mouse. Solo cuenta el gesto
       horizontal: el vertical sigue siendo el scroll de la pagina
       (touch-action: pan-y en el CSS). */
    let x0 = null, y0 = 0, arrastre = false;
    escena.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      x0 = e.clientX; y0 = e.clientY; arrastre = false;
    });
    escena.addEventListener('pointermove', e => {
      if (x0 === null || arrastre) return;
      const dx = Math.abs(e.clientX - x0), dy = Math.abs(e.clientY - y0);
      if (dx > 10 && dx > dy) arrastre = true;
    });
    escena.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (arrastre && Math.abs(dx) > 40) irACombo(cf.activo + (dx < 0 ? 1 : -1));
    });
    escena.addEventListener('pointercancel', () => { x0 = null; arrastre = false; });
    // Soltar un arrastre encima de una carta no es un clic sobre ella.
    escena.addEventListener('click', e => {
      if (!arrastre) return;
      e.preventDefault();
      e.stopPropagation();
      arrastre = false;
    }, true);
  }
}
/* Se reubica cuando cambia el ancho del carrusel, no cuando cambia la ventana.
   Con resize se media antes de tiempo: la landing ajusta su propio ancho unos
   milisegundos despues del evento (aTodoElAncho, en el cargador de la tienda),
   y al girar el telefono el carrusel quedaba calculado para el ancho anterior.
   Solo cuenta el ancho: la altura la cambia ubicarCombos, y reaccionar a eso
   seria un bucle. */
{
  const escena = $('#cfEscena');
  if (escena && 'ResizeObserver' in window){
    let anchoVisto = 0;
    new ResizeObserver(entradas => {
      const ancho = Math.round(entradas[0].contentRect.width);
      if (ancho === anchoVisto) return;
      anchoVisto = ancho;
      ubicarCombos();
    }).observe(escena);
  } else {
    window.addEventListener('resize', () => setTimeout(ubicarCombos, 200));
  }
}

/* ---- Flechas del catálogo ----
   Avanzan una pantalla completa, o sea las 4 columnas visibles. */
const pistaCat = $('#grilla');
const flechaCatIzq = $('[data-cat="-1"]');
const flechaCatDer = $('[data-cat="1"]');
const pistaCatAyuda = $('[data-cat-pista]');

/* En celular las flechas estan, pero flotando sobre el carrusel: el gesto que
   manda sigue siendo el dedo. Por eso el texto de ayuda y el amague se guian
   por esto y no por si las flechas se ven -- antes miraban su `display`, que
   ahora es visible en los dos casos. El 700 es el mismo corte del CSS. */
const catEnCelular = () => matchMedia('(max-width:700px)').matches;

function actualizarFlechasCat(){
  if (!pistaCat) return;
  const tope = pistaCat.scrollWidth - pistaCat.clientWidth - 2;
  const desborda = pistaCat.scrollWidth > pistaCat.clientWidth + 4;
  if (flechaCatIzq) flechaCatIzq.disabled = pistaCat.scrollLeft <= 2;
  if (flechaCatDer) flechaCatDer.disabled = pistaCat.scrollLeft >= tope;
  if (pistaCatAyuda){
    const conFlechas = flechaCatDer && !catEnCelular();
    pistaCatAyuda.textContent = !desborda ? ''
      : (conFlechas ? 'Usá las flechas para ver el resto' : 'Deslizá para ver más');
  }
  actualizarDeslizar(desborda, pistaCat.scrollLeft >= tope);
}

document.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
  pistaCat.scrollBy({left: pistaCat.clientWidth * Number(b.dataset.cat),
                     behavior: 'smooth'});
  requestAnimationFrame(actualizarFlechasCat);
}));
/* Al deslizar se actualiza una vez por cuadro, no en cada evento de scroll. */
var marcoCat = 0;
if (pistaCat) pistaCat.addEventListener('scroll', () => {
  if (!marcoCat) marcoCat = requestAnimationFrame(() => { marcoCat = 0; actualizarFlechasCat(); });
}, {passive:true});
window.addEventListener('resize', actualizarFlechasCat);

/* ══ CATÁLOGO EN CELULAR · hacia donde seguir ══
   Sin flechas (celular), el boton de arriba dice "Deslizá para ver más" y
   adelanta una columna; al final dice "Volver al principio". Abajo, la barra
   y "1–2 de 151 productos". Los dos se esconden si la grilla entra entera --
   una busqueda con dos resultados -- y en escritorio no se ven: ahi estan las
   flechas. var y no const: actualizarFlechasCat() puede correr antes. */
var catDeslizar = $('#catDeslizar');
var catProgreso = $('#catProgreso');

// Cuanto avanza una columna, y cuantas tarjetas lleva cada una.
function columnaCat(){
  const cartas = pistaCat.querySelectorAll('.card');
  const primera = cartas[0];
  const gap = parseFloat(getComputedStyle(pistaCat).columnGap) || 0;
  return {
    cartas,
    paso: primera ? primera.offsetWidth + gap : pistaCat.clientWidth,
    porColumna: cartas[1] && cartas[1].offsetLeft === primera.offsetLeft ? 2 : 1
  };
}

function actualizarDeslizar(desborda, alFinal){
  if (!catDeslizar || !catProgreso || !pistaCat) return;
  catDeslizar.hidden = catProgreso.hidden = !desborda;
  if (!desborda) return;
  catDeslizar.classList.toggle('cat-deslizar--fin', alFinal);
  catDeslizar.querySelector('.cat-deslizar__texto').textContent =
    alFinal ? 'Volver al principio' : 'Deslizá para ver más';
  catDeslizar.querySelector('.cat-deslizar__flecha').textContent = alFinal ? '←' : '→';

  const ancho = pistaCat.scrollWidth;
  const relleno = $('#catProgresoRelleno');
  relleno.style.width = Math.max(8, pistaCat.clientWidth / ancho * 100) + '%';
  relleno.style.left = Math.min(100, pistaCat.scrollLeft / ancho * 100) + '%';

  const {cartas, paso, porColumna} = columnaCat();
  const total = cartas.length;
  const columnas = Math.ceil(total / porColumna);
  const col = alFinal ? columnas - 1 : Math.min(columnas - 1, Math.round(pistaCat.scrollLeft / paso));
  const desde = col * porColumna + 1, hasta = Math.min(total, (col + 1) * porColumna);
  const texto = (desde === hasta ? desde : desde + '–' + hasta) + ' de ' + total +
    (total === 1 ? ' producto' : ' productos');
  const p = $('#catProgresoTexto');
  if (p.textContent !== texto) p.textContent = texto;
}

if (catDeslizar) catDeslizar.onclick = () => {
  const tope = pistaCat.scrollWidth - pistaCat.clientWidth - 2;
  const alFinal = pistaCat.scrollLeft >= tope;
  if (alFinal) pistaCat.scrollTo({left: 0, behavior: 'smooth'});
  else pistaCat.scrollBy({left: columnaCat().paso, behavior: 'smooth'});
  track('catalogo_boton_deslizar', {al_final: alFinal});
};

/* El amague: la primera vez que el catalogo entra en pantalla en un celular,
   la grilla se corre un poco hacia el costado y vuelve, para que se vea que
   se desliza antes de tocarla. Una sola vez, y nada si el cliente ya la movio,
   si la toca durante el amague o si pidio menos movimiento. */
(function amagueCatalogo(){
  if (!pistaCat || !('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tocada = false;
  ['pointerdown', 'touchstart', 'wheel'].forEach(ev =>
    pistaCat.addEventListener(ev, () => { tocada = true; }, {passive: true, once: true}));
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    const sinFlechas = catEnCelular();
    const desborda = pistaCat.scrollWidth > pistaCat.clientWidth + 4;
    if (!sinFlechas || !desborda || tocada || pistaCat.scrollLeft > 4) return;
    obs.disconnect();
    const snap = pistaCat.style.scrollSnapType;
    pistaCat.style.scrollSnapType = 'none';     // si no, el iman lo devuelve antes de verse
    pistaCat.scrollTo({left: Math.round(columnaCat().paso * 0.28), behavior: 'smooth'});
    setTimeout(() => {
      if (!tocada) pistaCat.scrollTo({left: 0, behavior: 'smooth'});
      setTimeout(() => { pistaCat.style.scrollSnapType = snap; }, 600);
    }, 700);
  }, {threshold: 0.55});
  obs.observe(pistaCat);
})();

/* ---- 8 · agregar al carrito ---- */
/* `seg` solo se pasa desde el selector de productos minoristas del cambio 3;
   el resto de la pagina agrega con el segmento que se esta mirando. */
/* ══════════ CONTADORES ══════════
   Cuatro en la pagina -- tarjeta, pack, ficha y carrito -- y un solo motor.
   El numero se puede escribir: un mayorista que necesita 40 unidades no va a
   apretar el mas cuarenta veces.

   Mientras se escribe NO se corrige el valor. Si al borrar el "1" de "12" el
   campo se autocompletara a 1, seria imposible escribir "25": el corte va
   recien al salir del campo o al apretar Enter. */
const TOPE_UNIDADES = 999;

function armarContador(caja, alCambiar, opciones){
  const o = opciones || {};
  const campo = caja.querySelector('.qty-campo');
  if (!campo) return null;

  const acotar = v => Math.max(1, Math.min(TOPE_UNIDADES, Math.floor(+v) || 1));
  const fijar = v => {
    const n = Math.floor(+v);
    // Bajar de uno saca el producto, donde eso tenga sentido.
    if (n < 1 && o.alBajarDeUno) return o.alBajarDeUno();
    campo.value = acotar(n);
    if (alCambiar) alCambiar(+campo.value);
  };

  caja.querySelectorAll('[data-d]').forEach(b =>
    b.onclick = () => fijar(+campo.value + (+b.dataset.d)));

  campo.addEventListener('input', () => {
    campo.value = campo.value.replace(/\D/g, '').slice(0, 3);
    if (campo.value && alCambiar) alCambiar(+campo.value);
  });
  campo.addEventListener('blur', () => fijar(campo.value));
  campo.addEventListener('keydown', e => {
    if (e.key === 'Enter'){ e.preventDefault(); fijar(campo.value); campo.blur(); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); fijar(+campo.value + 1); }
    else if (e.key === 'ArrowDown'){ e.preventDefault(); fijar(+campo.value - 1); }
  });
  // Al entrar se selecciona todo: escribir reemplaza en vez de concatenar.
  campo.addEventListener('focus', () => campo.select());

  return {leer: () => acotar(campo.value), fijar};
}

/* El campo, igual en los cuatro. type=text con inputmode numerico y no
   type=number: number trae flechitas propias que chocan con las nuestras y
   en Firefox deja escribir "e" y "-". */
const campoCantidad = (valor, etiqueta) =>
  '<input class="qty-campo" type="text" inputmode="numeric" autocomplete="off" ' +
  'value="' + valor + '" aria-label="' + etiqueta + '">';

function agregar(p, key, cant, boton, seg){
  const donde = seg || segmento;
  carrito[key] = {prod:p, cant:((carrito[key] || {}).cant || 0) + cant,
                  seg: donde, vi: siNula(varElegida.get(p.n), 0)};
  track('add_to_cart', {item_name:p.n, value:precioEn(carrito[key], donde)*cant,
                        segment:donde, items: itemsGA([carrito[key]])});
  if (boton){
    const t = boton.textContent;
    boton.textContent = '✓ Agregado'; boton.classList.add('ok');
    setTimeout(() => { boton.textContent = t; boton.classList.remove('ok'); }, 1400);
  }
  recalcular();
}

/* ---- 7 · vista rápida ---- */
let vista = null;
// Reseñas: se muestran las reales y, cuando no hay, se invita a dejar la
// primera. El botón abre el formulario de Trusty, la app que ya usa la tienda.
function astros(n){
  const ll = Math.round(n);
  return '★'.repeat(ll) + '☆'.repeat(Math.max(0, 5 - ll));
}

/* ══════════ LAS RESEÑAS, EN VIVO ══════════
   Las reseñas horneadas en RESENAS son la base -- salen a la primera pintada,
   sin esperar nada --, pero son una foto del dia que se sincronizo. Estas son
   las de verdad, las mismas que el cliente ve en la ficha de la tienda.

   La API de Nubea es publica y con CORS abierto, asi que anda tambien fuera de
   la tienda. Devuelve `{reviews, total, hasMore, rating:{average, count}}`.

   Se pide una vez por publicacion y queda en memoria: abrir y cerrar la misma
   ficha no vuelve a pedir nada. */
var resenasVivas = (function (){
  const cache = new Map();          // id de publicacion -> {resenas, nota} | null
  const pidiendo = new Map();
  const CUANTAS = 8;

  // Lo que devuelve Nubea, con los nombres que usa la ficha.
  function traducir(r){
    return {
      a: r.customerName || 'Cliente',
      f: String(r.createdAt || '').slice(0, 10),
      r: Number(r.rating) || 0,
      t: r.title || '',
      x: r.body || '',
      img: (Array.isArray(r.images) && r.images.length) ? r.images[0] : null,
      verificada: r.isVerifiedPurchase === true
    };
  }

  function leer(id){ return id ? (cache.get(String(id)) || null) : null; }

  function pedir(id){
    if (!id) return Promise.resolve(null);
    const k = String(id);
    if (cache.has(k)) return Promise.resolve(cache.get(k));
    if (pidiendo.has(k)) return pidiendo.get(k);
    const p = fetch(RESENAS_API + '/' + TIENDA_ID + '/' + k +
                    '?page=1&limit=' + CUANTAS + '&sort=newest')
      .then(r => { if (!r.ok) throw new Error('reseñas: ' + r.status); return r.json(); })
      .then(d => {
        const lista = Array.isArray(d.reviews) ? d.reviews : [];
        /* Solo las aprobadas y con texto o titulo: una calificacion sin
           comentario ya esta contada en el promedio. */
        const resenas = lista
          .filter(r => !r.status || r.status === 'approved')
          .map(traducir)
          .filter(r => r.t || r.x);
        const nota = d.rating && d.rating.count
          ? {avg: Number(d.rating.average) || 0, n: Number(d.rating.count) || 0}
          : null;
        const dato = {resenas, nota, total: Number(d.total) || resenas.length};
        cache.set(k, dato);
        return dato;
      })
      .catch(err => {
        if (window.console) console.warn('[reseñas] no se pudieron leer:', err);
        cache.set(k, null);           // no se reintenta en esta visita
        return null;
      })
      .then(d => { pidiendo.delete(k); return d; });
    pidiendo.set(k, p);
    return p;
  }

  return {leer, pedir};
})();

function pintarResenas(p){
  const caja = $('#mvResenas');
  const idPub = p.ids.minorista || p.ids.mayorista || p.ids.distribuidor;
  const vivo = resenasVivas.leer(idPub);

  /* Lo que escriben los clientes va escapado siempre. Con las reseñas
     horneadas daba igual -- las escribimos nosotros --, pero estas vienen de
     afuera y entran por innerHTML. */
  const nota = (vivo && vivo.nota) || p.rat || null;
  const lista = (vivo && vivo.resenas && vivo.resenas.length) ? vivo.resenas
              : (p.revs && p.revs.length ? p.revs : []);

  let html = '';
  if (nota){
    html += '<div class="resumen-resenas"><div><div class="nota-grande">' +
      nota.avg.toFixed(1) + '</div><span class="astros">' + astros(nota.avg) +
      '</span></div><small>Basado en ' + nota.n + ' calificaci' + (nota.n > 1 ? 'ones' : 'ón') + '</small></div>';
  }
  if (lista.length){
    html += lista.map(r =>
      '<article class="resena"><div class="resena__cab">' +
        '<span class="resena__autor">' + escCombo(r.a) + '</span>' +
        '<span class="resena__fecha">' + escCombo(r.f) + '</span>' +
        (r.verificada === false ? '' :
          '<span class="resena__verificada">Compra verificada</span>') + '</div>' +
      '<div class="resena__astros">' + astros(r.r) + '</div>' +
      (r.t ? '<p class="resena__titulo">' + escCombo(r.t) + '</p>' : '') +
      '<p class="resena__texto">' + escCombo(r.x) + '</p></article>').join('');
  } else if (nota){
    html += '<p class="resenas-vacio">Tiene ' + nota.n + ' calificaci' +
      (nota.n > 1 ? 'ones' : 'ón') + ' con estrellas, pero todavía nadie dejó su ' +
      'comentario. Si lo compraste, contá cómo te fue.</p>';
  } else {
    html += '<p class="resenas-vacio">Todavía no tiene reseñas. Si lo compraste, ' +
      'sé el primero en opinar.</p>';
  }
  caja.innerHTML = html;

  /* Escribir una reseña se hace en la ficha de la tienda: ahi corre el widget
     de Nubea, que necesita LS.product o el formulario de producto del theme, y
     en /catalogos no existe ninguno de los dos.

     El boton esta SIEMPRE. Es lo unico que el cliente puede hacer desde este
     bloque, y esconderlo dejaba las resenas como un cartel muerto. Con mango
     vamos derecho a su ficha; sin mango -- 4 de 145 publicaciones -- lo
     dejamos en el buscador de la tienda con el nombre ya escrito, que es lo
     mas cerca que podemos dejarlo.

     El #opiniones no es un ancla del theme: lo lee el guardia de ruta de esta
     misma landing, que corre en todas las paginas de la tienda, para despertar
     al widget de Nubea y bajar hasta el formulario. */
  const escribir = $('#mvEscribir');
  const mango = mangoDeProducto(p);
  const tienda = catalogoVivo.enTienda ? '' : 'https://www.habitadnatural.com';
  const aEscribir = mango
    ? tienda + '/productos/' + encodeURIComponent(mango) + '/#opiniones'
    : tienda + '/search/?q=' + encodeURIComponent(p.n);
  escribir.hidden = false;
  escribir.textContent = lista.length ? 'Escribir mi reseña' : 'Ser el primero en opinar';
  escribir.onclick = () => {
    window.open(aEscribir, '_blank', 'noopener');
    track('review_start', {product_id: idPub, con_mango: !!mango});
  };

  /* Y si todavia no llegaron las de verdad, se piden y se repinta una sola vez.
     Solo si la ficha sigue abierta en este producto: el cliente pudo haberla
     cerrado o cambiado mientras tanto. */
  if (!vivo){
    resenasVivas.pedir(idPub).then(d => {
      if (d && vista && vista.p === p) pintarResenas(p);
    });
  }
}

/* Las preguntas de la ficha son las mismas del inicio y no cambian con el
   producto, asi que se pintan una sola vez. */
{
  const cajaFaqFicha = $('#mvFaq');
  if (cajaFaqFicha) cajaFaqFicha.innerHTML = PREGUNTAS.map(([q, a]) =>
    '<details><summary>' + q + '</summary><p>' + a + '</p></details>').join('');
}

/* Combos relacionados: los packs que comparten necesidad con este producto.
   Si el que se esta mirando ya es un pack, se muestran los otros. */
function pintarCombos(p){
  const caja = $('#mvCombos'), seccion = $('#mvCombosCaja');
  if (!caja || !seccion) return;
  const combos = PRODUCTOS.filter(c =>
    c.necs.includes('packs') && c.n !== p.n &&
    hayEn(c, segmento) && conStock(c) &&
    c.necs.some(x => x !== 'packs' && p.necs.includes(x)));
  seccion.hidden = !combos.length;
  caja.innerHTML = '';
  combos.slice(0, 4).forEach(c => caja.appendChild(fila(c, 'ficha-combo')));
}

function abrirVista(p, key){
  vista = {p, key};
  llenarVista(p);
  // Cantidad: arranca en 1 en cada apertura.
  cuentaFicha.fijar(1);
  pintarResenas(p);
  pintarCombos(p);
  abrirModal('modal');
  // La direccion pasa a ser la de este producto.
  ponerFichaEnLaDireccion(p);
  /* Al que llega de un anuncio, la ficha de la tienda ya le mando el
     ViewContent de este mismo producto antes del salto -- por eso el salto
     espera. Mandar otro contaria dos veces la misma visita. */
  track('view_item', {item_name:p.n, value:precioDe(p),
                      items: itemsGA([{prod:p, cant:1}]),
                      sinMeta: viewContentYaContado});
  viewContentYaContado = false;
  /* Con la ficha ya a la vista se pide la de la tienda: si el administrador
     cambio la descripcion, las fotos o el precio, se rellena en el lugar. */
  if (catalogoVivo) catalogoVivo.refrescarFicha(p);
}

/* Todo lo que la ficha muestra de un producto. Vive aparte de abrirVista
   porque se vuelve a llamar cuando llegan datos frescos de la tienda con la
   ficha abierta: rellena sin reabrir, sin animar y sin tocar la cantidad. */
function llenarVista(p){
  const pr = precioDe(p), lista = p.pr.minorista;
  const rebaja = (segmento !== 'minorista' && lista && pr && lista > pr)
    ? Math.round((1 - pr / lista) * 100) : 0;

  // Galeria: si el producto tiene varias fotos, se arman las miniaturas.
  const fotos = (p.gal && p.gal.length ? p.gal : [p.img]).filter(Boolean);
  const principal = $('#mvFoto');
  principal.src = fotos[0] || ''; principal.alt = p.n;
  const minis = $('#mvMiniaturas');
  minis.innerHTML = '';
  if (fotos.length > 1){
    fotos.forEach((f, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ficha__mini';
      b.setAttribute('aria-current', i === 0);
      b.setAttribute('aria-label', 'Ver imagen ' + (i + 1));
      b.innerHTML = '<img src="' + f + '" alt="" loading="lazy">';
      b.onclick = () => {
        principal.src = f;
        minis.querySelectorAll('.ficha__mini').forEach(x => x.setAttribute('aria-current', 'false'));
        b.setAttribute('aria-current', 'true');
      };
      minis.appendChild(b);
    });
  }

  // Cintas: el segmento que se esta mirando y la promo de la tienda.
  const cintas = [];
  if (segmento !== 'minorista') cintas.push('Precio ' + SEGMENTOS[segmento].label);
  if (rebaja) cintas.push(rebaja + '% OFF');
  $('#mvCintas').innerHTML = cintas.map(c => '<span class="ficha__cinta">' + c + '</span>').join('');

  $('#mvVendidos').textContent = p.vend ? p.vend.replace(/\s+/g, ' ') : '';
  $('#mv-nom').textContent = p.n;
  $('#mvEstrellas').innerHTML = p.rat
    ? '<span class="astros">' + '\u2605'.repeat(Math.round(p.rat.avg)) +
      '\u2606'.repeat(5 - Math.round(p.rat.avg)) + '</span><b>' + p.rat.avg.toFixed(1) +
      '</b><span class="cuenta">(' + p.rat.n + ' reseña' + (p.rat.n > 1 ? 's' : '') + ')</span>'
    : '<span class="cuenta">Sin reseñas todavía</span>';

  $('#mvLista').textContent = rebaja ? ars(lista) : '';
  $('#mv-precio').textContent = ars(pr);
  $('#mvOff').textContent = rebaja ? rebaja + '% OFF' : '';
  $('#mvTransferencia').textContent =
    ars(pr * (1 - TRANSFERENCIA / 100)) + ' con Transferencia o Depósito Bancario';

  /* Descripciones de hasta 2.600 caracteres: un muro de texto que nadie lee.
     Se muestra el arranque y el resto se despliega.

     El tope subio de 480 a 700 cuando la descripcion paso a la columna de la
     izquierda: ahi tiene el alto de toda la columna de compra para llenar, y
     con 480 quedaba corta. En celular no molesta, porque cae despues del boton
     de compra y no lo empuja. */
  const carac = $('#mv-carac');
  const texto = p.d || 'Sin descripción cargada para este producto.';
  const abrir = $('#mvVerDesc');
  const TOPE = 700;
  if (texto.length > TOPE){
    const corte = texto.lastIndexOf(' ', TOPE);
    carac.dataset.corto = texto.slice(0, corte > 200 ? corte : TOPE) + '…';
    carac.dataset.largo = texto;
    carac.textContent = carac.dataset.corto;
    abrir.hidden = false;
    abrir.textContent = 'Ver descripción completa';
    abrir.setAttribute('aria-expanded', 'false');
  } else {
    carac.textContent = texto;
    abrir.hidden = true;
  }
  $('#mv-ideal').textContent = p.necs.map(x => (NECESIDADES.find(n => n.id === x) || {}).label).join(' · ');
  $('#mv-pres').textContent = p.vars ? p.vars.length + ' variantes disponibles' : '\u2014';
  $('#mv-uso').textContent = 'Según indicaciones del producto.';


  /* Plazos de envio. OJO: los numeros del diseño de referencia ("3 a 5 dias
     habiles", "despacho en 24 hs") son de otra tienda. La pagina de envios de
     Habitad dice que el plazo se ve al elegir el correo y no promete un tiempo
     de despacho, asi que aca va lo unico verificable. Cuando el cliente
     confirme los suyos se cambian estas dos lineas y listo. */
  $('#mvEnvioPlazo').textContent = 'Plazo estimado al elegir el correo';
  $('#mvEnvioDespacho').textContent = 'Elaboración y armado propios';

  /* Envio gratis: lo tienen los tres segmentos, con montos distintos. Hasta
     el 25/09/2026 esta linea solo se le mostraba al minorista, porque se creia
     que era el unico; la promocion 806521 dice lo contrario. */
  const envio = $('#mvEnvio');
  envio.hidden = false;
  envio.textContent = 'Envío gratis en compras superiores a ' + ars(umbralEnvioDe(segmento));

  /* Sin stock no se compra. La ficha no lo estaba apagando: se podia cargar
     al carrito y recien fallaba del otro lado, en el carrito de Tiendanube,
     que es el peor lugar para enterarse. */
  const hayStock = conStock(p);
  const agregarBtn = $('#mv-add');
  agregarBtn.disabled = !hayStock;
  agregarBtn.textContent = hayStock ? 'Agregar al carrito' : 'Sin stock';
  $('#mvQty').hidden = !hayStock;

  /* "Comprar ahora" lleva ESTE producto al carrito y va a finalizar. Con un
     minimo de $100.000 o $250.000 encima, un producto suelto nunca alcanza:
     el boton llevaria a un carrito bloqueado. Es solo para minorista, y
     tampoco tiene sentido sin stock. */
  $('#mvRapida').hidden = segmento !== 'minorista' || !hayStock;
  if (nubea) nubea.llenarFicha(p);
}

$('#mvVerDesc').onclick = e => {
  const carac = $('#mv-carac'), b = e.currentTarget;
  const abierto = b.getAttribute('aria-expanded') === 'true';
  carac.textContent = abierto ? carac.dataset.corto : carac.dataset.largo;
  b.textContent = abierto ? 'Ver descripción completa' : 'Ver menos';
  b.setAttribute('aria-expanded', String(!abierto));
};

/* El contador de la ficha se arma una sola vez: el popup no se vuelve a
   crear, solo se le cambia el contenido. */
const cuentaFicha = armarContador($('#mvQty'));

$('#modalCerrar').onclick = () => cerrarModal('modal');
$('#modal').onclick = e => { if (e.target.id === 'modal') cerrarModal('modal'); };
addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal('modal'); });
$('#mv-add').onclick = () => {
  if (!vista) return;
  const cant = cuentaFicha.leer();
  agregar(vista.p, vista.key, cant, $('#mv-add'));
  setTimeout(() => cerrarModal('modal'), 700);
};

/* ---- 13 · packs ---- */
// (los packs se pintan como cualquier otra necesidad del catalogo)

/* ---- 9 y 10 · timeline de varios hitos ---- */
const etiqueta = t => '<b>' + ars(t.min) + '</b>' + t.nombre +
  (t.pendiente ? ' <span class="pendiente">a confirmar</span>' : '');

function pintarHitos(){
  const pista = $('#tl-pista');
  pista.querySelectorAll('.tl-hito').forEach(h => h.remove());
  const max = TIERS[TIERS.length-1].min;
  TIERS.forEach((t, i) => {
    const h = document.createElement('div');
    /* El primero y el ultimo se marcan porque sus etiquetas van centradas
       sobre el punto y, en los extremos, la mitad queda fuera de pantalla.
       Esos dos se alinean contra su borde. */
    h.className = 'tl-hito';
    h.dataset.min = t.min;
    h.style.left = (t.min / max * 100) + '%';
    h.innerHTML = '<div class="tl-punto">✓</div><div class="tl-lbl">' + etiqueta(t) + '</div>';
    pista.appendChild(h);
  });
  /* La misma escalera, en fila. Es la que se ve: las etiquetas colgadas de
     cada punto estan apagadas dentro de la barra. */
  const fila = $('#tlEtiquetas');
  if (fila){
    fila.innerHTML = TIERS.map(t => '<span>' + etiqueta(t) + '</span>').join('');
    // Cuantas columnas y con que cuerpo: lo resuelve el CSS con estos dos.
    fila.style.setProperty('--hitos', TIERS.length);
    fila.dataset.hitos = TIERS.length;
  }
}
pintarHitos();

let logradosPrevios = 0, festejoTimer = null;

/* 10 · Mensaje dinamico segun cuanto falta para el proximo beneficio.
   Vive dentro de la barra fija, que es el unico lugar donde se muestra. */
function mensajeProgreso(subtotal, falta, proximo, pct){
  const msg = $('#bfMsg');
  msg.classList.remove('festejo');
  if (!proximo){
    msg.textContent = '¡Desbloqueaste todos los beneficios!';
  } else {
    /* Para el envio gratis va el texto que el cliente escribio en Nubea. Solo
       en minorista: la barra de Nubea es la promocion de $60.000 y su texto
       habla de ese umbral, no del de $150.000 del mayorista. */
    const deNubea = proximo.nombre === 'Envío gratis' && segmento === 'minorista' &&
                    nubea && nubea.textoEnvio('falta', falta);
    if (deNubea) msg.textContent = deNubea;
    else msg.innerHTML = (falta < 12000 ? '¡Ya estás cerca! ' : '') +
      'Te faltan <b>' + ars(falta) + '</b> para ' + proximo.nombre.toUpperCase();
    track('reward_progress', {subtotal, next_tier:proximo.nombre, missing:falta});
  }
}

/* Cada segmento tiene su propia escalera y no se cruzan: el minorista corre
   la suya y el mayorista y el distribuidor la de ellos. No hay ascenso
   automatico -- se saco a pedido -- porque el umbral en precios de lista no
   equivale al minimo del segmento de destino y dejaba al cliente por debajo
   del minimo apenas lo cruzaba. */
function recalcular(){
  guardarCarrito();   // todo cambio del carrito termina aca
  const subtotal = totalCarrito();
  const unidades = Object.values(carrito).reduce((a,i) => a + i.cant, 0);
  const lineas = Object.keys(carrito).length;

  const logrados = TIERS.filter(t => t.min <= subtotal);
  const proximo  = TIERS.find(t => t.min > subtotal);

  // El progreso se mide POR TRAMO: del hito anterior al proximo, no desde cero.
  let pct, falta = 0;
  if (!proximo){ pct = 100; }
  else {
    const base = logrados.length ? logrados[logrados.length-1].min : 0;
    pct = (subtotal - base) / (proximo.min - base) * 100;
    falta = proximo.min - subtotal;
  }
  const pctAbsoluto = Math.min(100, subtotal / TIERS[TIERS.length-1].min * 100);
  $('#tl-fill').style.width = pctAbsoluto + '%';

  document.querySelectorAll('.tl-hito').forEach(h => {
    const min = +h.dataset.min;
    h.classList.toggle('logrado', min <= subtotal);
    h.classList.toggle('proximo', proximo && min === proximo.min);
  });

  $('#bfCant').textContent = unidades;
  $('#bfMonto').textContent = ars(subtotal);
  // La barra aparece recien cuando el carrito tiene algo.
  $('#barraFija').classList.toggle('visible', subtotal > 0);
  apartarPie();

  // Celebrar el desbloqueo ANTES de empujar al proximo objetivo: si se salta
  // directo al siguiente, el cliente nunca se entera de que gano algo.
  const reciente = logrados.length > logradosPrevios;
  logradosPrevios = logrados.length;
  if (reciente){
    const t = logrados[logrados.length-1];
    const msg = $('#bfMsg');
    msg.textContent = (t.nombre === 'Envío gratis' && segmento === 'minorista' &&
                       nubea && nubea.textoEnvio('logrado')) ||
                      '¡' + t.nombre.toUpperCase() + ' DESBLOQUEADO!';
    msg.classList.add('festejo');
    track('reward_unlocked', {tier_name:t.nombre, subtotal});
    clearTimeout(festejoTimer);
    festejoTimer = setTimeout(() => mensajeProgreso(subtotal, falta, proximo, pct), 2600);
  } else if (subtotal > 0){
    mensajeProgreso(subtotal, falta, proximo, pct);
  } else {
    /* Carrito en cero: la barra vuelve a foja cero de una. Si no, quedaba
       colgado el mensaje del segmento anterior ("te faltan $95.000 para
       minimo mayorista") sobre un carrito que ya no existe, y encima el
       festejo podia dispararse 2,6 s despues con datos viejos. */
    clearTimeout(festejoTimer);
    const msg = $('#bfMsg');
    msg.classList.remove('festejo');
    msg.textContent = 'Seguí sumando';
  }

  document.querySelectorAll('.pack').forEach(el => {
    const k = PACKS.find(x => x.nom === el.dataset.pack);
    el.querySelector('.js-pack-precio').textContent = ars(k.precio * SEGMENTOS[segmento].mult);
  });

  sugerir(subtotal, falta, proximo);
}

/* ---- 11 y 12 · sugerencias ---- */
function fila(p, origen){
  const d = document.createElement('div');
  d.className = 'mini';
  d.innerHTML = '<span class="ico">' + (p.img ? '<img src="' + p.img + '" alt="" loading="lazy">' : '') + '</span>' +
    '<div class="txt"><b>' + p.n + '</b><div class="pr">' + ars(precioDe(p)) + '</div></div>' +
    '<button type="button">+ Agregar</button>';
  d.querySelector('button').onclick = e => {
    agregar(p, origen + '-' + p.n, 1, e.target);
    track('cross_sell_add', {item_name:p.n, source:origen, value:precioDe(p),
                             items: itemsGA([{prod:p, cant:1}])});
  };
  return d;
}

function sugerir(subtotal, falta, proximo){
  const enCarrito = new Set(Object.values(carrito).map(i => i.prod.n));
  const m9 = $('#m9');
  if (proximo && subtotal > 0){
    // Ventana del 55% al 150% del faltante. El brief propone 80%, pero con un
    // hito de $60.000 y productos de hasta $18.000 esa ventana queda vacia casi
    // siempre. Bajarla hace que el bloque sirva de verdad.
    const cand = PRODUCTOS.filter(p => hayEn(p, segmento) && conStock(p) && !enCarrito.has(p.n))
      .filter(p => precioDe(p) >= falta*0.55 && precioDe(p) <= falta*1.5)
      .sort(ordenDestacados).slice(0,3);
    if (cand.length){
      $('#m9-tit').textContent = 'Te faltan ' + ars(falta) + ' para ' + proximo.nombre.toLowerCase();
      $('#m9-lista').innerHTML = ''; cand.forEach(p => $('#m9-lista').appendChild(fila(p,'m9')));
      m9.classList.add('on');
    } else m9.classList.remove('on');
  } else m9.classList.remove('on');
  // El cross-sell 'Completa tu rutina' se retiro del inicio: su lugar lo ocupa
  // el muro de resenas, asi que ese bloque ya no existe.
}

/* ---- Traspaso al carrito de Tiendanube ----------------------------------
   El embudo junta la seleccion y este boton la manda al carrito real. De ahi
   en adelante manda la plataforma: envio, medios de pago y checkout.

   ATENCION para la implementacion real: el subtotal que muestra el embudo lo
   calcula este JavaScript sumando precios, y ese numero NO es necesariamente
   el que va a cobrar Tiendanube. La tienda tiene 5 promociones activas, varias
   por cantidad, que solo se aplican del lado del servidor. Ver el analisis en
   HALLAZGOS.md antes de decidir el modelo definitivo. ---------------------- */
/* El carrito se repinta entero cada vez que cambia algo: es una lista corta y
   asi no hay que sincronizar filas sueltas con el objeto carrito. */
function pintarCarrito(entrando){
  const entradas = Object.entries(carrito);
  const lista = $('#checkoutLista');

  if (!entradas.length){
    lista.innerHTML = '<li class="carrito__vacio">Tu carrito quedó vacío.</li>';
  } else {
    lista.innerHTML = '';
    entradas.forEach(([clave, i]) => {
      const unit = precioItem(i), sub = unit * i.cant;
      // Una linea que entro con otros precios se marca: si no, el cliente ve
      // dos precios distintos para el mismo segmento y no entiende por que.
      const otroSeg = (i.seg || segmento) !== segmento;
      const li = document.createElement('li');
      li.className = 'citem';
      li.innerHTML =
        (i.prod.img ? '<img class="citem__foto" src="' + i.prod.img + '" alt="" loading="lazy">'
                    : '<span class="citem__foto"></span>') +
        '<span class="citem__txt"><span class="citem__nom">' + i.prod.n + '</span>' +
        '<span class="citem__unit">' + ars(unit) + ' c/u' +
        (otroSeg ? ' <span class="citem__seg">precio ' +
                   SEGMENTOS[i.seg].label.toLowerCase() + '</span>' : '') +
        '</span></span>' +
        '<span class="citem__qty"><button type="button" data-d="-1" aria-label="Quitar uno">-</button>' +
        campoCantidad(i.cant, 'Cantidad de ' + i.prod.n) +
        '<button type="button" data-d="1" aria-label="Agregar uno">+</button></span>' +
        '<b class="citem__sub">' + ars(sub) + '</b>' +
        '<button class="citem__quitar" type="button" aria-label="Sacar ' + i.prod.n +
        ' del carrito">\u00d7</button>';

      armarContador(li.querySelector('.citem__qty'), n => {
        carrito[clave].cant = n;
        /* Esta fila se actualiza a mano en vez de repintar la lista entera:
           repintarla destruiria el campo en el que se esta escribiendo y el
           cursor se perderia en la primera tecla. */
        li.querySelector('.citem__sub').textContent = ars(unit * n);
        resumenCarrito();
        recalcular();
      }, {
        // Bajar de uno saca el producto: es lo que espera cualquiera que
        // aprieta el menos con un solo item.
        alBajarDeUno: () => { delete carrito[clave]; pintarCarrito(); recalcular(); }
      });
      li.querySelector('.citem__quitar').onclick = () => {
        track('remove_from_cart', {item_name:i.prod.n});
        const borrar = () => { delete carrito[clave]; pintarCarrito(); recalcular(); };
        // La fila se va antes de desaparecer del objeto: si se borra de una,
        // la lista pega un salto y no se entiende cual se saco.
        if (!ANIM.activo) return borrar();
        // Red: si la salida no termina, el producto nunca se sacaria.
        const fin = pase(borrar, 480);
        anime({targets: li, opacity: 0, translateX: 26, height: 0,
               paddingTop: 0, paddingBottom: 0,
               duration: 260, easing: 'easeInQuad', complete: fin});
      };
      lista.appendChild(li);
    });
    // Las filas entran escalonadas al abrir el carrito.
    if (ANIM.activo && entrando){
      const filas = [...lista.children];
      anime.set(filas, {opacity: 0, translateY: 12});
      anime({targets: filas, opacity: 1, translateY: 0,
             delay: anime.stagger(55, {start: 150}), duration: 380, easing: SALIDA});
      // Red: las filas no pueden quedarse invisibles. Un carrito abierto y en
      // blanco es de las peores cosas que pueden pasar en un paso de compra.
      pase(() => filas.forEach(f => {
        if (getComputedStyle(f).opacity === '0'){
          anime.remove(f);
          f.style.removeProperty('opacity');
          f.style.removeProperty('transform');
        }
      }), 900);
    }
  }

  resumenCarrito();
}

/* El pie del carrito: total, envio, beneficio y el bloqueo por minimo. Vive
   aparte de la lista para poder actualizarlo mientras se escribe una cantidad
   sin volver a dibujar las filas. */
function resumenCarrito(){
  const total = totalCarrito();
  $('#checkoutTotal').textContent = ars(total);

  /* El envio no se inventa: el costo lo calcula Tiendanube en el checkout con
     el codigo postal. Aca solo se dice lo unico que sabemos con certeza, que
     es si el carrito ya paso el umbral de envio gratis de SU segmento.

     Antes, a un mayorista o a un distribuidor esta linea le decia "A cargo del
     comprador". Era falso -- la promocion 806521 les da envio gratis desde
     $150.000 -- y encima era desalentador justo en el paso de pagar. */
  const gratisDesde = umbralEnvioDe(segmento);
  $('#checkoutEnvio').textContent = total >= gratisDesde
    ? '\u00a1Gratis!'
    : 'Se calcula al finalizar';

  const proximo = TIERS.find(t => t.min > total);
  const logrados = TIERS.filter(t => t.min <= total);
  const enumerar = xs => xs.length < 2 ? (xs[0] || '')
    : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];
  $('#checkoutBeneficio').textContent = !total ? ''
    : (logrados.length ? '\u2713 Ten\u00e9s ' + enumerar(logrados.map(t => t.nombre.toLowerCase()))
       : (proximo ? 'Te faltan ' + ars(proximo.min - total) + ' para ' +
          proximo.nombre.toLowerCase() : ''));

  /* Mayorista y distribuidor no pueden comprar por debajo de su minimo: la
     tienda no se lo va a aceptar. Dejar el boton habilitado lo mandaba a un
     checkout que lo iba a rechazar, que es la peor forma de enterarse. */
  /* Lo que el cliente ya paso al carrito de la tienda cuenta: la tienda mide
     el minimo con todo junto. Sin esto, un mayorista que habia pasado
     $150.000 y volvia por un producto mas quedaba frenado con "te faltan
     $95.000". */
  const enTienda = carritoTienda ? carritoTienda.pesos() : 0;
  const falta = faltaPara(segmento, total + enTienda);
  const bloqueo = $('#checkoutBloqueo');
  bloqueo.hidden = !total || !falta;
  if (!bloqueo.hidden){
    bloqueo.textContent = 'Para poder realizar la compra tenés que cumplir el mínimo ' +
      SEGMENTOS[segmento].label.toLowerCase() + ' de ' + ars(MINIMOS[segmento]) +
      '. Te faltan ' + ars(falta) + '.' +
      (enTienda ? ' Ya cuenta lo que tenés en el carrito de la tienda: ' + ars(enTienda) + '.' : '');
  } else if (total && enTienda && total < MINIMOS[segmento]){
    $('#checkoutBeneficio').textContent = '\u2713 Con los ' + ars(enTienda) +
      ' que ya tenés en el carrito de la tienda llegás al mínimo ' +
      SEGMENTOS[segmento].label.toLowerCase() + '.';
  }
  $('#checkoutIr').disabled = !total || !!falta;
}

$('#bfIr').onclick = () => {
  if (!Object.keys(carrito).length) return;
  pintarCarrito(true);
  abrirModal('modalCheckout');
  track('view_cart', {value: totalCarrito(), items: itemsGA(Object.values(carrito))});
};
$('#checkoutSeguir').onclick = () => cerrarModal('modalCheckout');
$('#checkoutCerrar').onclick = () => cerrarModal('modalCheckout');
$('#modalCheckout').onclick = e => { if (e.target.id === 'modalCheckout') cerrarModal('modalCheckout'); };
/* ══════════ BUSCADOR ══════════
   Filtra la grilla en el momento, sobre todo el catalogo del segmento: al
   escribir se suelta la categoria elegida, y al elegir una se borra lo
   escrito. La ficha que se abre es la de ESTA landing, no la del theme.

   Compara sin acentos y por palabras sueltas, asi "aceite almendra" encuentra
   "Aceite de Almendras". Y busca tambien por la necesidad de cada producto y
   por las categorias de la tienda en las que esta: "dolor" o "piel" traen lo
   de esas categorias. */
function claveBusqueda(t){
  return (t || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* Raiz de una palabra, para que el singular y el plural se encuentren. Sin
   esto "geles" no devolvia nada -- ni "cremas", ni "aceites" --, porque en el
   catalogo dice "Gel" y "Crema". Se corta el plural castellano: -es despues
   de consonante ("geles" -> "gel") y -s despues de vocal ("cremas" ->
   "crema"). Tres letras o menos no se tocan: "mas" no es plural de "ma". */
function raizBusqueda(w){
  if (w.length <= 3) return w;
  if (/[^aeiou]es$/.test(w)) return w.slice(0, -2);
  if (/[aeiou]s$/.test(w))   return w.slice(0, -1);
  return w;
}

/* Raices del nombre, de las necesidades y de las categorias de la tienda de
   cada producto. Se guardan, y se rehacen si el catalogo vivo le cambio el
   nombre o si cambiaron sus categorias. */
function raicesDe(p){
  const tienda = categoriasVivas ? categoriasVivas.nombresDe(p) : '';
  const de = p.n + '|' + tienda;
  if (p._raices && p._raicesDe === de) return p._raices;
  const cats = p.necs.map(id => (NECESIDADES.find(n => n.id === id) || {}).label || '');
  p._raices = claveBusqueda(p.n + ' ' + cats.join(' ') + ' ' + tienda)
    .split(' ').map(raizBusqueda).filter(Boolean);
  p._raicesDe = de;
  return p._raices;
}

/* Las dos raices tienen que medir al menos tres letras para compararse por
   prefijo. Sin ese piso, "gel" tambien devolvia todo lo que dice "100 g" en el
   nombre, porque "gel" empieza con "g". Medido: 12 resultados donde iban 7. */
function contieneRaiz(p, w){
  const r = raizBusqueda(w);
  if (r.length < 3) return raicesDe(p).includes(r);
  return raicesDe(p).some(x =>
    x === r || (x.length >= 3 && (x.startsWith(r) || r.startsWith(x))));
}

function palabrasDe(texto){
  return claveBusqueda(texto).split(' ').filter(w => w.length > 1);
}

function coincide(p, texto){
  const palabras = palabrasDe(texto);
  if (!palabras.length) return false;
  const nombre = claveBusqueda(p.n);
  return palabras.every(w => nombre.includes(w)) || palabras.every(w => contieneRaiz(p, w));
}

/* Lo que se puede comprar en el segmento que se esta mirando -- los combos en
   los tres --, ordenado por cuanto se parece a lo buscado: primero el texto
   tal cual, despues lo encontrado por raiz; primero lo que empieza con la
   palabra; y lo que tiene stock antes que lo que no. */
function buscarProductos(texto){
  const palabras = palabrasDe(texto);
  if (!palabras.length) return [];
  return PRODUCTOS.filter(p => p.necs.includes('packs') || hayEn(p, segmento))
    .map(p => {
      const nombre = claveBusqueda(p.n);
      const literal = palabras.every(w => nombre.includes(w));
      if (!literal && !palabras.every(w => contieneRaiz(p, w))) return null;
      const arranca = nombre.startsWith(palabras[0]) ? 0 : 1;
      return {p, orden: (literal ? 0 : 4000) + arranca * 1000 +
                        (conStock(p) ? 0 : 500) + nombre.length};
    })
    .filter(Boolean)
    .sort((a, b) => a.orden - b.orden)
    .map(x => x.p);
}

(function buscador(){
  const campo = $('#buscar'), limpiar = $('#buscarLimpiar');
  if (!campo) return;

  /* Se mide cuando el cliente para de escribir, no en cada tecla: si no,
     "aceite" son seis eventos y el informe queda ilegible. search_term es el
     nombre que espera GA4; query queda para el dataLayer. */
  let relojMedida = null;
  function medir(texto){
    clearTimeout(relojMedida);
    if (!texto.trim()) return;
    relojMedida = setTimeout(() => {
      track('search', {search_term: texto.trim(), query: texto.trim(),
                       results: document.querySelectorAll('#grilla .card').length});
    }, 900);
  }

  function aplicar(texto){
    busqueda = texto;
    limpiar.hidden = !texto;
    if (texto.trim() && categoriasVivas) categoriasVivas.soltar();
    pintar();
    medir(texto);
  }

  // Se espera a que deje de tipear: repintar la grilla en cada tecla parpadea.
  let reloj = null;
  campo.addEventListener('input', () => {
    clearTimeout(reloj);
    reloj = setTimeout(() => aplicar(campo.value), 160);
  });
  campo.addEventListener('keydown', e => {
    if (e.key === 'Enter'){
      e.preventDefault();
      clearTimeout(reloj);
      aplicar(campo.value);
      campo.blur();   // en el celular cierra el teclado y deja ver la grilla
    } else if (e.key === 'Escape'){
      clearTimeout(reloj);
      campo.value = '';
      aplicar('');
    }
  });
  limpiar.onclick = () => { campo.value = ''; aplicar(''); campo.focus(); };

  /* Busqueda que llega por la URL: /?q=calendula. Permite mandar aca el
     buscador del theme sin deshabilitarlo. La grilla la pinta el arranque. */
  const q = new URLSearchParams(location.search).get('q');
  if (q){
    campo.value = q;
    busqueda = q;
    limpiar.hidden = false;
    track('search_desde_url', {query: q});
    setTimeout(irAlCatalogo, 300);
  }
})();

/* ══════════ QUE EL PASE A LA TIENDA NO CUENTE DOS VECES ══════════
   Al pasar el carrito, el theme dispara su propio AddToCart por cada linea
   (LS.events.productAddedToCart, con el content_id correcto). Esos productos ya
   se le contaron a Meta cuando el cliente los agrego aca, asi que se descartan:
   si no, cada compra saldria con el doble de AddToCart y el embudo de Meta
   quedaria deformado.

   El pixel de esta tienda no manda copia por servidor -- canSendPreFbq es
   false --, asi que filtrar fbq alcanza. El filtro se pone recien al empezar el
   pase, no antes: mientras el cliente navega no se toca nada de la tienda. Y el
   Purchase no corre ningun riesgo, porque sale en /comprar/, que es otra carga
   de pagina donde este filtro ya no existe. */
let pasandoALaTienda = false;
let relojDelPase = 0;

function filtrarAddToCartDelTheme(){
  if (typeof window.fbq !== 'function' || window.fbq.__habitad) return;
  const real = window.fbq;
  const filtro = function (accion, evento){
    if (pasandoALaTienda && accion === 'track' && evento === 'AddToCart') return;
    return real.apply(this, arguments);
  };
  for (const k in real){ try { filtro[k] = real[k]; } catch (e) {} }
  filtro.push = filtro;
  filtro.__habitad = true;
  window.fbq = filtro;
  window._fbq = filtro;
}

function abrirElPase(){
  filtrarAddToCartDelTheme();
  pasandoALaTienda = true;
  clearTimeout(relojDelPase);
  /* Red de seguridad: si el pase se cuelga y el cliente se queda aca, el filtro
     no puede quedarse puesto para siempre. */
  relojDelPase = setTimeout(() => { pasandoALaTienda = false; }, 30000);
}

/* ══════════ PASO A LA TIENDA ══════════
   Al finalizar, los productos se cargan en el carrito real de Tiendanube y el
   cliente cae DIRECTO en /comprar/ -- la pagina de carrito de verdad, donde se
   aplican los cupones y se calcula el envio. Desde ahi le quedan dos pasos.

   NO se pasa por el panel lateral. Ese preview es un paso de mas: el cliente
   ya armo su compra aca y verla otra vez en una gaveta no le aporta nada.

   COMO SE EVITA EL PANEL, sin parches: el sexto argumento de
   LS.addToCartEnhanced es un callback, y la plataforma hace

       n ? n(a, s) : (mostrar el panel lateral)

   o sea que si se le pasa una funcion, la llama EN VEZ de abrir el panel. Es
   un hueco de la propia Tiendanube, no algo que estemos forzando.

   Tampoco se saltea el carrito hacia el checkout. Eso se investigo y se puede
   -- el campo go_to_checkout lo hace -- pero se descarto: es un campo interno
   sin documentar, y saltear /comprar/ dejaria afuera los cupones y el calculo
   de envio. */
const CARRITO_TIENDA = '/comprar/';

/* Que id mandarle a la tienda. Si el producto tiene variantes vale la de la
   variante elegida; si no, la publicacion del segmento que se esta mirando,
   que es la que tiene el precio correcto. */
function idParaLaTienda(p, seg, vi){
  const donde = seg || segmento;
  if (p.vars){
    const v = p.vars[siNula(siNula(vi, varElegida.get(p.n)), 0)];
    if (v && v.id) return v.id;
  }
  /* La publicacion del segmento con el que se cargo la linea, que es la que
     tiene el precio que el cliente vio. Mandar la de otro segmento le
     cambiaria el precio en el carrito de la tienda. */
  return p.ids[donde] || p.ids.minorista;
}

/* Un formulario suelto por producto, igual al que usa la ficha de la tienda:
   method post, action /comprar/ y el id en add_to_cart. */
function formularioParaLaTienda(p, cant, seg, vi){
  const f = document.createElement('form');
  f.className = 'js-product-form';
  f.method = 'post';
  f.action = CARRITO_TIENDA;
  [['add_to_cart', idParaLaTienda(p, seg, vi)], ['quantity', cant]].forEach(([n, v]) => {
    const i = document.createElement('input');
    i.type = 'hidden'; i.name = n; i.value = v;
    f.appendChild(i);
  });
  f.style.display = 'none';
  document.body.appendChild(f);
  return f;
}

/* Agrega UN formulario al carrito de la tienda y espera a que la tienda
   conteste. LS.addToCartEnhanced es async pero no espera su propio pedido:
   devuelve apenas lo lanza (leido en la fuente de la plataforma el 15/09).
   Con el await solo, "Finalizar compra" mandaba todos los productos casi a
   la vez y se iba a /comprar/ sin esperar ninguno: con un carrito nuevo cada
   pedido podia abrir un carrito distinto, y la navegacion cortaba los que
   estaban en viaje.

   Lo que si avisa son sus dos ultimos argumentos: al sexto lo llama
   LS.updateCartEnhanced cuando el producto entro -- en lugar de abrir la
   gaveta --, y al septimo el manejador de errores cuando la tienda lo
   rechaza. Si en 12 segundos no llamo a ninguno se da por no confirmado: la
   linea se queda en la landing, que es mejor que perderla. */
function agregarEnLaTienda(form){
  return new Promise(resolver => {
    let hecho = false;
    const fin = entro => {
      if (hecho) return;
      hecho = true;
      clearTimeout(reloj);
      resolver(entro);
    };
    const reloj = setTimeout(() => fin(false), 12000);
    try {
      Promise.resolve(LS.addToCartEnhanced(form, '', '', '', true,
        () => fin(true),          // entro
        () => fin(false)))        // la tienda lo rechazo
        .catch(() => fin(false));
    } catch (err) {
      fin(false);
    }
  });
}

/* Manda una lista de {prod, cant} al carrito de la tienda y lleva a
   /comprar/. Lo usan las dos puertas de salida: "Finalizar compra", que manda
   todo el carrito, y "Compra rapida", que manda un solo producto. */
async function mandarALaTienda(items, boton, textoOriginal){
  if (!items.length) return;

  const enLaTienda = typeof LS !== 'undefined' && typeof LS.addToCartEnhanced === 'function';
  boton.disabled = true;
  boton.textContent = 'Redirigiendo...';

  if (!enLaTienda){
    // En el prototipo no existe LS: se muestra que haria y no se navega.
    setTimeout(() => {
      boton.textContent = '\u2713 En la tienda ya estarías en ' + CARRITO_TIENDA;
      setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.disabled = false;
      }, 2400);
    }, 900);
    return;
  }

  let fallaron = 0;
  // Lo que entra ahora ya se le conto a Meta cuando el cliente lo agrego aca.
  abrirElPase();
  // De a uno: el primero crea el carrito de la tienda y los demas se suman.
  for (const it of items){
    const f = formularioParaLaTienda(it.prod, it.cant, it.seg, it.vi);
    const entro = await agregarEnLaTienda(f);
    f.remove();
    if (!entro){ fallaron++; continue; }
    /* Ya esta en el carrito de la tienda: sale del de la landing. Si el
       cliente vuelve atras desde /comprar/, no se manda dos veces. */
    const clave = Object.keys(carrito).find(k => carrito[k] === it);
    if (clave) delete carrito[clave];
    guardarCarrito();
    if (carritoTienda) carritoTienda.sumar(precioItem(it) * it.cant);
  }

  /* Se va a /comprar/ incluso si alguno fallo: ahi el cliente ve exactamente
     que entro y que no, en vez de quedarse en una landing que le dice que algo
     salio mal sin poder hacer nada. */
  if (fallaron) track('add_to_cart_error', {fallaron, intentados: items.length,
                                            segment: segmento});
  location.href = CARRITO_TIENDA;
}

/* ══════════ EL CARRITO SOBREVIVE A LA RECARGA ══════════
   El carrito de la landing vivia solo en memoria: recargar, cerrar la
   pestaña o volver otro dia lo dejaba vacio. Ahora se guarda en este
   navegador cada vez que cambia, y al abrir se recupera antes del primer
   pintado.

   QUE SE GUARDA
     Por linea: los ids de las publicaciones del producto, el nombre, el
     segmento con el que entro, la cantidad y la variante por su id -- no por
     su posicion, que cambia si el administrador agrega una --. Y el segmento,
     si el cliente eligio alguno. Dura 30 dias desde la ultima visita, lo
     mismo que la sesion de la tienda.

   AL RECUPERAR
     Cada linea se busca en el catalogo de hoy, sin medir nada: el cliente no
     agrego nada de nuevo, y los beneficios que ya tenia no se festejan otra
     vez. Si el producto no aparece se espera a la lectura en vivo de la
     tienda -- puede ser un combo que todavia no llego --; si la tienda entera
     tampoco lo tiene, o si ya no existe su variante o su publicacion para ese
     segmento, la linea se va.

   AL FINALIZAR
     Cada linea que entra al carrito de la tienda sale de este: si el cliente
     vuelve atras desde /comprar/, no la manda dos veces. La que la tienda
     rechaza se queda, para reintentarla. Y lo que ya esta en el carrito de la
     tienda cuenta para el minimo mayorista y distribuidor.

   DOS PESTAÑAS
     Leen y escriben el mismo carrito: lo que cambia en una se ve en la otra,
     y la que recibe el cambio no lo vuelve a escribir. */
var carritoListo = false;      // hasta recuperar lo guardado no se escribe nada
var carritoPendientes = [];    // lineas guardadas cuyo producto no aparecio todavia
var carritoFirma = '';         // lo ultimo escrito o leido, para no escribir de mas
var carritoVisto = 0;          // la marca de tiempo de lo guardado que ya se conoce
var segmentoElegido = false;
const CARRITO_GUARDADO = 'habitad:carrito:v1';
const CARRITO_DURA = 30 * 24 * 3600 * 1000;

function lineaParaGuardar(k, i){
  const p = i.prod, v = p.vars && p.vars[siNula(i.vi, 0)];
  return {k, n: p.n, seg: i.seg || segmento, cant: i.cant,
          vid: v && v.id != null ? v.id : null,
          ids: {minorista: siNula(p.ids.minorista, null),
                mayorista: siNula(p.ids.mayorista, null),
                distribuidor: siNula(p.ids.distribuidor, null)}};
}

function estadoCarrito(){
  return {seg: segmentoElegido ? segmento : null,
          lineas: Object.keys(carrito).map(k => lineaParaGuardar(k, carrito[k]))
                    .concat(carritoPendientes)};
}

const firmaCarrito = () => { const s = estadoCarrito(); return JSON.stringify([s.seg, s.lineas]); };

function guardarCarrito(){
  if (!carritoListo) return;
  unirPendientes();
  const s = estadoCarrito();
  const firma = JSON.stringify([s.seg, s.lineas]);
  if (firma === carritoFirma) return;
  carritoFirma = firma;
  try {
    if (!s.seg && !s.lineas.length){
      localStorage.removeItem(CARRITO_GUARDADO);
      carritoVisto = 0;
    } else {
      const t = Date.now();
      localStorage.setItem(CARRITO_GUARDADO, JSON.stringify({v: 1, t, seg: s.seg, lineas: s.lineas}));
      carritoVisto = t;
    }
  } catch (err) { /* sin lugar o bloqueado: el carrito dura lo que dure la visita */ }
}

function leerCarritoGuardado(){
  try {
    const d = JSON.parse(localStorage.getItem(CARRITO_GUARDADO) || 'null');
    if (!d || d.v !== 1 || !Array.isArray(d.lineas)) return null;
    if (Date.now() - (d.t || 0) > CARRITO_DURA){
      localStorage.removeItem(CARRITO_GUARDADO);
      return null;
    }
    return d;
  } catch (err) { return null; }
}

// El producto de una linea guardada: por cualquiera de sus publicaciones, o
// por el nombre si el administrador las rehizo.
function productoDeLinea(l){
  const ids = Object.values(l.ids || {}).filter(x => x != null).map(String);
  return (ids.length && PRODUCTOS.find(p => ['minorista', 'mayorista', 'distribuidor']
            .some(s => p.ids[s] != null && ids.indexOf(String(p.ids[s])) !== -1)))
      || PRODUCTOS.find(p => p.n === l.n) || null;
}

/* La linea lista para el carrito; null si el producto no esta en el catalogo;
   false si esta pero ya no se puede comprar como se guardo. */
function armarLinea(l){
  const p = productoDeLinea(l);
  if (!p) return null;
  const seg = SEGMENTOS[l.seg] ? l.seg : 'minorista';
  if (!hayEn(p, seg) && !p.necs.includes('packs')) return false;
  let vi = 0;
  if (p.vars){
    vi = p.vars.findIndex(v => l.vid != null && String(v.id) === String(l.vid));
    if (vi === -1) return false;
  }
  return {prod: p, cant: Math.max(1, parseInt(l.cant, 10) || 1), seg, vi};
}

/* Las lineas que esperaban a la lectura en vivo: las que ya aparecieron pasan
   al carrito; las que la tienda entera no tiene se descartan. */
function unirPendientes(){
  if (!carritoPendientes.length) return;
  const inf = catalogoVivo && catalogoVivo.informe;
  const leyoTodo = !!(inf && inf.origen === 'tienda' && inf.completo);
  carritoPendientes = carritoPendientes.filter(l => {
    const linea = armarLinea(l);
    if (linea){
      if (!carrito[l.k]) carrito[l.k] = linea;
      return false;
    }
    return linea === null && !leyoTodo;
  });
}

// Arma el carrito con lo guardado, sin pintar ni medir.
function recuperarCarrito(d){
  Object.keys(carrito).forEach(k => delete carrito[k]);
  carritoPendientes = [];
  ((d && d.lineas) || []).forEach(l => {
    if (!l || typeof l.k !== 'string') return;
    const linea = armarLinea(l);
    if (linea) carrito[l.k] = linea;
    else if (linea === null) carritoPendientes.push(l);
  });
  if (d && d.seg && SEGMENTOS[d.seg] && (!segmentoElegido || d.seg !== segmento)){
    segmentoElegido = true;
    ponerSegmento(d.seg);
  }
  // Lo recuperado no se festeja: esos beneficios ya estaban ganados.
  logradosPrevios = TIERS.filter(t => t.min <= totalCarrito()).length;
}

/* Lo que escribio otra pestaña, o lo que hay al volver atras: se aplica y se
   repinta, sin volver a escribirlo. */
function aplicarCarritoDeAfuera(){
  const d = leerCarritoGuardado();
  carritoVisto = d ? d.t : 0;
  const segAntes = segmento;
  recuperarCarrito(d);
  carritoFirma = firmaCarrito();
  if (segmento !== segAntes){ pintar(); pintarPacks(); }
  pintarCarrito();
  recalcular();
}

addEventListener('storage', ev => {
  if (!carritoListo || (ev.key !== null && ev.key !== CARRITO_GUARDADO)) return;
  aplicarCarritoDeAfuera();
});

addEventListener('pageshow', ev => {
  if (!ev.persisted || !carritoListo) return;
  /* Volvio con "atras" desde /comprar/ y la pagina quedo congelada como
     estaba al irse: el boton en "Redirigiendo..." y el carrito de la tienda
     sin lo que se le acaba de pasar. */
  const ir = $('#checkoutIr');
  if (ir) ir.textContent = 'Finalizar compra';
  aplicarCarritoDeAfuera();
  carritoTienda.releer();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !carritoListo) return;
  // Una pestaña congelada en segundo plano puede no haber recibido el aviso.
  const d = leerCarritoGuardado();
  if ((d ? d.t : 0) !== carritoVisto) aplicarCarritoDeAfuera();
});

addEventListener('pagehide', () => guardarCarrito());

/* Lo que ya esta en el carrito de la TIENDA, en pesos. Sale de LS.cart, que
   la tienda escribe en cada pagina en centavos. Al volver atras desde
   /comprar/ la pagina congelada lo tiene viejo, asi que se relee la pagina. */
var carritoTienda = (function(){
  let pesos = 0;
  try {
    if (typeof LS !== 'undefined' && LS.cart) pesos = (Number(LS.cart.subtotal) || 0) / 100;
  } catch (err) { /* sin LS: prototipo o preview */ }
  return {
    pesos: () => pesos,
    sumar(n){ pesos += n || 0; },
    releer(){
      if (typeof LS === 'undefined') return;
      fetch(location.pathname, {credentials: 'same-origin'})
        .then(r => r.ok ? r.text() : '')
        .then(t => {
          const m = /LS\.cart\s*=\s*\{[\s\S]*?\bsubtotal\s*:\s*(\d+)/.exec(t);
          if (!m) return;
          pesos = Number(m[1]) / 100;
          resumenCarrito();
        })
        .catch(() => {});
    }
  };
})();

/* ══════════ PRUEBA DEL PASE A LA TIENDA ══════════
   Los nueve casos que hay que verificar antes de publicar. Se escribe en la
   consola del navegador, con la landing corriendo DENTRO de la tienda:

       pruebaDeCarrito()

   No compra ni navega: arma el formulario de cada caso igual que lo haria el
   boton de finalizar y muestra que id, que cantidad y que precio saldrian.
   Con eso se contrasta contra lo que aparece del otro lado.

   Lo que no puede hacer sola es apretar el boton: eso es una persona, con la
   tienda abierta al lado. Los nueve casos y como leerlos estan en
   NOTAS-PARA-LA-TIENDA.md. */
window.pruebaDeCarrito = function(){
  /* Con stock primero: si el ejemplo sale sin stock, la prueba no dice nada
     sobre el caso normal. El caso "sin stock" lo pide aparte, a proposito. */
  const hay = (seg, filtro) => PRODUCTOS.filter(p =>
    p.pr[seg] != null && p.st[seg] !== false && (!filtro || filtro(p)));
  const uno = (seg, filtro) => hay(seg, filtro)[0];

  const casos = [
    ['un producto',            'minorista', p => [{prod: uno('minorista'), cant: 1}]],
    ['dos productos distintos','minorista', p => hay('minorista').slice(0, 2)
                                                  .map(x => ({prod: x, cant: 1}))],
    ['varias unidades',        'minorista', p => [{prod: uno('minorista'), cant: 4}]],
    ['con variantes',          'minorista', p => {
      const v = uno('minorista', x => x.vars && x.vars.length);
      return v ? [{prod: v, cant: 1}] : [];
    }],
    ['sin stock',              'minorista', p => {
      const v = PRODUCTOS.find(x => x.pr.minorista != null && x.st.minorista === false);
      return v ? [{prod: v, cant: 1}] : [];
    }],
    ['compra minorista',       'minorista', p => hay('minorista').slice(0, 3)
                                                  .map(x => ({prod: x, cant: 1}))],
    ['compra mayorista 20%',   'mayorista', p => hay('mayorista').slice(0, 3)
                                                  .map(x => ({prod: x, cant: 2}))],
    ['compra distribuidor 30%','distribuidor', p => hay('distribuidor').slice(0, 3)
                                                  .map(x => ({prod: x, cant: 3}))],
    ['cinco o mas articulos',  'minorista', p => hay('minorista').slice(0, 6)
                                                  .map(x => ({prod: x, cant: 1}))]
  ];

  const guardado = segmento;
  console.log('%cPRUEBA DEL PASE A LA TIENDA', 'font-weight:bold;font-size:14px');
  console.log('LS.addToCartEnhanced ' +
    (typeof LS !== 'undefined' && typeof LS.addToCartEnhanced === 'function'
      ? 'ESTA disponible: la landing corre dentro de la tienda.'
      : 'NO esta: esto es el prototipo suelto, los ids se muestran igual.'));

  casos.forEach(([nombre, seg, armar]) => {
    segmento = seg;
    const items = armar() || [];
    if (!items.length){
      console.warn(nombre + ' (' + seg + '): no hay ningun producto que sirva de ejemplo');
      return;
    }
    const filas = items.map(i => ({
      producto: i.prod.n,
      id_que_se_manda: idParaLaTienda(i.prod, seg),
      cantidad: i.cant,
      precio_landing: precioDe(i.prod),
      variante: i.prod.vars
        ? (i.prod.vars[siNula(varElegida.get(i.prod.n), 0)] || {}).n || '(la primera)'
        : '—',
      stock: i.prod.st[seg] === false ? 'SIN STOCK' : 'ok'
    }));
    const total = items.reduce((a, i) => a + precioDe(i.prod) * i.cant, 0);
    console.groupCollapsed(nombre + ' · ' + seg + ' · ' + ars(total));
    console.table(filas);
    console.groupEnd();
  });

  segmento = guardado;
  pintar(); pintarPacks(); recalcular();
  console.log('Listo. Ahora hay que repetir cada caso a mano y comparar con ' +
              'lo que muestra /comprar/: mismos productos, mismas cantidades, ' +
              'mismos precios.');
};

$('#checkoutIr').onclick = e => {
  const items = Object.values(carrito);
  track('begin_checkout', {value: items.reduce((a, i) => a + precioItem(i) * i.cant, 0),
                           segment: segmento, items: itemsGA(items)});
  mandarALaTienda(items, e.currentTarget, 'Finalizar compra');
};

/* "Comprar ahora": suma el producto y abre el carrito. Antes se salteaba el
   carrito de la landing y se iba derecho a /comprar/ con ese producto solo,
   asi que el boton no llevaba a ningun lado visible y encima podia dejar
   afuera lo que el cliente ya tenia cargado. */
$('#mvRapida').onclick = e => {
  if (!vista) return;
  const b = e.currentTarget;
  const cant = cuentaFicha.leer();
  agregar(vista.p, vista.key, cant, null);
  track('quick_buy', {item_name: vista.p.n, quantity: cant, segment: segmento,
                      value: precioItem(carrito[vista.key]) * cant,
                      items: itemsGA([carrito[vista.key]])});
  b.disabled = true;
  b.textContent = 'Redirigiendo...';
  cerrarModal('modal');
  pintarCarrito(true);
  abrirModal('modalCheckout');
  // El boton vuelve a su estado para la proxima ficha que se abra.
  setTimeout(() => { b.disabled = false; b.textContent = 'Comprar ahora'; }, 900);
};


// La barra ya no se esconde al bajar: mientras haya algo en el carrito tiene
// que estar a la vista, porque es donde el cliente ve cuanto le falta para el
// beneficio. Solo desaparece con el carrito vacio, que lo maneja recalcular().
// El boton de asesoramiento se retiro: el CTA final devuelve al catalogo.

/* El banner entra con un acercamiento corto en vez de aparecer seco. */
if (ANIM.activo){
  const primera = document.querySelector('.hero__slide.activa');
  if (primera){
    anime({targets: primera, opacity: [0, 1], scale: [1.06, 1],
           duration: 1100, easing: 'easeOutQuad'});
    // Red: el banner es lo primero que se ve. Si los frames no avanzan, se
    // limpia el estilo y queda la imagen tal como la deja el CSS.
    pase(() => {
      if (primera.style.opacity && primera.style.opacity !== '1'){
        anime.remove(primera);
        primera.style.removeProperty('opacity');
        primera.style.removeProperty('transform');
      }
    }, 1500);
  }
}

/* Escalonado de las secciones al entrar en pantalla.
   Es DECORACION y nada mas: solo corre si anime.js esta y el visitante no
   pidio menos movimiento. El revelado de abajo, que es el que garantiza que
   todo se vea, sigue siendo el de siempre y no depende de esto.
   Ademas hay un barrido a los 4 segundos que destapa cualquier cosa que haya
   quedado en cero -- por ejemplo si el observer nunca dispara. */
if (ANIM.activo && 'IntersectionObserver' in window){
  const grupos = [...document.querySelectorAll('[data-escalonar]')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const hijos = e.target.children;
    if (!hijos.length) return;
    anime.set(hijos, {opacity: 0, translateY: 18});
    anime({targets: hijos, opacity: 1, translateY: 0,
           delay: anime.stagger(70), duration: 520, easing: SALIDA});
  }), {threshold: .18});
  grupos.forEach(g => io.observe(g));

  setTimeout(() => {
    document.querySelectorAll('[data-escalonar] > *').forEach(el => {
      if (getComputedStyle(el).opacity === '0'){
        anime.remove(el);
        anime.set(el, {opacity: '', translateY: ''});
      }
    });
  }, 2500);
}

/* ---- revelado al scroll, con red de seguridad ---- */
(function(){
  const revs = [...document.querySelectorAll('.rev')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  revs.forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight*0.85) el.classList.add('armado');
    else el.classList.add('armado','visto');
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('visto'); io.unobserve(e.target); }
  }), {threshold:0, rootMargin:'0px 0px -12% 0px'});
  revs.forEach(el => io.observe(el));
  setTimeout(() => revs.forEach(el => el.classList.add('visto')), 2500);
})();

/* ══════════ NUBEA ══════════
   Lo que el cliente configura en Nubea, dibujado con los componentes de la
   landing. La app de Nubea no puede dibujar aca: busca tarjetas del theme
   (data-product-id), sus stickers dejan de mirar a los 30 segundos, los
   bloques de ficha solo corren en plantillas de producto y su barra de envio
   gratis cuenta el carrito de la tienda.

   Se lee la misma configuracion publica que usan sus widgets -- con CORS
   abierto, asi que funciona tambien en el preview -- y se aplican sus mismas
   reglas. La API cachea 5 minutos: lo que el cliente cambia en el panel se
   ve en la landing en ese plazo.

   El producto de cada regla es la publicacion del segmento que se esta
   mirando, igual que en la tienda: un sticker puesto a la ficha minorista
   del Aceite de Romero no aparece en la mayorista, que es otra publicacion. */
var nubea = (function () {
  const API = 'https://api.nubea.com.ar';
  const GUARDADO = 'habitad:nubea:v1';
  const FRESCO = 5 * 60 * 1000;
  const vacio = () => ({badges: {shape: 'pill', maxPerCard: 2, badges: []}, stickers: [], bloques: [], envio: null});
  let datos = vacio();
  let ultimo = 0;

  /* Iconos de los widgets de Nubea, tal cual. Los de badges y los de bloques
     son dos juegos distintos en su codigo. */
  const ICONOS_BADGE = {
    truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
    bank: '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    gift: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8a3 3 0 1 0-3-3 5 5 0 0 0 3 3z"/><path d="M12 8a3 3 0 1 1 3-3 5 5 0 0 1-3 3z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const PRESET_ICONO = {shipping: 'truck', installments: 'card', transfer: 'bank', cash: 'cash',
                        discount: 'percent', gift: 'gift', warranty: 'shield', time: 'clock'};
  const ICONOS_BLOQUE = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
  };

  const esc = t => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // Colores del panel: solo lo que parece un color, para que no se cuele CSS.
  const color = (c, porDefecto) => /^#[0-9a-f]{3,8}$|^rgba?\([\d\s.,%]+\)$/i.test(String(c || '')) ? c : porDefecto;
  const svg = cuerpo => '<svg viewBox="0 0 24 24" aria-hidden="true">' + cuerpo + '</svg>';

  // La publicacion que se esta mirando: la del segmento, o la minorista.
  const idDe = p => Number(p.ids[segmento] || p.ids.minorista || p.ids.mayorista || p.ids.distribuidor);

  /* product-badges: q(). Por categoria no se puede resolver en la landing --
     no sabemos en que categoria de la tienda esta cada publicacion --, asi que
     esas reglas no se aplican aca. */
  function aplica(regla, p){
    switch (regla.targetType){
      case 'all': return true;
      case 'products': return Array.isArray(regla.productIds) && regla.productIds.includes(idDe(p));
      default: return false;
    }
  }

  function normalizar(badges, stickers, bloques, envio){
    const b = badges && typeof badges === 'object' ? badges : {};
    const max = Number(b.maxPerCard);
    return {
      badges: {shape: ['pill', 'icon_text', 'plain_line'].includes(b.shape) ? b.shape : 'pill',
               maxPerCard: Number.isInteger(max) && max > 0 ? max : 2,
               badges: Array.isArray(b.badges) ? b.badges : []},
      stickers: Array.isArray(stickers) ? stickers : [],
      bloques: Array.isArray(bloques) ? bloques : [],
      envio: envio && typeof envio === 'object' && envio.threshold ? envio : null
    };
  }

  /* ── Badges ── */
  function badgesHtml(p, donde){
    const forma = datos.badges.shape;
    const lista = datos.badges.badges
      .filter(x => donde === 'ficha' ? x.showInProductPage !== false : x.showInGrid !== false)
      .filter(x => aplica(x, p))
      .slice(0, datos.badges.maxPerCard);
    if (!lista.length) return '';
    return lista.map(x => {
      const texto = color(x.textColor, '#14532D');
      const estilo = 'color:' + texto + (forma === 'pill'
        ? ';background:' + color(x.backgroundColor, '#DCFCE7') +
          (x.borderColor ? ';border:1px solid ' + color(x.borderColor, 'transparent') : '')
        : '');
      const icono = forma === 'plain_line' ? '' : ICONOS_BADGE[x.icon || PRESET_ICONO[x.preset]] || '';
      return '<span class="nb-badge nb-badge--' + forma + '" style="' + estilo + '">' +
        (icono ? svg(icono) : '') + '<span>' + esc(x.text) + '</span></span>';
    }).join('');
  }

  /* ── Stickers ── product-stickers: Rt() para el aspecto, Ot() para la
     esquina, y de a 34px cuando hay mas de uno en la misma esquina. */
  const TAMANO = {small: 11, medium: 13, large: 16};
  const RADIO = {pill: '999px', rounded: '8px', rectangle: '0', circle: '50%', burst: '8px'};
  const ESTRELLA = 'polygon(50% 0%, 61% 13%, 77% 7%, 79% 24%, 95% 24%, 88% 39%, 100% 50%, 88% 61%, 95% 76%, 79% 76%, 77% 93%, 61% 87%, 50% 100%, 39% 87%, 23% 93%, 21% 76%, 5% 76%, 12% 61%, 0% 50%, 12% 39%, 5% 24%, 21% 24%, 23% 7%, 39% 13%)';

  function stickersHtml(p){
    const pilas = {};
    const partes = datos.stickers.filter(x => aplica(x, p)).map(x => {
      const esquina = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].includes(x.corner) ? x.corner : 'top-left';
      const pila = pilas[esquina] = (pilas[esquina] || 0) + 1;
      const corrida = 8 + (pila - 1) * 34;
      const escala = Number(x.sizeScale) || 1;
      const giro = Number(x.rotation) || 0;
      let lugar, mueve = [];
      if (esquina === 'center'){
        lugar = 'top:50%;left:50%;';
        mueve.push('translate(-50%, calc(-50% + ' + ((pila - 1) * 34) + 'px))');
      } else {
        lugar = (esquina.indexOf('top') === 0 ? 'top:' : 'bottom:') + corrida + 'px;' +
                (esquina.indexOf('left') > 0 ? 'left:8px;' : 'right:8px;');
      }
      if (giro) mueve.push('rotate(' + giro + 'deg)');
      const transform = mueve.length ? 'transform:' + mueve.join(' ') + ';' : '';

      if (x.contentType === 'image'){
        if (!/^https:\/\//.test(String(x.imageUrl || ''))) return '';
        return '<span class="nb-sticker" style="' + lugar + transform + 'box-shadow:none">' +
          '<img src="' + esc(x.imageUrl) + '" alt="" style="width:' + Math.round(72 * escala) + 'px"></span>';
      }
      const fondo = color(x.backgroundColor, '#EF4444');
      let estilo = 'background:' + (x.backgroundColor2
        ? 'linear-gradient(135deg, ' + fondo + ', ' + color(x.backgroundColor2, fondo) + ')' : fondo) +
        ';color:' + color(x.textColor, '#FFFFFF') +
        ';font-weight:' + (x.fontBold ? 700 : 500) +
        ';font-size:' + Math.round((TAMANO[x.fontSize] || 13) * escala) + 'px' +
        ';border-radius:' + (RADIO[x.shape] || '8px') + ';';
      if (x.shape === 'circle' || x.shape === 'burst'){
        const burst = x.shape === 'burst';
        const lado = Math.round((burst ? 76 : 58) * escala);
        estilo += 'width:' + lado + 'px;height:' + lado + 'px;white-space:normal;word-break:break-word;' +
          'padding:' + Math.round(lado * (burst ? .26 : .16)) + 'px;box-sizing:border-box;line-height:1.05;' +
          (burst ? 'clip-path:' + ESTRELLA + ';' : '');
      } else {
        estilo += 'padding:' + Math.round(4 * escala) + 'px ' + Math.round(9 * escala) + 'px;';
      }
      const texto = (x.emoji ? x.emoji + ' ' : '') + (x.text || '');
      return '<span class="nb-sticker" style="' + lugar + transform + estilo + '">' + esc(texto) + '</span>';
    }).filter(Boolean);
    return partes.length ? '<span class="nb-stickers" aria-hidden="true">' + partes.join('') + '</span>' : '';
  }

  /* ── Bloques de ficha ── product-content-blocks. Garantia y envio son los
     que tiene configurados el cliente; cualquier otro tipo se muestra con su
     titulo y su texto, para que no desaparezca en silencio. */
  function bloqueHtml(b){
    const d = b.design || {};
    const c = d.colors || {};
    const acento = color(c.accent, '#111827');
    const estilo = 'background:' + color(c.background, '#f8fafc') + ';color:' + color(c.text, '#0f172a') +
                   ';border-color:' + color(c.border, '#e2e8f0');
    const icono = nombre => ICONOS_BLOQUE[nombre] ? '<span style="color:' + acento + ';display:inline-flex">' + svg(ICONOS_BLOQUE[nombre]) + '</span>' : '';
    let cuerpo = '';
    if (d.type === 'shipping' || b.type === 'shipping'){
      cuerpo = (d.title ? '<b style="display:block;margin-bottom:6px">' + esc(d.title) + '</b>' : '') +
        (Array.isArray(d.rows) ? d.rows : []).map(r =>
          '<div class="nb-bloque__fila">' + icono(r.icon) + '<span>' + esc(r.label) + '</span>' +
          (r.value ? '<em>' + esc(r.value) + '</em>' : '') + '</div>').join('') +
        (d.freeShippingText ? '<p class="nb-bloque__pie" style="border-color:' + color(c.border, '#e2e8f0') +
          ';color:' + acento + '">' + esc(d.freeShippingText) + '</p>' : '');
    } else {
      cuerpo = '<div class="nb-bloque__cab">' + icono(d.icon) + '<div>' +
        (d.title ? '<b>' + esc(d.title) + '</b>' : '') + (d.text ? '<p>' + esc(d.text) + '</p>' : '') +
        (Array.isArray(d.items) ? d.items.map(it => '<p><b>' + esc(it.title || '') + '</b> ' + esc(it.text || it.content || '') + '</p>').join('') : '') +
        '</div></div>';
    }
    return '<div class="nb-bloque" style="' + estilo + '">' + cuerpo + '</div>';
  }

  /* ── La ficha ── */
  function llenarFicha(p){
    const badges = $('#mvNubeaBadges');
    if (badges){
      badges.innerHTML = badgesHtml(p, 'ficha');
      badges.hidden = !badges.innerHTML;
    }
    const foto = $('.ficha__principal');
    if (foto){
      const viejos = foto.querySelector('.nb-stickers');
      if (viejos) viejos.remove();
      foto.insertAdjacentHTML('beforeend', stickersHtml(p));
    }
    const caja = $('#mvNubeaBloques');
    if (caja){
      const propios = datos.bloques.filter(b => b.surface !== 'grid' &&
        (b.targetType !== 'products' || (Array.isArray(b.productIds) && b.productIds.includes(idDe(p)))));
      caja.innerHTML = propios.map(bloqueHtml).join('');
      caja.hidden = !propios.length;
      // Si el cliente cargo su bloque de envio, la caja de envio de relleno sobra.
      const envio = $('#mvEnvioCaja');
      if (envio) envio.hidden = propios.some(b => b.type === 'shipping' || (b.design || {}).type === 'shipping');
    }
  }

  /* ── Envio gratis ── free-shipping-bar: el umbral mueve el hito minorista, y
     los textos del panel reemplazan a los de la barra para ese hito. */
  function umbralEnvio(){
    return datos.envio ? Number(datos.envio.threshold) || 60000 : 60000;
  }
  function textoEnvio(que, falta){
    const t = datos.envio && datos.envio[que === 'logrado' ? 'textAchieved' : 'textInProgress'];
    if (!t) return null;
    let monto;
    try { monto = new Intl.NumberFormat('es-AR').format(Math.max(0, Math.ceil(falta || 0))); }
    catch (e) { monto = String(Math.ceil(falta || 0)); }
    return String(t).replace(/\{\{\s*amount\s*\}\}/g, monto);
  }
  function moverHito(){
    const hito = TIERS_POR_SEGMENTO.minorista.find(t => t.nombre === 'Envío gratis');
    if (!hito) return;
    hito.min = umbralEnvio();
    TIERS_POR_SEGMENTO.minorista.sort((a, b) => a.min - b.min);
  }

  function aplicar(nuevos){
    datos = nuevos;
    moverHito();
  }

  /* Apaga la barra de Nubea si llego a dibujarse antes que la landing. */
  document.querySelectorAll('[data-free-shipping-bar-container]:not([data-landing])')
    .forEach(n => n.remove());

  function aplicarGuardado(){
    try {
      const g = JSON.parse(localStorage.getItem(GUARDADO) || 'null');
      if (!g || !g.datos) return false;
      ultimo = g.t || 0;
      aplicar(normalizar(g.datos.badges, g.datos.stickers, g.datos.bloques, g.datos.envio));
      return true;
    } catch (e) { return false; }
  }

  async function traer(ruta){
    const r = await fetch(API + ruta, {credentials: 'omit'});
    if (!r.ok) return null;
    return r.json();
  }

  async function refrescar(){
    if (Date.now() - ultimo < FRESCO) return false;
    const antes = JSON.stringify(datos);
    try {
      const [badges, stickers, bloques, envio] = await Promise.all([
        traer('/product-badges/storefront/' + TIENDA_ID),
        traer('/product-stickers/storefront/' + TIENDA_ID),
        traer('/product-content-blocks/storefront/' + TIENDA_ID),
        traer('/free-shipping-bar/storefront/' + TIENDA_ID)
      ]);
      const nuevos = normalizar(badges, stickers, bloques, envio);
      ultimo = Date.now();
      try { localStorage.setItem(GUARDADO, JSON.stringify({t: ultimo, datos: nuevos})); } catch (e) {}
      if (JSON.stringify(nuevos) === antes) return false;
      aplicar(nuevos);
      return true;
    } catch (e) {
      if (window.console) console.warn('[nubea] no se pudo leer la configuracion:', e);
      return false;
    }
  }

  const api = {aplicarGuardado, refrescar, badgesHtml, stickersHtml, llenarFicha,
               umbralEnvio, textoEnvio, get datos(){ return datos; }};
  window.__nubea = api;
  return api;
})();

/* ══════════ CATÁLOGO VIVO ══════════
   PRODUCTOS es una foto: la tomo sync_landing.py el dia que se armo la
   landing. Si el administrador cambia un titulo, una descripcion, una foto o
   un precio, la foto no se entera. Medido el 14/09: 7 precios, 9 nombres, 3
   fotos y 7 stocks ya no coincidian con la tienda -- habia combos a $9.750
   que en la tienda cuestan $13.600.

   Dentro de la tienda la landing corre en el mismo dominio, asi que la lee
   directo, sin credenciales, igual que un visitante:

     · el listado  /productos/page/N/?results_only=true  -- 60 publicaciones
       por pagina con titulo, precio, stock, foto y variantes. La tienda
       entera son 7 paginas, unos 350 KB comprimidos.
     · la ficha    /productos/<nombre>/  -- la descripcion entera, las fotos y
       el precio exacto. Se pide sola, cuando alguien abre esa ficha.

   Los lectores (VIVO) replican los de sync_catalogo.py y sync_landing.py
   regla por regla. Probados contra las mismas paginas reales: 370
   publicaciones y 12 fichas, identicos al sincronizador, descripciones
   incluidas.

   QUE HACE CON LO QUE LLEGA
     Actualiza  : titulo, precio y stock de cada segmento, foto y variantes.
     Da de baja : la publicacion que ya no esta en el listado. Si un producto
                  se queda sin ninguna, sale.
     Pega       : una publicacion nueva con el titulo de un producto que ya
                  existe va al segmento que le falta.
     Da de alta : SOLO combos -- titulos con combo, pack, kit o promo, o su plural --, que
                  van al carrusel. Un producto suelto nuevo necesita que alguien
                  elija en que necesidad va, y eso sigue siendo sync_landing.py.
     No toca    : la clasificacion por necesidad, las reseñas ni "vendidos".

   REDES
     · Fuera de habitadnatural.com no hace nada: el preview de GitHub Pages
       sigue con la foto, que es lo unico que puede leer.
     · Con el listado incompleto, con menos de 100 publicaciones o si
       desapareceria mas del 25%, no se da de baja nada.
     · Si la tienda no responde, queda lo ultimo leido -- o la foto -- y la
       pagina funciona igual.

   CUANDO
     Lo ultimo leido se guarda en este navegador. Al abrir se aplica antes de
     pintar, asi la primera imagen ya sale al dia, y en segundo plano se vuelve
     a leer la tienda si paso mas de un minuto. Tambien al volver a la pestaña.
     Si algo cambio se repinta, sin mover al cliente de donde estaba. */
/* Lectores de la tienda, puros: reciben el HTML como texto y devuelven datos.
   No tocan el DOM, asi se pueden probar en Node contra paginas reales antes
   de que lleguen a la landing. Cada uno replica una funcion de
   tools/sync_catalogo.py o tools/sync_landing.py -- el nombre lo dice -- para
   que el catalogo vivo y el sincronizador lean exactamente lo mismo. */
var VIVO = (function () {
  'use strict';

  /* ── Entidades HTML ──
     Tabla propia para las comunes, y el navegador para cualquier otra. No se
     le pasa el texto entero a un <textarea>: solo la entidad suelta, que es un
     nombre de letras y numeros y no puede traer marcado. */
  var TABLA = {quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", nbsp: '\u00a0',
    aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
    Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
    ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü', iexcl: '¡',
    iquest: '¿', ordm: 'º', ordf: 'ª', deg: '°', ndash: '–',
    mdash: '—', hellip: '…', laquo: '«', raquo: '»', middot: '·',
    bull: '•', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
    copy: '©', reg: '®', trade: '™', times: '×', frac12: '½'};
  var otras = {};

  function entidad(nombre) {
    if (Object.prototype.hasOwnProperty.call(TABLA, nombre)) return TABLA[nombre];
    if (Object.prototype.hasOwnProperty.call(otras, nombre)) return otras[nombre];
    var valor = null;
    if (typeof document !== 'undefined') {
      var ta = document.createElement('textarea');
      ta.innerHTML = '&' + nombre + ';';
      if (ta.value !== '&' + nombre + ';') valor = ta.value;
    }
    otras[nombre] = valor;
    return valor;
  }

  function entidades(t) {
    t = t == null ? '' : String(t);
    if (t.indexOf('&') === -1) return t;
    return t.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g, function (m, e) {
      if (e.charAt(0) === '#') {
        var c = (e.charAt(1) === 'x' || e.charAt(1) === 'X')
          ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return (c > 0 && c < 0x110000) ? String.fromCodePoint(c) : m;
      }
      var v = entidad(e);
      return v == null ? m : v;
    });
  }

  /* ── Titulos ── */
  function sinAcentos(t) {
    return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // sync_landing.normalizar
  function normalizar(t) {
    t = sinAcentos(String(t || '').toLowerCase());
    return t.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // sync_catalogo.clave_titulo
  function claveTitulo(t) {
    t = sinAcentos(String(t || '').toLowerCase());
    return t.replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // sync_landing.titulo_de_tienda: "Aceite de Jojoba – 30 ml// VENTA MINORISTA"
  function tituloDeTienda(t) {
    return String(t || '').split('//')[0].replace(/^[ \-–—\/|]+|[ \-–—\/|]+$/g, '');
  }

  // sync_landing.CATEGORIAS, la regla de "packs". Con plural: sin la "s?",
  // "kits de Cremas Naturales" y "kits tinturas madre" -- dos de los cuatro
  // productos de la categoria de kits -- no llegaban al carrusel (15/09).
  var PACK = /\bcombo|\bpacks?\b|\bkits?\b|\bpromos?\b/;
  function esCombo(titulo) {
    return PACK.test(normalizar(titulo));
  }

  /* ── Descripciones ── */

  // sync_catalogo.limpiar_html
  function limpiarHtml(fragmento) {
    var t = String(fragmento || '');
    t = t.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    t = t.replace(/<br\s*\/?>|<\/p>|<\/li>|<\/div>|<\/h[1-6]>/gi, ' · ');
    t = t.replace(/<[^>]+>/g, ' ');
    t = entidades(t);
    t = t.replace(/[·\s]*·[·\s]*/g, ' · ');
    return t.replace(/\s+/g, ' ').replace(/^[ ·]+|[ ·]+$/g, '');
  }

  // sync_catalogo.AVISOS y BASURA: avisos de deposito pegados al texto
  var AVISOS = [
    /esta\s+publicaci[oó]n\s+es\s+para\s+pedidos?\s+mayoristas?[^·]{0,90}?(?=[A-ZÁÉÍÓÚÑ]{4,}|·|$)/gi,
    /atenci[oó]n\s*!*/gi,
    /caso\s+contrario[^·]{0,60}?(?=[A-ZÁÉÍÓÚÑ]{4,}|·|$)/gi,
    /sino\s+puede\s+elegir\s+la\s+publicaci[oó]n\s+minorista/gi,
    /usar\s+lista\s+minorista/gi,
    /elegir\s+minorista/gi,
    /m[ií]nimos?\s+de\s+compra\s+de?\s*\d+\s*mil\s*,?/gi,
    /\+\s*de\s*\d+\s*mil\s*,?/gi
  ];
  var BASURA = ['publicacion', 'minimo de compra', 'minimos de compra', 'caso contrario',
    'atencion', 'elegir minorista', 'usar lista', 'pedidos mayoristas', 'minimos de', 'minimo de'];

  // sync_catalogo.limpiar_descripcion
  function limpiarDescripcion(texto) {
    texto = String(texto || '');
    AVISOS.forEach(function (patron) {
      patron.lastIndex = 0;
      texto = texto.replace(patron, ' ');
    });
    var partes = texto.split(' · ')
      .map(function (p) { return p.trim(); })
      .filter(function (p) { return p; });
    while (partes.length > 1 && BASURA.some(function (b) {
      return claveTitulo(partes[0]).indexOf(b) !== -1;
    })) partes.shift();
    return partes.join(' · ').replace(/\s{2,}/g, ' ')
      .replace(/^[ ·,\-—!]+|[ ·,\-—!]+$/g, '');
  }

  // sync_landing.a_parrafos
  function aParrafos(t) {
    return String(t || '').replace(/[ \t]*·[ \t]*/g, '\n').trim();
  }

  /* ── Una publicacion ──
     sync_catalogo.leer_ficha, la parte que no depende de donde salio el
     HTML: precio y stock de la variante mas barata disponible, y las opciones
     del desplegable si hay mas de una variante. */
  function imagen640(u) {
    if (!u) return '';
    u = String(u).replace(/-\d+-\d+\.(webp|jpe?g|png)(\?.*)?$/i, '-640-0.$1');
    return u.indexOf('//') === 0 ? 'https:' + u : u;
  }

  function publicacion(id, nombre, url, img, variantes) {
    var disp = variantes.filter(function (v) { return v.available; });
    var elegida = (disp.length ? disp : variantes).reduce(function (a, b) {
      return (b.price_number || 0) < (a.price_number || 0) ? b : a;
    });
    var opciones = null;
    if (variantes.length > 1) {
      opciones = variantes
        .filter(function (v) { return v.option0 || v.option1 || v.option2; })
        .map(function (v) {
          return {id: parseInt(v.id || 0, 10), n: String(v.option0 || v.option1 || v.option2),
                  p: v.price_number, s: !!v.available};
        });
      if (!opciones.length) opciones = null;
    }
    return {
      id: id,
      n: nombre,
      url: url,
      /* El id de la variante mas barata disponible. Es el que espera el
         catalogo de Meta en content_ids: el theme arma variantMetaContentIds
         con el de variante, y es distinto del de la publicacion incluso cuando
         hay una sola variante. */
      variante: parseInt(elegida.id || 0, 10) || null,
      img: img || imagen640(elegida.image_url),
      precio: elegida.promotional_price_number || elegida.price_number || null,
      stock: disp.length > 0,
      opciones: opciones
    };
  }

  /* ── El listado ──
     /productos/page/N/?results_only=true trae 60 publicaciones por pagina.
     Cada una abre con la clase js-item-product, y en esa misma etiqueta estan
     el id y las variantes. Se corta el texto por esa clase en vez de armar un
     DOM: son 1,3 MB por pagina y en un telefono el parser se nota. */
  function leerListado(html) {
    var salida = [];
    var trozos = String(html || '').split('js-item-product');
    for (var i = 1; i < trozos.length; i++) {
      var t = trozos[i];
      var id = /data-product-id="(\d+)"/.exec(t);
      var va = /data-variants="([^"]*)"/.exec(t);
      if (!id || !va) continue;
      var variantes;
      try { variantes = JSON.parse(entidades(va[1])); } catch (e) { continue; }
      if (!variantes || !variantes.length) continue;
      var nom = /class="[^"]*\bjs-item-name\b[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(t);
      var url = /href="((?:https?:)?\/\/[^"]*\/productos\/[^"]+)"/.exec(t);
      var img = /(\/\/[^\s"',]+-640-0\.(?:webp|jpe?g|png))\s+640w/.exec(t);
      salida.push(publicacion(
        parseInt(id[1], 10),
        nom ? entidades(nom[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim() : '',
        url ? (url[1].indexOf('//') === 0 ? 'https:' + url[1] : url[1]) : '',
        img ? 'https:' + img[1] : '',
        variantes));
    }
    return salida;
  }

  /* ── La ficha ── */

  // El contenido de un <div>, contando los <div> que tenga adentro.
  function contenidoDiv(html, apertura) {
    var m = apertura.exec(html);
    if (!m) return null;
    var inicio = m.index + m[0].length;
    var re = /<div\b[^>]*>|<\/div\s*>/gi;
    var prof = 1, x;
    re.lastIndex = inicio;
    while ((x = re.exec(html))) {
      prof += x[0].charAt(1) === '/' ? -1 : 1;
      if (!prof) return html.slice(inicio, x.index);
    }
    return html.slice(inicio);
  }

  // Fotos del carrusel de la ficha, en el tamano que usa la landing (480).
  function galeria(html) {
    var re = /<div[^>]*class="(?:[^"]*\s)?js-product-slide(?:\s[^"]*)?"[^>]*>/g;
    var cortes = [], m;
    while ((m = re.exec(html))) cortes.push(m.index);
    var fotos = [], vistas = {};
    for (var i = 0; i < cortes.length; i++) {
      var trozo = html.slice(cortes[i], cortes[i + 1] || cortes[i] + 8000);
      var f = /(\/\/[^\s"',]+\/products\/[^\s"',]+?)-\d+-\d+\.(webp|jpe?g|png)/i.exec(trozo);
      if (!f || vistas[f[1]]) continue;
      vistas[f[1]] = 1;
      fotos.push('https:' + f[1] + '-480-0.' + f[2]);
    }
    return fotos.slice(0, 12);
  }

  function leerFicha(html) {
    html = String(html || '');
    var m = /LS\.variants\s*=\s*(\[[\s\S]*?\]);/.exec(html);
    if (!m) return null;
    var variantes;
    try { variantes = JSON.parse(m[1]); } catch (e) { return null; }
    if (!variantes || !variantes.length) return null;
    // El mismo titulo que usa el sincronizador: el og:title.
    var og = /<meta property="og:title" content="([^"]*)"/.exec(html);
    var h1 = /<h1[^>]*\bjs-product-name\b[^>]*>([\s\S]*?)<\/h1>/.exec(html);
    var nombre = og ? og[1] : (h1 ? h1[1] : '');
    var pub = publicacion(parseInt(variantes[0].product_id, 10),
      entidades(nombre.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(), '', '', variantes);
    var cuerpo = contenidoDiv(html, /<div[^>]*class="[^"]*\buser-content\b[^"]*"[^>]*>/);
    pub.d = cuerpo == null ? null : aParrafos(limpiarDescripcion(limpiarHtml(cuerpo)));
    pub.gal = galeria(html);
    return pub;
  }

  return {
    entidades: entidades, normalizar: normalizar, claveTitulo: claveTitulo,
    tituloDeTienda: tituloDeTienda, esCombo: esCombo, limpiarHtml: limpiarHtml,
    limpiarDescripcion: limpiarDescripcion, aParrafos: aParrafos,
    leerListado: leerListado, leerFicha: leerFicha, galeria: galeria
  };
})();

/* ¿La conexion le cuesta plata al cliente? Datos moviles, 2G/3G, o "ahorro de
   datos" puesto. Lo usan el catalogo y las categorias para leer la tienda
   menos seguido: en datos, cada lectura son segundos de radio encendida y
   megas de su plan. Fuera de Chrome/Android casi ningun navegador contesta
   esto, asi que la respuesta por defecto es "no" -- no se le recorta nada a
   nadie por las dudas. */
function conexionCara(){
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return false;
  if (c.saveData) return true;
  if (c.type === 'cellular') return true;
  return /2g|3g/.test(c.effectiveType || '');
}

var catalogoVivo = (function () {
  const EN_TIENDA = /(^|\.)habitadnatural\.com$/i.test(location.hostname);
  const GUARDADO = 'habitad:catalogo-vivo:v1';
  /* Leer el catalogo son 9 pedidos y 6,8 MB de HTML (281 KB por la red). Con
     un minuto, un cliente que entra a tres fichas y vuelve al inicio se lo
     bajaba cuatro veces.

     En wifi, diez minutos: alcanza de sobra para que un precio cambiado en el
     panel se vea en la misma sesion. En datos moviles, seis horas: ahi la
     conexion ya viene peleada por los ~27 dominios que carga la tienda, y cada
     lectura son segundos de radio encendida y megas del plan del cliente. No
     se deja de leer nunca -- la primera visita lee igual --, solo se espacia. */
  const FRESCO_WIFI  = 10 * 60 * 1000;
  const FRESCO_DATOS = 6 * 60 * 60 * 1000;
  const FRESCO = () => conexionCara() ? FRESCO_DATOS : FRESCO_WIFI;
  const TOPE_PAGINAS = 30;       // hoy son 7; el tope es para no girar en vacio
  const DE_A = 3;                // paginas pedidas en paralelo
  const SEGS = ['minorista', 'mayorista', 'distribuidor'];

  let ultimo = 0;
  let enCurso = null;
  let relojRepintado = 0;
  const fichasLeidas = new Map();

  const firma = p => JSON.stringify([p.n, p.img, p.d, p.pr, p.st, p.vars || null, p.gal || null]);
  const conId = (p, s) => p.ids[s] != null;

  async function bajar(url){
    const r = await fetch(url, {credentials: 'same-origin'});
    if (r.status === 404) return '';
    if (!r.ok) throw new Error(url + ' respondio ' + r.status);
    return r.text();
  }

  /* El listado entero, de a tres paginas, hasta la primera vacia. Una vacia
     seguida de otra con productos no es el final sino un error de la tienda,
     y con eso no se da de baja nada. */
  async function recorrerListado(){
    const pubs = new Map();
    for (let desde = 1; desde <= TOPE_PAGINAS; desde += DE_A){
      const paginas = [];
      for (let k = desde; k < desde + DE_A && k <= TOPE_PAGINAS; k++) paginas.push(k);
      const textos = await Promise.all(paginas.map(k => bajar(k === 1
        ? '/productos/?results_only=true'
        : '/productos/page/' + k + '/?results_only=true')));
      let vacia = 0;
      for (let t = 0; t < textos.length; t++){
        const leidas = VIVO.leerListado(textos[t]);
        if (!leidas.length){ if (!vacia) vacia = paginas[t]; continue; }
        if (vacia) return {pubs, completo: false};
        // Las categorias lo usan para saber cuando una lista no sigue.
        if (paginas[t] === 1) api.tamPagina = leidas.length;
        leidas.forEach(f => { if (!pubs.has(f.id)) pubs.set(f.id, f); });
        await new Promise(listo => setTimeout(listo, 0));   // aire para el hilo principal
      }
      if (vacia) return {pubs, completo: vacia > 1};
    }
    return {pubs, completo: false};
  }

  function aplicar(pubs, completo){
    const cambiados = new Set(), salen = [], altas = [];

    let referidas = 0, faltan = 0;
    PRODUCTOS.forEach(p => SEGS.forEach(s => {
      if (!conId(p, s)) return;
      referidas++;
      if (!pubs.has(+p.ids[s])) faltan++;
    }));
    const puedeBajar = completo && pubs.size >= 100 && faltan <= referidas * 0.25;
    const usadas = new Set();

    PRODUCTOS.forEach(p => {
      const antes = firma(p);
      SEGS.forEach(s => {
        if (!conId(p, s)) return;
        const f = pubs.get(+p.ids[s]);
        if (f){
          usadas.add(f.id);
          if (f.precio) p.pr[s] = f.precio;
          p.st[s] = f.stock;
          if (f.url) (p.urls || (p.urls = {}))[s] = f.url;
          if (f.variante) (p.vids || (p.vids = {}))[s] = f.variante;
        } else if (puedeBajar){
          delete p.ids[s]; delete p.pr[s]; delete p.st[s];
          if (p.urls) delete p.urls[s];
          if (p.vids) delete p.vids[s];
        }
      });
      if (!SEGS.some(s => conId(p, s))){ salen.push(p); return; }
      /* Nombre, foto y variantes: de la publicacion del segmento mas alto que
         siga viva. La minorista es la que ve el cliente. */
      const canon = SEGS.map(s => conId(p, s) ? pubs.get(+p.ids[s]) : null).find(Boolean);
      if (canon){
        const nombre = tituloLimpio(VIVO.tituloDeTienda(canon.n));
        if (nombre) p.n = nombre;
        if (canon.img && canon.img !== p.img){ p.img = canon.img; delete p.gal; }
        if (canon.opciones) p.vars = canon.opciones;
        else if (p.vars){ delete p.vars; delete p.opcion; }
      }
      if (firma(p) !== antes) cambiados.add(p);
    });
    salen.forEach(p => PRODUCTOS.splice(PRODUCTOS.indexOf(p), 1));

    /* Publicaciones sueltas. Primero se intenta pegarlas al producto que ya
       tiene ese titulo, en el segmento que le falte: casi siempre son la ficha
       mayorista o distribuidor de algo que ya esta. */
    const porTitulo = new Map();
    PRODUCTOS.forEach(p => {
      const k = VIVO.claveTitulo(p.n);
      if (k && !porTitulo.has(k)) porTitulo.set(k, p);
    });
    const huerfanas = [];
    pubs.forEach(f => {
      if (usadas.has(f.id)) return;
      const p = porTitulo.get(VIVO.claveTitulo(tituloLimpio(VIVO.tituloDeTienda(f.n))));
      const libres = p ? SEGS.filter(s => !conId(p, s)) : [];
      if (!libres.length){ huerfanas.push(f); return; }
      const caro = Math.max(0, ...SEGS.map(s => p.pr[s] || 0));
      const s = (f.precio > caro && libres.indexOf('minorista') !== -1) ? 'minorista' : libres[0];
      p.ids[s] = f.id; p.pr[s] = f.precio; p.st[s] = f.stock;
      if (f.url) (p.urls || (p.urls = {}))[s] = f.url;
      usadas.add(f.id);
      cambiados.add(p);
    });

    // Altas: solo combos, y solo con el listado completo.
    if (completo){
      const grupos = new Map();
      huerfanas.forEach(f => {
        const titulo = VIVO.tituloDeTienda(f.n);
        if (!VIVO.esCombo(titulo)) return;
        const k = VIVO.claveTitulo(titulo);
        if (!grupos.has(k)) grupos.set(k, []);
        grupos.get(k).push(f);
      });
      grupos.forEach(grupo => {
        // La mas cara es la minorista, despues mayorista, despues distribuidor.
        grupo.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        const nuevo = {n: tituloLimpio(VIVO.tituloDeTienda(grupo[0].n)), img: grupo[0].img,
                       d: descripcionLimpia(''), necs: ['packs'],
                       pr: {}, st: {}, ids: {}, urls: {}, vivo: true};
        grupo.slice(0, SEGS.length).forEach((f, k) => {
          nuevo.ids[SEGS[k]] = f.id; nuevo.pr[SEGS[k]] = f.precio;
          nuevo.st[SEGS[k]] = f.stock; nuevo.urls[SEGS[k]] = f.url;
        });
        if (grupo[0].opciones) nuevo.vars = grupo[0].opciones;
        PRODUCTOS.push(nuevo);
        altas.push(nuevo);
      });
    }
    return {cambiados: [...cambiados], salen, altas};
  }

  // Se guardan solo las publicaciones que la landing usa: unos 60 KB.
  function guardar(pubs, completo){
    const usadas = new Set();
    PRODUCTOS.forEach(p => SEGS.forEach(s => { if (conId(p, s)) usadas.add(+p.ids[s]); }));
    const lista = [];
    pubs.forEach(f => { if (usadas.has(f.id)) lista.push(f); });
    try {
      localStorage.setItem(GUARDADO, JSON.stringify({t: Date.now(), completo, total: pubs.size, pubs: lista}));
    } catch (e) { /* sin lugar o bloqueado: la proxima vez se lee de nuevo */ }
  }

  function aplicarGuardado(){
    if (!EN_TIENDA) return false;
    let g = null;
    try { g = JSON.parse(localStorage.getItem(GUARDADO) || 'null'); } catch (e) { return false; }
    if (!g || !Array.isArray(g.pubs) || !g.pubs.length) return false;
    ultimo = g.t || 0;
    const r = aplicar(new Map(g.pubs.map(f => [f.id, f])), !!g.completo && (g.total || 0) >= 100);
    api.informe = {origen: 'guardado', t: ultimo, cambiados: r.cambiados.length,
                   salen: r.salen.length, altas: r.altas.map(p => p.n)};
    return !!(r.cambiados.length || r.salen.length || r.altas.length);
  }

  /* Repinta todo lo que sale de PRODUCTOS sin mover al cliente: la grilla
     vuelve a donde estaba y el carrusel deja al frente el mismo combo. */
  function repintar(conFicha){
    const grilla = $('#grilla');
    const x = grilla ? grilla.scrollLeft : 0;
    pintar();
    if (grilla && x){
      grilla.style.scrollBehavior = 'auto';
      grilla.scrollLeft = x;
      grilla.style.scrollBehavior = '';
      if (typeof actualizarFlechasCat === 'function') actualizarFlechasCat();
    }
    pintarPacks();
    recalcular();
    if (conFicha && vista && PRODUCTOS.indexOf(vista.p) !== -1) llenarVista(vista.p);
  }

  function refrescar(forzar){
    if (!EN_TIENDA) return Promise.resolve(null);
    if (enCurso) return enCurso;
    if (!forzar && Date.now() - ultimo < FRESCO()) return Promise.resolve(null);
    const t0 = Date.now();
    enCurso = recorrerListado()
      .then(({pubs, completo}) => {
        const r = aplicar(pubs, completo);
        ultimo = Date.now();
        guardar(pubs, completo);
        api.informe = {origen: 'tienda', t: ultimo, ms: ultimo - t0, publicaciones: pubs.size,
                       completo, cambiados: r.cambiados.length, salen: r.salen.length,
                       altas: r.altas.map(p => p.n)};
        if (r.cambiados.length || r.salen.length || r.altas.length) repintar(true);
        return r;
      })
      .catch(err => {
        if (window.console) console.warn('[catalogo vivo] no se pudo leer la tienda:', err);
        return null;
      })
      .then(r => { enCurso = null; return r; });
    return enCurso;
  }

  async function refrescarFicha(p){
    if (!EN_TIENDA || !p) return;
    const s = SEGS.find(x => conId(p, x));
    if (!s) return;
    let url = p.urls && p.urls[s];
    if (!url && enCurso){ await enCurso; url = p.urls && p.urls[s]; }
    if (!url) return;
    let pedido = fichasLeidas.get(url);
    if (!pedido || Date.now() - pedido.t > FRESCO()){
      pedido = {t: Date.now(), leida: bajar(url).then(VIVO.leerFicha).catch(() => null)};
      fichasLeidas.set(url, pedido);
    }
    const f = await pedido.leida;
    // Si en esa direccion hay otra publicacion, no se toca nada.
    if (!f || f.id !== +p.ids[s]) return;
    const antes = firma(p);
    const nombre = tituloLimpio(VIVO.tituloDeTienda(f.n));
    if (nombre) p.n = nombre;
    if (f.d != null) p.d = descripcionLimpia(f.d);
    if (f.gal.length > 1) p.gal = f.gal; else delete p.gal;
    if (f.precio) p.pr[s] = f.precio;
    p.st[s] = f.stock;
    if (f.opciones) p.vars = f.opciones;
    else if (p.vars){ delete p.vars; delete p.opcion; }
    if (firma(p) === antes) return;
    if (vista && vista.p === p) llenarVista(p);
    clearTimeout(relojRepintado);
    relojRepintado = setTimeout(() => repintar(false), 350);
  }

  const api = {enTienda: EN_TIENDA, informe: null, aplicarGuardado, refrescar, refrescarFicha};
  if (EN_TIENDA){
    // El administrador cambia algo en otra pestaña y vuelve: se ve sin recargar.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refrescar();
    });
  }
  // Para mirar desde la consola: __catalogoVivo.informe
  window.__catalogoVivo = api;
  return api;
})();

/* ══════════ CATEGORÍAS EN VIVO ══════════
   Las categorias del catalogo son las de la tienda: las que el administrador
   crea en Tiendanube y deja visibles. Si agrega, borra, oculta, renombra o
   reordena una, la landing lo refleja sola.

   DE DONDE SALEN
     · La lista: Brasilia la dibuja en el encabezado de cada pagina -- el menu
       "Categorias" de escritorio y la fila del celular --, con nombre,
       direccion y subcategorias, y solo con las visibles. La landing corre en
       esa misma pagina, asi que la lee del DOM sin pedir nada. Si el theme
       dejara de dibujarla, se lee del filtro de /productos/.
     · Que publicaciones tiene cada una: su listado,
       /<categoria>/?results_only=true, igual que el catalogo vivo lee
       /productos/. Una categoria oculta responde la pagina de "no encontrada"
       -- con 200, no 404, y con 40 productos sugeridos que no son suyos -- y
       se descarta: el menu puede ir unos minutos atrasado respecto del admin.
       Medido el 15/09: las 35 categorias de la tienda estaban ocultas.

   COMO SE CRUZA
     Un producto esta en una categoria si CUALQUIERA de sus publicaciones --
     minorista, mayorista o distribuidor -- esta en ella. El administrador
     suele categorizar una sola (en "Dolor, movilidad y circulacion" hay 28
     minoristas y 2 distribuidor), y la categoria es del producto, no de la
     lista de precios. Se muestra el segmento elegido, como siempre.

   QUE SE VE
     "Todos" y las categorias en el orden del admin, cada una con cuantos
     productos del segmento tiene. Una sin productos en ese segmento no se
     muestra. Si la elegida tiene subcategorias con productos, abajo sale una
     segunda fila. Sin ninguna categoria visible no se muestra nada y el
     catalogo queda como estaba: todo, con el buscador.

   CUANDO
     Al abrir, lo que tiene cada categoria sale de lo guardado en este
     navegador, y en segundo plano se vuelve a leer. Con la pestaña abierta,
     al volver a ella se relee el encabezado y los listados, si paso mas de
     un minuto.

   Fuera de la tienda (el preview de GitHub Pages) no hay categorias. Para
   mirar desde la consola: __categorias.informe. Para probar la interfaz sin
   la tienda: __categorias.probar(arbol, idsPorRuta). */
var categoriasVivas = (function () {
  const EN_TIENDA = catalogoVivo.enTienda;
  const GUARDADO = 'habitad:categorias:v1';
  /* Leer las categorias son 38 pedidos y 9,7 MB de HTML: lo mas caro que hace
     la landing, y lo que menos cambia. Que producto esta en que categoria se
     toca de vez en cuando, no cada minuto. */
  const FRESCO = 12 * 60 * 60 * 1000;
  const DE_A = 3;                // categorias pedidas en paralelo
  const TOPE_PAGINAS = 20;
  const SEGS = ['minorista', 'mayorista', 'distribuidor'];
  const DOMINIO = /(^|\.)habitadnatural\.com$/i;
  const TEXTO_SIN = 'Todo el catálogo a la vista. Escribí el nombre de un producto o lo ' +
                    'que necesitás cuidar, y la grilla se filtra al instante.';
  const TEXTO_CON = 'Todo el catálogo a la vista. Elegí una categoría o escribí el nombre ' +
                    'de un producto, y la grilla se filtra al instante.';

  let arbol = [];                // [{ruta, n, subs}], en el orden del admin
  const ids = new Map();         // ruta -> Set con los ids de sus publicaciones
  let nombresPorPub = new Map(); // id de publicacion -> nombres de sus categorias
  let activa = '';               // ruta elegida; '' es "Todos"
  let menuDelDom = null;         // lo que dibujo el theme al cargar la pagina
  let refrescos = 0, ultimo = 0, enCurso = null;
  let firmaChips = '', firmaSub = '';

  /* ── Lectores ── */

  // El nombre tal cual lo escribio el admin, sin espacios de mas. Los que
  // estan enteros en mayusculas se pasan a mayuscula inicial: se leen como
  // un grito, igual que los combos.
  function nombreLimpio(t){
    t = String(t || '').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim();
    if (t === t.toUpperCase() && t !== t.toLowerCase()) t = t.toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // "/dolor-movilidad-y-circulacion/", o null si el enlace no es una categoria.
  function rutaDe(href){
    let u;
    try { u = new URL(href, location.href); } catch (e) { return null; }
    if (u.hostname !== location.hostname && !DOMINIO.test(u.hostname)) return null;
    const r = u.pathname.replace(/\/+$/, '') + '/';
    return (r === '/' || r.indexOf('/productos/') === 0) ? null : r;
  }

  function leerLista(ul, prof){
    const salida = [], vistas = new Set();
    if (!ul || prof > 3) return salida;
    Array.prototype.forEach.call(ul.children, li => {
      if (li.tagName !== 'LI') return;
      const a = li.querySelector('a[href]');
      const ruta = a && rutaDe(a.getAttribute('href'));
      const n = a && nombreLimpio(a.getAttribute('title') || a.textContent);
      if (!ruta || !n || vistas.has(ruta)) return;
      vistas.add(ruta);
      salida.push({ruta, n, subs: leerLista(li.querySelector('ul'), prof + 1)});
    });
    return salida;
  }

  /* Las categorias visibles que dibuja Brasilia. null si la pagina no tiene
     ninguno de esos bloques; [] si los tiene vacios, que es "no hay ninguna
     visible". */
  function leerMenu(doc){
    const bloques = [
      ['.js-desktop-main-categories-col', '.desktop-list-subitems'],
      ['.js-main-categories-container', '.nav-categories-mobile'],
      ['.filters-categories-container', 'ul']
    ];
    for (const [caja, lista] of bloques){
      const c = doc.querySelector(caja);
      if (c) return leerLista(c.querySelector(lista), 1);
    }
    return null;
  }

  function es404(html){
    return /<body[^>]*\btemplate-404\b/.test(String(html).slice(0, 150000));
  }

  function aplanar(lista){
    return lista.reduce((a, c) => a.concat([c], aplanar(c.subs)), []);
  }

  // Lo guardado o lo que llega a probar() se revisa antes de usarlo.
  function limpiarArbol(lista){
    return (Array.isArray(lista) ? lista : [])
      .filter(c => c && typeof c.ruta === 'string' && c.n)
      .map(c => ({ruta: c.ruta, n: nombreLimpio(c.n), subs: limpiarArbol(c.subs)}));
  }

  async function bajar(url){
    const r = await fetch(url, {credentials: 'same-origin'});
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(url + ' respondio ' + r.status);
    return r.text();
  }

  /* Los ids de las publicaciones de una categoria, pagina por pagina. null si
     no existe o esta oculta. */
  async function leerCategoria(ruta){
    const tam = catalogoVivo.tamPagina || 60;
    const encontrados = new Set();
    for (let k = 1; k <= TOPE_PAGINAS; k++){
      const html = await bajar(ruta + (k === 1 ? '' : 'page/' + k + '/') + '?results_only=true');
      if (html == null || es404(html)) return k === 1 ? null : encontrados;
      const leidas = VIVO.leerListado(html);
      leidas.forEach(f => encontrados.add(f.id));
      if (leidas.length < tam) break;
    }
    return encontrados;
  }

  /* ── Cruce con el catalogo ── */

  function idsDeNodo(c){
    const s = new Set(ids.get(c.ruta) || []);
    c.subs.forEach(h => idsDeNodo(h).forEach(x => s.add(x)));
    return s;
  }

  function productosDeNodo(c, lista){
    const s = idsDeNodo(c);
    if (!s.size) return [];
    return lista.filter(p => SEGS.some(g => p.ids[g] != null && s.has(+p.ids[g])));
  }

  function buscarNodo(ruta, lista){
    for (const c of (lista || arbol)){
      if (c.ruta === ruta) return c;
      const h = buscarNodo(ruta, c.subs);
      if (h) return h;
    }
    return null;
  }

  // La categoria de primer nivel que contiene a esa ruta.
  function raizDe(ruta){
    return arbol.find(c => c.ruta === ruta || buscarNodo(ruta, c.subs)) || null;
  }

  function indexarNombres(){
    const m = new Map();
    aplanar(arbol).forEach(c => (ids.get(c.ruta) || []).forEach(id => {
      m.set(id, m.has(id) ? m.get(id) + ' ' + c.n : c.n);
    }));
    nombresPorPub = m;
  }

  // Para el buscador: los nombres de las categorias donde esta el producto.
  function nombresDe(p){
    if (!nombresPorPub.size) return '';
    const vistos = [];
    SEGS.forEach(g => {
      const t = p.ids[g] != null && nombresPorPub.get(+p.ids[g]);
      if (t && vistos.indexOf(t) === -1) vistos.push(t);
    });
    return vistos.join(' ');
  }

  function resumen(){
    return aplanar(arbol).map(c => ({ruta: c.ruta, n: c.n,
      publicaciones: ids.has(c.ruta) ? ids.get(c.ruta).size : null}));
  }

  function firmaDatos(){
    return JSON.stringify(aplanar(arbol).map(c => [c.ruta, c.n, c.subs.length,
      [...(ids.get(c.ruta) || [])].sort((a, b) => a - b)]));
  }

  /* ── Guardado ── */

  function guardar(){
    try {
      localStorage.setItem(GUARDADO, JSON.stringify({t: ultimo, arbol,
        ids: aplanar(arbol).map(c => [c.ruta, [...(ids.get(c.ruta) || [])]])}));
    } catch (e) { /* sin lugar o bloqueado: la proxima vez se lee de nuevo */ }
  }

  function leerGuardado(){
    try {
      const g = JSON.parse(localStorage.getItem(GUARDADO) || 'null');
      return g && Array.isArray(g.arbol) && Array.isArray(g.ids) ? g : null;
    } catch (e) { return null; }
  }

  /* Al cargar: la lista, del encabezado de esta pagina; lo que tiene cada
     categoria, de lo guardado. Sin pedir nada, antes del primer pintado. */
  function iniciar(){
    if (!EN_TIENDA) return;
    menuDelDom = leerMenu(document);
    const g = leerGuardado();
    arbol = menuDelDom || (g ? limpiarArbol(g.arbol) : []);
    if (g){
      const vivas = new Set(aplanar(arbol).map(c => c.ruta));
      g.ids.forEach(par => {
        if (Array.isArray(par) && vivas.has(par[0]) && Array.isArray(par[1]))
          ids.set(par[0], new Set(par[1].map(Number)));
      });
      ultimo = g.t || 0;
    }
    indexarNombres();
    api.informe = {origen: g ? 'guardado' : 'encabezado', categorias: resumen()};
  }

  /* Relee la lista y los listados. Devuelve true si algo cambio, y en ese
     caso repinta sin mover al cliente de donde estaba. arbolDePrueba reemplaza
     la lista del encabezado: sirve para probar la lectura de listados reales
     con la tienda abierta. */
  function refrescar(forzar, arbolDePrueba){
    if (!EN_TIENDA) return Promise.resolve(null);
    if (enCurso) return enCurso;
    const completas = aplanar(arbol).every(c => ids.has(c.ruta));
    if (!forzar && !arbolDePrueba && completas && Date.now() - ultimo < FRESCO)
      return Promise.resolve(null);
    const t0 = Date.now();
    enCurso = (async () => {
      let menu = arbolDePrueba ? limpiarArbol(arbolDePrueba) : null;
      // La primera vez vale lo que dibujo el theme al cargar. Despues, con la
      // pestaña abierta, ese encabezado ya es viejo y se pide la pagina de nuevo.
      if (!menu && refrescos > 0){
        const pagina = await bajar(location.pathname);
        if (pagina) menu = leerMenu(new DOMParser().parseFromString(pagina, 'text/html'));
      }
      if (!menu && refrescos === 0) menu = menuDelDom;
      if (!menu){
        const listado = await bajar('/productos/');
        if (listado) menu = leerMenu(new DOMParser().parseFromString(listado, 'text/html'));
      }
      if (!menu) return null;

      const nodos = aplanar(menu);
      const leidas = new Map();
      let ultimoPintado = 0;
      for (let i = 0; i < nodos.length; i += DE_A){
        const tanda = nodos.slice(i, i + DE_A);
        const res = await Promise.all(tanda.map(c => leerCategoria(c.ruta).catch(() => undefined)));
        tanda.forEach((c, j) => leidas.set(c.ruta, res[j]));
        /* Con el panel abierto hay alguien esperando: las que ya contestaron
           se muestran en cuanto llegan. Las ocultas devuelven null y nunca
           entran en ids, asi que no llegan a asomarse y despues irse. Un
           repintado por segundo como mucho; son trece tandas. */
        if (panelAbierto() && Date.now() - ultimoPintado > 1000){
          tanda.forEach((c, j) => { if (res[j]) ids.set(c.ruta, res[j]); });
          indexarNombres();
          repintarCatalogo();
          ultimoPintado = Date.now();
        }
      }

      /* null: oculta o borrada, sale. undefined: no respondio, se queda con
         lo ultimo que se leyo de ella. */
      const antes = firmaDatos();
      const podar = lista => lista.filter(c => {
        const r = leidas.get(c.ruta);
        if (r === null) return false;
        if (r) ids.set(c.ruta, r);
        c.subs = podar(c.subs);
        return true;
      });
      arbol = podar(menu);
      const vivas = new Set(aplanar(arbol).map(c => c.ruta));
      [...ids.keys()].forEach(r => { if (!vivas.has(r)) ids.delete(r); });
      refrescos++;
      ultimo = Date.now();
      indexarNombres();
      guardar();
      api.informe = {origen: arbolDePrueba ? 'prueba' : 'tienda', t: ultimo, ms: ultimo - t0,
        categorias: resumen(),
        ocultas: nodos.filter(c => leidas.get(c.ruta) === null).map(c => c.ruta),
        sinRespuesta: nodos.filter(c => leidas.get(c.ruta) === undefined).map(c => c.ruta)};
      const cambio = firmaDatos() !== antes;
      if (cambio) repintarCatalogo();
      return cambio;
    })()
      .catch(err => {
        if (window.console) console.warn('[categorias] no se pudo leer la tienda:', err);
        return null;
      })
      .then(r => { enCurso = null; return r; });
    return enCurso;
  }

  function repintarCatalogo(){
    const g = $('#grilla'), x = g ? g.scrollLeft : 0;
    pintar();
    if (g && x){
      g.style.scrollBehavior = 'auto';
      g.scrollLeft = x;
      g.style.scrollBehavior = '';
      if (typeof actualizarFlechasCat === 'function') actualizarFlechasCat();
    }
  }

  /* ── Pastillas ── */

  /* Dibuja las pastillas para el segmento que se esta mirando y devuelve la
     categoria elegida -- nombre y productos -- o null si se ve todo. Si la
     lista no cambio no rehace los botones: el que se acaba de tocar conserva
     el foco. */
  function pintarChips(delSegmento, buscando){
    const caja = $('#chips'), sub = $('#subchips');
    if (!caja || !sub) return null;
    const conProductos = lista => lista
      .map(c => ({c, productos: productosDeNodo(c, delSegmento)}))
      .filter(x => x.productos.length);
    const visibles = conProductos(arbol);

    // La elegida tiene que seguir existiendo y tener productos en el segmento:
    // si el admin la oculto o se cambio a una lista donde no hay nada, se
    // vuelve a "Todos" en vez de dejar la grilla vacia.
    let elegida = null;
    if (activa){
      const nodo = buscarNodo(activa);
      const productos = nodo ? productosDeNodo(nodo, delSegmento) : [];
      if (productos.length) elegida = {n: nodo.n, productos};
      else activa = '';
    }
    if (buscando) elegida = null;

    const intro = $('#catIntro');
    if (intro) intro.textContent = visibles.length ? TEXTO_CON : TEXTO_SIN;

    if (!visibles.length){
      caja.innerHTML = sub.innerHTML = '';
      sub.hidden = true;
      firmaChips = firmaSub = '';
      /* Sin ids todavia no sabemos QUE tiene cada categoria, pero el encabezado
         de la tienda ya nos dio sus NOMBRES. El boton se muestra igual: al
         abrirlo se leen. Si ni siquiera hay nombres, no hay nada que ofrecer. */
      ajustarElige(arbol.length > 0, null);
      avisoPanel();
      return elegida;
    }

    const firma = JSON.stringify([delSegmento.length,
      visibles.map(x => [x.c.ruta, x.c.n, x.productos.length])]);
    if (firma !== firmaChips){
      firmaChips = firma;
      caja.innerHTML = '';
      caja.appendChild(boton('', 'Todas', delSegmento.length));
      visibles.forEach(x => caja.appendChild(boton(x.c.ruta, x.c.n, x.productos.length)));
      // La lista se rehizo: si habia algo escrito en el filtro, se vuelve a aplicar.
      filtrarPanel();
    }
    const padre = !buscando && activa ? raizDe(activa) : null;
    const marcada = buscando ? null : (padre ? padre.ruta : '');
    caja.querySelectorAll('.chip').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.ruta === marcada)));

    const hijas = padre ? conProductos(padre.subs) : [];
    if (!hijas.length){
      sub.hidden = true;
      sub.innerHTML = '';
      firmaSub = '';
    } else {
      const f = JSON.stringify([padre.ruta, hijas.map(x => [x.c.ruta, x.c.n, x.productos.length])]);
      if (f !== firmaSub){
        firmaSub = f;
        sub.innerHTML = '';
        sub.appendChild(boton(padre.ruta, 'Todo', productosDeNodo(padre, delSegmento).length));
        hijas.forEach(x => sub.appendChild(boton(x.c.ruta, x.c.n, x.productos.length)));
      }
      sub.hidden = false;
      sub.querySelectorAll('.chip').forEach(b =>
        b.setAttribute('aria-pressed', String(b.dataset.ruta === activa)));
    }
    ajustarElige(true, elegida);
    return elegida;
  }

  // Los nombres vienen del admin: van como texto, nunca como HTML.
  function boton(ruta, nombre, cant){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.ruta = ruta;
    b.appendChild(document.createTextNode(nombre));
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = cant;
    b.appendChild(n);
    b.onclick = () => elegir(ruta, nombre);
    return b;
  }

  function elegir(ruta, nombre){
    activa = ruta;
    cerrarPanel();
    // La categoria y la busqueda no se mezclan: elegir una borra lo escrito.
    if (busqueda){
      busqueda = '';
      const campo = $('#buscar'), x = $('#buscarLimpiar');
      if (campo) campo.value = '';
      if (x) x.hidden = true;
    }
    if (ruta) track('select_category', {content_type: 'category', content_id: ruta,
                                        category_name: nombre});
    pintar();
    /* El panel esta arriba del catalogo: despues de elegir hay que bajar, o el
       cliente no ve que la grilla cambio. */
    if (typeof irAlCatalogo === 'function') setTimeout(irAlCatalogo, 120);
  }

  // Al escribir en el buscador se vuelve a "Todos".
  function soltar(){ activa = ''; }

  /* ── El boton y el panel ──
     El panel se abre, se filtra y se cierra. Todo lo que muestra lo pinta
     pintarChips; esto solo lo gobierna. */
  const sinTildes = s => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function panelAbierto(){
    const p = $('#catPanel');
    return !!p && !p.hidden;
  }

  // Si ya sabemos que tiene cada categoria del arbol que nos dio el encabezado.
  function yaLeidas(){
    const todas = aplanar(arbol);
    return todas.length > 0 && todas.every(c => ids.has(c.ruta));
  }

  /* Las categorias, sueltas y sin apuro. YA NO en el arranque: son 38 pedidos
     y 9,7 MB de HTML que peleaban el hilo principal y la conexion justo
     mientras el cliente intentaba ver la grilla. Se leen recien cuando el
     catalogo termino y el navegador no tiene nada mejor que hacer; y en datos
     moviles no se leen solas, se leen si el cliente abre el panel. */
  function programarLectura(esperandoA){
    if (!EN_TIENDA) return;
    if (yaLeidas() && Date.now() - ultimo < FRESCO) return;
    Promise.resolve(esperandoA).catch(() => null).then(() => {
      if (conexionCara()) return;
      const lanzar = () => { if (!document.hidden) refrescar(); };
      if (window.requestIdleCallback) requestIdleCallback(lanzar, {timeout: 20000});
      else setTimeout(lanzar, 8000);
    });
  }

  /* El cliente abrio el panel: es el momento en que las categorias le sirven,
     asi que si todavia no las tenemos se piden ahora mismo. */
  function pedirAhora(){
    if (!EN_TIENDA || (yaLeidas() && Date.now() - ultimo < FRESCO)) return;
    refrescar().then(avisoPanel);
    avisoPanel();
  }

  /* El cartel del panel vacio no dice siempre lo mismo: no es igual "todavia
     no las lei" que "tu filtro no encontro ninguna". */
  function avisoPanel(){
    const vacio = $('#catPanelVacio'), lista = $('#chips'), campo = $('#catFiltro');
    if (!vacio || !lista) return;
    const chips = [...lista.querySelectorAll('.chip')];
    const buscador = campo ? campo.closest('.cat-panel__buscar') : null;
    if (!chips.length){
      vacio.textContent = enCurso ? 'Buscando las categorías de la tienda…'
                                  : 'No se pudieron traer las categorías. Probá de nuevo.';
      vacio.hidden = false;
      if (buscador) buscador.hidden = true;   // no hay nada que filtrar
      return;
    }
    if (buscador) buscador.hidden = false;
    vacio.textContent = 'Ninguna categoría con ese nombre.';
    vacio.hidden = chips.some(b => !b.hidden);
  }

  function abrirPanel(){
    const p = $('#catPanel'), b = $('#catAbrir'), f = $('#catFiltro');
    if (!p || !b) return;
    p.hidden = false;
    b.setAttribute('aria-expanded', 'true');
    pedirAhora();
    if (f){ f.value = ''; filtrarPanel(); }
    /* El foco al filtro solo en pantalla grande: en un celular abriria el
       teclado y taparia la mitad de la lista que se acaba de abrir. */
    if (f && innerWidth > 700) f.focus();
  }

  function cerrarPanel(){
    const p = $('#catPanel'), b = $('#catAbrir');
    if (!p || !b || p.hidden) return;
    p.hidden = true;
    b.setAttribute('aria-expanded', 'false');
  }

  function filtrarPanel(){
    const campo = $('#catFiltro'), lista = $('#chips'), vacio = $('#catPanelVacio');
    if (!campo || !lista) return;
    const q = sinTildes(campo.value.trim());
    let hay = 0;
    lista.querySelectorAll('.chip').forEach(b => {
      const ok = !q || sinTildes(b.textContent).indexOf(q) !== -1;
      b.hidden = !ok;
      if (ok) hay++;
    });
    if (vacio) avisoPanel();
  }

  /* El boton dice que categoria esta puesta; "Quitar filtro" aparece solo
     cuando hay una. Sin categorias visibles en la tienda no se muestra nada. */
  function ajustarElige(hay, elegida){
    const caja = $('#catElige'), val = $('#catAbrirVal'), quitar = $('#catQuitar');
    if (!caja) return;
    caja.hidden = !hay;
    if (!hay) return cerrarPanel();
    if (val) val.textContent = elegida ? elegida.n : 'Todas';
    if (quitar) quitar.hidden = !elegida;
  }

  {
    const b = $('#catAbrir'), f = $('#catFiltro'), q = $('#catQuitar');
    if (b) b.onclick = () => (panelAbierto() ? cerrarPanel() : abrirPanel());
    if (f) f.addEventListener('input', filtrarPanel);
    if (q) q.onclick = () => { cerrarPanel(); elegir('', ''); };
    // Un clic afuera y la tecla Escape cierran, como cualquier desplegable.
    document.addEventListener('click', e => {
      if (!panelAbierto()) return;
      const caja = $('#catElige');
      if (caja && !caja.contains(e.target)) cerrarPanel();
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') cerrarPanel(); });
  }

  /* Sin la tienda: carga una lista y sus ids a mano y repinta. */
  function probar(nuevo, idsPorRuta){
    arbol = limpiarArbol(nuevo);
    ids.clear();
    Object.keys(idsPorRuta || {}).forEach(r =>
      ids.set(r, new Set((idsPorRuta[r] || []).map(Number))));
    indexarNombres();
    firmaChips = firmaSub = '';
    api.informe = {origen: 'prueba', categorias: resumen()};
    repintarCatalogo();
    return api.informe;
  }

  if (EN_TIENDA){
    /* El admin cambia algo en otra pestaña y vuelve: se ve sin recargar. En
       datos móviles no, porque volver a la pestaña no es pedir 9,7 MB. */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !conexionCara()) refrescar();
    });
  }

  const api = {enTienda: EN_TIENDA, informe: null, iniciar, refrescar, programarLectura,
               pintarChips, soltar, nombresDe, leerMenu, probar,
               get activa(){ return activa; }};
  window.__categorias = api;
  return api;
})();

/* ══════════ CADA FICHA CON SU DIRECCION ══════════
   Abrir una ficha cambia la direccion a ?producto=<nombre>, y cerrarla la
   devuelve a como estaba. Es la otra mitad de lo de arriba: eso sabia LEER el
   parametro al cargar, esto lo ESCRIBE.

   Para que sirve:
     · la ficha se puede compartir y se puede volver a ella;
     · "atras" cierra la ficha en vez de sacar al cliente del sitio;
     · Clarity, GA4 y Meta ven una direccion por producto en vez de una sola.

   Lo que NO hace: no arregla la atribucion de Meta. Meta cruza por content_ids,
   no por direccion. Esto es para medir y compartir.

   El nombre sale de p.urls, que lo trae el catalogo vivo. Si todavia no llego
   -- primer pintado, o una publicacion que no se importo -- la ficha abre igual
   y la direccion no cambia: mejor sin direccion que con una que no existe. */

const FICHA_EN_URL = 'producto';
/* true = la entrada del historial la pusimos nosotros, asi que cerrar es
   volver atras. false con ?producto= en la direccion = el cliente llego con la
   ficha puesta, y ahi cerrar solo limpia el parametro: "atras" tiene que
   devolverlo a donde venia, no a la ficha otra vez. */
let fichaEnHistorial = false;
// Mientras el navegador mueve el historial no se vuelve a tocar el historial.
let moviendoHistorial = false;
const tituloDelSitio = document.title;

function mangosDe(p){
  const salida = [];
  if (p && p.urls) Object.keys(p.urls).forEach(s => {
    const m = mangoDeUrl(p.urls[s]);
    if (m && salida.indexOf(m) === -1) salida.push(m);
  });
  /* Lo horneado por el sincronizador. Vale en la vista previa de GitHub, donde
     el catalogo vivo no corre, y en la tienda desde el primer pintado, sin
     esperar los dos segundos que tarda en contestar. */
  if (p && p.mangos) Object.keys(p.mangos).forEach(s => {
    const m = String(p.mangos[s] || '').toLowerCase();
    if (m && salida.indexOf(m) === -1) salida.push(m);
  });
  return salida;
}

// El que le toca a este producto en el segmento que se esta mirando.
function mangoDeProducto(p){
  if (!p) return '';
  const vivo = p.urls && mangoDeUrl(siNula(p.urls[segmento], p.urls.minorista));
  if (vivo) return vivo;
  const horneado = p.mangos && siNula(p.mangos[segmento], p.mangos.minorista);
  return horneado ? String(horneado).toLowerCase() : '';
}

// La direccion de ahora con ?producto= puesto o sacado, sin tocar lo demas:
// fbclid, utm y q se conservan tal cual.
function direccionConProducto(mango){
  const u = new URL(location.href);
  if (mango) u.searchParams.set(FICHA_EN_URL, mango);
  else u.searchParams.delete(FICHA_EN_URL);
  return u.pathname + u.search + u.hash;
}

function ponerFichaEnLaDireccion(p){
  if (moviendoHistorial) return;
  const mango = mangoDeProducto(p);
  if (!mango) return;
  const puesto = (new URLSearchParams(location.search).get(FICHA_EN_URL) || '')
    .toLowerCase();
  try {
    document.title = p.n + ' · ' + tituloDelSitio;
    /* Ya venia en la direccion: se marca la entrada como nuestra, sin agregar
       otra. Si no, "atras" llevaria a la misma direccion y parecerian dos. */
    if (puesto === mango || fichaEnHistorial){
      history.replaceState({habitadFicha: mango}, '', direccionConProducto(mango));
      return;
    }
    history.pushState({habitadFicha: mango}, '', direccionConProducto(mango));
    fichaEnHistorial = true;
  } catch (err){
    // file://, un navegador sin permiso: la ficha abre igual.
    if (window.console) console.warn('[ficha] no se pudo cambiar la direccion:', err);
  }
}

function sacarFichaDeLaDireccion(){
  if (moviendoHistorial) return;
  try {
    document.title = tituloDelSitio;
    if (fichaEnHistorial){
      fichaEnHistorial = false;
      moviendoHistorial = true;
      history.back();          // dispara popstate, que termina de limpiar
      return;
    }
    if (!new URLSearchParams(location.search).has(FICHA_EN_URL)) return;
    history.replaceState({}, '', direccionConProducto(''));
  } catch (err){
    if (window.console) console.warn('[ficha] no se pudo limpiar la direccion:', err);
  }
}

const fichaAbierta = () => {
  const m = document.getElementById('modal');
  return !!m && m.classList.contains('on');
};

/* El boton "atras" y el "adelante" del navegador. Se atienden aca y no en cada
   boton de cerrar, asi vale igual para el teclado, el gesto del celular y el
   clic afuera de la ficha. */
addEventListener('popstate', ev => {
  moviendoHistorial = true;
  const mango = String((ev.state && ev.state.habitadFicha) ||
    new URLSearchParams(location.search).get(FICHA_EN_URL) || '').toLowerCase();
  fichaEnHistorial = !!mango;
  try {
    if (!mango){
      if (fichaAbierta()) cerrarModal('modal');
      document.title = tituloDelSitio;
    } else if (!fichaAbierta() || !vista || mangoDeProducto(vista.p) !== mango){
      /* Se mira si la ficha esta ABIERTA, no que producto tiene cargado: vista
         guarda el ultimo que se vio y no se limpia al cerrar, asi que volver
         "adelante" al mismo producto dejaba la direccion puesta y la ficha
         cerrada. */
      abrirFichaDeMango(mango, false);
    }
  } finally {
    // En el mismo turno no, para que lo que dispare el cierre no vuelva a
    // empujar el historial.
    setTimeout(() => { moviendoHistorial = false; }, 0);
  }
});

/* ══════════ LLEGAR CON UN PRODUCTO ABIERTO ══════════
   /catalogos/?producto=<nombre> abre la ficha de esa publicacion en cuanto
   carga, donde <nombre> es el de la direccion de la tienda,
   /productos/<nombre>/. Sirve para mandar a alguien directo a un producto
   dentro del embudo, desde un anuncio, un mensaje o un enlace suelto.

   Lo estrenó el desvio de los anuncios de catalogo de Meta, que reconocia al
   visitante por el fbclid y lo traia para aca. Ese desvio se saco el
   16/09/2026, cuando el cliente pidio dejar la tienda como estaba (esta en el
   historial, commit 56f3ae1); el enlace con ?producto= sigue andando solo.

   La direccion de cada producto la trae el catalogo vivo en p.urls, asi que
   puede no estar en el primer pintado: se prueba con lo guardado y se
   reintenta cuando la tienda contesta. Si ni asi aparece -- una publicacion
   que nunca se importo, o de otro segmento --, el nombre sale del propio
   enlace y se usa como busqueda: mejor algo parecido que la grilla entera. */
const productoDelAnuncio = (function (){
  const v = new URLSearchParams(location.search).get('producto');
  return v ? String(v).replace(/^\/+|\/+$/g, '').toLowerCase() : '';
})();
let anuncioResuelto = false;
/* Se prende antes de abrir sola la ficha de ?producto=: si el visitante vino de
   una ficha de la tienda, ese ViewContent ya salio alla. */
let viewContentYaContado = false;

// El nombre que Tiendanube pone en la direccion: /productos/<esto>/
function mangoDeUrl(url){
  const m = /\/productos\/([^/?#]+)/.exec(String(url || ''));
  if (!m) return '';
  // La direccion del listado viene codificada; ?producto= llega decodificado.
  try { return decodeURIComponent(m[1]).toLowerCase(); } catch (e) {}
  return m[1].toLowerCase();
}

function productoPorMango(mango){
  if (!mango) return null;
  return PRODUCTOS.find(p => mangosDe(p).indexOf(mango) !== -1) || null;
}

// "aceite-de-calendula-x-50" -> "aceite de calendula x 50"
function nombreDeMango(mango){
  return String(mango || '').replace(/-/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function ponerBusqueda(texto, aunqueNoHaya){
  const campo = $('#buscar'), limpiar = $('#buscarLimpiar');
  if (!campo || !texto) return false;
  /* Si la busqueda no encuentra nada, no se pone: un "Nada con «...»" como
     primera pantalla del que viene de un anuncio es peor que el catalogo
     entero. aunqueNoHaya es para cuando el vacio SI dice algo: el producto
     existe pero es de otro segmento, o lo escribio el cliente en el buscador
     del theme y tiene derecho a ver que no hay. */
  if (!aunqueNoHaya && !buscarProductos(texto).length) return false;
  campo.value = texto;
  busqueda = texto;
  if (limpiar) limpiar.hidden = false;
  if (categoriasVivas) categoriasVivas.soltar();
  pintar();
  setTimeout(irAlCatalogo, 300);
  return true;
}

/* Devuelve true cuando ya no queda nada por intentar: o se abrio la ficha, o
   se dejo la busqueda puesta. ultimoIntento se pasa recien con el catalogo ya
   leido de la tienda; antes de eso, no encontrarlo no quiere decir nada. */
function abrirFichaDeMango(mango, conRespaldo){
  const p = productoPorMango(mango);
  if (p && (p.necs.includes('packs') || hayEn(p, segmento))){
    abrirVista(p, 'cat-' + (p.ids.minorista || p.ids.mayorista || p.ids.distribuidor));
    return {p, como: 'ficha'};
  }
  if (!conRespaldo) return {p, como: ''};
  /* Existe pero no se vende a este segmento: la busqueda por nombre lo muestra
     igual, y la grilla vacia ya avisa que hay que cambiar a Minorista. */
  if (p) { ponerBusqueda(p.n, true); return {p, como: 'otro-segmento'}; }
  /* No esta en la landing. Son 94 publicaciones minoristas de la tienda que
     nunca se importaron. Si la busqueda por nombre encuentra algo parecido, se
     muestra; si no, se lo devuelve a la ficha de la tienda, que es adonde
     apuntaba el anuncio o la sugerencia. Dejarlo en el catalogo entero despues
     de que toco UN producto es dejarlo sin explicacion. El tienda=1 corta
     cualquier ida y vuelta con el guardia. */
  if (ponerBusqueda(nombreDeMango(mango), false)) return {p: null, como: 'busqueda'};
  /* Fuera de la tienda no hay ninguna ficha a la que devolverlo: en la vista
     previa de GitHub Pages esa direccion es un 404 del propio GitHub. Ahi se
     queda con el catalogo entero, que es lo mejor que hay. */
  if (!catalogoVivo.enTienda) return {p: null, como: 'catalogo'};
  location.replace('/productos/' + encodeURIComponent(mango) + '/?tienda=1');
  return {p: null, como: 'ficha-de-la-tienda'};
}

/* Devuelve true cuando ya no queda nada por intentar. ultimoIntento se pasa
   recien con el catalogo ya leido de la tienda; antes de eso, no encontrarlo
   no quiere decir nada. */
function abrirProductoDelAnuncio(ultimoIntento){
  if (!productoDelAnuncio || anuncioResuelto) return anuncioResuelto;
  // Si el cliente ya abrio algo por su cuenta, no se le pisa la pantalla.
  if (vista) { anuncioResuelto = true; return true; }
  viewContentYaContado = true;
  const r = abrirFichaDeMango(productoDelAnuncio, !!ultimoIntento);
  viewContentYaContado = false;
  if (!r.como) return false;
  anuncioResuelto = true;
  track('producto_desde_anuncio', {item_name: r.p ? r.p.n : productoDelAnuncio,
                                   metodo: r.como});
  return true;
}

/* ══ ENGANCHES PARA EL ENCABEZADO DE LA TIENDA ══
   El buscador de Brasilia sigue siendo el de la tienda y esta en todas las
   paginas, pero sus resultados llevaban a la ficha vieja. Ahora home.js le
   engancha el formulario y las sugerencias; cuando la landing ya esta plantada
   en esta pagina, llama aca y se atiende sin recargar nada. */
window.__habitadBuscar = function (texto){
  if (!$('#buscar')) return false;
  ponerBusqueda(String(texto || '').trim(), true);   // aunque no haya: lo escribio el cliente
  return true;
};
window.__habitadAbrirProducto = function (mango){
  const r = abrirFichaDeMango(String(mango || '').toLowerCase(), true);
  track('producto_desde_buscador', {item_name: r.p ? r.p.n : mango, metodo: r.como});
  return true;
};

/* Antes del primer pintado va lo ultimo que se leyo de la tienda, si este
   navegador lo tiene: la primera imagen ya sale al dia. Despues, sin apuro,
   se vuelve a leer la tienda. */
catalogoVivo.aplicarGuardado();
// Los banners de la visita anterior, antes de pintar: el hero sale al dia.
bannersVivos.aplicarGuardado();
// Lo ultimo de Nubea, si este navegador lo tiene, tambien antes de pintar.
if (nubea.aplicarGuardado() && segmento === 'minorista') TIERS = TIERS_POR_SEGMENTO.minorista;
/* El carrito de la visita anterior, tambien antes de pintar: la barra, los
   hitos y el segmento salen como estaban. */
try {
  const guardado = leerCarritoGuardado();
  carritoVisto = guardado ? guardado.t : 0;
  recuperarCarrito(guardado);
} catch (err) {
  if (window.console) console.warn('[carrito] no se pudo recuperar lo guardado:', err);
} finally {
  carritoListo = true;
}
/* Las categorias de la tienda: la lista, del encabezado de esta misma pagina;
   lo que tiene cada una, de lo guardado. Tampoco pide nada. */
categoriasVivas.iniciar();
pintarHitos();
pintar(); pintarPacks(); recalcular();
/* El que viene de un anuncio de catalogo, con su producto ya abierto. Con lo
   guardado suele alcanzar; si no, se reintenta en cuanto conteste la tienda. */
abrirProductoDelAnuncio(false);
/* Corre fn cuando el navegador no tenga nada mejor que hacer, nunca antes de
   `minimo` ms y nunca despues de `tope`. Sin requestIdleCallback (Safari
   viejo) cae a un setTimeout, que es lo que habia antes. */
function alEstarLibre(fn, minimo, tope){
  setTimeout(() => {
    if (window.requestIdleCallback) requestIdleCallback(fn, {timeout: tope});
    else fn();
  }, minimo);
}

/* Leer la tienda se hace con el navegador libre, no a los 400 ms a toda costa.
   Todo lo de arriba ya se pinto con lo horneado y lo guardado, asi que esto no
   apura nada de lo que el cliente esta mirando: solo le pelea el hilo
   principal justo cuando empieza a scrollear.

   Y se lee SOLO el catalogo (9 pedidos, 6,8 MB). Las categorias son otros 38
   pedidos y 9,7 MB: van aparte y a pedido. */
alEstarLibre(() => {
  const leyendo = catalogoVivo.refrescar();
  // Segundo y ultimo intento del producto del anuncio, ya con la tienda leida.
  if (productoDelAnuncio) leyendo.then(() => abrirProductoDelAnuncio(true));
  // Las categorias, cuando el catalogo termine y si la conexion no cobra dato.
  categoriasVivas.programarLectura(leyendo);
}, 400, 3000);
/* Los banners del panel, mas tarde y aparte: leer el inicio es medio mega y el
   catalogo son siete paginas. Pedirlos juntos hace que las dos cosas tarden
   mas, y el hero ya esta mostrando lo guardado. */
setTimeout(() => bannersVivos.refrescar(), 1800);
/* Y la configuracion de Nubea al dia. Si cambio algo, se repinta todo lo que
   la usa: tarjetas, carrusel, barra y la ficha si esta abierta. */
setTimeout(() => nubea.refrescar().then(cambio => {
  if (!cambio) return;
  if (segmento === 'minorista') TIERS = TIERS_POR_SEGMENTO.minorista;
  pintarHitos();
  const g = $('#grilla'), x = g ? g.scrollLeft : 0;
  pintar();
  if (g && x){ g.style.scrollBehavior = 'auto'; g.scrollLeft = x; g.style.scrollBehavior = ''; }
  pintarPacks(); recalcular();
  if (vista) llenarVista(vista.p);
}), 250);

  }
})();
