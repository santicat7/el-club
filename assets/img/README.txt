IMÁGENES DE EL CLUB — reemplazá los placeholders
=================================================

Las fotos actuales son placeholders de Unsplash cargados por URL
directamente en index.html. Para usar fotos reales:

1) LOGO
   - Colocá tu logo aquí como:  logo.png  (PNG con fondo transparente)
   - En index.html buscá los 2 bloques:
       <div class="nav-logo-placeholder">EL CLUB</div>
     y reemplazá por:
       <img src="assets/img/logo.png" class="nav-logo" alt="El Club">
     (uno está en el <nav>, el otro en el <footer>)

2) FOTOS  (formato recomendado: JPG o WEBP, ~1600px lado largo, calidad 80)
   Colocá aquí:
     hero.jpg      → hero (.hero__img)
     foto-01.jpg   → Statement 01 (método / levantamiento)
     foto-02.jpg   → Statement 02 (comunidad)
     crossfit.jpg  → card CrossFit
     muscu.jpg     → card Musculación
     funcional.jpg → card Funcional
     boxeo.jpg     → card Boxeo

   Luego, en index.html, cambiá cada
       src="https://images.unsplash.com/..."
   por la ruta local correspondiente, p.ej.:
       src="assets/img/hero.jpg"

   El hero debe quedar SIN loading="lazy" (ya tiene fetchpriority="high").
   El resto mantiene loading="lazy".
