# Habitad_landing

Una página especialmente estilo Landing_embudo para mejorar la conversión.

Embudo de compra guiado para [habitadnatural.com](https://www.habitadnatural.com).
Es una sola página: `index.html`, con sus imágenes y su única dependencia
de terceros.

**Se ve acá:** https://mind-trade-profit.github.io/Habitad_landing/

## Qué hace

- **Catálogo real de 145 productos** traídos de la tienda, con precios por
  segmento: minorista, mayorista (20%) y distribuidor (30%).
- **Selector de tipo de cliente** que cambia precios, mínimos y beneficios,
  y baja al catálogo para que se vea el efecto.
- **Carrito propio** con contador y eliminación por producto, que al
  finalizar carga todo en el carrito real de Tiendanube.
- **Barra de progreso** hacia los beneficios de cada segmento.
- **26 combos** con su propio formato de tarjeta.
- **Ficha de producto** con galería, variantes, reseñas y preguntas
  frecuentes.
- **Reseñas en vivo**: se piden a Trusty al cargar, así que las nuevas
  aparecen solas. Hay una copia local de respaldo por si el pedido falla.
- **Historia de la marca** en un popup, con cifras reales del catálogo.

## Cómo verla en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
python -m http.server 8766
```

Y abrir http://localhost:8766

No hace falta compilar nada: no hay build ni dependencias que instalar.

## Estructura

```
index.html   la landing entera: marcado, estilos y lógica
img/         11 imágenes propias (banners, marca, retrato)
js/          anime.js, la única librería externa
```

Las fotos de producto no están acá: se cargan desde el CDN de la tienda,
así que se actualizan solas cuando cambian en el catálogo.

## De dónde sale

El catálogo se genera con el sincronizador del proyecto principal, que lee
la tienda pública cada 4 horas. Esta copia es un instante de ese proceso.
