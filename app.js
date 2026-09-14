(function () {
  const catalogo = document.getElementById('sticker-catalog');
  const navCategorias = document.getElementById('categoryNav');

  function sinViuda(texto) {
    return texto.replace(/\s+(\S+)$/, ' $1');
  }

  function formatearPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-AR');
  }

  function webpDe(ruta) {
    return ruta.replace(/\.(jpe?g|png)$/i, '.webp');
  }

  // El navegador elige el <source> por tipo, no por disponibilidad: si el
  // .webp todavía no existe la imagen queda rota. Al primer error se
  // descarta el <source> y se reintenta con el original.
  function conRespaldo(picture, img, original) {
    img.addEventListener('error', function () {
      const source = picture.querySelector('source');
      if (!source) return;
      source.remove();
      img.src = original;
    }, { once: true });
  }

  function crearTarjeta(producto) {
    const card = document.createElement('div');
    card.className = 'product-card';

    if (producto.proximamente) {
      card.classList.add('is-placeholder');
      const plus = document.createElement('span');
      plus.className = 'plus';
      plus.textContent = '+';
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = 'Próximamente';
      card.append(plus, label);
      return card;
    }

    const cont = document.createElement('div');
    cont.className = 'product-image';

    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = webpDe(producto.imagen);
    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.alt || producto.nombre;
    img.loading = 'lazy';
    img.decoding = 'async';
    picture.append(source, img);
    conRespaldo(picture, img, producto.imagen);
    cont.appendChild(picture);

    const info = document.createElement('div');
    info.className = 'product-info';

    const titulo = document.createElement('p');
    titulo.className = 'product-title';
    titulo.textContent = sinViuda(producto.nombre);

    const stock = Number(producto.stock) || 0;
    const precio = document.createElement('p');
    precio.className = 'price-tag';
    precio.textContent = formatearPrecio(producto.precio) + ' · ' +
      (stock > 1 ? stock + ' disponibles' : stock === 1 ? 'Disponible' : 'Sin stock');

    info.append(titulo, precio);

    if (stock > 0) {
      const boton = document.createElement('button');
      boton.className = 'btn-comprar';
      boton.dataset.stock = String(stock);
      boton.textContent = 'Comprar';
      info.appendChild(boton);
    }

    card.append(cont, info);
    return card;
  }

  function crearGrilla(productos) {
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    productos.forEach(function (p) { grid.appendChild(crearTarjeta(p)); });
    return grid;
  }

  function renderCategoria(categoria, productos) {
    const bloque = document.createElement('div');
    bloque.className = 'sticker-category';
    bloque.id = categoria.id;

    const titulo = document.createElement('h3');
    titulo.className = 'category-title';
    titulo.textContent = categoria.titulo;
    bloque.appendChild(titulo);

    const sueltos = productos.filter(function (p) { return !p.artista; });
    if (sueltos.length) bloque.appendChild(crearGrilla(sueltos));

    const artistas = [];
    productos.forEach(function (p) {
      if (p.artista && artistas.indexOf(p.artista) === -1) artistas.push(p.artista);
    });

    artistas.forEach(function (artista) {
      const grupo = document.createElement('div');
      grupo.className = 'artist-group';

      const nombre = document.createElement('h4');
      nombre.className = 'artist-title';
      nombre.textContent = artista;

      grupo.append(nombre, crearGrilla(productos.filter(function (p) {
        return p.artista === artista;
      })));
      bloque.appendChild(grupo);
    });

    return bloque;
  }

  function renderCatalogo(data) {
    const categorias = data.categorias || [];
    const productos = data.productos || [];

    categorias.forEach(function (categoria) {
      const delGrupo = productos.filter(function (p) {
        return p.categoria === categoria.id;
      });
      if (!delGrupo.length) return;

      const chip = document.createElement('a');
      chip.href = '#' + categoria.id;
      chip.textContent = categoria.titulo;
      navCategorias.appendChild(chip);

      catalogo.appendChild(renderCategoria(categoria, delGrupo));
    });
  }

  function initCarruseles() {
    document.querySelectorAll('.product-grid, .events-grid').forEach(function (el) {
      const wrapper = document.createElement('div');
      wrapper.className = 'carousel';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);

      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'carousel-arrow prev';
      prev.setAttribute('aria-label', 'Ver anteriores');
      prev.innerHTML = '&#10094;';

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'carousel-arrow next';
      next.setAttribute('aria-label', 'Ver siguientes');
      next.innerHTML = '&#10095;';

      wrapper.appendChild(prev);
      wrapper.appendChild(next);

      function actualizarFlechas() {
        const max = el.scrollWidth - el.clientWidth;
        const alInicio = el.scrollLeft <= 4;
        const alFinal = el.scrollLeft >= max - 4;
        prev.hidden = alInicio;
        next.hidden = alFinal;
        wrapper.classList.toggle('at-start', alInicio);
        wrapper.classList.toggle('at-end', alFinal || max <= 0);
      }

      function paso() {
        const card = el.querySelector('.product-card, .event-card');
        const ancho = card ? card.offsetWidth + 10 : 220;
        return Math.max(ancho, Math.floor(el.clientWidth * 0.8 / ancho) * ancho);
      }

      prev.addEventListener('click', function () {
        el.scrollBy({ left: -paso(), behavior: 'smooth' });
      });
      next.addEventListener('click', function () {
        el.scrollBy({ left: paso(), behavior: 'smooth' });
      });

      el.addEventListener('scroll', actualizarFlechas, { passive: true });
      window.addEventListener('resize', actualizarFlechas);
      actualizarFlechas();

      let arrastrando = false;
      let xInicial = 0;
      let scrollInicial = 0;
      let movido = false;

      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        arrastrando = true;
        movido = false;
        xInicial = e.clientX;
        scrollInicial = el.scrollLeft;
      });

      el.addEventListener('pointermove', function (e) {
        if (!arrastrando) return;
        const delta = e.clientX - xInicial;
        if (!movido && Math.abs(delta) > 4) {
          movido = true;
          el.classList.add('is-dragging');
          el.setPointerCapture(e.pointerId);
        }
        if (movido) {
          e.preventDefault();
          el.scrollLeft = scrollInicial - delta;
        }
      });

      function terminarArrastre() {
        if (!arrastrando) return;
        arrastrando = false;
        el.classList.remove('is-dragging');
      }

      el.addEventListener('pointerup', terminarArrastre);
      el.addEventListener('pointercancel', terminarArrastre);
      el.addEventListener('lostpointercapture', terminarArrastre);

      el.addEventListener('click', function (e) {
        if (movido) {
          e.preventDefault();
          e.stopPropagation();
          movido = false;
        }
      }, true);

      el.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
  }

  function initVisor() {
    const visor = document.getElementById('lightbox');
    const visorClose = document.getElementById('lightboxClose');
    const visorImg = document.getElementById('lightboxImg');
    const visorSource = document.getElementById('lightboxSource');
    const visorCaption = document.getElementById('lightboxCaption');

    let ultimoDisparador = null;

    function abrir(card) {
      const img = card.querySelector('.product-image img');
      const source = card.querySelector('.product-image source');
      const titulo = card.querySelector('.product-title');
      if (!img) return;

      visorSource.srcset = source ? source.srcset : '';
      visorImg.src = img.src;
      visorImg.alt = img.alt;
      visorCaption.textContent = titulo ? titulo.textContent : '';

      ultimoDisparador = card;
      visor.classList.add('is-open');
      document.body.classList.add('modal-abierto');
      visorClose.focus();
    }

    function cerrar() {
      if (!visor.classList.contains('is-open')) return;
      visor.classList.remove('is-open');
      if (!document.getElementById('modalPedido').classList.contains('is-open')) {
        document.body.classList.remove('modal-abierto');
      }
      if (ultimoDisparador) {
        ultimoDisparador.focus();
        ultimoDisparador = null;
      }
    }

    document.querySelectorAll('.product-card:not(.is-placeholder)')
      .forEach(function (card) {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Ampliar foto');
        card.addEventListener('click', function (e) {
          if (e.target.closest('.btn-comprar')) return;
          abrir(card);
        });
        card.addEventListener('keydown', function (e) {
          if (e.target !== card) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrir(card);
          }
        });
      });

    visorClose.addEventListener('click', cerrar);
    visor.addEventListener('click', function (e) {
      if (e.target !== visorImg) cerrar();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cerrar();
    });
  }

  function initPedidos() {
    const modal = document.getElementById('modalPedido');
    const modalClose = document.getElementById('modalClose');
    const productoInput = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const form = document.getElementById('formPedido');
    const mensajeEl = document.getElementById('pedidoMensaje');
    const btnEnviar = document.getElementById('btnEnviarPedido');

    let ultimoDisparador = null;

    function datosDeTarjeta(btn) {
      const card = btn.closest('.product-card');
      const titulo = card.querySelector('.product-title');
      const precio = card.querySelector('.price-tag');
      const monto = precio ? (precio.textContent.match(/\$[\d.]+/) || [''])[0] : '';
      return {
        nombre: titulo ? titulo.textContent.replace(/\s+/g, ' ').trim() : '',
        monto: monto,
        stock: parseInt(btn.dataset.stock || '1', 10)
      };
    }

    function abrirModal(btn) {
      const d = datosDeTarjeta(btn);
      productoInput.value = 'Sticker ' + d.nombre + (d.monto ? ' - ' + d.monto : '');
      cantidadInput.max = d.stock;
      cantidadInput.value = 1;
      form.style.display = '';
      mensajeEl.style.display = 'none';

      ultimoDisparador = btn;
      modal.classList.add('is-open');
      document.body.classList.add('modal-abierto');
      document.getElementById('nombre').focus();
    }

    function cerrarModal() {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-abierto');
      if (ultimoDisparador) {
        ultimoDisparador.focus();
        ultimoDisparador = null;
      }
    }

    document.querySelectorAll('.btn-comprar').forEach(function (btn) {
      btn.addEventListener('click', function () { abrirModal(btn); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { cerrarModal(); return; }
      if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;

      const focusables = modal.querySelectorAll(
        'button, input:not([readonly]), textarea, select, a[href]'
      );
      if (!focusables.length) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    });

    cantidadInput.addEventListener('input', function () {
      const max = parseInt(cantidadInput.max || '1', 10);
      if (parseInt(cantidadInput.value || '0', 10) > max) {
        cantidadInput.value = max;
      }
    });

    modalClose.addEventListener('click', cerrarModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) cerrarModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando...';

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
        .then(function () {
          form.style.display = 'none';
          mensajeEl.textContent = '¡Listo! Tu pedido fue enviado. Te vamos a contactar por WhatsApp para confirmar.';
          mensajeEl.style.display = '';
          form.reset();
          btnEnviar.disabled = false;
          btnEnviar.textContent = 'Enviar pedido';
        })
        .catch(function () {
          mensajeEl.textContent = 'Hubo un problema al enviar el pedido. Probá de nuevo o escribinos por Instagram.';
          mensajeEl.style.display = '';
          btnEnviar.disabled = false;
          btnEnviar.textContent = 'Enviar pedido';
        });
    });
  }

  function initNav() {
    const navToggle = document.getElementById('navToggle');
    const siteNav = document.getElementById('siteNav');

    navToggle.addEventListener('click', function () {
      const abierto = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(abierto));
      navToggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
  initNav();

  document.querySelectorAll('.product-image picture > img').forEach(function (img) {
    conRespaldo(img.parentNode, img, img.getAttribute('src'));
  });

  fetch('products.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(renderCatalogo)
    .catch(function () {
      const aviso = document.createElement('p');
      aviso.className = 'section-desc';
      aviso.textContent = 'No pudimos cargar el catálogo. Recargá la página o escribinos por Instagram.';
      catalogo.appendChild(aviso);
    })
    .finally(function () {
      initCarruseles();
      initVisor();
      initPedidos();
    });
})();
