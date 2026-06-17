# El Club — Cross Fit & Friends

Landing page de **El Club**, gimnasio de CrossFit, musculación, funcional y boxeo en
Paysandú, Uruguay. Sitio estático de una sola página, sin build step.

Pensado para publicarse en **el-club-nikatoestudio.uy**.

## Stack

- HTML5 semántico · CSS3 puro · Vanilla JS (IIFE, sin módulos)
- [GSAP](https://gsap.com/) + ScrollTrigger — animaciones
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scroll
- Google Fonts — Open Sans
- Sin npm, sin frameworks, sin build. Funciona abriendo `index.html`.

## Estructura

```
.
├── index.html
├── styles.css
├── main.js
├── .htaccess              # cache + gzip (Apache / Hostinger)
├── lib/                   # gsap, ScrollTrigger, lenis (locales)
└── assets/img/            # logo + fotos (ver README dentro)
```

## Ver en local

```bash
python -m http.server 8080
# luego abrir http://localhost:8080
```

## Publicar (hosting propio / NIC)

Subí el contenido de esta carpeta tal cual a la raíz del hosting
(`public_html/`). `index.html` queda como página de inicio.

## Pendiente de reemplazar

- Logo y fotos reales (ver `assets/img/README.txt`).
- Número de WhatsApp en el CTA (`index.html`, busca `wa.me`).

---

Hecho por **Nikato Estudio**.
